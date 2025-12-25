'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger
} from '@/components/ui/dialog'
import {
  GitBranch, Plus, Play, Pause, Save, Settings, Zap, CheckCircle,
  XCircle, Clock, Activity, Copy, Trash2, Loader2, Search, Filter,
  MoreHorizontal, ChevronRight, ArrowRight, Diamond, Database, Mail,
  MessageSquare, Webhook, Calendar, FileText, Globe, Code, Terminal,
  Box, Layers, Repeat, Split, Merge, AlertTriangle, RefreshCw, Download,
  Upload, Share2, History, Bug, Eye, ZoomIn, ZoomOut, Move, Maximize2,
  Minimize2, LayoutGrid, Sparkles, Cpu, Lock, Unlock, Star, BarChart3,
  MousePointer, Link2, Unlink, RotateCcw, Undo, Redo, Grid, Grip,
  FolderOpen, Users, Key, ShieldCheck, Package, GitCommit, GitMerge,
  GitPullRequest, Tag, Timer, TrendingUp, TrendingDown, AlertCircle,
  Info, HelpCircle, ExternalLink, Clipboard, Check, X, MoreVertical,
  ChevronDown, ChevronUp, Folder, FilePlus, FileCode, Workflow, Route,
  Network, Shuffle, SlidersHorizontal, Gauge, Target, Crosshair
} from 'lucide-react'

// ============== N8N-LEVEL WORKFLOW INTERFACES ==============

type NodeType =
  | 'trigger_manual' | 'trigger_webhook' | 'trigger_schedule' | 'trigger_event' | 'trigger_database'
  | 'action_http' | 'action_email' | 'action_slack' | 'action_database' | 'action_code' | 'action_transform'
  | 'action_google_sheets' | 'action_airtable' | 'action_notion' | 'action_stripe' | 'action_sendgrid'
  | 'condition_if' | 'condition_switch' | 'condition_filter'
  | 'loop_foreach' | 'loop_while' | 'loop_split_batches'
  | 'control_delay' | 'control_merge' | 'control_split' | 'control_error' | 'control_wait'

type WorkflowStatus = 'draft' | 'active' | 'paused' | 'error' | 'archived'
type ExecutionStatus = 'success' | 'error' | 'running' | 'waiting' | 'cancelled' | 'timeout'
type CredentialType = 'api_key' | 'oauth2' | 'basic_auth' | 'bearer' | 'custom'

interface WorkflowNode {
  id: string
  type: NodeType
  name: string
  displayName: string
  description?: string
  position: { x: number; y: number }
  parameters: Record<string, unknown>
  credentials?: string[]
  disabled: boolean
  notes?: string
  color?: string
  webhookId?: string
  retryOnFail: boolean
  maxTries: number
  waitBetweenTries: number
  continueOnFail: boolean
  alwaysOutputData: boolean
  executeOnce: boolean
}

interface NodeConnection {
  id: string
  sourceNodeId: string
  sourceHandle: string
  targetNodeId: string
  targetHandle: string
  label?: string
  animated?: boolean
}

interface Workflow {
  id: string
  name: string
  description?: string
  status: WorkflowStatus
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  settings: WorkflowSettings
  staticData?: Record<string, unknown>
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastExecutedAt?: Date
  executionCount: number
  successCount: number
  errorCount: number
  avgExecutionTime: number
  isShared: boolean
  sharedWith: string[]
  version: number
  versionHistory: WorkflowVersion[]
}

interface WorkflowSettings {
  executionOrder: 'v0' | 'v1'
  saveExecutionProgress: boolean
  saveManualExecutions: boolean
  callerPolicy: 'any' | 'none' | 'workflowsFromAList' | 'workflowsFromSameOwner'
  timezone: string
  errorWorkflow?: string
  executionTimeout: number
  maxConcurrency: number
}

interface WorkflowVersion {
  id: string
  version: number
  createdAt: Date
  createdBy: string
  description: string
  nodesSnapshot: WorkflowNode[]
  connectionsSnapshot: NodeConnection[]
}

interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  status: ExecutionStatus
  mode: 'manual' | 'trigger' | 'webhook' | 'retry'
  startedAt: Date
  finishedAt?: Date
  duration?: number
  nodesExecuted: number
  totalNodes: number
  error?: {
    message: string
    node?: string
    stack?: string
  }
  data?: ExecutionData
  retryOf?: string
  retrySuccessId?: string
}

