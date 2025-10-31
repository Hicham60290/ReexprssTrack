import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package as PackageIcon,
  MapPin,
  Clock,
  TruckIcon,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Search
} from 'lucide-react'
import api from '@/shared/lib/api'
import { Input } from '@/shared/components/ui/Input'

interface TrackingEvent {
  id: string
  eventType: string
  description: string
  location: string
  timestamp: string
  rawData?: any
}

interface Package {
  id: string
  trackingNumber: string
  carrier?: number
  carrierName?: string
  tracking17TrackEnabled: boolean
  description: string
  status: string
  weight?: number
  trackingEvents: TrackingEvent[]
  createdAt: string
  updatedAt: string
}

export default function TrackingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  // Fetch user's packages with 17Track enabled by admin
  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ['packages-with-tracking'],
    queryFn: async () => {
      const response = await api.get('/packages', {
        params: { limit: 100 }
      })
      // Filter only packages with 17Track enabled by admin
      return response.data.data.filter((pkg: Package) => pkg.trackingNumber && pkg.tracking17TrackEnabled)
    }
  })

  // Sync tracking mutation
  const syncTrackingMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const response = await api.post(`/packages/${packageId}/tracking/sync`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages-with-tracking'] })
    }
  })

  const filteredPackages = packages?.filter(pkg =>
    pkg.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ANNOUNCED: 'from-blue-500 to-cyan-500',
      IN_TRANSIT: 'from-orange-500 to-yellow-500',
      RECEIVED: 'from-green-500 to-emerald-500',
      SHIPPED: 'from-purple-500 to-indigo-500',
      DELIVERED: 'from-green-600 to-teal-600',
    }
    return colors[status] || 'from-gray-500 to-gray-600'
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      ANNOUNCED: <Clock className="w-5 h-5" />,
      IN_TRANSIT: <TruckIcon className="w-5 h-5" />,
      RECEIVED: <PackageIcon className="w-5 h-5" />,
      SHIPPED: <TruckIcon className="w-5 h-5" />,
      DELIVERED: <CheckCircle className="w-5 h-5" />,
    }
    return icons[status] || <AlertCircle className="w-5 h-5" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {/* Animated Background with Bubbles */}
      <div className="fixed inset-0 -z-10">
        {/* Large gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* 3D Animated Bubbles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble-float"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              background: `radial-gradient(circle at 30% 30%, ${
                ['rgba(255,200,150,0.2)', 'rgba(200,150,255,0.2)', 'rgba(150,200,255,0.2)'][
                  Math.floor(Math.random() * 3)
                ]
              }, transparent)`,
              animationDuration: `${Math.random() * 15 + 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              filter: 'blur(2px)'
            }}
          >
            <div className="w-full h-full rounded-full animate-bubble-3d"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 animate-float">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 border-2 border-white/40">
            <TruckIcon className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">Suivi de Colis</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Suivez vos colis
            </span>
          </h1>

          <p className="text-xl text-gray-600">
            Suivi en temps réel de tous vos envois
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-float animation-delay-1000">
          <div className="glass rounded-3xl p-2 border-2 border-white/40 shadow-xl max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Rechercher par numéro de suivi ou description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-white/50 border-none rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="glass rounded-3xl p-12 inline-block border-2 border-white/40">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Chargement...</p>
            </div>
          </div>
        )}

        {/* No Packages */}
        {!isLoading && (!filteredPackages || filteredPackages.length === 0) && (
          <div className="text-center py-16 animate-float">
            <div className="glass rounded-3xl p-12 inline-block border-2 border-white/40">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Aucun colis à suivre
              </h3>
              <p className="text-gray-600 text-lg">
                {searchQuery
                  ? 'Aucun colis ne correspond à votre recherche'
                  : 'Les colis avec suivi 17Track activé par l\'administrateur apparaîtront ici'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  💡 Ajoutez votre numéro de suivi lors de la déclaration de votre colis. L'admin l'activera pour le suivi en temps réel.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Packages List */}
        <div className="grid gap-6">
          {filteredPackages?.map((pkg, index) => (
            <div
              key={pkg.id}
              className="glass rounded-3xl p-6 border-2 border-white/40 hover:scale-[1.01] transition-all duration-300 shadow-lg hover:shadow-2xl animate-float"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Package Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${getStatusColor(pkg.status)} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    {getStatusIcon(pkg.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {pkg.trackingNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getStatusColor(pkg.status)}`}>
                        {pkg.status}
                      </span>
                    </div>
                    {pkg.description && (
                      <p className="text-gray-600">{pkg.description}</p>
                    )}
                    {pkg.carrierName && (
                      <p className="text-sm text-gray-500 mt-1">
                        Transporteur : {pkg.carrierName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sync Button */}
                <button
                  onClick={() => syncTrackingMutation.mutate(pkg.id)}
                  disabled={syncTrackingMutation.isPending}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
                    <RefreshCw className={`w-5 h-5 ${syncTrackingMutation.isPending ? 'animate-spin' : ''}`} />
                    Actualiser
                  </div>
                </button>
              </div>

              {/* Tracking Events */}
              {pkg.trackingEvents && pkg.trackingEvents.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-gray-900">Historique de suivi</h4>
                  </div>

                  <div className="space-y-3">
                    {pkg.trackingEvents.map((event, idx) => (
                      <div
                        key={event.id}
                        className="glass-dark rounded-2xl p-4 border border-white/20 hover:bg-white/80 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            idx === 0
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                            {idx === 0 ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <Clock className="w-5 h-5 text-white" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                              <p className="font-semibold text-gray-900">
                                {event.eventType}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(event.timestamp)}
                              </p>
                            </div>

                            {event.description && (
                              <p className="text-gray-700 mb-2">{event.description}</p>
                            )}

                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-dark rounded-2xl p-8 text-center border border-white/20">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Aucun événement de suivi pour le moment
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Cliquez sur "Actualiser" pour synchroniser avec le transporteur
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
