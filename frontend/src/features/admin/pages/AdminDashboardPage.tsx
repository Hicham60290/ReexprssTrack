import { useQuery } from '@tanstack/react-query'
import { Users, Package, FileText, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
        <p className="text-muted-foreground">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newUsersThisMonth || 0} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colis actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePackages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalPackages || 0} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis en attente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingQuotes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalQuotes || 0} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {stats?.revenueGrowth >= 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{stats?.revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                  <span className="text-red-600">{stats?.revenueGrowth}%</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques des paiements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paiements réussis</span>
              <span className="font-bold">{stats?.successfulPayments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paiements échoués</span>
              <span className="font-bold text-destructive">{stats?.failedPayments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Remboursements</span>
              <span className="font-bold">{stats?.refundedPayments || 0}</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-sm font-medium">Total des revenus</span>
              <span className="font-bold">{formatCurrency(stats?.totalRevenue || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nouveaux colis aujourd'hui</span>
              <span className="font-bold">{stats?.packagesToday || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Devis générés aujourd'hui</span>
              <span className="font-bold">{stats?.quotesToday || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tickets de support ouverts</span>
              <span className="font-bold">{stats?.openTickets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Utilisateurs actifs (7j)</span>
              <span className="font-bold">{stats?.activeUsersWeek || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
