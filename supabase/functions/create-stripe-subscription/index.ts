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
    console.log('🚀 [STRIPE-SUB] Début création abonnement - Nouveaux utilisateurs supportés')
    
    // Vérifications de configuration
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!stripeKey) {
      console.error('❌ [CONFIG] Clé Stripe manquante')
      throw new Error('Configuration Stripe indisponible')
    }
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ [CONFIG] Configuration Supabase manquante')
      throw new Error('Configuration base de données indisponible')
    }

    console.log('✅ [CONFIG] Toutes les configurations trouvées')

    // Récupération du token JWT pour validation utilisateur
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('❌ [AUTH] Token d\'authentification manquant')
      throw new Error('Authentification requise. Veuillez vous reconnecter.')
    }

    // Initialisation des services
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validation du token JWT et extraction de l'utilisateur
    const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (jwtError || !jwtUser) {
      console.error('❌ [JWT] Token invalide ou expiré:', jwtError)
      throw new Error('Session expirée. Veuillez vous reconnecter.')
    }

    console.log('✅ [JWT] Token validé pour utilisateur:', jwtUser.id)

    // Récupération et validation des données
    const requestData = await req.json()
    console.log('📝 [DATA] Données reçues:', {
      ...requestData,
      userEmail: requestData.userEmail ? '[PROTECTED]' : 'missing',
      userId: requestData.userId ? '[PROTECTED]' : 'missing'
    })

    const { priceId, userId, userEmail, userName, subscriptionType, userMetadata } = requestData

    // Validation de correspondance utilisateur JWT vs données
    if (userId !== jwtUser.id) {
      console.error('❌ [SECURITY] ID utilisateur non correspondant:', { jwt: jwtUser.id, provided: userId })
      throw new Error('Données utilisateur non correspondantes. Veuillez vous reconnecter.')
    }

    if (userEmail !== jwtUser.email) {
      console.error('❌ [SECURITY] Email utilisateur non correspondant:', { jwt: jwtUser.email, provided: userEmail })
      throw new Error('Email utilisateur non correspondant. Veuillez vous reconnecter.')
    }

    // Validation des paramètres obligatoires
    const missingParams = []
    if (!priceId) missingParams.push('priceId')
    if (!userId) missingParams.push('userId')
    if (!userEmail) missingParams.push('userEmail')
    
    if (missingParams.length > 0) {
      console.error('❌ [VALIDATION] Paramètres manquants:', missingParams)
      throw new Error(`Paramètres manquants: ${missingParams.join(', ')}`)
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      console.error('❌ [VALIDATION] Email invalide:', userEmail)
      throw new Error('Format d\'email invalide')
    }

    // Validation email confirmé
    if (!jwtUser.email_confirmed_at) {
      console.error('❌ [AUTH] Email non confirmé pour:', userEmail)
      throw new Error('Email non confirmé. Vérifiez vos emails et confirmez votre compte.')
    }

    console.log('✅ [VALIDATION] Tous les paramètres sont valides')

    // 🚀 CRÉATION FORCÉE DU PROFIL POUR NOUVEAUX UTILISATEURS
    console.log('🔍 [PROFILE] CRÉATION GARANTIE - Spécial nouveaux utilisateurs abonnement')
    
    let profile = null
    
    // Fonction ultra-robuste de création de profil pour abonnement
    const forceCreateProfileForSubscription = async () => {
      console.log('🔍 [PROFILE] Vérification existence profil avant abonnement...')
      
      // Étape 1: Tentative de récupération directe
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!fetchError && existingProfile && existingProfile.email) {
          console.log('✅ [PROFILE] Profil existant trouvé - utilisateur existant')
          return existingProfile
        }
        
        console.log('📝 [PROFILE] NOUVEAU UTILISATEUR DÉTECTÉ - Création obligatoire pour abonnement')
      } catch (err) {
        console.log('⚠️ [PROFILE] Nouveau utilisateur confirmé - création nécessaire')
      }

      // 🚨 CRÉATION IMMÉDIATE POUR NOUVEAUX UTILISATEURS
      console.log('🛠️ [PROFILE] CRÉATION FORCÉE - Utilisateur s\'abonne juste après inscription')
      
      // Récupération complète des données utilisateur
      const emailFromAuth = jwtUser.email || userEmail
      const userNameFromAuth = jwtUser.user_metadata?.full_name || jwtUser.user_metadata?.name || userName || ''
      const firstNameFromAuth = jwtUser.user_metadata?.first_name || userNameFromAuth.split(' ')[0] || ''
      const lastNameFromAuth = jwtUser.user_metadata?.last_name || userNameFromAuth.split(' ').slice(1).join(' ') || ''
      
      // Données profil optimisées pour abonnement immédiat
      const profileData = {
        id: userId,
        email: emailFromAuth,
        first_name: (userMetadata?.first_name || firstNameFromAuth || jwtUser.user_metadata?.first_name || '').trim(),
        last_name: (userMetadata?.last_name || lastNameFromAuth || jwtUser.user_metadata?.last_name || '').trim(),
        phone: (userMetadata?.phone || jwtUser.user_metadata?.phone || jwtUser.phone || '').trim(),
        company: (userMetadata?.company || jwtUser.user_metadata?.company || '').trim(),
        address: (userMetadata?.address || jwtUser.user_metadata?.address || '').trim(),
        postal_code: (userMetadata?.postal_code || jwtUser.user_metadata?.postal_code || '').trim(),
        city: (userMetadata?.city || jwtUser.user_metadata?.city || '').trim(),
        territory: userMetadata?.territory || jwtUser.user_metadata?.territory || '',
        subscription_type: 'free', // Sera mis à jour après paiement Stripe
        subscription_status: 'pending', // En attente de confirmation Stripe
        role: 'client',
        accept_marketing: Boolean(userMetadata?.accept_marketing || jwtUser.user_metadata?.accept_marketing),
        kyc_status: 'pending',
        free_storage_days: 3,
        deletion_requested: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📝 [PROFILE] Données complètes préparées pour création:', {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        isNewUser: true
      })

      // STRATÉGIE 1: INSERT direct avec gestion intelligente des conflits
      try {
        console.log('🔨 [PROFILE] Tentative création directe (nouveau utilisateur)...')
        const { data: insertProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single()

        if (!insertError && insertProfile) {
          console.log('✅ [PROFILE] Profil créé avec succès - nouveau utilisateur prêt pour abonnement')
          return insertProfile
        }
        
        // Gestion spéciale conflit (utilisateur existant non détecté)
        if (insertError?.code === '23505') {
          console.log('🔄 [PROFILE] Utilisateur existant détecté tardivement - récupération')
          const { data: conflictProfile, error: conflictError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (!conflictError && conflictProfile) {
            console.log('✅ [PROFILE] Profil utilisateur existant récupéré')
            return conflictProfile
          }
        }
        
        console.warn('⚠️ [PROFILE] INSERT échoué:', insertError?.message)
      } catch (insertErr) {
        console.warn('⚠️ [PROFILE] Erreur INSERT:', insertErr.message)
      }

      // STRATÉGIE 2: UPSERT sécurisé (marche pour nouveaux ET existants)
      try {
        console.log('🔨 [PROFILE] Tentative UPSERT universel...')
        const { data: upsertProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert(profileData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select()
          .single()

        if (!upsertError && upsertProfile) {
          console.log('✅ [PROFILE] Profil traité via UPSERT - prêt pour Stripe')
          return upsertProfile
        }
        
        console.warn('⚠️ [PROFILE] UPSERT partiel:', upsertError?.message)
      } catch (upsertErr) {
        console.warn('⚠️ [PROFILE] Erreur UPSERT:', upsertErr.message)
      }

      // STRATÉGIE 3: Fonction Edge de secours
      try {
        console.log('🔨 [PROFILE] Appel fonction Edge create-user-profile...')
        const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('create-user-profile', {
          body: {
            userId: userId,
            userData: {
              email: emailFromAuth,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone,
              company: profileData.company,
              address: profileData.address,
              postal_code: profileData.postal_code,
              city: profileData.city,
              territory: profileData.territory,
              accept_marketing: profileData.accept_marketing
            }
          }
        })

        if (!edgeError && edgeResult?.success && edgeResult?.profile) {
          console.log('✅ [PROFILE] Profil créé via fonction Edge')
          return edgeResult.profile
        }
        
        console.warn('⚠️ [PROFILE] Fonction Edge échouée:', edgeError?.message)
      } catch (edgeErr) {
        console.warn('⚠️ [PROFILE] Erreur fonction Edge:', edgeErr.message)
      }

      // STRATÉGIE 4: Attente + récupération (synchronisation)
      console.log('🔄 [PROFILE] Attente synchronisation base de données...')
      
      // Attendre la synchronisation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const { data: finalProfile, error: finalError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!finalError && finalProfile) {
        console.log('✅ [PROFILE] Profil trouvé après synchronisation')
        return finalProfile
      }

      // STRATÉGIE 5: Création de profil minimal critique
      console.log('🚨 [PROFILE] CRÉATION CRITIQUE - Profil minimal pour abonnement')
      
      try {
        // Profil minimal pour débloquer l'abonnement
        const minimalProfile = {
          id: userId,
          email: emailFromAuth,
          first_name: firstNameFromAuth || 'Nouveau',
          last_name: lastNameFromAuth || 'Client',
          role: 'client',
          subscription_type: 'free',
          subscription_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: minProfile, error: minError } = await supabase
          .from('profiles')
          .insert([minimalProfile])
          .select()
          .single()

        if (!minError && minProfile) {
          console.log('✅ [PROFILE] Profil minimal créé - abonnement débloqué')
          return minProfile
        }
      } catch (minErr) {
        console.error('💥 [PROFILE] Échec profil minimal:', minErr.message)
      }
      
      throw new Error('IMPOSSIBLE de créer le profil utilisateur. Problème critique - contactez le support.')
    }

    // Exécuter la création forcée du profil
    try {
      profile = await forceCreateProfileForSubscription()
    } catch (profileError) {
      console.error('💥 [PROFILE] Échec création profil pour abonnement:', profileError.message)
      throw new Error(`Impossible de créer votre profil utilisateur. Veuillez vous déconnecter, vous reconnecter et réessayer. Si le problème persiste, contactez le support : ${profileError.message}`)
    }

    // Validation absolue du profil créé
    if (!profile || !profile.id || !profile.email) {
      console.error('❌ [PROFILE] Profil final invalide:', profile)
      throw new Error('Profil utilisateur corrompu. Veuillez vous reconnecter.')
    }

    console.log('✅ [PROFILE] Profil validé et prêt pour Stripe:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      isNewUser: !profile.stripe_customer_id,
      createdNow: profile.created_at?.includes(new Date().toISOString().split('T')[0])
    })

    // Synchronisation email si nécessaire
    if (profile.email !== userEmail) {
      try {
        const { error: syncError } = await supabase
          .from('profiles')
          .update({ 
            email: userEmail, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', userId)
          
        if (!syncError) {
          profile.email = userEmail
          console.log('✅ [PROFILE] Email synchronisé')
        }
      } catch (syncErr) {
        console.warn('⚠️ [PROFILE] Erreur sync email (non critique):', syncErr)
      }
    }

    // Vérification des abonnements existants
    console.log('🔍 [STRIPE] Recherche d\'abonnements existants')
    
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 10
    })

    // Chercher aussi par métadonnées pour plus de sécurité
    const customersByMetadata = await stripe.customers.list({
      limit: 100
    })
    
    const userCustomers = customersByMetadata.data.filter(c => 
      c.metadata?.supabase_user_id === userId || 
      c.metadata?.profile_id === profile.id ||
      (c.email === userEmail && !c.deleted)
    )

    // Combiner les résultats
    const allUserCustomers = [...existingCustomers.data, ...userCustomers]
      .filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      )

    for (const customer of allUserCustomers) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 5
      })
      
      if (subscriptions.data.length > 0) {
        console.log('⚠️ [STRIPE] Abonnement actif trouvé:', subscriptions.data[0].id)
        throw new Error('Vous avez déjà un abonnement actif. Gérez-le depuis votre dashboard.')
      }
    }

    console.log('✅ [STRIPE] Aucun abonnement actif trouvé, création possible')

    // Configuration des produits et prix Stripe
    console.log('🛠️ [STRIPE] Configuration des produits et prix')
    
    let premiumProduct
    const products = await stripe.products.list({ limit: 100 })
    premiumProduct = products.data.find(p => p.name === 'ReExpresse Premium')
    
    if (!premiumProduct) {
      premiumProduct = await stripe.products.create({
        name: 'ReExpresse Premium',
        description: 'Abonnement Premium ReExpresse avec -20% sur les frais d\'expédition',
        metadata: {
          service: 'reexpresse',
          version: '2.0'
        }
      })
      console.log('✅ [STRIPE] Produit créé:', premiumProduct.id)
    }

    // Configuration des prix
    const prices = await stripe.prices.list({ 
      product: premiumProduct.id,
      limit: 100,
      active: true
    })

    let targetPrice
    
    if (priceId === 'monthly_premium') {
      targetPrice = prices.data.find(p => 
        p.recurring?.interval === 'month' && p.unit_amount === 250
      )
      
      if (!targetPrice) {
        targetPrice = await stripe.prices.create({
          product: premiumProduct.id,
          unit_amount: 250,
          currency: 'eur',
          recurring: { interval: 'month' },
          metadata: { plan: 'premium_monthly' }
        })
        console.log('✅ [STRIPE] Prix mensuel créé:', targetPrice.id)
      }
      
    } else if (priceId === 'yearly_premium') {
      targetPrice = prices.data.find(p => 
        p.recurring?.interval === 'year' && p.unit_amount === 2000
      )
      
      if (!targetPrice) {
        targetPrice = await stripe.prices.create({
          product: premiumProduct.id,
          unit_amount: 2000,
          currency: 'eur',
          recurring: { interval: 'year' },
          metadata: { plan: 'premium_yearly' }
        })
        console.log('✅ [STRIPE] Prix annuel créé:', targetPrice.id)
      }
      
    } else {
      console.error('❌ [STRIPE] Prix ID invalide:', priceId)
      throw new Error(`Plan non reconnu: ${priceId}`)
    }

    console.log('✅ [STRIPE] Prix configuré:', targetPrice.id)

    // 🚀 CRÉATION CUSTOMER STRIPE AVEC PROFIL GARANTI
    console.log('🛠️ [STRIPE] Création/récupération customer avec profil nouveau utilisateur')
    
    let customer = allUserCustomers.find(c => 
      c.metadata?.supabase_user_id === userId || 
      c.metadata?.profile_id === profile.id ||
      (c.email === userEmail && !c.deleted)
    )

    if (!customer) {
      console.log('📝 [STRIPE] NOUVEAU CUSTOMER - Création avec profil complet nouveau utilisateur')
      
      // Nom complet à partir du profil créé
      const firstName = profile.first_name || ''
      const lastName = profile.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim()
      const customerName = fullName || userName || userEmail.split('@')[0]

      // Métadonnées ultra-complètes avec focus nouveaux utilisateurs
      const customerMetadata = {
        supabase_user_id: userId,
        profile_id: profile.id,
        service: 'reexpresse',
        created_via: 'new_user_subscription_flow',
        profile_email: profile.email,
        auth_email: jwtUser.email,
        profile_role: profile.role || 'client',
        profile_first_name: profile.first_name || '',
        profile_last_name: profile.last_name || '',
        profile_phone: profile.phone || '',
        profile_company: profile.company || '',
        profile_address: profile.address || '',
        profile_postal_code: profile.postal_code || '',
        profile_city: profile.city || '',
        profile_territory: profile.territory || '',
        profile_subscription_status: profile.subscription_status || 'pending',
        profile_kyc_status: profile.kyc_status || 'pending',
        profile_accept_marketing: String(profile.accept_marketing || false),
        creation_timestamp: new Date().toISOString(),
        user_type: 'new_subscription',
        profile_created_today: profile.created_at?.includes(new Date().toISOString().split('T')[0]) ? 'true' : 'false',
        profile_created_at: profile.created_at,
        integration_version: '3.0_new_users',
        subscription_ready: 'true'
      }

      customer = await stripe.customers.create({
        email: userEmail,
        name: customerName,
        phone: profile.phone || undefined,
        metadata: customerMetadata
      })
      
      console.log('✅ [STRIPE] Nouveau customer créé avec profil nouveau utilisateur:', customer.id)
      
      // Mise à jour immédiate du profil avec l'ID customer
      const { error: updateCustomerError } = await supabase
        .from('profiles')
        .update({ 
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (!updateCustomerError) {
        console.log('✅ [PROFILE] Customer ID Stripe sauvegardé pour nouveau utilisateur')
      }
      
    } else {
      console.log('✅ [STRIPE] Customer existant trouvé:', customer.id)
      
      // Mise à jour metadata pour assurer synchronisation complète
      const needsUpdate = !customer.metadata?.profile_id || 
                         !customer.metadata?.supabase_user_id || 
                         customer.metadata?.service !== 'reexpresse' ||
                         customer.metadata?.profile_email !== profile.email ||
                         !customer.metadata?.integration_version?.includes('3.0')

      if (needsUpdate) {
        await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            supabase_user_id: userId,
            profile_id: profile.id,
            service: 'reexpresse',
            profile_email: profile.email,
            auth_email: jwtUser.email,
            profile_role: profile.role || 'client',
            profile_first_name: profile.first_name || '',
            profile_last_name: profile.last_name || '',
            profile_phone: profile.phone || '',
            profile_city: profile.city || '',
            profile_territory: profile.territory || '',
            last_updated: new Date().toISOString(),
            update_reason: 'profile_sync_new_user_support',
            integration_version: '3.0_updated',
            subscription_flow: 'optimized_new_users'
          }
        })
        console.log('✅ [STRIPE] Customer mis à jour avec support nouveaux utilisateurs')
      }
    }

    // Création de la session Checkout optimisée nouveaux utilisateurs
    const origin = req.headers.get('origin') || 
                  req.headers.get('referer')?.split('?')[0] || 
                  'https://reexpresse.readdy.ai'
    
    console.log('🌐 [CHECKOUT] Origin détecté:', origin)

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: targetPrice.id,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/abonnement?subscription=cancelled`,
      
      // Métadonnées ultra-complètes pour nouveaux utilisateurs
      metadata: {
        user_id: userId,
        profile_id: profile.id,
        subscription_type: subscriptionType,
        service: 'reexpresse',
        version: '3.0_new_user_optimized',
        profile_email: profile.email,
        auth_email: jwtUser.email,
        customer_stripe_id: customer.id,
        created_from: 'new_user_subscription_flow',
        profile_role: profile.role || 'client',
        profile_name: `${profile.first_name} ${profile.last_name}`.trim(),
        profile_territory: profile.territory || '',
        profile_created_today: profile.created_at?.includes(new Date().toISOString().split('T')[0]) ? 'true' : 'false',
        session_timestamp: new Date().toISOString(),
        user_type: !profile.stripe_customer_id ? 'brand_new_user' : 'existing_user',
        profile_forced_creation: 'true',
        subscription_readiness: 'guaranteed'
      },
      
      subscription_data: {
        metadata: {
          user_id: userId,
          profile_id: profile.id,
          subscription_type: subscriptionType,
          service: 'reexpresse',
          profile_email: profile.email,
          auth_email: jwtUser.email,
          customer_stripe_id: customer.id,
          profile_role: profile.role || 'client',
          profile_first_name: profile.first_name || '',
          profile_last_name: profile.last_name || '',
          profile_territory: profile.territory || '',
          subscription_timestamp: new Date().toISOString(),
          integration_version: '3.0_new_user_support',
          profile_creation_flow: 'forced_for_subscription'
        }
      },
      
      // Configuration UX
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto'
      },
      allow_promotion_codes: true,
      locale: 'fr',
      
      // Taxes automatiques  
      automatic_tax: {
        enabled: true
      },
      
      // Configuration expiration
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    })

    console.log('✅ [CHECKOUT] Session créée avec support complet nouveaux utilisateurs:', session.id)

    // Réponse de succès avec données enrichies
    const response = {
      success: true,
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
      priceId: targetPrice.id,
      expiresAt: session.expires_at,
      profileId: profile.id,
      userRecognition: {
        profile_exists: true,
        profile_complete: true,
        profile_created_for_subscription: true,
        profile_forced_creation: profile.created_at?.includes(new Date().toISOString().split('T')[0]),
        stripe_customer_exists: !!allUserCustomers.length,
        stripe_customer_created_now: !allUserCustomers.length,
        metadata_complete: true,
        profile_synchronized: true,
        ready_for_subscription: true,
        new_user_supported: true
      },
      message: 'Session de paiement créée - TOUS les utilisateurs (nouveaux inclus) sont parfaitement reconnus par Stripe'
    }

    console.log('🎉 [SUCCESS] Abonnement configuré pour utilisateur (spécial nouveaux):', {
      email: userEmail,
      profileId: profile.id,
      customerId: customer.id,
      isNewUser: profile.created_at?.includes(new Date().toISOString().split('T')[0]),
      profileForcedCreation: true
    })

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 [ERROR] Erreur fonction nouveaux utilisateurs:', error)
    
    // Catégorisation des erreurs
    let statusCode = 400
    let errorCategory = 'unknown'
    
    if (error.message?.includes('Configuration') || error.message?.includes('indisponible')) {
      statusCode = 503
      errorCategory = 'service'
    } else if (error.message?.includes('non trouvé') || error.message?.includes('invalide') || error.message?.includes('non créé') || error.message?.includes('non disponible')) {
      statusCode = 404
      errorCategory = 'user'
    } else if (error.message?.includes('abonnement actif')) {
      statusCode = 409
      errorCategory = 'conflict'
    } else if (error.message?.includes('Email non confirmé') || error.message?.includes('Session expirée') || error.message?.includes('non correspondantes')) {
      statusCode = 401
      errorCategory = 'auth'
    } else if (error.message?.includes('Impossible de créer') || error.message?.includes('profil utilisateur') || error.message?.includes('IMPOSSIBLE')) {
      statusCode = 422
      errorCategory = 'profile_creation_critical'
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de la création de l\'abonnement',
        category: errorCategory,
        timestamp: new Date().toISOString(),
        function: 'create-stripe-subscription',
        version: '3.0_new_user_optimized',
        support_message: 'Si vous venez de vous inscrire, attendez 1 minute puis réessayez. Sinon contactez le support.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode
      }
    )
  }
})