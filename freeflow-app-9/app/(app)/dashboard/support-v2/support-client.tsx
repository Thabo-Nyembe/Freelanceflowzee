// Support V2 - Freshdesk Level Helpdesk Platform
// Comprehensive multi-channel support with SLA, automation, and analytics
'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Headphones,
  MessageSquare,
  Clock,
  CheckCircle,
  Users,
  Search,
  Mail,
  Phone,
  Zap,
  Plus,
  Settings,
  Star,
  Send,
  Timer,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  MessageCircle,
  Inbox,
  Archive,
  Trash2,
  BarChart3,
  Activity,
  Bot,
  Sparkles,
  Twitter,
  Facebook,
  Globe,
  UserCheck,
  ClipboardList,
  Key,
  Sliders,
  Webhook,
  Shield,
  Bell,
  HardDrive,
  Download,
  AlertOctagon
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




import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'

// Types
type TicketStatus = 'open' | 'pending' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketChannel = 'email' | 'chat' | 'phone' | 'twitter' | 'facebook' | 'portal' | 'api'
type TicketType = 'question' | 'incident' | 'problem' | 'feature_request' | 'refund'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  avatar?: string
  tier: 'free' | 'basic' | 'premium' | 'enterprise'
  totalTickets: number
  satisfaction?: number
  createdAt: string
}

interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'agent' | 'supervisor' | 'admin'
  status: 'online' | 'busy' | 'offline'
  openTickets: number
  resolvedToday: number
  avgResponseTime: number
  satisfaction: number
  skills: string[]
}

interface Ticket {
  id: string
  code: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  channel: TicketChannel
  customer: Customer
  assignee?: Agent
  group?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  firstResponseAt?: string
  resolvedAt?: string
  dueDate: string
  slaBreached: boolean
  replies: TicketReply[]
  satisfaction?: { rating: number; comment?: string }
  linkedTickets: string[]
  parentTicket?: string
  watchers: string[]
  customFields: Record<string, string>
}

interface TicketReply {
  id: string
  content: string
  type: 'reply' | 'note' | 'forward'
  isPublic: boolean
  author: Agent | Customer
  createdAt: string
  attachments: { name: string; size: string; type: string }[]
}

interface CannedResponse {
  id: string
  title: string
  content: string
  category: string
  shortcut: string
  usageCount: number
}

interface SLAPolicy {
  id: string
  name: string
  priority: TicketPriority
  firstResponseTime: number // hours
  resolutionTime: number // hours
  businessHours: boolean
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  conditions: string[]
  actions: string[]
  enabled: boolean
  executionCount: number
}

// Mock data
const mockCustomers: Customer[] = [
  { id: 'cu1', name: 'Sarah Chen', email: 'sarah@techcorp.com', company: 'TechCorp', tier: 'enterprise', totalTickets: 12, satisfaction: 4.8, createdAt: '2024-01-15' },
  { id: 'cu2', name: 'Mike Johnson', email: 'mike@startup.io', company: 'Startup.io', tier: 'premium', totalTickets: 8, satisfaction: 4.5, createdAt: '2024-03-20' },
  { id: 'cu3', name: 'Emily Davis', email: 'emily@design.co', company: 'Design Co', tier: 'basic', totalTickets: 3, satisfaction: 5.0, createdAt: '2024-06-10' },
]

const mockAgents: Agent[] = [
  { id: 'a1', name: 'John Smith', email: 'john@support.com', role: 'supervisor', status: 'online', openTickets: 8, resolvedToday: 12, avgResponseTime: 1.2, satisfaction: 4.8, skills: ['billing', 'technical', 'enterprise'] },
  { id: 'a2', name: 'Emily Davis', email: 'emily@support.com', role: 'agent', status: 'online', openTickets: 5, resolvedToday: 8, avgResponseTime: 0.8, satisfaction: 4.9, skills: ['technical', 'api'] },
  { id: 'a3', name: 'Mike Wilson', email: 'mike@support.com', role: 'agent', status: 'busy', openTickets: 10, resolvedToday: 6, avgResponseTime: 1.5, satisfaction: 4.6, skills: ['billing', 'refunds'] },
]

