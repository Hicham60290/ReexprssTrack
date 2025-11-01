
import { useEffect } from 'react';

export default function MaintenancePage() {
  useEffect(() => {
    document.title = 'Maintenance en cours - ReExpressTrack';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Pacifico", serif' }}>
            ReExpressTrack
          </h1>
        </div>

        {/* Icône de maintenance */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-tools-line text-4xl text-orange-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Maintenance en cours
          </h2>
          <p className="text-gray-600 mb-6">
            Nous effectuons actuellement des améliorations sur notre plateforme pour vous offrir une meilleure expérience.
          </p>
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
              <i className="ri-time-line text-white text-sm"></i>
            </div>
            <span className="text-gray-700 font-medium">Alerte</span>
          </div>
          <p className="text-gray-600 mb-4">
            ⚠️ Perturbation temporaire de nos services
Nos équipes travaillent activement au rétablissement complet.
Le service sera de nouveau opérationnel très prochainement.
Rassurez-vous, vos colis déjà reçus seront expédiés sans aucun retard.
          </p>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <i className="ri-shield-check-line text-white text-sm"></i>
            </div>
            <span className="text-gray-700 font-medium">Vos données sont sécurisées</span>
          </div>
          <p className="text-gray-600">
            Tous vos colis et informations restent protégés pendant cette maintenance.
          </p>
        </div>

        {/* Contact d'urgence */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-800 mb-2">
            <i className="ri-alert-line mr-2"></i>
            Urgence ?
          </h3>
          <p className="text-red-700 text-sm mb-3">
            Pour toute urgence concernant vos colis, contactez-nous :
          </p>
          <div className="space-y-2">
            <a 
              href="mailto:contact@reexpresstrack.com" 
              className="flex items-center justify-center text-red-700 hover:text-red-800 text-sm font-medium"
            >
              <i className="ri-mail-line mr-2"></i>
              contact@reexpresstrack.com
            </a>
          </div>
        </div>

        {/* Animation de chargement */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Nous travaillons pour vous...
        </p>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-xs">
            © 2025 ReExpressTrack - Service de réexpédition DOM-TOM-Maroc
          </p>
          <a 
            href="https://readdy.ai/?origin=logo" 
            className="text-gray-400 hover:text-gray-600 text-xs mt-1 inline-block"
          >
            ReExpresstrack
          </a>
        </div>
      </div>
    </div>
  );
}
