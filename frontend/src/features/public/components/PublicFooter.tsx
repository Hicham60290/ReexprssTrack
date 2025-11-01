import { Link } from 'react-router-dom'
import { Package, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function PublicFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-white">ReExpressTrack</span>
            </div>
            <p className="text-sm mb-4">
              Votre service de réexpédition vers les DOM-TOM et le Maroc.
              Économisez jusqu'à 60% sur vos frais d'expédition.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/calculateur" className="hover:text-orange-500 transition-colors">
                  Calculateur de prix
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="hover:text-orange-500 transition-colors">
                  Nos tarifs
                </Link>
              </li>
              <li>
                <Link to="/suivi" className="hover:text-orange-500 transition-colors">
                  Suivi de colis
                </Link>
              </li>
              <li>
                <Link to="/abonnement" className="hover:text-orange-500 transition-colors">
                  Abonnement
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-orange-500 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/aide" className="hover:text-orange-500 transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-orange-500 transition-colors">
                  Support client
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>12 Rue de la Réexpédition<br />75001 Paris, France</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+33123456789" className="hover:text-orange-500">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contact@reexpresstrack.com" className="hover:text-orange-500">
                  contact@reexpresstrack.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p>&copy; {currentYear} ReExpressTrack. Tous droits réservés.</p>
            <div className="flex space-x-6">
              <Link to="/mentions-legales" className="hover:text-orange-500 transition-colors">
                Mentions légales
              </Link>
              <Link to="/confidentialite" className="hover:text-orange-500 transition-colors">
                Confidentialité
              </Link>
              <Link to="/cgv" className="hover:text-orange-500 transition-colors">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
