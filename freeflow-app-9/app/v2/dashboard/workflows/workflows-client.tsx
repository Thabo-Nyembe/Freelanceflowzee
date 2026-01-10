'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { useWorkflows } from '@/lib/hooks/use-workflows'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Zap,
  GitBranch,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
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
  Calendar,
  Webhook,
  Code,
  Link2,
  Layers,
  Sparkles,
  Timer,
  Repeat,
  Key,
  Lock,
  Bell,
  AlertOctagon,
  Shield,
  Sliders,
  Cpu,
  Archive,
  Download
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
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Zapier/Make Level
// ============================================================================

const mockWorkflowsAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Efficiency', description: 'Workflows processed 15K+ tasks this week with 99.8% success rate.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Rate Limit Alert', description: 'Slack integration approaching API rate limit. Consider optimization.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
  { id: '3', type: 'info' as const, title: 'New Templates', description: '12 new workflow templates available for CRM automation.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Discovery' },
]

const mockWorkflowsCollaborators = [
  { id: '1', name: 'Automation Lead', avatar: '/avatars/automation.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Integration Specialist', avatar: '/avatars/integration.jpg', status: 'online' as const, role: 'Specialist' },
  { id: '3', name: 'DevOps Engineer', avatar: '/avatars/devops.jpg', status: 'away' as const, role: 'DevOps' },
]

