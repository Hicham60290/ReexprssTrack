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
    console.log('🚀 Calcul des frais de stockage')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuration Supabase manquante')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer tous les colis stockés
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select(`
        *,
        profiles (subscription_type)
      `)
      .in('status', ['received', 'stored'])
      .not('storage_start_date', 'is', null)

    if (packagesError) {
      console.error('Erreur récupération colis:', packagesError)
      throw packagesError
    }

    let updatedPackages = 0
    const results = []

    for (const pkg of packages || []) {
      try {
        // Déterminer les jours gratuits selon l'abonnement
        const freeStorageDays = pkg.profiles?.subscription_type === 'premium_yearly' ? 90 :
                               pkg.profiles?.subscription_type === 'premium_monthly' ? 60 : 3

        // Calculer les jours de stockage
        const storageStartDate = new Date(pkg.storage_start_date)
        const now = new Date()
        const daysStored = Math.floor((now.getTime() - storageStartDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Calculer les jours facturables
        const chargeableDays = Math.max(0, daysStored - freeStorageDays)
        const storageFees = chargeableDays * 1.00 // 1€ par jour
        
        // Déterminer le statut
        const storageStatus = daysStored <= freeStorageDays ? 'free' : 
                             storageFees > 0 ? 'charged' : 'free'

        // Mettre à jour le colis
        const { error: updateError } = await supabase
          .from('packages')
          .update({
            storage_days: daysStored,
            storage_fees: storageFees,
            storage_status: storageStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', pkg.id)

        if (updateError) {
          console.error(`Erreur mise à jour colis ${pkg.id}:`, updateError)
          continue
        }

        // Créer ou mettre à jour l'enregistrement de facturation si des frais sont dus
        if (storageFees > 0) {
          const { error: billingError } = await supabase
            .from('storage_billing')
            .upsert({
              user_id: pkg.user_id,
              package_id: pkg.id,
              start_date: pkg.storage_start_date,
              days_stored: daysStored,
              free_days_used: Math.min(daysStored, freeStorageDays),
              chargeable_days: chargeableDays,
              daily_rate: 1.00,
              total_amount: storageFees,
              status: 'active',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'package_id'
            })

          if (billingError) {
            console.error(`Erreur facturation stockage ${pkg.id}:`, billingError)
          }
        }

        results.push({
          package_id: pkg.id,
          tracking_number: pkg.tracking_number,
          days_stored: daysStored,
          free_days: freeStorageDays,
          chargeable_days: chargeableDays,
          storage_fees: storageFees,
          status: storageStatus
        })

        updatedPackages++

      } catch (error) {
        console.error(`Erreur traitement colis ${pkg.id}:`, error)
        continue
      }
    }

    console.log(`✅ ${updatedPackages} colis mis à jour`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updatedPackages} colis traités`,
        updated_packages: updatedPackages,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Erreur calcul frais stockage:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})