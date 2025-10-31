import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, TruckIcon, Clock, DollarSign, CheckCircle2, XCircle, Calendar } from 'lucide-react'
import {
  LuxuryCard,
  GlowButton,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Quote, PaginatedResponse } from '@/shared/types'
import AcceptQuoteModal from '../components/AcceptQuoteModal'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    READY: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    EXPIRED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
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

export default function QuotesPage() {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)

  const { data, isLoading } = useQuery<PaginatedResponse<Quote>>({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await api.get('/quotes')
      return response.data
    },
  })

  const handleAcceptClick = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsAcceptModalOpen(true)
  }

  const quotes = data?.data || []

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            💰 Mes Devis
          </h1>
          <p className="text-gray-600 text-lg">Consultez et gérez vos devis d'expédition</p>
        </div>

        <AcceptQuoteModal
          quote={selectedQuote}
          isOpen={isAcceptModalOpen}
          onClose={() => {
            setIsAcceptModalOpen(false)
            setSelectedQuote(null)
          }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{quotes.length}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="gold" className="p-4">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-3xl font-bold text-yellow-600">
                {quotes.filter(q => q.status === 'PENDING').length}
              </p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Prêts</p>
              <p className="text-3xl font-bold text-green-600">
                {quotes.filter(q => q.status === 'READY').length}
              </p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="orange" className="p-4">
            <div className="text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-gray-600 mb-1">Expirés</p>
              <p className="text-3xl font-bold text-red-600">
                {quotes.filter(q => q.status === 'EXPIRED').length}
              </p>
            </div>
          </LuxuryCard>
        </div>

        {/* Quotes List */}
        <div>
          <SectionHeader
            title="Liste des Devis"
            subtitle={`${quotes.length} devis disponibles`}
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
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun devis pour le moment</h3>
                <p className="text-gray-500 mb-6">Les devis apparaîtront ici une fois que vos colis seront reçus</p>
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quotes.map((quote) => {
                const statusStyle = getStatusStyle(quote.status)
                return (
                  <LuxuryCard key={quote.id} gradient="blue" className="group">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <TruckIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Devis</p>
                            <p className="font-bold text-gray-900">#{quote.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </div>

                      {/* Quote Details */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Transporteur</p>
                            <p className="font-semibold text-gray-900">{quote.carrier}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Service</p>
                            <p className="font-semibold text-gray-900">{quote.serviceName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Délai
                            </p>
                            <p className="font-semibold text-gray-900">{quote.estimatedDays} jours</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expire le
                            </p>
                            <p className="font-semibold text-gray-900">{formatDate(quote.expiresAt)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600">Prix total</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">{formatCurrency(quote.price)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {quote.status === 'READY' && (
                        <GlowButton
                          onClick={() => handleAcceptClick(quote)}
                          variant="success"
                          className="w-full justify-center"
                          icon={<CheckCircle2 className="w-5 h-5" />}
                        >
                          Accepter le Devis
                        </GlowButton>
                      )}

                      {quote.status === 'ACCEPTED' && (
                        <button className="w-full py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold rounded-xl border-2 border-blue-200">
                          ✅ Devis accepté
                        </button>
                      )}
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
