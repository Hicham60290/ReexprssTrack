import { useQuery } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import api from '@/shared/lib/api'
import { formatDate } from '@/shared/utils/format'
import { User as UserType } from '@/shared/types'

export default function ProfilePage() {
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <User className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
              <p className="text-lg">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <p className="text-lg">{user.email}</p>
                {user.emailVerified ? (
                  <Badge variant="success">Vérifié</Badge>
                ) : (
                  <Badge variant="warning">Non vérifié</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="text-lg">{user.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rôle</p>
              <Badge>{user.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Membre depuis</p>
              <p className="text-lg">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Identifiant</p>
              <p className="text-sm font-mono">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
