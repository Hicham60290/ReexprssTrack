import { useQuery } from '@tanstack/react-query'
import { Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import api from '@/shared/lib/api'
import { formatDate, formatWeight } from '@/shared/utils/format'
import { Package as PackageType, PaginatedResponse } from '@/shared/types'

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'success'
    case 'SHIPPED':
      return 'info'
    case 'READY_TO_SHIP':
      return 'warning'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'default'
  }
}

export default function AdminPackagesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<PackageType>>({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const response = await api.get('/admin/packages')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des colis</h1>
        <p className="text-muted-foreground">Gérez tous les colis de la plateforme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des colis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Package className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Numéro de suivi</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Date de réception</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-mono text-xs">{pkg.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-medium">{pkg.trackingNumber}</TableCell>
                    <TableCell>{pkg.description || '-'}</TableCell>
                    <TableCell>{pkg.weight ? formatWeight(pkg.weight) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(pkg.status)}>
                        {pkg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(pkg.createdAt)}</TableCell>
                    <TableCell>{pkg.receivedAt ? formatDate(pkg.receivedAt) : '-'}</TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun colis trouvé
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
