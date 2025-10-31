import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query'
import { User, Mail, Phone, MapPin, Save, Edit, Shield, Bell } from 'lucide-react'
import {
  LuxuryCard,
  GlowButton,
  SectionHeader,
  AnimatedBackground
} from '@/shared/components/ui/LuxuryComponents'
import api from '@/shared/lib/api'
import { useAuthStore } from '@/shared/stores/auth.store'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put('/users/me', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      setIsEditing(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            👤 Mon Profil
          </h1>
          <p className="text-gray-600 text-lg">Gérez vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <LuxuryCard gradient="purple">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <SectionHeader title="Informations Personnelles" />
                  {!isEditing && (
                    <GlowButton
                      onClick={() => setIsEditing(true)}
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="w-4 h-4" />}
                    >
                      Modifier
                    </GlowButton>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* First Name */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                    <label className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Prénom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">{user?.firstName || '-'}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                    <label className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Nom
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">{user?.lastName || '-'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                    <label className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="font-semibold text-gray-900">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>

                  {/* Phone */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                    <label className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                      />
                    ) : (
                      <p className="font-semibold text-gray-900">{user?.phone || 'Non renseigné'}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <GlowButton
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        icon={<Save className="w-5 h-5" />}
                        className="flex-1"
                      >
                        {updateProfileMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                      </GlowButton>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                      >
                        Annuler
                      </button>
                    </div>
                  )}

                  {updateProfileMutation.isSuccess && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700">
                      ✅ Profil mis à jour avec succès !
                    </div>
                  )}

                  {updateProfileMutation.isError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
                      ❌ Une erreur est survenue
                    </div>
                  )}
                </form>
              </div>
            </LuxuryCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <LuxuryCard gradient="blue">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Informations du Compte
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <p className="font-semibold text-gray-900">
                      {user?.role === 'ADMIN' ? '👑 Administrateur' : '👤 Client'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email vérifié</p>
                    <p className="font-semibold text-gray-900">
                      {user?.emailVerified ? '✅ Oui' : '❌ Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Membre depuis</p>
                    <p className="font-semibold text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </LuxuryCard>

            {/* Notifications */}
            <LuxuryCard gradient="orange">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notifications
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Email pour les colis</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Email pour les devis</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Promotions</span>
                    <input type="checkbox" className="w-5 h-5" />
                  </label>
                </div>
              </div>
            </LuxuryCard>

            {/* Security */}
            <LuxuryCard gradient="purple">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sécurité</h3>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 font-semibold rounded-xl transition-all duration-300 border border-purple-200">
                  🔒 Changer le mot de passe
                </button>
              </div>
            </LuxuryCard>
          </div>
        </div>
      </div>
    </div>
  )
}
