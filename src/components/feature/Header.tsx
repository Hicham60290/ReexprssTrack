
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../base/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../hooks/useRole';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const location = useLocation();

  // Mapping des routes vers les titres de pages
  const getPageTitle = (pathname: string): string => {
    const routeTitles: { [key: string]: string } = {
      '/': 'Accueil',
      '/tarifs': 'Tarifs',
      '/calculateur': 'Calculateur de frais',
      '/suivi': 'Suivi de colis',
      '/aide': 'Centre d\'aide',
      '/blog': 'Blog',
      '/contact': 'Contact',
      '/connexion': 'Connexion',
      '/inscription': 'Inscription',
      '/dashboard': 'Tableau de bord',
      '/packages': 'Mes colis',
      '/declarer-colis': 'Déclarer un colis',
      '/abonnement': 'Abonnement',
      '/achat-pour-moi': 'Achat pour moi',
      '/gestion-retour': 'Gestion des retours',
      '/retour-colis-dom-tom': 'Retour colis DOM-TOM',
      '/faq': 'Questions fréquentes',
      '/cgv': 'Conditions générales',
      '/confidentialite': 'Politique de confidentialité',
      '/mentions-legales': 'Mentions légales',
      '/admin': 'Administration',
      '/admin/colis-recus': 'Colis reçus',
      '/admin/utilisateurs': 'Utilisateurs',
      '/admin/statistiques': 'Statistiques',
      '/admin/ajouter-colis': 'Ajouter un colis'
    };

    // Gestion des routes dynamiques (blog, admin colis)
    if (pathname.startsWith('/blog/')) {
      return 'Article de blog';
    }
    if (pathname.startsWith('/admin/colis/')) {
      return 'Détails du colis';
    }

    return routeTitles[pathname] || 'ReexpresseTrack';
  };

  const currentPageTitle = getPageTitle(location.pathname);
  const isHomePage = location.pathname === '/';

  // Gestion optimisée du scroll pour mobile
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Empêcher le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100' 
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo optimisé pour mobile */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200 focus-visible:focus-visible"
              aria-label="Retour à l'accueil ReexpresseTrack"
            >
              <img 
                src="https://static.readdy.ai/image/99ff8ee0c27f1c25e3ad19898dcaee78/2df4c9553b9970f17c7fe7c93ae2be97.png" 
                alt="ReexpresseTrack" 
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex-shrink-0 object-contain"
              />
              <span className="text-lg md:text-xl font-bold text-gray-900 font-pacifico hidden sm:block">
                ReexpresseTrack
              </span>
              <span className="text-sm font-bold text-gray-900 font-pacifico sm:hidden">
                RET
              </span>
            </Link>

            {/* Navigation desktop - cachée sur mobile */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/tarifs" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Tarifs
              </Link>
              <Link 
                to="/calculateur" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Calculateur
              </Link>
              <Link 
                to="/suivi" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Suivi
              </Link>
              <Link 
                to="/abonnement" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Abonnement
              </Link>
              <Link 
                to="/aide" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Aide
              </Link>
              <Link 
                to="/blog" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Blog
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
              >
                Contact
              </Link>
            </nav>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link 
                    to="/dashboard" 
                    className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
                  >
                    <i className="ri-dashboard-line mr-2"></i>
                    Tableau de bord
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="px-4 py-2 text-purple-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
                    >
                      <i className="ri-admin-line mr-2"></i>
                      Administration
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="focus-visible:focus-visible"
                  >
                    <i className="ri-logout-line mr-2"></i>
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link 
                    to="/connexion" 
                    className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium focus-visible:focus-visible"
                  >
                    Connexion
                  </Link>
                  <Link to="/inscription">
                    <Button className="focus-visible:focus-visible">
                      <i className="ri-user-add-line mr-2"></i>
                      Inscription
                    </Button>
                  </Link>
                </div>
              )}

              {/* Bouton menu mobile - visible sur mobile uniquement */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {/* Icône hamburger en SVG pour assurer la visibilité */}
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <div className="w-5 h-0.5 bg-current mb-1 transition-all duration-300"></div>
                  <div className="w-5 h-0.5 bg-current mb-1 transition-all duration-300"></div>
                  <div className="w-5 h-0.5 bg-current transition-all duration-300"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Titre de la page - affiché sous le header sauf pour l'accueil */}
          {!isHomePage && (
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4 md:py-6">
                  <div className="flex items-center space-x-3">
                    {/* Icône basée sur la page */}
                    <div className="w-8 h-8 flex items-center justify-center bg-orange-100 rounded-lg">
                      <i className={`text-orange-600 ${
                        location.pathname === '/tarifs' ? 'ri-price-tag-line' :
                        location.pathname === '/calculateur' ? 'ri-calculator-line' :
                        location.pathname === '/suivi' ? 'ri-truck-line' :
                        location.pathname === '/aide' ? 'ri-question-line' :
                        location.pathname === '/blog' || location.pathname.startsWith('/blog/') ? 'ri-article-line' :
                        location.pathname === '/contact' ? 'ri-phone-line' :
                        location.pathname === '/connexion' ? 'ri-login-line' :
                        location.pathname === '/inscription' ? 'ri-user-add-line' :
                        location.pathname === '/dashboard' ? 'ri-dashboard-line' :
                        location.pathname === '/packages' ? 'ri-package-line' :
                        location.pathname === '/declarer-colis' ? 'ri-add-box-line' :
                        location.pathname === '/abonnement' ? 'ri-vip-crown-line' :
                        location.pathname === '/achat-pour-moi' ? 'ri-shopping-cart-line' :
                        location.pathname.includes('retour') ? 'ri-arrow-go-back-line' :
                        location.pathname === '/faq' ? 'ri-questionnaire-line' :
                        location.pathname.includes('admin') ? 'ri-admin-line' :
                        'ri-pages-line'
                      }`}></i>
                    </div>
                    
                    {/* Titre */}
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold !text-gray-900 force-dark-text">
                        {currentPageTitle}
                      </h1>
                      
                      {/* Fil d'Ariane pour les pages admin */}
                      {location.pathname.startsWith('/admin') && location.pathname !== '/admin' && (
                        <nav className="mt-1 text-sm !text-gray-600 force-gray-text">
                          <Link to="/admin" className="hover:text-orange-600 transition-colors">
                            Administration
                          </Link>
                          <span className="mx-2">•</span>
                          <span>{currentPageTitle}</span>
                        </nav>
                      )}
                      
                      {/* Fil d'Ariane pour les articles de blog */}
                      {location.pathname.startsWith('/blog/') && (
                        <nav className="mt-1 text-sm !text-gray-600 force-gray-text">
                          <Link to="/blog" className="hover:text-orange-600 transition-colors">
                            Blog
                          </Link>
                          <span className="mx-2">•</span>
                          <span>Article</span>
                        </nav>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Menu mobile overlay - masqué sur desktop */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={toggleMenu}
          aria-hidden="true"
        />
        
        {/* Menu content */}
        <div 
          id="mobile-menu"
          className={`absolute top-16 md:top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl transform transition-transform duration-300 will-change-transform ${
            isMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <nav className="px-4 py-6 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto scroll-container">
            <Link 
              to="/tarifs" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-price-tag-line mr-3"></i>
              Tarifs
            </Link>
            <Link 
              to="/calculateur" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-calculator-line mr-3"></i>
              Calculateur
            </Link>
            <Link 
              to="/suivi" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-truck-line mr-3"></i>
              Suivi
            </Link>
            <Link 
              to="/abonnement" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-vip-crown-line mr-3"></i>
              Abonnement
            </Link>
            <Link 
              to="/aide" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-question-line mr-3"></i>
              Aide
            </Link>
            <Link 
              to="/blog" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg.orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-article-line mr-3"></i>
              Blog
            </Link>
            <Link 
              to="/contact" 
              className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg.orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
              onClick={toggleMenu}
            >
              <i className="ri-phone-line mr-3"></i>
              Contact
            </Link>

            {/* Séparateur */}
            <div className="border-t border-gray-200 my-4"></div>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg.orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
                  onClick={toggleMenu}
                >
                  <i className="ri-dashboard-line mr-3"></i>
                  Tableau de bord
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block px-4 py-3 text-purple-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
                    onClick={toggleMenu}
                  >
                    <i className="ri-admin-line mr-3"></i>
                    Administration
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:text.orange-600 hover:bg.orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
                >
                  <i className="ri-logout-line mr-3"></i>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/connexion" 
                  className="block px-4 py-3 text-gray-700 hover:text.orange-600 hover:bg.orange-50 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
                  onClick={toggleMenu}
                >
                  <i className="ri-login-line mr-3"></i>
                  Connexion
                </Link>
                <Link 
                  to="/inscription" 
                  className="block px-4 py-3 bg-orange-600 text-white hover:bg.orange-700 rounded-lg transition-all duration-200 font-medium mobile-touch-target focus-visible:focus-visible"
                  onClick={toggleMenu}
                >
                  <i className="ri-user-add-line mr-3"></i>
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Spacer pour éviter le CLS - ajusté pour inclure le titre */}
      <div className={`${isHomePage ? 'h-16 md:h-20' : 'h-28 md:h-32'}`} aria-hidden="true"></div>
    </>
  );
}

export default Header;
