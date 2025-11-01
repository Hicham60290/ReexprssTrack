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
    // Initialisation du client Supabase avec clé service
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId, userData } = await req.json()

    if (!userId) {
      console.error('User ID manquant')
      throw new Error('User ID is required')
    }

    console.log('=== DÉBUT CRÉATION PROFIL ===')
    console.log('User ID:', userId)
    console.log('User Data reçue:', JSON.stringify(userData, null, 2))

    // Récupérer l'utilisateur depuis Auth pour avoir l'email
    let userEmail = userData?.email || ''
    try {
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId)
      
      if (authError) {
        console.warn('Erreur récupération auth user:', authError)
      } else if (authUser?.user?.email) {
        userEmail = authUser.user.email
        console.log('Email récupéré depuis auth:', userEmail)
      }
    } catch (authErr) {
      console.warn('Erreur accès auth admin:', authErr)
    }

    // Validation des données obligatoires
    if (!userEmail) {
      console.error('Email manquant pour la création du profil')
      throw new Error('Email is required for profile creation')
    }

    // Préparer les données du profil avec valeurs par défaut sécurisées
    const profileData = {
      id: userId,
      first_name: userData?.first_name?.trim() || '',
      last_name: userData?.last_name?.trim() || '',
      phone: userData?.phone?.trim() || '',
      company: userData?.company?.trim() || '',
      address: userData?.address?.trim() || '',
      postal_code: userData?.postal_code?.trim() || '',
      city: userData?.city?.trim() || '',
      territory: userData?.territory || '',
      subscription_type: 'free',
      subscription_status: 'inactive',
      role: 'user',
      accept_marketing: Boolean(userData?.accept_marketing),
      email: userEmail,
      kyc_status: 'pending',
      free_storage_days: 3,
      deletion_requested: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Données profil préparées:', JSON.stringify(profileData, null, 2))

    // Utiliser UPSERT pour gérer automatiquement les conflits
    const { data: profile, error: upsertError } = await supabaseClient
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Erreur upsert profil:', upsertError)
      
      // Dernière tentative: récupérer le profil existant
      console.log('Tentative de récupération du profil existant...')
      const { data: existingProfile, error: retrieveError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (retrieveError || !existingProfile) {
        console.error('Impossible de récupérer le profil:', retrieveError)
        throw new Error(`Erreur profil: ${upsertError.message}`)
      }

      console.log('Profil existant récupéré:', existingProfile.id)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Profile retrieved successfully',
          profile: existingProfile,
          action: 'retrieved_existing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('=== PROFIL TRAITÉ AVEC SUCCÈS ===')
    console.log('Profil final:', JSON.stringify(profile, null, 2))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile processed successfully',
        profile: profile,
        action: 'upserted'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== ERREUR GLOBALE FONCTION ===')
    console.error('Type:', error.constructor.name)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: `Erreur création profil: ${error.message}`,
        success: false,
        details: {
          type: error.constructor.name,
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})