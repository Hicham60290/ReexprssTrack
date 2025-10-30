import { useQuery } from '@tantml:react-query'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Quote, PaginatedResponse } from '@/shared/types'

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'READY':
      return 'success'
    case 'ACCEPTED':
      return 'info'
    case 'EXPIRED':
      return 'destructive'
    default:
      return 'default'
  }
}

export default function AdminQuotesPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Quote>>({
    queryKey: ['admin-quotes'],
    queryFn: async () => {
      const response = await api.get('/admin/quotes')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des devis</h1>
        <p className="text-muted-foreground">Gérez tous les devis de la plateforme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <FileText className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>ID Colis</TableHead>
                  <TableHead>Transporteur</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Délai estimé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Expire le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-xs">{quote.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{quote.packageId.slice(0, 8)}...</TableCell>
                    <TableCell>{quote.carrier}</TableCell>
                    <TableCell>{quote.serviceName}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(quote.price)}</TableCell>
                    <TableCell>{quote.estimatedDays} jours</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(quote.createdAt)}</TableCell>
                    <TableCell>{formatDate(quote.expiresAt)}</TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Aucun devis trouvé
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
