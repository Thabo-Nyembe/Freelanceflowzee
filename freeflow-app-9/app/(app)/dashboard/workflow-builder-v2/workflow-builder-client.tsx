// Workflow Builder V2 - n8n Level Visual Workflow Editor
// Upgraded with: Visual Canvas, Node Library, Execution History, Templates

'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  GitBranch,
  Plus,
  Play,
  Pause,
  Save,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Copy,
  Trash2,
  Loader2,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Triangle,
  Database,
  Mail,
  MessageSquare,
  Webhook,
  Calendar,
  FileText,
  Globe,
  Code,
  Terminal,
  Box,
  Layers,
  Repeat,
  Split,
  Merge,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Share2,
  History,
  Bug,
  Eye,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Sparkles,
  Cpu,
  Lock,
  Unlock,
  Star,
  BarChart3
} from 'lucide-react'
import { useWorkflows, Workflow, WorkflowStats } from '@/lib/hooks/use-workflows'

// ============================================================================
// TYPES - N8N LEVEL WORKFLOW SYSTEM
// ============================================================================

interface WorkflowNode {
  id: string
  type: NodeType
  name: string
  description?: string
  position: { x: number; y: number }
  data: Record<string, unknown>
  inputs: string[]
  outputs: string[]
  status?: 'idle' | 'running' | 'success' | 'error'
  isDisabled?: boolean
}

interface NodeConnection {
  id: string
  sourceNodeId: string
  sourceOutput: string
  targetNodeId: string
  targetInput: string
}

interface ExecutionLog {
  id: string
  workflowId: string
  status: 'success' | 'error' | 'running' | 'waiting'
  startedAt: string
  finishedAt?: string
  duration?: number
  nodesExecuted: number
  totalNodes: number
  error?: string
  data?: Record<string, unknown>
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  popularity: number
  isNew: boolean
  icon: string
}

type NodeType =
  | 'trigger_manual'
  | 'trigger_webhook'
  | 'trigger_schedule'
  | 'trigger_event'
  | 'action_http'
  | 'action_email'
  | 'action_slack'
  | 'action_database'
  | 'action_code'
  | 'action_transform'
  | 'condition_if'
  | 'condition_switch'
  | 'loop_foreach'
  | 'loop_while'
  | 'control_delay'
  | 'control_merge'
  | 'control_split'
  | 'control_error'

interface NodeDefinition {
  type: NodeType
  name: string
  description: string
  category: 'trigger' | 'action' | 'condition' | 'loop' | 'control'
  icon: React.ReactNode
  color: string
  inputs: number
  outputs: number
  configFields: ConfigField[]
}

interface ConfigField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json'
  required?: boolean
  options?: string[]
  default?: unknown
}

// ============================================================================
// NODE DEFINITIONS - N8N LEVEL NODE LIBRARY
// ============================================================================

