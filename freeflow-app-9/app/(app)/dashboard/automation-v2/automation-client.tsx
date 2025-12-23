'use client'

import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Zap,
  Play,
  Pause,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Code,
  GitBranch,
  Webhook,
  Calendar,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  Globe,
  FileText,
  Users,
  CreditCard,
  ShoppingCart,
  BarChart3,
  Layers,
  Copy,
  Trash2,
  Edit,
  Eye,
  History,
  TestTube,
  Rocket,
  Star,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Timer,
  Sparkles,
  Puzzle,
  Terminal,
  Lock,
  Unlock,
  Share2
} from 'lucide-react'
import { useAutomation, type Automation, type AutomationType, type AutomationStatus } from '@/lib/hooks/use-automation'

// ============================================================================
// TYPES - ZAPIER/MAKE LEVEL AUTOMATION SYSTEM
// ============================================================================

interface AutomationTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  trigger: string
  actions: string[]
  popularity: number
  usageCount: number
  isNew: boolean
  isPremium: boolean
}

interface Integration {
  id: string
  name: string
  icon: string
  category: string
  description: string
  isConnected: boolean
  isPremium: boolean
  triggers: string[]
  actions: string[]
  authType: 'oauth' | 'api_key' | 'basic' | 'webhook'
}

interface WorkflowStep {
  id: string
  type: 'trigger' | 'action' | 'filter' | 'delay' | 'branch' | 'loop'
  appId: string
  appName: string
  event: string
  config: Record<string, unknown>
  position: { x: number; y: number }
  connections: string[]
}

interface RunLog {
  id: string
  automationId: string
  status: 'success' | 'failed' | 'running' | 'pending'
  startedAt: string
  completedAt?: string
  duration?: number
  stepsExecuted: number
  totalSteps: number
  error?: string
  dataProcessed: number
  triggerData: Record<string, unknown>
}

interface AutomationVersion {
  id: string
  version: number
  createdAt: string
  createdBy: string
  changes: string
  isActive: boolean
}

// ============================================================================
// MOCK DATA - ZAPIER-LEVEL INTEGRATIONS & TEMPLATES
// ============================================================================

