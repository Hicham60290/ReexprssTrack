import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import api from '@/shared/lib/api'
import { formatDateTime, formatWeight, formatDimensions } from '@/shared/utils/format'
import { Package as PackageType } from '@/shared/types'
import TrackingTimeline from '../components/TrackingTimeline'

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
      <div className="flex items-center justify-center py-8">
        <Package className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Colis non trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/packages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Détails du colis</h1>
          <p className="text-muted-foreground">{pkg.trackingNumber}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={pkg.status === 'DELIVERED' ? 'success' : 'default'}>
            {pkg.status}
          </Badge>
          {pkg.status === 'RECEIVED' && (
            <Button
              onClick={() => requestQuoteMutation.mutate()}
              disabled={requestQuoteMutation.isPending}
            >
              <FileText className="mr-2 h-4 w-4" />
              {requestQuoteMutation.isPending ? 'Demande en cours...' : 'Demander des devis'}
            </Button>
          )}
        </div>
      </div>

      {quoteSuccess && (
        <div className="rounded-md bg-green-500/10 p-4 text-green-600">
          ✅ Demande de devis envoyée ! Consultez la page "Mes devis" pour voir les offres.
        </div>
      )}

      {requestQuoteMutation.isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          ❌ {(requestQuoteMutation.error as any)?.response?.data?.message || 'Une erreur est survenue'}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Numéro de suivi</p>
              <p className="text-lg font-semibold">{pkg.trackingNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p>{pkg.description || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <Badge variant={pkg.status === 'DELIVERED' ? 'success' : 'default'}>
                {pkg.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dimensions et poids</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Poids</p>
              <p>{pkg.weight ? formatWeight(pkg.weight) : '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
              <p>{pkg.dimensions ? formatDimensions(pkg.dimensions) : '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de création</p>
              <p>{formatDateTime(pkg.createdAt)}</p>
            </div>
            {pkg.receivedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de réception</p>
                <p>{formatDateTime(pkg.receivedAt)}</p>
              </div>
            )}
            {pkg.shippedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date d'expédition</p>
                <p>{formatDateTime(pkg.shippedAt)}</p>
              </div>
            )}
            {pkg.deliveredAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de livraison</p>
                <p>{formatDateTime(pkg.deliveredAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tracking Timeline */}
      {pkg.trackingNumber && (
        <TrackingTimeline packageId={pkg.id} trackingNumber={pkg.trackingNumber} />
      )}
    </div>
  )
}
