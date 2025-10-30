import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, CreditCard } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardContent } from '@/shared/components/ui/Card'
import api from '@/shared/lib/api'
import { formatCurrency } from '@/shared/utils/format'
import { Quote } from '@/shared/types'

interface AcceptQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  quote: Quote | null
}

export default function AcceptQuoteModal({ isOpen, onClose, quote }: AcceptQuoteModalProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const acceptQuoteMutation = useMutation({
    mutationFn: async () => {
      if (!quote) return
      const response = await api.post(`/quotes/${quote.id}/accept`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      onClose()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    },
  })

  if (!isOpen || !quote) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Accepter le devis</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transporteur</span>
                <span className="font-medium">{quote.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-medium">{quote.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Délai estimé</span>
                <span className="font-medium">{quote.estimatedDays} jours</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Prix total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(quote.price)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-md bg-blue-500/10 p-4 text-sm text-blue-600">
            <CreditCard className="mb-2 h-5 w-5" />
            <p className="font-medium">Paiement requis</p>
            <p className="mt-1 text-xs">
              En acceptant ce devis, vous serez redirigé vers la page de paiement.
              Le paiement sécurisé est traité via Stripe.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={acceptQuoteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => acceptQuoteMutation.mutate()}
              className="flex-1"
              disabled={acceptQuoteMutation.isPending}
            >
              {acceptQuoteMutation.isPending ? 'Traitement...' : 'Accepter et Payer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
