
import React, { useState } from 'react';
import { usePerformance } from '../../hooks/usePerformance';

const PerformanceMetrics: React.FC = () => {
  const { metrics, serverHealth, grade, isSupported, reportMetrics, checkServerHealth } = usePerformance();
  const [isExpanded, setIsExpanded] = useState(false);

  // N'afficher les métriques qu'en développement
  if (process.env.NODE_ENV !== 'development' || !isSupported) {
    return null;
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getServerStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatMetric = (value: number | undefined, unit: string) => {
    if (value === undefined) return 'N/A';
    return `${Math.round(value)}${unit}`;
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢 Sain';
      case 'warning': return '🟡 Attention';
      case 'critical': return '🔴 Critique';
      default: return '⚪ Inconnu';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg text-xs z-50 max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Monitoring</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getServerStatusColor(serverHealth.status)}`}>
            {formatStatus(serverHealth.status)}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <i className={`ri-${isExpanded ? 'arrow-up' : 'arrow-down'}-s-line`}></i>
          </button>
        </div>
      </div>

      {/* Statut serveur (toujours visible) */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium">État du serveur</span>
          <button
            onClick={checkServerHealth}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            title="Vérifier maintenant"
          >
            <i className="ri-refresh-line"></i>
          </button>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Temps de réponse:</span>
            <span className={serverHealth.responseTime > 3000 ? 'text-red-600' : serverHealth.responseTime > 1000 ? 'text-yellow-600' : 'text-green-600'}>
              {formatMetric(serverHealth.responseTime, 'ms')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Erreurs:</span>
            <span className={serverHealth.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
              {serverHealth.errorCount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dernière vérif:</span>
            <span className="text-gray-500">
              {serverHealth.lastCheck.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Métriques détaillées (repliables) */}
      {isExpanded && (
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">Core Web Vitals</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(grade)}`}>
              {grade}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">FCP:</span>
              <span>{formatMetric(metrics.fcp, 'ms')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LCP:</span>
              <span>{formatMetric(metrics.lcp, 'ms')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">FID:</span>
              <span>{formatMetric(metrics.fid, 'ms')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CLS:</span>
              <span>{metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TTFB:</span>
              <span>{formatMetric(metrics.ttfb, 'ms')}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={reportMetrics}
              className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 cursor-pointer"
            >
              Envoyer rapport
            </button>
          </div>
        </div>
      )}

      {/* Alertes critiques */}
      {(serverHealth.status === 'critical' || serverHealth.errorCount > 5) && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <i className="ri-error-warning-line"></i>
            <span className="font-medium">Problème détecté!</span>
          </div>
          <p className="text-red-600 text-xs mt-1">
            {serverHealth.errorCount > 5 
              ? `${serverHealth.errorCount} erreurs de connexion`
              : 'Serveur non disponible'
            }
          </p>
        </div>
      )}

      <div className="px-3 py-2 bg-gray-50 rounded-b-lg text-xs text-gray-500 text-center">
        Monitoring en développement
      </div>
    </div>
  );
};

export default PerformanceMetrics;