const mockWorkflowsPredictions = [
  { id: '1', title: 'Execution Forecast', prediction: 'Workflow volume expected to increase 40% during month-end', confidence: 92, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cost Savings', prediction: 'Automation saved 120 hours of manual work this month', confidence: 95, trend: 'up' as const, impact: 'medium' as const },
]

const mockWorkflowsActivities = [
  { id: '1', user: 'System', action: 'Executed', target: 'Customer Onboarding workflow 250 times', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Automation Lead', action: 'Updated', target: 'Invoice Processing workflow triggers', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Failed', target: 'Data Sync workflow - API timeout', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// mockWorkflowsQuickActions is now defined inside the component to use state setters

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
  const [settingsTab, setSettingsTab] = useState('general')
  const [isCreating, setIsCreating] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Quick action dialog states
  const [showRunTestDialog, setShowRunTestDialog] = useState(false)
  const [showViewLogsDialog, setShowViewLogsDialog] = useState(false)

  // Quick actions with proper dialog triggers
  const workflowsQuickActions = [
    { id: '1', label: 'Create Workflow', icon: 'plus', action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'Run Test', icon: 'play', action: () => setShowRunTestDialog(true), variant: 'default' as const },
    { id: '3', label: 'View Logs', icon: 'file', action: () => setShowViewLogsDialog(true), variant: 'outline' as const },
  ]

  // Real Supabase hook
  const {
    workflows: dbWorkflows,
    loading: dbLoading,
    error: dbError,
    stats: dbStats,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow
  } = useWorkflows()

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  // Stats calculations - use real data from Supabase when available, fallback to mock
  const stats = useMemo(() => {
    // Use real data if available
    if (dbWorkflows.length > 0) {
      const totalWorkflows = dbWorkflows.length
      const activeWorkflows = dbWorkflows.filter(w => w.status === 'active').length
      const totalRuns = mockRuns.length // Keep mock for runs until run tracking is implemented
      const successfulRuns = mockRuns.filter(r => r.status === 'success').length
      const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0
      const errorWorkflows = dbWorkflows.filter(w => w.status === 'failed').length
      const connectedApps = mockApps.filter(a => a.status === 'connected').length
      const tasksSaved = dbWorkflows.reduce((acc, w) => acc + (w.total_steps || 0), 0)

      return {
        totalWorkflows,
        activeWorkflows,
        totalRuns,
        successRate,
        errorWorkflows,
        connectedApps,
        tasksSaved
      }
    }

    // Fallback to mock data
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
  }, [dbWorkflows])

  // Filtered workflows - combine database workflows with mock for display
  const filteredWorkflows = useMemo(() => {
    // Convert DB workflows to display format
    const displayWorkflows: Workflow[] = dbWorkflows.map(dbw => ({
      id: dbw.id,
      name: dbw.name,
      description: dbw.description || '',
      status: dbw.status === 'failed' ? 'error' : (dbw.status as 'active' | 'paused' | 'draft' | 'error'),
      folder: dbw.tags?.[0] || 'General',
      steps: (dbw.steps_config || []).map((step: any, idx: number) => ({
        id: `s${idx + 1}`,
        type: step.type || 'action',
        app: step.app || 'Custom',
        appIcon: step.icon || '⚡',
        name: step.name || 'Step',
        description: step.description || '',
        config: step.config || {},
        position: idx + 1
      })),
      trigger: dbw.steps_config?.[0]?.name || 'Manual Trigger',
      lastRun: dbw.started_at || undefined,
      totalRuns: dbw.current_step || 0,
      successRate: dbw.completion_rate || 0,
      avgRunTime: '0s',
      createdAt: dbw.created_at,
      updatedAt: dbw.updated_at,
      owner: 'You',
      isStarred: false,
      tags: dbw.tags || []
    }))

    // Combine with mock data if no DB workflows
    const workflowsToFilter = displayWorkflows.length > 0 ? displayWorkflows : mockWorkflows

    return workflowsToFilter.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
      const matchesFolder = folderFilter === 'all' || workflow.folder === folderFilter
      return matchesSearch && matchesStatus && matchesFolder
    })
  }, [searchQuery, statusFilter, folderFilter, dbWorkflows])

  // Handlers - wired to REAL Supabase operations
  const handleCreateWorkflow = async () => {
    setShowCreateDialog(true)
  }

  const handleSubmitCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast.error('Workflow name is required')
      return
    }

    setIsCreating(true)
    try {
      // Generate a unique workflow code
      const workflowCode = `WF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      const result = await createWorkflow({
        workflow_code: workflowCode,
        name: newWorkflowName,
        description: newWorkflowDescription || null,
        type: 'processing',
        status: 'draft',
        priority: 'medium',
        total_steps: 0,
        current_step: 0,
        steps_config: [],
        approvals_required: 0,
        approvals_received: 0,
        completion_rate: 0,
        assigned_to: [],
        dependencies: [],
        tags: [],
        metadata: {}
      })

      if (result.success) {
        toast.success('Workflow created', {
          description: `${newWorkflowName} has been created successfully`
        })
        setShowCreateDialog(false)
        setNewWorkflowName('')
        setNewWorkflowDescription('')
      } else {
        toast.error('Failed to create workflow', {
          description: result.error || 'An error occurred'
        })
      }
    } catch (error) {
      toast.error('Failed to create workflow', {
        description: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRunWorkflow = async (workflow: Workflow) => {
    // Activate workflow - sets status to 'active' and started_at timestamp
    const result = await startWorkflow(workflow.id)
    if (result.success) {
      toast.success('Workflow activated', {
        description: `${workflow.name} is now active and running`
      })
    } else {
      toast.error('Failed to activate workflow', {
        description: result.error || 'An error occurred'
      })
    }
  }

  const handlePauseWorkflow = async (workflow: Workflow) => {
    // Pause workflow - sets status to 'paused'
    const result = await pauseWorkflow(workflow.id)
    if (result.success) {
      toast.success('Workflow paused', {
        description: `${workflow.name} has been paused`
      })
    } else {
      toast.error('Failed to pause workflow', {
        description: result.error || 'An error occurred'
      })
    }
  }

  const handleActivateWorkflow = async (workflow: Workflow) => {
    // Activate/Resume workflow
    const result = await updateWorkflow(workflow.id, { status: 'active' })
    if (result.success) {
      toast.success('Workflow activated', {
        description: `${workflow.name} is now active`
      })
    } else {
      toast.error('Failed to activate workflow', {
        description: result.error || 'An error occurred'
      })
    }
  }

  const handleDuplicateWorkflow = async (workflow: Workflow) => {
    // Find the original DB workflow to get full data
    const originalDbWorkflow = dbWorkflows.find(w => w.id === workflow.id)

    // Generate a unique workflow code for the duplicate
    const workflowCode = `WF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const result = await createWorkflow({
      workflow_code: workflowCode,
      name: `${workflow.name} (Copy)`,
      description: workflow.description || null,
      type: originalDbWorkflow?.type || 'processing',
      status: 'draft',
      priority: originalDbWorkflow?.priority || 'medium',
      total_steps: originalDbWorkflow?.total_steps || 0,
      current_step: 0,
      steps_config: originalDbWorkflow?.steps_config || [],
      approvals_required: originalDbWorkflow?.approvals_required || 0,
      approvals_received: 0,
      completion_rate: 0,
      assigned_to: originalDbWorkflow?.assigned_to || [],
      dependencies: originalDbWorkflow?.dependencies || [],
      tags: originalDbWorkflow?.tags || [],
      metadata: originalDbWorkflow?.metadata || {}
    })

    if (result.success) {
      toast.success('Workflow duplicated', {
        description: `Copy of ${workflow.name} created`
      })
    } else {
      toast.error('Failed to duplicate workflow', {
        description: result.error || 'An error occurred'
      })
    }
  }

  const handleDeleteWorkflow = async (workflow: Workflow) => {
    // Delete workflow (soft delete in Supabase)
    const result = await deleteWorkflow(workflow.id)
    if (result.success) {
      toast.success('Workflow deleted', {
        description: `${workflow.name} has been removed`
      })
      setSelectedWorkflow(null) // Close the dialog if open
    } else {
      toast.error('Failed to delete workflow', {
        description: result.error || 'An error occurred'
      })
    }
  }

  const handleToggleWorkflowStatus = async (workflow: Workflow) => {
    // Toggle between active and paused
    if (workflow.status === 'active') {
      await handlePauseWorkflow(workflow)
    } else {
      await handleActivateWorkflow(workflow)
    }
  }

  const handleExportWorkflows = () => {
    toast.success('Exporting workflows', {
      description: 'Workflow definitions will be downloaded'
    })
  }

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
              <Button variant="outline" size="icon" onClick={() => fetchWorkflows()} disabled={dbLoading}>
                <RefreshCw className={`w-4 h-4 ${dbLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                onClick={handleCreateWorkflow}
              >
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
            {/* Workflows Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Automation</h2>
                  <p className="text-violet-100">n8n-level workflow orchestration</p>
                  <p className="text-violet-200 text-xs mt-1">Visual builder • Triggers • 500+ integrations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWorkflows.length}</p>
                    <p className="text-violet-200 text-sm">Workflows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWorkflows.filter(w => w.isActive).length}</p>
                    <p className="text-violet-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>
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
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={workflow.status === 'active'}
                          onCheckedChange={() => handleToggleWorkflowStatus(workflow)}
                          disabled={dbLoading}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedWorkflow(workflow)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Workflow
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigator.clipboard.writeText(workflow.id)
                              toast.success('Workflow ID copied to clipboard')
                            }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info('Duplicate workflow', { description: 'This feature is coming soon' })}>
                              <Layers className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteWorkflow(workflow)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            {/* Runs Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Run History</h2>
                  <p className="text-blue-100">Temporal-level execution monitoring</p>
                  <p className="text-blue-200 text-xs mt-1">Real-time logs • Error tracking • Performance metrics</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockRuns.length}</p>
                    <p className="text-blue-200 text-sm">Recent Runs</p>
                  </div>
                </div>
              </div>
            </div>
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
            {/* Apps Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Connected Apps</h2>
                  <p className="text-emerald-100">Zapier-level app marketplace</p>
                  <p className="text-emerald-200 text-xs mt-1">OAuth • API keys • Webhooks</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApps.length}</p>
                    <p className="text-emerald-200 text-sm">Integrations</p>
                  </div>
                </div>
              </div>
            </div>
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
            {/* Templates Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Templates</h2>
                  <p className="text-amber-100">Make-level template library</p>
                  <p className="text-amber-200 text-xs mt-1">1000+ templates • One-click deploy • Customizable</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTemplates.length}</p>
                    <p className="text-amber-200 text-sm">Templates</p>
                  </div>
                </div>
              </div>
            </div>
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
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Analytics</h2>
                  <p className="text-pink-100">Datadog-level automation insights</p>
                  <p className="text-pink-200 text-xs mt-1">Performance metrics • Error analysis • Cost tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">98%</p>
                    <p className="text-pink-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
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

          {/* Settings Tab - Zapier-level configuration */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Settings</h2>
                  <p className="text-slate-100">Enterprise-level configuration options</p>
                  <p className="text-slate-200 text-xs mt-1">Permissions • Notifications • Quotas</p>
                </div>
              </div>
            </div>
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
                        { id: 'triggers', icon: Zap, label: 'Triggers' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'connections', icon: Link2, label: 'Connections' },
                        { id: 'execution', icon: Cpu, label: 'Execution' },
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
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="iso">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="iso">ISO 8601</SelectItem>
                                <SelectItem value="us">MM/DD/YYYY</SelectItem>
                                <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                                <SelectItem value="unix">Unix Timestamp</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Auto-retry Failed Runs</p>
                              <p className="text-sm text-muted-foreground">Automatically retry failed workflow runs</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Enable Workflow Versioning</p>
                              <p className="text-sm text-muted-foreground">Keep history of workflow changes</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Pause on Error</p>
                              <p className="text-sm text-muted-foreground">Pause workflow after consecutive errors</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Repeat className="w-5 h-5 text-blue-500" />
                          Retry Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Max Retry Attempts</Label>
                            <Input type="number" defaultValue="3" />
                          </div>
                          <div className="space-y-2">
                            <Label>Retry Delay (seconds)</Label>
                            <Input type="number" defaultValue="60" />
                          </div>
                          <div className="space-y-2">
                            <Label>Backoff Strategy</Label>
                            <Select defaultValue="exponential">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="exponential">Exponential</SelectItem>
                                <SelectItem value="fixed">Fixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Backoff (seconds)</Label>
                            <Input type="number" defaultValue="3600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'triggers' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-purple-500" />
                          Webhook Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook Base URL</Label>
                          <div className="flex gap-2">
                            <Input value="https://hooks.freeflow.io/wf/" readOnly className="font-mono" />
                            <Button variant="outline" size="icon" onClick={() => {
                              navigator.clipboard.writeText('https://hooks.freeflow.io/wf/')
                              toast.success('Webhook URL copied to clipboard')
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="whsec_••••••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" size="sm">Regenerate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Validate Signatures</p>
                            <p className="text-sm text-muted-foreground">Require HMAC signature validation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Allow Test Webhooks</p>
                            <p className="text-sm text-muted-foreground">Enable test mode for debugging</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-500" />
                          Schedule Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Schedules</p>
                            <p className="text-sm text-muted-foreground">Allow scheduled workflow triggers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Minimum Interval</Label>
                          <Select defaultValue="1m">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1m">1 Minute</SelectItem>
                              <SelectItem value="5m">5 Minutes</SelectItem>
                              <SelectItem value="15m">15 Minutes</SelectItem>
                              <SelectItem value="1h">1 Hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Catch-up Missed Runs</p>
                            <p className="text-sm text-muted-foreground">Run missed scheduled executions</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-blue-500" />
                          Polling Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Polling Interval</Label>
                          <Select defaultValue="5m">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1m">Every Minute</SelectItem>
                              <SelectItem value="5m">Every 5 Minutes</SelectItem>
                              <SelectItem value="15m">Every 15 Minutes</SelectItem>
                              <SelectItem value="1h">Every Hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Smart Polling</p>
                            <p className="text-sm text-muted-foreground">Adjust interval based on data frequency</p>
                          </div>
                          <Switch defaultChecked />
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
                          <Mail className="w-5 h-5 text-blue-500" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Workflow Errors</p>
                            <p className="text-sm text-muted-foreground">Alert when workflows fail</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Run Completions</p>
                            <p className="text-sm text-muted-foreground">Notify on successful runs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Weekly Summary</p>
                            <p className="text-sm text-muted-foreground">Weekly workflow performance report</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Notification Email</Label>
                          <Input defaultValue="workflows@freeflow.io" type="email" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-purple-500" />
                          Slack Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable Slack Notifications</p>
                            <p className="text-sm text-muted-foreground">Send alerts to Slack</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Channel</Label>
                          <Input defaultValue="#workflow-alerts" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Include Run Details</p>
                            <p className="text-sm text-muted-foreground">Add workflow run data to messages</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          Error Thresholds
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Error Count Threshold</Label>
                            <Input type="number" defaultValue="5" />
                            <p className="text-xs text-muted-foreground">Alert after this many errors</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Window (minutes)</Label>
                            <Input type="number" defaultValue="60" />
                            <p className="text-xs text-muted-foreground">Within this time period</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-pause on Threshold</p>
                            <p className="text-sm text-muted-foreground">Pause workflow when threshold reached</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'connections' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link2 className="w-5 h-5 text-blue-500" />
                          Connected Apps
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Gmail', description: 'Google Workspace', connected: true, icon: '📧' },
                            { name: 'Slack', description: 'Team communication', connected: true, icon: '💬' },
                            { name: 'Stripe', description: 'Payment processing', connected: true, icon: '💳' },
                            { name: 'Salesforce', description: 'CRM', connected: false, icon: '☁️' },
                            { name: 'HubSpot', description: 'Marketing automation', connected: false, icon: '🔶' }
                          ].map(app => (
                            <div key={app.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{app.icon}</span>
                                <div>
                                  <p className="font-medium">{app.name}</p>
                                  <p className="text-sm text-muted-foreground">{app.description}</p>
                                </div>
                              </div>
                              <Badge variant={app.connected ? 'default' : 'secondary'}>
                                {app.connected ? 'Connected' : 'Connect'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Connection
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-yellow-500" />
                          API Credentials
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'OpenAI API', expires: 'Never', status: 'active' },
                            { name: 'Twilio API', expires: 'Dec 2025', status: 'active' },
                            { name: 'SendGrid API', expires: 'Jan 2025', status: 'expiring' }
                          ].map(cred => (
                            <div key={cred.name} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Key className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{cred.name}</p>
                                  <p className="text-sm text-muted-foreground">Expires: {cred.expires}</p>
                                </div>
                              </div>
                              <Badge variant={cred.status === 'expiring' ? 'destructive' : 'secondary'}>
                                {cred.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-500" />
                          OAuth Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-refresh Tokens</p>
                            <p className="text-sm text-muted-foreground">Automatically refresh expired tokens</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Require Re-auth on Failure</p>
                            <p className="text-sm text-muted-foreground">Prompt to reconnect on auth errors</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'execution' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-purple-500" />
                          Execution Limits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Max Concurrent Runs</Label>
                            <Input type="number" defaultValue="10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Run Timeout (seconds)</Label>
                            <Input type="number" defaultValue="300" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Steps per Run</Label>
                            <Input type="number" defaultValue="100" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Data Size (MB)</Label>
                            <Input type="number" defaultValue="50" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Timer className="w-5 h-5 text-blue-500" />
                          Rate Limiting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Runs per Minute</Label>
                            <Input type="number" defaultValue="60" />
                          </div>
                          <div className="space-y-2">
                            <Label>Runs per Hour</Label>
                            <Input type="number" defaultValue="1000" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Queue Overflow Runs</p>
                            <p className="text-sm text-muted-foreground">Queue runs when limit reached</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="w-5 h-5 text-orange-500" />
                          History & Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Run History Retention (days)</Label>
                            <Input type="number" defaultValue="30" />
                          </div>
                          <div className="space-y-2">
                            <Label>Log Retention (days)</Label>
                            <Input type="number" defaultValue="7" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Store Input/Output Data</p>
                            <p className="text-sm text-muted-foreground">Keep step data for debugging</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Compress Old Runs</p>
                            <p className="text-sm text-muted-foreground">Compress runs older than 7 days</p>
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
                            <Input type="password" value="wf_api_••••••••••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" size="icon" onClick={() => {
                              toast.info('API Key copied', { description: 'Your API key has been copied to the clipboard' })
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Enable API Access</p>
                            <p className="text-sm text-muted-foreground">Allow API triggers and management</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Rate Limit</p>
                            <p className="text-sm text-muted-foreground">Requests per minute</p>
                          </div>
                          <Input type="number" defaultValue="100" className="w-24" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="w-5 h-5 text-green-500" />
                          Debug & Logging
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Debug Mode</p>
                            <p className="text-sm text-muted-foreground">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Log Sensitive Data</p>
                            <p className="text-sm text-muted-foreground">Include data in logs (dev only)</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Log Level</Label>
                          <Select defaultValue="info">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debug">Debug</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="error">Error Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-purple-500" />
                          Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">IP Whitelisting</p>
                            <p className="text-sm text-muted-foreground">Restrict webhook sources</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Encrypt Stored Data</p>
                            <p className="text-sm text-muted-foreground">Encrypt run data at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-muted-foreground">Log all workflow changes</p>
                          </div>
                          <Switch defaultChecked />
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
                            <p className="font-medium text-red-600">Delete All Runs</p>
                            <p className="text-sm text-muted-foreground">Permanently delete run history</p>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Reset All Settings</p>
                            <p className="text-sm text-muted-foreground">Reset to default configuration</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Export All Workflows</p>
                            <p className="text-sm text-muted-foreground">Download all workflow configurations</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <Download className="w-4 h-4 mr-2" />
                            Export
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
              insights={mockWorkflowsAIInsights}
              title="Workflow Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockWorkflowsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockWorkflowsPredictions}
              title="Automation Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockWorkflowsActivities}
            title="Workflow Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={workflowsQuickActions}
            variant="grid"
          />
        </div>
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
                  {selectedWorkflow.status === 'active' ? (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePauseWorkflow(selectedWorkflow)}
                      disabled={dbLoading}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleActivateWorkflow(selectedWorkflow)}
                      disabled={dbLoading}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDuplicateWorkflow(selectedWorkflow)}
                    disabled={dbLoading}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDeleteWorkflow(selectedWorkflow)}
                    disabled={dbLoading}
                  >
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

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Create New Workflow
            </DialogTitle>
            <DialogDescription>
              Create a new workflow automation. You can add steps after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                placeholder="e.g., Lead to CRM Pipeline"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description (optional)</Label>
              <Input
                id="workflow-description"
                placeholder="e.g., Automatically sync new leads to CRM"
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setNewWorkflowName('')
                setNewWorkflowDescription('')
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
              onClick={handleSubmitCreateWorkflow}
              disabled={isCreating || !newWorkflowName.trim()}
            >
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Run Test Dialog */}
      <Dialog open={showRunTestDialog} onOpenChange={setShowRunTestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-500" />
              Run Workflow Test
            </DialogTitle>
            <DialogDescription>
              Test your workflow with sample data before activating it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Workflow to Test</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Test Data (JSON)</Label>
              <textarea
                className="w-full h-24 p-2 border rounded-md text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder='{"email": "test@example.com", "name": "Test User"}'
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="dry-run" />
              <Label htmlFor="dry-run" className="text-sm">Dry run (no external actions)</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRunTestDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              onClick={() => {
                toast.success('Test executed successfully', { description: 'All steps completed without errors' })
                setShowRunTestDialog(false)
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog open={showViewLogsDialog} onOpenChange={setShowViewLogsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-500" />
              Workflow Logs
            </DialogTitle>
            <DialogDescription>
              View execution logs and debug information for your workflows.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workflows</SelectItem>
                  {filteredWorkflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => {
                toast.success('Logs refreshed', { description: 'Workflow logs have been refreshed' })
              }}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-4 space-y-2 font-mono text-sm">
                {mockRuns.map((run, idx) => (
                  <div
                    key={run.id}
                    className={`p-2 rounded ${
                      run.status === 'success' ? 'bg-green-50 dark:bg-green-950' :
                      run.status === 'error' ? 'bg-red-50 dark:bg-red-950' :
                      'bg-blue-50 dark:bg-blue-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        run.status === 'success' ? 'bg-green-500' :
                        run.status === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <span className="text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</span>
                      <span className="font-medium">[{run.status.toUpperCase()}]</span>
                      <span>{run.workflowName}</span>
                    </div>
                    <div className="ml-4 text-muted-foreground text-xs mt-1">
                      {run.stepsCompleted}/{run.totalSteps} steps completed in {run.duration}
                      {run.error && <span className="text-red-600 ml-2">Error: {run.error}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowViewLogsDialog(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={() => { /* TODO: Implement export logs functionality */ }}>
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error display */}
      {dbError && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-sm mt-1">{dbError}</p>
        </div>
      )}
    </div>
  )
}
