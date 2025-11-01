
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { Link } from 'react-router-dom';

interface Package {
  id: string;
  tracking_number: string;
  description: string;
  status: string;
  photos: any[];
  user_id: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'users' | 'stats'>('packages');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalPackages: 0,
    pendingPackages: 0,
    declaredPackages: 0,
    withPhotosPackages: 0,
    totalUsers: 0,
    revenue: 0
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate('/connexion?redirect=/admin');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        setIsAdmin(true);
        await loadPackages();
        await fetchStats();
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        navigate('/dashboard');
      }
    };

    if (!authLoading) {
      checkAdminAccess();
    }
  }, [user, authLoading, navigate]);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Données récupérées:', data); // Debug

      // Transformer les données pour l'affichage
      const packagesWithUserInfo = (data || []).map((pkg) => {
        const profile = pkg.profiles;
        const firstName = profile?.first_name || '';
        const lastName = profile?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        return {
          ...pkg,
          user_email: profile?.email || 'Email non disponible',
          user_name: fullName || 'Nom non disponible'
        };
      });

      console.log('Colis transformés:', packagesWithUserInfo); // Debug

      setPackages(packagesWithUserInfo);
      
      // Mettre à jour les stats avec les vraies données
      const declaredCount = packagesWithUserInfo.filter(p => p.status === 'declared').length;
      const pendingCount = packagesWithUserInfo.filter(p => p.status === 'pending').length;
      const receivedCount = packagesWithUserInfo.filter(p => p.status === 'received').length;
      const withPhotosCount = packagesWithUserInfo.filter(p => p.photos && p.photos.length > 0).length;
      
      console.log('Stats calculées:', {
        total: packagesWithUserInfo.length,
        declared: declaredCount,
        pending: pendingCount,
        received: receivedCount,
        withPhotos: withPhotosCount
      }); // Debug
      
      setStats(prev => ({
        ...prev,
        totalPackages: packagesWithUserInfo.length,
        pendingPackages: pendingCount,
        declaredPackages: declaredCount,
        withPhotosPackages: withPhotosCount
      }));
      
    } catch (error) {
      console.error('Erreur chargement colis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'declared': return 'bg-orange-100 text-orange-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'stored': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'declared': return 'Déclaré';
      case 'received': return 'Reçu';
      case 'stored': return 'Stocké';
      case 'shipped': return 'Expédié';
      case 'pending': return 'En attente';
      default: return status;
    }
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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch users stats
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .or('role.neq.admin,role.is.null');

      setStats(prev => ({
        ...prev,
        totalUsers: users?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const adminCards = [
    {
      title: 'Tous les colis',
      description: 'Voir et gérer tous les colis (déclarés, reçus, expédiés)',
      icon: 'ri-package-line',
      color: 'blue',
      link: '/admin/colis-recus',
      stat: stats.totalPackages
    },
    {
      title: 'Colis déclarés',
      description: `${stats.declaredPackages} colis déclarés par les clients`,
      icon: 'ri-file-list-line',
      color: 'orange',
      link: '/admin/colis-recus?filter=declared',
      stat: stats.declaredPackages
    },
    {
      title: 'Ajouter un colis',
      description: 'Ajouter manuellement un nouveau colis',
      icon: 'ri-add-box-line',
      color: 'green',
      link: '/admin/ajouter-colis'
    },
    {
      title: 'Gestion des utilisateurs',
      description: 'Voir et gérer tous les utilisateurs',
      icon: 'ri-user-line',
      color: 'purple',
      link: '/admin/utilisateurs',
      stat: stats.totalUsers
    }
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'espace administrateur...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête admin */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🛠️ Administration
              </h1>
              <p className="text-gray-600">
                Gestion des colis, photos et devis clients
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                <i className="ri-shield-check-line mr-1"></i>
                Admin
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                <i className="ri-user-line mr-2"></i>
                Espace client
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'packages', label: 'Gestion des colis', icon: 'ri-package-line' },
                { id: 'users', label: 'Utilisateurs', icon: 'ri-user-line', link: '/admin/utilisateurs' },
                { id: 'stats', label: 'Statistiques', icon: 'ri-bar-chart-line', link: '/admin/statistiques' }
              ].map((tab) => (
                tab.link ? (
                  <Link
                    key={tab.id}
                    to={tab.link}
                    className="py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                  >
                    <i className={`${tab.icon} mr-2`}></i>
                    {tab.label}
                  </Link>
                ) : (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className={`${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                )
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-package-line text-2xl text-green-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total colis</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPackages}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-file-list-line text-2xl text-orange-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Déclarés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.declaredPackages}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-time-line text-2xl text-blue-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingPackages}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <i className="ri-camera-line text-2xl text-purple-600"></i>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avec photos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.withPhotosPackages}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions admin */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Liste des colis
              </h2>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/ajouter-colis')}
                >
                  <i className="ri-add-line mr-2"></i>
                  Nouveau colis
                </Button>
                <Button onClick={loadPackages}>
                  <i className="ri-refresh-line mr-2"></i>
                  Actualiser
                </Button>
              </div>
            </div>

            {/* Liste des colis */}
            <div className="space-y-4">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          📦 {pkg.tracking_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pkg.status)}`}>
                          {getStatusText(pkg.status)}
                        </span>
                        {pkg.photos && pkg.photos.length > 0 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            <i className="ri-camera-line mr-1"></i>
                            {pkg.photos.length} photo{pkg.photos.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">Client</p>
                          <p>{pkg.user_name}</p>
                          <p>{pkg.user_email}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Description</p>
                          <p>{pkg.description || 'Aucune description'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Dates</p>
                          <p>Créé: {formatDate(pkg.created_at)}</p>
                          <p>Modifié: {formatDate(pkg.updated_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/colis/${pkg.id}`)}
                      >
                        <i className="ri-eye-line mr-1"></i>
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin/colis/${pkg.id}/edit`)}
                      >
                        <i className="ri-edit-line mr-1"></i>
                        Gérer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {packages.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-package-line text-3xl text-gray-400"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun colis trouvé
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Les colis des clients apparaîtront ici
                  </p>
                  <Button onClick={() => navigate('/admin/ajouter-colis')}>
                    <i className="ri-add-line mr-2"></i>
                    Ajouter le premier colis
                  </Button>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-3xl text-blue-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gestion des utilisateurs
            </h3>
            <p className="text-gray-600 mb-6">
              Cette section sera disponible prochainement
            </p>
          </Card>
        )}

        {activeTab === 'stats' && (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-bar-chart-line text-3xl text-purple-600"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Statistiques
            </h3>
            <p className="text-gray-600 mb-6">
              Tableaux de bord et analyses à venir
            </p>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
