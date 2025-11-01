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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Récupérer tous les utilisateurs depuis auth.users et profiles
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
    
    if (authError) {
      throw authError
    }

    // Récupérer les profils pour compléter les informations
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        phone,
        subscription_type,
        subscription_status,
        subscription_expires_at,
        created_at,
        role
      `)

    if (profilesError) {
      throw profilesError
    }

    // Récupérer le nombre de colis par utilisateur
    const { data: packageCounts, error: packagesError } = await supabaseClient
      .from('packages')
      .select('user_id, user_email')

    if (packagesError) {
      console.error('Erreur packages:', packagesError)
    }

    // Créer un map des comptages de colis
    const packageCountMap = new Map()
    if (packageCounts) {
      packageCounts.forEach(pkg => {
        const key = pkg.user_id || pkg.user_email
        if (key) {
          packageCountMap.set(key, (packageCountMap.get(key) || 0) + 1)
        }
      })
    }

    // Créer un map des profils par ID
    const profileMap = new Map()
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile)
      })
    }

    // Combiner les données auth et profiles
    const users = authUsers.users
      .filter(user => {
        const profile = profileMap.get(user.id)
        return !profile || profile.role !== 'admin'
      })
      .map(user => {
        const profile = profileMap.get(user.id)
        const packageCount = packageCountMap.get(user.id) || packageCountMap.get(user.email) || 0
        
        return {
          id: user.id,
          email: user.email,
          email_confirmed: user.email_confirmed_at ? true : false,
          created_at: user.created_at,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          phone: profile?.phone || '',
          subscription_type: profile?.subscription_type || 'free',
          subscription_status: profile?.subscription_status || 'inactive',
          subscription_expires_at: profile?.subscription_expires_at,
          package_count: packageCount,
          client_reference: `CLI-${user.id.slice(-6).toUpperCase()}`
        }
      })

    return new Response(
      JSON.stringify({ users }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        users: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})