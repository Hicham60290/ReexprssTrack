import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import api from '@/shared/lib/api'
import { formatDate } from '@/shared/utils/format'
import { Ticket, PaginatedResponse } from '@/shared/types'

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'RESOLVED':
      return 'success'
    case 'IN_PROGRESS':
      return 'info'
    case 'CLOSED':
      return 'default'
    default:
      return 'warning'
  }
}

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return 'destructive'
    case 'HIGH':
      return 'warning'
    case 'MEDIUM':
      return 'info'
    default:
      return 'default'
  }
}

export default function SupportPage() {
  const { data, isLoading } = useQuery<PaginatedResponse<Ticket>>({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/support/tickets')
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-muted-foreground">Gérez vos tickets de support</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mes tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <MessageSquare className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Mis à jour le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell>{formatDate(ticket.updatedAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucun ticket trouvé
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
