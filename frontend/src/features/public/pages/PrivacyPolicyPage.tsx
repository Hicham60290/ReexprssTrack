import { Shield, Lock, Eye, Database, Users, FileText, Mail, Clock, AlertTriangle, CheckCircle, Download, Trash2 } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  const { resetConsent } = useCookieConsent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Bubbles */}
      {[...Array(15)].map((_, i) => (
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-2xl animate-pulse-slow">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Politique de confidentialité 🔒
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Votre vie privée est notre priorité. Découvrez comment ReExpressTrack collecte, utilise et protège vos données personnelles.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Dernière mise à jour : 31 octobre 2025
          </p>
        </div>

        {/* Quick Summary */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 rounded-2xl shadow-xl p-8 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
              En résumé
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <p><strong>Données minimales :</strong> Nous ne collectons que les informations nécessaires au service</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <p><strong>Sécurité maximale :</strong> Chiffrement SSL/TLS et stockage sécurisé</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <p><strong>Vos droits RGPD :</strong> Accès, rectification, suppression à tout moment</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2" />
                <p><strong>Pas de vente :</strong> Vos données ne sont jamais vendues à des tiers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto space-y-8">

          {/* 1. Introduction */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Bienvenue sur ReExpressTrack. Nous sommes engagés à protéger et respecter votre vie privée.
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons
                vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-sm text-purple-800 mb-2">
                  <strong>Responsable du traitement des données :</strong>
                </p>
                <p className="text-sm text-purple-900">
                  ReExpressTrack<br />
                  Email : <a href="mailto:privacy@reexpresstrack.com" className="text-purple-600 underline">privacy@reexpresstrack.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* 2. Données collectées */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">2. Données que nous collectons</h2>
            </div>
            <div className="space-y-6">

              {/* Données d'inscription */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Données d'inscription et de compte
                </h3>
                <p className="text-gray-700 mb-3">
                  Lorsque vous créez un compte sur ReExpressTrack, nous collectons :
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                  <li><strong>Informations d'identité :</strong> Nom, prénom, date de naissance</li>
                  <li><strong>Coordonnées :</strong> Adresse email, numéro de téléphone</li>
                  <li><strong>Adresse :</strong> Adresse postale (pour la livraison et facturation)</li>
                  <li><strong>Informations de connexion :</strong> Mot de passe (chiffré), adresse IP</li>
                </ul>
                <p className="text-xs text-blue-700 mt-3">
                  <strong>Base légale :</strong> Exécution du contrat (fourniture du service de réexpédition)
                </p>
              </div>

              {/* Données de colis */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 border-2 border-orange-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  📦 Données de colis et d'expédition
                </h3>
                <p className="text-gray-700 mb-3">
                  Pour assurer le service de réexpédition, nous collectons :
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                  <li><strong>Informations sur les colis :</strong> Description, poids, dimensions, valeur</li>
                  <li><strong>Adresses de livraison :</strong> Destinataires, adresses de réexpédition</li>
                  <li><strong>Numéros de suivi :</strong> Tracking des transporteurs</li>
                  <li><strong>Photos :</strong> Images des colis (si uploadées par l'utilisateur)</li>
                  <li><strong>Documents douaniers :</strong> Factures, déclarations (pour envois internationaux)</li>
                </ul>
                <p className="text-xs text-orange-700 mt-3">
                  <strong>Base légale :</strong> Exécution du contrat et obligations légales (douanes)
                </p>
              </div>

              {/* Données de paiement */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  💳 Données de paiement
                </h3>
                <p className="text-gray-700 mb-3">
                  Pour traiter les paiements :
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                  <li><strong>Informations de facturation :</strong> Nom, adresse de facturation</li>
                  <li><strong>Paiements par carte :</strong> Les données bancaires sont traitées directement par Stripe (PCI-DSS certifié). Nous ne stockons jamais vos numéros de carte complets.</li>
                  <li><strong>Historique de paiement :</strong> Montants, dates, statuts des transactions</li>
                </ul>
                <p className="text-xs text-green-700 mt-3">
                  <strong>Base légale :</strong> Exécution du contrat et obligations légales (comptabilité)
                </p>
              </div>

              {/* Données techniques */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  🖥️ Données techniques et de navigation
                </h3>
                <p className="text-gray-700 mb-3">
                  Pour améliorer notre service et assurer la sécurité :
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-4">
                  <li><strong>Logs de connexion :</strong> Adresse IP, date et heure de connexion</li>
                  <li><strong>Données de navigation :</strong> Pages visitées, temps passé, appareil utilisé</li>
                  <li><strong>Cookies :</strong> Voir notre <Link to="/cookie-policy" className="text-purple-600 underline">Politique de cookies</Link></li>
                  <li><strong>Données de performance :</strong> Erreurs techniques, temps de chargement</li>
                </ul>
                <p className="text-xs text-purple-700 mt-3">
                  <strong>Base légale :</strong> Intérêt légitime (sécurité, amélioration du service) et consentement (cookies)
                </p>
              </div>

            </div>
          </section>

          {/* 3. Utilisation des données */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-900">3. Comment nous utilisons vos données</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>Nous utilisons vos données personnelles uniquement pour les finalités suivantes :</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-pink-50 rounded-lg p-4 border-2 border-pink-200">
                  <h4 className="font-bold text-gray-900 mb-2">✅ Fourniture du service</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Gestion de votre compte</li>
                    <li>• Traitement des colis</li>
                    <li>• Réexpédition et livraison</li>
                    <li>• Suivi des envois</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2">💬 Communication</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Notifications de colis</li>
                    <li>• Support client</li>
                    <li>• Factures et reçus</li>
                    <li>• Mises à jour du service</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2">💳 Paiements</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Traitement des paiements</li>
                    <li>• Facturation</li>
                    <li>• Gestion des abonnements</li>
                    <li>• Prévention de la fraude</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2">📊 Amélioration</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Analyses statistiques</li>
                    <li>• Amélioration de l'UX</li>
                    <li>• Développement de nouvelles fonctionnalités</li>
                    <li>• Résolution de bugs</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-gray-900 mb-2">🛡️ Sécurité</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Prévention de la fraude</li>
                    <li>• Détection d'abus</li>
                    <li>• Sécurité des comptes</li>
                    <li>• Conformité légale</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-2">📧 Marketing (optionnel)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Newsletters</li>
                    <li>• Offres promotionnelles</li>
                    <li>• Recommandations personnalisées</li>
                    <li>• Vous pouvez vous désabonner à tout moment</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Partage des données */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">4. Partage de vos données</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="font-semibold text-lg text-orange-700">
                ⚠️ Nous ne vendons JAMAIS vos données personnelles à des tiers.
              </p>
              <p>Cependant, nous partageons vos données avec des partenaires de confiance dans les cas suivants :</p>

              <div className="space-y-3">
                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <h4 className="font-bold text-gray-900 mb-2">🚚 Transporteurs et partenaires logistiques</h4>
                  <p className="text-sm">
                    Pour assurer la livraison de vos colis, nous partageons les informations nécessaires (nom, adresse, numéro de suivi)
                    avec nos transporteurs (La Poste, Chronopost, DHL, etc.).
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-bold text-gray-900 mb-2">💳 Prestataires de paiement</h4>
                  <p className="text-sm">
                    Les paiements sont traités via Stripe (certifié PCI-DSS niveau 1). Stripe reçoit les informations nécessaires
                    pour traiter les transactions de manière sécurisée.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-bold text-gray-900 mb-2">📊 Services d'analyse (avec votre consentement)</h4>
                  <p className="text-sm">
                    Si vous acceptez les cookies analytiques, nous utilisons Google Analytics pour analyser l'utilisation du site.
                    Les données sont anonymisées et agrégées.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <h4 className="font-bold text-gray-900 mb-2">🏛️ Autorités légales</h4>
                  <p className="text-sm">
                    Nous pouvons divulguer vos données si requis par la loi, une décision de justice, ou pour protéger
                    nos droits légaux et ceux de nos utilisateurs.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Sécurité */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">5. Sécurité de vos données</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Nous prenons la sécurité de vos données très au sérieux et mettons en œuvre des mesures techniques
                et organisationnelles appropriées pour protéger vos informations personnelles.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-600" />
                    Chiffrement
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• SSL/TLS pour toutes les communications</li>
                    <li>• Chiffrement des mots de passe (bcrypt)</li>
                    <li>• Données sensibles chiffrées au repos</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Contrôles d'accès
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Authentification forte (JWT)</li>
                    <li>• Accès limité aux employés autorisés</li>
                    <li>• Logs d'audit des accès</li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    Infrastructure
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Serveurs sécurisés et surveillés</li>
                    <li>• Sauvegardes régulières chiffrées</li>
                    <li>• Pare-feu et protection DDoS</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Surveillance
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Monitoring 24/7</li>
                    <li>• Détection d'intrusion</li>
                    <li>• Tests de sécurité réguliers</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Important :</strong> Aucune méthode de transmission sur Internet ou de stockage électronique n'est 100% sécurisée.
                  Bien que nous nous efforcions d'utiliser des moyens acceptables pour protéger vos données, nous ne pouvons garantir
                  leur sécurité absolue.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Conservation des données */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">6. Durée de conservation</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités pour lesquelles
                elles ont été collectées, ou conformément aux obligations légales.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gradient-to-r from-indigo-100 to-purple-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-900 border border-indigo-200">Type de données</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900 border border-indigo-200">Durée de conservation</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-900 border border-indigo-200">Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Données de compte actif</td>
                      <td className="px-4 py-3 border border-gray-200">Durée de la relation contractuelle</td>
                      <td className="px-4 py-3 border border-gray-200">Fourniture du service</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Données de compte inactif</td>
                      <td className="px-4 py-3 border border-gray-200">3 ans après dernière activité</td>
                      <td className="px-4 py-3 border border-gray-200">RGPD - délai de prescription</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Historique de colis</td>
                      <td className="px-4 py-3 border border-gray-200">5 ans après expédition</td>
                      <td className="px-4 py-3 border border-gray-200">Obligations comptables et fiscales</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Données de paiement</td>
                      <td className="px-4 py-3 border border-gray-200">10 ans</td>
                      <td className="px-4 py-3 border border-gray-200">Obligations comptables (Code de commerce)</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Logs de connexion</td>
                      <td className="px-4 py-3 border border-gray-200">1 an</td>
                      <td className="px-4 py-3 border border-gray-200">Sécurité et lutte contre la fraude</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Cookies analytiques</td>
                      <td className="px-4 py-3 border border-gray-200">13 mois maximum</td>
                      <td className="px-4 py-3 border border-gray-200">Recommandation CNIL</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 border border-gray-200">Données supprimées</td>
                      <td className="px-4 py-3 border border-gray-200">Suppression définitive sous 30 jours</td>
                      <td className="px-4 py-3 border border-gray-200">Respect du droit à l'effacement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* 7. Vos droits RGPD */}
          <section className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-2xl shadow-xl p-8 border-2 border-purple-300">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-7 h-7 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">7. Vos droits (RGPD)</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Droit d'accès */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Droit d'accès</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.
                </p>
              </div>

              {/* Droit de rectification */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Droit de rectification</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Vous pouvez corriger ou mettre à jour vos informations personnelles directement dans votre profil.
                </p>
              </div>

              {/* Droit à l'effacement */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-pink-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="w-6 h-6 text-pink-600" />
                  <h3 className="font-bold text-gray-900">Droit à l'effacement</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Vous pouvez demander la suppression de vos données (sous réserve des obligations légales de conservation).
                </p>
              </div>

              {/* Droit à la portabilité */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Download className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-gray-900">Droit à la portabilité</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Vous pouvez recevoir vos données dans un format structuré et lisible pour les transférer à un autre service.
                </p>
              </div>

              {/* Droit de limitation */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-orange-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-gray-900">Droit de limitation</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Vous pouvez demander la limitation du traitement de vos données dans certaines situations.
                </p>
              </div>

              {/* Droit d'opposition */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  <h3 className="font-bold text-gray-900">Droit d'opposition</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Vous pouvez vous opposer au traitement de vos données, notamment pour le marketing direct.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 border-2 border-purple-300">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Comment exercer vos droits ?</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Par email :</p>
                    <a href="mailto:privacy@reexpresstrack.com" className="text-purple-600 underline">
                      privacy@reexpresstrack.com
                    </a>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Nous répondons à toutes les demandes dans un délai d'un mois maximum. Une pièce d'identité peut être requise
                pour vérifier votre identité.
              </p>
            </div>

            <div className="mt-4 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>📋 Droit de réclamation :</strong> Vous avez également le droit d'introduire une réclamation auprès de la
                Commission Nationale de l'Informatique et des Libertés (CNIL) si vous estimez que vos droits ne sont pas respectés :
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-1">
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          {/* 8. Transferts internationaux */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌍</span>
              <h2 className="text-2xl font-bold text-gray-900">8. Transferts internationaux de données</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Vos données sont principalement stockées et traitées au sein de l'Union Européenne.
                Cependant, certains de nos prestataires peuvent être situés en dehors de l'UE.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Garanties de protection :</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-900">
                  <li>Clauses contractuelles types de la Commission Européenne</li>
                  <li>Certification Privacy Shield (pour les prestataires américains)</li>
                  <li>Décisions d'adéquation de la Commission Européenne</li>
                  <li>Mesures de sécurité appropriées (chiffrement, pseudonymisation)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Cookies */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🍪</span>
              <h2 className="text-2xl font-bold text-gray-900">9. Cookies et technologies similaires</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Nous utilisons des cookies et technologies similaires pour améliorer votre expérience sur notre site.
                Pour plus d'informations sur nos cookies et comment les gérer, consultez notre{' '}
                <Link to="/cookie-policy" className="text-orange-600 underline font-semibold">
                  Politique de cookies détaillée
                </Link>.
              </p>
              <button
                onClick={resetConsent}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
              >
                Gérer mes préférences de cookies
              </button>
            </div>
          </section>

          {/* 10. Modifications */}
          <section className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">10. Modifications de cette politique</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité périodiquement pour refléter les changements
                dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
              </p>
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-sm text-purple-800">
                  <strong>📢 Notification des changements :</strong> En cas de modification importante, nous vous informerons
                  par email ou par une notification sur notre site au moins 30 jours avant l'entrée en vigueur des changements.
                  Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </div>
            </div>
          </section>

          {/* 11. Contact */}
          <section className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-2xl shadow-xl p-8 border-2 border-orange-300">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-7 h-7 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">11. Nous contacter</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, n'hésitez pas à nous contacter :
            </p>
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-6 h-6 text-orange-600" />
                  <h3 className="font-bold text-gray-900">Email</h3>
                </div>
                <a href="mailto:privacy@reexpresstrack.com" className="text-orange-600 underline font-semibold">
                  privacy@reexpresstrack.com
                </a>
                <p className="text-xs text-gray-600 mt-2">Réponse sous 48h ouvrées</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <Link to="/" className="hover:text-purple-600 underline">Accueil</Link>
            <span>•</span>
            <Link to="/cookie-policy" className="hover:text-purple-600 underline">Politique de cookies</Link>
            <span>•</span>
            <Link to="/mentions-legales" className="hover:text-purple-600 underline">Mentions légales</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-purple-600 underline">Contact</Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 max-w-2xl mx-auto border-2 border-purple-200">
            <p className="text-sm text-gray-700">
              <strong>🛡️ Votre vie privée nous tient à cœur.</strong> Cette politique a été mise à jour le 31 octobre 2025
              et est conforme au RGPD (Règlement UE 2016/679).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
