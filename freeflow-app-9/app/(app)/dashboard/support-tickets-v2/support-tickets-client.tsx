'use client'

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useSupportTickets, SupportTicket, SupportStats } from '@/lib/hooks/use-support-tickets'
import { createSupportTicket, deleteSupportTicket, resolveTicket, escalateTicket } from '@/app/actions/support-tickets'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Ticket, Search, Plus, Clock, AlertTriangle, CheckCircle,
  User, Mail, Phone, MessageSquare, Send, Paperclip, Star,
  MoreHorizontal, ChevronRight, Users, BarChart3,
  Timer, Zap, FileText, Link2, Merge, Flag, Trash2, Smile, TrendingUp, Lock, RefreshCw, Download, Settings,
  Inbox, UserCheck, Hourglass, CheckCheck, AlertCircle,
  Bot, Copy, MessageCircle,
  Bell, Key, Webhook, Shield, Cpu, AlertOctagon, Palette, Globe, Headphones, Sliders
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




type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
type TicketCategory = 'technical' | 'billing' | 'feature-request' | 'bug' | 'general' | 'account'

// Zendesk-style interfaces
interface TicketMessage {
  id: string
  ticketId: string
  type: 'public' | 'internal'
  sender: string
  senderType: 'customer' | 'agent' | 'system'
  content: string
  attachments?: string[]
  createdAt: string
}

interface Macro {
  id: string
  name: string
  description: string
  content: string
  category: string
  usageCount: number
}

interface SLA {
  id: string
  name: string
  firstResponseTime: number // in minutes
  resolutionTime: number // in hours
  priority: TicketPriority
}

interface AgentMetrics {
  id: string
  name: string
  avatar: string
  ticketsResolved: number
  avgResponseTime: number
  satisfactionScore: number
  currentLoad: number
}

interface CustomerProfile {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  totalTickets: number
  openTickets: number
  avgSatisfaction: number
  lifetimeValue: number
  tags: string[]
}

interface SupportTicketsClientProps {
  initialTickets: SupportTicket[]
  initialStats: SupportStats
}

// Mock data
const mockMessages: TicketMessage[] = [
  {
    id: '1',
    ticketId: '1',
    type: 'public',
    sender: 'John Customer',
    senderType: 'customer',
    content: 'I\'m having trouble logging into my account. It keeps saying invalid password even though I\'m sure it\'s correct.',
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    ticketId: '1',
    type: 'public',
    sender: 'Sarah Agent',
    senderType: 'agent',
    content: 'Hi John, I apologize for the inconvenience. Let me help you with that. Can you please try clearing your browser cache and cookies, then attempt to log in again?',
    createdAt: '2024-03-15T10:15:00Z'
  },
  {
    id: '3',
    ticketId: '1',
    type: 'internal',
    sender: 'Sarah Agent',
    senderType: 'agent',
    content: 'Checked the logs - looks like there might be a rate limiting issue. Escalating to engineering.',
    createdAt: '2024-03-15T10:20:00Z'
  },
]

const mockMacros: Macro[] = [
  { id: '1', name: 'Password Reset', description: 'Standard password reset instructions', content: 'To reset your password, please visit https://app.freeflow.io/reset-password and follow the instructions. If you continue to experience issues, please let us know.', category: 'Account', usageCount: 245 },
  { id: '2', name: 'Billing Question', description: 'Redirect to billing team', content: 'Thank you for reaching out about billing. I\'ve forwarded your question to our billing team. They will respond within 1 business day.', category: 'Billing', usageCount: 189 },
  { id: '3', name: 'Feature Request Logged', description: 'Acknowledge feature request', content: 'Thank you for your feature suggestion! We\'ve logged this in our product backlog. While we can\'t guarantee implementation, we value your feedback.', category: 'Product', usageCount: 156 },
  { id: '4', name: 'Bug Acknowledged', description: 'Bug report acknowledgment', content: 'Thank you for reporting this bug. Our engineering team is investigating. We\'ll update you once we have more information.', category: 'Technical', usageCount: 134 },
  { id: '5', name: 'Satisfaction Follow-up', description: 'Request satisfaction rating', content: 'We hope we\'ve resolved your issue. Could you take a moment to rate your experience? Your feedback helps us improve.', category: 'General', usageCount: 98 },
]

