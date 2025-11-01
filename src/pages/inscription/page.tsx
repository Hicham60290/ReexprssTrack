import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';

export default function Inscription() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '', // Nouveau champ entreprise
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    territory: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const territories = [
    { value: 'guadeloupe', label: 'Guadeloupe (971)' },
    { value: 'martinique', label: 'Martinique (972)' },
    { value: 'guyane', label: 'Guyane (973)' },
    { value: 'reunion', label: 'La Réunion (974)' },
    { value: 'maroc', label: 'Maroc' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const resendConfirmationEmail = async () => {
    if (!userEmail) return;
    
    setResendingEmail(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail
      });
      
      if (error) throw error;
      
      // Envoyer aussi notre email personnalisé
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            templateType: 'registration_confirmation',
            recipientEmail: userEmail,
            variables: {
              email: userEmail
            }
          }
        });
      } catch (emailError) {
        console.warn('Erreur envoi email personnalisé:', emailError);
      }
      
      alert('Email de confirmation renvoyé avec succès ! Vérifiez votre boîte de réception et vos spams.');
      
    } catch (error: any) {
      console.error('Erreur renvoi email:', error);
      setError('Erreur lors du renvoi de l\'email de confirmation. Veuillez réessayer.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions générales');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    if (!formData.phone) {
      setError('Le numéro de téléphone est obligatoire pour la livraison');
      setLoading(false);
      return;
    }

    try {
      // Inscription avec Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company,
            phone: formData.phone,
            address: formData.address,
            postal_code: formData.postalCode,
            city: formData.city,
            territory: formData.territory,
            accept_marketing: formData.acceptMarketing
          }
        }
      });

      if (signUpError) throw signUpError;

      // CRÉATION AUTOMATIQUE DU PROFIL - NOUVELLE VERSION ROBUSTE
      if (data.user) {
        console.log('=== DÉBUT CRÉATION PROFIL AUTOMATIQUE ===');
        console.log('User ID:', data.user.id);
        
        try {
          // Utiliser la nouvelle fonction Edge améliorée pour créer le profil
          const { data: profileResult, error: profileError } = await supabase.functions.invoke('create-user-profile-auto', {
            body: {
              userId: data.user.id,
              userData: {
                email: formData.email,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                company: formData.company,
                address: formData.address,
                postal_code: formData.postalCode,
                city: formData.city,
                territory: formData.territory,
                accept_marketing: formData.acceptMarketing
              }
            }
          });

          if (profileError) {
            console.warn('Erreur fonction Edge automatique:', profileError);
            
            // FALLBACK 1: Création directe dans la base
            console.log('=== FALLBACK 1: Création directe ===');
            const profileData = {
              id: data.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone || '',
              company: formData.company || '',
              address: formData.address || '',
              postal_code: formData.postalCode || '',
              city: formData.city || '',
              territory: formData.territory || '',
              subscription_type: 'free',
              subscription_status: 'inactive',
              role: 'user',
              accept_marketing: formData.acceptMarketing || false,
              email: formData.email,
              kyc_status: 'pending',
              free_storage_days: 3,
              deletion_requested: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { data: directProfile, error: directProfileError } = await supabase
              .from('profiles')
              .upsert([profileData], { 
                onConflict: 'id',
                ignoreDuplicates: false 
              })
              .select()
              .single();

            if (directProfileError) {
              console.warn('Erreur création profil directe:', directProfileError);
              
              // FALLBACK 2: Retry avec insert simple
              console.log('=== FALLBACK 2: Insert simple ===');
              const { error: simpleInsertError } = await supabase
                .from('profiles')
                .insert([profileData]);

              if (simpleInsertError) {
                console.error('Tous les fallbacks ont échoué:', simpleInsertError);
                // Ne pas bloquer l'inscription - le profil sera créé à la première connexion
                console.log('Profil sera créé à la première connexion');
              } else {
                console.log('✅ Profil créé avec insert simple');
              }
            } else {
              console.log('✅ Profil créé avec upsert direct:', directProfile?.id);
            }
          } else {
            console.log('✅ Profil créé via fonction Edge:', profileResult);
          }
        } catch (profileErr) {
          console.warn('Erreur globale création profil:', profileErr);
          // Ne pas bloquer l'inscription - mécanisme de récupération à la connexion
          console.log('Mécanisme de récupération activé pour la première connexion');
        }

        // Mettre à jour les métadonnées utilisateur
        try {
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
              territory: formData.territory,
              profile_created: true,
              profile_creation_attempted: new Date().toISOString()
            }
          });

          if (updateError) {
            console.warn('Erreur mise à jour métadonnées:', updateError);
          } else {
            console.log('✅ Métadonnées utilisateur mises à jour');
          }
        } catch (metaError) {
          console.warn('Erreur métadonnées utilisateur:', metaError);
        }
      }

      // Stocker l'email pour le renvoi éventuel
      setUserEmail(formData.email);

      // Envoyer l'email de bienvenue personnalisé
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            templateType: 'registration_confirmation',
            recipientEmail: formData.email,
            variables: {
              firstName: formData.firstName,
              email: formData.email
            }
          }
        });
        console.log('✅ Email de bienvenue envoyé');
      } catch (emailError) {
        console.warn('Erreur envoi email personnalisé:', emailError);
      }

      console.log('=== INSCRIPTION TERMINÉE AVEC SUCCÈS ===');
      setSuccess(true);
      setShowResendConfirmation(true);

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      if (error.message.includes('already registered')) {
        setError('Cette adresse email est déjà utilisée');
      } else {
        setError(error.message || 'Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <section className="py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-check-line text-3xl text-green-600"></i>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Inscription réussie !
                </h1>
                
                <p className="text-gray-600 mb-6">
                  Votre compte a été créé avec succès. Un email de confirmation a été envoyé à <strong>{userEmail}</strong>.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <i className="ri-information-line text-blue-600 text-xl mr-3 mt-1"></i>
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-900 mb-2">Confirmez votre email</h3>
                      <p className="text-blue-800 text-sm mb-3">
                        Cliquez sur le lien dans l'email de confirmation pour activer votre compte et accéder à tous nos services.
                      </p>
                      <p className="text-blue-700 text-xs">
                        💡 <strong>Astuce :</strong> Vérifiez aussi votre dossier spam/courrier indésirable
                      </p>
                    </div>
                  </div>
                </div>

                {showResendConfirmation && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800 text-sm mb-3">
                      Vous n'avez pas reçu l'email de confirmation ?
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resendConfirmationEmail}
                      disabled={resendingEmail}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      {resendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mr-2"></div>
                          Renvoi en cours...
                        </>
                      ) : (
                        <>
                          <i className="ri-mail-send-line mr-2"></i>
                          Renvoyer l'email de confirmation
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <i className="ri-truck-line text-2xl text-blue-600 mb-2"></i>
                      <h3 className="font-semibold text-gray-900 mb-1">Expédition DOM-TOM</h3>
                      <p className="text-gray-600 text-sm">Recevez vos colis depuis la France</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <i className="ri-refresh-line text-2xl text-green-600 mb-2"></i>
                      <h3 className="font-semibold text-gray-900 mb-1">Gestion retours</h3>
                      <p className="text-gray-600 text-sm">Service complet de retour colis</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <i className="ri-calculator-line text-2xl text-purple-600 mb-2"></i>
                      <h3 className="font-semibold text-gray-900 mb-1">Calculateur</h3>
                      <p className="text-gray-600 text-sm">Estimez vos frais d'expédition</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <i className="ri-customer-service-line text-2xl text-orange-600 mb-2"></i>
                      <h3 className="font-semibold text-gray-900 mb-1">Support 7j/7</h3>
                      <p className="text-gray-600 text-sm">Équipe dédiée DOM-TOM</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Link to="/connexion">
                      <Button size="lg">
                        <i className="ri-login-box-line mr-2"></i>
                        Se connecter maintenant
                      </Button>
                    </Link>
                    <Link to="/">
                      <Button variant="outline" size="lg">
                        <i className="ri-home-line mr-2"></i>
                        Retour à l'accueil
                      </Button>
                    </Link>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Créer votre compte ReexpresseTrack
          </h1>
          <p className="text-xl text-blue-100">
            Rejoignez des milliers de clients  qui nous font confiance
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-user-add-line text-3xl text-white"></i>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Inscription gratuite
                </h2>
                <p className="text-lg text-gray-600">
                  Créez votre compte en moins de 2 minutes
                </p>
                <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-1"></i>
                    <span>Gratuit</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-1"></i>
                    <span>Sécurisé</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-600 mr-1"></i>
                    <span>Rapide</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                  <div className="flex items-center">
                    <i className="ri-error-warning-line text-red-600 mr-2 text-lg"></i>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Informations personnelles */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-user-line text-white text-lg"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Informations personnelles
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-blue-300"
                        placeholder="Votre prénom"
                      />
                      <i className="ri-user-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nom de famille *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-blue-300"
                        placeholder="Votre nom"
                      />
                      <i className="ri-user-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                </div>
                
                {/* Nouveau champ Entreprise */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center">
                      Entreprise
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Facultatif
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group-hover:border-blue-300"
                      placeholder="Nom de votre entreprise (si applicable)"
                    />
                    <i className="ri-building-2-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 flex items-center">
                    <i className="ri-information-line mr-1"></i>
                    Pour les professionnels et entreprises
                  </p>
                </div>
              </div>

              {/* Email et mot de passe */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-lock-line text-white text-lg"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Informations de connexion
                  </h3>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-green-300"
                        placeholder="votre.email@exemple.com"
                      />
                      <i className="ri-mail-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-green-300"
                          placeholder="Minimum 8 caractères"
                        />
                        <i className="ri-lock-password-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 group-hover:border-green-300"
                          placeholder="Répétez votre mot de passe"
                        />
                        <i className="ri-check-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-map-pin-line text-white text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Adresse de livraison
                    </h3>
                    <p className="text-sm text-purple-600 font-medium">
                      Informations requises pour vos expéditions
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Territoire *
                    </label>
                    <div className="relative">
                      <select
                        name="territory"
                        required
                        value={formData.territory}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white transition-all duration-200 group-hover:border-purple-300"
                      >
                        <option value="">Sélectionnez votre territoire</option>
                        {territories.map(territory => (
                          <option key={territory.value} value={territory.value}>
                            {territory.label}
                          </option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Adresse complète *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                        placeholder="Numéro, rue, résidence, appartement..."
                      />
                      <i className="ri-home-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Code postal *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="postalCode"
                          required
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                          placeholder="97xxx"
                        />
                        <i className="ri-map-pin-2-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                          placeholder="Votre ville"
                        />
                        <i className="ri-building-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center">
                        Téléphone *
                        <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                          Obligatoire pour livraison
                        </span>
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 group-hover:border-purple-300"
                        placeholder="+590 6 90 XX XX XX"
                      />
                      <i className="ri-phone-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <i className="ri-information-line mr-1"></i>
                      Nécessaire pour vous contacter lors de la livraison
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        name="acceptTerms"
                        required
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="w-6 h-6 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600 relative"
                        style={{
                          backgroundImage: formData.acceptTerms ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")` : 'none',
                          backgroundSize: '16px 16px',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-6 cursor-pointer block">
                        J'accepte les{' '}
                        <Link to="/cgv" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors">
                          conditions générales de vente
                        </Link>{' '}
                        et la{' '}
                        <Link to="/confidentialite" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors">
                          politique de confidentialité
                        </Link>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        id="acceptMarketing"
                        name="acceptMarketing"
                        checked={formData.acceptMarketing}
                        onChange={handleChange}
                        className="w-6 h-6 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer appearance-none checked:bg-green-600 checked:border-green-600"
                        style={{
                          backgroundImage: formData.acceptMarketing ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")` : 'none',
                          backgroundSize: '16px 16px',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="acceptMarketing" className="text-sm text-gray-700 leading-6 cursor-pointer block">
                        J'accepte de recevoir des informations commerciales et promotionnelles par email
                        <span className="block text-xs text-gray-500 mt-1">
                          <i className="ri-gift-line mr-1"></i>
                          Offres spéciales, nouveautés et conseils d'expédition
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <i className="ri-user-add-line mr-2"></i>
                      Créer mon compte gratuit
                    </>
                  )}
                </Button>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center text-blue-800 mb-2">
                    <i className="ri-shield-check-line mr-2"></i>
                    <span className="font-semibold">Vos avantages immédiats</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-blue-700">
                      <i className="ri-truck-line mr-2 text-blue-600"></i>
                      <span>Expédition DOM-TOM</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <i className="ri-refresh-line mr-2 text-green-600"></i>
                      <span>Gestion retours</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <i className="ri-calculator-line mr-2 text-purple-600"></i>
                      <span>Calculateur tarifs</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <i className="ri-customer-service-line mr-2 text-orange-600"></i>
                      <span>Support 7j/7</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-gray-600">
                    Déjà inscrit ?{' '}
                    <Link to="/connexion" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
