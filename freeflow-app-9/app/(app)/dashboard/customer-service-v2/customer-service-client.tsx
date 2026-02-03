'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Headphones, Users, Clock, CheckCircle, TrendingUp, Star } from 'lucide-react'

const tickets = [
  { id: 'CS-001', customer: 'John Smith', subject: 'Billing inquiry', priority: 'high', status: 'open', agent: 'Sarah M.', created: '2024-02-01 10:30' },
  { id: 'CS-002', customer: 'Emma Wilson', subject: 'Feature request', priority: 'low', status: 'in-progress', agent: 'Mike C.', created: '2024-02-01 09:15' },
  { id: 'CS-003', customer: 'Alex Johnson', subject: 'Technical issue', priority: 'critical', status: 'resolved', agent: 'Lisa B.', created: '2024-01-31 16:00' },
]

const metrics = [
  { name: 'Avg Response Time', value: '2.5h', change: -12, color: 'bg-green-100 text-green-700' },
  { name: 'Resolution Rate', value: '94%', change: 3, color: 'bg-blue-100 text-blue-700' },
  { name: 'Customer Satisfaction', value: '4.7/5', change: 0.2, color: 'bg-purple-100 text-purple-700' },
  { name: 'First Contact Resolution', value: '78%', change: 5, color: 'bg-orange-100 text-orange-700' },
]

export default function CustomerServiceClient() {
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    satisfaction: 4.7,
  }), [])

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[priority]}>{priority}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Headphones, title: `${stats.total}`, description: 'Total tickets' },
    { icon: Clock, title: `${stats.open}`, description: 'Open' },
    { icon: CheckCircle, title: `${stats.resolved}`, description: 'Resolved' },
    { icon: Star, title: `${stats.satisfaction}`, description: 'Satisfaction' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Headphones className="h-8 w-8 text-primary" />Customer Service</h1>
          <p className="text-muted-foreground mt-1">Manage customer support operations</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Service Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <Badge className={metric.color}>{metric.name}</Badge>
              <p className="text-3xl font-bold mt-2">{metric.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+{metric.change}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{ticket.id}</Badge>
                    <h4 className="font-semibold">{ticket.subject}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{ticket.customer} • Created: {ticket.created}</p>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Assigned to: {ticket.agent}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
