'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useTickets, useTicketMutations, useTicketMessageMutations } from '@/lib/hooks/use-tickets'
import {
  Ticket,
  MessageSquare,
  Clock,
  XCircle,
  AlertTriangle,
  Users,
  Download,
  Plus,
  Search,
  Mail,
  Zap,
  Award,
  TrendingUp,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Globe,
  Headphones,
  ArrowUp,
  RefreshCw,
  Tag,
  User,
  Building2,
  Shield,
  AlertCircle,
  CheckCircle,
  Hourglass,
  Timer,
  BarChart3,
  PieChart,
  Trash2,
  UserPlus,
  ArrowRight,
  Settings,
  Bell,
  Layers,
  Bug,
  BarChart
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




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

// Enhanced Competitive Upgrade Mock Data
const mockTicketsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Resolution Time', description: 'Average resolution down to 4.2 hours. 25% faster than last month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'Ticket Patterns', description: 'Login issues spiking - consider knowledge base article.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Patterns' },
  { id: '3', type: 'warning' as const, title: 'SLA Risk', description: '3 tickets approaching SLA breach in next 2 hours.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'SLA' },
]

const mockTicketsCollaborators = [
  { id: '1', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Senior Agent', avatar: '/avatars/agent.jpg', status: 'online' as const, role: 'Agent' },
  { id: '3', name: 'Escalation Mgr', avatar: '/avatars/escalation.jpg', status: 'busy' as const, role: 'Manager' },
]

const mockTicketsPredictions = [
  { id: '1', title: 'Volume Forecast', prediction: '120 tickets expected today', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'CSAT Score', prediction: '94% satisfaction projected', confidence: 88, trend: 'up' as const, impact: 'medium' as const },
]

const mockTicketsActivities = [
  { id: '1', user: 'Sarah Chen', action: 'Resolved ticket', target: '#TKT-1234', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Auto-Router', action: 'Assigned ticket to', target: 'Technical Team', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Mike Johnson', action: 'Escalated', target: '#TKT-1235 to Tier 2', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockTicketsQuickActions = [
  { id: '1', label: 'New Ticket', icon: 'plus', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Opening ticket form...', success: 'Create a new support ticket', error: 'Failed to open form' }), variant: 'default' as const },
  { id: '2', label: 'View Queue', icon: 'list', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading ticket queue...', success: 'Ticket Queue: 47 open • 12 in progress • 8 high priority', error: 'Failed to load queue' }), variant: 'default' as const },
  { id: '3', label: 'Reports', icon: 'chart', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Generating reports...', success: 'Ticket Reports: Resolution time: 2.4h avg • 94% satisfaction', error: 'Failed to load reports' }), variant: 'outline' as const },
]

export default function TicketsClient() {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [replyText, setReplyText] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [ticketToAssign, setTicketToAssign] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null)

  // Form states for new ticket
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'normal' as TicketPriority,
    category: 'General',
    customer_name: '',
    customer_email: ''
  })

  // Supabase hooks
  const { tickets: dbTickets, stats: dbStats, isLoading, refetch } = useTickets()
  const { createTicket, updateTicket, deleteTicket, assignTicket, isCreating, isUpdating, isDeleting } = useTicketMutations()
  const { createMessage, isCreating: isCreatingMessage } = useTicketMessageMutations()

  // Merge mock data with real DB data for display
  const allTickets = useMemo(() => {
    // Convert DB tickets to display format if available
    if (dbTickets && dbTickets.length > 0) {
      return dbTickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticket_number || `TKT-${t.id.slice(0, 8)}`,
        subject: t.subject,
        description: t.description || '',
        status: (t.status || 'new') as TicketStatus,
        priority: (t.priority || 'normal') as TicketPriority,
        channel: 'email' as TicketChannel,
        category: t.category || 'General',
        tags: t.tags || [],
        customer: {
          id: t.user_id,
          name: t.customer_name || 'Unknown',
          email: t.customer_email || '',
          tier: 'pro' as const,
          totalTickets: 1
        },
        assignee: t.assigned_to ? {
          id: t.assigned_to,
          name: t.assigned_name || 'Agent',
          team: 'Support'
        } : undefined,
        sla: {
          status: (t.sla_status || 'on-track') as SLAStatus,
          firstResponseDue: new Date(Date.now() + 3600000).toISOString(),
          resolutionDue: new Date(Date.now() + 86400000).toISOString(),
          firstResponseAt: t.first_response_at || undefined,
          resolvedAt: t.resolved_at || undefined
        },
        messages: [],
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }))
    }
    return mockTickets
  }, [dbTickets])

  // Stats calculations - uses real data when available
  const stats = useMemo(() => {
    const ticketsToCount = allTickets
    const total = ticketsToCount.length
    const newTickets = ticketsToCount.filter(t => t.status === 'new').length
    const open = ticketsToCount.filter(t => t.status === 'open').length
    const pending = ticketsToCount.filter(t => t.status === 'pending').length
    const solved = ticketsToCount.filter(t => t.status === 'solved').length
    const urgent = ticketsToCount.filter(t => t.priority === 'urgent').length
    const slaAtRisk = ticketsToCount.filter(t => t.sla.status === 'at-risk').length
    const slaBreached = ticketsToCount.filter(t => t.sla.status === 'breached').length
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
  }, [allTickets])

  // Filtered tickets - uses real data when available
  const filteredTickets = useMemo(() => {
    return allTickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [allTickets, searchQuery, statusFilter, priorityFilter])

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

  // Handlers - wired to real Supabase operations
  const handleCreateTicket = () => {
    setShowCreateDialog(true)
  }

  const handleSubmitNewTicket = async () => {
    if (!newTicket.subject.trim()) {
      toast.error('Validation Error', { description: 'Subject is required' })
      return
    }

    try {
      const ticketNumber = `TKT-${Date.now().toString().slice(-8)}`
      await createTicket({
        ticket_number: ticketNumber,
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority,
        category: newTicket.category,
        customer_name: newTicket.customer_name,
        customer_email: newTicket.customer_email,
        status: 'new',
        sla_status: 'on-track',
        tags: [],
        message_count: 0,
        attachment_count: 0,
        metadata: {}
      })
      toast.success('Ticket Created', { description: `Ticket ${ticketNumber} created successfully` })
      setShowCreateDialog(false)
      setNewTicket({ subject: '', description: '', priority: 'normal', category: 'General', customer_name: '', customer_email: '' })
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to create ticket' })
    }
  }

  const handleAssignTicket = (ticketId: string) => {
    setTicketToAssign(ticketId)
    setShowAssignDialog(true)
  }

  const handleConfirmAssign = async (agentId: string, agentName: string) => {
    if (!ticketToAssign) return

    try {
      await assignTicket(ticketToAssign, agentId, agentName)
      toast.success('Ticket Assigned', { description: `Ticket assigned to ${agentName}` })
      setShowAssignDialog(false)
      setTicketToAssign(null)
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to assign ticket' })
    }
  }

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await updateTicket({ id: ticketId, status: 'solved', resolved_at: new Date().toISOString() })
      toast.success('Ticket Resolved', { description: 'Ticket has been marked as solved' })
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to resolve ticket' })
    }
  }

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await updateTicket({ id: ticketId, status: 'closed', closed_at: new Date().toISOString() })
      toast.success('Ticket Closed', { description: 'Ticket has been closed' })
      setSelectedTicket(null)
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to close ticket' })
    }
  }

  const handleEscalateTicket = async (ticketId: string) => {
    try {
      await updateTicket({ id: ticketId, priority: 'urgent', sla_status: 'at-risk' })
      toast.success('Ticket Escalated', { description: 'Ticket has been escalated to urgent priority' })
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to escalate ticket' })
    }
  }

  const handleDeleteTicket = (ticketId: string) => {
    setTicketToDelete(ticketId)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return

    try {
      await deleteTicket(ticketToDelete)
      toast.success('Ticket Deleted', { description: 'Ticket has been deleted' })
      setShowDeleteDialog(false)
      setTicketToDelete(null)
      setSelectedTicket(null)
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to delete ticket' })
    }
  }

  const handleExportTickets = () => {
    // Export tickets to CSV
    const csvContent = allTickets.map(t =>
      `${t.ticketNumber},${t.subject},${t.status},${t.priority},${t.customer.name},${t.customer.email}`
    ).join('\n')

    const blob = new Blob([`Ticket#,Subject,Status,Priority,Customer,Email\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Export Complete', { description: 'Tickets exported to CSV file' })
  }

  const handleRefresh = async () => {
    toast.info('Refreshing', { description: 'Refreshing ticket data...' })
    await refetch()
    toast.success('Refreshed', { description: 'Ticket data updated' })
  }

  const handleNewTicket = () => {
    setShowCreateDialog(true)
  }

  const handleBulkAssign = () => {
    toast.info('Bulk Assign', { description: 'Opening bulk assignment dialog...' })
  }

  const handleAssignToMe = async (ticketId: string, ticketNumber: string) => {
    try {
      // In a real app, get current user info
      await assignTicket(ticketId, 'current-user-id', 'Me')
      toast.success('Ticket Assigned', { description: `Ticket ${ticketNumber} assigned to you` })
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to assign ticket' })
    }
  }

  const handleAddAgent = () => {
    toast.info('Add Agent', { description: 'Opening agent creation form...' })
  }

  const handleFullReport = () => {
    toast.info('Full Report', { description: 'Generating full analytics report...' })
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Empty Reply', { description: 'Please enter a message before sending' })
      return
    }

    if (!selectedTicket) {
      toast.error('Error', { description: 'No ticket selected' })
      return
    }

    try {
      await createMessage({
        ticket_id: selectedTicket.id,
        message_type: 'reply',
        content: replyText,
        is_internal: false,
        sender_name: 'Support Agent',
        attachments: []
      })

      // Update ticket to in-progress if it was new
      if (selectedTicket.status === 'new') {
        await updateTicket({ id: selectedTicket.id, status: 'open', first_response_at: new Date().toISOString() })
      }

      toast.success('Reply Sent', { description: 'Your reply has been sent to the customer' })
      setReplyText('')
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to send reply' })
    }
  }

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const updateData: any = { id: ticketId, status: newStatus }
      if (newStatus === 'solved') {
        updateData.resolved_at = new Date().toISOString()
      } else if (newStatus === 'closed') {
        updateData.closed_at = new Date().toISOString()
      }
      await updateTicket(updateData)
      toast.success('Status Updated', { description: `Ticket status changed to ${newStatus}` })
      refetch()
    } catch (error) {
      toast.error('Error', { description: 'Failed to update ticket status' })
    }
  }

  const handleSaveGeneralSettings = () => {
    toast.success('Settings Saved', {
      description: 'General settings have been updated'
    })
  }

  const handleSaveSLASettings = () => {
    toast.success('Settings Saved', {
      description: 'SLA policies have been updated'
    })
  }

  const handleSaveRoutingSettings = () => {
    toast.success('Settings Saved', {
      description: 'Routing settings have been updated'
    })
  }

  const handleSaveNotificationSettings = () => {
    toast.success('Settings Saved', {
      description: 'Notification settings have been updated'
    })
  }

  const handleSaveAdvancedSettings = () => {
    toast.success('Settings Saved', {
      description: 'Advanced settings have been updated'
    })
  }

  const handleExportAllTickets = () => {
    toast.info('Exporting Tickets', {
      description: 'Preparing ticket export file...'
    })
  }

  const handleExportAnalytics = () => {
    toast.info('Exporting Analytics', {
      description: 'Preparing analytics export file...'
    })
  }

  const handleDeleteResolvedTickets = () => {
    toast.warning('Delete Tickets', {
      description: 'This action would delete all resolved tickets'
    })
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
              <Button variant="outline" size="sm" onClick={handleExportTickets}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white" onClick={handleNewTicket}>
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
                <TabsTrigger value="settings">Settings</TabsTrigger>
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
              {/* Support Overview Banner */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl p-6 text-white mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Support Ticket Management</h2>
                    <p className="text-orange-100 text-sm">Zendesk-level help desk operations</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleRefresh}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                    <Button className="bg-white text-orange-700 hover:bg-orange-50" onClick={handleNewTicket}><Plus className="h-4 w-4 mr-2" />New Ticket</Button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-orange-100">Total Tickets</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.open}</p>
                    <p className="text-xs text-orange-100">Open</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.urgent}</p>
                    <p className="text-xs text-orange-100">Urgent</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                    <p className="text-xs text-orange-100">Avg Response</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.csatScore}%</p>
                    <p className="text-xs text-orange-100">CSAT Score</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.onlineAgents}</p>
                    <p className="text-xs text-orange-100">Agents Online</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-6 gap-4 mb-4">
                {[
                  { name: 'New Ticket', icon: Plus, desc: 'Create ticket', color: 'orange' },
                  { name: 'Assign', icon: Users, desc: 'Bulk assign', color: 'blue' },
                  { name: 'Merge', icon: ArrowRight, desc: 'Merge tickets', color: 'green' },
                  { name: 'Reports', icon: BarChart, desc: 'Analytics', color: 'purple' },
                  { name: 'SLA Status', icon: Clock, desc: 'Check SLAs', color: 'red' },
                  { name: 'Canned', icon: MessageSquare, desc: 'Responses', color: 'amber' },
                ].map((action, i) => (
                  <Card key={i} className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-3 text-center">
                      <action.icon className={`h-5 w-5 mx-auto mb-2 text-${action.color}-600`} />
                      <h4 className="font-medium text-xs">{action.name}</h4>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
                            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleSendReply} disabled={isCreatingMessage}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Ticket Actions */}
                        <div className="pt-4 border-t dark:border-gray-700 space-y-2">
                          <h5 className="text-sm font-medium mb-3">Actions</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {!selectedTicket.assignee && (
                              <Button size="sm" variant="outline" onClick={() => handleAssignTicket(selectedTicket.id)}>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Assign
                              </Button>
                            )}
                            {selectedTicket.status !== 'solved' && selectedTicket.status !== 'closed' && (
                              <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleResolveTicket(selectedTicket.id)} disabled={isUpdating}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                            {selectedTicket.status === 'solved' && (
                              <Button size="sm" variant="outline" onClick={() => handleCloseTicket(selectedTicket.id)} disabled={isUpdating}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Close
                              </Button>
                            )}
                            {selectedTicket.priority !== 'urgent' && (
                              <Button size="sm" variant="outline" className="text-orange-600" onClick={() => handleEscalateTicket(selectedTicket.id)} disabled={isUpdating}>
                                <ArrowUp className="w-4 h-4 mr-1" />
                                Escalate
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteTicket(selectedTicket.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
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
                          {allTickets.filter(t => t.sla.status === 'on-track').length}
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

              {/* System Status */}
              <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">All Support Systems Operational</span>
                    </div>
                    <span className="text-sm text-gray-400">Last sync: Just now</span>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Insights */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Priority Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { priority: 'Urgent', count: stats.urgent, color: 'red' },
                        { priority: 'High', count: allTickets.filter(t => t.priority === 'high').length, color: 'orange' },
                        { priority: 'Normal', count: allTickets.filter(t => t.priority === 'normal').length, color: 'blue' },
                        { priority: 'Low', count: allTickets.filter(t => t.priority === 'low').length, color: 'green' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                          <span className="text-sm flex-1">{item.priority}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Status Overview</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { status: 'New', count: stats.newTickets, pct: Math.round((stats.newTickets / stats.total) * 100) },
                        { status: 'Open', count: stats.open, pct: Math.round((stats.open / stats.total) * 100) },
                        { status: 'Pending', count: stats.pending, pct: Math.round((stats.pending / stats.total) * 100) },
                        { status: 'Solved', count: stats.solved, pct: Math.round((stats.solved / stats.total) * 100) },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.status}</span><span>{item.count} ({item.pct}%)</span>
                          </div>
                          <Progress value={item.pct} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Stats</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-lg font-bold text-green-600">{stats.csatScore}%</p>
                        <p className="text-xs text-gray-500">CSAT</p>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{stats.avgResponseTime}</p>
                        <p className="text-xs text-gray-500">Avg Response</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-lg font-bold text-orange-600">{stats.slaAtRisk}</p>
                        <p className="text-xs text-gray-500">At Risk</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">{stats.onlineAgents}</p>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Unassigned Tab */}
            <TabsContent value="unassigned" className="space-y-4">
              {/* Unassigned Overview Banner */}
              <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-xl p-6 text-white mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Unassigned Tickets</h2>
                    <p className="text-red-100 text-sm">Tickets waiting for agent assignment</p>
                  </div>
                  <Button className="bg-white text-red-700 hover:bg-red-50" onClick={handleBulkAssign}><Users className="h-4 w-4 mr-2" />Bulk Assign</Button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{allTickets.filter(t => !t.assignee).length}</p>
                    <p className="text-xs text-red-100">Unassigned</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{allTickets.filter(t => !t.assignee && t.priority === 'urgent').length}</p>
                    <p className="text-xs text-red-100">Urgent</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{allTickets.filter(t => !t.assignee && t.sla.status === 'at-risk').length}</p>
                    <p className="text-xs text-red-100">SLA At Risk</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.onlineAgents}</p>
                    <p className="text-xs text-red-100">Available Agents</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {allTickets.filter(t => !t.assignee).map(ticket => (
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
                          <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500" onClick={() => handleAssignToMe(ticket.id, ticket.ticketNumber)}>
                            Assign to me
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {allTickets.filter(t => !t.assignee).length === 0 && (
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
              {/* Agents Overview Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Support Team</h2>
                    <p className="text-blue-100 text-sm">Agent workload and performance</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleRefresh}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                    <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={handleAddAgent}><UserPlus className="h-4 w-4 mr-2" />Add Agent</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAgents.length}</p>
                    <p className="text-xs text-blue-100">Total Agents</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAgents.filter(a => a.status === 'online').length}</p>
                    <p className="text-xs text-blue-100">Online</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAgents.filter(a => a.status === 'busy').length}</p>
                    <p className="text-xs text-blue-100">Busy</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{Math.round(mockAgents.reduce((sum, a) => sum + a.satisfaction, 0) / mockAgents.length)}%</p>
                    <p className="text-xs text-blue-100">Avg CSAT</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAgents.reduce((sum, a) => sum + a.ticketsToday, 0)}</p>
                    <p className="text-xs text-blue-100">Tickets Today</p>
                  </div>
                </div>
              </div>

              {/* Agent Status Cards */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { status: 'Online', count: mockAgents.filter(a => a.status === 'online').length, color: 'green' },
                  { status: 'Busy', count: mockAgents.filter(a => a.status === 'busy').length, color: 'yellow' },
                  { status: 'Away', count: mockAgents.filter(a => a.status === 'away').length, color: 'orange' },
                  { status: 'Offline', count: mockAgents.filter(a => a.status === 'offline').length, color: 'gray' },
                ].map((item, i) => (
                  <Card key={i} className={`border-${item.color}-200 bg-${item.color}-50 dark:bg-${item.color}-900/20`}>
                    <CardContent className="p-4 text-center">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500 mx-auto mb-2`} />
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-sm text-gray-500">{item.status}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
              {/* Analytics Overview Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Support Analytics</h2>
                    <p className="text-purple-100 text-sm">Comprehensive performance insights</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleExportTickets}><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Button className="bg-white text-purple-700 hover:bg-purple-50" onClick={handleFullReport}><BarChart className="h-4 w-4 mr-2" />Full Report</Button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-purple-100">Total Volume</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                    <p className="text-xs text-purple-100">Avg Response</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
                    <p className="text-xs text-purple-100">Avg Resolution</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.csatScore}%</p>
                    <p className="text-xs text-purple-100">CSAT Score</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{Math.round((stats.solved / stats.total) * 100)}%</p>
                    <p className="text-xs text-purple-100">Resolution Rate</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.slaBreached}</p>
                    <p className="text-xs text-purple-100">SLA Breaches</p>
                  </div>
                </div>
              </div>

              {/* Performance KPIs */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'First Response Time', value: stats.avgResponseTime, target: '15 min', status: 'good' },
                  { label: 'Resolution Time', value: stats.avgResolutionTime, target: '4 hrs', status: 'warning' },
                  { label: 'Customer Satisfaction', value: `${stats.csatScore}%`, target: '95%', status: 'good' },
                  { label: 'SLA Compliance', value: `${Math.round(((stats.total - stats.slaBreached) / stats.total) * 100)}%`, target: '98%', status: 'warning' },
                ].map((kpi, i) => (
                  <Card key={i} className="bg-white dark:bg-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{kpi.label}</span>
                        <Badge className={kpi.status === 'good' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{kpi.status === 'good' ? 'On Target' : 'Needs Attention'}</Badge>
                      </div>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <p className="text-xs text-gray-500">Target: {kpi.target}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
                        const count = allTickets.filter(t => t.status === status).length
                        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
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

              {/* Weekly Trends */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Weekly Ticket Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const values = [34, 45, 52, 48, 61, 28, 22]
                      const max = Math.max(...values)
                      return (
                        <div key={day} className="text-center">
                          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-amber-500 rounded-lg transition-all" style={{ height: `${(values[i] / max) * 100}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{day}</p>
                          <p className="text-sm font-bold">{values[i]}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Insights */}
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Peak Hours</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { time: '9:00 AM - 11:00 AM', tickets: 45, color: 'red' },
                        { time: '2:00 PM - 4:00 PM', tickets: 38, color: 'orange' },
                        { time: '11:00 AM - 1:00 PM', tickets: 29, color: 'yellow' },
                      ].map((hour, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{hour.time}</span>
                          <Badge className={`bg-${hour.color}-100 text-${hour.color}-800`}>{hour.tickets} tickets</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Resolution Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { label: 'First Contact Resolution', value: 42, color: 'green' },
                        { label: 'Escalated', value: 18, color: 'orange' },
                        { label: 'Multi-Touch', value: 40, color: 'blue' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.label}</span>
                            <span className="font-medium">{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Customer Effort Score</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">4.2</div>
                      <p className="text-sm text-gray-500 mb-4">out of 5.0</p>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">Live Support Dashboard</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-gray-400">Active Chats: <span className="text-white font-medium">12</span></span>
                      <span className="text-gray-400">Queue: <span className="text-white font-medium">5</span></span>
                      <span className="text-gray-400">Updated: <span className="text-white font-medium">Just now</span></span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <Card className="col-span-3 h-fit border-gray-200 dark:border-gray-700">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'sla', icon: Clock, label: 'SLA Policies' },
                        { id: 'routing', icon: ArrowRight, label: 'Routing' },
                        { id: 'integrations', icon: Globe, label: 'Integrations' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'advanced', icon: Layers, label: 'Advanced' },
                      ].map(item => (
                        <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <item.icon className="h-4 w-4" /><span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Settings Content */}
                <div className="col-span-9 space-y-6">
                  {settingsTab === 'general' && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Configure default ticket behaviors</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">Default Priority</label><Input defaultValue="Normal" className="mt-1" /></div>
                          <div><label className="text-sm font-medium">Auto-close after (days)</label><Input type="number" defaultValue="7" className="mt-1" /></div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Auto-assign tickets</p><p className="text-sm text-gray-500">Automatically assign new tickets to available agents</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Enable CSAT surveys</p><p className="text-sm text-gray-500">Send satisfaction surveys after ticket resolution</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Agent collision detection</p><p className="text-sm text-gray-500">Show when multiple agents view same ticket</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Ticket merging</p><p className="text-sm text-gray-500">Allow merging duplicate tickets</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveGeneralSettings}>Save General Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'sla' && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>SLA Policies</CardTitle><CardDescription>Configure service level agreements</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { name: 'Urgent', response: '15 min', resolution: '4 hrs', color: 'red' },
                            { name: 'High', response: '1 hr', resolution: '8 hrs', color: 'orange' },
                            { name: 'Normal', response: '4 hrs', resolution: '24 hrs', color: 'blue' },
                          ].map((sla, i) => (
                            <Card key={i} className={`border-${sla.color}-200 bg-${sla.color}-50 dark:bg-${sla.color}-900/20`}>
                              <CardContent className="p-4">
                                <h4 className={`font-semibold text-${sla.color}-700 mb-3`}>{sla.name} Priority</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between"><span>First Response</span><span className="font-medium">{sla.response}</span></div>
                                  <div className="flex justify-between"><span>Resolution Time</span><span className="font-medium">{sla.resolution}</span></div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">SLA breach notifications</p><p className="text-sm text-gray-500">Alert when SLA is about to breach</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Business hours only</p><p className="text-sm text-gray-500">Calculate SLA during business hours</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveSLASettings}>Save SLA Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'routing' && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Ticket Routing</CardTitle><CardDescription>Configure automatic ticket assignment</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">Routing Method</label><Input defaultValue="Round Robin" className="mt-1" /></div>
                          <div><label className="text-sm font-medium">Max Tickets per Agent</label><Input type="number" defaultValue="20" className="mt-1" /></div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Skill-based routing</p><p className="text-sm text-gray-500">Route tickets based on agent skills</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Load balancing</p><p className="text-sm text-gray-500">Distribute tickets evenly among agents</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Priority routing</p><p className="text-sm text-gray-500">Route urgent tickets to senior agents</p></div>
                            <Switch />
                          </div>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveRoutingSettings}>Save Routing Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'integrations' && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Integrations</CardTitle><CardDescription>Connect with external tools and services</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'Slack', status: 'connected', icon: MessageSquare, desc: 'Team notifications' },
                            { name: 'Jira', status: 'connected', icon: Bug, desc: 'Issue tracking' },
                            { name: 'Salesforce', status: 'available', icon: Users, desc: 'CRM sync' },
                            { name: 'Intercom', status: 'available', icon: MessageSquare, desc: 'Chat support' },
                          ].map((integration, i) => (
                            <Card key={i} className={`border ${integration.status === 'connected' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <integration.icon className="h-5 w-5" />
                                    <h4 className="font-medium">{integration.name}</h4>
                                  </div>
                                  <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{integration.status}</Badge>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{integration.desc}</p>
                                <Button variant={integration.status === 'connected' ? 'outline' : 'default'} className="w-full" size="sm">
                                  {integration.status === 'connected' ? 'Configure' : 'Connect'}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'notifications' && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>Configure alert preferences</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="border"><CardContent className="p-4 text-center">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                            <p className="font-medium">Email</p><p className="text-sm text-gray-500">Enabled</p>
                          </CardContent></Card>
                          <Card className="border"><CardContent className="p-4 text-center">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-medium">Slack</p><p className="text-sm text-gray-500">Connected</p>
                          </CardContent></Card>
                          <Card className="border"><CardContent className="p-4 text-center">
                            <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="font-medium">Webhooks</p><p className="text-sm text-gray-500">2 Active</p>
                          </CardContent></Card>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">New ticket alerts</p><p className="text-sm text-gray-500">Notify when new tickets arrive</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">SLA breach alerts</p><p className="text-sm text-gray-500">Alert before SLA breaches</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Customer replies</p><p className="text-sm text-gray-500">Notify on customer responses</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Escalation alerts</p><p className="text-sm text-gray-500">Notify on ticket escalations</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveNotificationSettings}>Save Notification Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'advanced' && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Advanced Settings</CardTitle><CardDescription>Advanced configuration and automation</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">Ticket ID Prefix</label><Input defaultValue="TKT-" className="mt-1" /></div>
                          <div><label className="text-sm font-medium">Archive after (days)</label><Input type="number" defaultValue="90" className="mt-1" /></div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">AI-powered categorization</p><p className="text-sm text-gray-500">Automatically categorize tickets using AI</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Sentiment analysis</p><p className="text-sm text-gray-500">Detect customer sentiment in tickets</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Suggested responses</p><p className="text-sm text-gray-500">Show AI-suggested replies</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Data Management</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="justify-start" onClick={handleExportAllTickets}><Download className="w-4 h-4 mr-2" />Export All Tickets</Button>
                            <Button variant="outline" className="justify-start" onClick={handleExportAnalytics}><Download className="w-4 h-4 mr-2" />Export Analytics</Button>
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
                          <p className="text-sm text-red-600 dark:text-red-300 mb-3">These actions are irreversible.</p>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleDeleteResolvedTickets}>Delete All Resolved Tickets</Button>
                        </div>
                        <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSaveAdvancedSettings}>Save Advanced Settings</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={mockTicketsAIInsights}
                title="Ticket Intelligence"
                onInsightAction={(insight) => console.log('Insight action:', insight)}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={mockTicketsCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={mockTicketsPredictions}
                title="Support Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={mockTicketsActivities}
              title="Ticket Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={mockTicketsQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Enter the ticket details below. All tickets are saved to your database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Detailed description of the issue"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTicket.priority} onValueChange={(v: TicketPriority) => setNewTicket({ ...newTicket, priority: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Account Access">Account Access</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Bug Report">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={newTicket.customer_name}
                  onChange={(e) => setNewTicket({ ...newTicket, customer_name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_email">Customer Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={newTicket.customer_email}
                  onChange={(e) => setNewTicket({ ...newTicket, customer_email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitNewTicket} disabled={isCreating} className="bg-gradient-to-r from-orange-500 to-amber-500">
              {isCreating ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Ticket Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select an agent to assign this ticket to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {mockAgents.filter(a => a.status === 'online').map(agent => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleConfirmAssign(agent.id, agent.name)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.team} - {agent.openTickets} open tickets</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agent.status)}`} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
