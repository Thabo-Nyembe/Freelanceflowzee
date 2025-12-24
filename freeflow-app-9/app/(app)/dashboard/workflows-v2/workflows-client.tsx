'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Zap,
  GitBranch,
  Play,
  Pause,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  ArrowRight,
  ArrowDown,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  RefreshCw,
  Trash2,
  Edit,
  Copy,
  Share2,
  Folder,
  Star,
  History,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Calendar,
  Users,
  Globe,
  Webhook,
  Code,
  Link2,
  ExternalLink,
  Layers,
  GitMerge,
  Sparkles,
  Rocket,
  Timer,
  Repeat,
  Shuffle,
  Split,
  Combine
} from 'lucide-react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'filter' | 'delay' | 'branch'
  app: string
  appIcon: string
  name: string
  description: string
  config: Record<string, any>
  position: number
}

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft' | 'error'
  folder?: string
  steps: WorkflowStep[]
  trigger: string
  lastRun?: string
  totalRuns: number
  successRate: number
  avgRunTime: string
  createdAt: string
  updatedAt: string
  owner: string
  isStarred: boolean
  tags: string[]
}

interface WorkflowRun {
  id: string
  workflowId: string
  workflowName: string
  status: 'success' | 'error' | 'running' | 'waiting'
  startedAt: string
  completedAt?: string
  duration: string
  stepsCompleted: number
  totalSteps: number
  error?: string
  dataIn: Record<string, any>
  dataOut: Record<string, any>
}

interface ConnectedApp {
  id: string
  name: string
  icon: string
  category: string
  status: 'connected' | 'expired' | 'error'
  connectedAt: string
  lastUsed: string
  workflows: number
  permissions: string[]
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  apps: string[]
  usageCount: number
  rating: number
  steps: number
  isPremium: boolean
}

