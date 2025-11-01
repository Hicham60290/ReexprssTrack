
// Polyfills pour compatibilité navigateurs anciens
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    return this.indexOf(searchElement) !== -1;
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function(search) {
    return this.indexOf(search) !== -1;
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gestion d'erreur globale
const handleError = (error: Error) => {
  console.error('Erreur application:', error);
  // Ne pas faire planter l'app
};

// Configuration robuste de React
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Marquer l'app comme prête après rendu
    setTimeout(() => {
      if (window.markAppReady) {
        window.markAppReady();
      }
    }, 100);
    
  } catch (error) {
    handleError(error as Error);
    
    // Fallback en cas d'erreur
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
        <h2>Erreur de chargement</h2>
        <p>Une erreur est survenue lors du chargement de ReexpresseTrack.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #ea580c; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recharger la page
        </button>
      </div>
    `;
    
    if (window.markAppReady) {
      window.markAppReady();
    }
  }
} else {
  console.error('Élément root introuvable');
}

// Gestion des erreurs non capturées
window.addEventListener('error', (event) => {
  // Simplement empêcher la propagation sans traitement supplémentaire
  event.preventDefault();
  event.stopPropagation();
});

window.addEventListener('unhandledrejection', (event) => {
  // Simplement empêcher la propagation sans traitement supplémentaire
  event.preventDefault();
  event.stopPropagation();
});
