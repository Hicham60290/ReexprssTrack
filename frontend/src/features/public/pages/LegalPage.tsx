import { useEffect, useState } from 'react'
import { FileText, Shield, Cookie, Eye } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/Card'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies'>('terms')

  useEffect(() => {
    document.title = 'Mentions légales - Conditions et confidentialité | ReExpressTrack'
  }, [])

  const tabs = [
    { id: 'terms' as const, name: 'Conditions Générales', icon: FileText },
    { id: 'privacy' as const, name: 'Confidentialité', icon: Shield },
    { id: 'cookies' as const, name: 'Cookies', icon: Cookie },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mentions légales
            </h1>
            <p className="text-lg text-gray-600">
              Transparence et conformité juridique
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <Card>
            <CardContent className="pt-6">
              {activeTab === 'terms' && (
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Conditions Générales d'Utilisation</h2>
                  <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Informations légales</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Raison sociale :</strong> ReExpressTrack SAS</p>
                      <p><strong>Siège social :</strong> 12 Rue de la Réexpédition, 75001 Paris, France</p>
                      <p><strong>SIRET :</strong> 123 456 789 00012</p>
                      <p><strong>Capital social :</strong> 10 000 €</p>
                      <p><strong>Email :</strong> contact@reexpresstrack.com</p>
                      <p><strong>Téléphone :</strong> +33 1 23 45 67 89</p>
                      <p><strong>Directeur de publication :</strong> Jean Dupont</p>
                      <p><strong>Hébergeur :</strong> OVH SAS, 2 rue Kellermann, 59100 Roubaix, France</p>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Objet du service</h3>
                    <p className="text-gray-700">
                      ReExpressTrack est un service de réexpédition de colis permettant aux utilisateurs de :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                      <li>Obtenir une adresse postale française permanente</li>
                      <li>Recevoir des colis à cette adresse</li>
                      <li>Demander la réexpédition vers une destination internationale</li>
                      <li>Suivre leurs envois en temps réel</li>
                      <li>Consolider plusieurs colis en un seul envoi</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Inscription et compte utilisateur</h3>
                    <p className="text-gray-700 mb-3">
                      L'utilisation du service nécessite la création d'un compte. L'utilisateur s'engage à :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Fournir des informations exactes et à jour</li>
                      <li>Maintenir la confidentialité de ses identifiants</li>
                      <li>Ne pas créer de compte pour une autre personne sans autorisation</li>
                      <li>Avoir au moins 18 ans ou être représenté par un tuteur légal</li>
                      <li>Notifier immédiatement toute utilisation non autorisée de son compte</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Tarifs et paiement</h3>
                    <p className="text-gray-700 mb-3">
                      Les tarifs sont affichés en euros TTC et comprennent :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Abonnement mensuel ou annuel (optionnel)</li>
                      <li>Frais d'expédition calculés selon le poids, dimensions et destination</li>
                      <li>Services additionnels (photos, emballage renforcé, assurance)</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      Le paiement s'effectue par carte bancaire ou PayPal. Les frais sont débités avant l'expédition.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Marchandises interdites</h3>
                    <p className="text-gray-700 mb-3">
                      Le transport des articles suivants est strictement interdit :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Matières dangereuses, inflammables ou explosives</li>
                      <li>Armes, munitions et leurs répliques</li>
                      <li>Produits stupéfiants et substances illicites</li>
                      <li>Contrefaçons et articles contrevenant à la propriété intellectuelle</li>
                      <li>Denrées périssables sans emballage approprié</li>
                      <li>Animaux vivants</li>
                      <li>Espèces et métaux précieux sans assurance adaptée</li>
                      <li>Documents officiels (passeports, cartes d'identité)</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Responsabilité</h3>
                    <p className="text-gray-700 mb-3">
                      ReExpressTrack s'engage à :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                      <li>Traiter les colis avec soin</li>
                      <li>Respecter les délais d'expédition annoncés dans la mesure du possible</li>
                      <li>Assurer le suivi en temps réel des envois</li>
                    </ul>
                    <p className="text-gray-700 mb-3">
                      Notre responsabilité est limitée à :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>La valeur déclarée du colis (maximum 500€ sans assurance supplémentaire)</li>
                      <li>Le remboursement des frais d'expédition en cas de perte avérée</li>
                      <li>Nous ne sommes pas responsables des retards douaniers ou cas de force majeure</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Résiliation</h3>
                    <p className="text-gray-700">
                      L'utilisateur peut résilier son abonnement à tout moment depuis son espace client.
                      Les abonnements annuels ne sont pas remboursables. ReExpressTrack se réserve le droit
                      de suspendre ou fermer un compte en cas de violation des conditions d'utilisation.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">8. Droit applicable</h3>
                    <p className="text-gray-700">
                      Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux
                      tribunaux compétents de Paris, après tentative de résolution amiable.
                    </p>
                  </section>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h2>
                  <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Collecte des données</h3>
                    <p className="text-gray-700 mb-3">
                      Nous collectons les données suivantes :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
                      <li><strong>Données d'adresse :</strong> adresse de livraison finale</li>
                      <li><strong>Données de paiement :</strong> via Stripe (nous ne stockons pas les données bancaires)</li>
                      <li><strong>Données de navigation :</strong> cookies, adresse IP, pages visitées</li>
                      <li><strong>Données sur les colis :</strong> poids, dimensions, contenu déclaré, photos</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Utilisation des données</h3>
                    <p className="text-gray-700 mb-3">
                      Vos données sont utilisées pour :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Gérer votre compte et vos commandes</li>
                      <li>Traiter vos paiements et expéditions</li>
                      <li>Vous contacter concernant vos colis</li>
                      <li>Améliorer nos services</li>
                      <li>Respecter nos obligations légales (comptabilité, douanes)</li>
                      <li>Envoyer des communications marketing (avec votre consentement)</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Partage des données</h3>
                    <p className="text-gray-700 mb-3">
                      Nous partageons vos données uniquement avec :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Transporteurs :</strong> pour la livraison de vos colis</li>
                      <li><strong>Processeurs de paiement :</strong> Stripe pour les transactions</li>
                      <li><strong>Services d'emailing :</strong> pour les notifications (avec consentement)</li>
                      <li><strong>Autorités :</strong> si requis par la loi</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      Nous ne vendons jamais vos données à des tiers.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Vos droits (RGPD)</h3>
                    <p className="text-gray-700 mb-3">
                      Conformément au RGPD, vous disposez des droits suivants :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Droit d'accès :</strong> consulter vos données personnelles</li>
                      <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
                      <li><strong>Droit à l'effacement :</strong> supprimer vos données (sous conditions)</li>
                      <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                      <li><strong>Droit d'opposition :</strong> refuser le traitement de vos données</li>
                      <li><strong>Droit de limitation :</strong> limiter l'utilisation de vos données</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      Pour exercer vos droits : <a href="mailto:privacy@reexpresstrack.com" className="text-orange-600 hover:underline">privacy@reexpresstrack.com</a>
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Conservation des données</h3>
                    <p className="text-gray-700">
                      Nous conservons vos données :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                      <li>Données de compte : tant que le compte est actif + 3 ans après fermeture</li>
                      <li>Données de commande : 10 ans (obligation comptable)</li>
                      <li>Données de paiement : gérées par Stripe selon leurs politiques</li>
                      <li>Photos de colis : supprimées 90 jours après livraison</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Sécurité</h3>
                    <p className="text-gray-700">
                      Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour
                      protéger vos données : chiffrement SSL/TLS, hébergement sécurisé, accès restreint,
                      sauvegardes régulières, audits de sécurité.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h3>
                    <p className="text-gray-700">
                      <strong>Délégué à la Protection des Données (DPO) :</strong><br />
                      Email : <a href="mailto:dpo@reexpresstrack.com" className="text-orange-600 hover:underline">dpo@reexpresstrack.com</a><br />
                      Adresse : ReExpressTrack SAS - DPO, 12 Rue de la Réexpédition, 75001 Paris
                    </p>
                  </section>
                </div>
              )}

              {activeTab === 'cookies' && (
                <div className="prose prose-gray max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Politique de Cookies</h2>
                  <p className="text-sm text-gray-500 mb-6">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Qu'est-ce qu'un cookie ?</h3>
                    <p className="text-gray-700">
                      Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site.
                      Les cookies nous permettent de reconnaître votre appareil et d'améliorer votre expérience.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Types de cookies utilisés</h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cookies essentiels (obligatoires)</h4>
                        <p className="text-gray-700">
                          Nécessaires au fonctionnement du site. Ils permettent la navigation et l'accès aux zones
                          sécurisées. Sans ces cookies, certains services ne peuvent pas être fournis.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                          <li>Cookie de session : maintient votre connexion</li>
                          <li>Cookie de sécurité : protection CSRF</li>
                          <li>Cookie de préférence : langue, devise</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cookies analytiques (optionnels)</h4>
                        <p className="text-gray-700">
                          Nous aident à comprendre comment les visiteurs utilisent notre site pour l'améliorer.
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                          <li>Google Analytics : statistiques de visite anonymisées</li>
                          <li>Durée de conservation : 26 mois</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cookies de performance (optionnels)</h4>
                        <p className="text-gray-700">
                          Mesurent les performances du site et optimisent l'expérience utilisateur.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Cookies marketing (optionnels)</h4>
                        <p className="text-gray-700">
                          Utilisés pour afficher des publicités pertinentes. Nécessitent votre consentement explicite.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Durée de conservation</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Cookies de session : supprimés à la fermeture du navigateur</li>
                      <li>Cookies persistants : 13 mois maximum</li>
                      <li>Cookies analytiques : 26 mois</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Gérer vos cookies</h3>
                    <p className="text-gray-700 mb-3">
                      Vous pouvez gérer vos préférences de cookies de plusieurs façons :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Bandeau de cookies :</strong> lors de votre première visite, acceptez ou refusez les cookies optionnels</li>
                      <li><strong>Paramètres du navigateur :</strong> configurez votre navigateur pour bloquer ou supprimer les cookies</li>
                      <li><strong>Opt-out Google Analytics :</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">installez le module complémentaire</a></li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">5. Paramètres du navigateur</h3>
                    <p className="text-gray-700 mb-3">
                      Instructions pour gérer les cookies selon votre navigateur :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                      <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
                      <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                      <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies tiers</h3>
                    <p className="text-gray-700 mb-3">
                      Certains cookies sont déposés par des services tiers :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Stripe (paiement sécurisé)</li>
                      <li>Google Analytics (avec votre consentement)</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      Ces services ont leurs propres politiques de confidentialité.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">7. Contact</h3>
                    <p className="text-gray-700">
                      Pour toute question sur notre utilisation des cookies :<br />
                      Email : <a href="mailto:privacy@reexpresstrack.com" className="text-orange-600 hover:underline">privacy@reexpresstrack.com</a>
                    </p>
                  </section>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <div className="mt-12 bg-white rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Des questions sur nos politiques ?
            </h3>
            <p className="text-gray-600 mb-6">
              Notre équipe est à votre disposition pour toute clarification
            </p>
            <a
              href="mailto:legal@reexpresstrack.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Contactez notre service juridique
            </a>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
