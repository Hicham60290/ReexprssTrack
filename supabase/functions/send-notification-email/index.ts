import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

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

    const { templateType, userId, recipientEmail, variables } = await req.json()

    // Récupérer les informations utilisateur si nécessaire
    let userProfile = null
    if (userId) {
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      userProfile = data
    }

    // Configuration SMTP avec la bonne adresse email
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.hostinger.com',
        port: 587,
        tls: true,
        auth: {
          username: 'contact@reexpresstrack.com',
          password: '156530Hr@#@#',
        },
      },
    })

    let subject = ''
    let htmlContent = ''
    let textContent = ''

    // Templates d'emails selon le type
    switch (templateType) {
      case 'registration_confirmation':
        subject = '🎉 Bienvenue chez ReexpresseTrack !'
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Bienvenue chez ReexpresseTrack</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .welcome-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .feature { background: white; padding: 15px; border-radius: 6px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Bienvenue chez ReexpresseTrack !</h1>
                <p>Votre compte a été créé avec succès</p>
              </div>
              
              <div class="content">
                <div class="welcome-box">
                  <h2>Bonjour ${userProfile?.first_name || 'et bienvenue'} !</h2>
                  <p>Félicitations ! Votre compte ReexpresseTrack est maintenant actif. Vous pouvez désormais profiter de tous nos services d'expédition depuis la France vers les DOM-TOM.</p>
                </div>

                <h3>🚀 Ce que vous pouvez faire maintenant :</h3>
                <div class="features">
                  <div class="feature">
                    <strong>📦 Recevoir vos colis</strong><br>
                    <small>Utilisez votre adresse française</small>
                  </div>
                  <div class="feature">
                    <strong>📊 Suivre vos expéditions</strong><br>
                    <small>En temps réel</small>
                  </div>
                  <div class="feature">
                    <strong>🔄 Gérer vos retours</strong><br>
                    <small>Simplement et rapidement</small>
                  </div>
                  <div class="feature">
                    <strong>💰 Calculer vos frais</strong><br>
                    <small>Transparence totale</small>
                  </div>
                </div>

                <div style="text-align: center;">
                  <a href="https://reexpressetrack.com/dashboard" class="cta-button">
                    Accéder à mon tableau de bord
                  </a>
                </div>

                <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <strong>💡 Conseil :</strong> Ajoutez contact@reexpresstrack.com à vos contacts pour ne manquer aucune notification importante.
                </div>
              </div>
            </div>
          </body>
          </html>
        `
        textContent = `Bienvenue chez ReexpresseTrack !

Bonjour ${userProfile?.first_name || ''} !

Félicitations ! Votre compte ReexpresseTrack est maintenant actif.

Vous pouvez maintenant :
- Recevoir vos colis avec votre adresse française
- Suivre vos expéditions en temps réel  
- Gérer vos retours facilement
- Calculer vos frais en toute transparence

Accédez à votre tableau de bord : https://reexpressetrack.com/dashboard

L'équipe ReexpresseTrack`
        break

      case 'password_reset':
        subject = '🔐 Réinitialisation de votre mot de passe - ReexpresseTrack'
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Réinitialisation mot de passe</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #EF4444, #F59E0B); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .reset-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .cta-button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .security-info { background: #FEF2F2; padding: 15px; border-radius: 6px; border-left: 4px solid #EF4444; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Réinitialisation de mot de passe</h1>
                <p>Demande de réinitialisation reçue</p>
              </div>
              
              <div class="content">
                <div class="reset-box">
                  <h2>Réinitialiser votre mot de passe</h2>
                  <p>Vous avez demandé la réinitialisation de votre mot de passe ReexpresseTrack.</p>
                  <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                  
                  <a href="${variables?.resetLink || '#'}" class="cta-button">
                    Réinitialiser mon mot de passe
                  </a>
                  
                  <p><small>Ce lien expire dans 24 heures pour votre sécurité.</small></p>
                </div>

                <div class="security-info">
                  <strong>🛡️ Sécurité :</strong>
                  <ul>
                    <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                    <li>Ne partagez jamais ce lien avec personne</li>
                    <li>Choisissez un mot de passe fort et unique</li>
                  </ul>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
        textContent = `Réinitialisation de mot de passe - ReexpresseTrack

Vous avez demandé la réinitialisation de votre mot de passe.

Lien de réinitialisation : ${variables?.resetLink || 'Lien non disponible'}

Ce lien expire dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

L'équipe ReexpresseTrack`
        break

      case 'subscription_confirmation':
        subject = '✅ Confirmation d\'abonnement - ReexpresseTrack'
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Confirmation d'abonnement</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10B981, #3B82F6); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .subscription-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .price-box { background: #10B981; color: white; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0; }
              .benefits { background: #ECFDF5; padding: 20px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Abonnement confirmé !</h1>
                <p>Merci pour votre confiance</p>
              </div>
              
              <div class="content">
                <div class="subscription-box">
                  <h2>Votre abonnement ${variables?.planName || 'Premium'} est actif</h2>
                  <p>Félicitations ! Votre abonnement ReexpresseTrack a été confirmé et est maintenant actif.</p>
                  
                  <div class="price-box">
                    <h3>${variables?.amount || '29,99'}€/${variables?.interval || 'mois'}</h3>
                    <p>Facturation automatique</p>
                  </div>
                </div>

                <div class="benefits">
                  <h3>🎉 Vos avantages inclus :</h3>
                  <ul>
                    <li>✅ Tarifs préférentiels sur toutes les expéditions</li>
                    <li>✅ Stockage gratuit prolongé (jusqu'à 60 jours)</li>
                    <li>✅ Support prioritaire 7j/7</li>
                    <li>✅ Assurance colis incluse</li>
                    <li>✅ Groupage automatique des colis</li>
                    <li>✅ Notifications SMS en temps réel</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                  <p>Prochaine facturation : ${variables?.nextBilling || 'Dans 1 mois'}</p>
                  <p><small>Vous pouvez gérer votre abonnement dans votre tableau de bord.</small></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
        textContent = `Abonnement confirmé - ReexpresseTrack

Votre abonnement ${variables?.planName || 'Premium'} est maintenant actif !

Prix : ${variables?.amount || '29,99'}€/${variables?.interval || 'mois'}
Prochaine facturation : ${variables?.nextBilling || 'Dans 1 mois'}

Vos avantages :
- Tarifs préférentiels 
- Stockage gratuit prolongé
- Support prioritaire 7j/7
- Assurance incluse
- Groupage automatique
- Notifications SMS

Gérez votre abonnement : https://reexpressetrack.com/abonnement

L'équipe ReexpresseTrack`
        break

      case 'package_received':
        subject = '📦 Colis reçu dans notre entrepôt - ReexpresseTrack'
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Colis reçu</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .package-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .status-badge { display: inline-block; background: #10B981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
              .cta-button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Colis reçu !</h1>
                <p>Votre colis est arrivé dans notre entrepôt</p>
              </div>
              
              <div class="content">
                <div class="package-box">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2>Suivi : ${variables?.tracking_number || 'N/A'}</h2>
                    <span class="status-badge">REÇU</span>
                  </div>
                  
                  <p><strong>Description :</strong> ${variables?.description || 'Colis reçu'}</p>
                  <p><strong>Expéditeur :</strong> ${variables?.sender_name || 'Non spécifié'}</p>
                  <p><strong>Date de réception :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  
                  ${variables?.photos_count ? `<p><strong>Photos :</strong> ${variables.photos_count} photo(s) disponible(s)</p>` : ''}
                </div>

                <div style="background: #EFF6FF; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h3>🎯 Prochaines étapes :</h3>
                  <ol>
                    <li>Votre colis est maintenant stocké gratuitement (7 jours)</li>
                    <li>Consultez les photos et détails dans votre tableau de bord</li>
                    <li>Lancez l'expédition vers votre destination DOM-TOM</li>
                  </ol>
                </div>

                <div style="text-align: center;">
                  <a href="https://reexpressetrack.com/packages" class="cta-button">
                    Voir mon colis
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
        textContent = `Colis reçu - ReexpresseTrack

Votre colis est arrivé dans notre entrepôt français !

Numéro de suivi : ${variables?.tracking_number || 'N/A'}
Description : ${variables?.description || 'Colis reçu'}
Expéditeur : ${variables?.sender_name || 'Non spécifié'}
Date de réception : ${new Date().toLocaleDateString('fr-FR')}

Prochaines étapes :
1. Stockage gratuit (7 jours)
2. Consultez photos et détails 
3. Lancez l'expédition DOM-TOM

Voir mon colis : https://reexpressetrack.com/packages

L'équipe ReexpresseTrack`
        break

      case 'package_shipped':
        subject = `🚚 Colis expédié vers ${variables?.destination || "votre destination"} - ReexpresseTrack`
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Colis expédié</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F59E0B, #EF4444); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .shipping-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .status-badge { display: inline-block; background: #F59E0B; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
              .tracking-box { background: #FEF3C7; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0; }
              .cta-button { display: inline-block; background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚚 Colis en route !</h1>
                <p>Votre colis a été expédié</p>
              </div>
              
              <div class="content">
                <div class="shipping-box">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h2>Suivi : ${variables?.tracking_number || 'N/A'}</h2>
                    <span class="status-badge">EXPÉDIÉ</span>
                  </div>
                  
                  <p><strong>Destination :</strong> ${variables?.destination || 'DOM-TOM'}</p>
                  <p><strong>Transporteur :</strong> ${variables?.carrier || 'La Poste Colissimo'}</p>
                  <p><strong>Date d'expédition :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  <p><strong>Délai estimé :</strong> ${variables?.estimated_delivery || '5-8 jours ouvrés'}</p>
                  
                  ${variables?.carrier_tracking ? `
                  <div class="tracking-box">
                    <strong>🔍 Numéro de suivi transporteur :</strong><br>
                    <code style="font-size: 16px; font-weight: bold;">${variables.carrier_tracking}</code>
                  </div>
                  ` : ''}
                </div>

                <div style="background: #DBEAFE; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h3>📍 Suivez votre colis :</h3>
                  <p>Votre colis est maintenant pris en charge par ${variables?.carrier || 'La Poste'}. Vous pouvez suivre sa progression en temps réel.</p>
                </div>

                <div style="text-align: center;">
                  <a href="https://reexpressetrack.com/suivi" class="cta-button">
                    Suivre mon colis
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
        textContent = `Colis expédié - ReexpresseTrack

Votre colis est en route vers ${variables?.destination || 'votre destination'} !

Numéro de suivi : ${variables?.tracking_number || 'N/A'}
Transporteur : ${variables?.carrier || 'La Poste Colissimo'}
Date d'expédition : ${new Date().toLocaleDateString('fr-FR')}
Délai estimé : ${variables?.estimated_delivery || '5-8 jours ouvrés'}

${variables?.carrier_tracking ? `Suivi transporteur : ${variables.carrier_tracking}` : ''}

Suivez votre colis : https://reexpressetrack.com/suivi

L'équipe ReexpresseTrack`
        break

      case 'package_photo_uploaded':
        subject = '📸 Nouvelles photos de votre colis - ReexpresseTrack'
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Photos colis ajoutées</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #06B6D4, #8B5CF6); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .photo-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .cta-button { display: inline-block; background: #06B6D4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📸 Photos disponibles !</h1>
                <p>Nouvelles photos de votre colis</p>
              </div>
              
              <div class="content">
                <div class="photo-box">
                  <h2>Colis : ${variables?.tracking_number || 'N/A'}</h2>
                  <p>De nouvelles photos ont été ajoutées à votre colis.</p>
                  <p><strong>Nombre total de photos :</strong> ${variables?.photo_count || '1'}</p>
                  <p><strong>Description :</strong> ${variables?.description || 'Photo du colis reçu'}</p>
                </div>

                <div style="background: #F0F9FF; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <h3>👀 Consultez vos photos :</h3>
                  <p>Accédez à votre tableau de bord pour voir toutes les photos de votre colis en haute résolution.</p>
                </div>

                <div style="text-align: center;">
                  <a href="https://reexpressetrack.com/packages" class="cta-button">
                    Voir les photos
                  </a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
        textContent = `Photos ajoutées - ReexpresseTrack

De nouvelles photos ont été ajoutées à votre colis ${variables?.tracking_number || 'N/A'}.

Nombre total de photos : ${variables?.photo_count || '1'}
Description : ${variables?.description || 'Photo du colis reçu'}

Voir les photos : https://reexpressetrack.com/packages

L'équipe ReexpresseTrack`
        break

      default:
        throw new Error(`Template type "${templateType}" not found`)
    }

    // Envoi de l'email
    await client.send({
      from: 'ReexpresseTrack <contact@reexpresstrack.com>',
      to: recipientEmail,
      replyTo: 'contact@reexpresstrack.com',
      subject: subject,
      content: textContent,
      html: htmlContent,
    })

    await client.close()

    console.log(`Email "${templateType}" envoyé avec succès à ${recipientEmail}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de notification envoyé avec succès',
        templateType: templateType
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur envoi email notification:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})