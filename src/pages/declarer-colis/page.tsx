import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { Link } from 'react-router-dom';

interface PackageData {
  expediteur: string;
  telephone: string;
  email: string;
  transporteur: string;
  numeroSuivi: string;
  description: string;
  categorie: string;
  poids: string;
  longueur: string;
  largeur: string;
  hauteur: string;
  valeur: string;
  instructions: string;
}

const DeclarerColis: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [packageData, setPackageData] = useState<PackageData>({
    expediteur: '',
    telephone: '',
    email: '',
    transporteur: '',
    numeroSuivi: '',
    description: '',
    categorie: '',
    poids: '',
    longueur: '',
    largeur: '',
    hauteur: '',
    valeur: '',
    instructions: ''
  });

  const transporteurs = [
    { id: 'amazon', name: 'Amazon', icon: 'ri-amazon-fill', color: 'bg-orange-500' },
    { id: 'dhl', name: 'DHL', icon: 'ri-truck-fill', color: 'bg-yellow-500' },
    { id: 'ups', name: 'UPS', icon: 'ri-truck-fill', color: 'bg-amber-600' },
    { id: 'fedex', name: 'FedEx', icon: 'ri-plane-fill', color: 'bg-purple-600' },
    { id: 'chronopost', name: 'Chronopost', icon: 'ri-mail-fill', color: 'bg-red-500' },
    { id: 'colissimo', name: 'Colissimo', icon: 'ri-mail-fill', color: 'bg-blue-500' },
    { id: 'tnt', name: 'TNT', icon: 'ri-truck-fill', color: 'bg-orange-600' },
    { id: 'gls', name: 'GLS', icon: 'ri-truck-fill', color: 'bg-blue-600' }
  ];

  const categories = [
    'Électronique',
    'Vêtements',
    'Livre/Média',
    'Cosmétiques',
    'Sport/Loisirs',
    'Maison/Jardin',
    'Alimentaire',
    'Autre'
  ];

  const handleInputChange = (field: keyof PackageData, value: string) => {
    setPackageData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return packageData.expediteur && packageData.telephone && packageData.email;
      case 2:
        return packageData.transporteur && packageData.numeroSuivi;
      case 3:
        return packageData.description && packageData.categorie && packageData.poids;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (isStepValid(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('packages')
        .insert([
          {
            user_id: user.id,
            tracking_number: packageData.numeroSuivi,
            sender_name: packageData.expediteur,
            description: `${packageData.description} (${packageData.categorie}) - Transporteur: ${packageData.transporteur} - Contact: ${packageData.telephone} (${packageData.email})${packageData.instructions ? ' - Instructions: ' + packageData.instructions : ''}`,
            declared_value: parseFloat(packageData.valeur) || 0,
            weight: parseFloat(packageData.poids) || 0,
            length: parseFloat(packageData.longueur) || 0,
            width: parseFloat(packageData.largeur) || 0,
            height: parseFloat(packageData.hauteur) || 0,
            status: 'declared',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-20">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-3xl text-green-600"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Colis déclaré avec succès !
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Votre colis de {packageData.expediteur} a été enregistré. Vous recevrez une notification dès sa réception à notre centre.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Détails du colis :</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Transporteur :</span> {packageData.transporteur}</p>
                <p><span className="font-medium">N° de suivi :</span> {packageData.numeroSuivi}</p>
                <p><span className="font-medium">Description :</span> {packageData.description}</p>
                <p><span className="font-medium">Poids :</span> {packageData.poids} kg</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Retour au tableau de bord
            </button>
            
            {/* Boutons additionnels */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/packages">
                <button className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-package-line mr-2"></i>
                  Voir tous mes colis
                </button>
              </Link>
              <Link to="/suivi">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-search-line mr-2"></i>
                  Suivre un colis
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Déclarer un colis entrant
            </h1>
            <p className="text-lg text-gray-600">
              Renseignez les informations de votre colis pour un suivi optimal
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-20 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm text-gray-600">
              <span>Expéditeur</span>
              <span>Transporteur</span>
              <span>Détails</span>
              <span>Confirmation</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Étape 1: Informations expéditeur */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Informations de l'expéditeur
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'expéditeur *
                    </label>
                    <input
                      type="text"
                      value={packageData.expediteur}
                      onChange={(e) => handleInputChange('expediteur', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Amazon, AliExpress, Boutique en ligne..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone de contact *
                    </label>
                    <input
                      type="tel"
                      value={packageData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: +33 1 23 45 67 89"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de contact *
                    </label>
                    <input
                      type="email"
                      value={packageData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: contact@boutique.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 2: Transporteur */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Informations de transport
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Sélectionnez le transporteur *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {transporteurs.map((transporteur) => (
                        <button
                          key={transporteur.id}
                          type="button"
                          onClick={() => handleInputChange('transporteur', transporteur.name)}
                          className={`p-4 border-2 rounded-lg text-center transition-all cursor-pointer whitespace-nowrap ${
                            packageData.transporteur === transporteur.name
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${transporteur.color} flex items-center justify-center mx-auto mb-2`}>
                            <i className={`${transporteur.icon} text-white text-lg`}></i>
                          </div>
                          <span className="text-sm font-medium">{transporteur.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de suivi *
                    </label>
                    <input
                      type="text"
                      value={packageData.numeroSuivi}
                      onChange={(e) => handleInputChange('numeroSuivi', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 1Z999AA1234567890"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Détails du colis */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Détails du colis
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description du contenu *
                    </label>
                    <textarea
                      value={packageData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Ex: Smartphone Samsung Galaxy, Vêtements d'été..."
                      maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {packageData.description.length}/500 caractères
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <div className="relative">
                      <select
                        value={packageData.categorie}
                        onChange={(e) => handleInputChange('categorie', e.target.value)}
                        className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poids (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={packageData.poids}
                        onChange={(e) => handleInputChange('poids', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valeur déclarée (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={packageData.valeur}
                        onChange={(e) => handleInputChange('valeur', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 299.99"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longueur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={packageData.longueur}
                        onChange={(e) => handleInputChange('longueur', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Largeur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={packageData.largeur}
                        onChange={(e) => handleInputChange('largeur', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hauteur (cm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={packageData.hauteur}
                        onChange={(e) => handleInputChange('hauteur', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions spéciales
                    </label>
                    <textarea
                      value={packageData.instructions}
                      onChange={(e) => handleInputChange('instructions', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Ex: Fragile, Conserver au frais..."
                      maxLength={500}
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {packageData.instructions.length}/500 caractères
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 4: Récapitulatif */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Récapitulatif
                </h3>
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Informations expéditeur</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Nom :</span> {packageData.expediteur}</p>
                      <p><span className="font-medium">Téléphone :</span> {packageData.telephone}</p>
                      <p><span className="font-medium">Email :</span> {packageData.email}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Transport</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Transporteur :</span> {packageData.transporteur}</p>
                      <p><span className="font-medium">N° de suivi :</span> {packageData.numeroSuivi}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Détails du colis</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Description :</span> {packageData.description}</p>
                      <p><span className="font-medium">Catégorie :</span> {packageData.categorie}</p>
                      <p><span className="font-medium">Poids :</span> {packageData.poids} kg</p>
                      {(packageData.longueur || packageData.largeur || packageData.hauteur) && (
                        <p><span className="font-medium">Dimensions :</span> {packageData.longueur} × {packageData.largeur} × {packageData.hauteur} cm</p>
                      )}
                      {packageData.valeur && (
                        <p><span className="font-medium">Valeur :</span> {packageData.valeur} €</p>
                      )}
                      {packageData.instructions && (
                        <p><span className="font-medium">Instructions :</span> {packageData.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Précédent
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isStepValid(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {loading ? 'Enregistrement...' : 'Déclarer le colis'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeclarerColis;
