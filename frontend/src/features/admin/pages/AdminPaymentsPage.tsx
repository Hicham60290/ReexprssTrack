import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Payment, PaginatedResponse } from '@/shared/types'

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'SUCCEEDED':
      return 'success'
    case 'PROCESSING':
      return 'info'
    case 'PENDING':
      return 'warning'
    case 'FAILED':
      return 'destructive'
    case 'REFUNDED':
      return 'default'
    default:
      return 'default'
  }
}

export default function AdminPaymentsPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Payment>>({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const response = await api.get('/admin/payments')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des paiements</h1>
        <p className="text-muted-foreground">Gérez tous les paiements de la plateforme</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <CreditCard className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>ID Devis</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Stripe Payment ID</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Mis à jour le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.id.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{payment.quoteId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-bold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.stripePaymentIntentId?.slice(0, 20) || '-'}
                    </TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>{formatDate(payment.updatedAt)}</TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun paiement trouvé
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