interface ExecutionData {
  startData?: Record<string, unknown>
  resultData?: {
    runData: Record<string, NodeExecutionData[]>
    lastNodeExecuted?: string
  }
}

interface NodeExecutionData {
  startTime: number
  executionTime: number
  source?: string[]
  data: Record<string, unknown>[]
  error?: {
    message: string
    description?: string
  }
}

interface WorkflowCredential {
  id: string
  name: string
  type: CredentialType
  nodeTypes: NodeType[]
  createdAt: Date
  updatedAt: Date
  data: Record<string, unknown>
  isShared: boolean
  usageCount: number
}

interface WorkflowVariable {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  isSecret: boolean
}

interface NodeDefinition {
  type: NodeType
  name: string
  displayName: string
  description: string
  category: 'trigger' | 'action' | 'condition' | 'loop' | 'control'
  subcategory?: string
  icon: React.ReactNode
  iconColor: string
  color: string
  inputs: { name: string; type: string }[]
  outputs: { name: string; type: string }[]
  properties: NodeProperty[]
  credentials?: { name: string; required: boolean }[]
  version: number
  documentationUrl?: string
}

interface NodeProperty {
  name: string
  displayName: string
  type: 'string' | 'number' | 'boolean' | 'options' | 'collection' | 'json' | 'fixedCollection'
  default?: unknown
  required?: boolean
  description?: string
  options?: { name: string; value: string | number | boolean }[]
  placeholder?: string
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  nodes: WorkflowNode[]
  connections: NodeConnection[]
  usageCount: number
  rating: number
  author: string
  tags: string[]
  iconEmoji: string
  estimatedTime: string
  createdAt: Date
  featured: boolean
}

interface WorkflowStats {
  totalWorkflows: number
  activeWorkflows: number
  draftWorkflows: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  avgExecutionTime: number
  executionsToday: number
  successRateToday: number
}

// ============== NODE DEFINITIONS ==============