const mockTickets: Ticket[] = [
  {
    id: 't1',
    code: 'TKT-2024-001234',
    subject: 'Unable to access premium features after upgrade',
    description: 'I upgraded my account to premium yesterday but still cannot access the premium features. My payment went through successfully.',
    status: 'in_progress',
    priority: 'high',
    type: 'incident',
    channel: 'email',
    customer: mockCustomers[0],
    assignee: mockAgents[0],
    group: 'Billing',
    tags: ['billing', 'upgrade', 'premium'],
    createdAt: '2024-12-22T10:30:00Z',
    updatedAt: '2024-12-22T14:30:00Z',
    firstResponseAt: '2024-12-22T11:00:00Z',
    dueDate: '2024-12-23T10:30:00Z',
    slaBreached: false,
    replies: [
      { id: 'r1', content: 'Hi, I understand your concern. Let me look into this right away.', type: 'reply', isPublic: true, author: mockAgents[0], createdAt: '2024-12-22T11:00:00Z', attachments: [] },
      { id: 'r2', content: 'Customer account shows active premium status. Checking cache issues.', type: 'note', isPublic: false, author: mockAgents[0], createdAt: '2024-12-22T14:00:00Z', attachments: [] }
    ],
    linkedTickets: [],
    watchers: ['a2'],
    customFields: { 'subscription_id': 'sub_abc123' }
  },
  {
    id: 't2',
    code: 'TKT-2024-001235',
    subject: 'API rate limit questions',
    description: 'What are the current API rate limits for the enterprise plan? We are planning to scale our integration.',
    status: 'open',
    priority: 'medium',
    type: 'question',
    channel: 'portal',
    customer: mockCustomers[0],
    group: 'Technical',
    tags: ['api', 'enterprise', 'rate-limit'],
    createdAt: '2024-12-22T09:00:00Z',
    updatedAt: '2024-12-22T09:00:00Z',
    dueDate: '2024-12-24T09:00:00Z',
    slaBreached: false,
    replies: [],
    linkedTickets: [],
    watchers: [],
    customFields: {}
  },
  {
    id: 't3',
    code: 'TKT-2024-001236',
    subject: 'Request for refund - duplicate charge',
    description: 'I was charged twice for my subscription this month. Please process a refund for the duplicate charge.',
    status: 'waiting_on_customer',
    priority: 'high',
    type: 'refund',
    channel: 'chat',
    customer: mockCustomers[1],
    assignee: mockAgents[2],
    group: 'Billing',
    tags: ['refund', 'billing', 'urgent'],
    createdAt: '2024-12-21T16:00:00Z',
    updatedAt: '2024-12-22T10:00:00Z',
    firstResponseAt: '2024-12-21T16:15:00Z',
    dueDate: '2024-12-22T16:00:00Z',
    slaBreached: false,
    replies: [
      { id: 'r3', content: 'I apologize for the inconvenience. Could you please provide your transaction ID?', type: 'reply', isPublic: true, author: mockAgents[2], createdAt: '2024-12-21T16:15:00Z', attachments: [] }
    ],
    linkedTickets: [],
    watchers: ['a1'],
    customFields: { 'refund_amount': '$49.99' }
  },
  {
    id: 't4',
    code: 'TKT-2024-001237',
    subject: 'Feature request: Dark mode support',
    description: 'It would be great if the dashboard supported dark mode. Many of us work late hours and a dark theme would be easier on the eyes.',
    status: 'resolved',
    priority: 'low',
    type: 'feature_request',
    channel: 'portal',
    customer: mockCustomers[2],
    assignee: mockAgents[1],
    group: 'Product',
    tags: ['feature-request', 'ui', 'dark-mode'],
    createdAt: '2024-12-20T14:00:00Z',
    updatedAt: '2024-12-22T09:00:00Z',
    firstResponseAt: '2024-12-20T15:00:00Z',
    resolvedAt: '2024-12-22T09:00:00Z',
    dueDate: '2024-12-27T14:00:00Z',
    slaBreached: false,
    replies: [
      { id: 'r4', content: 'Thank you for the suggestion! This is already on our roadmap for Q1 2025.', type: 'reply', isPublic: true, author: mockAgents[1], createdAt: '2024-12-20T15:00:00Z', attachments: [] }
    ],
    satisfaction: { rating: 5, comment: 'Quick and helpful response!' },
    linkedTickets: [],
    watchers: [],
    customFields: {}
  },
  {
    id: 't5',
    code: 'TKT-2024-001238',
    subject: 'Integration not working with Slack',
    description: 'After the latest update, our Slack integration stopped sending notifications. We rely on this for our workflow.',
    status: 'open',
    priority: 'urgent',
    type: 'incident',
    channel: 'phone',
    customer: mockCustomers[0],
    group: 'Technical',
    tags: ['integration', 'slack', 'urgent', 'breaking'],
    createdAt: '2024-12-22T08:00:00Z',
    updatedAt: '2024-12-22T08:00:00Z',
    dueDate: '2024-12-22T12:00:00Z',
    slaBreached: true,
    replies: [],
    linkedTickets: ['t2'],
    watchers: [],
    customFields: { 'affected_workspace': 'TechCorp Main' }
  },
]

