
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

const ServiceRetourBlogPost: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Article Header */}
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
                <span className="text-gray-900">Service de Retour DOM-TOM</span>
              </div>
            </nav>

            {/* Article Meta */}
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                Retours
              </span>
              <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full">
                NOUVEAU
              </span>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-line"></i>
                  12 Décembre 2024
                </span>
                <span className="flex items-center gap-1">
                  <i className="ri-time-line"></i>
                  4 min de lecture
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Service de Retour DOM-TOM : Simplifiez vos retours vers la France
            </h1>

            {/* Featured Image */}
            <div className="mb-12">
              <img
                src="https://readdy.ai/api/search-image?query=Professional%20international%20return%20shipping%20service%20center%20specializing%20in%20French%20overseas%20territories%20returns%2C%20modern%20logistics%20facility%20with%20organized%20package%20sorting%20areas%2C%20customer%20service%20desk%20with%20friendly%20staff%20helping%20clients%2C%20packages%20labeled%20for%20return%20shipment%20to%20mainland%20France%2C%20clean%20white%20and%20blue%20corporate%20environment%2C%20professional%20shipping%20boxes%20and%20materials%2C%20digital%20tracking%20screens%20showing%20shipment%20status&width=800&height=450&seq=returnservice001&orientation=landscape"
                alt="Service de retour DOM-TOM professionnel"
                className="w-full h-96 object-cover object-top rounded-xl shadow-lg"
              />
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Vous vivez dans les DOM-TOM et vous avez besoin de retourner un article acheté en ligne ? 
                Notre nouveau service révolutionnaire simplifie enfin cette démarche souvent complexe et coûteuse.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Le problème des retours depuis les DOM-TOM
              </h2>

              <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-error-warning-line text-red-400 text-xl"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-red-800">
                      Les défis actuels
                    </h3>
                    <div className="mt-2 text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Frais de retour prohibitifs (souvent 30-50€)</li>
                        <li>Délais d'expédition très longs</li>
                        <li>Processus complexes et peu clairs</li>
                        <li>Risque de perte ou détérioration</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Notre solution innovante
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-map-pin-line text-blue-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Adresse française dédiée
                  </h3>
                  <p className="text-gray-600">
                    Nous vous fournissons une adresse en France métropolitaine (Cauffry) 
                    spécialement dédiée à vos retours.
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <i className="ri-hand-heart-line text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Gestion complète assurée
                  </h3>
                  <p className="text-gray-600">
                    Nous nous occupons entièrement de vos retours : réception, vérification, 
                    et renvoi direct chez vos fournisseurs. Zéro stress pour vous !
                  </p>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Comment ça marche ?
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Sélectionnez votre colis
                    </h3>
                    <p className="text-gray-600">
                      Choisissez le colis que vous souhaitez retourner parmi ceux disponibles 
                      dans votre espace client.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Configurez votre retour
                    </h3>
                    <p className="text-gray-600">
                      Indiquez les dimensions, le poids estimé, et choisissez vos options 
                      (urgent, assurance, etc.).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Payez en ligne
                    </h3>
                    <p className="text-gray-600">
                      Réglez les frais d'expédition de manière sécurisée via Stripe. 
                      Le montant est calculé automatiquement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nous gérons le renvoi chez votre fournisseur
                    </h3>
                    <p className="text-gray-600">
                      Une fois reçu, nous nous occupons de toutes les démarches et renvoyons 
                      votre colis directement chez le fournisseur concerné. Vous n'avez plus rien à faire !
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tarification transparente
              </h2>

              <div className="bg-blue-50 rounded-xl p-8 mb-8">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">8,50€</div>
                    <div className="text-sm text-gray-600">Jusqu'à 500g</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">12,90€</div>
                    <div className="text-sm text-gray-600">500g - 1kg</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">18,50€</div>
                    <div className="text-sm text-gray-600">1kg - 2kg</div>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Tarifs dégressifs pour les colis plus lourds. Calcul automatique lors de la commande.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Avantages exclusifs
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <i className="ri-shield-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Sécurité garantie</h3>
                    <p className="text-gray-600 text-sm">Traçabilité complète et assurance incluse</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-time-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Traitement rapide</h3>
                    <p className="text-gray-600 text-sm">Expédition sous 24-48h après réception</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-customer-service-2-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Support dédié</h3>
                    <p className="text-gray-600 text-sm">Équipe francophone spécialisée DOM-TOM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-smartphone-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Suivi en temps réel</h3>
                    <p className="text-gray-600 text-sm">Notifications à chaque étape du processus</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-hand-heart-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestion complète</h3>
                    <p className="text-gray-600 text-sm">Nous gérons tout : réception, vérification et renvoi chez le fournisseur</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Prêt à simplifier vos retours ?
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Testez notre service dès maintenant et découvrez la différence
                </p>
                <Link
                  to="/gestion-retour"
                  className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap inline-block"
                >
                  Commencer un retour
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Articles recommandés
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src="https://readdy.ai/api/search-image?query=Modern%20logistics%20warehouse%20with%20packages%20being%20sorted%20and%20processed%20for%20overseas%20shipping%20to%20French%20territories%2C%20professional%20lighting%2C%20clean%20organized%20environment%2C%20workers%20handling%20packages%20carefully%2C%20French%20postal%20service%20trucks%2C%20tropical%20island%20destination%20map%20in%20background%2C%20high-tech%20tracking%20systems&width=400&height=200&seq=related1&orientation=landscape"
                  alt="Guide Amazon DOM-TOM"
                  className="w-full h-48 object-cover object-top"
                />
                <div className="p-6">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Expédition
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">
                    Guide complet Amazon DOM-TOM
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Tous nos conseils pour réussir vos achats Amazon vers les DOM-TOM.
                  </p>
                  <Link
                    to="/blog/guide-achat-amazon-france-domtom"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Lire l'article →
                  </Link>
                </div>
              </Card>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src="https://readdy.ai/api/search-image?query=Modern%20digital%20calculator%20interface%20showing%20shipping%20costs%20to%20French%20overseas%20territories%2C%20computer%20screen%20displaying%20rates%20and%20zones%2C%20professional%20office%20environment%2C%20charts%20and%20graphs%20showing%20cost%20optimization%2C%20clean%20minimalist%20design%20with%20French%20Caribbean%20islands%20imagery%20in%20background&width=400&height=200&seq=related2&orientation=landscape"
                  alt="Calculateur de tarifs"
                  className="w-full h-48 object-cover object-top"
                />
                <div className="p-6">
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Outils
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">
                    Calculateur de tarifs
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Optimisez vos coûts d'expédition avec notre calculateur intelligent.
                  </p>
                  <Link
                    to="/blog/calculateur-tarifs-expedition-domtom"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Lire l'article →
                  </Link>
                </div>
              </Card>

              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src="https://readdy.ai/api/search-image?query=Real-time%20package%20tracking%20system%20interface%20showing%20delivery%20progress%20to%20French%20overseas%20territories%2C%20modern%20smartphone%20and%20laptop%20displaying%20tracking%20information%2C%20world%20map%20with%20delivery%20routes%20highlighted%2C%20professional%20courier%20with%20packages%2C%20GPS%20tracking%20technology%2C%20clean%20modern%20office%20environment&width=400&height=200&seq=related3&orientation=landscape"
                  alt="Suivi de colis"
                  className="w-full h-48 object-cover object-top"
                />
                <div className="p-6">
                  <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Suivi
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">
                    Suivi en temps réel
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Suivez vos colis DOM-TOM grâce à notre système de tracking avancé.
                  </p>
                  <Link
                    to="/blog/suivi-colis-temps-reel-domtom"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Lire l'article →
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceRetourBlogPost;
