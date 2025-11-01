import React, { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

export default function CGV() {
  // SEO et configuration
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'Conditions Générales de Vente - CGV ReexpresseTrack DOM-TOM | Modalités';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Conditions Générales de Vente ReexpresseTrack : modalités d\'utilisation, tarifs, responsabilités, droits et obligations pour nos services d\'expédition DOM-TOM et Maroc. CGV détaillées et transparentes.');
    }

    // GTM
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: 'CGV - Conditions Générales de Vente',
        page_location: window.location.href,
        page_path: '/cgv',
        page_category: 'legal',
        content_group1: 'pages-legales'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-xl text-blue-100">
            Modalités d'utilisation de nos services de réexpédition DOM-TOM et Maroc
          </p>
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-100 text-sm">
              <i className="ri-information-line mr-2"></i>
              <strong>Document juridique complet</strong> - Version mise à jour le {new Date().toLocaleDateString('fr-FR')}. 
              Applicable à tous les services ReexpresseTrack vers les DOM-TOM et le Maroc.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Préambule */}
            <Card>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-information-line text-blue-600 text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-900">Acceptation des conditions</h2>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  <strong>L'utilisation des services ReexpresseTrack implique l'acceptation pleine et entière des présentes Conditions Générales de Vente.</strong> 
                  Elles constituent le contrat entre l'utilisateur et Amber And Jasmine LTD. 
                  Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>
              </div>
            </Card>

            {/* Article 1 - Société */}
            <Card>
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-building-line text-blue-600 text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Article 1 - Société éditrice</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Identification de la société</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Raison sociale :</strong> Amber And Jasmine LTD</p>
                      <p><strong>Forme juridique :</strong> Société à responsabilité limitée de droit anglais</p>
                      <p><strong>Siège social :</strong> 20 Wenlock Road, London, England, N1 7GU</p>
                      <p><strong>Pays :</strong> Royaume-Uni</p>
                      <p><strong>Numéro d'immatriculation :</strong> [À compléter]</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Services proposés</h3>
                    <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <p><strong>ReexpresseTrack</strong> propose des services de :</p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Réexpédition internationale de colis</li>
                        <li>Adresse française de domiciliation</li>
                        <li>Stockage temporaire de marchandises</li>
                        <li>Abonnements premium</li>
                        <li>Services logistiques associés</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Article 2 - Hébergement */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 2 - Hébergement du site
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Hébergeur</h3>
                    <div className="text-gray-600 space-y-1">
                      <p><strong>Société :</strong> Hostinger International Ltd.</p>
                      <p><strong>Adresse :</strong> 61 Lordou Vironos Street</p>
                      <p>6023 Larnaca, Chypre</p>
                      <p><strong>Site web :</strong> www.hostinger.com</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Contact technique</h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center">
                        <i className="ri-mail-line text-blue-600 mr-2"></i>
                        <span>support@hostinger.com</span>
                      </div>
                      <div className="flex items-center">
                        <i className="ri-phone-line text-blue-600 mr-2"></i>
                        <span>Support technique 24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Article 3 - Objet et services */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 3 - Objet et description des services
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Services de réexpédition</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <i className="ri-home-line text-blue-600 mr-2"></i>
                        <h4 className="font-medium text-blue-800">Adresse française</h4>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Attribution d'une adresse postale française personnalisée pour recevoir vos colis.
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <i className="ri-truck-line text-green-600 mr-2"></i>
                        <h4 className="font-medium text-green-800">Réexpédition</h4>
                      </div>
                      <p className="text-green-700 text-sm">
                        Réexpédition de vos colis vers votre adresse finale dans les DOM-TOM ou à l'international.
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <i className="ri-archive-line text-purple-600 mr-2"></i>
                        <h4 className="font-medium text-purple-800">Stockage</h4>
                      </div>
                      <p className="text-purple-700 text-sm">
                        Stockage temporaire gratuit de 3 à 90 jours selon votre abonnement.
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <i className="ri-camera-line text-orange-600 mr-2"></i>
                        <h4 className="font-medium text-orange-800">Photos</h4>
                      </div>
                      <p className="text-orange-700 text-sm">
                        Photos de vos colis à réception pour vérification avant réexpédition.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Abonnements disponibles</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Forfait</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prix</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stockage</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Avantages</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 font-medium text-gray-900">Gratuit</td>
                          <td className="px-4 py-3 text-gray-600">0€</td>
                          <td className="px-4 py-3 text-gray-600">3 jours</td>
                          <td className="px-4 py-3 text-gray-600">Services de base</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="px-4 py-3 font-medium text-blue-900">Premium Mensuel</td>
                          <td className="px-4 py-3 text-blue-700">2,50€/mois</td>
                          <td className="px-4 py-3 text-blue-700">60 jours</td>
                          <td className="px-4 py-3 text-blue-700">-20% expédition, support prioritaire</td>
                        </tr>
                        <tr className="bg-green-50">
                          <td className="px-4 py-3 font-medium text-green-900">Premium Annuel</td>
                          <td className="px-4 py-3 text-green-700">20€/an</td>
                          <td className="px-4 py-3 text-green-700">90 jours</td>
                          <td className="px-4 py-3 text-green-700">-20% expédition, 2 mois gratuits</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>

            {/* Article 4 - Modalités de commande */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 4 - Modalités de commande et d'inscription
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Processus d'inscription</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-blue-600">1</span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Inscription</h4>
                      <p className="text-sm text-gray-600">Création de compte en ligne</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-green-600">2</span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Validation</h4>
                      <p className="text-sm text-gray-600">Vérification email et activation</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-purple-600">3</span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Adresse</h4>
                      <p className="text-sm text-gray-600">Attribution adresse française</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="font-bold text-orange-600">4</span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Utilisation</h4>
                      <p className="text-sm text-gray-600">Services opérationnels</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Conditions d'inscription</h4>
                  <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
                    <li>Être âgé de 18 ans minimum ou avoir l'autorisation parentale</li>
                    <li>Fournir des informations exactes et à jour</li>
                    <li>Accepter les présentes CGV et la politique de confidentialité</li>
                    <li>Disposer d'une adresse email valide</li>
                    <li>Ne pas utiliser le service à des fins illégales</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Validation des commandes</h3>
                  <p className="text-gray-600 mb-3">
                    Toute commande de service (abonnement, expédition) est considérée comme définitive après :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <i className="ri-check-double-line text-green-600 mr-3"></i>
                      <span className="text-gray-700">Validation du paiement en ligne</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-mail-check-line text-green-600 mr-3"></i>
                      <span className="text-gray-700">Envoi de l'email de confirmation</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-file-text-line text-green-600 mr-3"></i>
                      <span className="text-gray-700">Acceptation des conditions spécifiques</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-shield-check-line text-green-600 mr-3"></i>
                      <span className="text-gray-700">Vérification des informations</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Article 5 - Prix et paiement */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 5 - Prix et modalités de paiement
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Tarification</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 mb-3">
                      <strong>Tous nos prix sont affichés en euros (€) toutes taxes comprises (TTC)</strong>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Frais d'abonnement</h4>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Premium mensuel : 2,50€/mois</li>
                          <li>• Premium annuel : 20€/an (soit 1,67€/mois)</li>
                          <li>• Aucun frais d'inscription</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Frais d'expédition</h4>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Variables selon destination et poids</li>
                          <li>• Calculés en temps réel</li>
                          <li>• -20% pour les abonnés Premium</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Moyens de paiement acceptés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <i className="ri-bank-card-line text-3xl text-gray-600 mb-2"></i>
                      <h4 className="font-medium text-gray-800 mb-1">Cartes bancaires</h4>
                      <p className="text-sm text-gray-600">Visa, MasterCard, American Express</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <i className="ri-paypal-line text-3xl text-gray-600 mb-2"></i>
                      <h4 className="font-medium text-gray-800 mb-1">PayPal</h4>
                      <p className="text-sm text-gray-600">Paiement sécurisé PayPal</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <i className="ri-bank-line text-3xl text-gray-600 mb-2"></i>
                      <h4 className="font-medium text-gray-800 mb-1">Virement SEPA</h4>
                      <p className="text-sm text-gray-600">Pour les montants importants</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <i className="ri-shield-check-line text-green-600 mr-2"></i>
                    <h4 className="font-semibold text-green-800">Sécurité des paiements</h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    Tous les paiements sont sécurisés par Stripe et respectent les standards PCI DSS. 
                    Vos données bancaires ne sont jamais stockées sur nos serveurs.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Modalités de facturation</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <i className="ri-calendar-line text-blue-600 mr-3"></i>
                      <span>Abonnements : facturation automatique selon la périodicité choisie</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-truck-line text-blue-600 mr-3"></i>
                      <span>Expéditions : paiement avant traitement du colis</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-file-text-line text-blue-600 mr-3"></i>
                      <span>Factures disponibles en téléchargement dans votre espace client</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-error-warning-line text-red-600 mr-3"></i>
                      <span>Défaut de paiement : suspension du service après 7 jours</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Article 6 - Droit de rétractation */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 6 - Droit de rétractation
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <i className="ri-time-line text-blue-600 mr-3 text-xl"></i>
                    <h3 className="text-lg font-semibold text-blue-800">Délai de rétractation : 14 jours</h3>
                  </div>
                  <p className="text-blue-700 mb-3">
                    Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de 14 jours 
                    à compter de la souscription pour exercer votre droit de rétractation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Services concernés</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <i className="ri-check-line text-green-600 mr-2"></i>
                        <span className="text-gray-700">Abonnements Premium (si non utilisés)</span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-close-line text-red-600 mr-2"></i>
                        <span className="text-gray-700">Services déjà commencés avec accord</span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-close-line text-red-600 mr-2"></i>
                        <span className="text-gray-700">Expéditions déjà effectuées</span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-close-line text-red-600 mr-2"></i>
                        <span className="text-gray-700">Services personnalisés (adresse attribuée)</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Comment exercer ce droit</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>1. Notification :</strong> Email à contact@reexpresstrack.com</p>
                      <p><strong>2. Objet :</strong> "Exercice du droit de rétractation"</p>
                      <p><strong>3. Informations :</strong> Nom, date de commande, référence</p>
                      <p><strong>4. Remboursement :</strong> Sous 14 jours après notification</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Exceptions au droit de rétractation</h4>
                  <p className="text-yellow-700 text-sm">
                    Le droit de rétractation ne peut être exercé pour les prestations de services pleinement exécutées 
                    avant la fin du délai de rétractation et dont l'exécution a commencé avec l'accord préalable exprès du consommateur.
                  </p>
                </div>
              </div>
            </Card>

            {/* Article 7 - Responsabilité */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 7 - Limitation de responsabilité
              </h2>
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <i className="ri-alert-line text-orange-600 mr-3 text-xl"></i>
                    <h3 className="text-lg font-semibold text-orange-800">Principe général</h3>
                  </div>
                  <p className="text-orange-700">
                    Amber And Jasmine LTD met tout en œuvre pour assurer un service de qualité mais ne peut garantir 
                    une disponibilité absolue et décline toute responsabilité en cas de dommages indirects.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Responsabilité limitée pour</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <i className="ri-time-line text-yellow-600 mr-2 mt-1"></i>
                        <div>
                          <span className="font-medium text-gray-700">Retards d'expédition</span>
                          <p className="text-gray-500">Dus aux transporteurs ou douanes</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-server-line text-yellow-600 mr-2 mt-1"></i>
                        <div>
                          <span className="font-medium text-gray-700">Indisponibilité technique</span>
                          <p className="text-gray-500">Maintenance ou pannes serveurs</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-thunderstorm-line text-yellow-600 mr-2 mt-1"></i>
                        <div>
                          <span className="font-medium text-gray-700">Force majeure</span>
                          <p className="text-gray-500">Événements indépendants de notre volonté</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Responsabilité engagée pour</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <i className="ri-shield-check-line text-green-600 mr-2 mt-1"></i>
                        <div>
                          <span className="font-medium text-gray-700">Perte de colis</span>
                          <p className="text-gray-500">Remboursement selon déclaration</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-lock-line text-green-600 mr-2 mt-1"></i>
                        <div>
                          <span className="font-medium text-gray-700">Sécurité des données</span>
                          <p className="text-gray-500">Protection informations personnelles</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-customer-service-line text-green-600 mr-2 mt-1"></i>
                        <div>
                          <span className="font-medium text-gray-700">Qualité du service</span>
                          <p className="text-gray-500">Respect des engagements contractuels</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Exclusions de responsabilité</h4>
                  <p className="text-red-700 text-sm mb-2">
                    Amber And Jasmine LTD ne peut être tenue responsable :
                  </p>
                  <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                    <li>Des dommages indirects (perte de profits, d'exploitation, de données)</li>
                    <li>De l'utilisation détournée ou frauduleuse des services</li>
                    <li>Des réglementations douanières et restrictions d'importation</li>
                    <li>Du contenu des colis (produits interdits, dangereux, illégaux)</li>
                    <li>Des actes ou négligences des transporteurs partenaires</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Plafond de responsabilité</h4>
                  <p className="text-blue-700 text-sm">
                    En tout état de cause, la responsabilité d'Amber And Jasmine LTD est limitée au montant 
                    effectivement payé par le client pour le service concerné, sans pouvoir excéder 500€ par sinistre.
                  </p>
                </div>
              </div>
            </Card>

            {/* Article 8 - Protection des données */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 8 - Protection des données personnelles (RGPD)
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <i className="ri-shield-check-line text-green-600 mr-3 text-xl"></i>
                    <h3 className="text-lg font-semibold text-green-800">Engagement RGPD</h3>
                  </div>
                  <p className="text-green-700">
                    Amber And Jasmine LTD s'engage à protéger vos données personnelles conformément au Règlement Général 
                    sur la Protection des Données (RGPD) et aux lois applicables en matière de protection des données.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Données collectées</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Informations d'identification (nom, prénom, email)</li>
                      <li>• Adresses de livraison et facturation</li>
                      <li>• Informations de paiement (via prestataires sécurisés)</li>
                      <li>• Données de navigation et cookies</li>
                      <li>• Historique des expéditions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Vos droits</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Droit d'accès à vos données</li>
                      <li>• Droit de rectification et mise à jour</li>
                      <li>• Droit à l'effacement ("droit à l'oubli")</li>
                      <li>• Droit à la portabilité des données</li>
                      <li>• Droit d'opposition et de limitation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Pour exercer vos droits :</strong> Contactez notre Délégué à la Protection des Données (DPO) 
                    à l'adresse contact@reexpresstrack.com. 
                    <br />
                    <strong>Politique complète :</strong> Consultez notre 
                    <a href="/confidentialite" className="text-blue-600 hover:underline ml-1">politique de confidentialité</a>.
                  </p>
                </div>
              </div>
            </Card>

            {/* Article 9 - Droit applicable */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 9 - Droit applicable et juridictions compétentes
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Lois applicables</h3>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <p><strong>Droit principal :</strong> Droit anglais (siège social au Royaume-Uni)</p>
                    <p><strong>Protection consommateurs :</strong> Droit européen et français (RGPD, Code de la consommation)</p>
                    <p><strong>Commerce électronique :</strong> Directive européenne 2000/31/CE</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">En cas de litige</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-blue-600 font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">Résolution amiable</h5>
                          <p className="text-sm text-gray-600">Contact direct avec notre service client</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-green-600 font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">Médiation</h5>
                          <p className="text-sm text-gray-600">Médiateur de la consommation agréé</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <span className="text-orange-600 font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">Juridiction</h5>
                          <p className="text-sm text-gray-600">Tribunaux compétents selon le droit applicable</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Médiation en ligne</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-700 text-sm mb-2">
                        <strong>Plateforme européenne de règlement des litiges :</strong>
                      </p>
                      <a href="https://ec.europa.eu/consumers/odr" 
                         className="text-blue-600 hover:underline text-sm" 
                         target="_blank" 
                         rel="noopener noreferrer">
                        https://ec.europa.eu/consumers/odr
                      </a>
                      <p className="text-blue-600 text-sm mt-2">
                        Résolution des conflits en ligne pour les consommateurs européens
                      </p>
                    </div>
                    
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-800 mb-2">Tribunaux compétents</h5>
                      <p className="text-gray-600 text-sm">
                        Pour les consommateurs français : juridictions françaises du lieu de domicile du consommateur ou du siège de l'entreprise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Article 10 - Dispositions générales */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Article 10 - Dispositions générales
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Modification des CGV</h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Amber And Jasmine LTD se réserve le droit de modifier les présentes CGV à tout moment.
                    </p>
                    <ul className="text-gray-600 text-sm space-y-1">
                      <li>• Notification par email aux utilisateurs</li>
                      <li>• Délai de 30 jours pour accepter ou résilier</li>
                      <li>• Nouvelles conditions applicables aux nouveaux services</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Nullité partielle</h4>
                    <p className="text-gray-600 text-sm">
                      Si une disposition des présentes CGV était déclarée nulle ou inapplicable, 
                      les autres dispositions demeureraient en vigueur.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Non-renonciation</h4>
                  <p className="text-gray-600 text-sm">
                    Le fait pour Amber And Jasmine LTD de ne pas se prévaloir d'un manquement par le client 
                    à l'une des obligations visées dans les présentes CGV ne saurait être interprété comme 
                    une renonciation à se prévaloir de tout manquement ultérieur.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Contact et réclamations</h4>
                  <div className="text-blue-700 text-sm space-y-1">
                    <p><strong>Service client :</strong> contact@reexpresstrack.com</p>
                    <p><strong>Téléphone :</strong> 02076085500</p>
                    <p><strong>Adresse :</strong> Amber And Jasmine LTD, 20 Wenlock Road, London, England, N1 7GU</p>
                    <p><strong>Horaires :</strong> Lundi-Vendredi 9h-18h, Samedi 10h-16h</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Version et date */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Version et mise à jour
                  </h2>
                  <p className="text-gray-600">
                    Conditions Générales de Vente - Version 1.0
                  </p>
                  <p className="text-gray-600">
                    Date d'entrée en vigueur : {new Date().toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Dernière modification : {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-text-line text-blue-600 text-2xl"></i>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <i className="ri-download-line text-green-600 mr-2"></i>
                    <h4 className="font-medium text-green-800">Téléchargement</h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    Vous pouvez télécharger une version PDF de ces CGV depuis votre espace client.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <i className="ri-notification-line text-yellow-600 mr-2"></i>
                    <h4 className="font-medium text-yellow-800">Notification</h4>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    Toute modification importante vous sera notifiée par email 30 jours à l'avance.
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}