import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';

const AbonnementsBlogPost: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Link to="/" className="hover:text-blue-600">
                  Accueil
                </Link>
                <i className="ri-arrow-right-s-line"></i>
                <Link to="/blog" className="hover:text-blue-600">
                  Blog
                </Link>
                <i className="ri-arrow-right-s-line"></i>
                <span className="text-gray-900">Abonnements DOM-TOM</span>
              </div>
            </nav>

            <div className="flex items-center gap-4 mb-6">
              <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                Abonnements
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  2 Décembre 2024
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  5 min de lecture
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Abonnements DOM-TOM : Des tarifs préférentiels pour vos expéditions
              régulières
            </h1>

            <div className="mb-12">
              <img
                src="https://readdy.ai/api/search-image?query=Premium%20subscription%20service%20concept%20with%20golden%20membership%20cards%2C%20exclusive%20benefits%20display%2C%20regular%20shipping%20packages%20arranged%20neatly%2C%20cost%20savings%20calculator%2C%20VIP%20customer%20service%20area%2C%20French%20overseas%20territories%20map%20with%20premium%20routes%20highlighted%2C%20modern%20business%20environment%2C%20luxury%20service%20presentation&width=800&height=450&seq=subscription1&orientation=landscape"
                alt="Abonnements DOM-TOM premium"
                className="w-full h-96 object-cover object-top rounded-xl shadow-lg"
              />
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Vous expédiez régulièrement vers les DOM-TOM ? Nos formules
                d'abonnement vous font économiser jusqu'à 40% sur vos frais
                d'expédition tout en bénéficiant de services exclusifs.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pourquoi choisir un abonnement ?
              </h2>

              <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-money-euro-circle-line text-green-400 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-green-800">
                      Économies garanties
                    </h3>
                    <div className="mt-2 text-green-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Jusqu'à 40% de réduction sur les tarifs standards</li>
                        <li>Frais de service réduits ou supprimés</li>
                        <li>Accès aux promotions exclusives abonnés</li>
                        <li>Pas de frais cachés, tarification transparente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formules d'abonnement */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {/* Formule Gratuite */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] h-full flex flex-col">
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuit</h3>
                      <div className="text-4xl font-bold text-gray-600 mb-1">0€</div>
                      <div className="text-gray-500">/mois</div>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Adresse française personnelle</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Photos de vos colis</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Suivi en temps réel</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Stockage 3 jours gratuit</span>
                      </li>
                    </ul>
                    
                    <Link to="/inscription">
                      <Button className="w-full bg-gray-600 text-white hover:bg-gray-700 whitespace-nowrap">
                        Commencer gratuitement
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Premium Mensuel */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-500 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] relative h-full flex flex-col">
                  <div className="absolute top-0 left-0 right-0 bg-purple-500 text-white text-center py-2 text-sm font-semibold">
                    LE PLUS POPULAIRE
                  </div>
                  <div className="p-8 pt-16 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Mensuel</h3>
                      <div className="text-4xl font-bold text-purple-600 mb-1">2,50€</div>
                      <div className="text-gray-500">/mois</div>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Tout du forfait gratuit</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">-20% sur expéditions</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Stockage gratuit 60 jours</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Support prioritaire VIP</span>
                      </li>
                    </ul>
                    
                    <Link to="/abonnement">
                      <Button className="w-full bg-purple-600 text-white hover:bg-purple-700 whitespace-nowrap">
                        Choisir Mensuel
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Premium Annuel */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] relative h-full flex flex-col">
                  <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center py-2 text-sm font-semibold">
                    MEILLEURE VALEUR - 2 MOIS GRATUITS
                  </div>
                  <div className="p-8 pt-16 flex-1 flex flex-col">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Annuel</h3>
                      <div className="text-4xl font-bold text-green-600 mb-1">20€</div>
                      <div className="text-gray-500">/an</div>
                      <div className="text-sm text-green-600 font-semibold mt-1">Soit 1,67€/mois</div>
                    </div>
                    
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Tout du forfait gratuit</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">-20% sur expéditions</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Stockage gratuit 90 jours</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-check-line text-green-500"></i>
                        <span className="text-gray-600">Support prioritaire VIP</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <i className="ri-star-line text-yellow-500"></i>
                        <span className="text-gray-600 font-semibold">Économise 10€/an</span>
                      </li>
                    </ul>
                    
                    <Link to="/abonnement">
                      <Button className="w-full bg-green-600 text-white hover:bg-green-700 whitespace-nowrap">
                        Choisir Annuel
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Calculez vos économies
              </h2>

              <div className="bg-blue-50 rounded-xl p-8 mb-8">
                <h3 className="text-xl font-bold text-blue-800 mb-6 text-center">
                  Exemple concret : 4 colis par mois vers la Martinique
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                      <i className="ri-close-circle-line"></i>
                      Sans abonnement
                    </h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>4 colis × 12,50€</span>
                        <span className="font-semibold">50,00€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais de service</span>
                        <span className="font-semibold">6,00€</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-bold text-red-600">
                        <span>Total mensuel</span>
                        <span>56,00€</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 border-2 border-purple-500">
                    <h4 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                      <i className="ri-check-circle-line"></i>
                      Avec Premium Mensuel
                    </h4>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex justify-between">
                        <span>Abonnement mensuel</span>
                        <span className="font-semibold">2,50€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4 colis × 10,00€ (-20%)</span>
                        <span className="font-semibold">40,00€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais de service</span>
                        <span className="font-semibold text-green-600">0,00€</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between text-lg font-bold text-purple-600">
                        <span>Total mensuel</span>
                        <span>42,50€</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Économie</span>
                        <span>-13,50€/mois</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    <i className="ri-money-euro-circle-line"></i>
                    <span className="font-semibold">
                      Économie annuelle : 162€ avec Premium Mensuel
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-green-100 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">💡 Avec Premium Annuel (20€/an) :</h4>
                  <div className="text-green-700 text-sm space-y-1">
                    <div>• Abonnement : 20€/an (1,67€/mois)</div>
                    <div>• 4 colis/mois × 10€ (-20%) = 40€/mois</div>
                    <div>• <strong>Total mensuel : 41,67€ (-14,33€/mois)</strong></div>
                    <div>• <strong>Économie annuelle : 172€ + 10€ d'économie sur l'abonnement = 182€</strong></div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Services exclusifs inclus
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-customer-service-2-line text-purple-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Support client VIP
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Ligne dédiée, gestionnaire personnel (Premium), réponse garantie
                    sous 2h.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Chat prioritaire 7j/7</li>
                    <li>• Numéro de téléphone direct</li>
                    <li>• Email dédié avec réponse rapide</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-camera-line text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Photos avant expédition
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vérification visuelle systématique de vos colis avant leur
                    départ.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• État du colis à réception</li>
                    <li>• Contenu vérifié et photographié</li>
                    <li>• Emballage renforcé si nécessaire</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-archive-line text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Stockage gratuit prolongé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Gardez vos colis en sécurité dans nos entrepôts le temps que
                    vous voulez.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• 30 jours (Confort) ou 60 jours (Premium)</li>
                    <li>• Consolidation gratuite des colis</li>
                    <li>• Conditions de stockage optimales</li>
                  </ul>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-flashlight-line text-orange-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Accès aux ventes privées
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Profitez en avant-première de nos promotions et offres
                    spéciales.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Réductions additionnelles période de soldes</li>
                    <li>• Accès anticipé aux promotions</li>
                    <li>• Offres exclusives abonnés</li>
                  </ul>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Témoignages d'abonnés
              </h2>

              <div className="space-y-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      S
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-gray-900">
                          Sophie M.
                        </div>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Confort
                        </span>
                        <div className="text-sm text-gray-500">
                          • Pointe-à-Pitre, Guadeloupe
                        </div>
                      </div>
                      <p className="text-gray-600 italic">
                        "L'abonnement Confort me fait économiser plus de 80€ par
                        mois ! Le service photos avant expédition m'a évité
                        plusieurs problèmes. Je recommande vivement !"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      A
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-gray-900">
                          Antoine R.
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Premium
                        </span>
                        <div className="text-sm text-gray-500">
                          • Saint-Pierre, La Réunion
                        </div>
                      </div>
                      <p className="text-gray-600 italic">
                        "Avec mon gestionnaire dédié, j'ai l'impression d'avoir mon
                        propre service logistique ! Pour mon activité e-commerce,
                        c'est parfait. ROI positif dès le 2ème mois."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Essai gratuit de 30 jours
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Testez votre formule d'abonnement sans engagement. Résiliation
                  possible à tout moment.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/abonnement"
                    className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                  >
                    Commencer l'essai gratuit
                  </Link>
                  <Link
                    to="/calculateur"
                    className="bg-orange-500/20 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-500/30 transition-colors whitespace-nowrap border border-white/30"
                  >
                    Calculer mes économies
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default AbonnementsBlogPost;
