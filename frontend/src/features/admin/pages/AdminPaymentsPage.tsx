import { useQuery } from '@tanstack/react-query'
import { CreditCard, DollarSign, CheckCircle, XCircle, Clock, RefreshCw, Calendar, FileText } from 'lucide-react'
import {
  LuxuryCard,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Payment, PaginatedResponse } from '@/shared/types'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: RefreshCw },
    SUCCEEDED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    FAILED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle },
    REFUNDED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: RefreshCw },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: CreditCard }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    PROCESSING: 'En cours',
    SUCCEEDED: 'Réussi',
    FAILED: 'Échoué',
    CANCELLED: 'Annulé',
    REFUNDED: 'Remboursé'
  }
  return labels[status] || status
}

export default function AdminPaymentsPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Payment>>({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const response = await api.get('/admin/payments')
      return response.data
    },
  })

  const payments = data?.data || []
  const totalPayments = payments.length
  const succeededPayments = payments.filter(p => p.status === 'SUCCEEDED').length
  const failedPayments = payments.filter(p => p.status === 'FAILED').length
  const totalRevenue = payments
    .filter(p => p.status === 'SUCCEEDED')
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 animate-shimmer">
            💳 Gestion des paiements
          </h1>
          <p className="text-gray-600 text-lg">Gérez tous les paiements de la plateforme</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{totalPayments}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Réussis</p>
              <p className="text-3xl font-bold text-green-600">{succeededPayments}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="orange" className="p-4">
            <div className="text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-gray-600 mb-1">Échoués</p>
              <p className="text-3xl font-bold text-red-600">{failedPayments}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="gold" className="p-4">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm text-gray-600 mb-1">Revenus</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </LuxuryCard>
        </div>

        {/* Payments List */}
        <div>
          <SectionHeader
            title="Liste des paiements"
            subtitle={`${totalPayments} transactions enregistrées`}
          />

          {isLoading ? (
            <LuxuryCard>
              <div className="flex items-center justify-center py-16">
                <CreditCard className="h-12 w-12 animate-spin text-emerald-600" />
              </div>
            </LuxuryCard>
          ) : payments.length === 0 ? (
            <LuxuryCard>
              <div className="text-center py-16">
                <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun paiement</h3>
                <p className="text-gray-500">Aucun paiement trouvé dans le système</p>
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {payments.map((payment) => {
                const statusStyle = getStatusStyle(payment.status)
                const StatusIcon = statusStyle.icon

                return (
                  <LuxuryCard key={payment.id} gradient="blue" className="group">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            payment.status === 'SUCCEEDED'
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : payment.status === 'FAILED'
                              ? 'bg-gradient-to-br from-red-500 to-pink-600'
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            <StatusIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Paiement</p>
                            <p className="font-bold text-gray-900 font-mono">#{payment.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </div>

                      {/* Amount - Big Display */}
                      <div className={`rounded-2xl p-6 border-2 text-center ${
                        payment.status === 'SUCCEEDED'
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                          : payment.status === 'FAILED'
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                      }`}>
                        <p className="text-xs text-gray-500 mb-1">Montant</p>
                        <p className={`text-4xl font-bold ${
                          payment.status === 'SUCCEEDED'
                            ? 'text-green-600'
                            : payment.status === 'FAILED'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>

                      {/* Quote ID */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">ID Devis</p>
                          <p className="font-semibold text-gray-900 font-mono">#{payment.quoteId.slice(0, 8)}</p>
                        </div>
                      </div>

                      {/* Stripe Payment Intent ID */}
                      {payment.stripePaymentIntentId && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100">
                          <p className="text-xs text-gray-500 mb-1">Stripe Payment ID</p>
                          <p className="font-mono text-xs text-gray-900 truncate">
                            {payment.stripePaymentIntentId}
                          </p>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Créé le</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(payment.createdAt)}</p>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-600">Mis à jour le</span>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(payment.updatedAt)}</p>
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
