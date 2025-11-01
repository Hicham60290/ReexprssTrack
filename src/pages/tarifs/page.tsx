import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

export default function Tarifs() {
  const [selectedZone, setSelectedZone] = useState('domtom');
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // SEO et Google Tag Manager  
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'Tarifs Expédition DOM-TOM et Maroc - Prix Transparents | ReexpresseTrack';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Découvrez nos tarifs transparents pour l\'expédition vers DOM-TOM et Maroc. Calculateur gratuit, abonnements premium avec réductions jusqu\'à 25%. Guadeloupe, Martinique, Réunion à partir de 12,90€.');
    }

    // Schema.org JSON-LD for Service
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Service d'expédition DOM-TOM et Maroc",
      "description": "Tarifs transparents pour l'expédition vers DOM-TOM et Maroc avec réductions abonnés",
      "provider": {
        "@type": "Organization",
        "name": "ReexpresseTrack",
        "url": process.env.VITE_SITE_URL || "https://example.com"
      },
      "url": `${process.env.VITE_SITE_URL || "https://example.com"}/tarifs`,
      "areaServed": [
        "Guadeloupe", "Martinique", "Guyane française", "La Réunion", "Maroc"
      ],
      "serviceType": "Shipping and logistics",
      "offers": [
        {
          "@type": "Offer",
          "name": "Plan Gratuit",
          "price": "0",
          "priceCurrency": "EUR",
          "description": "Service de base avec adresse française gratuite"
        },
        {
          "@type": "Offer", 
          "name": "Plan Premium Mensuel",
          "price": "2.50",
          "priceCurrency": "EUR",
          "billingIncrement": "Monthly",
          "description": "Réductions sur expéditions et stockage étendu"
        },
        {
          "@type": "Offer",
          "name": "Plan Premium Annuel", 
          "price": "20",
          "priceCurrency": "EUR",
          "billingIncrement": "Yearly",
          "description": "Économisez 33% avec le plan annuel"
        }
      ]
    });
    
    const existingScript = document.querySelector('script[type="application/ld+json"][data-page="tarifs"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    schemaScript.setAttribute('data-page', 'tarifs');
    document.head.appendChild(schemaScript);

    // GTM - Push page view event to dataLayer
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: 'Tarifs - ReexpresseTrack Expédition DOM-TOM',
        page_location: window.location.href,  
        page_path: '/tarifs',
        page_category: 'tarification',
        content_group1: 'pages-commerciales'
      });
    }

    return () => {
      const script = document.querySelector('script[type="application/ld+json"][data-page="tarifs"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const zones = {
    domtom: {
      name: 'DOM-TOM (Zone 8-9)',
      countries: ['Guadeloupe', 'Martinique', 'Guyane française', 'La Réunion', 'Mayotte', 'Saint-Pierre-et-Miquelon', 'Saint-Barthélemy', 'Saint-Martin', 'Wallis-et-Futuna', 'Polynésie française', 'Nouvelle-Calédonie', 'Terres australes et antarctiques françaises'],
      basePrice: 12.90,
      weightPrice: 3.20,
      subscriberDiscount: 15
    },
    maroc: {
      name: 'Maroc (Zone 4)',
      countries: ['Maroc'],
      basePrice: 14.90,
      weightPrice: 3.80,
      subscriberDiscount: 18
    }
  };

  const services = [
    {
      name: 'Standard',
      description: 'Livraison économique',
      duration: '7-14 jours',
      tracking: true,
      insurance: false,
      icon: 'ri-truck-line'
    },
    {
      name: 'Express',
      description: 'Livraison rapide',
      duration: '3-5 jours',
      tracking: true,
      insurance: true,
      icon: 'ri-flashlight-line',
      extra: 8.90
    },
    {
      name: 'Premium',
      description: 'Livraison ultra-rapide',
      duration: '1-2 jours',
      tracking: true,
      insurance: true,
      icon: 'ri-rocket-line',
      extra: 19.90
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Tarifs transparents
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez nos tarifs compétitifs pour l'expédition internationale. 
              Économisez encore plus avec nos abonnements.
            </p>
          </div>
        </div>
      </section>

      {/* Calculateur rapide */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Calculateur de prix rapide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8">
                  <option value="">Sélectionnez un pays</option>
                  <option value="Guadeloupe">Guadeloupe</option>
                  <option value="Martinique">Martinique</option>
                  <option value="Guyane française">Guyane française</option>
                  <option value="La Réunion">La Réunion</option>
                  <option value="Maroc">Maroc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids (kg)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1.5"
                />
              </div>
              <div className="flex items-end">
                <Link to="/calculateur" className="w-full">
                  <Button className="w-full">
                    Calculer le prix
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Zones tarifaires */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Zones tarifaires
            </h2>
            <p className="text-xl text-gray-600">
              Nos tarifs selon les zones de destination
            </p>
          </div>

          {/* Zone selector */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              {Object.entries(zones).map(([key, zone]) => (
                <button
                  key={key}
                  onClick={() => setSelectedZone(key)}
                  className={`px-6 py-2 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    selectedZone === key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {zone.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zone details */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Zone {zones[selectedZone].name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Pays inclus : {zones[selectedZone].countries.join(', ')}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Frais de base</span>
                      <span className="text-gray-900">{zones[selectedZone].basePrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Par kg supplémentaire</span>
                      <span className="text-gray-900">{zones[selectedZone].weightPrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Réduction abonné</span>
                      <span className="text-green-600">-{zones[selectedZone].subscriberDiscount}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Exemple de calcul
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Colis 2kg vers {zones[selectedZone].name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de base</span>
                      <span>{zones[selectedZone].basePrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1kg supplémentaire</span>
                      <span>{zones[selectedZone].weightPrice.toFixed(2)}€</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                      <span>Total sans abonnement</span>
                      <span>{(zones[selectedZone].basePrice + zones[selectedZone].weightPrice).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Total avec abonnement</span>
                      <span>
                        {((zones[selectedZone].basePrice + zones[selectedZone].weightPrice) * 
                          (1 - zones[selectedZone].subscriberDiscount / 100)).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Services et options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Services de livraison
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez la vitesse de livraison qui vous convient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className={service.name === 'Express' ? 'border-2 border-blue-500' : ''}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className={`${service.icon} text-2xl text-blue-600`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    {service.extra ? `+${service.extra}€` : 'Inclus'}
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center">
                      <i className="ri-time-line text-green-500 mr-2"></i>
                      <span className="text-sm">{service.duration}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className={`${service.tracking ? 'ri-check-line text-green-500' : 'ri-close-line text-red-500'} mr-2`}></i>
                      <span className="text-sm">Suivi inclus</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <i className={`${service.insurance ? 'ri-check-line text-green-500' : 'ri-close-line text-red-500'} mr-2`}></i>
                      <span className="text-sm">Assurance incluse</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Abonnements */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Économisez avec nos abonnements
            </h2>
            <p className="text-xl text-gray-600">
              Obtenez des réductions sur tous vos envois
            </p>
          </div>

          {/* Sélecteur mensuel/annuel */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-full flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-2 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  selectedPlan === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-6 py-2 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  selectedPlan === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Annuel
              </button>
            </div>
          </div>

          {/* Plan sélectionné */}
          <div className="max-w-md mx-auto">
            <Card className={`relative border-2 ${selectedPlan === 'monthly' ? 'border-blue-500' : 'border-green-500'}`}>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <span className={`px-4 py-1 rounded-full text-sm font-medium text-white ${
                  selectedPlan === 'monthly' ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {selectedPlan === 'monthly' ? 'Populaire' : 'Économique'}
                </span>
              </div>
              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Premium {selectedPlan === 'monthly' ? 'Mensuel' : 'Annuel'}
                  </h3>
                  <div className={`text-4xl font-bold mb-2 ${
                    selectedPlan === 'monthly' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {selectedPlan === 'monthly' ? (
                      <>2,50€<span className="text-lg font-normal text-gray-500">/mois</span></>
                    ) : (
                      <>20€<span className="text-lg font-normal text-gray-500">/an</span></>
                    )}
                  </div>
                  {selectedPlan === 'yearly' && (
                    <p className="text-sm text-green-600">Soit 1,67€/mois - 2 mois gratuits</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-3"></i>
                    <span>-20% sur tous les frais d'expédition</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-3"></i>
                    <span>Stockage {selectedPlan === 'monthly' ? '60' : '90'} jours gratuit</span>
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-3"></i>
                    <span>Support prioritaire</span>
                  </li>
                  {selectedPlan === 'yearly' && (
                    <>
                      <li className="flex items-center">
                        <i className="ri-check-line text-green-500 mr-3"></i>
                        <span><strong>2 mois gratuits</strong></span>
                      </li>
                      <li className="flex items-center">
                        <i className="ri-check-line text-green-500 mr-3"></i>
                        <span>Réductions exclusives</span>
                      </li>
                    </>
                  )}
                </ul>

                <Link to="/abonnement">
                  <Button className="w-full whitespace-nowrap text-lg py-3">
                    S'abonner {selectedPlan === 'monthly' ? 'mensuel' : 'annuel'}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d'un devis personnalisé ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contactez-nous pour des volumes importants ou des besoins spécifiques
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap">
              Nous contacter
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
