
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

const AchatPourMoiProcessus: React.FC = () => {
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
                <span className="text-gray-900">Achat pour moi - Processus complet</span>
              </div>
            </nav>

            <div className="flex items-center gap-4 mb-6">
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                Services Premium
              </span>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                Processus détaillé
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  18 Décembre 2024
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  8 min de lecture
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Achat pour moi : Le processus complet de votre assistant d'achat personnel
            </h1>

            <div className="mb-12">
              <img
                src="https://readdy.ai/api/search-image?query=Professional%20personal%20shopping%20assistant%20service%20showing%20complete%20process%20from%20French%20retail%20stores%20to%20overseas%20delivery%2C%20modern%20logistics%20center%20with%20dedicated%20shopping%20team%2C%20step-by-step%20workflow%20visualization%2C%20organized%20facility%20with%20product%20selection%20packaging%20and%20international%20shipping%20to%20tropical%20destinations%2C%20clean%20professional%20environment%20with%20Action%20store%20products%20being%20processed&width=800&height=450&seq=processus-complet&orientation=landscape"
                alt="Processus complet du service Achat pour moi"
                className="w-full h-96 object-cover object-top rounded-xl shadow-lg"
              />
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Découvrez en détail comment fonctionne notre service "Achat pour moi", 
                de votre demande initiale jusqu'à la réception de vos produits dans votre DOM-TOM. 
                Un processus simple, transparent et entièrement géré par nos équipes expertes.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pourquoi choisir notre service d'achat personnel ?
              </h2>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8 mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      <i className="ri-store-2-line text-green-600 mr-2"></i>
                      Accès aux magasins français
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Profitez de l'accès exclusif aux magasins Action et à tous les autres commerces français 
                      qui ne livrent pas vers les DOM-TOM.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center"><i className="ri-check-line text-green-600 mr-2"></i>Action (déco, maison, jouets)</li>
                      <li className="flex items-center"><i className="ri-check-line text-green-600 mr-2"></i>Magasins spécialisés</li>
                      <li className="flex items-center"><i className="ri-check-line text-green-600 mr-2"></i>Boutiques exclusives</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      <i className="ri-hand-heart-line text-blue-600 mr-2"></i>
                      Service personnalisé
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Nos équipes dédiées s'occupent de tout : sélection, achat, vérification, 
                      emballage et expédition vers votre destination.
                    </p>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i>Vérification qualité</li>
                      <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i>Emballage sécurisé</li>
                      <li className="flex items-center"><i className="ri-check-line text-blue-600 mr-2"></i>Photos avant envoi</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Le processus étape par étape
              </h2>

              <div className="space-y-12 mb-12">
                {/* Étape 1 */}
                <div className="relative">
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        1
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Saisie de votre demande d'achat
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Ce que vous devez fournir :</h4>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start"><i className="ri-arrow-right-s-line text-blue-600 mr-2 mt-1"></i>Nom du magasin (ex: Action)</li>
                            <li className="flex items-start"><i className="ri-arrow-right-s-line text-blue-600 mr-2 mt-1"></i>URL du site web</li>
                            <li className="flex items-start"><i className="ri-arrow-right-s-line text-blue-600 mr-2 mt-1"></i>Liste détaillée des articles</li>
                            <li className="flex items-start"><i className="ri-arrow-right-s-line text-blue-600 mr-2 mt-1"></i>Options spécifiques (couleur, taille)</li>
                            <li className="flex items-start"><i className="ri-arrow-right-s-line text-blue-600 mr-2 mt-1"></i>Quantités souhaitées</li>
                          </ul>
                        </div>
                        <div>
                          <img
                            src="https://readdy.ai/api/search-image?query=Modern%20customer%20interface%20showing%20detailed%20purchase%20request%20form%20for%20personal%20shopping%20service%2C%20computer%20screen%20displaying%20Action%20store%20website%2C%20user%20filling%20product%20selection%20fields%20with%20specific%20requirements%2C%20clean%20office%20setup%20with%20professional%20customer%20service%20environment%2C%20French%20shopping%20websites%20on%20multiple%20monitors&width=400&height=250&seq=demande-achat&orientation=landscape"
                            alt="Formulaire de demande d'achat"
                            className="w-full h-48 object-cover object-top rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <i className="ri-lightbulb-line text-blue-400 text-xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-blue-800">
                              <strong>Astuce :</strong> Plus votre demande est précise, plus nous pouvons répondre exactement 
                              à vos attentes. N'hésitez pas à détailler vos préférences !
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="relative">
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        2
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Nos équipes s'occupent de l'achat dans les magasins
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Notre processus d'achat :</h4>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start"><i className="ri-search-line text-green-600 mr-2 mt-1"></i>Recherche des produits en magasin</li>
                            <li className="flex items-start"><i className="ri-eye-line text-green-600 mr-2 mt-1"></i>Vérification de la disponibilité</li>
                            <li className="flex items-start"><i className="ri-checkbox-circle-line text-green-600 mr-2 mt-1"></i>Sélection selon vos critères</li>
                            <li className="flex items-start"><i className="ri-shopping-cart-line text-green-600 mr-2 mt-1"></i>Achat sécurisé par nos soins</li>
                            <li className="flex items-start"><i className="ri-camera-line text-green-600 mr-2 mt-1"></i>Photos des produits achetés</li>
                          </ul>
                        </div>
                        <div>
                          <img
                            src="https://readdy.ai/api/search-image?query=Professional%20shopper%20team%20working%20in%20Action%20store%20interior%2C%20staff%20members%20carefully%20selecting%20products%20from%20colorful%20shelves%2C%20shopping%20cart%20filled%20with%20home%20decor%20and%20household%20items%2C%20quality%20verification%20process%20with%20product%20inspection%2C%20modern%20retail%20environment%20with%20organized%20product%20displays&width=400&height=250&seq=achat-magasin&orientation=landscape"
                            alt="Équipe effectuant les achats en magasin"
                            className="w-full h-48 object-cover object-top rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-400 p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <i className="ri-shield-check-line text-green-400 text-xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-green-800">
                              <strong>Garantie qualité :</strong> Nous vérifions chaque article avant achat 
                              et vous envoyons des photos pour validation si nécessaire.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="relative">
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        3
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Emballage professionnel et sécurisé
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Notre processus d'emballage :</h4>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start"><i className="ri-box-3-line text-purple-600 mr-2 mt-1"></i>Emballage adapté à chaque produit</li>
                            <li className="flex items-start"><i className="ri-shield-line text-purple-600 mr-2 mt-1"></i>Protection renforcée pour le transport</li>
                            <li className="flex items-start"><i className="ri-bubble-chart-line text-purple-600 mr-2 mt-1"></i>Film plastique et papier bulle</li>
                            <li className="flex items-start"><i className="ri-price-tag-3-line text-purple-600 mr-2 mt-1"></i>Étiquetage personnalisé</li>
                            <li className="flex items-start"><i className="ri-camera-3-line text-purple-600 mr-2 mt-1"></i>Photos du colis finalisé</li>
                          </ul>
                        </div>
                        <div>
                          <img
                            src="https://readdy.ai/api/search-image?query=Professional%20packaging%20facility%20with%20Action%20store%20products%20being%20carefully%20wrapped%20for%20international%20shipping%2C%20workers%20wearing%20gloves%20using%20bubble%20wrap%20and%20protective%20materials%2C%20various%20sized%20boxes%20and%20shipping%20supplies%2C%20quality%20control%20station%20with%20packaged%20items%20ready%20for%20overseas%20delivery%20to%20tropical%20destinations&width=400&height=250&seq=emballage-professionnel&orientation=landscape"
                            alt="Centre d'emballage professionnel"
                            className="w-full h-48 object-cover object-top rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <i className="ri-truck-line text-purple-400 text-xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-purple-800">
                              <strong>Transport sécurisé :</strong> Chaque colis est emballé pour résister 
                              aux conditions de transport longue distance vers les DOM-TOM.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 4 */}
                <div className="relative">
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        4
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Vous recevez le montant à régler via votre espace client
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Détail de la facturation :</h4>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start"><i className="ri-price-tag-2-line text-orange-600 mr-2 mt-1"></i>Prix des articles achetés</li>
                            <li className="flex items-start"><i className="ri-service-line text-orange-600 mr-2 mt-1"></i>Frais de service (14,99€ ou 19,99€)</li>
                            <li className="flex items-start"><i className="ri-ship-line text-orange-600 mr-2 mt-1"></i>Frais d'expédition DOM-TOM</li>
                            <li className="flex items-start"><i className="ri-shield-check-line text-orange-600 mr-2 mt-1"></i>Assurance incluse</li>
                            <li className="flex items-start"><i className="ri-calculator-line text-orange-600 mr-2 mt-1"></i>Total transparent</li>
                          </ul>
                        </div>
                        <div>
                          <img
                            src="https://readdy.ai/api/search-image?query=Modern%20customer%20dashboard%20interface%20displaying%20detailed%20invoice%20breakdown%20for%20personal%20shopping%20service%2C%20computer%20screen%20showing%20itemized%20costs%20and%20transparent%20pricing%20structure%2C%20secure%20payment%20options%20via%20Stripe%2C%20professional%20billing%20system%20with%20user-friendly%20account%20management%20interface&width=400&height=250&seq=facturation-client&orientation=landscape"
                            alt="Interface de facturation dans l'espace client"
                            className="w-full h-48 object-cover object-top rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                      <div className="bg-orange-50 border-l-4 border-orange-400 p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <i className="ri-secure-payment-line text-orange-400 text-xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-orange-800">
                              <strong>Paiement sécurisé :</strong> Tous les paiements sont traités via Stripe 
                              pour une sécurité maximale de vos données bancaires.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Étape 5 */}
                <div className="relative">
                  <div className="flex items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                        5
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Expédition rapide vers votre DOM-TOM
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Process d'expédition :</h4>
                          <ul className="space-y-2 text-gray-600">
                            <li className="flex items-start"><i className="ri-plane-line text-red-600 mr-2 mt-1"></i>Expédition sous 48h après paiement</li>
                            <li className="flex items-start"><i className="ri-map-pin-line text-red-600 mr-2 mt-1"></i>Livraison dans tous les DOM-TOM</li>
                            <li className="flex items-start"><i className="ri-radar-line text-red-600 mr-2 mt-1"></i>Suivi en temps réel</li>
                            <li className="flex items-start"><i className="ri-notification-3-line text-red-600 mr-2 mt-1"></i>Notifications automatiques</li>
                            <li className="flex items-start"><i className="ri-customer-service-2-line text-red-600 mr-2 mt-1"></i>Support client dédié</li>
                          </ul>
                        </div>
                        <div>
                          <img
                            src="https://readdy.ai/api/search-image?query=International%20shipping%20facility%20with%20packages%20ready%20for%20delivery%20to%20French%20overseas%20territories%2C%20airplane%20cargo%20loading%20area%20with%20tropical%20destination%20labels%2C%20professional%20logistics%20center%20with%20tracking%20systems%20and%20delivery%20coordination%2C%20world%20map%20showing%20shipping%20routes%20from%20France%20to%20Caribbean%20and%20Indian%20Ocean%20islands&width=400&height=250&seq=expedition-domtom&orientation=landscape"
                            alt="Centre d'expédition internationale"
                            className="w-full h-48 object-cover object-top rounded-lg shadow-md"
                          />
                        </div>
                      </div>
                      <div className="bg-red-50 border-l-4 border-red-400 p-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <i className="ri-time-line text-red-400 text-xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-red-800">
                              <strong>Délais de livraison :</strong> 7-15 jours ouvrés selon votre destination, 
                              avec suivi complet de votre colis jusqu'à réception.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tarification transparente
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-8 border-2 border-blue-200 bg-blue-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-vip-crown-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Abonnés Premium</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-4">14,99€</div>
                    <p className="text-gray-700 mb-6">
                      Par commande + prix des articles
                    </p>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Service d'achat complet</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Emballage professionnel</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Photos avant envoi</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Support prioritaire</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border-2 border-gray-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-user-line text-white text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Compte Découverte</h3>
                    <div className="text-4xl font-bold text-gray-600 mb-4">19,99€</div>
                    <p className="text-gray-700 mb-6">
                      Par commande + prix des articles
                    </p>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Service d'achat complet</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Emballage professionnel</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Photos avant envoi</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-line mr-2"></i>
                        <span className="text-sm">Support standard</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <div className="flex items-center mb-4">
                  <i className="ri-lightbulb-line text-yellow-600 text-2xl mr-3"></i>
                  <h3 className="text-xl font-bold text-gray-900">Économisez avec l'abonnement Premium !</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Avec un abonnement Premium, vous économisez 5€ sur chaque commande "Achat pour moi". 
                  Si vous passez plus de 3 commandes par an, l'abonnement est déjà rentabilisé !
                </p>
                <Link to="/abonnement" className="text-yellow-700 hover:text-yellow-800 font-semibold">
                  Découvrir l'abonnement Premium →
                </Link>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Exemples de produits populaires d'Action
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]">
                  <img
                    src="https://readdy.ai/api/search-image?query=Action%20store%20home%20decoration%20section%20with%20beautiful%20candles%20picture%20frames%20decorative%20objects%20modern%20home%20accessories%20colorful%20interior%20design%20products%20affordable%20stylish%20household%20decorations%20displayed%20on%20organized%20store%20shelves%20cozy%20living%20room%20inspiration&width=300&height=200&seq=action-deco&orientation=landscape"
                    alt="Déco et maison Action"
                    className="w-full h-40 object-cover object-top"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Déco & Maison</h3>
                    <p className="text-gray-600 text-sm">Bougies, cadres, objets décoratifs, accessoires cuisine</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]">
                  <img
                    src="https://readdy.ai/api/search-image?query=Action%20store%20toys%20and%20games%20section%20with%20colorful%20children%20toys%20board%20games%20educational%20toys%20creative%20craft%20kits%20outdoor%20play%20equipment%20puzzles%20and%20building%20blocks%20family%20entertainment%20products%20arranged%20attractively%20on%20store%20shelves&width=300&height=200&seq=action-jouets&orientation=landscape"
                    alt="Jouets et loisirs Action"
                    className="w-full h-40 object-cover object-top"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Jouets & Loisirs</h3>
                    <p className="text-gray-600 text-sm">Jeux de société, jouets créatifs, puzzles, sport</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]">
                  <img
                    src="https://readdy.ai/api/search-image?query=Action%20store%20garden%20and%20outdoor%20section%20with%20plants%20gardening%20tools%20outdoor%20furniture%20BBQ%20accessories%20plant%20pots%20garden%20decorations%20seasonal%20outdoor%20products%20patio%20and%20balcony%20items%20displayed%20in%20attractive%20retail%20environment&width=300&height=200&seq=action-jardin&orientation=landscape"
                    alt="Jardin et extérieur Action"
                    className="w-full h-40 object-cover object-top"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Jardin & Extérieur</h3>
                    <p className="text-gray-600 text-sm">Plantes, outils jardinage, mobilier extérieur, barbecue</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Témoignages clients
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Sophie M.</div>
                      <div className="text-sm text-gray-500">Fort-de-France, Martinique</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "J'ai commandé de la déco Action pour ma nouvelle maison. Le service était parfait ! 
                    J'ai reçu des photos de chaque article avant l'envoi. Tout est arrivé en parfait état."
                  </p>
                  <div className="flex text-yellow-400">
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Antoine L.</div>
                      <div className="text-sm text-gray-500">Saint-Denis, La Réunion</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "Super service ! J'ai pu avoir tous les jouets Action que je voulais pour mes enfants. 
                    L'emballage était impeccable et la livraison plus rapide que prévu."
                  </p>
                  <div className="flex text-yellow-400">
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                  </div>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à découvrir nos produits Action ?
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Faites votre première demande d'achat et laissez-nous nous occuper de tout !
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/achat-pour-moi"
                    className="bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap inline-block"
                  >
                    <i className="ri-shopping-cart-line mr-2"></i>
                    Faire une demande d'achat
                  </Link>
                  <Link
                    to="/calculateur"
                    className="bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-green-600 transition-colors whitespace-nowrap inline-block"
                  >
                    <i className="ri-calculator-line mr-2"></i>
                    Calculer les frais
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

export default AchatPourMoiProcessus;
