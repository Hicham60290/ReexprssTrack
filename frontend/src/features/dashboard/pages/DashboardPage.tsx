import { useQuery } from '@tanstack/react-query'
import { Package, FileText, CreditCard, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Package as PackageType, Quote } from '@/shared/types'

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/users/me/stats')
      return response.data
    },
  })

  const { data: recentPackages } = useQuery<PackageType[]>({
    queryKey: ['recent-packages'],
    queryFn: async () => {
      const response = await api.get('/packages?limit=5')
      return response.data.data
    },
  })

  const { data: recentQuotes } = useQuery<Quote[]>({
    queryKey: ['recent-quotes'],
    queryFn: async () => {
      const response = await api.get('/quotes?limit=5')
      return response.data.data
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur votre espace client</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colis en cours</CardTitle>
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
            <CardTitle className="text-sm font-medium">Dépenses ce mois</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlySpending || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.totalSpending || 0)} au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalSavings || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Comparé aux tarifs standards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Colis récents</CardTitle>
            <CardDescription>Vos derniers colis reçus ou en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPackages?.map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{pkg.trackingNumber}</p>
                    <p className="text-xs text-muted-foreground">{pkg.description || 'Sans description'}</p>
                  </div>
                  <Badge variant={pkg.status === 'DELIVERED' ? 'success' : 'default'}>
                    {pkg.status}
                  </Badge>
                </div>
              ))}
              {!recentPackages?.length && (
                <p className="text-sm text-muted-foreground">Aucun colis pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader>
            <CardTitle>Devis récents</CardTitle>
            <CardDescription>Vos derniers devis de transport</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuotes?.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{quote.carrier}</p>
                    <p className="text-xs text-muted-foreground">{quote.serviceName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(quote.price)}</p>
                    <Badge variant={quote.status === 'READY' ? 'success' : 'default'} className="text-xs">
                      {quote.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {!recentQuotes?.length && (
                <p className="text-sm text-muted-foreground">Aucun devis pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
