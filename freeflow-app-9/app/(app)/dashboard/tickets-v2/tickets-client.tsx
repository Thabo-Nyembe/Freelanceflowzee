'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Ticket, Plus, Search, Clock, CheckCircle, AlertTriangle, TrendingUp, MessageSquare, User } from 'lucide-react'

const tickets = [
  { id: 'TICK-001', title: 'Login page not loading', description: 'Users cannot access the login page', priority: 'critical', status: 'open', assignee: 'John Smith', reporter: 'Alice Brown', created: '2024-02-01 09:00', dueDate: '2024-02-02', comments: 5, progress: 20 },
  { id: 'TICK-002', title: 'Export feature broken', description: 'CSV export returns empty file', priority: 'high', status: 'in-progress', assignee: 'Emma Wilson', reporter: 'Bob Johnson', created: '2024-02-01 10:30', dueDate: '2024-02-03', comments: 8, progress: 65 },
  { id: 'TICK-003', title: 'UI alignment issues on mobile', description: 'Dashboard not responsive', priority: 'medium', status: 'in-progress', assignee: 'Mike Chen', reporter: 'Carol White', created: '2024-01-31 15:00', dueDate: '2024-02-05', comments: 3, progress: 40 },
  { id: 'TICK-004', title: 'Add dark mode support', description: 'Users requesting dark theme', priority: 'low', status: 'open', assignee: null, reporter: 'David Lee', created: '2024-01-30 11:00', dueDate: '2024-02-10', comments: 12, progress: 0 },
  { id: 'TICK-005', title: 'Performance optimization needed', description: 'Page load times are slow', priority: 'high', status: 'in-progress', assignee: 'Sarah Davis', reporter: 'Eve Martinez', created: '2024-01-29 14:00', dueDate: '2024-02-04', comments: 6, progress: 75 },
  { id: 'TICK-006', title: 'Email notifications not sending', description: 'Users not receiving alerts', priority: 'critical', status: 'resolved', assignee: 'John Smith', reporter: 'Frank Wilson', created: '2024-01-28 09:00', dueDate: '2024-01-30', comments: 15, progress: 100 },
]

const ticketStats = [
  { label: 'Critical', count: 12, color: 'bg-red-100 text-red-700' },
  { label: 'High', count: 28, color: 'bg-orange-100 text-orange-700' },
  { label: 'Medium', count: 45, color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Low', count: 23, color: 'bg-green-100 text-green-700' },
]

const recentActivity = [
  { ticket: 'TICK-002', action: 'Status changed to In Progress', user: 'Emma Wilson', time: '5 min ago' },
  { ticket: 'TICK-001', action: 'New comment added', user: 'John Smith', time: '12 min ago' },
  { ticket: 'TICK-005', action: 'Progress updated to 75%', user: 'Sarah Davis', time: '1 hour ago' },
]

export default function TicketsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
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
      'in-progress': 'bg-purple-100 text-purple-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      (priorityFilter === 'all' || t.priority === priorityFilter) &&
      (statusFilter === 'all' || t.status === statusFilter) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, priorityFilter, statusFilter])

  const insights = [
    { icon: Ticket, title: `${stats.total}`, description: 'Total tickets' },
    { icon: AlertTriangle, title: `${stats.open}`, description: 'Open' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.resolved}`, description: 'Resolved' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Ticket className="h-8 w-8 text-primary" />Ticket Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage support tickets</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Ticket</Button>
      </div>

      <CollapsibleInsightsPanel title="Ticket Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {ticketStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <Badge className={stat.color}>{stat.label}</Badge>
              <p className="text-3xl font-bold mt-2">{stat.count}</p>
              <p className="text-sm text-muted-foreground">Priority tickets</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{ticket.id}</Badge>
                        <h4 className="font-semibold">{ticket.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>

                  {ticket.status === 'in-progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{ticket.progress}%</span>
                      </div>
                      <Progress value={ticket.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{ticket.reporter}</span>
                      </div>
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
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{ticket.comments}</span>
                      </div>
                      <span>Due: {ticket.dueDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <Badge variant="outline" className="mb-1">{activity.ticket}</Badge>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
