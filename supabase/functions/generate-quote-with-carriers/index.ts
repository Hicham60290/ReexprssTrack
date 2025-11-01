import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { package_id, tracking_number } = await req.json()
    console.log('🔵 BACKEND: Paramètres reçus:', { package_id, tracking_number, user_id: user.id })

    // Rechercher le colis
    let packageQuery = supabaseClient
      .from('packages')
      .select('*')

    if (package_id) {
      packageQuery = packageQuery.eq('id', package_id)
    } else if (tracking_number) {
      packageQuery = packageQuery.eq('tracking_number', tracking_number)
    } else {
      return new Response(
        JSON.stringify({ error: 'package_id ou tracking_number requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: packages, error: packageError } = await packageQuery

    if (packageError || !packages || packages.length === 0) {
      console.error('🔴 BACKEND: Colis non trouvé:', packageError)
      return new Response(
        JSON.stringify({ error: 'Colis non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const packageData = packages[0]
    console.log('🔵 BACKEND: Colis trouvé:', packageData)

    // Vérifier que l'utilisateur peut accéder à ce colis
    if (packageData.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Accès non autorisé à ce colis' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier si un devis existe déjà
    const { data: existingQuotes } = await supabaseClient
      .from('quotes')
      .select('*')
      .eq('package_id', packageData.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingQuotes && existingQuotes.length > 0) {
      console.log('🔵 BACKEND: Devis existant trouvé:', existingQuotes[0].id)
      return new Response(
        JSON.stringify({ 
          quote_id: existingQuotes[0].id,
          message: 'Devis existant récupéré'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculer les frais
    const weight = packageData.weight || 1
    const storageBaseFee = 15.00
    const handlingFee = 5.00
    const subtotal = storageBaseFee + handlingFee
    const taxRate = 0.20
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    console.log('🔵 BACKEND: Calculs:', {
      weight,
      storageBaseFee,
      handlingFee,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount
    })

    // Créer le devis
    const { data: quote, error: quoteError } = await supabaseClient
      .from('quotes')
      .insert({
        user_id: packageData.user_id,
        package_id: packageData.id,
        base_amount: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (quoteError) {
      console.error('🔴 BACKEND: Erreur création devis:', quoteError)
      return new Response(
        JSON.stringify({ 
          error: 'Erreur lors de la création du devis',
          details: quoteError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔵 BACKEND: Devis créé:', quote.id)

    // Mettre à jour le colis avec l'ID du devis
    await supabaseClient
      .from('packages')
      .update({ quote_id: quote.id })
      .eq('id', packageData.id)

    // Créer les options de transporteur
    const carriers = [
      {
        name: 'Colissimo',
        price: 25.00,
        delivery_time: '5-7 jours',
        description: 'Service standard de La Poste'
      },
      {
        name: 'Chronopost',
        price: 35.00,
        delivery_time: '2-3 jours',
        description: 'Livraison express'
      },
      {
        name: 'DHL Express',
        price: 45.00,
        delivery_time: '1-2 jours',
        description: 'Livraison très rapide'
      }
    ]

    const carrierInserts = carriers.map(carrier => ({
      quote_id: quote.id,
      carrier_name: carrier.name,
      carrier_price: carrier.price,
      delivery_time: carrier.delivery_time,
      description: carrier.description
    }))

    const { error: carriersError } = await supabaseClient
      .from('quote_items')
      .insert(carrierInserts)

    if (carriersError) {
      console.error('🔴 BACKEND: Erreur création transporteurs:', carriersError)
    }

    return new Response(
      JSON.stringify({ 
        quote_id: quote.id,
        message: 'Devis créé avec succès'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('🔴 BACKEND: Erreur générale:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})