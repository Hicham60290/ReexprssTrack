
import React, { useState, useEffect } from 'react';
import Button from '../base/Button';
import { 
  CookiePreferences, 
  DEFAULT_COOKIE_PREFERENCES, 
  getCookiePreferences, 
  saveCookiePreferences, 
  hasUserConsented,
  updateGoogleAnalytics 
} from '../../utils/cookieConsent';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    if (!hasUserConsented()) {
      setShowBanner(true);
      // Charger les préférences par défaut
      setPreferences(DEFAULT_COOKIE_PREFERENCES);
    } else {
      // Charger les préférences sauvegardées
      setPreferences(getCookiePreferences());
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true
    };
    
    saveCookiePreferences(allAccepted);
    updateGoogleAnalytics(allAccepted);
    setShowBanner(false);
  };

  const acceptSelected = () => {
    saveCookiePreferences(preferences);
    updateGoogleAnalytics(preferences);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false
    };
    
    saveCookiePreferences(essentialOnly);
    updateGoogleAnalytics(essentialOnly);
    setShowBanner(false);
  };

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'essential') return; // Cannot disable essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!showDetails ? (
          // Bandeau simple
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="ri-cookie-line text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Nous utilisons des cookies
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Par défaut, seuls les cookies essentiels sont activés. Vous pouvez personnaliser vos préférences ou accepter tous les cookies pour une meilleure expérience.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="whitespace-nowrap"
              >
                Paramétrer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                className="whitespace-nowrap"
              >
                Essentiels uniquement
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="whitespace-nowrap"
              >
                Accepter tout
              </Button>
            </div>
          </div>
        ) : (
          // Vue détaillée
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Paramètres des cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Configuration par défaut</h4>
                  <p className="text-blue-800 text-sm">
                    Conformément au RGPD, seuls les cookies essentiels sont activés par défaut. 
                    Vous pouvez modifier ces paramètres selon vos préférences.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cookies essentiels */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Essentiels</h4>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      className="sr-only"
                    />
                    <div className="w-10 h-6 bg-green-500 rounded-full shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full shadow transform translate-x-5 translate-y-1"></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Toujours activés</strong> - Nécessaires au fonctionnement du site. Ne peuvent pas être désactivés.
                </p>
              </div>

              {/* Cookies analytiques */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Analytiques</h4>
                  <button
                    onClick={() => handlePreferenceChange('analytics')}
                    className="relative cursor-pointer"
                  >
                    <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                      preferences.analytics ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform translate-y-1 ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Désactivés par défaut</strong> - Nous aident à comprendre comment vous utilisez le site.
                </p>
              </div>

              {/* Cookies de préférences */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Préférences</h4>
                  <button
                    onClick={() => handlePreferenceChange('preferences')}
                    className="relative cursor-pointer"
                  >
                    <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                      preferences.preferences ? 'bg-purple-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform translate-y-1 ${
                        preferences.preferences ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Désactivés par défaut</strong> - Mémorisent vos choix et préférences personnelles.
                </p>
              </div>

              {/* Cookies marketing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Marketing</h4>
                  <button
                    onClick={() => handlePreferenceChange('marketing')}
                    className="relative cursor-pointer"
                  >
                    <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${
                      preferences.marketing ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform translate-y-1 ${
                        preferences.marketing ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  <strong>Désactivés par défaut</strong> - Utilisés pour personnaliser la publicité et mesurer son efficacité.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={rejectAll}
                className="whitespace-nowrap"
              >
                Cookies essentiels uniquement
              </Button>
              <Button
                variant="outline"
                onClick={acceptSelected}
                className="whitespace-nowrap"
              >
                Sauvegarder mes préférences
              </Button>
              <Button
                onClick={acceptAll}
                className="whitespace-nowrap"
              >
                Accepter tout
              </Button>
            </div>

            <div className="text-center pt-2">
              <a 
                href="/confidentialite" 
                className="text-blue-600 hover:underline text-sm cursor-pointer"
              >
                En savoir plus sur notre politique de confidentialité
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
