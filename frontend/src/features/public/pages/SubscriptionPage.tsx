import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, Crown, Star, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function SubscriptionPage() {
  useEffect(() => {
    document.title = 'Abonnements - Choisir votre formule | ReExpressTrack'
  }, [])

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'À vie',
      icon: Star,
      description: 'Idéal pour découvrir le service',
      features: [
        'Adresse française permanente',
        'Stockage 30 jours gratuit',
        'Suivi des colis en temps réel',
        'Consolidation de colis',
        'Support par email (48h)',
        'Photos de colis (payant)',
      ],
      limitations: [
        'Frais d\'expédition standard',
        'Pas de réduction sur les envois',
        'Stockage limité à 30 jours',
      ],
      cta: 'Compte actuel',
      color: 'gray',
      popular: false
    },
    {
      name: 'Premium',
      price: '2.50',
      period: 'Par mois',
      icon: Crown,
      description: 'Le meilleur rapport qualité-prix',
      features: [
        'Tout du plan Gratuit',
        'Stockage 60 jours gratuit',
        '30% de réduction sur les frais d\'expédition',
        'Photos de colis illimitées',
        'Support prioritaire (24h)',
        'Assurance renforcée incluse',
        'Emballage premium gratuit',
      ],
      savings: 'Économisez dès le 2ème colis expédié',
      cta: 'Passer à Premium',
      color: 'orange',
      popular: true
    },
    {
      name: 'Annuel',
      price: '20',
      period: 'Par an',
      icon: Zap,
      description: 'Économisez 33% avec l\'engagement annuel',
      features: [
        'Tout du plan Premium',
        'Stockage 90 jours gratuit',
        '40% de réduction sur les frais d\'expédition',
        'Photos et vidéos de colis illimitées',
        'Support VIP 24/7',
        'Assurance premium incluse',
        'Emballage premium + renforcé',
        'Accès anticipé aux nouvelles fonctionnalités',
      ],
      savings: 'Économisez 10€ par an vs mensuel',
      cta: 'Passer à Annuel',
      color: 'green',
      popular: false
    },
  ]

  const faq = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez passer au plan supérieur à tout moment. Pour rétrograder, attendez la fin de votre période de facturation.'
    },
    {
      question: 'Y a-t-il un engagement ?',
      answer: 'Aucun engagement pour le plan mensuel. Le plan annuel nécessite un paiement pour 12 mois, mais vous pouvez annuler à tout moment.'
    },
    {
      question: 'Comment sont appliquées les réductions ?',
      answer: 'Les réductions sont automatiquement appliquées à la caisse lors de vos expéditions. Aucun code promo nécessaire.'
    },
    {
      question: 'Que se passe-t-il si j\'annule mon abonnement ?',
      answer: 'Vous conservez les avantages jusqu\'à la fin de votre période payée, puis revenez au plan Gratuit. Vos colis et données restent accessibles.'
    },
  ]

  const getColorClasses = (popular: boolean) => {
    if (popular) {
      return {
        border: 'border-2 border-orange-600',
        bg: 'bg-orange-50',
        text: 'text-orange-600',
        button: 'bg-orange-600 hover:bg-orange-700'
      }
    }
    return {
      border: 'border border-gray-200',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      button: 'bg-gray-900 hover:bg-gray-800'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choisissez votre formule
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aucun engagement • Résiliez quand vous voulez • Changez de plan à tout moment
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => {
              const colors = getColorClasses(plan.popular)
              return (
                <Card
                  key={index}
                  className={`relative ${colors.border} ${plan.popular ? 'shadow-xl scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Le plus populaire
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colors.bg} mb-3`}>
                      <plan.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-gray-600 text-sm">/{plan.period}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                    {plan.savings && (
                      <p className="text-green-600 text-sm font-medium mt-2">
                        💰 {plan.savings}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-900 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.limitations && (
                      <div className="mb-6 pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-2">Limitations :</p>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, idx) => (
                            <li key={idx} className="text-xs text-gray-500">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      className={`w-full ${colors.button}`}
                      disabled={index === 0}
                      asChild={index !== 0}
                    >
                      {index === 0 ? (
                        <span>{plan.cta}</span>
                      ) : (
                        <Link to="/register">{plan.cta}</Link>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Comparaison détaillée
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Fonctionnalité</th>
                    <th className="text-center py-3 px-4 font-semibold">Gratuit</th>
                    <th className="text-center py-3 px-4 font-semibold">Premium</th>
                    <th className="text-center py-3 px-4 font-semibold">Annuel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Adresse française</td>
                    <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    <td className="text-center py-3 px-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Stockage gratuit</td>
                    <td className="text-center py-3 px-4">30 jours</td>
                    <td className="text-center py-3 px-4">60 jours</td>
                    <td className="text-center py-3 px-4">90 jours</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Réduction sur frais d'expédition</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">30%</td>
                    <td className="text-center py-3 px-4">40%</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Photos de colis</td>
                    <td className="text-center py-3 px-4">Payant</td>
                    <td className="text-center py-3 px-4">Illimitées</td>
                    <td className="text-center py-3 px-4">Illimitées + Vidéos</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Support client</td>
                    <td className="text-center py-3 px-4">Email (48h)</td>
                    <td className="text-center py-3 px-4">Prioritaire (24h)</td>
                    <td className="text-center py-3 px-4">VIP 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Assurance</td>
                    <td className="text-center py-3 px-4">Standard</td>
                    <td className="text-center py-3 px-4">Renforcée</td>
                    <td className="text-center py-3 px-4">Premium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Questions fréquentes sur les abonnements
            </h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              {faq.map((item, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/faq" className="text-orange-600 hover:underline">
                Voir toutes les questions →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
