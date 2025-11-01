import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle,
  Package,
  TruckIcon,
  CreditCard,
  Mail,
  FileText,
  MessageCircle,
  Book,
  User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import PublicHeader from '../components/PublicHeader'
import PublicFooter from '../components/PublicFooter'

export default function HelpPage() {
  useEffect(() => {
    document.title = 'Aide - Centre d\'assistance | ReExpressTrack'
  }, [])

  const helpCategories = [
    {
      title: 'Premiers pas',
      icon: User,
      description: 'Créer un compte, obtenir votre adresse française',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      articles: [
        { title: 'Comment créer un compte ?', link: '/faq' },
        { title: 'Obtenir mon adresse française', link: '/faq' },
        { title: 'Vérifier mon compte', link: '/faq' },
        { title: 'Configurer mes préférences', link: '/faq' },
      ]
    },
    {
      title: 'Gestion des colis',
      icon: Package,
      description: 'Déclarer, suivre et gérer vos colis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      articles: [
        { title: 'Déclarer un colis reçu', link: '/faq' },
        { title: 'Suivre mes colis en temps réel', link: '/faq' },
        { title: 'Consolider plusieurs colis', link: '/faq' },
        { title: 'Demander des photos de mes colis', link: '/faq' },
      ]
    },
    {
      title: 'Expédition',
      icon: TruckIcon,
      description: 'Demander des devis et expédier vos colis',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      articles: [
        { title: 'Demander un devis d\'expédition', link: '/faq' },
        { title: 'Choisir le bon service d\'expédition', link: '/faq' },
        { title: 'Délais de livraison par destination', link: '/faq' },
        { title: 'Suivre mon expédition', link: '/faq' },
      ]
    },
    {
      title: 'Facturation',
      icon: CreditCard,
      description: 'Paiements, tarifs et abonnements',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      articles: [
        { title: 'Comprendre les frais d\'expédition', link: '/tarifs' },
        { title: 'Moyens de paiement acceptés', link: '/faq' },
        { title: 'Gérer mon abonnement', link: '/abonnement' },
        { title: 'Consulter mes factures', link: '/faq' },
      ]
    },
    {
      title: 'Documentation',
      icon: Book,
      description: 'Guides et documentation technique',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      articles: [
        { title: 'Guide d\'utilisation complet', link: '/faq' },
        { title: 'Douanes et restrictions', link: '/faq' },
        { title: 'Assurance et réclamations', link: '/faq' },
        { title: 'Politique de retour', link: '/mentions-legales' },
      ]
    },
    {
      title: 'Support',
      icon: MessageCircle,
      description: 'Contacter notre équipe d\'assistance',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      articles: [
        { title: 'Ouvrir un ticket de support', link: '/contact' },
        { title: 'Horaires du support', link: '/contact' },
        { title: 'Signaler un problème', link: '/contact' },
        { title: 'Faire une réclamation', link: '/contact' },
      ]
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />

      <div className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Centre d'assistance
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez des réponses à vos questions et des guides pour utiliser ReExpressTrack
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Comment pouvons-nous vous aider ?
                  </h2>
                  <p className="text-sm text-gray-600">
                    Recherchez dans notre FAQ ou parcourez les catégories ci-dessous
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" asChild>
                    <Link to="/faq">
                      <FileText className="w-4 h-4 mr-2" />
                      Consulter la FAQ
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contact">
                      <Mail className="w-4 h-4 mr-2" />
                      Nous contacter
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx}>
                        <Link
                          to={article.link}
                          className="text-sm text-gray-700 hover:text-orange-600 hover:underline"
                        >
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-orange-50 to-white rounded-lg p-8 text-center border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Notre équipe de support est disponible du lundi au vendredi de 9h à 18h pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/contact">
                  <Mail className="w-5 h-5 mr-2" />
                  Contacter le support
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/faq">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Voir la FAQ
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24h</div>
                <p className="text-gray-600">Temps de réponse moyen</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">98%</div>
                <p className="text-gray-600">Taux de satisfaction client</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">7j/7</div>
                <p className="text-gray-600">Support disponible</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}
