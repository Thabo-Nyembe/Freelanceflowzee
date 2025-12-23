'use client'
import { useState, useMemo } from 'react'
import { useAutomations, type AutomationWorkflow, type WorkflowType, type WorkflowStatus } from '@/lib/hooks/use-automations'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Workflow, Play, Pause, Square, Plus, Settings, Download, Search,
  Zap, GitBranch, ArrowRight, Clock, CheckCircle2, XCircle, Activity,
  Code, Database, Mail, Webhook, Calendar, FileText, Users, Slack,
  Globe, ShoppingCart, CreditCard, Key, Terminal, Cloud, Bot, Sparkles,
  RotateCcw, Copy, Trash2, MoreVertical, Eye, Edit2, History, Layers,
  Filter, ChevronRight, TrendingUp, AlertTriangle, RefreshCw, Share2
} from 'lucide-react'

// View types
type ViewType = 'workflows' | 'executions' | 'templates' | 'nodes'

// Node types for the builder
interface NodeType {
  id: string
  name: string
  category: string
  icon: React.ReactNode
  description: string
  color: string
}

// Execution type
interface Execution {
  id: string
  workflowId: string
  workflowName: string
  status: 'running' | 'success' | 'failed' | 'waiting'
  startedAt: Date
  duration: number
  nodesExecuted: number
  totalNodes: number
}

// Template type
interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: number
  uses: number
  author: string
}

