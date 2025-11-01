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
    console.log('🚀 Début création paiement retour')
    
    // Vérifications initiales
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!stripeKey) {
      console.error('❌ Clé Stripe manquante')
      throw new Error('Configuration Stripe manquante')
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Configuration Supabase manquante')
      throw new Error('Configuration Supabase manquante')
    }

    console.log('✅ Configurations trouvées')

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Récupération et validation des données
    const requestData = await req.json()
    console.log('📝 Données reçues:', JSON.stringify(requestData, null, 2))

    const { userId, userEmail, amount, returnData, packageId } = requestData

    if (!userId || !userEmail || !amount || !returnData || !packageId) {
      console.error('❌ Paramètres manquants')
      throw new Error('Paramètres requis manquants')
    }

    console.log('✅ Paramètres validés')

    // Vérification utilisateur dans Supabase
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Utilisateur non trouvé:', profileError)
      throw new Error('Utilisateur non trouvé dans la base de données')
    }

    console.log('✅ Profil utilisateur trouvé:', profile.email)

    // Vérification du colis
    const { data: packageData, error: packageError } = await supabaseClient
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('user_id', userId)
      .single()

    if (packageError || !packageData) {
      console.error('❌ Colis non trouvé:', packageError)
      throw new Error('Colis non trouvé ou non autorisé')
    }

    console.log('✅ Colis vérifié:', packageData.tracking_number)

    // Gestion du customer Stripe
    let customer
    try {
      // Chercher customer existant
      const existingCustomers = await stripe.customers.list({
        email: userEmail,
        limit: 10
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
        console.log('✅ Customer existant trouvé:', customer.id)
      } else {
        console.log('🛠️ Création nouveau customer')
        customer = await stripe.customers.create({
          email: userEmail,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || userEmail,
          metadata: {
            supabase_user_id: userId,
            service: 'reexpressetrack_return'
          }
        })
        console.log('✅ Customer créé:', customer.id)
      }
    } catch (customerError) {
      console.error('❌ Erreur customer Stripe:', customerError)
      throw new Error(`Erreur customer: ${customerError.message}`)
    }

    // Création de la session Checkout
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://reexpressetrack.com'
    console.log('🌐 Origin détecté:', origin)

    try {
      const sessionConfig = {
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Frais de retour colis - ${packageData.tracking_number}`,
                description: `Retour ${returnData.type} - ${returnData.reason} (${returnData.urgency})`,
                metadata: {
                  service: 'reexpressetrack_return',
                  package_id: packageId,
                  return_type: returnData.type,
                  return_reason: returnData.reason,
                  urgency: returnData.urgency
                }
              },
              unit_amount: amount, // Montant en centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/gestion-retour?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/gestion-retour?payment=cancelled`,
        metadata: {
          user_id: userId,
          package_id: packageId,
          service: 'reexpressetrack_return',
          return_data: JSON.stringify(returnData)
        },
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        },
        locale: 'fr'
      }

      console.log('🛠️ Création session Checkout')

      const session = await stripe.checkout.sessions.create(sessionConfig)

      console.log('✅ Session créée avec succès:', session.id)
      console.log('🔗 URL de paiement:', session.url)

      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionId: session.id,
          url: session.url,
          customerId: customer.id,
          amount: amount
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (sessionError) {
      console.error('❌ Erreur création session Checkout:', sessionError)
      throw new Error(`Erreur session de paiement: ${sessionError.message}`)
    }

  } catch (error) {
    console.error('💥 Erreur générale fonction:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
        function: 'create-return-payment'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})