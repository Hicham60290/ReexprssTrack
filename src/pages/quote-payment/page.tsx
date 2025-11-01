
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';

interface QuoteData {
  id: string;
  quote_number: string;
  amount_ht: number;
  tax_rate: number;
  tax_amount: number;
  amount_ttc: number;
  payment_status: string;
  carrier_name?: string;
  carrier_price?: number;
  carrier_delivery_time?: string;
  package_id: string;
  user_id: string;
  created_at: string;
  carrier_options?: any[];
}

interface PackageData {
  id: string;
  tracking_number: string;
  description: string;
  weight: number;
  sender_name: string;
  status: string;
}

interface CarrierOption {
  id: string;
  name: string;
  price: number;
  delivery_time: string;
  description: string;
  icon: string;
  color: string;
}

export default function QuotePaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierOption | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [carriers, setCarriers] = useState<any[]>([]);

  const quoteId = searchParams.get('id');
  const trackingNumber = searchParams.get('tracking');

  // Options de transporteurs (comme dans le dashboard)
  const carrierOptions: CarrierOption[] = [
    {
      id: 'colissimo',
      name: 'Colissimo',
      price: 12.5,
      delivery_time: '3-5 jours',
      description: 'Service standard de La Poste',
      icon: 'ri-mail-line',
      color: 'blue'
    },
    {
      id: 'chronopost',
      name: 'Chronopost',
      price: 18.9,
      delivery_time: '1-2 jours',
      description: 'Livraison express garantie',
      icon: 'ri-time-line',
      color: 'orange'
    },
    {
      id: 'ups',
      name: 'UPS Standard',
      price: 22,
      delivery_time: '2-4 jours',
      description: 'Service international fiable',
      icon: 'ri-truck-line',
      color: 'yellow'
    },
    {
      id: 'dhl',
      name: 'DHL Express',
      price: 28.5,
      delivery_time: '1-3 jours',
      description: 'Livraison express internationale',
      icon: 'ri-flight-takeoff-line',
      color: 'red'
    }
  ];

  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId && !trackingNumber) {
        setError('Aucun identifiant fourni');
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/connexion');
          return;
        }

        let quote = null;

        // Recherche par ID de devis (prioritaire)
        if (quoteId) {
          const { data: quoteById, error: quoteError } = await supabase
            .from('quotes')
            .select(`
              *,
              packages (
                id,
                tracking_number,
                description,
                weight,
                dimensions,
                status,
                sender_name,
                photos:package_photos(photo_url)
              )
            `)
            .eq('id', quoteId)
            .eq('user_id', session.user.id)
            .single();

          if (quoteError) {
            console.error('Erreur lors de la récupération du devis:', quoteError);
            setError('Devis non trouvé');
            setLoading(false);
            return;
          }

          quote = quoteById;
          // ✅ Définir correctement les données du colis
          if (quote?.packages) {
            setPackageData(Array.isArray(quote.packages) ? quote.packages[0] : quote.packages);
          }
        }

        // Recherche par numéro de suivi (fallback)
        if (!quote && trackingNumber) {
          const { data: quoteByPackage, error: packageError } = await supabase
            .from('quotes')
            .select(`
              *,
              packages!inner (
                id,
                tracking_number,
                description,
                weight,
                dimensions,
                status,
                sender_name,
                photos:package_photos(photo_url)
              )
            `)
            .eq('packages.tracking_number', trackingNumber)
            .eq('user_id', session.user.id)
            .single();

          if (packageError) {
            console.log('Aucun devis trouvé pour ce numéro de suivi, génération automatique...');
            
            // Génération automatique du devis
            const token = session?.access_token;
            const response = await fetch(
              `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/generate-quote-with-carriers`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tracking_number: trackingNumber })
              }
            );

            if (!response.ok) {
              throw new Error('Impossible de générer le devis');
            }

            const result = await response.json();
            if (!result?.quote_id) {
              throw new Error('Devis non généré');
            }

            // ✅ Redirection vers l'URL canonique après génération
            navigate(`/quote-payment?id=${result.quote_id}`, { replace: true });
            return;
          }

          quote = quoteByPackage;
          // ✅ Définir correctement les données du colis
          if (quote?.packages) {
            setPackageData(Array.isArray(quote.packages) ? quote.packages[0] : quote.packages);
          }

          // ✅ Normalisation d'URL : on remplace ?tracking=... par ?id=...
          if (trackingNumber && quote?.id) {
            navigate(`/quote-payment?id=${quote.id}`, { replace: true });
            return;
          }
        }

        if (!quote) {
          setError('Devis non trouvé');
          setLoading(false);
          return;
        }

        setQuoteData(quote);

        // Récupération des options de transporteurs
        const { data: carriersData, error: carriersError } = await supabase
          .from('quote_items')
          .select('*')
          .eq('quote_id', quote.id);

        if (carriersError) {
          console.error('Erreur lors de la récupération des transporteurs:', carriersError);
        } else {
          setCarriers(carriersData || []);
        }

      } catch (error: any) {
        console.error('Erreur lors du chargement:', error);
        setError(error.message || 'Erreur lors du chargement du devis');
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId, trackingNumber, navigate]);

  const handleCarrierSelection = (carrier: CarrierOption) => {
    setSelectedCarrier(carrier);
    setErrorMessage('');
  };

  const handlePayment = async () => {
    if (!selectedCarrier || !quoteData) {
      setErrorMessage('Veuillez sélectionner un transporteur');
      return;
    }

    setPaymentLoading(true);
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée');
      }

      console.log('🔵 FRONTEND: Création du paiement...');
      console.log('🔵 FRONTEND: Quote ID:', quoteData.id);
      console.log('🔵 FRONTEND: Carrier:', selectedCarrier);

      // Calculer les montants corrects
      const baseAmount = parseFloat(quoteData.amount_ht.toString()) || 0;
      const carrierPrice = parseFloat(selectedCarrier.price.toString());
      const totalHT = baseAmount + carrierPrice;
      const tva = totalHT * 0.20;
      const totalTTC = totalHT + tva;

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/create-quote-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            quoteId: quoteData.id, // ✅ Utiliser quoteId au lieu de quote_id
            carrier_name: selectedCarrier.name,
            carrier_price: carrierPrice,
            carrier_delivery_time: selectedCarrier.delivery_time,
            amount_ht: totalHT,
            amount_ttc: totalTTC,
            tva_amount: tva
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('🔴 FRONTEND: Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création du paiement');
      }

      const data = await response.json();
      console.log('🔵 FRONTEND: Données reçues:', data);

      // ✅ Anti-régression : compatibilité avec les deux formats
      const payUrl = data.url ?? data.payment_url;
      if (!payUrl) {
        throw new Error('URL de paiement manquante');
      }
      
      console.log('🔵 FRONTEND: Redirection vers Stripe...');
      window.location.href = payUrl;

    } catch (error: any) {
      console.error('🔴 FRONTEND: Erreur paiement:', error?.message || 'Erreur inconnue');
      setErrorMessage(`Erreur lors du paiement: ${error?.message || 'Une erreur est survenue'}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !quoteData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <i className="ri-error-warning-line text-4xl text-red-600 mb-4"></i>
            <h1 className="text-2xl font-bold text-red-900 mb-2">Erreur</h1>
            <p className="text-red-700">{errorMessage}</p>
            <div className="flex gap-4 justify-center mt-4">
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline"
              >
                Retour au dashboard
              </Button>
              <Button 
                onClick={() => navigate('/packages')} 
              >
                Voir mes colis
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Devis introuvable</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Retour au dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculer les totaux avec le transporteur sélectionné
  const baseAmount = parseFloat(quoteData.amount_ht.toString()) || 0;
  const carrierPrice = selectedCarrier ? parseFloat(selectedCarrier.price.toString()) : 0;
  const totalHT = baseAmount + carrierPrice;
  const tva = totalHT * 0.20;
  const totalTTC = totalHT + tva;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages d'erreur */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-800 font-medium">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-600 hover:text-red-800"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        )}

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choisir votre transporteur
          </h1>
          <p className="text-gray-600">
            Devis N° {quoteData.quote_number}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Créé le {new Date(quoteData.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Détails du colis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations du colis */}
            {packageData && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <i className="ri-package-line mr-2 text-blue-600"></i>
                  Informations du colis
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Numéro de suivi:</span>
                    <span className="font-medium font-mono">{packageData.tracking_number}</span>
                  </div>
                  {packageData.sender_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expéditeur:</span>
                      <span className="font-medium">{packageData.sender_name}</span>
                    </div>
                  )}
                  {packageData.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium">{packageData.description}</span>
                    </div>
                  )}
                  {packageData.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Poids:</span>
                      <span className="font-medium">{packageData.weight} kg</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      packageData.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      packageData.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      packageData.status === 'received' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {packageData.status === 'delivered' ? 'Livré' :
                       packageData.status === 'shipped' ? 'Expédié' :
                       packageData.status === 'received' ? 'Reçu' :
                       packageData.status === 'stored' ? 'Stocké' :
                       packageData.status}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Sélection du transporteur */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <i className="ri-truck-line mr-2 text-blue-600"></i>
                Choisir votre transporteur
              </h2>
              
              {quoteData.carrier_name && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <i className="ri-information-line mr-1"></i>
                    Transporteur actuel : <strong>{quoteData.carrier_name}</strong> 
                    ({quoteData.carrier_delivery_time}) - {parseFloat(quoteData.carrier_price?.toString() || '0').toFixed(2)}€
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Vous pouvez changer de transporteur ci-dessous.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {carrierOptions.map((carrier) => {
                  const isSelected = selectedCarrier?.id === carrier.id;
                  const isCurrentCarrier = quoteData.carrier_name === carrier.name;
                  
                  return (
                    <div
                      key={carrier.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : isCurrentCarrier
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => handleCarrierSelection(carrier)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                            carrier.color === 'blue' ? 'bg-blue-500' :
                            carrier.color === 'orange' ? 'bg-orange-500' :
                            carrier.color === 'yellow' ? 'bg-yellow-500' :
                            carrier.color === 'red' ? 'bg-red-500' : 'bg-gray-500'
                          }`}>
                            <i className={`${carrier.icon} text-white`}></i>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {carrier.name}
                              {isCurrentCarrier && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Actuel
                                </span>
                              )}
                              {isSelected && !isCurrentCarrier && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Sélectionné
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600 text-sm">{carrier.description}</p>
                            <p className="text-blue-600 text-sm font-medium">{carrier.delivery_time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            +{carrier.price.toFixed(2)} €
                          </div>
                          <div className="text-sm text-gray-500">Frais transport</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Récapitulatif et paiement */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <i className="ri-calculator-line mr-2 text-blue-600"></i>
                Récapitulatif
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de base (HT):</span>
                  <span>{baseAmount.toFixed(2)} €</span>
                </div>
                {selectedCarrier && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transport ({selectedCarrier.name}):</span>
                    <span>+{carrierPrice.toFixed(2)} €</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total HT:</span>
                    <span>{totalHT.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (20%):</span>
                    <span>{tva.toFixed(2)} €</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Total TTC:</span>
                    <span>{totalTTC.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={paymentLoading || !selectedCarrier}
                className="w-full mt-6"
                size="lg"
              >
                <i className={`ri-${paymentLoading ? 'loader-4-line animate-spin' : 'secure-payment-line'} mr-2`}></i>
                {paymentLoading ? 'Redirection...' : `Payer ${totalTTC.toFixed(2)} € TTC`}
              </Button>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <i className="ri-shield-check-line text-green-600"></i>
                  <span>Paiement sécurisé par Stripe</span>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-2">
                  <i className="ri-visa-line text-2xl text-blue-600"></i>
                  <i className="ri-mastercard-line text-2xl text-red-600"></i>
                  <i className="ri-paypal-line text-2xl text-blue-500"></i>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className="ri-information-line mr-2 text-blue-600"></i>
                Informations importantes
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <i className="ri-check-line text-green-600 mr-2 mt-0.5"></i>
                  Votre colis sera expédié sous 48h après paiement
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-600 mr-2 mt-0.5"></i>
                  Vous recevrez un numéro de suivi par email
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-600 mr-2 mt-0.5"></i>
                  Assurance incluse jusqu'à la valeur déclarée
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-600 mr-2 mt-0.5"></i>
                  Support client disponible 7j/7
                </li>
              </ul>
            </Card>

            {/* Bouton retour */}
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Retour au dashboard
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
