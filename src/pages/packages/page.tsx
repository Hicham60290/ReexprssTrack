
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Package {
  id: string;
  tracking_number: string;
  sender_name: string;
  weight: number;
  dimensions: string;
  declared_value: number;
  status: string;
  created_at: string;
  description: string;
  quote_id?: string;
  quote_number?: string;
  quote_status?: string;
  carrier_name?: string;
  quote_amount?: number;
}

const PackagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (user) {
      fetchPackages();
    }
  }, [user]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Récupération des colis pour user_id:', user?.id);
      
      // Récupérer TOUS les colis d'abord
      const { data: allPackages, error: allPackagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (allPackagesError) {
        console.error('❌ Erreur tous les colis:', allPackagesError);
        return;
      }

      console.log('✅ Tous les colis récupérés:', allPackages?.length || 0);

      // Récupérer tous les devis pour cet utilisateur
      const { data: allQuotes, error: quotesError } = await supabase
        .from('quotes')
        .select('id, quote_number, payment_status, amount_ttc, package_id, selected_carrier_id')
        .eq('user_id', user?.id);

      if (quotesError) {
        console.error('❌ Erreur devis:', quotesError);
      } else {
        console.log('✅ Tous les devis récupérés:', allQuotes?.length || 0);
        allQuotes?.forEach(quote => {
          console.log(`💰 Devis ${quote.quote_number} pour package_id: ${quote.package_id}`);
        });
      }

      // Combiner les données
      const packagesWithQuotes = allPackages.map(pkg => {
        const quote = allQuotes?.find(q => q.package_id === pkg.id);
        
        const packageWithQuote = {
          ...pkg,
          quote_id: quote?.id,
          quote_number: quote?.quote_number,
          quote_status: quote?.payment_status,
          quote_amount: quote?.amount_ttc
        };

        if (quote) {
          console.log(`📦 Colis ${pkg.tracking_number} - Quote ID: ${quote.id} - Quote Number: ${quote.quote_number}`);
        } else {
          console.log(`📦 Colis ${pkg.tracking_number} - Quote ID: AUCUN`);
        }
        
        return packageWithQuote;
      });
      
      setPackages(packagesWithQuotes);
    } catch (error) {
      console.error('Erreur lors de la récupération des colis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuote = async (pkg: any) => {
    try {
      console.log('🔵 FRONTEND: Génération devis pour colis:', pkg.id);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/connexion');
        return;
      }

      // Afficher un état de chargement
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/generate-quote-with-carriers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ package_id: pkg.id }),
        }
      );

      const result = await response.json();
      console.log('🔵 FRONTEND: Réponse API:', result);
      
      if (!response.ok) {
        console.error('🔴 FRONTEND: Erreur API:', result);
        
        // Gestion douce des erreurs selon le statut
        let errorMessage = result.error || 'Erreur lors de la création du devis';
        let showOptions = true;
        
        if (response.status === 404) {
          errorMessage = 'Colis non trouvé. Veuillez vérifier que le colis existe.';
          showOptions = false;
        } else if (response.status === 400) {
          if (result.error && result.error.includes('statut')) {
            errorMessage = 'Ce colis ne peut pas encore avoir de devis. Il doit d\'abord être reçu par notre entrepôt.';
            showOptions = true;
          } else {
            errorMessage = result.error || 'Le colis ne peut pas avoir de devis dans son état actuel.';
            showOptions = true;
          }
        }
        
        // Proposer des options à l'utilisateur au lieu de lancer une erreur
        handleQuoteError(pkg, errorMessage, showOptions);
        return;
      }

      if (!result?.quote_id) {
        console.error('🔴 FRONTEND: Pas de quote_id dans la réponse:', result);
        
        // Vérifier si un devis existe maintenant pour ce colis
        await fetchPackages(); // Recharger la liste
        const updatedPkg = packages.find(p => p.id === pkg.id);
        
        if (updatedPkg?.quote_id) {
          console.log('🔵 FRONTEND: Devis trouvé après rechargement:', updatedPkg.quote_id);
          navigate(`/quote-payment?id=${updatedPkg.quote_id}`);
          return;
        }
        
        // Si vraiment aucun devis, proposer des alternatives
        handleQuoteError(
          pkg, 
          'Le devis n\'a pas pu être créé. Cela peut être dû au statut du colis ou à des données manquantes.',
          true
        );
        return;
      }

      console.log('🔵 FRONTEND: Devis créé avec succès:', result.quote_id);
      
      // Naviguer vers l'URL canonique
      navigate(`/quote-payment?id=${result.quote_id}`);
      
    } catch (error: any) {
      console.error('🔴 FRONTEND: Erreur génération devis:', error);
      
      // Gestion des erreurs réseau ou autres
      handleQuoteError(
        pkg,
        'Une erreur de connexion est survenue. Veuillez réessayer.',
        true
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteError = (pkg: any, errorMessage: string, showRetryOption: boolean) => {
    // Créer un modal d'erreur personnalisé au lieu d'utiliser alert
    const errorModal = document.createElement('div');
    errorModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    errorModal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <i class="ri-error-warning-line text-red-600 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Problème avec le devis</h3>
        </div>
        
        <p class="text-gray-600 mb-6">${errorMessage}</p>
        
        <div class="flex gap-3">
          ${showRetryOption ? `
            <button id="retry-btn" class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Réessayer
            </button>
          ` : ''}
          
          <button id="tracking-btn" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Voir le suivi
          </button>
          
          <button id="support-btn" class="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
            Support
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorModal);
    
    // Gestion des clics
    const retryBtn = errorModal.querySelector('#retry-btn');
    const trackingBtn = errorModal.querySelector('#tracking-btn');
    const supportBtn = errorModal.querySelector('#support-btn');
    
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        document.body.removeChild(errorModal);
        // Réessayer après un délai
        setTimeout(() => handleGenerateQuote(pkg), 1000);
      });
    }
    
    if (trackingBtn) {
      trackingBtn.addEventListener('click', () => {
        document.body.removeChild(errorModal);
        navigate(`/suivi?tracking=${pkg.tracking_number}`);
      });
    }
    
    if (supportBtn) {
      supportBtn.addEventListener('click', () => {
        document.body.removeChild(errorModal);
        navigate('/contact');
      });
    }
    
    // Fermer en cliquant à l'extérieur
    errorModal.addEventListener('click', (e) => {
      if (e.target === errorModal) {
        document.body.removeChild(errorModal);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      declared: { label: 'Déclaré', color: 'bg-blue-100 text-blue-800' },
      received: { label: 'Reçu', color: 'bg-yellow-100 text-yellow-800' },
      stored: { label: 'Stocké', color: 'bg-purple-100 text-purple-800' },
      shipped: { label: 'Expédié', color: 'bg-orange-100 text-orange-800' },
      delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPackages = packages
    .filter(pkg => {
      const matchesSearch = 
        pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.sender_name && pkg.sender_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'value-high':
          return (b.declared_value || 0) - (a.declared_value || 0);
        case 'value-low':
          return (a.declared_value || 0) - (b.declared_value || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tous mes colis
              </h1>
              <p className="text-gray-600">
                Historique complet de vos {packages.length} colis
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="whitespace-nowrap">
                <i className="ri-arrow-left-line mr-2"></i>
                Retour au dashboard
              </Button>
            </Link>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { status: 'declared', label: 'Déclarés', icon: '📝', color: 'text-blue-600' },
              { status: 'received', label: 'Reçus', icon: '📦', color: 'text-yellow-600' },
              { status: 'stored', label: 'Stockés', icon: '🏪', color: 'text-purple-600' },
              { status: 'shipped', label: 'Expédiés', icon: '🚚', color: 'text-orange-600' },
              { status: 'delivered', label: 'Livrés', icon: '✅', color: 'text-green-600' }
            ].map(({ status, label, icon, color }) => {
              const count = packages.filter(pkg => pkg.status === status).length;
              return (
                <Card key={status} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}>
                  <div className={`text-2xl mb-2 ${color}`}>{icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{label}</div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Rechercher par numéro de suivi, expéditeur..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm pr-8 appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="declared">Déclarés</option>
                <option value="received">Reçus</option>
                <option value="stored">Stockés</option>
                <option value="shipped">Expédiés</option>
                <option value="delivered">Livrés</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>

            {/* Tri */}
            <div className="relative">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm pr-8 appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="value-high">Valeur décroissante</option>
                <option value="value-low">Valeur croissante</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </Card>

        {/* Liste des colis */}
        <div className="space-y-4">
          {filteredPackages.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {packages.length === 0 ? 'Aucun colis déclaré' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-600 mb-6">
                {packages.length === 0 
                  ? 'Commencez par déclarer votre premier colis pour le suivi.'
                  : 'Essayez de modifier vos critères de recherche ou de filtrage.'
                }
              </p>
              {packages.length === 0 && (
                <Link to="/declarer-colis">
                  <Button className="whitespace-nowrap">
                    <i className="ri-add-line mr-2"></i>
                    Déclarer un colis
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Informations principales */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <i className="ri-package-line text-purple-600 text-xl"></i>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {pkg.tracking_number}
                          </h3>
                          {getStatusBadge(pkg.status)}
                          {pkg.quote_id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="ri-file-text-line mr-1"></i>
                              Devis disponible
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Expéditeur:</span> {pkg.sender_name || 'Non renseigné'}
                          </div>
                          <div>
                            <span className="font-medium">Déclaré le:</span> {formatDate(pkg.created_at)}
                          </div>
                          <div>
                            <span className="font-medium">Poids:</span> {pkg.weight}kg
                          </div>
                          <div>
                            <span className="font-medium">Valeur:</span> {pkg.declared_value || 0}€
                          </div>
                        </div>
                        
                        {pkg.dimensions && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Dimensions:</span> {pkg.dimensions}
                          </div>
                        )}
                        
                        {pkg.description && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Description:</span> {pkg.description}
                          </div>
                        )}

                        {pkg.quote_number && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Numéro de devis:</span> {pkg.quote_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <div className="flex gap-2">
                      {pkg.quote_id ? (
                        <Link to={`/quote-payment?id=${pkg.quote_id}`}>
                          <Button variant="outline" size="sm" className="whitespace-nowrap">
                            Détails
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => handleGenerateQuote(pkg)}
                        >
                          Détails
                        </Button>
                      )}
                      
                      {pkg.status === 'delivered' && (
                        <Link to={`/retour-colis-dom-tom?tracking=${pkg.tracking_number}`}>
                          <Button variant="outline" size="sm" className="whitespace-nowrap">
                            Retour
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination si nécessaire */}
        {filteredPackages.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Affichage de {filteredPackages.length} colis sur {packages.length} au total
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PackagesPage;
