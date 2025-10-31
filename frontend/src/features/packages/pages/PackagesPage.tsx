import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, Plus, Search, Filter, Eye, TruckIcon, Calendar } from 'lucide-react'
import {
  LuxuryCard,
  GlowButton,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatDate, formatWeight } from '@/shared/utils/format'
import { Package as PackageType, PaginatedResponse } from '@/shared/types'
import CreatePackageModal from '../components/CreatePackageModal'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    SHIPPED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    IN_TRANSIT: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    RECEIVED: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    ANNOUNCED: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ANNOUNCED: 'Annoncé',
    IN_TRANSIT: 'En transit',
    RECEIVED: 'Reçu',
    STORED: 'En stockage',
    QUOTE_REQUESTED: 'Devis demandé',
    QUOTE_READY: 'Devis prêt',
    PAID: 'Payé',
    PREPARING: 'Préparation',
    SHIPPED: 'Expédié',
    DELIVERED: 'Livré',
    CANCELLED: 'Annulé',
    RETURNED: 'Retourné'
  }
  return labels[status] || status
}

export default function PackagesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<PackageType>>({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await api.get('/packages')
      return response.data
    },
  })

  const filteredPackages = data?.data.filter(pkg =>
    pkg.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              📦 Mes Colis
            </h1>
            <p className="text-gray-600 text-lg">Gérez et suivez tous vos envois en temps réel</p>
          </div>
          <GlowButton onClick={() => setIsCreateModalOpen(true)} icon={<Plus className="w-5 h-5" />}>
            Nouveau Colis
          </GlowButton>
        </div>

        <CreatePackageModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Search & Filters */}
        <LuxuryCard gradient="blue">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de suivi ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm"
                />
              </div>
              <button className="px-6 py-3 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-colors flex items-center gap-2 bg-white/80 backdrop-blur-sm">
                <Filter className="w-5 h-5" />
                Filtres
              </button>
            </div>
          </div>
        </LuxuryCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{data?.data.length || 0}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="orange" className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">En transit</p>
              <p className="text-3xl font-bold text-orange-600">
                {data?.data.filter(p => p.status === 'IN_TRANSIT').length || 0}
              </p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Reçus</p>
              <p className="text-3xl font-bold text-purple-600">
                {data?.data.filter(p => p.status === 'RECEIVED').length || 0}
              </p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="gold" className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Livrés</p>
              <p className="text-3xl font-bold text-green-600">
                {data?.data.filter(p => p.status === 'DELIVERED').length || 0}
              </p>
            </div>
          </LuxuryCard>
        </div>

        {/* Packages List */}
        <div>
          <SectionHeader
            title="Liste des Colis"
            subtitle={`${filteredPackages.length} colis trouvés`}
          />

          {isLoading ? (
            <LuxuryCard>
              <div className="flex items-center justify-center py-16">
                <Package className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            </LuxuryCard>
          ) : filteredPackages.length === 0 ? (
            <LuxuryCard>
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'Aucun colis trouvé' : 'Aucun colis pour le moment'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm
                    ? 'Essayez avec un autre terme de recherche'
                    : 'Créez votre premier colis pour commencer'}
                </p>
                {!searchTerm && (
                  <GlowButton onClick={() => setIsCreateModalOpen(true)} icon={<Plus className="w-5 h-5" />}>
                    Créer un Colis
                  </GlowButton>
                )}
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => {
                const statusStyle = getStatusStyle(pkg.status)
                return (
                  <Link key={pkg.id} to={`/packages/${pkg.id}`}>
                    <LuxuryCard gradient="blue" className="group">
                      <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Package className="w-7 h-7 text-blue-600" />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {getStatusLabel(pkg.status)}
                          </span>
                        </div>

                        {/* Tracking Number */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Numéro de suivi</p>
                          <p className="font-mono font-bold text-gray-900 truncate">
                            {pkg.trackingNumber || 'Non assigné'}
                          </p>
                        </div>

                        {/* Description */}
                        {pkg.description && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Description</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{pkg.description}</p>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <TruckIcon className="w-3 h-3" />
                              Poids
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {pkg.weight ? formatWeight(pkg.weight) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Reçu le
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {pkg.receivedAt ? formatDate(pkg.receivedAt) : '-'}
                            </p>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <button className="w-full py-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-105">
                          <Eye className="w-4 h-4" />
                          Voir les détails
                        </button>
                      </div>
                    </LuxuryCard>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
