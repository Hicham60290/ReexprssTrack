
import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';

import Home from '../pages/home/page';
import Tarifs from '../pages/tarifs/page';
import Calculator from '../pages/calculateur/page';
import Tracking from '../pages/suivi/page';
import Help from '../pages/aide/page';
import Contact from '../pages/contact/page';
import Login from '../pages/connexion/page';
import Register from '../pages/inscription/page';
import Dashboard from '../pages/dashboard/page';
import Subscription from '../pages/abonnement/page';
import DeclarePackage from '../pages/declarer-colis/page';
import AchatPourMoi from '../pages/achat-pour-moi/page';
import Privacy from '../pages/confidentialite/page';
import FAQ from '../pages/faq/page';
import MentionsLegales from '../pages/mentions-legales/page';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import CGV from '../pages/cgv/page';
import PackagesPage from '../pages/packages/page';
import GestionRetour from '../pages/gestion-retour/page';
import RetourColisDomTom from '../pages/retour-colis-dom-tom/page';
import AdminColisRecus from '../pages/admin/colis-recus/page';
import AdminDashboard from '../pages/admin/page';
import AdminPackageDetail from '../pages/admin/colis/[id]/page';
import AdminAddPackage from '../pages/admin/ajouter-colis/page';
import AdminUsersPage from '../pages/admin/utilisateurs/page';
import AdminStatisticsPage from '../pages/admin/statistiques/page';
import ResetPassword from '../pages/reset-password/page';

// Blog imports
import BlogPage from '../pages/blog/page';
import BlogAbonnementsDomtom from '../pages/blog/abonnements-domtom-tarifs-preferentiels';
import AchatPourMoiBlogPost from '../pages/blog/achat-pour-moi-assistant-personnel';
import BlogAchatPourMoiProcessus from '../pages/blog/achat-pour-moi-processus-complet';
import BlogCalculateurTarifs from '../pages/blog/calculateur-tarifs-expedition-domtom';
import BlogEngagementEnvironnemental from '../pages/blog/engagement-environnemental-reexpresstrack';
import BlogGuideAchatAmazon from '../pages/blog/guide-achat-amazon-france-domtom';
import BlogServiceRetour from '../pages/blog/service-retour-dom-tom-france';
import BlogSuiviColis from '../pages/blog/suivi-colis-temps-reel-domtom';
import BlogSheinMaroc from '../pages/blog/shein-maroc-shopping-livraison-domtom';

import QuotePaymentPage from '../pages/quote-payment/page';

// Lazy load components
const HomePage = lazy(() => import('../pages/home/page'));
const MaintenancePage = lazy(() => import('../pages/maintenance/page'));

// Mode maintenance - décommentez cette ligne pour activer
const MAINTENANCE_MODE = true;

const routes: RouteObject[] = [
  // Mode maintenance
  ...(MAINTENANCE_MODE ? [
    {
      path: '*',
      element: <MaintenancePage />,
    }
  ] : [
    // Routes normales (existantes)
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/tarifs',
      element: <Tarifs />,
    },
    {
      path: '/calculateur',
      element: <Calculator />,
    },
    {
      path: '/suivi',
      element: (
        <ProtectedRoute>
          <Tracking />
        </ProtectedRoute>
      ),
    },
    {
      path: '/aide',
      element: <Help />,
    },
    {
      path: '/contact',
      element: <Contact />,
    },
    {
      path: '/connexion',
      element: <Login />,
    },
    {
      path: '/login',
      element: <Navigate to="/connexion" replace />
    },
    {
      path: '/inscription',
      element: <Register />,
    },
    {
      path: '/abonnement',
      element: <Subscription />,
    },
    {
      path: '/declarer-colis',
      element: <DeclarePackage />,
    },
    {
      path: '/gestion-retour',
      element: (
        <ProtectedRoute>
          <GestionRetour />
        </ProtectedRoute>
      ),
    },
    {
      path: '/achat-pour-moi',
      element: <AchatPourMoi />,
    },
    {
      path: '/confidentialite',
      element: <Privacy />,
    },
    {
      path: '/mentions-legales',
      element: <MentionsLegales />,
    },
    {
      path: '/faq',
      element: <FAQ />,
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: '/packages',
      element: (
        <ProtectedRoute>
          <PackagesPage />
        </ProtectedRoute>
      ),
    },
    // Blog routes
    {
      path: '/blog',
      element: <BlogPage />
    },
    {
      path: '/blog/abonnements-domtom-tarifs-preferentiels',
      element: <BlogAbonnementsDomtom />
    },
    {
      path: '/blog/achat-pour-moi-assistant-personnel',
      element: <AchatPourMoiBlogPost />
    },
    {
      path: '/blog/achat-pour-moi-processus-complet',
      element: <BlogAchatPourMoiProcessus />
    },
    {
      path: '/blog/calculateur-tarifs-expedition-domtom',
      element: <BlogCalculateurTarifs />
    },
    {
      path: '/blog/engagement-environnemental-reexpresstrack',
      element: <BlogEngagementEnvironnemental />
    },
    {
      path: '/blog/guide-achat-amazon-france-domtom',
      element: <BlogGuideAchatAmazon />
    },
    {
      path: '/blog/service-retour-dom-tom-france',
      element: <BlogServiceRetour />
    },
    {
      path: '/blog/suivi-colis-temps-reel-domtom',
      element: <BlogSuiviColis />
    },
    {
      path: '/blog/shein-maroc-shopping-livraison-domtom',
      element: <BlogSheinMaroc />
    },

    // Redirections pour les anciennes URLs /services/
    {
      path: '/services/dom-tom',
      element: <Navigate to="/tarifs" replace />
    },
    {
      path: '/services/europe',
      element: <Navigate to="/tarifs" replace />
    },
    {
      path: '/services/maroc',
      element: <Navigate to="/tarifs" replace />
    },
    {
      path: '/services/groupage',
      element: <Navigate to="/tarifs" replace />
    },

    // Routes admin
    {
      path: '/admin',
      element: <AdminRoute><AdminDashboard /></AdminRoute>
    },
    {
      path: '/admin/utilisateurs',
      element: <AdminRoute><AdminUsersPage /></AdminRoute>
    },
    {
      path: '/admin/statistiques',
      element: <AdminRoute><AdminStatisticsPage /></AdminRoute>
    },
    {
      path: '/admin/colis-recus',
      element: (
        <AdminRoute>
          <AdminColisRecus />
        </AdminRoute>
      ),
    },
    {
      path: '/admin/colis/:id',
      element: (
        <AdminRoute>
          <AdminPackageDetail />
        </AdminRoute>
      ),
    },
    {
      path: '/admin/ajouter-colis',
      element: (
        <AdminRoute>
          <AdminAddPackage />
        </AdminRoute>
      ),
    },

    // Nouvelle route de réinitialisation du mot de passe
    {
      path: '/reset-password',
      element: <ResetPassword />
    },

    // Nouvelle route de paiement de devis
    {
      path: '/quote-payment',
      element: (
        <ProtectedRoute>
          <QuotePaymentPage />
        </ProtectedRoute>
      )
    },

    // Route 404 - doit être en dernier
    {
      path: '*',
      element: <NotFound />,
    },
  ])
];

export default routes;
