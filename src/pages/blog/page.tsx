
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';

const blogPosts = [
  {
    id: 'abonnements-domtom-tarifs-preferentiels',
    title: 'Abonnements DOM-TOM : Tarifs préférentiels pour vos expéditions',
    excerpt: 'Découvrez nos formules d\'abonnement spécialement conçues pour les résidents des DOM-TOM. Économisez jusqu\'à 60% sur vos frais d\'expédition avec nos tarifs préférentiels.',
    date: '12 Dec 2024',
    readTime: '6 min',
    category: 'Abonnements',
    image: 'https://readdy.ai/api/search-image?query=tropical%20island%20landscape%20with%20modern%20shipping%20containers%20and%20logistics%20concept%2C%20caribbean%20scenery%2C%20professional%20photography%2C%20bright%20colors%2C%20palm%20trees%2C%20ocean%20view&width=400&height=250&seq=blog-domtom-subscription&orientation=landscape',
    slug: '/blog/abonnements-domtom-tarifs-preferentiels'
  },
  {
    id: 'achat-pour-moi-assistant-personnel',
    title: 'Service d\'achat pour moi : Votre assistant personnel d\'expédition',
    excerpt: 'Laissez notre équipe faire vos achats en France et vous les expédier. Service personnalisé pour tous vos besoins shopping depuis les DOM-TOM et le Maroc.',
    date: '10 Dec 2024',
    readTime: '7 min',
    category: 'Services',
    image: 'https://static.readdy.ai/image/99ff8ee0c27f1c25e3ad19898dcaee78/df35aa815a9dff93c81240d756967c3d.png',
    slug: '/blog/achat-pour-moi-assistant-personnel'
  },
  {
    id: 'achat-pour-moi-processus-complet',
    title: 'Achat pour moi : Le processus complet de A à Z',
    excerpt: 'Guide détaillé de notre service d\'achat personnalisé. De votre demande à la livraison, découvrez chaque étape de notre processus d\'achat pour vous.',
    date: '8 Dec 2024',
    readTime: '9 min',
    category: 'Services',
    image: 'https://readdy.ai/api/search-image?query=step%20by%20step%20shopping%20process%20illustration%2C%20modern%20logistics%20workflow%2C%20professional%20service%20delivery%2C%20clean%20minimalist%20design%2C%20french%20shopping%20centers&width=400&height=250&seq=blog-shopping-process&orientation=landscape',
    slug: '/blog/achat-pour-moi-processus-complet'
  },
  {
    id: 'calculateur-tarifs-expedition-domtom',
    title: 'Calculateur de tarifs : Estimez vos frais d\'expédition DOM-TOM',
    excerpt: 'Utilisez notre calculateur gratuit pour estimer précisément vos frais d\'expédition vers les DOM-TOM. Tarifs transparents et devis instantané.',
    date: '5 Dec 2024',
    readTime: '5 min',
    category: 'Outils',
    image: 'https://readdy.ai/api/search-image?query=modern%20calculator%20interface%20with%20shipping%20costs%2C%20digital%20pricing%20tool%2C%20professional%20logistics%20dashboard%2C%20clean%20blue%20interface%20design%2C%20french%20overseas%20territories%20map&width=400&height=250&seq=blog-calculator&orientation=landscape',
    slug: '/blog/calculateur-tarifs-expedition-domtom'
  },
  {
    id: 'engagement-environnemental-reexpresstrack',
    title: 'Notre engagement environnemental pour un transport responsable',
    excerpt: 'Découvrez nos initiatives écologiques et notre engagement pour un transport maritime responsable vers les DOM-TOM et le Maroc.',
    date: '3 Dec 2024',
    readTime: '6 min',
    category: 'Expédition',
    image: 'https://readdy.ai/api/search-image?query=eco-friendly%20shipping%20containers%20on%20green%20cargo%20ship%2C%20sustainable%20maritime%20transport%2C%20environmental%20responsibility%2C%20clean%20ocean%20waters%2C%20renewable%20energy%20logistics&width=400&height=250&seq=blog-eco-shipping&orientation=landscape',
    slug: '/blog/engagement-environnemental-reexpresstrack'
  },
  {
    id: 'guide-achat-amazon-france-domtom',
    title: 'Guide d\'achat Amazon France depuis les DOM-TOM',
    excerpt: 'Tout ce que vous devez savoir pour acheter sur Amazon France depuis les DOM-TOM. Astuces, conseils et optimisation de vos commandes.',
    date: '1 Dec 2024',
    readTime: '8 min',
    category: 'Expédition',
    image: 'https://readdy.ai/api/search-image?query=amazon%20france%20shopping%20from%20caribbean%20islands%2C%20online%20shopping%20experience%2C%20tropical%20background%20with%20modern%20technology%2C%20bright%20natural%20lighting%2C%20lifestyle%20photography&width=400&height=250&seq=blog-amazon-guide&orientation=landscape',
    slug: '/blog/guide-achat-amazon-france-domtom'
  },
  {
    id: 'service-retour-dom-tom-france',
    title: 'Service de retour DOM-TOM vers la France facilité',
    excerpt: 'Retournez facilement vos achats en France depuis les DOM-TOM. Procédure simplifiée, étiquettes prépayées et suivi en temps réel.',
    date: '28 Nov 2024',
    readTime: '7 min',
    category: 'Retours',
    image: 'https://readdy.ai/api/search-image?query=return%20shipping%20service%20from%20caribbean%20to%20france%2C%20reverse%20logistics%2C%20professional%20packaging%2C%20customer%20service%20excellence%2C%20modern%20warehouse%20facility&width=400&height=250&seq=blog-return-service&orientation=landscape',
    slug: '/blog/service-retour-dom-tom-france'
  },
  {
    id: 'suivi-colis-temps-reel-domtom',
    title: 'Suivi de colis en temps réel pour les DOM-TOM',
    excerpt: 'Suivez vos colis en temps réel de la France vers les DOM-TOM. Notifications automatiques, localisation précise et transparence totale.',
    date: '25 Nov 2024',
    readTime: '6 min',
    category: 'Suivi',
    image: 'https://readdy.ai/api/search-image?query=real-time%20package%20tracking%20dashboard%2C%20modern%20logistics%20technology%2C%20GPS%20tracking%20interface%2C%20professional%20shipping%20monitoring%2C%20caribbean%20destinations&width=400&height=250&seq=blog-tracking&orientation=landscape',
    slug: '/blog/suivi-colis-temps-reel-domtom'
  }
];

