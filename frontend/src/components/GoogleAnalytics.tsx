import { useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

const GA_MEASUREMENT_ID = 'G-Z698JPXVRL';

// Declare gtag function type for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function GoogleAnalytics() {
  const { preferences } = useCookieConsent();

  useEffect(() => {
    // Function to load Google Analytics script
    const loadGoogleAnalytics = () => {
      // Check if script is already loaded
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
        return;
      }

      // Load gtag.js script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Initialize dataLayer and gtag function
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      // Initialize Google Analytics
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true, // Anonymize IP for GDPR compliance
        cookie_flags: 'SameSite=None;Secure', // Cookie security
      });

      console.log('✅ Google Analytics loaded and initialized');
    };

    // Function to remove Google Analytics
    const removeGoogleAnalytics = () => {
      // Remove gtag.js script
      const script = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
      if (script) {
        script.remove();
      }

      // Clear dataLayer
      if (window.dataLayer) {
        window.dataLayer = [];
      }

      // Remove GA cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const name = cookie.split('=')[0].trim();
        if (name.startsWith('_ga') || name.startsWith('_gid')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      }

      console.log('🗑️ Google Analytics removed and cookies cleared');
    };

    // Load or remove GA based on analytics preference
    if (preferences.analytics) {
      loadGoogleAnalytics();
    } else {
      removeGoogleAnalytics();
    }

    // Listen for cookie preference changes
    const handleCookiePreferencesUpdate = (event: CustomEvent) => {
      const prefs = event.detail;
      if (prefs.analytics) {
        loadGoogleAnalytics();
      } else {
        removeGoogleAnalytics();
      }
    };

    window.addEventListener('cookiePreferencesUpdated', handleCookiePreferencesUpdate as EventListener);

    return () => {
      window.removeEventListener('cookiePreferencesUpdated', handleCookiePreferencesUpdate as EventListener);
    };
  }, [preferences.analytics]);

  return null; // This component doesn't render anything
}

// Helper function to track page views (optional, for route changes)
export const trackPageView = (url: string, title: string) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
  }
};

// Helper function to track custom events (optional)
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};
