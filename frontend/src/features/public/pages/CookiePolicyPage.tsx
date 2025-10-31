import { Cookie, Shield, Settings, Trash2, Clock, Info } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function CookiePolicyPage() {
  const { resetConsent, preferences } = useCookieConsent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Bubbles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-bubble-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 150 + 50}px`,
            height: `${Math.random() * 150 + 50}px`,
            background: `radial-gradient(circle at 30% 30%, rgba(255,150,100,0.3), transparent)`,
            animationDuration: `${Math.random() * 15 + 20}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 mb-6 shadow-2xl animate-pulse-slow">
            <Cookie className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Politique de cookies 🍪
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez comment ReExpressTrack utilise les cookies pour améliorer votre expérience
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Dernière mise à jour : 31 octobre 2025
          </p>
        </div>

        {/* Current Preferences Box */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Vos préférences actuelles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${preferences.necessary ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Cookies nécessaires : <strong>Activés</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${preferences.analytics ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Cookies analytiques : <strong>{preferences.analytics ? 'Activés' : 'Désactivés'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${preferences.marketing ? 'bg-pink-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Cookies marketing : <strong>{preferences.marketing ? 'Activés' : 'Désactivés'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${preferences.preferences ? 'bg-purple-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Cookies de préférences : <strong>{preferences.preferences ? 'Activés' : 'Désactivés'}</strong></span>
              </div>
            </div>

            <button
              onClick={resetConsent}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Modifier mes préférences
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Qu'est-ce qu'un cookie */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Qu'est-ce qu'un cookie ?</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web.
                Les cookies permettent au site de mémoriser vos actions et préférences pendant une certaine période.
              </p>
              <p>
                Chez ReExpressTrack, nous utilisons les cookies pour améliorer votre expérience utilisateur, sécuriser votre navigation et analyser
                l'utilisation de notre plateforme.
              </p>
            </div>
          </section>

          {/* Types de cookies */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-900">Types de cookies que nous utilisons</h2>
            </div>

            <div className="space-y-6">
              {/* Necessary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">1. Cookies nécessaires (obligatoires)</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Ces cookies sont essentiels au fonctionnement du site. Sans eux, certaines fonctionnalités ne seraient pas disponibles.
                </p>
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Exemples d'utilisation :</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Authentification (se souvenir que vous êtes connecté)</li>
                    <li>Sécurité (protection contre les attaques CSRF)</li>
                    <li>Panier d'achat</li>
                    <li>Préférences de langue</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    <strong>Durée :</strong> Session ou jusqu'à 30 jours
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">2. Cookies analytiques (optionnels)</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site. Toutes les informations collectées sont anonymes.
                </p>
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Exemples d'utilisation :</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Nombre de visiteurs et pages vues</li>
                    <li>Durée des visites</li>
                    <li>Pages les plus consultées</li>
                    <li>Sources de trafic (comment vous êtes arrivé sur notre site)</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    <strong>Services utilisés :</strong> Google Analytics<br />
                    <strong>Durée :</strong> Jusqu'à 2 ans
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                    <span className="text-xl">📢</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">3. Cookies marketing (optionnels)</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Ces cookies sont utilisés pour afficher des publicités pertinentes pour vous sur d'autres sites web.
                </p>
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Exemples d'utilisation :</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Publicités ciblées sur les réseaux sociaux</li>
                    <li>Remarketing (vous montrer nos annonces après avoir visité notre site)</li>
                    <li>Mesure de l'efficacité des campagnes publicitaires</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    <strong>Services utilisés :</strong> Facebook Pixel, Google Ads<br />
                    <strong>Durée :</strong> Jusqu'à 1 an
                  </p>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">4. Cookies de préférences (optionnels)</h3>
                </div>
                <p className="text-gray-700 mb-3">
                  Ces cookies mémorisent vos choix pour personnaliser votre expérience.
                </p>
                <div className="bg-white/50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">Exemples d'utilisation :</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Langue préférée</li>
                    <li>Région/pays</li>
                    <li>Préférences d'affichage</li>
                    <li>Paramètres de confidentialité</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">
                    <strong>Durée :</strong> Jusqu'à 1 an
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Gestion des cookies */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Comment gérer vos cookies ?</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Sur ReExpressTrack</h3>
              <p>
                Vous pouvez modifier vos préférences à tout moment en cliquant sur le bouton "Modifier mes préférences" ci-dessus.
                Votre choix sera conservé pendant 12 mois, après quoi nous vous redemanderons votre consentement.
              </p>

              <h3 className="text-lg font-bold text-gray-900">Via votre navigateur</h3>
              <p>
                Vous pouvez également gérer les cookies directement depuis votre navigateur :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
                <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                <li><strong>Edge :</strong> Paramètres → Cookies et autorisations</li>
              </ul>

              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Attention :</strong> Le blocage de tous les cookies peut affecter le fonctionnement de notre site et limiter certaines fonctionnalités.
                </p>
              </div>
            </div>
          </section>

          {/* RGPD Compliance */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Conformité RGPD</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-3">
              <p>
                En application du Règlement Général sur la Protection des Données (RGPD), ReExpressTrack s'engage à :
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Obtenir votre consentement avant de déposer des cookies non nécessaires</li>
                <li>Vous permettre de retirer votre consentement à tout moment</li>
                <li>Conserver votre consentement pendant 12 mois maximum</li>
                <li>Vous informer clairement sur l'utilisation des cookies</li>
                <li>Ne pas utiliser les cookies pour collecter des données sensibles</li>
              </ul>

              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200 mt-4">
                <p className="text-sm text-green-800">
                  <strong>✅ Vos droits :</strong> Vous avez le droit d'accéder, rectifier, supprimer vos données et de vous opposer à leur traitement.
                  Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@reexpresstrack.com" className="text-green-600 underline">privacy@reexpresstrack.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* Durée de conservation */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Durée de conservation</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Type de cookie</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Durée maximale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Cookies de session</td>
                    <td className="px-4 py-3 text-gray-700">Jusqu'à la fermeture du navigateur</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Cookies nécessaires</td>
                    <td className="px-4 py-3 text-gray-700">30 jours</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Cookies analytiques</td>
                    <td className="px-4 py-3 text-gray-700">2 ans</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Cookies marketing</td>
                    <td className="px-4 py-3 text-gray-700">1 an</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Cookies de préférences</td>
                    <td className="px-4 py-3 text-gray-700">1 an</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">Consentement cookies</td>
                    <td className="px-4 py-3 text-gray-700">12 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-2xl shadow-xl p-8 border-2 border-purple-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions sur notre politique de cookies ?</h2>
            <p className="text-gray-700 mb-4">
              Si vous avez des questions concernant notre utilisation des cookies ou souhaitez exercer vos droits, contactez-nous :
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email :</strong> <a href="mailto:privacy@reexpresstrack.com" className="text-purple-600 underline">privacy@reexpresstrack.com</a></p>
              <p><strong>Téléphone :</strong> <a href="tel:+33614191518" className="text-purple-600 underline">+33 6 14 19 15 18</a></p>
              <p><strong>Adresse :</strong> ReExpressTrack, 64 Route de Mouy, 60290 Cauffry, France</p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-12 space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <a href="/" className="hover:text-purple-600 underline">Accueil</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-purple-600 underline">Politique de confidentialité</a>
            <span>•</span>
            <a href="/terms" className="hover:text-purple-600 underline">Conditions d'utilisation</a>
            <span>•</span>
            <a href="/contact" className="hover:text-purple-600 underline">Contact</a>
          </div>

          <button
            onClick={resetConsent}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
          >
            <Trash2 className="w-5 h-5" />
            Réinitialiser mes préférences de cookies
          </button>
        </div>
      </div>
    </div>
  );
}
