
const CACHE_NAME = 'reexpressetrack-v' + Date.now(); // Cache unique à chaque déploiement
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  // Forcer l'activation immédiate
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  // Prendre le contrôle immédiatement
  event.waitUntil(
    Promise.all([
      // Supprimer tous les anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Suppression du cache obsolète:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Prendre le contrôle de tous les clients
      self.clients.claim()
    ])
  );
});

// Stratégie network-first pour éviter les problèmes de cache
self.addEventListener('fetch', (event) => {
  // Pour les pages HTML, toujours essayer le réseau en premier
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si le réseau fonctionne, mettre en cache et retourner
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si le réseau échoue, essayer le cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Pour les autres ressources, stratégie cache-first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Vérifier en arrière-plan si une nouvelle version existe
          fetch(event.request).then((fetchResponse) => {
            if (fetchResponse && fetchResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, fetchResponse);
              });
            }
          }).catch(() => {
            // Ignorer les erreurs réseau silencieusement
          });
          
          return response;
        }
        
        // Si pas en cache, aller chercher sur le réseau
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouveau message de ReexpresseTrack',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir le message',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/pwa-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ReexpresseTrack', options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message du client pour forcer la mise à jour
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
