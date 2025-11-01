
// Utilitaires PWA pour ReexpresseTrack

// Enregistrer le service worker
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker enregistré avec succès:', registration);
      
      // Vérifier les mises à jour plus fréquemment
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible - rechargement automatique
              console.log('Nouvelle version détectée, rechargement automatique...');
              // Attendre un peu puis recharger automatiquement
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          });
        }
      });

      // Vérifier les mises à jour toutes les 30 secondes
      setInterval(() => {
        registration.update();
      }, 30000);

    } catch (error) {
      console.log('Échec de l\'enregistrement du Service Worker:', error);
    }
  }
};

// Forcer la mise à jour du cache
export const forceUpdate = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    // Vider le cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    // Recharger la page
    window.location.reload();
  }
};

// Afficher notification de mise à jour (gardé pour compatibilité mais pas utilisé)
const showUpdateNotification = (): void => {
  if (confirm('Une nouvelle version est disponible. Voulez-vous actualiser ?')) {
    window.location.reload();
  }
};

// Vérifier si l'app peut être installée
export const checkInstallPrompt = (): void => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher l'affichage automatique
    e.preventDefault();
    deferredPrompt = e;
    
    // Afficher le bouton d'installation personnalisé
    showInstallButton(deferredPrompt);
  });
};

// Afficher bouton d'installation
const showInstallButton = (deferredPrompt: any): void => {
  const installButton = document.createElement('button');
  installButton.textContent = '📱 Installer l\'app';
  installButton.className = 'fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 hover:bg-blue-700 transition-colors';
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installée');
      }
      
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  // Masquer après 10 secondes si pas cliqué
  setTimeout(() => {
    if (installButton.parentNode) {
      installButton.remove();
    }
  }, 10000);
  
  document.body.appendChild(installButton);
};

// Demander permission pour les notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Vérifier si l'app fonctionne en mode PWA
export const isPWAMode = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Vérifier si l'utilisateur est en ligne
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Écouter les changements de connexion
export const setupNetworkListeners = (
  onOnline: () => void, 
  onOffline: () => void
): void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
};
