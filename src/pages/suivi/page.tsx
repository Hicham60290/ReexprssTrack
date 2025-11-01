
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface TrackingEvent {
  id: number;
  date: string;
  location: string;
  status: string;
  details?: string;
  isLatest: boolean;
}

interface TrackingResult {
  success: boolean;
  trackingNumber: string;
  carrier: string;
  status: {
    code: string;
    label: string;
    color: string;
  };
  currentLocation: string;
  estimatedDelivery: string;
  lastUpdate: string;
  events: TrackingEvent[];
  packageInfo: {
    origin: string;
    destination: string;
    service: string;
  };
  timeline: {
    created: string;
    shipped: string | null;
    transit: string | null;
    delivered: string | null;
  };
}

interface PackageWithQuote {
  id: string;
  tracking_number: string;
  quote_id?: string;
  quote_number?: string;
  status: string;
  sender_name?: string;
  weight?: number;
  declared_value?: number;
  description?: string;
}

export default function Suivi() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [packageWithQuote, setPackageWithQuote] = useState<PackageWithQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingQuote, setCheckingQuote] = useState(false);

  // Récupérer le numéro de tracking depuis l'URL
  useEffect(() => {
    const trackingFromUrl = searchParams.get('tracking');
    if (trackingFromUrl) {
      setTrackingNumber(trackingFromUrl);
      // Vérifier s'il y a un devis pour ce colis
      checkForQuote(trackingFromUrl);
    }
  }, [searchParams]);

  const checkForQuote = async (tracking: string) => {
    if (!user || !tracking) return;
    
    setCheckingQuote(true);
    try {
      console.log('🔍 Vérification devis pour tracking:', tracking);
      
      // Récupérer le colis avec son devis éventuel
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          status,
          sender_name,
          weight,
          declared_value,
          description,
          quotes!inner(
            id,
            quote_number
          )
        `)
        .eq('tracking_number', tracking)
        .eq('user_id', user.id)
        .single();

      if (packageError) {
        console.log('❌ Pas de devis trouvé pour ce colis:', packageError.message);
        setPackageWithQuote(null);
        return;
      }

      if (packageData && packageData.quotes) {
        console.log('✅ Devis trouvé pour le colis:', packageData.quotes);
        setPackageWithQuote({
          ...packageData,
          quote_id: packageData.quotes.id,
          quote_number: packageData.quotes.quote_number
        });
      } else {
        setPackageWithQuote(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du devis:', error);
      setPackageWithQuote(null);
    } finally {
      setCheckingQuote(false);
    }
  };

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return;
    
    setLoading(true);
    setError(null);
    setTrackingResult(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('track-package', {
        body: { trackingNumber: trackingNumber.trim() }
      });

      // Gestion d'erreur améliorée
      if (functionError) {
        console.error('Erreur fonction:', functionError);
        throw new Error(functionError.message || 'Erreur de communication avec le service');
      }

      if (data?.success) {
        setTrackingResult(data);
      } else {
        // Gestion des erreurs métier retournées par la fonction
        const errorMessage = data?.error || 'Numéro de suivi non trouvé';
        console.log('Erreur métier:', errorMessage);
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Erreur suivi:', err);
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Erreur lors de la recherche. Veuillez réessayer.';
      
      if (err.message?.includes('network')) {
        errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'La recherche prend trop de temps. Veuillez réessayer.';
      } else if (err.message?.includes('not found')) {
        errorMessage = 'Ce numéro de suivi n\'a pas été trouvé dans notre système.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (color: string) => {
    const colors = {
      'gray': 'bg-gray-100 text-gray-800',
      'blue': 'bg-blue-100 text-blue-800',
      'orange': 'bg-orange-100 text-orange-800',
      'green': 'bg-green-100 text-green-800',
      'red': 'bg-red-100 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'not_found': return 0;
      case 'in_transit': return 50;
      case 'pickup': return 80;
      case 'delivered': return 100;
      default: return 25;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Suivi de colis
          </h1>
          <p className="text-xl text-purple-100">
            Suivez vos colis en temps réel où qu'ils soient
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Affichage du devis si disponible */}
          {packageWithQuote && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-file-text-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Devis disponible pour ce colis
                    </h3>
                    <p className="text-green-700 text-sm">
                      Colis {packageWithQuote.tracking_number} - Devis {packageWithQuote.quote_number}
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      Choisissez votre transporteur et procédez au paiement
                    </p>
                  </div>
                </div>
                <Link to={`/quote-payment?id=${packageWithQuote.quote_id}`}>
                  <Button className="whitespace-nowrap">
                    <i className="ri-truck-line mr-2"></i>
                    Voir le devis et payer
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Entrez votre numéro de suivi
            </h2>
            
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Ex: RTK123456789, CP123456789FR, 1Z999AA1234567890"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value);
                  // Vérifier le devis quand l'utilisateur tape
                  if (user && e.target.value.length > 5) {
                    checkForQuote(e.target.value);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              
              {/* Afficher le bouton approprié selon la situation */}
              {packageWithQuote ? (
                <Link to={`/quote-payment?id=${packageWithQuote.quote_id}`}>
                  <Button className="whitespace-nowrap">
                    <i className="ri-truck-line mr-2"></i>
                    Voir le devis
                  </Button>
                </Link>
              ) : (
                <Button 
                  onClick={handleTrack}
                  disabled={!trackingNumber.trim() || loading}
                  className="whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recherche...
                    </>
                  ) : (
                    <>
                      <i className="ri-search-line mr-2"></i>
                      Suivre le colis
                    </>
                  )}
                </Button>
              )}
            </div>

            <p className="text-gray-500 text-sm mt-3 text-center">
              Compatible avec tous les transporteurs internationaux
            </p>
            
            {checkingQuote && (
              <p className="text-blue-600 text-xs mt-2 text-center">
                <i className="ri-loader-4-line animate-spin mr-1"></i>
                Vérification des devis disponibles...
              </p>
            )}
          </Card>

          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <div className="flex items-center text-red-800">
                <i className="ri-error-warning-line text-xl mr-3"></i>
                <div>
                  <p className="font-medium">Colis non trouvé</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {trackingResult && (
            <div className="space-y-6">
              {/* Statut principal */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Colis {trackingResult.trackingNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{trackingResult.carrier}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(trackingResult.status.color)}`}>
                    {trackingResult.status.label}
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Expédié</span>
                    <span>En transit</span>
                    <span>En livraison</span>
                    <span>Livré</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(trackingResult.status.code)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Position actuelle</p>
                    <p className="text-gray-900">{trackingResult.currentLocation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Livraison estimée</p>
                    <p className="text-gray-900">{trackingResult.estimatedDelivery}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Dernière mise à jour</p>
                    <p className="text-gray-900">{trackingResult.lastUpdate}</p>
                  </div>
                </div>
              </Card>

              {/* Informations du colis */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations du colis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-map-pin-line text-blue-600"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Origine</p>
                      <p className="text-gray-900">{trackingResult.packageInfo.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-flag-line text-green-600"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Destination</p>
                      <p className="text-gray-900">{trackingResult.packageInfo.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-truck-line text-purple-600"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Service</p>
                      <p className="text-gray-900">{trackingResult.packageInfo.service}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Historique détaillé */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  <i className="ri-time-line mr-2"></i>
                  Historique de suivi
                </h3>

                <div className="space-y-4">
                  {trackingResult.events.map((event, index) => (
                    <div key={event.id} className="flex items-start">
                      <div className="flex-shrink-0 relative">
                        <div className={`w-4 h-4 rounded-full mt-1 ${
                          event.isLatest ? 'bg-blue-600' : 'bg-gray-300'
                        }`}></div>
                        {index !== trackingResult.events.length - 1 && (
                          <div className="absolute top-6 left-1.5 w-0.5 h-8 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${event.isLatest ? 'text-blue-900' : 'text-gray-900'}`}>
                              {event.status}
                            </p>
                            <p className="text-gray-600 text-sm">{event.location}</p>
                            {event.details && (
                              <p className="text-gray-500 text-xs mt-1">{event.details}</p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 md:mt-0 md:ml-4">
                            {event.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions et support */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-customer-service-2-line text-xl text-blue-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Besoin d'aide avec votre colis ?
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Notre équipe support est disponible 24h/24 pour vous accompagner
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <i className="ri-mail-line mr-2"></i>
                      Contacter le support
                    </Button>
                    <Button size="sm">
                      <i className="ri-chat-3-line mr-2"></i>
                      Chat en direct
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {!trackingResult && !loading && !error && (
            <Card className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-search-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                Suivez votre colis en temps réel
              </h3>
              <p className="text-gray-600 mb-6">
                Entrez un numéro de suivi pour voir les détails de livraison
              </p>
              
              {/* Logos des transporteurs */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-4">Transporteurs compatibles :</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-2xl mx-auto">
                  {/* La Poste / Colissimo */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                      <i className="ri-mail-fill text-yellow-600 text-xl"></i>
                    </div>
                    <span className="text-xs text-gray-600">La Poste</span>
                  </div>
                  
                  {/* DHL */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                      <i className="ri-truck-fill text-red-600 text-xl"></i>
                    </div>
                    <span className="text-xs text-gray-600">DHL</span>
                  </div>
                  
                  {/* UPS */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                      <i className="ri-truck-fill text-amber-700 text-xl"></i>
                    </div>
                    <span className="text-xs text-gray-600">UPS</span>
                  </div>
                  
                  {/* FedEx */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <i className="ri-plane-fill text-purple-600 text-xl"></i>
                    </div>
                    <span className="text-xs text-gray-600">FedEx</span>
                  </div>
                  
                  {/* Chronopost */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                      <i className="ri-time-fill text-red-600 text-xl"></i>
                    </div>
                    <span className="text-xs text-gray-600">Chronopost</span>
                  </div>
                  
                  {/* Amazon Logistics */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                      <i className="ri-amazon-fill text-orange-600 text-xl"></i>
                    </div>
                    <span className="text-xs text-gray-600">Amazon</span>
                  </div>
                </div>
                
                {/* Transporteurs supplémentaires */}
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 max-w-3xl mx-auto mt-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-ship-fill text-blue-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">TNT</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-truck-fill text-blue-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">GLS</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-store-fill text-green-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">Mondial</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-plane-fill text-indigo-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">USPS</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-mail-fill text-pink-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">Royal Mail</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-truck-fill text-teal-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">DPD</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-ship-fill text-cyan-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">China Post</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                      <i className="ri-more-fill text-gray-600"></i>
                    </div>
                    <span className="text-xs text-gray-500">+200</span>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                Compatible avec plus de 200 transporteurs dans le monde entier
              </p>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
