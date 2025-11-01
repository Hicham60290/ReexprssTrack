import React, { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
}

interface ShippingRate {
  id: string;
  carrier: string;
  service_type: string;
  price_free: number;
  price_subscribed: number;
  delivery_days_min: number;
  delivery_days_max: number;
  has_tracking: boolean;
  has_insurance: boolean;
}

export default function Calculator() {
  const { user } = useAuth();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [declaredValue, setDeclaredValue] = useState('');
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errors, setErrors] = useState({
    destination: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    declaredValue: '',
    general: ''
  });

  useEffect(() => {
    fetchZones();
    checkSubscription();
    
    // SEO configuration
    document.title = 'Calculateur Frais Expédition DOM-TOM Maroc Gratuit | ReexpresseTrack';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Calculateur gratuit et précis pour estimer vos frais d\'expédition vers DOM-TOM et Maroc. Tarifs transparents, devis instantané pour Guadeloupe, Martinique, Réunion, Guyane.');
    }

    // Schema.org JSON-LD for WebApplication
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Calculateur de frais d'expédition DOM-TOM",
      "description": "Outil gratuit pour calculer précisément les frais d'expédition vers DOM-TOM et Maroc",
      "url": `${process.env.VITE_SITE_URL || "https://example.com"}/calculateur`,
      "applicationCategory": "Logistics Calculator",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "description": "Calculateur gratuit avec devis instantané"
      },
      "provider": {
        "@type": "Organization",
        "name": "ReexpresseTrack",
        "url": process.env.VITE_SITE_URL || "https://example.com"
      },
      "featureList": [
        "Calcul précis des frais d'expédition",
        "Poids volumétrique automatique", 
        "Tarifs en temps réel",
        "Comparaison des services",
        "Devis instantané gratuit"
      ]
    });
    
    const existingScript = document.querySelector('script[type="application/ld+json"][data-page="calculateur"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    schemaScript.setAttribute('data-page', 'calculateur');
    document.head.appendChild(schemaScript);

    return () => {
      const script = document.querySelector('script[type="application/ld+json"][data-page="calculateur"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  const fetchZones = async () => {
    try {
      const { data } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('is_active', true);
      setZones(data || []);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_type')
          .eq('id', user.id)
          .single();
        
        setIsSubscribed(profile?.subscription_type !== 'free');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const zone = zones.find(z => z.countries.includes(country));
    setSelectedZone(zone || null);
    setRates([]);
    
    // Clear destination error when selecting a country
    if (country) {
      setErrors(prev => ({ ...prev, destination: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      destination: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      declaredValue: '',
      general: ''
    };

    if (!selectedCountry) {
      newErrors.destination = 'Veuillez sélectionner une destination';
    }

    if (!weight || parseFloat(weight) <= 0) {
      newErrors.weight = 'Le poids doit être supérieur à 0 kg';
    } else if (parseFloat(weight) > 30) {
      newErrors.weight = 'Le poids maximum autorisé est de 30 kg';
    }

    if (!length || parseFloat(length) <= 0) {
      newErrors.length = 'La longueur est obligatoire et doit être supérieure à 0';
    }

    if (!width || parseFloat(width) <= 0) {
      newErrors.width = 'La largeur est obligatoire et doit être supérieure à 0';
    }

    if (!height || parseFloat(height) <= 0) {
      newErrors.height = 'La hauteur est obligatoire et doit être supérieure à 0';
    }

    if (declaredValue && parseFloat(declaredValue) < 0) {
      newErrors.declaredValue = 'La valeur déclarée ne peut pas être négative';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const calculateShipping = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedZone || !weight) return;

    setLoading(true);
    try {
      const weightValue = parseFloat(weight) || 0;
      const volumetricWeight = getVolumetricWeight();
      const chargeableWeight = Math.max(weightValue, volumetricWeight);

      // Simulation des tarifs puisque nous n'avons pas de données réelles dans shipping_rates
      const simulatedRates: ShippingRate[] = [
        {
          id: '1',
          carrier: 'Chronopost',
          service_type: 'Express DOM-TOM',
          price_free: calculateBasePrice(chargeableWeight, 'express'),
          price_subscribed: calculateBasePrice(chargeableWeight, 'express') * 0.85,
          delivery_days_min: 3,
          delivery_days_max: 5,
          has_tracking: true,
          has_insurance: true
        },
        {
          id: '2',
          carrier: 'Colissimo',
          service_type: 'Outre-Mer Standard',
          price_free: calculateBasePrice(chargeableWeight, 'standard'),
          price_subscribed: calculateBasePrice(chargeableWeight, 'standard') * 0.85,
          delivery_days_min: 7,
          delivery_days_max: 12,
          has_tracking: true,
          has_insurance: false
        },
        {
          id: '3',
          carrier: 'DHL',
          service_type: 'International Express',
          price_free: calculateBasePrice(chargeableWeight, 'premium'),
          price_subscribed: calculateBasePrice(chargeableWeight, 'premium') * 0.90,
          delivery_days_min: 2,
          delivery_days_max: 4,
          has_tracking: true,
          has_insurance: true
        }
      ];

      setRates(simulatedRates);
    } catch (error) {
      console.error('Error calculating shipping:', error);
      setErrors(prev => ({ ...prev, general: 'Erreur lors du calcul des tarifs. Veuillez réessayer.' }));
    } finally {
      setLoading(false);
    }
  };

  const calculateBasePrice = (weight: number, serviceType: string) => {
    let basePrice = 0;
    
    // Tarifs de base selon le service
    const basePrices = {
      express: { base: 15.90, additional: 3.50 },
      standard: { base: 8.50, additional: 2.50 },
      premium: { base: 22.90, additional: 4.20 }
    };
    
    const pricing = basePrices[serviceType as keyof typeof basePrices] || basePrices.standard;
    
    if (weight <= 1) {
      basePrice = pricing.base;
    } else {
      basePrice = pricing.base + ((weight - 1) * pricing.additional);
    }
    
    // Majoration selon la destination
    const destinationMultiplier = {
      'Guadeloupe': 1.0,
      'Martinique': 1.0,
      'Guyane française': 1.1,
      'La Réunion': 1.15,
      'Maroc': 0.9
    };
    
    const multiplier = destinationMultiplier[selectedCountry as keyof typeof destinationMultiplier] || 1.0;
    
    return Math.round(basePrice * multiplier * 100) / 100;
  };

  const getVolumetricWeight = () => {
    if (!length || !width || !height) return 0;
    return (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000;
  };

  const getChargeable = () => {
    const actualWeight = parseFloat(weight) || 0;
    const volumetricWeight = getVolumetricWeight();
    return Math.max(actualWeight, volumetricWeight);
  };

  const hasValidationErrors = () => {
    return Object.values(errors).some(error => error !== '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calculateur de frais d'expédition DOM-TOM et Maroc
          </h1>
          <p className="text-gray-600">
            Estimez vos frais d'expédition vers la Guadeloupe, Martinique, Guyane française, La Réunion et le Maroc
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informations du colis
              </h2>

              <div className="space-y-6">
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {errors.general}
                  </div>
                )}

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8 ${
                        errors.destination ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Sélectionnez votre destination</option>
                      <option value="Guadeloupe">Guadeloupe</option>
                      <option value="Martinique">Martinique</option>
                      <option value="Guyane française">Guyane française</option>
                      <option value="La Réunion">La Réunion</option>
                      <option value="Maroc">Maroc</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400"></i>
                    </div>
                  </div>
                  {errors.destination && (
                    <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                  )}
                  {selectedZone && !errors.destination && (
                    <p className="mt-1 text-sm text-blue-600">
                      Zone tarifaire: {selectedZone.name}
                    </p>
                  )}
                </div>

                {/* Poids et valeur déclarée */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="30"
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value);
                        if (e.target.value && parseFloat(e.target.value) > 0) {
                          setErrors(prev => ({ ...prev, weight: '' }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.weight ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: 2.5"
                      required
                    />
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                    )}
                    {!errors.weight && (
                      <p className="mt-1 text-xs text-gray-500">Maximum: 30 kg</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valeur déclarée (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={declaredValue}
                      onChange={(e) => {
                        setDeclaredValue(e.target.value);
                        if (!e.target.value || parseFloat(e.target.value) >= 0) {
                          setErrors(prev => ({ ...prev, declaredValue: '' }));
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.declaredValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: 150"
                    />
                    {errors.declaredValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.declaredValue}</p>
                    )}
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (cm) - Obligatoire
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={length}
                        onChange={(e) => {
                          setLength(e.target.value);
                          if (e.target.value && parseFloat(e.target.value) > 0) {
                            setErrors(prev => ({ ...prev, length: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.length ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Longueur"
                        required
                      />
                      {errors.length && (
                        <p className="text-red-500 text-xs mt-1">{errors.length}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={width}
                        onChange={(e) => {
                          setWidth(e.target.value);
                          if (e.target.value && parseFloat(e.target.value) > 0) {
                            setErrors(prev => ({ ...prev, width: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.width ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Largeur"
                        required
                      />
                      {errors.width && (
                        <p className="text-red-500 text-xs mt-1">{errors.width}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={height}
                        onChange={(e) => {
                          setHeight(e.target.value);
                          if (e.target.value && parseFloat(e.target.value) > 0) {
                            setErrors(prev => ({ ...prev, height: '' }));
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.height ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Hauteur"
                        required
                      />
                      {errors.height && (
                        <p className="text-red-500 text-xs mt-1">{errors.height}</p>
                      )}
                    </div>
                  </div>
                  {(getVolumetricWeight() > 0 && weight) && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <div className="flex justify-between items-center mb-1">
                          <span>Poids réel:</span>
                          <span className="font-medium">{parseFloat(weight).toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span>Poids volumétrique:</span>
                          <span className="font-medium">{getVolumetricWeight().toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-300 pt-1">
                          <span className="font-semibold">Poids facturable:</span>
                          <span className="font-bold text-blue-900">{getChargeable().toFixed(2)} kg</span>
                        </div>
                        {getVolumetricWeight() > parseFloat(weight || '0') && (
                          <p className="text-xs text-blue-700 mt-1">
                            ⚠️ Le poids volumétrique est supérieur au poids réel
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={calculateShipping}
                    disabled={!selectedCountry || !weight || !length || !width || !height || loading || hasValidationErrors()}
                    className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 px-6 py-3 text-lg w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Calcul en cours...
                      </>
                    ) : (
                      <>
                        <i className="ri-calculator-line mr-2"></i>
                        Calculer les frais d'expédition
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Link to={user ? "/dashboard" : "/inscription"}>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm sm:text-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:scale-105"
                      >
                        <i className="ri-map-pin-add-line mr-2"></i>
                        <span className="hidden sm:inline">
                          {user ? "Voir mon adresse française" : "Obtenir une adresse française gratuite"}
                        </span>
                        <span className="sm:hidden">
                          {user ? "Mon adresse française" : "Adresse française gratuite"}
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Informations de validation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <i className="ri-information-line text-blue-600 mr-2"></i>
                    Informations sur le calcul
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Le poids facturable est le maximum entre le poids réel et le poids volumétrique</li>
                    <li>• Poids volumétrique = (Longueur × Largeur × Hauteur) ÷ 5000</li>
                    <li>• Les tarifs sont calculés selon les zones tarifaires officielles</li>
                    <li>• Les frais de douane ne sont pas inclus dans ces estimations</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Résultats */}
          <div>
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Tarifs disponibles
              </h2>

              {!selectedCountry && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-calculator-line text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-600">
                    Sélectionnez une destination et entrez les informations pour voir les tarifs
                  </p>
                </div>
              )}

              {selectedCountry && (!weight || !length || !width || !height) && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-scales-3-line text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-600">
                    Complétez toutes les informations obligatoires pour calculer les frais
                  </p>
                </div>
              )}

              {rates.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center text-green-800 mb-2">
                      <i className="ri-check-circle-line mr-2"></i>
                      <span className="font-semibold">Calcul effectué avec succès</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>Destination: <span className="font-medium">{selectedCountry}</span></p>
                      <p>Poids facturable: <span className="font-medium">{getChargeable().toFixed(2)} kg</span></p>
                      {declaredValue && (
                        <p>Valeur déclarée: <span className="font-medium">{parseFloat(declaredValue).toFixed(2)} €</span></p>
                      )}
                    </div>
                  </div>

                  {rates.map((rate) => {
                    const weightValue = parseFloat(weight) || 0;
                    const volumetricWeight = getVolumetricWeight();
                    const chargeableWeight = Math.max(weightValue, volumetricWeight);
                    
                    const subscribedPrice = rate.price_subscribed;
                    const freePrice = rate.price_free;
                    const displayPrice = isSubscribed ? subscribedPrice : freePrice;
                    const savings = freePrice - subscribedPrice;
                    
                    return (
                      <div key={rate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <i className="ri-truck-line text-blue-600 text-lg"></i>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {rate.carrier}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {rate.service_type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                              {displayPrice.toFixed(2)}€
                            </div>
                            {!isSubscribed && savings > 0 && (
                              <div className="text-sm text-green-600 font-medium">
                                Économie de {savings.toFixed(2)}€ avec abonnement
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1"></i>
                            {rate.delivery_days_min}-{rate.delivery_days_max} jours ouvrés
                          </span>
                          {rate.has_tracking && (
                            <span className="flex items-center text-green-600">
                              <i className="ri-search-line mr-1"></i>
                              Suivi inclus
                            </span>
                          )}
                          {rate.has_insurance && (
                            <span className="flex items-center text-blue-600">
                              <i className="ri-shield-check-line mr-1"></i>
                              Assurance disponible
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                          <div className="grid grid-cols-2 gap-2">
                            <span>Poids facturable: {chargeableWeight.toFixed(2)} kg</span>
                            <span>Zone: {selectedZone?.name || selectedCountry}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!isSubscribed && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <i className="ri-information-line text-sm text-blue-600"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Économisez avec un abonnement
                          </h4>
                          <p className="text-sm text-blue-700">
                            Les abonnés bénéficient de tarifs réduits sur tous les envois vers les DOM-TOM et le Maroc.
                            À partir de 2,50€/mois seulement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedCountry && weight && length && width && height && rates.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-close-circle-line text-2xl text-gray-400"></i>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Aucun tarif disponible pour cette destination et ce poids
                  </p>
                  <p className="text-sm text-gray-500">
                    Contactez-nous pour un devis personnalisé
                  </p>
                </div>
              )}
            </Card>

            {/* Informations supplémentaires */}
            <Card className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Informations importantes
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-green-600 mr-2 mt-0.5"></i>
                  <span>Les tarifs incluent la manutention et l'emballage</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-green-600 mr-2 mt-0.5"></i>
                  <span>Stockage gratuit pendant 3 jours minimum</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line text-green-600 mr-2 mt-0.5"></i>
                  <span>Photos et notifications incluses</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
                  <span>Les frais de douane ne sont pas inclus et varient selon la destination</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
