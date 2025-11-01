
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {}
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Fonction pour nettoyer le stockage local
  const clearLocalAuth = () => {
    try {
      // Nettoyer tous les tokens Supabase
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erreur nettoyage stockage:', error);
    }
  };

  // Fonction pour rafraîchir la session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn('Erreur refresh session:', error.message);
        
        // Si le refresh échoue, déconnecter l'utilisateur
        if (error.message.includes('refresh') || error.message.includes('token') || error.message.includes('expired')) {
          await handleExpiredSession();
        }
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error('Erreur refresh session:', error);
      await handleExpiredSession();
    }
  };

  // Gérer les sessions expirées
  const handleExpiredSession = async () => {
    console.log('Session expirée, nettoyage en cours...');
    
    try {
      // Déconnexion silencieuse
      await supabase.auth.signOut({ scope: 'local' });
    } catch (signOutError) {
      console.warn('Erreur signOut silencieux:', signOutError);
    }
    
    // Nettoyer le stockage local
    clearLocalAuth();
    
    // Réinitialiser l'état
    setSession(null);
    setUser(null);
    
    // Rediriger vers la page de connexion si on n'y est pas déjà
    if (window.location.pathname !== '/connexion' && window.location.pathname !== '/') {
      window.location.href = '/connexion';
    }
  };

  // Timeout de sécurité pour éviter le blocage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!initialized) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000); // 5 secondes maximum

    return () => clearTimeout(timeoutId);
  }, [initialized]);

  useEffect(() => {
    let mounted = true;
    let initComplete = false;

    const initializeAuth = async () => {
      try {
        // Récupération de session avec gestion d'erreur
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted || initComplete) return;

        if (error) {
          console.warn('Erreur session:', error.message);
          
          // Si erreur de refresh token, nettoyer complètement
          if (error.message.includes('refresh') || 
              error.message.includes('token') || 
              error.message.includes('expired') ||
              error.message.includes('revoked')) {
            await handleExpiredSession();
            return;
          }
          
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
      } catch (error: any) {
        console.error('Erreur initialisation:', error);
        
        // En cas d'erreur critique, nettoyer et réinitialiser
        if (error?.message?.includes('refresh') || 
            error?.message?.includes('token') ||
            error?.message?.includes('expired') ||
            error?.message?.includes('revoked')) {
          await handleExpiredSession();
          return;
        }
        
        setSession(null);
        setUser(null);
      } finally {
        if (mounted && !initComplete) {
          setLoading(false);
          setInitialized(true);
          initComplete = true;
        }
      }
    };

    initializeAuth();

    // Écouter les changements avec gestion d'erreur
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth change:', event);
        
        // Gérer les erreurs d'authentification
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, clearing auth');
          await handleExpiredSession();
          return;
        }
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          clearLocalAuth();
        }
        
        // Mise à jour de l'état
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!initialized) {
          setLoading(false);
          setInitialized(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Déconnexion avec nettoyage local
      await supabase.auth.signOut({ scope: 'local' });
      
      // Nettoyer complètement le stockage
      clearLocalAuth();
      
      setSession(null);
      setUser(null);
      
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      
      // Forcer le nettoyage même en cas d'erreur
      clearLocalAuth();
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
