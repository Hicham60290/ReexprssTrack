import { useState, useEffect } from 'react'
import { Calculator, Package, TruckIcon, Shield } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'
import { useAuthStore } from '@/shared/stores/auth.store'

interface ShippingRate {
  carrier: string
  service: string
  priceStandard: number
  priceSubscribed: number
  deliveryDays: string
  hasTracking: boolean
  hasInsurance: boolean
}

export default function CalculatorPage() {
  const { isAuthenticated } = useAuthStore()
  const [destination, setDestination] = useState('')
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    document.title = 'Calculateur de frais d\'expédition | ReExpressTrack'
  }, [])

  const destinations = [
    { value: 'guadeloupe', label: 'Guadeloupe' },
    { value: 'martinique', label: 'Martinique' },
    { value: 'guyane', label: 'Guyane' },
    { value: 'reunion', label: 'La Réunion' },
    { value: 'maroc', label: 'Maroc' }
  ]

  const calculateVolumetricWeight = () => {
    if (!length || !width || !height) return 0
    const l = parseFloat(length)
    const w = parseFloat(width)
    const h = parseFloat(height)
    return (l * w * h) / 5000 // Poids volumétrique standard
  }

  const getBillableWeight = () => {
    const actualWeight = parseFloat(weight) || 0
    const volumetricWeight = calculateVolumetricWeight()
    return Math.max(actualWeight, volumetricWeight)
  }

  const calculateRates = () => {
    const billableWeight = getBillableWeight()

    if (!destination || billableWeight === 0) {
      alert('Veuillez remplir tous les champs requis')
      return
    }

    // Simulation de tarifs (à remplacer par un appel API)
    const simulatedRates: ShippingRate[] = [
      {
        carrier: 'Colissimo',
        service: 'Standard',
        priceStandard: Math.round(billableWeight * 8.5 * 100) / 100,
        priceSubscribed: Math.round(billableWeight * 6.5 * 100) / 100,
        deliveryDays: '7-10',
        hasTracking: true,
        hasInsurance: true
      },
      {
        carrier: 'Chronopost',
        service: 'Express',
        priceStandard: Math.round(billableWeight * 12.0 * 100) / 100,
        priceSubscribed: Math.round(billableWeight * 9.5 * 100) / 100,
        deliveryDays: '3-5',
        hasTracking: true,
        hasInsurance: true
      },
      {
        carrier: 'DHL',
        service: 'International',
        priceStandard: Math.round(billableWeight * 15.0 * 100) / 100,
        priceSubscribed: Math.round(billableWeight * 12.0 * 100) / 100,
        deliveryDays: '2-4',
        hasTracking: true,
        hasInsurance: true
      }
    ]

    setRates(simulatedRates)
    setShowResults(true)
  }

  const billableWeight = getBillableWeight()
  const volumetricWeight = calculateVolumetricWeight()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Calculator className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Calculateur de frais d'expédition
            </h1>
            <p className="text-lg text-gray-600">
              Estimez le coût de votre envoi vers les DOM-TOM ou le Maroc
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulaire */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du colis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="destination">Destination *</Label>
                  <select
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Sélectionnez une destination</option>
                    {destinations.map((dest) => (
                      <option key={dest.value} value={dest.value}>
                        {dest.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="weight">Poids (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      placeholder="L"
                    />
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      placeholder="l"
                    />
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="H"
                    />
                  </div>
                </div>

                {volumetricWeight > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm">
                      <div className="font-medium text-blue-900 mb-1">Poids volumétrique:</div>
                      <div className="text-blue-700">{volumetricWeight.toFixed(2)} kg</div>
                      <div className="font-medium text-blue-900 mt-2 mb-1">Poids facturable:</div>
                      <div className="text-blue-700 font-semibold">{billableWeight.toFixed(2)} kg</div>
                    </div>
                  </div>
                )}

                <Button onClick={calculateRates} className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculer les tarifs
                </Button>
              </CardContent>
            </Card>

            {/* Résultats */}
            <div className="space-y-4">
              {showResults && rates.length > 0 ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900">Tarifs disponibles</h3>
                  {rates.map((rate, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{rate.carrier}</CardTitle>
                            <p className="text-sm text-gray-600">{rate.service}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {isAuthenticated ? rate.priceSubscribed : rate.priceStandard} €
                            </div>
                            {!isAuthenticated && (
                              <div className="text-xs text-gray-500 line-through">
                                {rate.priceStandard} €
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <TruckIcon className="w-4 h-4 mr-2 text-orange-500" />
                            {rate.deliveryDays} jours
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Shield className="w-4 h-4 mr-2 text-orange-500" />
                            Assuré
                          </div>
                        </div>
                        {!isAuthenticated && (
                          <div className="mt-3 p-2 bg-orange-50 rounded text-xs text-orange-700">
                            💰 Économisez {(rate.priceStandard - rate.priceSubscribed).toFixed(2)} € avec un compte
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="h-full flex items-center justify-center p-12">
                  <div className="text-center text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <p>Les tarifs s'afficheront ici</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
