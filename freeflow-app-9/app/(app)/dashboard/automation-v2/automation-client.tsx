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
import { Progress } from '@/components/ui/progress'
import {
  Zap,
  Play,
  Pause,
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Webhook,
  Calendar,
  MessageSquare,
  Globe,
  Users,
  BarChart3,
  Copy,
  Trash2,
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
  Key,
  Shield,
  AlertOctagon,
  Sliders,
  Archive,
  Bell,
  Server,
  Network,
  Gauge
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

// Import mock data from centralized adapters



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

// Enhanced Automation Mock Data
const mockAutomationAIInsights = [
  { id: '1', type: 'success' as const, title: 'Automation Efficiency', description: 'Automations saved 124 hours this month. ROI at 340%.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
  { id: '2', type: 'info' as const, title: 'Popular Trigger', description: 'Form submission triggers used most. Consider adding templates.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Insights' },
  { id: '3', type: 'warning' as const, title: 'Failed Runs', description: '5 automations failed in last 24h. Check API connections.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Errors' },
]

const mockAutomationCollaborators = [
  { id: '1', name: 'Automation Lead', avatar: '/avatars/auto.jpg', status: 'online' as const, role: 'Workflows', lastActive: 'Now' },
  { id: '2', name: 'Integration Dev', avatar: '/avatars/int.jpg', status: 'online' as const, role: 'Integrations', lastActive: '5m ago' },
  { id: '3', name: 'Ops Manager', avatar: '/avatars/ops.jpg', status: 'away' as const, role: 'Operations', lastActive: '20m ago' },
]

const mockAutomationPredictions = [
  { id: '1', label: 'Tasks Automated', current: 8450, target: 10000, predicted: 9200, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Success Rate', current: 96, target: 99, predicted: 98, confidence: 82, trend: 'up' as const },
  { id: '3', label: 'Time Saved (hrs)', current: 124, target: 150, predicted: 140, confidence: 78, trend: 'up' as const },
]

const mockAutomationActivities = [
  { id: '1', user: 'Automation Lead', action: 'created', target: 'lead nurturing workflow', timestamp: '30m ago', type: 'success' as const },
  { id: '2', user: 'Integration Dev', action: 'connected', target: 'Salesforce integration', timestamp: '2h ago', type: 'info' as const },
  { id: '3', user: 'Ops Manager', action: 'optimized', target: 'invoice processing flow', timestamp: '1d ago', type: 'info' as const },
]

const mockAutomationQuickActions = [
  { id: '1', label: 'New Workflow', icon: 'GitBranch', shortcut: 'N', action: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Creating workflow...', success: 'Workflow created successfully', error: 'Failed to create workflow' }) },
  { id: '2', label: 'Templates', icon: 'Layers', shortcut: 'T', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading templates...', success: 'Workflow templates gallery opened', error: 'Failed to load templates' }) },
  { id: '3', label: 'Run History', icon: 'History', shortcut: 'H', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading run history...', success: 'Execution history opened', error: 'Failed to load history' }) },
  { id: '4', label: 'Connections', icon: 'Plug', shortcut: 'C', action: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading connections...', success: 'Integration connections opened', error: 'Failed to load connections' }) },
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
  const [settingsTab, setSettingsTab] = useState('general')
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

  // Hook for automation data with CRUD operations
  const {
    automations,
    loading,
    error,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    refetch
  } = useAutomation({
    automationType: automationTypeFilter,
    status: statusFilter
  })
  const displayAutomations = automations.length > 0 ? automations : initialAutomations

  // Form submission loading state
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const handleCreateAutomation = useCallback(async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name for your automation')
      return
    }

    setIsSubmitting(true)
    try {
      await createAutomation({
        automation_name: newName.trim(),
        description: newDescription.trim() || null,
        automation_type: 'trigger' as AutomationType,
        trigger_type: newTriggerType,
        trigger_conditions: {},
        schedule_expression: newTriggerType === 'scheduled' ? newSchedule : null,
        schedule_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        action_type: 'notification',
        action_config: {},
        action_parameters: {},
        status: 'inactive' as AutomationStatus,
        is_enabled: false,
        is_running: false,
        run_count: 0,
        success_count: 0,
        failure_count: 0,
        total_execution_time_ms: 0,
        priority: 'normal',
        retry_enabled: true,
        max_retries: 3,
        retry_count: 0,
        retry_delay_seconds: 60,
        timeout_seconds: 300,
        filters: {},
        conditions: {},
        metadata: {}
      })
      toast.success('Automation Created!', {
        description: `"${newName}" is now ready. Add your first trigger and actions.`
      })
      setShowCreateDialog(false)
      setNewName('')
      setNewDescription('')
      setNewTriggerType('webhook')
      setNewSchedule('0 9 * * *')
      refetch()
    } catch (err) {
      // Error toast is handled by mutation hook
    } finally {
      setIsSubmitting(false)
    }
  }, [newName, newDescription, newTriggerType, newSchedule, createAutomation, refetch])

  const handleUseTemplate = useCallback((template: AutomationTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateDialog(true)
  }, [])

  const handleConnectIntegration = useCallback((integration: Integration) => {
    setSelectedIntegration(integration)
    setShowIntegrationDialog(true)
  }, [])

  const handleToggleAutomation = useCallback(async (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    try {
      await updateAutomation(automation.id, {
        status: newStatus as AutomationStatus,
        is_enabled: newStatus === 'active'
      })
      toast.success(`Automation ${newStatus === 'active' ? 'Activated' : 'Paused'}`, {
        description: `"${automation.automation_name}" is now ${newStatus}`
      })
      refetch()
    } catch (err) {
      // Error toast is handled by mutation hook
    }
  }, [updateAutomation, refetch])

  const handleRunAutomation = useCallback(async (automation: Automation) => {
    try {
      await updateAutomation(automation.id, {
        status: 'running' as AutomationStatus,
        is_running: true,
        last_run_at: new Date().toISOString(),
        run_count: automation.run_count + 1
      })
      toast.success('Running Automation', {
        description: `"${automation.automation_name}" triggered manually`
      })
      // Simulate completion after delay (in real app, this would be async task)
      setTimeout(async () => {
        await updateAutomation(automation.id, {
          status: 'active' as AutomationStatus,
          is_running: false,
          success_count: automation.success_count + 1,
          last_success_at: new Date().toISOString()
        })
        refetch()
      }, 2000)
    } catch (err) {
      // Error toast is handled by mutation hook
    }
  }, [updateAutomation, refetch])

  const handleDuplicateAutomation = useCallback(async (automation: Automation) => {
    try {
      await createAutomation({
        automation_name: `${automation.automation_name} (Copy)`,
        description: automation.description,
        automation_type: automation.automation_type,
        trigger_type: automation.trigger_type,
        trigger_event: automation.trigger_event,
        trigger_conditions: automation.trigger_conditions,
        schedule_type: automation.schedule_type,
        schedule_expression: automation.schedule_expression,
        schedule_timezone: automation.schedule_timezone,
        action_type: automation.action_type,
        action_config: automation.action_config,
        action_parameters: automation.action_parameters,
        status: 'inactive' as AutomationStatus,
        is_enabled: false,
        is_running: false,
        run_count: 0,
        success_count: 0,
        failure_count: 0,
        total_execution_time_ms: 0,
        priority: automation.priority,
        queue_name: automation.queue_name,
        retry_enabled: automation.retry_enabled,
        max_retries: automation.max_retries,
        retry_count: 0,
        retry_delay_seconds: automation.retry_delay_seconds,
        timeout_seconds: automation.timeout_seconds,
        filters: automation.filters,
        conditions: automation.conditions,
        tags: automation.tags,
        category: automation.category,
        metadata: automation.metadata
      })
      toast.success('Automation Duplicated', {
        description: `Copy of "${automation.automation_name}" created`
      })
      refetch()
    } catch (err) {
      // Error toast is handled by mutation hook
    }
  }, [createAutomation, refetch])

  const handleDeleteAutomation = useCallback(async (automation: Automation) => {
    if (!confirm(`Are you sure you want to delete "${automation.automation_name}"?`)) {
      return
    }
    try {
      await deleteAutomation(automation.id)
      toast.success('Automation Deleted', {
        description: `"${automation.automation_name}" has been removed`
      })
      refetch()
    } catch (err) {
      // Error toast is handled by mutation hook
    }
  }, [deleteAutomation, refetch])

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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
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

          {/* Settings Tab - n8n Level Configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'triggers', label: 'Triggers', icon: Webhook },
                        { id: 'executions', label: 'Executions', icon: Play },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'connections', label: 'Connections', icon: Network },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">System Health</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">API Quota</span>
                          <span className="font-medium text-green-600">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Queue Size</span>
                          <span className="font-medium text-blue-600">23 jobs</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Memory</span>
                          <span className="font-medium text-amber-600">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>

                    {/* Environment Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3">Environment</h4>
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Version</span>
                          <Badge variant="outline" className="text-xs">v2.1.0</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Node</span>
                          <span>18.18.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Workers</span>
                          <span>4 active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uptime</span>
                          <span>15d 7h 23m</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-orange-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure your automation platform preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Workspace Name</Label>
                            <Input defaultValue="Production Workspace" placeholder="Enter workspace name" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                                <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                                <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                                <SelectItem value="cet">CET (Central European Time)</SelectItem>
                                <SelectItem value="jst">JST (Japan Standard Time)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="iso">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="iso">ISO 8601 (2024-01-28)</SelectItem>
                                <SelectItem value="us">US Format (01/28/2024)</SelectItem>
                                <SelectItem value="eu">EU Format (28/01/2024)</SelectItem>
                                <SelectItem value="long">Long Format (January 28, 2024)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Language</Label>
                            <Select defaultValue="en">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Auto-save Workflows</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes while editing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Show Workflow Hints</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display helpful tips in the workflow editor</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys and access tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Label className="text-base">API Key</Label>
                              <p className="text-xs text-gray-500">Use this key for programmatic access</p>
                            </div>
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              defaultValue="n8n_api_key_xxxxxxxxxxxxxxxxxxxxx"
                              readOnly
                              className="font-mono"
                            />
                            <Button size="sm" variant="ghost">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Label className="text-base">Webhook URL Base</Label>
                              <p className="text-xs text-gray-500">Base URL for all incoming webhooks</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              defaultValue="https://automation.yourapp.com/webhook/"
                              readOnly
                              className="font-mono"
                            />
                            <Button size="sm" variant="ghost">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Allow External Webhooks</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Accept webhook requests from external sources</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Triggers Settings */}
                {settingsTab === 'triggers' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-blue-600" />
                          Webhook Settings
                        </CardTitle>
                        <CardDescription>Configure incoming webhook behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Request Timeout (seconds)</Label>
                            <Input type="number" defaultValue="30" min="5" max="300" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Payload Size (MB)</Label>
                            <Input type="number" defaultValue="16" min="1" max="100" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Webhook Authentication</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require authentication for webhook endpoints</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">IP Whitelist</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Only accept requests from whitelisted IPs</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Log All Requests</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Store all incoming webhook payloads for debugging</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          Schedule Settings
                        </CardTitle>
                        <CardDescription>Configure scheduled trigger behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Scheduler Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="local">Local Timezone</SelectItem>
                                <SelectItem value="custom">Custom per Workflow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Minimum Interval (minutes)</Label>
                            <Input type="number" defaultValue="1" min="1" max="60" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Skip Missed Executions</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Skip executions that were missed during downtime</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Catch Up Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Run all missed schedules upon restart</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-600" />
                          Polling Triggers
                        </CardTitle>
                        <CardDescription>Configure polling-based triggers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Poll Interval (seconds)</Label>
                            <Input type="number" defaultValue="60" min="10" max="3600" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Concurrent Polls</Label>
                            <Input type="number" defaultValue="10" min="1" max="50" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Deduplication</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prevent processing duplicate items</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Executions Settings */}
                {settingsTab === 'executions' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-green-600" />
                          Execution Settings
                        </CardTitle>
                        <CardDescription>Configure workflow execution behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Timeout (minutes)</Label>
                            <Input type="number" defaultValue="60" min="1" max="1440" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Concurrent Executions</Label>
                            <Input type="number" defaultValue="20" min="1" max="100" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Retry Attempts on Failure</Label>
                            <Select defaultValue="3">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No Retries</SelectItem>
                                <SelectItem value="1">1 Retry</SelectItem>
                                <SelectItem value="3">3 Retries</SelectItem>
                                <SelectItem value="5">5 Retries</SelectItem>
                                <SelectItem value="10">10 Retries</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Retry Delay Strategy</Label>
                            <Select defaultValue="exponential">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Delay</SelectItem>
                                <SelectItem value="linear">Linear Backoff</SelectItem>
                                <SelectItem value="exponential">Exponential Backoff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Error Workflow</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Run a specific workflow when errors occur</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Continue on Error</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Continue execution even if some nodes fail</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="h-5 w-5 text-amber-600" />
                          Execution History
                        </CardTitle>
                        <CardDescription>Configure execution data retention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Execution Data Retention</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="14">14 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                                <SelectItem value="365">1 Year</SelectItem>
                                <SelectItem value="forever">Forever</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Executions to Keep</Label>
                            <Input type="number" defaultValue="10000" min="100" max="1000000" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Save Execution Data</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Store input/output data for each execution</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Save Successful Executions</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep history of successful runs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Prune Data on Success</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Delete execution data after successful completion</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-blue-600" />
                          Rate Limiting
                        </CardTitle>
                        <CardDescription>Configure execution rate limits</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Max Executions per Minute</Label>
                            <Input type="number" defaultValue="100" min="1" max="10000" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Executions per Hour</Label>
                            <Input type="number" defaultValue="1000" min="1" max="100000" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Queue Excess Executions</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Queue requests when rate limit is reached instead of rejecting</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-amber-600" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alert settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Notification Email</Label>
                          <Input type="email" defaultValue="alerts@yourcompany.com" placeholder="Enter email address" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Workflow Failures</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email when a workflow execution fails</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Connection Issues</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email when app connections fail or expire</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Daily Summary</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily execution summary</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Weekly Report</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly automation analytics report</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                          Slack Notifications
                        </CardTitle>
                        <CardDescription>Configure Slack integration for alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Slack Webhook URL</Label>
                          <Input
                            type="password"
                            defaultValue="https://hooks.slack.com/services/xxx"
                            placeholder="Enter Slack webhook URL"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Default Channel</Label>
                          <Input defaultValue="#automation-alerts" placeholder="#channel-name" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Send to Slack</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable Slack notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Error Threshold for Alert</Label>
                          <Select defaultValue="3">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Every Error</SelectItem>
                              <SelectItem value="3">After 3 Consecutive Errors</SelectItem>
                              <SelectItem value="5">After 5 Consecutive Errors</SelectItem>
                              <SelectItem value="10">After 10 Consecutive Errors</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-blue-600" />
                          Webhook Notifications
                        </CardTitle>
                        <CardDescription>Send alerts to custom endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Notification Webhook URL</Label>
                          <Input placeholder="https://your-endpoint.com/webhook" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Enable Webhook Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send execution events to webhook</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="space-y-2">
                          <Label>Events to Send</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                              <Label className="font-normal">Execution Started</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                              <Label className="font-normal">Execution Completed</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked />
                              <Label className="font-normal">Execution Failed</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch />
                              <Label className="font-normal">Workflow Activated</Label>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Connections Settings */}
                {settingsTab === 'connections' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-blue-600" />
                          Connection Management
                        </CardTitle>
                        <CardDescription>Configure app connection settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Auto-refresh OAuth Tokens</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically refresh expired OAuth tokens</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Test Connections on Startup</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Verify all connections when system starts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Encrypt Credentials</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt all stored credentials at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Connection Timeout (seconds)</Label>
                          <Input type="number" defaultValue="30" min="5" max="120" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5 text-green-600" />
                          Credential Storage
                        </CardTitle>
                        <CardDescription>Configure how credentials are stored</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Encryption Key</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              defaultValue="••••••••••••••••••••••••"
                              readOnly
                            />
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Rotate
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Storage Backend</Label>
                          <Select defaultValue="database">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="database">Database (Default)</SelectItem>
                              <SelectItem value="vault">HashiCorp Vault</SelectItem>
                              <SelectItem value="aws">AWS Secrets Manager</SelectItem>
                              <SelectItem value="azure">Azure Key Vault</SelectItem>
                              <SelectItem value="gcp">GCP Secret Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Audit Credential Access</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all credential access for security</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-purple-600" />
                          External Services
                        </CardTitle>
                        <CardDescription>Configure external service connections</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>HTTP Proxy (Optional)</Label>
                          <Input placeholder="http://proxy.example.com:8080" />
                        </div>

                        <div className="space-y-2">
                          <Label>HTTPS Proxy (Optional)</Label>
                          <Input placeholder="https://proxy.example.com:8080" />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Verify SSL Certificates</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Validate SSL certificates for all connections</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-blue-600" />
                          Worker Configuration
                        </CardTitle>
                        <CardDescription>Configure execution workers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Number of Workers</Label>
                            <Input type="number" defaultValue="4" min="1" max="32" />
                          </div>
                          <div className="space-y-2">
                            <Label>Worker Memory Limit (MB)</Label>
                            <Input type="number" defaultValue="512" min="128" max="8192" />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Queue Mode</Label>
                            <Select defaultValue="redis">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="memory">In-Memory</SelectItem>
                                <SelectItem value="redis">Redis</SelectItem>
                                <SelectItem value="rabbitmq">RabbitMQ</SelectItem>
                                <SelectItem value="sqs">AWS SQS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Concurrency Mode</Label>
                            <Select defaultValue="parallel">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sequential">Sequential</SelectItem>
                                <SelectItem value="parallel">Parallel</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Auto-scale Workers</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically adjust worker count based on load</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-green-600" />
                          Debug Settings
                        </CardTitle>
                        <CardDescription>Configure debugging and logging</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Log Level</Label>
                          <Select defaultValue="info">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="error">Error Only</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="debug">Debug</SelectItem>
                              <SelectItem value="verbose">Verbose</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Debug Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable detailed debug logging</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Log to File</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Write logs to local file system</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Include Stack Traces</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Include full stack traces in error logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-purple-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Configure security options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">IP-based Access Control</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Restrict access to specific IP ranges</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label className="text-base">Audit Logging</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all user actions for compliance</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2">
                          <Label>Session Timeout (minutes)</Label>
                          <Input type="number" defaultValue="60" min="5" max="1440" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Clear Execution History</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Delete all execution logs and history</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear History
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Reset All Credentials</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Disconnect all apps and clear credentials</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30">
                            <Lock className="h-4 w-4 mr-2" />
                            Reset Credentials
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Delete All Workflows</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Permanently delete all automations</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <Label className="text-base text-red-700 dark:text-red-400">Factory Reset</Label>
                            <p className="text-sm text-red-600/70 dark:text-red-400/70">Reset everything to default settings</p>
                          </div>
                          <Button variant="destructive">
                            <AlertOctagon className="h-4 w-4 mr-2" />
                            Factory Reset
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
              insights={mockAutomationAIInsights}
              title="Automation Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAutomationCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAutomationPredictions}
              title="Workflow Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAutomationActivities}
            title="Automation Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAutomationQuickActions}
            variant="grid"
          />
        </div>

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
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                onClick={handleCreateAutomation}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Creating...' : 'Create Automation'}
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
                  toast.promise(
                    new Promise(resolve => setTimeout(resolve, 600)),
                    {
                      loading: 'Applying template...',
                      success: `Template Applied! "${selectedTemplate?.name}" has been created`,
                      error: 'Failed to apply template'
                    }
                  )
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
                  toast.promise(
                    new Promise(resolve => setTimeout(resolve, 600)),
                    {
                      loading: 'Connecting integration...',
                      success: `Integration Connected! ${selectedIntegration?.name} is now ready to use`,
                      error: 'Failed to connect integration'
                    }
                  )
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
