
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  serverResponse?: number; // Server Response Time
  connectionErrors?: number; // Connection Errors Count
  uptime?: number; // Uptime percentage
}

interface ServerHealth {
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [serverHealth, setServerHealth] = useState<ServerHealth>({
    status: 'healthy',
    responseTime: 0,
    lastCheck: new Date(),
    errorCount: 0
  });
  const [isSupported, setIsSupported] = useState(false);

  // Monitoring de la santé du serveur
  const checkServerHealth = async () => {
    const startTime = performance.now();
    try {
      const response = await fetch(window.location.origin + '/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      const responseTime = performance.now() - startTime;

      setServerHealth(prev => ({
        status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'critical',
        responseTime,
        lastCheck: new Date(),
        errorCount: response.ok ? Math.max(0, prev.errorCount - 1) : prev.errorCount + 1
      }));

      setMetrics(prev => ({
        ...prev,
        serverResponse: responseTime,
        connectionErrors: serverHealth.errorCount
      }));
    } catch (error) {
      setServerHealth(prev => ({
        status: 'critical',
        responseTime: 0,
        lastCheck: new Date(),
        errorCount: prev.errorCount + 1
      }));

      setMetrics(prev => ({
        ...prev,
        connectionErrors: serverHealth.errorCount + 1
      }));
    }
  };

  useEffect(() => {
    // Vérifier le support des APIs de performance
    if (typeof window !== 'undefined' && 'performance' in window) {
      setIsSupported(true);
    }

    const measurePerformance = () => {
      if (!isSupported) return;

      try {
        // Time to First Byte (TTFB)
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationTiming) {
          const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
          setMetrics(prev => ({ ...prev, ttfb }));
        }

        // First Contentful Paint (FCP)
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
        }

        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            }
          });

          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            console.warn('LCP observation not supported');
          }

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (entry.processingStart && entry.startTime) {
                const fid = entry.processingStart - entry.startTime;
                setMetrics(prev => ({ ...prev, fid }));
              }
            });
          });

          try {
            fidObserver.observe({ entryTypes: ['first-input'] });
          } catch (e) {
            console.warn('FID observation not supported');
          }

          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                setMetrics(prev => ({ ...prev, cls: clsValue }));
              }
            });
          });

          try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            console.warn('CLS observation not supported');
          }

          // Cleanup observers
          return () => {
            lcpObserver.disconnect();
            fidObserver.disconnect();
            clsObserver.disconnect();
          };
        }
      } catch (error) {
        console.warn('Performance measurement error:', error);
      }
    };

    // Vérification initiale de la santé du serveur
    checkServerHealth();

    // Monitoring continu toutes les 30 secondes
    const healthInterval = setInterval(checkServerHealth, 30000);

    // Métriques de performance
    const timeoutId = setTimeout(measurePerformance, 100);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(healthInterval);
    };
  }, [isSupported]);

  // Fonction pour évaluer les performances
  const getPerformanceGrade = (): 'good' | 'needs-improvement' | 'poor' => {
    const { fcp, lcp, fid, cls, ttfb, serverResponse } = metrics;

    let score = 0;
    let totalMetrics = 0;

    // FCP: Good < 1.8s, Needs Improvement 1.8s-3s, Poor > 3s
    if (fcp !== undefined) {
      totalMetrics++;
      if (fcp < 1800) score += 3;
      else if (fcp < 3000) score += 2;
      else score += 1;
    }

    // LCP: Good < 2.5s, Needs Improvement 2.5s-4s, Poor > 4s
    if (lcp !== undefined) {
      totalMetrics++;
      if (lcp < 2500) score += 3;
      else if (lcp < 4000) score += 2;
      else score += 1;
    }

    // FID: Good < 100ms, Needs Improvement 100ms-300ms, Poor > 300ms
    if (fid !== undefined) {
      totalMetrics++;
      if (fid < 100) score += 3;
      else if (fid < 300) score += 2;
      else score += 1;
    }

    // CLS: Good < 0.1, Needs Improvement 0.1-0.25, Poor > 0.25
    if (cls !== undefined) {
      totalMetrics++;
      if (cls < 0.1) score += 3;
      else if (cls < 0.25) score += 2;
      else score += 1;
    }

    // TTFB: Good < 600ms, Needs Improvement 600ms-1400ms, Poor > 1400ms
    if (ttfb !== undefined) {
      totalMetrics++;
      if (ttfb < 600) score += 3;
      else if (ttfb < 1400) score += 2;
      else score += 1;
    }

    // Server Response: Good < 1000ms, Needs Improvement 1000ms-3000ms, Poor > 3000ms
    if (serverResponse !== undefined) {
      totalMetrics++;
      if (serverResponse < 1000) score += 3;
      else if (serverResponse < 3000) score += 2;
      else score += 1;
    }

    if (totalMetrics === 0) return 'needs-improvement';

    const averageScore = score / totalMetrics;
    if (averageScore >= 2.5) return 'good';
    if (averageScore >= 2) return 'needs-improvement';
    return 'poor';
  };

  // Fonction pour envoyer les métriques et alertes
  const reportMetrics = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      Object.entries(metrics).forEach(([metric, value]) => {
        if (value !== undefined) {
          window.gtag('event', 'performance_metric', {
            metric_name: metric,
            metric_value: Math.round(value),
            custom_parameter: 'core_web_vitals'
          });
        }
      });

      // Rapport de santé du serveur
      window.gtag('event', 'server_health', {
        status: serverHealth.status,
        response_time: Math.round(serverHealth.responseTime),
        error_count: serverHealth.errorCount
      });
    }

    // Alertes critiques
    if (serverHealth.status === 'critical' || serverHealth.errorCount > 5) {
      console.error('🚨 ALERTE SERVEUR: Problèmes de connectivité détectés', {
        status: serverHealth.status,
        errorCount: serverHealth.errorCount,
        lastCheck: serverHealth.lastCheck
      });
    }
  };

  return {
    metrics,
    serverHealth,
    isSupported,
    grade: getPerformanceGrade(),
    reportMetrics,
    checkServerHealth
  };
};

// Hook pour précharger des ressources critiques
export const usePreloadResources = (resources: string[]) => {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      
      // Déterminer le type de ressource
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      } else if (resource.match(/\.(woff|woff2|ttf|otf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
      
      link.href = resource;
      document.head.appendChild(link);
    });
  }, [resources]);
};

// Hook pour optimiser les images
export const useImageOptimization = () => {
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const [avifSupported, setAvifSupported] = useState<boolean | null>(null);

  useEffect(() => {
    // Test WebP support
    const webp = new Image();
    webp.onload = webp.onerror = () => {
      setWebpSupported(webp.height === 2);
    };
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

    // Test AVIF support
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      setAvifSupported(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAAFhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  }, []);

  const getOptimizedImageUrl = (originalUrl: string, width?: number, height?: number): string => {
    // Si c'est une URL Readdy, on peut l'optimiser
    if (originalUrl.includes('readdy.ai/api/search-image')) {
      let optimizedUrl = originalUrl;
      
      if (avifSupported && !originalUrl.includes('format=')) {
        optimizedUrl += '&format=avif';
      } else if (webpSupported && !originalUrl.includes('format=')) {
        optimizedUrl += '&format=webp';
      }
      
      if (width && !originalUrl.includes('width=')) {
        optimizedUrl += `&width=${width}`;
      }
      
      if (height && !originalUrl.includes('height=')) {
        optimizedUrl += `&height=${height}`;
      }
      
      return optimizedUrl;
    }
    
    return originalUrl;
  };

  return {
    webpSupported,
    avifSupported,
    getOptimizedImageUrl
  };
};
