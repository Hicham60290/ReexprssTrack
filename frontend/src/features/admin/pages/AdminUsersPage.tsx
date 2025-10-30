import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import api from '@/shared/lib/api'
import { formatDate } from '@/shared/utils/format'
import { User, PaginatedResponse } from '@/shared/types'

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">Gérez tous les utilisateurs de la plateforme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Users className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Email vérifié</TableHead>
                  <TableHead>Inscrit le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="success">Vérifié</Badge>
                      ) : (
                        <Badge variant="warning">Non vérifié</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
