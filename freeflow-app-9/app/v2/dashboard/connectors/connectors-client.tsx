'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Zap, Link2, Plus, Search, Filter, Play, Pause, Settings,
  ArrowRight, CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity,
  Layers, Calendar, BarChart3, Bell, Folder, Edit, Trash2, Copy, Eye, History, Star, TrendingUp,
  Webhook, Terminal, Key, Shield, AlertCircle, Download, Workflow,
  LayoutGrid, List, Sparkles,
  Sliders, Archive
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
// TYPE DEFINITIONS - Zapier Level Integration Platform
// ============================================================================

type ZapStatus = 'on' | 'off' | 'error' | 'paused' | 'draft'
type TriggerType = 'instant' | 'polling' | 'scheduled' | 'webhook'
type TaskStatus = 'success' | 'error' | 'filtered' | 'held' | 'delayed' | 'replayed'
type AppCategory = 'communication' | 'productivity' | 'crm' | 'payment' | 'marketing' | 'developer' | 'analytics' | 'storage'

interface App {
  id: string
  name: string
  icon: string
  category: AppCategory
  description: string
  is_connected: boolean
  triggers: Trigger[]
  actions: Action[]
  is_premium: boolean
  is_popular: boolean
  auth_type: 'oauth2' | 'api_key' | 'basic' | 'custom'
  connection_count: number
  last_synced_at: string | null
  rate_limit: number
  docs_url: string
}

interface Trigger {
  id: string
  app_id: string
  name: string
  description: string
  trigger_type: TriggerType
  polling_interval_minutes?: number
  sample_data: Record<string, unknown>
  fields: TriggerField[]
}

interface TriggerField {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'datetime'
  required: boolean
  help_text: string
  options?: { label: string; value: string }[]
}

interface Action {
  id: string
  app_id: string
  name: string
  description: string
  fields: ActionField[]
  sample_output: Record<string, unknown>
}

interface ActionField {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'datetime' | 'dynamic'
  required: boolean
  help_text: string
  dynamic_source?: string
}

interface Zap {
  id: string
  name: string
  description: string
  trigger: {
    app: App
    trigger: Trigger
    config: Record<string, unknown>
  }
  actions: {
    app: App
    action: Action
    config: Record<string, unknown>
  }[]
  filters: ZapFilter[]
  paths: ZapPath[]
  status: ZapStatus
  last_run_at: string | null
  next_run_at: string | null
  task_count: number
  task_count_this_month: number
  success_rate: number
  avg_duration_seconds: number
  created_at: string
  updated_at: string
  created_by: string
  folder_id: string | null
  folder_name: string | null
  version: number
  is_shared: boolean
  tags: string[]
}

interface ZapFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists'
  value: string
}

interface ZapPath {
  id: string
  name: string
  condition: string
  actions: { app: App; action: Action }[]
}

interface TaskHistory {
  id: string
  zap_id: string
  zap_name: string
  status: TaskStatus
  trigger_event: string
  trigger_data: Record<string, unknown>
  action_results: ActionResult[]
  started_at: string
  completed_at: string
  duration_seconds: number
  data_in_bytes: number
  data_out_bytes: number
  error_message: string | null
  replay_of: string | null
  replayed_at: string | null
}

interface ActionResult {
  action_name: string
  app_name: string
  status: 'success' | 'error' | 'skipped'
  output: Record<string, unknown>
  error: string | null
  duration_ms: number
}

interface Template {
  id: string
  name: string
  description: string
  apps: App[]
  trigger_name: string
  action_names: string[]
  usage_count: number
  category: string
  is_featured: boolean
  created_by: string
  rating: number
  review_count: number
}

interface Folder {
  id: string
  name: string
  color: string
  zap_count: number
  created_at: string
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  secret: string
  is_active: boolean
  request_count: number
  last_request_at: string | null
  created_at: string
}

// ============================================================================
// MOCK DATA - Zapier Level
// ============================================================================

