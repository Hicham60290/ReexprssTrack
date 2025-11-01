import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/stores/auth.store'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, emoji: '⚡' },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users, emoji: '👥' },
  { name: 'Colis', href: '/admin/packages', icon: Package, emoji: '📦' },
  { name: 'Devis', href: '/admin/quotes', icon: FileText, emoji: '💰' },
  { name: 'Paiements', href: '/admin/payments', icon: CreditCard, emoji: '💳' },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center justify-center pt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-shimmer">
              Admin Panel
            </h1>
          </div>
          <p className="text-xs text-gray-500">ReExpressTrack</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href === '/admin' && location.pathname === '/admin')
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        'group flex items-center gap-x-3 rounded-2xl p-4 text-sm font-semibold transition-all duration-300',
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                          : 'text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-105'
                      )}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className={cn(
                        'flex-1',
                        isActive ? 'text-white font-bold' : 'text-gray-700'
                      )}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* Admin Profile Card */}
          <li className="mt-auto pb-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-5 border-2 border-indigo-200 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-indigo-600">Administrateur</span>
                    <Shield className="w-3 h-3 text-indigo-600" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto glass border-r-2 border-white/40 shadow-2xl backdrop-blur-xl bg-white/30">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 glass border-r-2 border-white/40 shadow-2xl backdrop-blur-xl bg-white/30">
            {/* Close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/50 rounded-full hover:bg-white/80 transition-all"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 glass border-b-2 border-white/40 px-6 shadow-lg backdrop-blur-xl bg-white/30">
          <button
            type="button"
            className="lg:hidden p-2 bg-white/50 rounded-xl hover:bg-white/80 transition-all"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-700" aria-hidden="true" />
          </button>
          <div className="flex flex-1 gap-x-4 items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {navigation.find((item) => item.href === location.pathname)?.emoji}{' '}
              {navigation.find((item) => item.href === location.pathname)?.name || 'Admin Panel'}
            </h2>
          </div>

          {/* Admin badge on desktop */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Admin</span>
          </div>
        </div>

        {/* Page content */}
        <main className="py-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
