import { useState, useEffect } from 'react'
import { ChevronDown, Search, HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Input } from '@/shared/components/ui/Input'
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
    { id: 'all', name: 'Toutes' },
    { id: 'getting-started', name: 'Démarrage' },
    { id: 'shipping', name: 'Expédition' },
    { id: 'billing', name: 'Facturation' },
    { id: 'account', name: 'Compte' },
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-lg text-gray-600">
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                          expandedItems.includes(index) ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                  {expandedItems.includes(index) && (
                    <CardContent className="pt-0 pb-6">
                      <p className="text-gray-600 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                Aucune question trouvée
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-white rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Vous ne trouvez pas de réponse ?
            </h3>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
