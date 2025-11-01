import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import AnimatedStats from '../../components/feature/AnimatedStats';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

export default function Home() {
  // Configuration des statistiques animées
  const statsData = [
    {
      value: 10000,
      suffix: '+',
      label: 'Clients satisfaits',
      duration: 2500
    },
    {
      value: 60,
      suffix: '%',
      label: 'Économies moyennes',
      duration: 2000
    },
    {
      value: 5,
      suffix: '',
      label: 'Destinations desservies',
      duration: 1500
    },
    {
      value: 48,
      suffix: 'H',
      label: 'Traitement des colis',
      duration: 1800
    }
  ];

  // SEO et GTM
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'ReexpresseTrack - Service d\'expédition DOM-TOM et Maroc | Adresse française gratuite';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Service de réexpédition vers DOM-TOM et Maroc. Adresse française gratuite, jusqu\'à 60% d\'économies, livraison rapide vers Guadeloupe, Martinique, Réunion, Guyane et Maroc.');
    }

    // Schema.org JSON-LD
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ReexpresseTrack",
      "description": "Service de réexpédition vers DOM-TOM et Maroc. Adresse française gratuite avec livraison rapide.",
      "url": process.env.VITE_SITE_URL || "https://example.com",
      "logo": `${process.env.VITE_SITE_URL || "https://example.com"}/logo.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "French"
      },
      "areaServed": [
        {
          "@type": "Place",
          "name": "Guadeloupe"
        },
        {
          "@type": "Place", 
          "name": "Martinique"
        },
        {
          "@type": "Place",
          "name": "Guyane française"
        },
        {
          "@type": "Place",
          "name": "La Réunion"
        },
        {
          "@type": "Place",
          "name": "Maroc"
        }
      ],
      "serviceType": "Shipping and logistics",
      "priceRange": "€€"
    });
    
    // Supprimer l'ancien script s'il existe
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    document.head.appendChild(schemaScript);

    // Vérifier si GTM est chargé
    if (typeof window !== 'undefined' && window.dataLayer) {
      // Envoyer l'événement de vue de page
      window.dataLayer.push({
        event: 'page_view',
        page_title: 'Accueil - ReexpresseTrack DOM-TOM',
        page_location: window.location.href,
        page_path: '/',
        page_category: 'accueil',
        content_group1: 'pages-principales'
      });
    }

    return () => {
      // Nettoyage du script Schema.org
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 bg-cover bg-center bg-no-repeat min-h-[80vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.8), rgba(29, 78, 216, 0.8)), url('https://static.readdy.ai/image/99ff8ee0c27f1c25e3ad19898dcaee78/5b1dd86d71b3505a9b02292697204b74.png')`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl text-white">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                Service de réexpédition français spécialisé DOM-TOM et Maroc
              </span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Votre adresse française pour livrer vers les
              <span className="text-yellow-300"> DOM-TOM et le Maroc</span>
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 leading-relaxed text-blue-100">
              Recevez vos achats en France et nous les expédions vers la Guadeloupe, Martinique, 
              Guyane française, La Réunion et le Maroc. Économisez jusqu'à 60% sur vos frais d'expédition.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/inscription">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg whitespace-nowrap">
                  Créer mon adresse française gratuite
                </Button>
              </Link>
              <Link to="/calculateur">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10 font-semibold px-8 py-4 text-lg rounded-lg whitespace-nowrap">
                  Calculer mes frais d'expédition
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center">
                <i className="ri-check-line text-green-300 mr-2 text-xl"></i>
                <span className="text-sm font-medium">Inscription gratuite</span>
              </div>
              <div className="flex items-center">
                <i className="ri-truck-line text-green-300 mr-2 text-xl"></i>
                <span className="text-sm font-medium">Livraison rapide</span>
              </div>
              <div className="flex items-center">
                <i className="ri-shield-check-line text-green-300 mr-2 text-xl"></i>
                <span className="text-sm font-medium">Service sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Stats Animées */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedStats stats={statsData} />
        </div>
      </section>

      {/* Avantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ReexpresseTrack ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Le service de réexpédition de référence pour les DOM-TOM et le Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-map-pin-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Adresse française personnalisée
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Obtenez votre adresse française personnalisée en 2 minutes. 
                Utilisez-la pour tous vos achats en ligne et recevez vos colis dans notre entrepôt sécurisé.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-money-euro-circle-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Économies importantes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Réduisez vos frais d'expédition jusqu'à 60% comparé aux tarifs directs. 
                Consolidation gratuite pour optimiser encore plus vos économies.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-truck-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Livraison rapide et sécurisée
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expédition express vers les DOM-TOM (3-7 jours) et le Maroc (4-8 jours). 
                Suivi en temps réel et photos de vos colis inclus.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Destinations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos destinations
            </h2>
            <p className="text-xl text-gray-600">
              Service de réexpédition spécialisé DOM-TOM et Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* DOM-TOM Card */}
            <Card className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🏝️</div>
                  <div>
                    <h3 className="text-2xl font-bold">DOM-TOM</h3>
                    <p className="text-blue-100 text-sm">Départements et territoires d'outre-mer</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Express
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">🏖️</div>
                  <span className="font-semibold text-sm">Guadeloupe</span>
                  <p className="text-xs text-blue-100">3-7 jours</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">🌺</div>
                  <span className="font-semibold text-sm">Martinique</span>
                  <p className="text-xs text-blue-100">3-7 jours</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">🏔️</div>
                  <span className="font-semibold text-sm">La Réunion</span>
                  <p className="text-xs text-blue-100">5-9 jours</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl mb-2">🌿</div>
                  <span className="font-semibold text-sm">Guyane française</span>
                  <p className="text-xs text-blue-100">4-8 jours</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <i className="ri-time-line mr-2"></i>
                  <span>Livraison 3-9 jours</span>
                </div>
                <div className="flex items-center text-yellow-300 font-semibold">
                  <i className="ri-discount-percent-line mr-2"></i>
                  <span>Jusqu'à -50% d'économies</span>
                </div>
              </div>
            </Card>

            {/* Maroc Card */}
            <Card className="p-8 bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">🇲🇦</div>
                  <div>
                    <h3 className="text-2xl font-bold">Maroc</h3>
                    <p className="text-red-100 text-sm">Royaume du Maroc - Toutes les villes</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  Populaire
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="ri-truck-line text-xl mr-3"></i>
                    <span className="font-semibold text-sm">Service quotidien</span>
                  </div>
                  <span className="text-xs">Toutes villes</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="ri-time-line text-xl mr-3"></i>
                    <span className="font-semibold text-sm">Livraison 4-8 jours</span>
                  </div>
                  <span className="text-xs">Express</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center">
                    <i className="ri-shield-check-line text-xl mr-3"></i>
                    <span className="font-semibold text-sm">Suivi complet</span>
                  </div>
                  <span className="text-xs">Inclus</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <i className="ri-time-line mr-2"></i>
                  <span>Livraison 4-8 jours</span>
                </div>
                <div className="flex items-center text-yellow-300 font-semibold">
                  <i className="ri-discount-percent-line mr-2"></i>
                  <span>Jusqu'à -60% d'économies</span>
                </div>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                Calculez vos économies dès maintenant
              </h3>
              <p className="text-lg text-blue-100 mb-6">
                Obtenez un devis instantané pour votre destination
              </p>
              <Link to="/calculateur">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg whitespace-nowrap"
                >
                  <i className="ri-calculator-line mr-2"></i>
                  Calculer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tarification */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tarifs transparents pour les DOM-TOM et le Maroc
            </h2>
            <p className="text-xl text-gray-600">
              Des formules adaptées à tous vos besoins d'expédition
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Gratuit */}
            <Card className="p-8 relative flex flex-col h-full">
              <div className="text-center flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Découverte</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  0€<span className="text-lg font-normal text-gray-500">/mois</span>
                </div>
                <ul className="space-y-4 mb-8 text-left flex-1">
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Adresse française personnalisée</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Stockage gratuit 3 jours</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Photos de réception des colis</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Suivi en temps réel</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Link to="/inscription">
                    <Button variant="outline" className="w-full whitespace-nowrap">
                      Créer mon compte gratuit
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Plan Premium */}
            <Card className="border-2 border-blue-500 relative pt-8 p-8 flex flex-col h-full">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Populaire
                </span>
              </div>
              <div className="text-center flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-blue-600 mb-6">
                  2,50€<span className="text-lg font-normal text-gray-500">/mois</span>
                </div>
                <ul className="space-y-4 mb-8 text-left flex-1">
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Toutes les fonctionnalités gratuites</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span><strong>-20% sur tous les frais d'expédition</strong></span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Stockage gratuit 60 jours</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Support prioritaire</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Link to="/abonnement">
                    <Button className="w-full whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105">
                      S'abonner Premium
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Plan Premium Annuel */}
            <Card className="relative pt-8 p-8 flex flex-col h-full">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Économique
                </span>
              </div>
              <div className="text-center flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Annuel</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  20€<span className="text-lg font-normal text-gray-500">/an</span>
                </div>
                <p className="text-sm text-green-600 mb-6">Soit 1,67€/mois - Économisez 33%</p>
                <ul className="space-y-4 mb-8 text-left flex-1">
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Tous les avantages Premium</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span><strong>-25% sur tous les frais d'expédition</strong></span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Stockage gratuit 90 jours</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-3"></i>
                    <span>Consolidation illimitée</span>
                  </li>
                </ul>
                <div className="mt-auto">
                  <Link to="/abonnement">
                    <Button variant="outline" className="w-full whitespace-nowrap hover:scale-105">
                      Économisez 33%
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comment fonctionne notre service ?
            </h2>
            <p className="text-xl text-gray-600">
              4 étapes simples pour recevoir vos colis dans les DOM-TOM et au Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Créez votre adresse française
              </h3>
              <p className="text-gray-600">
                Inscription gratuite en 2 minutes. Obtenez instantanément votre adresse française personnalisée.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Commandez en ligne
              </h3>
              <p className="text-gray-600">
                Utilisez votre adresse française pour acheter sur Amazon, Cdiscount, Fnac et tous les sites français.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Réception et stockage
              </h3>
              <p className="text-gray-600">
                Nous recevons vos colis dans notre entrepôt sécurisé et vous envoyons une photo de confirmation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Expédition vers votre destination
              </h3>
              <p className="text-gray-600">
                Choisissez votre service d'expédition et recevez votre colis rapidement chez vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Services - Mise en avant du service de retour */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos services d'expédition DOM-TOM
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une gamme complète de services pour faciliter vos achats en ligne et leur livraison
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service de Retour - Mis en avant */}
            <div className="relative group h-full">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg"></div>
              <div className="relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 h-full flex flex-col">
                <div className="absolute -top-4 -right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  🔥 NOUVEAU
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className="ri-arrow-go-back-line text-2xl text-orange-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Gestion de Retours
                </h3>
                <p className="text-gray-600 text-center mb-6 flex-grow">
                  Nous nous occupons de la gestion de vos retours et les renvoyons chez votre fournisseur. 
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    <span>Calcul automatique des frais</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    <span>Paiement sécurisé via Stripe</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    <span>Suivi en temps réel</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    <span>Adresse de retour en France</span>
                  </div>
                </div>
                <div className="text-center mt-auto">
                  <Link to="/gestion-retour">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Gérer mes retours
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Autres services */}
            <div className="group h-full">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className="ri-truck-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Réexpédition Rapide
                </h3>
                <p className="text-gray-600 text-center mb-6 flex-grow">
                  Recevez vos colis avec votre adresse française personnalisée. 
                  Réexpédition sous 24-48h vers les DOM-TOM.
                </p>
                <div className="text-center mt-auto">
                  <Link to="/calculateur">
                    <Button variant="outline" className="w-full">
                      Calculer les frais
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group h-full">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className="ri-shopping-cart-line text-2xl text-green-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Achat pour Vous
                </h3>
                <p className="text-gray-600 text-center mb-6 flex-grow">
                  Sites qui n'expédient pas aux DOM-TOM ? Nous achetons pour vous 
                  et réexpédions directement.
                </p>
                <div className="text-center mt-auto">
                  <Link to="/connexion">
                    <Button variant="outline" className="w-full">
                      Faire une demande
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="group h-full">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <i className="ri-eye-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                  Suivi Premium
                </h3>
                <p className="text-gray-600 text-center mb-6 flex-grow">
                  Photos automatiques de vos colis, notifications en temps réel, 
                  stockage sécurisé jusqu'à 90 jours.
                </p>
                <div className="text-center mt-auto">
                  <Link to="/suivi">
                    <Button variant="outline" className="w-full">
                      Suivre un colis
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section spéciale retours - SEO et Marketing */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-orange-100 rounded-full px-4 py-2 mb-6">
                <i className="ri-award-line text-orange-600 mr-2"></i>
                <span className="text-orange-800 font-semibold">Service Exclusif</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Retours Simplifiés vers la France Métropolitaine
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Premier service de retour colis spécialisé DOM-TOM ! Gérez facilement 
                vos retours Amazon, Cdiscount, et autres e-commerçants français.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="ri-calculator-line text-orange-600"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Tarifs Transparents</h4>
                    <p className="text-gray-600 text-sm">
                      Calcul automatique selon poids et dimensions. À partir de 8,50€.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="ri-map-pin-line text-orange-600"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Adresse Française Dédiée</h4>
                    <p className="text-gray-600 text-sm">
                      Entrepôt sécurisé à Cauffry (60) pour tous vos retours.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="ri-refresh-line text-orange-600"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Types de Retours</h4>
                    <p className="text-gray-600 text-sm">
                      Remboursement, échange, réparation - Tous types acceptés.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <i className="ri-shield-check-line text-orange-600"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Paiement Sécurisé</h4>
                    <p className="text-gray-600 text-sm">
                      Transaction 100% sécurisée via Stripe. Aucun frais caché.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/gestion-retour">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    <i className="ri-arrow-go-back-line mr-2"></i>
                    Gérer mes retours
                  </Button>
                </Link>
                <Link to="/faq">
                  <Button variant="outline" size="lg">
                    <i className="ri-question-line mr-2"></i>
                    Questions fréquentes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://readdy.ai/api/search-image?query=Professional%20logistics%20warehouse%20worker%20handling%20package%20returns%20shipping%20boxes%20France%20overseas%20territories%20DOM-TOM%20modern%20efficient%20service%20clean%20organized%20facility&width=600&height=400&seq=1&orientation=landscape"
                  alt="Service de retour colis DOM-TOM - Entrepôt professionnel"
                  className="w-full h-auto rounded-xl shadow-2xl object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 shadow-xl max-w-xs">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-semibold text-gray-900">Service Actif</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>127 retours</strong> traités ce mois
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Délai moyen : 2-3 jours ouvrés
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Témoignages clients
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 10 000 clients nous font confiance pour leurs expéditions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Service parfait pour mes achats Amazon vers la Guadeloupe. J'ai économisé plus de 150€ 
                sur mes frais d'expédition cette année !"
              </p>
              <div className="font-semibold text-gray-900">Marie L. - Guadeloupe</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "ReexpresseTrack m'a permis d'économiser énormément sur mes achats vers le Maroc. 
                Service client excellent et livraison toujours dans les délais."
              </p>
              <div className="font-semibold text-gray-900">Ahmed K. - Maroc</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                  <i className="ri-star-fill"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "La consolidation de colis est un vrai plus ! J'ai pu grouper plusieurs achats 
                pour La Réunion et diviser mes frais par deux."
              </p>
              <div className="font-semibold text-gray-900">Jean-Paul M. - La Réunion</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Prêt à économiser sur vos expéditions ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez plus de 10 000 clients qui font confiance à ReexpresseTrack 
            pour leurs expéditions vers les DOM-TOM et le Maroc.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-lg whitespace-nowrap">
                Créer mon compte gratuit
              </Button>
            </Link>
            <Link to="/calculateur">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10 font-semibold px-8 py-4 text-lg rounded-lg whitespace-nowrap"
              >
                Calculer mes économies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
