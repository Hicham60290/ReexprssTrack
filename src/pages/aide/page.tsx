import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

export default function Aide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Toutes les catégories', icon: 'ri-apps-line' },
    { id: 'getting-started', name: 'Commencer', icon: 'ri-play-circle-line' },
    { id: 'shipping', name: 'Expédition', icon: 'ri-truck-line' },
    { id: 'billing', name: 'Facturation', icon: 'ri-bill-line' },
    { id: 'account', name: 'Mon compte', icon: 'ri-user-line' }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'Comment obtenir mon adresse française ?',
      answer: 'Après inscription, votre adresse française dédiée est automatiquement générée. Vous la retrouvez dans votre espace client avec votre numéro de boîte unique.'
    },
    {
      category: 'getting-started',
      question: 'Combien de temps mes colis sont-ils stockés ?',
      answer: 'Les comptes gratuits bénéficient de 30 jours de stockage, les abonnés mensuels de 60 jours et les abonnés annuels de 90 jours.'
    },
    {
      category: 'shipping',
      question: 'Quels sont les délais de livraison ?',
      answer: 'Standard : 7-14 jours, Express : 3-5 jours, Premium : 1-2 jours. Les délais peuvent varier selon la destination.'
    },
    {
      category: 'shipping',
      question: 'Puis-je grouper plusieurs colis ?',
      answer: 'Oui, vous pouvez demander le regroupement de plusieurs colis pour économiser sur les frais d\'expédition. Cette option est disponible dans votre espace client.'
    },
    {
      category: 'billing',
      question: 'Comment sont calculés les frais d\'expédition ?',
      answer: 'Les frais dépendent de la destination, du poids, des dimensions et du service choisi. Utilisez notre calculateur pour une estimation précise.'
    },
    {
      category: 'billing',
      question: 'Puis-je annuler mon abonnement ?',
      answer: 'Oui, vous pouvez résilier votre abonnement à tout moment depuis votre espace client. Il reste actif jusqu\'à la fin de la période payée.'
    },
    {
      category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Rendez-vous dans votre espace client, section "Mon profil" pour modifier vos informations personnelles et adresses de livraison.'
    },
    {
      category: 'account',
      question: 'Que faire si j\'ai oublié mon mot de passe ?',
      answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Un email de réinitialisation sera envoyé à votre adresse.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // SEO et configuration
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'Centre d\'Aide - Guide Complet Expédition DOM-TOM | ReexpresseTrack';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Centre d\'aide ReexpresseTrack : guides détaillés pour vos expéditions DOM-TOM et Maroc. Tutoriels étape par étape, résolution de problèmes, conseils d\'optimisation et support technique.');
    }

    // GTM
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: 'Centre d\'Aide - ReexpresseTrack DOM-TOM',
        page_location: window.location.href,
        page_path: '/aide',
        page_category: 'support',
        content_group1: 'pages-aide'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Centre d'aide
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher dans l'aide..."
                className="w-full px-4 py-3 pl-12 border border-transparent rounded-lg focus:ring-2 focus:ring-white focus:border-white text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Contacter le support
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Nos experts vous répondent en moins de 2h
              </p>
              <Link to="/contact">
                <Button variant="outline" size="sm">
                  Nous contacter
                </Button>
              </Link>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-green-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Suivre un colis
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Localisez vos colis en temps réel
              </p>
              <Link to="/suivi">
                <Button variant="outline" size="sm">
                  Suivre
                </Button>
              </Link>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calculator-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calculer les frais
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Estimez le coût de vos expéditions
              </p>
              <Link to="/calculateur">
                <Button variant="outline" size="sm">
                  Calculer
                </Button>
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Catégories */}
            <div className="lg:col-span-1">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Catégories
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <i className={`${category.icon} mr-3`}></i>
                        <span className="text-sm">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* FAQ */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Questions fréquentes
                </h2>
                <p className="text-gray-600">
                  {filteredFaqs.length} résultat{filteredFaqs.length > 1 ? 's' : ''} trouvé{filteredFaqs.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <Card key={index}>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </Card>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <Card className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-search-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez avec d'autres mots-clés ou contactez notre support
                  </p>
                  <Link to="/contact">
                    <Button variant="outline">
                      Contacter le support
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
