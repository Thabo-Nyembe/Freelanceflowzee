'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  GitBranch, Plus, Play, Pause, Save, Settings, Zap, CheckCircle,
  XCircle, Clock, Activity, Copy, Trash2, Loader2, Search, Filter, ArrowRight, Diamond, Database, Mail,
  MessageSquare, Webhook, Calendar, FileText, Globe, Code, Terminal,
  Box, Layers, Repeat, Split, Merge, AlertTriangle, RefreshCw, Download,
  Upload, Share2, History, Bug, Eye, LayoutGrid, Sparkles, Cpu, Lock, Star, RotateCcw, Users, Key, Timer, Clipboard, MoreVertical, FileCode, Workflow,
  Network, Shuffle, SlidersHorizontal, Target,
  Bell, Shield, Server, Sliders, AlertOctagon, Archive
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

// Competitive Upgrade Mock Data - n8n/Zapier Level Workflow Intelligence
const mockWorkflowAIInsights = [
  { id: '1', type: 'success' as const, title: 'Automation Savings', description: 'Workflows saved 124 hours of manual work this month—$6,200 value!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'ROI' },
  { id: '2', type: 'warning' as const, title: 'Error Rate Spike', description: 'Salesforce → Slack workflow failing 15% of executions. Check API limits.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Errors' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Merging 4 similar email workflows could reduce complexity by 60%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockWorkflowCollaborators = [
  { id: '1', name: 'Automation Lead', avatar: '/avatars/automation.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Integration Eng', avatar: '/avatars/engineer.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '3', name: 'Ops Manager', avatar: '/avatars/ops.jpg', status: 'away' as const, role: 'Operations' },
]

const mockWorkflowPredictions = [
  { id: '1', title: 'Execution Volume', prediction: 'Monthly workflow executions projected to hit 50K (+35% MoM)', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Error Reduction', prediction: 'New retry logic expected to reduce failures by 40%', confidence: 81, trend: 'down' as const, impact: 'medium' as const },
]

const mockWorkflowActivities = [
  { id: '1', user: 'Automation Lead', action: 'Deployed', target: 'Customer onboarding automation', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Integration Eng', action: 'Fixed', target: 'HubSpot webhook connection', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Executed', target: '2,340 workflow runs today', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockWorkflowQuickActions = [
  { id: '1', label: 'New Flow', icon: 'plus', action: async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Workflow', description: '', tags: [] })
      })
      if (!response.ok) throw new Error('Failed to create workflow')
      const data = await response.json()
      toast.success(`New workflow created! ID: ${data.id || 'workflow'}`)
    } catch (error) {
      toast.error('Failed to create workflow')
    }
  }, variant: 'default' as const },
  { id: '2', label: 'Test', icon: 'play', action: async () => {
    try {
      const response = await fetch('/api/workflows/test', { method: 'POST' })
      if (!response.ok) throw new Error('Test failed')
      const data = await response.json()
      toast.success(`Workflow test passed! ${data.stepsCompleted || 5} steps completed successfully`)
    } catch (error) {
      toast.error('Test failed - check workflow configuration')
    }
  }, variant: 'default' as const },
  { id: '3', label: 'Logs', icon: 'list', action: async () => {
    try {
      const response = await fetch('/api/workflows/logs')
      if (!response.ok) throw new Error('Failed to load logs')
      const data = await response.json()
      toast.success(`Workflow Logs: ${data.executionsToday || 156} executions today - ${data.successRate || 98}% success rate`)
    } catch (error) {
      toast.error('Failed to load logs')
    }
  }, variant: 'outline' as const },
]

export default function WorkflowBuilderClient() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [settingsTab, setSettingsTab] = useState('general')
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

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)

  // Step management state
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowNode[]>([])
  const [showAddStepDialog, setShowAddStepDialog] = useState(false)
  const [showEditStepDialog, setShowEditStepDialog] = useState(false)
  const [showDeleteStepDialog, setShowDeleteStepDialog] = useState(false)
  const [selectedStep, setSelectedStep] = useState<WorkflowNode | null>(null)
  const [newStepType, setNewStepType] = useState<NodeType>('trigger_manual')
  const [newStepName, setNewStepName] = useState('')
  const [newStepDescription, setNewStepDescription] = useState('')

  // Run workflow state
  const [showRunConfirmDialog, setShowRunConfirmDialog] = useState(false)
  const [workflowToRun, setWorkflowToRun] = useState<Workflow | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Execution history state
  const [showExecutionHistoryDialog, setShowExecutionHistoryDialog] = useState(false)
  const [executionHistoryWorkflow, setExecutionHistoryWorkflow] = useState<Workflow | null>(null)

  // Clone workflow state
  const [showCloneDialog, setShowCloneDialog] = useState(false)
  const [workflowToClone, setWorkflowToClone] = useState<Workflow | null>(null)
  const [cloneName, setCloneName] = useState('')

  // Export workflow state
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [workflowToExport, setWorkflowToExport] = useState<Workflow | null>(null)

  // Share dialogs state
  const [showShareTemplateDialog, setShowShareTemplateDialog] = useState(false)
  const [showShareCredentialsDialog, setShowShareCredentialsDialog] = useState(false)

  // New workflow form state
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')
  const [newWorkflowTags, setNewWorkflowTags] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Handlers
  const handleCreateWorkflow = () => setShowCreateDialog(true)

  const handleEditWorkflow = async (workflowName: string) => {
    toast.success(`Opening "${workflowName}" in editor...`)
    // Navigate to workflow editor - in real app would use router.push
    window.location.href = `/dashboard/workflow-builder-v2/editor?workflow=${encodeURIComponent(workflowName)}`
  }

  const handleActivateWorkflow = async (workflowName: string) => {
    try {
      const response = await fetch('/api/workflows/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName, status: 'active' })
      })
      if (!response.ok) throw new Error('Failed to activate')
      toast.success(`"${workflowName}" is now active`)
    } catch (error) {
      toast.error('Failed to activate workflow')
    }
  }

  const handleDuplicateWorkflow = async (workflowName: string) => {
    try {
      const response = await fetch('/api/workflows/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName })
      })
      if (!response.ok) throw new Error('Failed to duplicate')
      const data = await response.json()
      toast.success(`Copy of "${workflowName}" created as "${data.newName || workflowName + ' (Copy)'}"`)
    } catch (error) {
      toast.error('Failed to duplicate workflow')
    }
  }

  const handleDeleteWorkflow = async (workflowName: string) => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      return
    }
    try {
      const response = await fetch('/api/workflows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName })
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success(`"${workflowName}" has been removed`)
    } catch (error) {
      toast.error('Failed to delete workflow')
    }
  }

  // Workflows Tab Handlers
  const handleImportWorkflow = () => setShowImportDialog(true)

  const handleRunAllWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows/run-all', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to start')
      const data = await response.json()
      toast.success(`All ${data.count || 'active'} workflows started!`)
    } catch (error) {
      toast.error('Failed to start workflows')
    }
  }

  const handlePauseAllWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows/pause-all', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to pause')
      toast.success('All workflows paused')
    } catch (error) {
      toast.error('Failed to pause workflows')
    }
  }

  const handleExportWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows/export')
      if (!response.ok) throw new Error('Export failed')
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workflows-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Workflows exported successfully')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const handleViewHistory = () => {
    setActiveTab('executions')
    toast.success('Viewing execution history')
  }

  const handleWorkflowSettings = () => {
    setActiveTab('settings')
  }

  const handleFilter = () => setShowFilterDialog(true)

  const handleWorkflowCardSettings = (workflowName: string) => {
    toast.success(`Opening settings for "${workflowName}"`)
    setActiveTab('settings')
  }

  const handlePauseWorkflow = async (workflowName: string) => {
    try {
      const response = await fetch('/api/workflows/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName })
      })
      if (!response.ok) throw new Error('Failed to pause')
      toast.success(`"${workflowName}" paused`)
    } catch (error) {
      toast.error('Failed to pause workflow')
    }
  }

  const handlePlayWorkflow = async (workflowName: string) => {
    try {
      const response = await fetch('/api/workflows/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workflowName })
      })
      if (!response.ok) throw new Error('Failed to start')
      toast.success(`"${workflowName}" is now running`)
    } catch (error) {
      toast.error('Failed to start workflow')
    }
  }

  const handleWorkflowCardMore = (workflowName: string) => {
    toast.success(`Showing options for "${workflowName}"`)
  }

  // Executions Tab Handlers
  const handleRunNow = async () => {
    try {
      const response = await fetch('/api/workflows/execute', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to start')
      const data = await response.json()
      toast.success(`Execution started! ID: ${data.executionId || 'new'}`)
    } catch (error) {
      toast.error('Failed to start execution')
    }
  }

  const handleStopAll = async () => {
    if (!confirm('Are you sure you want to stop all running executions?')) return
    try {
      const response = await fetch('/api/workflows/executions/stop-all', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to stop')
      toast.success('All executions stopped')
    } catch (error) {
      toast.error('Failed to stop executions')
    }
  }

  const handleRetryFailed = async () => {
    try {
      const response = await fetch('/api/workflows/executions/retry-failed', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to retry')
      const data = await response.json()
      toast.success(`Retried ${data.count || 'all'} failed executions`)
    } catch (error) {
      toast.error('Failed to retry executions')
    }
  }

  const handleDebug = () => {
    window.open('/dashboard/workflow-builder-v2/debug', '_blank')
  }

  const handleLiveView = () => {
    toast.success('Real-time view activated')
    // Could toggle a live view state
  }

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/workflows/executions/logs')
      if (!response.ok) throw new Error('Export failed')
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `execution-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Logs exported successfully')
    } catch (error) {
      toast.error('Failed to export logs')
    }
  }

  const handleClearExecutions = async () => {
    if (!confirm('Are you sure you want to clear all execution history? This cannot be undone.')) return
    try {
      const response = await fetch('/api/workflows/executions', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to clear')
      toast.success('Execution history cleared')
    } catch (error) {
      toast.error('Failed to clear execution history')
    }
  }

  const handleExecutionSettings = () => {
    setActiveTab('settings')
    setSettingsTab('execution')
  }

  const handleViewExecution = (workflowName: string) => {
    toast.success(`Viewing execution for "${workflowName}"`)
    // Could open a modal or navigate to execution detail view
  }

  // Nodes Tab Handlers
  const handleCreateNode = () => {
    setShowNodeLibrary(true)
  }

  const handleImportNode = () => {
    setShowNodeLibrary(true)
  }

  const handleCustomCode = () => {
    window.open('/dashboard/workflow-builder-v2/code-editor', '_blank')
  }

  const handleWebhooks = () => {
    setActiveTab('settings')
    setSettingsTab('integrations')
  }

  const handleDataNodes = () => {
    setSelectedCategory('action')
    toast.success('Showing data integration nodes')
  }

  const handleEmailNodes = () => {
    setSelectedCategory('action')
    toast.success('Showing email nodes')
  }

  const handleHttpNodes = () => {
    setSelectedCategory('action')
    toast.success('Showing HTTP request nodes')
  }

  const handleFavoriteNodes = () => {
    toast.success('Showing favorite nodes')
  }

  // Templates Tab Handlers
  const handleFeaturedTemplates = () => {
    setActiveTab('templates')
  }

  const handlePopularTemplates = () => {
    setActiveTab('templates')
  }

  const handleRecentTemplates = () => {
    setActiveTab('templates')
  }

  const handleEmailTemplates = () => {
    setActiveTab('templates')
  }

  const handleDataSyncTemplates = () => {
    setActiveTab('templates')
  }

  const handleChatTemplates = () => {
    setActiveTab('templates')
  }

  const handleCreateTemplate = () => {
    setShowCreateWorkflowDialog(true)
  }

  const handleShareTemplate = () => {
    setShowShareTemplateDialog(true)
  }

  const handleUseTemplate = async (templateName: string) => {
    try {
      const response = await fetch('/api/workflows/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName })
      })
      if (!response.ok) throw new Error('Failed to create from template')
      const data = await response.json()
      toast.success(`Workflow created from "${templateName}"! ID: ${data.id || 'new'}`)
    } catch (error) {
      toast.error('Failed to create workflow from template')
    }
  }

  // Credentials Tab Handlers
  const handleAddKey = () => {
    setShowCredentialsDialog(true)
    toast.success('Create your API key')
  }

  const handleApiKeys = () => {
    setActiveTab('credentials')
  }

  const handleOAuth = () => {
    setActiveTab('credentials')
  }

  const handleSecuritySettings = () => {
    setActiveTab('settings')
    setSettingsTab('security')
  }

  const handleShareCredentials = () => {
    setShowShareCredentialsDialog(true)
  }

  const handleRotateCredentials = async () => {
    if (!confirm('Are you sure you want to rotate all credentials? You will need to update any services using these credentials.')) return
    try {
      const response = await fetch('/api/credentials/rotate', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to rotate')
      toast.success('Credentials rotated securely')
    } catch (error) {
      toast.error('Failed to rotate credentials')
    }
  }

  const handleExportCredentials = async () => {
    try {
      const response = await fetch('/api/credentials/export')
      if (!response.ok) throw new Error('Export failed')
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `credentials-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Credentials exported successfully')
    } catch (error) {
      toast.error('Failed to export credentials')
    }
  }

  const handleCredentialSettings = () => {
    setActiveTab('settings')
    setSettingsTab('security')
  }

  const handleAddCredential = () => {
    setShowCredentialsDialog(true)
    toast.success('Create your credential')
  }

  const handleCredentialItemSettings = (credName: string) => {
    toast.success(`Opening settings for "${credName}"`)
  }

  const handleDeleteCredential = async (credName: string) => {
    if (!confirm(`Are you sure you want to delete the credential "${credName}"? This may break workflows using it.`)) return
    try {
      const response = await fetch('/api/credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: credName })
      })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success(`Credential "${credName}" deleted`)
    } catch (error) {
      toast.error('Failed to delete credential')
    }
  }

  // Variables Tab Handlers
  const handleAddVariable = () => {
    setShowVariablesDialog(true)
  }

  const handleAddSecret = () => {
    setShowVariablesDialog(true)
  }

  const handleImportVariables = () => {
    setShowVariablesDialog(true)
  }

  const handleExportVariables = async () => {
    try {
      const response = await fetch('/api/variables/export')
      if (!response.ok) throw new Error('Export failed')
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `variables-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Variables exported successfully')
    } catch (error) {
      toast.error('Failed to export variables')
    }
  }

  const handleDuplicateVariable = () => {
    toast.success('Variable duplicated')
  }

  const handleSyncVariables = async () => {
    try {
      const response = await fetch('/api/variables/sync', { method: 'POST' })
      if (!response.ok) throw new Error('Sync failed')
      toast.success('Variables synced across environments!')
    } catch (error) {
      toast.error('Failed to sync variables')
    }
  }

  const handleViewAllVariables = () => {
    setActiveTab('variables')
    toast.success('Showing all variables')
  }

  const handleVariableSettings = () => {
    setActiveTab('settings')
  }

  const handleVariableItemSettings = (varKey: string) => {
    toast.success(`Opening settings for "${varKey}"`)
  }

  // Settings Tab Handlers
  const handleGeneralSettings = () => {
    setActiveTab('settings')
    setSettingsTab('general')
  }

  const handleExecutionSettingsNav = () => {
    setActiveTab('settings')
    setSettingsTab('execution')
  }

  const handleAlertsSettings = () => {
    setActiveTab('settings')
    setSettingsTab('notifications')
  }

  const handleSecuritySettingsNav = () => {
    setActiveTab('settings')
    setSettingsTab('security')
  }

  const handleIntegrationsSettings = () => {
    setActiveTab('settings')
    setSettingsTab('integrations')
  }

  const handleAdvancedSettings = () => {
    setActiveTab('settings')
    setSettingsTab('advanced')
  }

  const handleSaveAllSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* settings data would go here */ })
      })
      if (!response.ok) throw new Error('Save failed')
      toast.success('All settings saved!')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) return
    try {
      const response = await fetch('/api/settings/reset', { method: 'POST' })
      if (!response.ok) throw new Error('Reset failed')
      toast.success('Settings reset to defaults')
    } catch (error) {
      toast.error('Failed to reset settings')
    }
  }

  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? The old key will stop working immediately.')) return
    try {
      const response = await fetch('/api/settings/api-key/regenerate', { method: 'POST' })
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      await navigator.clipboard.writeText(data.apiKey || '')
      toast.success('New API key generated and copied to clipboard!')
    } catch (error) {
      toast.error('Failed to generate API key')
    }
  }

  const handleCopyToClipboard = async (label: string, value?: string) => {
    try {
      const textToCopy = value || label
      await navigator.clipboard.writeText(textToCopy)
      toast.success(`${label} copied to clipboard`)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleClearAllExecutions = async () => {
    if (!confirm('Are you sure you want to clear ALL execution history? This action cannot be undone.')) return
    try {
      const response = await fetch('/api/workflows/executions/clear-all', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to clear')
      toast.success('All execution history cleared')
    } catch (error) {
      toast.error('Failed to clear execution history')
    }
  }

  const handleDeleteAllWorkflows = async () => {
    if (!confirm('DANGER: Are you sure you want to delete ALL workflows? This will permanently remove all workflows and cannot be undone!')) return
    if (!confirm('This is your final warning. Type "DELETE ALL" to confirm.')) return
    try {
      const response = await fetch('/api/workflows/delete-all', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('All workflows deleted')
    } catch (error) {
      toast.error('Failed to delete workflows')
    }
  }

  const handleCreateWorkflowSubmit = async () => {
    if (!newWorkflowName.trim()) {
      toast.error('Please enter a workflow name')
      return
    }
    setIsSaving(true)
    const createPromise = fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newWorkflowName,
        description: newWorkflowDescription,
        tags: newWorkflowTags.split(',').map(t => t.trim()).filter(Boolean)
      })
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to create')
      const data = await response.json()
      setShowNewWorkflowDialog(false)
      setNewWorkflowName('')
      setNewWorkflowDescription('')
      setNewWorkflowTags('')
      return data
    }).finally(() => setIsSaving(false))

    toast.promise(createPromise, {
      loading: 'Creating workflow...',
      success: (data) => `Workflow "${data?.name || newWorkflowName}" created successfully!`,
      error: 'Failed to create workflow'
    })
  }

  // Add workflow step handler
  const handleAddStep = useCallback(() => {
    if (!newStepName.trim()) {
      toast.error('Please enter a step name')
      return
    }
    const nodeDefinition = NODE_DEFINITIONS.find(n => n.type === newStepType)
    const newStep: WorkflowNode = {
      id: `step-${Date.now()}`,
      type: newStepType,
      name: newStepName,
      displayName: newStepName,
      description: newStepDescription,
      position: { x: workflowSteps.length * 200, y: 100 },
      parameters: {},
      disabled: false,
      retryOnFail: true,
      maxTries: 3,
      waitBetweenTries: 1000,
      continueOnFail: false,
      alwaysOutputData: true,
      executeOnce: false
    }

    setWorkflowSteps(prev => [...prev, newStep])
    setShowAddStepDialog(false)
    setNewStepName('')
    setNewStepDescription('')
    setNewStepType('trigger_manual')
    toast.success(`Step "${newStepName}" added to workflow`)
  }, [newStepType, newStepName, newStepDescription, workflowSteps.length])

  // Edit step handler
  const handleEditStep = useCallback(() => {
    if (!selectedStep || !newStepName.trim()) {
      toast.error('Please enter a step name')
      return
    }

    setWorkflowSteps(prev => prev.map(step =>
      step.id === selectedStep.id
        ? { ...step, name: newStepName, displayName: newStepName, description: newStepDescription, type: newStepType }
        : step
    ))
    setShowEditStepDialog(false)
    setSelectedStep(null)
    setNewStepName('')
    setNewStepDescription('')
    toast.success(`Step "${newStepName}" updated successfully`)
  }, [selectedStep, newStepName, newStepDescription, newStepType])

  // Delete step handler
  const handleDeleteStep = useCallback(() => {
    if (!selectedStep) return

    const deletePromise = new Promise<void>((resolve) => {
      setWorkflowSteps(prev => prev.filter(step => step.id !== selectedStep.id))
      resolve()
    })

    toast.promise(deletePromise, {
      loading: 'Deleting step...',
      success: `Step "${selectedStep.displayName}" deleted`,
      error: 'Failed to delete step'
    })

    setShowDeleteStepDialog(false)
    setSelectedStep(null)
  }, [selectedStep])

  // Open edit step dialog
  const openEditStepDialog = useCallback((step: WorkflowNode) => {
    setSelectedStep(step)
    setNewStepName(step.displayName)
    setNewStepDescription(step.description || '')
    setNewStepType(step.type)
    setShowEditStepDialog(true)
  }, [])

  // Open delete step dialog
  const openDeleteStepDialog = useCallback((step: WorkflowNode) => {
    setSelectedStep(step)
    setShowDeleteStepDialog(true)
  }, [])

  // Save workflow with API
  const handleSaveWorkflow = useCallback(async (workflow: Workflow) => {
    setIsSaving(true)
    const savePromise = fetch(`/api/workflows/${workflow.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...workflow,
        nodes: workflowSteps,
        updatedAt: new Date()
      })
    }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to save')
      return response.json()
    }).finally(() => setIsSaving(false))

    toast.promise(savePromise, {
      loading: 'Saving workflow...',
      success: `Workflow "${workflow.name}" saved successfully!`,
      error: 'Failed to save workflow'
    })
  }, [workflowSteps])

  // Run workflow with confirmation
  const handleRunWorkflowWithConfirm = useCallback((workflow: Workflow) => {
    setWorkflowToRun(workflow)
    setShowRunConfirmDialog(true)
  }, [])

  const executeWorkflow = useCallback(async () => {
    if (!workflowToRun) return

    setIsRunning(true)
    const runPromise = fetch('/api/workflows/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId: workflowToRun.id })
    }).then(async (response) => {
      if (!response.ok) throw new Error('Execution failed')
      return response.json()
    }).finally(() => {
      setIsRunning(false)
      setShowRunConfirmDialog(false)
      setWorkflowToRun(null)
    })

    toast.promise(runPromise, {
      loading: `Running "${workflowToRun.name}"...`,
      success: (data) => `Workflow executed! Execution ID: ${data?.executionId || 'completed'}`,
      error: 'Workflow execution failed'
    })
  }, [workflowToRun])

  // View execution history
  const handleViewExecutionHistory = useCallback((workflow: Workflow) => {
    setExecutionHistoryWorkflow(workflow)
    setShowExecutionHistoryDialog(true)
  }, [])

  // Clone workflow
  const handleCloneWorkflow = useCallback((workflow: Workflow) => {
    setWorkflowToClone(workflow)
    setCloneName(`${workflow.name} (Copy)`)
    setShowCloneDialog(true)
  }, [])

  const executeCloneWorkflow = useCallback(async () => {
    if (!workflowToClone || !cloneName.trim()) {
      toast.error('Please enter a name for the cloned workflow')
      return
    }

    const clonePromise = fetch('/api/workflows/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceWorkflowId: workflowToClone.id,
        newName: cloneName
      })
    }).then(async (response) => {
      if (!response.ok) throw new Error('Clone failed')
      return response.json()
    }).finally(() => {
      setShowCloneDialog(false)
      setWorkflowToClone(null)
      setCloneName('')
    })

    toast.promise(clonePromise, {
      loading: 'Cloning workflow...',
      success: `Workflow cloned as "${cloneName}"!`,
      error: 'Failed to clone workflow'
    })
  }, [workflowToClone, cloneName])

  // Export workflow as JSON
  const handleExportWorkflowConfig = useCallback((workflow: Workflow) => {
    setWorkflowToExport(workflow)
    setShowExportDialog(true)
  }, [])

  const executeExportWorkflow = useCallback(() => {
    if (!workflowToExport) return

    try {
      const exportData = {
        workflow: {
          id: workflowToExport.id,
          name: workflowToExport.name,
          description: workflowToExport.description,
          status: workflowToExport.status,
          nodes: workflowToExport.nodes.length > 0 ? workflowToExport.nodes : workflowSteps,
          connections: workflowToExport.connections,
          settings: workflowToExport.settings,
          tags: workflowToExport.tags,
          version: workflowToExport.version
        },
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workflowToExport.name.toLowerCase().replace(/\s+/g, '-')}-config.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Workflow "${workflowToExport.name}" exported successfully!`)
      setShowExportDialog(false)
      setWorkflowToExport(null)
    } catch {
      toast.error('Failed to export workflow')
    }
  }, [workflowToExport, workflowSteps])

  // AI Insight action handler
  const handleInsightAction = useCallback((insight: { id: string; type: string; title: string }) => {
    toast.success(`Taking action on insight: ${insight.title}`)
    // Here you would implement actual insight action logic
  }, [])

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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows">
            {/* Workflows Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Automation</h2>
                  <p className="text-violet-100">n8n-level automation with visual workflow builder and 200+ integrations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWorkflows.length}</p>
                    <p className="text-violet-200 text-sm">Workflows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWorkflows.filter(w => w.status === 'active').length}</p>
                    <p className="text-violet-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.totalExecutions}</p>
                    <p className="text-violet-200 text-sm">Executions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflows Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Workflow', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: handleCreateWorkflow },
                { icon: Upload, label: 'Import', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: handleImportWorkflow },
                { icon: Play, label: 'Run All', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: handleRunAllWorkflows },
                { icon: Pause, label: 'Pause All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: handlePauseAllWorkflows },
                { icon: Copy, label: 'Duplicate', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => handleDuplicateWorkflow('Selected Workflow') },
                { icon: Download, label: 'Export', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleExportWorkflows },
                { icon: History, label: 'History', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: handleViewHistory },
                { icon: Settings, label: 'Settings', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleWorkflowSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                <Button variant="outline" onClick={handleFilter} aria-label="Filter">
                  <Filter className="w-4 h-4 mr-2" />Filter</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
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
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleWorkflowCardMore(workflow.name) }}>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-center text-sm mb-4">
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
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleWorkflowCardSettings(workflow.name) }}><Settings className="w-3 h-3" /></Button>
                          {workflow.status === 'active' ? (
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handlePauseWorkflow(workflow.name) }}><Pause className="w-3 h-3" /></Button>
                          ) : workflow.status !== 'archived' && (
                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handlePlayWorkflow(workflow.name) }}><Play className="w-3 h-3" /></Button>
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
            {/* Executions Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Execution Monitor</h2>
                  <p className="text-emerald-100">Real-time execution tracking with logs, metrics, and error handling</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockExecutions.filter(e => e.status === 'success').length}</p>
                    <p className="text-emerald-200 text-sm">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockExecutions.filter(e => e.status === 'running').length}</p>
                    <p className="text-emerald-200 text-sm">Running</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockExecutions.filter(e => e.status === 'error').length}</p>
                    <p className="text-emerald-200 text-sm">Failed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Executions Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Play, label: 'Run Now', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: handleRunNow },
                { icon: Pause, label: 'Stop All', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: handleStopAll },
                { icon: RefreshCw, label: 'Retry Failed', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: handleRetryFailed },
                { icon: Bug, label: 'Debug', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: handleDebug },
                { icon: Eye, label: 'Live View', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: handleLiveView },
                { icon: Download, label: 'Export Logs', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: handleExportLogs },
                { icon: Trash2, label: 'Clear', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: handleClearExecutions },
                { icon: Settings, label: 'Settings', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: handleExecutionSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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
                        <Button size="sm" variant="ghost" onClick={() => handleViewExecution(execution.workflowName)}><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nodes Tab */}
          <TabsContent value="nodes">
            {/* Nodes Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Node Library</h2>
                  <p className="text-blue-100">200+ pre-built integrations and custom node development</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{NODE_DEFINITIONS.filter(n => n.category === 'trigger').length}</p>
                    <p className="text-blue-200 text-sm">Triggers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{NODE_DEFINITIONS.filter(n => n.category === 'action').length}</p>
                    <p className="text-blue-200 text-sm">Actions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{NODE_DEFINITIONS.length}</p>
                    <p className="text-blue-200 text-sm">Total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nodes Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Create Node', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: handleCreateNode },
                { icon: Download, label: 'Import', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: handleImportNode },
                { icon: Code, label: 'Custom Code', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: handleCustomCode },
                { icon: Webhook, label: 'Webhooks', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: handleWebhooks },
                { icon: Database, label: 'Data', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: handleDataNodes },
                { icon: Mail, label: 'Email', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: handleEmailNodes },
                { icon: Globe, label: 'HTTP', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: handleHttpNodes },
                { icon: Star, label: 'Favorites', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleFavoriteNodes },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
            {/* Templates Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Templates</h2>
                  <p className="text-amber-100">Pre-built automations to jumpstart your workflows in minutes</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTemplates.length}</p>
                    <p className="text-amber-200 text-sm">Templates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTemplates.filter(t => t.featured).length}</p>
                    <p className="text-amber-200 text-sm">Featured</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Sparkles, label: 'Featured', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleFeaturedTemplates },
                { icon: Star, label: 'Popular', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: handlePopularTemplates },
                { icon: Clock, label: 'Recent', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleRecentTemplates },
                { icon: Mail, label: 'Email', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: handleEmailTemplates },
                { icon: Database, label: 'Data Sync', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: handleDataSyncTemplates },
                { icon: MessageSquare, label: 'Chat', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: handleChatTemplates },
                { icon: Upload, label: 'Create', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: handleCreateTemplate },
                { icon: Share2, label: 'Share', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: handleShareTemplate },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  onClick={action.onClick}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
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
                    <Button className="w-full mt-4" variant="outline" onClick={() => handleUseTemplate(template.name)}>Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials">
            {/* Credentials Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Credentials Vault</h2>
                  <p className="text-slate-100">Enterprise-grade secret management with encryption at rest</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCredentials.length}</p>
                    <p className="text-slate-200 text-sm">Credentials</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCredentials.filter(c => c.isShared).length}</p>
                    <p className="text-slate-200 text-sm">Shared</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Credentials Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Key', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: handleAddKey },
                { icon: Key, label: 'API Keys', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', onClick: handleApiKeys },
                { icon: Lock, label: 'OAuth', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400', onClick: handleOAuth },
                { icon: Shield, label: 'Security', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400', onClick: handleSecuritySettings },
                { icon: Users, label: 'Share', color: 'bg-stone-100 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400', onClick: handleShareCredentials },
                { icon: RefreshCw, label: 'Rotate', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleRotateCredentials },
                { icon: Download, label: 'Export', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: handleExportCredentials },
                { icon: Settings, label: 'Settings', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleCredentialSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Credentials</h2>
                  <p className="text-gray-500">Manage API keys and authentication</p>
                </div>
                <Button onClick={handleAddCredential}><Plus className="w-4 h-4 mr-2" />Add Credential</Button>
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
                        <Button variant="ghost" size="sm" onClick={() => handleCredentialItemSettings(cred.name)}><Settings className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCredential(cred.name)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Variables Tab */}
          <TabsContent value="variables">
            {/* Variables Banner */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Environment Variables</h2>
                  <p className="text-teal-100">Global configuration and secrets management across workflows</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVariables.length}</p>
                    <p className="text-teal-200 text-sm">Variables</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockVariables.filter(v => v.isSecret).length}</p>
                    <p className="text-teal-200 text-sm">Secrets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Variables Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Variable', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: handleAddVariable },
                { icon: Lock, label: 'Add Secret', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: handleAddSecret },
                { icon: Upload, label: 'Import', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleImportVariables },
                { icon: Download, label: 'Export', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: handleExportVariables },
                { icon: Copy, label: 'Duplicate', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: handleDuplicateVariable },
                { icon: RefreshCw, label: 'Sync', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: handleSyncVariables },
                { icon: Eye, label: 'View All', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: handleViewAllVariables },
                { icon: Settings, label: 'Settings', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleVariableSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Variables</h2>
                  <p className="text-gray-500">Global variables available in all workflows</p>
                </div>
                <Button onClick={handleAddVariable}><Plus className="w-4 h-4 mr-2" />Add Variable</Button>
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
                          <Button variant="ghost" size="sm" onClick={() => handleVariableItemSettings(variable.key)}><Settings className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Make.com Level Configuration */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-gray-700 via-slate-700 to-zinc-700 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Settings</h2>
                  <p className="text-gray-100">Configure execution, notifications, security, and advanced options</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-gray-200 text-sm">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-gray-200 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Settings, label: 'General', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', onClick: () => { setSettingsTab('general'); handleGeneralSettings() } },
                { icon: Play, label: 'Execution', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => { setSettingsTab('execution'); handleExecutionSettingsNav() } },
                { icon: Bell, label: 'Alerts', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400', onClick: () => { setSettingsTab('notifications'); handleAlertsSettings() } },
                { icon: Shield, label: 'Security', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400', onClick: () => { setSettingsTab('security'); handleSecuritySettingsNav() } },
                { icon: Network, label: 'Integrations', color: 'bg-stone-100 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400', onClick: () => { setSettingsTab('integrations'); handleIntegrationsSettings() } },
                { icon: Sliders, label: 'Advanced', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => { setSettingsTab('advanced'); handleAdvancedSettings() } },
                { icon: Save, label: 'Save All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: handleSaveAllSettings },
                { icon: RotateCcw, label: 'Reset', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: handleResetSettings },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-2">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'execution', label: 'Execution', icon: Play },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'integrations', label: 'Integrations', icon: Network },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>

                    {/* System Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400">System Health</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">API Usage</span>
                          <span className="font-medium text-green-600">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Operations</span>
                          <span className="font-medium text-blue-600">12.4K/25K</span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Workers</span>
                          <span className="font-medium text-purple-600">8 active</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3">Organization</h4>
                      <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>Plan</span>
                          <Badge className="bg-violet-500 text-xs">Pro</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Workflows</span>
                          <span>24 active</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Team</span>
                          <span>8 members</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Uptime</span>
                          <span className="text-green-600">99.9%</span>
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
                          <Settings className="h-5 w-5 text-violet-600" />
                          Organization Settings
                        </CardTitle>
                        <CardDescription>Configure your workspace preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="Acme Automations" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Auto-save Workflows</Label><p className="text-sm text-gray-500">Save changes automatically</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Show Debug Panel</Label><p className="text-sm text-gray-500">Display execution logs in editor</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="h-5 w-5 text-blue-600" />
                          Default Workflow Settings
                        </CardTitle>
                        <CardDescription>Configure defaults for new workflows</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default Retry Count</Label>
                            <Select defaultValue="3">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No Retries</SelectItem>
                                <SelectItem value="1">1 Retry</SelectItem>
                                <SelectItem value="3">3 Retries</SelectItem>
                                <SelectItem value="5">5 Retries</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Retry Delay (seconds)</Label>
                            <Input type="number" defaultValue="10" min={1} max={3600} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Continue on Error</Label><p className="text-sm text-gray-500">Continue execution if node fails</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Always Output Data</Label><p className="text-sm text-gray-500">Output empty data on error</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Execution Settings */}
                {settingsTab === 'execution' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-green-600" />
                          Execution Settings
                        </CardTitle>
                        <CardDescription>Configure how workflows execute</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Execution Timeout (minutes)</Label>
                            <Input type="number" defaultValue="60" min={1} max={1440} />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Concurrent Executions</Label>
                            <Input type="number" defaultValue="10" min={1} max={100} />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Execution Mode</Label>
                            <Select defaultValue="regular">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="queue">Queue</SelectItem>
                                <SelectItem value="worker">Worker Mode</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Queue Mode</Label>
                            <Select defaultValue="redis">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="memory">In-Memory</SelectItem>
                                <SelectItem value="redis">Redis</SelectItem>
                                <SelectItem value="sqs">AWS SQS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Parallel Execution</Label><p className="text-sm text-gray-500">Run parallel branches concurrently</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="h-5 w-5 text-amber-600" />
                          Execution History
                        </CardTitle>
                        <CardDescription>Configure data retention</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Keep Execution Data</Label>
                            <Select defaultValue="30">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="14">14 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="90">90 Days</SelectItem>
                                <SelectItem value="forever">Forever</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Executions to Store</Label>
                            <Input type="number" defaultValue="10000" min={100} max={100000} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Save Execution Data</Label><p className="text-sm text-gray-500">Store input/output data</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Prune After Success</Label><p className="text-sm text-gray-500">Delete data after completion</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-amber-600" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Notification Email</Label>
                          <Input type="email" defaultValue="alerts@company.com" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Workflow Failures</Label><p className="text-sm text-gray-500">Email on execution errors</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Daily Summary</Label><p className="text-sm text-gray-500">Daily execution summary</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Weekly Report</Label><p className="text-sm text-gray-500">Weekly analytics report</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                          Slack Integration
                        </CardTitle>
                        <CardDescription>Send alerts to Slack</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Slack Webhook URL</Label>
                          <Input type="password" placeholder="https://hooks.slack.com/services/..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Default Channel</Label>
                          <Input defaultValue="#automation-alerts" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Enable Slack</Label><p className="text-sm text-gray-500">Send alerts to Slack</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          Access Control
                        </CardTitle>
                        <CardDescription>Configure security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Two-Factor Auth</Label><p className="text-sm text-gray-500">Require 2FA for all users</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">SSO</Label><p className="text-sm text-gray-500">Enable SAML SSO</p></div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">IP Whitelist</Label><p className="text-sm text-gray-500">Restrict to specific IPs</p></div>
                          <Switch />
                        </div>
                        <div className="space-y-2">
                          <Label>Session Timeout (minutes)</Label>
                          <Input type="number" defaultValue="60" min={5} max={1440} />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div><Label className="text-base">API Key</Label><p className="text-xs text-gray-500">For programmatic access</p></div>
                            <Button size="sm" variant="outline" onClick={() => toast.success('API key regenerated', { description: 'Your old key is now invalid' })}><RefreshCw className="h-4 w-4 mr-2" />Regenerate</Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="password" defaultValue="wf_api_xxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('wf_api_xxxxxxxxxxxxx'); toast.success('API Key Copied', { description: 'Key copied to clipboard' }); }}><Clipboard className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Audit Logging</Label><p className="text-sm text-gray-500">Log all API access</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-blue-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Configure webhook settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div><Label className="text-base">Webhook URL Base</Label></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input defaultValue="https://workflows.yourapp.com/webhook/" readOnly className="font-mono" />
                            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText('https://workflows.yourapp.com/webhook/'); toast.success('Webhook URL Copied', { description: 'URL copied to clipboard' }); }}><Clipboard className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Webhook Auth</Label><p className="text-sm text-gray-500">Require authentication</p></div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Request Timeout (seconds)</Label>
                          <Input type="number" defaultValue="30" min={5} max={300} />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-green-600" />
                          External Services
                        </CardTitle>
                        <CardDescription>Configure service connections</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>HTTP Proxy (Optional)</Label>
                          <Input placeholder="http://proxy:8080" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Verify SSL</Label><p className="text-sm text-gray-500">Validate SSL certificates</p></div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced */}
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
                            <Input type="number" defaultValue="4" min={1} max={32} />
                          </div>
                          <div className="space-y-2">
                            <Label>Worker Memory (MB)</Label>
                            <Input type="number" defaultValue="512" min={128} max={8192} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Auto-scale</Label><p className="text-sm text-gray-500">Adjust workers based on load</p></div>
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
                        <CardDescription>Configure debugging</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Log Level</Label>
                          <Select defaultValue="info">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warn">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="debug">Debug</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div><Label className="text-base">Debug Mode</Label><p className="text-sm text-gray-500">Enable detailed logging</p></div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Clear Executions</Label><p className="text-sm text-red-600/70">Delete all execution history</p></div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700" onClick={() => toast.success('Execution history cleared')}><Trash2 className="h-4 w-4 mr-2" />Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div><Label className="text-base text-red-700 dark:text-red-400">Delete All Workflows</Label><p className="text-sm text-red-600/70">Permanently delete everything</p></div>
                          <Button variant="destructive" onClick={() => toast.error('Delete All Workflows', { description: 'This action requires confirmation. Type DELETE to proceed.' })}><AlertOctagon className="h-4 w-4 mr-2" />Delete All</Button>
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
              insights={mockWorkflowAIInsights}
              title="Workflow Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockWorkflowCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockWorkflowPredictions}
              title="Workflow Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockWorkflowActivities}
            title="Workflow Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockWorkflowQuickActions}
            variant="grid"
          />
        </div>
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
              <Input
                placeholder="e.g., Lead Processing Pipeline"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this workflow does..."
                rows={3}
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                placeholder="e.g., leads, crm, automation"
                value={newWorkflowTags}
                onChange={(e) => setNewWorkflowTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWorkflowDialog(false)} disabled={isSaving}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleCreateWorkflowSubmit} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Workflow'}
            </Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleViewExecutionHistory(selectedWorkflow!)}>
              <History className="w-4 h-4 mr-2" />View History
            </Button>
            <Button variant="outline" onClick={() => handleCloneWorkflow(selectedWorkflow!)}>
              <Copy className="w-4 h-4 mr-2" />Clone
            </Button>
            <Button variant="outline" onClick={() => handleExportWorkflowConfig(selectedWorkflow!)}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
            <Button onClick={() => handleRunWorkflowWithConfirm(selectedWorkflow!)}>
              <Play className="w-4 h-4 mr-2" />Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={showAddStepDialog} onOpenChange={setShowAddStepDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add Workflow Step
            </DialogTitle>
            <DialogDescription>Configure a new step for your workflow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Step Type</Label>
              <Select value={newStepType} onValueChange={(v) => setNewStepType(v as NodeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NODE_DEFINITIONS.map(node => (
                    <SelectItem key={node.type} value={node.type}>
                      <span className="flex items-center gap-2">
                        {node.icon}
                        {node.displayName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Step Name</Label>
              <Input
                placeholder="e.g., Send Welcome Email"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Describe what this step does..."
                rows={2}
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStepDialog(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddStep}>
              <Plus className="w-4 h-4 mr-2" />Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={showEditStepDialog} onOpenChange={setShowEditStepDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Edit Step Configuration
            </DialogTitle>
            <DialogDescription>Modify the step settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Step Type</Label>
              <Select value={newStepType} onValueChange={(v) => setNewStepType(v as NodeType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NODE_DEFINITIONS.map(node => (
                    <SelectItem key={node.type} value={node.type}>
                      <span className="flex items-center gap-2">
                        {node.icon}
                        {node.displayName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Step Name</Label>
              <Input
                placeholder="e.g., Send Welcome Email"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Describe what this step does..."
                rows={2}
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStepDialog(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditStep}>
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Confirmation Dialog */}
      <AlertDialog open={showDeleteStepDialog} onOpenChange={setShowDeleteStepDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Step
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the step "{selectedStep?.displayName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteStep}>
              Delete Step
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Run Workflow Confirmation Dialog */}
      <AlertDialog open={showRunConfirmDialog} onOpenChange={setShowRunConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Run Workflow
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to run "{workflowToRun?.name}"? This will execute all steps in the workflow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={executeWorkflow}
              disabled={isRunning}
            >
              {isRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : 'Run Workflow'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Execution History Dialog */}
      <Dialog open={showExecutionHistoryDialog} onOpenChange={setShowExecutionHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600" />
              Execution History - {executionHistoryWorkflow?.name}
            </DialogTitle>
            <DialogDescription>View past executions and their results</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[50vh]">
            <div className="space-y-3 pr-4">
              {mockExecutions
                .filter(e => e.workflowId === executionHistoryWorkflow?.id || executionHistoryWorkflow?.name === e.workflowName)
                .map(execution => (
                  <div key={execution.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      {execution.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {execution.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                      {execution.status === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                      <div>
                        <p className="font-medium">Execution #{execution.id}</p>
                        <p className="text-sm text-gray-500">{formatTimeAgo(execution.startedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getExecutionStatusColor(execution.status)}>{execution.status}</Badge>
                      {execution.duration && <span className="text-sm">{formatDuration(execution.duration)}</span>}
                    </div>
                  </div>
                ))}
              {mockExecutions.filter(e => e.workflowId === executionHistoryWorkflow?.id || executionHistoryWorkflow?.name === e.workflowName).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No execution history found for this workflow</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExecutionHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Workflow Dialog */}
      <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-indigo-600" />
              Clone Workflow
            </DialogTitle>
            <DialogDescription>Create a copy of "{workflowToClone?.name}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Workflow Name</Label>
              <Input
                placeholder="Enter name for the cloned workflow"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloneDialog(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={executeCloneWorkflow}>
              <Copy className="w-4 h-4 mr-2" />Clone Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Workflow Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-600" />
              Export Workflow
            </DialogTitle>
            <DialogDescription>Export "{workflowToExport?.name}" configuration as JSON</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <p className="text-sm"><strong>Workflow:</strong> {workflowToExport?.name}</p>
              <p className="text-sm"><strong>Version:</strong> {workflowToExport?.version}</p>
              <p className="text-sm"><strong>Status:</strong> {workflowToExport?.status}</p>
              <p className="text-sm"><strong>Steps:</strong> {workflowToExport?.nodes.length || workflowSteps.length}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={executeExportWorkflow}>
              <Download className="w-4 h-4 mr-2" />Download JSON
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Template Dialog */}
      <Dialog open={showShareTemplateDialog} onOpenChange={setShowShareTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-violet-600" />
              Share Template
            </DialogTitle>
            <DialogDescription>Share your workflow template with team members or make it public</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Share with Team Members</Label>
              <Input placeholder="Enter email addresses (comma-separated)" />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select defaultValue="view">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="use">Can Use Template</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="admin">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-sm">Make Public</p>
                <p className="text-xs text-gray-500">Anyone with the link can view</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input value="https://app.freeflow.io/templates/..." readOnly className="flex-1" />
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText('https://app.freeflow.io/templates/...'); toast.success('Link copied to clipboard') }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareTemplateDialog(false)}>Cancel</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Sharing template...', success: () => { setShowShareTemplateDialog(false); return 'Template shared successfully' }, error: 'Failed to share' })}>
              <Share2 className="w-4 h-4 mr-2" />Share Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Credentials Dialog */}
      <Dialog open={showShareCredentialsDialog} onOpenChange={setShowShareCredentialsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-stone-600" />
              Share Credentials
            </DialogTitle>
            <DialogDescription>Share API keys and credentials with team members securely</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Select Credentials to Share</Label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {['OpenAI API Key', 'Stripe Secret Key', 'Supabase Service Key', 'AWS Access Key', 'Google Cloud API'].map((cred, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{cred}</p>
                      <p className="text-xs text-gray-500">Last updated 3 days ago</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Share with Team Members</Label>
              <Input placeholder="Enter email addresses (comma-separated)" />
            </div>
            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select defaultValue="never">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Shared credentials can be revoked at any time from Settings
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareCredentialsDialog(false)}>Cancel</Button>
            <Button className="bg-stone-600 hover:bg-stone-700" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Sharing credentials securely...', success: () => { setShowShareCredentialsDialog(false); return 'Credentials shared successfully' }, error: 'Failed to share' })}>
              <Lock className="w-4 h-4 mr-2" />Share Securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
