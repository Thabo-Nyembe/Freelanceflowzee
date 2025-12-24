'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  MessageSquare, Phone, Mail, Video, Search, Filter, Clock,
  User, Users, Star, TrendingUp, AlertTriangle, CheckCircle,
  XCircle, MoreVertical, Send, Paperclip, Smile, ArrowRight,
  BarChart3, Target, Zap, Shield, Globe, Tag, Inbox,
  Archive, Trash2, RefreshCw, ChevronRight, FileText, Bot
} from 'lucide-react'

// Types
type TicketStatus = 'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
type TicketChannel = 'chat' | 'email' | 'phone' | 'social' | 'web' | 'api'
type AgentStatus = 'online' | 'busy' | 'away' | 'offline'

interface Customer {
  id: string
  name: string
  email: string
  avatar: string
  phone?: string
  company?: string
  tier: 'basic' | 'pro' | 'enterprise'
  totalTickets: number
  satisfactionScore: number
  lastContact: string
  tags: string[]
  notes: string
}

interface Message {
  id: string
  content: string
  sender: 'customer' | 'agent' | 'system'
  senderName: string
  timestamp: string
  attachments?: { name: string; size: string; type: string }[]
  isInternal: boolean
}

interface Ticket {
  id: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  channel: TicketChannel
  customer: Customer
  assignee?: Agent
  tags: string[]
  messages: Message[]
  createdAt: string
  updatedAt: string
  firstResponseAt?: string
  resolvedAt?: string
  slaBreached: boolean
  satisfactionRating?: number
  category: string
}

interface Agent {
  id: string
  name: string
  email: string
  avatar: string
  status: AgentStatus
  role: 'agent' | 'supervisor' | 'admin'
  skills: string[]
  activeTickets: number
  resolvedToday: number
  avgResponseTime: number
  avgResolutionTime: number
  satisfactionScore: number
  languages: string[]
}

interface SLA {
  id: string
  name: string
  priority: TicketPriority
  firstResponseTarget: number
  resolutionTarget: number
  breachCount: number
  complianceRate: number
}

interface CannedResponse {
  id: string
  title: string
  content: string
  category: string
  usageCount: number
}

interface CustomerSupportClientProps {
  initialAgents: any[]
  initialConversations: any[]
  initialStats: any
}

// Mock Data
const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Sarah Johnson', email: 'sarah@techcorp.com', avatar: '/avatars/sarah.jpg', phone: '+1-555-0123', company: 'TechCorp Inc', tier: 'enterprise', totalTickets: 15, satisfactionScore: 4.8, lastContact: '2024-01-18', tags: ['vip', 'technical'], notes: 'Prefers email communication' },
  { id: 'c2', name: 'Mike Chen', email: 'mike@startup.io', avatar: '/avatars/mike.jpg', company: 'StartupIO', tier: 'pro', totalTickets: 8, satisfactionScore: 4.5, lastContact: '2024-01-17', tags: ['billing'], notes: '' },
  { id: 'c3', name: 'Emily Davis', email: 'emily@freelance.com', avatar: '/avatars/emily.jpg', tier: 'basic', totalTickets: 3, satisfactionScore: 5.0, lastContact: '2024-01-16', tags: ['new'], notes: 'First-time user' },
]

const mockAgents: Agent[] = [
  { id: 'a1', name: 'Alex Rivera', email: 'alex@support.com', avatar: '/avatars/alex.jpg', status: 'online', role: 'supervisor', skills: ['technical', 'billing', 'enterprise'], activeTickets: 5, resolvedToday: 12, avgResponseTime: 45, avgResolutionTime: 180, satisfactionScore: 4.9, languages: ['English', 'Spanish'] },
  { id: 'a2', name: 'Jordan Lee', email: 'jordan@support.com', avatar: '/avatars/jordan.jpg', status: 'online', role: 'agent', skills: ['technical', 'onboarding'], activeTickets: 8, resolvedToday: 8, avgResponseTime: 60, avgResolutionTime: 240, satisfactionScore: 4.7, languages: ['English'] },
  { id: 'a3', name: 'Taylor Kim', email: 'taylor@support.com', avatar: '/avatars/taylor.jpg', status: 'busy', role: 'agent', skills: ['billing', 'refunds'], activeTickets: 6, resolvedToday: 10, avgResponseTime: 30, avgResolutionTime: 120, satisfactionScore: 4.8, languages: ['English', 'Korean'] },
]

