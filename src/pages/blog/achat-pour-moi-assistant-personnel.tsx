
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

const AchatPourMoiBlogPost: React.FC = () => {
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
                <span className="text-gray-900">Achat pour moi</span>
              </div>
            </nav>

            <div className="flex items-center gap-4 mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                Services
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  5 Décembre 2024
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  6 min de lecture
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Achat pour moi : Votre assistant personnel d'achat en France
            </h1>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="group">
                <div className="relative overflow-hidden rounded-xl mb-4 h-64">
                  <img
                    src="https://static.readdy.ai/image/99ff8ee0c27f1c25e3ad19898dcaee78/11282ebbcf6fa45bda6f4d52ded1b93b.png"
                    alt="Service d'achat pour moi : Votre assistant personnel d'expédition"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Vous rêvez d'un produit disponible uniquement en France métropolitaine ? 
                Notre service "Achat pour moi" transforme vos envies en réalité, 
                directement livrées dans votre DOM-TOM.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pourquoi utiliser notre service d'achat ?
              </h2>

              <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-close-circle-line text-red-400 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">
                      Les obstacles habituels
                    </h3>
                    <div className="mt-2 text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Sites qui ne livrent pas vers les DOM-TOM</li>
                        <li>Moyens de paiement non acceptés</li>
                        <li>Produits exclusifs à la France métropolitaine</li>
                        <li>Promotions et soldes inaccessibles</li>
                        <li>Services après-vente compliqués</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Comment fonctionne notre service ?
              </h2>

              <div className="space-y-8 mb-8">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Partagez votre liste d'envies
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Envoyez-nous les liens des produits que vous souhaitez, 
                      avec vos préférences (taille, couleur, quantité).
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Informations à nous communiquer :</h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Lien exact du produit souhaité</li>
                        <li>• Spécifications (taille, couleur, modèle)</li>
                        <li>• Quantité désirée</li>
                        <li>• Budget maximum si applicable</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Nous établissons un devis personnalisé
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Notre équipe vérifie la disponibilité, négocie les meilleurs prix 
                      et vous propose un devis transparent incluant tous les frais.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Le devis comprend :</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Prix d'achat du produit</li>
                        <li>• Frais de service (3% du montant)</li>
                        <li>• Frais d'expédition vers votre DOM-TOM</li>
                        <li>• Assurance et options éventuelles</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Achat et préparation professionnels
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Une fois votre accord donné, nous effectuons l'achat, 
                      vérifions la qualité et préparons soigneusement votre commande.
                    </p>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 mb-2">Notre processus qualité :</h4>
                      <ul className="text-purple-700 text-sm space-y-1">
                        <li>• Vérification de l'état à réception</li>
                        <li>• Photos envoyées avant expédition</li>
                        <li>• Emballage renforcé pour le transport</li>
                        <li>• Assurance automatique incluse</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Expédition et suivi jusqu'à livraison
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Expédition rapide vers votre DOM-TOM avec suivi complet 
                      et support client dédié tout au long du processus.
                    </p>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Services inclus :</h4>
                      <ul className="text-orange-700 text-sm space-y-1">
                        <li>• Suivi en temps réel</li>
                        <li>• Support client francophone</li>
                        <li>• Gestion des éventuels problèmes douaniers</li>
                        <li>• Service après-vente personnalisé</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Nos spécialités d'achat
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-shirt-line text-pink-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mode & Beauty</h3>
                  <p className="text-gray-600 text-sm">
                    Vêtements de créateurs, cosmétiques exclusifs, 
                    accessoires de mode dernière tendance.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-smartphone-line text-blue-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">High-Tech</h3>
                  <p className="text-gray-600 text-sm">
                    Derniers smartphones, gadgets innovants, 
                    équipements informatiques de pointe.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-home-4-line text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Maison & Déco</h3>
                  <p className="text-gray-600 text-sm">
                    Mobilier design, objets déco tendance, 
                    équipements pour la maison.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-book-line text-yellow-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Culture & Loisirs</h3>
                  <p className="text-gray-600 text-sm">
                    Livres, instruments de musique, 
                    articles de sport spécialisés.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-heart-pulse-line text-red-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Santé & Bien-être</h3>
                  <p className="text-gray-600 text-sm">
                    Compléments alimentaires, équipements fitness, 
                    produits de bien-être naturels.
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-gift-line text-purple-600 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cadeaux Exclusifs</h3>
                  <p className="text-gray-600 text-sm">
                    Éditions limitées, produits artisanaux, 
                    cadeaux personnalisés uniques.
                  </p>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tarification transparente
              </h2>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Frais de service : 3% seulement
                  </h3>
                  <p className="text-gray-600">
                    Sur le montant total de vos achats, plafonné à 50€ par commande
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-3xl font-bold text-blue-600 mb-2">3%</div>
                    <div className="text-sm text-gray-600 mb-2">Frais de service</div>
                    <div className="text-xs text-gray-500">Achat + vérification + préparation</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-3xl font-bold text-green-600 mb-2">0€</div>
                    <div className="text-sm text-gray-600 mb-2">Frais cachés</div>
                    <div className="text-xs text-gray-500">Transparence totale garantie</div>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="text-3xl font-bold text-purple-600 mb-2">50€</div>
                    <div className="text-sm text-gray-600 mb-2">Plafond maximum</div>
                    <div className="text-xs text-gray-500">Même pour les gros achats</div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Témoignages clients
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      M
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Marie L.</div>
                      <div className="text-sm text-gray-500">Fort-de-France, Martinique</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "J'ai pu enfin obtenir le sac Hermès que je voulais depuis des années ! 
                    Le service était impeccable, photos à l'appui avant envoi."
                  </p>
                  <div className="flex text-yellow-400">
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      J
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Jean-Claude R.</div>
                      <div className="text-sm text-gray-500">Saint-Denis, La Réunion</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic mb-4">
                    "Équipement photo professionnel acheté en 48h ! Même emballage que si 
                    j'avais acheté directement en magasin. Service au top !"
                  </p>
                  <div className="flex text-yellow-400">
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                    <i className="ri-star-fill"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Concrétisez vos envies d'achat dès aujourd'hui
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Partagez-nous votre liste et recevez un devis personnalisé sous 24h
                </p>
                <Link
                  to="/achat-pour-moi"
                  className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap inline-block"
                >
                  Faire une demande d'achat
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

export default AchatPourMoiBlogPost;
