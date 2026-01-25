// lib/automations/recipe-builder.ts
// Advanced Automation Recipe Builder - Competing with Zapier, Make, n8n, Pipedream
// Provides visual workflow building, complex branching, and AI-powered suggestions

import OpenAI from 'openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TriggerType =
  | 'webhook'
  | 'schedule'
  | 'event'
  | 'email'
  | 'form_submission'
  | 'database_change'
  | 'file_upload'
  | 'payment_received'
  | 'invoice_created'
  | 'project_status'
  | 'task_completed'
  | 'new_client'
  | 'api_call';

export type ActionType =
  | 'send_email'
  | 'send_sms'
  | 'send_slack'
  | 'send_webhook'
  | 'create_task'
  | 'update_record'
  | 'create_invoice'
  | 'add_to_spreadsheet'
  | 'generate_pdf'
  | 'ai_generate'
  | 'conditional_branch'
  | 'loop'
  | 'delay'
  | 'transform_data'
  | 'filter'
  | 'merge'
  | 'split'
  | 'http_request'
  | 'run_code'
  | 'database_query';

export type NodeType = 'trigger' | 'action' | 'condition' | 'loop' | 'transform' | 'delay';

export interface Position {
  x: number;
  y: number;
}

export interface RecipeNode {
  id: string;
  type: NodeType;
  triggerType?: TriggerType;
  actionType?: ActionType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  position: Position;
  inputs: string[];
  outputs: string[];
  metadata?: {
    icon?: string;
    color?: string;
    retryOnError?: boolean;
    maxRetries?: number;
    timeout?: number;
  };
}

export interface RecipeEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
    value: unknown;
  };
  label?: string;
}

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  nodes: RecipeNode[];
  edges: RecipeEdge[];
  variables: RecipeVariable[];
  status: 'draft' | 'active' | 'paused' | 'error';
  version: number;
  settings: RecipeSettings;
  stats: RecipeStats;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface RecipeVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  defaultValue?: unknown;
  required: boolean;
  description?: string;
}

export interface RecipeSettings {
  timezone: string;
  errorHandling: 'stop' | 'continue' | 'retry';
  maxRetries: number;
  retryDelay: number;
  concurrency: number;
  logging: 'none' | 'errors' | 'all';
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    email?: string;
    slack?: string;
  };
}

export interface RecipeStats {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRunAt?: Date;
  lastSuccessAt?: Date;
  lastErrorAt?: Date;
  averageDuration: number;
  totalTimeSaved: number;
}

export interface ExecutionContext {
  executionId: string;
  recipeId: string;
  userId: string;
  triggerData: Record<string, unknown>;
  variables: Record<string, unknown>;
  nodeOutputs: Map<string, unknown>;
  startedAt: Date;
  currentNode?: string;
  logs: ExecutionLog[];
}

export interface ExecutionLog {
  timestamp: Date;
  nodeId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown;
}

export interface ExecutionResult {
  executionId: string;
  recipeId: string;
  status: 'success' | 'error' | 'partial';
  startedAt: Date;
  completedAt: Date;
  duration: number;
  nodesExecuted: number;
  outputs: Record<string, unknown>;
  logs: ExecutionLog[];
  error?: {
    nodeId: string;
    message: string;
    stack?: string;
  };
}

export interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  color: string;
  popularity: number;
  nodes: Partial<RecipeNode>[];
  edges: Partial<RecipeEdge>[];
  variables: RecipeVariable[];
  requiredIntegrations: string[];
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  triggers: TriggerDefinition[];
  actions: ActionDefinition[];
  authType: 'oauth2' | 'api_key' | 'basic' | 'none';
  authConfig?: Record<string, unknown>;
  baseUrl?: string;
}

export interface TriggerDefinition {
  type: TriggerType;
  name: string;
  description: string;
  icon: string;
  configSchema: ConfigSchema;
  outputSchema: OutputSchema;
}

export interface ActionDefinition {
  type: ActionType;
  name: string;
  description: string;
  icon: string;
  configSchema: ConfigSchema;
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
}

export interface ConfigSchema {
  fields: SchemaField[];
}

export interface InputSchema {
  fields: SchemaField[];
}

export interface OutputSchema {
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'file';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: unknown }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: unknown[];
  };
}

export interface AISuggestion {
  type: 'node' | 'edge' | 'optimization' | 'error_fix';
  confidence: number;
  suggestion: string;
  details: string;
  implementation?: Partial<RecipeNode | RecipeEdge>;
}

// ============================================================================
// RECIPE BUILDER SERVICE
// ============================================================================

