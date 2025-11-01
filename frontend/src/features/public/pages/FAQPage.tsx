import { useState, useEffect } from 'react'
import { ChevronDown, Search, HelpCircle, MessageCircle, Sparkles } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  useEffect(() => {
    document.title = 'FAQ - Questions fréquentes | ReExpressTrack'
  }, [])

  const categories = [
    { id: 'all', name: 'Toutes', icon: '📚', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'getting-started', name: 'Démarrage', icon: '🚀', gradient: 'from-green-500 to-emerald-500' },
    { id: 'shipping', name: 'Expédition', icon: '📦', gradient: 'from-orange-500 to-pink-500' },
    { id: 'billing', name: 'Facturation', icon: '💳', gradient: 'from-purple-500 to-indigo-500' },
    { id: 'account', name: 'Compte', icon: '👤', gradient: 'from-pink-500 to-rose-500' },
  ]

  const faqs: FAQItem[] = [
    {
      question: 'Comment obtenir mon adresse française gratuitement ?',
      answer: 'Créez simplement un compte gratuit. Vous recevez instantanément votre adresse française personnalisée avec un numéro de boîte unique, valable à vie.',
      category: 'getting-started'
    },
    {
      question: 'Quels sont les délais de livraison vers les DOM-TOM ?',
      answer: 'Service Standard : 7-14 jours • Service Express : 3-5 jours • Service Premium : 1-2 jours. Pour les DOM-TOM, comptez généralement 5-8 jours en express.',
      category: 'shipping'
    },
    {
      question: 'Comment sont calculés les frais d\'expédition ?',
      answer: 'Les frais dépendent de la destination, du poids, des dimensions, du service choisi et de la valeur déclarée. Utilisez notre calculateur gratuit pour une estimation précise.',
      category: 'billing'
    },
    {
      question: 'Puis-je utiliser mon adresse française pour tous mes achats ?',
      answer: 'Oui, votre adresse fonctionne sur tous les sites e-commerce français et européens : Amazon, Cdiscount, Fnac, Zalando, etc.',
      category: 'getting-started'
    },
    {
      question: 'Puis-je grouper plusieurs colis en un seul envoi ?',
      answer: 'Absolument ! La consolidation de colis est gratuite. Demandez le regroupement dans votre espace client pour économiser sur les frais d\'expédition.',
      category: 'shipping'
    },
    {
      question: 'Mon adresse française est-elle permanente ?',
      answer: 'Oui, votre adresse reste valable tant que votre compte est actif. Même avec un compte gratuit, vous gardez le même numéro de boîte indéfiniment.',
      category: 'account'
    },
    {
      question: 'Expédiez-vous vers l\'Afrique ?',
      answer: 'Oui, nous expédions vers toute l\'Afrique : Maroc, Tunisie, Sénégal, Côte d\'Ivoire, Cameroun, etc. Plus de 50 pays africains sont desservis.',
      category: 'shipping'
    },
    {
      question: 'Puis-je suivre mon colis en temps réel ?',
      answer: 'Oui, le suivi est disponible 24h/24 dans votre espace client. Vous recevez des notifications à chaque étape : réception, préparation, expédition, livraison.',
      category: 'shipping'
    },
    {
      question: 'Quels sont les moyens de paiement acceptés ?',
      answer: 'Cartes bancaires (Visa, Mastercard, American Express), PayPal, et virements SEPA. Paiements sécurisés par Stripe.',
      category: 'billing'
    },
    {
      question: 'Y a-t-il des frais cachés ?',
      answer: 'Non, tous nos tarifs sont transparents : frais d\'expédition, abonnement optionnel (2,50€/mois), stockage prolongé. Aucun frais de dossier.',
      category: 'billing'
    },
  ]

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
        {[...Array(15)].map((_, i) => (
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-float">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl mb-6 shadow-xl animate-float animation-delay-1000">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Questions fréquentes
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          {/* Search */}
          <div className="mb-10 animate-float animation-delay-1000">
            <div className="relative glass rounded-3xl p-2 border-2 border-white/40 shadow-xl max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-14 bg-white/50 border-none text-lg rounded-2xl"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-4 mb-12 justify-center">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative animate-float`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`glass rounded-2xl px-6 py-3 border-2 border-white/40 hover:scale-105 transition-all duration-300 ${
                  selectedCategory === category.id ? 'shadow-2xl' : 'shadow-lg'
                }`}>
                  {/* Active indicator */}
                  {selectedCategory === category.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-20 rounded-2xl`}></div>
                  )}

                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <span className={`font-semibold ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`
                        : 'text-gray-700'
                    }`}>
                      {category.name}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-6">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="animate-float"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="glass rounded-3xl overflow-hidden border-2 border-white/40 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl">
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full p-6 text-left hover:bg-white/50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-bold">?</span>
                          </div>
                          <h3 className="font-bold text-gray-900 flex-1 text-lg leading-relaxed pt-1">
                            {faq.question}
                          </h3>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          expandedItems.includes(index)
                            ? 'bg-gradient-to-br from-orange-500 to-pink-600 rotate-180'
                            : 'bg-gray-100'
                        }`}>
                          <ChevronDown className={`w-5 h-5 ${
                            expandedItems.includes(index) ? 'text-white' : 'text-gray-500'
                          }`} />
                        </div>
                      </div>
                    </button>

                    {/* Animated Answer */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        expandedItems.includes(index)
                          ? 'max-h-96 opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6 pl-20">
                        <div className="glass-dark rounded-2xl p-6 border border-white/20">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="glass rounded-3xl p-12 border-2 border-white/40 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">
                    Aucune question trouvée
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 animate-float animation-delay-2000">
            <div className="relative">
              <div className="glass rounded-[3rem] p-12 border-2 border-white/40 text-center overflow-hidden shadow-2xl">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10"></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-600 rounded-3xl mb-6 shadow-xl animate-float">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      Vous ne trouvez pas de réponse ?
                    </span>
                  </h3>

                  <p className="text-gray-600 mb-8 text-lg">
                    Notre équipe est là pour vous aider 24/7
                  </p>

                  <Link to="/contact" className="inline-block group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-600 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-70"></div>
                      <button className="relative bg-gradient-to-r from-orange-500 to-pink-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        Contactez-nous
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
