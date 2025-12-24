'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Ticket,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Filter,
  Download,
  Plus,
  Search,
  Eye,
  Mail,
  Zap,
  Award,
  TrendingUp,
  Send,
  Paperclip,
  MoreVertical,
  Star,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Globe,
  Headphones,
  Bot,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Tag,
  Flag,
  User,
  Building2,
  Shield,
  AlertCircle,
  CheckCircle,
  XOctagon,
  Hourglass,
  Timer,
  BarChart3,
  PieChart,
  Activity,
  BookOpen,
  HelpCircle,
  FileText,
  Link2,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

// Types
type TicketStatus = 'new' | 'open' | 'pending' | 'on-hold' | 'solved' | 'closed'
type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
type TicketChannel = 'email' | 'chat' | 'phone' | 'web' | 'social' | 'api'
type SLAStatus = 'on-track' | 'at-risk' | 'breached'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  channel: TicketChannel
  category: string
  tags: string[]
  customer: {
    id: string
    name: string
    email: string
    avatar?: string
    company?: string
    tier: 'free' | 'pro' | 'enterprise'
    totalTickets: number
  }
  assignee?: {
    id: string
    name: string
    avatar?: string
    team: string
  }
  sla: {
    status: SLAStatus
    firstResponseDue: string
    resolutionDue: string
    firstResponseAt?: string
    resolvedAt?: string
  }
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
  satisfaction?: 'good' | 'bad'
  linkedTickets?: string[]
  mergedFrom?: string[]
}

interface TicketMessage {
  id: string
  sender: 'customer' | 'agent' | 'system'
  senderName: string
  senderAvatar?: string
  content: string
  attachments?: { name: string; size: string; type: string }[]
  isInternal: boolean
  createdAt: string
}

interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  team: string
  status: 'online' | 'away' | 'offline'
  openTickets: number
  resolvedToday: number
  avgResponseTime: string
  satisfaction: number
}

