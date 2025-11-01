
import React, { useState, useEffect } from 'react';

interface ServerStatus {
  isOnline: boolean;
  responseTime: number;
  lastCheck: Date;
  consecutiveErrors: number;
  uptime: number;
}

interface MonitoringProps {
  onAlert?: (message: string, type: 'error' | 'warning' | 'info') => void;
  checkInterval?: number; // en millisecondes
}

const ServerMonitor: React.FC<MonitoringProps> = ({ 
  onAlert, 
  checkInterval = 60000 // 1 minute par défaut
}) => {
  const [status, setStatus] = useState<ServerStatus>({
    isOnline: true,
    responseTime: 0,
    lastCheck: new Date(),
    consecutiveErrors: 0,
    uptime: 100
  });

  const [history, setHistory] = useState<Array<{
    timestamp: Date;
    status: boolean;
    responseTime: number;
  }>>([]);

  // Vérification de la santé du serveur
  const checkServerHealth = async (): Promise<void> => {
    const startTime = performance.now();
    
    try {
      // Test de plusieurs endpoints pour une meilleure fiabilité
      const endpoints = [
        `${window.location.origin}/favicon.ico`,
        `${window.location.origin}/robots.txt`,
        `${window.location.origin}/manifest.json`
      ];

      const promises = endpoints.map(url => 
        fetch(url, { 
          method: 'HEAD', 
          cache: 'no-cache',
          mode: 'no-cors' // Pour éviter les erreurs CORS
        }).catch(() => null)
      );

      const results = await Promise.allSettled(promises);
      const responseTime = performance.now() - startTime;
      
      // Au moins un endpoint doit répondre
      const isOnline = results.some(result => result.status === 'fulfilled');
      
      setStatus(prev => {
        const newConsecutiveErrors = isOnline ? 0 : prev.consecutiveErrors + 1;
        
        // Calculer l'uptime sur les 24 dernières heures
        const last24h = history.filter(h => 
          Date.now() - h.timestamp.getTime() < 24 * 60 * 60 * 1000
        );
        const successfulChecks = last24h.filter(h => h.status).length;
        const totalChecks = last24h.length;
        const uptime = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

        return {
          isOnline,
          responseTime: isOnline ? responseTime : 0,
          lastCheck: new Date(),
          consecutiveErrors: newConsecutiveErrors,
          uptime
        };
      });

      // Ajouter à l'historique
      setHistory(prev => [
        ...prev.slice(-1000), // Garder les 1000 derniers checks
        {
          timestamp: new Date(),
          status: isOnline,
          responseTime: isOnline ? responseTime : 0
        }
      ]);

      // Alertes basées sur les erreurs consécutives
      if (!isOnline) {
        const consecutiveErrors = status.consecutiveErrors + 1;
        
        if (consecutiveErrors === 1) {
          onAlert?.('Problème de connexion détecté', 'warning');
        } else if (consecutiveErrors === 3) {
          onAlert?.('Serveur indisponible depuis 3 vérifications', 'error');
        } else if (consecutiveErrors >= 5) {
          onAlert?.(`Serveur indisponible depuis ${consecutiveErrors} vérifications`, 'error');
        }
      } else if (status.consecutiveErrors > 0) {
        onAlert?.('Connexion rétablie', 'info');
      }

      // Alerte sur temps de réponse lent
      if (isOnline && responseTime > 5000) {
        onAlert?.(`Temps de réponse lent: ${Math.round(responseTime)}ms`, 'warning');
      }

      // Alerte sur uptime faible
      if (status.uptime < 95 && totalChecks > 10) {
        onAlert?.(`Uptime faible: ${status.uptime.toFixed(1)}%`, 'warning');
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du serveur:', error);
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        responseTime: 0,
        lastCheck: new Date(),
        consecutiveErrors: prev.consecutiveErrors + 1
      }));
    }
  };

  // Monitoring automatique
  useEffect(() => {
    // Vérification initiale
    checkServerHealth();

    // Vérifications périodiques
    const interval = setInterval(checkServerHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  // Interface de monitoring (pour les administrateurs)
  const [showMonitor, setShowMonitor] = useState(false);

  // Afficher le moniteur seulement si il y a des problèmes ou en mode debug
  const shouldShow = !status.isOnline || 
                     status.consecutiveErrors > 0 || 
                     status.uptime < 98 ||
                     process.env.NODE_ENV === 'development';

  if (!shouldShow) return null;

  return (
    <>
      {/* Indicateur de statut discret */}
      <div 
        className={`fixed top-4 right-4 w-3 h-3 rounded-full cursor-pointer z-50 ${
          status.isOnline ? 'bg-green-500' : 'bg-red-500'
        } ${status.responseTime > 3000 ? 'animate-pulse' : ''}`}
        onClick={() => setShowMonitor(!showMonitor)}
        title={`Serveur ${status.isOnline ? 'en ligne' : 'hors ligne'} - Cliquer pour détails`}
      />

      {/* Panel de monitoring détaillé */}
      {showMonitor && (
        <div className="fixed top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm z-50 max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">État du serveur</h3>
            <button
              onClick={() => setShowMonitor(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className={`font-medium ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {status.isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Temps de réponse:</span>
              <span className={`${
                status.responseTime > 3000 ? 'text-red-600' : 
                status.responseTime > 1000 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {status.responseTime > 0 ? `${Math.round(status.responseTime)}ms` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Uptime 24h:</span>
              <span className={`${
                status.uptime > 99 ? 'text-green-600' : 
                status.uptime > 95 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {status.uptime.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Erreurs consécutives:</span>
              <span className={status.consecutiveErrors > 0 ? 'text-red-600' : 'text-green-600'}>
                {status.consecutiveErrors}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Dernière vérif:</span>
              <span className="text-gray-500">
                {status.lastCheck.toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Graphique simple des dernières vérifications */}
          {history.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">Dernières vérifications:</div>
              <div className="flex gap-1">
                {history.slice(-20).map((check, index) => (
                  <div
                    key={index}
                    className={`w-2 h-4 rounded-sm ${
                      check.status ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    title={`${check.timestamp.toLocaleTimeString()}: ${
                      check.status ? `${Math.round(check.responseTime)}ms` : 'Erreur'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={checkServerHealth}
              className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Vérifier maintenant
            </button>
          </div>

          {/* Recommandations si problèmes */}
          {(!status.isOnline || status.uptime < 95) && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="font-medium text-yellow-800 mb-1">Actions recommandées:</div>
              <ul className="text-yellow-700 list-disc list-inside space-y-1">
                <li>Vérifier la connexion internet</li>
                <li>Contacter l'hébergeur si persistant</li>
                <li>Vérifier les logs serveur</li>
                {status.uptime < 90 && <li>Considérer un changement d'hébergeur</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ServerMonitor;