const NODE_DEFINITIONS: NodeDefinition[] = [
  // Triggers
  { type: 'trigger_manual', name: 'Manual Trigger', displayName: 'Manual Trigger', description: 'Start workflow manually', category: 'trigger', icon: <Play className="h-4 w-4" />, iconColor: 'text-green-600', color: 'bg-green-500', inputs: [], outputs: [{ name: 'main', type: 'main' }], properties: [], version: 1 },
  { type: 'trigger_webhook', name: 'Webhook', displayName: 'Webhook', description: 'Start on HTTP request', category: 'trigger', icon: <Webhook className="h-4 w-4" />, iconColor: 'text-green-600', color: 'bg-green-500', inputs: [], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'httpMethod', displayName: 'HTTP Method', type: 'options', options: [{ name: 'GET', value: 'GET' }, { name: 'POST', value: 'POST' }, { name: 'PUT', value: 'PUT' }, { name: 'DELETE', value: 'DELETE' }], default: 'POST' }, { name: 'path', displayName: 'Path', type: 'string', required: true }], version: 1 },
  { type: 'trigger_schedule', name: 'Schedule Trigger', displayName: 'Schedule Trigger', description: 'Run on schedule (cron)', category: 'trigger', icon: <Calendar className="h-4 w-4" />, iconColor: 'text-green-600', color: 'bg-green-500', inputs: [], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'cronExpression', displayName: 'Cron Expression', type: 'string', default: '0 9 * * *', description: 'Run at 9 AM daily' }], version: 1 },
  { type: 'trigger_event', name: 'Event Trigger', displayName: 'Event Trigger', description: 'Trigger on system event', category: 'trigger', icon: <Zap className="h-4 w-4" />, iconColor: 'text-green-600', color: 'bg-green-500', inputs: [], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'eventName', displayName: 'Event Name', type: 'string', required: true }], version: 1 },
  { type: 'trigger_database', name: 'Database Trigger', displayName: 'Database Trigger', description: 'Trigger on DB changes', category: 'trigger', subcategory: 'Database', icon: <Database className="h-4 w-4" />, iconColor: 'text-green-600', color: 'bg-green-500', inputs: [], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'operation', displayName: 'Operation', type: 'options', options: [{ name: 'Insert', value: 'insert' }, { name: 'Update', value: 'update' }, { name: 'Delete', value: 'delete' }] }], version: 1 },

  // Actions - Core
  { type: 'action_http', name: 'HTTP Request', displayName: 'HTTP Request', description: 'Make API calls', category: 'action', subcategory: 'Core', icon: <Globe className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'url', displayName: 'URL', type: 'string', required: true }, { name: 'method', displayName: 'Method', type: 'options', options: [{ name: 'GET', value: 'GET' }, { name: 'POST', value: 'POST' }, { name: 'PUT', value: 'PUT' }, { name: 'DELETE', value: 'DELETE' }] }, { name: 'authentication', displayName: 'Authentication', type: 'options', options: [{ name: 'None', value: 'none' }, { name: 'Basic Auth', value: 'basicAuth' }, { name: 'Bearer', value: 'bearer' }, { name: 'OAuth2', value: 'oauth2' }] }], version: 1 },
  { type: 'action_code', name: 'Code', displayName: 'Code', description: 'Run JavaScript/Python', category: 'action', subcategory: 'Core', icon: <Code className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'language', displayName: 'Language', type: 'options', options: [{ name: 'JavaScript', value: 'javascript' }, { name: 'Python', value: 'python' }] }, { name: 'code', displayName: 'Code', type: 'string', required: true }], version: 1 },
  { type: 'action_transform', name: 'Transform', displayName: 'Set', description: 'Transform/set data', category: 'action', subcategory: 'Core', icon: <Layers className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'mode', displayName: 'Mode', type: 'options', options: [{ name: 'Manual', value: 'manual' }, { name: 'Expression', value: 'expression' }] }], version: 1 },

  // Actions - Communication
  { type: 'action_email', name: 'Send Email', displayName: 'Send Email', description: 'Send emails via SMTP', category: 'action', subcategory: 'Communication', icon: <Mail className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'to', displayName: 'To', type: 'string', required: true }, { name: 'subject', displayName: 'Subject', type: 'string', required: true }, { name: 'body', displayName: 'Body', type: 'string' }], credentials: [{ name: 'smtp', required: true }], version: 1 },
  { type: 'action_slack', name: 'Slack', displayName: 'Slack', description: 'Send Slack messages', category: 'action', subcategory: 'Communication', icon: <MessageSquare className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'channel', displayName: 'Channel', type: 'string', required: true }, { name: 'text', displayName: 'Message', type: 'string', required: true }], credentials: [{ name: 'slackApi', required: true }], version: 1 },
  { type: 'action_sendgrid', name: 'SendGrid', displayName: 'SendGrid', description: 'Send emails via SendGrid', category: 'action', subcategory: 'Communication', icon: <Mail className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'to', displayName: 'To', type: 'string', required: true }], credentials: [{ name: 'sendGrid', required: true }], version: 1 },

  // Actions - Data
  { type: 'action_database', name: 'Database', displayName: 'Postgres/MySQL', description: 'Query databases', category: 'action', subcategory: 'Data', icon: <Database className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'operation', displayName: 'Operation', type: 'options', options: [{ name: 'Execute Query', value: 'query' }, { name: 'Insert', value: 'insert' }, { name: 'Update', value: 'update' }, { name: 'Delete', value: 'delete' }] }, { name: 'query', displayName: 'Query', type: 'string' }], credentials: [{ name: 'postgres', required: true }], version: 1 },
  { type: 'action_google_sheets', name: 'Google Sheets', displayName: 'Google Sheets', description: 'Read/write spreadsheets', category: 'action', subcategory: 'Data', icon: <FileText className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'operation', displayName: 'Operation', type: 'options', options: [{ name: 'Read', value: 'read' }, { name: 'Append', value: 'append' }, { name: 'Update', value: 'update' }] }], credentials: [{ name: 'googleSheets', required: true }], version: 1 },
  { type: 'action_airtable', name: 'Airtable', displayName: 'Airtable', description: 'Airtable operations', category: 'action', subcategory: 'Data', icon: <LayoutGrid className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [], credentials: [{ name: 'airtable', required: true }], version: 1 },
  { type: 'action_notion', name: 'Notion', displayName: 'Notion', description: 'Notion database operations', category: 'action', subcategory: 'Data', icon: <FileCode className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [], credentials: [{ name: 'notion', required: true }], version: 1 },

  // Actions - Payments
  { type: 'action_stripe', name: 'Stripe', displayName: 'Stripe', description: 'Payment operations', category: 'action', subcategory: 'Payments', icon: <Cpu className="h-4 w-4" />, iconColor: 'text-blue-600', color: 'bg-blue-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'operation', displayName: 'Operation', type: 'options', options: [{ name: 'Create Payment', value: 'createPayment' }, { name: 'Create Customer', value: 'createCustomer' }] }], credentials: [{ name: 'stripe', required: true }], version: 1 },

  // Conditions
  { type: 'condition_if', name: 'IF', displayName: 'IF', description: 'Conditional branching', category: 'condition', icon: <Diamond className="h-4 w-4" />, iconColor: 'text-yellow-600', color: 'bg-yellow-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'true', type: 'main' }, { name: 'false', type: 'main' }], properties: [{ name: 'conditions', displayName: 'Conditions', type: 'fixedCollection' }], version: 1 },
  { type: 'condition_switch', name: 'Switch', displayName: 'Switch', description: 'Multiple branches', category: 'condition', icon: <Split className="h-4 w-4" />, iconColor: 'text-yellow-600', color: 'bg-yellow-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'output0', type: 'main' }, { name: 'output1', type: 'main' }, { name: 'output2', type: 'main' }, { name: 'output3', type: 'main' }], properties: [], version: 1 },
  { type: 'condition_filter', name: 'Filter', displayName: 'Filter', description: 'Filter items', category: 'condition', icon: <Filter className="h-4 w-4" />, iconColor: 'text-yellow-600', color: 'bg-yellow-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'kept', type: 'main' }, { name: 'discarded', type: 'main' }], properties: [], version: 1 },

  // Loops
  { type: 'loop_foreach', name: 'Loop Over Items', displayName: 'Loop Over Items', description: 'Loop over each item', category: 'loop', icon: <Repeat className="h-4 w-4" />, iconColor: 'text-purple-600', color: 'bg-purple-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [], version: 1 },
  { type: 'loop_while', name: 'While', displayName: 'While', description: 'Loop while condition', category: 'loop', icon: <RefreshCw className="h-4 w-4" />, iconColor: 'text-purple-600', color: 'bg-purple-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'maxIterations', displayName: 'Max Iterations', type: 'number', default: 100 }], version: 1 },
  { type: 'loop_split_batches', name: 'Split In Batches', displayName: 'Split In Batches', description: 'Process in batches', category: 'loop', icon: <Shuffle className="h-4 w-4" />, iconColor: 'text-purple-600', color: 'bg-purple-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'loop', type: 'main' }, { name: 'done', type: 'main' }], properties: [{ name: 'batchSize', displayName: 'Batch Size', type: 'number', default: 10 }], version: 1 },

  // Control
  { type: 'control_delay', name: 'Wait', displayName: 'Wait', description: 'Wait before continuing', category: 'control', icon: <Clock className="h-4 w-4" />, iconColor: 'text-gray-600', color: 'bg-gray-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'amount', displayName: 'Wait Amount', type: 'number', default: 1 }, { name: 'unit', displayName: 'Unit', type: 'options', options: [{ name: 'Seconds', value: 'seconds' }, { name: 'Minutes', value: 'minutes' }, { name: 'Hours', value: 'hours' }] }], version: 1 },
  { type: 'control_merge', name: 'Merge', displayName: 'Merge', description: 'Merge branches', category: 'control', icon: <Merge className="h-4 w-4" />, iconColor: 'text-gray-600', color: 'bg-gray-500', inputs: [{ name: 'input1', type: 'main' }, { name: 'input2', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'mode', displayName: 'Mode', type: 'options', options: [{ name: 'Append', value: 'append' }, { name: 'Merge By Index', value: 'mergeByIndex' }, { name: 'Wait', value: 'wait' }] }], version: 1 },
  { type: 'control_split', name: 'No Op', displayName: 'No Operation', description: 'Pass through', category: 'control', icon: <ArrowRight className="h-4 w-4" />, iconColor: 'text-gray-600', color: 'bg-gray-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [], version: 1 },
  { type: 'control_error', name: 'Error Trigger', displayName: 'Error Trigger', description: 'Handle errors', category: 'control', icon: <AlertTriangle className="h-4 w-4" />, iconColor: 'text-red-600', color: 'bg-red-500', inputs: [], outputs: [{ name: 'main', type: 'main' }], properties: [], version: 1 },
  { type: 'control_wait', name: 'Wait', displayName: 'Wait', description: 'Wait for webhook', category: 'control', icon: <Timer className="h-4 w-4" />, iconColor: 'text-gray-600', color: 'bg-gray-500', inputs: [{ name: 'main', type: 'main' }], outputs: [{ name: 'main', type: 'main' }], properties: [{ name: 'resume', displayName: 'Resume', type: 'options', options: [{ name: 'After Time Interval', value: 'timeInterval' }, { name: 'On Webhook Call', value: 'webhook' }] }], version: 1 },
]

// ============== MOCK DATA ==============

const mockWorkflows: Workflow[] = [
  {
    id: 'wf1',
    name: 'Lead Processing Pipeline',
    description: 'Automatically process new leads from form submissions',
    status: 'active',
    nodes: [],
    connections: [],
    settings: { executionOrder: 'v1', saveExecutionProgress: true, saveManualExecutions: true, callerPolicy: 'any', timezone: 'America/New_York', executionTimeout: 3600, maxConcurrency: 1 },
    tags: ['leads', 'crm', 'automation'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user1',
    lastExecutedAt: new Date('2024-01-15T10:30:00'),
    executionCount: 1245,
    successCount: 1230,
    errorCount: 15,
    avgExecutionTime: 2340,
    isShared: true,
    sharedWith: ['team'],
    version: 5,
    versionHistory: []
  },
  {
    id: 'wf2',
    name: 'Daily Report Generator',
    description: 'Generate and send daily sales reports',
    status: 'active',
    nodes: [],
    connections: [],
    settings: { executionOrder: 'v1', saveExecutionProgress: true, saveManualExecutions: true, callerPolicy: 'any', timezone: 'America/New_York', executionTimeout: 3600, maxConcurrency: 1 },
    tags: ['reports', 'scheduled', 'email'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14'),
    createdBy: 'user1',
    lastExecutedAt: new Date('2024-01-15T09:00:00'),
    executionCount: 45,
    successCount: 44,
    errorCount: 1,
    avgExecutionTime: 15670,
    isShared: false,
    sharedWith: [],
    version: 3,
    versionHistory: []
  },
  {
    id: 'wf3',
    name: 'Slack Notification Bot',
    description: 'Send notifications to Slack on various events',
    status: 'paused',
    nodes: [],
    connections: [],
    settings: { executionOrder: 'v1', saveExecutionProgress: true, saveManualExecutions: true, callerPolicy: 'any', timezone: 'America/New_York', executionTimeout: 3600, maxConcurrency: 1 },
    tags: ['notifications', 'slack'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    createdBy: 'user2',
    executionCount: 890,
    successCount: 885,
    errorCount: 5,
    avgExecutionTime: 450,
    isShared: true,
    sharedWith: ['team'],
    version: 2,
    versionHistory: []
  },
  {
    id: 'wf4',
    name: 'Customer Onboarding',
    description: 'Automated onboarding sequence for new customers',
    status: 'draft',
    nodes: [],
    connections: [],
    settings: { executionOrder: 'v1', saveExecutionProgress: true, saveManualExecutions: true, callerPolicy: 'any', timezone: 'America/New_York', executionTimeout: 3600, maxConcurrency: 1 },
    tags: ['onboarding', 'customers'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'user1',
    executionCount: 0,
    successCount: 0,
    errorCount: 0,
    avgExecutionTime: 0,
    isShared: false,
    sharedWith: [],
    version: 1,
    versionHistory: []
  }
]

const mockExecutions: WorkflowExecution[] = [
  { id: 'ex1', workflowId: 'wf1', workflowName: 'Lead Processing Pipeline', status: 'success', mode: 'trigger', startedAt: new Date('2024-01-15T10:30:00'), finishedAt: new Date('2024-01-15T10:30:02'), duration: 2340, nodesExecuted: 8, totalNodes: 8 },
  { id: 'ex2', workflowId: 'wf1', workflowName: 'Lead Processing Pipeline', status: 'success', mode: 'trigger', startedAt: new Date('2024-01-15T10:25:00'), finishedAt: new Date('2024-01-15T10:25:02'), duration: 2100, nodesExecuted: 8, totalNodes: 8 },
  { id: 'ex3', workflowId: 'wf2', workflowName: 'Daily Report Generator', status: 'error', mode: 'trigger', startedAt: new Date('2024-01-15T09:00:00'), finishedAt: new Date('2024-01-15T09:00:05'), duration: 5000, nodesExecuted: 4, totalNodes: 6, error: { message: 'Connection timeout', node: 'HTTP Request' } },
  { id: 'ex4', workflowId: 'wf1', workflowName: 'Lead Processing Pipeline', status: 'running', mode: 'webhook', startedAt: new Date('2024-01-15T10:35:00'), nodesExecuted: 3, totalNodes: 8 },
  { id: 'ex5', workflowId: 'wf3', workflowName: 'Slack Notification Bot', status: 'success', mode: 'trigger', startedAt: new Date('2024-01-15T10:20:00'), finishedAt: new Date('2024-01-15T10:20:01'), duration: 450, nodesExecuted: 3, totalNodes: 3 }
]

const mockTemplates: WorkflowTemplate[] = [
  { id: 't1', name: 'Slack Alert on Form Submit', description: 'Send Slack notification when a form is submitted', category: 'Notifications', difficulty: 'beginner', nodes: [], connections: [], usageCount: 2340, rating: 4.8, author: 'n8n', tags: ['slack', 'forms'], iconEmoji: '📬', estimatedTime: '5 min', createdAt: new Date(), featured: true },
  { id: 't2', name: 'Daily Report Generator', description: 'Generate and email daily reports automatically', category: 'Reporting', difficulty: 'intermediate', nodes: [], connections: [], usageCount: 1890, rating: 4.7, author: 'n8n', tags: ['reports', 'email'], iconEmoji: '📊', estimatedTime: '15 min', createdAt: new Date(), featured: true },
  { id: 't3', name: 'Lead Scoring Workflow', description: 'Score leads based on their actions and update CRM', category: 'Sales', difficulty: 'advanced', nodes: [], connections: [], usageCount: 1234, rating: 4.6, author: 'n8n', tags: ['crm', 'leads'], iconEmoji: '🎯', estimatedTime: '30 min', createdAt: new Date(), featured: false },
  { id: 't4', name: 'GitHub to Jira Sync', description: 'Create Jira tickets from GitHub issues', category: 'Development', difficulty: 'intermediate', nodes: [], connections: [], usageCount: 987, rating: 4.5, author: 'community', tags: ['github', 'jira'], iconEmoji: '🔄', estimatedTime: '20 min', createdAt: new Date(), featured: false },
  { id: 't5', name: 'Customer Onboarding', description: 'Automated welcome sequence for new customers', category: 'Customer Success', difficulty: 'intermediate', nodes: [], connections: [], usageCount: 1567, rating: 4.9, author: 'n8n', tags: ['onboarding', 'email'], iconEmoji: '👋', estimatedTime: '25 min', createdAt: new Date(), featured: true },
  { id: 't6', name: 'Invoice Processing', description: 'Extract data from invoices and update accounting', category: 'Finance', difficulty: 'advanced', nodes: [], connections: [], usageCount: 876, rating: 4.4, author: 'community', tags: ['invoices', 'ocr'], iconEmoji: '🧾', estimatedTime: '45 min', createdAt: new Date(), featured: false }
]

const mockCredentials: WorkflowCredential[] = [
  { id: 'cred1', name: 'Slack Bot', type: 'oauth2', nodeTypes: ['action_slack'], createdAt: new Date(), updatedAt: new Date(), data: {}, isShared: true, usageCount: 12 },
  { id: 'cred2', name: 'SendGrid API', type: 'api_key', nodeTypes: ['action_sendgrid', 'action_email'], createdAt: new Date(), updatedAt: new Date(), data: {}, isShared: false, usageCount: 8 },
  { id: 'cred3', name: 'Postgres Production', type: 'custom', nodeTypes: ['action_database'], createdAt: new Date(), updatedAt: new Date(), data: {}, isShared: true, usageCount: 15 },
  { id: 'cred4', name: 'Google Sheets', type: 'oauth2', nodeTypes: ['action_google_sheets'], createdAt: new Date(), updatedAt: new Date(), data: {}, isShared: true, usageCount: 6 }
]

const mockVariables: WorkflowVariable[] = [
  { id: 'var1', key: 'API_BASE_URL', value: 'https://api.example.com', type: 'string', description: 'Base URL for API calls', isSecret: false },
  { id: 'var2', key: 'NOTIFICATION_EMAIL', value: 'alerts@company.com', type: 'string', description: 'Email for notifications', isSecret: false },
  { id: 'var3', key: 'STRIPE_API_KEY', value: '••••••••••••', type: 'string', description: 'Stripe API Key', isSecret: true },
  { id: 'var4', key: 'MAX_RETRIES', value: '3', type: 'number', description: 'Maximum retry attempts', isSecret: false }
]

// ============== HELPER FUNCTIONS ==============

const getStatusColor = (status: WorkflowStatus): string => {
  const colors: Record<WorkflowStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
  }
  return colors[status] || colors.draft
}

const getExecutionStatusColor = (status: ExecutionStatus): string => {
  const colors: Record<ExecutionStatus, string> = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    waiting: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    timeout: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  }
  return colors[status] || colors.waiting
}

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-yellow-100 text-yellow-700'
    case 'advanced': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

// ============== MAIN COMPONENT ==============

export default function WorkflowBuilderClient() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [showNodeLibrary, setShowNodeLibrary] = useState(false)
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false)
  const [showVariablesDialog, setShowVariablesDialog] = useState(false)

  const stats: WorkflowStats = useMemo(() => ({
    totalWorkflows: mockWorkflows.length,
    activeWorkflows: mockWorkflows.filter(w => w.status === 'active').length,
    draftWorkflows: mockWorkflows.filter(w => w.status === 'draft').length,
    totalExecutions: mockWorkflows.reduce((sum, w) => sum + w.executionCount, 0),
    successfulExecutions: mockWorkflows.reduce((sum, w) => sum + w.successCount, 0),
    failedExecutions: mockWorkflows.reduce((sum, w) => sum + w.errorCount, 0),
    avgExecutionTime: mockWorkflows.filter(w => w.avgExecutionTime > 0).reduce((sum, w) => sum + w.avgExecutionTime, 0) / mockWorkflows.filter(w => w.avgExecutionTime > 0).length || 0,
    executionsToday: 156,
    successRateToday: 98.7
  }), [])

  const filteredNodes = useMemo(() => {
    return selectedCategory === 'all'
      ? NODE_DEFINITIONS
      : NODE_DEFINITIONS.filter(n => n.category === selectedCategory)
  }, [selectedCategory])

  const filteredWorkflows = useMemo(() => {
    return mockWorkflows.filter(w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Workflow className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Workflow Builder</h1>
                <p className="text-violet-100">n8n-Level Visual Automation Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowCredentialsDialog(true)}>
                <Key className="w-4 h-4 mr-2" />
                Credentials
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowVariablesDialog(true)}>
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Variables
              </Button>
              <Button onClick={() => setShowNewWorkflowDialog(true)} className="bg-white text-violet-600 hover:bg-violet-50">
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-8 gap-3">
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Workflows</p>
                  <p className="text-xl font-bold">{stats.totalWorkflows}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Active</p>
                  <p className="text-xl font-bold">{stats.activeWorkflows}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Executions</p>
                  <p className="text-xl font-bold">{stats.totalExecutions.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Success</p>
                  <p className="text-xl font-bold">{stats.successfulExecutions.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Failed</p>
                  <p className="text-xl font-bold">{stats.failedExecutions}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Avg Time</p>
                  <p className="text-xl font-bold">{formatDuration(stats.avgExecutionTime)}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Today</p>
                  <p className="text-xl font-bold">{stats.executionsToday}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-violet-100">Success Rate</p>
                  <p className="text-xl font-bold">{stats.successRateToday}%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 mb-6">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="executions" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Executions
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Node Library
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Variables
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {filteredWorkflows.map(workflow => (
                  <Card key={workflow.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedWorkflow(workflow); setShowWorkflowDialog(true) }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                            <GitBranch className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{workflow.name}</h3>
                            <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{workflow.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-4">
                        {workflow.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="font-semibold">{workflow.executionCount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Runs</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="font-semibold text-green-600">{((workflow.successCount / workflow.executionCount) * 100 || 0).toFixed(0)}%</p>
                          <p className="text-xs text-gray-500">Success</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="font-semibold">{formatDuration(workflow.avgExecutionTime)}</p>
                          <p className="text-xs text-gray-500">Avg</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {workflow.lastExecutedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(workflow.lastExecutedAt)}
                            </span>
                          )}
                          {workflow.isShared && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Shared
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost"><Settings className="w-3 h-3" /></Button>
                          {workflow.status === 'active' ? (
                            <Button size="sm" variant="ghost"><Pause className="w-3 h-3" /></Button>
                          ) : workflow.status !== 'archived' && (
                            <Button size="sm" variant="ghost"><Play className="w-3 h-3" /></Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Recent workflow runs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExecutions.map(execution => (
                    <div key={execution.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        {execution.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {execution.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                        {execution.status === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                        {execution.status === 'waiting' && <Clock className="w-5 h-5 text-yellow-600" />}
                        <div>
                          <p className="font-medium">{execution.workflowName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatTimeAgo(execution.startedAt)}</span>
                            <Badge variant="outline" className="text-xs">{execution.mode}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="font-semibold">{execution.nodesExecuted}/{execution.totalNodes}</p>
                          <p className="text-xs text-gray-500">Nodes</p>
                        </div>
                        {execution.duration && (
                          <div className="text-center">
                            <p className="font-semibold">{formatDuration(execution.duration)}</p>
                            <p className="text-xs text-gray-500">Duration</p>
                          </div>
                        )}
                        <Badge className={getExecutionStatusColor(execution.status)}>{execution.status}</Badge>
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nodes Tab */}
          <TabsContent value="nodes">
            <div className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {['all', 'trigger', 'action', 'condition', 'loop', 'control'].map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'bg-violet-600 hover:bg-violet-700' : ''}
                  >
                    {cat === 'all' ? 'All Nodes' : cat.charAt(0).toUpperCase() + cat.slice(1) + 's'}
                    {cat !== 'all' && <Badge variant="outline" className="ml-2">{NODE_DEFINITIONS.filter(n => n.category === cat).length}</Badge>}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {filteredNodes.map(node => (
                  <Card key={node.type} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${node.color} text-white`}>
                          {node.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{node.displayName}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">{node.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{node.category}</Badge>
                            {node.subcategory && <Badge variant="outline" className="text-xs">{node.subcategory}</Badge>}
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span>{node.inputs.length} in</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{node.outputs.length} out</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-3 gap-6">
              {mockTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{template.iconEmoji}</span>
                      <div className="flex items-center gap-2">
                        {template.featured && <Badge className="bg-violet-100 text-violet-700">Featured</Badge>}
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" />{template.rating}</span>
                        <span>{template.usageCount.toLocaleString()} uses</span>
                      </div>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{template.estimatedTime}</span>
                    </div>
                    <Button className="w-full mt-4" variant="outline">Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Credentials</h2>
                  <p className="text-gray-500">Manage API keys and authentication</p>
                </div>
                <Button><Plus className="w-4 h-4 mr-2" />Add Credential</Button>
              </div>

              <div className="grid gap-4">
                {mockCredentials.map(cred => (
                  <Card key={cred.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                          <Key className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{cred.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{cred.type}</Badge>
                            {cred.isShared && <span className="flex items-center gap-1"><Users className="w-3 h-3" />Shared</span>}
                            <span>Used in {cred.usageCount} workflows</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Variables Tab */}
          <TabsContent value="variables">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Variables</h2>
                  <p className="text-gray-500">Global variables available in all workflows</p>
                </div>
                <Button><Plus className="w-4 h-4 mr-2" />Add Variable</Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockVariables.map(variable => (
                      <div key={variable.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {variable.isSecret ? (
                            <Lock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-semibold">{variable.key}</code>
                              <Badge variant="outline">{variable.type}</Badge>
                              {variable.isSecret && <Badge className="bg-yellow-100 text-yellow-700">Secret</Badge>}
                            </div>
                            {variable.description && <p className="text-sm text-gray-500">{variable.description}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{variable.value}</code>
                          <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Workflow Dialog */}
      <Dialog open={showNewWorkflowDialog} onOpenChange={setShowNewWorkflowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-violet-600" />
              Create New Workflow
            </DialogTitle>
            <DialogDescription>Start building your automation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input placeholder="e.g., Lead Processing Pipeline" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe what this workflow does..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input placeholder="e.g., leads, crm, automation" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWorkflowDialog(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700">Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow Detail Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <GitBranch className="w-5 h-5 text-violet-600" />
              {selectedWorkflow?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {selectedWorkflow && (
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedWorkflow.executionCount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Executions</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{((selectedWorkflow.successCount / selectedWorkflow.executionCount) * 100 || 0).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Success Rate</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatDuration(selectedWorkflow.avgExecutionTime)}</p>
                    <p className="text-sm text-gray-500">Avg Duration</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">v{selectedWorkflow.version}</p>
                    <p className="text-sm text-gray-500">Version</p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Workflow Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500">Status</Label>
                        <p><Badge className={getStatusColor(selectedWorkflow.status)}>{selectedWorkflow.status}</Badge></p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Created</Label>
                        <p>{selectedWorkflow.createdAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Last Updated</Label>
                        <p>{selectedWorkflow.updatedAt.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Last Executed</Label>
                        <p>{selectedWorkflow.lastExecutedAt ? formatTimeAgo(selectedWorkflow.lastExecutedAt) : 'Never'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
