
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

const SuiviColisBlogPost: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-blue-600">Accueil</Link>
                <i className="ri-arrow-right-s-line"></i>
                <Link to="/blog" className="hover:text-blue-600">Blog</Link>
                <i className="ri-arrow-right-s-line"></i>
                <span className="text-gray-900">Suivi de colis en temps réel</span>
              </div>
            </nav>

            {/* Article Meta */}
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                Suivi
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  8 Décembre 2024
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  4 min de lecture
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Suivi de colis DOM-TOM : Restez informé en temps réel
            </h1>

            <div className="mb-12">
              <img
                src="https://readdy.ai/api/search-image?query=Real-time%20package%20tracking%20system%20interface%20showing%20delivery%20progress%20to%20French%20overseas%20territories%2C%20modern%20smartphone%20and%20laptop%20displaying%20tracking%20information%2C%20world%20map%20with%20delivery%20routes%20highlighted%2C%20professional%20courier%20with%20packages%2C%20GPS%20tracking%20technology%2C%20clean%20modern%20office%20environment%2C%20notifications%20and%20alerts&width=800&height=450&seq=tracking1&orientation=landscape"
                alt="Suivi de colis en temps réel"
                className="w-full h-96 object-cover object-top rounded-xl shadow-lg"
              />
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Fini l'angoisse de ne pas savoir où se trouve votre colis ! Notre système de suivi avancé 
                vous offre une visibilité complète sur l'acheminement de vos envois vers les DOM-TOM.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Un suivi différent pour les DOM-TOM
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-alert-line text-yellow-400 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-yellow-800">
                      Les défis spécifiques aux DOM-TOM
                    </h3>
                    <div className="mt-2 text-yellow-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Multiples intermédiaires (transporteurs, douanes, etc.)</li>
                        <li>Délais variables selon les conditions météo et transport</li>
                        <li>Passages obligatoires par différents hubs logistiques</li>
                        <li>Contrôles douaniers spécifiques aux territoires</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Notre système de suivi avancé
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-smartphone-line text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Notifications push en temps réel
                  </h3>
                  <p className="text-gray-600">
                    Recevez une notification à chaque étape importante : 
                    prise en charge, transit, arrivée en DOM-TOM, livraison.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-map-2-line text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Carte de suivi interactive
                  </h3>
                  <p className="text-gray-600">
                    Visualisez le parcours de votre colis sur une carte détaillée 
                    avec les étapes franchies et à venir.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-time-line text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Estimation des délais
                  </h3>
                  <p className="text-gray-600">
                    Délais prévisionnels mis à jour en temps réel selon 
                    les conditions de transport et les éventuels retards.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-shield-check-line text-red-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Alertes proactives
                  </h3>
                  <p className="text-gray-600">
                    Soyez averti immédiatement en cas de retard, problème douanier 
                    ou action requise de votre part.
                  </p>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Les étapes de suivi détaillées
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Prise en charge
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Votre colis est récupéré et enregistré dans notre système. 
                      Vous recevez votre numéro de suivi unique.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      📱 Notification : "Votre colis est pris en charge - Numéro de suivi : DOM123456789"
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Transit France métropolitaine
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Acheminement vers le hub de départ international. 
                      Passage par nos centres de tri spécialisés DOM-TOM.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      📱 Notification : "En transit vers le hub international - Départ prévu demain"
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Contrôle douanier
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Vérification douanière avant expédition. Notre équipe suit 
                      de près cette étape cruciale.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      📱 Notification : "Contrôle douanier en cours - Aucune action requise"
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Transport international
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Expédition par avion ou bateau selon le service choisi. 
                      Suivi GPS des conteneurs.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      📱 Notification : "Vol AF8XX en route vers Fort-de-France - Arrivée prévue le 15/12"
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Arrivée en DOM-TOM
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Réception dans le hub local et préparation pour la livraison finale. 
                      Dédouanement local si nécessaire.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      📱 Notification : "Arrivé en Martinique - Livraison programmée demain"
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    6
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Livraison finale
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Remise à votre transporteur local partenaire pour la livraison 
                      à votre adresse ou en point relais.
                    </p>
                    <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600">
                      📱 Notification : "Colis livré chez M. Martin - Signature électronique disponible"
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Fonctionnalités avancées
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="ri-notification-3-line text-blue-600"></i>
                      Notifications personnalisables
                    </h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500"></i>
                        SMS, email ou push selon vos préférences
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500"></i>
                        Fréquence ajustable (temps réel ou quotidien)
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500"></i>
                        Langues multiples (français, créole, anglais)
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="ri-share-line text-purple-600"></i>
                      Partage de suivi
                    </h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500"></i>
                        Lien de suivi partageable avec vos proches
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500"></i>
                        Accès sans inscription pour les destinataires
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-green-500"></i>
                        Historique complet consultable 30 jours
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Suivez vos colis dès maintenant
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Entrez votre numéro de suivi et découvrez où se trouve votre colis
                </p>
                <Link
                  to="/suivi"
                  className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap inline-block"
                >
                  Suivre mon colis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default SuiviColisBlogPost;
