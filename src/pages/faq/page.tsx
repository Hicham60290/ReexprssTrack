import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  popular: boolean;
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'Toutes les questions', icon: 'ri-question-line' },
    { id: 'getting-started', name: 'Démarrage', icon: 'ri-play-circle-line' },
    { id: 'address', name: 'Adresse française', icon: 'ri-map-pin-line' },
    { id: 'shipping', name: 'Expédition', icon: 'ri-truck-line' },
    { id: 'billing', name: 'Facturation', icon: 'ri-bill-line' },
    { id: 'account', name: 'Mon compte', icon: 'ri-user-line' },
    { id: 'technical', name: 'Technique', icon: 'ri-settings-line' }
  ];

  const faqs: FAQItem[] = [
    // Questions populaires
    {
      id: '1',
      category: 'getting-started',
      question: 'Comment obtenir mon adresse française gratuitement ?',
      answer: 'Il suffit de créer un compte gratuit sur ReexpresseTrack. Une fois inscrit, vous recevez instantanément votre adresse française personnalisée avec un numéro de boîte unique. Cette adresse est valable à vie et vous permet de recevoir tous vos colis en France.',
      popular: true
    },
    {
      id: '2',
      category: 'shipping',
      question: 'Quels sont les délais de livraison vers les DOM-TOM ?',
      answer: 'Les délais varient selon le service choisi :\n• Service Standard : 7-14 jours ouvrés\n• Service Express : 3-5 jours ouvrés\n• Service Premium : 1-2 jours ouvrés\n\nPour les DOM-TOM (Guadeloupe, Martinique, Réunion, Guyane), comptez généralement 5-8 jours en service express.',
      popular: true
    },
    {
      id: '3',
      category: 'billing',
      question: 'Comment sont calculés les frais d\'expédition ?',
      answer: 'Les frais dépendent de plusieurs facteurs :\n• Destination finale\n• Poids et dimensions du colis\n• Service d\'expédition choisi (Standard, Express, Premium)\n• Valeur déclarée pour l\'assurance\n\nUtilisez notre calculateur gratuit pour obtenir une estimation précise avant expédition.',
      popular: true
    },
    {
      id: '4',
      category: 'address',
      question: 'Puis-je utiliser mon adresse française pour tous mes achats ?',
      answer: 'Oui, votre adresse française peut être utilisée sur tous les sites e-commerce français et européens : Amazon, Cdiscount, Fnac, Zalando, etc. Elle fonctionne aussi pour les achats professionnels et les documents administratifs.',
      popular: true
    },
    {
      id: '5',
      category: 'shipping',
      question: 'Puis-je grouper plusieurs colis en un seul envoi ?',
      answer: 'Absolument ! La consolidation de colis est gratuite. Vous pouvez demander le regroupement de plusieurs colis reçus dans votre espace client. Cela permet d\'économiser considérablement sur les frais d\'expédition internationaux.',
      popular: true
    },

    // Questions sur l'adresse française
    {
      id: '6',
      category: 'address',
      question: 'Mon adresse française est-elle permanente ?',
      answer: 'Oui, votre adresse française est permanente tant que votre compte reste actif. Même avec un compte gratuit, votre adresse reste valable indéfiniment. Vous gardez le même numéro de boîte personnalisé.',
      popular: false
    },
    {
      id: '7',
      category: 'address',
      question: 'Puis-je recevoir des documents officiels sur mon adresse française ?',
      answer: 'Oui, vous pouvez recevoir tous types de courriers : factures, relevés bancaires, documents administratifs, etc. Nous traitons votre courrier avec la même attention que vos colis.',
      popular: false
    },
    {
      id: '8',
      category: 'address',
      question: 'Comment modifier l\'adresse de livraison finale ?',
      answer: 'Vous pouvez modifier votre adresse de livraison à tout moment dans votre espace client, section "Mon profil". Les modifications sont prises en compte immédiatement pour les prochaines expéditions.',
      popular: false
    },

    // Questions sur l'expédition
    {
      id: '9',
      category: 'shipping',
      question: 'Expédiez-vous vers l\'Afrique ?',
      answer: 'Oui, nous expédions vers toute l\'Afrique : Maroc, Tunisie, Sénégal, Côte d\'Ivoire, Cameroun, etc. Plus de 50 pays africains sont desservis avec des tarifs préférentiels pour nos abonnés.',
      popular: false
    },
    {
      id: '10',
      category: 'shipping',
      question: 'Que se passe-t-il si mon colis est endommagé ?',
      answer: 'Si votre colis arrive endommagé, contactez-nous immédiatement avec photos à l\'appui. Nos assurances couvrent les dommages jusqu\'à 1000€. Une déclaration sera faite auprès du transporteur pour remboursement.',
      popular: false
    },
    {
      id: '11',
      category: 'shipping',
      question: 'Puis-je suivre mon colis en temps réel ?',
      answer: 'Oui, le suivi est disponible 24h/24 dans votre espace client. Vous recevez des notifications SMS et email à chaque étape : réception, préparation, expédition, douane, livraison.',
      popular: false
    },
    {
      id: '12',
      category: 'shipping',
      question: 'Combien de temps mes colis sont-ils stockés gratuitement ?',
      answer: 'Le stockage gratuit varie selon votre abonnement :\n• Compte gratuit : 30 jours\n• Abonnement mensuel : 60 jours\n• Abonnement annuel : 90 jours\n\nAu-delà, des frais de stockage de 1€/semaine s\'appliquent.',
      popular: false
    },

    // Questions sur la facturation
    {
      id: '13',
      category: 'billing',
      question: 'Quels sont les moyens de paiement acceptés ?',
      answer: 'Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express), PayPal, et les virements SEPA. Les paiements sont sécurisés par Stripe.',
      popular: false
    },
    {
      id: '14',
      category: 'billing',
      question: 'Y a-t-il des frais cachés ?',
      answer: 'Non, tous nos tarifs sont transparents. Les seuls frais sont :\n• Frais d\'expédition (calculés selon destination)\n• Abonnement optionnel (2,50€/mois ou 20€/an)\n• Stockage prolongé (après période gratuite)\n\nAucun frais de dossier ou frais cachés.',
      popular: false
    },
    {
      id: '15',
      category: 'billing',
      question: 'Puis-je annuler mon abonnement à tout moment ?',
      answer: 'Oui, l\'annulation est possible à tout moment sans préavis. Vous conservez les avantages jusqu\'à la fin de votre période payée. Votre compte redevient gratuit automatiquement.',
      popular: false
    },

    // Questions sur le compte
    {
      id: '16',
      category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Connectez-vous à votre espace client et rendez-vous dans "Mon profil". Vous pouvez modifier : nom, adresse de livraison, téléphone, préférences de notification, etc.',
      popular: false
    },
    {
      id: '17',
      category: 'account',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Saisissez votre email, vous recevrez un lien de réinitialisation valable 24h. Suivez les instructions pour créer un nouveau mot de passe.',
      popular: false
    },
    {
      id: '18',
      category: 'account',
      question: 'Puis-je avoir plusieurs adresses de livraison ?',
      answer: 'Oui, vous pouvez enregistrer plusieurs adresses de livraison dans votre compte. Pratique si vous envoyez vers différentes destinations ou si vous déménagez temporairement.',
      popular: false
    },

    // Questions techniques
    {
      id: '19',
      category: 'technical',
      question: 'Le site est-il sécurisé pour mes paiements ?',
      answer: 'Oui, notre site utilise le cryptage SSL 256 bits. Les paiements sont traités par Stripe, certifié PCI DSS niveau 1. Vos données bancaires ne sont jamais stockées sur nos serveurs.',
      popular: false
    },
    {
      id: '20',
      category: 'technical',
      question: 'Puis-je utiliser l\'application mobile ?',
      answer: 'Notre site est optimisé pour mobile et tablette. Une application mobile native est en développement et sera disponible prochainement sur App Store et Google Play.',
      popular: false
    },
    {
      id: '21',
      category: 'getting-started',
      question: 'Combien coûte la création de l\'adresse française ?',
      answer: 'La création de votre adresse française personnalisée est entièrement gratuite ! Aucun frais d\'inscription, aucun engagement. Vous ne payez que lors de l\'expédition de vos colis.',
      popular: false
    },
    {
      id: '22',
      category: 'getting-started',
      question: 'Dois-je fournir des documents pour m\'inscrire ?',
      answer: 'Non, l\'inscription ne nécessite aucun document. Seuls votre email et vos coordonnées sont requis. La vérification d\'identité n\'est demandée que pour des colis de très haute valeur (+1000€).',
      popular: false
    }
  ];

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularFaqs = faqs.filter(faq => faq.popular);

  // SEO et configuration
  useEffect(() => {
    // Configuration SEO dynamique
    document.title = 'FAQ - Questions Fréquentes Expédition DOM-TOM et Maroc | ReexpresseTrack';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Réponses aux questions fréquentes sur l\'expédition DOM-TOM et Maroc. Adresse française, délais de livraison, tarifs, consolidation de colis. Plus de 20 questions détaillées avec réponses complètes.');
    }

    // GTM
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: 'FAQ - Questions Fréquentes ReexpresseTrack',
        page_location: window.location.href,
        page_path: '/faq',
        page_category: 'support',
        content_group1: 'pages-aide'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Questions Fréquemment Posées (FAQ)
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Trouvez rapidement les réponses à toutes vos questions sur notre service de réexpédition
          </p>
          
          {/* Barre de recherche */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher dans la FAQ..."
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

      {/* Questions populaires */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Questions les Plus Posées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularFaqs.map((faq) => (
              <Card key={faq.id} className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3 pr-8">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ complète */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar avec catégories */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
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

              {/* Actions rapides */}
              <Card className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Actions Rapides
                </h3>
                <div className="space-y-3">
                  <Link to="/contact">
                    <Button variant="outline" size="sm" className="w-full whitespace-nowrap">
                      <i className="ri-customer-service-line mr-2"></i>
                      Contacter le Support
                    </Button>
                  </Link>
                  <Link to="/inscription">
                    <Button variant="outline" size="sm" className="w-full whitespace-nowrap">
                      <i className="ri-user-add-line mr-2"></i>
                      Créer un Compte
                    </Button>
                  </Link>
                  <Link to="/calculateur">
                    <Button variant="outline" size="sm" className="w-full whitespace-nowrap">
                      <i className="ri-calculator-line mr-2"></i>
                      Calculer les Frais
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Liste des FAQ */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Toutes les Questions
                </h2>
                <p className="text-gray-600">
                  {filteredFaqs.length} question{filteredFaqs.length > 1 ? 's' : ''} trouvée{filteredFaqs.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <Card key={faq.id}>
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 pr-4">
                          {faq.question}
                          {faq.popular && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Populaire
                            </span>
                          )}
                        </h3>
                        <div className="flex-shrink-0">
                          <i className={`ri-arrow-${expandedItems.includes(faq.id) ? 'up' : 'down'}-s-line text-gray-400`}></i>
                        </div>
                      </div>
                    </button>
                    
                    {expandedItems.includes(faq.id) && (
                      <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <Card className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-search-line text-2xl text-gray-400"></i>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Aucune question trouvée
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez avec d'autres mots-clés ou contactez notre support
                  </p>
                  <Link to="/contact">
                    <Button variant="outline">
                      Contacter le Support
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section contact */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Notre équipe support est là pour vous aider 7j/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="w-full sm:w-auto whitespace-nowrap">
                <i className="ri-customer-service-line mr-2"></i>
                Contacter le Support
              </Button>
            </Link>
            <Link to="/aide">
              <Button variant="outline" size="lg" className="w-full sm:w-auto whitespace-nowrap bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
                <i className="ri-question-line mr-2"></i>
                Centre d'Aide
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}