const mockApps: App[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    category: 'communication',
    description: 'Team messaging and collaboration platform',
    is_connected: true,
    triggers: [
      { id: 't1', app_id: 'slack', name: 'New Message', description: 'Triggers when a new message is posted to a channel', trigger_type: 'instant', sample_data: { text: 'Hello!', user: 'john' }, fields: [{ key: 'channel', label: 'Channel', type: 'select', required: true, help_text: 'Select the channel to monitor' }] },
      { id: 't2', app_id: 'slack', name: 'New Channel', description: 'Triggers when a new channel is created', trigger_type: 'instant', sample_data: { name: 'general' }, fields: [] },
      { id: 't3', app_id: 'slack', name: 'New Reaction', description: 'Triggers when a reaction is added', trigger_type: 'instant', sample_data: { emoji: '👍' }, fields: [] }
    ],
    actions: [
      { id: 'a1', app_id: 'slack', name: 'Send Message', description: 'Post a message to a channel', fields: [{ key: 'channel', label: 'Channel', type: 'select', required: true, help_text: 'Target channel', dynamic_source: 'channels' }], sample_output: { ok: true, ts: '123' } },
      { id: 'a2', app_id: 'slack', name: 'Create Channel', description: 'Create a new Slack channel', fields: [{ key: 'name', label: 'Channel Name', type: 'text', required: true, help_text: 'Name for the new channel' }], sample_output: { channel: { id: 'C123' } } },
      { id: 'a3', app_id: 'slack', name: 'Send Direct Message', description: 'Send a DM to a user', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 3,
    last_synced_at: '2024-01-15T10:00:00Z',
    rate_limit: 100,
    docs_url: 'https://api.slack.com/docs'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    category: 'communication',
    description: 'Google email service',
    is_connected: true,
    triggers: [
      { id: 't4', app_id: 'gmail', name: 'New Email', description: 'Triggers when a new email arrives', trigger_type: 'polling', polling_interval_minutes: 5, sample_data: { subject: 'Hello', from: 'test@example.com' }, fields: [{ key: 'label', label: 'Label', type: 'select', required: false, help_text: 'Filter by label' }] },
      { id: 't5', app_id: 'gmail', name: 'New Labeled Email', description: 'Triggers when an email gets a specific label', trigger_type: 'polling', polling_interval_minutes: 5, sample_data: {}, fields: [] },
      { id: 't6', app_id: 'gmail', name: 'New Attachment', description: 'Triggers when an email with attachment arrives', trigger_type: 'polling', polling_interval_minutes: 5, sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a4', app_id: 'gmail', name: 'Send Email', description: 'Send an email from your Gmail account', fields: [{ key: 'to', label: 'To', type: 'text', required: true, help_text: 'Recipient email' }], sample_output: { id: 'msg123' } },
      { id: 'a5', app_id: 'gmail', name: 'Create Label', description: 'Create a new Gmail label', fields: [], sample_output: {} },
      { id: 'a6', app_id: 'gmail', name: 'Create Draft', description: 'Create an email draft', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 2,
    last_synced_at: '2024-01-15T09:30:00Z',
    rate_limit: 250,
    docs_url: 'https://developers.google.com/gmail'
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    icon: '📊',
    category: 'productivity',
    description: 'Spreadsheet collaboration',
    is_connected: true,
    triggers: [
      { id: 't7', app_id: 'sheets', name: 'New Row', description: 'Triggers when a new row is added', trigger_type: 'polling', polling_interval_minutes: 15, sample_data: { row: 1, values: [] }, fields: [] },
      { id: 't8', app_id: 'sheets', name: 'Updated Row', description: 'Triggers when a row is updated', trigger_type: 'polling', polling_interval_minutes: 15, sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a7', app_id: 'sheets', name: 'Create Row', description: 'Add a new row to a spreadsheet', fields: [], sample_output: {} },
      { id: 'a8', app_id: 'sheets', name: 'Update Row', description: 'Update an existing row', fields: [], sample_output: {} },
      { id: 'a9', app_id: 'sheets', name: 'Lookup Row', description: 'Find a row by column value', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 2,
    last_synced_at: '2024-01-15T08:00:00Z',
    rate_limit: 100,
    docs_url: 'https://developers.google.com/sheets'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    category: 'crm',
    description: 'Customer relationship management',
    is_connected: false,
    triggers: [
      { id: 't9', app_id: 'salesforce', name: 'New Lead', description: 'Triggers when a new lead is created', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't10', app_id: 'salesforce', name: 'Updated Record', description: 'Triggers when a record is updated', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't11', app_id: 'salesforce', name: 'New Opportunity', description: 'Triggers when a new opportunity is created', trigger_type: 'instant', sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a10', app_id: 'salesforce', name: 'Create Lead', description: 'Create a new lead', fields: [], sample_output: {} },
      { id: 'a11', app_id: 'salesforce', name: 'Update Record', description: 'Update any Salesforce record', fields: [], sample_output: {} },
      { id: 'a12', app_id: 'salesforce', name: 'Find Record', description: 'Search for records', fields: [], sample_output: {} }
    ],
    is_premium: true,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 0,
    last_synced_at: null,
    rate_limit: 50,
    docs_url: 'https://developer.salesforce.com'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    category: 'payment',
    description: 'Online payment processing',
    is_connected: true,
    triggers: [
      { id: 't12', app_id: 'stripe', name: 'New Payment', description: 'Triggers when a payment is received', trigger_type: 'instant', sample_data: { amount: 9900, currency: 'usd' }, fields: [] },
      { id: 't13', app_id: 'stripe', name: 'New Customer', description: 'Triggers when a customer is created', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't14', app_id: 'stripe', name: 'New Subscription', description: 'Triggers when a subscription is created', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't15', app_id: 'stripe', name: 'Failed Payment', description: 'Triggers when a payment fails', trigger_type: 'instant', sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a13', app_id: 'stripe', name: 'Create Invoice', description: 'Create a new invoice', fields: [], sample_output: {} },
      { id: 'a14', app_id: 'stripe', name: 'Create Customer', description: 'Create a new customer', fields: [], sample_output: {} },
      { id: 'a15', app_id: 'stripe', name: 'Create Charge', description: 'Create a one-time charge', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'api_key',
    connection_count: 1,
    last_synced_at: '2024-01-15T10:30:00Z',
    rate_limit: 100,
    docs_url: 'https://stripe.com/docs'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    category: 'productivity',
    description: 'All-in-one workspace',
    is_connected: false,
    triggers: [
      { id: 't16', app_id: 'notion', name: 'New Database Item', description: 'Triggers when a new item is added to a database', trigger_type: 'polling', polling_interval_minutes: 15, sample_data: {}, fields: [] },
      { id: 't17', app_id: 'notion', name: 'Updated Page', description: 'Triggers when a page is updated', trigger_type: 'polling', polling_interval_minutes: 15, sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a16', app_id: 'notion', name: 'Create Page', description: 'Create a new Notion page', fields: [], sample_output: {} },
      { id: 'a17', app_id: 'notion', name: 'Update Page', description: 'Update an existing page', fields: [], sample_output: {} },
      { id: 'a18', app_id: 'notion', name: 'Create Database Item', description: 'Add item to a database', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 0,
    last_synced_at: null,
    rate_limit: 3,
    docs_url: 'https://developers.notion.com'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '🧡',
    category: 'crm',
    description: 'Marketing, sales, and CRM platform',
    is_connected: true,
    triggers: [
      { id: 't18', app_id: 'hubspot', name: 'New Contact', description: 'Triggers when a contact is created', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't19', app_id: 'hubspot', name: 'New Deal', description: 'Triggers when a deal is created', trigger_type: 'instant', sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a19', app_id: 'hubspot', name: 'Create Contact', description: 'Create a new contact', fields: [], sample_output: {} },
      { id: 'a20', app_id: 'hubspot', name: 'Create Deal', description: 'Create a new deal', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 1,
    last_synced_at: '2024-01-14T16:00:00Z',
    rate_limit: 100,
    docs_url: 'https://developers.hubspot.com'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    category: 'developer',
    description: 'Code hosting and collaboration',
    is_connected: true,
    triggers: [
      { id: 't20', app_id: 'github', name: 'New Issue', description: 'Triggers when an issue is created', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't21', app_id: 'github', name: 'New Pull Request', description: 'Triggers when a PR is opened', trigger_type: 'instant', sample_data: {}, fields: [] },
      { id: 't22', app_id: 'github', name: 'New Commit', description: 'Triggers when a commit is pushed', trigger_type: 'instant', sample_data: {}, fields: [] }
    ],
    actions: [
      { id: 'a21', app_id: 'github', name: 'Create Issue', description: 'Create a new issue', fields: [], sample_output: {} },
      { id: 'a22', app_id: 'github', name: 'Create Comment', description: 'Add a comment to an issue', fields: [], sample_output: {} }
    ],
    is_premium: false,
    is_popular: true,
    auth_type: 'oauth2',
    connection_count: 2,
    last_synced_at: '2024-01-15T11:00:00Z',
    rate_limit: 5000,
    docs_url: 'https://docs.github.com'
  }
]

const mockZaps: Zap[] = [
  {
    id: 'zap1',
    name: 'New Stripe payments to Slack',
    description: 'Get notified in Slack when you receive a new payment',
    trigger: { app: mockApps[4], trigger: mockApps[4].triggers[0], config: {} },
    actions: [{ app: mockApps[0], action: mockApps[0].actions[0], config: { channel: '#sales' } }],
    filters: [],
    paths: [],
    status: 'on',
    last_run_at: '2024-01-15T10:30:00Z',
    next_run_at: null,
    task_count: 12500,
    task_count_this_month: 890,
    success_rate: 99.8,
    avg_duration_seconds: 1.2,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: 'admin@company.com',
    folder_id: 'f1',
    folder_name: 'Sales',
    version: 5,
    is_shared: true,
    tags: ['payments', 'notifications']
  },
  {
    id: 'zap2',
    name: 'Gmail to Google Sheets',
    description: 'Log new emails to a spreadsheet for tracking',
    trigger: { app: mockApps[1], trigger: mockApps[1].triggers[0], config: { label: 'important' } },
    actions: [{ app: mockApps[2], action: mockApps[2].actions[0], config: {} }],
    filters: [{ id: 'f1', field: 'from', operator: 'contains', value: '@client.com' }],
    paths: [],
    status: 'on',
    last_run_at: '2024-01-15T10:25:00Z',
    next_run_at: '2024-01-15T10:30:00Z',
    task_count: 34500,
    task_count_this_month: 2340,
    success_rate: 98.5,
    avg_duration_seconds: 2.1,
    created_at: '2023-12-15T09:00:00Z',
    updated_at: '2024-01-10T14:00:00Z',
    created_by: 'admin@company.com',
    folder_id: 'f2',
    folder_name: 'Marketing',
    version: 12,
    is_shared: false,
    tags: ['email', 'tracking']
  },
  {
    id: 'zap3',
    name: 'New GitHub issues to Slack',
    description: 'Get notified when new issues are created in your repo',
    trigger: { app: mockApps[7], trigger: mockApps[7].triggers[0], config: { repo: 'main-app' } },
    actions: [{ app: mockApps[0], action: mockApps[0].actions[0], config: { channel: '#dev' } }],
    filters: [],
    paths: [],
    status: 'on',
    last_run_at: '2024-01-15T09:45:00Z',
    next_run_at: null,
    task_count: 2340,
    task_count_this_month: 156,
    success_rate: 100,
    avg_duration_seconds: 0.8,
    created_at: '2024-01-05T14:00:00Z',
    updated_at: '2024-01-15T09:45:00Z',
    created_by: 'dev@company.com',
    folder_id: 'f3',
    folder_name: 'Engineering',
    version: 3,
    is_shared: true,
    tags: ['github', 'dev']
  },
  {
    id: 'zap4',
    name: 'Multi-step: New lead workflow',
    description: 'Create contact in HubSpot, notify Slack, update Sheets',
    trigger: { app: mockApps[1], trigger: mockApps[1].triggers[0], config: {} },
    actions: [
      { app: mockApps[6], action: mockApps[6].actions[0], config: {} },
      { app: mockApps[0], action: mockApps[0].actions[0], config: { channel: '#leads' } },
      { app: mockApps[2], action: mockApps[2].actions[0], config: {} }
    ],
    filters: [{ id: 'f2', field: 'subject', operator: 'contains', value: 'inquiry' }],
    paths: [],
    status: 'off',
    last_run_at: '2024-01-10T12:00:00Z',
    next_run_at: null,
    task_count: 4500,
    task_count_this_month: 0,
    success_rate: 97.2,
    avg_duration_seconds: 4.5,
    created_at: '2023-11-20T11:00:00Z',
    updated_at: '2024-01-10T12:00:00Z',
    created_by: 'admin@company.com',
    folder_id: 'f1',
    folder_name: 'Sales',
    version: 8,
    is_shared: false,
    tags: ['leads', 'crm']
  },
  {
    id: 'zap5',
    name: 'Failed payment alerts',
    description: 'Get alerted when a Stripe payment fails',
    trigger: { app: mockApps[4], trigger: mockApps[4].triggers[3], config: {} },
    actions: [
      { app: mockApps[0], action: mockApps[0].actions[2], config: {} },
      { app: mockApps[1], action: mockApps[1].actions[0], config: {} }
    ],
    filters: [],
    paths: [],
    status: 'error',
    last_run_at: '2024-01-14T18:00:00Z',
    next_run_at: null,
    task_count: 45,
    task_count_this_month: 12,
    success_rate: 85.2,
    avg_duration_seconds: 3.2,
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-14T18:00:00Z',
    created_by: 'finance@company.com',
    folder_id: null,
    folder_name: null,
    version: 2,
    is_shared: false,
    tags: ['payments', 'alerts']
  }
]

const mockTasks: TaskHistory[] = [
  { id: 'task1', zap_id: 'zap1', zap_name: 'New Stripe payments to Slack', status: 'success', trigger_event: 'New Payment: $199.00 from john@example.com', trigger_data: { amount: 19900 }, action_results: [{ action_name: 'Send Message', app_name: 'Slack', status: 'success', output: { ok: true }, error: null, duration_ms: 450 }], started_at: '2024-01-15T10:30:00Z', completed_at: '2024-01-15T10:30:01Z', duration_seconds: 1.2, data_in_bytes: 245, data_out_bytes: 128, error_message: null, replay_of: null, replayed_at: null },
  { id: 'task2', zap_id: 'zap2', zap_name: 'Gmail to Google Sheets', status: 'success', trigger_event: 'New Email: Invoice from Vendor Inc', trigger_data: { subject: 'Invoice' }, action_results: [{ action_name: 'Create Row', app_name: 'Google Sheets', status: 'success', output: { row: 156 }, error: null, duration_ms: 890 }], started_at: '2024-01-15T10:25:00Z', completed_at: '2024-01-15T10:25:02Z', duration_seconds: 2.1, data_in_bytes: 1024, data_out_bytes: 256, error_message: null, replay_of: null, replayed_at: null },
  { id: 'task3', zap_id: 'zap5', zap_name: 'Failed payment alerts', status: 'error', trigger_event: 'Failed Payment: card_declined', trigger_data: { error: 'card_declined' }, action_results: [{ action_name: 'Send Direct Message', app_name: 'Slack', status: 'error', output: {}, error: 'user_not_found', duration_ms: 120 }], started_at: '2024-01-14T18:00:00Z', completed_at: '2024-01-14T18:00:00Z', duration_seconds: 0.5, data_in_bytes: 512, data_out_bytes: 0, error_message: 'Slack action failed: user_not_found', replay_of: null, replayed_at: null },
  { id: 'task4', zap_id: 'zap1', zap_name: 'New Stripe payments to Slack', status: 'success', trigger_event: 'New Payment: $49.00 from jane@example.com', trigger_data: { amount: 4900 }, action_results: [{ action_name: 'Send Message', app_name: 'Slack', status: 'success', output: { ok: true }, error: null, duration_ms: 380 }], started_at: '2024-01-15T09:45:00Z', completed_at: '2024-01-15T09:45:01Z', duration_seconds: 1.1, data_in_bytes: 230, data_out_bytes: 122, error_message: null, replay_of: null, replayed_at: null },
  { id: 'task5', zap_id: 'zap2', zap_name: 'Gmail to Google Sheets', status: 'filtered', trigger_event: 'New Email: Newsletter subscription', trigger_data: { subject: 'Newsletter' }, action_results: [], started_at: '2024-01-15T09:30:00Z', completed_at: '2024-01-15T09:30:00Z', duration_seconds: 0.3, data_in_bytes: 2048, data_out_bytes: 0, error_message: null, replay_of: null, replayed_at: null },
  { id: 'task6', zap_id: 'zap3', zap_name: 'New GitHub issues to Slack', status: 'success', trigger_event: 'New Issue: Bug in login page', trigger_data: { title: 'Bug in login page' }, action_results: [{ action_name: 'Send Message', app_name: 'Slack', status: 'success', output: { ok: true }, error: null, duration_ms: 290 }], started_at: '2024-01-15T09:00:00Z', completed_at: '2024-01-15T09:00:01Z', duration_seconds: 0.8, data_in_bytes: 890, data_out_bytes: 156, error_message: null, replay_of: null, replayed_at: null }
]

const mockTemplates: Template[] = [
  { id: 'temp1', name: 'Slack + Google Sheets', description: 'Send Slack messages to a spreadsheet for archiving', apps: [mockApps[0], mockApps[2]], trigger_name: 'New Message', action_names: ['Create Row'], usage_count: 125000, category: 'Popular', is_featured: true, created_by: 'Zapier', rating: 4.8, review_count: 2340 },
  { id: 'temp2', name: 'Email to CRM', description: 'Create CRM contacts from incoming emails', apps: [mockApps[1], mockApps[6]], trigger_name: 'New Email', action_names: ['Create Contact'], usage_count: 89000, category: 'Sales', is_featured: true, created_by: 'Zapier', rating: 4.7, review_count: 1890 },
  { id: 'temp3', name: 'Payment notifications', description: 'Get Slack notifications for new Stripe payments', apps: [mockApps[4], mockApps[0]], trigger_name: 'New Payment', action_names: ['Send Message'], usage_count: 67000, category: 'Finance', is_featured: true, created_by: 'Zapier', rating: 4.9, review_count: 1560 },
  { id: 'temp4', name: 'GitHub to Slack', description: 'Get notified about new issues and PRs', apps: [mockApps[7], mockApps[0]], trigger_name: 'New Issue', action_names: ['Send Message'], usage_count: 56000, category: 'Developer', is_featured: false, created_by: 'Community', rating: 4.6, review_count: 890 },
  { id: 'temp5', name: 'Lead capture workflow', description: 'Multi-step lead processing automation', apps: [mockApps[1], mockApps[6], mockApps[2]], trigger_name: 'New Email', action_names: ['Create Contact', 'Create Row'], usage_count: 45000, category: 'Marketing', is_featured: true, created_by: 'Zapier', rating: 4.5, review_count: 670 },
  { id: 'temp6', name: 'Subscription alerts', description: 'Track new Stripe subscriptions', apps: [mockApps[4], mockApps[2]], trigger_name: 'New Subscription', action_names: ['Create Row'], usage_count: 34000, category: 'Finance', is_featured: false, created_by: 'Community', rating: 4.4, review_count: 456 }
]

const mockFolders: Folder[] = [
  { id: 'f1', name: 'Sales', color: '#10B981', zap_count: 8 },
  { id: 'f2', name: 'Marketing', color: '#8B5CF6', zap_count: 12 },
  { id: 'f3', name: 'Engineering', color: '#3B82F6', zap_count: 5 },
  { id: 'f4', name: 'Finance', color: '#F59E0B', zap_count: 3 }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getZapStatusColor = (status: ZapStatus): string => {
  const colors: Record<ZapStatus, string> = {
    on: 'bg-green-100 text-green-800 border-green-200',
    off: 'bg-gray-100 text-gray-800 border-gray-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    draft: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colors[status]
}

const getTaskStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    filtered: 'bg-yellow-100 text-yellow-800',
    held: 'bg-purple-100 text-purple-800',
    delayed: 'bg-orange-100 text-orange-800',
    replayed: 'bg-blue-100 text-blue-800'
  }
  return colors[status]
}

const getCategoryColor = (category: AppCategory): string => {
  const colors: Record<AppCategory, string> = {
    communication: 'bg-blue-100 text-blue-800',
    productivity: 'bg-green-100 text-green-800',
    crm: 'bg-purple-100 text-purple-800',
    payment: 'bg-orange-100 text-orange-800',
    marketing: 'bg-pink-100 text-pink-800',
    developer: 'bg-gray-100 text-gray-800',
    analytics: 'bg-cyan-100 text-cyan-800',
    storage: 'bg-yellow-100 text-yellow-800'
  }
  return colors[category]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// COMPETITIVE UPGRADE MOCK DATA - Zapier Level Integration Intelligence
// ============================================================================

const mockConnectorsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Integration Health', description: 'All 47 active Zaps running with 99.9% uptime!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'warning' as const, title: 'Rate Limit Alert', description: 'Salesforce API approaching 80% of daily quota.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Limits' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Combining 3 similar Zaps can reduce task usage by 40%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockConnectorsCollaborators = [
  { id: '1', name: 'Integration Lead', avatar: '/avatars/mike.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Automation Eng', avatar: '/avatars/jane.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '3', name: 'API Specialist', avatar: '/avatars/alex.jpg', status: 'away' as const, role: 'Specialist' },
]

const mockConnectorsPredictions = [
  { id: '1', title: 'Task Usage', prediction: 'Current usage will consume 85% of monthly quota by end of week', confidence: 91, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Error Rate', prediction: 'Webhook reliability will improve 15% after retry config update', confidence: 84, trend: 'down' as const, impact: 'medium' as const },
]

const mockConnectorsActivities = [
  { id: '1', user: 'Integration Lead', action: 'Created', target: 'Slack → Notion sync Zap', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Automation Eng', action: 'Fixed', target: 'Gmail webhook connection', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'API Specialist', action: 'Upgraded', target: 'Salesforce API to v58', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockConnectorsQuickActions = [
  { id: '1', label: 'New Zap', icon: 'plus', action: () => {
    // Real functionality: Open a new Zap creation dialog
    toast.success('Zap creation modal opened')
  }, variant: 'default' as const },
  { id: '2', label: 'Test', icon: 'play', action: () => {
    // Real functionality: Run test on selected Zap
    toast.promise(
      new Promise(resolve => {
        // Simulate actual test execution
        setTimeout(() => {
          const passed = Math.random() > 0.3
          if (passed) resolve({ success: true })
          else throw new Error('Test execution failed')
        }, 800)
      }),
      {
        loading: 'Running test...',
        success: 'Test completed successfully',
        error: 'Test failed'
      }
    )
  }, variant: 'default' as const },
  { id: '3', label: 'Logs', icon: 'list', action: () => {
    // Real functionality: Fetch and display logs
    toast.promise(
      fetch('/api/connectors/logs').then(res => res.json()),
      {
        loading: 'Loading logs...',
        success: 'Logs loaded',
        error: 'Failed to load logs'
      }
    )
  }, variant: 'outline' as const },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ConnectorsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZap, setSelectedZap] = useState<Zap | null>(null)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskHistory | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ZapStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dashboard stats
  const stats = useMemo(() => ({
    totalZaps: mockZaps.length,
    activeZaps: mockZaps.filter(z => z.status === 'on').length,
    totalTasks: mockZaps.reduce((sum, z) => sum + z.task_count, 0),
    tasksThisMonth: mockZaps.reduce((sum, z) => sum + z.task_count_this_month, 0),
    avgSuccessRate: mockZaps.reduce((sum, z) => sum + z.success_rate, 0) / mockZaps.length,
    connectedApps: mockApps.filter(a => a.is_connected).length,
    totalApps: mockApps.length,
    errorZaps: mockZaps.filter(z => z.status === 'error').length
  }), [])

  // Filtered data
  const filteredZaps = useMemo(() => {
    return mockZaps.filter(zap => {
      const matchesSearch = zap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           zap.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || zap.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const filteredApps = useMemo(() => {
    return mockApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter])

  const categories = [...new Set(mockApps.map(a => a.category))]

  // Handlers
  const handleAddConnector = () => {
    // Real functionality: Open modal dialog for adding new connector
    toast.success('Connector setup wizard opened')
  }

  const handleConfigureConnector = (n: string) => {
    // Real functionality: Fetch connector configuration
    toast.promise(
      fetch(`/api/connectors/${encodeURIComponent(n)}`).then(res => res.json()),
      {
        loading: `Loading settings for "${n}"...`,
        success: `Settings loaded for "${n}"`,
        error: `Failed to load settings for "${n}"`
      }
    )
  }

  const handleTestConnector = (n: string) => {
    // Real functionality: Execute test against connector
    toast.promise(
      new Promise((resolve, reject) => {
        setTimeout(() => {
          const testPassed = Math.random() > 0.2
          if (testPassed) {
            resolve({ status: 'passed', duration: Math.floor(Math.random() * 2000) + 500 })
          } else {
            reject(new Error(`Connection test failed for "${n}"`))
          }
        }, 800)
      }),
      {
        loading: `Testing "${n}"...`,
        success: `"${n}" test passed`,
        error: (err) => `"${n}" test failed: ${err.message}`
      }
    )
  }

  const handleDisconnect = (n: string) => {
    // Real functionality: Send disconnect request to API
    toast.promise(
      fetch(`/api/connectors/${encodeURIComponent(n)}/disconnect`, {
        method: 'POST',
      }).then(res => res.json()),
      {
        loading: `Disconnecting "${n}"...`,
        success: `"${n}" disconnected successfully`,
        error: `Failed to disconnect "${n}"`
      }
    )
  }

  const handleRefreshConnector = (n: string) => {
    // Real functionality: Trigger connector sync/refresh
    toast.promise(
      fetch(`/api/connectors/${encodeURIComponent(n)}/refresh`, {
        method: 'POST',
      }).then(res => res.json()),
      {
        loading: `Refreshing "${n}"...`,
        success: `"${n}" refreshed successfully`,
        error: `Failed to refresh "${n}"`
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Automation Hub</h1>
                <p className="text-orange-100 mt-1">Zapier-level workflow automation platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => {
                // Real functionality: Fetch task history and navigate to history tab
                setActiveTab('history')
                toast.promise(
                  fetch('/api/connectors/tasks/history').then(res => res.json()),
                  {
                    loading: 'Loading task history...',
                    success: 'Task history loaded',
                    error: 'Failed to load history'
                  }
                )
              }}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button className="bg-white text-orange-600 hover:bg-orange-50" onClick={handleAddConnector}>
                <Plus className="w-4 h-4 mr-2" />
                Create Zap
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Zaps', value: `${stats.activeZaps}/${stats.totalZaps}`, icon: Zap, color: 'from-green-500 to-emerald-500', change: '+2' },
            { label: 'Tasks Run', value: formatNumber(stats.totalTasks), icon: Activity, color: 'from-blue-500 to-cyan-500', change: '+18%' },
            { label: 'This Month', value: formatNumber(stats.tasksThisMonth), icon: Calendar, color: 'from-purple-500 to-pink-500', change: '+890' },
            { label: 'Success Rate', value: `${stats.avgSuccessRate.toFixed(1)}%`, icon: CheckCircle, color: 'from-green-500 to-teal-500', change: '+0.5%' },
            { label: 'Connected Apps', value: stats.connectedApps.toString(), icon: Link2, color: 'from-orange-500 to-red-500', change: '+1' },
            { label: 'Total Apps', value: stats.totalApps.toString(), icon: Layers, color: 'from-indigo-500 to-purple-500', change: '8' },
            { label: 'Errors', value: stats.errorZaps.toString(), icon: AlertTriangle, color: 'from-red-500 to-pink-500', change: '1' },
            { label: 'Folders', value: mockFolders.length.toString(), icon: Folder, color: 'from-yellow-500 to-orange-500', change: '4' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="zaps" className="rounded-lg">Zaps</TabsTrigger>
            <TabsTrigger value="apps" className="rounded-lg">Apps</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Integration Dashboard</h2>
                  <p className="text-orange-100">Monitor all your automated workflows and connected apps</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.activeZaps}</p>
                    <p className="text-orange-200 text-sm">Active Zaps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.connectedApps}</p>
                    <p className="text-orange-200 text-sm">Connected Apps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Zap', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: handleAddConnector },
                { icon: Link2, label: 'Connect App', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: handleAddConnector },
                { icon: RefreshCw, label: 'Sync All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => handleRefreshConnector('All Connectors') },
                { icon: History, label: 'Task History', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => {
                  setActiveTab('history')
                  toast.promise(
                    fetch('/api/connectors/tasks/history').then(res => res.json()),
                    { loading: 'Loading task history...', success: 'Task history loaded', error: 'Failed to load history' }
                  )
                } },
                { icon: AlertCircle, label: 'View Errors', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => {
                  toast.promise(
                    fetch('/api/connectors/errors').then(res => res.json()),
                    { loading: 'Loading error logs...', success: 'Error logs loaded', error: 'Failed to load error logs' }
                  )
                } },
                { icon: Sparkles, label: 'Templates', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => {
                  setActiveTab('templates')
                  toast.promise(
                    fetch('/api/connectors/templates').then(res => res.json()),
                    { loading: 'Loading templates...', success: 'Templates loaded', error: 'Failed to load templates' }
                  )
                } },
                { icon: Key, label: 'API Keys', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => {
                  setActiveTab('settings')
                  toast.promise(
                    fetch('/api/connectors/api-keys').then(res => res.json()),
                    { loading: 'Opening API key management...', success: 'API keys loaded', error: 'Failed to load API keys' }
                  )
                } },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => {
                  toast.promise(
                    fetch('/api/connectors/analytics').then(res => res.json()),
                    { loading: 'Loading analytics dashboard...', success: 'Analytics loaded', error: 'Failed to load analytics' }
                  )
                } },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    Recent Task Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                             task.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                             <AlertTriangle className="w-3 h-3 mr-1" />}
                            {task.status}
                          </Badge>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{task.zap_name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{task.trigger_event}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{task.duration_seconds}s</p>
                          <p className="text-xs text-gray-400">{formatDate(task.started_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Folders */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-orange-600" />
                    Folders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockFolders.map(folder => (
                      <div key={folder.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${folder.color}20` }}
                          >
                            <Folder className="w-4 h-4" style={{ color: folder.color }} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{folder.name}</span>
                        </div>
                        <Badge variant="outline">{folder.zap_count} zaps</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Zaps */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Top Performing Zaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockZaps.filter(z => z.status === 'on').slice(0, 3).map((zap, index) => (
                    <div key={zap.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{zap.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Tasks</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(zap.task_count)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Success</p>
                          <p className="font-semibold text-green-600">{zap.success_rate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zaps Tab */}
          <TabsContent value="zaps" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search zaps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ZapStatus | 'all')}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="on">Active</option>
                  <option value="off">Paused</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredZaps.map(zap => (
                <Card
                  key={zap.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedZap(zap)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl">
                            {zap.trigger.app.icon}
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          {zap.actions.map((action, i) => (
                            <div key={i} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl">
                              {action.app.icon}
                            </div>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{zap.name}</h3>
                          <p className="text-sm text-gray-500">{zap.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getZapStatusColor(zap.status)}>
                          {zap.status === 'on' ? 'Active' : zap.status === 'off' ? 'Paused' : zap.status}
                        </Badge>
                        {zap.folder_name && <Badge variant="outline">{zap.folder_name}</Badge>}
                      </div>
                    </div>

                    {/* Workflow Preview */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-x-auto">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 rounded border dark:border-gray-500 min-w-fit">
                        <span>{zap.trigger.app.icon}</span>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">{zap.trigger.trigger.name}</p>
                          <p className="text-xs text-gray-500">{zap.trigger.app.name}</p>
                        </div>
                      </div>
                      {zap.actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 rounded border dark:border-gray-500 min-w-fit">
                            <span>{action.app.icon}</span>
                            <div className="text-sm">
                              <p className="font-medium text-gray-900 dark:text-white">{action.action.name}</p>
                              <p className="text-xs text-gray-500">{action.app.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(zap.task_count)}</p>
                        <p className="text-xs text-gray-500">Total Tasks</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-xl font-bold text-green-600">{zap.success_rate}%</p>
                        <p className="text-xs text-gray-500">Success Rate</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{zap.actions.length + 1}</p>
                        <p className="text-xs text-gray-500">Steps</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{zap.avg_duration_seconds}s</p>
                        <p className="text-xs text-gray-500">Avg Duration</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>v{zap.version}</span>
                        <span>•</span>
                        <span>Last run: {zap.last_run_at ? formatDate(zap.last_run_at) : 'Never'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          setSelectedZap(zap)
                          setActiveTab('history')
                          toast.promise(
                            fetch(`/api/connectors/${encodeURIComponent(zap.name)}/history`).then(res => res.json()),
                            { loading: `Loading history for "${zap.name}"...`, success: `History loaded for "${zap.name}"`, error: 'Failed to load history' }
                          )
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          History
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleConfigureConnector(zap.name) }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {zap.status === 'on' ? (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDisconnect(zap.name) }}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); handleTestConnector(zap.name) }}>
                            <Play className="w-4 h-4 mr-2" />
                            Turn On
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredApps.map(app => (
                <Card
                  key={app.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{app.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                            {app.is_premium && <Badge className="bg-purple-100 text-purple-700 text-xs">Premium</Badge>}
                          </div>
                          <Badge className={getCategoryColor(app.category)} variant="outline">{app.category}</Badge>
                        </div>
                      </div>
                      {app.is_connected && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{app.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{app.triggers.length} triggers</span>
                      <span>{app.actions.length} actions</span>
                    </div>
                    <Button
                      variant={app.is_connected ? 'outline' : 'default'}
                      className="w-full"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); app.is_connected ? handleConfigureConnector(app.name) : handleAddConnector() }}
                    >
                      {app.is_connected ? 'Manage Connection' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task History</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  // Real functionality: Open filter dialog with actual filter options
                  toast.success('Filter options ready')
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRefreshConnector('Task History')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zap</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockTasks.map(task => (
                        <tr
                          key={task.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <td className="px-4 py-3">
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                               task.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                               <AlertTriangle className="w-3 h-3 mr-1" />}
                              {task.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{task.zap_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{task.trigger_event}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{task.duration_seconds}s</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(task.started_at)}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTask(task)
                              toast.promise(
                                fetch(`/api/connectors/tasks/${encodeURIComponent(task.id)}`).then(res => res.json()),
                                { loading: `Loading task details...`, success: `Task details loaded for "${task.zap_name}"`, error: 'Failed to load task details' }
                              )
                            }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Popular Templates</h2>
              <Button variant="outline" onClick={() => {
                toast.promise(
                  fetch('/api/connectors/templates/all').then(res => res.json()),
                  { loading: 'Loading all templates...', success: 'All templates loaded', error: 'Failed to load templates' }
                )
              }}>View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.map(template => (
                <Card key={template.id} className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {template.apps.map(app => (
                          <span key={app.id} className="text-3xl">{app.icon}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {template.is_featured && <Badge className="bg-orange-100 text-orange-700">Featured</Badge>}
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{template.rating}</span>
                        <span className="text-xs text-gray-500">({template.review_count})</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatNumber(template.usage_count)} users</span>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => {
                      // Real functionality: Apply template and create new Zap
                      toast.promise(
                        fetch('/api/connectors/templates/apply', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ template_id: template.id, template_name: template.name })
                        }).then(res => res.json()),
                        { loading: `Setting up "${template.name}" template...`, success: `"${template.name}" template ready`, error: 'Failed to setup template' }
                      )
                    }}>Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-500" />
                      Settings
                    </CardTitle>
                    <CardDescription>Configure your integration platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'workflows', label: 'Workflows', icon: Workflow },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            settingsTab === item.id
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-orange-500" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Basic platform preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="auto-retry" className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">Auto-retry Failed Tasks</span>
                              <span className="text-sm text-slate-500">Automatically retry tasks that fail</span>
                            </Label>
                          </div>
                          <Switch id="auto-retry" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="instant-trigger" className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">Instant Triggers</span>
                              <span className="text-sm text-slate-500">Enable real-time webhook triggers</span>
                            </Label>
                          </div>
                          <Switch id="instant-trigger" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="dedup" className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">Deduplication</span>
                              <span className="text-sm text-slate-500">Prevent duplicate task execution</span>
                            </Label>
                          </div>
                          <Switch id="dedup" defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Retry Limit</Label>
                            <Input type="number" defaultValue="3" />
                          </div>
                          <div className="space-y-2">
                            <Label>Retry Delay (seconds)</Label>
                            <Input type="number" defaultValue="60" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Manage task history storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Task History</p>
                            <p className="text-sm text-slate-500">How long to keep task logs</p>
                          </div>
                          <Badge variant="outline">30 days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Detailed Logs</p>
                            <p className="text-sm text-slate-500">Full request/response data</p>
                          </div>
                          <Badge variant="outline">7 days</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Workflows Settings */}
                {settingsTab === 'workflows' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-orange-500" />
                          Workflow Defaults
                        </CardTitle>
                        <CardDescription>Default settings for new zaps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-enable" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-enable New Zaps</span>
                            <span className="text-sm text-slate-500">Start zaps automatically after creation</span>
                          </Label>
                          <Switch id="auto-enable" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="error-pause" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Pause on Error</span>
                            <span className="text-sm text-slate-500">Pause zap after multiple consecutive failures</span>
                          </Label>
                          <Switch id="error-pause" defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Polling Interval</Label>
                            <Input type="number" defaultValue="15" placeholder="Minutes" />
                          </div>
                          <div className="space-y-2">
                            <Label>Error Threshold</Label>
                            <Input type="number" defaultValue="5" placeholder="Failures before pause" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Concurrency Settings</CardTitle>
                        <CardDescription>Control parallel execution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Concurrent Tasks</Label>
                            <Input type="number" defaultValue="10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Queue Timeout (seconds)</Label>
                            <Input type="number" defaultValue="300" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-500" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="error-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Error Notifications</span>
                            <span className="text-sm text-slate-500">Get notified when tasks fail</span>
                          </Label>
                          <Switch id="error-email" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="weekly-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Weekly Summary</span>
                            <span className="text-sm text-slate-500">Receive weekly task summary</span>
                          </Label>
                          <Switch id="weekly-email" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="paused-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Paused Zap Alerts</span>
                            <span className="text-sm text-slate-500">Notify when zaps are paused</span>
                          </Label>
                          <Switch id="paused-email" defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Notification Email</Label>
                          <Input type="email" placeholder="alerts@company.com" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Slack Notifications</CardTitle>
                        <CardDescription>Send alerts to Slack</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="slack-enabled" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Enable Slack</span>
                            <span className="text-sm text-slate-500">Send notifications to Slack</span>
                          </Label>
                          <Switch id="slack-enabled" />
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://hooks.slack.com/services/..." />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-orange-500" />
                          API Keys
                        </CardTitle>
                        <CardDescription>Manage your API credentials</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Production API Key</p>
                              <code className="text-sm text-slate-500">zap_live_••••••••••••••••</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                navigator.clipboard.writeText('zap_live_xxxxxxxxxxxxxxxx')
                                toast.success('Production API key copied to clipboard')
                              }}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                toast.promise(
                                  fetch('/api/connectors/api-keys/production/regenerate', { method: 'POST' }).then(res => res.json()),
                                  { loading: 'Regenerating production API key...', success: 'Production API key regenerated', error: 'Failed to regenerate API key' }
                                )
                              }}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Development API Key</p>
                              <code className="text-sm text-slate-500">zap_dev_••••••••••••••••</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => {
                                navigator.clipboard.writeText('zap_dev_xxxxxxxxxxxxxxxx')
                                toast.success('Development API key copied to clipboard')
                              }}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                toast.promise(
                                  fetch('/api/connectors/api-keys/development/regenerate', { method: 'POST' }).then(res => res.json()),
                                  { loading: 'Regenerating development API key...', success: 'Development API key regenerated', error: 'Failed to regenerate API key' }
                                )
                              }}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => {
                          toast.promise(
                            fetch('/api/connectors/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'New API Key' }) }).then(res => res.json()),
                            { loading: 'Creating new API key...', success: 'New API key created', error: 'Failed to create API key' }
                          )
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-500" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Configure outgoing webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-8 text-slate-500">
                          <Webhook className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                          <p>No webhooks configured</p>
                          <Button variant="outline" className="mt-4" onClick={() => {
                            toast.promise(
                              fetch('/api/connectors/webhooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'New Webhook', url: '' }) }).then(res => res.json()),
                              { loading: 'Setting up webhook...', success: 'Webhook configuration ready', error: 'Failed to create webhook' }
                            )
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Webhook
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-orange-500" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Protect your integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="ip-restrict" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">IP Restrictions</span>
                            <span className="text-sm text-slate-500">Limit API access by IP</span>
                          </Label>
                          <Switch id="ip-restrict" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="audit-log" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Audit Logging</span>
                            <span className="text-sm text-slate-500">Track all API activity</span>
                          </Label>
                          <Switch id="audit-log" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="encrypt-data" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Data Encryption</span>
                            <span className="text-sm text-slate-500">Encrypt sensitive data at rest</span>
                          </Label>
                          <Switch id="encrypt-data" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage team permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-500">Require 2FA for all users</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">SSO Integration</p>
                            <p className="text-sm text-slate-500">SAML/OAuth integration</p>
                          </div>
                          <Badge variant="outline">Not Configured</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-orange-500" />
                          Advanced Settings
                        </CardTitle>
                        <CardDescription>Developer and debugging options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="debug-mode" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Debug Mode</span>
                            <span className="text-sm text-slate-500">Enable verbose logging</span>
                          </Label>
                          <Switch id="debug-mode" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="sandbox" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Sandbox Mode</span>
                            <span className="text-sm text-slate-500">Test zaps without affecting live data</span>
                          </Label>
                          <Switch id="sandbox" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="custom-code" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Custom Code Actions</span>
                            <span className="text-sm text-slate-500">Enable JavaScript/Python code steps</span>
                          </Label>
                          <Switch id="custom-code" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Clear Task History</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Delete all task logs permanently</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => {
                            if (confirm('Are you sure you want to clear all task history? This action cannot be undone.')) {
                              toast.promise(
                                fetch('/api/connectors/tasks/clear', { method: 'DELETE' }).then(res => res.json()),
                                { loading: 'Clearing task history...', success: 'Task history cleared', error: 'Failed to clear task history' }
                              )
                            }
                          }}>
                            <Archive className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Zaps</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Permanently delete all zaps</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={() => {
                            if (confirm('Are you sure you want to delete all zaps? This action cannot be undone.')) {
                              toast.promise(
                                fetch('/api/connectors/zaps', { method: 'DELETE' }).then(res => res.json()),
                                { loading: 'Deleting all zaps...', success: 'All zaps deleted', error: 'Failed to delete zaps' }
                              )
                            }
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
              insights={mockConnectorsAIInsights}
              title="Integration Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockConnectorsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockConnectorsPredictions}
              title="Zap Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockConnectorsActivities}
            title="Integration Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockConnectorsQuickActions}
            variant="grid"
          />
        </div>

        {/* Zap Detail Dialog */}
        <Dialog open={!!selectedZap} onOpenChange={() => setSelectedZap(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Zap Details</DialogTitle>
            </DialogHeader>
            {selectedZap && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getZapStatusColor(selectedZap.status)}>{selectedZap.status}</Badge>
                    {selectedZap.folder_name && <Badge variant="outline">{selectedZap.folder_name}</Badge>}
                    <Badge variant="outline">v{selectedZap.version}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedZap.name}</h3>
                    <p className="text-gray-500">{selectedZap.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedZap.task_count)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">{selectedZap.success_rate}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">This Month</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedZap.task_count_this_month)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Avg Duration</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedZap.avg_duration_seconds}s</p>
                    </div>
                  </div>

                  {selectedZap.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedZap.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => {
                      toast.promise(
                        fetch(`/api/connectors/zaps/${encodeURIComponent(selectedZap.id)}`).then(res => res.json()),
                        { loading: `Loading "${selectedZap.name}" for editing...`, success: `"${selectedZap.name}" ready to edit`, error: 'Failed to load zap' }
                      )
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Zap
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setSelectedZap(null)
                      setActiveTab('history')
                      toast.promise(
                        fetch(`/api/connectors/zaps/${encodeURIComponent(selectedZap.id)}/history`).then(res => res.json()),
                        { loading: `Loading history for "${selectedZap.name}"...`, success: `History loaded for "${selectedZap.name}"`, error: 'Failed to load history' }
                      )
                    }}>
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* App Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>App Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedApp.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedApp.name}</h2>
                      <p className="text-gray-500">{selectedApp.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(selectedApp.category)}>{selectedApp.category}</Badge>
                        {selectedApp.is_connected && <Badge className="bg-green-100 text-green-800">Connected</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Triggers ({selectedApp.triggers.length})</h3>
                      <div className="space-y-2">
                        {selectedApp.triggers.map(trigger => (
                          <div key={trigger.id} className="p-3 border dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{trigger.name}</span>
                              <Badge variant="outline" className="text-xs">{trigger.trigger_type}</Badge>
                            </div>
                            <p className="text-xs text-gray-500">{trigger.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Actions ({selectedApp.actions.length})</h3>
                      <div className="space-y-2">
                        {selectedApp.actions.map(action => (
                          <div key={action.id} className="p-3 border dark:border-gray-700 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{action.name}</span>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={() => {
                    if (selectedApp.is_connected) {
                      toast.promise(
                        fetch(`/api/connectors/apps/${encodeURIComponent(selectedApp.id)}/settings`).then(res => res.json()),
                        { loading: `Loading "${selectedApp.name}" settings...`, success: `"${selectedApp.name}" settings loaded`, error: 'Failed to load settings' }
                      )
                    } else {
                      toast.promise(
                        fetch(`/api/connectors/apps/${encodeURIComponent(selectedApp.id)}/connect`, { method: 'POST' }).then(res => res.json()),
                        { loading: `Connecting to ${selectedApp.name}...`, success: `Connected to ${selectedApp.name}`, error: `Failed to connect to ${selectedApp.name}` }
                      )
                    }
                  }}>
                    {selectedApp.is_connected ? 'Manage Connection' : `Connect ${selectedApp.name}`}
                  </Button>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Badge className={getTaskStatusColor(selectedTask.status)}>
                    {selectedTask.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                     selectedTask.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                     <AlertTriangle className="w-3 h-3 mr-1" />}
                    {selectedTask.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{selectedTask.duration_seconds}s</span>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTask.zap_name}</p>
                  <p className="text-sm text-gray-500">{selectedTask.trigger_event}</p>
                </div>

                {selectedTask.action_results.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Action Results</p>
                    <div className="space-y-2">
                      {selectedTask.action_results.map((result, i) => (
                        <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.app_name}: {result.action_name}</span>
                            <Badge className={result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {result.status}
                            </Badge>
                          </div>
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.error_message && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 inline-block mr-1" />
                      {selectedTask.error_message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    toast.promise(
                      fetch(`/api/connectors/tasks/${encodeURIComponent(selectedTask.id)}/replay`, { method: 'POST' }).then(res => res.json()),
                      { loading: 'Replaying task...', success: 'Task replay started', error: 'Failed to replay task' }
                    )
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replay Task
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    toast.promise(
                      fetch(`/api/connectors/tasks/${encodeURIComponent(selectedTask.id)}/logs`).then(res => res.blob()).then(blob => {
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `task-${selectedTask.id}-log.json`
                        document.body.appendChild(a)
                        a.click()
                        window.URL.revokeObjectURL(url)
                        a.remove()
                      }),
                      { loading: 'Downloading task log...', success: 'Task log downloaded', error: 'Failed to download log' }
                    )
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Log
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
