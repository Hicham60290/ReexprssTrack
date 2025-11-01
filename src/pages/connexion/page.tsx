import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { supabase } from '../../lib/supabase';

export default function Connexion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          // Redirection avec un petit délai pour permettre l'affichage
          setTimeout(() => {
            navigate(redirectTo);
          }, 100);
        }
      } catch (error) {
        console.log('Vérification auth échouée:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate, redirectTo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Timeout de sécurité pour éviter que la connexion reste bloquée
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Délai de connexion dépassé. Veuillez réessayer.');
    }, 15000); // 15 secondes maximum

    try {
      // Connexion simple et directe avec Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // Annuler le timeout si la connexion réussit ou échoue
      clearTimeout(timeoutId);

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Aucune donnée utilisateur reçue');
      }

      console.log('Connexion réussie pour:', data.user.email);

      // Vérification rapide du profil (non bloquante)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // Redirection immédiate selon le rôle
        if (profile?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = redirectTo || '/dashboard';
        }
      } catch (profileError) {
        // Si erreur de profil, redirection par défaut
        console.warn('Profil non trouvé, redirection par défaut:', profileError);
        window.location.href = redirectTo || '/dashboard';
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Erreur connexion:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter');
        setShowResendConfirmation(true);
        setUserEmail(formData.email);
      } else if (error.message.includes('Too many requests')) {
        setError('Trop de tentatives. Veuillez patienter quelques minutes');
      } else {
        setError(error.message || 'Erreur lors de la connexion');
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setResetSuccess(true);
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation:', error);
      setError(error.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (resetPasswordMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm bg-white/80 transition-all duration-500 hover:shadow-3xl animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                  <i className="ri-lock-unlock-line text-3xl text-purple-600"></i>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  Mot de passe oublié ?
                </h1>
                <p className="text-gray-600 text-lg">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                  <div className="flex items-start">
                    <i className="ri-error-warning-line text-red-600 mr-3 mt-0.5 text-lg"></i>
                    <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {resetSuccess ? (
                <div className="text-center animate-in zoom-in duration-500">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <i className="ri-check-line text-2xl text-green-600"></i>
                    </div>
                    <h3 className="font-semibold text-green-900 mb-3 text-lg">
                      Email envoyé avec succès !
                    </h3>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setResetPasswordMode(false)}
                    className="whitespace-nowrap hover:scale-105 transition-transform"
                  >
                    <i className="ri-arrow-left-line mr-2"></i>
                    Retour à la connexion
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <i className="ri-mail-line mr-2 text-purple-600"></i>
                      Adresse email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-purple-300"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-3 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        Envoyer le lien de réinitialisation
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setResetPasswordMode(false)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline transition-colors"
                    >
                      <i className="ri-arrow-left-line mr-1"></i>
                      Retour à la connexion
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Afficher un loader pendant la vérification
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* Éléments décoratifs animés */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-48 h-48 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-pink-300/40 to-purple-300/40 rounded-full blur-lg animate-bounce delay-500"></div>
      
      <Header />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm bg-white/90 transition-all duration-500 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] animate-in slide-in-from-bottom-4 fade-in duration-700">
          {/* Header décoratif */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2"></div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <i className="ri-user-line text-3xl text-purple-600"></i>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Bienvenue !
              </h1>
              <p className="text-gray-600 text-lg">
                Connectez-vous à votre espace client
              </p>
              {redirectTo !== '/dashboard' && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
                  <i className="ri-information-line mr-1"></i>
                  Redirection automatique après connexion
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
                <div className="flex items-start">
                  <i className="ri-error-warning-line text-red-600 mr-3 mt-0.5 text-lg"></i>
                  <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <i className="ri-mail-line mr-2 text-purple-600"></i>
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-purple-300"
                    placeholder="votre@email.com"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <i className="ri-mail-line text-gray-400 group-focus-within:text-purple-500 transition-colors"></i>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <i className="ri-lock-line mr-2 text-purple-600"></i>
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-purple-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-colors"
                  />
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Se souvenir de moi
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setResetPasswordMode(true)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3 text-lg font-semibold ${loading ? 'animate-pulse' : 'hover:scale-105'}`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <i className="ri-login-circle-line mr-2"></i>
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  to="/inscription" 
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors"
                >
                  Créer un compte gratuit
                </Link>
              </p>
            </div>

            {/* Séparateur décoratif */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou connectez-vous avec</span>
              </div>
            </div>

            {/* Connexion sociale future */}
            <div className="mt-8">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50 transition-all duration-300"
                  disabled
                >
                  <i className="ri-google-fill mr-2 text-red-500"></i>
                  Google
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50 transition-all duration-300"
                  disabled
                >
                  <i className="ri-facebook-fill mr-2 text-blue-600"></i>
                  Facebook
                </button>
              </div>
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs">
                  <i className="ri-time-line mr-1"></i>
                  Bientôt disponible
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indication de sécurité */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <i className="ri-shield-check-line mr-2 text-green-500"></i>
            Connexion sécurisée SSL/TLS
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
