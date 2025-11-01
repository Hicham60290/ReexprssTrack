import { useState } from 'react';
import { Mail, Bell, Package, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/api';

interface EmailPreferences {
  packageReceived: boolean;
  packageShipped: boolean;
  packageDelivered: boolean;
  quoteCreated: boolean;
  quoteUpdated: boolean;
  paymentReceived: boolean;
  paymentFailed: boolean;
  accountUpdates: boolean;
  promotionalEmails: boolean;
  weeklyDigest: boolean;
}

export default function EmailSettingsPage() {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Fetch current email preferences
  const { data: preferences, isLoading } = useQuery<EmailPreferences>({
    queryKey: ['email-preferences'],
    queryFn: async () => {
      const response = await api.get('/users/email-preferences');
      return response.data;
    },
  });

  const [localPreferences, setLocalPreferences] = useState<EmailPreferences>(
    preferences || {
      packageReceived: true,
      packageShipped: true,
      packageDelivered: true,
      quoteCreated: true,
      quoteUpdated: true,
      paymentReceived: true,
      paymentFailed: true,
      accountUpdates: true,
      promotionalEmails: false,
      weeklyDigest: false,
    }
  );

  // Update local state when data is fetched
  useState(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  });

  // Save email preferences mutation
  const saveMutation = useMutation({
    mutationFn: async (prefs: EmailPreferences) => {
      const response = await api.put('/users/email-preferences', prefs);
      return response.data;
    },
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-preferences'] });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
  });

  const handleToggle = (key: keyof EmailPreferences) => {
    const newPreferences = {
      ...localPreferences,
      [key]: !localPreferences[key],
    };
    setLocalPreferences(newPreferences);
    saveMutation.mutate(newPreferences);
  };

  const emailCategories = [
    {
      title: 'Notifications de colis 📦',
      icon: Package,
      gradient: 'from-orange-500 to-pink-500',
      preferences: [
        {
          key: 'packageReceived' as keyof EmailPreferences,
          label: 'Colis reçu à notre entrepôt',
          description: 'Recevez un email quand votre colis arrive à notre entrepôt en France',
        },
        {
          key: 'packageShipped' as keyof EmailPreferences,
          label: 'Colis expédié',
          description: 'Notification quand votre colis est expédié vers votre destination',
        },
        {
          key: 'packageDelivered' as keyof EmailPreferences,
          label: 'Colis livré',
          description: 'Confirmation de livraison à votre adresse finale',
        },
      ],
    },
    {
      title: 'Devis et estimations 💰',
      icon: CreditCard,
      gradient: 'from-blue-500 to-cyan-500',
      preferences: [
        {
          key: 'quoteCreated' as keyof EmailPreferences,
          label: 'Nouveau devis créé',
          description: 'Email quand un nouveau devis est généré pour votre colis',
        },
        {
          key: 'quoteUpdated' as keyof EmailPreferences,
          label: 'Devis mis à jour',
          description: 'Notification quand un devis existant est modifié',
        },
      ],
    },
    {
      title: 'Paiements 💳',
      icon: CreditCard,
      gradient: 'from-green-500 to-emerald-500',
      preferences: [
        {
          key: 'paymentReceived' as keyof EmailPreferences,
          label: 'Paiement reçu',
          description: 'Confirmation de réception de votre paiement',
        },
        {
          key: 'paymentFailed' as keyof EmailPreferences,
          label: 'Échec de paiement',
          description: 'Alerte en cas de problème avec un paiement',
        },
      ],
    },
    {
      title: 'Compte et marketing 📧',
      icon: Bell,
      gradient: 'from-purple-500 to-indigo-500',
      preferences: [
        {
          key: 'accountUpdates' as keyof EmailPreferences,
          label: 'Mises à jour du compte',
          description: 'Notifications importantes concernant votre compte',
        },
        {
          key: 'promotionalEmails' as keyof EmailPreferences,
          label: 'Emails promotionnels',
          description: 'Offres spéciales, réductions et nouveautés',
        },
        {
          key: 'weeklyDigest' as keyof EmailPreferences,
          label: 'Résumé hebdomadaire',
          description: 'Récapitulatif de votre activité chaque semaine',
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Paramètres des emails
              </h1>
              <p className="text-gray-600">
                Gérez vos préférences de notifications par email
              </p>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus === 'success' && (
            <div className="bg-green-100 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-800 font-semibold">
                Préférences enregistrées avec succès !
              </p>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-600" />
              <p className="text-red-800 font-semibold">
                Erreur lors de l'enregistrement. Veuillez réessayer.
              </p>
            </div>
          )}
        </div>

        {/* Email Categories */}
        <div className="space-y-6">
          {emailCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border-2 border-gray-200"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center`}
                >
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
              </div>

              {/* Preferences List */}
              <div className="space-y-4">
                {category.preferences.map((pref, prefIndex) => (
                  <div
                    key={prefIndex}
                    className="flex items-start justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {pref.label}
                      </h3>
                      <p className="text-sm text-gray-600">{pref.description}</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(pref.key)}
                      disabled={saveMutation.isPending}
                      className={`relative w-14 h-7 rounded-full transition-all ${
                        localPreferences[pref.key]
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500'
                          : 'bg-gray-300'
                      } ${saveMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          localPreferences[pref.key] ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                À propos des notifications par email
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Les paramètres sont sauvegardés automatiquement</li>
                <li>• Les emails critiques (sécurité, paiements échoués) sont toujours envoyés</li>
                <li>• Vous pouvez vous désabonner des emails promotionnels à tout moment</li>
                <li>• Les notifications sont envoyées à l'adresse email de votre compte</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => {
              const allEnabled = {
                packageReceived: true,
                packageShipped: true,
                packageDelivered: true,
                quoteCreated: true,
                quoteUpdated: true,
                paymentReceived: true,
                paymentFailed: true,
                accountUpdates: true,
                promotionalEmails: true,
                weeklyDigest: true,
              };
              setLocalPreferences(allEnabled);
              saveMutation.mutate(allEnabled);
            }}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-lg"
          >
            Tout activer
          </button>

          <button
            onClick={() => {
              const allDisabled = {
                packageReceived: false,
                packageShipped: false,
                packageDelivered: false,
                quoteCreated: false,
                quoteUpdated: false,
                paymentReceived: true, // Toujours activé
                paymentFailed: true, // Toujours activé
                accountUpdates: true, // Toujours activé
                promotionalEmails: false,
                weeklyDigest: false,
              };
              setLocalPreferences(allDisabled);
              saveMutation.mutate(allDisabled);
            }}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all"
          >
            Minimum (sécurité uniquement)
          </button>
        </div>
      </div>
    </div>
  );
}