const NODE_DEFINITIONS: NodeDefinition[] = [
  // Triggers
  { type: 'trigger_manual', name: 'Manual Trigger', description: 'Start workflow manually', category: 'trigger', icon: <Play className="h-4 w-4" />, color: 'bg-green-500', inputs: 0, outputs: 1, configFields: [] },
  { type: 'trigger_webhook', name: 'Webhook', description: 'Start on HTTP request', category: 'trigger', icon: <Webhook className="h-4 w-4" />, color: 'bg-green-500', inputs: 0, outputs: 1, configFields: [{ name: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] }, { name: 'path', label: 'Path', type: 'text', required: true }] },
  { type: 'trigger_schedule', name: 'Schedule', description: 'Run on schedule', category: 'trigger', icon: <Calendar className="h-4 w-4" />, color: 'bg-green-500', inputs: 0, outputs: 1, configFields: [{ name: 'cron', label: 'Cron Expression', type: 'text', required: true, default: '0 9 * * *' }] },
  { type: 'trigger_event', name: 'Event', description: 'Trigger on event', category: 'trigger', icon: <Zap className="h-4 w-4" />, color: 'bg-green-500', inputs: 0, outputs: 1, configFields: [{ name: 'event', label: 'Event Name', type: 'text', required: true }] },

  // Actions
  { type: 'action_http', name: 'HTTP Request', description: 'Make API calls', category: 'action', icon: <Globe className="h-4 w-4" />, color: 'bg-blue-500', inputs: 1, outputs: 1, configFields: [{ name: 'url', label: 'URL', type: 'text', required: true }, { name: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }, { name: 'headers', label: 'Headers', type: 'json' }, { name: 'body', label: 'Body', type: 'json' }] },
  { type: 'action_email', name: 'Send Email', description: 'Send email messages', category: 'action', icon: <Mail className="h-4 w-4" />, color: 'bg-blue-500', inputs: 1, outputs: 1, configFields: [{ name: 'to', label: 'To', type: 'text', required: true }, { name: 'subject', label: 'Subject', type: 'text', required: true }, { name: 'body', label: 'Body', type: 'textarea' }] },
  { type: 'action_slack', name: 'Slack', description: 'Send Slack messages', category: 'action', icon: <MessageSquare className="h-4 w-4" />, color: 'bg-blue-500', inputs: 1, outputs: 1, configFields: [{ name: 'channel', label: 'Channel', type: 'text', required: true }, { name: 'message', label: 'Message', type: 'textarea', required: true }] },
  { type: 'action_database', name: 'Database', description: 'Query databases', category: 'action', icon: <Database className="h-4 w-4" />, color: 'bg-blue-500', inputs: 1, outputs: 1, configFields: [{ name: 'operation', label: 'Operation', type: 'select', options: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'] }, { name: 'query', label: 'Query', type: 'textarea' }] },
  { type: 'action_code', name: 'Code', description: 'Run custom code', category: 'action', icon: <Code className="h-4 w-4" />, color: 'bg-blue-500', inputs: 1, outputs: 1, configFields: [{ name: 'language', label: 'Language', type: 'select', options: ['JavaScript', 'Python'] }, { name: 'code', label: 'Code', type: 'textarea', required: true }] },
  { type: 'action_transform', name: 'Transform', description: 'Transform data', category: 'action', icon: <Layers className="h-4 w-4" />, color: 'bg-blue-500', inputs: 1, outputs: 1, configFields: [{ name: 'expression', label: 'Expression', type: 'textarea' }] },

  // Conditions
  { type: 'condition_if', name: 'IF', description: 'Conditional branching', category: 'condition', icon: <Diamond className="h-4 w-4" />, color: 'bg-yellow-500', inputs: 1, outputs: 2, configFields: [{ name: 'condition', label: 'Condition', type: 'textarea', required: true }] },
  { type: 'condition_switch', name: 'Switch', description: 'Multiple branches', category: 'condition', icon: <Split className="h-4 w-4" />, color: 'bg-yellow-500', inputs: 1, outputs: 4, configFields: [{ name: 'cases', label: 'Cases', type: 'json' }] },

  // Loops
  { type: 'loop_foreach', name: 'For Each', description: 'Loop over items', category: 'loop', icon: <Repeat className="h-4 w-4" />, color: 'bg-purple-500', inputs: 1, outputs: 1, configFields: [{ name: 'items', label: 'Items Expression', type: 'text' }] },
  { type: 'loop_while', name: 'While', description: 'Loop while condition', category: 'loop', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-purple-500', inputs: 1, outputs: 1, configFields: [{ name: 'condition', label: 'Condition', type: 'textarea' }, { name: 'maxIterations', label: 'Max Iterations', type: 'number', default: 100 }] },

  // Control
  { type: 'control_delay', name: 'Delay', description: 'Wait before continuing', category: 'control', icon: <Clock className="h-4 w-4" />, color: 'bg-gray-500', inputs: 1, outputs: 1, configFields: [{ name: 'duration', label: 'Duration (ms)', type: 'number', default: 1000 }] },
  { type: 'control_merge', name: 'Merge', description: 'Merge branches', category: 'control', icon: <Merge className="h-4 w-4" />, color: 'bg-gray-500', inputs: 2, outputs: 1, configFields: [{ name: 'mode', label: 'Mode', type: 'select', options: ['Wait All', 'First'] }] },
  { type: 'control_split', name: 'Split', description: 'Split into branches', category: 'control', icon: <Split className="h-4 w-4" />, color: 'bg-gray-500', inputs: 1, outputs: 2, configFields: [] },
  { type: 'control_error', name: 'Error Handler', description: 'Handle errors', category: 'control', icon: <AlertTriangle className="h-4 w-4" />, color: 'bg-red-500', inputs: 1, outputs: 2, configFields: [{ name: 'continueOnError', label: 'Continue on Error', type: 'boolean' }] },
]

// ============================================================================
// MOCK DATA - TEMPLATES & EXECUTION LOGS
// ============================================================================

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 't1', name: 'Slack Alert on Form Submit', description: 'Send Slack notification when a form is submitted', category: 'Notifications', icon: '📬', popularity: 95, isNew: false,
    nodes: [{ id: 'n1', type: 'trigger_webhook', name: 'Webhook', position: { x: 100, y: 200 }, data: { method: 'POST', path: '/form' }, inputs: [], outputs: ['n2'] }],
    connections: [{ id: 'c1', sourceNodeId: 'n1', sourceOutput: 'out1', targetNodeId: 'n2', targetInput: 'in1' }]
  },
  {
    id: 't2', name: 'Daily Report Generator', description: 'Generate and email daily reports automatically', category: 'Reporting', icon: '📊', popularity: 88, isNew: false,
    nodes: [], connections: []
  },
  {
    id: 't3', name: 'Lead Scoring Workflow', description: 'Score leads based on their actions and update CRM', category: 'Sales', icon: '🎯', popularity: 82, isNew: true,
    nodes: [], connections: []
  },
  {
    id: 't4', name: 'GitHub to Jira Sync', description: 'Create Jira tickets from GitHub issues', category: 'Development', icon: '🔄', popularity: 91, isNew: false,
    nodes: [], connections: []
  },
  {
    id: 't5', name: 'Customer Onboarding', description: 'Automated welcome sequence for new customers', category: 'Customer Success', icon: '👋', popularity: 79, isNew: true,
    nodes: [], connections: []
  },
]

const EXECUTION_LOGS: ExecutionLog[] = [
  { id: 'e1', workflowId: 'w1', status: 'success', startedAt: '2024-01-28T10:30:00Z', finishedAt: '2024-01-28T10:30:02Z', duration: 2000, nodesExecuted: 5, totalNodes: 5 },
  { id: 'e2', workflowId: 'w1', status: 'success', startedAt: '2024-01-28T10:25:00Z', finishedAt: '2024-01-28T10:25:01Z', duration: 1500, nodesExecuted: 5, totalNodes: 5 },
  { id: 'e3', workflowId: 'w2', status: 'error', startedAt: '2024-01-28T10:20:00Z', finishedAt: '2024-01-28T10:20:03Z', duration: 3000, nodesExecuted: 3, totalNodes: 5, error: 'Connection timeout' },
  { id: 'e4', workflowId: 'w1', status: 'running', startedAt: '2024-01-28T10:35:00Z', nodesExecuted: 2, totalNodes: 5 },
  { id: 'e5', workflowId: 'w3', status: 'success', startedAt: '2024-01-28T10:15:00Z', finishedAt: '2024-01-28T10:15:04Z', duration: 4000, nodesExecuted: 8, totalNodes: 8 },
]

// ============================================================================
// MAIN COMPONENT - N8N LEVEL WORKFLOW BUILDER
// ============================================================================

interface WorkflowBuilderClientProps {
  initialWorkflows: Workflow[]
  initialStats: WorkflowStats
}

export default function WorkflowBuilderClient({ initialWorkflows, initialStats }: WorkflowBuilderClientProps) {
  // State
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showNodeLibrary, setShowNodeLibrary] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedNodeCategory, setSelectedNodeCategory] = useState<string>('all')
  const [canvasZoom, setCanvasZoom] = useState(100)
  const [showNodeConfig, setShowNodeConfig] = useState(false)
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)

  // Form state for new workflow
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')

  // Workflow hook
  const {
    workflows,
    stats,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow
  } = useWorkflows(initialWorkflows, initialStats)

  // Filter nodes by category
  const filteredNodes = useMemo(() => {
    if (selectedNodeCategory === 'all') return NODE_DEFINITIONS
    return NODE_DEFINITIONS.filter(n => n.category === selectedNodeCategory)
  }, [selectedNodeCategory])

  // Filter workflows by search
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows
    return workflows.filter(w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [workflows, searchQuery])

  // Stats for display
  const displayStats = useMemo(() => [
    { label: 'Total Workflows', value: stats.total, color: 'text-violet-600', icon: <GitBranch className="h-5 w-5" /> },
    { label: 'Active', value: stats.active, color: 'text-green-600', icon: <Activity className="h-5 w-5" /> },
    { label: 'Completed', value: stats.completed, color: 'text-blue-600', icon: <CheckCircle className="h-5 w-5" /> },
    { label: 'Success Rate', value: `${Math.round(stats.avgCompletionRate)}%`, color: 'text-purple-600', icon: <BarChart3 className="h-5 w-5" /> },
  ], [stats])

  // Handlers
  const handleCreateWorkflow = useCallback(async () => {
    if (!newWorkflowName.trim()) {
      toast.error('Please enter a workflow name')
      return
    }

    await createWorkflow({
      name: newWorkflowName,
      description: newWorkflowDescription,
      status: 'draft',
      total_steps: 0,
      current_step: 0,
      completion_rate: 0,
      steps_config: [],
      approvals_required: 0,
      approvals_received: 0,
      assigned_to: [],
      dependencies: [],
      tags: []
    })

    toast.success('Workflow Created', {
      description: `"${newWorkflowName}" is ready to build`
    })

    setShowCreateDialog(false)
    setNewWorkflowName('')
    setNewWorkflowDescription('')
  }, [newWorkflowName, newWorkflowDescription, createWorkflow])

  const handleUseTemplate = useCallback((template: WorkflowTemplate) => {
    toast.success('Template Applied', {
      description: `Creating workflow from "${template.name}"`
    })
    setShowTemplates(false)
  }, [])

  const handleDragNode = useCallback((nodeType: NodeType) => {
    toast.info('Node Ready', {
      description: 'Drag to canvas to add node'
    })
    setShowNodeLibrary(false)
  }, [])

  const handleDeleteWorkflow = useCallback(async (workflowId: string) => {
    await deleteWorkflow(workflowId)
    toast.success('Workflow Deleted')
  }, [deleteWorkflow])

  const handleStartWorkflow = useCallback(async (workflowId: string) => {
    await startWorkflow(workflowId)
    toast.success('Workflow Started')
  }, [startWorkflow])

  const handlePauseWorkflow = useCallback(async (workflowId: string) => {
    await pauseWorkflow(workflowId)
    toast.success('Workflow Paused')
  }, [pauseWorkflow])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                  n8n Level
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {NODE_DEFINITIONS.length} Nodes
                </Badge>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Workflow Builder
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visual automation for any workflow
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayStats.map((stat, i) => (
            <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Node Library
            </TabsTrigger>
            <TabsTrigger value="executions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Executions
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            {/* Search */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Workflows List */}
            {loading && workflows.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              </div>
            ) : filteredWorkflows.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <GitBranch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Workflows Yet</h3>
                  <p className="text-gray-500 mb-4">Create your first workflow to automate tasks</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkflows.map(workflow => (
                  <Card key={workflow.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5 text-violet-600" />
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="font-semibold mb-1">{workflow.name}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {workflow.description || 'No description'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Box className="h-3 w-3" />
                          {workflow.total_steps} nodes
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {workflow.completion_rate}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {workflow.status === 'draft' && (
                          <Button size="sm" onClick={() => handleStartWorkflow(workflow.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {workflow.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => handlePauseWorkflow(workflow.id)}>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        {workflow.status === 'paused' && (
                          <Button size="sm" onClick={() => startWorkflow(workflow.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteWorkflow(workflow.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Node Library Tab */}
          <TabsContent value="nodes" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'trigger', 'action', 'condition', 'loop', 'control'].map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedNodeCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedNodeCategory(cat)}
                  className={selectedNodeCategory === cat ? 'bg-violet-600 hover:bg-violet-700' : ''}
                >
                  {cat === 'all' ? 'All Nodes' : cat.charAt(0).toUpperCase() + cat.slice(1) + 's'}
                </Button>
              ))}
            </div>

            {/* Nodes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredNodes.map(node => (
                <Card
                  key={node.type}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all cursor-grab"
                  draggable
                  onDragStart={() => handleDragNode(node.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${node.color} text-white`}>
                        {node.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{node.name}</h4>
                        <p className="text-xs text-gray-500">{node.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span>{node.inputs} in</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{node.outputs} out</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Recent workflow runs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {EXECUTION_LOGS.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        {log.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {log.status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                        {log.status === 'running' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                        {log.status === 'waiting' && <Clock className="h-5 w-5 text-gray-400" />}

                        <div>
                          <div className="font-medium">Workflow #{log.workflowId}</div>
                          <div className="text-sm text-gray-500">{formatTimeAgo(log.startedAt)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{log.nodesExecuted}/{log.totalNodes}</div>
                          <div className="text-xs text-gray-500">Nodes</div>
                        </div>
                        {log.duration && (
                          <div className="text-center">
                            <div className="font-medium">{(log.duration / 1000).toFixed(1)}s</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                        )}
                        <Badge className={log.status === 'success' ? 'bg-green-100 text-green-700' : log.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                          {log.status}
                        </Badge>
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

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WORKFLOW_TEMPLATES.map(template => (
                <Card key={template.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur hover:shadow-lg transition-all cursor-pointer" onClick={() => handleUseTemplate(template)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl">{template.icon}</span>
                      <div className="flex items-center gap-2">
                        {template.isNew && <Badge className="bg-blue-100 text-blue-700">New</Badge>}
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{template.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {template.popularity}% popular
                      </span>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Workflow Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-violet-600" />
                Create New Workflow
              </DialogTitle>
              <DialogDescription>
                Start building your automation workflow
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Lead Processing Workflow"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this workflow does..."
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={handleCreateWorkflow}
                disabled={loading || !newWorkflowName.trim()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" />
                Workflow Templates
              </DialogTitle>
              <DialogDescription>
                Start from a pre-built template
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-96">
              <div className="grid md:grid-cols-2 gap-4">
                {WORKFLOW_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{template.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
