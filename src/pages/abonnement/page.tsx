
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { supabase } from '../../lib/supabase';

interface SubscriptionHistory {
  id: string;
  amount_paid: number;
  currency: string;
  paid_at: string;
  status: string;
  stripe_invoice_id: string;
}

export default function Abonnement() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingSubscription, setProcessingSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    getProfile();
    getSubscriptionHistory();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Recherche du profil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          setProfile(profile);
          return;
        }

        // Si le profil n'existe pas, utiliser la fonction Edge pour le créer
        console.log('Profil non trouvé, création via fonction Edge...');
        
        const { data: createResult, error: createError } = await supabase.functions.invoke('create-user-profile', {
          body: {
            userId: user.id,
            userData: {
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              phone: user.phone || '',
              email: user.email,
              company: '',
              address: '',
              postal_code: '',
              city: '',
              territory: '',
              accept_marketing: false
            }
          }
        });

        if (createError) {
          console.error('Erreur fonction create-user-profile:', createError);
          throw new Error('Impossible de créer votre profil utilisateur');
        }

        if (createResult?.success && createResult?.profile) {
          setProfile(createResult.profile);
          console.log('Profil créé avec succès via fonction Edge');
          return;
        }

        // Si la fonction Edge échoue, essayer la création directe
        console.log('Fallback: création directe du profil...');
        
        const profileData = {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.phone || '',
          company: '',
          address: '',
          postal_code: '',
          city: '',
          territory: '',
          subscription_type: 'free',
          subscription_status: 'inactive',
          role: 'client',
          accept_marketing: false,
          kyc_status: 'pending',
          free_storage_days: 3,
          deletion_requested: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: directProfile, error: directError } = await supabase
          .from('profiles')
          .upsert(profileData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (directError) {
          console.error('Erreur création directe:', directError);
          
          // Dernière tentative: récupérer le profil s'il a été créé par ailleurs
          const { data: finalProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (finalProfile) {
            setProfile(finalProfile);
            console.log('Profil récupéré après création parallèle');
            return;
          }
          
          throw new Error('Impossible de créer votre profil utilisateur');
        }

        setProfile(directProfile);
        console.log('Profil créé directement avec succès');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert(`Erreur: ${error.message || 'Impossible de charger votre profil. Veuillez rafraîchir la page.'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: history } = await supabase
          .from('subscription_history')
          .select('*')
          .eq('user_id', user.id)
          .order('paid_at', { ascending: false })
          .limit(10);
        
        setSubscriptionHistory(history || []);
      }
    } catch (error) {
      console.error('Error fetching subscription history:', error);
    }
  };

  const createStripeSubscription = async (priceId: string, subscriptionType: string) => {
    // Vérification d'authentification renforcée
    if (!user) {
      alert('Veuillez vous connecter pour souscrire un abonnement');
      window.location.href = '/connexion?redirect=/abonnement';
      return;
    }
    
    // Attendre que le profil soit chargé si nécessaire
    if (!profile && !loading) {
      alert('Chargement de votre profil en cours...');
      await getProfile();
      
      // Vérifier à nouveau après le rechargement
      if (!profile) {
        alert('Impossible de charger votre profil. Veuillez rafraîchir la page et réessayer.');
        return;
      }
    }

    // Vérification email confirmé
    if (!user.email_confirmed_at) {
      alert('Veuillez confirmer votre email avant de vous abonner. Vérifiez vos emails.');
      return;
    }
    
    setProcessingSubscription(true);
    
    try {
      console.log('🚀 Début création abonnement:', { 
        priceId, 
        subscriptionType, 
        userId: user.id,
        userEmail: user.email,
        profileExists: !!profile 
      });
      
      // Préparation des données utilisateur complètes avec données de profil
      const profileName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '';
      const userName = profileName || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'Utilisateur';

      const subscriptionData = {
        priceId: priceId,
        userId: user.id,
        userEmail: user.email,
        userName: userName,
        subscriptionType: subscriptionType,
        // Données supplémentaires pour améliorer la reconnaissance
        userMetadata: {
          profile_id: profile?.id || user.id,
          email_confirmed: !!user.email_confirmed_at,
          created_at: user.created_at,
          phone: profile?.phone || user.phone || '',
          profile_exists: !!profile
        }
      };

      console.log('📋 Données envoyées à Stripe:', {
        ...subscriptionData,
        userEmail: '[PROTECTED]',
        userId: '[PROTECTED]'
      });

      const { data, error } = await supabase.functions.invoke('create-stripe-subscription', {
        body: subscriptionData
      });

      console.log('📨 Réponse reçue:', { success: data?.success, error });

      if (error) {
        console.error('❌ Erreur fonction Supabase:', error);
        
        // Messages d'erreur spécifiques
        if (error.message?.includes('Configuration')) {
          throw new Error('Service temporairement indisponible. Réessayez dans quelques minutes.');
        } else if (error.message?.includes('abonnement actif')) {
          throw new Error('Vous avez déjà un abonnement actif. Rendez-vous dans votre dashboard.');
        } else if (error.message?.includes('Utilisateur non trouvé') || error.message?.includes('Profil utilisateur')) {
          // Forcer la recréation du profil
          await getProfile();
          throw new Error('Profil mis à jour. Veuillez réessayer votre abonnement.');
        } else {
          throw new Error(`Erreur: ${error.message}`);
        }
      }

      if (!data?.success) {
        console.error('❌ Échec création abonnement:', data);
        throw new Error(data?.error || 'Erreur lors de la création de l\'abonnement');
      }

      if (!data.url) {
        console.error('❌ URL de paiement manquante:', data);
        throw new Error('URL de paiement non générée. Contactez le support.');
      }

      console.log('✅ Redirection vers Stripe Checkout:', data.url);
      
      // Sauvegarde de l'état avant redirection
      localStorage.setItem('subscription_attempt', JSON.stringify({
        timestamp: new Date().toISOString(),
        priceId,
        subscriptionType,
        sessionId: data.sessionId
      }));

      // Redirection sécurisée
      window.location.href = data.url;
      
    } catch (error) {
      console.error('💥 Erreur complète:', error);
      
      let errorMessage = 'Erreur lors de la création de l\'abonnement.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage + '\n\nSi le problème persiste, contactez-nous.');
      
    } finally {
      setProcessingSubscription(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) return;
    
    try {
      // Ici vous pouvez ajouter la logique pour annuler l'abonnement via Stripe
      // Pour l'instant, on met juste à jour le statut local
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'cancelled',
          subscription_type: 'free'
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await getProfile();
      alert('Votre abonnement a été annulé avec succès.');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Erreur lors de l\'annulation. Veuillez réessayer.');
    }
  };

  const calculateSavings = () => {
    // Calcul basé sur une estimation de 3-5 colis par mois
    const averageShippingCost = 12; // €
    const averagePackagesPerMonth = 4;
    const discount = 0.20; // 20%
    const subscriptionCost = profile?.subscription_type === 'premium_monthly' ? 2.5 : (20 / 12);
    
    const monthlySavings = Math.round((averageShippingCost * averagePackagesPerMonth * discount) - subscriptionCost);
    return Math.max(monthlySavings, 0);
  };

  const getNextBillingDate = () => {
    if (!profile?.subscription_expires_at) return 'Non défini';
    return new Date(profile.subscription_expires_at).toLocaleDateString('fr-FR');
  };

  const formatAmount = (amountInCents: number, currency: string = 'eur') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amountInCents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de ton espace...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isSubscribed = profile?.subscription_status === 'active' && profile?.subscription_type !== 'free';
  const isPremiumMonthly = profile?.subscription_type === 'premium_monthly';
  const isPremiumYearly = profile?.subscription_type === 'premium_yearly';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête moderne */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold mb-4">
            <span className="mr-2">💎</span>
            Ton abonnement premium
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
              Level Up
            </span>
            <span className="text-gray-900"> Ton Shipping 🚀</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Économise gros et profite d'avantages exclusifs avec nos plans premium
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statut actuel avec design Gen Z */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                  isSubscribed ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/10'
                } group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">
                    {isSubscribed ? '👑' : '🎯'}
                  </span>
                </div>
                
                <h2 className="text-2xl font-black mb-4">
                  {isPremiumMonthly ? '👑 Premium Mensuel' : 
                   isPremiumYearly ? '💎 Premium Annuel' : 
                   '🆓 Compte Gratuit'}
                </h2>
                
                <div className="text-3xl font-black mb-6">
                  {isPremiumMonthly ? '2,50€/mois' : 
                   isPremiumYearly ? '20€/an' : 
                   'Free Forever'}
                </div>

                {isSubscribed && (
                  <>
                    <div className={`inline-flex px-4 py-2 text-sm font-bold rounded-full mb-6 ${
                      profile?.subscription_status === 'active' ? 'bg-green-400/20 text-green-100 border border-green-400/30' : 
                      profile?.subscription_status === 'past_due' ? 'bg-yellow-400/20 text-yellow-100 border border-yellow-400/30' :
                      'bg-red-400/20 text-red-100 border border-red-400/30'
                    }`}>
                      <span className="mr-2">
                        {profile?.subscription_status === 'active' ? '✅' : 
                         profile?.subscription_status === 'past_due' ? '⚠️' : '❌'}
                      </span>
                      {profile?.subscription_status === 'active' ? 'Actif & OK' : 
                       profile?.subscription_status === 'past_due' ? 'En retard' :
                       'Inactif'}
                    </div>
                    <p className="text-purple-100">
                      <span className="mr-2">📅</span>Renouvellement le {getNextBillingDate()}
                    </p>
                  </>
                )}

                {!isSubscribed && (
                  <p className="text-purple-100 mb-6">
                    <span className="mr-2">⬆️</span>Upgrade pour des tarifs de fou !
                  </p>
                )}
              </div>
            </Card>

            {/* Avantages avec style moderne */}
            <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-black text-gray-900 mb-6 text-lg flex items-center">
                <span className="mr-2">🎁</span>Tes avantages
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: '📍', text: 'Adresse française perso', active: true },
                  { icon: '📸', text: 'Photos de tes colis', active: true },
                  { icon: '🔍', text: 'Tracking temps réel', active: true },
                  { icon: '📦', text: `Stockage ${isPremiumYearly ? '90' : isPremiumMonthly ? '60' : '3'} jours gratuit`, active: true },
                  { icon: '💰', text: '-20% sur expéditions', active: isSubscribed, premium: true },
                  { icon: '🏆', text: 'Support prioritaire', active: isSubscribed, premium: true }
                ].map((item, index) => (
                  <li key={index} className={`flex items-center text-sm ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className={item.premium && item.active ? 'font-bold text-purple-600' : ''}>
                      {item.text}
                    </span>
                    {item.premium && item.active && <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-bold">PREMIUM</span>}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Plans disponibles avec design moderne */}
          <div className="lg:col-span-2">
            {!isSubscribed ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 mb-4">
                    <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                      Choose Your Power
                    </span> 🚀
                  </h2>
                  <p className="text-gray-600">Économise gros avec nos plans premium</p>
                </div>

                {/* Sélecteur moderne */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-1 rounded-2xl flex border-2 border-purple-200">
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`px-8 py-3 rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap font-bold ${
                        selectedPlan === 'monthly'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                          : 'text-purple-600 hover:text-purple-700 hover:bg-white/50'
                      }`}
                    >
                      <span className="mr-2">🌙</span>Mensuel
                    </button>
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`px-8 py-3 rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap font-bold relative ${
                        selectedPlan === 'yearly'
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                          : 'text-green-600 hover:text-green-700 hover:bg-white/50'
                      }`}
                    >
                      <span className="mr-2">🔥</span>Annuel
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-black animate-pulse">
                        -33%
                      </div>
                    </button>
                  </div>
                </div>

                {/* Plan card avec style Gen Z */}
                <div className="max-w-lg mx-auto">
                  <Card className={`relative border-4 overflow-hidden ${
                    selectedPlan === 'monthly' ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' : 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50'
                  }`}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className={`px-6 py-2 rounded-full text-sm font-black text-white shadow-lg ${
                        selectedPlan === 'monthly' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'
                      }`}>
                        <span className="mr-2">
                          {selectedPlan === 'monthly' ? '🔥' : '💰'}
                        </span>
                        {selectedPlan === 'monthly' ? 'Le + Populaire' : 'Max Économies'}
                      </span>
                    </div>
                    
                    <div className="p-8 pt-12">
                      <div className="text-center mb-8">
                        <div className="text-6xl mb-4">
                          {selectedPlan === 'monthly' ? '👑' : '💎'}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">
                          Premium {selectedPlan === 'monthly' ? 'Mensuel' : 'Annuel'}
                        </h3>
                        <div className={`text-5xl font-black mb-4 ${
                          selectedPlan === 'monthly' ? 'text-purple-600' : 'text-green-600'
                        }`}>
                          {selectedPlan === 'monthly' ? (
                            <>2,50€<span className="text-2xl font-normal text-gray-500">/mois</span></>
                          ) : (
                            <>20€<span className="text-2xl font-normal text-gray-500">/an</span></>
                          )}
                        </div>
                        {selectedPlan === 'yearly' && (
                          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 border-2 border-green-200">
                            <p className="text-sm font-black text-green-700">
                              <span className="mr-2">🎉</span>Soit 1,67€/mois - Tu économises 10€ !
                            </p>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-4 mb-8">
                        {[
                          { icon: '✅', text: 'Tout du forfait gratuit' },
                          { icon: '💰', text: "-20% sur TOUS les frais d'expédition", highlight: true },
                          { icon: '📦', text: `Stockage ${selectedPlan === 'monthly' ? '60' : '90'} jours gratuit` },
                          { icon: '🏆', text: 'Support prioritaire VIP' },
                          ...(selectedPlan === 'yearly' ? [
                            { icon: '🎁', text: '2 mois complètement GRATUITS', highlight: true },
                            { icon: '⚡', text: 'Réductions exclusives sur les services' }
                          ] : [])
                        ].map((item, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-xl mr-4">{item.icon}</span>
                            <span className={item.highlight ? 'font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text' : 'text-gray-700'}>
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Button 
                        className={`w-full whitespace-nowrap text-xl py-4 font-black shadow-2xl transform hover:scale-105 ${
                          selectedPlan === 'monthly' 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        }`}
                        onClick={() => createStripeSubscription(
                          selectedPlan === 'monthly' ? 'monthly_premium' : 'yearly_premium', 
                          selectedPlan === 'monthly' ? 'premium_monthly' : 'premium_yearly'
                        )}
                        disabled={processingSubscription}
                      >
                        {processingSubscription ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <span className="mr-3 text-2xl">🚀</span>
                            {`S'abonner ${selectedPlan === 'monthly' ? 'Mensuel' : 'Annuel'}`}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Section économies avec style moderne */}
                <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
                  <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">
                    <span className="mr-2">📊</span>Calcule tes économies réelles !
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { colis: '3 colis/mois', usage: 'Usage normal', economie: '~12€/mois', color: 'blue' },
                      { colis: '5 colis/mois', usage: 'Usage fréquent', economie: '~20€/mois', color: 'purple' },
                      { colis: '10 colis/mois', usage: 'Usage intensif', economie: '~40€/mois', color: 'green' }
                    ].map((item, index) => (
                      <div key={index} className={`text-center p-6 rounded-2xl bg-gradient-to-br ${
                        item.color === 'blue' ? 'from-blue-100 to-blue-200' :
                        item.color === 'purple' ? 'from-purple-100 to-purple-200' :
                        'from-green-100 to-green-200'
                      } border-2 ${
                        item.color === 'blue' ? 'border-blue-300' :
                        item.color === 'purple' ? 'border-purple-300' :
                        'border-green-300'
                      } hover:scale-105 transition-transform duration-300`}>
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-2xl font-black text-gray-900 mb-2">{item.colis}</div>
                        <div className="text-sm text-gray-600 mb-3">{item.usage}</div>
                        <div className={`text-xl font-black ${
                          item.color === 'blue' ? 'text-blue-600' :
                          item.color === 'purple' ? 'text-purple-600' :
                          'text-green-600'
                        }`}>
                          {item.economie}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-6 p-4 bg-white/50 rounded-xl">
                    <p className="text-gray-600">
                      <span className="mr-2">💡</span>
                      <strong>Pro tip :</strong> Plus tu expédies, plus tu économises ! L'abonnement se rentabilise dès le 2ème colis.
                    </p>
                  </div>
                </Card>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gérer mon abonnement
                </h2>
                
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isPremiumMonthly ? 'Premium Mensuel' : 'Premium Annuel'}
                      </h3>
                      <p className="text-gray-600">
                        {isPremiumMonthly ? 'Facturé 2,50€ chaque mois' : 'Facturé 20€ chaque année'}
                      </p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      profile?.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 
                      profile?.subscription_status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {profile?.subscription_status === 'active' ? 'Actif' : 
                       profile?.subscription_status === 'past_due' ? 'En retard' :
                       'Inactif'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="ri-calendar-line text-gray-600 mr-2"></i>
                        <span className="text-sm font-medium text-gray-700">Prochaine facturation</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {getNextBillingDate()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="ri-money-euro-circle-line text-gray-600 mr-2"></i>
                        <span className="text-sm font-medium text-gray-700">Économies ce mois</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">
                        ~{calculateSavings()}€
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="whitespace-nowrap">
                      <i className="ri-file-text-line mr-2"></i>
                      Télécharger la facture
                    </Button>
                    
                    {isPremiumMonthly && (
                      <Button 
                        variant="outline" 
                        className="whitespace-nowrap"
                        onClick={() => createStripeSubscription('yearly_premium', 'premium_yearly')}
                        disabled={processingSubscription}
                      >
                        <i className="ri-arrow-up-circle-line mr-2"></i>
                        Passer à l'annuel (2 mois gratuits)
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-300 hover:bg-red-50 whitespace-nowrap"
                      onClick={cancelSubscription}
                    >
                      <i className="ri-close-circle-line mr-2"></i>
                      Annuler l'abonnement
                    </Button>
                  </div>
                </Card>

                {/* Historique des paiements */}
                <Card className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Historique des paiements
                  </h3>
                  {subscriptionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptionHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                              payment.status === 'paid' ? 'bg-green-100' : payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <i className={`${
                                payment.status === 'paid' ? 'ri-check-line text-green-600' :
                                payment.status === 'pending' ? 'ri-time-line text-yellow-600' :
                                'ri-close-line text-red-600'
                              }`}></i>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatAmount(payment.amount_paid, payment.currency)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.paid_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mr-2 ${
                              payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'paid' ? 'Payé' :
                               payment.status === 'pending' ? 'En attente' :
                               'Échoué'}
                            </span>
                            {payment.status === 'paid' && (
                              <Button variant="outline" size="sm" className="whitespace-nowrap">
                                <i className="ri-download-line"></i>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="ri-file-list-line text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Aucun historique de paiement disponible</p>
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>

        {/* FAQ avec style Gen Z */}
        <Card className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="text-2xl font-black text-gray-900 mb-8 text-center">
            <span className="mr-2">❓</span>Questions fréquentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '🔄',
                question: 'Puis-je annuler à tout moment ?',
                answer: 'Oui, tu peux cancel quand tu veux ! Tu gardes tes avantages jusqu\'à la fin de ta période payée.'
              },
              {
                icon: '💰',
                question: 'Comment ça marche les économies ?',
                answer: 'Simple : -20% automatique sur TOUS tes frais d\'expédition vs les comptes gratuits. Ça se calcule tout seul !'
              },
              {
                icon: '⬆️',
                question: 'Puis-je changer de plan ?',
                answer: 'Tu peux upgrade de mensuel à annuel quand tu veux. Pour downgrade, c\'est à la fin de ta période annuelle.'
              },
              {
                icon: '🎯',
                question: 'Que se passe-t-il si j\'annule ?',
                answer: 'Ton compte redevient gratuit mais tu gardes ton adresse française et l\'accès à tes colis. Zero stress !'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white/70 rounded-xl p-6 hover:bg-white/90 transition-all duration-300">
                <h4 className="font-black text-gray-900 mb-3 flex items-center">
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.question}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
