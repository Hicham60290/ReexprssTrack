import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package as PackageIcon,
  ArrowLeft,
  Upload,
  Calculator,
  Check,
  Truck,
  Box,
  Image as ImageIcon,
  X,
  Scale,
  Ruler,
  MapPin,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react'
import {
  LuxuryCard,
  AnimatedBackground,
  GlowButton
} from '@/shared/components/ui/LuxuryComponents'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import api from '@/shared/lib/api'
import { formatDate, formatWeight } from '@/shared/utils/format'
import { Package } from '@/shared/types'

const getStatusStyle = (status: string) => {
  const styles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    ANNOUNCED: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Annoncé' },
    IN_TRANSIT: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'En transit' },
    RECEIVED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Reçu' },
    STORED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Stocké' },
    QUOTE_REQUESTED: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Devis demandé' },
    QUOTE_READY: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Devis prêt' },
    PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Payé' },
    PREPARING: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'En préparation' },
    SHIPPED: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', label: 'Expédié' },
    DELIVERED: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Livré' },
    CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Annulé' },
    RETURNED: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', label: 'Retourné' },
  }
  return styles[status] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status }
}

export default function AdminPackageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showCalculator, setShowCalculator] = useState(false)

  // Form states
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [destination, setDestination] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  // Fetch package details
  const { data: pkg, isLoading } = useQuery<Package>({
    queryKey: ['admin-package', id],
    queryFn: async () => {
      const response = await api.get(`/admin/packages/${id}`)
      return response.data
    },
  })

  // Upload photos mutation
  const uploadPhotosMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      const response = await api.post(`/packages/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package', id] })
      setSelectedFiles([])
    },
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.put(`/admin/packages/${id}/status`, { status })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package', id] })
    },
  })

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async () => {
      // First update package with dimensions
      await api.put(`/packages/${id}`, {
        weight: parseFloat(weight),
        dimensions: {
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
        },
      })

      // Then create quote
      const response = await api.post('/quotes', {
        packageIds: [id],
        destinationAddress: {
          addressLine1: destination,
          postalCode: '00000',
          city: destination,
          territory: destination,
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package', id] })
      setShowCalculator(false)
      updateStatusMutation.mutate('QUOTE_READY')
    },
  })

  // Update tracking number mutation
  const updateTrackingMutation = useMutation({
    mutationFn: async (trackingNum: string) => {
      const response = await api.post(`/packages/${id}/tracking`, {
        trackingNumber: trackingNum,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-package', id] })
      setTrackingNumber('')
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUploadPhotos = () => {
    if (selectedFiles.length > 0) {
      uploadPhotosMutation.mutate(selectedFiles)
    }
  }

  const handleCreateQuote = () => {
    if (weight && length && width && height && destination) {
      createQuoteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <PackageIcon className="w-16 h-16 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="relative min-h-screen">
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LuxuryCard>
            <div className="p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Colis non trouvé</h2>
              <p className="text-gray-600 mb-6">Le colis demandé n'existe pas ou a été supprimé.</p>
              <Link to="/admin/packages">
                <GlowButton icon={<ArrowLeft className="w-5 h-5" />}>
                  Retour à la liste
                </GlowButton>
              </Link>
            </div>
          </LuxuryCard>
        </div>
      </div>
    )
  }

  const statusStyle = getStatusStyle(pkg.status)

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/packages">
              <button className="p-3 bg-white/80 hover:bg-white rounded-xl border-2 border-orange-200 transition-all">
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                📦 Gestion du colis
              </h1>
              <p className="text-gray-600">#{pkg.id.slice(0, 8)}</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Package Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Details */}
            <LuxuryCard gradient="orange">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Box className="w-6 h-6 text-orange-600" />
                  Détails du colis
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                    <p className="text-xs text-gray-500 mb-1">Numéro de suivi</p>
                    <p className="font-bold text-gray-900">{pkg.trackingNumber || 'Non défini'}</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                    <p className="text-xs text-gray-500 mb-1">Description</p>
                    <p className="font-semibold text-gray-900">{pkg.description || 'Non renseigné'}</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="w-4 h-4 text-orange-600" />
                      <p className="text-xs text-gray-500">Poids</p>
                    </div>
                    <p className="font-bold text-gray-900">{pkg.weight ? formatWeight(pkg.weight) : 'Non pesé'}</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Ruler className="w-4 h-4 text-orange-600" />
                      <p className="text-xs text-gray-500">Dimensions</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {pkg.dimensions
                        ? `${pkg.dimensions.length}x${pkg.dimensions.width}x${pkg.dimensions.height} cm`
                        : 'Non mesurées'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-semibold text-gray-700">Dates</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Créé le</p>
                      <p className="font-semibold text-gray-900">{formatDate(pkg.createdAt)}</p>
                    </div>
                    {pkg.receivedAt && (
                      <div>
                        <p className="text-gray-600">Reçu le</p>
                        <p className="font-semibold text-gray-900">{formatDate(pkg.receivedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </LuxuryCard>

            {/* Tracking Number Management */}
            <LuxuryCard gradient="green">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-green-600" />
                  Numéro de suivi
                </h2>

                {pkg.trackingNumber ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Numéro de suivi actuel</p>
                        <p className="text-lg font-bold text-gray-900">{pkg.trackingNumber}</p>
                        {pkg.carrierName && (
                          <p className="text-sm text-gray-600 mt-1">Transporteur : {pkg.carrierName}</p>
                        )}
                      </div>
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Aucun numéro de suivi enregistré pour ce colis
                    </p>
                  </div>
                )}

                {/* Form to add/update tracking */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-100 space-y-3">
                  <Label className="text-gray-900 font-semibold">
                    {pkg.trackingNumber ? 'Mettre à jour' : 'Ajouter'} le numéro de suivi
                  </Label>
                  <Input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ex: LX123456789FR"
                    className="border-green-200 focus:border-green-400"
                  />
                  <GlowButton
                    onClick={() => trackingNumber && updateTrackingMutation.mutate(trackingNumber)}
                    disabled={!trackingNumber || updateTrackingMutation.isPending}
                    icon={<Truck className="w-5 h-5" />}
                    className="w-full justify-center bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    {updateTrackingMutation.isPending
                      ? 'Enregistrement...'
                      : pkg.trackingNumber
                      ? 'Mettre à jour et synchroniser'
                      : 'Enregistrer et synchroniser avec 17Track'}
                  </GlowButton>
                  <p className="text-xs text-gray-500">
                    Le numéro sera automatiquement enregistré avec 17Track pour le suivi en temps réel
                  </p>
                </div>
              </div>
            </LuxuryCard>

            {/* Photos Upload */}
            <LuxuryCard gradient="purple">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                  Photos du colis
                </h2>

                {/* Current Photos */}
                {pkg.photos && pkg.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {pkg.photos.map((photo: string, index: number) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border-2 border-purple-200">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Form */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-dashed border-purple-300">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center cursor-pointer py-6"
                  >
                    <Upload className="w-12 h-12 text-purple-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Cliquez pour sélectionner des photos</p>
                    <p className="text-xs text-gray-500">JPEG, PNG, WebP (max 10MB chacune)</p>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">{selectedFiles.length} fichier(s) sélectionné(s)</p>
                    <div className="flex gap-2">
                      <GlowButton
                        onClick={handleUploadPhotos}
                        disabled={uploadPhotosMutation.isPending}
                        icon={<Upload className="w-5 h-5" />}
                        className="flex-1 justify-center"
                      >
                        {uploadPhotosMutation.isPending ? 'Envoi...' : 'Uploader les photos'}
                      </GlowButton>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </LuxuryCard>

            {/* Calculator */}
            <LuxuryCard gradient="blue">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    Calculateur de devis
                  </h2>
                  <button
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {showCalculator ? 'Masquer' : 'Afficher'}
                  </button>
                </div>

                {showCalculator && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Poids (kg)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Ex: 2.5"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Longueur (cm)</Label>
                        <Input
                          type="number"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          placeholder="Ex: 30"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Largeur (cm)</Label>
                        <Input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="Ex: 20"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Hauteur (cm)</Label>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Ex: 10"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Destination</Label>
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="mt-1 w-full h-12 rounded-xl border-2 border-blue-200 px-4 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Sélectionnez une destination</option>
                        <option value="Guadeloupe">Guadeloupe</option>
                        <option value="Martinique">Martinique</option>
                        <option value="Guyane">Guyane</option>
                        <option value="La Réunion">La Réunion</option>
                        <option value="Maroc">Maroc</option>
                      </select>
                    </div>

                    <GlowButton
                      onClick={handleCreateQuote}
                      disabled={!weight || !length || !width || !height || !destination || createQuoteMutation.isPending}
                      icon={<Check className="w-5 h-5" />}
                      className="w-full justify-center"
                    >
                      {createQuoteMutation.isPending ? 'Génération...' : 'Générer le devis'}
                    </GlowButton>
                  </div>
                )}
              </div>
            </LuxuryCard>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Client Info */}
            <LuxuryCard gradient="gold">
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-600" />
                  Client
                </h2>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                  <p className="text-xs text-gray-500 mb-1">ID Client</p>
                  <p className="font-mono text-sm text-gray-900">{pkg.userId}</p>
                </div>
              </div>
            </LuxuryCard>

            {/* Status Actions */}
            <LuxuryCard gradient="purple">
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Check className="w-5 h-5 text-purple-600" />
                  Changer le statut
                </h2>

                <div className="space-y-2">
                  <GlowButton
                    onClick={() => updateStatusMutation.mutate('RECEIVED')}
                    disabled={updateStatusMutation.isPending || pkg.status === 'RECEIVED'}
                    icon={<Check className="w-5 h-5" />}
                    className="w-full justify-center bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    Marquer REÇU
                  </GlowButton>

                  <GlowButton
                    onClick={() => updateStatusMutation.mutate('QUOTE_READY')}
                    disabled={updateStatusMutation.isPending || pkg.status === 'QUOTE_READY'}
                    icon={<Calculator className="w-5 h-5" />}
                    className="w-full justify-center bg-gradient-to-r from-orange-500 to-red-600"
                  >
                    Marquer PRÊT
                  </GlowButton>

                  <GlowButton
                    onClick={() => updateStatusMutation.mutate('SHIPPED')}
                    disabled={updateStatusMutation.isPending || pkg.status === 'SHIPPED'}
                    icon={<Truck className="w-5 h-5" />}
                    className="w-full justify-center bg-gradient-to-r from-blue-500 to-indigo-600"
                  >
                    Marquer EXPÉDIÉ
                  </GlowButton>
                </div>
              </div>
            </LuxuryCard>
          </div>
        </div>
      </div>
    </div>
  )
}