interface WorkflowFolder {
  id: string
  name: string
  color: string
  workflowCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Lead to CRM + Slack',
    description: 'When a new form submission comes in, add to CRM and notify sales team',
    status: 'active',
    folder: 'Sales',
    steps: [
      { id: 's1', type: 'trigger', app: 'Typeform', appIcon: '📝', name: 'New Form Response', description: 'Triggers on form submission', config: {}, position: 1 },
      { id: 's2', type: 'action', app: 'HubSpot', appIcon: '🔶', name: 'Create Contact', description: 'Adds contact to CRM', config: {}, position: 2 },
      { id: 's3', type: 'action', app: 'Slack', appIcon: '💬', name: 'Send Message', description: 'Notifies #sales channel', config: {}, position: 3 }
    ],
    trigger: 'Typeform - New Response',
    lastRun: '2024-12-25T10:30:00Z',
    totalRuns: 1247,
    successRate: 99.2,
    avgRunTime: '2.3s',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    owner: 'Sarah Chen',
    isStarred: true,
    tags: ['sales', 'leads', 'automation']
  },
  {
    id: '2',
    name: 'GitHub to Jira Sync',
    description: 'Create Jira tickets from GitHub issues and sync status updates',
    status: 'active',
    folder: 'Engineering',
    steps: [
      { id: 's1', type: 'trigger', app: 'GitHub', appIcon: '🐙', name: 'New Issue', description: 'Triggers on new issue', config: {}, position: 1 },
      { id: 's2', type: 'filter', app: 'Filter', appIcon: '🔍', name: 'Check Labels', description: 'Only bugs and features', config: {}, position: 2 },
      { id: 's3', type: 'action', app: 'Jira', appIcon: '📋', name: 'Create Issue', description: 'Creates Jira ticket', config: {}, position: 3 },
      { id: 's4', type: 'action', app: 'Slack', appIcon: '💬', name: 'Notify Team', description: 'Posts to #dev-tickets', config: {}, position: 4 }
    ],
    trigger: 'GitHub - New Issue',
    lastRun: '2024-12-25T09:45:00Z',
    totalRuns: 892,
    successRate: 98.5,
    avgRunTime: '3.1s',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-12-19T11:20:00Z',
    owner: 'Mike Johnson',
    isStarred: true,
    tags: ['engineering', 'github', 'jira']
  },
  {
    id: '3',
    name: 'Invoice Payment Reminder',
    description: 'Send automated payment reminders for overdue invoices',
    status: 'active',
    folder: 'Finance',
    steps: [
      { id: 's1', type: 'trigger', app: 'Schedule', appIcon: '⏰', name: 'Daily at 9 AM', description: 'Runs every day', config: {}, position: 1 },
      { id: 's2', type: 'action', app: 'Stripe', appIcon: '💳', name: 'Get Overdue', description: 'Fetches overdue invoices', config: {}, position: 2 },
      { id: 's3', type: 'action', app: 'Gmail', appIcon: '📧', name: 'Send Reminder', description: 'Emails customer', config: {}, position: 3 },
      { id: 's4', type: 'action', app: 'Slack', appIcon: '💬', name: 'Log Action', description: 'Logs to #finance', config: {}, position: 4 }
    ],
    trigger: 'Schedule - Daily',
    lastRun: '2024-12-25T09:00:00Z',
    totalRuns: 365,
    successRate: 100,
    avgRunTime: '4.5s',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
    owner: 'Lisa Park',
    isStarred: false,
    tags: ['finance', 'invoices', 'email']
  },
  {
    id: '4',
    name: 'Customer Onboarding',
    description: 'Automated onboarding sequence for new customers',
    status: 'paused',
    folder: 'Customer Success',
    steps: [
      { id: 's1', type: 'trigger', app: 'Stripe', appIcon: '💳', name: 'New Subscription', description: 'Triggers on signup', config: {}, position: 1 },
      { id: 's2', type: 'action', app: 'Intercom', appIcon: '💁', name: 'Create User', description: 'Adds to Intercom', config: {}, position: 2 },
      { id: 's3', type: 'delay', app: 'Delay', appIcon: '⏳', name: 'Wait 1 Day', description: 'Pauses for 24h', config: {}, position: 3 },
      { id: 's4', type: 'action', app: 'Gmail', appIcon: '📧', name: 'Welcome Email', description: 'Sends onboarding guide', config: {}, position: 4 }
    ],
    trigger: 'Stripe - New Subscription',
    lastRun: '2024-12-20T15:30:00Z',
    totalRuns: 456,
    successRate: 97.8,
    avgRunTime: '86400s',
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
    owner: 'Alex Wong',
    isStarred: false,
    tags: ['onboarding', 'customers']
  },
  {
    id: '5',
    name: 'Social Media Scheduler',
    description: 'Cross-post content from blog to social media platforms',
    status: 'error',
    folder: 'Marketing',
    steps: [
      { id: 's1', type: 'trigger', app: 'WordPress', appIcon: '📰', name: 'New Post', description: 'Triggers on publish', config: {}, position: 1 },
      { id: 's2', type: 'action', app: 'Twitter', appIcon: '🐦', name: 'Post Tweet', description: 'Shares to Twitter', config: {}, position: 2 },
      { id: 's3', type: 'action', app: 'LinkedIn', appIcon: '💼', name: 'Share Post', description: 'Shares to LinkedIn', config: {}, position: 3 }
    ],
    trigger: 'WordPress - New Post',
    lastRun: '2024-12-24T14:20:00Z',
    totalRuns: 234,
    successRate: 85.5,
    avgRunTime: '5.2s',
    createdAt: '2024-05-15T14:00:00Z',
    updatedAt: '2024-12-24T14:20:00Z',
    owner: 'Emma Davis',
    isStarred: false,
    tags: ['marketing', 'social']
  }
]

