'use client'

/**
 * Kazi Workflows V2 - Client Component
 *
 * A comprehensive workflow automation dashboard for creating,
 * managing, and monitoring automated business processes.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Workflow,
  Play,
  Pause,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  Zap,
  Webhook,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Upload,
  History,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Timer,
  Activity,
  Target,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Database,
  Mail,
  Bell,
  GitBranch,
  Loader2,
  FolderOpen,
  Star,
  Globe,
  FileText,
  Users
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

// Types
interface KaziWorkflow {
  id: string
  name: string
  description: string
  trigger_type: 'manual' | 'schedule' | 'webhook' | 'event'
  trigger_config: any
  actions: any[]
  is_active: boolean
  run_count: number
  success_rate: number
  last_run_at?: string
  next_run_at?: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

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
  const [workflows, setWorkflows] = useState<KaziWorkflow[]>(mockWorkflows)
  const [templates] = useState<WorkflowTemplate[]>(mockTemplates)
  const [stats] = useState<WorkflowStats>(mockStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<KaziWorkflow | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && workflow.is_active) ||
      (filterStatus === 'inactive' && !workflow.is_active)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Toggle workflow status
  const toggleWorkflowStatus = useCallback(async (workflowId: string) => {
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId ? { ...w, is_active: !w.is_active } : w
    ))
    toast({
      title: 'Workflow Updated',
      description: 'Workflow status has been updated successfully.'
    })
  }, [toast])

  // Run workflow
  const runWorkflow = useCallback(async (workflowId: string) => {
    setRunningWorkflows(prev => new Set(prev).add(workflowId))
    toast({
      title: 'Workflow Started',
      description: 'The workflow is now running...'
    })

    // Simulate execution
    setTimeout(() => {
      setRunningWorkflows(prev => {
        const newSet = new Set(prev)
        newSet.delete(workflowId)
        return newSet
      })
      setWorkflows(prev => prev.map(w =>
        w.id === workflowId
          ? { ...w, run_count: w.run_count + 1, last_run_at: new Date().toISOString() }
          : w
      ))
      toast({
        title: 'Workflow Completed',
        description: 'The workflow executed successfully.'
      })
    }, 2000)
  }, [toast])

  // Delete workflow
  const deleteWorkflow = useCallback(async (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId))
    toast({
      title: 'Workflow Deleted',
      description: 'The workflow has been deleted.'
    })
  }, [toast])

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
                <Workflow className="h-6 w-6" />
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
                  <Workflow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                <Workflow className="h-4 w-4" />
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
                    <Workflow className="h-8 w-8 text-gray-400" />
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
                                {workflow.is_active ? (
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
                                checked={workflow.is_active}
                                onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                              />

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runWorkflow(workflow.id)}
                                disabled={runningWorkflows.has(workflow.id)}
                              >
                                {runningWorkflows.has(workflow.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <History className="h-4 w-4 mr-2" />
                                    View History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
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
      </div>
    </div>
  )
}
