
import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Détection du support WebP
  const supportsWebP = useRef<boolean | null>(null);
  
  useEffect(() => {
    const checkWebPSupport = () => {
      if (supportsWebP.current !== null) return supportsWebP.current;
      
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      supportsWebP.current = webpSupported;
      return webpSupported;
    };

    const optimizeSrc = (originalSrc: string): string => {
      if (!originalSrc) return '';
      
      // Si c'est une URL Stable Diffusion, optimiser selon le navigateur
      if (originalSrc.includes('readdy.ai/api/search-image')) {
        const url = new URL(originalSrc);
        
        // Ajouter le format optimal selon le support
        if (checkWebPSupport()) {
          url.searchParams.set('format', 'webp');
          url.searchParams.set('quality', '85');
        } else {
          url.searchParams.set('format', 'jpeg');
          url.searchParams.set('quality', '90');
        }
        
        // Optimisations selon la taille d'écran
        const screenWidth = window.innerWidth || 1920;
        const dpr = window.devicePixelRatio || 1;
        
        if (screenWidth <= 768) {
          // Mobile: réduire les dimensions
          const currentWidth = parseInt(url.searchParams.get('width') || '800');
          const currentHeight = parseInt(url.searchParams.get('height') || '600');
          url.searchParams.set('width', Math.min(currentWidth, 600).toString());
          url.searchParams.set('height', Math.min(currentHeight, 450).toString());
        }
        
        // Ajuster selon le DPR pour les écrans haute résolution
        if (dpr > 1) {
          url.searchParams.set('dpr', Math.min(dpr, 2).toString());
        }
        
        return url.toString();
      }
      
      return originalSrc;
    };

    if (isInView && src && !currentSrc) {
      setCurrentSrc(optimizeSrc(src));
    }
  }, [isInView, src, currentSrc]);

  // Observer pour lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observerOptions = {
      root: null,
      rootMargin: '150px', // Zone de chargement étendue
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsInView(true);
        observerRef.current?.disconnect();
      }
    }, observerOptions);

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder avec animation shimmer améliorée
  const PlaceholderComponent = () => (
    <div 
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${className}`}
      style={{ width, height }}
    >
      <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  // Fallback en cas d'erreur
  const ErrorFallback = () => (
    <div 
      className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
      style={{ width, height }}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/>
          </svg>
        </div>
        <span className="text-xs">Image non disponible</span>
      </div>
    </div>
  );

  if (hasError) {
    return <ErrorFallback />;
  }

  if (!isInView) {
    return <PlaceholderComponent />;
  }

  return (
    <div className="relative overflow-hidden">
      {!isLoaded && <PlaceholderComponent />}
      
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`
            transition-opacity duration-500 object-cover
            ${isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}
            ${className}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // Optimisations navigateurs
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
          }}
        />
      )}
    </div>
  );
};

// Styles CSS pour l'animation shimmer
const shimmerStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Injecter les styles si pas encore fait
if (typeof document !== 'undefined' && !document.querySelector('#lazy-image-styles')) {
  const style = document.createElement('style');
  style.id = 'lazy-image-styles';
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}

export default LazyImage;