const mockTickets: Ticket[] = [
  {
    id: 't1', subject: 'Unable to export data to CSV', description: 'When I try to export my project data, the CSV file is empty',
    status: 'open', priority: 'high', channel: 'chat', customer: mockCustomers[0], assignee: mockAgents[0],
    tags: ['bug', 'export', 'data'], messages: [
      { id: 'm1', content: 'Hi, I\'m having trouble exporting my data. The CSV file comes out empty every time.', sender: 'customer', senderName: 'Sarah Johnson', timestamp: '10:30 AM', isInternal: false },
      { id: 'm2', content: 'Hi Sarah! I\'m sorry to hear that. Let me look into this for you. Could you tell me which browser you\'re using?', sender: 'agent', senderName: 'Alex Rivera', timestamp: '10:32 AM', isInternal: false },
      { id: 'm3', content: 'Checked the logs - seems like a timeout issue with large datasets', sender: 'agent', senderName: 'Alex Rivera', timestamp: '10:35 AM', isInternal: true },
    ],
    createdAt: '2024-01-18T10:30:00', updatedAt: '2024-01-18T10:35:00', firstResponseAt: '2024-01-18T10:32:00',
    slaBreached: false, category: 'Technical'
  },
  {
    id: 't2', subject: 'Billing question about annual subscription', description: 'I want to upgrade from monthly to annual',
    status: 'pending', priority: 'normal', channel: 'email', customer: mockCustomers[1], assignee: mockAgents[2],
    tags: ['billing', 'upgrade'], messages: [
      { id: 'm4', content: 'Hello, I\'d like to switch my monthly subscription to annual. How does the pricing work?', sender: 'customer', senderName: 'Mike Chen', timestamp: 'Yesterday', isInternal: false },
      { id: 'm5', content: 'Hi Mike! Great question. With annual billing, you save 20% compared to monthly...', sender: 'agent', senderName: 'Taylor Kim', timestamp: 'Yesterday', isInternal: false },
    ],
    createdAt: '2024-01-17T14:00:00', updatedAt: '2024-01-17T14:30:00', firstResponseAt: '2024-01-17T14:15:00',
    slaBreached: false, category: 'Billing'
  },
  {
    id: 't3', subject: 'Need help with API integration', description: 'Getting 401 errors when calling the API',
    status: 'new', priority: 'urgent', channel: 'web', customer: mockCustomers[0],
    tags: ['api', 'integration', 'error'], messages: [
      { id: 'm6', content: 'I keep getting 401 Unauthorized errors when trying to use the API. My token should be valid.', sender: 'customer', senderName: 'Sarah Johnson', timestamp: '5 min ago', isInternal: false },
    ],
    createdAt: '2024-01-18T11:00:00', updatedAt: '2024-01-18T11:00:00',
    slaBreached: true, category: 'Technical'
  },
]

const mockSLAs: SLA[] = [
  { id: 's1', name: 'Urgent', priority: 'urgent', firstResponseTarget: 15, resolutionTarget: 60, breachCount: 2, complianceRate: 95 },
  { id: 's2', name: 'High', priority: 'high', firstResponseTarget: 60, resolutionTarget: 240, breachCount: 5, complianceRate: 92 },
  { id: 's3', name: 'Normal', priority: 'normal', firstResponseTarget: 240, resolutionTarget: 1440, breachCount: 3, complianceRate: 98 },
  { id: 's4', name: 'Low', priority: 'low', firstResponseTarget: 480, resolutionTarget: 2880, breachCount: 0, complianceRate: 100 },
]

