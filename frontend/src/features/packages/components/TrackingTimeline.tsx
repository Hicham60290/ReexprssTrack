import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Package,
  MapPin,
  Calendar,
  RefreshCw,
  CheckCircle,
  Truck,
  AlertCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import api from '@/shared/lib/api'

interface TrackingEvent {
  id: string
  eventType: string
  description: string
  location?: string
  timestamp: string
  rawData?: any
}

interface TrackingTimelineProps {
  packageId: string
  trackingNumber?: string
}

export default function TrackingTimeline({ packageId, trackingNumber }: TrackingTimelineProps) {
  const [syncing, setSyncing] = useState(false)
  const queryClient = useQueryClient()

  // Fetch tracking events
  const { data: events = [], isLoading } = useQuery<TrackingEvent[]>({
    queryKey: ['package-tracking', packageId],
    queryFn: async () => {
      const response = await api.get(`/packages/${packageId}/tracking`)
      return response.data
    },
    enabled: !!packageId,
  })

  // Sync with 17Track mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/packages/${packageId}/tracking/sync`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-tracking', packageId] })
      queryClient.invalidateQueries({ queryKey: ['package', packageId] })
    },
  })

  const handleSync = async () => {
    if (!trackingNumber) {
      alert('Aucun numéro de suivi disponible')
      return
    }

    setSyncing(true)
    try {
      await syncMutation.mutateAsync()
      alert('Synchronisation réussie !')
    } catch (error: any) {
      console.error('Sync error:', error)
      alert(error.response?.data?.error || 'Erreur lors de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'IN_TRANSIT':
      case 'UPDATE':
        return <Truck className="w-5 h-5 text-blue-600" />
      case 'ALERT':
      case 'EXCEPTION':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Package className="w-5 h-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Suivi du colis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Suivi du colis
          </CardTitle>
          {trackingNumber && (
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Synchroniser
                </>
              )}
            </Button>
          )}
        </div>
        {trackingNumber && (
          <p className="text-sm text-gray-600 mt-2">
            Numéro de suivi : <span className="font-mono font-semibold">{trackingNumber}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">
              Aucun événement de suivi disponible
            </p>
            {trackingNumber && (
              <Button onClick={handleSync} disabled={syncing} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Synchroniser avec 17Track
              </Button>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Events */}
            <div className="space-y-6">
              {events.map((event, index) => (
                <div key={event.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getEventIcon(event.eventType)}
                  </div>

                  {/* Event card */}
                  <div
                    className={`rounded-lg border p-4 ${
                      index === 0
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {event.description || event.eventType}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.location}
                      </div>
                    )}

                    {event.eventType && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {event.eventType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info footer */}
        {events.length > 0 && (
          <div className="mt-6 pt-4 border-t text-sm text-gray-600">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Dernière mise à jour : {formatDate(events[0]?.timestamp || new Date().toISOString())}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Les données de suivi sont fournies par 17Track et peuvent prendre quelques minutes pour se mettre à jour.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
