import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  noindex?: boolean;
  schema?: object;
}

const DEFAULT_TITLE = 'ReExpressTrack - Réexpédition de colis vers DOM-TOM et Maroc';
const DEFAULT_DESCRIPTION = 'Service de réexpédition de colis depuis la France vers les DOM-TOM et le Maroc. Économisez jusqu\'à 60% sur vos frais d\'expédition. Adresse française gratuite, suivi en temps réel.';
const DEFAULT_KEYWORDS = 'réexpédition colis, DOM-TOM, Guadeloupe, Martinique, Guyane, Réunion, Mayotte, Maroc, livraison internationale, expédition France, adresse française, suivi colis, tracking';
const DEFAULT_OG_IMAGE = '/og-image.png';
const SITE_URL = 'https://reexpresstrack.com';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false,
  schema,
}: SEOProps) {
  const fullTitle = title ? `${title} | ReExpressTrack` : DEFAULT_TITLE;
  const fullOgUrl = ogUrl || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const fullCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);

    // Open Graph
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', ogType, true);
    updateMeta('og:url', fullOgUrl, true);
    updateMeta('og:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`, true);
    updateMeta('og:site_name', 'ReExpressTrack', true);
    updateMeta('og:locale', 'fr_FR', true);

    // Twitter Card
    updateMeta('twitter:card', twitterCard);
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`);

    // Robots
    if (noindex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonical);

    // Schema.org structured data
    if (schema) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    }

    // Additional SEO meta tags
    updateMeta('language', 'French');
    updateMeta('author', 'ReExpressTrack');
    updateMeta('copyright', 'ReExpressTrack');
    updateMeta('rating', 'General');
    updateMeta('distribution', 'Global');

  }, [fullTitle, description, keywords, ogType, ogImage, fullOgUrl, twitterCard, fullCanonical, noindex, schema]);

  return null;
}

// Helper function to create organization schema
export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ReExpressTrack',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: DEFAULT_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
    addressLocality: 'Cauffry',
    postalCode: '60290',
    streetAddress: '64 Route de Mouy',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@reexpresstrack.com',
    contactType: 'Customer Service',
    availableLanguage: ['French'],
  },
  sameAs: [
    'https://facebook.com/reexpresstrack',
    'https://twitter.com/reexpresstrack',
    'https://instagram.com/reexpresstrack',
  ],
});

// Helper function to create service schema
export const createServiceSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Réexpédition de colis',
  provider: {
    '@type': 'Organization',
    name: 'ReExpressTrack',
    url: SITE_URL,
  },
  areaServed: [
    { '@type': 'Country', name: 'Guadeloupe' },
    { '@type': 'Country', name: 'Martinique' },
    { '@type': 'Country', name: 'Guyane' },
    { '@type': 'Country', name: 'Réunion' },
    { '@type': 'Country', name: 'Mayotte' },
    { '@type': 'Country', name: 'Maroc' },
  ],
  description: DEFAULT_DESCRIPTION,
  offers: {
    '@type': 'Offer',
    price: '2.50',
    priceCurrency: 'EUR',
    description: 'Tarif Premium - Réexpédition de colis',
  },
});

// Helper function to create FAQ schema
export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Helper function to create breadcrumb schema
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.url}`,
  })),
});
