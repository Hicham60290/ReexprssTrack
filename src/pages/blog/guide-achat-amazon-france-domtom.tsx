
import React from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

export default function GuideAchatAmazonDOMTOM() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <article className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Guide Complet : Acheter sur Amazon France depuis les DOM-TOM et le Maroc avec ReexpresseTrack
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Économisez jusqu'à 60% sur vos achats Amazon en utilisant notre service de réexpédition vers la Guadeloupe, Martinique, Réunion, Guyane française et le Maroc
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <span>Publié le 15 janvier 2024</span>
              <span className="mx-2">•</span>
              <span>Temps de lecture : 8 min</span>
            </div>
          </div>

          {/* Table des matières */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Table des Matières</h2>
            <ul className="space-y-2">
              <li><a href="#pourquoi-reexpedition" className="text-blue-600 hover:underline">1. Pourquoi utiliser la réexpédition pour Amazon ?</a></li>
              <li><a href="#etapes-commande" className="text-blue-600 hover:underline">2. Étapes pour commander avec ReexpresseTrack</a></li>
              <li><a href="#produits-autorises" className="text-blue-600 hover:underline">3. Produits autorisés et interdits</a></li>
              <li><a href="#economies" className="text-blue-600 hover:underline">4. Calcul des économies réalisées</a></li>
              <li><a href="#conseils-optimisation" className="text-blue-600 hover:underline">5. Conseils pour optimiser vos achats</a></li>
            </ul>
          </Card>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            <section id="pourquoi-reexpedition" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Pourquoi Utiliser la Réexpédition Amazon pour les DOM-TOM et le Maroc ?
              </h2>
              
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-money-euro-circle-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Économies Substantielles</h3>
                    <p className="text-blue-800">
                      Les frais d'expédition directs Amazon vers les DOM-TOM et le Maroc peuvent atteindre 25-35€ par colis. 
                      Avec ReexpresseTrack, réduisez ces coûts de 40 à 60% en moyenne.
                    </p>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Avantages Concrets :</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <i className="ri-check-circle-fill text-green-600 mr-3 mt-1"></i>
                  <span><strong>Consolidation de colis :</strong> Groupez vos achats pour économiser encore plus</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-circle-fill text-green-600 mr-3 mt-1"></i>
                  <span><strong>Accès aux produits non expédiés :</strong> Commandez des articles qu'Amazon n'expédie pas vers les DOM-TOM et le Maroc</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-circle-fill text-green-600 mr-3 mt-1"></i>
                  <span><strong>Stockage flexible :</strong> Jusqu'à 90 jours de stockage gratuit avec nos abonnements</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-circle-fill text-green-600 mr-3 mt-1"></i>
                  <span><strong>Service client français :</strong> Support en français par des experts</span>
                </li>
              </ul>
            </section>

            <section id="etapes-commande" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Guide Étape par Étape : Commander sur Amazon avec ReexpresseTrack
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">1</div>
                    <h3 className="font-semibold text-gray-900">Inscription ReexpresseTrack</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Créez votre compte gratuit et obtenez votre adresse française personnalisée. 
                    Format : ReexpresseTrack, [Votre Nom] - Box [Numéro], 53 BIS Route de Mouy, 60290 Cauffry
                  </p>
                </Card>

                <Card>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">2</div>
                    <h3 className="font-semibold text-gray-900">Commande Amazon</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Ajoutez votre adresse ReexpresseTrack comme adresse de livraison sur Amazon.fr. 
                    Vérifiez que le vendeur livre bien en France métropolitaine.
                  </p>
                </Card>

                <Card>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">3</div>
                    <h3 className="font-semibold text-gray-900">Déclaration Colis</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Connectez-vous à votre espace ReexpresseTrack et déclarez votre colis avec le numéro de commande Amazon. 
                    Cela nous aide à l'identifier rapidement.
                  </p>
                </Card>

                <Card>
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">4</div>
                    <h3 className="font-semibold text-gray-900">Réception & Expédition</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Nous recevons votre colis, vous envoyons une photo, puis vous choisissez votre mode d'expédition 
                    (Standard 7-14 jours, Express 3-7 jours).
                  </p>
                </Card>
              </div>
            </section>

            <section id="produits-autorises" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Produits Autorisés et Restrictions pour les DOM-TOM et le Maroc
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-green-200 bg-green-50">
                  <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                    <i className="ri-check-circle-line text-green-600 mr-2"></i>
                    Produits Autorisés
                  </h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>• Électronique grand public (smartphones, tablets)</li>
                    <li>• Vêtements et accessoires</li>
                    <li>• Livres, média, jeux vidéo</li>
                    <li>• Produits de beauté non liquides</li>
                    <li>• Articles de sport et loisirs</li>
                    <li>• Bijoux et montres (déclaration obligatoire)</li>
                  </ul>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <h3 className="font-semibold text-red-900 mb-4 flex items-center">
                    <i className="ri-close-circle-line text-red-600 mr-2"></i>
                    Produits Interdits/Restreints
                  </h3>
                  <ul className="space-y-2 text-sm text-red-800">
                    <li>• Liquides (parfums, cosmétiques liquides)</li>
                    <li>• Batteries lithium non installées</li>
                    <li>• Médicaments et compléments alimentaires</li>
                    <li>• Armes et objets contondants</li>
                    <li>• Produits périssables</li>
                    <li>• Articles contrefaits</li>
                  </ul>
                </Card>
              </div>

              <Card className="mt-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start">
                  <i className="ri-alert-line text-yellow-600 mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Important : Déclaration Douanière</h4>
                    <p className="text-yellow-800 text-sm">
                      Tous les colis sont soumis à la réglementation douanière. Les articles de plus de 22€ 
                      peuvent être soumis à des taxes selon la destination. ReexpresseTrack vous aide avec les formalités.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section id="economies" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Calcul des Économies : Exemples Concrets
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Destination</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Amazon Direct</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">ReexpresseTrack</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Économie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3">Guadeloupe (2kg)</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">35,90€</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">18,90€</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">-47% (17€)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3">Martinique (1kg)</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">28,90€</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">15,90€</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">-45% (13€)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">La Réunion (3kg)</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">42,90€</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">22,90€</td>  
                      <td className="px-4 py-3 text-blue-600 font-semibold">-47% (20€)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3">Guyane française (2kg)</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">38,90€</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">19,90€</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">-49% (19€)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Maroc (2kg)</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">29,90€</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">12,90€</td>
                      <td className="px-4 py-3 text-blue-600 font-semibold">-57% (17€)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Card className="mt-6 bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Astuce Premium</h4>
                <p className="text-blue-800 text-sm">
                  Avec l'abonnement ReexpresseTrack Premium (2,50€/mois), bénéficiez de -20% supplémentaires 
                  sur tous vos frais d'expédition vers les DOM-TOM et le Maroc. Rentabilisé dès le premier envoi !
                </p>
              </Card>
            </section>

            <section id="conseils-optimisation" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Conseils pour Optimiser vos Achats Amazon
              </h2>

              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <i className="ri-lightbulb-line text-green-600 mr-2"></i>
                    Consolidation de Colis
                  </h4>
                  <p className="text-green-800 text-sm mb-3">
                    Attendez d'avoir plusieurs achats avant d'expédier pour maximiser vos économies.
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Groupez 3-5 articles pour diviser les frais par le nombre de produits</li>
                    <li>• Stockage gratuit pendant 3 jours (60-90 jours avec abonnement)</li>
                    <li>• Économie supplémentaire de 30-50% en moyenne</li>
                  </ul>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <i className="ri-calendar-line text-blue-600 mr-2"></i>
                    Périodes Optimales d'Achat
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Black Friday et Cyber Monday : jusqu'à 70% d'économies supplémentaires</li>
                    <li>• Soldes d'été et d'hiver : profitez des réductions Amazon</li>
                    <li>• Prime Day : exclusivement pour les membres Amazon Prime</li>
                  </ul>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <i className="ri-shield-check-line text-purple-600 mr-2"></i>
                    Sécurité et Suivi
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Déclarez toujours vos colis dans votre espace ReexpresseTrack</li>
                    <li>• Vérifiez les photos de réception avant expédition</li>
                    <li>• Suivez vos colis en temps réel jusqu'à livraison</li>
                    <li>• Contactez notre support pour toute question</li>
                  </ul>
                </Card>
              </div>
            </section>
          </div>

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center p-8">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à Économiser sur vos Achats Amazon ?
            </h3>
            <p className="text-blue-100 mb-6">
              Créez votre adresse française gratuite et commencez à économiser dès aujourd'hui
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/inscription" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Créer mon compte gratuit
              </a>
              <a 
                href="/calculateur" 
                className="bg-blue-500 text-white hover:bg-blue-400 font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Calculer mes économies
              </a>
            </div>
          </Card>
        </div>
      </article>

      <Footer />
    </div>
  );
}
