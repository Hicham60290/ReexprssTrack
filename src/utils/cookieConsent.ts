
export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

// État par défaut conforme RGPD - Seuls les cookies essentiels sont activés
export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,      // Toujours activé - nécessaire au fonctionnement
  analytics: false,     // Désactivé par défaut - nécessite consentement
  preferences: false,   // Désactivé par défaut - nécessite consentement  
  marketing: false      // Désactivé par défaut - nécessite consentement
};

// Fonction pour obtenir les préférences actuelles ou par défaut
export const getCookiePreferences = (): CookiePreferences => {
  const savedPrefs = localStorage.getItem('cookie-consent');
  
  if (savedPrefs) {
    try {
      return JSON.parse(savedPrefs);
    } catch (error) {
      console.error('Erreur lors de la lecture des préférences cookies:', error);
      return DEFAULT_COOKIE_PREFERENCES;
    }
  }
  
  return DEFAULT_COOKIE_PREFERENCES;
};

// Fonction pour sauvegarder les préférences
export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  localStorage.setItem('cookie-consent', JSON.stringify(preferences));
};

// Fonction pour vérifier si l'utilisateur a donné son consentement
export const hasUserConsented = (): boolean => {
  return localStorage.getItem('cookie-consent') !== null;
};

// Fonction pour activer/désactiver Google Analytics selon le consentement
export const updateGoogleAnalytics = (preferences: CookiePreferences): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Configuration Google Analytics selon les préférences
    window.gtag('consent', 'update', {
      'analytics_storage': preferences.analytics ? 'granted' : 'denied',
      'ad_storage': preferences.marketing ? 'granted' : 'denied',
      'functionality_storage': preferences.preferences ? 'granted' : 'denied',
      'personalization_storage': preferences.preferences ? 'granted' : 'denied',
      'security_storage': 'granted' // Toujours accordé pour la sécurité
    });
  }
};

// Types pour TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