// Mock Data
const mockTickets: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    subject: 'Unable to access dashboard after password reset',
    description: 'I reset my password yesterday but now I cannot log into the dashboard. Getting "Invalid credentials" error.',
    status: 'open',
    priority: 'high',
    channel: 'email',
    category: 'Account Access',
    tags: ['login-issue', 'password', 'urgent'],
    customer: {
      id: 'c1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      company: 'Acme Corp',
      tier: 'enterprise',
      totalTickets: 12
    },
    assignee: {
      id: 'a1',
      name: 'Sarah Chen',
      team: 'Technical Support'
    },
    sla: {
      status: 'at-risk',
      firstResponseDue: '2024-02-15T14:00:00Z',
      resolutionDue: '2024-02-16T18:00:00Z',
      firstResponseAt: '2024-02-15T13:30:00Z'
    },
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        senderName: 'John Smith',
        content: 'I reset my password yesterday but now I cannot log into the dashboard. Getting "Invalid credentials" error.',
        isInternal: false,
        createdAt: '2024-02-15T10:00:00Z'
      },
      {
        id: 'm2',
        sender: 'agent',
        senderName: 'Sarah Chen',
        content: 'Hi John, I understand how frustrating this must be. Let me look into your account right away. Could you confirm the email address you\'re using to log in?',
        isInternal: false,
        createdAt: '2024-02-15T13:30:00Z'
      },
      {
        id: 'm3',
        sender: 'system',
        senderName: 'System',
        content: 'Status changed from New to Open',
        isInternal: true,
        createdAt: '2024-02-15T13:30:00Z'
      }
    ],
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T13:30:00Z'
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    subject: 'Feature request: Export to CSV',
    description: 'Would love to have the ability to export reports to CSV format for further analysis in Excel.',
    status: 'pending',
    priority: 'normal',
    channel: 'web',
    category: 'Feature Request',
    tags: ['feature-request', 'export', 'reporting'],
    customer: {
      id: 'c2',
      name: 'Emily Davis',
      email: 'emily@startup.io',
      company: 'StartupIO',
      tier: 'pro',
      totalTickets: 5
    },
    assignee: {
      id: 'a2',
      name: 'Mike Johnson',
      team: 'Product Support'
    },
    sla: {
      status: 'on-track',
      firstResponseDue: '2024-02-16T12:00:00Z',
      resolutionDue: '2024-02-20T18:00:00Z',
      firstResponseAt: '2024-02-15T16:00:00Z'
    },
    messages: [
      {
        id: 'm4',
        sender: 'customer',
        senderName: 'Emily Davis',
        content: 'Would love to have the ability to export reports to CSV format for further analysis in Excel.',
        isInternal: false,
        createdAt: '2024-02-15T14:00:00Z'
      },
      {
        id: 'm5',
        sender: 'agent',
        senderName: 'Mike Johnson',
        content: 'Thanks for the suggestion, Emily! I\'ve forwarded this to our product team for consideration. We\'ll update you once we have more information.',
        isInternal: false,
        createdAt: '2024-02-15T16:00:00Z'
      }
    ],
    createdAt: '2024-02-15T14:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z',
    satisfaction: 'good'
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    subject: 'Billing discrepancy on last invoice',
    description: 'I was charged $299 instead of the agreed $199/month on my enterprise plan.',
    status: 'new',
    priority: 'urgent',
    channel: 'phone',
    category: 'Billing',
    tags: ['billing', 'invoice', 'overcharge'],
    customer: {
      id: 'c3',
      name: 'Michael Chen',
      email: 'mchen@bigcorp.com',
      company: 'BigCorp Inc',
      tier: 'enterprise',
      totalTickets: 3
    },
    sla: {
      status: 'on-track',
      firstResponseDue: '2024-02-15T16:00:00Z',
      resolutionDue: '2024-02-15T20:00:00Z'
    },
    messages: [
      {
        id: 'm6',
        sender: 'customer',
        senderName: 'Michael Chen',
        content: 'I was charged $299 instead of the agreed $199/month on my enterprise plan. This needs to be fixed ASAP.',
        isInternal: false,
        createdAt: '2024-02-15T15:00:00Z'
      }
    ],
    createdAt: '2024-02-15T15:00:00Z',
    updatedAt: '2024-02-15T15:00:00Z'
  },
  {
    id: '4',
    ticketNumber: 'TKT-2024-004',
    subject: 'API rate limiting questions',
    description: 'Need clarification on the rate limits for the v2 API endpoints.',
    status: 'solved',
    priority: 'low',
    channel: 'chat',
    category: 'API Support',
    tags: ['api', 'rate-limiting', 'documentation'],
    customer: {
      id: 'c4',
      name: 'Lisa Wong',
      email: 'lisa@devshop.com',
      company: 'DevShop',
      tier: 'pro',
      totalTickets: 8
    },
    assignee: {
      id: 'a3',
      name: 'Alex Thompson',
      team: 'Technical Support'
    },
    sla: {
      status: 'on-track',
      firstResponseDue: '2024-02-14T12:00:00Z',
      resolutionDue: '2024-02-15T18:00:00Z',
      firstResponseAt: '2024-02-14T11:00:00Z',
      resolvedAt: '2024-02-14T15:00:00Z'
    },
    messages: [
      {
        id: 'm7',
        sender: 'customer',
        senderName: 'Lisa Wong',
        content: 'Need clarification on the rate limits for the v2 API endpoints.',
        isInternal: false,
        createdAt: '2024-02-14T10:00:00Z'
      },
      {
        id: 'm8',
        sender: 'agent',
        senderName: 'Alex Thompson',
        content: 'Hi Lisa! The v2 API has the following rate limits:\n- Free tier: 100 requests/min\n- Pro tier: 1000 requests/min\n- Enterprise: 10000 requests/min\n\nYou can also check our docs at docs.example.com/api/rate-limits',
        isInternal: false,
        createdAt: '2024-02-14T11:00:00Z'
      }
    ],
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: '2024-02-14T15:00:00Z',
    satisfaction: 'good'
  },
  {
    id: '5',
    ticketNumber: 'TKT-2024-005',
    subject: 'Integration with Salesforce not syncing',
    description: 'Our Salesforce integration stopped syncing contacts two days ago.',
    status: 'on-hold',
    priority: 'high',
    channel: 'email',
    category: 'Integrations',
    tags: ['integration', 'salesforce', 'sync-issue'],
    customer: {
      id: 'c5',
      name: 'David Park',
      email: 'dpark@salesteam.com',
      company: 'SalesTeam Pro',
      tier: 'enterprise',
      totalTickets: 15
    },
    assignee: {
      id: 'a1',
      name: 'Sarah Chen',
      team: 'Technical Support'
    },
    sla: {
      status: 'breached',
      firstResponseDue: '2024-02-13T12:00:00Z',
      resolutionDue: '2024-02-14T18:00:00Z',
      firstResponseAt: '2024-02-13T14:00:00Z'
    },
    messages: [
      {
        id: 'm9',
        sender: 'customer',
        senderName: 'David Park',
        content: 'Our Salesforce integration stopped syncing contacts two days ago. This is critical for our sales team.',
        isInternal: false,
        createdAt: '2024-02-13T10:00:00Z'
      },
      {
        id: 'm10',
        sender: 'agent',
        senderName: 'Sarah Chen',
        content: 'Hi David, I\'m looking into this now. Can you confirm if you made any changes to your Salesforce OAuth settings recently?',
        isInternal: false,
        createdAt: '2024-02-13T14:00:00Z'
      },
      {
        id: 'm11',
        sender: 'agent',
        senderName: 'Sarah Chen',
        content: 'Escalated to engineering team - awaiting response on OAuth token refresh bug',
        isInternal: true,
        createdAt: '2024-02-13T16:00:00Z'
      }
    ],
    createdAt: '2024-02-13T10:00:00Z',
    updatedAt: '2024-02-15T09:00:00Z'
  }
]

