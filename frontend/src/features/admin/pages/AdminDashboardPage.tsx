import { useQuery } from '@tanstack/react-query'
import { Users, Package, FileText, CreditCard, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import {
  LuxuryCard,
  SectionHeader,
  AnimatedBackground,
  StatCard
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatCurrency } from '@/shared/utils/format'

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats')
      return response.data
    },
  })

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-shimmer">
            ⚡ Dashboard Admin
          </h1>
          <p className="text-gray-600 text-lg">Vue d'ensemble de la plateforme ReExpressTrack</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Utilisateurs totaux"
            value={stats?.totalUsers || 0}
            icon={<Users className="w-8 h-8" />}
            gradient="blue"
            subtitle={`+${stats?.newUsersThisMonth || 0} ce mois`}
          />

          <StatCard
            title="Colis actifs"
            value={stats?.activePackages || 0}
            icon={<Package className="w-8 h-8" />}
            gradient="orange"
            subtitle={`${stats?.totalPackages || 0} au total`}
          />

          <StatCard
            title="Devis en attente"
            value={stats?.pendingQuotes || 0}
            icon={<FileText className="w-8 h-8" />}
            gradient="purple"
            subtitle={`${stats?.totalQuotes || 0} au total`}
          />

          <StatCard
            title="Revenus ce mois"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            icon={<CreditCard className="w-8 h-8" />}
            gradient="gold"
            trend={stats?.revenueGrowth >= 0 ? {
              value: stats?.revenueGrowth || 0,
              isPositive: true
            } : {
              value: Math.abs(stats?.revenueGrowth || 0),
              isPositive: false
            }}
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Stats */}
          <LuxuryCard gradient="blue">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Statistiques des paiements</h3>
                  <p className="text-sm text-gray-600">Détails financiers</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Paiements réussis</span>
                  <span className="font-bold text-green-600 text-lg">{stats?.successfulPayments || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Paiements échoués</span>
                  <span className="font-bold text-red-600 text-lg">{stats?.failedPayments || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                  <span className="text-sm text-gray-600">Remboursements</span>
                  <span className="font-bold text-orange-600 text-lg">{stats?.refundedPayments || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 mt-2">
                  <span className="text-sm font-semibold text-gray-900">Total des revenus</span>
                  <span className="font-bold text-blue-600 text-xl">{formatCurrency(stats?.totalRevenue || 0)}</span>
                </div>
              </div>
            </div>
          </LuxuryCard>

          {/* Activity Stats */}
          <LuxuryCard gradient="purple">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Activité récente</h3>
                  <p className="text-sm text-gray-600">Activité en temps réel</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                  <span className="text-sm text-gray-600">Nouveaux colis aujourd'hui</span>
                  <span className="font-bold text-purple-600 text-lg">{stats?.packagesToday || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                  <span className="text-sm text-gray-600">Devis générés aujourd'hui</span>
                  <span className="font-bold text-purple-600 text-lg">{stats?.quotesToday || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                  <span className="text-sm text-gray-600">Tickets de support ouverts</span>
                  <span className="font-bold text-purple-600 text-lg">{stats?.openTickets || 0}</span>
                </div>

                <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 mt-2">
                  <span className="text-sm font-semibold text-gray-900">Utilisateurs actifs (7j)</span>
                  <span className="font-bold text-purple-600 text-xl">{stats?.activeUsersWeek || 0}</span>
                </div>
              </div>
            </div>
          </LuxuryCard>
        </div>
      </div>
    </div>
  )
}
