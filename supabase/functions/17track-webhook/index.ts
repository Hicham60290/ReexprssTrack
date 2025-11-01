import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎣 17TRACK Webhook received')

    // Vérification du token d'authentification
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    const expectedToken = Deno.env.get('T17_WEBHOOK_TOKEN')

    if (!token || !expectedToken || token !== expectedToken) {
      console.error('❌ Invalid webhook token')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    console.log('✅ Webhook token validated')

    // Récupération des secrets Supabase
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('❌ Supabase configuration missing')
      throw new Error('Supabase configuration missing')
    }

    // Client Supabase avec service role (bypass RLS)
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Lecture du payload
    const payload = await req.json()
    console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2))

    // Vérification du type d'événement
    if (payload.event !== 'TRACKING_UPDATED') {
      console.log(`ℹ️ Ignoring event type: ${payload.event}`)
      return new Response(
        JSON.stringify({ message: 'Event ignored', event: payload.event }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (!payload.data || !payload.data.accepted || !Array.isArray(payload.data.accepted)) {
      console.log('⚠️ No tracking data to process')
      return new Response(
        JSON.stringify({ message: 'No tracking data' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`🔄 Processing ${payload.data.accepted.length} tracking updates`)

    let processedCount = 0
    let errorCount = 0

    // Traitement de chaque mise à jour de tracking
    for (const trackingUpdate of payload.data.accepted) {
      try {
        const trackingNumber = trackingUpdate.number
        const trackInfo = trackingUpdate.track_info || {}
        const latestEvent = trackInfo.latest_event || {}

        console.log(`📋 Processing: ${trackingNumber}`)

        // Récupération du user_id via la table trackings
        const { data: trackingRecord, error: trackingError } = await supabaseClient
          .from('trackings')
          .select('user_id, id')
          .eq('number', trackingNumber)
          .single()

        if (trackingError || !trackingRecord) {
          console.warn(`⚠️ Tracking not found in DB: ${trackingNumber}`)
          errorCount++
          continue
        }

        const userId = trackingRecord.user_id
        console.log(`👤 Found user: ${userId} for tracking: ${trackingNumber}`)

        // Mapping du statut 17TRACK
        const mapStatus = (status) => {
          switch (status) {
            case 10: return 'NotFound'
            case 20: return 'InTransit'
            case 30: return 'PickupReady'
            case 35: return 'Undelivered'
            case 40: return 'Delivered'
            case 50: return 'Expired'
            default: return 'Unknown'
          }
        }

        const mappedStatus = mapStatus(latestEvent.status || trackInfo.status || 20)
        const lastEventDesc = latestEvent.description || 'En transit'
        const lastEventTime = latestEvent.time_utc ? new Date(latestEvent.time_utc).toISOString() : new Date().toISOString()
        const carrier = trackingUpdate.carrier || null

        // Mise à jour de la table trackings
        const { error: updateError } = await supabaseClient
          .from('trackings')
          .update({
            carrier: carrier,
            status: mappedStatus,
            last_event_desc: lastEventDesc,
            last_event_time_utc: lastEventTime,
            updated_at: new Date().toISOString()
          })
          .eq('number', trackingNumber)

        if (updateError) {
          console.error(`❌ Update error for ${trackingNumber}:`, updateError)
          errorCount++
          continue
        }

        console.log(`✅ Updated tracking: ${trackingNumber} -> ${mappedStatus}`)

        // Ajout des événements de tracking si disponibles
        if (trackInfo.events && Array.isArray(trackInfo.events) && trackInfo.events.length > 0) {
          const trackingEvents = trackInfo.events.map(event => ({
            user_id: userId,
            tracking_number: trackingNumber,
            event_code: event.status || 'UNKNOWN',
            event_desc: event.description || 'Événement de tracking',
            event_time_utc: event.time_utc ? new Date(event.time_utc).toISOString() : new Date().toISOString(),
            raw_payload: event,
            created_at: new Date().toISOString()
          }))

          // Insertion des événements (avec gestion des doublons)
          const { error: eventsError } = await supabaseClient
            .from('tracking_events')
            .upsert(trackingEvents, { 
              onConflict: 'user_id,tracking_number,event_time_utc',
              ignoreDuplicates: true 
            })

          if (eventsError) {
            console.error(`⚠️ Events insert error for ${trackingNumber}:`, eventsError)
          } else {
            console.log(`📝 Added ${trackingEvents.length} events for ${trackingNumber}`)
          }
        }

        processedCount++

      } catch (itemError) {
        console.error('❌ Error processing tracking item:', itemError)
        errorCount++
      }
    }

    console.log(`📊 Webhook processing complete: ${processedCount} success, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        processed: processedCount,
        errors: errorCount,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Webhook error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})