const mockSLAs: SLA[] = [
  { id: '1', name: 'Urgent', firstResponseTime: 15, resolutionTime: 4, priority: 'urgent' },
  { id: '2', name: 'High', firstResponseTime: 60, resolutionTime: 8, priority: 'high' },
  { id: '3', name: 'Medium', firstResponseTime: 240, resolutionTime: 24, priority: 'medium' },
  { id: '4', name: 'Low', firstResponseTime: 480, resolutionTime: 72, priority: 'low' },
]

const mockAgents: AgentMetrics[] = [
  { id: '1', name: 'Sarah Johnson', avatar: 'sarah', ticketsResolved: 156, avgResponseTime: 12, satisfactionScore: 98, currentLoad: 8 },
  { id: '2', name: 'Mike Chen', avatar: 'mike', ticketsResolved: 142, avgResponseTime: 15, satisfactionScore: 96, currentLoad: 12 },
  { id: '3', name: 'Emily Davis', avatar: 'emily', ticketsResolved: 128, avgResponseTime: 18, satisfactionScore: 94, currentLoad: 6 },
  { id: '4', name: 'Alex Wilson', avatar: 'alex', ticketsResolved: 98, avgResponseTime: 22, satisfactionScore: 92, currentLoad: 10 },
]

const mockCustomer: CustomerProfile = {
  id: '1',
  name: 'John Customer',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  company: 'Acme Corp',
  totalTickets: 12,
  openTickets: 2,
  avgSatisfaction: 4.5,
  lifetimeValue: 12500,
  tags: ['VIP', 'Enterprise', 'Beta Tester']
}

// Mock data for AI-powered competitive upgrade components
const mockSupportTicketsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Fast Resolution', description: 'Average first response time down to 12 minutes!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'SLA At Risk', description: '3 urgent tickets approaching SLA breach in 2 hours.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'SLA' },
  { id: '3', type: 'info' as const, title: 'CSAT Trending Up', description: 'Customer satisfaction score improved to 4.7/5.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Satisfaction' },
]

const mockSupportTicketsCollaborators = [
  { id: '1', name: 'Support Lead', avatar: '/avatars/support-lead.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Agent Sarah', avatar: '/avatars/sarah.jpg', status: 'online' as const, role: 'Agent' },
  { id: '3', name: 'Agent Mike', avatar: '/avatars/mike.jpg', status: 'away' as const, role: 'Agent' },
]

