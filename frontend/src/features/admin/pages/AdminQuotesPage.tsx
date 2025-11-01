import { useQuery } from '@tanstack/react-query'
import { FileText, Truck, Clock, CheckCircle, XCircle, DollarSign, Calendar, Package as PackageIcon } from 'lucide-react'
import {
  LuxuryCard,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Quote, PaginatedResponse } from '@/shared/types'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    READY: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle },
    EXPIRED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: FileText }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    READY: 'Prêt',
    ACCEPTED: 'Accepté',
    EXPIRED: 'Expiré'
  }
  return labels[status] || status
}

export default function AdminQuotesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Quote>>({
    queryKey: ['admin-quotes'],
    queryFn: async () => {
      const response = await api.get('/admin/quotes')
      return response.data
    },
  })

  const quotes = data?.data || []
  const totalQuotes = quotes.length
  const readyQuotes = quotes.filter(q => q.status === 'READY').length
  const acceptedQuotes = quotes.filter(q => q.status === 'ACCEPTED').length

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 animate-shimmer">
            💰 Gestion des devis
          </h1>
          <p className="text-gray-600 text-lg">Gérez tous les devis de la plateforme</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{totalQuotes}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Prêts</p>
              <p className="text-3xl font-bold text-green-600">{readyQuotes}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="gold" className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Acceptés</p>
              <p className="text-3xl font-bold text-blue-600">{acceptedQuotes}</p>
            </div>
          </LuxuryCard>
        </div>

        {/* Quotes List */}
        <div>
          <SectionHeader
            title="Liste des devis"
            subtitle={`${totalQuotes} devis générés`}
          />

          {isLoading ? (
            <LuxuryCard>
              <div className="flex items-center justify-center py-16">
                <FileText className="h-12 w-12 animate-spin text-green-600" />
              </div>
            </LuxuryCard>
          ) : quotes.length === 0 ? (
            <LuxuryCard>
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun devis</h3>
                <p className="text-gray-500">Aucun devis trouvé dans le système</p>
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quotes.map((quote) => {
                const statusStyle = getStatusStyle(quote.status)
                const StatusIcon = statusStyle.icon

                return (
                  <LuxuryCard key={quote.id} gradient="blue" className="group">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <StatusIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Devis</p>
                            <p className="font-bold text-gray-900 font-mono">#{quote.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </div>

                      {/* Package ID */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100 flex items-center gap-2">
                        <PackageIcon className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">ID Colis</p>
                          <p className="font-semibold text-gray-900 font-mono">#{quote.packageId.slice(0, 8)}</p>
                        </div>
                      </div>

                      {/* Carrier & Service */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-gray-500">Transporteur</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{quote.carrier}</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-gray-500">Service</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm truncate">{quote.serviceName}</p>
                        </div>
                      </div>

                      {/* Price & Delivery */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <p className="text-xs text-gray-500">Prix</p>
                          </div>
                          <p className="font-bold text-green-600 text-xl">{formatCurrency(quote.price)}</p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <p className="text-xs text-gray-500">Délai estimé</p>
                          </div>
                          <p className="font-bold text-blue-600 text-xl">{quote.estimatedDays}j</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Créé le</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(quote.createdAt)}</p>
                        </div>

                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-3 border border-red-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-gray-600">Expire le</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(quote.expiresAt)}</p>
                        </div>
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
