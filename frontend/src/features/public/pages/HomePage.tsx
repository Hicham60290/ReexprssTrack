import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, TruckIcon, Shield, Clock, ArrowRight, Check, Sparkles, Globe } from 'lucide-react'
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
      description: 'Recevez vos colis à Paris et nous les réexpédions vers les DOM-TOM ou le Maroc',
      gradient: 'from-orange-500 to-pink-500'
    },
    {
      icon: TruckIcon,
      title: 'Livraison rapide',
      description: 'Délais de livraison optimisés vers Guadeloupe, Martinique, Réunion, Guyane et Maroc',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Shield,
      title: 'Sécurisé et assuré',
      description: 'Vos colis sont assurés et suivis tout au long du trajet',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Suivi en temps réel',
      description: 'Suivez vos colis 24/7 depuis votre espace personnel',
      gradient: 'from-pink-500 to-rose-500'
    }
  ]

  const stats = [
    { value: '10,000+', label: 'Clients satisfaits', icon: '👥' },
    { value: '60%', label: 'Économies moyennes', icon: '💰' },
    { value: '5', label: 'Destinations', icon: '🌍' },
    { value: '48H', label: 'Traitement des colis', icon: '⚡' }
  ]

  const destinations = [
    { name: 'Guadeloupe', flag: '🇬🇵', color: 'from-blue-500 to-green-500' },
    { name: 'Martinique', flag: '🇲🇶', color: 'from-red-500 to-blue-500' },
    { name: 'Guyane', flag: '🇬🇫', color: 'from-green-500 to-yellow-500' },
    { name: 'La Réunion', flag: '🇷🇪', color: 'from-orange-500 to-red-500' },
    { name: 'Maroc', flag: '🇲🇦', color: 'from-red-500 to-green-500' }
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <PublicHeader />

      {/* Hero Section with 3D Animated Bubbles */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
          {/* Large gradient orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-pink-500/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-indigo-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/30 to-orange-500/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

          {/* 3D Animated Bubbles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bubble-float"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                background: `radial-gradient(circle at 30% 30%, ${
                  ['rgba(255,200,150,0.3)', 'rgba(200,150,255,0.3)', 'rgba(150,200,255,0.3)', 'rgba(255,150,200,0.3)'][
                    Math.floor(Math.random() * 4)
                  ]
                }, transparent)`,
                animationDuration: `${Math.random() * 10 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
                filter: 'blur(2px)',
                transform: 'translateZ(0)',
                willChange: 'transform'
              }}
            >
              <div className="w-full h-full rounded-full animate-bubble-3d"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-float">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">Service Premium de Réexpédition</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-shimmer">
                  Votre service de réexpédition
                </span>
                <br />
                <span className="text-gray-900">vers les</span>{' '}
                <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">DOM-TOM</span>
                <br />
                <span className="text-gray-900">et le</span>{' '}
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Maroc</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                ✨ Économisez jusqu'à <span className="font-bold text-orange-600">60%</span> sur vos frais d'expédition.
                <br />
                🎁 Adresse française gratuite, livraison rapide et sécurisée.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"></div>
                    <button className="relative bg-gradient-to-r from-orange-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl">
                      Créer mon compte gratuit
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Link>

                <Link to="/calculateur">
                  <button className="glass px-8 py-4 rounded-2xl font-semibold text-gray-700 hover:bg-white/80 transition-all border-2 border-white/40 shadow-lg hover:scale-105 hover:shadow-xl">
                    Calculer mes frais
                  </button>
                </Link>
              </div>
            </div>

            {/* Animated 3D Package Illustration */}
            <div className="hidden md:block">
              <div className="relative animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="glass p-12 rounded-[3rem] shadow-2xl border-2 border-white/40">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>
                    <div className="relative bg-gradient-to-br from-orange-500 to-pink-600 p-8 rounded-3xl">
                      <Package className="w-32 h-32 text-white mx-auto animate-float" />
                    </div>
                  </div>

                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 glass px-4 py-2 rounded-full border-2 border-white/40 animate-float animation-delay-1000">
                    <span className="text-sm font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      ✓ Gratuit
                    </span>
                  </div>

                  <div className="absolute -bottom-4 -left-4 glass px-4 py-2 rounded-full border-2 border-white/40 animate-float animation-delay-2000">
                    <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      ⚡ Rapide
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Bubbles */}
      <section className="relative bg-gray-900 text-white py-16 overflow-hidden">
        {/* Bubble background for stats */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)',
              animationDuration: `${Math.random() * 12 + 18}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass-dark rounded-3xl p-6 text-center hover:scale-105 transition-transform border-2 border-white/10"
              >
                <div className="text-5xl mb-3 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-bubble-float"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 120 + 60}px`,
                height: `${Math.random() * 120 + 60}px`,
                background: `radial-gradient(circle at 30% 30%, ${
                  ['rgba(255,180,150,0.2)', 'rgba(200,150,255,0.2)', 'rgba(255,150,200,0.2)'][
                    Math.floor(Math.random() * 3)
                  ]
                }, transparent)`,
                animationDuration: `${Math.random() * 15 + 20}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border-2 border-white/40">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Nos Avantages</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Pourquoi choisir
              </span>
              <br />
              <span className="text-gray-900">ReExpressTrack ?</span>
            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un service complet et professionnel pour tous vos envois vers les DOM-TOM et le Maroc
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 border-2 border-white/40 h-full relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-3xl`}></div>

                  <div className="relative z-10">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-purple-50/30 py-20 md:py-32 overflow-hidden">
        {/* Animated bubbles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble-float"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(200,150,255,0.2), transparent)',
              animationDuration: `${Math.random() * 15 + 20}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nos destinations
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Nous livrons vers 5 destinations principales
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {destinations.map((destination, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="glass rounded-3xl p-8 text-center hover:scale-110 transition-all duration-300 border-2 border-white/40 relative overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${destination.color} opacity-0 group-hover:opacity-20 transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className="text-5xl mb-4 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                      {destination.flag}
                    </div>
                    <div className="font-bold text-gray-900 text-lg mb-2">
                      {destination.name}
                    </div>
                    <Check className="w-6 h-6 text-green-600 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Bubbles */}
      <section className="relative bg-gradient-to-br from-orange-600 via-pink-600 to-purple-600 text-white py-20 overflow-hidden">
        {/* Animated bubbles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble-float"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 120 + 60}px`,
              height: `${Math.random() * 120 + 60}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)',
              animationDuration: `${Math.random() * 12 + 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-dark rounded-[3rem] p-12 border-2 border-white/20">
            <Sparkles className="w-16 h-16 mx-auto mb-6 animate-float" />

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à commencer ?
            </h2>

            <p className="text-xl mb-10 opacity-90 leading-relaxed">
              Créez votre compte gratuitement et recevez votre adresse française dès maintenant
            </p>

            <Link to="/register" className="inline-block group">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                <button className="relative bg-white text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-purple-600 px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-transform shadow-2xl border-2 border-white">
                  <span className="bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                    S'inscrire maintenant
                  </span>
                  <ArrowRight className="w-6 h-6 text-orange-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
