import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

const CalculateurTarifsBlogPost: React.FC = () => {
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
                <span className="text-gray-900">Calculateur de tarifs</span>
              </div>
            </nav>

            {/* Article Meta */}
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                Outils
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  10 Décembre 2024
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  3 min de lecture
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Calculateur de tarifs : Optimisez vos coûts d'expédition
            </h1>

            <div className="mb-12">
              <img 
                alt="Calculateur de tarifs d'expédition"
                className="w-full h-96 object-cover object-top rounded-xl shadow-lg"
                src="https://readdy.ai/api/search-image?query=Professional%20shipping%20calculator%20dashboard%20interface%20on%20modern%20computer%20screen%2C%20clear%20pricing%20tables%20showing%20DOM%20TOM%20shipping%20rates%2C%20world%20map%20highlighting%20French%20overseas%20territories%20in%20bright%20colors%2C%20calculator%20and%20pricing%20charts%20visible%2C%20clean%20white%20background%2C%20professional%20business%20office%20setting%2C%20high%20contrast%20and%20sharp%20details%2C%20modern%20logistics%20technology%20interface&width=800&height=450&seq=calc2&orientation=landscape"
              />
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Maîtrisez parfaitement vos coûts d'expédition vers les DOM-TOM grâce à notre calculateur intelligent. 
                Un outil indispensable pour budgétiser précisément vos envois.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pourquoi utiliser notre calculateur ?
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-lightbulb-line text-blue-400 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-blue-800">
                      Les avantages clés
                    </h3>
                    <div className="mt-2 text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Calcul instantané et précis des frais d'expédition</li>
                        <li>Comparaison entre différentes zones DOM-TOM</li>
                        <li>Optimisation automatique selon poids et dimensions</li>
                        <li>Transparence totale sur les tarifs appliqués</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Comment utiliser l'outil ?
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-scales-3-line text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    1. Saisissez les dimensions
                  </h3>
                  <p className="text-gray-600">
                    Indiquez le poids, la longueur, largeur et hauteur de votre colis 
                    pour un calcul précis du tarif.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-map-pin-2-line text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    2. Choisissez la destination
                  </h3>
                  <p className="text-gray-600">
                    Sélectionnez votre territoire DOM-TOM parmi les zones 
                    disponibles pour appliquer le bon tarif.
                  </p>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Zones tarifaires DOM-TOM
              </h2>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Zone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Territoires</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tarif de base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">Zone 1</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Guadeloupe, Martinique, Guyane</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">8,50€</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">Zone 2</td>
                        <td className="px-6 py-4 text-sm text-gray-600">La Réunion, Mayotte</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">12,90€</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">Zone 3</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Nouvelle-Calédonie, Polynésie</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">18,50€</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Facteurs influençant le prix
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <i className="ri-scales-line text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Poids du colis
                    </h3>
                    <p className="text-gray-600">
                      Le facteur principal. Tarifs dégressifs par tranches : 
                      0-500g, 500g-1kg, 1-2kg, 2-5kg, etc.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center">
                    <i className="ri-ruler-line text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Dimensions (poids volumétrique)
                    </h3>
                    <p className="text-gray-600">
                      Pour les colis volumineux, le poids volumétrique peut s'appliquer 
                      selon la formule : L × l × H ÷ 5000.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <i className="ri-map-pin-line text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Zone de destination
                    </h3>
                    <p className="text-gray-600">
                      Chaque zone DOM-TOM a ses propres tarifs selon la distance 
                      et les contraintes logistiques.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <i className="ri-time-line text-sm"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Options supplémentaires
                    </h3>
                    <p className="text-gray-600">
                      Assurance, livraison express, signature requise : 
                      chaque option a un impact sur le tarif final.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Conseils d'optimisation
              </h2>

              <div className="bg-green-50 rounded-xl p-8 mb-8">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  💡 Astuces pour économiser
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Regroupez vos achats</h4>
                    <p className="text-green-600 text-sm">
                      Consolidez plusieurs articles dans un même envoi pour optimiser 
                      le rapport poids/prix.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Optimisez l'emballage</h4>
                    <p className="text-green-600 text-sm">
                      Utilisez un emballage adapté pour éviter les frais de poids volumétrique.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Choisissez le bon moment</h4>
                    <p className="text-green-600 text-sm">
                      Profitez de nos promotions saisonnières pour réduire vos coûts.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Souscrivez un abonnement</h4>
                    <p className="text-green-600 text-sm">
                      Nos formules d'abonnement offrent des tarifs préférentiels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Testez notre calculateur maintenant
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Obtenez un devis précis en quelques clics et optimisez vos expéditions
                </p>
                <Link
                  to="/calculateur"
                  className="bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap inline-block"
                >
                  Utiliser le calculateur
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

export default CalculateurTarifsBlogPost;
