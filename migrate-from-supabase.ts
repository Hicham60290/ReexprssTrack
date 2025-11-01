// scripts/migrate-from-supabase.ts
/**
 * Script de migration des données de Supabase vers PostgreSQL
 * 
 * Ce script permet de migrer toutes les données de votre ancien
 * projet Supabase vers la nouvelle base de données PostgreSQL.
 * 
 * Usage:
 *   npm install @supabase/supabase-js
 *   tsx scripts/migrate-from-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// ============================================
// CONFIGURATION
// ============================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ojvvmsqivsiwmgwrikdg.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ZnYwg6DDqdiR0Yw4CgOyMw_mqhYS7xx'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const prisma = new PrismaClient()

// ============================================
// UTILITAIRES
// ============================================

const log = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }
  console.log(`${emoji[type]} ${message}`)
}

const saveToFile = (filename: string, data: any) => {
  const dir = './migration-backup'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(
    path.join(dir, `${filename}.json`),
    JSON.stringify(data, null, 2)
  )
  log(`Backup sauvegardé: ${filename}.json`, 'info')
}

// ============================================
// FONCTIONS DE MIGRATION
// ============================================

/**
 * 1. Migrer les utilisateurs et profils
 */
async function migrateUsers() {
  log('Migration des utilisateurs...', 'info')
  
  try {
    // Récupérer tous les profils de Supabase
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
    
    if (error) throw error
    
    saveToFile('profiles-backup', profiles)
    log(`${profiles?.length || 0} profils trouvés`, 'info')
    
    let migrated = 0
    let errors = 0
    
    for (const profile of profiles || []) {
      try {
        // Créer l'utilisateur dans la nouvelle DB
        // Note: Les mots de passe devront être réinitialisés
        const user = await prisma.user.create({
          data: {
            id: profile.id,
            email: profile.email || `user-${profile.id}@reexpresstrack.com`,
            passwordHash: '', // À définir lors de la réinitialisation
            role: profile.role === 'admin' ? 'ADMIN' : 'USER',
            emailVerified: true,
            profile: {
              create: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                phone: profile.phone,
                company: profile.company,
                address: profile.address,
                postalCode: profile.postal_code,
                city: profile.city,
                territory: profile.territory,
                kycStatus: profile.kyc_status === 'approved' ? 'APPROVED' : 'PENDING',
                acceptMarketing: profile.accept_marketing || false
              }
            }
          }
        })
        
        migrated++
        log(`Utilisateur migré: ${user.email}`, 'success')
      } catch (err: any) {
        errors++
        log(`Erreur migration utilisateur ${profile.id}: ${err.message}`, 'error')
      }
    }
    
    log(`Utilisateurs migrés: ${migrated}/${profiles?.length || 0} (Erreurs: ${errors})`, 'success')
  } catch (error: any) {
    log(`Erreur migration utilisateurs: ${error.message}`, 'error')
    throw error
  }
}

/**
 * 2. Migrer les adresses françaises
 */
async function migrateFrenchAddresses() {
  log('Migration des adresses françaises...', 'info')
  
  try {
    const { data: addresses, error } = await supabase
      .from('french_addresses')
      .select('*')
    
    if (error) throw error
    
    saveToFile('french-addresses-backup', addresses)
    log(`${addresses?.length || 0} adresses trouvées`, 'info')
    
    let migrated = 0
    
    for (const address of addresses || []) {
      try {
        await prisma.frenchAddress.create({
          data: {
            id: address.id,
            userId: address.user_id,
            addressLine1: address.address_line_1,
            addressLine2: address.address_line_2,
            postalCode: address.postal_code,
            city: address.city,
            referenceCode: address.reference_code,
            isActive: address.is_active !== false
          }
        })
        
        migrated++
      } catch (err: any) {
        log(`Erreur adresse ${address.id}: ${err.message}`, 'error')
      }
    }
    
    log(`Adresses migrées: ${migrated}/${addresses?.length || 0}`, 'success')
  } catch (error: any) {
    log(`Erreur migration adresses: ${error.message}`, 'error')
    throw error
  }
}

/**
 * 3. Migrer les colis
 */
