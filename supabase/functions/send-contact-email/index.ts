import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Lire les données JSON au lieu de FormData
    const requestData = await req.json()
    
    const name = requestData.name as string
    const email = requestData.email as string
    const subject = requestData.subject as string
    const category = requestData.category as string
    const message = requestData.message as string
    const urgent = requestData.urgent as string

    if (!name || !email || !subject || !message) {
      throw new Error('Champs requis manquants')
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Format email invalide')
    }

    // Catégories en français
    const categoryLabels: { [key: string]: string } = {
      'general': 'Question générale',
      'shipping': 'Problème d\'expédition',
      'billing': 'Facturation',
      'technical': 'Problème technique',
      'partnership': 'Partenariat'
    }

    const categoryLabel = categoryLabels[category] || category

    // Création du contenu HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouveau message de contact - ReexpresseTrack</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #3B82F6; }
          .urgent { background-color: #FEF2F2; border-left-color: #EF4444; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 Nouveau message de contact</h1>
            <p>ReexpresseTrack - ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">👤 Nom complet :</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email :</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">📂 Catégorie :</div>
              <div class="value">${categoryLabel}</div>
            </div>
            
            <div class="field">
              <div class="label">📌 Sujet :</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="field">
              <div class="label">💬 Message :</div>
              <div class="value" style="white-space: pre-wrap;">${message}</div>
            </div>
            
            ${urgent === 'Oui' ? `
            <div class="field">
              <div class="label">⚡ Demande urgente :</div>
              <div class="value urgent">OUI - Cette demande nécessite une réponse prioritaire</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">🕒 Reçu le :</div>
              <div class="value">${new Date().toLocaleString('fr-FR')}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Message automatique depuis le formulaire de contact ReexpresseTrack</p>
            <p>Pour répondre, utilisez directement l'adresse : ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Contenu texte simple
    const textContent = `
Nouveau message de contact - ReexpresseTrack

Nom: ${name}
Email: ${email}
Catégorie: ${categoryLabel}
Sujet: ${subject}
${urgent === 'Oui' ? 'URGENT: Demande prioritaire\n' : ''}

Message:
${message}

Reçu le: ${new Date().toLocaleString('fr-FR')}
    `

    // Configuration SMTP avec les bons paramètres
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

    // Envoi de l'email vers contact@reexpresstrack.com
    await client.send({
      from: 'ReexpresseTrack <contact@reexpresstrack.com>',
      to: 'contact@reexpresstrack.com',
      replyTo: email,
      subject: `${urgent === 'Oui' ? '🚨 URGENT - ' : ''}Contact: ${subject}`,
      content: textContent,
      html: htmlContent,
    })

    await client.close()

    console.log('Email de contact envoyé avec succès vers contact@reexpresstrack.com')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Message envoyé avec succès' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur envoi email contact:', error)
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