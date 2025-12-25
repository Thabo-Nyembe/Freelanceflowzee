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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MessageSquare, Phone, Mail, Video, Search, Filter, Clock,
  User, Users, Star, TrendingUp, AlertTriangle, CheckCircle,
  XCircle, MoreVertical, Send, Paperclip, Smile, ArrowRight,
  BarChart3, Target, Zap, Shield, Globe, Tag, Inbox,
  Archive, Trash2, RefreshCw, ChevronRight, FileText, Bot,
  Settings, Bell, Lock, Key, Link2, Database, Palette, Headphones,
  Languages, Volume2, Calendar, Timer
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
  const [settingsTab, setSettingsTab] = useState('general')

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
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Settings Sub-tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'channels', label: 'Channels', icon: Headphones },
                    { id: 'sla', label: 'SLA & Routing', icon: Timer },
                    { id: 'automations', label: 'Automations', icon: Zap },
                    { id: 'integrations', label: 'Integrations', icon: Link2 },
                    { id: 'advanced', label: 'Advanced', icon: Database }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        settingsTab === tab.id
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-emerald-600" />
                          Support Identity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Support Team Name</Label>
                            <Input defaultValue="Kazi Support" className="mt-1" />
                          </div>
                          <div>
                            <Label>Support Email</Label>
                            <Input defaultValue="support@kazi.io" className="mt-1" />
                          </div>
                        </div>
                        <div>
                          <Label>Default Signature</Label>
                          <textarea
                            className="w-full mt-1 p-3 border rounded-lg text-sm resize-none h-20"
                            defaultValue="Best regards,&#10;The Kazi Support Team"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Business Hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Time Zone</Label>
                            <Select defaultValue="utc-5">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                                <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Business Hours</Label>
                            <Select defaultValue="9-17">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24-7">24/7</SelectItem>
                                <SelectItem value="9-17">9 AM - 5 PM</SelectItem>
                                <SelectItem value="8-20">8 AM - 8 PM</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Weekend Support</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable support during weekends</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Languages className="w-5 h-5 text-purple-600" />
                          Language & Localization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-translate Messages</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Translate incoming messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Channels Settings */}
                {settingsTab === 'channels' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support Channels</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Live Chat', description: 'Real-time website chat', icon: MessageSquare, enabled: true, color: 'emerald' },
                        { name: 'Email', description: 'support@kazi.io', icon: Mail, enabled: true, color: 'blue' },
                        { name: 'Phone', description: '+1-800-KAZI', icon: Phone, enabled: true, color: 'purple' },
                        { name: 'Social Media', description: 'Twitter, Facebook', icon: Globe, enabled: false, color: 'pink' },
                        { name: 'Help Widget', description: 'Embedded support', icon: Headphones, enabled: true, color: 'amber' },
                        { name: 'API', description: 'Programmatic tickets', icon: Zap, enabled: true, color: 'cyan' }
                      ].map(channel => (
                        <Card key={channel.name}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${channel.color}-100 dark:bg-${channel.color}-900/40 flex items-center justify-center`}>
                                  <channel.icon className={`w-5 h-5 text-${channel.color}-600`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{channel.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{channel.description}</p>
                                </div>
                              </div>
                              <Switch defaultChecked={channel.enabled} />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bot className="w-5 h-5 text-purple-600" />
                          AI & Chatbot Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>AI Auto-responses</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically suggest responses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Chatbot First Response</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Let chatbot handle initial contact</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Smart Ticket Categorization</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">AI categorizes and tags tickets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* SLA & Routing Settings */}
                {settingsTab === 'sla' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SLA Policies & Routing</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-600" />
                          SLA Policies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {slas.map(sla => (
                            <div key={sla.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  sla.priority === 'urgent' ? 'bg-red-500' :
                                  sla.priority === 'high' ? 'bg-orange-500' :
                                  sla.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                                <div>
                                  <h4 className="font-medium">{sla.name} Priority</h4>
                                  <p className="text-sm text-gray-500">
                                    First Response: {sla.firstResponseTarget}m • Resolution: {sla.resolutionTarget}m
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge className={sla.complianceRate >= 95 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                  {sla.complianceRate}% compliance
                                </Badge>
                                <Button variant="outline" size="sm">Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full">
                          <Target className="w-4 h-4 mr-2" />
                          Add SLA Policy
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Ticket Routing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Routing Method</Label>
                          <Select defaultValue="round-robin">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="round-robin">Round Robin</SelectItem>
                              <SelectItem value="load-balanced">Load Balanced</SelectItem>
                              <SelectItem value="skills-based">Skills Based</SelectItem>
                              <SelectItem value="manual">Manual Assignment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-assign New Tickets</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically assign to available agents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Priority Routing</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Route urgent tickets to senior agents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Max Tickets per Agent</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input type="number" defaultValue="10" className="w-20" />
                            <span className="text-sm text-gray-500">tickets</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          Escalation Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-escalate SLA Breaches</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify supervisors on SLA breach</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Escalate Negative Sentiment</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Flag angry customer messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Automations Settings */}
                {settingsTab === 'automations' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Automation Rules</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-600" />
                          Active Automations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Auto-assign urgent tickets', trigger: 'When priority = urgent', actions: ['Assign to senior agent', 'Send Slack alert'], status: 'active' },
                            { name: 'Send CSAT survey after resolution', trigger: 'When status = solved', actions: ['Wait 24h', 'Send survey email'], status: 'active' },
                            { name: 'Escalate unresponded tickets', trigger: 'No response for 2 hours', actions: ['Notify supervisor', 'Increase priority'], status: 'active' },
                            { name: 'Close inactive tickets', trigger: 'No activity for 7 days', actions: ['Send reminder', 'Close if no reply'], status: 'paused' },
                            { name: 'VIP customer routing', trigger: 'Customer tier = enterprise', actions: ['Route to VIP team', 'Set high priority'], status: 'active' }
                          ].map((rule, i) => (
                            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Zap className={`h-4 w-4 ${rule.status === 'active' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                  <span className="font-medium">{rule.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge>
                                  <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 ml-7">
                                <span className="text-gray-600 dark:text-gray-300">Trigger:</span> {rule.trigger}
                              </p>
                              <p className="text-sm text-gray-500 ml-7">
                                <span className="text-gray-600 dark:text-gray-300">Actions:</span> {rule.actions.join(' → ')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full">
                          <Zap className="w-4 h-4 mr-2" />
                          Create Automation
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Canned Responses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {cannedResponses.map(response => (
                            <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div>
                                <h4 className="font-medium text-sm">{response.title}</h4>
                                <p className="text-xs text-gray-500">{response.category} • Used {response.usageCount} times</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">Preview</Button>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Add Canned Response
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integrations</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Slack', description: 'Team notifications', icon: MessageSquare, connected: true, color: 'purple' },
                        { name: 'Salesforce', description: 'CRM sync', icon: Database, connected: true, color: 'blue' },
                        { name: 'Jira', description: 'Issue tracking', icon: Target, connected: true, color: 'blue' },
                        { name: 'Intercom', description: 'Chat integration', icon: MessageSquare, connected: false, color: 'blue' },
                        { name: 'Zendesk', description: 'Migrate tickets', icon: Headphones, connected: false, color: 'green' },
                        { name: 'HubSpot', description: 'Marketing automation', icon: TrendingUp, connected: false, color: 'orange' }
                      ].map(integration => (
                        <Card key={integration.name}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${integration.color}-100 dark:bg-${integration.color}-900/40 flex items-center justify-center`}>
                                  <integration.icon className={`w-5 h-5 text-${integration.color}-600`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                                </div>
                              </div>
                              {integration.connected ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Connected</Badge>
                              ) : (
                                <Button size="sm" variant="outline">Connect</Button>
                              )}
                            </div>
                            {integration.connected && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <RefreshCw className="w-3 h-3" />
                                Last synced 10 minutes ago
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label>API Key</Label>
                            <Button variant="ghost" size="sm">Regenerate</Button>
                          </div>
                          <Input type="password" value="cs_live_••••••••••••••••" readOnly className="font-mono" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            API Docs
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Webhooks
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>New Ticket Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert agents on new tickets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>SLA Warning Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Warn before SLA breach</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>CSAT Response Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify on survey responses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security & Privacy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Data Retention</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep closed tickets for</p>
                          </div>
                          <Select defaultValue="2years">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1year">1 Year</SelectItem>
                              <SelectItem value="2years">2 Years</SelectItem>
                              <SelectItem value="5years">5 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Mask Sensitive Data</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Hide credit cards, SSN in tickets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>GDPR Compliance Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable GDPR data handling</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Delete All Closed Tickets</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently remove closed tickets</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset All Settings</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Reset to factory defaults</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
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
