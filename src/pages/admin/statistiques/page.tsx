
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalPackages: number;
  pendingPackages: number;
  deliveredPackages: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalReturns: number;
  activeSubscriptions: number;
  todayPackages: number;
  weeklyRevenue: number;
}

interface ChartData {
  month: string;
  packages: number;
  revenue: number;
}

interface RealtimeData {
  lastUpdate: string;
  isConnected: boolean;
}

const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPackages: 0,
    pendingPackages: 0,
    deliveredPackages: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalReturns: 0,
    activeSubscriptions: 0,
    todayPackages: 0,
    weeklyRevenue: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    lastUpdate: '',
    isConnected: false
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fonction pour récupérer les statistiques
  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);

      // Connexion temps réel
      setRealtimeData(prev => ({ ...prev, isConnected: true }));

      // Récupérer tous les utilisateurs
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, created_at');

      // Récupérer tous les colis
      const { data: packages } = await supabase
        .from('packages')
        .select('*, created_at, status');

      // Récupérer les demandes de retour
      const { data: returns } = await supabase
        .from('return_requests')
        .select('*, created_at');

      // Récupérer les abonnements
      const { data: subscriptions } = await supabase
        .from('subscription_history')
        .select('*, status, created_at');

      // Récupérer les devis confirmés
      const { data: quotes } = await supabase
        .from('quotes')
        .select('total_cost, created_at, status')
        .eq('status', 'confirmed');

      // Calculs des statistiques
      const totalRevenue = quotes?.reduce((sum, quote) => sum + (quote.total_cost || 0), 0) || 0;
      
      // Date d'aujourd'hui
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Début de la semaine
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      // Début du mois
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Colis d'aujourd'hui
      const todayPackages = packages?.filter(pkg => 
        new Date(pkg.created_at) >= todayStart
      ).length || 0;

      // Revenus du mois
      const monthlyRevenue = quotes?.filter(quote => 
        new Date(quote.created_at) >= monthStart
      ).reduce((sum, quote) => sum + (quote.total_cost || 0), 0) || 0;

      // Revenus de la semaine
      const weeklyRevenue = quotes?.filter(quote => 
        new Date(quote.created_at) >= weekStart
      ).reduce((sum, quote) => sum + (quote.total_cost || 0), 0) || 0;

      // Compter les colis par statut
      const pendingPackages = packages?.filter(pkg => 
        ['in_transit', 'at_warehouse', 'pending', 'processing'].includes(pkg.status)
      ).length || 0;
      
      const deliveredPackages = packages?.filter(pkg => 
        ['delivered', 'completed'].includes(pkg.status)
      ).length || 0;

      // Abonnements actifs
      const activeSubscriptions = subscriptions?.filter(sub => 
        sub.status === 'active'
      ).length || 0;

      setStats({
        totalUsers: profilesData?.length || 0,
        totalPackages: packages?.length || 0,
        pendingPackages,
        deliveredPackages,
        totalRevenue,
        monthlyRevenue,
        totalReturns: returns?.length || 0,
        activeSubscriptions,
        todayPackages,
        weeklyRevenue
      });

      // Générer les données du graphique
      await generateChartData();

      // Mettre à jour l'heure de dernière actualisation
      setRealtimeData({
        lastUpdate: new Date().toLocaleTimeString('fr-FR'),
        isConnected: true
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      setRealtimeData(prev => ({ ...prev, isConnected: false }));
    } finally {
      setLoading(false);
    }
  }, []);

  const generateChartData = async () => {
    const monthsCount = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const months = [];
    const currentDate = new Date();
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        date: date
      });
    }

    const chartData: ChartData[] = [];

    for (const month of months) {
      const nextMonth = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 1);
      
      // Colis du mois
      const { data: monthPackages } = await supabase
        .from('packages')
        .select('id')
        .gte('created_at', month.date.toISOString())
        .lt('created_at', nextMonth.toISOString());

      // Revenus du mois
      const { data: monthQuotes } = await supabase
        .from('quotes')
        .select('total_cost')
        .eq('status', 'confirmed')
        .gte('created_at', month.date.toISOString())
        .lt('created_at', nextMonth.toISOString());

      const monthRevenue = monthQuotes?.reduce((sum, quote) => sum + (quote.total_cost || 0), 0) || 0;

      chartData.push({
        month: month.month,
        packages: monthPackages?.length || 0,
        revenue: monthRevenue
      });
    }

    setChartData(chartData);
  };

  // Actualisation automatique toutes les 30 secondes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchStatistics();
      }, 30000); // 30 secondes
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchStatistics]);

  // Chargement initial et écoute des changements de période
  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod, fetchStatistics]);

  // Écoute des changements en temps réel sur les tables importantes
  useEffect(() => {
    const channels = [
      supabase
        .channel('packages-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, () => {
          fetchStatistics();
        }),
      
      supabase
        .channel('quotes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, () => {
          fetchStatistics();
        }),
      
      supabase
        .channel('return-requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, () => {
          fetchStatistics();
        }),
      
      supabase
        .channel('profiles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchStatistics();
        })
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchStatistics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques en temps réel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec indicateur temps réel */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Statistiques Temps Réel</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${realtimeData.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-medium ${realtimeData.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {realtimeData.isConnected ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
              </div>
              <p className="text-gray-600">
                Dernière mise à jour: {realtimeData.lastUpdate}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`ri-${autoRefresh ? 'pause' : 'play'}-line mr-1`}></i>
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                <option value="3months">3 derniers mois</option>
                <option value="6months">6 derniers mois</option>
                <option value="12months">12 derniers mois</option>
              </select>
              <button
                onClick={fetchStatistics}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques temps réel principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                <p className="text-xs text-blue-600 mt-1">Base de données connectée</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Colis Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalPackages)}</p>
                <p className="text-xs text-green-600 mt-1">+{stats.todayPackages} aujourd'hui</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-package-line text-xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-yellow-600 mt-1">{formatCurrency(stats.weeklyRevenue)} cette semaine</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="ri-money-euro-circle-line text-xl text-yellow-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abonnements Actifs</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.activeSubscriptions)}</p>
                <p className="text-xs text-purple-600 mt-1">Synchronisé en temps réel</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-vip-crown-line text-xl text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques temps réel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Graphique des colis avec animation */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution des Colis</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Temps réel</span>
              </div>
            </div>
            <div className="space-y-4">
              {chartData.map((data, index) => {
                const maxPackages = Math.max(...chartData.map(d => d.packages));
                const percentage = maxPackages > 0 ? (data.packages / maxPackages) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-20">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{formatNumber(data.packages)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graphique des revenus avec animation */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Évolution des Revenus</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span>Temps réel</span>
              </div>
            </div>
            <div className="space-y-4">
              {chartData.map((data, index) => {
                const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-20">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20 text-right">{formatCurrency(data.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Métriques détaillées en temps réel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-time-line text-xl text-orange-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Colis en Attente</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingPackages)}</p>
                <p className="text-xs text-orange-600">Mis à jour automatiquement</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-xl text-green-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Colis Livrés</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.deliveredPackages)}</p>
                <p className="text-xs text-green-600">Suivi en temps réel</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-arrow-go-back-line text-xl text-red-600"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Demandes Retour</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalReturns)}</p>
                <p className="text-xs text-red-600">Synchronisation active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau de bord revenus temps réel */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">Revenus du Mois</h3>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
              <div className="flex items-center space-x-4 mt-3">
                <p className="text-blue-100">
                  {stats.totalRevenue > 0 ? ((stats.monthlyRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}% du total
                </p>
                <p className="text-blue-100">
                  • Semaine: {formatCurrency(stats.weeklyRevenue)}
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-line-chart-line text-2xl"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
