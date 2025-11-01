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
    console.log('🚀 Calcul automatique des frais de stockage selon abonnements')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuration Supabase manquante')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer tous les colis stockés avec les informations d'abonnement
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select(`
        *,
        profiles!packages_user_id_fkey (
          id,
          subscription_type,
          email,
          first_name,
          last_name
        )
      `)
      .in('status', ['received', 'stored'])
      .not('storage_start_date', 'is', null)
      .eq('payment_status', 'pending')

    if (packagesError) {
      console.error('❌ Erreur récupération colis:', packagesError)
      throw packagesError
    }

    console.log(`📦 ${packages?.length || 0} colis à traiter`)

    let updatedPackages = 0
    let packagesWithNewFees = 0
    const results = []
    const notificationsToSend = []

    for (const pkg of packages || []) {
      try {
        const profile = pkg.profiles
        if (!profile) {
          console.warn(`⚠️ Profil manquant pour colis ${pkg.id}`)
          continue
        }

        // Déterminer les jours gratuits selon l'abonnement
        const subscriptionType = profile.subscription_type || 'free'
        const freeStorageDays = subscriptionType === 'premium_yearly' ? 90 :
                               subscriptionType === 'premium_monthly' ? 60 : 3

        // Calculer les jours de stockage depuis la date de début
        const storageStartDate = new Date(pkg.storage_start_date)
        const now = new Date()
        const daysStored = Math.floor((now.getTime() - storageStartDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Calculer les jours facturables (au-delà de la période gratuite)
        const chargeableDays = Math.max(0, daysStored - freeStorageDays)
        const newStorageFees = chargeableDays * 1.00 // 1€ par jour
        
        // Déterminer le statut de stockage
        const storageStatus = daysStored <= freeStorageDays ? 'free' : 
                             newStorageFees > 0 ? 'charged' : 'free'

        // Vérifier si les frais ont changé
        const previousStorageFees = pkg.storage_fee || 0
        const feesChanged = Math.abs(newStorageFees - previousStorageFees) > 0.01

        console.log(`📦 Colis ${pkg.tracking_number}:`, {
          client: `${profile.first_name} ${profile.last_name}`,
          subscription: subscriptionType,
          daysStored,
          freeStorageDays,
          chargeableDays,
          previousFees: previousStorageFees,
          newFees: newStorageFees,
          feesChanged
        })

        // Calculer le nouveau total
        const shippingFee = pkg.shipping_fee || 0
        const newTotalFee = newStorageFees + shippingFee

        // Mettre à jour le colis avec les nouveaux frais
        const { error: updateError } = await supabase
          .from('packages')
          .update({
            storage_days: daysStored,
            storage_fee: newStorageFees,
            total_fee: newTotalFee,
            storage_status: storageStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', pkg.id)

        if (updateError) {
          console.error(`❌ Erreur mise à jour colis ${pkg.id}:`, updateError)
          continue
        }

        // Mettre à jour le devis associé si les frais ont changé
        if (pkg.quote_id && feesChanged) {
          const amountHT = newTotalFee / 1.2
          const amountTTC = newTotalFee

          const { error: quoteUpdateError } = await supabase
            .from('quotes')
            .update({
              amount_ht: amountHT,
              amount_ttc: amountTTC,
              updated_at: new Date().toISOString()
            })
            .eq('id', pkg.quote_id)

          if (quoteUpdateError) {
            console.error(`❌ Erreur mise à jour devis ${pkg.quote_id}:`, quoteUpdateError)
          } else {
            console.log(`✅ Devis ${pkg.quote_id} mis à jour: ${amountTTC.toFixed(2)}€`)
          }
        }

        // Créer ou mettre à jour l'enregistrement de facturation si des frais sont dus
        if (newStorageFees > 0) {
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
              total_amount: newStorageFees,
              status: chargeableDays > 0 ? 'active' : 'free',
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'package_id'
            })

          if (billingError) {
            console.error(`❌ Erreur facturation stockage ${pkg.id}:`, billingError)
          }
        }

        // Préparer notification si des frais ont été ajoutés pour la première fois
        if (feesChanged && newStorageFees > previousStorageFees && chargeableDays > 0) {
          packagesWithNewFees++
          
          // Notification uniquement si c'est la première fois que des frais s'appliquent
          if (previousStorageFees === 0 && newStorageFees > 0) {
            notificationsToSend.push({
              email: profile.email,
              clientName: `${profile.first_name} ${profile.last_name}`,
              trackingNumber: pkg.tracking_number,
              daysStored,
              freeStorageDays,
              chargeableDays,
              newStorageFees,
              newTotalFee,
              subscriptionType
            })
          }
        }

        results.push({
          package_id: pkg.id,
          tracking_number: pkg.tracking_number,
          client_name: `${profile.first_name} ${profile.last_name}`,
          subscription_type: subscriptionType,
          days_stored: daysStored,
          free_days: freeStorageDays,
          chargeable_days: chargeableDays,
          previous_storage_fees: previousStorageFees,
          new_storage_fees: newStorageFees,
          new_total_fee: newTotalFee,
          status: storageStatus,
          fees_changed: feesChanged
        })

        updatedPackages++

      } catch (error) {
        console.error(`❌ Erreur traitement colis ${pkg.id}:`, error)
        continue
      }
    }

    // Envoyer les notifications pour les nouveaux frais
    let notificationsSent = 0
    for (const notification of notificationsToSend) {
      try {
        const emailData = {
          to: notification.email,
          subject: '⚠️ Frais de stockage appliqués - ReExpressTrack',
          template: 'storage_fees_applied',
          data: {
            client_name: notification.clientName,
            tracking_number: notification.trackingNumber,
            days_stored: notification.daysStored,
            free_days: notification.freeStorageDays,
            chargeable_days: notification.chargeableDays,
            storage_fees: notification.newStorageFees.toFixed(2),
            total_amount: notification.newTotalFee.toFixed(2),
            subscription_type: notification.subscriptionType,
            dashboard_link: `${Deno.env.get('FRONTEND_URL') || 'https://reexpresstrack.com'}/dashboard`,
            message: `Votre colis ${notification.trackingNumber} est stocké depuis ${notification.daysStored} jours. 
                     Avec votre abonnement ${notification.subscriptionType === 'free' ? 'Gratuit' : 'Premium'}, 
                     vous bénéficiez de ${notification.freeStorageDays} jours gratuits. 
                     Des frais de stockage de ${notification.newStorageFees.toFixed(2)}€ 
                     (${notification.chargeableDays} jours × 1€) ont été ajoutés à votre devis.`
          }
        }

        const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
          body: emailData
        })

        if (emailError) {
          console.error('❌ Erreur envoi notification:', emailError)
        } else {
          console.log(`✅ Notification envoyée à ${notification.email}`)
          notificationsSent++
        }
      } catch (emailError) {
        console.error('❌ Erreur notification:', emailError)
      }
    }

    const summary = {
      success: true,
      message: `Calcul automatique terminé: ${updatedPackages} colis traités`,
      statistics: {
        total_packages_processed: updatedPackages,
        packages_with_new_fees: packagesWithNewFees,
        notifications_sent: notificationsSent,
        free_storage_packages: results.filter(r => r.status === 'free').length,
        charged_storage_packages: results.filter(r => r.status === 'charged').length
      },
      details: results,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Résumé du calcul automatique:', summary.statistics)

    return new Response(
      JSON.stringify(summary),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Erreur calcul automatique frais stockage:', error)
    
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

// Export pour usage programmatique
export default serve