const mockCannedResponses: CannedResponse[] = [
  { id: 'cr1', title: 'Greeting - Standard', content: 'Hi {{customer.name}},\n\nThank you for reaching out to us. I would be happy to help you with this.', category: 'greetings', shortcut: '!greet', usageCount: 245 },
  { id: 'cr2', title: 'Refund Process', content: 'I apologize for the inconvenience. I have initiated your refund which will be processed within 5-7 business days.', category: 'billing', shortcut: '!refund', usageCount: 89 },
  { id: 'cr3', title: 'Escalation Notice', content: 'I am escalating this to our senior team for immediate attention. You will hear back within 2 hours.', category: 'escalation', shortcut: '!escalate', usageCount: 34 },
]

const mockSLAPolicies: SLAPolicy[] = [
  { id: 'sla1', name: 'Enterprise SLA', priority: 'urgent', firstResponseTime: 1, resolutionTime: 4, businessHours: false },
  { id: 'sla2', name: 'Enterprise SLA', priority: 'high', firstResponseTime: 4, resolutionTime: 8, businessHours: true },
  { id: 'sla3', name: 'Standard SLA', priority: 'medium', firstResponseTime: 8, resolutionTime: 24, businessHours: true },
  { id: 'sla4', name: 'Standard SLA', priority: 'low', firstResponseTime: 24, resolutionTime: 72, businessHours: true },
]

// Helper functions
const getStatusColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    waiting_on_customer: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return colors[status]
}

const getPriorityColor = (priority: TicketPriority): string => {
  const colors: Record<TicketPriority, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }
  return colors[priority]
}

const getChannelIcon = (channel: TicketChannel) => {
  const icons: Record<TicketChannel, typeof Mail> = {
    email: Mail,
    chat: MessageCircle,
    phone: Phone,
    twitter: Twitter,
    facebook: Facebook,
    portal: Globe,
    api: Zap
  }
  return icons[channel]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

const getTimeUntilDue = (dueDate: string): { text: string; isOverdue: boolean; urgent: boolean } => {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMs < 0) return { text: 'Overdue', isOverdue: true, urgent: true }
  if (diffHours < 2) return { text: `${diffHours}h left`, isOverdue: false, urgent: true }
  if (diffHours < 24) return { text: `${diffHours}h left`, isOverdue: false, urgent: false }
  return { text: `${Math.floor(diffHours / 24)}d left`, isOverdue: false, urgent: false }
}

