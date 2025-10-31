import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, TruckIcon, Shield, Clock, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function HomePage() {
  useEffect(() => {
    document.title = 'ReExpressTrack - Service de réexpédition DOM-TOM et Maroc'
  }, [])

  const features = [
    {
      icon: Package,
      title: 'Adresse française gratuite',
      description: 'Recevez vos colis à Paris et nous les réexpédions vers les DOM-TOM ou le Maroc'
    },
    {
      icon: TruckIcon,
      title: 'Livraison rapide',
      description: 'Délais de livraison optimisés vers Guadeloupe, Martinique, Réunion, Guyane et Maroc'
    },
    {
      icon: Shield,
      title: 'Sécurisé et assuré',
      description: 'Vos colis sont assurés et suivis tout au long du trajet'
    },
    {
      icon: Clock,
      title: 'Suivi en temps réel',
      description: 'Suivez vos colis 24/7 depuis votre espace personnel'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Clients satisfaits' },
    { value: '60%', label: 'Économies moyennes' },
    { value: '5', label: 'Destinations' },
    { value: '48H', label: 'Traitement des colis' }
  ]

  const destinations = [
    'Guadeloupe',
    'Martinique',
    'Guyane',
    'La Réunion',
    'Maroc'
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 to-white pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Votre service de réexpédition vers les
                <span className="text-orange-600"> DOM-TOM</span> et le
                <span className="text-orange-600"> Maroc</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Économisez jusqu'à 60% sur vos frais d'expédition.
                Adresse française gratuite, livraison rapide et sécurisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Créer mon compte gratuit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/calculateur">
                    Calculer mes frais
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-200 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl">
                  <Package className="w-32 h-32 text-orange-600 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ReExpressTrack ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un service complet et professionnel pour tous vos envois vers les DOM-TOM et le Maroc
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos destinations
            </h2>
            <p className="text-lg text-gray-600">
              Nous livrons vers 5 destinations principales
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">{destination}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Créez votre compte gratuitement et recevez votre adresse française
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">
              S'inscrire maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