const mockRuns: WorkflowRun[] = [
  { id: 'r1', workflowId: '1', workflowName: 'New Lead to CRM + Slack', status: 'success', startedAt: '2024-12-25T10:30:00Z', completedAt: '2024-12-25T10:30:02Z', duration: '2.1s', stepsCompleted: 3, totalSteps: 3, dataIn: { email: 'lead@example.com' }, dataOut: { contactId: '12345' } },
  { id: 'r2', workflowId: '2', workflowName: 'GitHub to Jira Sync', status: 'success', startedAt: '2024-12-25T09:45:00Z', completedAt: '2024-12-25T09:45:03Z', duration: '3.2s', stepsCompleted: 4, totalSteps: 4, dataIn: { issue: '#456' }, dataOut: { jiraKey: 'DEV-789' } },
  { id: 'r3', workflowId: '3', workflowName: 'Invoice Payment Reminder', status: 'success', startedAt: '2024-12-25T09:00:00Z', completedAt: '2024-12-25T09:00:04Z', duration: '4.5s', stepsCompleted: 4, totalSteps: 4, dataIn: { invoiceCount: 3 }, dataOut: { emailsSent: 3 } },
  { id: 'r4', workflowId: '5', workflowName: 'Social Media Scheduler', status: 'error', startedAt: '2024-12-24T14:20:00Z', duration: '2.8s', stepsCompleted: 1, totalSteps: 3, error: 'Twitter API rate limit exceeded', dataIn: { postTitle: 'New Blog Post' }, dataOut: {} },
  { id: 'r5', workflowId: '1', workflowName: 'New Lead to CRM + Slack', status: 'success', startedAt: '2024-12-25T08:15:00Z', completedAt: '2024-12-25T08:15:02Z', duration: '2.3s', stepsCompleted: 3, totalSteps: 3, dataIn: { email: 'another@example.com' }, dataOut: { contactId: '12346' } },
  { id: 'r6', workflowId: '2', workflowName: 'GitHub to Jira Sync', status: 'running', startedAt: '2024-12-25T10:32:00Z', duration: '0.5s', stepsCompleted: 2, totalSteps: 4, dataIn: { issue: '#457' }, dataOut: {} }
]

const mockApps: ConnectedApp[] = [
  { id: '1', name: 'Slack', icon: '💬', category: 'Communication', status: 'connected', connectedAt: '2024-01-10T08:00:00Z', lastUsed: '2024-12-25T10:30:00Z', workflows: 8, permissions: ['read', 'write', 'channels'] },
  { id: '2', name: 'HubSpot', icon: '🔶', category: 'CRM', status: 'connected', connectedAt: '2024-02-15T10:00:00Z', lastUsed: '2024-12-25T10:30:00Z', workflows: 5, permissions: ['contacts', 'deals'] },
  { id: '3', name: 'GitHub', icon: '🐙', category: 'Developer', status: 'connected', connectedAt: '2024-03-01T09:00:00Z', lastUsed: '2024-12-25T09:45:00Z', workflows: 4, permissions: ['repo', 'issues'] },
  { id: '4', name: 'Gmail', icon: '📧', category: 'Email', status: 'connected', connectedAt: '2024-01-20T11:00:00Z', lastUsed: '2024-12-25T09:00:00Z', workflows: 6, permissions: ['send', 'read'] },
  { id: '5', name: 'Stripe', icon: '💳', category: 'Payments', status: 'connected', connectedAt: '2024-02-01T08:00:00Z', lastUsed: '2024-12-25T09:00:00Z', workflows: 3, permissions: ['invoices', 'subscriptions'] },
  { id: '6', name: 'Twitter', icon: '🐦', category: 'Social', status: 'error', connectedAt: '2024-04-10T14:00:00Z', lastUsed: '2024-12-24T14:20:00Z', workflows: 1, permissions: ['tweet'] },
  { id: '7', name: 'Jira', icon: '📋', category: 'Project Management', status: 'connected', connectedAt: '2024-03-15T10:00:00Z', lastUsed: '2024-12-25T09:45:00Z', workflows: 3, permissions: ['issues', 'projects'] },
  { id: '8', name: 'Google Sheets', icon: '📊', category: 'Productivity', status: 'connected', connectedAt: '2024-01-25T09:00:00Z', lastUsed: '2024-12-23T15:00:00Z', workflows: 7, permissions: ['read', 'write'] }
]

