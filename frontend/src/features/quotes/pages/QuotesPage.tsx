import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import api from '@/shared/lib/api'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import { Quote, PaginatedResponse } from '@/shared/types'
import AcceptQuoteModal from '../components/AcceptQuoteModal'

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

export default function QuotesPage() {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)

  const { data, isLoading } = useQuery<PaginatedResponse<Quote>>({
    queryKey: ['quotes'],
    queryFn: async () => {
      const response = await api.get('/quotes')
      return response.data
    },
  })

  const handleAcceptClick = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsAcceptModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes devis</h1>
        <p className="text-muted-foreground">Consultez et gérez vos devis de transport</p>
      </div>

      <AcceptQuoteModal
        isOpen={isAcceptModalOpen}
        onClose={() => {
          setIsAcceptModalOpen(false)
          setSelectedQuote(null)
        }}
        quote={selectedQuote}
      />

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
                  <TableHead>ID Colis</TableHead>
                  <TableHead>Transporteur</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Délai estimé</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.packageId.slice(0, 8)}...</TableCell>
                    <TableCell>{quote.carrier}</TableCell>
                    <TableCell>{quote.serviceName}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(quote.price)}</TableCell>
                    <TableCell>{quote.estimatedDays} jours</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(quote.expiresAt)}</TableCell>
                    <TableCell>
                      {quote.status === 'READY' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcceptClick(quote)}
                        >
                          Accepter
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
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