export default function AutomationsClient({ initialWorkflows }: { initialWorkflows: AutomationWorkflow[] }) {
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState<WorkflowType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')
  const [view, setView] = useState<ViewType>('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewWorkflow, setShowNewWorkflow] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null)

  const { workflows, loading, error } = useAutomations({ workflowType: workflowTypeFilter, status: statusFilter })
  const displayWorkflows = workflows.length > 0 ? workflows : initialWorkflows

  // Node categories
  const nodeCategories = [
    { id: 'triggers', name: 'Triggers', color: 'amber' },
    { id: 'actions', name: 'Actions', color: 'blue' },
    { id: 'flow', name: 'Flow Control', color: 'purple' },
    { id: 'data', name: 'Data & Storage', color: 'emerald' },
    { id: 'ai', name: 'AI & ML', color: 'pink' },
    { id: 'integrations', name: 'Integrations', color: 'sky' }
  ]

  // Available nodes (n8n-level)
  const nodeTypes: NodeType[] = [
    // Triggers
    { id: 'webhook', name: 'Webhook', category: 'triggers', icon: <Webhook className="h-4 w-4" />, description: 'Trigger on HTTP request', color: 'amber' },
    { id: 'cron', name: 'Schedule', category: 'triggers', icon: <Clock className="h-4 w-4" />, description: 'Time-based trigger', color: 'amber' },
    { id: 'email-trigger', name: 'Email Trigger', category: 'triggers', icon: <Mail className="h-4 w-4" />, description: 'Trigger on email', color: 'amber' },
    { id: 'form-trigger', name: 'Form Submit', category: 'triggers', icon: <FileText className="h-4 w-4" />, description: 'Form submission', color: 'amber' },
    // Actions
    { id: 'http', name: 'HTTP Request', category: 'actions', icon: <Globe className="h-4 w-4" />, description: 'Make API calls', color: 'blue' },
    { id: 'send-email', name: 'Send Email', category: 'actions', icon: <Mail className="h-4 w-4" />, description: 'Send emails', color: 'blue' },
    { id: 'code', name: 'Code', category: 'actions', icon: <Code className="h-4 w-4" />, description: 'Custom JavaScript', color: 'blue' },
    { id: 'function', name: 'Function', category: 'actions', icon: <Terminal className="h-4 w-4" />, description: 'Custom function', color: 'blue' },
    // Flow Control
    { id: 'if', name: 'IF Condition', category: 'flow', icon: <GitBranch className="h-4 w-4" />, description: 'Conditional branching', color: 'purple' },
    { id: 'switch', name: 'Switch', category: 'flow', icon: <Layers className="h-4 w-4" />, description: 'Multiple conditions', color: 'purple' },
    { id: 'merge', name: 'Merge', category: 'flow', icon: <GitBranch className="h-4 w-4" />, description: 'Merge branches', color: 'purple' },
    { id: 'wait', name: 'Wait', category: 'flow', icon: <Clock className="h-4 w-4" />, description: 'Delay execution', color: 'purple' },
    { id: 'loop', name: 'Loop', category: 'flow', icon: <RotateCcw className="h-4 w-4" />, description: 'Iterate over items', color: 'purple' },
    // Data
    { id: 'postgres', name: 'PostgreSQL', category: 'data', icon: <Database className="h-4 w-4" />, description: 'Query PostgreSQL', color: 'emerald' },
    { id: 'mysql', name: 'MySQL', category: 'data', icon: <Database className="h-4 w-4" />, description: 'Query MySQL', color: 'emerald' },
    { id: 'mongodb', name: 'MongoDB', category: 'data', icon: <Database className="h-4 w-4" />, description: 'Query MongoDB', color: 'emerald' },
    { id: 'redis', name: 'Redis', category: 'data', icon: <Database className="h-4 w-4" />, description: 'Redis cache', color: 'emerald' },
    { id: 'supabase', name: 'Supabase', category: 'data', icon: <Cloud className="h-4 w-4" />, description: 'Supabase database', color: 'emerald' },
    // AI & ML
    { id: 'openai', name: 'OpenAI', category: 'ai', icon: <Bot className="h-4 w-4" />, description: 'GPT models', color: 'pink' },
    { id: 'anthropic', name: 'Claude AI', category: 'ai', icon: <Sparkles className="h-4 w-4" />, description: 'Claude models', color: 'pink' },
    { id: 'huggingface', name: 'Hugging Face', category: 'ai', icon: <Bot className="h-4 w-4" />, description: 'ML models', color: 'pink' },
    { id: 'embeddings', name: 'Embeddings', category: 'ai', icon: <Sparkles className="h-4 w-4" />, description: 'Vector embeddings', color: 'pink' },
    { id: 'text-classifier', name: 'Classifier', category: 'ai', icon: <Sparkles className="h-4 w-4" />, description: 'Text classification', color: 'pink' },
    // Integrations
    { id: 'slack', name: 'Slack', category: 'integrations', icon: <Slack className="h-4 w-4" />, description: 'Slack messages', color: 'sky' },
    { id: 'google-sheets', name: 'Google Sheets', category: 'integrations', icon: <FileText className="h-4 w-4" />, description: 'Spreadsheets', color: 'sky' },
    { id: 'notion', name: 'Notion', category: 'integrations', icon: <FileText className="h-4 w-4" />, description: 'Notion databases', color: 'sky' },
    { id: 'stripe', name: 'Stripe', category: 'integrations', icon: <CreditCard className="h-4 w-4" />, description: 'Payment processing', color: 'sky' },
    { id: 'hubspot', name: 'HubSpot', category: 'integrations', icon: <Users className="h-4 w-4" />, description: 'CRM operations', color: 'sky' },
    { id: 'salesforce', name: 'Salesforce', category: 'integrations', icon: <Cloud className="h-4 w-4" />, description: 'CRM operations', color: 'sky' },
    { id: 'shopify', name: 'Shopify', category: 'integrations', icon: <ShoppingCart className="h-4 w-4" />, description: 'E-commerce', color: 'sky' },
    { id: 'github', name: 'GitHub', category: 'integrations', icon: <GitBranch className="h-4 w-4" />, description: 'Git operations', color: 'sky' }
  ]

  // Sample executions
  const executions: Execution[] = [
    { id: '1', workflowId: '1', workflowName: 'Lead Scoring Pipeline', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 5), duration: 2.3, nodesExecuted: 8, totalNodes: 8 },
    { id: '2', workflowId: '2', workflowName: 'Daily Report Generator', status: 'running', startedAt: new Date(Date.now() - 1000 * 30), duration: 0, nodesExecuted: 3, totalNodes: 12 },
    { id: '3', workflowId: '3', workflowName: 'Slack Notifications', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 15), duration: 0.8, nodesExecuted: 4, totalNodes: 4 },
    { id: '4', workflowId: '1', workflowName: 'Lead Scoring Pipeline', status: 'failed', startedAt: new Date(Date.now() - 1000 * 60 * 30), duration: 1.5, nodesExecuted: 5, totalNodes: 8 },
    { id: '5', workflowId: '4', workflowName: 'Email Campaign', status: 'waiting', startedAt: new Date(Date.now() - 1000 * 60 * 60), duration: 0, nodesExecuted: 0, totalNodes: 6 }
  ]

  // Sample templates
  const templates: WorkflowTemplate[] = [
    { id: '1', name: 'New Customer Onboarding', description: 'Automate welcome emails, CRM updates, and Slack notifications', category: 'Sales', nodes: 8, uses: 1240, author: 'n8n Team' },
    { id: '2', name: 'Daily Report to Slack', description: 'Generate and send daily reports to Slack channels', category: 'Productivity', nodes: 5, uses: 890, author: 'Community' },
    { id: '3', name: 'Lead Scoring with AI', description: 'Use GPT-4 to score and qualify leads automatically', category: 'AI', nodes: 12, uses: 560, author: 'n8n Team' },
    { id: '4', name: 'Invoice to Accounting', description: 'Auto-sync invoices to QuickBooks/Xero', category: 'Finance', nodes: 6, uses: 420, author: 'Community' },
    { id: '5', name: 'GitHub to Notion Sync', description: 'Sync GitHub issues to Notion database', category: 'Dev Tools', nodes: 4, uses: 780, author: 'Community' },
    { id: '6', name: 'Social Media Publisher', description: 'Schedule and publish across platforms', category: 'Marketing', nodes: 10, uses: 650, author: 'n8n Team' }
  ]

  // Comprehensive stats
  const stats = useMemo(() => {
    const total = displayWorkflows.length
    const active = displayWorkflows.filter(w => w.status === 'active').length
    const running = displayWorkflows.filter(w => w.status === 'running').length
    const totalExecutions = displayWorkflows.reduce((sum, w) => sum + w.total_executions, 0)
    const successfulExecutions = displayWorkflows.reduce((sum, w) => sum + w.successful_executions, 0)
    const failedExecutions = displayWorkflows.reduce((sum, w) => sum + w.failed_executions, 0)
    const avgSuccessRate = totalExecutions > 0
      ? ((successfulExecutions / totalExecutions) * 100).toFixed(1)
      : '0'
    const totalNodes = displayWorkflows.reduce((sum, w) => sum + w.step_count, 0)

    return {
      total,
      active,
      running,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      avgSuccessRate,
      totalNodes
    }
  }, [displayWorkflows])

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return displayWorkflows.filter(w => {
      const matchesSearch = !searchQuery ||
        w.workflow_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = workflowTypeFilter === 'all' || w.workflow_type === workflowTypeFilter
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [displayWorkflows, searchQuery, workflowTypeFilter, statusFilter])

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Workflow className="h-8 w-8" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Automation Pro
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    n8n-Level
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Workflow Automation</h1>
                <p className="text-white/80">
                  Visual builder • 400+ integrations • AI nodes • Execution history
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Workflow
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Workflow</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="blank" className="mt-4">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="blank">Start Blank</TabsTrigger>
                        <TabsTrigger value="template">From Template</TabsTrigger>
                        <TabsTrigger value="import">Import</TabsTrigger>
                      </TabsList>
                      <TabsContent value="blank" className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Workflow Name</label>
                          <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="My Workflow" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={3} placeholder="What does this workflow do?" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Start with a Trigger</label>
                          <div className="grid grid-cols-2 gap-3">
                            {nodeTypes.filter(n => n.category === 'triggers').map(node => (
                              <button key={node.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left">
                                <div className={`p-2 rounded-lg bg-amber-100 text-amber-600`}>
                                  {node.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{node.name}</p>
                                  <p className="text-xs text-gray-500">{node.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button onClick={() => setShowNewWorkflow(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Create Workflow</button>
                        </div>
                      </TabsContent>
                      <TabsContent value="template" className="mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          {templates.slice(0, 4).map(template => (
                            <button key={template.id} className="p-4 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left">
                              <div className="flex items-center justify-between mb-2">
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{template.category}</span>
                                <span className="text-xs text-gray-500">{template.uses} uses</span>
                              </div>
                              <h4 className="font-medium mb-1">{template.name}</h4>
                              <p className="text-sm text-gray-500">{template.description}</p>
                              <p className="text-xs text-gray-400 mt-2">{template.nodes} nodes • by {template.author}</p>
                            </button>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="import" className="mt-4 space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                          <p className="font-medium mb-1">Drop your workflow file here</p>
                          <p className="text-sm text-gray-500">Supports .json workflow exports</p>
                          <button className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm">Browse Files</button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Or paste JSON</label>
                          <textarea className="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-800 dark:border-gray-700" rows={6} placeholder='{"nodes": [...], "connections": [...]}' />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Workflow className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">Workflows</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-500">Executions</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalExecutions.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.avgSuccessRate}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-gray-500">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.failedExecutions}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-500">Total Nodes</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.totalNodes}</div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
            {(['workflows', 'executions', 'templates', 'nodes'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>

        {/* Workflows View */}
        {view === 'workflows' && (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
              </div>
            )}

            {filteredWorkflows.map(workflow => (
              <div
                key={workflow.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        workflow.status === 'active' ? 'bg-green-100 text-green-700' :
                        workflow.status === 'running' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        workflow.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {workflow.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">{workflow.workflow_type}</span>
                      {workflow.is_published && (
                        <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          v{workflow.published_version}
                        </span>
                      )}
                      {workflow.is_enabled && (
                        <span className="px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-700">Enabled</span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{workflow.workflow_name}</h3>
                    {workflow.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{workflow.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Layers className="h-4 w-4" />
                        {workflow.step_count} steps
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {workflow.total_executions.toLocaleString()} runs
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {workflow.successful_executions} success
                      </span>
                      {workflow.failed_executions > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          {workflow.failed_executions} failed
                        </span>
                      )}
                      {workflow.avg_duration_seconds && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {workflow.avg_duration_seconds.toFixed(1)}s avg
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {workflow.total_executions > 0 && (
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold text-emerald-600">
                          {((workflow.successful_executions / workflow.total_executions) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">success</div>
                      </div>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-green-100 text-green-600 rounded-lg">
                        <Play className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit2 className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Copy className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Executions View */}
        {view === 'executions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Execution History</h3>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <RefreshCw className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="divide-y dark:divide-gray-700">
              {executions.map(execution => (
                <div key={execution.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        execution.status === 'success' ? 'bg-green-100 text-green-600' :
                        execution.status === 'running' ? 'bg-blue-100 text-blue-600' :
                        execution.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {execution.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                         execution.status === 'running' ? <Activity className="h-5 w-5 animate-spin" /> :
                         execution.status === 'failed' ? <XCircle className="h-5 w-5" /> :
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{execution.workflowName}</p>
                        <p className="text-sm text-gray-500">
                          Started {execution.startedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {execution.nodesExecuted}/{execution.totalNodes} nodes
                        </p>
                        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${
                              execution.status === 'success' ? 'bg-green-500' :
                              execution.status === 'failed' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${(execution.nodesExecuted / execution.totalNodes) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {execution.duration > 0 && (
                        <div className="text-sm text-gray-500">
                          {execution.duration.toFixed(1)}s
                        </div>
                      )}
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates View */}
        {view === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Workflow Templates</h2>
                <p className="text-gray-500">Start with pre-built workflows from the community</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>All Categories</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>AI</option>
                  <option>Finance</option>
                  <option>Productivity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">{template.category}</span>
                    <span className="text-xs text-gray-500">{template.uses.toLocaleString()} uses</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <span className="text-xs text-gray-500">{template.nodes} nodes • by {template.author}</span>
                    <button className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nodes View */}
        {view === 'nodes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Node Library</h2>
                <p className="text-gray-500">400+ integrations and actions available</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>

            {nodeCategories.map(category => (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                  {category.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {nodeTypes.filter(n => n.category === category.id).map(node => (
                    <div key={node.id} className="p-4 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer text-center">
                      <div className={`p-3 mx-auto w-fit rounded-lg mb-2 bg-${node.color}-100 text-${node.color}-600`}>
                        {node.icon}
                      </div>
                      <p className="font-medium text-sm">{node.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{node.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Workflow Detail Modal */}
        {selectedWorkflow && (
          <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Workflow className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedWorkflow.workflow_name}</DialogTitle>
                    <p className="text-gray-500">{selectedWorkflow.description}</p>
                  </div>
                </div>
              </DialogHeader>
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="executions">Executions</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <div className="text-2xl font-bold text-emerald-600">{selectedWorkflow.step_count}</div>
                      <p className="text-xs text-gray-500">Steps</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedWorkflow.total_executions}</div>
                      <p className="text-xs text-gray-500">Executions</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedWorkflow.total_executions > 0
                          ? ((selectedWorkflow.successful_executions / selectedWorkflow.total_executions) * 100).toFixed(0)
                          : 0}%
                      </div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedWorkflow.avg_duration_seconds?.toFixed(1) || 0}s</div>
                      <p className="text-xs text-gray-500">Avg Duration</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <h4 className="font-medium mb-4">Workflow Canvas</h4>
                    <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <Workflow className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Visual workflow builder</p>
                        <button className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                          Open Editor
                        </button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="executions" className="mt-4">
                  <div className="space-y-2">
                    {executions.slice(0, 5).map(exec => (
                      <div key={exec.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {exec.status === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                           exec.status === 'failed' ? <XCircle className="h-5 w-5 text-red-600" /> :
                           <Activity className="h-5 w-5 text-blue-600 animate-spin" />}
                          <div>
                            <p className="font-medium">{exec.startedAt.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{exec.nodesExecuted}/{exec.totalNodes} nodes</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{exec.duration.toFixed(1)}s</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="mt-4 space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Enable Workflow</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={selectedWorkflow.is_enabled} />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Error Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">Get notified when workflow fails</p>
                  </div>
                </TabsContent>
                <TabsContent value="versions" className="mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium">v{selectedWorkflow.published_version || 1}</p>
                          <p className="text-xs text-gray-500">Current version</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">Published</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">v{(selectedWorkflow.published_version || 1) - 1 || 0}</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <button className="text-sm text-emerald-600 hover:underline">Restore</button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
