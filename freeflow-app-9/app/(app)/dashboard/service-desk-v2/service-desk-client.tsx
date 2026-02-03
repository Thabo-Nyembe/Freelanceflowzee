'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Headphones, Ticket, Clock, Search, Filter, Plus, AlertTriangle,
  CheckCircle, XCircle, MoreHorizontal, User, Building2, Laptop,
  Server, Wifi, Mail, Phone, MessageSquare, TrendingUp, Users,
  Timer, BarChart3, ArrowUpRight, Zap, Shield
} from 'lucide-react'

const tickets = [
  {
    id: 'TKT-001',
    subject: 'VPN Connection Issues',
    requester: 'John Smith',
    department: 'Engineering',
    priority: 'high',
    status: 'open',
    category: 'Network',
    assignee: 'IT Support',
    createdAt: '2024-01-15T09:30:00Z',
    lastUpdated: '2 hours ago',
    sla: { target: 4, remaining: 2.5 }
  },
  {
    id: 'TKT-002',
    subject: 'Email not syncing on mobile',
    requester: 'Sarah Johnson',
    department: 'Marketing',
    priority: 'medium',
    status: 'in_progress',
    category: 'Email',
    assignee: 'Mike Chen',
    createdAt: '2024-01-15T08:15:00Z',
    lastUpdated: '1 hour ago',
    sla: { target: 8, remaining: 5.5 }
  },
  {
    id: 'TKT-003',
    subject: 'Need software installation - Adobe CC',
    requester: 'Emily Davis',
    department: 'Design',
    priority: 'low',
    status: 'pending',
    category: 'Software',
    assignee: 'Unassigned',
    createdAt: '2024-01-14T16:45:00Z',
    lastUpdated: '18 hours ago',
    sla: { target: 24, remaining: 16 }
  },
  {
    id: 'TKT-004',
    subject: 'Server downtime reported',
    requester: 'System Alert',
    department: 'Operations',
    priority: 'critical',
    status: 'open',
    category: 'Infrastructure',
    assignee: 'IT Support',
    createdAt: '2024-01-15T10:00:00Z',
    lastUpdated: '30 min ago',
    sla: { target: 1, remaining: 0.5 }
  },
  {
    id: 'TKT-005',
    subject: 'Password reset request',
    requester: 'Tom Wilson',
    department: 'Sales',
    priority: 'medium',
    status: 'resolved',
    category: 'Access',
    assignee: 'IT Support',
    createdAt: '2024-01-14T14:20:00Z',
    lastUpdated: '5 hours ago',
    sla: { target: 4, remaining: 0 }
  },
]

const stats = {
  openTickets: 3,
  resolvedToday: 12,
  avgResolutionTime: '3.2 hours',
  slaCompliance: 94,
  firstResponseTime: '15 min'
}

const categories = [
  { name: 'Network', icon: Wifi, count: 8, color: 'bg-blue-100 text-blue-700' },
  { name: 'Email', icon: Mail, count: 5, color: 'bg-green-100 text-green-700' },
  { name: 'Software', icon: Laptop, count: 12, color: 'bg-purple-100 text-purple-700' },
  { name: 'Hardware', icon: Server, count: 4, color: 'bg-orange-100 text-orange-700' },
  { name: 'Access', icon: Shield, count: 7, color: 'bg-yellow-100 text-yellow-700' },
]

export default function ServiceDeskClient() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [searchQuery, statusFilter, priorityFilter])

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300',
    }
    return <Badge variant="outline" className={styles[priority as keyof typeof styles]}>{priority}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    const labels = {
      open: 'Open',
      in_progress: 'In Progress',
      pending: 'Pending',
      resolved: 'Resolved',
      closed: 'Closed',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const insights = [
    { icon: Ticket, title: `${stats.openTickets} Open`, description: 'Active tickets' },
    { icon: CheckCircle, title: `${stats.resolvedToday} Resolved`, description: 'Today' },
    { icon: TrendingUp, title: `${stats.slaCompliance}% SLA`, description: 'Compliance rate' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Headphones className="h-8 w-8 text-primary" />
            Service Desk
          </h1>
          <p className="text-muted-foreground mt-1">IT support and ticket management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Support Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold">{stats.resolvedToday}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
              </div>
              <Timer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold">{stats.slaCompliance}%</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">First Response</p>
                <p className="text-2xl font-bold">{stats.firstResponseTime}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="sla">SLA Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Support Tickets</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-2 w-2 rounded-full ${
                        ticket.priority === 'critical' ? 'bg-red-500' :
                        ticket.priority === 'high' ? 'bg-orange-500' :
                        ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                        <h4 className="font-medium mt-1">{ticket.subject}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center"><User className="h-3 w-3 mr-1" />{ticket.requester}</span>
                          <span className="flex items-center"><Building2 className="h-3 w-3 mr-1" />{ticket.department}</span>
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{ticket.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ticket.status !== 'resolved' && (
                        <div className="text-right">
                          <p className="text-sm font-medium">SLA: {ticket.sla.remaining}h remaining</p>
                          <Progress value={(ticket.sla.remaining / ticket.sla.target) * 100} className="h-2 w-24" />
                        </div>
                      )}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{ticket.assignee.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Categories</CardTitle>
              <CardDescription>Distribution of support requests by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className={`h-12 w-12 rounded-full ${cat.color} mx-auto mb-3 flex items-center justify-center`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-2xl font-bold mt-1">{cat.count}</p>
                    <p className="text-sm text-muted-foreground">tickets</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Performance</CardTitle>
              <CardDescription>Service level agreement compliance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg text-center">
                  <p className="text-4xl font-bold text-green-600">94%</p>
                  <p className="font-medium mt-2">Overall SLA Compliance</p>
                  <p className="text-sm text-muted-foreground">Target: 95%</p>
                  <Progress value={94} className="h-2 mt-4" />
                </div>
                <div className="p-6 border rounded-lg text-center">
                  <p className="text-4xl font-bold text-blue-600">15m</p>
                  <p className="font-medium mt-2">First Response Time</p>
                  <p className="text-sm text-muted-foreground">Target: 30m</p>
                  <Progress value={100} className="h-2 mt-4" />
                </div>
                <div className="p-6 border rounded-lg text-center">
                  <p className="text-4xl font-bold text-purple-600">3.2h</p>
                  <p className="font-medium mt-2">Resolution Time</p>
                  <p className="text-sm text-muted-foreground">Target: 4h</p>
                  <Progress value={80} className="h-2 mt-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
