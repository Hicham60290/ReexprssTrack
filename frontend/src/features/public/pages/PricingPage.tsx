import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function PricingPage() {
  useEffect(() => {
    document.title = 'Tarifs - Nos offres | ReExpressTrack'
  }, [])

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'mois',
      description: 'Parfait pour commencer',
      features: [
        { text: 'Adresse française permanente', included: true },
        { text: 'Stockage 30 jours gratuit', included: true },
        { text: 'Suivi en temps réel', included: true },
        { text: 'Consolidation de colis', included: true },
        { text: 'Support par email', included: true },
        { text: 'Réduction sur les frais', included: false },
        { text: 'Stockage prolongé', included: false },
        { text: 'Support prioritaire', included: false },
      ],
      cta: 'Créer un compte',
      popular: false
    },
    {
      name: 'Premium',
      price: '2.50',
      period: 'mois',
      description: 'Le meilleur rapport qualité-prix',
      features: [
        { text: 'Adresse française permanente', included: true },
        { text: 'Stockage 60 jours gratuit', included: true },
        { text: 'Suivi en temps réel', included: true },
        { text: 'Consolidation de colis', included: true },
        { text: '30% de réduction sur frais', included: true },
        { text: 'Photos de colis incluses', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Assurance renforcée', included: true },
      ],
      cta: 'S\'abonner',
      popular: true
    },
    {
      name: 'Annuel',
      price: '20',
      period: 'an',
      description: 'Économisez 33%',
      features: [
        { text: 'Adresse française permanente', included: true },
        { text: 'Stockage 90 jours gratuit', included: true },
        { text: 'Suivi en temps réel', included: true },
        { text: 'Consolidation illimitée', included: true },
        { text: '40% de réduction sur frais', included: true },
        { text: 'Photos et vidéos incluses', included: true },
        { text: 'Support VIP 24/7', included: true },
        { text: 'Assurance premium', included: true },
      ],
      cta: 'S\'abonner',
      popular: false
    },
  ]

  const shippingRates = [
    { destination: 'Guadeloupe', weight: '1kg', standard: '25€', express: '45€' },
    { destination: 'Martinique', weight: '1kg', standard: '25€', express: '45€' },
    { destination: 'Guyane', weight: '1kg', standard: '28€', express: '48€' },
    { destination: 'La Réunion', weight: '1kg', standard: '30€', express: '50€' },
    { destination: 'Maroc', weight: '1kg', standard: '20€', express: '35€' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tarifs transparents, sans surprise
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez l'offre qui correspond à vos besoins. Aucun engagement, résiliez quand vous voulez.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? 'border-2 border-orange-600 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}€</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included ? 'text-gray-900' : 'text-gray-400'
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    asChild
                  >
                    <Link to="/register">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Shipping Rates */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Exemples de tarifs d'expédition (pour 1kg)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Destination</th>
                    <th className="text-left py-3 px-4 font-semibold">Poids</th>
                    <th className="text-left py-3 px-4 font-semibold">Standard</th>
                    <th className="text-left py-3 px-4 font-semibold">Express</th>
                  </tr>
                </thead>
                <tbody>
                  {shippingRates.map((rate, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{rate.destination}</td>
                      <td className="py-3 px-4">{rate.weight}</td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        {rate.standard}
                      </td>
                      <td className="py-3 px-4 font-medium text-orange-600">
                        {rate.express}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              * Tarifs indicatifs. Utilisez notre{' '}
              <Link to="/calculateur" className="text-orange-600 hover:underline">
                calculateur
              </Link>{' '}
              pour un devis précis.
            </p>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