interface SupportClientProps {
  initialTickets?: any[]
  initialStats?: any
}

// Competitive Upgrade Mock Data - Zendesk/Freshdesk Level Support Intelligence
const mockSupportAIInsights = [
  { id: '1', type: 'success' as const, title: 'Resolution Time', description: 'Average first response time improved to 12 minutes—industry leading!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Ticket Surge', description: 'Billing tickets up 45% this week. Consider FAQ update.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Volume' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Auto-response templates could resolve 30% of password reset tickets.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockSupportCollaborators = [
  { id: '1', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Senior Agent', avatar: '/avatars/agent.jpg', status: 'online' as const, role: 'Tier 2' },
  { id: '3', name: 'Technical Expert', avatar: '/avatars/tech.jpg', status: 'away' as const, role: 'Tier 3' },
]

const mockSupportPredictions = [
  { id: '1', title: 'CSAT Score', prediction: 'Customer satisfaction trending toward 4.8/5.0 this month', confidence: 91, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Ticket Volume', prediction: 'Expect 15% increase during product launch week', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
]

const mockSupportActivities = [
  { id: '1', user: 'Support Lead', action: 'Resolved', target: 'Priority 1 escalation #4521', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Senior Agent', action: 'Escalated', target: 'Technical issue to engineering', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'AI Bot', action: 'Auto-resolved', target: '23 password reset requests', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockSupportQuickActions = [
  { id: '1', label: 'New Ticket', icon: 'plus', action: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Opening ticket form...', success: 'Ticket form ready! Describe your issue', error: 'Failed to open form' }), variant: 'default' as const },
  { id: '2', label: 'Live Chat', icon: 'messageSquare', action: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Connecting to support agent...', success: 'Connected! Agent Sarah is ready to help', error: 'All agents busy - try again later' }), variant: 'default' as const },
  { id: '3', label: 'Knowledge', icon: 'book', action: () => toast.success('Knowledge Base', { description: '1,247 articles • Search or browse by category' }), variant: 'outline' as const },
]

export default function SupportClient({ initialTickets, initialStats }: SupportClientProps) {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [settingsTab, setSettingsTab] = useState('general')

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let result = [...mockTickets]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(ticket =>
        ticket.code.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.customer.name.toLowerCase().includes(query) ||
        ticket.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter)
    }

    if (priorityFilter !== 'all') {
      result = result.filter(ticket => ticket.priority === priorityFilter)
    }

    return result.sort((a, b) => {
      // Sort by SLA breached first, then by priority
      if (a.slaBreached && !b.slaBreached) return -1
      if (!a.slaBreached && b.slaBreached) return 1
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [searchQuery, statusFilter, priorityFilter])

  // Calculate stats
  const stats = useMemo(() => ({
    total: mockTickets.length,
    open: mockTickets.filter(t => t.status === 'open').length,
    inProgress: mockTickets.filter(t => t.status === 'in_progress').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
    slaBreached: mockTickets.filter(t => t.slaBreached).length,
    avgFirstResponse: '1.2h',
    avgResolution: '8.4h',
    satisfaction: 4.7,
    unassigned: mockTickets.filter(t => !t.assignee).length
  }), [])

  // Handlers
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const handleCreateTicket = () => setShowCreateDialog(true)
  const handleAssignTicket = (id: string) => { setSelectedTicketId(id); setShowAssignDialog(true) }
  const handleResolveTicket = (id: string) => toast.success('Resolved', { description: `#${id} resolved` })
  const handleExportTickets = () => toast.success('Exporting', { description: 'Data downloading...' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
              <p className="text-gray-600 dark:text-gray-400">Freshdesk-level helpdesk</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Loading automations...', success: 'Automation rules ready to configure', error: 'Failed to load' })}>
              <Bot className="w-4 h-4 mr-2" />
              Automations
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={handleCreateTicket}>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Inbox className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Open</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.open}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">In Progress</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Resolved</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-500">SLA Breached</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.slaBreached}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-500">Avg Response</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgFirstResponse}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-gray-500">Avg Resolution</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResolution}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">Satisfaction</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.satisfaction}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Unassigned</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unassigned}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="tickets" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Users className="w-4 h-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="canned" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Canned Responses
            </TabsTrigger>
            <TabsTrigger value="sla" className="gap-2">
              <Timer className="w-4 h-4" />
              SLA Policies
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-4">
            {/* Tickets Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Tickets</h2>
                  <p className="text-orange-100">Zendesk-level ticket management</p>
                  <p className="text-orange-200 text-xs mt-1">Priority queues • SLA tracking • Automation</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTickets.length}</p>
                    <p className="text-orange-200 text-sm">Open Tickets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTickets.filter(t => t.priority === 'urgent').length}</p>
                    <p className="text-orange-200 text-sm">Urgent</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Search and Filters */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets, customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="waiting_on_customer">Waiting</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
                    className="px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Ticket List */}
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const ChannelIcon = getChannelIcon(ticket.channel)
                const timeInfo = getTimeUntilDue(ticket.dueDate)
                return (
                  <Card
                    key={ticket.id}
                    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${ticket.slaBreached ? 'border-l-4 border-l-red-500' : ''}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                              {ticket.customer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <ChannelIcon className="w-4 h-4 text-gray-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                            <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace(/_/g, ' ')}</Badge>
                            {ticket.slaBreached && (
                              <Badge className="bg-red-100 text-red-700">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                SLA Breached
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">{ticket.code}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{ticket.subject}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{ticket.description}</p>

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{ticket.customer.name}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(ticket.createdAt)}
                            </span>
                            <span className={`flex items-center gap-1 ${timeInfo.isOverdue ? 'text-red-600' : timeInfo.urgent ? 'text-orange-600' : ''}`}>
                              <Timer className="w-3 h-3" />
                              {timeInfo.text}
                            </span>
                            {ticket.replies.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {ticket.replies.length}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {ticket.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {ticket.assignee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">{ticket.assignee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{ticket.assignee.name}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 cursor-pointer hover:bg-orange-50" onClick={(e) => { e.stopPropagation(); handleAssignTicket(ticket.id) }}>Unassigned</Badge>
                          )}
                          {ticket.group && (
                            <Badge variant="outline">{ticket.group}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            {/* Agents Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Team</h2>
                  <p className="text-purple-100">Freshdesk-level agent management</p>
                  <p className="text-purple-200 text-xs mt-1">Workload • Skills • Performance</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAgents.length}</p>
                    <p className="text-purple-200 text-sm">Agents</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAgents.map(agent => (
                <Card key={agent.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          agent.status === 'online' ? 'bg-green-500' :
                          agent.status === 'busy' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{agent.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Open Tickets</span>
                        <div className="font-semibold">{agent.openTickets}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolved Today</span>
                        <div className="font-semibold text-green-600">{agent.resolvedToday}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Response</span>
                        <div className="font-semibold">{agent.avgResponseTime}h</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Satisfaction</span>
                        <div className="font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {agent.satisfaction}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {agent.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Canned Responses Tab */}
          <TabsContent value="canned" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Canned Responses</h3>
              <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening response editor...', success: 'Create your new canned response', error: 'Failed to open' })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Response
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCannedResponses.map(response => (
                <Card key={response.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{response.title}</h4>
                      <Badge variant="outline">{response.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{response.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{response.shortcut}</span>
                      <span>{response.usageCount} uses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SLA Policies Tab */}
          <TabsContent value="sla" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SLA Policies</h3>
              <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening SLA editor...', success: 'Configure your new SLA policy', error: 'Failed to open' })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
            </div>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-gray-500">
                      <th className="p-4">Policy Name</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">First Response</th>
                      <th className="p-4">Resolution</th>
                      <th className="p-4">Business Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSLAPolicies.map(policy => (
                      <tr key={policy.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4 font-medium">{policy.name}</td>
                        <td className="p-4">
                          <Badge className={getPriorityColor(policy.priority)}>{policy.priority}</Badge>
                        </td>
                        <td className="p-4">{policy.firstResponseTime}h</td>
                        <td className="p-4">{policy.resolutionTime}h</td>
                        <td className="p-4">
                          {policy.businessHours ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <span className="text-sm text-gray-500">24/7</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Tickets by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'] as const).map(status => {
                      const count = mockTickets.filter(t => t.status === status).length
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                          <Progress value={(count / mockTickets.length) * 100} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Tickets by Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['email', 'chat', 'phone', 'portal'] as const).map(channel => {
                      const count = mockTickets.filter(t => t.channel === channel).length
                      const ChannelIcon = getChannelIcon(channel)
                      return (
                        <div key={channel} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-4 h-4 text-gray-400" />
                            <span className="capitalize">{channel}</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Agent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAgents.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{agent.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">{agent.resolvedToday} resolved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Zendesk Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'channels', label: 'Channels', icon: MessageSquare },
                        { id: 'automation', label: 'Automation', icon: Bot },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Support Stats Sidebar */}
                <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Helpdesk Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">4.8/5.0</div>
                      <div className="text-xs opacity-80">CSAT Score</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">1.2h</div>
                        <div className="text-xs opacity-80">Avg Response</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">8.4h</div>
                        <div className="text-xs opacity-80">Avg Resolution</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>SLA Compliance</span>
                        <span>94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-teal-600" />
                          Helpdesk Settings
                        </CardTitle>
                        <CardDescription>Configure your helpdesk profile and preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Helpdesk Name</Label>
                            <Input defaultValue="FreeFlow Support" />
                          </div>
                          <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="support@freeflow.app" type="email" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Business Hours Mode</div>
                            <div className="text-sm text-gray-500">Apply SLA only during business hours</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-purple-600" />
                          Ticket Settings
                        </CardTitle>
                        <CardDescription>Configure ticket behavior and defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Priority</Label>
                            <Select defaultValue="medium">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Auto-close After</Label>
                            <Select defaultValue="7">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 days</SelectItem>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="14">14 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Require Ticket Subject</div>
                            <div className="text-sm text-gray-500">All tickets must have a subject line</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Ticket Merging</div>
                            <div className="text-sm text-gray-500">Allow agents to merge duplicate tickets</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'channels' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-600" />
                          Email Channel
                        </CardTitle>
                        <CardDescription>Configure email support settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-400">Email Channel Active</div>
                              <div className="text-sm text-green-600 dark:text-green-500">support@freeflow.app</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email Parser Mode</Label>
                            <Select defaultValue="smart">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="smart">Smart (AI-powered)</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="strict">Strict</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Spam Filter Level</Label>
                            <Select defaultValue="medium">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-cyan-600" />
                          Live Chat Widget
                        </CardTitle>
                        <CardDescription>Configure the live chat widget for your website</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Live Chat</div>
                            <div className="text-sm text-gray-500">Show chat widget on your website</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Widget Color</Label>
                            <div className="flex gap-2">
                              {['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                                <button
                                  key={color}
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Widget Position</Label>
                            <Select defaultValue="right">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="right">Bottom Right</SelectItem>
                                <SelectItem value="left">Bottom Left</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Show Agent Photos</div>
                            <div className="text-sm text-gray-500">Display agent avatars in chat</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-indigo-600" />
                          Social Channels
                        </CardTitle>
                        <CardDescription>Connect social media support channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <Twitter className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Twitter / X</div>
                              <div className="text-sm text-gray-500">@freeflow_app</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <Facebook className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">Facebook Messenger</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Connecting Facebook Messenger...', success: 'Facebook connected! Messages will sync automatically', error: 'Connection failed' })}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'automation' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-purple-600" />
                          AI Automation
                        </CardTitle>
                        <CardDescription>Configure AI-powered automation rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="font-medium text-purple-800 dark:text-purple-400">AI Agent Assist</div>
                              <div className="text-sm text-purple-600 dark:text-purple-500">Suggest responses based on ticket content</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-categorization</div>
                            <div className="text-sm text-gray-500">Automatically categorize incoming tickets</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Sentiment Analysis</div>
                            <div className="text-sm text-gray-500">Detect customer sentiment from messages</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Priority Detection</div>
                            <div className="text-sm text-gray-500">Auto-prioritize urgent tickets</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          Workflow Rules
                        </CardTitle>
                        <CardDescription>Configure ticket assignment and routing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Auto-assignment Mode</Label>
                          <Select defaultValue="roundrobin">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="roundrobin">Round Robin</SelectItem>
                              <SelectItem value="loadbalanced">Load Balanced</SelectItem>
                              <SelectItem value="skills">Skills-based</SelectItem>
                              <SelectItem value="manual">Manual Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-escalation</div>
                            <div className="text-sm text-gray-500">Escalate tickets nearing SLA breach</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Customer Satisfaction Survey</div>
                            <div className="text-sm text-gray-500">Send CSAT survey after ticket resolution</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Agent Notifications
                        </CardTitle>
                        <CardDescription>Configure notifications for support agents</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">New Ticket Assigned</div>
                            <div className="text-sm text-gray-500">Notify when a ticket is assigned</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Customer Reply</div>
                            <div className="text-sm text-gray-500">Notify when customer responds</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">SLA Warning</div>
                            <div className="text-sm text-gray-500">Notify before SLA breach</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Ticket Escalation</div>
                            <div className="text-sm text-gray-500">Notify when ticket is escalated</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Customer Notifications
                        </CardTitle>
                        <CardDescription>Configure notifications for customers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Ticket Confirmation</div>
                            <div className="text-sm text-gray-500">Send confirmation when ticket created</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Agent Reply</div>
                            <div className="text-sm text-gray-500">Notify when agent responds</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Ticket Resolved</div>
                            <div className="text-sm text-gray-500">Notify when ticket is resolved</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-indigo-600" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>Manage third-party integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                              <span className="text-white font-bold">S</span>
                            </div>
                            <div>
                              <div className="font-medium">Slack</div>
                              <div className="text-sm text-gray-500">#support-tickets channel</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#2684FF] flex items-center justify-center">
                              <span className="text-white font-bold">J</span>
                            </div>
                            <div>
                              <div className="font-medium">Jira</div>
                              <div className="text-sm text-gray-500">Auto-create issues from tickets</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#00A4EF] flex items-center justify-center">
                              <span className="text-white font-bold">T</span>
                            </div>
                            <div>
                              <div className="font-medium">Microsoft Teams</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Connecting Microsoft Teams...', success: 'Teams connected! Sync starting...', error: 'Connection failed' })}>Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys and webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => toast.promise(navigator.clipboard.writeText('STRIPE_KEY_PLACEHOLDER'), { loading: 'Copying API key...', success: 'API key copied to clipboard!', error: 'Failed to copy API key' })}>Copy</Button>
                            <Button variant="outline" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Generating new API key...', success: 'New API key generated! Copy it now', error: 'Failed to generate' })}>Regenerate</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-server.com/webhooks/support" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Webhook Events</div>
                            <div className="text-sm text-gray-500">ticket.created, ticket.updated, ticket.resolved</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening webhook config...', success: 'Configure your webhook endpoints', error: 'Failed to load' })}>Configure</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Configure data retention and storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Ticket Retention Period</Label>
                          <Select defaultValue="365">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="730">2 years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Attachment Retention</Label>
                          <Select defaultValue="180">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={handleExportTickets}>
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Archiving old tickets...', success: '45 tickets archived successfully', error: 'Archive failed' })}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive Old Tickets
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Configure security and compliance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-500">Require 2FA for all agents</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">IP Allowlisting</div>
                            <div className="text-sm text-gray-500">Restrict access to specific IPs</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Audit Logging</div>
                            <div className="text-sm text-gray-500">Log all agent actions</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete All Tickets</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all tickets and data</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), { loading: 'Verifying delete permissions...', success: 'This action requires confirmation. Please use the confirmation dialog.', error: 'Permission verification failed' })}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Reset Helpdesk</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Reset all settings to default</div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), { loading: 'Preparing helpdesk reset...', success: 'This action requires confirmation. Please use the confirmation dialog.', error: 'Reset preparation failed' })}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockSupportAIInsights}
              title="Support Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSupportCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSupportPredictions}
              title="Support Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSupportActivities}
            title="Support Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockSupportQuickActions}
            variant="grid"
          />
        </div>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                    <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status.replace(/_/g, ' ')}</Badge>
                    <span className="text-sm text-gray-500">{selectedTicket.code}</span>
                    {selectedTicket.slaBreached && (
                      <Badge className="bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        SLA Breached
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-xl">{selectedTicket.subject}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-gray-700 dark:text-gray-300">{selectedTicket.description}</p>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Conversation</h4>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {selectedTicket.replies.map(reply => (
                            <div key={reply.id} className={`flex gap-3 ${reply.isPublic ? '' : 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg'}`}>
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {'name' in reply.author ? reply.author.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{'name' in reply.author ? reply.author.name : 'Unknown'}</span>
                                  {!reply.isPublic && <Badge variant="outline" className="text-xs">Internal Note</Badge>}
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex gap-2 mb-2">
                        <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening reply editor...', success: 'Reply editor ready', error: 'Failed to open' })}>Reply</Button>
                        <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening note editor...', success: 'Add your internal note', error: 'Failed to open' })}>Add Note</Button>
                        <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Opening forward dialog...', success: 'Select recipient to forward ticket', error: 'Failed to open' })}>Forward</Button>
                        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50" onClick={() => handleResolveTicket(selectedTicket.id)}>Resolve</Button>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-1"
                        />
                        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => { if (selectedTicket) { toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), { loading: 'Sending reply...', success: `Reply sent for ticket #${selectedTicket.code}!`, error: 'Failed to send reply' }); setReplyContent(''); } }}>
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h5 className="font-medium mb-3">Customer</h5>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar>
                          <AvatarFallback>{selectedTicket.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedTicket.customer.name}</div>
                          <div className="text-sm text-gray-500">{selectedTicket.customer.email}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Company</span>
                          <span>{selectedTicket.customer.company}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tier</span>
                          <Badge variant="outline" className="capitalize">{selectedTicket.customer.tier}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Tickets</span>
                          <span>{selectedTicket.customer.totalTickets}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <h5 className="font-medium mb-3">Properties</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type</span>
                          <span className="capitalize">{selectedTicket.type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Channel</span>
                          <span className="capitalize">{selectedTicket.channel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Group</span>
                          <span>{selectedTicket.group || 'None'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Assignee</span>
                          <span className="flex items-center gap-2">
                            {selectedTicket.assignee?.name || 'Unassigned'}
                            {!selectedTicket.assignee && (
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-teal-600" onClick={() => handleAssignTicket(selectedTicket.id)}>Assign</Button>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Due Date</span>
                          <span>{formatDate(selectedTicket.dueDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {selectedTicket.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>

                    {selectedTicket.satisfaction && (
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium text-green-800 dark:text-green-400">
                            {selectedTicket.satisfaction.rating}/5 Rating
                          </span>
                        </div>
                        {selectedTicket.satisfaction.comment && (
                          <p className="text-sm text-green-700 dark:text-green-300 italic">
                            "{selectedTicket.satisfaction.comment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
