import React from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

export default function EngagementEnvironnementalReExpressTrack() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <article className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <img 
              src="https://static.readdy.ai/image/99ff8ee0c27f1c25e3ad19898dcaee78/ac309e31b7920fa33836ac67a3714b2b.png"
              alt="Camion électrique ReExpressTrack - Transport écologique"
              className="w-full h-64 md:h-80 object-cover object-top rounded-2xl mb-8"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ReExpressTrack s'Engage pour l'Environnement : Réduction de l'Empreinte Carbone et Partenaires Durables
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Découvrez comment ReExpressTrack révolutionne le transport vers les DOM-TOM en choisissant des solutions écologiques et des partenaires engagés dans la transition énergétique
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <span>Publié le 20 Décembre 2024</span>
              <span className="mx-2">•</span>
              <span>Temps de lecture : 6 min</span>
            </div>
          </div>

          {/* Table des matières */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Table des Matières</h2>
            <ul className="space-y-2">
              <li><a href="#engagement-environnemental" className="text-blue-600 hover:underline">1. Notre engagement environnemental</a></li>
              <li><a href="#partenaires-durables" className="text-blue-600 hover:underline">2. Des partenaires fiables et engagés</a></li>
              <li><a href="#transport-electrique" className="text-blue-600 hover:underline">3. Transport électrique et solutions vertes</a></li>
              <li><a href="#reduction-empreinte" className="text-blue-600 hover:underline">4. Réduction de l'empreinte carbone</a></li>
              <li><a href="#actions-concretes" className="text-blue-600 hover:underline">5. Actions concrètes et mesures d'impact</a></li>
            </ul>
          </Card>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            <section id="engagement-environnemental" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Notre Engagement Environnemental : Une Priorité Stratégique
              </h2>
              
              <Card className="mb-6 bg-green-50 border-green-200">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-leaf-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-2">Mission Environnementale</h3>
                    <p className="text-green-800">
                      Chez ReExpressTrack, nous croyons qu'il est possible de concilier efficacité logistique et respect de l'environnement. 
                      Notre mission est de réduire l'impact carbone du transport vers les DOM-TOM tout en maintenant un service de qualité supérieure.
                    </p>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Pourquoi l'Environnement est Notre Priorité :</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <i className="ri-earth-line text-blue-600 mr-3 mt-1"></i>
                  <span><strong>Responsabilité territoriale :</strong> Les DOM-TOM sont particulièrement vulnérables au changement climatique</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-recycle-line text-blue-600 mr-3 mt-1"></i>
                  <span><strong>Innovation durable :</strong> Pionnier dans l'adoption de technologies vertes pour la logistique</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-group-line text-blue-600 mr-3 mt-1"></i>
                  <span><strong>Engagement citoyen :</strong> Sensibilisation de nos clients aux pratiques éco-responsables</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-trophy-line text-blue-600 mr-3 mt-1"></i>
                  <span><strong>Excellence opérationnelle :</strong> L'efficacité énergétique améliore nos performances</span>
                </li>
              </ul>

              <Card className="bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Objectif 2030</h4>
                <p className="text-blue-800 text-sm">
                  ReExpressTrack s'engage à réduire ses émissions de CO2 de 50% d'ici 2030 par rapport à 2024, 
                  en ligne avec les accords de Paris et les objectifs de développement durable de l'ONU.
                </p>
              </Card>
            </section>

            <section id="partenaires-durables" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Des Partenaires Fiables et Engagés dans la Transition Écologique
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-green-200 bg-green-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-truck-line text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-green-900">Transporteurs Verts</h3>
                  </div>
                  <ul className="text-sm text-green-800 space-y-2">
                    <li>• Flotte de véhicules électriques et hybrides</li>
                    <li>• Certification ISO 14001 environnementale</li>
                    <li>• Optimisation des trajets par IA</li>
                    <li>• Carburants alternatifs (biocarburants, hydrogène)</li>
                  </ul>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-ship-line text-blue-600"></i>
                    </div>
                    <h3 className="font-semibold text-blue-900">Transport Maritime Durable</h3>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Navires à propulsion hybride</li>
                    <li>• Technologies de scrubbing des émissions</li>
                    <li>• Optimisation des routes maritimes</li>
                    <li>• Partenariat avec CMA CGM Green Marine</li>
                  </ul>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-plane-line text-purple-600"></i>
                    </div>
                    <h3 className="font-semibold text-purple-900">Aviation Responsable</h3>
                  </div>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li>• Compensation carbone automatique</li>
                    <li>• Carburants d'aviation durables (SAF)</li>
                    <li>• Optimisation du poids des colis</li>
                    <li>• Programmes de neutralité carbone</li>
                  </ul>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-building-2-line text-yellow-600"></i>
                    </div>
                    <h3 className="font-semibold text-yellow-900">Entrepôts Écologiques</h3>
                  </div>
                  <ul className="text-sm text-yellow-800 space-y-2">
                    <li>• Énergie 100% renouvelable</li>
                    <li>• Éclairage LED intelligent</li>
                    <li>• Isolation thermique optimale</li>
                    <li>• Systèmes de récupération d'eau</li>
                  </ul>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <i className="ri-award-line text-green-600 mr-2"></i>
                  Certifications de Nos Partenaires
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <i className="ri-leaf-fill text-green-600 text-2xl"></i>
                    </div>
                    <span className="font-medium">ISO 14001</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <i className="ri-recycling-line text-blue-600 text-2xl"></i>
                    </div>
                    <span className="font-medium">Green Marine</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <i className="ri-plant-line text-green-600 text-2xl"></i>
                    </div>
                    <span className="font-medium">Carbon Trust</span>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <i className="ri-earth-fill text-blue-600 text-2xl"></i>
                    </div>
                    <span className="font-medium">B Corp</span>
                  </div>
                </div>
              </Card>
            </section>

            <section id="transport-electrique" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Transport Électrique : L'Avenir de la Logistique DOM-TOM
              </h2>

              <div className="mb-6">
                <img 
                  src="https://readdy.ai/api/search-image?query=Modern%20electric%20delivery%20truck%20in%20urban%20environment%20with%20solar%20panels%20on%20warehouse%20roof%2C%20green%20technology%20integration%2C%20clean%20energy%20infrastructure%2C%20professional%20logistics%20facility%2C%20eco-friendly%20transportation%20solution%2C%20blue%20sky%20background%2C%20sustainable%20business%20operations&width=800&height=400&seq=electric-transport&orientation=landscape"
                  alt="Camion électrique et infrastructure durable"
                  className="w-full h-64 object-cover object-top rounded-2xl"
                />
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Innovation Technologique :</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-battery-charge-line text-green-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Véhicules Électriques</h4>
                  <p className="text-gray-600 text-sm">
                    Flotte de camions électriques pour les livraisons urbaines, 
                    réduisant les émissions de 80% par rapport aux véhicules thermiques
                  </p>
                </Card>

                <Card className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-sun-line text-blue-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Énergie Solaire</h4>
                  <p className="text-gray-600 text-sm">
                    Nos entrepôts sont équipés de panneaux solaires pour alimenter 
                    les bornes de recharge et réduire notre dépendance au réseau
                  </p>
                </Card>

                <Card className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-route-line text-purple-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">IA d'Optimisation</h4>
                  <p className="text-gray-600 text-sm">
                    Intelligence artificielle pour optimiser les trajets, 
                    réduire les distances parcourues et maximiser l'efficacité énergétique
                  </p>
                </Card>
              </div>

              <Card className="bg-yellow-50 border-yellow-200">
                <div className="flex items-start">
                  <i className="ri-lightbulb-line text-yellow-600 mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">Innovation Continue</h4>
                    <p className="text-yellow-800 text-sm">
                      Nous testons actuellement des véhicules à hydrogène pour les longues distances 
                      et des drones électriques pour les livraisons en zones difficiles d'accès dans les DOM-TOM.
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section id="reduction-empreinte" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Réduction Concrète de l'Empreinte Carbone
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Résultats 2024</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-900">Réduction CO2</span>
                      <span className="text-2xl font-bold text-green-600">-35%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">Énergie Renouvelable</span>
                      <span className="text-2xl font-bold text-blue-600">67%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-900">Optimisation Trajets</span>
                      <span className="text-2xl font-bold text-purple-600">-28%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <span className="font-medium text-yellow-900">Déchets Recyclés</span>
                      <span className="text-2xl font-bold text-yellow-600">89%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Impact par Destination</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium">Guadeloupe</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">-2.1 kg CO2/colis</span>
                        <i className="ri-arrow-down-line text-green-600"></i>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium">Martinique</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">-2.0 kg CO2/colis</span>
                        <i className="ri-arrow-down-line text-green-600"></i>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium">La Réunion</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">-3.2 kg CO2/colis</span>
                        <i className="ri-arrow-down-line text-green-600"></i>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium">Guyane</span>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">-2.5 kg CO2/colis</span>
                        <i className="ri-arrow-down-line text-green-600"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-center">
                  Impact Cumulé 2024
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">847 tonnes</div>
                    <div className="text-sm text-gray-600">CO2 évité</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">1.2 GWh</div>
                    <div className="text-sm text-gray-600">Énergie verte utilisée</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">94%</div>
                    <div className="text-sm text-gray-600">Clients satisfaits de notre démarche</div>
                  </div>
                </div>
              </Card>
            </section>

            <section id="actions-concretes" className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Actions Concrètes et Engagement Client
              </h2>

              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <i className="ri-group-line text-green-600 mr-2"></i>
                    Sensibilisation Client
                  </h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• <strong>Bilan carbone transparent :</strong> Chaque envoi affiche son empreinte CO2</li>
                    <li>• <strong>Options vertes :</strong> Choix de transport éco-responsable avec tarifs préférentiels</li>
                    <li>• <strong>Conseils d'emballage :</strong> Optimisation du volume pour réduire l'impact</li>
                    <li>• <strong>Programme de fidélité vert :</strong> Points bonus pour les choix écologiques</li>
                  </ul>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <i className="ri-recycle-line text-blue-600 mr-2"></i>
                    Économie Circulaire
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>• <strong>Emballages réutilisables :</strong> Système de consigne pour les colis fréquents</li>
                    <li>• <strong>Partenariat recyclage :</strong> Collecte des emballages usagés dans les DOM-TOM</li>
                    <li>• <strong>Reconditionnement :</strong> Service de remise en état des produits retournés</li>
                    <li>• <strong>Matériaux biosourcés :</strong> Transition vers des emballages biodégradables</li>
                  </ul>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <i className="ri-community-line text-purple-600 mr-2"></i>
                    Engagement Territorial
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li>• <strong>Formation locale :</strong> Sensibilisation aux métiers verts de la logistique</li>
                    <li>• <strong>Partenariats éducatifs :</strong> Programmes dans les écoles des DOM-TOM</li>
                    <li>• <strong>Soutien associatif :</strong> Financement de projets environnementaux locaux</li>
                    <li>• <strong>Recherche collaborative :</strong> Projets avec les universités caribéennes</li>
                  </ul>
                </Card>
              </div>

              <Card className="mt-8 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <h4 className="font-semibold mb-3 text-center">Rejoignez Notre Démarche Environnementale</h4>
                <p className="text-center text-green-100 text-sm mb-4">
                  Chaque colis expédié avec ReExpressTrack contribue à un avenir plus durable pour les DOM-TOM
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <i className="ri-leaf-line mr-1"></i>
                    <span>Compensation carbone incluse</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-recycle-line mr-1"></i>
                    <span>Emballage éco-responsable</span>
                  </div>
                </div>
              </Card>
            </section>
          </div>

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-r from-green-600 to-blue-700 text-white text-center p-8">
            <h3 className="text-2xl font-bold mb-4">
              Expédiez Responsable vers les DOM-TOM
            </h3>
            <p className="text-green-100 mb-6">
              Choisissez ReExpressTrack pour des envois écologiques sans compromis sur la qualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/inscription" 
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Rejoindre la démarche verte
              </a>
              <a 
                href="/calculateur" 
                className="bg-green-500 text-white hover:bg-green-400 font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
              >
                Calculer mon impact CO2
              </a>
            </div>
          </Card>
        </div>
      </article>

      <Footer />
    </div>
  );
}