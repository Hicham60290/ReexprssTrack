
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UserRole {
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
}

// Fonction utilitaire pour extraire le prénom depuis l'email
const getDisplayName = (user: any): string => {
  // 1. Priorité : métadonnées utilisateur
  if (user?.user_metadata?.first_name) return user.user_metadata.first_name;
  if (user?.user_metadata?.firstName) return user.user_metadata.firstName;
  
  // 2. Fallback : extraction depuis l'email
  if (user?.email) {
    const username = user.email.split('@')[0];
    
    // Éviter les emails techniques avec points ou underscores
    if (username.includes('.') || username.includes('_')) {
      return 'Client';
    }
    
    // Capitaliser la première lettre
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  }
  
  return 'Client';
};

export const useRole = (): UserRole => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateUserProfile = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // D'abord, essayer de récupérer le profil existant
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle(); // utiliser maybeSingle() au lieu de single()

        if (fetchError) {
          console.error('Erreur lors de la récupération du profil:', fetchError);
          setRole('user'); // Rôle par défaut
          setLoading(false);
          return;
        }

        // Si le profil existe, utiliser son rôle
        if (existingProfile) {
          setRole(existingProfile.role || 'user');
          setLoading(false);
          return;
        }

        // Si le profil n'existe pas, le créer
        console.log('Création du profil utilisateur...');
        
        const displayName = getDisplayName(user);
        const userEmail = user.email || '';

        const newProfile = {
          id: user.id,
          email: userEmail,
          first_name: displayName,
          last_name: '',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          console.error('Erreur lors de la création du profil:', insertError);
          setRole('user'); // Rôle par défaut même en cas d'erreur
        } else {
          console.log('Profil utilisateur créé avec succès');
          setRole('user');
        }

      } catch (error) {
        console.error('Erreur générale:', error);
        setRole('user'); // Rôle par défaut
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateUserProfile();
  }, [user]);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isUser: role === 'user' || role === null
  };
};
