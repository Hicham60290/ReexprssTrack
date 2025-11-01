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
    console.log('🚀 Envoi automatique des options de transporteur')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Configuration Supabase manquante')
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration Supabase manquante' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    let requestData
    try {
      requestData = await req.json()
      console.log('📥 Données reçues:', JSON.stringify(requestData, null, 2))
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError)
      return new Response(
        JSON.stringify({ success: false, error: 'Données JSON invalides' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!requestData.packageId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Package ID requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Récupérer les données du colis et du client
    const { data: packageData, error: packageError } = await supabaseClient
      .from('packages')
      .select(`
        *,
        profiles:user_id (
          email,
          first_name,
          last_name,
          phone,
          subscription_type
        )
      `)
      .eq('id', requestData.packageId)
      .single()

    if (packageError || !packageData) {
      console.error('❌ Colis non trouvé:', packageError)
      return new Response(
        JSON.stringify({ success: false, error: 'Colis non trouvé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const clientData = packageData.profiles || {}
    console.log('✅ Colis récupéré:', packageData.tracking_number)

    // Définir les options de transporteur avec tarifs réalistes
    const carrierOptions = [
      {
        id: 'colissimo',
        name: 'Colissimo',
        description: 'Livraison standard économique',
        price: 12.50,
        estimatedDays: '3-5 jours ouvrés',
        features: ['Suivi en ligne', 'Assurance incluse', 'Point relais disponible', 'Service client français']
      },
      {
        id: 'chronopost',
        name: 'Chronopost',
        description: 'Livraison express rapide',
        price: 18.90,
        estimatedDays: '1-2 jours ouvrés',
        features: ['Livraison express', 'Suivi temps réel', 'Assurance renforcée', 'Livraison samedi possible']
      },
      {
        id: 'ups',
        name: 'UPS Standard',
        description: 'Livraison internationale fiable',
        price: 22.00,
        estimatedDays: '2-4 jours ouvrés',
        features: ['Réseau international', 'Suivi détaillé', 'Assurance premium', 'Service client 24/7']
      },
      {
        id: 'dhl',
        name: 'DHL Express',
        description: 'Livraison express internationale premium',
        price: 28.50,
        estimatedDays: '1-3 jours ouvrés',
        features: ['Livraison ultra-rapide', 'Suivi en temps réel', 'Assurance maximale', 'Livraison samedi incluse']
      }
    ]

    // Calculer les frais de base
    const baseStorageFee = Math.max(0, parseFloat(packageData.storage_fee) || 0)
    const handlingFee = 2.50 // Frais de manutention fixes

    const quoteNumber = `DEV-${packageData.tracking_number}-${Date.now().toString().slice(-6)}`
    console.log('📄 Numéro devis généré:', quoteNumber)

    // Créer le devis principal en base avec statut "en attente de sélection transporteur"
    const { data: quoteData, error: quoteInsertError } = await supabaseClient
      .from('quotes')
      .insert({
        quote_number: quoteNumber,
        package_id: requestData.packageId,
        user_id: packageData.user_id,
        subtotal: baseStorageFee + handlingFee, // Sans frais de transport pour l'instant
        tax_rate: 20,
        tax_amount: (baseStorageFee + handlingFee) * 0.20,
        total: (baseStorageFee + handlingFee) * 1.20,
        status: 'pending_carrier_selection',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (quoteInsertError) {
      console.error('❌ Erreur sauvegarde devis:', quoteInsertError)
      throw new Error('Erreur lors de la création du devis')
    }

    console.log('✅ Devis créé avec ID:', quoteData.id)

    // Générer l'email HTML pour le client avec toutes les options
    const emailHtml = generateCarrierSelectionEmail(quoteData, packageData, clientData, carrierOptions, baseStorageFee, handlingFee)

    // Envoyer l'email au client avec les options de transporteur
    const { error: emailError } = await supabaseClient.functions.invoke('send-notification-email', {
      body: {
        to: clientData.email,
        subject: `📦 Votre colis ${packageData.tracking_number} - Choisissez votre transporteur`,
        html: emailHtml,
        type: 'carrier_selection'
      }
    })

    if (emailError) {
      console.warn('⚠️ Erreur envoi email:', emailError)
      throw new Error('Erreur lors de l\'envoi de l\'email')
    }

    console.log('✅ Email avec options transporteur envoyé à:', clientData.email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Options de transporteur envoyées avec succès',
        quoteNumber: quoteNumber,
        quoteId: quoteData.id,
        carrierOptions: carrierOptions.map(c => ({
          id: c.id,
          name: c.name,
          price: c.price,
          estimatedDays: c.estimatedDays
        })),
        baseAmount: baseStorageFee + handlingFee,
        clientEmail: clientData.email,
        totalOptions: carrierOptions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 Erreur envoi options transporteur:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur interne du serveur'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function generateCarrierSelectionEmail(quoteData: any, packageData: any, clientData: any, carrierOptions: any[], baseStorageFee: number, handlingFee: number) {
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || 'https://your-domain.com'
  
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Choisissez votre transporteur - ${quoteData.quote_number}</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
          .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
          }
          .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
          }
          .header h1 {
              font-size: 24px;
              margin-bottom: 8px;
              font-weight: 600;
          }
          .quote-number {
              background: rgba(255, 255, 255, 0.2);
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              font-weight: 500;
          }
          .content {
              padding: 30px;
          }
          .package-info {
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 30px;
              border-left: 4px solid #667eea;
          }
          .package-info h3 {
              color: #374151;
              margin-bottom: 15px;
              font-size: 18px;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              font-size: 14px;
          }
          .info-item {
              display: flex;
              flex-direction: column;
          }
          .info-label {
              font-weight: 600;
              color: #6b7280;
              margin-bottom: 2px;
          }
          .info-value {
              color: #374151;
              font-weight: 500;
          }
          .base-costs {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 30px;
              border-left: 4px solid #f59e0b;
          }
          .base-costs h4 {
              color: #92400e;
              margin-bottom: 15px;
              font-size: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .cost-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
          }
          .cost-total {
              border-top: 2px solid #f59e0b;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
              font-size: 16px;
              color: #92400e;
          }
          .carriers-section h3 {
              color: #374151;
              margin-bottom: 20px;
              font-size: 20px;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
          }
          .carrier-option {
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 20px;
              transition: all 0.3s ease;
              background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
          }
          .carrier-option:hover {
              border-color: #667eea;
              box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.1), 0 4px 6px -2px rgba(102, 126, 234, 0.05);
              transform: translateY(-2px);
          }
          .carrier-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
          }
          .carrier-name {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .carrier-price {
              font-size: 18px;
              font-weight: bold;
              color: #667eea;
              background: #eef2ff;
              padding: 8px 12px;
              border-radius: 8px;
          }
          .carrier-description {
              color: #6b7280;
              margin-bottom: 12px;
              font-size: 14px;
          }
          .delivery-time {
              background: #f3f4f6;
              padding: 8px 12px;
              border-radius: 6px;
              margin-bottom: 15px;
              font-size: 14px;
              font-weight: 500;
              color: #374151;
          }
          .carrier-features {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-bottom: 20px;
          }
          .feature-tag {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              color: #1e40af;
              padding: 6px 10px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              border: 1px solid #93c5fd;
          }
          .price-breakdown {
              background: #f8fafc;
              padding: 16px;
              border-radius: 10px;
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
          }
          .price-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              font-size: 14px;
          }
          .price-total {
              border-top: 2px solid #667eea;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
              font-size: 18px;
              color: #667eea;
          }
          .select-button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 16px 24px;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              width: 100%;
              text-decoration: none;
              display: inline-block;
              text-align: center;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
          }
          .select-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
          }
          .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
          }
          .footer-content {
              color: #6b7280;
              font-size: 14px;
              line-height: 1.6;
          }
          .footer-content strong {
              color: #374151;
          }
          .security-badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #ecfdf5;
              color: #065f46;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 500;
              margin-top: 15px;
          }
          @media (max-width: 600px) {
              .container {
                  margin: 10px;
                  border-radius: 12px;
              }
              .content {
                  padding: 20px;
              }
              .info-grid {
                  grid-template-columns: 1fr;
              }
              .carrier-header {
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 10px;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">
                  📦 ReExpressTrack
              </div>
              <h1>Choisissez votre transporteur</h1>
              <div class="quote-number">Devis N° ${quoteData.quote_number}</div>
          </div>

          <div class="content">
              <div class="package-info">
                  <h3>📦 Informations de votre colis</h3>
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">Numéro de suivi</span>
                          <span class="info-value">${packageData.tracking_number}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Poids</span>
                          <span class="info-value">${packageData.weight ? packageData.weight + ' kg' : 'Non renseigné'}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Destination</span>
                          <span class="info-value">${packageData.destination || 'Non renseignée'}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Description</span>
                          <span class="info-value">${packageData.description || 'Non renseignée'}</span>
                      </div>
                  </div>
              </div>

              <div class="base-costs">
                  <h4>💰 Frais de base</h4>
                  <div class="cost-line">
                      <span>Frais de stockage:</span>
                      <span>${baseStorageFee.toFixed(2)} €</span>
                  </div>
                  <div class="cost-line">
                      <span>Frais de manutention:</span>
                      <span>${handlingFee.toFixed(2)} €</span>
                  </div>
                  <div class="cost-line cost-total">
                      <span>Sous-total HT:</span>
                      <span>${(baseStorageFee + handlingFee).toFixed(2)} €</span>
                  </div>
              </div>

              <div class="carriers-section">
                  <h3>🚚 Sélectionnez votre option de livraison</h3>

                  ${carrierOptions.map(carrier => {
                    const totalHT = baseStorageFee + handlingFee + carrier.price
                    const tva = totalHT * 0.20
                    const totalTTC = totalHT + tva
                    
                    return `
                    <div class="carrier-option">
                        <div class="carrier-header">
                            <div class="carrier-name">
                                🚛 ${carrier.name}
                            </div>
                            <div class="carrier-price">+${carrier.price.toFixed(2)} €</div>
                        </div>
                        <div class="carrier-description">${carrier.description}</div>
                        <div class="delivery-time">
                            ⏱️ Délai estimé: ${carrier.estimatedDays}
                        </div>
                        <div class="carrier-features">
                            ${carrier.features.map(feature => `<span class="feature-tag">✓ ${feature}</span>`).join('')}
                        </div>
                        <div class="price-breakdown">
                            <div class="price-line">
                                <span>Frais de base:</span>
                                <span>${(baseStorageFee + handlingFee).toFixed(2)} €</span>
                            </div>
                            <div class="price-line">
                                <span>Transport ${carrier.name}:</span>
                                <span>${carrier.price.toFixed(2)} €</span>
                            </div>
                            <div class="price-line">
                                <span>Sous-total HT:</span>
                                <span>${totalHT.toFixed(2)} €</span>
                            </div>
                            <div class="price-line">
                                <span>TVA (20%):</span>
                                <span>${tva.toFixed(2)} €</span>
                            </div>
                            <div class="price-line price-total">
                                <span>Total TTC:</span>
                                <span>${totalTTC.toFixed(2)} €</span>
                            </div>
                        </div>
                        <a href="${baseUrl}/quote-payment?quoteId=${quoteData.id}&carrierId=${carrier.id}" class="select-button">
                            🛒 Choisir ${carrier.name} - ${totalTTC.toFixed(2)} € TTC
                        </a>
                    </div>
                    `
                  }).join('')}
              </div>
          </div>

          <div class="footer">
              <div class="footer-content">
                  <p><strong>🔒 Paiement 100% sécurisé</strong></p>
                  <p>Vos données sont protégées par cryptage SSL</p>
                  <div class="security-badge">
                      🛡️ Paiement sécurisé par Stripe
                  </div>
                  <p style="margin-top: 20px;"><strong>Questions ?</strong> Contactez-nous à contact@reexpresstrack.com</p>
                  <p>Ce devis est valable 30 jours. Merci de votre confiance !</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `
}