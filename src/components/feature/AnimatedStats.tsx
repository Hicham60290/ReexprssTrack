import React, { useState, useEffect, useRef } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
}

interface AnimatedStatsProps {
  stats: StatItem[];
  className?: string;
}

const AnimatedStats: React.FC<AnimatedStatsProps> = ({ stats, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startAnimation();
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  const startAnimation = () => {
    stats.forEach((stat, index) => {
      const duration = stat.duration || 2000; // 2 secondes par défaut
      const startTime = Date.now();
      const startValue = 0;
      const endValue = stat.value;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Fonction d'easing pour un effet plus naturel
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

        setAnimatedValues(prev => {
          const newValues = [...prev];
          newValues[index] = currentValue;
          return newValues;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      // Ajouter un délai différent pour chaque stat pour un effet en cascade
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, index * 200);
    });
  };

  const formatValue = (value: number, suffix: string) => {
    if (suffix === '%') {
      return `${value}%`;
    }
    if (suffix === '+' && value >= 1000) {
      return `${(value / 1000).toFixed(0)} 000+`;
    }
    if (suffix === 'H') {
      return `${value}H`;
    }
    return `${value}${suffix}`;
  };

  return (
    <div ref={sectionRef} className={`grid grid-cols-2 lg:grid-cols-4 gap-8 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center group">
          <div className={`text-3xl lg:text-4xl font-bold text-blue-600 mb-2 transition-all duration-300 ${
            isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
          }`}>
            <span className="tabular-nums">
              {formatValue(animatedValues[index], stat.suffix)}
            </span>
          </div>
          <p className={`text-gray-600 font-medium transition-all duration-500 delay-200 ${
            isVisible ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
          }`}>
            {stat.label}
          </p>
          
          {/* Barre de progression sous chaque stat */}
          <div className="w-full bg-gray-200 h-1 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out ${
                isVisible ? 'transform translate-x-0' : 'transform -translate-x-full'
              }`}
              style={{
                transitionDelay: `${index * 200 + 500}ms`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook personnalisé pour réinitialiser l'animation
export const useResetAnimation = () => {
  const [key, setKey] = useState(0);
  
  const resetAnimation = () => {
    setKey(prev => prev + 1);
  };

  return { key, resetAnimation };
};

export default AnimatedStats;