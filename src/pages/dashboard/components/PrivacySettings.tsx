import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import { 
  CookiePreferences, 
  getCookiePreferences, 
  saveCookiePreferences,
  updateGoogleAnalytics 
} from '../../../utils/cookieConsent';

interface PrivacyPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  data_processing_consent: boolean;
  third_party_sharing: boolean;
  analytics_tracking: boolean;
}

export default function PrivacySettings() {
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    data_processing_consent: true,
    third_party_sharing: false,
    analytics_tracking: false,
  });

  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
    marketing: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
    loadCookiePreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('privacy_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setPreferences(data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  };

  const loadCookiePreferences = () => {
    // Utiliser la fonction utilitaire pour charger les préférences
    setCookiePrefs(getCookiePreferences());
  };

  const handlePreferenceChange = (key: keyof PrivacyPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCookieChange = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Ne peut pas désactiver les cookies essentiels

    const newPrefs = {
      ...cookiePrefs,
      [key]: !cookiePrefs[key],
    };
    
    setCookiePrefs(newPrefs);
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('privacy_preferences')
          .upsert({
            user_id: user.id,
            ...preferences,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        // Sauvegarder les préférences cookies avec les fonctions utilitaires
        saveCookiePreferences(cookiePrefs);
        updateGoogleAnalytics(cookiePrefs);

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    setExportLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Récupérer toutes les données utilisateur
        const [profile, packages, addresses] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('packages').select('*').eq('user_id', user.id),
          supabase.from('french_addresses').select('*').eq('user_id', user.id),
        ]);

        const exportData = {
          user_info: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          },
          profile: profile.data,
          packages: packages.data,
          addresses: addresses.data,
          privacy_preferences: preferences,
          export_date: new Date().toISOString(),
        };

        // Créer et télécharger le fichier JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reexpressetrack-data-${new Date()
          .toISOString()
          .split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Utilisation de guillemets doubles évite le problème d’échappement de l’apostrophe
      console.error("Erreur lors de l'exportation:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.'
      )
    ) {
      if (
        window.confirm(
          'Confirmation finale : toutes vos données seront supprimées de manière permanente.'
        )
      ) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Marquer le compte pour suppression (à traiter manuellement pour respect RGPD)
            await supabase
              .from('profiles')
              .update({
                deletion_requested: true,
                deletion_requested_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            // Déconnexion
            await supabase.auth.signOut();

            alert(
              'Votre demande de suppression a été enregistrée. Votre compte sera supprimé sous 30 jours conformément au RGPD.'
            );
          }
        } catch (error) {
          console.error('Erreur lors de la demande de suppression:', error);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Paramètres de confidentialité
        </h2>
        {success && (
          <div className="flex items-center text-green-600">
            <i className="ri-check-line mr-2"></i>
            <span>Préférences sauvegardées</span>
          </div>
        )}
      </div>

      {/* Configuration par défaut info */}
      <Card>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="ri-shield-check-line text-blue-600 mr-3 mt-0.5"></i>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">État par défaut conforme RGPD</h3>
              <p className="text-blue-800 text-sm">
                Par défaut, seuls les cookies essentiels sont activés. Tous les autres cookies nécessitent votre consentement explicite.
                Cette configuration respecte les exigences du Règlement Général sur la Protection des Données.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="ri-notification-line mr-2"></i>
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Notifications par email
              </h4>
              <p className="text-gray-600 text-sm">
                Recevoir les mises à jour sur vos colis par email
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_notifications')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  preferences.email_notifications
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    preferences.email_notifications
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Notifications SMS
              </h4>
              <p className="text-gray-600 text-sm">
                Recevoir les alertes importantes par SMS
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('sms_notifications')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  preferences.sms_notifications
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    preferences.sms_notifications
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Emails marketing
              </h4>
              <p className="text-gray-600 text-sm">
                Recevoir nos offres et actualités
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('marketing_emails')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  preferences.marketing_emails
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    preferences.marketing_emails
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* cookies */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="ri-cookie-line mr-2"></i>
          Gestion des cookies
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Cookies essentiels
              </h4>
              <p className="text-gray-600 text-sm">
                <strong>Activés par défaut</strong> - Nécessaires au fonctionnement du site
              </p>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full shadow-inner">
              <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 translate-y-0.5"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Cookies analytiques
              </h4>
              <p className="text-gray-600 text-sm">
                <strong>Désactivés par défaut</strong> - Nous aident à améliorer le site
              </p>
            </div>
            <button
              onClick={() => handleCookieChange('analytics')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  cookiePrefs.analytics ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    cookiePrefs.analytics ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Cookies de préférences
              </h4>
              <p className="text-gray-600 text-sm">
                <strong>Désactivés par défaut</strong> - Mémorisent vos choix
              </p>
            </div>
            <button
              onClick={() => handleCookieChange('preferences')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  cookiePrefs.preferences ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    cookiePrefs.preferences ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Cookies marketing
              </h4>
              <p className="text-gray-600 text-sm">
                <strong>Désactivés par défaut</strong> - Personnalisation publicitaire
              </p>
            </div>
            <button
              onClick={() => handleCookieChange('marketing')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  cookiePrefs.marketing ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    cookiePrefs.marketing ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Traitement des données */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="ri-database-line mr-2"></i>
          Traitement des données
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Consentement au traitement
              </h4>
              <p className="text-gray-600 text-sm">
                Autoriser le traitement de vos données pour nos services
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('data_processing_consent')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  preferences.data_processing_consent
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    preferences.data_processing_consent
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Partage avec des tiers
              </h4>
              <p className="text-gray-600 text-sm">
                Autoriser le partage avec nos partenaires logistiques
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('third_party_sharing')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  preferences.third_party_sharing
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    preferences.third_party_sharing
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">
                Suivi analytique
              </h4>
              <p className="text-gray-600 text-sm">
                Permettre l'analyse de votre utilisation
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('analytics_tracking')}
              className="relative cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full shadow-inner transition-colors ${
                  preferences.analytics_tracking
                    ? 'bg-purple-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-y-0.5 ${
                    preferences.analytics_tracking
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                ></div>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Vos droits RGPD */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <i className="ri-shield-user-line mr-2"></i>
          Vos droits RGPD
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowDataExport(!showDataExport)}
              className="w-full justify-start whitespace-nowrap"
            >
              <i className="ri-download-line mr-2"></i>
              Exporter mes données
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  '/contact?subject=rectification-donnees',
                  '_blank'
                )
              }
              className="w-full justify-start whitespace-nowrap"
            >
              <i className="ri-pencil-line mr-2"></i>
              Rectifier mes données
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  '/contact?subject=limitation-traitement',
                  '_blank'
                )
              }
              className="w-full justify-start whitespace-nowrap"
            >
              <i className="ri-pause-line mr-2"></i>
              Limiter le traitement
            </Button>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  '/contact?subject=opposition-traitement',
                  '_blank'
                )
              }
              className="w-full justify-start whitespace-nowrap"
            >
              <i className="ri-close-line mr-2"></i>
              S'opposer au traitement
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  '/contact?subject=portabilite-donnees',
                  '_blank'
                )
              }
              className="w-full justify-start whitespace-nowrap"
            >
              <i className="ri-exchange-line mr-2"></i>
              Portabilité des données
            </Button>

            <Button
              variant="outline"
              onClick={deleteAccount}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 whitespace-nowrap"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Supprimer mon compte
            </Button>
          </div>
        </div>

        {showDataExport && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Exportation de vos données
            </h4>
            <p className="text-blue-800 text-sm mb-3">
              Téléchargez toutes vos données personnelles au format JSON,
              incluant votre profil, vos colis et vos préférences.
            </p>
            <Button
              onClick={exportData}
              disabled={exportLoading}
              size="sm"
              className="whitespace-nowrap"
            >
              {exportLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Export en cours...
                </>
              ) : (
                <>
                  <i className="ri-download-line mr-2"></i>
                  Télécharger mes données
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={loading} className="whitespace-nowrap">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <i className="ri-save-line mr-2"></i>
              Sauvegarder les préférences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
