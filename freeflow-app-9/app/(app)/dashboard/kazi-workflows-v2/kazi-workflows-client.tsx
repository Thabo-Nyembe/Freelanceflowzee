'use client'

/**
 * Kazi Workflows V2 - Client Component
 *
 * A comprehensive workflow automation dashboard for creating,
 * managing, and monitoring automated business processes.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useKaziWorkflows, Workflow as KaziWorkflow } from '@/hooks/use-kazi-workflows'
import {
  Workflow as WorkflowIcon,
  Play,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  Zap,
  Webhook,
  CheckCircle2,
  XCircle,
  Settings,
  Download,
  Upload,
  History,
  PlayCircle,
  Timer,
  Activity,
  Target,
  Sparkles,
  ArrowRight,
  Loader2,
  FolderOpen,
  Star,
  FileText,
  Users,
  Save,
  Archive,
  RotateCcw,
  AlertTriangle,
  Share2,
  RefreshCw,
  StopCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'

// Types - KaziWorkflow is imported from the hook

interface WorkflowExecution {
  id: string
  workflow_id: string
  workflow_name: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  execution_time_ms?: number
  error_message?: string
  trigger_type: string
  actions_completed: number
  actions_total: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  trigger_type: string
  actions: any[]
  usage_count: number
  tags: string[]
}

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  successRate: number
  avgExecutionTime: number
  timeSaved: string
}

// Mock data for demo
const mockWorkflows: KaziWorkflow[] = [
  {
    id: '1',
    name: 'New Client Onboarding',
    description: 'Automatically welcome new clients and set up initial tasks',
    trigger_type: 'event',
    trigger_config: { event_type: 'client.created' },
    actions: [
      { type: 'email', name: 'Welcome Email' },
      { type: 'create-task', name: 'Schedule Call' },
      { type: 'notification', name: 'Notify Team' }
    ],
    is_active: true,
    run_count: 156,
    success_rate: 98.7,
    last_run_at: new Date(Date.now() - 3600000).toISOString(),
    category: 'sales',
    tags: ['client', 'onboarding'],
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Invoice Reminder',
    description: 'Send reminders for overdue invoices',
    trigger_type: 'schedule',
    trigger_config: { frequency: 'daily', time: '09:00' },
    actions: [
      { type: 'condition', name: 'Check Due Date' },
      { type: 'email', name: 'Send Reminder' }
    ],
    is_active: true,
    run_count: 89,
    success_rate: 100,
    last_run_at: new Date(Date.now() - 7200000).toISOString(),
    next_run_at: new Date(Date.now() + 36000000).toISOString(),
    category: 'finance',
    tags: ['invoice', 'reminder'],
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '3',
    name: 'Project Milestone Notification',
    description: 'Notify stakeholders when project milestones are reached',
    trigger_type: 'event',
    trigger_config: { event_type: 'milestone.completed' },
    actions: [
      { type: 'email', name: 'Notify Client' },
      { type: 'slack-message', name: 'Team Update' },
      { type: 'update-record', name: 'Update Status' }
    ],
    is_active: true,
    run_count: 34,
    success_rate: 94.1,
    last_run_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'operations',
    tags: ['project', 'milestone'],
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: '4',
    name: 'Weekly Report Generation',
    description: 'Generate and send weekly performance reports',
    trigger_type: 'schedule',
    trigger_config: { frequency: 'weekly', day: 1, time: '08:00' },
    actions: [
      { type: 'api-call', name: 'Fetch Data' },
      { type: 'create-task', name: 'Review Report' },
      { type: 'email', name: 'Send Report' }
    ],
    is_active: false,
    run_count: 12,
    success_rate: 91.7,
    last_run_at: new Date(Date.now() - 604800000).toISOString(),
    category: 'operations',
    tags: ['report', 'weekly'],
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString()
  }
]

const mockTemplates: WorkflowTemplate[] = [
  {
    id: 't1',
    name: 'Client Welcome Series',
    description: 'Automated email series for new clients',
    category: 'sales',
    icon: 'Users',
    trigger_type: 'event',
    actions: [],
    usage_count: 1250,
    tags: ['popular', 'email']
  },
  {
    id: 't2',
    name: 'Project Kickoff',
    description: 'Set up tasks and notifications for new projects',
    category: 'operations',
    icon: 'FolderOpen',
    trigger_type: 'event',
    actions: [],
    usage_count: 890,
    tags: ['project']
  },
  {
    id: 't3',
    name: 'Payment Follow-up',
    description: 'Automated payment reminders and escalation',
    category: 'finance',
    icon: 'FileText',
    trigger_type: 'schedule',
    actions: [],
    usage_count: 756,
    tags: ['invoice', 'payment']
  },
  {
    id: 't4',
    name: 'Lead Nurturing',
    description: 'Engage leads with targeted content',
    category: 'marketing',
    icon: 'Target',
    trigger_type: 'schedule',
    actions: [],
    usage_count: 634,
    tags: ['leads', 'marketing']
  }
]

const mockExecutionHistory: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflow_id: '1',
    workflow_name: 'New Client Onboarding',
    status: 'success',
    started_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3598000).toISOString(),
    execution_time_ms: 2000,
    trigger_type: 'event',
    actions_completed: 3,
    actions_total: 3
  },
  {
    id: 'exec-2',
    workflow_id: '2',
    workflow_name: 'Invoice Reminder',
    status: 'success',
    started_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 7197500).toISOString(),
    execution_time_ms: 2500,
    trigger_type: 'schedule',
    actions_completed: 2,
    actions_total: 2
  },
  {
    id: 'exec-3',
    workflow_id: '3',
    workflow_name: 'Project Milestone Notification',
    status: 'failed',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86398000).toISOString(),
    execution_time_ms: 2000,
    error_message: 'Failed to send Slack message: Channel not found',
    trigger_type: 'event',
    actions_completed: 1,
    actions_total: 3
  },
  {
    id: 'exec-4',
    workflow_id: '1',
    workflow_name: 'New Client Onboarding',
    status: 'success',
    started_at: new Date(Date.now() - 172800000).toISOString(),
    completed_at: new Date(Date.now() - 172797000).toISOString(),
    execution_time_ms: 3000,
    trigger_type: 'event',
    actions_completed: 3,
    actions_total: 3
  },
  {
    id: 'exec-5',
    workflow_id: '4',
    workflow_name: 'Weekly Report Generation',
    status: 'cancelled',
    started_at: new Date(Date.now() - 604800000).toISOString(),
    trigger_type: 'schedule',
    actions_completed: 1,
    actions_total: 3
  }
]

const mockStats: WorkflowStats = {
  totalWorkflows: 24,
  activeWorkflows: 18,
  totalExecutions: 3456,
  successRate: 97.2,
  avgExecutionTime: 2.4,
  timeSaved: '127 hours'
}

// Trigger icons
const triggerIcons: Record<string, React.ReactNode> = {
  manual: <Play className="h-4 w-4" />,
  schedule: <Clock className="h-4 w-4" />,
  webhook: <Webhook className="h-4 w-4" />,
  event: <Zap className="h-4 w-4" />
}

const triggerColors: Record<string, string> = {
  manual: 'bg-green-500',
  schedule: 'bg-blue-500',
  webhook: 'bg-purple-500',
  event: 'bg-amber-500'
}

// Category colors
const categoryColors: Record<string, string> = {
  sales: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  operations: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  finance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  support: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  hr: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  custom: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
}

// Execution status colors
const executionStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  running: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  failed: 'bg-red-100 text-red-600',
  cancelled: 'bg-amber-100 text-amber-600'
}

export default function KaziWorkflowsClient() {
  // Use the Kazi Workflows hook with mock data fallback
  const {
    workflows,
    stats: apiStats,
    isLoading,
    runningWorkflows,
    runWorkflow: executeWorkflow,
    toggleWorkflow: toggleWorkflowStatus,
    deleteWorkflow: removeWorkflow,
    duplicateWorkflow,
    createWorkflow,
    updateWorkflow
  } = useKaziWorkflows({ useMockData: true })

  const [templates] = useState<WorkflowTemplate[]>(mockTemplates)
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>(mockExecutionHistory)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<KaziWorkflow | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isExecutionDetailsDialogOpen, setIsExecutionDetailsDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isGlobalSettingsDialogOpen, setIsGlobalSettingsDialogOpen] = useState(false)

  // Form states
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as const,
    category: 'operations'
  })
  const [duplicateName, setDuplicateName] = useState('')
  const [exportFormat, setExportFormat] = useState('json')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [globalSettings, setGlobalSettings] = useState({
    notifications: true,
    autoRetry: true,
    retryAttempts: 3,
    timeout: 30,
    logging: true
  })

  // Compute display stats
  const stats: WorkflowStats = useMemo(() => ({
    totalWorkflows: apiStats.totalWorkflows,
    activeWorkflows: apiStats.activeWorkflows,
    totalExecutions: apiStats.totalRuns,
    successRate: apiStats.successRate,
    avgExecutionTime: 2.4, // Would come from real metrics
    timeSaved: `${Math.round(apiStats.totalRuns * 5 / 60)} hours`
  }), [apiStats])

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && workflow.status === 'active') ||
      (filterStatus === 'inactive' && workflow.status !== 'active')

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Get workflow execution history
  const getWorkflowHistory = useCallback((workflowId: string) => {
    return executionHistory.filter(exec => exec.workflow_id === workflowId)
  }, [executionHistory])

  // Open settings
  const openSettings = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsSettingsDialogOpen(true)
  }, [])

  // Open edit dialog
  const openEditDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsEditDialogOpen(true)
  }, [])

  // Open run dialog
  const openRunDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsRunDialogOpen(true)
  }, [])

  // Open history dialog
  const openHistoryDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsHistoryDialogOpen(true)
  }, [])

  // Open export dialog
  const openExportDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsExportDialogOpen(true)
  }, [])

  // Open duplicate dialog
  const openDuplicateDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setDuplicateName(`${workflow.name} (Copy)`)
    setIsDuplicateDialogOpen(true)
  }, [])

  // Open archive dialog
  const openArchiveDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsArchiveDialogOpen(true)
  }, [])

  // Open delete dialog
  const openDeleteDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsDeleteDialogOpen(true)
  }, [])

  // Open template dialog
  const openTemplateDialog = useCallback((template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    setIsTemplateDialogOpen(true)
  }, [])

  // Open execution details dialog
  const openExecutionDetailsDialog = useCallback((execution: WorkflowExecution) => {
    setSelectedExecution(execution)
    setIsExecutionDetailsDialogOpen(true)
  }, [])

  // Open share dialog
  const openShareDialog = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setShareEmail('')
    setIsShareDialogOpen(true)
  }, [])

  // Run workflow wrapper
  const runWorkflow = useCallback((id: string) => {
    executeWorkflow(id)
    toast.success('Workflow started', {
      description: 'The workflow is now running.'
    })
  }, [executeWorkflow])

  // Handle run workflow from dialog
  const handleRunWorkflow = useCallback(() => {
    if (!selectedWorkflow) return
    executeWorkflow(selectedWorkflow.id)
    setIsRunDialogOpen(false)
    toast.success('Workflow started', {
      description: `"${selectedWorkflow.name}" is now running.`
    })
  }, [selectedWorkflow, executeWorkflow])

  // Delete workflow wrapper
  const handleDeleteWorkflow = useCallback(() => {
    if (!selectedWorkflow) return
    removeWorkflow(selectedWorkflow.id)
    setIsDeleteDialogOpen(false)
    toast.success('Workflow deleted', {
      description: `"${selectedWorkflow.name}" has been deleted.`
    })
  }, [selectedWorkflow, removeWorkflow])

  // Handle create workflow
  const handleCreateWorkflow = useCallback(async () => {
    if (!newWorkflow.name) {
      toast.error('Validation error', {
        description: 'Workflow name is required.'
      })
      return
    }
    await createWorkflow({
      name: newWorkflow.name,
      description: newWorkflow.description,
      trigger_type: newWorkflow.trigger_type,
      category: newWorkflow.category,
      status: 'draft'
    })
    setIsCreateDialogOpen(false)
    setNewWorkflow({ name: '', description: '', trigger_type: 'manual', category: 'operations' })
    toast.success('Workflow created', {
      description: 'Opening workflow builder...'
    })
  }, [newWorkflow, createWorkflow])

  // Handle edit workflow
  const handleEditWorkflow = useCallback(async () => {
    if (!selectedWorkflow) return
    await updateWorkflow(selectedWorkflow.id, selectedWorkflow)
    setIsEditDialogOpen(false)
    toast.success('Workflow updated', {
      description: 'Your changes have been saved.'
    })
  }, [selectedWorkflow, updateWorkflow])

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    if (!selectedWorkflow) return
    await updateWorkflow(selectedWorkflow.id, selectedWorkflow)
    setIsSettingsDialogOpen(false)
    toast.success('Settings saved', {
      description: 'Workflow settings have been updated.'
    })
  }, [selectedWorkflow, updateWorkflow])

  // Handle export
  const handleExport = useCallback(() => {
    if (!selectedWorkflow) return
    const exportData = {
      ...selectedWorkflow,
      exportedAt: new Date().toISOString(),
      format: exportFormat
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedWorkflow.name.toLowerCase().replace(/\s+/g, '-')}-workflow.${exportFormat}`
    a.click()
    URL.revokeObjectURL(url)
    setIsExportDialogOpen(false)
    toast.success('Workflow exported', {
      description: `Exported as ${exportFormat.toUpperCase()} file.`
    })
  }, [selectedWorkflow, exportFormat])

  // Handle import
  const handleImport = useCallback(async () => {
    if (!importFile) {
      toast.error('No file selected', {
        description: 'Please select a workflow file to import.'
      })
      return
    }
    try {
      const text = await importFile.text()
      const data = JSON.parse(text)
      await createWorkflow({
        name: data.name || 'Imported Workflow',
        description: data.description || '',
        trigger_type: data.trigger_type || 'manual',
        category: data.category || 'custom',
        status: 'draft'
      })
      setIsImportDialogOpen(false)
      setImportFile(null)
      toast.success('Workflow imported', {
        description: `"${data.name}" has been imported successfully.`
      })
    } catch (error) {
      toast.error('Import failed', {
        description: 'Invalid workflow file format.'
      })
    }
  }, [importFile, createWorkflow])

  // Handle duplicate
  const handleDuplicate = useCallback(() => {
    if (!selectedWorkflow) return
    duplicateWorkflow(selectedWorkflow.id)
    setIsDuplicateDialogOpen(false)
    toast.success('Workflow duplicated', {
      description: `"${duplicateName}" has been created.`
    })
  }, [selectedWorkflow, duplicateName, duplicateWorkflow])

  // Handle archive
  const handleArchive = useCallback(async () => {
    if (!selectedWorkflow) return
    await updateWorkflow(selectedWorkflow.id, { ...selectedWorkflow, status: 'archived' as any })
    setIsArchiveDialogOpen(false)
    toast.success('Workflow archived', {
      description: `"${selectedWorkflow.name}" has been archived.`
    })
  }, [selectedWorkflow, updateWorkflow])

  // Handle use template
  const handleUseTemplate = useCallback(async () => {
    if (!selectedTemplate) return
    await createWorkflow({
      name: `${selectedTemplate.name} (New)`,
      description: selectedTemplate.description,
      trigger_type: selectedTemplate.trigger_type as any,
      category: selectedTemplate.category,
      status: 'draft'
    })
    setIsTemplateDialogOpen(false)
    toast.success('Workflow created from template', {
      description: 'Opening workflow builder...'
    })
  }, [selectedTemplate, createWorkflow])

  // Handle share
  const handleShare = useCallback(() => {
    if (!selectedWorkflow || !shareEmail) {
      toast.error('Missing information', {
        description: 'Please enter an email address.'
      })
      return
    }
    // Simulate sharing
    setIsShareDialogOpen(false)
    toast.success('Workflow shared', {
      description: `Invitation sent to ${shareEmail}.`
    })
  }, [selectedWorkflow, shareEmail])

  // Handle save global settings
  const handleSaveGlobalSettings = useCallback(() => {
    setIsGlobalSettingsDialogOpen(false)
    toast.success('Global settings saved', {
      description: 'Your workflow preferences have been updated.'
    })
  }, [globalSettings])

  // Handle retry execution
  const handleRetryExecution = useCallback((execution: WorkflowExecution) => {
    setIsExecutionDetailsDialogOpen(false)
    executeWorkflow(execution.workflow_id)
    toast.success('Workflow restarted', {
      description: `Retrying "${execution.workflow_name}".`
    })
  }, [executeWorkflow])

  // Handle refresh workflows
  const handleRefreshWorkflows = useCallback(() => {
    toast.success('Workflows refreshed', {
      description: 'All workflow data has been updated.'
    })
  }, [])

  // Format time ago
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                <WorkflowIcon className="h-6 w-6" />
              </div>
              Kazi Workflows
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Automate your business processes with powerful workflows
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshWorkflows}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGlobalSettingsDialogOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <WorkflowIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkflows}</p>
                  <p className="text-xs text-gray-500">Total Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeWorkflows}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalExecutions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Executions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgExecutionTime}s</p>
                  <p className="text-xs text-gray-500">Avg. Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.timeSaved}</p>
                  <p className="text-xs text-gray-500">Time Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="workflows" className="gap-2">
                <WorkflowIcon className="h-4 w-4" />
                My Workflows
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {activeTab === 'workflows' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white dark:bg-gray-800"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4 mt-0">
            {filteredWorkflows.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <WorkflowIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No workflows found</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    {searchQuery
                      ? `No workflows match "${searchQuery}". Try a different search term.`
                      : 'Get started by creating your first workflow or using a template.'}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setActiveTab('templates')}>
                      Browse Templates
                    </Button>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredWorkflows.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {/* Trigger Icon */}
                            <div className={cn(
                              "p-3 rounded-xl text-white",
                              triggerColors[workflow.trigger_type]
                            )}>
                              {triggerIcons[workflow.trigger_type]}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {workflow.name}
                                </h3>
                                <Badge className={cn("text-xs", categoryColors[workflow.category])}>
                                  {workflow.category}
                                </Badge>
                                {workflow.status === "active" ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {workflow.description}
                              </p>

                              {/* Actions Preview */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">Actions:</span>
                                <div className="flex items-center gap-1">
                                  {workflow.actions.slice(0, 4).map((action, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs py-0.5"
                                    >
                                      {action.name}
                                    </Badge>
                                  ))}
                                  {workflow.actions.length > 4 && (
                                    <span className="text-xs text-gray-400">
                                      +{workflow.actions.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats & Actions */}
                          <div className="flex items-center gap-6">
                            {/* Stats */}
                            <div className="hidden md:flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {workflow.run_count}
                                </p>
                                <p className="text-xs text-gray-500">Runs</p>
                              </div>
                              <div className="text-center">
                                <p className={cn(
                                  "text-lg font-semibold",
                                  workflow.success_rate >= 95 ? "text-green-600" :
                                  workflow.success_rate >= 80 ? "text-amber-600" : "text-red-600"
                                )}>
                                  {workflow.success_rate}%
                                </p>
                                <p className="text-xs text-gray-500">Success</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {formatTimeAgo(workflow.last_run_at)}
                                </p>
                                <p className="text-xs text-gray-500">Last Run</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={workflow.status === "active"}
                                onCheckedChange={() => {
                                  toggleWorkflowStatus(workflow.id)
                                  toast.success(workflow.status === 'active' ? 'Workflow paused' : 'Workflow activated', {
                                    description: `"${workflow.name}" has been ${workflow.status === 'active' ? 'paused' : 'activated'}.`
                                  })
                                }}
                              />

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRunDialog(workflow)}
                                disabled={runningWorkflows.has(workflow.id)}
                                title="Run Now"
                              >
                                {runningWorkflows.has(workflow.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openSettings(workflow)}
                                title="Settings"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditDialog(workflow)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openDuplicateDialog(workflow)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openHistoryDialog(workflow)}>
                                    <History className="h-4 w-4 mr-2" />
                                    View History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openExportDialog(workflow)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openShareDialog(workflow)}>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openArchiveDialog(workflow)}>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => openDeleteDialog(workflow)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                          {template.icon === 'Users' && <Users className="h-5 w-5" />}
                          {template.icon === 'FolderOpen' && <FolderOpen className="h-5 w-5" />}
                          {template.icon === 'FileText' && <FileText className="h-5 w-5" />}
                          {template.icon === 'Target' && <Target className="h-5 w-5" />}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {template.usage_count.toLocaleString()} uses
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1 rounded",
                            triggerColors[template.trigger_type]
                          )}>
                            {triggerIcons[template.trigger_type]}
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {template.trigger_type} trigger
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openTemplateDialog(template)}
                        >
                          Use Template
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Execution History</CardTitle>
                    <CardDescription>View recent workflow executions and their results</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast.success('History refreshed', {
                      description: 'Execution history has been updated.'
                    })
                  }}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executionHistory.map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => openExecutionDetailsDialog(execution)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          executionStatusColors[execution.status]
                        )}>
                          {execution.status === 'success' && <CheckCircle2 className="h-5 w-5" />}
                          {execution.status === 'failed' && <XCircle className="h-5 w-5" />}
                          {execution.status === 'running' && <Loader2 className="h-5 w-5 animate-spin" />}
                          {execution.status === 'pending' && <Clock className="h-5 w-5" />}
                          {execution.status === 'cancelled' && <StopCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {execution.workflow_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(execution.started_at)} - {execution.actions_completed}/{execution.actions_total} actions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={cn(
                            "text-sm font-medium capitalize",
                            execution.status === 'success' ? "text-green-600" :
                            execution.status === 'failed' ? "text-red-600" :
                            execution.status === 'cancelled' ? "text-amber-600" : "text-blue-600"
                          )}>
                            {execution.status}
                          </p>
                          <p className="text-xs text-gray-500">{formatDuration(execution.execution_time_ms)}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={(e) => {
                          e.stopPropagation()
                          openExecutionDetailsDialog(execution)
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Workflow Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Set up a new automated workflow for your business processes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  placeholder="e.g., New Client Onboarding"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what this workflow does..."
                  rows={3}
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select
                    value={newWorkflow.trigger_type}
                    onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, trigger_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">
                        <div className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Manual Trigger
                        </div>
                      </SelectItem>
                      <SelectItem value="schedule">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Schedule
                        </div>
                      </SelectItem>
                      <SelectItem value="webhook">
                        <div className="flex items-center gap-2">
                          <Webhook className="h-4 w-4" />
                          Webhook
                        </div>
                      </SelectItem>
                      <SelectItem value="event">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Event
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newWorkflow.category}
                    onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateWorkflow}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                Create & Open Builder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Workflow Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Workflow
              </DialogTitle>
              <DialogDescription>
                Modify the workflow details and configuration
              </DialogDescription>
            </DialogHeader>

            {selectedWorkflow && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input
                    value={selectedWorkflow.name}
                    onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedWorkflow.description || ''}
                    onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select
                      value={selectedWorkflow.trigger_type}
                      onValueChange={(value) => setSelectedWorkflow(prev => prev ? { ...prev, trigger_type: value as any } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Trigger</SelectItem>
                        <SelectItem value="schedule">Schedule</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={selectedWorkflow.category}
                      onValueChange={(value) => setSelectedWorkflow(prev => prev ? { ...prev, category: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Actions ({selectedWorkflow.actions.length})</Label>
                  <div className="space-y-2">
                    {selectedWorkflow.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <WorkflowIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{action.name}</p>
                          <p className="text-xs text-gray-500">{action.type}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => {
                          toast.info(`Editing: ${action.name}`, {
                            description: `Configure ${action.type} settings and parameters`
                          })
                        }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      toast.info('Add Workflow Action', {
                        description: 'Select from: Send Email, HTTP Request, Transform Data, Conditional Branch, Delay'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditWorkflow} className="bg-gradient-to-r from-indigo-500 to-purple-600">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run Workflow Dialog */}
        <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-green-600" />
                Run Workflow
              </DialogTitle>
              <DialogDescription>
                Execute "{selectedWorkflow?.name}" manually
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Ready to execute</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      This workflow will execute {selectedWorkflow?.actions.length || 0} actions.
                    </p>
                  </div>
                </div>
              </div>

              {selectedWorkflow && (
                <div className="space-y-2">
                  <Label>Actions to be executed:</Label>
                  <div className="space-y-1">
                    {selectedWorkflow.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {action.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRunDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRunWorkflow} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workflow History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Execution History
              </DialogTitle>
              <DialogDescription>
                Recent executions for "{selectedWorkflow?.name}"
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {selectedWorkflow && getWorkflowHistory(selectedWorkflow.id).length > 0 ? (
                  getWorkflowHistory(selectedWorkflow.id).map((execution) => (
                    <div
                      key={execution.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded",
                          executionStatusColors[execution.status]
                        )}>
                          {execution.status === 'success' && <CheckCircle2 className="h-4 w-4" />}
                          {execution.status === 'failed' && <XCircle className="h-4 w-4" />}
                          {execution.status === 'cancelled' && <StopCircle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {execution.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(execution.started_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {execution.actions_completed}/{execution.actions_total} actions
                        </p>
                        <p className="text-xs text-gray-500">{formatDuration(execution.execution_time_ms)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No execution history found for this workflow.
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Workflow
              </DialogTitle>
              <DialogDescription>
                Export "{selectedWorkflow?.name}" to a file
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The exported file will include all workflow configuration, actions, and settings.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Workflow
              </DialogTitle>
              <DialogDescription>
                Import a workflow from a JSON or YAML file
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Select File</Label>
                <Input
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
              </div>

              {importFile && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">{importFile.name}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsImportDialogOpen(false)
                setImportFile(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importFile}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5" />
                Duplicate Workflow
              </DialogTitle>
              <DialogDescription>
                Create a copy of "{selectedWorkflow?.name}"
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>New Workflow Name</Label>
                <Input
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  placeholder="Enter a name for the copy"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDuplicate} disabled={!duplicateName}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5 text-amber-600" />
                Archive Workflow
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to archive "{selectedWorkflow?.name}"?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">This workflow will be archived</p>
                    <p className="text-sm text-amber-700 dark:text-amber-200">
                      Archived workflows are hidden from the main list but can be restored later.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleArchive} className="bg-amber-600 hover:bg-amber-700">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Workflow
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedWorkflow?.name}"?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">This action cannot be undone</p>
                    <p className="text-sm text-red-700 dark:text-red-200">
                      The workflow and all its execution history will be permanently deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteWorkflow} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Use Template
              </DialogTitle>
              <DialogDescription>
                Create a new workflow from "{selectedTemplate?.name}"
              </DialogDescription>
            </DialogHeader>

            {selectedTemplate && (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <h4 className="font-medium text-indigo-900 dark:text-indigo-100">{selectedTemplate.name}</h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-200 mt-1">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary">{selectedTemplate.category}</Badge>
                    <span className="text-xs text-indigo-600 dark:text-indigo-300">
                      {selectedTemplate.usage_count.toLocaleString()} uses
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUseTemplate} className="bg-gradient-to-r from-indigo-500 to-purple-600">
                Use This Template
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Execution Details Dialog */}
        <Dialog open={isExecutionDetailsDialogOpen} onOpenChange={setIsExecutionDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Execution Details
              </DialogTitle>
              <DialogDescription>
                {selectedExecution?.workflow_name} - {formatTimeAgo(selectedExecution?.started_at)}
              </DialogDescription>
            </DialogHeader>

            {selectedExecution && (
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge className={executionStatusColors[selectedExecution.status]}>
                      {selectedExecution.status}
                    </Badge>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDuration(selectedExecution.execution_time_ms)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Actions Completed</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedExecution.actions_completed} / {selectedExecution.actions_total}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Trigger</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {selectedExecution.trigger_type}
                    </p>
                  </div>
                </div>

                {selectedExecution.status === 'success' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Progress value={100} className="h-2 bg-green-200" />
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                      All actions completed successfully
                    </p>
                  </div>
                )}

                {selectedExecution.error_message && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                        <p className="text-sm text-red-700 dark:text-red-200">
                          {selectedExecution.error_message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExecutionDetailsDialogOpen(false)}>
                Close
              </Button>
              {selectedExecution?.status === 'failed' && (
                <Button onClick={() => handleRetryExecution(selectedExecution)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Workflow
              </DialogTitle>
              <DialogDescription>
                Share "{selectedWorkflow?.name}" with team members
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The recipient will receive an email with access to view and run this workflow.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={!shareEmail}>
                <Share2 className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workflow Settings
              </DialogTitle>
              <DialogDescription>
                Configure settings for "{selectedWorkflow?.name}"
              </DialogDescription>
            </DialogHeader>

            {selectedWorkflow && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input
                    value={selectedWorkflow.name}
                    onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedWorkflow.description || ''}
                    onChange={(e) => setSelectedWorkflow(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select
                      value={selectedWorkflow.trigger_type}
                      onValueChange={(value) => setSelectedWorkflow(prev => prev ? { ...prev, trigger_type: value as any } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            Manual Trigger
                          </div>
                        </SelectItem>
                        <SelectItem value="schedule">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Schedule
                          </div>
                        </SelectItem>
                        <SelectItem value="webhook">
                          <div className="flex items-center gap-2">
                            <Webhook className="h-4 w-4" />
                            Webhook
                          </div>
                        </SelectItem>
                        <SelectItem value="event">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Event
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={selectedWorkflow.category}
                      onValueChange={(value) => setSelectedWorkflow(prev => prev ? { ...prev, category: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedWorkflow.trigger_type === 'schedule' && (
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                  </div>
                )}

                {selectedWorkflow.trigger_type === 'event' && (
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select defaultValue={selectedWorkflow.trigger_config?.event_type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client.created">Client Created</SelectItem>
                        <SelectItem value="project.created">Project Created</SelectItem>
                        <SelectItem value="project.completed">Project Completed</SelectItem>
                        <SelectItem value="task.created">Task Created</SelectItem>
                        <SelectItem value="task.completed">Task Completed</SelectItem>
                        <SelectItem value="invoice.created">Invoice Created</SelectItem>
                        <SelectItem value="invoice.paid">Invoice Paid</SelectItem>
                        <SelectItem value="milestone.completed">Milestone Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Actions ({selectedWorkflow.actions.length})</Label>
                  <div className="space-y-2">
                    {selectedWorkflow.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <WorkflowIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{action.name}</p>
                          <p className="text-xs text-gray-500">{action.type}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => {
                          toast.info(`Editing: ${action.name}`, {
                            description: `Configure ${action.type} settings and parameters`
                          })
                        }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      toast.info('Add Workflow Action', {
                        description: 'Select from: Send Email, HTTP Request, Transform Data, Conditional Branch, Delay'
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Workflow Status</p>
                    <p className="text-sm text-gray-500">Enable or disable this workflow</p>
                  </div>
                  <Switch
                    checked={selectedWorkflow.status === "active"}
                    onCheckedChange={() => {
                      toggleWorkflowStatus(selectedWorkflow.id)
                      setSelectedWorkflow(prev => prev ? { ...prev, status: prev.status === "active" ? "paused" : "active" } : null)
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedWorkflow.run_count}</p>
                    <p className="text-xs text-gray-500">Total Runs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedWorkflow.success_rate}%</p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedWorkflow.last_run_at ? new Date(selectedWorkflow.last_run_at).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="text-xs text-gray-500">Last Run</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Global Settings Dialog */}
        <Dialog open={isGlobalSettingsDialogOpen} onOpenChange={setIsGlobalSettingsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Workflow Settings
              </DialogTitle>
              <DialogDescription>
                Configure default settings for all workflows
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications for workflow events</p>
                </div>
                <Switch
                  checked={globalSettings.notifications}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Auto-Retry on Failure</p>
                  <p className="text-sm text-gray-500">Automatically retry failed workflows</p>
                </div>
                <Switch
                  checked={globalSettings.autoRetry}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, autoRetry: checked }))}
                />
              </div>

              {globalSettings.autoRetry && (
                <div className="space-y-2">
                  <Label>Retry Attempts</Label>
                  <Select
                    value={String(globalSettings.retryAttempts)}
                    onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, retryAttempts: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="2">2 attempts</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Default Timeout (seconds)</Label>
                <Select
                  value={String(globalSettings.timeout)}
                  onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, timeout: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="120">120 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Detailed Logging</p>
                  <p className="text-sm text-gray-500">Log detailed execution information</p>
                </div>
                <Switch
                  checked={globalSettings.logging}
                  onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, logging: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGlobalSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGlobalSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
