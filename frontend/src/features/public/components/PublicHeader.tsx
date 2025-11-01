import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Package, Calculator, HelpCircle, Mail } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useAuthStore } from '@/shared/stores/auth.store'

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  const navigation = [
    { name: 'Tarifs', href: '/tarifs', icon: Package },
    { name: 'Calculateur', href: '/calculateur', icon: Calculator },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Contact', href: '/contact', icon: Mail },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Package className="w-8 h-8 text-orange-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              ReExpressTrack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActive(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <Button asChild>
                  <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Connexion</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">S'inscrire</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                  isActive(item.href)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
              {isAuthenticated ? (
                <Button className="w-full" asChild>
                  <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login">Connexion</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/register">S'inscrire</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
