import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
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

export default function PackagesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<PackageType>>({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await api.get('/packages')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes colis</h1>
          <p className="text-muted-foreground">Gérez et suivez vos colis</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau colis
        </Button>
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
                  <TableHead>Numéro de suivi</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de réception</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.trackingNumber}</TableCell>
                    <TableCell>{pkg.description || '-'}</TableCell>
                    <TableCell>{pkg.weight ? formatWeight(pkg.weight) : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(pkg.status)}>
                        {pkg.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{pkg.receivedAt ? formatDate(pkg.receivedAt) : '-'}</TableCell>
                    <TableCell>
                      <Link to={`/packages/${pkg.id}`}>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
