import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Package as PackageIcon,
  FileText,
  Scale,
  Ruler,
  Calendar,
  MapPin,
  Truck,
  CheckCircle2
} from 'lucide-react'
import {
  LuxuryCard,
  GlowButton,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatDateTime, formatWeight, formatDimensions } from '@/shared/utils/format'
import { Package as PackageType } from '@/shared/types'
import TrackingTimeline from '../components/TrackingTimeline'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; icon: any }> = {
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
    SHIPPED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck },
    IN_TRANSIT: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck },
    RECEIVED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: MapPin },
    ANNOUNCED: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: PackageIcon },
  }
  return styles[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: PackageIcon }
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

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [quoteSuccess, setQuoteSuccess] = useState(false)

  const { data: pkg, isLoading } = useQuery<PackageType>({
    queryKey: ['package', id],
    queryFn: async () => {
      const response = await api.get(`/packages/${id}`)
      return response.data
    },
    enabled: !!id,
  })

  const requestQuoteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/quotes/${id}`)
      return response.data
    },
    onSuccess: () => {
      setQuoteSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      setTimeout(() => setQuoteSuccess(false), 3000)
    },
  })

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center py-16">
          <PackageIcon className="h-16 w-16 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative z-10 text-center py-16">
          <PackageIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Colis non trouvé</h2>
          <p className="text-gray-500 mb-6">Ce colis n'existe pas ou a été supprimé</p>
          <Link to="/packages">
            <GlowButton icon={<ArrowLeft className="w-5 h-5" />}>
              Retour aux colis
            </GlowButton>
          </Link>
        </div>
      </div>
    )
  }

  const statusStyle = getStatusStyle(pkg.status)
  const StatusIcon = statusStyle.icon

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/packages">
            <button className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour aux colis</span>
            </button>
          </Link>
        </div>

        {/* Title & Status */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-orange-600 bg-clip-text text-transparent mb-2">
              📦 Détails du Colis
            </h1>
            <p className="text-gray-600 text-lg font-mono">{pkg.trackingNumber || 'Sans numéro de suivi'}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-2xl ${statusStyle.bg} border-2 border-white shadow-lg flex items-center gap-2`}>
              <StatusIcon className={`w-5 h-5 ${statusStyle.text}`} />
              <span className={`font-bold ${statusStyle.text}`}>{getStatusLabel(pkg.status)}</span>
            </div>

            {pkg.status === 'RECEIVED' && (
              <GlowButton
                onClick={() => requestQuoteMutation.mutate()}
                disabled={requestQuoteMutation.isPending}
                icon={<FileText className="w-5 h-5" />}
              >
                {requestQuoteMutation.isPending ? 'Demande en cours...' : 'Demander des devis'}
              </GlowButton>
            )}
          </div>
        </div>

        {/* Success Message */}
        {quoteSuccess && (
          <LuxuryCard gradient="gold" className="border-2 border-green-200">
            <div className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <p className="text-green-700 font-semibold">
                ✅ Demande de devis envoyée ! Consultez la page "Mes devis" pour voir les offres.
              </p>
            </div>
          </LuxuryCard>
        )}

        {/* Error Message */}
        {requestQuoteMutation.isError && (
          <LuxuryCard gradient="orange" className="border-2 border-red-200">
            <div className="p-4">
              <p className="text-red-700 font-semibold">
                ❌ {(requestQuoteMutation.error as any)?.response?.data?.message || 'Une erreur est survenue'}
              </p>
            </div>
          </LuxuryCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Details Card */}
            <LuxuryCard gradient="blue">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <PackageIcon className="w-6 h-6 text-blue-600" />
                  Informations du Colis
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tracking Number */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-gray-500 mb-2">Numéro de suivi</p>
                    <p className="font-mono font-bold text-gray-900 break-all">
                      {pkg.trackingNumber || 'Non assigné'}
                    </p>
                  </div>

                  {/* Weight */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <Scale className="w-4 h-4" />
                      Poids
                    </p>
                    <p className="font-bold text-gray-900">
                      {pkg.weight ? formatWeight(pkg.weight) : 'Non renseigné'}
                    </p>
                  </div>

                  {/* Dimensions */}
                  {pkg.dimensions && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                        <Ruler className="w-4 h-4" />
                        Dimensions
                      </p>
                      <p className="font-bold text-gray-900">{formatDimensions(pkg.dimensions)}</p>
                    </div>
                  )}

                  {/* Description */}
                  {pkg.description && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 md:col-span-2">
                      <p className="text-sm text-gray-500 mb-2">Description</p>
                      <p className="text-gray-900">{pkg.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </LuxuryCard>

            {/* Tracking Timeline */}
            {pkg.trackingNumber && (
              <TrackingTimeline packageId={pkg.id} trackingNumber={pkg.trackingNumber} />
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Dates Card */}
            <LuxuryCard gradient="purple">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Dates Importantes
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Date de création</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(pkg.createdAt)}</p>
                  </div>
                  {pkg.receivedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date de réception</p>
                      <p className="font-semibold text-gray-900">{formatDateTime(pkg.receivedAt)}</p>
                    </div>
                  )}
                  {pkg.shippedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date d'expédition</p>
                      <p className="font-semibold text-gray-900">{formatDateTime(pkg.shippedAt)}</p>
                    </div>
                  )}
                  {pkg.deliveredAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date de livraison</p>
                      <p className="font-semibold text-gray-900">{formatDateTime(pkg.deliveredAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </LuxuryCard>

            {/* Quick Actions Card */}
            <LuxuryCard gradient="orange">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h3>

                <div className="space-y-3">
                  {pkg.status === 'RECEIVED' && (
                    <GlowButton
                      onClick={() => requestQuoteMutation.mutate()}
                      disabled={requestQuoteMutation.isPending}
                      icon={<FileText className="w-5 h-5" />}
                      className="w-full justify-center"
                    >
                      Demander un Devis
                    </GlowButton>
                  )}

                  <Link to="/quotes" className="block">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-purple-50 hover:from-orange-100 hover:to-purple-100 text-orange-700 font-semibold rounded-xl transition-all duration-300 border border-orange-200">
                      Voir mes devis
                    </button>
                  </Link>

                  <Link to="/support" className="block">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-semibold rounded-xl transition-all duration-300 border border-blue-200">
                      Contacter le support
                    </button>
                  </Link>
                </div>
              </div>
            </LuxuryCard>
          </div>
        </div>
      </div>
    </div>
  )
}
