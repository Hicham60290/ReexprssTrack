
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { Link } from 'react-router-dom';

interface Package {
  id: string;
  tracking_number: string;
  sender_name: string;
  description: string;
  status: string;
  created_at: string;
}

interface ReturnData {
  packageId: string;
  type: string;
  reason: string;
  urgency: string;
  description: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  photos: File[];
}

const GestionRetour: React.FC = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [returnData, setReturnData] = useState<ReturnData>({
    packageId: '',
    type: 'remboursement',
    reason: 'defectueux',
    urgency: 'normal',
    description: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    photos: []
  });

  useEffect(() => {
    if (user) {
      fetchEligiblePackages();
    }
  }, [user]);

  const fetchEligiblePackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', user!.id)
        .in('status', ['received', 'stored'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des colis:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateShippingCost = () => {
    const weight = parseFloat(returnData.weight) || 0;
    const length = parseFloat(returnData.length) || 0;
    const width = parseFloat(returnData.width) || 0;
    const height = parseFloat(returnData.height) || 0;
    
    if (weight === 0) return 0;
    
    // Calcul du poids volumétrique (L x l x h / 5000)
    const volumetricWeight = (length * width * height) / 5000;
    const chargeableWeight = Math.max(weight, volumetricWeight);
    
    // Tarification basée sur le poids facturable
    let baseCost = 0;
    if (chargeableWeight <= 1) {
      baseCost = 8.50; // Tarif de base jusqu'à 1kg
    } else if (chargeableWeight <= 5) {
      baseCost = 12.50; // Jusqu'à 5kg
    } else if (chargeableWeight <= 10) {
      baseCost = 18.50; // Jusqu'à 10kg
    } else {
      baseCost = 25.00 + ((chargeableWeight - 10) * 2.50); // Au-delà de 10kg
    }
    
    // Majoration selon l'urgence
    const urgencyMultiplier = {
      'faible': 0.8,
      'normal': 1.0,
      'urgent': 1.3,
      'critique': 1.6
    };
    
    return Math.round(baseCost * urgencyMultiplier[returnData.urgency as keyof typeof urgencyMultiplier] * 100) / 100;
  };

  const getVolumetricWeight = () => {
    const length = parseFloat(returnData.length) || 0;
    const width = parseFloat(returnData.width) || 0;
    const height = parseFloat(returnData.height) || 0;
    
    if (!length || !width || !height) return 0;
    return Math.round(((length * width * height) / 5000) * 100) / 100;
  };

  const handleInputChange = (field: keyof ReturnData, value: string) => {
    setReturnData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setReturnData(prev => ({ 
        ...prev, 
        photos: [...prev.photos, ...newFiles].slice(0, 5) // Max 5 photos
      }));
    }
  };

  const removePhoto = (index: number) => {
    setReturnData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const createStripePayment = async () => {
    const shippingCost = calculateShippingCost();
    if (shippingCost === 0) {
      alert('Veuillez renseigner le poids du colis pour calculer les frais');
      return;
    }

    setProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-return-payment', {
        body: {
          userId: user!.id,
          userEmail: user!.email,
          amount: Math.round(shippingCost * 100), // Montant en centimes
          returnData: returnData,
          packageId: returnData.packageId
        }
      });

      if (error) throw error;

      if (data?.success && data?.url) {
        // Redirection vers Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      alert(`Erreur lors de la création du paiement: ${error.message}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!returnData.packageId || !returnData.weight) {
      alert('Veuillez sélectionner un colis et renseigner le poids');
      return;
    }

    // Si le coût est > 0, rediriger vers le paiement Stripe
    const shippingCost = calculateShippingCost();
    if (shippingCost > 0) {
      await createStripePayment();
      return;
    }

    // Sinon, créer directement la demande de retour (cas gratuit)
    setSubmitting(true);
    try {
      const referenceNumber = `RET-${Date.now()}`;
      
      const { error } = await supabase
        .from('return_requests')
        .insert([
          {
            user_id: user!.id,
            package_id: returnData.packageId,
            reference_number: referenceNumber,
            type: returnData.type,
            reason: returnData.reason,
            urgency: returnData.urgency,
            description: returnData.description,
            weight: parseFloat(returnData.weight),
            length: parseFloat(returnData.length) || null,
            width: parseFloat(returnData.width) || null,
            height: parseFloat(returnData.height) || null,
            shipping_cost: shippingCost,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      alert(`Demande de retour créée avec succès ! Référence: ${referenceNumber}`);
      setShowReturnForm(false);
      setReturnData({
        packageId: '',
        type: 'remboursement',
        reason: 'defectueux',
        urgency: 'normal',
        description: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        photos: []
      });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gestion des retours colis
          </h1>
          <p className="text-lg text-gray-600">
            Gérez facilement vos demandes de retour, échange ou remboursement
          </p>
        </div>

        <div className="space-y-8">
          {/* Adresse de retour */}
          <Card className="hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-map-pin-line text-orange-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Adresse de retour obligatoire
              </h2>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center text-orange-800 mb-2">
                <i className="ri-alert-line mr-2"></i>
                <span className="font-semibold">Service complet</span>
              </div>
              <p className="text-orange-700">
                Nous nous occupons entièrement de la gestion de vos retours : réception, vérification, 
                et renvoi direct chez votre fournisseur. Vous n'avez qu'à nous envoyer votre colis !
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Adresse de dépôt :</h3>
              <div className="space-y-1 text-gray-700">
                <p className="font-medium">Reexpresse Track</p>
                <p>53 BIS Route de Mouy</p>
                <p>60290 Cauffry</p>
                <p>France</p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-blue-600">
                  <i className="ri-time-line mr-2"></i>
                  <span>Ouvert 24h/24</span>
                </div>
                <div className="flex items-center text-green-600">
                  <i className="ri-shield-check-line mr-2"></i>
                  <span>Sécurisé</span>
                </div>
                <div className="flex items-center text-purple-600">
                  <i className="ri-truck-line mr-2"></i>
                  <span>Suivi en temps réel</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Liste des colis éligibles */}
          <Card className="hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Mes colis éligibles au retour
              </h2>
              <span className="text-sm text-gray-500">
                {packages.length} colis disponible{packages.length > 1 ? 's' : ''}
              </span>
            </div>

            {packages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-inbox-line text-2xl text-gray-400"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Aucun colis éligible</h3>
                <p className="text-gray-600 mb-4">
                  Vous n'avez actuellement aucun colis pouvant faire l'objet d'un retour
                </p>
                <Link to="/dashboard">
                  <Button variant="outline">
                    Retour au tableau de bord
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <i className="ri-package-line text-blue-600"></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pkg.tracking_number}</p>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                          <p className="text-xs text-gray-500">
                            Reçu le {new Date(pkg.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setReturnData(prev => ({ ...prev, packageId: pkg.id }));
                          setShowReturnForm(true);
                        }}
                      >
                        <i className="ri-return-line mr-2"></i>
                        Demander un retour
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Formulaire de retour */}
          {showReturnForm && (
            <Card className="hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Nouvelle demande de retour
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowReturnForm(false)}
                >
                  <i className="ri-close-line"></i>
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de retour */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Type de demande *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'remboursement', label: 'Remboursement', icon: 'ri-refund-line', color: 'blue' },
                      { value: 'echange', label: 'Échange', icon: 'ri-exchange-line', color: 'green' },
                      { value: 'reparation', label: 'Réparation', icon: 'ri-tools-line', color: 'orange' }
                    ].map((type) => (
                      <label key={type.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={returnData.type === type.value}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border-2 rounded-lg p-4 text-center transition-all ${
                          returnData.type === type.value
                            ? `border-${type.color}-500 bg-${type.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <i className={`${type.icon} text-2xl text-${type.color}-600 mb-2`}></i>
                          <p className="font-medium text-gray-900">{type.label}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Raison */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison du retour *
                  </label>
                  <div className="relative">
                    <select
                      value={returnData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="defectueux">Produit défectueux</option>
                      <option value="mauvais_article">Mauvais article reçu</option>
                      <option value="endommage">Endommagé pendant le transport</option>
                      <option value="non_conforme">Non conforme à la description</option>
                      <option value="changement_avis">Changement d'avis</option>
                      <option value="autre">Autre raison</option>
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Urgence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Niveau d'urgence
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'faible', label: 'Faible', color: 'gray', discount: '-20%' },
                      { value: 'normal', label: 'Normal', color: 'blue', discount: 'Tarif normal' },
                      { value: 'urgent', label: 'Urgent', color: 'orange', discount: '+30%' },
                      { value: 'critique', label: 'Critique', color: 'red', discount: '+60%' }
                    ].map((urgency) => (
                      <label key={urgency.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency.value}
                          checked={returnData.urgency === urgency.value}
                          onChange={(e) => handleInputChange('urgency', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`border-2 rounded-lg p-3 text-center transition-all ${
                          returnData.urgency === urgency.value
                            ? `border-${urgency.color}-500 bg-${urgency.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <p className="font-medium text-gray-900 text-sm">{urgency.label}</p>
                          <p className="text-xs text-gray-600">{urgency.discount}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dimensions et poids */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Dimensions et poids du colis de retour
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Poids (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={returnData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="1.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Longueur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={returnData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Largeur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={returnData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Hauteur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={returnData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="10"
                      />
                    </div>
                  </div>
                  
                  {/* Calcul automatique des frais */}
                  {returnData.weight && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        <i className="ri-calculator-line mr-2"></i>
                        Calcul automatique des frais
                      </h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex justify-between">
                          <span>Poids réel:</span>
                          <span>{returnData.weight} kg</span>
                        </div>
                        {getVolumetricWeight() > 0 && (
                          <div className="flex justify-between">
                            <span>Poids volumétrique:</span>
                            <span>{getVolumetricWeight()} kg</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Poids facturable:</span>
                          <span>{Math.max(parseFloat(returnData.weight) || 0, getVolumetricWeight())} kg</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base border-t border-blue-300 pt-2">
                          <span>Frais d'expédition:</span>
                          <span>{calculateShippingCost().toFixed(2)}€</span>
                        </div>
                        {returnData.urgency !== 'normal' && (
                          <p className="text-xs text-blue-700">
                            {returnData.urgency === 'faible' ? 'Réduction de 20% appliquée' :
                             returnData.urgency === 'urgent' ? 'Majoration de 30% appliquée' :
                             'Majoration de 60% appliquée'} pour le niveau d'urgence
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description détaillée
                  </label>
                  <textarea
                    value={returnData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Décrivez précisément le problème rencontré, l'état du produit, etc."
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {returnData.description.length}/500 caractères
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (optionnel, max 5)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                      disabled={returnData.photos.length >= 5}
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <i className="ri-image-add-line text-3xl text-gray-400 mb-2"></i>
                      <p className="text-gray-600">
                        Cliquez pour ajouter des photos
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG jusqu'à 5MB chacune
                      </p>
                    </label>
                  </div>
                  
                  {returnData.photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                      {returnData.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 cursor-pointer whitespace-nowrap"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Boutons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowReturnForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!returnData.packageId || !returnData.weight || submitting || processingPayment}
                    className="min-w-[200px]"
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Redirection paiement...
                      </>
                    ) : submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-line mr-2"></i>
                        {calculateShippingCost() > 0 ? 
                          `Payer ${calculateShippingCost().toFixed(2)}€ et créer` : 
                          'Créer la demande gratuite'
                        }
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Informations importantes */}
          <Card className="hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informations importantes
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-information-line text-blue-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Délais de retour</p>
                  <p className="text-gray-600 text-sm">
                    Vous disposez de 14 jours pour initier une demande de retour après réception de votre colis.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-shield-check-line text-green-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Gestion complète par nos soins</p>
                  <p className="text-gray-600 text-sm">
                    Nous nous occupons de toutes les démarches : réception de votre colis, 
                    vérification, et renvoi direct chez le fournisseur concerné.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-time-line text-purple-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Traitement</p>
                  <p className="text-gray-600 text-sm">
                    Une fois votre colis de retour reçu, nous le traitons sous 2-3 jours ouvrés.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-money-euro-circle-line text-orange-600"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Paiement sécurisé</p>
                  <p className="text-gray-600 text-sm">
                    Le paiement des frais d'expédition se fait via Stripe pour une sécurité maximale.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GestionRetour;
