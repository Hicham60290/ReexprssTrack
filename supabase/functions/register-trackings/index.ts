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
    console.log('🚀 Début register-trackings')

    // Récupération des secrets
    const T17_API_KEY = Deno.env.get('T17_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!T17_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('❌ Secrets manquants')
      throw new Error('Configuration manquante')
    }

    // Authentification utilisateur
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Auth failed:', authError)
      throw new Error('Invalid authentication')
    }

    console.log('✅ User authenticated:', user.id)

    // Récupération et validation des données
    const { numbers } = await req.json()
    
    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      throw new Error('Array "numbers" required with 1-40 tracking numbers')
    }

    if (numbers.length > 40) {
      throw new Error('Maximum 40 tracking numbers allowed')
    }

    // Validation format des numéros
    const validNumbers = numbers.filter(num => 
      typeof num === 'string' && 
      num.trim().length > 0 && 
      num.trim().length <= 50
    )

    if (validNumbers.length === 0) {
      throw new Error('No valid tracking numbers provided')
    }

    console.log(`📦 Processing ${validNumbers.length} tracking numbers`)

    // Upsert dans la table trackings
    const trackingsToUpsert = validNumbers.map(number => ({
      user_id: user.id,
      number: number.trim().toUpperCase(),
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { error: upsertError } = await supabaseClient
      .from('trackings')
      .upsert(trackingsToUpsert, { 
        onConflict: 'number',
        ignoreDuplicates: false 
      })

    if (upsertError) {
      console.error('❌ Upsert error:', upsertError)
      throw new Error(`Database error: ${upsertError.message}`)
    }

    console.log('✅ Trackings upserted successfully')

    // Préparation des données pour 17TRACK
    const trackingData = validNumbers.map(number => ({
      number: number.trim(),
      carrier: 0, // Auto-detect
      param: ""
    }))

    console.log('🔗 Calling 17TRACK register API')

    // Appel à l'API 17TRACK register
    const response = await fetch('https://api.17track.net/track/v2.4/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': T17_API_KEY
      },
      body: JSON.stringify(trackingData)
    })

    if (!response.ok) {
      throw new Error(`17TRACK API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('📊 17TRACK response:', JSON.stringify(result, null, 2))

    // Traitement des rejets
    if (result.data?.rejected && result.data.rejected.length > 0) {
      console.log(`⚠️ Processing ${result.data.rejected.length} rejected numbers`)
      
      const rejectedEvents = result.data.rejected.map(rejected => ({
        user_id: user.id,
        tracking_number: rejected.number,
        event_code: 'REGISTER_REJECTED',
        event_desc: `Registration rejected: ${rejected.error?.message || 'Unknown error'}`,
        event_time_utc: new Date().toISOString(),
        raw_payload: rejected,
        created_at: new Date().toISOString()
      }))

      const { error: eventsError } = await supabaseClient
        .from('tracking_events')
        .insert(rejectedEvents)

      if (eventsError) {
        console.error('❌ Events insert error:', eventsError)
      } else {
        console.log('✅ Rejected events recorded')
      }
    }

    // Traitement des acceptés
    if (result.data?.accepted && result.data.accepted.length > 0) {
      console.log(`✅ ${result.data.accepted.length} numbers registered successfully`)
      
      const acceptedEvents = result.data.accepted.map(accepted => ({
        user_id: user.id,
        tracking_number: accepted.number,
        event_code: 'REGISTER_ACCEPTED',
        event_desc: `Registration successful - Carrier: ${accepted.carrier_name || 'Auto-detect'}`,
        event_time_utc: new Date().toISOString(),
        raw_payload: accepted,
        created_at: new Date().toISOString()
      }))

      const { error: eventsError } = await supabaseClient
        .from('tracking_events')
        .insert(acceptedEvents)

      if (eventsError) {
        console.error('❌ Events insert error:', eventsError)
      } else {
        console.log('✅ Accepted events recorded')
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        summary: {
          requested: validNumbers.length,
          accepted: result.data?.accepted?.length || 0,
          rejected: result.data?.rejected?.length || 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Register trackings error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})