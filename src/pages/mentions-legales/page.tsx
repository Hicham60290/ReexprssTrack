
import React, { useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

export default function MentionsLegales() {
  // SEO et configuration
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'Mentions Légales - Informations Juridiques ReexpresseTrack | RGPD';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Mentions légales ReexpresseTrack : informations juridiques complètes, éditeur du site, hébergement, propriété intellectuelle, protection des données RGPD. Conformité légale totale.');
    }

    // GTM
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: 'Mentions Légales - ReexpresseTrack',
        page_location: window.location.href,
        page_path: '/mentions-legales',
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
            Mentions Légales
          </h1>
          <p className="text-xl text-blue-100">
            Informations légales et réglementaires conformes au RGPD et à la législation européenne
          </p>
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-blue-100 text-sm">
              <i className="ri-shield-check-line mr-2"></i>
              <strong>Transparence totale</strong> - Informations complètes sur Amber And Jasmine LTD, 
              éditeur de ReexpresseTrack, service d'expédition DOM-TOM et Maroc.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Acceptation des mentions légales */}
            <Card>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-information-line text-blue-600 text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-900">Information importante</h2>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  <strong>L'utilisation du site reexpressetrack.com implique l'acceptation pleine et entière des présentes mentions légales.</strong> 
                  Si vous n'acceptez pas ces conditions, nous vous invitons à ne pas utiliser ce site. 
                  Ces mentions légales peuvent être modifiées à tout moment et sont opposables dès leur mise en ligne.
                </p>
              </div>
            </Card>

            {/* Éditeur du site */}
            <Card>
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-building-line text-blue-600 text-xl"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">1. Éditeur et propriétaire du site</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Identification de l'éditeur</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><strong>Raison sociale :</strong> Amber And Jasmine LTD</p>
                      <p><strong>Forme juridique :</strong> Société à responsabilité limitée</p>
                      <p><strong>Propriétaire du site :</strong> reexpressetrack.com</p>
                      <p><strong>Activité :</strong> Service de réexpédition internationale de colis</p>
                      <p><strong>Numéro d'immatriculation :</strong> [À compléter]</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Adresse du siège social</h3>
                    <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <p><strong>Amber And Jasmine LTD</strong></p>
                      <p>20 Wenlock Road</p>
                      <p>London, England, N1 7GU</p>
                      <p>Royaume-Uni</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hébergement */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                2. Hébergement du site
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Hébergeur</h3>
                  <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p><strong>Société :</strong> Hostinger International Ltd.</p>
                    <p><strong>Adresse :</strong> 61 Lordou Vironos Street</p>
                    <p>6023 Larnaca, Chypre</p>
                    <p><strong>Site web :</strong> www.hostinger.com</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Informations techniques</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <i className="ri-phone-line text-blue-600 mr-2"></i>
                      <span>Support technique 24/7</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-mail-line text-blue-600 mr-2"></i>
                      <span>support@hostinger.com</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-chat-1-line text-blue-600 mr-2"></i>
                      <span>Chat en ligne disponible</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                3. Contact et service client
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Service client</h3>
                  <div className="space-y-3">
                    <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                      <i className="ri-mail-line text-blue-600 mr-3"></i>
                      <div>
                        <span className="font-medium text-gray-800">Email principal</span>
                        <p className="text-gray-600">contact@reexpresstrack.com</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-phone-line text-blue-600 mr-3"></i>
                      <span className="text-gray-600">Téléphone : 02076085500</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-time-line text-blue-600 mr-3"></i>
                      <span className="text-gray-600">Horaires : Lundi - Vendredi, 9h00 - 18h00</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Adresse de correspondance</h3>
                  <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p><strong>Service ReexpresseTrack</strong></p>
                    <p>Amber And Jasmine LTD</p>
                    <p>20 Wenlock Road</p>
                    <p>London, England, N1 7GU</p>
                    <p>Royaume-Uni</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Protection des données personnelles - RGPD */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                4. Protection des données personnelles (RGPD)
              </h2>
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <i className="ri-shield-check-line text-green-600 mr-3 text-xl"></i>
                    <h3 className="font-semibold text-green-800">Engagement RGPD</h3>
                  </div>
                  <p className="text-green-700">
                    Amber And Jasmine LTD s'engage à protéger vos données personnelles conformément au Règlement Général 
                    sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Responsable du traitement</h4>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p><strong>Société :</strong> Amber And Jasmine LTD</p>
                      <p><strong>Adresse :</strong> 20 Wenlock Road, London, N1 7GU</p>
                      <p><strong>Contact DPO :</strong> contact@reexpresstrack.com</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Vos droits</h4>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>• Droit d'accès, rectification, effacement</p>
                      <p>• Droit à la portabilité des données</p>
                      <p>• Droit d'opposition et de limitation</p>
                      <p>• Droit de retirer votre consentement</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Pour exercer vos droits :</strong> Contactez-nous à contact@reexpresstrack.com avec une pièce d'identité. 
                    En cas de litige, vous pouvez saisir la CNIL sur www.cnil.fr
                  </p>
                </div>
              </div>
            </Card>

            {/* Propriété intellectuelle */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                5. Propriété intellectuelle
              </h2>
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">Droits réservés</h3>
                  <p className="text-orange-700 text-sm">
                    L'ensemble du contenu du site reexpressetrack.com (textes, images, logos, vidéos, structure, design) 
                    est protégé par les droits de propriété intellectuelle et appartient exclusivement à Amber And Jasmine LTD.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="ri-copyright-line text-gray-600 mr-3 mt-1"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Reproduction interdite</h4>
                        <p className="text-gray-600 text-sm">
                          Toute reproduction totale ou partielle est strictement interdite sans autorisation écrite préalable.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="ri-trademark-line text-gray-600 mr-3 mt-1"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Marques déposées</h4>
                        <p className="text-gray-600 text-sm">
                          "ReexpresseTrack" est une marque d'Amber And Jasmine LTD.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="ri-code-line text-gray-600 mr-3 mt-1"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Code source</h4>
                        <p className="text-gray-600 text-sm">
                          Le code source et l'architecture du site sont protégés.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="ri-image-line text-gray-600 mr-3 mt-1"></i>
                      <div>
                        <h4 className="font-medium text-gray-800">Contenus visuels</h4>
                        <p className="text-gray-600 text-sm">
                          Images, logos et éléments graphiques sous droits d'auteur.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Limitation de responsabilité */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                6. Limitation de responsabilité
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Clause de non-responsabilité</h3>
                  <p className="text-yellow-700 text-sm">
                    Amber And Jasmine LTD met tout en œuvre pour assurer l'exactitude des informations diffusées, 
                    mais ne peut garantir l'absence d'erreurs ou d'omissions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Contenu du site</h4>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>• Les informations sont données à titre indicatif</li>
                      <li>• Mises à jour régulières mais non garanties</li>
                      <li>• Erreurs ou omissions possibles</li>
                      <li>• Interruptions techniques possibles</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Liens externes</h4>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>• Liens vers des sites tiers à titre informatif</li>
                      <li>• Aucun contrôle sur le contenu externe</li>
                      <li>• Aucune responsabilité sur les sites liés</li>
                      <li>• Vérification du contenu par l'utilisateur</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    <strong>Important :</strong> L'utilisateur est seul responsable de l'utilisation qu'il fait des informations 
                    et services proposés sur le site. En aucun cas, Amber And Jasmine LTD ne pourra être tenue responsable 
                    des dommages directs ou indirects résultant de l'utilisation du site.
                  </p>
                </div>
              </div>
            </Card>

            {/* Cookies */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                7. Cookies et traceurs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Utilisation des cookies</h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Ce site utilise des cookies pour améliorer votre expérience de navigation, 
                    analyser le trafic et personnaliser le contenu selon vos préférences.
                  </p>
                  <a href="/confidentialite" className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm">
                    → Politique de confidentialité complète
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Gestion des cookies</h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Vous pouvez accepter ou refuser les cookies via le bandeau de consentement 
                    ou dans les paramètres de votre navigateur.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                    Cookies essentiels : toujours actifs<br />
                    Cookies analytiques : avec votre consentement
                  </div>
                </div>
              </div>
            </Card>

            {/* Droit applicable */}
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                8. Droit applicable et juridictions compétentes
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Loi applicable</h3>
                  <p className="text-gray-600 text-sm">
                    Les présentes mentions légales sont régies par le droit français et européen (RGPD). 
                    Toute contestation relative à l'utilisation du site sera soumise au droit français.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">En cas de litige</h4>
                    <div className="text-gray-600 text-sm space-y-1">
                      <p>1. Tentative de résolution amiable</p>
                      <p>2. Médiation de la consommation</p>
                      <p>3. Tribunaux français compétents</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Médiation en ligne</h4>
                    <div className="text-gray-600 text-sm">
                      <p>Plateforme européenne ODR :</p>
                      <a href="https://ec.europa.eu/consumers/odr" 
                         className="text-blue-600 hover:text-blue-800" 
                         target="_blank" 
                         rel="noopener noreferrer">
                        ec.europa.eu/consumers/odr
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Mise à jour */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Dernière mise à jour
                  </h2>
                  <p className="text-gray-600">
                    Ces mentions légales ont été mises à jour le {new Date().toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Version 1.0 - Conforme RGPD
                  </p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-calendar-line text-blue-600 text-2xl"></i>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <i className="ri-information-line mr-2"></i>
                  <strong>Modifications :</strong> Amber And Jasmine LTD se réserve le droit de modifier ces mentions légales 
                  à tout moment. Les utilisateurs seront informés des modifications importantes. 
                  La version en vigueur est celle consultable sur le site.
                </p>
              </div>
            </Card>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
