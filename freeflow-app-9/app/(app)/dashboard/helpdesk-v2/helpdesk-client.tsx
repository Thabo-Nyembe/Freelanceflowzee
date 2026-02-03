'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Headphones, Plus, Search, Clock, CheckCircle, AlertCircle, Users, TrendingUp, MessageSquare } from 'lucide-react'

const tickets = [
  { id: 1, title: 'Cannot access email', category: 'Email', priority: 'high', status: 'open', user: 'John Smith', assignee: 'Sarah Tech', created: '2024-02-01 09:30', updated: '2024-02-01 10:15' },
  { id: 2, title: 'Laptop running slow', category: 'Hardware', priority: 'medium', status: 'in-progress', user: 'Emma Wilson', assignee: 'Mike Support', created: '2024-02-01 08:00', updated: '2024-02-01 14:30' },
  { id: 3, title: 'Password reset request', category: 'Access', priority: 'high', status: 'open', user: 'Alex Johnson', assignee: null, created: '2024-02-01 11:00', updated: '2024-02-01 11:00' },
  { id: 4, title: 'Software installation needed', category: 'Software', priority: 'low', status: 'pending', user: 'Lisa Brown', assignee: 'Sarah Tech', created: '2024-01-31 16:00', updated: '2024-02-01 09:00' },
  { id: 5, title: 'VPN connection issues', category: 'Network', priority: 'high', status: 'in-progress', user: 'David Park', assignee: 'Mike Support', created: '2024-02-01 07:30', updated: '2024-02-01 13:00' },
  { id: 6, title: 'Printer not working', category: 'Hardware', priority: 'medium', status: 'resolved', user: 'Maria Garcia', assignee: 'Sarah Tech', created: '2024-01-31 14:00', updated: '2024-02-01 10:00' },
]

const stats = {
  total: 145,
  open: 45,
  inProgress: 32,
  resolved: 68,
  avgResponseTime: '2.5 hours',
  satisfaction: 4.6,
}

const categories = [
  { name: 'Hardware', count: 32, color: 'bg-blue-100 text-blue-700' },
  { name: 'Software', count: 28, color: 'bg-purple-100 text-purple-700' },
  { name: 'Network', count: 25, color: 'bg-green-100 text-green-700' },
  { name: 'Access', count: 22, color: 'bg-orange-100 text-orange-700' },
  { name: 'Email', count: 18, color: 'bg-red-100 text-red-700' },
  { name: 'Other', count: 20, color: 'bg-gray-100 text-gray-700' },
]

const agents = [
  { name: 'Sarah Tech', tickets: 24, resolved: 18, avgTime: '2.1h', rating: 4.8 },
  { name: 'Mike Support', tickets: 28, resolved: 22, avgTime: '2.3h', rating: 4.7 },
  { name: 'Lisa Help', tickets: 19, resolved: 15, avgTime: '2.8h', rating: 4.5 },
]

export default function HelpdeskClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[priority]}>{priority}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-purple-100 text-purple-700',
      pending: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      (statusFilter === 'all' || t.status === statusFilter) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.user.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, statusFilter])

  const insights = [
    { icon: AlertCircle, title: `${stats.open}`, description: 'Open tickets' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.resolved}`, description: 'Resolved' },
    { icon: TrendingUp, title: `${stats.avgResponseTime}`, description: 'Avg response' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Headphones className="h-8 w-8 text-primary" />Helpdesk</h1>
          <p className="text-muted-foreground mt-1">Manage support tickets and requests</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
      </div>

      <CollapsibleInsightsPanel title="Helpdesk Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-3 text-center">
              <Badge className={category.color}>{category.name}</Badge>
              <p className="text-2xl font-bold mt-2">{category.count}</p>
              <p className="text-xs text-muted-foreground">Tickets</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
              <Button variant={statusFilter === 'open' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('open')}>Open</Button>
              <Button variant={statusFilter === 'in-progress' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('in-progress')}>In Progress</Button>
              <Button variant={statusFilter === 'resolved' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('resolved')}>Resolved</Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">#{ticket.id} {ticket.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{ticket.user}</span>
                          <span>•</span>
                          <span>{ticket.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.assignee}`} />
                              <AvatarFallback>{ticket.assignee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">{ticket.assignee}</span>
                          </div>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        Updated: {ticket.updated}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`} />
                          <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <p className="text-sm text-muted-foreground">Support Agent</p>
                        </div>
                      </div>
                      <Badge>★ {agent.rating}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-medium text-lg">{agent.tickets}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Resolved</p>
                        <p className="font-medium text-lg text-green-600">{agent.resolved}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium text-lg">{agent.avgTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
