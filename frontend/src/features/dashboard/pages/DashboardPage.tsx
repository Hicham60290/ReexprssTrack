import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Package,
  TruckIcon,
  DollarSign,
  MapPin,
  Copy,
  Check,
  Calculator,
  MessageCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import {
  LuxuryCard,
  StatCard,
  GlowButton,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
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

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
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
      return response.data.packages || []
    }
  })

  const { data: quotes } = useQuery({
    queryKey: ['recent-quotes'],
    queryFn: async () => {
      const response = await api.get('/quotes?limit=5')
      return response.data.quotes || []
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
    const fullAddress = `${user?.firstName} ${user?.lastName}\n${frenchAddress.addressLine1}\n${frenchAddress.addressLine2}\n${frenchAddress.postalCode} ${frenchAddress.city}\nFrance`
    navigator.clipboard.writeText(fullAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      IN_TRANSIT: 'bg-blue-100 text-blue-800 border-blue-200',
      RECEIVED: 'bg-purple-100 text-purple-800 border-purple-200',
      ANNOUNCED: 'bg-orange-100 text-orange-800 border-orange-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-2 animate-shimmer">
              Bienvenue, {user?.firstName || 'Cher client'} ✨
            </h1>
            <p className="text-gray-600 text-lg">Gérez vos expéditions avec élégance</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full animate-float shadow-2xl" />
          </div>
        </div>

        {/* French Address - Premium Card */}
        {frenchAddress && (
          <LuxuryCard gradient="gold" className="overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200 to-transparent rounded-full blur-3xl opacity-30 -mr-32 -mt-32" />
            <div className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Votre Adresse Française</h2>
                    <p className="text-amber-700 text-sm font-medium">Premium · Permanente</p>
                  </div>
                </div>
                <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-200 shadow-xl">
                <div className="font-mono text-sm md:text-base text-gray-900 space-y-2">
                  <div className="font-bold text-lg">{user?.firstName} {user?.lastName}</div>
                  <div>{frenchAddress.addressLine1}</div>
                  <div className="text-orange-600 font-bold text-lg">{frenchAddress.addressLine2}</div>
                  <div className="font-semibold">{frenchAddress.postalCode} {frenchAddress.city}</div>
                  <div className="text-blue-600 font-semibold">FRANCE 🇫🇷</div>
                </div>

                <div className="mt-6 flex gap-3">
                  <GlowButton onClick={copyAddress} variant="primary" icon={copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}>
                    {copied ? 'Copié !' : 'Copier l\'adresse'}
                  </GlowButton>
                  <button className="px-4 py-2 text-sm text-amber-700 hover:text-amber-900 transition-colors">
                    Référence: {frenchAddress.referenceCode}
                  </button>
                </div>
              </div>
            </div>
          </LuxuryCard>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Colis"
            value={stats?.totalPackages || 0}
            subtitle={`${stats?.activePackages || 0} en cours`}
            icon={<Package className="w-7 h-7" />}
            gradient="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Devis Actifs"
            value={stats?.totalQuotes || 0}
            subtitle={`${stats?.pendingQuotes || 0} en attente`}
            icon={<TruckIcon className="w-7 h-7" />}
            gradient="orange"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Économies Totales"
            value={formatCurrency(stats?.totalSavings || 0)}
            subtitle="vs tarifs standard"
            icon={<DollarSign className="w-7 h-7" />}
            gradient="gold"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Statut Premium"
            value="Actif"
            subtitle="Avantages exclusifs"
            icon={<Sparkles className="w-7 h-7" />}
            gradient="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Packages */}
          <LuxuryCard gradient="blue">
            <div className="p-6">
              <SectionHeader
                title="Colis Récents"
                subtitle="Vos derniers envois"
                action={
                  <Link to="/packages">
                    <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors">
                      Voir tout <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                }
              />

              <div className="space-y-3">
                {packages && packages.length > 0 ? (
                  packages.map((pkg: any) => (
                    <Link key={pkg.id} to={`/packages/${pkg.id}`}>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{pkg.trackingNumber || 'Sans tracking'}</p>
                              <p className="text-sm text-gray-500">{formatDate(pkg.createdAt)}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(pkg.status)}`}>
                            {pkg.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Aucun colis pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </LuxuryCard>

          {/* Recent Quotes */}
          <LuxuryCard gradient="orange">
            <div className="p-6">
              <SectionHeader
                title="Devis Récents"
                subtitle="Vos demandes d'expédition"
                action={
                  <Link to="/quotes">
                    <button className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium transition-colors">
                      Voir tout <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                }
              />

              <div className="space-y-3">
                {quotes && quotes.length > 0 ? (
                  quotes.map((quote: any) => (
                    <Link key={quote.id} to={`/quotes`}>
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                              <TruckIcon className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Devis #{quote.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-500">{formatDate(quote.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">{formatCurrency(quote.totalPrice || 0)}</p>
                            <span className={`text-xs font-semibold ${getStatusColor(quote.status)}`}>
                              {quote.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TruckIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Aucun devis pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </LuxuryCard>
        </div>

        {/* Quick Actions */}
        <LuxuryCard gradient="purple">
          <div className="p-8">
            <SectionHeader
              title="Actions Rapides"
              subtitle="Accédez rapidement à vos fonctionnalités"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/packages" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <Package className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Mes Colis</h3>
                  <p className="text-sm text-gray-600">Gérez et suivez vos colis</p>
                </div>
              </Link>

              <Link to="/calculateur" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Calculator className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Calculateur</h3>
                  <p className="text-sm text-gray-600">Estimez vos frais d'expédition</p>
                </div>
              </Link>

              <Link to="/support" className="group">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Support</h3>
                  <p className="text-sm text-gray-600">Contactez notre équipe</p>
                </div>
              </Link>
            </div>
          </div>
        </LuxuryCard>
      </div>
    </div>
  )
}
