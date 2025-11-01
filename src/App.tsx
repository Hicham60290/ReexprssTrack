
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './router';
import CookieBanner from './components/feature/CookieBanner';
import PerformanceMetrics from './components/base/PerformanceMetrics';
import ServerMonitor from './components/feature/ServerMonitor';

function App() {
  const handleServerAlert = (message: string, type: 'error' | 'warning' | 'info') => {
    // Vous pouvez intégrer ici votre système de notifications
    console.log(`[${type.toUpperCase()}] Monitoring: ${message}`);
    
    // Exemple d'intégration avec un service de notifications
    if (type === 'error') {
      // Envoyer une alerte critique
      // notificationService.sendAlert(message);
    }
  };

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
          <CookieBanner />
          <PerformanceMetrics />
        </div>
      </AuthProvider>
      
      {/* Monitoring serveur */}
      <ServerMonitor 
        onAlert={handleServerAlert}
        checkInterval={30000} // Vérifier toutes les 30 secondes
      />
    </BrowserRouter>
  );
}

export default App;
