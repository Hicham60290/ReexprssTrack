import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, Mail, Phone, Shield, CheckCircle, Search, Package as PackageIcon, Calendar } from 'lucide-react'
import {
  LuxuryCard,
  SectionHeader,
  AnimatedBackground,
  GlowButton
} from '@/shared/components/ui/LuxuryComponents'
import { Input } from '@/shared/components/ui/Input'
import api from '@/shared/lib/api'
import { formatDate } from '@/shared/utils/format'
import { User, PaginatedResponse } from '@/shared/types'

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''
      const response = await api.get(`/admin/users${params}`)
      return response.data
    },
  })

  const users = data?.data || []
  const totalUsers = users.length
  const verifiedUsers = users.filter(u => u.emailVerified).length
  const adminUsers = users.filter(u => u.role === 'ADMIN').length

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-shimmer">
            👥 Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 text-lg">Gérez tous les utilisateurs de la plateforme</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LuxuryCard gradient="blue" className="p-4">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="purple" className="p-4">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Vérifiés</p>
              <p className="text-3xl font-bold text-green-600">{verifiedUsers}</p>
            </div>
          </LuxuryCard>
          <LuxuryCard gradient="gold" className="p-4">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-600 mb-1">Admins</p>
              <p className="text-3xl font-bold text-orange-600">{adminUsers}</p>
            </div>
          </LuxuryCard>
        </div>

        {/* Search Bar */}
        <LuxuryCard gradient="purple">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-base glass border-2 border-indigo-200 focus:border-indigo-500 rounded-xl"
                />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </LuxuryCard>

        {/* Users List */}
        <div>
          <SectionHeader
            title="Liste des utilisateurs"
            subtitle={`${totalUsers} utilisateur${totalUsers > 1 ? 's' : ''} ${searchQuery ? 'trouvé(s)' : 'enregistré(s)'}`}
          />

          {isLoading ? (
            <LuxuryCard>
              <div className="flex items-center justify-center py-16">
                <Users className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            </LuxuryCard>
          ) : users.length === 0 ? (
            <LuxuryCard>
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery ? 'Aucun résultat' : 'Aucun utilisateur'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Aucun utilisateur ne correspond à votre recherche'
                    : 'Aucun utilisateur trouvé dans la base de données'}
                </p>
              </div>
            </LuxuryCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {users.map((user) => (
                <LuxuryCard key={user.id} gradient="blue" className="group">
                  <div className="p-6 space-y-4">
                    {/* Header with Avatar and Role */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          user.role === 'ADMIN'
                            ? 'bg-gradient-to-br from-orange-500 to-red-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}>
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-7 h-7 text-white" />
                          ) : (
                            <Users className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            {user.firstName} {user.lastName}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                            user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {user.emailVerified ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border-2 border-green-200">
                          ✓ Vérifié
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border-2 border-orange-200">
                          ⚠ Non vérifié
                        </span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-100 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-gray-900">{user.phone || 'Non renseigné'}</p>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Inscrit le</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{formatDate(user.createdAt)}</p>
                    </div>

                    {/* Action Button */}
                    <Link to={`/admin/packages?userId=${user.id}`}>
                      <GlowButton
                        variant="secondary"
                        className="w-full justify-center"
                        icon={<PackageIcon className="w-5 h-5" />}
                      >
                        Voir ses colis
                      </GlowButton>
                    </Link>
                  </div>
                </LuxuryCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