const mockCannedResponses: CannedResponse[] = [
  { id: 'cr1', title: 'Greeting - General', content: 'Hi {{customer_name}}! Thank you for reaching out. I\'d be happy to help you with that.', category: 'General', usageCount: 245 },
  { id: 'cr2', title: 'Password Reset', content: 'To reset your password, please click on "Forgot Password" on the login page...', category: 'Account', usageCount: 189 },
  { id: 'cr3', title: 'Billing Inquiry', content: 'I understand you have questions about your billing. Let me pull up your account...', category: 'Billing', usageCount: 156 },
  { id: 'cr4', title: 'Closing - Resolved', content: 'I\'m glad I could help resolve this for you! Is there anything else you need?', category: 'General', usageCount: 312 },
]

export default function CustomerSupportClient({ initialAgents, initialConversations, initialStats }: CustomerSupportClientProps) {
  const [activeTab, setActiveTab] = useState('tickets')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [channelFilter, setChannelFilter] = useState<TicketChannel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAgentDialog, setShowAgentDialog] = useState(false)

  const tickets = mockTickets
  const agents = mockAgents
  const slas = mockSLAs
  const cannedResponses = mockCannedResponses

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false
      if (channelFilter !== 'all' && ticket.channel !== channelFilter) return false
      if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [tickets, statusFilter, priorityFilter, channelFilter, searchQuery])

  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => ['new', 'open', 'pending'].includes(t.status)).length,
    avgResponseTime: Math.round(agents.reduce((sum, a) => sum + a.avgResponseTime, 0) / agents.length),
    satisfactionScore: (agents.reduce((sum, a) => sum + a.satisfactionScore, 0) / agents.length).toFixed(1),
    slaCompliance: Math.round(slas.reduce((sum, s) => sum + s.complianceRate, 0) / slas.length),
    resolvedToday: agents.reduce((sum, a) => sum + a.resolvedToday, 0)
  }

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDialog(true)
  }

  const getStatusColor = (status: TicketStatus) => {
    const colors: Record<TicketStatus, string> = {
      new: 'bg-blue-100 text-blue-700', open: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700', 'on-hold': 'bg-orange-100 text-orange-700',
      solved: 'bg-purple-100 text-purple-700', closed: 'bg-gray-100 text-gray-700'
    }
    return colors[status]
  }

  const getPriorityColor = (priority: TicketPriority) => {
    const colors: Record<TicketPriority, string> = {
      low: 'bg-gray-100 text-gray-700', normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700'
    }
    return colors[priority]
  }

  const getChannelIcon = (channel: TicketChannel) => {
    const icons: Record<TicketChannel, any> = {
      chat: MessageSquare, email: Mail, phone: Phone,
      social: Globe, web: Globe, api: Zap
    }
    const Icon = icons[channel]
    return <Icon className="h-4 w-4" />
  }

  const getAgentStatusColor = (status: AgentStatus) => {
    const colors: Record<AgentStatus, string> = {
      online: 'bg-green-500', busy: 'bg-orange-500', away: 'bg-yellow-500', offline: 'bg-gray-400'
    }
    return colors[status]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <MessageSquare className="h-8 w-8" />
                Customer Support
              </h1>
              <p className="text-emerald-100 mt-1">Manage tickets, agents, and customer relationships</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Bot className="h-4 w-4 mr-2" />
                AI Assist
              </Button>
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                <MessageSquare className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Open Tickets', value: stats.openTickets, icon: Inbox, color: 'text-white' },
              { label: 'Resolved Today', value: stats.resolvedToday, icon: CheckCircle, color: 'text-emerald-200' },
              { label: 'Avg Response', value: `${stats.avgResponseTime}m`, icon: Clock, color: 'text-white' },
              { label: 'CSAT Score', value: stats.satisfactionScore, icon: Star, color: 'text-yellow-300' },
              { label: 'SLA Compliance', value: `${stats.slaCompliance}%`, icon: Target, color: 'text-emerald-200' },
              { label: 'Agents Online', value: agents.filter(a => a.status === 'online').length, icon: Users, color: 'text-white' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-emerald-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <div className="flex gap-6">
              {/* Ticket List */}
              <div className="flex-1">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="solved">Solved</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2 mb-4">
                  {[
                    { label: 'My Tickets', count: 5 },
                    { label: 'Unassigned', count: 3 },
                    { label: 'SLA Breached', count: 1 },
                    { label: 'Awaiting Reply', count: 2 },
                  ].map((filter, i) => (
                    <button key={i} className="px-3 py-1.5 bg-white border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                      {filter.label}
                      <Badge variant="secondary" className="text-xs">{filter.count}</Badge>
                    </button>
                  ))}
                </div>

                {/* Ticket List */}
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredTickets.map(ticket => (
                        <div
                          key={ticket.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => openTicketDetails(ticket)}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center gap-2">
                              {getChannelIcon(ticket.channel)}
                              {ticket.slaBreached && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium truncate">{ticket.subject}</h4>
                                <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 truncate">{ticket.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ticket.customer.name}
                                </span>
                                <span>#{ticket.id}</span>
                                <span>{ticket.messages.length} messages</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                              {ticket.assignee && (
                                <div className="flex items-center gap-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={ticket.assignee.avatar} />
                                    <AvatarFallback>{ticket.assignee.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500">{ticket.assignee.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="w-80 space-y-4">
                {/* SLA Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      SLA Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {slas.map(sla => (
                      <div key={sla.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className={`font-medium ${sla.priority === 'urgent' ? 'text-red-600' : sla.priority === 'high' ? 'text-orange-600' : ''}`}>
                            {sla.name}
                          </span>
                          <span>{sla.complianceRate}%</span>
                        </div>
                        <Progress value={sla.complianceRate} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Canned Responses */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Quick Responses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cannedResponses.slice(0, 4).map(response => (
                        <button
                          key={response.id}
                          className="w-full text-left p-2 rounded-lg hover:bg-gray-100 text-sm"
                        >
                          <p className="font-medium">{response.title}</p>
                          <p className="text-xs text-gray-500 truncate">{response.content}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Online Agents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agents.map(agent => (
                        <div key={agent.id} className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={agent.avatar} />
                              <AvatarFallback>{agent.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getAgentStatusColor(agent.status)}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.activeTickets} active</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <div className="grid grid-cols-3 gap-6">
              {agents.map(agent => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedAgent(agent); setShowAgentDialog(true) }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${getAgentStatusColor(agent.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{agent.role}</p>
                        <Badge variant="outline" className="text-xs mt-1 capitalize">{agent.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-600">{agent.activeTickets}</p>
                        <p className="text-xs text-gray-500">Active</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold">{agent.resolvedToday}</p>
                        <p className="text-xs text-gray-500">Resolved Today</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Avg Response</span>
                        <span className="font-medium">{agent.avgResponseTime}m</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">CSAT Score</span>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {agent.satisfactionScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-4">
                      {agent.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Directory</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search customers..." className="w-64" />
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {mockCustomers.map(customer => (
                    <div key={customer.id} className="py-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={customer.avatar} />
                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{customer.name}</h4>
                          <Badge variant="outline" className="text-xs capitalize">{customer.tier}</Badge>
                          {customer.tags.includes('vip') && <Badge className="bg-yellow-500 text-xs">VIP</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                        {customer.company && <p className="text-sm text-gray-500">{customer.company}</p>}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{customer.satisfactionScore}</span>
                        </div>
                        <p className="text-sm text-gray-500">{customer.totalTickets} tickets</p>
                      </div>
                      <Button variant="outline" size="sm">View Profile</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Ticket Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Channel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { channel: 'Chat', count: 45, icon: MessageSquare, color: 'bg-blue-500' },
                    { channel: 'Email', count: 32, icon: Mail, color: 'bg-emerald-500' },
                    { channel: 'Phone', count: 18, icon: Phone, color: 'bg-purple-500' },
                    { channel: 'Web', count: 12, icon: Globe, color: 'bg-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.color} text-white`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.channel}</span>
                          <span className="text-sm">{item.count}</span>
                        </div>
                        <Progress value={(item.count / 45) * 100} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-emerald-600">2.4h</p>
                    <p className="text-sm text-gray-500 mt-2">Average Resolution</p>
                    <p className="text-sm text-green-600 mt-1">-18% from last week</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-yellow-500">4.7</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`h-5 w-5 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-500'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Based on 156 responses</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { issue: 'Login Problems', count: 23, trend: 'up' },
                      { issue: 'Billing Questions', count: 18, trend: 'down' },
                      { issue: 'API Integration', count: 15, trend: 'up' },
                      { issue: 'Feature Requests', count: 12, trend: 'same' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{item.issue}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.count}</span>
                          <TrendingUp className={`h-4 w-4 ${item.trend === 'up' ? 'text-red-500' : item.trend === 'down' ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SLA Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {slas.map(sla => (
                      <div key={sla.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{sla.name} Priority</h4>
                          <p className="text-sm text-gray-500">
                            First Response: {sla.firstResponseTarget}m • Resolution: {sla.resolutionTarget}m
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Canned Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cannedResponses.map(response => (
                      <div key={response.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{response.title}</h4>
                          <p className="text-xs text-gray-500">{response.category} • Used {response.usageCount} times</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button className="w-full">Add Response</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automation Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Auto-assign urgent tickets', status: 'active' },
                      { name: 'Send CSAT survey after resolution', status: 'active' },
                      { name: 'Escalate unresponded tickets', status: 'active' },
                      { name: 'Close inactive tickets', status: 'paused' },
                    ].map((rule, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Zap className={`h-4 w-4 ${rule.status === 'active' ? 'text-emerald-500' : 'text-gray-400'}`} />
                          <span className="text-sm">{rule.name}</span>
                        </div>
                        <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Slack', status: 'connected', icon: '💬' },
                      { name: 'Salesforce', status: 'connected', icon: '☁️' },
                      { name: 'Jira', status: 'connected', icon: '📋' },
                      { name: 'Intercom', status: 'not connected', icon: '💭' },
                    ].map((int, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{int.icon}</span>
                          <span className="font-medium text-sm">{int.name}</span>
                        </div>
                        <Badge variant={int.status === 'connected' ? 'default' : 'outline'}>
                          {int.status === 'connected' ? 'Connected' : 'Connect'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>#{selectedTicket.id}</span>
                  <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                  {selectedTicket.slaBreached && <Badge variant="destructive">SLA Breached</Badge>}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-6 h-[70vh]">
                {/* Conversation */}
                <div className="col-span-2 flex flex-col">
                  <h3 className="font-semibold mb-2">{selectedTicket.subject}</h3>

                  <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
                    <div className="space-y-4">
                      {selectedTicket.messages.map(message => (
                        <div key={message.id} className={`flex gap-3 ${message.isInternal ? 'bg-yellow-50 p-3 rounded-lg border border-yellow-200' : ''}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.senderName}</span>
                              <span className="text-xs text-gray-500">{message.timestamp}</span>
                              {message.isInternal && <Badge variant="outline" className="text-xs">Internal Note</Badge>}
                            </div>
                            <p className="text-sm text-gray-700">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Reply Box */}
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        variant={isInternalNote ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setIsInternalNote(!isInternalNote)}
                      >
                        {isInternalNote ? 'Internal Note' : 'Public Reply'}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={isInternalNote ? 'Add an internal note...' : 'Type your reply...'}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Ticket Info Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarImage src={selectedTicket.customer.avatar} />
                          <AvatarFallback>{selectedTicket.customer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedTicket.customer.name}</p>
                          <p className="text-xs text-gray-500">{selectedTicket.customer.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tier</span>
                          <Badge variant="outline" className="capitalize">{selectedTicket.customer.tier}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Tickets</span>
                          <span>{selectedTicket.customer.totalTickets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CSAT</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            {selectedTicket.customer.satisfactionScore}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedTicket.assignee ? (
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={selectedTicket.assignee.avatar} />
                            <AvatarFallback>{selectedTicket.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{selectedTicket.assignee.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{selectedTicket.assignee.role}</p>
                          </div>
                        </div>
                      ) : (
                        <Button className="w-full" variant="outline">Assign Agent</Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Channel</span>
                        <span className="flex items-center gap-1 capitalize">
                          {getChannelIcon(selectedTicket.channel)}
                          {selectedTicket.channel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category</span>
                        <span>{selectedTicket.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created</span>
                        <span>{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {selectedTicket.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">+ Add</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Solve
                    </Button>
                    <Button variant="outline">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
