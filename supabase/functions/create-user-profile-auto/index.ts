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

    console.log('=== CRÉATION AUTOMATIQUE PROFIL ===')
    console.log('User ID:', userId)
    console.log('User Data reçue:', JSON.stringify(userData, null, 2))

    // Récupérer l'utilisateur depuis Auth pour avoir l'email et autres infos
    let userEmail = userData?.email || ''
    let authUserData = null

    try {
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId)
      
      if (authError) {
        console.warn('Erreur récupération auth user:', authError)
      } else if (authUser?.user) {
        authUserData = authUser.user
        userEmail = authUser.user.email || userData?.email || ''
        console.log('Données auth récupérées:', {
          email: authUser.user.email,
          user_metadata: authUser.user.user_metadata
        })
      }
    } catch (authErr) {
      console.warn('Erreur accès auth admin:', authErr)
    }

    // Validation des données obligatoires
    if (!userEmail) {
      console.error('Email manquant pour la création du profil')
      throw new Error('Email is required for profile creation')
    }

    // Fusionner les données de user_metadata et userData
    const mergedData = {
      ...userData,
      ...(authUserData?.user_metadata || {})
    }

    // Préparer les données du profil avec valeurs par défaut robustes
    const profileData = {
      id: userId,
      first_name: mergedData?.first_name?.trim() || '',
      last_name: mergedData?.last_name?.trim() || '',
      phone: mergedData?.phone?.trim() || '',
      company: mergedData?.company?.trim() || '',
      address: mergedData?.address?.trim() || '',
      postal_code: mergedData?.postal_code?.trim() || '',
      city: mergedData?.city?.trim() || '',
      territory: mergedData?.territory || '',
      subscription_type: 'free',
      subscription_status: 'inactive',
      role: 'user',
      accept_marketing: Boolean(mergedData?.accept_marketing),
      email: userEmail,
      kyc_status: 'pending',
      free_storage_days: 3,
      deletion_requested: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Données profil préparées:', JSON.stringify(profileData, null, 2))

    // Vérifier d'abord si le profil existe déjà
    const { data: existingProfile, error: checkError } = await supabaseClient
      .from('profiles')
      .select('id, email, created_at')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      console.log('Profil existant trouvé:', existingProfile.id)
      
      // Mettre à jour le profil existant avec les nouvelles données
      const { data: updatedProfile, error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          ...profileData,
          created_at: existingProfile.created_at // Garder la date de création originale
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) {
        console.error('Erreur mise à jour profil existant:', updateError)
        throw new Error(`Erreur mise à jour profil: ${updateError.message}`)
      }

      console.log('=== PROFIL MIS À JOUR AVEC SUCCÈS ===')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Profile updated successfully',
          profile: updatedProfile,
          action: 'updated_existing'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer un nouveau profil
    const { data: newProfile, error: insertError } = await supabaseClient
      .from('profiles')
      .insert([profileData])
      .select()
      .single()

    if (insertError) {
      console.error('Erreur création nouveau profil:', insertError)
      
      // Dernière tentative avec UPSERT pour gérer les conflits de concurrence
      console.log('Tentative UPSERT de secours...')
      const { data: upsertProfile, error: upsertError } = await supabaseClient
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (upsertError) {
        console.error('Erreur UPSERT de secours:', upsertError)
        throw new Error(`Erreur création profil: ${insertError.message}`)
      }

      console.log('=== PROFIL CRÉÉ VIA UPSERT DE SECOURS ===')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Profile created via upsert fallback',
          profile: upsertProfile,
          action: 'created_via_upsert'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('=== NOUVEAU PROFIL CRÉÉ AVEC SUCCÈS ===')
    console.log('Profil final:', JSON.stringify(newProfile, null, 2))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile created successfully',
        profile: newProfile,
        action: 'created_new'
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
        error: `Erreur création profil automatique: ${error.message}`,
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