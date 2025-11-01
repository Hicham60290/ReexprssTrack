import React, { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

export default function Confidentialite() {
  // SEO et Google Tag Manager
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'Politique de Confidentialité RGPD - Protection Données | ReexpresseTrack';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Politique de confidentialité ReexpresseTrack conforme RGPD. Protection de vos données personnelles, cookies, droits d\'accès et rectification. Transparence totale sur l\'utilisation de vos informations.');
    }

    // GTM script is already in index.html head
    // Push page view event to dataLayer
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: 'Politique de Confidentialité RGPD - ReexpresseTrack',
        page_location: window.location.href,
        page_path: '/confidentialite',
        page_category: 'legal',
        content_group1: 'pages-legales'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-xl text-blue-100">
            Protection de vos données personnelles - RGPD
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-shield-check-line text-green-600 text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Notre Engagement</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  ReexpresseTrack s'engage à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD). 
                  Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
            </Card>

            {/* Données collectées */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                1. Données que nous collectons
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Données d'identification</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Nom, prénom</li>
                    <li>Adresse email</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresses de livraison</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Données de service</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Informations sur vos colis</li>
                    <li>Historique des expéditions</li>
                    <li>Préférences de livraison</li>
                    <li>Communications avec notre support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Données techniques</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Adresse IP</li>
                    <li>Type de navigateur</li>
                    <li>Données de navigation (cookies)</li>
                    <li>Logs de connexion</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Finalités */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. Pourquoi nous utilisons vos données
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                      <i className="ri-truck-line text-blue-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Service de réexpédition</h3>
                      <p className="text-gray-600 text-sm">
                        Traitement et expédition de vos colis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                      <i className="ri-customer-service-line text-green-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Support client</h3>
                      <p className="text-gray-600 text-sm">
                        Assistance et résolution de problèmes
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                      <i className="ri-mail-line text-purple-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Communications</h3>
                      <p className="text-gray-600 text-sm">
                        Notifications sur vos expéditions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                      <i className="ri-line-chart-line text-orange-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Amélioration</h3>
                      <p className="text-gray-600 text-sm">
                        Amélioration de nos services
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vos droits */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3. Vos droits RGPD
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <i className="ri-eye-line text-blue-600 mr-3"></i>
                    <span className="font-medium text-gray-800">Droit d'accès</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-pencil-line text-green-600 mr-3"></i>
                    <span className="font-medium text-gray-800">Droit de rectification</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-delete-bin-line text-red-600 mr-3"></i>
                    <span className="font-medium text-gray-800">Droit à l'effacement</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <i className="ri-pause-line text-orange-600 mr-3"></i>
                    <span className="font-medium text-gray-800">Droit à la limitation</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-download-line text-purple-600 mr-3"></i>
                    <span className="font-medium text-gray-800">Droit à la portabilité</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-close-line text-gray-600 mr-3"></i>
                    <span className="font-medium text-gray-800">Droit d'opposition</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Comment exercer vos droits :</strong> Contactez-nous à l'adresse 
                  <span className="text-blue-600 font-medium"> contact@reexpresstrack.com</span> ou 
                  via votre espace client dans les paramètres de confidentialité.
                </p>
              </div>
            </Card>

            {/* Cookies */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. Utilisation des cookies
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="ri-shield-check-line text-green-600 mr-2"></i>
                      <h3 className="font-semibold text-green-800">Cookies essentiels</h3>
                    </div>
                    <p className="text-green-700 text-sm">
                      Nécessaires au fonctionnement du site (connexion, panier, sécurité)
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="ri-bar-chart-line text-blue-600 mr-2"></i>
                      <h3 className="font-semibold text-blue-800">Cookies analytiques</h3>
                    </div>
                    <p className="text-blue-700 text-sm">
                      Comprendre l'utilisation du site pour l'améliorer
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <i className="ri-heart-line text-purple-600 mr-2"></i>
                      <h3 className="font-semibold text-purple-800">Cookies préférences</h3>
                    </div>
                    <p className="text-purple-700 text-sm">
                      Mémoriser vos choix et préférences
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <i className="ri-information-line mr-2"></i>
                    Vous pouvez gérer vos préférences de cookies dans vos paramètres de compte ou via le bandeau cookies.
                  </p>
                </div>
              </div>
            </Card>

            {/* Sécurité */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Sécurité de vos données
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Mesures techniques</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <i className="ri-lock-line text-green-600 mr-2"></i>
                      <span className="text-gray-600">Chiffrement SSL/TLS</span>
                    </li>
                    <li className="flex items-center">
                      <i className="ri-server-line text-green-600 mr-2"></i>
                      <span className="text-gray-600">Serveurs sécurisés</span>
                    </li>
                    <li className="flex items-center">
                      <i className="ri-shield-star-line text-green-600 mr-2"></i>
                      <span className="text-gray-600">Authentification renforcée</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Mesures organisationnelles</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <i className="ri-team-line text-blue-600 mr-2"></i>
                      <span className="text-gray-600">Formation du personnel</span>
                    </li>
                    <li className="flex items-center">
                      <i className="ri-file-shield-line text-blue-600 mr-2"></i>
                      <span className="text-gray-600">Accès contrôlé aux données</span>
                    </li>
                    <li className="flex items-center">
                      <i className="ri-alarm-line text-blue-600 mr-2"></i>
                      <span className="text-gray-600">Surveillance continue</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Contact DPO */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. Contact et réclamations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Délégué à la Protection des Données</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <i className="ri-mail-line mr-2"></i>
                      <strong>Email :</strong> contact@reexpresstrack.com
                    </p>
                    <p className="text-gray-600">
                      <i className="ri-map-pin-line mr-2"></i>
                      <strong>Adresse :</strong><br />
                      ReexpresseTrack<br />
                      32 Bd de la Muette<br />
                      95140 Garges-Les-Gonesse, France
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Autorité de contrôle</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 mb-2">
                      <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés)
                    </p>
                    <p className="text-gray-600 text-sm">
                      Vous pouvez déposer une réclamation sur <span className="text-blue-600">www.cnil.fr</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Conservation des données */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                7. Conservation des données
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type de données
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durée de conservation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base légale
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">Données de compte</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Durée du contrat + 3 ans</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Exécution du contrat</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">Données d'expédition</td>
                      <td className="px-4 py-3 text-sm text-gray-600">10 ans</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Obligations comptables</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">Données de navigation</td>
                      <td className="px-4 py-3 text-sm text-gray-600">13 mois maximum</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Consentement</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">Logs de sécurité</td>
                      <td className="px-4 py-3 text-sm text-gray-600">1 an</td>
                      <td className="px-4 py-3 text-sm text-gray-600">Intérêt légitime</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}