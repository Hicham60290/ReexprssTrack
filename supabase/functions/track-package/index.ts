import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { trackingNumber } = await req.json()
    
    if (!trackingNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Numéro de suivi requis'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('🔍 Recherche tracking pour:', trackingNumber)

    // Configuration 17TRACK API
    const API_KEY = Deno.env.get('T17_API_KEY')
    
    if (!API_KEY) {
      console.error('❌ Clé API 17TRACK non configurée')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Configuration API manquante'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const API_URL = 'https://api.17track.net/track/v2.2/gettrackinfo'

    // Appel à l'API 17TRACK
    let response
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          '17token': API_KEY
        },
        body: JSON.stringify([{
          number: trackingNumber,
          carrier: 0, // Auto-detect carrier
          param: ""
        }])
      })
    } catch (fetchError) {
      console.error('❌ Erreur réseau 17TRACK:', fetchError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Erreur de connexion au service de suivi'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503 
        }
      )
    }

    if (!response.ok) {
      console.error('❌ Erreur API 17TRACK:', response.status, response.statusText)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Service de suivi temporairement indisponible'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502 
        }
      )
    }

    let data
    try {
      data = await response.json()
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Réponse invalide du service de suivi'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 502 
        }
      )
    }

    console.log('📦 Données reçues 17TRACK:', JSON.stringify(data, null, 2))

    if (!data.data || !data.data.accepted || data.data.accepted.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Numéro de suivi non trouvé ou invalide',
          trackingNumber
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const trackingData = data.data.accepted[0]
    const trackInfo = trackingData.track_info || {}
    const latestEvent = trackInfo.latest_event || {}
    const trackingEvents = trackInfo.events || []

    // Mapping des statuts 17TRACK vers nos statuts personnalisés
    const mapStatus = (status) => {
      switch (status) {
        case 10: return { code: 'not_found', label: 'Non trouvé', color: 'gray' }
        case 20: return { code: 'in_transit', label: 'En transit', color: 'blue' }
        case 30: return { code: 'pickup', label: 'Prêt pour collecte', color: 'orange' }
        case 35: return { code: 'undelivered', label: 'Non livré', color: 'red' }
        case 40: return { code: 'delivered', label: 'Livré', color: 'green' }
        case 50: return { code: 'expired', label: 'Expiré', color: 'gray' }
        default: return { code: 'unknown', label: 'Statut inconnu', color: 'gray' }
      }
    }

    // Formatage des événements de suivi
    const formatEvents = (events) => {
      return events.map((event, index) => ({
        id: index,
        date: event.time_utc ? new Date(event.time_utc).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Date inconnue',
        location: event.location || 'Lieu non spécifié',
        status: event.description || 'Événement de suivi',
        details: event.details || '',
        isLatest: index === 0
      })).reverse() // Ordre chronologique
    }

    const currentStatus = mapStatus(latestEvent.status || trackInfo.status || 20)
    const formattedEvents = formatEvents(trackingEvents)

    // Estimation de livraison basée sur le statut
    let estimatedDelivery = 'À déterminer'
    if (currentStatus.code === 'delivered') {
      estimatedDelivery = 'Livré'
    } else if (currentStatus.code === 'in_transit') {
      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + 3) // +3 jours par défaut
      estimatedDelivery = estimatedDate.toLocaleDateString('fr-FR')
    }

    // Construction de la réponse formatée ReexpresseTrack
    const trackingResult = {
      success: true,
      trackingNumber: trackingNumber.toUpperCase(),
      carrier: trackingData.carrier_name || 'Transporteur international',
      status: currentStatus,
      currentLocation: latestEvent.location || formattedEvents[formattedEvents.length - 1]?.location || 'En transit',
      estimatedDelivery,
      lastUpdate: latestEvent.time_utc ? 
        new Date(latestEvent.time_utc).toLocaleString('fr-FR') : 
        new Date().toLocaleString('fr-FR'),
      events: formattedEvents,
      packageInfo: {
        origin: trackInfo.origin_country || 'International',
        destination: trackInfo.destination_country || 'France/DOM-TOM',
        service: 'ReexpresseTrack'
      },
      timeline: {
        created: formattedEvents[0]?.date || 'Non disponible',
        shipped: formattedEvents.find(e => e.status.toLowerCase().includes('expédié'))?.date || null,
        transit: formattedEvents.find(e => e.status.toLowerCase().includes('transit'))?.date || null,
        delivered: currentStatus.code === 'delivered' ? formattedEvents[formattedEvents.length - 1]?.date : null
      }
    }

    console.log('✅ Suivi formaté avec succès')

    return new Response(
      JSON.stringify(trackingResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erreur suivi colis:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erreur interne du serveur',
        details: error.message || 'Erreur inconnue',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})