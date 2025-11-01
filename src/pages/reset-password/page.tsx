
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  // Vérifier si nous avons les tokens nécessaires
  useEffect(() => {
    const checkTokens = async () => {
      // Nouveau format Supabase : #access_token=...&expires_in=...&refresh_token=...&token_type=bearer&type=recovery
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      // Vérifier aussi les query parameters pour compatibilité
      const queryAccessToken = searchParams.get('access_token');
      const queryRefreshToken = searchParams.get('refresh_token');
      const queryType = searchParams.get('type');

      const finalAccessToken = accessToken || queryAccessToken;
      const finalRefreshToken = refreshToken || queryRefreshToken;
      const finalType = type || queryType;

      console.log('Tokens trouvés:', { finalAccessToken: !!finalAccessToken, finalRefreshToken: !!finalRefreshToken, finalType });

      if (!finalAccessToken || !finalRefreshToken || finalType !== 'recovery') {
        setError('Lien de réinitialisation invalide ou expiré');
        return;
      }

      try {
        // Définir la session avec les tokens reçus
        const { data, error } = await supabase.auth.setSession({
          access_token: finalAccessToken,
          refresh_token: finalRefreshToken
        });
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setIsValidToken(true);
          setError('');
        } else {
          throw new Error('Session invalide');
        }
      } catch (error: any) {
        console.error('Erreur lors de la définition de la session:', error);
        setError('Lien de réinitialisation invalide ou expiré');
      }
    };

    checkTokens();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une lettre minuscule';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Le mot de passe doit contenir au moins une lettre majuscule';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidToken) {
      setError('Session invalide. Veuillez utiliser le lien reçu par email.');
      return;
    }

    setLoading(true);
    setError('');

    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      // Redirection automatique après 3 secondes
      setTimeout(() => {
        navigate('/connexion');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      
      if (error.message.includes('session_not_found')) {
        setError('Session expirée. Veuillez demander un nouveau lien de réinitialisation');
      } else if (error.message.includes('same_password')) {
        setError("Le nouveau mot de passe doit être différent de l'ancien");
      } else {
        setError(error.message || 'Erreur lors de la mise à jour du mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Header />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm bg-white/80 transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <i className="ri-check-line text-3xl text-green-600"></i>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                Mot de passe mis à jour !
              </h1>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
                <p className="text-green-700 text-lg leading-relaxed">
                  Votre mot de passe a été modifié avec succès.
                </p>
                <p className="text-green-600 text-sm mt-2">
                  Redirection automatique vers la page de connexion...
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-green-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Redirection en cours...</span>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Si le token n'est pas valide, afficher un message d'erreur avec possibilité de renvoyer
  if (error && !isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Header />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm bg-white/80">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="ri-error-warning-line text-3xl text-red-600"></i>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                Lien invalide
              </h1>
              
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6">
                <p className="text-red-700 text-base leading-relaxed mb-3">
                  {error}
                </p>
                <p className="text-red-600 text-sm">
                  Ce lien a peut-être expiré ou a déjà été utilisé.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/connexion')}
                  className="w-full whitespace-nowrap bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Retour à la connexion
                </Button>
                
                <button
                  onClick={() => navigate('/connexion')}
                  className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline transition-colors"
                >
                  Demander un nouveau lien de réinitialisation
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm bg-white/80 transition-all duration-500 hover:shadow-3xl animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                <i className="ri-lock-password-line text-3xl text-purple-600"></i>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Nouveau mot de passe
              </h1>
              <p className="text-gray-600 text-lg">
                Choisissez un mot de passe sécurisé pour votre compte
              </p>
            </div>

            {error && isValidToken && (
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
                  <i className="ri-lock-line mr-2 text-purple-600"></i>
                  Nouveau mot de passe
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
                <div className="mt-2 text-xs text-gray-500">
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <i className={`ri-${formData.password.length >= 8 ? 'check' : 'close'}-line mr-1`}></i>
                      8+ caractères
                    </div>
                    <div className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <i className={`ri-${/(?=.*[a-z])/.test(formData.password) ? 'check' : 'close'}-line mr-1`}></i>
                      Minuscule
                    </div>
                    <div className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <i className={`ri-${/(?=.*[A-Z])/.test(formData.password) ? 'check' : 'close'}-line mr-1`}></i>
                      Majuscule
                    </div>
                    <div className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <i className={`ri-${/(?=.*\d)/.test(formData.password) ? 'check' : 'close'}-line mr-1`}></i>
                      Chiffre
                    </div>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <i className="ri-lock-line mr-2 text-purple-600"></i>
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-purple-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    <i className={showConfirmPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className={`mt-2 text-xs flex items-center ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    <i className={`ri-${formData.password === formData.confirmPassword ? 'check' : 'close'}-line mr-1`}></i>
                    {formData.password === formData.confirmPassword ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword || !isValidToken}
                className="w-full whitespace-nowrap bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line mr-2"></i>
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => navigate('/connexion')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline transition-colors"
              >
                <i className="ri-arrow-left-line mr-1"></i>
                Retour à la connexion
              </button>
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