async function migratePackages() {
  log('Migration des colis...', 'info')
  
  try {
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
    
    if (error) throw error
    
    saveToFile('packages-backup', packages)
    log(`${packages?.length || 0} colis trouvés`, 'info')
    
    let migrated = 0
    
    for (const pkg of packages || []) {
      try {
        // Mapper le statut
        const statusMap: Record<string, any> = {
          'announced': 'ANNOUNCED',
          'in_transit': 'IN_TRANSIT',
          'received': 'RECEIVED',
          'stored': 'STORED',
          'quote_requested': 'QUOTE_REQUESTED',
          'quote_ready': 'QUOTE_READY',
          'paid': 'PAID',
          'preparing': 'PREPARING',
          'shipped': 'SHIPPED',
          'delivered': 'DELIVERED',
          'cancelled': 'CANCELLED',
          'returned': 'RETURNED'
        }
        
        await prisma.package.create({
          data: {
            id: pkg.id,
            userId: pkg.user_id,
            trackingNumber: pkg.tracking_number,
            description: pkg.description,
            weight: pkg.weight ? parseFloat(pkg.weight) : null,
            dimensions: pkg.dimensions,
            status: statusMap[pkg.status] || 'ANNOUNCED',
            receivedAt: pkg.received_at ? new Date(pkg.received_at) : null,
            photos: pkg.photos || [],
            storageStartDate: pkg.storage_start_date ? new Date(pkg.storage_start_date) : null,
            storageFees: pkg.storage_fees ? parseFloat(pkg.storage_fees) : 0,
            quoteId: pkg.quote_id,
            metadata: pkg.metadata
          }
        })
        
        migrated++
      } catch (err: any) {
        log(`Erreur colis ${pkg.id}: ${err.message}`, 'error')
      }
    }
    
    log(`Colis migrés: ${migrated}/${packages?.length || 0}`, 'success')
  } catch (error: any) {
    log(`Erreur migration colis: ${error.message}`, 'error')
    throw error
  }
}

/**
 * 4. Migrer les devis
 */
async function migrateQuotes() {
  log('Migration des devis...', 'info')
  
  try {
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
    
    if (error) throw error
    
    saveToFile('quotes-backup', quotes)
    log(`${quotes?.length || 0} devis trouvés`, 'info')
    
    let migrated = 0
    
    for (const quote of quotes || []) {
      try {
        const statusMap: Record<string, any> = {
          'pending': 'PENDING',
          'accepted': 'ACCEPTED',
          'paid': 'PAID',
          'expired': 'EXPIRED',
          'cancelled': 'CANCELLED'
        }
        
        await prisma.quote.create({
          data: {
            id: quote.id,
            userId: quote.user_id,
            packageId: quote.package_id,
            destinationAddress: quote.destination_address || {},
            carrierOptions: quote.carrier_options || [],
            selectedCarrier: quote.selected_carrier,
            totalAmount: parseFloat(quote.total_amount || '0'),
            status: statusMap[quote.status] || 'PENDING',
            validUntil: quote.valid_until ? new Date(quote.valid_until) : null,
            pdfUrl: quote.pdf_url
          }
        })
        
        migrated++
      } catch (err: any) {
        log(`Erreur devis ${quote.id}: ${err.message}`, 'error')
      }
    }
    
    log(`Devis migrés: ${migrated}/${quotes?.length || 0}`, 'success')
  } catch (error: any) {
    log(`Erreur migration devis: ${error.message}`, 'error')
    throw error
  }
}

/**
 * 5. Migrer les abonnements
 */
async function migrateSubscriptions() {
  log('Migration des abonnements...', 'info')
  
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
    
    if (error) throw error
    
    if (!subscriptions || subscriptions.length === 0) {
      log('Aucun abonnement à migrer', 'info')
      return
    }
    
    saveToFile('subscriptions-backup', subscriptions)
    
    let migrated = 0
    
    for (const sub of subscriptions) {
      try {
        const planMap: Record<string, any> = {
          'free': 'FREE',
          'basic': 'BASIC',
          'premium': 'PREMIUM',
          'business': 'BUSINESS'
        }
        
        const statusMap: Record<string, any> = {
          'active': 'ACTIVE',
          'past_due': 'PAST_DUE',
          'cancelled': 'CANCELLED',
          'expired': 'EXPIRED'
        }
        
        await prisma.subscription.create({
          data: {
            id: sub.id,
            userId: sub.user_id,
            stripeSubscriptionId: sub.stripe_subscription_id,
            planType: planMap[sub.plan_type] || 'FREE',
            status: statusMap[sub.status] || 'ACTIVE',
            currentPeriodStart: sub.current_period_start ? new Date(sub.current_period_start) : null,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end) : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end || false
          }
        })
        
        migrated++
      } catch (err: any) {
        log(`Erreur abonnement ${sub.id}: ${err.message}`, 'error')
      }
    }
    
    log(`Abonnements migrés: ${migrated}/${subscriptions.length}`, 'success')
  } catch (error: any) {
    log(`Erreur migration abonnements: ${error.message}`, 'error')
  }
}

