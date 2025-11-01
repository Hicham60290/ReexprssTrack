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
    console.log('🎣 Webhook Stripe reçu')

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
      console.error('❌ Signature ou secret webhook manquant')
      return new Response('Webhook signature required', { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('❌ Erreur vérification signature webhook:', err)
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
    }

    console.log('✅ Événement Stripe validé:', event.type)

    // Traiter les événements de paiement
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('💳 Session de paiement complétée:', session.id)

      const quoteId = session.metadata?.quote_id
      if (!quoteId) {
        console.error('❌ Quote ID manquant dans les métadonnées')
        return new Response('Quote ID missing', { status: 400 })
      }

      // Mettre à jour le devis comme payé
      const { data: quote, error: updateError } = await supabaseAdmin
        .from('quotes')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId)
        .select('*, packages!inner(id, user_id, tracking_number)')
        .single()

      if (updateError) {
        console.error('❌ Erreur mise à jour devis:', updateError)
        return new Response('Database update failed', { status: 500 })
      }

      console.log('✅ Devis marqué comme payé:', quoteId)

      // Mettre à jour le statut du colis
      if (quote.packages?.id) {
        const { error: packageError } = await supabaseAdmin
          .from('packages')
          .update({
            status: 'paid_ready_to_ship',
            updated_at: new Date().toISOString()
          })
          .eq('id', quote.packages.id)

        if (packageError) {
          console.error('❌ Erreur mise à jour colis:', packageError)
        } else {
          console.log('✅ Statut colis mis à jour')
        }
      }

      // Créer une notification de confirmation
      try {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: quote.packages.user_id,
            title: 'Paiement confirmé',
            message: `Votre paiement pour le devis ${quote.quote_number} a été confirmé. Votre colis ${quote.packages.tracking_number} sera expédié sous peu.`,
            type: 'payment_confirmed',
            is_read: false,
            created_at: new Date().toISOString()
          })
      } catch (notifError) {
        console.log('⚠️ Notification non créée:', notifError)
      }

      // Envoyer un email de confirmation
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            to: session.customer_email,
            subject: `Paiement confirmé - Devis ${quote.quote_number}`,
            template: 'payment_confirmation',
            data: {
              quote_number: quote.quote_number,
              tracking_number: quote.packages.tracking_number,
              amount: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00',
              carrier_name: quote.carrier_name || 'À définir'
            }
          })
        })
      } catch (emailError) {
        console.log('⚠️ Email non envoyé:', emailError)
      }

      console.log('🎉 Paiement traité avec succès')
    }

    // Traiter les sessions expirées
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('⏰ Session expirée:', session.id)

      const quoteId = session.metadata?.quote_id
      if (quoteId) {
        // Remettre le devis en brouillon
        await supabaseAdmin
          .from('quotes')
          .update({
            payment_status: 'draft',
            payment_url: null,
            stripe_session_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', quoteId)

        console.log('✅ Devis remis en brouillon après expiration')
      }
    }

    return new Response('Webhook handled successfully', { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('❌ Erreur webhook Stripe:', error)
    return new Response(`Webhook error: ${error.message}`, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})