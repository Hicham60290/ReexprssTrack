import { useQuery } from '@tanstack/react-query'
import { Package as PackageIcon, Truck, CheckCircle, XCircle, Clock, Box, Calendar, Scale } from 'lucide-react'
import {
  LuxuryCard,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatDate, formatWeight } from '@/shared/utils/format'
import { Package as PackageType, PaginatedResponse } from '@/shared/types'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    RECEIVED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Box },
    READY_TO_SHIP: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: PackageIcon },
    SHIPPED: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Truck },
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: PackageIcon }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    RECEIVED: 'Reçu',
    READY_TO_SHIP: 'Prêt à expédier',
    SHIPPED: 'Expédié',
    DELIVERED: 'Livré',
    CANCELLED: 'Annulé'
  }
  return labels[status] || status
}

export default function AdminPackagesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<PackageType>>({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const response = await api.get('/admin/packages')
      return response.data
    },
  })

  const packages = data?.data || []
  const totalPackages = packages.length
  const deliveredPackages = packages.filter(p => p.status === 'DELIVERED').length
  const shippedPackages = packages.filter(p => p.status === 'SHIPPED').length

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-shimmer">
            📦 Gestion des colis
          </h1>
          <p className="text-gray-600 text-lg">Gérez tous les colis de la plateforme</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LuxuryCard gradient="orange" className="p-4">
            <div className="text-center">
              <PackageIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-orange-600">{totalPackages}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Expédiés</p>
              <p className="text-3xl font-bold text-blue-600">{shippedPackages}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Livrés</p>
              <p className="text-3xl font-bold text-green-600">{deliveredPackages}</p>
            </div>
          </LuxuryCard>
        </div>

        {/* Packages List */}
        <div>
          <SectionHeader
            title="Liste des colis"
            subtitle={`${totalPackages} colis enregistrés`}
          />

          {isLoading ? (
            <LuxuryCard>
              <div className="flex items-center justify-center py-16">
                <PackageIcon className="h-12 w-12 animate-spin text-orange-600" />
              </div>
            </LuxuryCard>
          ) : packages.length === 0 ? (
            <LuxuryCard>
              <div className="text-center py-16">
                <PackageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun colis</h3>
                <p className="text-gray-500">Aucun colis trouvé dans le système</p>
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {packages.map((pkg) => {
                const statusStyle = getStatusStyle(pkg.status)
                const StatusIcon = statusStyle.icon

                return (
                  <LuxuryCard key={pkg.id} gradient="orange" className="group">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <StatusIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">ID Colis</p>
                            <p className="font-bold text-gray-900 font-mono">#{pkg.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {getStatusLabel(pkg.status)}
                        </span>
                      </div>

                      {/* Tracking Number */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                        <p className="text-xs text-gray-500 mb-1">Numéro de suivi</p>
                        <p className="font-bold text-gray-900 font-mono text-lg">{pkg.trackingNumber || 'Non défini'}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-orange-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Box className="w-4 h-4 text-orange-600" />
                            <p className="text-xs text-gray-500">Description</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm truncate">{pkg.description || 'Non renseigné'}</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-orange-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Scale className="w-4 h-4 text-orange-600" />
                            <p className="text-xs text-gray-500">Poids</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {pkg.weight ? formatWeight(pkg.weight) : 'Non pesé'}
                          </p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-gray-600">Créé le</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(pkg.createdAt)}</p>
                        </div>

                        {pkg.receivedAt && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">Reçu le</span>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">{formatDate(pkg.receivedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </LuxuryCard>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