const INTEGRATIONS: Integration[] = [
  { id: 'slack', name: 'Slack', icon: '💬', category: 'Communication', description: 'Team messaging platform', isConnected: true, isPremium: false, triggers: ['New message', 'New channel', 'Reaction added'], actions: ['Send message', 'Create channel', 'Add reaction'], authType: 'oauth' },
  { id: 'gmail', name: 'Gmail', icon: '📧', category: 'Email', description: 'Email service by Google', isConnected: true, isPremium: false, triggers: ['New email', 'New attachment', 'Email labeled'], actions: ['Send email', 'Create draft', 'Add label'], authType: 'oauth' },
  { id: 'github', name: 'GitHub', icon: '🐙', category: 'Development', description: 'Code hosting platform', isConnected: true, isPremium: false, triggers: ['New PR', 'New issue', 'Push event'], actions: ['Create issue', 'Comment on PR', 'Merge PR'], authType: 'oauth' },
  { id: 'stripe', name: 'Stripe', icon: '💳', category: 'Payments', description: 'Payment processing', isConnected: true, isPremium: false, triggers: ['New payment', 'Subscription created', 'Refund issued'], actions: ['Create invoice', 'Create customer', 'Issue refund'], authType: 'api_key' },
  { id: 'notion', name: 'Notion', icon: '📝', category: 'Productivity', description: 'All-in-one workspace', isConnected: false, isPremium: false, triggers: ['New page', 'Database updated', 'Comment added'], actions: ['Create page', 'Update database', 'Add comment'], authType: 'oauth' },
  { id: 'airtable', name: 'Airtable', icon: '📊', category: 'Database', description: 'Spreadsheet-database hybrid', isConnected: false, isPremium: false, triggers: ['New record', 'Record updated', 'Record deleted'], actions: ['Create record', 'Update record', 'Delete record'], authType: 'api_key' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'CRM', description: 'Customer relationship management', isConnected: false, isPremium: true, triggers: ['New lead', 'Deal closed', 'Contact updated'], actions: ['Create lead', 'Update opportunity', 'Send email'], authType: 'oauth' },
  { id: 'hubspot', name: 'HubSpot', icon: '🧡', category: 'CRM', description: 'Inbound marketing platform', isConnected: false, isPremium: true, triggers: ['New contact', 'Form submitted', 'Deal created'], actions: ['Create contact', 'Update deal', 'Send email'], authType: 'oauth' },
  { id: 'jira', name: 'Jira', icon: '🎯', category: 'Project Management', description: 'Issue tracking software', isConnected: true, isPremium: false, triggers: ['New issue', 'Issue updated', 'Sprint started'], actions: ['Create issue', 'Update issue', 'Add comment'], authType: 'oauth' },
  { id: 'twilio', name: 'Twilio', icon: '📱', category: 'Communication', description: 'Cloud communications', isConnected: false, isPremium: true, triggers: ['SMS received', 'Call completed', 'Voicemail received'], actions: ['Send SMS', 'Make call', 'Send WhatsApp'], authType: 'api_key' },
  { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'E-commerce', description: 'E-commerce platform', isConnected: false, isPremium: false, triggers: ['New order', 'Product updated', 'Customer created'], actions: ['Create product', 'Update inventory', 'Send notification'], authType: 'oauth' },
  { id: 'google_sheets', name: 'Google Sheets', icon: '📈', category: 'Productivity', description: 'Spreadsheet application', isConnected: true, isPremium: false, triggers: ['New row', 'Row updated', 'New spreadsheet'], actions: ['Add row', 'Update row', 'Create spreadsheet'], authType: 'oauth' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', category: 'Storage', description: 'Cloud file storage', isConnected: false, isPremium: false, triggers: ['New file', 'File updated', 'Folder created'], actions: ['Upload file', 'Create folder', 'Share file'], authType: 'oauth' },
  { id: 'zapier_webhook', name: 'Webhooks', icon: '🔗', category: 'Developer', description: 'Custom HTTP webhooks', isConnected: true, isPremium: false, triggers: ['Catch hook', 'Scheduled trigger'], actions: ['POST request', 'GET request', 'Custom request'], authType: 'webhook' },
  { id: 'openai', name: 'OpenAI', icon: '🤖', category: 'AI', description: 'AI language models', isConnected: true, isPremium: true, triggers: ['None'], actions: ['Generate text', 'Analyze sentiment', 'Translate text'], authType: 'api_key' },
  { id: 'discord', name: 'Discord', icon: '🎮', category: 'Communication', description: 'Community platform', isConnected: false, isPremium: false, triggers: ['New message', 'Member joined', 'Reaction added'], actions: ['Send message', 'Create channel', 'Assign role'], authType: 'oauth' },
]

const TEMPLATES: AutomationTemplate[] = [
  { id: 't1', name: 'New Lead to Slack Alert', description: 'Get notified in Slack when a new lead comes in from any source', category: 'Sales', icon: '💼', trigger: 'New form submission', actions: ['Send Slack message', 'Create CRM contact'], popularity: 98, usageCount: 45230, isNew: false, isPremium: false },
  { id: 't2', name: 'GitHub PR to Jira', description: 'Automatically create Jira tickets from GitHub pull requests', category: 'Development', icon: '🔧', trigger: 'New PR created', actions: ['Create Jira issue', 'Send notification'], popularity: 95, usageCount: 32100, isNew: false, isPremium: false },
  { id: 't3', name: 'Email to Task', description: 'Convert starred emails into tasks automatically', category: 'Productivity', icon: '✅', trigger: 'Email starred', actions: ['Create task', 'Set reminder'], popularity: 92, usageCount: 28500, isNew: false, isPremium: false },
  { id: 't4', name: 'New Order Notifications', description: 'Send SMS and email when new orders arrive', category: 'E-commerce', icon: '🛍️', trigger: 'New Shopify order', actions: ['Send SMS', 'Send email', 'Update spreadsheet'], popularity: 96, usageCount: 51200, isNew: false, isPremium: false },
  { id: 't5', name: 'AI Content Generator', description: 'Generate content ideas using AI and save to Notion', category: 'Marketing', icon: '✨', trigger: 'Daily schedule', actions: ['Generate with OpenAI', 'Create Notion page'], popularity: 89, usageCount: 18900, isNew: true, isPremium: true },
  { id: 't6', name: 'Customer Feedback Loop', description: 'Collect and analyze customer feedback automatically', category: 'Customer Success', icon: '💬', trigger: 'Survey completed', actions: ['Analyze sentiment', 'Create ticket', 'Send follow-up'], popularity: 87, usageCount: 15600, isNew: false, isPremium: false },
  { id: 't7', name: 'Invoice Reminder Workflow', description: 'Automated payment reminders for overdue invoices', category: 'Finance', icon: '💰', trigger: 'Invoice overdue', actions: ['Send reminder email', 'Update CRM', 'Escalate if needed'], popularity: 94, usageCount: 41000, isNew: false, isPremium: false },
  { id: 't8', name: 'Team Standup Bot', description: 'Automate daily standup collection and reporting', category: 'Team', icon: '👥', trigger: 'Daily at 9 AM', actions: ['Send survey', 'Collect responses', 'Post summary'], popularity: 91, usageCount: 22300, isNew: false, isPremium: false },
]

const RUN_LOGS: RunLog[] = [
  { id: 'run1', automationId: 'auto1', status: 'success', startedAt: '2024-01-28T10:30:00Z', completedAt: '2024-01-28T10:30:02Z', duration: 2000, stepsExecuted: 3, totalSteps: 3, dataProcessed: 1, triggerData: { email: 'john@example.com' } },
  { id: 'run2', automationId: 'auto1', status: 'success', startedAt: '2024-01-28T10:25:00Z', completedAt: '2024-01-28T10:25:01Z', duration: 1200, stepsExecuted: 3, totalSteps: 3, dataProcessed: 1, triggerData: { email: 'jane@example.com' } },
  { id: 'run3', automationId: 'auto2', status: 'failed', startedAt: '2024-01-28T10:20:00Z', completedAt: '2024-01-28T10:20:05Z', duration: 5000, stepsExecuted: 2, totalSteps: 4, error: 'API rate limit exceeded', dataProcessed: 0, triggerData: { webhook: 'data_sync' } },
  { id: 'run4', automationId: 'auto3', status: 'running', startedAt: '2024-01-28T10:35:00Z', stepsExecuted: 1, totalSteps: 5, dataProcessed: 15, triggerData: { scheduled: true } },
  { id: 'run5', automationId: 'auto1', status: 'success', startedAt: '2024-01-28T10:15:00Z', completedAt: '2024-01-28T10:15:03Z', duration: 3000, stepsExecuted: 3, totalSteps: 3, dataProcessed: 2, triggerData: { email: 'mike@example.com' } },
]

// ============================================================================
// MAIN COMPONENT - ZAPIER/MAKE LEVEL AUTOMATION
// ============================================================================

export default function AutomationClient({ initialAutomations }: { initialAutomations: Automation[] }) {
  // State Management
  const [activeTab, setActiveTab] = useState('automations')
  const [searchQuery, setSearchQuery] = useState('')
  const [automationTypeFilter, setAutomationTypeFilter] = useState<AutomationType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AutomationTemplate | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [showRunHistory, setShowRunHistory] = useState(false)
  const [showTestMode, setShowTestMode] = useState(false)

  // New automation form state
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newTriggerType, setNewTriggerType] = useState('webhook')
  const [newSchedule, setNewSchedule] = useState('0 9 * * *')

  // Hook for automation data
  const { automations, loading, error } = useAutomation({
    automationType: automationTypeFilter,
    status: statusFilter
  })
  const displayAutomations = automations.length > 0 ? automations : initialAutomations

  // Calculate comprehensive stats
  const stats = useMemo(() => ({
    total: displayAutomations.length,
    active: displayAutomations.filter(a => a.status === 'active').length,
    paused: displayAutomations.filter(a => a.status === 'paused').length,
    totalRuns: displayAutomations.reduce((sum, a) => sum + a.run_count, 0),
    successfulRuns: displayAutomations.reduce((sum, a) => sum + a.success_count, 0),
    failedRuns: displayAutomations.reduce((sum, a) => sum + a.failure_count, 0),
    avgSuccessRate: displayAutomations.length > 0
      ? (displayAutomations.reduce((sum, a) => sum + (a.success_count / (a.run_count || 1) * 100), 0) / displayAutomations.length).toFixed(1)
      : '0',
    totalTimeSaved: displayAutomations.reduce((sum, a) => sum + (a.run_count * 5), 0), // 5 min per run
    connectedApps: INTEGRATIONS.filter(i => i.isConnected).length,
    totalApps: INTEGRATIONS.length
  }), [displayAutomations])

  // Filter automations
  const filteredAutomations = useMemo(() => {
    return displayAutomations.filter(a => {
      const matchesSearch = !searchQuery ||
        a.automation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = automationTypeFilter === 'all' || a.automation_type === automationTypeFilter
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [displayAutomations, searchQuery, automationTypeFilter, statusFilter])

  // Filter templates by category
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t =>
      selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase()
    )
  }, [selectedCategory])

  // Handlers
  const handleCreateAutomation = useCallback(() => {
    if (!newName.trim()) {
      toast.error('Please enter a name for your automation')
      return
    }

    toast.success('Automation Created!', {
      description: `"${newName}" is now ready. Add your first trigger and actions.`
    })
    setShowCreateDialog(false)
    setNewName('')
    setNewDescription('')
  }, [newName])

  const handleUseTemplate = useCallback((template: AutomationTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateDialog(true)
  }, [])

  const handleConnectIntegration = useCallback((integration: Integration) => {
    setSelectedIntegration(integration)
    setShowIntegrationDialog(true)
  }, [])

  const handleToggleAutomation = useCallback((automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    toast.success(`Automation ${newStatus === 'active' ? 'Activated' : 'Paused'}`, {
      description: `"${automation.automation_name}" is now ${newStatus}`
    })
  }, [])

  const handleRunAutomation = useCallback((automation: Automation) => {
    toast.success('Running Automation', {
      description: `"${automation.automation_name}" triggered manually`
    })
  }, [])

  const handleDuplicateAutomation = useCallback((automation: Automation) => {
    toast.success('Automation Duplicated', {
      description: `Copy of "${automation.automation_name}" created`
    })
  }, [])

  const handleDeleteAutomation = useCallback((automation: Automation) => {
    toast.success('Automation Deleted', {
      description: `"${automation.automation_name}" has been removed`
    })
  }, [])

  const handleViewHistory = useCallback((automation: Automation) => {
    setSelectedAutomation(automation)
    setShowRunHistory(true)
  }, [])

  const handleTestAutomation = useCallback((automation: Automation) => {
    setSelectedAutomation(automation)
    setShowTestMode(true)
  }, [])

  // Categories for filter
  const categories = ['all', 'Sales', 'Development', 'Productivity', 'E-commerce', 'Marketing', 'Customer Success', 'Finance', 'Team']

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Automations</h3>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  Zapier Level
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {stats.connectedApps}/{stats.totalApps} Apps
                </Badge>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Automation Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connect apps, automate workflows, save {Math.floor(stats.totalTimeSaved / 60)} hours
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setActiveTab('integrations')}>
              <Puzzle className="h-4 w-4 mr-2" />
              Integrations
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Automations</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRuns.toLocaleString()}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Runs</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.successfulRuns.toLocaleString()}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Successful</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failedRuns}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgSuccessRate}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{Math.floor(stats.totalTimeSaved / 60)}h</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Time Saved</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.connectedApps}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Connected</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="automations" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automations
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Run History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search automations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={automationTypeFilter} onValueChange={(v) => setAutomationTypeFilter(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="trigger">Trigger-based</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="conditional">Conditional</SelectItem>
                      <SelectItem value="event">Event-driven</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Automations List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-r-transparent" />
              </div>
            ) : filteredAutomations.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Automations Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create your first automation or use a template to get started
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('templates')}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAutomations.map(automation => (
                  <Card key={automation.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={automation.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : automation.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}>
                              {automation.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {automation.status === 'running' && <Activity className="h-3 w-3 mr-1 animate-pulse" />}
                              {automation.status}
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                              {automation.automation_type}
                            </Badge>
                            <Badge variant="outline" className="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400">
                              <Webhook className="h-3 w-3 mr-1" />
                              {automation.trigger_type}
                            </Badge>
                            {automation.is_enabled && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <Unlock className="h-3 w-3 mr-1" />
                                Enabled
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold mb-1">{automation.automation_name}</h3>
                          {automation.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{automation.description}</p>
                          )}

                          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Play className="h-4 w-4" />
                              {automation.run_count} runs
                            </span>
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              {automation.success_count} success
                            </span>
                            {automation.failure_count > 0 && (
                              <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                {automation.failure_count} failed
                              </span>
                            )}
                            {automation.avg_execution_time_ms && (
                              <span className="flex items-center gap-1">
                                <Timer className="h-4 w-4" />
                                {automation.avg_execution_time_ms}ms avg
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          {automation.run_count > 0 && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-600">
                                {((automation.success_count / automation.run_count) * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-500">success rate</div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleAutomation(automation)}
                            >
                              {automation.status === 'active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRunAutomation(automation)}
                            >
                              <Rocket className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTestAutomation(automation)}
                            >
                              <TestTube className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewHistory(automation)}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicateAutomation(automation)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteAutomation(automation)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'bg-orange-600 hover:bg-orange-700' : ''}
                >
                  {cat === 'all' ? 'All Templates' : cat}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleUseTemplate(template)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{template.icon}</div>
                      <div className="flex items-center gap-2">
                        {template.isNew && (
                          <Badge className="bg-blue-100 text-blue-700">New</Badge>
                        )}
                        {template.isPremium && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2 group-hover:text-orange-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {template.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {template.popularity}% popular
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {template.usageCount.toLocaleString()} uses
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="text-xs">{template.trigger}</Badge>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <Badge variant="outline" className="text-xs">{template.actions.length} actions</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Connected vs Available */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Connected Integrations */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Connected ({INTEGRATIONS.filter(i => i.isConnected).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {INTEGRATIONS.filter(i => i.isConnected).map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <div className="font-medium">{integration.name}</div>
                          <div className="text-xs text-gray-500">{integration.category}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Available Integrations */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Puzzle className="h-5 w-5 text-gray-600" />
                    Available ({INTEGRATIONS.filter(i => !i.isConnected).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {INTEGRATIONS.filter(i => !i.isConnected).map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {integration.name}
                            {integration.isPremium && (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">Premium</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{integration.category}</div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleConnectIntegration(integration)}>
                        Connect
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Run History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Recent Runs</CardTitle>
                <CardDescription>View execution history for all automations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RUN_LOGS.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {log.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {log.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                        {log.status === 'running' && <Activity className="h-5 w-5 text-blue-600 animate-pulse" />}
                        {log.status === 'pending' && <Clock className="h-5 w-5 text-gray-400" />}

                        <div>
                          <div className="font-medium">Automation Run</div>
                          <div className="text-sm text-gray-500">
                            {new Date(log.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{log.stepsExecuted}/{log.totalSteps}</div>
                          <div className="text-xs text-gray-500">Steps</div>
                        </div>
                        {log.duration && (
                          <div className="text-center">
                            <div className="font-medium">{log.duration}ms</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                        )}
                        <Badge className={log.status === 'success' ? 'bg-green-100 text-green-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Execution Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <BarChart3 className="h-12 w-12" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Success Rate Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <TrendingUp className="h-12 w-12" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Time Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold text-orange-600 mb-2">
                      {Math.floor(stats.totalTimeSaved / 60)}h
                    </div>
                    <div className="text-gray-500">Total time saved this month</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Based on {stats.totalRuns.toLocaleString()} automated tasks
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Automation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Create New Automation
              </DialogTitle>
              <DialogDescription>
                Build a custom workflow to automate your tasks
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., New Lead to Slack"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this automation does..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <Select value={newTriggerType} onValueChange={setNewTriggerType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webhook">Webhook (HTTP Request)</SelectItem>
                    <SelectItem value="schedule">Schedule (Cron)</SelectItem>
                    <SelectItem value="event">Event (App Trigger)</SelectItem>
                    <SelectItem value="manual">Manual (Button)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newTriggerType === 'schedule' && (
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                  <Input
                    id="schedule"
                    placeholder="0 9 * * *"
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">e.g., "0 9 * * *" = Every day at 9 AM</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                onClick={handleCreateAutomation}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedTemplate?.icon}</span>
                {selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Badge>Trigger</Badge>
                  <span>{selectedTemplate?.trigger}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Actions</Badge>
                  <span>{selectedTemplate?.actions.join(' → ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{selectedTemplate?.usageCount.toLocaleString()} people use this</span>
                <span>{selectedTemplate?.popularity}% success rate</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                onClick={() => {
                  toast.success('Template Applied!', {
                    description: `"${selectedTemplate?.name}" has been created`
                  })
                  setShowTemplateDialog(false)
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedIntegration?.icon}</span>
                Connect {selectedIntegration?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedIntegration?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div className="font-medium mb-2">Available Triggers</div>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration?.triggers.map(t => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                <div className="font-medium mb-2">Available Actions</div>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration?.actions.map(a => (
                    <Badge key={a} variant="outline">{a}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Authentication: {selectedIntegration?.authType === 'oauth' ? 'Sign in with ' + selectedIntegration?.name : selectedIntegration?.authType === 'api_key' ? 'API Key required' : 'Webhook URL'}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                onClick={() => {
                  toast.success('Integration Connected!', {
                    description: `${selectedIntegration?.name} is now ready to use`
                  })
                  setShowIntegrationDialog(false)
                }}
              >
                <Puzzle className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
