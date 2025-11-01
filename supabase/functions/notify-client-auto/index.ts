import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = 're_7W3cmAd9_KKN1DuaZY2CcsmPRGCTTdEbs';

serve(async (req) => {
  try {
    const { packageId, notificationType, customMessage } = await req.json();

    console.log('🚀 Début de la notification automatique');
    console.log('📦 Package ID:', packageId);
    console.log('📧 Type:', notificationType);
    console.log('💬 Message:', customMessage);

    // Initialiser Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1️⃣ Récupérer les informations du colis
    console.log('📦 Récupération du colis...');
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      console.error('❌ Erreur récupération colis:', packageError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Colis introuvable' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Colis trouvé:', packageData.tracking_number);
    console.log('👤 User ID:', packageData.user_id);

    // 2️⃣ Récupérer le profil du client
    console.log('📋 Récupération du profil client...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', packageData.user_id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erreur récupération profil: ${profileError.message}` 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!profile || !profile.email) {
      console.error('❌ Email du client introuvable');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email du client introuvable' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Profil trouvé:', profile.email);

    // 3️⃣ Préparer le contenu de l'email
    const emailContent = getEmailContent(notificationType, packageData, customMessage);

    // 4️⃣ Envoyer l'email via Resend
    console.log('📧 Envoi de l\'email via Resend...');
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ReExpressTrack <onboarding@resend.dev>',
        to: [profile.email],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('❌ Erreur Resend:', emailResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erreur envoi email: ${emailResult.message || 'Erreur inconnue'}` 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Email envoyé avec succès:', emailResult.id);

    // 5️⃣ Enregistrer la notification en base de données
    console.log('💾 Enregistrement de la notification...');
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: packageData.user_id,
        package_id: packageId,
        type: notificationType,
        message: customMessage || emailContent.subject,
        read: false,
      });

    if (notifError) {
      console.error('⚠️ Erreur enregistrement notification:', notifError);
    } else {
      console.log('✅ Notification enregistrée');
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipient: profile.email,
        emailId: emailResult.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Erreur globale:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur inconnue' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function getEmailContent(type: string, packageData: any, customMessage?: string) {
  const baseUrl = 'https://reexpresstrack.com';
  const trackingUrl = `${baseUrl}/suivi`;
  const dashboardUrl = `${baseUrl}/dashboard`;

  const templates: Record<string, any> = {
    package_received: {
      subject: '📦 Votre colis a été reçu !',
      text: `Bonjour,\n\nNous avons bien reçu votre colis (${packageData.tracking_number}).\n\nVous pouvez suivre son statut sur votre tableau de bord.\n\nCordialement,\nL'équipe ReExpressTrack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📦 Colis Reçu</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Nous avons bien reçu votre colis dans notre entrepôt.
                      </p>
                      <div style="background-color: #f8f9fa; border-left: 4px solid #14B8A6; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                        <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">${packageData.tracking_number}</p>
                      </div>
                      ${customMessage ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 4px;">${customMessage}</p>` : ''}
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #14B8A6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Voir mon tableau de bord</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #666; font-size: 12px; margin: 0;">© 2024 ReExpressTrack - Tous droits réservés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    },
    quote_ready: {
      subject: '💰 Votre devis est prêt !',
      text: `Bonjour,\n\nVotre devis pour le colis ${packageData.tracking_number} est maintenant disponible.\n\nConsultez-le sur votre tableau de bord.\n\nCordialement,\nL'équipe ReExpressTrack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💰 Devis Prêt</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Votre devis est maintenant disponible et prêt à être consulté.
                      </p>
                      <div style="background-color: #f8f9fa; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                        <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">${packageData.tracking_number}</p>
                      </div>
                      ${customMessage ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 4px;">${customMessage}</p>` : ''}
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #3B82F6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Consulter mon devis</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #666; font-size: 12px; margin: 0;">© 2024 ReExpressTrack - Tous droits réservés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    },
    package_shipped: {
      subject: '🚚 Votre colis a été expédié !',
      text: `Bonjour,\n\nVotre colis ${packageData.tracking_number} a été expédié.\n\nSuivez son acheminement en temps réel.\n\nCordialement,\nL'équipe ReExpressTrack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚚 Colis Expédié</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Bonne nouvelle ! Votre colis a été expédié et est en route vers sa destination.
                      </p>
                      <div style="background-color: #f8f9fa; border-left: 4px solid #8B5CF6; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                        <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">${packageData.tracking_number}</p>
                      </div>
                      ${customMessage ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 4px;">${customMessage}</p>` : ''}
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${trackingUrl}" style="display: inline-block; background-color: #8B5CF6; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Suivre mon colis</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #666; font-size: 12px; margin: 0;">© 2024 ReExpressTrack - Tous droits réservés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    },
    payment_confirmed: {
      subject: '✅ Paiement confirmé',
      text: `Bonjour,\n\nVotre paiement pour le colis ${packageData.tracking_number} a été confirmé.\n\nMerci pour votre confiance.\n\nCordialement,\nL'équipe ReExpressTrack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Paiement Confirmé</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Nous avons bien reçu votre paiement. Merci pour votre confiance !
                      </p>
                      <div style="background-color: #f8f9fa; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                        <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">${packageData.tracking_number}</p>
                      </div>
                      ${customMessage ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 4px;">${customMessage}</p>` : ''}
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #10B981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Voir mon tableau de bord</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #666; font-size: 12px; margin: 0;">© 2024 ReExpressTrack - Tous droits réservés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    },
    storage_reminder: {
      subject: '⏰ Rappel : Frais de stockage',
      text: `Bonjour,\n\nVotre colis ${packageData.tracking_number} est en stockage.\n\nConsultez les détails sur votre tableau de bord.\n\nCordialement,\nL'équipe ReExpressTrack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⏰ Rappel Stockage</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Votre colis est actuellement en stockage dans notre entrepôt.
                      </p>
                      <div style="background-color: #f8f9fa; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                        <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">${packageData.tracking_number}</p>
                      </div>
                      ${customMessage ? `<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 15px; background-color: #fff8e1; border-radius: 4px;">${customMessage}</p>` : ''}
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #F59E0B; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Voir les détails</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #666; font-size: 12px; margin: 0;">© 2024 ReExpressTrack - Tous droits réservés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    },
    custom: {
      subject: customMessage || 'Notification ReExpressTrack',
      text: `Bonjour,\n\n${customMessage || 'Vous avez une nouvelle notification concernant votre colis.'}\n\nNuméro de suivi: ${packageData.tracking_number}\n\nCordialement,\nL'équipe ReExpressTrack`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📬 Notification</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        ${customMessage || 'Vous avez une nouvelle notification concernant votre colis.'}
                      </p>
                      <div style="background-color: #f8f9fa; border-left: 4px solid #6366F1; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">Numéro de suivi</p>
                        <p style="margin: 5px 0 0 0; color: #333; font-size: 18px; font-weight: bold;">${packageData.tracking_number}</p>
                      </div>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardUrl}" style="display: inline-block; background-color: #6366F1; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Voir mon tableau de bord</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #666; font-size: 12px; margin: 0;">© 2024 ReExpressTrack - Tous droits réservés</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    },
  };

  return templates[type] || templates.custom;
}