export class RecipeBuilderService {
  private openai: OpenAI;
  private integrations: Map<string, Integration> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
    this.initializeIntegrations();
  }

  // --------------------------------------------------------------------------
  // INTEGRATIONS
  // --------------------------------------------------------------------------

  private initializeIntegrations(): void {
    // FreeFlow Internal Integration
    this.integrations.set('freeflow', {
      id: 'freeflow',
      name: 'FreeFlow',
      description: 'Internal FreeFlow triggers and actions',
      icon: 'Workflow',
      category: 'internal',
      authType: 'none',
      triggers: [
        {
          type: 'invoice_created',
          name: 'Invoice Created',
          description: 'Triggers when a new invoice is created',
          icon: 'FileText',
          configSchema: {
            fields: [
              { name: 'client_filter', type: 'string', label: 'Client Filter', required: false },
              { name: 'min_amount', type: 'number', label: 'Minimum Amount', required: false },
            ],
          },
          outputSchema: {
            fields: [
              { name: 'invoice_id', type: 'string', label: 'Invoice ID', required: true },
              { name: 'client_id', type: 'string', label: 'Client ID', required: true },
              { name: 'amount', type: 'number', label: 'Amount', required: true },
              { name: 'due_date', type: 'date', label: 'Due Date', required: true },
            ],
          },
        },
        {
          type: 'payment_received',
          name: 'Payment Received',
          description: 'Triggers when a payment is received',
          icon: 'DollarSign',
          configSchema: {
            fields: [
              { name: 'min_amount', type: 'number', label: 'Minimum Amount', required: false },
            ],
          },
          outputSchema: {
            fields: [
              { name: 'payment_id', type: 'string', label: 'Payment ID', required: true },
              { name: 'invoice_id', type: 'string', label: 'Invoice ID', required: true },
              { name: 'amount', type: 'number', label: 'Amount', required: true },
            ],
          },
        },
        {
          type: 'project_status',
          name: 'Project Status Changed',
          description: 'Triggers when a project status changes',
          icon: 'Folder',
          configSchema: {
            fields: [
              { name: 'status_filter', type: 'string', label: 'Status Filter', required: false, options: [
                { label: 'Any', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Completed', value: 'completed' },
                { label: 'On Hold', value: 'on_hold' },
              ]},
            ],
          },
          outputSchema: {
            fields: [
              { name: 'project_id', type: 'string', label: 'Project ID', required: true },
              { name: 'old_status', type: 'string', label: 'Old Status', required: true },
              { name: 'new_status', type: 'string', label: 'New Status', required: true },
            ],
          },
        },
        {
          type: 'task_completed',
          name: 'Task Completed',
          description: 'Triggers when a task is marked complete',
          icon: 'CheckSquare',
          configSchema: {
            fields: [
              { name: 'project_filter', type: 'string', label: 'Project Filter', required: false },
            ],
          },
          outputSchema: {
            fields: [
              { name: 'task_id', type: 'string', label: 'Task ID', required: true },
              { name: 'project_id', type: 'string', label: 'Project ID', required: true },
              { name: 'title', type: 'string', label: 'Task Title', required: true },
            ],
          },
        },
        {
          type: 'new_client',
          name: 'New Client Added',
          description: 'Triggers when a new client is added',
          icon: 'UserPlus',
          configSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'client_id', type: 'string', label: 'Client ID', required: true },
              { name: 'name', type: 'string', label: 'Client Name', required: true },
              { name: 'email', type: 'string', label: 'Email', required: true },
            ],
          },
        },
        {
          type: 'form_submission',
          name: 'Form Submitted',
          description: 'Triggers when a form is submitted',
          icon: 'ClipboardList',
          configSchema: {
            fields: [
              { name: 'form_id', type: 'string', label: 'Form ID', required: true },
            ],
          },
          outputSchema: {
            fields: [
              { name: 'submission_id', type: 'string', label: 'Submission ID', required: true },
              { name: 'form_data', type: 'object', label: 'Form Data', required: true },
            ],
          },
        },
      ],
      actions: [
        {
          type: 'send_email',
          name: 'Send Email',
          description: 'Send an email to specified recipients',
          icon: 'Mail',
          configSchema: {
            fields: [
              { name: 'to', type: 'string', label: 'To', required: true },
              { name: 'subject', type: 'string', label: 'Subject', required: true },
              { name: 'body', type: 'string', label: 'Body', required: true },
              { name: 'template_id', type: 'string', label: 'Template ID', required: false },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'message_id', type: 'string', label: 'Message ID', required: true },
              { name: 'sent_at', type: 'date', label: 'Sent At', required: true },
            ],
          },
        },
        {
          type: 'create_task',
          name: 'Create Task',
          description: 'Create a new task in a project',
          icon: 'Plus',
          configSchema: {
            fields: [
              { name: 'project_id', type: 'string', label: 'Project ID', required: true },
              { name: 'title', type: 'string', label: 'Title', required: true },
              { name: 'description', type: 'string', label: 'Description', required: false },
              { name: 'due_date', type: 'date', label: 'Due Date', required: false },
              { name: 'assignee_id', type: 'string', label: 'Assignee ID', required: false },
              { name: 'priority', type: 'string', label: 'Priority', required: false, options: [
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Urgent', value: 'urgent' },
              ]},
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'task_id', type: 'string', label: 'Task ID', required: true },
            ],
          },
        },
        {
          type: 'create_invoice',
          name: 'Create Invoice',
          description: 'Create a new invoice',
          icon: 'FileText',
          configSchema: {
            fields: [
              { name: 'client_id', type: 'string', label: 'Client ID', required: true },
              { name: 'items', type: 'array', label: 'Line Items', required: true },
              { name: 'due_days', type: 'number', label: 'Due in Days', required: false, defaultValue: 30 },
              { name: 'notes', type: 'string', label: 'Notes', required: false },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'invoice_id', type: 'string', label: 'Invoice ID', required: true },
              { name: 'invoice_number', type: 'string', label: 'Invoice Number', required: true },
            ],
          },
        },
        {
          type: 'update_record',
          name: 'Update Record',
          description: 'Update a record in the database',
          icon: 'Edit',
          configSchema: {
            fields: [
              { name: 'table', type: 'string', label: 'Table', required: true, options: [
                { label: 'Projects', value: 'projects' },
                { label: 'Tasks', value: 'tasks' },
                { label: 'Clients', value: 'clients' },
                { label: 'Invoices', value: 'invoices' },
              ]},
              { name: 'record_id', type: 'string', label: 'Record ID', required: true },
              { name: 'updates', type: 'object', label: 'Updates', required: true },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'updated', type: 'boolean', label: 'Updated', required: true },
            ],
          },
        },
        {
          type: 'generate_pdf',
          name: 'Generate PDF',
          description: 'Generate a PDF from a template',
          icon: 'File',
          configSchema: {
            fields: [
              { name: 'template', type: 'string', label: 'Template', required: true, options: [
                { label: 'Invoice', value: 'invoice' },
                { label: 'Contract', value: 'contract' },
                { label: 'Report', value: 'report' },
                { label: 'Proposal', value: 'proposal' },
              ]},
              { name: 'data', type: 'object', label: 'Data', required: true },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'pdf_url', type: 'string', label: 'PDF URL', required: true },
            ],
          },
        },
      ],
    });

    // Slack Integration
    this.integrations.set('slack', {
      id: 'slack',
      name: 'Slack',
      description: 'Send messages and notifications to Slack',
      icon: 'MessageSquare',
      category: 'communication',
      authType: 'oauth2',
      triggers: [
        {
          type: 'event',
          name: 'New Message',
          description: 'Triggers when a new message is posted',
          icon: 'MessageCircle',
          configSchema: {
            fields: [
              { name: 'channel', type: 'string', label: 'Channel', required: true },
            ],
          },
          outputSchema: {
            fields: [
              { name: 'message', type: 'string', label: 'Message', required: true },
              { name: 'user', type: 'string', label: 'User', required: true },
              { name: 'channel', type: 'string', label: 'Channel', required: true },
            ],
          },
        },
      ],
      actions: [
        {
          type: 'send_slack',
          name: 'Send Message',
          description: 'Send a message to a Slack channel',
          icon: 'Send',
          configSchema: {
            fields: [
              { name: 'channel', type: 'string', label: 'Channel', required: true },
              { name: 'message', type: 'string', label: 'Message', required: true },
              { name: 'attachments', type: 'array', label: 'Attachments', required: false },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'ts', type: 'string', label: 'Timestamp', required: true },
            ],
          },
        },
      ],
    });

    // Webhook Integration
    this.integrations.set('webhook', {
      id: 'webhook',
      name: 'Webhooks',
      description: 'HTTP webhooks for custom integrations',
      icon: 'Globe',
      category: 'developer',
      authType: 'none',
      triggers: [
        {
          type: 'webhook',
          name: 'Incoming Webhook',
          description: 'Triggers when a webhook is received',
          icon: 'ArrowDownCircle',
          configSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'body', type: 'object', label: 'Request Body', required: true },
              { name: 'headers', type: 'object', label: 'Headers', required: true },
            ],
          },
        },
      ],
      actions: [
        {
          type: 'send_webhook',
          name: 'Send Webhook',
          description: 'Send an HTTP request',
          icon: 'ArrowUpCircle',
          configSchema: {
            fields: [
              { name: 'url', type: 'string', label: 'URL', required: true },
              { name: 'method', type: 'string', label: 'Method', required: true, options: [
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'DELETE', value: 'DELETE' },
              ]},
              { name: 'headers', type: 'object', label: 'Headers', required: false },
              { name: 'body', type: 'object', label: 'Body', required: false },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'status', type: 'number', label: 'Status Code', required: true },
              { name: 'body', type: 'object', label: 'Response Body', required: true },
            ],
          },
        },
        {
          type: 'http_request',
          name: 'HTTP Request',
          description: 'Make a custom HTTP request',
          icon: 'Globe',
          configSchema: {
            fields: [
              { name: 'url', type: 'string', label: 'URL', required: true },
              { name: 'method', type: 'string', label: 'Method', required: true },
              { name: 'headers', type: 'object', label: 'Headers', required: false },
              { name: 'body', type: 'object', label: 'Body', required: false },
              { name: 'auth', type: 'object', label: 'Authentication', required: false },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'status', type: 'number', label: 'Status Code', required: true },
              { name: 'body', type: 'object', label: 'Response Body', required: true },
              { name: 'headers', type: 'object', label: 'Response Headers', required: true },
            ],
          },
        },
      ],
    });

    // Schedule Integration
    this.integrations.set('schedule', {
      id: 'schedule',
      name: 'Schedule',
      description: 'Time-based triggers',
      icon: 'Clock',
      category: 'utility',
      authType: 'none',
      triggers: [
        {
          type: 'schedule',
          name: 'Scheduled Trigger',
          description: 'Triggers on a schedule',
          icon: 'Calendar',
          configSchema: {
            fields: [
              { name: 'cron', type: 'string', label: 'Cron Expression', required: false },
              { name: 'interval', type: 'number', label: 'Interval (minutes)', required: false },
              { name: 'time', type: 'string', label: 'Time (HH:MM)', required: false },
              { name: 'days', type: 'array', label: 'Days of Week', required: false },
            ],
          },
          outputSchema: {
            fields: [
              { name: 'scheduled_time', type: 'date', label: 'Scheduled Time', required: true },
              { name: 'execution_time', type: 'date', label: 'Execution Time', required: true },
            ],
          },
        },
      ],
      actions: [
        {
          type: 'delay',
          name: 'Delay',
          description: 'Wait for a specified duration',
          icon: 'Pause',
          configSchema: {
            fields: [
              { name: 'duration', type: 'number', label: 'Duration (seconds)', required: true },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'delayed_until', type: 'date', label: 'Delayed Until', required: true },
            ],
          },
        },
      ],
    });

    // AI Integration
    this.integrations.set('ai', {
      id: 'ai',
      name: 'AI',
      description: 'AI-powered actions',
      icon: 'Sparkles',
      category: 'ai',
      authType: 'none',
      triggers: [],
      actions: [
        {
          type: 'ai_generate',
          name: 'AI Generate',
          description: 'Generate content using AI',
          icon: 'Wand2',
          configSchema: {
            fields: [
              { name: 'prompt', type: 'string', label: 'Prompt', required: true },
              { name: 'model', type: 'string', label: 'Model', required: false, options: [
                { label: 'GPT-4', value: 'gpt-4' },
                { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
              ]},
              { name: 'max_tokens', type: 'number', label: 'Max Tokens', required: false, defaultValue: 1000 },
              { name: 'temperature', type: 'number', label: 'Temperature', required: false, defaultValue: 0.7 },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'generated_text', type: 'string', label: 'Generated Text', required: true },
              { name: 'tokens_used', type: 'number', label: 'Tokens Used', required: true },
            ],
          },
        },
      ],
    });

    // Data Transformation Integration
    this.integrations.set('transform', {
      id: 'transform',
      name: 'Data Transform',
      description: 'Transform and manipulate data',
      icon: 'RefreshCw',
      category: 'utility',
      authType: 'none',
      triggers: [],
      actions: [
        {
          type: 'transform_data',
          name: 'Transform Data',
          description: 'Transform data using expressions',
          icon: 'Shuffle',
          configSchema: {
            fields: [
              { name: 'transformations', type: 'array', label: 'Transformations', required: true },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'result', type: 'object', label: 'Result', required: true },
            ],
          },
        },
        {
          type: 'filter',
          name: 'Filter',
          description: 'Filter data based on conditions',
          icon: 'Filter',
          configSchema: {
            fields: [
              { name: 'conditions', type: 'array', label: 'Conditions', required: true },
              { name: 'logic', type: 'string', label: 'Logic', required: false, options: [
                { label: 'AND', value: 'and' },
                { label: 'OR', value: 'or' },
              ]},
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'passed', type: 'boolean', label: 'Passed', required: true },
              { name: 'data', type: 'object', label: 'Data', required: true },
            ],
          },
        },
        {
          type: 'run_code',
          name: 'Run Code',
          description: 'Execute custom JavaScript code',
          icon: 'Code',
          configSchema: {
            fields: [
              { name: 'code', type: 'string', label: 'Code', required: true },
            ],
          },
          inputSchema: { fields: [] },
          outputSchema: {
            fields: [
              { name: 'result', type: 'object', label: 'Result', required: true },
            ],
          },
        },
      ],
    });
  }

  getIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  // --------------------------------------------------------------------------
  // RECIPE TEMPLATES
  // --------------------------------------------------------------------------

  getRecipeTemplates(): RecipeTemplate[] {
    return [
      {
        id: 'welcome-client',
        name: 'Welcome New Client',
        description: 'Automatically send a welcome email and create onboarding tasks when a new client is added',
        category: 'client-management',
        tags: ['onboarding', 'email', 'tasks'],
        icon: 'UserPlus',
        color: 'green',
        popularity: 95,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            triggerType: 'new_client',
            name: 'New Client Added',
            config: {},
            position: { x: 100, y: 100 },
          },
          {
            id: 'action-1',
            type: 'action',
            actionType: 'send_email',
            name: 'Send Welcome Email',
            config: {
              subject: 'Welcome to {{company_name}}!',
              template_id: 'welcome-client',
            },
            position: { x: 100, y: 250 },
          },
          {
            id: 'action-2',
            type: 'action',
            actionType: 'create_task',
            name: 'Create Onboarding Tasks',
            config: {
              title: 'Client Onboarding: {{client.name}}',
              priority: 'high',
            },
            position: { x: 100, y: 400 },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'action-1', target: 'action-2' },
        ],
        variables: [],
        requiredIntegrations: ['freeflow'],
      },
      {
        id: 'invoice-reminder',
        name: 'Invoice Payment Reminder',
        description: 'Send automatic reminders for overdue invoices',
        category: 'billing',
        tags: ['invoices', 'reminders', 'email'],
        icon: 'FileText',
        color: 'amber',
        popularity: 88,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            triggerType: 'schedule',
            name: 'Daily Check',
            config: { time: '09:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
            position: { x: 100, y: 100 },
          },
          {
            id: 'action-1',
            type: 'action',
            actionType: 'database_query',
            name: 'Find Overdue Invoices',
            config: {
              table: 'invoices',
              filter: { status: 'pending', due_date: { lt: 'now()' } },
            },
            position: { x: 100, y: 250 },
          },
          {
            id: 'action-2',
            type: 'action',
            actionType: 'loop',
            name: 'For Each Invoice',
            config: { items: '{{invoices}}' },
            position: { x: 100, y: 400 },
          },
          {
            id: 'action-3',
            type: 'action',
            actionType: 'send_email',
            name: 'Send Reminder',
            config: {
              subject: 'Payment Reminder: Invoice #{{invoice.number}}',
              template_id: 'invoice-reminder',
            },
            position: { x: 100, y: 550 },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'action-1', target: 'action-2' },
          { id: 'e3', source: 'action-2', target: 'action-3' },
        ],
        variables: [
          { id: 'v1', name: 'reminder_days', type: 'number', defaultValue: 7, required: false, description: 'Days after due date to send reminder' },
        ],
        requiredIntegrations: ['freeflow', 'schedule'],
      },
      {
        id: 'project-complete-notify',
        name: 'Project Completion Notification',
        description: 'Notify stakeholders and create invoice when a project is completed',
        category: 'project-management',
        tags: ['projects', 'notifications', 'invoicing'],
        icon: 'CheckCircle',
        color: 'blue',
        popularity: 82,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            triggerType: 'project_status',
            name: 'Project Completed',
            config: { status_filter: 'completed' },
            position: { x: 100, y: 100 },
          },
          {
            id: 'action-1',
            type: 'action',
            actionType: 'send_slack',
            name: 'Notify Team',
            config: {
              channel: '#project-updates',
              message: '🎉 Project "{{project.name}}" has been completed!',
            },
            position: { x: 100, y: 250 },
          },
          {
            id: 'action-2',
            type: 'action',
            actionType: 'send_email',
            name: 'Email Client',
            config: {
              subject: 'Project Completed: {{project.name}}',
              template_id: 'project-complete',
            },
            position: { x: 300, y: 250 },
          },
          {
            id: 'action-3',
            type: 'action',
            actionType: 'create_invoice',
            name: 'Create Final Invoice',
            config: {
              due_days: 30,
              notes: 'Final invoice for project: {{project.name}}',
            },
            position: { x: 200, y: 400 },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'trigger-1', target: 'action-2' },
          { id: 'e3', source: 'action-1', target: 'action-3' },
          { id: 'e4', source: 'action-2', target: 'action-3' },
        ],
        variables: [],
        requiredIntegrations: ['freeflow', 'slack'],
      },
      {
        id: 'payment-thank-you',
        name: 'Payment Thank You',
        description: 'Send a thank you email when payment is received',
        category: 'billing',
        tags: ['payments', 'email', 'client-relations'],
        icon: 'DollarSign',
        color: 'green',
        popularity: 76,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            triggerType: 'payment_received',
            name: 'Payment Received',
            config: {},
            position: { x: 100, y: 100 },
          },
          {
            id: 'action-1',
            type: 'action',
            actionType: 'send_email',
            name: 'Send Thank You',
            config: {
              subject: 'Thank you for your payment!',
              template_id: 'payment-thank-you',
            },
            position: { x: 100, y: 250 },
          },
          {
            id: 'action-2',
            type: 'action',
            actionType: 'generate_pdf',
            name: 'Generate Receipt',
            config: {
              template: 'receipt',
            },
            position: { x: 100, y: 400 },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'action-1', target: 'action-2' },
        ],
        variables: [],
        requiredIntegrations: ['freeflow'],
      },
      {
        id: 'lead-nurture',
        name: 'Lead Nurture Sequence',
        description: 'Automated email sequence for new leads',
        category: 'marketing',
        tags: ['leads', 'email', 'sequences'],
        icon: 'Target',
        color: 'purple',
        popularity: 71,
        nodes: [
          {
            id: 'trigger-1',
            type: 'trigger',
            triggerType: 'form_submission',
            name: 'Lead Form Submitted',
            config: { form_id: 'lead-capture' },
            position: { x: 100, y: 100 },
          },
          {
            id: 'action-1',
            type: 'action',
            actionType: 'send_email',
            name: 'Welcome Email',
            config: {
              subject: 'Thanks for your interest!',
              template_id: 'lead-welcome',
            },
            position: { x: 100, y: 250 },
          },
          {
            id: 'action-2',
            type: 'action',
            actionType: 'delay',
            name: 'Wait 2 Days',
            config: { duration: 172800 },
            position: { x: 100, y: 400 },
          },
          {
            id: 'action-3',
            type: 'action',
            actionType: 'send_email',
            name: 'Follow Up Email',
            config: {
              subject: 'Did you have any questions?',
              template_id: 'lead-followup',
            },
            position: { x: 100, y: 550 },
          },
          {
            id: 'action-4',
            type: 'action',
            actionType: 'delay',
            name: 'Wait 5 Days',
            config: { duration: 432000 },
            position: { x: 100, y: 700 },
          },
          {
            id: 'action-5',
            type: 'action',
            actionType: 'send_email',
            name: 'Case Study Email',
            config: {
              subject: 'See how we helped similar businesses',
              template_id: 'lead-case-study',
            },
            position: { x: 100, y: 850 },
          },
        ],
        edges: [
          { id: 'e1', source: 'trigger-1', target: 'action-1' },
          { id: 'e2', source: 'action-1', target: 'action-2' },
          { id: 'e3', source: 'action-2', target: 'action-3' },
          { id: 'e4', source: 'action-3', target: 'action-4' },
          { id: 'e5', source: 'action-4', target: 'action-5' },
        ],
        variables: [],
        requiredIntegrations: ['freeflow', 'schedule'],
      },
    ];
  }

  // --------------------------------------------------------------------------
  // RECIPE VALIDATION
  // --------------------------------------------------------------------------

  validateRecipe(recipe: Recipe): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for at least one trigger
    const triggers = recipe.nodes.filter(n => n.type === 'trigger');
    if (triggers.length === 0) {
      errors.push('Recipe must have at least one trigger');
    }

    // Check for at least one action
    const actions = recipe.nodes.filter(n => n.type === 'action');
    if (actions.length === 0) {
      errors.push('Recipe must have at least one action');
    }

    // Check all triggers are connected
    for (const trigger of triggers) {
      const hasOutgoingEdge = recipe.edges.some(e => e.source === trigger.id);
      if (!hasOutgoingEdge) {
        errors.push(`Trigger "${trigger.name}" is not connected to any action`);
      }
    }

    // Check for orphaned nodes
    for (const node of recipe.nodes) {
      if (node.type !== 'trigger') {
        const hasIncomingEdge = recipe.edges.some(e => e.target === node.id);
        if (!hasIncomingEdge) {
          errors.push(`Node "${node.name}" has no incoming connections`);
        }
      }
    }

    // Check for circular dependencies
    const hasCycle = this.detectCycle(recipe);
    if (hasCycle) {
      errors.push('Recipe contains circular dependencies');
    }

    // Validate node configurations
    for (const node of recipe.nodes) {
      const nodeErrors = this.validateNodeConfig(node);
      errors.push(...nodeErrors);
    }

    return { valid: errors.length === 0, errors };
  }

  private detectCycle(recipe: Recipe): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = recipe.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target)) return true;
        } else if (recursionStack.has(edge.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of recipe.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  private validateNodeConfig(node: RecipeNode): string[] {
    const errors: string[] = [];

    if (!node.name || node.name.trim() === '') {
      errors.push(`Node at position (${node.position.x}, ${node.position.y}) has no name`);
    }

    if (node.type === 'trigger' && !node.triggerType) {
      errors.push(`Trigger "${node.name}" has no trigger type specified`);
    }

    if (node.type === 'action' && !node.actionType) {
      errors.push(`Action "${node.name}" has no action type specified`);
    }

    // Validate specific action configurations
    if (node.actionType === 'send_email') {
      if (!node.config.to && !node.config.template_id) {
        errors.push(`Email action "${node.name}" requires a recipient or template`);
      }
    }

    if (node.actionType === 'send_webhook') {
      if (!node.config.url) {
        errors.push(`Webhook action "${node.name}" requires a URL`);
      }
    }

    return errors;
  }

  // --------------------------------------------------------------------------
  // RECIPE EXECUTION
  // --------------------------------------------------------------------------

  async executeRecipe(
    recipe: Recipe,
    triggerData: Record<string, unknown>,
    userId: string
  ): Promise<ExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startedAt = new Date();

    const context: ExecutionContext = {
      executionId,
      recipeId: recipe.id,
      userId,
      triggerData,
      variables: this.initializeVariables(recipe.variables, triggerData),
      nodeOutputs: new Map(),
      startedAt,
      logs: [],
    };

    try {
      // Validate recipe before execution
      const validation = this.validateRecipe(recipe);
      if (!validation.valid) {
        throw new Error(`Recipe validation failed: ${validation.errors.join(', ')}`);
      }

      // Find trigger node
      const triggerNode = recipe.nodes.find(n => n.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found');
      }

      // Store trigger output
      context.nodeOutputs.set(triggerNode.id, triggerData);
      this.log(context, triggerNode.id, 'info', 'Trigger activated', triggerData);

      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(recipe, triggerNode.id);
      let nodesExecuted = 1; // Trigger counts as executed

      for (const nodeId of executionOrder) {
        if (nodeId === triggerNode.id) continue;

        const node = recipe.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        context.currentNode = nodeId;
        this.log(context, nodeId, 'info', `Executing node: ${node.name}`);

        try {
          const output = await this.executeNode(node, context, recipe);
          context.nodeOutputs.set(nodeId, output);
          nodesExecuted++;
          this.log(context, nodeId, 'info', 'Node completed', output);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.log(context, nodeId, 'error', `Node failed: ${errorMessage}`);

          if (recipe.settings.errorHandling === 'stop') {
            return {
              executionId,
              recipeId: recipe.id,
              status: 'error',
              startedAt,
              completedAt: new Date(),
              duration: Date.now() - startedAt.getTime(),
              nodesExecuted,
              outputs: Object.fromEntries(context.nodeOutputs),
              logs: context.logs,
              error: {
                nodeId,
                message: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
              },
            };
          }

          if (recipe.settings.errorHandling === 'retry' && recipe.settings.maxRetries > 0) {
            // Implement retry logic
            let retryCount = 0;
            let success = false;
            while (retryCount < recipe.settings.maxRetries && !success) {
              retryCount++;
              this.log(context, nodeId, 'info', `Retrying (${retryCount}/${recipe.settings.maxRetries})`);
              await this.delay(recipe.settings.retryDelay * 1000);
              try {
                const output = await this.executeNode(node, context, recipe);
                context.nodeOutputs.set(nodeId, output);
                nodesExecuted++;
                success = true;
              } catch {
                // Continue retrying
              }
            }
          }
        }
      }

      return {
        executionId,
        recipeId: recipe.id,
        status: 'success',
        startedAt,
        completedAt: new Date(),
        duration: Date.now() - startedAt.getTime(),
        nodesExecuted,
        outputs: Object.fromEntries(context.nodeOutputs),
        logs: context.logs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        executionId,
        recipeId: recipe.id,
        status: 'error',
        startedAt,
        completedAt: new Date(),
        duration: Date.now() - startedAt.getTime(),
        nodesExecuted: 0,
        outputs: {},
        logs: context.logs,
        error: {
          nodeId: context.currentNode || 'unknown',
          message: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  }

  private initializeVariables(
    variables: RecipeVariable[],
    triggerData: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const variable of variables) {
      result[variable.name] = triggerData[variable.name] ?? variable.defaultValue;
    }
    return result;
  }

  private getExecutionOrder(recipe: Recipe, startNodeId: string): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      order.push(nodeId);

      const outgoingEdges = recipe.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      }
    }

    return order;
  }

  private async executeNode(
    node: RecipeNode,
    context: ExecutionContext,
    recipe: Recipe
  ): Promise<unknown> {
    // Get inputs from previous nodes
    const inputs = this.getNodeInputs(node, context, recipe);

    switch (node.actionType) {
      case 'send_email':
        return this.executeSendEmail(node.config, inputs, context);
      case 'send_slack':
        return this.executeSendSlack(node.config, inputs, context);
      case 'send_webhook':
        return this.executeWebhook(node.config, inputs, context);
      case 'create_task':
        return this.executeCreateTask(node.config, inputs, context);
      case 'create_invoice':
        return this.executeCreateInvoice(node.config, inputs, context);
      case 'update_record':
        return this.executeUpdateRecord(node.config, inputs, context);
      case 'generate_pdf':
        return this.executeGeneratePdf(node.config, inputs, context);
      case 'ai_generate':
        return this.executeAiGenerate(node.config, inputs, context);
      case 'delay':
        return this.executeDelay(node.config);
      case 'transform_data':
        return this.executeTransform(node.config, inputs);
      case 'filter':
        return this.executeFilter(node.config, inputs);
      case 'conditional_branch':
        return this.executeConditionalBranch(node.config, inputs);
      case 'http_request':
        return this.executeHttpRequest(node.config, inputs);
      case 'run_code':
        return this.executeRunCode(node.config, inputs);
      default:
        throw new Error(`Unknown action type: ${node.actionType}`);
    }
  }

  private getNodeInputs(
    node: RecipeNode,
    context: ExecutionContext,
    recipe: Recipe
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {
      ...context.variables,
      trigger: context.triggerData,
    };

    // Get outputs from connected input nodes
    const incomingEdges = recipe.edges.filter(e => e.target === node.id);
    for (const edge of incomingEdges) {
      const sourceOutput = context.nodeOutputs.get(edge.source);
      if (sourceOutput) {
        inputs[edge.source] = sourceOutput;
      }
    }

    return inputs;
  }

  private interpolateTemplate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.getNestedValue(data, path.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  // --------------------------------------------------------------------------
  // ACTION EXECUTORS
  // --------------------------------------------------------------------------

  private async executeSendEmail(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<{ message_id: string; sent_at: Date }> {
    const to = this.interpolateTemplate(config.to as string, inputs);
    const subject = this.interpolateTemplate(config.subject as string, inputs);
    const body = config.body ? this.interpolateTemplate(config.body as string, inputs) : '';

    // In production, integrate with email service (Resend, SendGrid, etc.)
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);

    return {
      message_id: `msg_${Date.now()}`,
      sent_at: new Date(),
    };
  }

  private async executeSendSlack(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<{ ts: string }> {
    const channel = config.channel as string;
    const message = this.interpolateTemplate(config.message as string, inputs);

    // In production, integrate with Slack API
    console.log(`[SLACK] Channel: ${channel}, Message: ${message}`);

    return {
      ts: `${Date.now()}.000000`,
    };
  }

  private async executeWebhook(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<{ status: number; body: unknown }> {
    const url = this.interpolateTemplate(config.url as string, inputs);
    const method = (config.method as string) || 'POST';
    const headers = config.headers as Record<string, string> || {};
    const body = config.body ? JSON.parse(this.interpolateTemplate(JSON.stringify(config.body), inputs)) : undefined;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    return {
      status: response.status,
      body: await response.json().catch(() => null),
    };
  }

  private async executeCreateTask(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<{ task_id: string }> {
    const title = this.interpolateTemplate(config.title as string, inputs);
    const description = config.description
      ? this.interpolateTemplate(config.description as string, inputs)
      : '';

    // In production, create task via API
    console.log(`[TASK] Creating: ${title} for user ${context.userId}`);

    return {
      task_id: `task_${Date.now()}`,
    };
  }

  private async executeCreateInvoice(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<{ invoice_id: string; invoice_number: string }> {
    const clientId = this.interpolateTemplate(config.client_id as string, inputs);

    // In production, create invoice via API
    console.log(`[INVOICE] Creating for client ${clientId} by user ${context.userId}`);

    return {
      invoice_id: `inv_${Date.now()}`,
      invoice_number: `INV-${Date.now()}`,
    };
  }

  private async executeUpdateRecord(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<{ updated: boolean }> {
    const table = config.table as string;
    const recordId = this.interpolateTemplate(config.record_id as string, inputs);

    // In production, update via Supabase
    console.log(`[UPDATE] Table: ${table}, Record: ${recordId}`);

    return { updated: true };
  }

  private async executeGeneratePdf(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<{ pdf_url: string }> {
    const template = config.template as string;

    // In production, generate PDF via service
    console.log(`[PDF] Generating ${template}`, inputs);

    return {
      pdf_url: `https://storage.example.com/pdfs/${template}_${Date.now()}.pdf`,
    };
  }

  private async executeAiGenerate(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<{ generated_text: string; tokens_used: number }> {
    const prompt = this.interpolateTemplate(config.prompt as string, inputs);
    const model = (config.model as string) || 'gpt-3.5-turbo';
    const maxTokens = (config.max_tokens as number) || 1000;
    const temperature = (config.temperature as number) || 0.7;

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
      });

      return {
        generated_text: response.choices[0]?.message?.content || '',
        tokens_used: response.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('AI generation failed:', error);
      return {
        generated_text: '',
        tokens_used: 0,
      };
    }
  }

  private async executeDelay(config: Record<string, unknown>): Promise<{ delayed_until: Date }> {
    const duration = (config.duration as number) || 0;
    await this.delay(duration * 1000);
    return { delayed_until: new Date() };
  }

  private executeTransform(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>
  ): { result: unknown } {
    const transformations = config.transformations as Array<{
      field: string;
      operation: string;
      value?: unknown;
    }>;

    let result = { ...inputs };

    for (const transform of transformations || []) {
      const { field, operation, value } = transform;
      const currentValue = this.getNestedValue(result, field);

      switch (operation) {
        case 'uppercase':
          result = this.setNestedValue(result, field, String(currentValue).toUpperCase());
          break;
        case 'lowercase':
          result = this.setNestedValue(result, field, String(currentValue).toLowerCase());
          break;
        case 'trim':
          result = this.setNestedValue(result, field, String(currentValue).trim());
          break;
        case 'append':
          result = this.setNestedValue(result, field, String(currentValue) + String(value));
          break;
        case 'prepend':
          result = this.setNestedValue(result, field, String(value) + String(currentValue));
          break;
        case 'replace':
          if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
            result = this.setNestedValue(
              result,
              field,
              String(currentValue).replace(
                new RegExp(value.from as string, 'g'),
                value.to as string
              )
            );
          }
          break;
        case 'math':
          if (typeof value === 'object' && value !== null && 'operation' in value && 'operand' in value) {
            const num = Number(currentValue);
            const operand = Number(value.operand);
            let mathResult: number;
            switch (value.operation) {
              case 'add': mathResult = num + operand; break;
              case 'subtract': mathResult = num - operand; break;
              case 'multiply': mathResult = num * operand; break;
              case 'divide': mathResult = num / operand; break;
              default: mathResult = num;
            }
            result = this.setNestedValue(result, field, mathResult);
          }
          break;
      }
    }

    return { result };
  }

  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): Record<string, unknown> {
    const keys = path.split('.');
    const result = { ...obj };
    let current: Record<string, unknown> = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]] as Record<string, unknown>;
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }

  private executeFilter(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>
  ): { passed: boolean; data: unknown } {
    const conditions = config.conditions as Array<{
      field: string;
      operator: string;
      value: unknown;
    }>;
    const logic = (config.logic as string) || 'and';

    const results = conditions.map(condition => {
      const fieldValue = this.getNestedValue(inputs, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });

    const passed = logic === 'and'
      ? results.every(r => r)
      : results.some(r => r);

    return { passed, data: passed ? inputs : null };
  }

  private evaluateCondition(value: unknown, operator: string, compareValue: unknown): boolean {
    switch (operator) {
      case 'equals':
        return value === compareValue;
      case 'not_equals':
        return value !== compareValue;
      case 'contains':
        return String(value).includes(String(compareValue));
      case 'greater_than':
        return Number(value) > Number(compareValue);
      case 'less_than':
        return Number(value) < Number(compareValue);
      case 'is_empty':
        return value === null || value === undefined || value === '';
      case 'is_not_empty':
        return value !== null && value !== undefined && value !== '';
      default:
        return false;
    }
  }

  private executeConditionalBranch(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>
  ): { branch: string; data: unknown } {
    const conditions = config.conditions as Array<{
      branch: string;
      field: string;
      operator: string;
      value: unknown;
    }>;

    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(inputs, condition.field);
      if (this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return { branch: condition.branch, data: inputs };
      }
    }

    return { branch: 'default', data: inputs };
  }

  private async executeHttpRequest(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>
  ): Promise<{ status: number; body: unknown; headers: Record<string, string> }> {
    const url = this.interpolateTemplate(config.url as string, inputs);
    const method = (config.method as string) || 'GET';
    const headers = config.headers as Record<string, string> || {};
    const body = config.body
      ? JSON.parse(this.interpolateTemplate(JSON.stringify(config.body), inputs))
      : undefined;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      body: await response.json().catch(() => null),
      headers: responseHeaders,
    };
  }

  private executeRunCode(
    config: Record<string, unknown>,
    inputs: Record<string, unknown>
  ): { result: unknown } {
    // SECURITY: Code execution is disabled for security reasons
    // Custom code execution requires a proper sandbox (vm2, isolated-vm, or Deno)
    // to prevent arbitrary code execution vulnerabilities (RCE)
    console.warn('Code execution action is disabled for security. Implement a proper sandbox before enabling.')
    return {
      result: null,
      error: 'Code execution is disabled. Contact administrator to enable sandboxed execution.'
    };
  }

  // --------------------------------------------------------------------------
  // AI SUGGESTIONS
  // --------------------------------------------------------------------------

  async suggestNextNode(recipe: Recipe, lastNodeId: string): Promise<AISuggestion[]> {
    const lastNode = recipe.nodes.find(n => n.id === lastNodeId);
    if (!lastNode) return [];

    const prompt = `Given a workflow automation recipe with the following last node:

    Type: ${lastNode.type}
    Action: ${lastNode.actionType || lastNode.triggerType}
    Name: ${lastNode.name}

    Suggest 3 logical next actions that would commonly follow this step.
    Return JSON array with: type, name, description, confidence (0-1), actionType

    Consider common workflow patterns like:
    - After sending email -> wait/delay or update CRM
    - After creating invoice -> send notification or schedule follow-up
    - After task completion -> notify team or update project status`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const suggestions = JSON.parse(response.choices[0]?.message?.content || '{"suggestions":[]}');
      return (suggestions.suggestions || []).map((s: Record<string, unknown>) => ({
        type: 'node' as const,
        confidence: s.confidence as number || 0.7,
        suggestion: s.name as string,
        details: s.description as string,
        implementation: {
          type: 'action' as const,
          actionType: s.actionType as ActionType,
          name: s.name as string,
          config: {},
          position: { x: lastNode.position.x, y: lastNode.position.y + 150 },
          inputs: [lastNodeId],
          outputs: [],
        },
      }));
    } catch (error) {
      console.error('AI suggestion failed:', error);
      return [];
    }
  }

  async optimizeRecipe(recipe: Recipe): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Check for parallel execution opportunities
    const serialActions = recipe.nodes.filter(n => {
      const incomingEdges = recipe.edges.filter(e => e.target === n.id);
      const outgoingEdges = recipe.edges.filter(e => e.source === n.id);
      return incomingEdges.length === 1 && outgoingEdges.length === 1;
    });

    if (serialActions.length > 3) {
      suggestions.push({
        type: 'optimization',
        confidence: 0.8,
        suggestion: 'Enable parallel execution',
        details: `${serialActions.length} actions could potentially run in parallel to improve performance`,
      });
    }

    // Check for missing error handling
    const noRetryNodes = recipe.nodes.filter(
      n => n.type === 'action' && !n.metadata?.retryOnError
    );

    if (noRetryNodes.length > 0) {
      suggestions.push({
        type: 'optimization',
        confidence: 0.7,
        suggestion: 'Add retry logic',
        details: `${noRetryNodes.length} action(s) have no retry configuration for error handling`,
      });
    }

    // Check for missing delays between external API calls
    const apiActions = recipe.nodes.filter(
      n => n.actionType === 'send_webhook' || n.actionType === 'http_request'
    );

    if (apiActions.length > 2) {
      const hasDelays = recipe.nodes.some(n => n.actionType === 'delay');
      if (!hasDelays) {
        suggestions.push({
          type: 'optimization',
          confidence: 0.6,
          suggestion: 'Add rate limiting delays',
          details: 'Multiple external API calls detected without delays. Consider adding delays to avoid rate limiting.',
        });
      }
    }

    return suggestions;
  }

  // --------------------------------------------------------------------------
  // UTILITY METHODS
  // --------------------------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private log(
    context: ExecutionContext,
    nodeId: string,
    level: ExecutionLog['level'],
    message: string,
    data?: unknown
  ): void {
    context.logs.push({
      timestamp: new Date(),
      nodeId,
      level,
      message,
      data,
    });
  }

  // --------------------------------------------------------------------------
  // RECIPE CRUD
  // --------------------------------------------------------------------------

  createNewRecipe(userId: string): Recipe {
    const now = new Date();
    return {
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name: 'New Recipe',
      description: '',
      category: 'general',
      tags: [],
      nodes: [],
      edges: [],
      variables: [],
      status: 'draft',
      version: 1,
      settings: {
        timezone: 'UTC',
        errorHandling: 'stop',
        maxRetries: 3,
        retryDelay: 60,
        concurrency: 1,
        logging: 'errors',
        notifications: {
          onSuccess: false,
          onError: true,
        },
      },
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        averageDuration: 0,
        totalTimeSaved: 0,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  addNode(recipe: Recipe, node: Partial<RecipeNode>): Recipe {
    const newNode: RecipeNode = {
      id: node.id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: node.type || 'action',
      triggerType: node.triggerType,
      actionType: node.actionType,
      name: node.name || 'New Node',
      description: node.description,
      config: node.config || {},
      position: node.position || { x: 100, y: 100 },
      inputs: node.inputs || [],
      outputs: node.outputs || [],
      metadata: node.metadata,
    };

    return {
      ...recipe,
      nodes: [...recipe.nodes, newNode],
      updatedAt: new Date(),
    };
  }

  updateNode(recipe: Recipe, nodeId: string, updates: Partial<RecipeNode>): Recipe {
    return {
      ...recipe,
      nodes: recipe.nodes.map(n =>
        n.id === nodeId ? { ...n, ...updates } : n
      ),
      updatedAt: new Date(),
    };
  }

  removeNode(recipe: Recipe, nodeId: string): Recipe {
    return {
      ...recipe,
      nodes: recipe.nodes.filter(n => n.id !== nodeId),
      edges: recipe.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
      updatedAt: new Date(),
    };
  }

  addEdge(recipe: Recipe, edge: Partial<RecipeEdge>): Recipe {
    const newEdge: RecipeEdge = {
      id: edge.id || `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: edge.source || '',
      target: edge.target || '',
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      condition: edge.condition,
      label: edge.label,
    };

    return {
      ...recipe,
      edges: [...recipe.edges, newEdge],
      updatedAt: new Date(),
    };
  }

  removeEdge(recipe: Recipe, edgeId: string): Recipe {
    return {
      ...recipe,
      edges: recipe.edges.filter(e => e.id !== edgeId),
      updatedAt: new Date(),
    };
  }
}

export const recipeBuilderService = new RecipeBuilderService();