const mockAgents: Agent[] = [
  { id: 'a1', name: 'Sarah Chen', email: 'sarah@company.com', team: 'Technical Support', status: 'online', openTickets: 8, resolvedToday: 12, avgResponseTime: '15m', satisfaction: 96 },
  { id: 'a2', name: 'Mike Johnson', email: 'mike@company.com', team: 'Product Support', status: 'online', openTickets: 5, resolvedToday: 8, avgResponseTime: '22m', satisfaction: 92 },
  { id: 'a3', name: 'Alex Thompson', email: 'alex@company.com', team: 'Technical Support', status: 'away', openTickets: 3, resolvedToday: 15, avgResponseTime: '12m', satisfaction: 98 },
  { id: 'a4', name: 'Emma Wilson', email: 'emma@company.com', team: 'Billing Support', status: 'online', openTickets: 6, resolvedToday: 10, avgResponseTime: '18m', satisfaction: 94 },
  { id: 'a5', name: 'James Lee', email: 'james@company.com', team: 'Product Support', status: 'offline', openTickets: 2, resolvedToday: 7, avgResponseTime: '25m', satisfaction: 89 }
]

export default function TicketsClient() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [replyText, setReplyText] = useState('')

  // Stats calculations
  const stats = useMemo(() => {
    const total = mockTickets.length
    const newTickets = mockTickets.filter(t => t.status === 'new').length
    const open = mockTickets.filter(t => t.status === 'open').length
    const pending = mockTickets.filter(t => t.status === 'pending').length
    const solved = mockTickets.filter(t => t.status === 'solved').length
    const urgent = mockTickets.filter(t => t.priority === 'urgent').length
    const slaAtRisk = mockTickets.filter(t => t.sla.status === 'at-risk').length
    const slaBreached = mockTickets.filter(t => t.sla.status === 'breached').length
    const avgResponseTime = '18 min'
    const avgResolutionTime = '4.2 hrs'
    const csatScore = 94
    const onlineAgents = mockAgents.filter(a => a.status === 'online').length

    return {
      total,
      newTickets,
      open,
      pending,
      solved,
      urgent,
      slaAtRisk,
      slaBreached,
      avgResponseTime,
      avgResolutionTime,
      csatScore,
      onlineAgents,
      totalAgents: mockAgents.length
    }
  }, [])

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return mockTickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [searchQuery, statusFilter, priorityFilter])

  // Helper functions
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'new': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'on-hold': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'solved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'new': return <AlertCircle className="w-4 h-4" />
      case 'open': return <Clock className="w-4 h-4" />
      case 'pending': return <Hourglass className="w-4 h-4" />
      case 'on-hold': return <AlertTriangle className="w-4 h-4" />
      case 'solved': return <CheckCircle className="w-4 h-4" />
      case 'closed': return <XCircle className="w-4 h-4" />
      default: return <Ticket className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getSLAColor = (sla: SLAStatus) => {
    switch (sla) {
      case 'on-track': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'breached': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getChannelIcon = (channel: TicketChannel) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'chat': return <MessageSquare className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      case 'web': return <Globe className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'api': return <Zap className="w-4 h-4" />
      default: return <Ticket className="w-4 h-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'pro': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'free': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
                <p className="text-gray-500 dark:text-gray-400">Zendesk-level Helpdesk Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newTickets}</div>
                <div className="text-xs text-gray-500">New</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.open}</div>
                <div className="text-xs text-gray-500">Open</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-600 mb-1">
                  <Hourglass className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.solved}</div>
                <div className="text-xs text-gray-500">Solved</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgent}</div>
                <div className="text-xs text-gray-500">Urgent</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Timer className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResponseTime}</div>
                <div className="text-xs text-gray-500">Avg Response</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.csatScore}%</div>
                <div className="text-xs text-gray-500">CSAT Score</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-cyan-600 mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.onlineAgents}/{stats.totalAgents}</div>
                <div className="text-xs text-gray-500">Online Agents</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
                <TabsTrigger value="tickets">All Tickets</TabsTrigger>
                <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64 bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* All Tickets Tab */}
            <TabsContent value="tickets" className="space-y-4">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({stats.total})
                </Button>
                {(['new', 'open', 'pending', 'on-hold', 'solved'] as TicketStatus[]).map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(status)}
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </Button>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Tickets List */}
                <div className="lg:col-span-2 space-y-4">
                  {filteredTickets.map(ticket => (
                    <Card
                      key={ticket.id}
                      className={`bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer ${
                        selectedTicket?.id === ticket.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                              {ticket.customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">{ticket.subject}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{ticket.ticketNumber}</span>
                                  <span>•</span>
                                  <span>{ticket.customer.name}</span>
                                  <Badge className={getTierColor(ticket.customer.tier)} variant="outline">
                                    {ticket.customer.tier}
                                  </Badge>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(ticket.updatedAt)}</span>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{ticket.description}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(ticket.status)} variant="outline">
                                  {getStatusIcon(ticket.status)}
                                  <span className="ml-1">{ticket.status}</span>
                                </Badge>
                                <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                                  {ticket.priority}
                                </Badge>
                                <Badge className={getSLAColor(ticket.sla.status)} variant="outline">
                                  SLA: {ticket.sla.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                {getChannelIcon(ticket.channel)}
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs">{ticket.messages.length}</span>
                              </div>
                            </div>

                            {ticket.assignee && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                    {ticket.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-500">{ticket.assignee.name}</span>
                                <span className="text-sm text-gray-400">• {ticket.assignee.team}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Ticket Detail / Sidebar */}
                <div className="space-y-4">
                  {selectedTicket ? (
                    <Card className="bg-white dark:bg-gray-800 sticky top-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{selectedTicket.ticketNumber}</CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{selectedTicket.subject}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                            <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Customer:</span>
                            <span className="font-medium">{selectedTicket.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">{selectedTicket.customer.email}</span>
                          </div>
                          {selectedTicket.customer.company && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">{selectedTicket.customer.company}</span>
                            </div>
                          )}
                          {selectedTicket.assignee && (
                            <div className="flex items-center gap-2 text-sm">
                              <Headphones className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-500">Agent:</span>
                              <span className="font-medium">{selectedTicket.assignee.name}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {selectedTicket.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="pt-4 border-t dark:border-gray-700">
                          <h5 className="text-sm font-medium mb-3">Conversation</h5>
                          <ScrollArea className="h-64">
                            <div className="space-y-3 pr-4">
                              {selectedTicket.messages.filter(m => !m.isInternal).map(message => (
                                <div key={message.id} className={`flex gap-2 ${message.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                                  <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarFallback className={`text-xs ${message.sender === 'agent' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                                      {message.senderName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`flex-1 ${message.sender === 'agent' ? 'text-right' : ''}`}>
                                    <div className={`inline-block p-3 rounded-lg text-sm max-w-full ${
                                      message.sender === 'agent'
                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-left'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                      {message.content}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{formatDate(message.createdAt)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>

                        <div className="pt-4 border-t dark:border-gray-700">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type your reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white dark:bg-gray-800">
                      <CardContent className="p-8 text-center">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Select a ticket to view details</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* SLA Overview */}
                  <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" />
                        SLA Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">On Track</span>
                        <Badge className="bg-green-100 text-green-700">
                          {mockTickets.filter(t => t.sla.status === 'on-track').length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">At Risk</span>
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {stats.slaAtRisk}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Breached</span>
                        <Badge className="bg-red-100 text-red-700">
                          {stats.slaBreached}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Unassigned Tab */}
            <TabsContent value="unassigned" className="space-y-4">
              <div className="grid gap-4">
                {mockTickets.filter(t => !t.assignee).map(ticket => (
                  <Card key={ticket.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                              {ticket.customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{ticket.subject}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{ticket.ticketNumber}</span>
                              <span>•</span>
                              <span>{ticket.customer.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          <Badge className={getSLAColor(ticket.sla.status)}>SLA: {ticket.sla.status}</Badge>
                          <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500">
                            Assign to me
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {mockTickets.filter(t => !t.assignee).length === 0 && (
                  <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">All tickets are assigned!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAgents.map(agent => (
                  <Card key={agent.id} className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                          <Avatar className="w-14 h-14">
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-lg">
                              {agent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getAgentStatusColor(agent.status)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                          <p className="text-sm text-gray-500">{agent.team}</p>
                          <Badge variant="outline" className="mt-1 capitalize">{agent.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{agent.openTickets}</div>
                          <div className="text-xs text-gray-500">Open Tickets</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{agent.resolvedToday}</div>
                          <div className="text-xs text-gray-500">Resolved Today</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{agent.avgResponseTime}</div>
                          <div className="text-xs text-gray-500">Avg Response</div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{agent.satisfaction}%</div>
                          <div className="text-xs text-gray-500">Satisfaction</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-orange-500" />
                      Ticket Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.total}</div>
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +12% vs last week
                    </div>
                    <div className="mt-4 space-y-2">
                      {['new', 'open', 'pending', 'solved'].map(status => {
                        const count = mockTickets.filter(t => t.status === status).length
                        const percentage = Math.round((count / stats.total) * 100)
                        return (
                          <div key={status} className="flex items-center gap-2">
                            <div className="w-20 text-sm text-gray-500 capitalize">{status}</div>
                            <Progress value={percentage} className="flex-1 h-2" />
                            <div className="w-8 text-sm text-gray-600">{count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-blue-500" />
                      Response Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">First Response</span>
                          <span className="font-bold">{stats.avgResponseTime}</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">Resolution Time</span>
                          <span className="font-bold">{stats.avgResolutionTime}</span>
                        </div>
                        <Progress value={82} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">SLA Compliance</span>
                          <span className="font-bold">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Customer Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{stats.csatScore}%</div>
                    <div className="text-sm text-green-600 flex items-center gap-1 mb-4">
                      <TrendingUp className="w-4 h-4" />
                      +3% vs last month
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium">127</span>
                        <span className="text-gray-500">Good</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <ThumbsDown className="w-4 h-4 text-red-500" />
                        <span className="font-medium">8</span>
                        <span className="text-gray-500">Bad</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-500" />
                      By Channel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { channel: 'email', icon: Mail, count: 45, color: 'bg-blue-500' },
                        { channel: 'chat', icon: MessageSquare, count: 28, color: 'bg-green-500' },
                        { channel: 'phone', icon: Phone, count: 15, color: 'bg-yellow-500' },
                        { channel: 'web', icon: Globe, count: 12, color: 'bg-purple-500' }
                      ].map(item => (
                        <div key={item.channel} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 capitalize">{item.channel}</span>
                          <span className="text-sm font-medium">{item.count}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-cyan-500" />
                      Top Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { category: 'Account Access', count: 32 },
                        { category: 'Billing', count: 24 },
                        { category: 'Feature Request', count: 18 },
                        { category: 'Technical Issue', count: 15 },
                        { category: 'Integrations', count: 11 }
                      ].map((item, i) => (
                        <div key={item.category} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.category}</span>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockAgents
                        .sort((a, b) => b.satisfaction - a.satisfaction)
                        .slice(0, 4)
                        .map((agent, i) => (
                          <div key={agent.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                              {i + 1}
                            </div>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                {agent.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{agent.name}</span>
                            <span className="text-sm font-medium">{agent.satisfaction}%</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