const categories = ['Tous', 'Expédition', 'Retours', 'Outils', 'Suivi', 'Services', 'Abonnements'];

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const filteredPosts = selectedCategory === 'Tous' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  useEffect(() => {
    // SEO configuration
    document.title = 'Blog ReexpresseTrack - Guides expédition DOM-TOM et Maroc';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Guides complets, conseils et actualités pour optimiser vos expéditions vers DOM-TOM et Maroc. Astuces Amazon, tarifs, suivi colis et service retour.');
    }

    // Schema.org JSON-LD for Blog
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog ReexpresseTrack",
      "description": "Guides et conseils pour l'expédition vers DOM-TOM et Maroc",
      "url": `${process.env.VITE_SITE_URL || "https://example.com"}/blog`,
      "publisher": {
        "@type": "Organization",
        "name": "ReexpresseTrack",
        "url": process.env.VITE_SITE_URL || "https://example.com"
      },
      "blogPost": blogPosts.map(post => ({
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "url": `${process.env.VITE_SITE_URL || "https://example.com"}${post.slug}`,
        "datePublished": new Date(post.date).toISOString(),
        "author": {
          "@type": "Organization",
          "name": "ReexpresseTrack"
        },
        "publisher": {
          "@type": "Organization", 
          "name": "ReexpresseTrack"
        },
        "image": post.image,
        "articleSection": post.category
      }))
    });
    
    // Remove existing script if any
    const existingScript = document.querySelector('script[type="application/ld+json"][data-page="blog"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    schemaScript.setAttribute('data-page', 'blog');
    document.head.appendChild(schemaScript);

    return () => {
      const script = document.querySelector('script[type="application/ld+json"][data-page="blog"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Blog ReexpressTrack
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Conseils, guides et actualités pour optimiser vos expéditions vers les DOM-TOM et le Maroc
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-blue-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={post.slug}
                className="group cursor-pointer"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {post.date}
                      </span>
                      <span className="text-blue-600 text-sm font-medium group-hover:text-blue-800">
                        Lire la suite →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun article trouvé dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Restez informé de nos dernières actualités
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Recevez nos conseils d'expédition, les dernières offres et les guides pratiques directement dans votre boîte mail.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            S'abonner à la newsletter
            <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPage;
