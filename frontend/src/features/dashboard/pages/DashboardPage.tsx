import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, TruckIcon, DollarSign, Clock, MapPin, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import api from '@/shared/lib/api'
import { useAuthStore } from '@/shared/stores/auth.store'
import { formatCurrency, formatDate } from '@/shared/utils/format'

interface DashboardStats {
  totalPackages: number
  activePackages: number
  totalQuotes: number
  pendingQuotes: number
  totalSavings: number
}

interface FrenchAddress {
  id: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  referenceCode: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Simulation - À remplacer par un vrai endpoint
      return {
        totalPackages: 12,
        activePackages: 3,
        totalQuotes: 8,
        pendingQuotes: 2,
        totalSavings: 245.50
      }
    }
  })

  const { data: packages } = useQuery({
    queryKey: ['recent-packages'],
    queryFn: async () => {
      const response = await api.get('/packages?limit=5')
      return response.data.data
    }
  })

  const { data: quotes } = useQuery({
    queryKey: ['recent-quotes'],
    queryFn: async () => {
      const response = await api.get('/quotes?limit=5')
      return response.data.data
    }
  })

  const { data: frenchAddress } = useQuery<FrenchAddress>({
    queryKey: ['french-address'],
    queryFn: async () => {
      const response = await api.get('/users/me')
      return response.data.frenchAddresses[0]
    }
  })

  const copyAddress = () => {
    if (!frenchAddress) return

    const fullAddress = `${frenchAddress.addressLine1}\n${frenchAddress.addressLine2}\n${frenchAddress.postalCode} ${frenchAddress.city}\nFrance`

    navigator.clipboard.writeText(fullAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statCards = [
    {
      title: 'Total colis',
      value: stats?.totalPackages || 0,
      subtitle: `${stats?.activePackages || 0} en cours`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Devis actifs',
      value: stats?.totalQuotes || 0,
      subtitle: `${stats?.pendingQuotes || 0} en attente`,
      icon: TruckIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Économies',
      value: formatCurrency(stats?.totalSavings || 0),
      subtitle: 'Total économisé',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user?.profile?.firstName || user?.email} 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Voici un aperçu de vos colis et expéditions
        </p>
      </div>

      {/* French Address Card */}
      {frenchAddress && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <MapPin className="w-5 h-5 mr-2" />
              Votre adresse française
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 border border-orange-100">
              <div className="font-mono text-sm text-gray-900 space-y-1">
                <div className="font-semibold">{user?.profile?.firstName} {user?.profile?.lastName}</div>
                <div>{frenchAddress.addressLine1}</div>
                <div className="text-orange-600 font-semibold">{frenchAddress.addressLine2}</div>
                <div>{frenchAddress.postalCode} {frenchAddress.city}</div>
                <div>France</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAddress}
                  className="flex items-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copier l'adresse
                    </>
                  )}
                </Button>
                <div className="text-xs text-gray-500 flex items-center">
                  <span className="font-semibold mr-1">Référence:</span>
                  {frenchAddress.referenceCode}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 Utilisez cette adresse pour tous vos achats en ligne
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Packages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Colis récents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/packages">Voir tous</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {packages && packages.length > 0 ? (
            <div className="space-y-3">
              {packages.slice(0, 5).map((pkg: any) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {pkg.trackingNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pkg.description || 'Sans description'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge>{pkg.status}</Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/packages/${pkg.id}`}>Détails</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun colis pour le moment</p>
              <Button className="mt-4" asChild>
                <Link to="/packages">Ajouter un colis</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Quotes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Devis récents</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/quotes">Voir tous</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quotes && quotes.length > 0 ? (
            <div className="space-y-3">
              {quotes.slice(0, 5).map((quote: any) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {quote.carrier} - {quote.service}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(quote.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(quote.price)}
                      </div>
                      <Badge variant={quote.status === 'READY' ? 'default' : 'secondary'}>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun devis pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button className="h-20" asChild>
              <Link to="/packages">
                <Package className="mr-2 h-5 w-5" />
                Déclarer un colis
              </Link>
            </Button>
            <Button className="h-20" variant="outline" asChild>
              <Link to="/calculateur">
                <TruckIcon className="mr-2 h-5 w-5" />
                Calculer les frais
              </Link>
            </Button>
            <Button className="h-20" variant="outline" asChild>
              <Link to="/support">
                <Clock className="mr-2 h-5 w-5" />
                Contacter le support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
