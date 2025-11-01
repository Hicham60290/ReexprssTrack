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
    console.log('🚀 Début génération PDF devis')
    
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

    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ Token d\'authentification manquant')
      return new Response(
        JSON.stringify({ success: false, error: 'Token d\'authentification requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('❌ Token invalide:', authError)
      return new Response(
        JSON.stringify({ success: false, error: 'Token invalide' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Vérifier le rôle admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      console.error('❌ Accès non autorisé:', profileError)
      return new Response(
        JSON.stringify({ success: false, error: 'Accès administrateur requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

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

    // Gérer deux cas : avec packageId (colis existant) ou avec données directes (nouveau devis)
    let packageData, clientData

    if (requestData.packageId) {
      console.log('📦 Récupération colis existant:', requestData.packageId)
      
      // Cas 1: Colis existant - récupérer depuis la base
      const { data: existingPackage, error: packageError } = await supabaseClient
        .from('packages')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name,
            phone,
            delivery_address
          )
        `)
        .eq('id', requestData.packageId)
        .single()

      if (packageError || !existingPackage) {
        console.error('❌ Colis non trouvé:', packageError)
        return new Response(
          JSON.stringify({ success: false, error: 'Colis non trouvé' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      packageData = existingPackage
      clientData = existingPackage.profiles || {}
      console.log('✅ Colis récupéré:', packageData.tracking_number)
    } else {
      console.log('📝 Nouveau devis avec données directes')
      
      // Cas 2: Nouveau devis - utiliser les données fournies
      if (!requestData.client_name || !requestData.client_email || !requestData.tracking_number) {
        console.error('❌ Données manquantes pour nouveau devis')
        return new Response(
          JSON.stringify({ success: false, error: 'Données client, email et numéro de suivi requis' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Structurer les données pour correspondre au format attendu
      packageData = {
        tracking_number: requestData.tracking_number,
        weight: requestData.weight || null,
        dimensions: requestData.dimensions || null,
        destination: requestData.destination || null,
        storage_fee: parseFloat(requestData.storage_fee) || 5.00,
        shipping_fee: parseFloat(requestData.shipping_fee) || 15.00,
        total_amount: parseFloat(requestData.total_amount) || 0,
        description: requestData.content_description || '',
        status: 'received',
        declared_value: requestData.declared_value || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      }

      // Séparer le nom complet
      const nameParts = requestData.client_name.split(' ')
      clientData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: requestData.client_email,
        phone: requestData.client_phone || 'Non renseigné',
        delivery_address: requestData.destination || 'Non renseignée'
      }
    }

    // Calculer les frais avec validation
    const baseStorageFee = Math.max(0, parseFloat(packageData.storage_fee) || 5.00)
    const shippingFee = Math.max(0, parseFloat(packageData.shipping_fee) || 15.00)
    const handlingFee = 2.50
    const totalHT = baseStorageFee + shippingFee + handlingFee
    const tva = totalHT * 0.20
    const totalTTC = totalHT + tva

    console.log('💰 Calculs:', { baseStorageFee, shippingFee, handlingFee, totalHT, tva, totalTTC })

    const currentDate = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const quoteNumber = `DEV-${packageData.tracking_number}-${Date.now().toString().slice(-6)}`
    console.log('📄 Numéro devis généré:', quoteNumber)

    // Générer le HTML du devis
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Devis ${quoteNumber}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #2563eb;
            }
            .quote-info {
                text-align: right;
                color: #666;
            }
            .client-info, .package-info {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .client-info h3, .package-info h3 {
                color: #2563eb;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .info-item {
                display: flex;
                flex-direction: column;
            }
            .info-label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .info-value {
                color: #111827;
                font-size: 16px;
            }
            .services-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .services-table th {
                background: #2563eb;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
            }
            .services-table td {
                padding: 15px;
                border-bottom: 1px solid #e5e7eb;
            }
            .services-table tr:last-child td {
                border-bottom: none;
            }
            .price {
                text-align: right;
                font-weight: 600;
            }
            .total-section {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .total-final {
                border-top: 2px solid #2563eb;
                padding-top: 15px;
                margin-top: 15px;
                font-size: 20px;
                font-weight: bold;
                color: #2563eb;
            }
            .conditions {
                margin-top: 30px;
                padding: 20px;
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                border-radius: 4px;
            }
            .conditions h4 {
                color: #92400e;
                margin-top: 0;
            }
            .conditions ul {
                margin: 0;
                padding-left: 20px;
            }
            .conditions li {
                margin-bottom: 8px;
                color: #92400e;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #666;
                font-size: 14px;
            }
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                background: #dbeafe;
                color: #1e40af;
            }
            @media print {
                body { padding: 0; }
                .header { page-break-after: avoid; }
                .total-section { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">📦 ReExpressTrack</div>
            <div class="quote-info">
                <div><strong>DEVIS N° ${quoteNumber}</strong></div>
                <div>Date: ${currentDate}</div>
                <div>Validité: 30 jours</div>
            </div>
        </div>

        <div class="client-info">
            <h3>👤 Informations Client</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nom complet</span>
                    <span class="info-value">${clientData.first_name || ''} ${clientData.last_name || ''}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${clientData.email || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Téléphone</span>
                    <span class="info-value">${clientData.phone || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Destination</span>
                    <span class="info-value">${packageData.destination || clientData.delivery_address || 'Non renseignée'}</span>
                </div>
            </div>
        </div>

        <div class="package-info">
            <h3>📦 Informations Colis</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Numéro de suivi</span>
                    <span class="info-value">${packageData.tracking_number}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Statut</span>
                    <span class="info-value">
                        <span class="status-badge">${packageData.status === 'received' ? 'Reçu' : packageData.status === 'stored' ? 'Stocké' : packageData.status === 'shipped' ? 'Expédié' : 'En attente'}</span>
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Description</span>
                    <span class="info-value">${packageData.description || 'Aucune description'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Poids</span>
                    <span class="info-value">${packageData.weight ? packageData.weight + ' kg' : 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dimensions</span>
                    <span class="info-value">${packageData.dimensions || 'Non renseignées'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Valeur déclarée</span>
                    <span class="info-value">${packageData.declared_value ? packageData.declared_value + ' €' : 'Non déclarée'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Frais de stockage</span>
                    <span class="info-value">${packageData.storage_fee ? packageData.storage_fee + ' €' : 'Non calculés'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Frais d'expédition</span>
                    <span class="info-value">${packageData.shipping_fee ? packageData.shipping_fee + ' €' : 'Non calculés'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Créé le</span>
                    <span class="info-value">${new Date(packageData.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dernière modification</span>
                    <span class="info-value">${new Date(packageData.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>

        <table class="services-table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Quantité</th>
                    <th>Prix unitaire HT</th>
                    <th>Total HT</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Stockage</strong></td>
                    <td>Frais de stockage sécurisé du colis</td>
                    <td>1</td>
                    <td class="price">${baseStorageFee.toFixed(2)} €</td>
                    <td class="price">${baseStorageFee.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td><strong>Expédition</strong></td>
                    <td>Frais d'expédition vers destination</td>
                    <td>1</td>
                    <td class="price">${shippingFee.toFixed(2)} €</td>
                    <td class="price">${shippingFee.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td><strong>Manutention</strong></td>
                    <td>Frais de traitement et préparation</td>
                    <td>1</td>
                    <td class="price">${handlingFee.toFixed(2)} €</td>
                    <td class="price">${handlingFee.toFixed(2)} €</td>
                </tr>
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Sous-total HT:</span>
                <span>${totalHT.toFixed(2)} €</span>
            </div>
            <div class="total-row">
                <span>TVA (20%):</span>
                <span>${tva.toFixed(2)} €</span>
            </div>
            <div class="total-row total-final">
                <span>TOTAL TTC:</span>
                <span>${totalTTC.toFixed(2)} €</span>
            </div>
        </div>

        <div class="conditions">
            <h4>🔔 Conditions et modalités</h4>
            <ul>
                <li><strong>Validité:</strong> Ce devis est valable 30 jours à compter de sa date d'émission</li>
                <li><strong>Paiement:</strong> Règlement par carte bancaire via notre plateforme sécurisée</li>
                <li><strong>Expédition:</strong> Le colis sera expédié sous 48h après réception du paiement</li>
                <li><strong>Assurance:</strong> Tous nos colis sont assurés jusqu'à leur valeur déclarée</li>
                <li><strong>Suivi:</strong> Un numéro de suivi vous sera communiqué par email</li>
                <li><strong>Réclamations:</strong> Toute réclamation doit être formulée dans les 48h suivant la réception</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>ReExpressTrack</strong> - Service de réexpédition professionnel</p>
            <p>Email: contact@reexpresstrack.com | Téléphone: +33 1 XX XX XX XX</p>
            <p>Ce devis a été généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
    </body>
    </html>
    `

    // Sauvegarder le devis dans la base de données seulement si c'est un colis existant
    if (requestData.packageId) {
      try {
        console.log('💾 Sauvegarde du devis en base...')
        
        // D'abord insérer le devis principal
        const { data: quoteData, error: quoteInsertError } = await supabaseClient
          .from('quotes')
          .insert({
            quote_number: quoteNumber,
            package_id: requestData.packageId,
            user_id: packageData.user_id,
            subtotal: totalHT,
            tax_rate: 20,
            tax_amount: tva,
            total: totalTTC,
            status: 'pending',
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (quoteInsertError) {
          console.error('❌ Erreur sauvegarde devis:', quoteInsertError)
        } else {
          console.log('✅ Devis sauvegardé:', quoteData.id)
          
          // Ensuite insérer les items du devis
          const quoteItems = [
            {
              quote_id: quoteData.id,
              description: 'Frais de stockage sécurisé',
              quantity: 1,
              unit_price: baseStorageFee,
              amount: baseStorageFee
            },
            {
              quote_id: quoteData.id,
              description: 'Frais d\'expédition',
              quantity: 1,
              unit_price: shippingFee,
              amount: shippingFee
            },
            {
              quote_id: quoteData.id,
              description: 'Frais de manutention',
              quantity: 1,
              unit_price: handlingFee,
              amount: handlingFee
            }
          ]

          const { error: itemsInsertError } = await supabaseClient
            .from('quote_items')
            .insert(quoteItems)

          if (itemsInsertError) {
            console.error('❌ Erreur sauvegarde items:', itemsInsertError)
          } else {
            console.log('✅ Items du devis sauvegardés')
          }
        }
      } catch (dbError) {
        console.warn('⚠️ Erreur base de données (non bloquante):', dbError)
      }
    }

    console.log('✅ Devis généré avec succès:', quoteNumber)

    return new Response(
      JSON.stringify({
        success: true,
        quoteNumber: quoteNumber,
        htmlContent: htmlContent,
        downloadUrl: `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`,
        totalTTC: totalTTC.toFixed(2),
        clientInfo: {
          name: `${clientData.first_name || ''} ${clientData.last_name || ''}`.trim(),
          email: clientData.email
        },
        packageInfo: {
          tracking_number: packageData.tracking_number,
          weight: packageData.weight,
          destination: packageData.destination
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 Erreur génération PDF:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur interne du serveur',
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})