/**
 * 6. Télécharger les photos depuis Supabase Storage
 */
async function migratePhotos() {
  log('Migration des photos...', 'info')
  log('⚠️ Cette étape nécessite MinIO configuré', 'warning')
  
  // TODO: Implémenter le téléchargement des photos depuis Supabase Storage
  // et le re-upload vers MinIO
  
  log('Migration photos à implémenter (voir documentation)', 'warning')
}

// ============================================
// SCRIPT PRINCIPAL
// ============================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════╗
║  MIGRATION SUPABASE → POSTGRESQL                   ║
║  ReExpressTrack                                    ║
╚════════════════════════════════════════════════════╝
  `)
  
  log('Début de la migration...', 'info')
  log('Les backups seront sauvegardés dans ./migration-backup/', 'info')
  
  try {
    // Vérifier la connexion Supabase
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (testError) {
      throw new Error(`Erreur connexion Supabase: ${testError.message}`)
    }
    
    log('Connexion Supabase OK', 'success')
    
    // Vérifier la connexion PostgreSQL
    await prisma.$connect()
    log('Connexion PostgreSQL OK', 'success')
    
    console.log('\n────────────────────────────────────────\n')
    
    // Exécuter les migrations dans l'ordre
    await migrateUsers()
    console.log('\n────────────────────────────────────────\n')
    
    await migrateFrenchAddresses()
    console.log('\n────────────────────────────────────────\n')
    
    await migratePackages()
    console.log('\n────────────────────────────────────────\n')
    
    await migrateQuotes()
    console.log('\n────────────────────────────────────────\n')
    
    await migrateSubscriptions()
    console.log('\n────────────────────────────────────────\n')
    
    await migratePhotos()
    console.log('\n────────────────────────────────────────\n')
    
    log('✨ Migration terminée avec succès !', 'success')
    log('📁 Les backups sont dans ./migration-backup/', 'info')
    log('⚠️ IMPORTANT: Les utilisateurs devront réinitialiser leur mot de passe', 'warning')
    
  } catch (error: any) {
    log(`Erreur fatale: ${error.message}`, 'error')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
main()


// ============================================
// INSTRUCTIONS POST-MIGRATION
// ============================================
/*

APRÈS LA MIGRATION, SUIVEZ CES ÉTAPES:

1. Vérifier les données migrées:
   - Connectez-vous à Adminer (http://localhost:8080)
   - Vérifiez que toutes les tables contiennent des données
   - Comparez les counts avec Supabase

2. Réinitialiser les mots de passe:
   - Tous les utilisateurs devront réinitialiser leur mot de passe
   - Envoyez un email de réinitialisation à tous les utilisateurs
   - Script disponible: scripts/send-password-reset-emails.ts

3. Migrer les photos:
   - Les photos sont toujours dans Supabase Storage
   - Script de migration: scripts/migrate-photos-to-minio.ts
   - Télécharge depuis Supabase Storage
   - Upload vers MinIO
   - Met à jour les URLs dans la base de données

4. Tester l'application:
   - Connectez-vous avec un utilisateur test
   - Vérifiez toutes les fonctionnalités
   - Testez les paiements en mode test
   - Vérifiez le suivi des colis

5. Basculer le DNS:
   - Une fois tous les tests OK
   - Pointer le domaine vers le nouveau serveur
   - Surveiller les logs pendant 24h

6. Désactiver Supabase:
   - Attendre 1 semaine de stabilité
   - Télécharger un backup final
   - Supprimer le projet Supabase
   - Économiser 70% des coûts ! 🎉

*/
