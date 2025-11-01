import { useEffect } from 'react'
import { Check, X, Sparkles, Crown, Zap, Star, TruckIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      icon: Sparkles,
      gradient: 'from-blue-500 to-cyan-500',
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
      icon: Crown,
      gradient: 'from-orange-500 via-pink-500 to-purple-500',
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
      icon: Star,
      gradient: 'from-purple-500 to-indigo-500',
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
    { destination: 'Guadeloupe', flag: '🇬🇵', weight: '1kg', standard: '25€', express: '45€', gradient: 'from-blue-500 to-green-500' },
    { destination: 'Martinique', flag: '🇲🇶', weight: '1kg', standard: '25€', express: '45€', gradient: 'from-red-500 to-blue-500' },
    { destination: 'Guyane', flag: '🇬🇫', weight: '1kg', standard: '28€', express: '48€', gradient: 'from-green-500 to-yellow-500' },
    { destination: 'La Réunion', flag: '🇷🇪', weight: '1kg', standard: '30€', express: '50€', gradient: 'from-orange-500 to-red-500' },
    { destination: 'Maroc', flag: '🇲🇦', weight: '1kg', standard: '20€', express: '35€', gradient: 'from-red-500 to-green-500' },
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <PublicHeader />

      {/* Animated Background with Bubbles */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
        {/* Large gradient orbs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/20 to-orange-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        {/* 3D Animated Bubbles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble-float"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              background: `radial-gradient(circle at 30% 30%, ${
                ['rgba(255,200,150,0.2)', 'rgba(200,150,255,0.2)', 'rgba(150,200,255,0.2)', 'rgba(255,150,200,0.2)'][
                  Math.floor(Math.random() * 4)
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

      <div className="flex-1 pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-float">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border-2 border-white/40">
              <Crown className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">Offres Premium</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Tarifs transparents,
              </span>
              <br />
              <span className="text-gray-900">sans surprise</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choisissez l'offre qui correspond à vos besoins.
              <br />
              Aucun engagement, résiliez quand vous voulez.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="relative group animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="glass px-6 py-2 rounded-full border-2 border-white/40 shadow-xl">
                      <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent font-bold flex items-center gap-2">
                        <Crown className="w-4 h-4 text-orange-600" />
                        Populaire
                      </span>
                    </div>
                  </div>
                )}

                <div className={`glass rounded-[2rem] p-8 border-2 border-white/40 hover:scale-105 transition-all duration-300 h-full relative overflow-hidden ${
                  plan.popular ? 'shadow-2xl' : 'shadow-lg'
                }`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-4">
                      <span className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                        {plan.price}€
                      </span>
                      <span className="text-gray-600 text-lg">/{plan.period}</span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-8 text-lg">
                      {plan.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          {feature.included ? (
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <Check className="w-4 h-4 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <X className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <span className={feature.included ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Link to="/register" className="block group/button">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-2xl blur-lg group-hover/button:blur-xl transition-all opacity-70`}></div>
                        <button className={`relative w-full bg-gradient-to-r ${plan.gradient} text-white px-6 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl`}>
                          {plan.cta}
                        </button>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Rates Section */}
          <div className="relative">
            <div className="text-center mb-12 animate-float">
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border-2 border-white/40">
                <TruckIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Tarifs d'Expédition</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Exemples de tarifs
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Pour un colis de 1kg vers nos destinations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {shippingRates.map((rate, index) => (
                <div
                  key={index}
                  className="group animate-float"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="glass rounded-3xl p-6 border-2 border-white/40 hover:scale-105 transition-all duration-300 h-full relative overflow-hidden">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${rate.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                    <div className="relative z-10">
                      {/* Flag and Destination */}
                      <div className="text-center mb-6">
                        <div className="text-5xl mb-3 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                          {rate.flag}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {rate.destination}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{rate.weight}</p>
                      </div>

                      {/* Prices */}
                      <div className="space-y-3">
                        <div className="glass-dark rounded-2xl p-4 border border-white/20">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 font-medium">Standard</span>
                            <span className="text-xl font-bold text-green-600">{rate.standard}</span>
                          </div>
                        </div>

                        <div className="glass-dark rounded-2xl p-4 border border-white/20">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-gray-600 font-medium">Express</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">{rate.express}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculator Link */}
            <div className="text-center mt-12">
              <div className="glass rounded-2xl p-6 inline-block border-2 border-white/40">
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Tarifs indicatifs.</span> Obtenez un devis précis pour votre envoi.
                </p>
                <Link to="/calculateur" className="group inline-block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"></div>
                    <button className="relative bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition-transform shadow-xl flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Calculer mes frais
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
