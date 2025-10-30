import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nouveau Ticket</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Sujet *</Label>
            <Input
              id="subject"
              placeholder="Question sur mon colis"
              {...register('subject')}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Décrivez votre problème..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorité *</Label>
            <select
              id="priority"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('priority')}
            >
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
              <option value="URGENT">Urgente</option>
            </select>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createTicketMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending ? 'Création...' : 'Créer le ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
