import { useState } from 'react';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { X, Cookie, Settings, Check } from 'lucide-react';

export default function CookieBanner() {
  const { showBanner, preferences, savePreferences, acceptAll, rejectAll } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [customPreferences, setCustomPreferences] = useState<CookiePreferences>(preferences);

  if (!showBanner) return null;

  const handleCustomSave = () => {
    savePreferences(customPreferences);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Ne peut pas être désactivé
    setCustomPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" />

      {/* Banner */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transform transition-all">
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 opacity-20" />

        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  🍪 Gestion des cookies
                </h2>
                <p className="text-sm text-gray-600">Nous respectons votre vie privée</p>
              </div>
            </div>
          </div>

          {/* Content */}
          {!showSettings ? (
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site, analyser le trafic et personnaliser le contenu.
                Certains cookies sont essentiels au fonctionnement du site, tandis que d'autres nous aident à comprendre comment vous utilisez notre plateforme.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-700">Conformité RGPD :</strong> Vous pouvez accepter tous les cookies, les refuser (sauf ceux nécessaires au fonctionnement),
                  ou personnaliser vos préférences. Votre choix sera conservé pendant 12 mois.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  <Check className="w-5 h-5 inline mr-2" />
                  Tout accepter
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transform hover:scale-105 transition-all"
                >
                  <Settings className="w-5 h-5 inline mr-2" />
                  Personnaliser
                </button>

                <button
                  onClick={rejectAll}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all"
                >
                  <X className="w-5 h-5 inline mr-2" />
                  Tout refuser
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                En savoir plus dans notre{' '}
                <a href="/cookie-policy" className="text-purple-600 hover:underline font-semibold">
                  Politique de cookies
                </a>
                {' '}et notre{' '}
                <a href="/privacy" className="text-purple-600 hover:underline font-semibold">
                  Politique de confidentialité
                </a>
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-700 mb-4">
                Personnalisez vos préférences de cookies. Les cookies nécessaires sont toujours activés car ils sont essentiels au fonctionnement du site.
              </p>

              {/* Cookie Categories */}
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Cookies nécessaires</h3>
                        <p className="text-xs text-gray-600">Toujours actifs</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-5 h-5 bg-white rounded-full shadow" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Ces cookies sont essentiels pour le fonctionnement du site (authentification, sécurité, panier).
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xl">📊</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Cookies analytiques</h3>
                        <p className="text-xs text-gray-600">Optionnels</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePreference('analytics')}
                      className={`w-12 h-6 rounded-full flex items-center transition-all ${
                        customPreferences.analytics
                          ? 'bg-blue-500 justify-end'
                          : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">
                    Nous aident à comprendre comment vous utilisez le site pour améliorer votre expérience.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-pink-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                        <span className="text-white text-xl">📢</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Cookies marketing</h3>
                        <p className="text-xs text-gray-600">Optionnels</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePreference('marketing')}
                      className={`w-12 h-6 rounded-full flex items-center transition-all ${
                        customPreferences.marketing
                          ? 'bg-pink-500 justify-end'
                          : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">
                    Utilisés pour vous proposer des publicités pertinentes sur d'autres sites.
                  </p>
                </div>

                {/* Preferences Cookies */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xl">⚙️</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Cookies de préférences</h3>
                        <p className="text-xs text-gray-600">Optionnels</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePreference('preferences')}
                      className={`w-12 h-6 rounded-full flex items-center transition-all ${
                        customPreferences.preferences
                          ? 'bg-purple-500 justify-end'
                          : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">
                    Mémorisent vos choix (langue, région) pour personnaliser votre expérience.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleCustomSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
                >
                  Enregistrer mes préférences
                </button>

                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all"
                >
                  Retour
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
