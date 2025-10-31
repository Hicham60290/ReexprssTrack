import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean; // Toujours true (requis)
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const COOKIE_CONSENT_KEY = 'reexpresstrack_cookie_consent';
const COOKIE_CONSENT_DATE_KEY = 'reexpresstrack_cookie_consent_date';

export const useCookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const consentDate = localStorage.getItem(COOKIE_CONSENT_DATE_KEY);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
        setShowBanner(false);

        // Vérifier si le consentement a plus de 12 mois (RGPD)
        if (consentDate) {
          const consentTime = new Date(consentDate).getTime();
          const now = new Date().getTime();
          const twelveMonths = 12 * 30 * 24 * 60 * 60 * 1000;

          if (now - consentTime > twelveMonths) {
            // Le consentement a expiré, redemander
            setShowBanner(true);
          }
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    const prefsToSave = {
      ...newPreferences,
      necessary: true, // Toujours true
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefsToSave));
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    setPreferences(prefsToSave);
    setShowBanner(false);

    // Appliquer les préférences
    applyPreferences(prefsToSave);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  const rejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_DATE_KEY);
    setShowBanner(true);
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // Nettoyer les cookies si refusés
    if (!prefs.analytics) {
      // Supprimer les cookies analytics (Google Analytics, etc.)
      deleteCookiesByPrefix('_ga');
      deleteCookiesByPrefix('_gid');
    }

    if (!prefs.marketing) {
      // Supprimer les cookies marketing
      deleteCookiesByPrefix('_fbp');
      deleteCookiesByPrefix('_gcl');
    }

    if (!prefs.preferences) {
      // Supprimer les cookies de préférences (sauf le consentement lui-même)
      // Garder uniquement les cookies nécessaires
    }

    // Émettre un événement pour que d'autres parties de l'app puissent réagir
    window.dispatchEvent(
      new CustomEvent('cookiePreferencesUpdated', { detail: prefs })
    );
  };

  const deleteCookiesByPrefix = (prefix: string) => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith(prefix)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }
  };

  return {
    showBanner,
    preferences,
    savePreferences,
    acceptAll,
    rejectAll,
    resetConsent,
  };
};
