import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, MessageSquare, AlertCircle } from 'lucide-react'
import { GlowButton } from '@/shared/components/ui/LuxuryComponents'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import api from '@/shared/lib/api'

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
})

type CreateTicketFormData = z.infer<typeof createTicketSchema>

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateTicketModal({ isOpen, onClose }: CreateTicketModalProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  })

  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketFormData) => {
      const response = await api.post('/support/tickets', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      reset()
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    },
  })

  const onSubmit = (data: CreateTicketFormData) => {
    setError(null)
    createTicketMutation.mutate(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-3xl glass border-2 border-white/40 shadow-2xl backdrop-blur-xl bg-white/90 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nouveau Ticket</h2>
                <p className="text-purple-100 text-sm">Contactez notre support</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && (
            <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 text-sm">Erreur</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-900 font-semibold">
              Sujet <span className="text-purple-600">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Ex: Question sur mon colis #12345"
              {...register('subject')}
              className="glass border-2 border-purple-200 focus:border-purple-500 rounded-xl h-12 text-base"
            />
            {errors.subject && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 font-semibold">
              Description <span className="text-purple-600">*</span>
            </Label>
            <textarea
              id="description"
              rows={5}
              className="flex w-full rounded-xl border-2 border-purple-200 glass px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder="Décrivez votre problème en détail..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Priority Field */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-gray-900 font-semibold">
              Priorité <span className="text-purple-600">*</span>
            </Label>
            <select
              id="priority"
              className="flex h-12 w-full rounded-xl border-2 border-purple-200 glass px-4 text-base ring-offset-background focus-visible:outline-none focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('priority')}
            >
              <option value="LOW">🟢 Faible - Question générale</option>
              <option value="MEDIUM">🟡 Moyenne - Besoin d'assistance</option>
              <option value="HIGH">🟠 Haute - Problème important</option>
              <option value="URGENT">🔴 Urgente - Problème critique</option>
            </select>
            {errors.priority && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createTicketMutation.isPending}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <GlowButton
              type="submit"
              className="flex-1 justify-center"
              disabled={createTicketMutation.isPending}
              icon={<MessageSquare className="w-5 h-5" />}
            >
              {createTicketMutation.isPending ? 'Création...' : 'Créer le ticket'}
            </GlowButton>
          </div>
        </form>

        {/* Info Footer */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-100 p-4">
          <p className="text-xs text-center text-gray-600">
            💡 Notre équipe vous répondra dans les plus brefs délais
          </p>
        </div>
      </div>
    </div>
  )
}
