import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import {
  LuxuryCard,
  GlowButton,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { formatDate } from '@/shared/utils/format'
import { Ticket, PaginatedResponse } from '@/shared/types'
import CreateTicketModal from '../components/CreateTicketModal'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    OPEN: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: AlertCircle },
    RESOLVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
    CLOSED: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: XCircle },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: MessageSquare }
}

const getPriorityStyle = (priority: string) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    MEDIUM: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    URGENT: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }
  return styles[priority] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    OPEN: 'Ouvert',
    IN_PROGRESS: 'En cours',
    RESOLVED: 'Résolu',
    CLOSED: 'Fermé'
  }
  return labels[status] || status
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    LOW: 'Basse',
    MEDIUM: 'Moyenne',
    HIGH: 'Haute',
    URGENT: 'Urgente'
  }
  return labels[priority] || priority
}

export default function SupportPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data, isLoading } = useQuery<PaginatedResponse<Ticket>>({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/support/tickets')
      return response.data
    },
  })

  const tickets = data?.data || []

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              💬 Support
            </h1>
            <p className="text-gray-600 text-lg">Gérez vos tickets de support</p>
          </div>
          <GlowButton
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            Nouveau ticket
          </GlowButton>
        </div>

        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="gold" className="p-4">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600 mb-1">Ouverts</p>
              <p className="text-3xl font-bold text-yellow-600">
                {tickets.filter(t => t.status === 'OPEN').length}
              </p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">En cours</p>
              <p className="text-3xl font-bold text-blue-600">
                {tickets.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="orange" className="p-4">
            <div className="text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Résolus</p>
              <p className="text-3xl font-bold text-green-600">
                {tickets.filter(t => t.status === 'RESOLVED').length}
              </p>
            </div>
          </LuxuryCard>
        </div>

        {/* Tickets List */}
        <div>
          <SectionHeader
            title="Mes Tickets"
            subtitle={`${tickets.length} tickets au total`}
          />

          {isLoading ? (
            <LuxuryCard>
              <div className="flex items-center justify-center py-16">
                <MessageSquare className="h-12 w-12 animate-spin text-purple-600" />
              </div>
            </LuxuryCard>
          ) : tickets.length === 0 ? (
            <LuxuryCard>
              <div className="text-center py-16">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun ticket pour le moment</h3>
                <p className="text-gray-500 mb-6">Créez un ticket si vous avez besoin d'aide</p>
                <GlowButton
                  onClick={() => setIsCreateModalOpen(true)}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Créer un ticket
                </GlowButton>
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tickets.map((ticket) => {
                const statusStyle = getStatusStyle(ticket.status)
                const priorityStyle = getPriorityStyle(ticket.priority)
                const StatusIcon = statusStyle.icon

                return (
                  <LuxuryCard key={ticket.id} gradient="purple" className="group">
                    <div className="p-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <StatusIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ticket</p>
                            <p className="font-bold text-gray-900">#{ticket.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                        <p className="text-xs text-gray-500 mb-1">Sujet</p>
                        <p className="font-semibold text-gray-900">{ticket.subject}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-gray-500 mb-1">Priorité</p>
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                            {getPriorityLabel(ticket.priority)}
                          </span>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                          <p className="text-xs text-gray-500 mb-1">Créé le</p>
                          <p className="font-semibold text-gray-900 text-sm">{formatDate(ticket.createdAt)}</p>
                        </div>
                      </div>

                      {/* Updated */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200">
                        <p className="text-xs text-gray-500 mb-1">Dernière mise à jour</p>
                        <p className="font-semibold text-gray-900 text-sm">{formatDate(ticket.updatedAt)}</p>
                      </div>

                      {/* Action */}
                      <GlowButton
                        variant="secondary"
                        className="w-full justify-center"
                        icon={<MessageSquare className="w-5 h-5" />}
                      >
                        Voir les détails
                      </GlowButton>
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