const mockSupportTicketsPredictions = [
  { id: '1', title: 'Volume Forecast', prediction: 'Expect 40% more tickets tomorrow (product launch)', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Escalation Risk', prediction: '2 tickets likely to escalate based on sentiment analysis', confidence: 76, trend: 'up' as const, impact: 'medium' as const },
]

const mockSupportTicketsActivities = [
  { id: '1', user: 'Agent Sarah', action: 'Resolved', target: 'billing inquiry #4521', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Support Lead', action: 'Escalated', target: 'critical bug report to engineering', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'warning' as const },
  { id: '3', user: 'Agent Mike', action: 'Updated', target: 'knowledge base article', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'info' as const },
]

const mockSupportTicketsQuickActions = [
  { id: '1', label: 'New Ticket', icon: 'plus', action: () => console.log('New ticket'), variant: 'default' as const },
  { id: '2', label: 'My Queue', icon: 'inbox', action: () => console.log('My queue'), variant: 'default' as const },
  { id: '3', label: 'Macros', icon: 'zap', action: () => console.log('Macros'), variant: 'outline' as const },
]

export default function SupportTicketsClient({ initialTickets, initialStats }: SupportTicketsClientProps) {
  const { tickets, loading, getStats } = useSupportTickets()
  const displayTickets = tickets.length > 0 ? tickets : initialTickets
  const stats = tickets.length > 0 ? getStats() : initialStats

  const [activeTab, setActiveTab] = useState('inbox')
  const [activeView, setActiveView] = useState<'unassigned' | 'mine' | 'pending' | 'solved' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMacrosModal, setShowMacrosModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [replyType, setReplyType] = useState<'public' | 'internal'>('public')
  const [settingsTab, setSettingsTab] = useState('general')
  const [formData, setFormData] = useState({
    subject: '', description: '', category: 'general' as TicketCategory,
    priority: 'medium' as TicketPriority, customer_name: '', customer_email: ''
  })

  const filteredTickets = useMemo(() => {
    return displayTickets.filter(t => {
      const ticketStatus = t.status === 'in_progress' ? 'in-progress' : t.status
      if (statusFilter !== 'all' && ticketStatus !== statusFilter) return false
      const ticketPriority = t.priority === 'normal' ? 'medium' : t.priority
      if (priorityFilter !== 'all' && ticketPriority !== priorityFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return t.subject.toLowerCase().includes(query) ||
               t.description.toLowerCase().includes(query) ||
               t.customer_email?.toLowerCase().includes(query)
      }
      return true
    })
  }, [displayTickets, statusFilter, priorityFilter, searchQuery])

  const getStatusColor = (s: string) => {
    const status = s === 'in_progress' ? 'in-progress' : s
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      waiting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
    return colors[status] || colors.closed
  }

  const getPriorityColor = (p: string) => {
    const priority = p === 'normal' ? 'medium' : p
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[priority] || colors.medium
  }

  const getCategoryIcon = (c: string) => {
    const icons: Record<string, React.ReactNode> = {
      technical: <Zap className="w-4 h-4" />,
      billing: <FileText className="w-4 h-4" />,
      'feature-request': <Star className="w-4 h-4" />,
      feature: <Star className="w-4 h-4" />,
      bug: <AlertCircle className="w-4 h-4" />,
      general: <MessageSquare className="w-4 h-4" />,
      account: <User className="w-4 h-4" />
    }
    return icons[c] || <Ticket className="w-4 h-4" />
  }

  const getSLAStatus = (ticket: SupportTicket) => {
    const sla = mockSLAs.find(s => s.priority === (ticket.priority === 'normal' ? 'medium' : ticket.priority))
    if (!sla) return null
    const createdAt = new Date(ticket.created_at)
    const now = new Date()
    const minutesElapsed = Math.floor((now.getTime() - createdAt.getTime()) / 60000)
    const percentUsed = (minutesElapsed / sla.firstResponseTime) * 100
    return {
      sla,
      percentUsed: Math.min(percentUsed, 100),
      breached: percentUsed > 100,
      timeRemaining: Math.max(0, sla.firstResponseTime - minutesElapsed)
    }
  }

  // Handlers
  const handleCreate = async () => {
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    try {
      await createSupportTicket(formData)
      toast.success('Ticket created successfully!')
      setShowCreateModal(false)
      setFormData({ subject: '', description: '', category: 'general', priority: 'medium', customer_name: '', customer_email: '' })
    } catch (error) {
      toast.error('Failed to create ticket')
      console.error('Failed to create:', error)
    }
  }

  const handleReply = useCallback(() => {
    if (!replyContent.trim()) {
      toast.error('Please enter a reply')
      return
    }
    if (!selectedTicket) return
    // In production, this would call an API to send the reply
    toast.success(replyType === 'public' ? 'Reply sent!' : 'Internal note added!')
    setReplyContent('')
  }, [replyContent, selectedTicket, replyType])

  const handleUseMacro = (macro: Macro) => {
    setReplyContent(macro.content)
    setShowMacrosModal(false)
  }

  const handleCloseTicket = (ticket: Ticket) => {
    toast.success('Ticket closed', {
      description: `Ticket #${ticket.id} has been closed`
    })
  }

  const handleEscalateTicket = (ticket: Ticket) => {
    toast.info('Ticket escalated', {
      description: `Ticket #${ticket.id} has been escalated`
    })
  }

  const handleMergeTickets = () => {
    toast.success('Tickets merged', {
      description: 'Selected tickets have been merged'
    })
  }

  const handleExportTickets = () => {
    toast.success('Export started', {
      description: 'Ticket data is being exported'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              Support Center
            </h1>
            <p className="text-muted-foreground">Zendesk-style ticket management and customer support</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-2xl font-bold">{stats?.open || 0}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Inbox className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Hourglass className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCheck className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{stats.avgResponseTime.toFixed(0)}m</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Timer className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CSAT Score</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Smile className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">SLA Breached</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-lg">
            <TabsTrigger value="inbox" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Inbox className="w-4 h-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="macros" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Zap className="w-4 h-4 mr-2" />
              Macros
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Inbox Tab */}
          <TabsContent value="inbox" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Ticket List */}
              <div className={`${selectedTicket ? 'col-span-5' : 'col-span-8'} space-y-4`}>
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'open', 'in-progress', 'resolved'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          statusFilter === s
                            ? 'bg-teal-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {s === 'all' ? 'All' : s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Views */}
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: 'All Tickets', icon: <Inbox className="w-4 h-4" /> },
                    { id: 'unassigned', label: 'Unassigned', icon: <UserCheck className="w-4 h-4" /> },
                    { id: 'mine', label: 'My Tickets', icon: <User className="w-4 h-4" /> },
                    { id: 'pending', label: 'Pending', icon: <Hourglass className="w-4 h-4" /> },
                  ].map(view => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                        activeView === view.id
                          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                          : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {view.icon}
                      {view.label}
                    </button>
                  ))}
                </div>

                {/* Ticket List */}
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {filteredTickets.map(ticket => {
                      const slaStatus = getSLAStatus(ticket)
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`bg-white dark:bg-gray-800 rounded-xl p-4 border cursor-pointer transition-all ${
                            selectedTicket?.id === ticket.id
                              ? 'border-teal-500 ring-2 ring-teal-500/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getPriorityColor(ticket.priority)}`}>
                              {getCategoryIcon(ticket.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{ticket.subject}</h3>
                                {slaStatus?.breached && (
                                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    SLA Breached
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate mb-2">{ticket.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {ticket.customer_name || 'Unknown'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                                  {ticket.status.replace('_', ' ')}
                                </span>
                              </div>
                              {/* SLA Progress */}
                              {slaStatus && !slaStatus.breached && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">SLA: {slaStatus.timeRemaining}m remaining</span>
                                    <span className={slaStatus.percentUsed > 80 ? 'text-orange-600' : 'text-green-600'}>
                                      {Math.round(slaStatus.percentUsed)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={slaStatus.percentUsed}
                                    className={`h-1 ${slaStatus.percentUsed > 80 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Ticket Detail */}
              {selectedTicket ? (
                <div className="col-span-7 space-y-4">
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            #{selectedTicket.ticket_code || selectedTicket.id.slice(0, 8)} • Created {new Date(selectedTicket.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(selectedTicket.status)}>
                            {selectedTicket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(selectedTicket.priority)}>
                            {selectedTicket.priority}
                          </Badge>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setShowCustomerModal(true)}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://avatar.vercel.sh/${selectedTicket.customer_email}`} />
                          <AvatarFallback>{selectedTicket.customer_name?.slice(0, 2) || 'UN'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{selectedTicket.customer_name || 'Unknown Customer'}</p>
                          <p className="text-sm text-muted-foreground">{selectedTicket.customer_email}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">12 tickets</p>
                          <p className="text-green-600">4.5 ⭐ avg</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>

                      {/* Conversation */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Conversation</h4>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-4">
                            {mockMessages.map(message => (
                              <div
                                key={message.id}
                                className={`flex gap-3 ${message.type === 'internal' ? 'bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg' : ''}`}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={`https://avatar.vercel.sh/${message.sender}`} />
                                  <AvatarFallback>{message.sender.slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{message.sender}</span>
                                    {message.type === 'internal' && (
                                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Internal
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(message.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Reply Box */}
                      <div className="border rounded-lg">
                        <div className="flex items-center gap-2 p-2 border-b">
                          <button
                            onClick={() => setReplyType('public')}
                            className={`px-3 py-1 rounded text-sm ${
                              replyType === 'public'
                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <MessageSquare className="w-4 h-4 inline mr-1" />
                            Public Reply
                          </button>
                          <button
                            onClick={() => setReplyType('internal')}
                            className={`px-3 py-1 rounded text-sm ${
                              replyType === 'internal'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Lock className="w-4 h-4 inline mr-1" />
                            Internal Note
                          </button>
                          <div className="flex-1" />
                          <button
                            onClick={() => setShowMacrosModal(true)}
                            className="px-3 py-1 rounded text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Zap className="w-4 h-4 inline mr-1" />
                            Macros
                          </button>
                        </div>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={replyType === 'public' ? 'Type your reply to the customer...' : 'Add an internal note...'}
                          className="w-full p-3 resize-none focus:outline-none dark:bg-gray-800"
                          rows={4}
                        />
                        <div className="flex items-center justify-between p-2 border-t bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Paperclip className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Bot className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={handleReply}
                            disabled={!replyContent.trim()}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {replyType === 'public' ? 'Send Reply' : 'Add Note'}
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => resolveTicket(selectedTicket.id)}
                          className="px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-sm flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                        <button
                          onClick={() => escalateTicket(selectedTicket.id)}
                          className="px-3 py-1.5 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded text-sm flex items-center gap-1"
                        >
                          <Flag className="w-4 h-4" />
                          Escalate
                        </button>
                        <button className="px-3 py-1.5 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded text-sm flex items-center gap-1">
                          <Merge className="w-4 h-4" />
                          Merge
                        </button>
                        <button className="px-3 py-1.5 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded text-sm flex items-center gap-1">
                          <Link2 className="w-4 h-4" />
                          Link
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => deleteSupportTicket(selectedTicket.id)}
                          className="px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-sm flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="col-span-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {mockAgents.slice(0, 3).map(agent => (
                          <div key={agent.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/${agent.avatar}`} />
                              <AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">{agent.currentLoad} tickets</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700">{agent.satisfactionScore}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockAgents.map(agent => (
                <Card key={agent.id}>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <Avatar className="w-16 h-16 mx-auto mb-3">
                        <AvatarImage src={`https://avatar.vercel.sh/${agent.avatar}`} />
                        <AvatarFallback>{agent.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">Support Agent</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Resolved</span>
                        <span className="font-medium">{agent.ticketsResolved}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Response</span>
                        <span className="font-medium">{agent.avgResponseTime}m</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CSAT</span>
                        <span className="font-medium text-green-600">{agent.satisfactionScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Load</span>
                        <span className="font-medium">{agent.currentLoad} tickets</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Macros Tab */}
          <TabsContent value="macros" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Response Templates</h2>
                <p className="text-muted-foreground">Pre-written responses for common scenarios</p>
              </div>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Macro
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockMacros.map(macro => (
                <Card key={macro.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{macro.name}</h3>
                        <p className="text-sm text-muted-foreground">{macro.description}</p>
                      </div>
                      <Badge variant="secondary">{macro.category}</Badge>
                    </div>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-3 line-clamp-2">
                      {macro.content}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Used {macro.usageCount} times</span>
                      <button className="text-teal-600 hover:text-teal-700 flex items-center gap-1">
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ticket Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-teal-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resolution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                    <Timer className="w-12 h-12 text-purple-300" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Satisfaction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-green-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SLA Performance */}
            <Card>
              <CardHeader>
                <CardTitle>SLA Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSLAs.map(sla => (
                    <div key={sla.id} className="flex items-center gap-4">
                      <Badge className={getPriorityColor(sla.priority)}>{sla.priority}</Badge>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">First Response: {sla.firstResponseTime}m</span>
                          <span className="text-sm text-green-600">92% met</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Resolution: {sla.resolutionTime}h</span>
                          <span className="text-sm text-green-600">88% met</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab - Zendesk-level configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Sliders, label: 'General' },
                        { id: 'sla', icon: Timer, label: 'SLA & Routing' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'channels', icon: Headphones, label: 'Channels' },
                        { id: 'automations', icon: Cpu, label: 'Automations' },
                        { id: 'advanced', icon: Lock, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-orange-500" />
                          General Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Help Desk Name</Label>
                            <Input defaultValue="FreeFlow Support" />
                          </div>
                          <div className="space-y-2">
                            <Label>Support Email</Label>
                            <Input defaultValue="support@freeflow.io" type="email" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Ticket Status</Label>
                            <Select defaultValue="open">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Auto-assign Tickets</p>
                              <p className="text-sm text-muted-foreground">Automatically assign tickets based on agent availability</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Customer Satisfaction Surveys</p>
                              <p className="text-sm text-muted-foreground">Send CSAT surveys after ticket resolution</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Allow Ticket Reopening</p>
                              <p className="text-sm text-muted-foreground">Let customers reopen closed tickets within 7 days</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-purple-500" />
                          Branding
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input defaultValue="#f97316" className="flex-1" />
                              <div className="w-10 h-10 rounded-lg bg-orange-500 border" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <Input defaultValue="https://freeflow.io/logo.png" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Show "Powered by FreeFlow"</p>
                            <p className="text-sm text-muted-foreground">Display branding on customer portal</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'sla' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Timer className="w-5 h-5 text-blue-500" />
                          SLA Policies
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Define response and resolution time targets by priority</p>
                        <div className="space-y-4">
                          {[
                            { priority: 'Urgent', firstResponse: '15 min', resolution: '2 hours', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
                            { priority: 'High', firstResponse: '1 hour', resolution: '8 hours', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
                            { priority: 'Medium', firstResponse: '4 hours', resolution: '24 hours', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
                            { priority: 'Low', firstResponse: '8 hours', resolution: '48 hours', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
                          ].map(sla => (
                            <div key={sla.priority} className="flex items-center justify-between p-4 border rounded-lg">
                              <Badge className={sla.color}>{sla.priority}</Badge>
                              <div className="flex gap-8">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">First Response</p>
                                  <p className="font-medium">{sla.firstResponse}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Resolution</p>
                                  <p className="font-medium">{sla.resolution}</p>
                                </div>
                              </div>
                              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">Edit</button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-green-500" />
                          Routing Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Round Robin Assignment</p>
                            <p className="text-sm text-muted-foreground">Distribute tickets evenly among agents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Skill-based Routing</p>
                            <p className="text-sm text-muted-foreground">Route based on agent skills and expertise</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Load Balancing</p>
                            <p className="text-sm text-muted-foreground">Consider agent workload when assigning</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Tickets per Agent</Label>
                          <Input type="number" defaultValue="25" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5 text-red-500" />
                          Escalation Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-escalate Breached SLA</p>
                            <p className="text-sm text-muted-foreground">Escalate tickets that breach SLA targets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Manager Notifications</p>
                            <p className="text-sm text-muted-foreground">Notify managers when tickets escalate</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Escalation After (minutes)</Label>
                          <Input type="number" defaultValue="30" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-yellow-500" />
                          Agent Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Ticket Assigned</p>
                            <p className="text-sm text-muted-foreground">Notify when a ticket is assigned to you</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Customer Reply</p>
                            <p className="text-sm text-muted-foreground">Notify when customer replies to ticket</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SLA Warning</p>
                            <p className="text-sm text-muted-foreground">Warn before SLA breach</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Ticket Escalated</p>
                            <p className="text-sm text-muted-foreground">Notify when ticket is escalated</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Internal Note Added</p>
                            <p className="text-sm text-muted-foreground">Notify when colleague adds internal note</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          Customer Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Ticket Created Confirmation</p>
                            <p className="text-sm text-muted-foreground">Send confirmation when ticket is created</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Agent Reply Notification</p>
                            <p className="text-sm text-muted-foreground">Notify customer when agent replies</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Ticket Resolved</p>
                            <p className="text-sm text-muted-foreground">Notify when ticket is resolved</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Satisfaction Survey</p>
                            <p className="text-sm text-muted-foreground">Send CSAT survey after resolution</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-purple-500" />
                          Email Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {['Ticket Created', 'Agent Reply', 'Ticket Resolved', 'CSAT Survey', 'SLA Breach Warning'].map(template => (
                            <div key={template} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span>{template}</span>
                              </div>
                              <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">Edit</button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'channels' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="w-5 h-5 text-blue-500" />
                          Email Channel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Support</p>
                            <p className="text-sm text-muted-foreground">Accept tickets via email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Support Email Address</Label>
                            <Input defaultValue="support@freeflow.io" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email Forwarding</Label>
                            <Input placeholder="Forward to..." />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-create Tickets from Email</p>
                            <p className="text-sm text-muted-foreground">Automatically create tickets from incoming emails</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-green-500" />
                          Live Chat
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Live Chat</p>
                            <p className="text-sm text-muted-foreground">Allow customers to chat in real-time</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Chat Widget</p>
                            <p className="text-sm text-muted-foreground">Show chat widget on website</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Business Hours Only</Label>
                          <Select defaultValue="always">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="always">Always Available</SelectItem>
                              <SelectItem value="business">Business Hours Only</SelectItem>
                              <SelectItem value="custom">Custom Schedule</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Convert to Ticket</p>
                            <p className="text-sm text-muted-foreground">Convert chat transcripts to tickets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-purple-500" />
                          Social Media
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Twitter/X', connected: true, handle: '@freeflow_support' },
                            { name: 'Facebook', connected: true, handle: 'FreeFlow Support' },
                            { name: 'Instagram', connected: false, handle: null },
                            { name: 'LinkedIn', connected: false, handle: null }
                          ].map(channel => (
                            <div key={channel.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{channel.name}</p>
                                  {channel.handle && <p className="text-sm text-muted-foreground">{channel.handle}</p>}
                                </div>
                              </div>
                              <Badge variant={channel.connected ? 'default' : 'secondary'}>
                                {channel.connected ? 'Connected' : 'Not Connected'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Phone className="w-5 h-5 text-orange-500" />
                          Phone Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Phone Support</p>
                            <p className="text-sm text-muted-foreground">Accept calls and create tickets</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Support Phone Number</Label>
                            <Input placeholder="+1 (555) 000-0000" disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Call Recording</Label>
                            <Select defaultValue="disabled" disabled>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="disabled">Disabled</SelectItem>
                                <SelectItem value="optional">Optional</SelectItem>
                                <SelectItem value="always">Always</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'automations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="w-5 h-5 text-blue-500" />
                          AI & Automation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">AI Auto-responses</p>
                            <p className="text-sm text-muted-foreground">Use AI to suggest or auto-send responses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Smart Ticket Classification</p>
                            <p className="text-sm text-muted-foreground">AI categorizes and prioritizes tickets</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Sentiment Analysis</p>
                            <p className="text-sm text-muted-foreground">Detect customer sentiment in messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Answer Bot</p>
                            <p className="text-sm text-muted-foreground">AI bot answers common questions</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>AI Confidence Threshold</Label>
                          <div className="flex items-center gap-4">
                            <Input type="range" min="0" max="100" defaultValue="80" className="flex-1" />
                            <span className="text-sm font-medium">80%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-500" />
                          Triggers & Workflows
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Automate actions based on ticket conditions</p>
                        <div className="space-y-3">
                          {[
                            { name: 'Auto-close Resolved Tickets', description: 'Close after 3 days of no response', active: true },
                            { name: 'Priority Escalation', description: 'Escalate high-priority after 1 hour', active: true },
                            { name: 'Tag by Keyword', description: 'Auto-tag based on subject keywords', active: true },
                            { name: 'VIP Customer Routing', description: 'Route VIP customers to senior agents', active: false },
                            { name: 'Merge Duplicate Tickets', description: 'Auto-merge tickets from same customer', active: false }
                          ].map(trigger => (
                            <div key={trigger.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Cpu className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{trigger.name}</p>
                                  <p className="text-sm text-muted-foreground">{trigger.description}</p>
                                </div>
                              </div>
                              <Switch checked={trigger.active} />
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-2 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-orange-300 transition-colors">
                          <Plus className="w-4 h-4 inline-block mr-2" />
                          Create New Trigger
                        </button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-purple-500" />
                          Macros Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Macros</p>
                            <p className="text-sm text-muted-foreground">Allow agents to use quick response templates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Personal Macros</p>
                            <p className="text-sm text-muted-foreground">Allow agents to create personal macros</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Macro Usage Analytics</p>
                            <p className="text-sm text-muted-foreground">Track macro usage and effectiveness</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-blue-500" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly className="font-mono" />
                            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-app.com/webhooks/support" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Rate Limiting</p>
                            <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                          </div>
                          <Input type="number" defaultValue="1000" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-green-500" />
                          Integrations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Slack', description: 'Post ticket updates to Slack channels', connected: true },
                            { name: 'Jira', description: 'Create Jira issues from tickets', connected: true },
                            { name: 'Salesforce', description: 'Sync with Salesforce CRM', connected: false },
                            { name: 'HubSpot', description: 'Connect with HubSpot contacts', connected: false },
                            { name: 'Intercom', description: 'Import conversations from Intercom', connected: false }
                          ].map(integration => (
                            <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Link2 className="w-4 h-4" />
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Badge variant={integration.connected ? 'default' : 'outline'}>
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-500" />
                          Security & Compliance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Require 2FA for all agents</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">IP Whitelisting</p>
                            <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-muted-foreground">Log all agent actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">PII Redaction</p>
                            <p className="text-sm text-muted-foreground">Auto-redact sensitive data in tickets</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Data Retention (days)</Label>
                          <Input type="number" defaultValue="365" className="w-32" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Purge All Tickets</p>
                            <p className="text-sm text-muted-foreground">Permanently delete all closed tickets</p>
                          </div>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Purge
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Reset All Settings</p>
                            <p className="text-sm text-muted-foreground">Reset all support settings to defaults</p>
                          </div>
                          <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Reset
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Export All Data</p>
                            <p className="text-sm text-muted-foreground">Download all tickets and customer data</p>
                          </div>
                          <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                          </button>
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
              insights={mockSupportTicketsAIInsights}
              title="Support Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSupportTicketsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSupportTicketsPredictions}
              title="Ticket Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSupportTicketsActivities}
            title="Support Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockSupportTicketsQuickActions}
            variant="grid"
          />
        </div>

        {/* Create Ticket Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Create a new support ticket for a customer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg resize-none dark:bg-gray-800"
                  rows={4}
                  placeholder="Detailed description of the issue..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as TicketCategory})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature-request">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="account">Account</option>
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as TicketPriority})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Customer Email</Label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={e => setFormData({...formData, customer_email: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg"
              >
                Create Ticket
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Macros Modal */}
        <Dialog open={showMacrosModal} onOpenChange={setShowMacrosModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Insert Macro</DialogTitle>
              <DialogDescription>Select a pre-written response to insert</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {mockMacros.map(macro => (
                  <div
                    key={macro.id}
                    onClick={() => handleUseMacro(macro)}
                    className="p-4 border rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{macro.name}</h4>
                      <Badge variant="secondary">{macro.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{macro.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Customer Profile Modal */}
        <Dialog open={showCustomerModal} onOpenChange={setShowCustomerModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Customer Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={`https://avatar.vercel.sh/${mockCustomer.email}`} />
                  <AvatarFallback>{mockCustomer.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{mockCustomer.name}</h3>
                  <p className="text-muted-foreground">{mockCustomer.company}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{mockCustomer.email}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{mockCustomer.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                  <p className="font-medium">{mockCustomer.totalTickets}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Lifetime Value</p>
                  <p className="font-medium">${mockCustomer.lifetimeValue.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {mockCustomer.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
