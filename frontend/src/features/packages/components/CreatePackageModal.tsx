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

const createPackageSchema = z.object({
  trackingNumber: z.string().min(5, 'Le numéro de suivi doit contenir au moins 5 caractères'),
  description: z.string().optional(),
  weight: z.number().min(0.1, 'Le poids doit être supérieur à 0').optional(),
  length: z.number().min(1, 'La longueur doit être supérieure à 0').optional(),
  width: z.number().min(1, 'La largeur doit être supérieure à 0').optional(),
  height: z.number().min(1, 'La hauteur doit être supérieure à 0').optional(),
})

type CreatePackageFormData = z.infer<typeof createPackageSchema>

interface CreatePackageModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreatePackageModal({ isOpen, onClose }: CreatePackageModalProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePackageFormData>({
    resolver: zodResolver(createPackageSchema),
  })

  const createPackageMutation = useMutation({
    mutationFn: async (data: CreatePackageFormData) => {
      const payload = {
        trackingNumber: data.trackingNumber,
        description: data.description || undefined,
        weight: data.weight || undefined,
        dimensions:
          data.length && data.width && data.height
            ? {
                length: data.length,
                width: data.width,
                height: data.height,
              }
            : undefined,
      }
      const response = await api.post('/packages', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      reset()
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    },
  })

  const onSubmit = (data: CreatePackageFormData) => {
    setError(null)
    createPackageMutation.mutate(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nouveau Colis</h2>
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
            <Label htmlFor="trackingNumber">Numéro de suivi *</Label>
            <Input
              id="trackingNumber"
              placeholder="1Z999AA10123456784"
              {...register('trackingNumber')}
            />
            {errors.trackingNumber && (
              <p className="text-sm text-destructive">{errors.trackingNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Description du colis"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Poids (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="2.5"
              {...register('weight', { valueAsNumber: true })}
            />
            {errors.weight && (
              <p className="text-sm text-destructive">{errors.weight.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Longueur"
                  {...register('length', { valueAsNumber: true })}
                />
                {errors.length && (
                  <p className="text-xs text-destructive">{errors.length.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Largeur"
                  {...register('width', { valueAsNumber: true })}
                />
                {errors.width && (
                  <p className="text-xs text-destructive">{errors.width.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Hauteur"
                  {...register('height', { valueAsNumber: true })}
                />
                {errors.height && (
                  <p className="text-xs text-destructive">{errors.height.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createPackageMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={createPackageMutation.isPending}>
              {createPackageMutation.isPending ? 'Création...' : 'Créer le colis'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
