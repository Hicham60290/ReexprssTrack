
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

const RetourColisDomTom: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section SEO optimisée */}
      <section className="relative py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-100/50 to-red-100/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center bg-orange-100 rounded-full px-6 py-3 mb-8">
              <i className="ri-award-line text-orange-600 mr-2"></i>
              <span className="text-orange-800 font-semibold">Service Exclusif DOM-TOM</span>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Retour Colis DOM-TOM vers la France
            </h1>
            <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Premier service spécialisé de retour colis depuis les DOM-TOM vers la France métropolitaine. 
              Remboursements, échanges - tout simplifié !
            </p>
            
            <div className="flex flex-col sm:flow-row gap-4 justify-center mb-12">
              <Link to="/gestion-retour">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <i className="ri-arrow-go-back-line mr-2"></i>
                  Démarrer un retour
                </Button>
              </Link>
              <Link to="/calculateur">
                <Button variant="outline" size="lg">
                  <i className="ri-calculator-line mr-2"></i>
                  Calculer les frais
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">8,50€</div>
                <p className="text-gray-600">À partir de</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24-48h</div>
                <p className="text-gray-600">Traitement rapide</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <p className="text-gray-600">Sécurisé</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">127+</div>
                <p className="text-gray-600">Retours traités</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi choisir notre service */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ReexpresseTrack pour vos retours ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La solution la plus simple et économique pour gérer vos retours colis depuis les départements d'outre-mer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-france-line text-2xl text-orange-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Adresse Française Dédiée
                </h3>
                <p className="text-gray-600 mb-4">
                  Votre propre adresse de retour en France métropolitaine (Cauffry, 60). 
                  Fini les refus de retour depuis les DOM-TOM !
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">Reexpresse Track</p>
                  <p className="text-sm text-gray-600">53 BIS Route de Mouy</p>
                  <p className="text-sm text-gray-600">60290 Cauffry, France</p>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-calculator-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Tarifs Transparents
                </h3>
                <p className="text-gray-600 mb-4">
                  Calcul automatique des frais selon le poids et dimensions. 
                  Aucun frais caché, paiement sécurisé via Stripe.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jusqu'à 1kg :</span>
                    <span className="font-semibold">8,50€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jusqu'à 5kg :</span>
                    <span className="font-semibold">12,50€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jusqu'à 10kg :</span>
                    <span className="font-semibold">18,50€</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-refresh-line text-2xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Gestion Complète des Retours
                </h3>
                <p className="text-gray-600 mb-4">
                  Nous nous occupons entièrement de la gestion de vos retours et les renvoyons 
                  directement chez votre fournisseur (Amazon, Cdiscount, Fnac, etc.).
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Gestion complète</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Envoi fournisseur</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Suivi complet</span>
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-time-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Traitement Expert
                </h3>
                <p className="text-gray-600">
                  Réception, vérification et renvoi de vos retours sous 24-48h. 
                  Nous gérons toutes les démarches avec vos fournisseurs.
                </p>
              </div>
            </Card>

            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-shield-check-line text-2xl text-red-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Sécurité Maximale
                </h3>
                <p className="text-gray-600">
                  Entrepôt sécurisé, assurance incluse, paiement 100% sécurisé. 
                  Vos colis sont entre de bonnes mains.
                </p>
              </div>
            </Card>

            <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-customer-service-line text-2xl text-yellow-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Support Dédié
                </h3>
                <p className="text-gray-600">
                  Équipe support francophone spécialisée DOM-TOM. 
                  Accompagnement personnalisé pour chaque retour.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comment fonctionne le retour colis DOM-TOM ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus simple en 4 étapes pour gérer vos retours depuis la Guadeloupe, Martinique, Guyane, Réunion, Mayotte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-6 hidden lg:block">
                  <i className="ri-arrow-right-line text-2xl text-gray-400"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sélectionnez votre colis</h3>
              <p className="text-gray-600">
                Choisissez le colis à retourner parmi ceux reçus dans votre compte ReexpresseTrack.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-6 hidden lg:block">
                  <i className="ri-arrow-right-line text-2xl text-gray-400"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Renseignez les détails</h3>
              <p className="text-gray-600">
                Indiquez le type de retour, raison, poids et dimensions. Les frais sont calculés automatiquement.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-6 hidden lg:block">
                  <i className="ri-arrow-right-line text-2xl text-gray-400"></i>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Payez en ligne</h3>
              <p className="text-gray-600">
                Réglez les frais d'expédition de manière sécurisée via Stripe. Pas de frais cachés.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nous gérons le renvoi</h3>
                    <p className="text-gray-600">
                      Nous nous occupons entièrement du renvoi de votre colis chez le fournisseur concerné. 
                      Vous n'avez plus rien à faire !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/gestion-retour">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <i className="ri-arrow-go-back-line mr-2"></i>
                Commencer un retour maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Territoires couverts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Service disponible dans tous les DOM-TOM
            </h2>
            <p className="text-xl text-gray-600">
              Notre service de retour colis couvre l'ensemble des départements et territoires d'outre-mer français
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Guadeloupe</h3>
              <p className="text-gray-600 text-sm">971</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-green-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Martinique</h3>
              <p className="text-gray-600 text-sm">972</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-yellow-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Guyane</h3>
              <p className="text-gray-600 text-sm">973</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-red-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Réunion</h3>
              <p className="text-gray-600 text-sm">974</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Mayotte</h3>
              <p className="text-gray-600 text-sm">976</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes sur les retours DOM-TOM
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur notre service de retour colis
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Combien coûte un retour colis depuis les DOM-TOM ?
              </h3>
              <p className="text-gray-600">
                Les tarifs commencent à 8,50€ pour un colis jusqu'à 1kg. Le prix final dépend du poids et des dimensions, 
                calculés automatiquement selon le poids volumétrique. Des réductions sont applicables selon l'urgence choisie.
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Combien de temps faut-il pour traiter un retour ?
              </h3>
              <p className="text-gray-600">
                Une fois votre colis reçu dans notre entrepôt français, nous le traitons sous 24-48h ouvrées. 
                Vous recevez des notifications automatiques à chaque étape du processus.
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quels types de retours acceptez-vous ?
              </h3>
              <p className="text-gray-600">
                Nous acceptons tous types de retours : remboursements, échanges, réparations. 
                Compatible avec Amazon, Cdiscount, Fnac, et tous les e-commerçants français qui acceptent les retours.
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Comment puis-je suivre mon retour ?
              </h3>
              <p className="text-gray-600">
                Chaque retour reçoit un numéro de référence unique. Vous pouvez suivre l'avancement en temps réel 
                dans votre tableau de bord et recevrez des notifications email automatiques.
              </p>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Y a-t-il des restrictions sur les produits retournables ?
              </h3>
              <p className="text-gray-600">
                Nous respectons les conditions de retour du e-commerçant concerné. Les produits dangereux, 
                périssables ou interdits au transport ne peuvent pas être traités. Contactez-nous en cas de doute.
              </p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/faq">
              <Button variant="outline" size="lg">
                <i className="ri-question-line mr-2"></i>
                Voir toutes les questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à simplifier vos retours colis ?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Rejoignez des centaines de clients DOM-TOM qui font confiance à ReexpresseTrack 
            pour leurs retours vers la France métropolitaine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                <i className="ri-user-add-line mr-2"></i>
                Créer mon compte gratuit
              </Button>
            </Link>
            <Link to="/gestion-retour">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600">
                <i className="ri-arrow-go-back-line mr-2"></i>
                Gérer mes retours
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-orange-100">
            <p className="text-sm">
              ✅ Inscription gratuite • ✅ Aucun engagement • ✅ Support francophone
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RetourColisDomTom;
