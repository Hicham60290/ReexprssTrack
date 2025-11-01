import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('💳 Début création paiement')

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json()
    console.log('📋 Corps de la requête reçu:', requestBody)

    const { 
      quoteId, // ✅ Utiliser quoteId au lieu de quote_id
      carrier_name, 
      carrier_price, 
      carrier_delivery_time,
      amount_ht,
      amount_ttc,
      tva_amount
    } = requestBody

    // Validation stricte des paramètres
    if (!quoteId || quoteId === 'undefined' || quoteId === 'null') {
      console.error('❌ ID de devis invalide:', quoteId)
      return new Response(
        JSON.stringify({ error: 'ID de devis invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!carrier_name || !carrier_price) {
      console.error('❌ Données transporteur manquantes:', { carrier_name, carrier_price })
      return new Response(
        JSON.stringify({ error: 'Données transporteur manquantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const carrierPriceNum = parseFloat(carrier_price)
    const amountHTNum = parseFloat(amount_ht || '0')
    const amountTTCNum = parseFloat(amount_ttc || '0')

    if (isNaN(carrierPriceNum) || carrierPriceNum <= 0) {
      console.error('❌ Prix transporteur invalide:', carrier_price)
      return new Response(
        JSON.stringify({ error: 'Prix transporteur invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Validation des paramètres OK:', {
      quoteId,
      carrier_name,
      carrierPriceNum,
      amountHTNum,
      amountTTCNum
    })

    // 1. Récupérer le devis SANS jointure pour éviter les erreurs
    const { data: quote, error: quoteError } = await supabaseAdmin
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      console.error('❌ Devis non trouvé:', quoteError)
      return new Response(
        JSON.stringify({ error: 'Devis non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Devis trouvé:', {
      quoteId: quote.id,
      quoteNumber: quote.quote_number,
      packageId: quote.package_id,
      userId: quote.user_id
    })

    // 2. Récupérer le colis associé
    let packageData = null
    if (quote.package_id) {
      const { data: pkg, error: pkgError } = await supabaseAdmin
        .from('packages')
        .select('*')
        .eq('id', quote.package_id)
        .single()

      if (!pkgError && pkg) {
        packageData = pkg
        console.log('✅ Colis trouvé via package_id:', packageData.tracking_number)
      }
    }

    // Si pas de package via package_id, chercher par quote_id
    if (!packageData) {
      const { data: pkgs, error: pkgsError } = await supabaseAdmin
        .from('packages')
        .select('*')
        .eq('quote_id', quote.id)
        .limit(1)

      if (!pkgsError && pkgs && pkgs.length > 0) {
        packageData = pkgs[0]
        console.log('✅ Colis trouvé via quote_id:', packageData.tracking_number)
      }
    }

    if (!packageData) {
      console.error('❌ Colis associé non trouvé pour quote:', quote.id)
      return new Response(
        JSON.stringify({ error: 'Colis associé non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Colis trouvé:', {
      packageId: packageData.id,
      trackingNumber: packageData.tracking_number,
      userId: packageData.user_id
    })

    // 3. Récupérer les infos du client
    const clientUserId = quote.user_id || packageData.user_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', clientUserId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profil client non trouvé:', profileError)
      return new Response(
        JSON.stringify({ error: 'Profil client non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Client trouvé:', {
      clientId: clientUserId,
      email: profile.email
    })

    // 4. Vérifier que le devis n'est pas déjà payé
    if (quote.payment_status === 'paid') {
      console.log('⚠️ Devis déjà payé')
      return new Response(
        JSON.stringify({ error: 'Ce devis a déjà été payé' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Utiliser les montants calculés côté frontend ou calculer si manquants
    let finalAmountHT, finalTVA, finalAmountTTC;
    
    if (amountHTNum > 0 && amountTTCNum > 0) {
      // Utiliser les montants calculés côté frontend
      finalAmountHT = amountHTNum;
      finalTVA = parseFloat(tva_amount || '0') || (finalAmountHT * 0.20);
      finalAmountTTC = amountTTCNum;
    } else {
      // Calculer si les montants ne sont pas fournis
      const baseAmount = parseFloat(quote.amount_ht || '20');
      finalAmountHT = baseAmount + carrierPriceNum;
      finalTVA = finalAmountHT * 0.20;
      finalAmountTTC = finalAmountHT + finalTVA;
    }

    console.log('💰 Calcul montant final:', {
      baseAmount: quote.amount_ht,
      carrierPriceNum,
      finalAmountHT,
      finalTVA,
      finalAmountTTC
    })

    const APP_URL = Deno.env.get('APP_URL') || 'https://reexpresstrack.com'

    // 6. Créer la session de paiement Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: profile.email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(finalAmountTTC * 100),
            product_data: {
              name: `Devis ${quote.quote_number}`,
              description: `Expédition ${carrier_name} - Colis ${packageData.tracking_number}`,
            },
          },
          quantity: 1,
        }
      ],
      success_url: `${APP_URL}/dashboard?payment=success&quote=${quoteId}`,
      cancel_url: `${APP_URL}/quote-payment?id=${quoteId}&payment=cancelled`,
      metadata: {
        quote_id: quoteId,
        carrier_name: carrier_name,
        carrier_price: carrierPriceNum.toString(),
        total_amount: finalAmountTTC.toString(),
        package_id: packageData.id,
        client_email: profile.email
      },
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24h
    })

    console.log('🔗 Session Stripe créée:', {
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

    // 7. Mettre à jour le devis avec toutes les informations
    const { error: updateError } = await supabaseAdmin
      .from('quotes')
      .update({
        carrier_name: carrier_name,
        carrier_price: carrierPriceNum,
        carrier_delivery_time: carrier_delivery_time,
        amount_ht: finalAmountHT,
        tax_amount: finalTVA,
        amount_ttc: finalAmountTTC,
        payment_url: checkoutSession.url,
        stripe_session_id: checkoutSession.id,
        payment_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)

    if (updateError) {
      console.error('❌ Erreur mise à jour devis:', updateError)
      return new Response(
        JSON.stringify({
          error: 'Erreur lors de la mise à jour du devis',
          details: updateError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Devis mis à jour avec succès')

    // 8. Créer une notification pour le client
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: clientUserId,
          title: 'Lien de paiement prêt',
          message: `Votre lien de paiement pour le devis ${quote.quote_number} est prêt. Transporteur: ${carrier_name} (${carrierPriceNum}€). Total: ${finalAmountTTC.toFixed(2)}€.`,
          type: 'payment_ready',
          is_read: false,
          created_at: new Date().toISOString()
        })
    } catch (notifError) {
      console.log('⚠️ Notification non créée:', notifError)
    }

    console.log('🎉 Paiement créé avec succès')

    return new Response(
      JSON.stringify({
        success: true,
        url: checkoutSession.url,
        session_id: checkoutSession.id,
        total_amount: finalAmountTTC,
        carrier_name: carrier_name,
        carrier_price: carrierPriceNum,
        expires_at: checkoutSession.expires_at
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Erreur fatale création paiement:', error)
    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la création du paiement',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})