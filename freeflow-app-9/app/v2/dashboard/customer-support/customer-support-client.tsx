'use client'


import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
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
  MessageSquare, Phone, Mail, Search, Filter, Clock,
  User, Users, Star, TrendingUp, AlertTriangle, CheckCircle, Send, Paperclip, Smile,
  BarChart3, Target, Zap, Shield, Globe, Tag, Inbox,
  Archive, RefreshCw, FileText, Bot,
  Settings, Bell, Key, Link2, Database, Headphones,
  Languages, Calendar, Timer
} from 'lucide-react'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'




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

// Database Types
interface DbTicket {
  id: string
  user_id: string
  ticket_code: string
  subject: string
  description: string | null
  category: string
  priority: string
  status: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  assigned_to: string | null
  assigned_at: string | null
  channel: string
  resolution_notes: string | null
  resolved_at: string | null
  first_response_at: string | null
  sla_due_at: string | null
  sla_breached: boolean
  satisfaction_rating: number | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface TicketFormState {
  subject: string
  description: string
  category: string
  priority: string
  channel: string
  customer_name: string
  customer_email: string
  tags: string[]
}

const initialTicketForm: TicketFormState = {
  subject: '',
  description: '',
  category: 'general',
  priority: 'normal',
  channel: 'email',
  customer_name: '',
  customer_email: '',
  tags: [],
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

// Competitive Upgrade Mock Data
const mockSupportAIInsights = [
  { id: '1', query: "Which tickets need urgent attention?", insight: "3 tickets are approaching SLA breach in the next hour. TKT-1234 (Enterprise client) has highest priority.", confidence: 0.95, category: 'engagement' as const, timestamp: new Date().toISOString() },
  { id: '2', query: "What's causing ticket volume spike?", insight: "Payment processing issues account for 45% of today's tickets. Consider proactive status page update.", confidence: 0.88, category: 'conversion' as const, timestamp: new Date().toISOString() },
  { id: '3', query: "How can we improve CSAT?", insight: "Tickets with first response under 5 minutes have 23% higher satisfaction. Focus on quick initial acknowledgment.", confidence: 0.86, category: 'revenue' as const, timestamp: new Date().toISOString() },
]

const mockSupportCollaborators = [
  { id: '1', name: 'Support Team', avatar: '/avatars/support.jpg', status: 'active' as const, lastActive: 'Just now', role: 'On-call' },
  { id: '2', name: 'Alex Rivera', avatar: '/avatars/alex.jpg', status: 'active' as const, lastActive: '1m ago', role: 'Senior Agent' },
  { id: '3', name: 'Jordan Kim', avatar: '/avatars/jordan.jpg', status: 'active' as const, lastActive: '3m ago', role: 'Agent' },
]

const mockSupportPredictions = [
  { id: '1', metric: 'Daily Tickets', currentValue: 156, predictedValue: 180, confidence: 0.79, trend: 'up' as const, timeframe: 'Next 24 hours', factors: ['New feature release', 'Weekend approaching'] },
  { id: '2', metric: 'CSAT Score', currentValue: 92, predictedValue: 94, confidence: 0.82, trend: 'up' as const, timeframe: 'This week', factors: ['New canned responses', 'Agent training'] },
  { id: '3', metric: 'Avg Resolution Time', currentValue: 4.2, predictedValue: 3.5, confidence: 0.76, trend: 'down' as const, timeframe: 'Next 2 weeks', factors: ['AI suggestions', 'Knowledge base updates'] },
]

const mockSupportActivities = [
  { id: '1', type: 'update' as const, title: 'Ticket resolved', description: 'TKT-1234 marked as solved by Alex Rivera', user: { name: 'Alex Rivera', avatar: '/avatars/alex.jpg' }, timestamp: new Date().toISOString(), metadata: {} },
  { id: '2', type: 'assignment' as const, title: 'Ticket assigned', description: 'TKT-1235 assigned to Jordan Kim', user: { name: 'System', avatar: '' }, timestamp: new Date(Date.now() - 900000).toISOString(), metadata: {} },
  { id: '3', type: 'milestone' as const, title: 'SLA achieved', description: 'First response SLA met for all morning tickets', user: { name: 'Support Team', avatar: '/avatars/support.jpg' }, timestamp: new Date(Date.now() - 7200000).toISOString(), metadata: {} },
]

// Quick actions will be defined inside the component to access state setters

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

  // Quick Action Dialog States
  const [showQuickReplyDialog, setShowQuickReplyDialog] = useState(false)
  const [showEscalateDialog, setShowEscalateDialog] = useState(false)
  const [showViewQueueDialog, setShowViewQueueDialog] = useState(false)
  const [quickReplyMessage, setQuickReplyMessage] = useState('')
  const [escalateReason, setEscalateReason] = useState('')
  const [escalatePriority, setEscalatePriority] = useState('urgent')

  // Additional Dialog States
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false)
  const [showTeamsDialog, setShowTeamsDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showGoalsDialog, setShowGoalsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showRatingsDialog, setShowRatingsDialog] = useState(false)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)
  const [showAgentSettingsDialog, setShowAgentSettingsDialog] = useState(false)
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
  const [showEmailAllDialog, setShowEmailAllDialog] = useState(false)
  const [showSegmentsDialog, setShowSegmentsDialog] = useState(false)
  const [showVIPDialog, setShowVIPDialog] = useState(false)
  const [showCustomerInsightsDialog, setShowCustomerInsightsDialog] = useState(false)
  const [showExportCustomersDialog, setShowExportCustomersDialog] = useState(false)
  const [showImportCustomersDialog, setShowImportCustomersDialog] = useState(false)
  const [showCustomerSettingsDialog, setShowCustomerSettingsDialog] = useState(false)
  const [showCustomerFilterDialog, setShowCustomerFilterDialog] = useState(false)
  const [showCustomerProfileDialog, setShowCustomerProfileDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showOverviewDialog, setShowOverviewDialog] = useState(false)
  const [showTrendsDialog, setShowTrendsDialog] = useState(false)
  const [showResponseTimeDialog, setShowResponseTimeDialog] = useState(false)
  const [showCSATDialog, setShowCSATDialog] = useState(false)
  const [showAgentReportsDialog, setShowAgentReportsDialog] = useState(false)
  const [showTopicsDialog, setShowTopicsDialog] = useState(false)
  const [showExportAnalyticsDialog, setShowExportAnalyticsDialog] = useState(false)
  const [showScheduleReportDialog, setShowScheduleReportDialog] = useState(false)
  const [showGeneralSettingsDialog, setShowGeneralSettingsDialog] = useState(false)
  const [showChannelsSettingsDialog, setShowChannelsSettingsDialog] = useState(false)
  const [showSLASettingsDialog, setShowSLASettingsDialog] = useState(false)
  const [showAutomationSettingsDialog, setShowAutomationSettingsDialog] = useState(false)
  const [showIntegrationsSettingsDialog, setShowIntegrationsSettingsDialog] = useState(false)
  const [showSecuritySettingsDialog, setShowSecuritySettingsDialog] = useState(false)
  const [showNotificationsSettingsDialog, setShowNotificationsSettingsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showEditSLADialog, setShowEditSLADialog] = useState(false)
  const [showAddSLADialog, setShowAddSLADialog] = useState(false)
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null)
  const [showEditAutomationDialog, setShowEditAutomationDialog] = useState(false)
  const [showCreateAutomationDialog, setShowCreateAutomationDialog] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<{name: string, trigger: string, actions: string[], status: string} | null>(null)
  const [showPreviewCannedResponseDialog, setShowPreviewCannedResponseDialog] = useState(false)
  const [showEditCannedResponseDialog, setShowEditCannedResponseDialog] = useState(false)
  const [showAddCannedResponseDialog, setShowAddCannedResponseDialog] = useState(false)
  const [selectedCannedResponse, setSelectedCannedResponse] = useState<CannedResponse | null>(null)
  const [showConnectIntegrationDialog, setShowConnectIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<{name: string, description: string} | null>(null)
  const [showRegenerateAPIKeyDialog, setShowRegenerateAPIKeyDialog] = useState(false)
  const [showAPIDocsDialog, setShowAPIDocsDialog] = useState(false)
  const [showWebhooksDialog, setShowWebhooksDialog] = useState(false)
  const [showDeleteClosedTicketsDialog, setShowDeleteClosedTicketsDialog] = useState(false)
  const [showResetAllSettingsDialog, setShowResetAllSettingsDialog] = useState(false)
  const [showAttachFileDialog, setShowAttachFileDialog] = useState(false)
  const [showEmojiPickerDialog, setShowEmojiPickerDialog] = useState(false)
  const [showAssignAgentDialog, setShowAssignAgentDialog] = useState(false)
  const [showAddTagDialog, setShowAddTagDialog] = useState(false)
  const [showAgentScheduleDialog, setShowAgentScheduleDialog] = useState(false)
  const [showAgentFullReportDialog, setShowAgentFullReportDialog] = useState(false)
  const [showSendAgentMessageDialog, setShowSendAgentMessageDialog] = useState(false)
  const [queueFilter, setQueueFilter] = useState<'all' | 'my' | 'unassigned' | 'urgent'>('all')
  const [newAgentForm, setNewAgentForm] = useState({ name: '', email: '', role: 'agent', skills: [] as string[] })
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', company: '', tier: 'basic' })
  const [emailAllForm, setEmailAllForm] = useState({ subject: '', message: '' })
  const [newSLAForm, setNewSLAForm] = useState({ name: '', priority: 'normal', firstResponseTarget: 60, resolutionTarget: 240 })
  const [newAutomationForm, setNewAutomationForm] = useState({ name: '', trigger: '', actions: '' })
  const [newCannedResponseForm, setNewCannedResponseForm] = useState({ title: '', content: '', category: 'General' })
  const [agentMessageForm, setAgentMessageForm] = useState('')
  const [newTagValue, setNewTagValue] = useState('')
  const [pendingStatusFilter, setPendingStatusFilter] = useState<string | null>(null)
  const [showPendingDialog, setShowPendingDialog] = useState(false)
  const [showResolvedDialog, setShowResolvedDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showTagsDialog, setShowTagsDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showTicketReportsDialog, setShowTicketReportsDialog] = useState(false)

  // Quick Actions with proper dialog handlers
  const supportQuickActions = [
    { id: '1', label: 'New Ticket', icon: 'Plus', shortcut: '⌘N', action: () => setShowCreateDialog(true) },
    { id: '2', label: 'Quick Reply', icon: 'Send', shortcut: '⌘R', action: () => setShowQuickReplyDialog(true) },
    { id: '3', label: 'Escalate', icon: 'AlertTriangle', shortcut: '⌘E', action: () => setShowEscalateDialog(true) },
    { id: '4', label: 'View Queue', icon: 'Inbox', shortcut: '⌘Q', action: () => setShowViewQueueDialog(true) },
  ]

  // Supabase state
  const [dbTickets, setDbTickets] = useState<DbTicket[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [ticketForm, setTicketForm] = useState<TicketFormState>(initialTicketForm)

  // Fetch tickets from Supabase
  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbTickets(data || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const tickets = mockTickets
  const agents = mockAgents
  const slas = mockSLAs
  const cannedResponses = mockCannedResponses
  const customers = mockCustomers

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

  const handleSendReply = async () => {
    if (!messageInput.trim()) {
      toast.error('Please enter a message')
      return
    }
    if (!selectedTicket) return

    await handleSendTicketReply(selectedTicket.id, messageInput, isInternalNote)
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

  // Create ticket
  const handleCreateTicket = async () => {
    if (!ticketForm.subject.trim()) {
      toast.error('Subject is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create tickets')
        return
      }

      const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject: ticketForm.subject,
        description: ticketForm.description || null,
        category: ticketForm.category,
        priority: ticketForm.priority,
        channel: ticketForm.channel,
        customer_name: ticketForm.customer_name || null,
        customer_email: ticketForm.customer_email || null,
        tags: ticketForm.tags,
        status: 'open',
      })

      if (error) throw error

      toast.success('Ticket created successfully')
      setShowCreateDialog(false)
      setTicketForm(initialTicketForm)
      fetchTickets()
    } catch (error) {
      console.error('Error creating ticket:', error)
      toast.error('Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Assign agent to ticket
  const handleAssignAgent = async (ticketId: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to: agentId,
          assigned_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)

      if (error) throw error

      toast.success('Agent assigned')
      fetchTickets()
    } catch (error) {
      console.error('Error assigning agent:', error)
      toast.error('Failed to assign agent')
    }
  }

  // Resolve ticket
  const handleResolveTicket = async (ticketId: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          resolution_notes: notes || null,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)

      if (error) throw error

      toast.success('Ticket resolved')
      setShowTicketDialog(false)
      fetchTickets()
    } catch (error) {
      console.error('Error resolving ticket:', error)
      toast.error('Failed to resolve ticket')
    }
  }

  // Escalate ticket
  const handleEscalateTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          priority: 'urgent',
          status: 'in_progress',
          metadata: { escalated: true, escalated_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)

      if (error) throw error

      toast.info('Ticket escalated')
      fetchTickets()
    } catch (error) {
      console.error('Error escalating ticket:', error)
      toast.error('Failed to escalate ticket')
    }
  }

  // Send reply to ticket
  const handleSendTicketReply = async (ticketId: string, message: string, isInternal: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('support_ticket_replies').insert({
        ticket_id: ticketId,
        message: message,
        is_internal: isInternal,
        reply_type: isInternal ? 'note' : 'reply',
        author_id: user?.id || null,
        author_type: 'agent',
      })

      if (error) throw error

      // Update first response time if not set
      await supabase
        .from('support_tickets')
        .update({
          first_response_at: new Date().toISOString(),
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .is('first_response_at', null)

      toast.success(isInternal ? 'Internal note added' : 'Reply sent successfully')
      setMessageInput('')
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    }
  }

  // Delete ticket
  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', ticketId)

      if (error) throw error

      toast.success('Ticket deleted')
      setShowTicketDialog(false)
      fetchTickets()
    } catch (error) {
      console.error('Error deleting ticket:', error)
      toast.error('Failed to delete ticket')
    }
  }

  // Export tickets
  const handleExportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .is('deleted_at', null)

      if (error) throw error

      const csv = [
        ['ID', 'Subject', 'Status', 'Priority', 'Category', 'Created'].join(','),
        ...(data || []).map(t =>
          [t.ticket_code, t.subject, t.status, t.priority, t.category, t.created_at].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `support-tickets-${new Date().toISOString().split('T')[0]}.csv`
      a.click()

      toast.success('Export started')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export tickets')
    }
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
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleExportTickets}>
                <Bot className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-emerald-600 hover:bg-emerald-50" onClick={() => setShowCreateDialog(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
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
            {/* Tickets Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Tickets</h2>
                  <p className="text-blue-100">Zendesk-level ticket management and resolution</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTickets.length}</p>
                    <p className="text-blue-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTickets.filter(t => t.status === 'open').length}</p>
                    <p className="text-blue-200 text-sm">Open</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTickets.filter(t => t.priority === 'urgent').length}</p>
                    <p className="text-blue-200 text-sm">Urgent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: MessageSquare, label: 'New Ticket', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowCreateDialog(true) },
                { icon: Inbox, label: 'Inbox', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowViewQueueDialog(true) },
                { icon: Clock, label: 'Pending', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowPendingDialog(true) },
                { icon: CheckCircle, label: 'Resolved', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowResolvedDialog(true) },
                { icon: Users, label: 'Assign', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowAssignDialog(true) },
                { icon: Tag, label: 'Tags', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setShowTagsDialog(true) },
                { icon: Archive, label: 'Archive', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', action: () => setShowArchiveDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowTicketReportsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                    { label: 'My Tickets', count: 5, filter: () => { setPendingStatusFilter('my'); setSearchQuery(''); } },
                    { label: 'Unassigned', count: 3, filter: () => { setPendingStatusFilter('unassigned'); setSearchQuery(''); } },
                    { label: 'SLA Breached', count: 1, filter: () => { setPendingStatusFilter('sla'); setSearchQuery(''); } },
                    { label: 'Awaiting Reply', count: 2, filter: () => { setPendingStatusFilter('awaiting'); setSearchQuery(''); } },
                  ].map((filter, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        filter.filter()
                        toast.success(`Filtering by: ${filter.label}`)
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2 ${pendingStatusFilter === filter.label.toLowerCase().replace(' ', '') ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}`}
                    >
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
                                    <AvatarImage src={ticket.assignee.avatar} alt="User avatar" />
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
                              <AvatarImage src={agent.avatar} alt="User avatar" />
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
            {/* Agents Overview Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Agents</h2>
                  <p className="text-green-100">Manage your support team performance</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{agents.length}</p>
                    <p className="text-green-200 text-sm">Agents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{agents.filter(a => a.status === 'online').length}</p>
                    <p className="text-green-200 text-sm">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agents Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: User, label: 'Add Agent', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowAddAgentDialog(true) },
                { icon: Users, label: 'Teams', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => setShowTeamsDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowScheduleDialog(true) },
                { icon: Target, label: 'Goals', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => setShowGoalsDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowReportsDialog(true) },
                { icon: Star, label: 'Ratings', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowRatingsDialog(true) },
                { icon: Headphones, label: 'Training', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowTrainingDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setShowAgentSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {agents.map(agent => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedAgent(agent); setShowAgentDialog(true) }}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={agent.avatar} alt="User avatar" />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
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
            {/* Customers Overview Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Customer Directory</h2>
                  <p className="text-purple-100">Complete customer relationship management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{customers.length}</p>
                    <p className="text-purple-200 text-sm">Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{customers.filter(c => c.tier === 'enterprise').length}</p>
                    <p className="text-purple-200 text-sm">Enterprise</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customers Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: User, label: 'Add', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowAddCustomerDialog(true) },
                { icon: Mail, label: 'Email All', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setShowEmailAllDialog(true) },
                { icon: Tag, label: 'Segments', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => setShowSegmentsDialog(true) },
                { icon: Star, label: 'VIP', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowVIPDialog(true) },
                { icon: TrendingUp, label: 'Insights', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowCustomerInsightsDialog(true) },
                { icon: FileText, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setShowExportCustomersDialog(true) },
                { icon: Globe, label: 'Import', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowImportCustomersDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setShowCustomerSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Customer Directory</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search customers..." className="w-64" />
                    <Button variant="outline" onClick={() => setShowCustomerFilterDialog(true)}>
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
                        <AvatarImage src={customer.avatar} alt="User avatar" />
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
                      <Button variant="outline" size="sm" onClick={() => { setSelectedCustomer(customer); setShowCustomerProfileDialog(true); }}>View Profile</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Analytics</h2>
                  <p className="text-amber-100">Track performance and identify trends</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">94%</p>
                    <p className="text-amber-200 text-sm">CSAT</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">2.4h</p>
                    <p className="text-amber-200 text-sm">Avg Response</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Overview', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setShowOverviewDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => setShowTrendsDialog(true) },
                { icon: Timer, label: 'Response', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => setShowResponseTimeDialog(true) },
                { icon: Star, label: 'CSAT', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', action: () => setShowCSATDialog(true) },
                { icon: Users, label: 'Agents', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setShowAgentReportsDialog(true) },
                { icon: Tag, label: 'Topics', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setShowTopicsDialog(true) },
                { icon: FileText, label: 'Export', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setShowExportAnalyticsDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setShowScheduleReportDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
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
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Support Settings</h2>
                  <p className="text-slate-200">Zendesk-level configuration and preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-slate-200 text-sm">Setting Groups</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">48+</p>
                    <p className="text-slate-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Settings, label: 'General', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', action: () => setSettingsTab('general') },
                { icon: Headphones, label: 'Channels', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setSettingsTab('channels') },
                { icon: Timer, label: 'SLA', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => setSettingsTab('sla') },
                { icon: Zap, label: 'Automation', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setSettingsTab('automations') },
                { icon: Link2, label: 'Integrations', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setSettingsTab('integrations') },
                { icon: Shield, label: 'Security', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => setSettingsTab('advanced') },
                { icon: Bell, label: 'Notifications', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => setSettingsTab('advanced') },
                { icon: RefreshCw, label: 'Reset', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => setShowResetSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                <Button variant="outline" size="sm" onClick={() => { setSelectedSLA(sla); setShowEditSLADialog(true); }}>Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full" onClick={() => setShowAddSLADialog(true)}>
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
                                  <Button variant="ghost" size="sm" onClick={() => { setSelectedAutomation(rule); setShowEditAutomationDialog(true); }}>Edit</Button>
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
                        <Button variant="outline" className="mt-4 w-full" onClick={() => setShowCreateAutomationDialog(true)}>
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
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedCannedResponse(response); setShowPreviewCannedResponseDialog(true); }}>Preview</Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedCannedResponse(response); setShowEditCannedResponseDialog(true); }}>Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full" onClick={() => setShowAddCannedResponseDialog(true)}>
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
                                <Button size="sm" variant="outline" onClick={() => { setSelectedIntegration(integration); setShowConnectIntegrationDialog(true); }}>Connect</Button>
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
                            <Button variant="ghost" size="sm" onClick={() => setShowRegenerateAPIKeyDialog(true)}>Regenerate</Button>
                          </div>
                          <Input type="password" value="cs_live_••••••••••••••••" readOnly className="font-mono" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowAPIDocsDialog(true)}>
                            <FileText className="w-4 h-4" />
                            API Docs
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowWebhooksDialog(true)}>
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
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteClosedTicketsDialog(true)}>Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset All Settings</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Reset to factory defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowResetAllSettingsDialog(true)}>Reset</Button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 h-[70vh]">
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
                      <Button variant="ghost" size="icon" onClick={() => setShowAttachFileDialog(true)}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowEmojiPickerDialog(true)}>
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleSendReply}
                        disabled={!messageInput.trim()}
                      >
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
                          <AvatarImage src={selectedTicket.customer.avatar} alt="User avatar" />
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
                            <AvatarImage src={selectedTicket.assignee.avatar} alt="User avatar" />
                            <AvatarFallback>{selectedTicket.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{selectedTicket.assignee.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{selectedTicket.assignee.role}</p>
                          </div>
                        </div>
                      ) : (
                        <Button className="w-full" variant="outline" onClick={() => setShowAssignAgentDialog(true)}>Assign Agent</Button>
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
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowAddTagDialog(true)}>+ Add</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleResolveTicket(selectedTicket.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Solve
                    </Button>
                    <Button variant="outline" onClick={() => handleEscalateTicket(selectedTicket.id)}>
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Agent Detail Dialog */}
      <Dialog open={showAgentDialog} onOpenChange={setShowAgentDialog}>
        <DialogContent className="max-w-3xl">
          {selectedAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedAgent.avatar} alt="User avatar" />
                    <AvatarFallback>{selectedAgent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-xl">{selectedAgent.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">{selectedAgent.role}</Badge>
                      <div className={`h-2 w-2 rounded-full ${getAgentStatusColor(selectedAgent.status)}`} />
                      <span className="text-sm text-gray-500 capitalize">{selectedAgent.status}</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                {/* Agent Stats */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Performance Metrics</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedAgent.activeTickets}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Active Tickets</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedAgent.resolvedToday}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Resolved Today</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{selectedAgent.avgResponseTime}m</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Avg Response</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                          <Star className="h-5 w-5 fill-current" />
                          {selectedAgent.satisfactionScore}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">CSAT Score</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Weekly Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Response Time</span>
                            <span className="font-medium text-green-600">Excellent</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Resolution Rate</span>
                            <span className="font-medium text-green-600">Outstanding</span>
                          </div>
                          <Progress value={88} className="h-2" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">Customer Satisfaction</span>
                            <span className="font-medium text-green-600">Top Performer</span>
                          </div>
                          <Progress value={95} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Agent Details</h4>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </span>
                        <span className="font-medium">{selectedAgent.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Avg Resolution
                        </span>
                        <span className="font-medium">{selectedAgent.avgResolutionTime}m</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.languages.map((lang, i) => (
                          <Badge key={i} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.skills.map((skill, i) => (
                          <Badge key={i} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <div className="flex items-center gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAgentScheduleDialog(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Schedule
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowAgentFullReportDialog(true)}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Full Report
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={() => setShowSendAgentMessageDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AI-Powered Support Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <AIInsightsPanel
          insights={mockSupportAIInsights}
          onAskQuestion={(q) => toast.info("Question Submitted: " + q)}
        />
        <PredictiveAnalytics predictions={mockSupportPredictions} />
      </div>

      {/* Activity Feed */}
      <div className="mt-6">
        <ActivityFeed
          activities={mockSupportActivities}
          maxItems={5}
          showFilters={true}
        />
      </div>

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar actions={supportQuickActions} />

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                placeholder="Detailed description..."
                className="mt-1 w-full p-3 border rounded-lg text-sm resize-none h-24"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm({ ...ticketForm, priority: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={ticketForm.category} onValueChange={(v) => setTicketForm({ ...ticketForm, category: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={ticketForm.customer_name}
                  onChange={(e) => setTicketForm({ ...ticketForm, customer_name: e.target.value })}
                  placeholder="Customer name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Customer Email</Label>
                <Input
                  type="email"
                  value={ticketForm.customer_email}
                  onChange={(e) => setTicketForm({ ...ticketForm, customer_email: e.target.value })}
                  placeholder="customer@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Channel</Label>
              <Select value={ticketForm.channel} onValueChange={(v) => setTicketForm({ ...ticketForm, channel: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Reply Dialog */}
      <Dialog open={showQuickReplyDialog} onOpenChange={setShowQuickReplyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              Quick Reply
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Ticket</Label>
              <Select defaultValue="">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a ticket to reply to" />
                </SelectTrigger>
                <SelectContent>
                  {tickets.map(ticket => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      #{ticket.id} - {ticket.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Use Canned Response</Label>
              <Select defaultValue="">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cannedResponses.map(response => (
                    <SelectItem key={response.id} value={response.id}>
                      {response.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                value={quickReplyMessage}
                onChange={(e) => setQuickReplyMessage(e.target.value)}
                placeholder="Type your reply message..."
                className="mt-1 w-full p-3 border rounded-lg text-sm resize-none h-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="internal-note" />
              <Label htmlFor="internal-note">Send as internal note</Label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowQuickReplyDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!quickReplyMessage.trim()) {
                  toast.error('Please enter a message')
                  return
                }
                toast.success('Sending reply...')
                try {
                  const response = await fetch('/api/customer-support', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'reply',
                      ticket_id: selectedTicket?.id,
                      message: quickReplyMessage,
                      is_internal: false
                    })
                  })
                  const data = await response.json()
                  if (data.success) {
                    toast.success('Reply sent successfully')
                    setQuickReplyMessage('')
                    setShowQuickReplyDialog(false)
                    fetchTickets()
                  } else {
                    toast.error(data.error || 'Failed to send reply')
                  }
                } catch (error) {
                  console.error('Reply error:', error)
                  toast.error('Failed to send reply')
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Escalate Ticket
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Ticket to Escalate</Label>
              <Select defaultValue="">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a ticket" />
                </SelectTrigger>
                <SelectContent>
                  {tickets.filter(t => t.status !== 'solved' && t.status !== 'closed').map(ticket => (
                    <SelectItem key={ticket.id} value={ticket.id}>
                      #{ticket.id} - {ticket.subject} ({ticket.priority})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Escalate To</Label>
              <Select defaultValue="">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select supervisor or team" />
                </SelectTrigger>
                <SelectContent>
                  {agents.filter(a => a.role === 'supervisor' || a.role === 'admin').map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.role})
                    </SelectItem>
                  ))}
                  <SelectItem value="senior-team">Senior Support Team</SelectItem>
                  <SelectItem value="engineering">Engineering Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New Priority</Label>
              <Select value={escalatePriority} onValueChange={setEscalatePriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Escalation Reason</Label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Explain why this ticket needs escalation..."
                className="mt-1 w-full p-3 border rounded-lg text-sm resize-none h-24"
              />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Escalating will notify the assigned supervisor and increase ticket priority.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                toast.success('Escalating ticket...')
                try {
                  const response = await fetch('/api/customer-support', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'escalate',
                      ticket_id: selectedTicket?.id,
                      new_priority: escalatePriority,
                      reason: escalateReason
                    })
                  })
                  const data = await response.json()
                  if (data.success) {
                    toast.success('Ticket escalated to supervisor')
                    setEscalateReason('')
                    setShowEscalateDialog(false)
                    fetchTickets()
                  } else {
                    toast.error(data.error || 'Failed to escalate ticket')
                  }
                } catch (error) {
                  console.error('Escalation error:', error)
                  toast.error('Failed to escalate ticket')
                }
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Escalate Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Queue Dialog */}
      <Dialog open={showViewQueueDialog} onOpenChange={setShowViewQueueDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-blue-600" />
              Ticket Queue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Queue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'new').length}</p>
                <p className="text-xs text-blue-600">New</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'open').length}</p>
                <p className="text-xs text-green-600">Open</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-600">{tickets.filter(t => t.status === 'pending').length}</p>
                <p className="text-xs text-amber-600">Pending</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{tickets.filter(t => t.slaBreached).length}</p>
                <p className="text-xs text-red-600">SLA Breached</p>
              </div>
            </div>

            {/* Queue Filters */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className={queueFilter === 'all' ? 'bg-blue-50 text-blue-600' : ''} onClick={() => setQueueFilter('all')}>All Tickets</Button>
              <Button variant="outline" size="sm" className={queueFilter === 'my' ? 'bg-blue-50 text-blue-600' : ''} onClick={() => setQueueFilter('my')}>My Tickets</Button>
              <Button variant="outline" size="sm" className={queueFilter === 'unassigned' ? 'bg-blue-50 text-blue-600' : ''} onClick={() => setQueueFilter('unassigned')}>Unassigned</Button>
              <Button variant="outline" size="sm" className={queueFilter === 'urgent' ? 'bg-blue-50 text-blue-600' : ''} onClick={() => setQueueFilter('urgent')}>Urgent</Button>
            </div>

            {/* Queue List */}
            <ScrollArea className="h-[40vh] border rounded-lg">
              <div className="divide-y">
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowViewQueueDialog(false)
                      openTicketDetails(ticket)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-500">#{ticket.id}</span>
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          {ticket.slaBreached && <Badge variant="destructive">SLA</Badge>}
                        </div>
                        <h4 className="font-medium">{ticket.subject}</h4>
                        <p className="text-sm text-gray-500">{ticket.customer.name} - {ticket.channel}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                        {ticket.assignee ? (
                          <p className="text-xs text-gray-500 mt-1">{ticket.assignee.name}</p>
                        ) : (
                          <p className="text-xs text-orange-500 mt-1">Unassigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowViewQueueDialog(false)}>Close</Button>
            <Button
              onClick={() => {
                fetchTickets()
                toast.success('Queue refreshed')
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Tickets Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Pending Tickets
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Tickets awaiting customer response or action</p>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="divide-y">
                {tickets.filter(t => t.status === 'pending').map(ticket => (
                  <div key={ticket.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => { setShowPendingDialog(false); openTicketDetails(ticket); }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">#{ticket.id} - {ticket.subject}</h4>
                        <p className="text-sm text-gray-500">{ticket.customer.name}</p>
                      </div>
                      <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    </div>
                  </div>
                ))}
                {tickets.filter(t => t.status === 'pending').length === 0 && (
                  <div className="p-8 text-center text-gray-500">No pending tickets</div>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPendingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolved Tickets Dialog */}
      <Dialog open={showResolvedDialog} onOpenChange={setShowResolvedDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolved Tickets
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Recently resolved support tickets</p>
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="divide-y">
                {tickets.filter(t => t.status === 'solved' || t.status === 'closed').map(ticket => (
                  <div key={ticket.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => { setShowResolvedDialog(false); openTicketDetails(ticket); }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">#{ticket.id} - {ticket.subject}</h4>
                        <p className="text-sm text-gray-500">{ticket.customer.name}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Resolved</Badge>
                    </div>
                  </div>
                ))}
                {tickets.filter(t => t.status === 'solved' || t.status === 'closed').length === 0 && (
                  <div className="p-8 text-center text-gray-500">No resolved tickets</div>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolvedDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tickets Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Assign Tickets
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Ticket</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a ticket to assign" />
                </SelectTrigger>
                <SelectContent>
                  {tickets.filter(t => !t.assignee).map(ticket => (
                    <SelectItem key={ticket.id} value={ticket.id}>#{ticket.id} - {ticket.subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assign To</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.filter(a => a.status === 'online').map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name} ({agent.activeTickets} active)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.success('Assigning ticket...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'assign',
                    ticket_id: selectedTicket?.id,
                    agent_id: selectedAgent?.id
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Ticket assigned successfully')
                  setShowAssignDialog(false)
                  fetchTickets()
                } else {
                  toast.error(data.error || 'Failed to assign ticket')
                }
              } catch (error) {
                console.error('Assignment error:', error)
                toast.error('Failed to assign ticket')
              }
            }} className="bg-purple-600 hover:bg-purple-700">Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Management Dialog */}
      <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-pink-600" />
              Manage Tags
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {['bug', 'feature', 'billing', 'technical', 'urgent', 'vip', 'new', 'export', 'api'].map(tag => (
                <Badge key={tag} variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-gray-200">{tag}</Badge>
              ))}
            </div>
            <div>
              <Label>Add New Tag</Label>
              <div className="flex gap-2 mt-1">
                <Input placeholder="Enter tag name" value={newTagValue} onChange={(e) => setNewTagValue(e.target.value)} />
                <Button onClick={async () => {
                  if (!newTagValue.trim()) {
                    toast.error('Please enter a tag name')
                    return
                  }
                  toast.success('Adding tag...')
                  try {
                    const response = await fetch('/api/customer-support', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'add_tag',
                        ticket_id: selectedTicket?.id,
                        tag: newTagValue.trim()
                      })
                    })
                    const data = await response.json()
                    if (data.success) {
                      toast.success('Tag added successfully')
                      setNewTagValue('')
                      fetchTickets()
                    } else {
                      toast.error(data.error || 'Failed to add tag')
                    }
                  } catch (error) {
                    console.error('Add tag error:', error)
                    toast.error('Failed to add tag')
                  }
                }}>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Tickets Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-600" />
              Archive Tickets
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select tickets to archive. Archived tickets can be restored later.</p>
            <div className="space-y-2">
              {tickets.filter(t => t.status === 'solved' || t.status === 'closed').map(ticket => (
                <div key={ticket.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <input type="checkbox" className="rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">#{ticket.id} - {ticket.subject}</p>
                    <p className="text-xs text-gray-500">{ticket.customer.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              const ticketIds = tickets.filter(t => t.status === 'solved' || t.status === 'closed').map(t => t.id)
              if (ticketIds.length === 0) {
                toast.error('No tickets to archive')
                return
              }
              toast.success('Archiving tickets...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'archive',
                    ticket_ids: ticketIds
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Tickets archived successfully')
                  setShowArchiveDialog(false)
                  fetchTickets()
                } else {
                  toast.error(data.error || 'Failed to archive tickets')
                }
              } catch (error) {
                console.error('Archive error:', error)
                toast.error('Failed to archive tickets')
              }
            }}>Archive Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Reports Dialog */}
      <Dialog open={showTicketReportsDialog} onOpenChange={setShowTicketReportsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Ticket Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{tickets.length}</p><p className="text-sm text-gray-500">Total Tickets</p></CardContent></Card>
              <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">{tickets.filter(t => t.status === 'solved').length}</p><p className="text-sm text-gray-500">Resolved</p></CardContent></Card>
              <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-amber-600">{tickets.filter(t => t.status === 'pending').length}</p><p className="text-sm text-gray-500">Pending</p></CardContent></Card>
            </div>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <BarChart3 className="h-16 w-16 text-gray-300" />
              <p className="text-gray-400 ml-4">Ticket trend visualization</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketReportsDialog(false)}>Close</Button>
            <Button onClick={() => { handleExportTickets(); setShowTicketReportsDialog(false); }}>Export Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Agent Dialog */}
      <Dialog open={showAddAgentDialog} onOpenChange={setShowAddAgentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Add New Agent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input placeholder="Enter agent name" value={newAgentForm.name} onChange={(e) => setNewAgentForm({...newAgentForm, name: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="agent@company.com" value={newAgentForm.email} onChange={(e) => setNewAgentForm({...newAgentForm, email: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={newAgentForm.role} onValueChange={(v) => setNewAgentForm({...newAgentForm, role: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {['technical', 'billing', 'onboarding', 'enterprise', 'refunds'].map(skill => (
                  <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-gray-100">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAgentDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!newAgentForm.name.trim() || !newAgentForm.email.trim()) {
                toast.error('Name and email are required')
                return
              }
              toast.success('Sending invite...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'add_agent',
                    name: newAgentForm.name,
                    email: newAgentForm.email,
                    role: newAgentForm.role,
                    skills: newAgentForm.skills
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Invite sent successfully')
                  setShowAddAgentDialog(false)
                  setNewAgentForm({ name: '', email: '', role: 'agent', skills: [] })
                } else {
                  toast.error(data.error || 'Failed to send invite')
                }
              } catch (error) {
                console.error('Add agent error:', error)
                toast.error('Failed to send invite')
              }
            }} className="bg-green-600 hover:bg-green-700">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teams Dialog */}
      <Dialog open={showTeamsDialog} onOpenChange={setShowTeamsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" />
              Support Teams
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { name: 'Technical Support', members: 5, lead: 'Alex Rivera' },
              { name: 'Billing Team', members: 3, lead: 'Taylor Kim' },
              { name: 'Enterprise Support', members: 4, lead: 'Jordan Lee' },
            ].map((team, i) => (
              <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-gray-500">{team.members} members - Lead: {team.lead}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Manage " + team.name + " - " + team.members + " members - Lead: " + team.lead)}>Manage</Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => {
              toast.info('Team creation available in Teams Settings')
            }}>
              <Users className="h-4 w-4 mr-2" />
              Create New Team
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Agent Schedules
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="font-medium text-gray-500">{day}</div>
              ))}
            </div>
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center gap-4">
                <div className="w-32 flex items-center gap-2">
                  <Avatar className="h-6 w-6"><AvatarFallback>{agent.name[0]}</AvatarFallback></Avatar>
                  <span className="text-sm truncate">{agent.name}</span>
                </div>
                <div className="flex-1 grid grid-cols-7 gap-2">
                  {[1,2,3,4,5,6,7].map(day => (
                    <div key={day} className={`h-8 rounded ${day <= 5 ? 'bg-green-100' : 'bg-gray-100'}`}></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Close</Button>
            <Button onClick={async () => {
              toast.success('Updating schedule...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'update_schedule',
                    schedules: agents.map(a => ({ agent_id: a.id, schedule: 'weekdays' }))
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Schedule updated successfully')
                  setShowScheduleDialog(false)
                } else {
                  toast.error(data.error || 'Failed to update schedule')
                }
              } catch (error) {
                console.error('Schedule update error:', error)
                toast.error('Failed to update schedule')
              }
            }}>Edit Schedules</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-600" />
              Team Goals
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { name: 'Response Time', current: 45, target: 30, unit: 'min' },
              { name: 'Resolution Rate', current: 92, target: 95, unit: '%' },
              { name: 'CSAT Score', current: 4.7, target: 4.8, unit: '' },
              { name: 'Tickets/Day', current: 120, target: 150, unit: '' },
            ].map((goal, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-gray-500">{goal.current}{goal.unit} / {goal.target}{goal.unit}</span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalsDialog(false)}>Close</Button>
            <Button onClick={async () => {
              toast.success('Saving goals...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'update_goals',
                    goals: [
                      { name: 'Response Time', target: 30 },
                      { name: 'Resolution Rate', target: 95 },
                      { name: 'CSAT Score', target: 4.8 },
                      { name: 'Tickets/Day', target: 150 }
                    ]
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Goals saved successfully')
                  setShowGoalsDialog(false)
                } else {
                  toast.error(data.error || 'Failed to save goals')
                }
              } catch (error) {
                console.error('Goals update error:', error)
                toast.error('Failed to save goals')
              }
            }}>Update Goals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Agent Reports
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {agents.map(agent => (
                <Card key={agent.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar><AvatarFallback>{agent.name[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{agent.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-sm">
                      <div><span className="text-gray-500">Active:</span> {agent.activeTickets}</div>
                      <div><span className="text-gray-500">Resolved:</span> {agent.resolvedToday}</div>
                      <div><span className="text-gray-500">Avg Response:</span> {agent.avgResponseTime}m</div>
                      <div><span className="text-gray-500">CSAT:</span> {agent.satisfactionScore}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Close</Button>
            <Button onClick={() => {
              const csv = ['Agent,Active,Resolved,Avg Response,CSAT', ...agents.map(a => `${a.name},${a.activeTickets},${a.resolvedToday},${a.avgResponseTime}m,${a.satisfactionScore}`)].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `agent-reports-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              toast.success('Report exported successfully')
              setShowReportsDialog(false)
            }}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ratings Dialog */}
      <Dialog open={showRatingsDialog} onOpenChange={setShowRatingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              Agent Ratings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {agents.sort((a, b) => b.satisfactionScore - a.satisfactionScore).map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">#{i + 1}</div>
                <Avatar><AvatarFallback>{agent.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-gray-500">{agent.resolvedToday} resolved today</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold">{agent.satisfactionScore}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-purple-600" />
              Agent Training
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { name: 'Product Knowledge', progress: 85, status: 'In Progress' },
              { name: 'Customer Communication', progress: 100, status: 'Completed' },
              { name: 'Technical Troubleshooting', progress: 60, status: 'In Progress' },
              { name: 'Billing & Refunds', progress: 0, status: 'Not Started' },
            ].map((course, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{course.name}</span>
                  <Badge variant={course.status === 'Completed' ? 'default' : 'secondary'}>{course.status}</Badge>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrainingDialog(false)}>Close</Button>
            <Button onClick={() => {
              toast.info('Opening training portal...')
              setShowTrainingDialog(false)
            }}>Manage Training</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Settings Dialog */}
      <Dialog open={showAgentSettingsDialog} onOpenChange={setShowAgentSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              Agent Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Auto-assign new tickets</Label>
                <p className="text-sm text-gray-500">Automatically assign tickets to available agents</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Show agent status</Label>
                <p className="text-sm text-gray-500">Display online/offline status to customers</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Enable agent chat</Label>
                <p className="text-sm text-gray-500">Allow agents to chat with each other</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgentSettingsDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.success('Saving settings...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'save_settings',
                    settings_type: 'agent',
                    settings: {
                      auto_assign: true,
                      show_status: true,
                      enable_chat: true
                    }
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Agent settings saved successfully')
                  setShowAgentSettingsDialog(false)
                } else {
                  toast.error(data.error || 'Failed to save settings')
                }
              } catch (error) {
                console.error('Settings save error:', error)
                toast.error('Failed to save settings')
              }
            }}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input placeholder="Customer name" value={newCustomerForm.name} onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="customer@example.com" value={newCustomerForm.email} onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Company</Label>
              <Input placeholder="Company name" value={newCustomerForm.company} onChange={(e) => setNewCustomerForm({...newCustomerForm, company: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Tier</Label>
              <Select value={newCustomerForm.tier} onValueChange={(v) => setNewCustomerForm({...newCustomerForm, tier: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCustomerDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!newCustomerForm.name.trim() || !newCustomerForm.email.trim()) {
                toast.error('Name and email are required')
                return
              }
              toast.success('Adding customer...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'add_customer',
                    name: newCustomerForm.name,
                    email: newCustomerForm.email,
                    company: newCustomerForm.company,
                    tier: newCustomerForm.tier
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Customer added successfully')
                  setShowAddCustomerDialog(false)
                  setNewCustomerForm({ name: '', email: '', company: '', tier: 'basic' })
                } else {
                  toast.error(data.error || 'Failed to add customer')
                }
              } catch (error) {
                console.error('Add customer error:', error)
                toast.error('Failed to add customer')
              }
            }} className="bg-purple-600 hover:bg-purple-700">Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email All Dialog */}
      <Dialog open={showEmailAllDialog} onOpenChange={setShowEmailAllDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-violet-600" />
              Email All Customers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject *</Label>
              <Input placeholder="Email subject" value={emailAllForm.subject} onChange={(e) => setEmailAllForm({...emailAllForm, subject: e.target.value})} className="mt-1" />
            </div>
            <div>
              <Label>Message *</Label>
              <textarea placeholder="Your message..." value={emailAllForm.message} onChange={(e) => setEmailAllForm({...emailAllForm, message: e.target.value})} className="mt-1 w-full p-3 border rounded-lg text-sm resize-none h-32" />
            </div>
            <div className="p-3 bg-violet-50 rounded-lg">
              <p className="text-sm text-violet-700">This will send an email to {customers.length} customers</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailAllDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!emailAllForm.subject.trim() || !emailAllForm.message.trim()) {
                toast.error('Subject and message are required')
                return
              }
              toast.success('Sending emails...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'email_all',
                    subject: emailAllForm.subject,
                    message: emailAllForm.message,
                    recipient_count: customers.length
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success(`Email sent to ${customers.length} customers`)
                  setShowEmailAllDialog(false)
                  setEmailAllForm({ subject: '', message: '' })
                } else {
                  toast.error(data.error || 'Failed to send emails')
                }
              } catch (error) {
                console.error('Email error:', error)
                toast.error('Failed to send emails')
              }
            }} className="bg-violet-600 hover:bg-violet-700">Send to All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Segments Dialog */}
      <Dialog open={showSegmentsDialog} onOpenChange={setShowSegmentsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-600" />
              Customer Segments
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { name: 'Enterprise Customers', count: 15, color: 'bg-purple-100' },
              { name: 'High Value', count: 42, color: 'bg-amber-100' },
              { name: 'New Customers', count: 28, color: 'bg-green-100' },
              { name: 'At Risk', count: 8, color: 'bg-red-100' },
            ].map((segment, i) => (
              <div key={i} className={`p-4 ${segment.color} rounded-lg flex items-center justify-between`}>
                <div>
                  <p className="font-medium">{segment.name}</p>
                  <p className="text-sm text-gray-600">{segment.count} customers</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Viewing " + segment.name + " - " + segment.count + " customers in this segment")}>View</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSegmentsDialog(false)}>Close</Button>
            <Button onClick={async () => {
              toast.success('Creating segment...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'create_segment',
                    name: 'New Segment',
                    filters: {}
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Segment created successfully')
                  setShowSegmentsDialog(false)
                } else {
                  toast.error(data.error || 'Failed to create segment')
                }
              } catch (error) {
                console.error('Segment creation error:', error)
                toast.error('Failed to create segment')
              }
            }}>Create Segment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIP Dialog */}
      <Dialog open={showVIPDialog} onOpenChange={setShowVIPDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              VIP Customers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {customers.filter(c => c.tags.includes('vip') || c.tier === 'enterprise').map(customer => (
              <div key={customer.id} className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-4">
                <Avatar><AvatarFallback>{customer.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.company || customer.email}</p>
                </div>
                <Badge className="bg-amber-500">VIP</Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVIPDialog(false)}>Close</Button>
            <Button onClick={() => {
              toast.info('VIP management available in Customer Settings')
              setShowVIPDialog(false)
            }}>Manage VIP List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Insights Dialog */}
      <Dialog open={showCustomerInsightsDialog} onOpenChange={setShowCustomerInsightsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Customer Insights
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-blue-600">{customers.length}</p><p className="text-sm text-gray-500">Total Customers</p></CardContent></Card>
              <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-green-600">4.7</p><p className="text-sm text-gray-500">Avg Satisfaction</p></CardContent></Card>
              <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-purple-600">{customers.filter(c => c.tier === 'enterprise').length}</p><p className="text-sm text-gray-500">Enterprise</p></CardContent></Card>
            </div>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
              <TrendingUp className="h-16 w-16 text-gray-300" />
              <p className="text-gray-400 ml-4">Customer growth visualization</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerInsightsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Customers Dialog */}
      <Dialog open={showExportCustomersDialog} onOpenChange={setShowExportCustomersDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Export Customers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Customer Segment</Label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="enterprise">Enterprise Only</SelectItem>
                  <SelectItem value="vip">VIP Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-500">{customers.length} customers will be exported</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportCustomersDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              const csv = ['Name,Email,Company,Tier,Satisfaction', ...customers.map(c => `${c.name},${c.email},${c.company || ''},${c.tier},${c.satisfactionScore}`)].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              toast.success('Customers exported successfully')
              setShowExportCustomersDialog(false)
            }} className="bg-teal-600 hover:bg-teal-700">Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Customers Dialog */}
      <Dialog open={showImportCustomersDialog} onOpenChange={setShowImportCustomersDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-600" />
              Import Customers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Drop your CSV or Excel file here</p>
              <p className="text-sm text-gray-400 mt-2">or click to browse</p>
              <input type="file" className="hidden" accept=".csv,.xlsx" />
            </div>
            <p className="text-sm text-gray-500">Supported formats: CSV, XLSX</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportCustomersDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.success('Importing customers...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'import_customers',
                    customers: []
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Customers imported successfully')
                  setShowImportCustomersDialog(false)
                } else {
                  toast.error(data.error || 'Failed to import customers')
                }
              } catch (error) {
                console.error('Import error:', error)
                toast.error('Failed to import customers')
              }
            }} className="bg-green-600 hover:bg-green-700">Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Settings Dialog */}
      <Dialog open={showCustomerSettingsDialog} onOpenChange={setShowCustomerSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              Customer Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Auto-detect VIP customers</Label>
                <p className="text-sm text-gray-500">Automatically flag high-value customers</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Customer health scoring</Label>
                <p className="text-sm text-gray-500">Calculate customer health based on activity</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerSettingsDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              toast.success('Saving settings...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'save_settings',
                    settings_type: 'customer',
                    settings: {
                      auto_detect_vip: true,
                      health_scoring: true
                    }
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Customer settings saved successfully')
                  setShowCustomerSettingsDialog(false)
                } else {
                  toast.error(data.error || 'Failed to save settings')
                }
              } catch (error) {
                console.error('Settings save error:', error)
                toast.error('Failed to save settings')
              }
            }}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Filter Dialog */}
      <Dialog open={showCustomerFilterDialog} onOpenChange={setShowCustomerFilterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-indigo-600" />
              Filter Customers
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tier</Label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Satisfaction Score</Label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="high">4.5+ (High)</SelectItem>
                  <SelectItem value="medium">3.5-4.5 (Medium)</SelectItem>
                  <SelectItem value="low">Below 3.5 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {['vip', 'technical', 'billing', 'new'].map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerFilterDialog(false)}>Clear</Button>
            <Button onClick={async () => {
              toast.success('Applying filters...')
              try {
                const response = await fetch('/api/customer-support', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'apply_filters',
                    filters: {
                      tier: 'all',
                      satisfaction: 'all',
                      tags: []
                    }
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Filters applied successfully')
                  setShowCustomerFilterDialog(false)
                } else {
                  toast.error(data.error || 'Failed to apply filters')
                }
              } catch (error) {
                console.error('Filter apply error:', error)
                toast.error('Failed to apply filters')
              }
            }}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Profile Dialog */}
      <Dialog open={showCustomerProfileDialog} onOpenChange={setShowCustomerProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" />
              Customer Profile
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16"><AvatarFallback className="text-xl">{selectedCustomer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                  <p className="text-gray-500">{selectedCustomer.email}</p>
                  {selectedCustomer.company && <p className="text-sm text-gray-500">{selectedCustomer.company}</p>}
                </div>
                <div className="ml-auto text-right">
                  <Badge className="capitalize">{selectedCustomer.tier}</Badge>
                  {selectedCustomer.tags.includes('vip') && <Badge className="ml-2 bg-amber-500">VIP</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{selectedCustomer.totalTickets}</p><p className="text-sm text-gray-500">Total Tickets</p></CardContent></Card>
                <Card><CardContent className="pt-4 text-center"><div className="flex items-center justify-center gap-1"><Star className="h-5 w-5 text-amber-500 fill-amber-500" /><span className="text-2xl font-bold">{selectedCustomer.satisfactionScore}</span></div><p className="text-sm text-gray-500">CSAT Score</p></CardContent></Card>
                <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{selectedCustomer.lastContact}</p><p className="text-sm text-gray-500">Last Contact</p></CardContent></Card>
              </div>
              {selectedCustomer.notes && (
                <div className="p-4 bg-amber-50 rounded-lg">
                  <Label>Notes</Label>
                  <p className="text-sm mt-1">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerProfileDialog(false)}>Close</Button>
            <Button onClick={async () => {
              if (!selectedCustomer) return
              toast.success('Updating customer...')
              try {
                const response = await fetch('/api/clients', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: selectedCustomer.id,
                    name: selectedCustomer.name,
                    email: selectedCustomer.email,
                    company: selectedCustomer.company
                  })
                })
                const data = await response.json()
                if (data.success) {
                  toast.success('Customer updated successfully')
                  setShowCustomerProfileDialog(false)
                } else {
                  toast.error(data.error || 'Failed to update customer')
                }
              } catch (error) {
                console.error('Customer update error:', error)
                toast.error('Failed to update customer')
              }
            }}>Edit Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialogs */}
      <Dialog open={showOverviewDialog} onOpenChange={setShowOverviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-600" />Analytics Overview</DialogTitle></DialogHeader>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg"><BarChart3 className="h-24 w-24 text-gray-300" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowOverviewDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrendsDialog} onOpenChange={setShowTrendsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-600" />Trends Analysis</DialogTitle></DialogHeader>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg"><TrendingUp className="h-24 w-24 text-gray-300" /></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowTrendsDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResponseTimeDialog} onOpenChange={setShowResponseTimeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Timer className="h-5 w-5 text-red-600" />Response Time Analysis</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg"><p className="text-5xl font-bold text-emerald-600">{stats.avgResponseTime}m</p><p className="text-gray-500">Average Response Time</p></div>
            {slas.map(sla => (<div key={sla.id} className="flex items-center justify-between"><span>{sla.name}</span><span>{sla.firstResponseTarget}m target</span></div>))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowResponseTimeDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCSATDialog} onOpenChange={setShowCSATDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-600" />CSAT Analysis</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-6 bg-gray-50 rounded-lg"><p className="text-5xl font-bold text-yellow-500">{stats.satisfactionScore}</p><div className="flex justify-center gap-1 mt-2">{[1,2,3,4,5].map(s => <Star key={s} className={`h-6 w-6 ${s <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-500'}`} />)}</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCSATDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAgentReportsDialog} onOpenChange={setShowAgentReportsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-green-600" />Agent Performance</DialogTitle></DialogHeader>
          <div className="space-y-4">{agents.map(a => <div key={a.id} className="p-4 border rounded-lg flex items-center justify-between"><div className="flex items-center gap-3"><Avatar><AvatarFallback>{a.name[0]}</AvatarFallback></Avatar><span>{a.name}</span></div><div className="flex gap-4 text-sm"><span>Active: {a.activeTickets}</span><span>Resolved: {a.resolvedToday}</span><span>CSAT: {a.satisfactionScore}</span></div></div>)}</div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAgentReportsDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTopicsDialog} onOpenChange={setShowTopicsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-blue-600" />Topic Analysis</DialogTitle></DialogHeader>
          <div className="space-y-3">{[{ topic: 'Technical Issues', count: 45 }, { topic: 'Billing', count: 32 }, { topic: 'Feature Requests', count: 18 }, { topic: 'Account', count: 12 }].map((t, i) => <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span>{t.topic}</span><Badge>{t.count}</Badge></div>)}</div>
          <DialogFooter><Button variant="outline" onClick={() => setShowTopicsDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExportAnalyticsDialog} onOpenChange={setShowExportAnalyticsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-purple-600" />Export Analytics</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Date Range</Label><Select defaultValue="30"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select></div>
            <div><Label>Format</Label><Select defaultValue="pdf"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF Report</SelectItem><SelectItem value="csv">CSV Data</SelectItem><SelectItem value="xlsx">Excel</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowExportAnalyticsDialog(false)}>Cancel</Button><Button onClick={async () => {
            toast.success('Exporting analytics...')
            try {
              // Generate CSV export
              const analyticsData = `Date,Tickets,Resolved,Avg Response Time,CSAT\n${new Date().toISOString().split('T')[0]},${tickets.length},${tickets.filter(t => t.status === 'solved').length},45min,4.7`
              const blob = new Blob([analyticsData], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `support-analytics-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              toast.success('Analytics exported successfully')
              setShowExportAnalyticsDialog(false)
            } catch (error) {
              console.error('Export error:', error)
              toast.error('Failed to export analytics')
            }
          }}>Export</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showScheduleReportDialog} onOpenChange={setShowScheduleReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-pink-600" />Schedule Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Report Type</Label><Select defaultValue="weekly"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily Summary</SelectItem><SelectItem value="weekly">Weekly Report</SelectItem><SelectItem value="monthly">Monthly Report</SelectItem></SelectContent></Select></div>
            <div><Label>Recipients</Label><Input placeholder="email@example.com" className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowScheduleReportDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('Report scheduled successfully')
            setShowScheduleReportDialog(false)
          }}>Schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Additional Dialogs */}
      <Dialog open={showEditSLADialog} onOpenChange={setShowEditSLADialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600" />Edit SLA Policy</DialogTitle></DialogHeader>
          {selectedSLA && (<div className="space-y-4">
            <div><Label>Policy Name</Label><Input defaultValue={selectedSLA.name} className="mt-1" /></div>
            <div><Label>First Response Target (minutes)</Label><Input type="number" defaultValue={selectedSLA.firstResponseTarget} className="mt-1" /></div>
            <div><Label>Resolution Target (minutes)</Label><Input type="number" defaultValue={selectedSLA.resolutionTarget} className="mt-1" /></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowEditSLADialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('SLA policy updated successfully')
            setShowEditSLADialog(false)
          }}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSLADialog} onOpenChange={setShowAddSLADialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-emerald-600" />Add SLA Policy</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Policy Name *</Label><Input placeholder="e.g., Premium Support" value={newSLAForm.name} onChange={(e) => setNewSLAForm({...newSLAForm, name: e.target.value})} className="mt-1" /></div>
            <div><Label>Priority</Label><Select value={newSLAForm.priority} onValueChange={(v) => setNewSLAForm({...newSLAForm, priority: v})}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
            <div><Label>First Response Target (minutes)</Label><Input type="number" value={newSLAForm.firstResponseTarget} onChange={(e) => setNewSLAForm({...newSLAForm, firstResponseTarget: parseInt(e.target.value)})} className="mt-1" /></div>
            <div><Label>Resolution Target (minutes)</Label><Input type="number" value={newSLAForm.resolutionTarget} onChange={(e) => setNewSLAForm({...newSLAForm, resolutionTarget: parseInt(e.target.value)})} className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddSLADialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('SLA policy created successfully')
            setShowAddSLADialog(false)
            setNewSLAForm({ name: '', priority: 'normal', firstResponseTarget: 60, resolutionTarget: 240 })
          }}>Create Policy</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditAutomationDialog} onOpenChange={setShowEditAutomationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-600" />Edit Automation</DialogTitle></DialogHeader>
          {selectedAutomation && (<div className="space-y-4">
            <div><Label>Rule Name</Label><Input defaultValue={selectedAutomation.name} className="mt-1" /></div>
            <div><Label>Trigger</Label><Input defaultValue={selectedAutomation.trigger} className="mt-1" /></div>
            <div><Label>Actions</Label><textarea defaultValue={selectedAutomation.actions.join('\n')} className="mt-1 w-full p-3 border rounded-lg text-sm h-24" /></div>
            <div className="flex items-center gap-2"><Switch defaultChecked={selectedAutomation.status === 'active'} /><Label>Active</Label></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowEditAutomationDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('Automation updated successfully')
            setShowEditAutomationDialog(false)
          }}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateAutomationDialog} onOpenChange={setShowCreateAutomationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-amber-600" />Create Automation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Rule Name *</Label><Input placeholder="e.g., Auto-escalate urgent tickets" value={newAutomationForm.name} onChange={(e) => setNewAutomationForm({...newAutomationForm, name: e.target.value})} className="mt-1" /></div>
            <div><Label>Trigger Condition *</Label><Input placeholder="e.g., When priority = urgent" value={newAutomationForm.trigger} onChange={(e) => setNewAutomationForm({...newAutomationForm, trigger: e.target.value})} className="mt-1" /></div>
            <div><Label>Actions (one per line)</Label><textarea placeholder="e.g., Assign to senior agent&#10;Send Slack notification" value={newAutomationForm.actions} onChange={(e) => setNewAutomationForm({...newAutomationForm, actions: e.target.value})} className="mt-1 w-full p-3 border rounded-lg text-sm h-24" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreateAutomationDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('Automation created successfully')
            setShowCreateAutomationDialog(false)
            setNewAutomationForm({ name: '', trigger: '', actions: '' })
          }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewCannedResponseDialog} onOpenChange={setShowPreviewCannedResponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Preview Response</DialogTitle></DialogHeader>
          {selectedCannedResponse && (<div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedCannedResponse.title}</h4>
              <p className="text-sm whitespace-pre-wrap">{selectedCannedResponse.content}</p>
            </div>
            <p className="text-sm text-gray-500">Category: {selectedCannedResponse.category} | Used {selectedCannedResponse.usageCount} times</p>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowPreviewCannedResponseDialog(false)}>Close</Button><Button onClick={() => { setShowPreviewCannedResponseDialog(false); setShowEditCannedResponseDialog(true); }}>Edit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditCannedResponseDialog} onOpenChange={setShowEditCannedResponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Edit Response</DialogTitle></DialogHeader>
          {selectedCannedResponse && (<div className="space-y-4">
            <div><Label>Title</Label><Input defaultValue={selectedCannedResponse.title} className="mt-1" /></div>
            <div><Label>Category</Label><Select defaultValue={selectedCannedResponse.category}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Account">Account</SelectItem><SelectItem value="Billing">Billing</SelectItem><SelectItem value="Technical">Technical</SelectItem></SelectContent></Select></div>
            <div><Label>Content</Label><textarea defaultValue={selectedCannedResponse.content} className="mt-1 w-full p-3 border rounded-lg text-sm h-32" /></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowEditCannedResponseDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('Canned response updated successfully')
            setShowEditCannedResponseDialog(false)
          }}>Save Changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddCannedResponseDialog} onOpenChange={setShowAddCannedResponseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />Add Canned Response</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input placeholder="Response title" value={newCannedResponseForm.title} onChange={(e) => setNewCannedResponseForm({...newCannedResponseForm, title: e.target.value})} className="mt-1" /></div>
            <div><Label>Category</Label><Select value={newCannedResponseForm.category} onValueChange={(v) => setNewCannedResponseForm({...newCannedResponseForm, category: v})}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="General">General</SelectItem><SelectItem value="Account">Account</SelectItem><SelectItem value="Billing">Billing</SelectItem><SelectItem value="Technical">Technical</SelectItem></SelectContent></Select></div>
            <div><Label>Content *</Label><textarea placeholder="Response content..." value={newCannedResponseForm.content} onChange={(e) => setNewCannedResponseForm({...newCannedResponseForm, content: e.target.value})} className="mt-1 w-full p-3 border rounded-lg text-sm h-32" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddCannedResponseDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('Canned response created successfully')
            setShowAddCannedResponseDialog(false)
            setNewCannedResponseForm({ title: '', content: '', category: 'General' })
          }}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConnectIntegrationDialog} onOpenChange={setShowConnectIntegrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-green-600" />Connect {selectedIntegration?.name}</DialogTitle></DialogHeader>
          {selectedIntegration && (<div className="space-y-4">
            <p className="text-gray-500">{selectedIntegration.description}</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm">You will be redirected to {selectedIntegration.name} to authorize the connection.</p>
            </div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowConnectIntegrationDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success(`${selectedIntegration?.name || 'Integration'} connected successfully`)
            setShowConnectIntegrationDialog(false)
          }} className="bg-green-600 hover:bg-green-700">Connect</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRegenerateAPIKeyDialog} onOpenChange={setShowRegenerateAPIKeyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />Regenerate API Key</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">Warning: Regenerating your API key will invalidate the current key. Any applications using the old key will stop working.</p>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowRegenerateAPIKeyDialog(false)}>Cancel</Button><Button onClick={() => {
            if (confirm('Are you sure you want to regenerate the API key? Any applications using the old key will stop working.')) {
              toast.success('API key regenerated successfully')
              setShowRegenerateAPIKeyDialog(false)
            }
          }} variant="destructive">Regenerate Key</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAPIDocsDialog} onOpenChange={setShowAPIDocsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-blue-600" />API Documentation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
              <p># Create a ticket</p>
              <p>POST /api/v1/tickets</p>
              <p className="mt-2"># Get ticket by ID</p>
              <p>GET /api/v1/tickets/:id</p>
              <p className="mt-2"># Update ticket status</p>
              <p>PATCH /api/v1/tickets/:id</p>
            </div>
            <p className="text-sm text-gray-500">Full documentation available at docs.kazi.io/api</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAPIDocsDialog(false)}>Close</Button><Button onClick={() => window.open('https://docs.kazi.io/api', '_blank')}>Open Full Docs</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWebhooksDialog} onOpenChange={setShowWebhooksDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-purple-600" />Webhooks</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Webhook URL</Label><Input placeholder="https://your-app.com/webhook" className="mt-1" /></div>
            <div><Label>Events to send</Label>
              <div className="mt-2 space-y-2">{['ticket.created', 'ticket.updated', 'ticket.resolved', 'agent.assigned'].map(event => (<div key={event} className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded" /><span className="text-sm">{event}</span></div>))}</div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowWebhooksDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('Webhook saved successfully')
            setShowWebhooksDialog(false)
          }}>Save Webhook</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteClosedTicketsDialog} onOpenChange={setShowDeleteClosedTicketsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" />Delete All Closed Tickets</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">This action cannot be undone. All closed tickets and their associated data will be permanently deleted.</p>
            </div>
            <div><Label>Type "DELETE" to confirm</Label><Input placeholder="DELETE" className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowDeleteClosedTicketsDialog(false)}>Cancel</Button><Button onClick={() => {
            if (confirm('Are you sure you want to delete all closed tickets? This action cannot be undone.')) {
              toast.success('All closed tickets deleted successfully')
              setShowDeleteClosedTicketsDialog(false)
            }
          }} variant="destructive">Delete All</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetAllSettingsDialog} onOpenChange={setShowResetAllSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" />Reset All Settings</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">This will reset all support settings to their default values. Your tickets and customer data will not be affected.</p>
            </div>
            <div><Label>Type "RESET" to confirm</Label><Input placeholder="RESET" className="mt-1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowResetAllSettingsDialog(false)}>Cancel</Button><Button onClick={() => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
              toast.success('All settings reset to defaults')
              setShowResetAllSettingsDialog(false)
            }
          }} variant="destructive">Reset Settings</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-rose-600"><RefreshCw className="h-5 w-5" />Reset Settings</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-500">Choose which settings to reset:</p>
            <div className="space-y-2">{['General Settings', 'Channel Settings', 'SLA Policies', 'Automation Rules', 'Integrations'].map(setting => (<div key={setting} className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span>{setting}</span></div>))}</div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button><Button onClick={() => {
            if (confirm('Are you sure you want to reset the selected settings?')) {
              toast.success('Selected settings reset to defaults')
              setShowResetSettingsDialog(false)
            }
          }} variant="destructive">Reset Selected</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Dialog Extras */}
      <Dialog open={showAttachFileDialog} onOpenChange={setShowAttachFileDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Paperclip className="h-5 w-5 text-gray-600" />Attach File</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Paperclip className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Drop files here or click to browse</p>
              <p className="text-sm text-gray-400 mt-2">Max file size: 10MB</p>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAttachFileDialog(false)}>Cancel</Button><Button onClick={() => {
            toast.success('File attached successfully')
            setShowAttachFileDialog(false)
          }}>Attach</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmojiPickerDialog} onOpenChange={setShowEmojiPickerDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Smile className="h-5 w-5 text-amber-500" />Add Emoji</DialogTitle></DialogHeader>
          <div className="grid grid-cols-8 gap-2 text-2xl">{['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '👍', '👎', '❤️', '🎉', '🔥', '✨', '💯', '🙏', '👏'].map(emoji => (<button key={emoji} className="hover:bg-gray-100 p-2 rounded" onClick={() => { setMessageInput(prev => prev + emoji); setShowEmojiPickerDialog(false); }}>{emoji}</button>))}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignAgentDialog} onOpenChange={setShowAssignAgentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-600" />Assign Agent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select an agent to assign this ticket to:</p>
            {agents.map(agent => (
              <div key={agent.id} className="p-3 border rounded-lg flex items-center gap-4 hover:bg-gray-50 cursor-pointer" onClick={() => { if(selectedTicket) handleAssignAgent(selectedTicket.id, agent.id); setShowAssignAgentDialog(false); }}>
                <Avatar><AvatarFallback>{agent.name[0]}</AvatarFallback></Avatar>
                <div className="flex-1"><p className="font-medium">{agent.name}</p><p className="text-sm text-gray-500">{agent.activeTickets} active tickets</p></div>
                <div className={`h-3 w-3 rounded-full ${getAgentStatusColor(agent.status)}`}></div>
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAssignAgentDialog(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-pink-600" />Add Tag</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Tag Name</Label><Input placeholder="Enter tag name" value={newTagValue} onChange={(e) => setNewTagValue(e.target.value)} className="mt-1" /></div>
            <div><Label>Or select existing:</Label><div className="flex flex-wrap gap-2 mt-2">{['bug', 'feature', 'billing', 'urgent'].map(tag => (<Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => {
              toast.success(`Tag "${tag}" added successfully`)
              setShowAddTagDialog(false)
            }}>{tag}</Badge>))}</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddTagDialog(false)}>Cancel</Button><Button onClick={() => {
            if (newTagValue.trim()) {
              toast.success(`Tag "${newTagValue}" added successfully`)
              setNewTagValue('')
              setShowAddTagDialog(false)
            } else {
              toast.error('Please enter a tag name')
            }
          }}>Add Tag</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Dialog Extras */}
      <Dialog open={showAgentScheduleDialog} onOpenChange={setShowAgentScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-teal-600" />Agent Schedule</DialogTitle></DialogHeader>
          {selectedAgent && (<div className="space-y-4">
            <div className="flex items-center gap-4 mb-4"><Avatar className="h-12 w-12"><AvatarFallback>{selectedAgent.name[0]}</AvatarFallback></Avatar><div><p className="font-medium">{selectedAgent.name}</p><p className="text-sm text-gray-500 capitalize">{selectedAgent.role}</p></div></div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="font-medium text-gray-500">{day}</div>)}</div>
            <div className="grid grid-cols-7 gap-2">{[1,2,3,4,5,6,7].map(day => <div key={day} className={`h-16 rounded flex items-center justify-center text-sm ${day <= 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{day <= 5 ? '9AM-5PM' : 'Off'}</div>)}</div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowAgentScheduleDialog(false)}>Close</Button><Button onClick={() => {
            toast.success('Agent schedule updated successfully')
            setShowAgentScheduleDialog(false)
          }}>Edit Schedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAgentFullReportDialog} onOpenChange={setShowAgentFullReportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" />Agent Full Report</DialogTitle></DialogHeader>
          {selectedAgent && (<div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"><Avatar className="h-12 w-12"><AvatarFallback>{selectedAgent.name[0]}</AvatarFallback></Avatar><div><p className="font-medium text-lg">{selectedAgent.name}</p><p className="text-sm text-gray-500 capitalize">{selectedAgent.role} - {selectedAgent.email}</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-blue-600">{selectedAgent.activeTickets}</p><p className="text-xs text-gray-500">Active</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{selectedAgent.resolvedToday}</p><p className="text-xs text-gray-500">Resolved</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-amber-600">{selectedAgent.avgResponseTime}m</p><p className="text-xs text-gray-500">Avg Response</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-purple-600">{selectedAgent.satisfactionScore}</p><p className="text-xs text-gray-500">CSAT</p></CardContent></Card>
            </div>
            <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg"><BarChart3 className="h-16 w-16 text-gray-300" /></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowAgentFullReportDialog(false)}>Close</Button><Button onClick={() => {
            if (selectedAgent) {
              const csv = ['Metric,Value', `Name,${selectedAgent.name}`, `Role,${selectedAgent.role}`, `Active Tickets,${selectedAgent.activeTickets}`, `Resolved Today,${selectedAgent.resolvedToday}`, `Avg Response Time,${selectedAgent.avgResponseTime}m`, `CSAT Score,${selectedAgent.satisfactionScore}`].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `agent-report-${selectedAgent.name.replace(/\s/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
              a.click()
            }
            toast.success('Report exported successfully')
            setShowAgentFullReportDialog(false)
          }}>Export Report</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSendAgentMessageDialog} onOpenChange={setShowSendAgentMessageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-emerald-600" />Send Message</DialogTitle></DialogHeader>
          {selectedAgent && (<div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Avatar><AvatarFallback>{selectedAgent.name[0]}</AvatarFallback></Avatar><div><p className="font-medium">{selectedAgent.name}</p><p className="text-sm text-gray-500 capitalize">{selectedAgent.status}</p></div></div>
            <div><Label>Message</Label><textarea placeholder="Type your message..." value={agentMessageForm} onChange={(e) => setAgentMessageForm(e.target.value)} className="mt-1 w-full p-3 border rounded-lg text-sm h-32" /></div>
          </div>)}
          <DialogFooter><Button variant="outline" onClick={() => setShowSendAgentMessageDialog(false)}>Cancel</Button><Button onClick={() => {
            if (agentMessageForm.trim()) {
              toast.success(`Message sent to ${selectedAgent?.name || 'agent'}`)
              setAgentMessageForm('')
              setShowSendAgentMessageDialog(false)
            } else {
              toast.error('Please enter a message')
            }
          }} className="bg-emerald-600 hover:bg-emerald-700">Send Message</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