const mockTemplates: WorkflowTemplate[] = [
  { id: '1', name: 'Lead to CRM Pipeline', description: 'Automatically add form leads to your CRM', category: 'Sales', apps: ['Typeform', 'HubSpot', 'Slack'], usageCount: 15420, rating: 4.8, steps: 3, isPremium: false },
  { id: '2', name: 'GitHub Issue Tracker', description: 'Sync GitHub issues with project management', category: 'Engineering', apps: ['GitHub', 'Jira', 'Slack'], usageCount: 12350, rating: 4.7, steps: 4, isPremium: false },
  { id: '3', name: 'Invoice Payment Flow', description: 'Automate invoice reminders and follow-ups', category: 'Finance', apps: ['Stripe', 'Gmail', 'Slack'], usageCount: 8920, rating: 4.6, steps: 4, isPremium: true },
  { id: '4', name: 'Social Media Publisher', description: 'Cross-post content to multiple platforms', category: 'Marketing', apps: ['WordPress', 'Twitter', 'LinkedIn'], usageCount: 21580, rating: 4.5, steps: 3, isPremium: false },
  { id: '5', name: 'Customer Onboarding', description: 'Welcome sequence for new customers', category: 'Customer Success', apps: ['Stripe', 'Intercom', 'Gmail'], usageCount: 9870, rating: 4.9, steps: 5, isPremium: true }
]

const mockFolders: WorkflowFolder[] = [
  { id: '1', name: 'Sales', color: 'blue', workflowCount: 5 },
  { id: '2', name: 'Engineering', color: 'purple', workflowCount: 4 },
  { id: '3', name: 'Finance', color: 'green', workflowCount: 3 },
  { id: '4', name: 'Marketing', color: 'orange', workflowCount: 6 },
  { id: '5', name: 'Customer Success', color: 'pink', workflowCount: 4 }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: Workflow['status']): string => {
  const colors: Record<Workflow['status'], string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status]
}

const getRunStatusColor = (status: WorkflowRun['status']): string => {
  const colors: Record<WorkflowRun['status'], string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    running: 'text-blue-600',
    waiting: 'text-yellow-600'
  }
  return colors[status]
}

