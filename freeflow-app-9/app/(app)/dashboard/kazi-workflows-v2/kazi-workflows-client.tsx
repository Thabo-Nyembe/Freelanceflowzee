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
import { useToast } from '@/hooks/use-toast'
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
  Bell,
  GitBranch,
  Loader2,
  FolderOpen,
  Star,
  Globe,
  FileText,
  Users,
  Save
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Types - KaziWorkflow is imported from the hook

interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  execution_time_ms?: number
  error_message?: string
  trigger_type: string
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<KaziWorkflow | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as const,
    category: 'operations'
  })
  const { toast } = useToast()

  // Compute display stats
  const stats: WorkflowStats = useMemo(() => ({
    totalWorkflows: apiStats.totalWorkflows,
    activeWorkflows: apiStats.activeWorkflows,
    totalExecutions: apiStats.totalRuns,
    successRate: apiStats.successRate,
    avgExecutionTime: 2.4, // Would come from real metrics
    timeSaved: `${Math.round(apiStats.totalRuns * 5 / 60)} hours`
  }), [apiStats])

  // Open settings
  const openSettings = useCallback((workflow: KaziWorkflow) => {
    setSelectedWorkflow(workflow)
    setIsSettingsDialogOpen(true)
  }, [])

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

  // Run workflow wrapper
  const runWorkflow = useCallback((id: string) => {
    executeWorkflow(id)
  }, [executeWorkflow])

  // Delete workflow wrapper
  const deleteWorkflow = useCallback((id: string) => {
    removeWorkflow(id)
  }, [removeWorkflow])

  // Handle create workflow
  const handleCreateWorkflow = useCallback(async () => {
    if (!newWorkflow.name) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
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
  }, [newWorkflow, createWorkflow, toast])

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    if (!selectedWorkflow) return
    await updateWorkflow(selectedWorkflow.id, selectedWorkflow)
    setIsSettingsDialogOpen(false)
  }, [selectedWorkflow, updateWorkflow])

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
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
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
                                onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                              />

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runWorkflow(workflow.id)}
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
                                  <DropdownMenuItem onClick={() => openSettings(workflow)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const newWorkflow = { ...workflow, id: `copy-${workflow.id}`, name: `${workflow.name} (Copy)` }
                                    setWorkflows(prev => [...prev, newWorkflow])
                                    toast({ title: 'Duplicated', description: 'Workflow duplicated successfully.' })
                                  }}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setActiveTab('history')}>
                                    <History className="h-4 w-4 mr-2" />
                                    View History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    toast({ title: 'Exported', description: 'Workflow exported to JSON.' })
                                  }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deleteWorkflow(workflow.id)}
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
                        <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                <CardTitle>Execution History</CardTitle>
                <CardDescription>View recent workflow executions and their results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          i % 2 === 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                        )}>
                          {i % 2 === 0 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {mockWorkflows[i % mockWorkflows.length].name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(new Date(Date.now() - i * 3600000).toISOString())}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={cn(
                            "text-sm font-medium",
                            i % 2 === 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {i % 2 === 0 ? 'Success' : 'Failed'}
                          </p>
                          <p className="text-xs text-gray-500">{(Math.random() * 3 + 0.5).toFixed(2)}s</p>
                        </div>
                        <Button size="sm" variant="ghost">
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
                <Input placeholder="e.g., New Client Onboarding" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe what this workflow does..." rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select>
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
                  <Select>
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
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  toast({
                    title: 'Workflow Created',
                    description: 'Opening workflow builder...'
                  })
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                Create & Open Builder
                <ArrowRight className="h-4 w-4 ml-2" />
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
                  <Input defaultValue={selectedWorkflow.name} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea defaultValue={selectedWorkflow.description} rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select defaultValue={selectedWorkflow.trigger_type}>
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
                    <Select defaultValue={selectedWorkflow.category}>
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
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
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
                onClick={() => {
                  setIsSettingsDialogOpen(false)
                  toast({
                    title: 'Settings Saved',
                    description: 'Workflow settings have been updated.'
                  })
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
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
