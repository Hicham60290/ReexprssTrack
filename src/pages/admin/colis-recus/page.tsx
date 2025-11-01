
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Header from '../../../components/feature/Header';
import Footer from '../../../components/feature/Footer';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import { useLocation } from 'react-router-dom';

interface Package {
  id: string;
  tracking_number: string;
  user_id: string;
  sender_name: string;
  description: string;
  status: string;
  declared_value: number | null;
  actual_weight: number | null;
  actual_length: number | null;
  actual_width: number | null;
  actual_height: number | null;
  shipping_cost: number | null;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    subscription_type: string;
  } | null;
}

interface ShippingRate {
  id: string;
  zone_name: string;
  base_price: number;
  price_per_kg: number;
  subscriber_discount: number;
}

const ColisRecus: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // existing state variables
  const [actualWeight, setActualWeight] = useState('');
  const [actualLength, setActualLength] = useState('');
  const [actualWidth, setActualWidth] = useState('');
  const [actualHeight, setActualHeight] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [serviceType, setServiceType] = useState('standard');
  const [additionalFees, setAdditionalFees] = useState('');
  const [notes, setNotes] = useState('');

  const destinations = [
    { value: 'guadeloupe', label: 'Guadeloupe', basePrice: 12.90, pricePerKg: 3.20 },
    { value: 'martinique', label: 'Martinique', basePrice: 12.90, pricePerKg: 3.20 },
    { value: 'guyane', label: 'Guyane française', basePrice: 12.90, pricePerKg: 3.20 },
    { value: 'reunion', label: 'La Réunion', basePrice: 12.90, pricePerKg: 3.20 },
    { value: 'mayotte', label: 'Mayotte', basePrice: 12.90, pricePerKg: 3.20 },
    { value: 'maroc', label: 'Maroc', basePrice: 14.90, pricePerKg: 3.80 }
  ];

  const serviceTypes = [
    { value: 'standard', label: 'Standard (7-14 jours)', multiplier: 1.0 },
    { value: 'express', label: 'Express (3-5 jours)', multiplier: 1.5 },
    { value: 'premium', label: 'Premium (1-2 jours)', multiplier: 2.0 }
  ];

  // Retrieve filter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    if (filter) {
      setStatusFilter(filter);
    }
  }, [location]);

  useEffect(() => {
    fetchPackages();
  }, [statusFilter]);

  const fetchPackages = async () => {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          profiles!inner(
            first_name,
            last_name,
            email,
            subscription_type
          )
        `);

      // Apply filter based on status
      if (statusFilter === 'declared') {
        query = query.eq('status', 'declared');
      } else if (statusFilter === 'received') {
        query = query.eq('status', 'received');
      } else if (statusFilter === 'ready_to_ship') {
        query = query.eq('status', 'ready_to_ship');
      }
      // If statusFilter === 'all', no filter

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des colis:', error);
    } finally {
      setLoading(false);
    }
  };

  // existing functions
  const calculateVolumetricWeight = () => {
    if (!actualLength || !actualWidth || !actualHeight) return 0;
    return (parseFloat(actualLength) * parseFloat(actualWidth) * parseFloat(actualHeight)) / 5000;
  };

  const calculateShippingCost = () => {
    if (!actualWeight || !selectedDestination) return 0;

    const destination = destinations.find(d => d.value === selectedDestination);
    if (!destination) return 0;

    const weight = parseFloat(actualWeight);
    const volumetricWeight = calculateVolumetricWeight();
    const chargeableWeight = Math.max(weight, volumetricWeight);

    // Base price + extra weight
    let baseCost = destination.basePrice;
    if (chargeableWeight > 1) {
      baseCost += (chargeableWeight - 1) * destination.pricePerKg;
    }

    // Service multiplier
    const service = serviceTypes.find(s => s.value === serviceType);
    if (service) {
      baseCost *= service.multiplier;
    }

    // Subscriber discount
    if (selectedPackage?.profiles?.subscription_type !== 'free') {
      baseCost *= 0.85; // 15% discount
    }

    // Additional fees
    if (additionalFees) {
      baseCost += parseFloat(additionalFees);
    }

    return Math.round(baseCost * 100) / 100;
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage || !actualWeight || !selectedDestination) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setUpdating(true);
    try {
      const shippingCost = calculateShippingCost();
      const chargeableWeight = Math.max(parseFloat(actualWeight), calculateVolumetricWeight());

      const { error } = await supabase
        .from('packages')
        .update({
          actual_weight: parseFloat(actualWeight),
          actual_length: actualLength ? parseFloat(actualLength) : null,
          actual_width: actualWidth ? parseFloat(actualWidth) : null,
          actual_height: actualHeight ? parseFloat(actualHeight) : null,
          shipping_cost: shippingCost,
          status: 'ready_to_ship',
          destination: selectedDestination,
          service_type: serviceType,
          chargeable_weight: chargeableWeight,
          additional_fees: additionalFees ? parseFloat(additionalFees) : null,
          admin_notes: notes,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedPackage.id);

      if (error) throw error;

      // Send notification to client
      await supabase.functions.invoke('send-notification-email', {
        body: {
          userId: selectedPackage.user_id,
          type: 'package_ready_for_shipping',
          data: {
            trackingNumber: selectedPackage.tracking_number,
            shippingCost: shippingCost,
            destination: destinations.find(d => d.value === selectedDestination)?.label,
            serviceType: serviceTypes.find(s => s.value === serviceType)?.label,
            chargeableWeight: chargeableWeight
          }
        }
      });

      alert(`Colis traité avec succès ! Frais calculés: ${shippingCost}€`);
      setShowPricingForm(false);
      setSelectedPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du colis');
    } finally {
      setUpdating(false);
    }
  };

  const resetForm = () => {
    setActualWeight('');
    setActualLength('');
    setActualWidth('');
    setActualHeight('');
    setSelectedDestination('');
    setServiceType('standard');
    setAdditionalFees('');
    setNotes('');
  };

  const openPricingForm = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPricingForm(true);
    resetForm();
  };

  const getFilterTitle = () => {
    switch (statusFilter) {
      case 'declared': return 'Colis déclarés par les clients';
      case 'received': return "Colis reçus dans l'entrepôt";
      case 'ready_to_ship': return 'Colis prêts à expédier';
      default: return 'Tous les colis';
    }
  };

  const getFilterDescription = () => {
    switch (statusFilter) {
      case 'declared': return 'Colis déclarés par les clients en attente de réception';
      case 'received': return 'Colis reçus dans l\'entrepôt en attente de traitement';
      case 'ready_to_ship': return 'Colis traités et prêts pour l\'expédition';
      default: return "Vue d'ensemble de tous les colis du système";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'declared': return 'bg-orange-100 text-orange-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'ready_to_ship': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'declared': return 'Déclaré';
      case 'received': return 'Reçu';
      case 'ready_to_ship': return 'Prêt à expédier';
      case 'shipped': return 'Expédié';
      case 'delivered': return 'Livré';
      default: return status;
    }
  };

  const canProcessPackage = (status: string) => {
    return status === 'received';
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gestion des colis
          </h1>
          <p className="text-lg text-gray-600">
            {getFilterDescription()}
          </p>
        </div>

        {/* Filtres de statut */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Tous les colis', icon: 'ri-package-line' },
              { value: 'declared', label: 'Déclarés', icon: 'ri-file-list-line' },
              { value: 'received', label: 'Reçus', icon: 'ri-inbox-line' },
              { value: 'ready_to_ship', label: 'Prêts à expédier', icon: 'ri-truck-line' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className={`${filter.icon} mr-2`}></i>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des colis */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {getFilterTitle()}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {packages.length} colis
              </span>
              <Button size="sm" onClick={fetchPackages}>
                <i className="ri-refresh-line mr-2"></i>
                Actualiser
              </Button>
            </div>
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-inbox-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                {statusFilter === 'declared'
                  ? 'Aucun colis déclaré'
                  : statusFilter === 'received'
                  ? 'Aucun colis reçu'
                  : statusFilter === 'ready_to_ship'
                  ? 'Aucun colis prêt à expédier'
                  : 'Aucun colis trouvé'}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'declared'
                  ? 'Les colis déclarés par les clients apparaîtront ici'
                  : statusFilter === 'received'
                  ? "Les colis reçus dans l'entrepôt apparaîtront ici"
                  : statusFilter === 'ready_to_ship'
                  ? 'Les colis traités et prêts à expédier apparaîtront ici'
                  : 'Aucun colis dans le système'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro de suivi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abonnement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {pkg.tracking_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {pkg.profiles
                              ? `${pkg.profiles.first_name} ${pkg.profiles.last_name}`
                              : 'Utilisateur inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pkg.profiles?.email || 'Email non disponible'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {pkg.description}
                        </div>
                        <div className="text-sm text-gray-500">
                          De: {pkg.sender_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(pkg.status)}`}>
                          {getStatusText(pkg.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pkg.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          pkg.profiles?.subscription_type === 'free'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {pkg.profiles?.subscription_type === 'free' ? 'Gratuit' : pkg.profiles ? 'Premium' : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/admin/colis/${pkg.id}`, '_blank')}
                          >
                            <i className="ri-eye-line mr-1"></i>
                            Voir
                          </Button>
                          {canProcessPackage(pkg.status) && (
                            <Button
                              size="sm"
                              onClick={() => openPricingForm(pkg)}
                            >
                              <i className="ri-calculator-line mr-1"></i>
                              Traiter
                            </Button>
                          )}
                          {pkg.status === 'declared' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Marquer comme reçu
                                supabase
                                  .from('packages')
                                  .update({ status: 'received' })
                                  .eq('id', pkg.id)
                                  .then(() => {
                                    fetchPackages();
                                    alert('Colis marqué comme reçu !');
                                  });
                              }}
                            >
                              <i className="ri-check-line mr-1"></i>
                              Marquer reçu
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Formulaire de traitement - reste identique */}
        {showPricingForm && selectedPackage && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Traitement du colis - {selectedPackage.tracking_number}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPricingForm(false)}
              >
                <i className="ri-close-line"></i>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informations client */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Informations client</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Client:</span>
                    <p className="text-gray-900">
                      {selectedPackage.profiles
                        ? `${selectedPackage.profiles.first_name} ${selectedPackage.profiles.last_name}`
                        : 'Utilisateur inconnu'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">ID utilisateur:</span>
                    <p className="text-gray-900">{selectedPackage.user_id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{selectedPackage.profiles?.email || 'Non disponible'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Abonnement:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedPackage.profiles?.subscription_type === 'free'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedPackage.profiles?.subscription_type === 'free' ? 'Gratuit' : selectedPackage.profiles ? 'Premium' : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="text-gray-900">{selectedPackage.description}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Valeur déclarée:</span>
                    <p className="text-gray-900">{selectedPackage.declared_value ? `${selectedPackage.declared_value}€` : 'Non renseignée'}</p>
                  </div>
                </div>
              </div>

              {/* Formulaire de saisie */}
              <div className="space-y-6">
                {/* Mesures réelles */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Mesures réelles du colis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poids (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={actualWeight}
                        onChange={(e) => setActualWeight(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longueur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={actualLength}
                        onChange={(e) => setActualLength(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Largeur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={actualWidth}
                        onChange={(e) => setActualWidth(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hauteur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={actualHeight}
                        onChange={(e) => setActualHeight(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {calculateVolumetricWeight() > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <div className="flex justify-between">
                          <span>Poids volumétrique:</span>
                          <span>{calculateVolumetricWeight().toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Poids facturable:</span>
                          <span>{Math.max(parseFloat(actualWeight) || 0, calculateVolumetricWeight()).toFixed(2)} kg</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      required
                    >
                      <option value="">Sélectionnez la destination</option>
                      {destinations.map((dest) => (
                        <option key={dest.value} value={dest.value}>
                          {dest.label}
                        </option>
                      ))}
                    </select>
                    <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                {/* Type de service */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service
                  </label>
                  <div className="space-y-2">
                    {serviceTypes.map((service) => (
                      <label key={service.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="serviceType"
                          value={service.value}
                          checked={serviceType === service.value}
                          onChange={(e) => setServiceType(e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-900">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frais supplémentaires */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frais supplémentaires (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={additionalFees}
                    onChange={(e) => setAdditionalFees(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Emballage spécial, assurance supplémentaire, etc.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes internes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Observations sur le colis, état, particularités..."
                  />
                </div>
              </div>
            </div>

            {/* Calcul automatique */}
            {actualWeight && selectedDestination && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-4">
                  <i className="ri-calculator-line mr-2"></i>
                  Calcul automatique des frais
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Prix de base:</span>
                      <span className="text-green-900">{destinations.find(d => d.value === selectedDestination)?.basePrice}€</span>
                    </div>
                    {Math.max(parseFloat(actualWeight), calculateVolumetricWeight()) > 1 && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Poids supplémentaire:</span>
                        <span className="text-green-900">
                          {(Math.max(parseFloat(actualWeight), calculateVolumetricWeight()) - 1).toFixed(2)} kg × {destinations.find(d => d.value === selectedDestination)?.pricePerKg}€
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-green-700">Service {serviceTypes.find(s => s.value === serviceType)?.label}:</span>
                      <span className="text-green-900">×{serviceTypes.find(s => s.value === serviceType)?.multiplier}</span>
                    </div>
                    {selectedPackage.profiles?.subscription_type !== 'free' && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Réduction abonné:</span>
                        <span className="text-green-900">-15%</span>
                      </div>
                    )}
                    {additionalFees && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Frais supplémentaires:</span>
                        <span className="text-green-900">+{additionalFees}€</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-900">
                      {calculateShippingCost().toFixed(2)}€
                    </div>
                    <p className="text-sm text-green-700">
                      Frais total à régler par le client
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowPricingForm(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpdatePackage}
                disabled={!actualWeight || !selectedDestination || updating}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Valider et notifier le client
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ColisRecus;