const getAppStatusColor = (status: ConnectedApp['status']): string => {
  const colors: Record<ConnectedApp['status'], string> = {
    connected: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    expired: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status]
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

const getStepIcon = (type: WorkflowStep['type']) => {
  const icons: Record<WorkflowStep['type'], React.ReactNode> = {
    trigger: <Zap className="w-4 h-4" />,
    action: <Play className="w-4 h-4" />,
    filter: <Filter className="w-4 h-4" />,
    delay: <Timer className="w-4 h-4" />,
    branch: <GitBranch className="w-4 h-4" />
  }
  return icons[type]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WorkflowsClient() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [folderFilter, setFolderFilter] = useState<string>('all')

  // Stats calculations
  const stats = useMemo(() => {
    const totalWorkflows = mockWorkflows.length
    const activeWorkflows = mockWorkflows.filter(w => w.status === 'active').length
    const totalRuns = mockRuns.length
    const successfulRuns = mockRuns.filter(r => r.status === 'success').length
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0
    const errorWorkflows = mockWorkflows.filter(w => w.status === 'error').length
    const connectedApps = mockApps.filter(a => a.status === 'connected').length
    const tasksSaved = mockWorkflows.reduce((acc, w) => acc + w.totalRuns, 0)

    return {
      totalWorkflows,
      activeWorkflows,
      totalRuns,
      successRate,
      errorWorkflows,
      connectedApps,
      tasksSaved
    }
  }, [])

  // Filtered workflows
  const filteredWorkflows = useMemo(() => {
    return mockWorkflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
      const matchesFolder = folderFilter === 'all' || workflow.folder === folderFilter
      return matchesSearch && matchesStatus && matchesFolder
    })
  }, [searchQuery, statusFilter, folderFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/40 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Workflows</h1>
                <p className="text-sm text-muted-foreground">Zapier-level automation platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Workflows', value: stats.totalWorkflows.toString(), change: 12.5, icon: GitBranch, color: 'from-blue-500 to-cyan-500' },
            { label: 'Active', value: stats.activeWorkflows.toString(), change: 8.3, icon: Play, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Runs', value: stats.totalRuns.toString(), change: 25.0, icon: Activity, color: 'from-purple-500 to-pink-500' },
            { label: 'Success Rate', value: `${stats.successRate.toFixed(1)}%`, change: 2.5, icon: CheckCircle2, color: 'from-emerald-500 to-green-500' },
            { label: 'Errors', value: stats.errorWorkflows.toString(), change: -15.0, icon: AlertCircle, color: 'from-red-500 to-rose-500' },
            { label: 'Connected Apps', value: stats.connectedApps.toString(), change: 10.0, icon: Link2, color: 'from-orange-500 to-amber-500' },
            { label: 'Tasks Saved', value: `${(stats.tasksSaved / 1000).toFixed(1)}K`, change: 35.0, icon: Sparkles, color: 'from-indigo-500 to-purple-500' }
          ].map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="workflows" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="runs" className="gap-2">
              <History className="w-4 h-4" />
              Run History
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <Link2 className="w-4 h-4" />
              Connected Apps
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Layers className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={folderFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFolderFilter('all')}
                >
                  All Folders
                </Button>
                {mockFolders.map((folder) => (
                  <Button
                    key={folder.id}
                    variant={folderFilter === folder.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFolderFilter(folder.name)}
                    className="gap-1"
                  >
                    <Folder className="w-3 h-3" />
                    {folder.name} ({folder.workflowCount})
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {['all', 'active', 'paused', 'error'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedWorkflow(workflow)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 flex items-center justify-center text-2xl">
                          {workflow.steps[0]?.appIcon || '⚡'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{workflow.name}</h3>
                            {workflow.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {workflow.trigger}
                            </span>
                            <span className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {workflow.folder}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={workflow.status === 'active'} />
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Workflow Steps */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                      {workflow.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg min-w-fit">
                            <span className="text-lg">{step.appIcon}</span>
                            <div>
                              <p className="text-xs font-medium">{step.app}</p>
                              <p className="text-xs text-muted-foreground">{step.name}</p>
                            </div>
                          </div>
                          {idx < workflow.steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-muted-foreground mx-2 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xl font-bold">{workflow.totalRuns.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Total Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-600">{workflow.successRate}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{workflow.avgRunTime}</p>
                        <p className="text-xs text-muted-foreground">Avg Run Time</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{workflow.lastRun ? formatTimeAgo(workflow.lastRun) : 'Never'}</p>
                        <p className="text-xs text-muted-foreground">Last Run</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {workflow.tags.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {workflow.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Run History Tab */}
          <TabsContent value="runs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Runs
                </CardTitle>
                <CardDescription>View execution history and logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedRun(run)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${run.status === 'success' ? 'bg-green-500' : run.status === 'error' ? 'bg-red-500' : run.status === 'running' ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'}`} />
                        <div>
                          <p className="font-medium">{run.workflowName}</p>
                          <p className="text-sm text-muted-foreground">
                            {run.stepsCompleted}/{run.totalSteps} steps • {run.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${run.status === 'success' ? 'bg-green-100 text-green-800' : run.status === 'error' ? 'bg-red-100 text-red-800' : run.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {run.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{formatTimeAgo(run.startedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connected Apps Tab */}
          <TabsContent value="apps" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Connected Apps</h2>
                <p className="text-sm text-muted-foreground">Manage your app integrations</p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Connect App
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockApps.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{app.icon}</span>
                        <div>
                          <h3 className="font-semibold">{app.name}</h3>
                          <p className="text-sm text-muted-foreground">{app.category}</p>
                        </div>
                      </div>
                      <Badge className={getAppStatusColor(app.status)}>{app.status}</Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Workflows</span>
                        <span className="font-medium">{app.workflows}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Used</span>
                        <span className="font-medium">{formatTimeAgo(app.lastUsed)}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap mb-4">
                      {app.permissions.map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{perm}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                      {app.status === 'error' && (
                        <Button variant="outline" size="sm" className="text-orange-600">Reconnect</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Workflow Templates</h2>
                <p className="text-sm text-muted-foreground">Start with pre-built automations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{template.category}</Badge>
                      {template.isPremium && <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">Pro</Badge>}
                    </div>

                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                      {template.apps.map((app, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{app}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{template.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{template.usageCount.toLocaleString()} uses</span>
                      <span className="text-muted-foreground">{template.steps} steps</span>
                    </div>

                    <Button className="w-full">Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Run Statistics</CardTitle>
                  <CardDescription>Workflow execution metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Runs Today</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <div className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +12%
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Successful Runs</p>
                      <p className="text-2xl font-bold text-green-600">1,232</p>
                    </div>
                    <div className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +8%
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Failed Runs</p>
                      <p className="text-2xl font-bold text-red-600">15</p>
                    </div>
                    <div className="text-green-600 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      -25%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Saved</CardTitle>
                  <CardDescription>Automation impact analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-5xl font-bold text-orange-500">127h</p>
                    <p className="text-muted-foreground mt-2">Saved this month</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">3,194</p>
                      <p className="text-xs text-muted-foreground">Tasks automated</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">$4.2K</p>
                      <p className="text-xs text-muted-foreground">Cost savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>Configure default behaviors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for workflow errors</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Auto-retry Failed Runs</p>
                    <p className="text-sm text-muted-foreground">Automatically retry failed workflow runs</p>
                  </div>
                  <Switch checked={true} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Run History Retention</p>
                    <p className="text-sm text-muted-foreground">Keep run logs for 30 days</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Webhook Secret</p>
                    <p className="text-sm text-muted-foreground">Secure your incoming webhooks</p>
                  </div>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Workflow Detail Dialog */}
      <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              {selectedWorkflow?.name}
            </DialogTitle>
            <DialogDescription>{selectedWorkflow?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedWorkflow && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(selectedWorkflow.status)}>{selectedWorkflow.status}</Badge>
                  {selectedWorkflow.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  <Badge variant="outline">{selectedWorkflow.folder}</Badge>
                </div>

                {/* Steps */}
                <div>
                  <h3 className="font-semibold mb-4">Workflow Steps</h3>
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 p-4 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{step.appIcon}</span>
                            <div>
                              <p className="font-medium">{step.app}</p>
                              <p className="text-sm text-muted-foreground">{step.name}</p>
                            </div>
                            <Badge variant="outline" className="ml-auto">{step.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {idx < selectedWorkflow.steps.length - 1 && (
                          <div className="absolute left-8 -translate-x-1/2 mt-16">
                            <ArrowDown className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedWorkflow.totalRuns.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Runs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedWorkflow.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedWorkflow.avgRunTime}</p>
                    <p className="text-xs text-muted-foreground">Avg Run Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedWorkflow.lastRun ? formatTimeAgo(selectedWorkflow.lastRun) : 'Never'}</p>
                    <p className="text-xs text-muted-foreground">Last Run</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Workflow
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Run Now
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Run Detail Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Run Details
            </DialogTitle>
            <DialogDescription>{selectedRun?.workflowName}</DialogDescription>
          </DialogHeader>
          {selectedRun && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`${selectedRun.status === 'success' ? 'bg-green-100 text-green-800' : selectedRun.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {selectedRun.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedRun.duration}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Started</p>
                  <p className="font-medium">{new Date(selectedRun.startedAt).toLocaleString()}</p>
                </div>
                {selectedRun.completedAt && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="font-medium">{new Date(selectedRun.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">{selectedRun.stepsCompleted}/{selectedRun.totalSteps} steps</span>
                </div>
                <Progress value={(selectedRun.stepsCompleted / selectedRun.totalSteps) * 100} className="h-2" />
              </div>

              {selectedRun.error && (
                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedRun.error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Input Data</p>
                  <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedRun.dataIn, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Output Data</p>
                  <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedRun.dataOut, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
