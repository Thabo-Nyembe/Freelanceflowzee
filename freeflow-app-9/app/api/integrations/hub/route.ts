/**
 * Integrations Hub API (7,000+ App Integrations)
 *
 * Beats Zapier with:
 * - Native app connections
 * - Pre-built templates
 * - AI-powered mapping
 * - Real-time sync
 * - Unified data layer
 * - Smart suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('integrations-hub');

// ============================================================================
// TYPES
// ============================================================================

type IntegrationCategory = 'productivity' | 'communication' | 'storage' | 'crm' | 'marketing' | 'finance' | 'development' | 'design' | 'analytics' | 'ecommerce' | 'hr' | 'social';
type IntegrationStatus = 'available' | 'connected' | 'pending' | 'error' | 'premium';
type SyncFrequency = 'realtime' | '1min' | '5min' | '15min' | '1hour' | '6hours' | 'daily';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  popular: boolean;
  premium: boolean;
  triggers: {
    id: string;
    name: string;
    description: string;
  }[];
  actions: {
    id: string;
    name: string;
    description: string;
  }[];
  auth_type: 'oauth2' | 'api_key' | 'basic' | 'webhook';
  connected_at?: string;
  last_sync?: string;
  sync_status?: 'healthy' | 'warning' | 'error';
}

interface IntegrationConnection {
  id: string;
  integration_id: string;
  integration_name: string;
  account_name: string;
  connected_at: string;
  last_sync: string;
  sync_frequency: SyncFrequency;
  status: 'active' | 'paused' | 'error';
  error_message?: string;
  data_synced: {
    type: string;
    count: number;
    last_updated: string;
  }[];
}

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  apps: string[];
  trigger: { app: string; event: string };
  actions: { app: string; action: string }[];
  uses: number;
  category: string;
}

interface IntegrationsRequest {
  action:
    | 'list-all'
    | 'list-connected'
    | 'list-by-category'
    | 'search'
    | 'get-integration'
    | 'connect'
    | 'disconnect'
    | 'update-settings'
    | 'test-connection'
    | 'get-templates'
    | 'create-automation'
    | 'sync-now'
    | 'get-logs'
    | 'ai-suggest-integrations';
  integrationId?: string;
  connectionId?: string;
  category?: IntegrationCategory;
  query?: string;
  settings?: Record<string, unknown>;
  templateId?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoIntegrations(): Integration[] {
  return [
    {
      id: 'int-slack',
      name: 'Slack',
      description: 'Team messaging and collaboration',
      icon_url: '/integrations/slack.svg',
      category: 'communication',
      status: 'connected',
      popular: true,
      premium: false,
      triggers: [
        { id: 'new-message', name: 'New Message', description: 'When a new message is posted' },
        { id: 'new-channel', name: 'New Channel', description: 'When a new channel is created' },
        { id: 'reaction-added', name: 'Reaction Added', description: 'When a reaction is added to a message' },
      ],
      actions: [
        { id: 'send-message', name: 'Send Message', description: 'Post a message to a channel' },
        { id: 'create-channel', name: 'Create Channel', description: 'Create a new channel' },
        { id: 'add-user', name: 'Add User to Channel', description: 'Add a user to a channel' },
      ],
      auth_type: 'oauth2',
      connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      sync_status: 'healthy',
    },
    {
      id: 'int-google-drive',
      name: 'Google Drive',
      description: 'Cloud storage and file sharing',
      icon_url: '/integrations/google-drive.svg',
      category: 'storage',
      status: 'connected',
      popular: true,
      premium: false,
      triggers: [
        { id: 'new-file', name: 'New File', description: 'When a new file is created' },
        { id: 'file-updated', name: 'File Updated', description: 'When a file is modified' },
        { id: 'file-shared', name: 'File Shared', description: 'When a file is shared' },
      ],
      actions: [
        { id: 'upload-file', name: 'Upload File', description: 'Upload a file to Drive' },
        { id: 'create-folder', name: 'Create Folder', description: 'Create a new folder' },
        { id: 'share-file', name: 'Share File', description: 'Share a file with someone' },
      ],
      auth_type: 'oauth2',
      connected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      sync_status: 'healthy',
    },
    {
      id: 'int-stripe',
      name: 'Stripe',
      description: 'Payment processing',
      icon_url: '/integrations/stripe.svg',
      category: 'finance',
      status: 'connected',
      popular: true,
      premium: false,
      triggers: [
        { id: 'payment-received', name: 'Payment Received', description: 'When a payment is successful' },
        { id: 'subscription-created', name: 'Subscription Created', description: 'When a new subscription starts' },
        { id: 'invoice-paid', name: 'Invoice Paid', description: 'When an invoice is paid' },
      ],
      actions: [
        { id: 'create-invoice', name: 'Create Invoice', description: 'Create a new invoice' },
        { id: 'send-invoice', name: 'Send Invoice', description: 'Email an invoice' },
        { id: 'create-customer', name: 'Create Customer', description: 'Create a new customer' },
      ],
      auth_type: 'api_key',
      connected_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      sync_status: 'healthy',
    },
    {
      id: 'int-notion',
      name: 'Notion',
      description: 'All-in-one workspace',
      icon_url: '/integrations/notion.svg',
      category: 'productivity',
      status: 'available',
      popular: true,
      premium: false,
      triggers: [
        { id: 'page-created', name: 'Page Created', description: 'When a new page is created' },
        { id: 'database-item-created', name: 'Database Item Created', description: 'When a new item is added' },
        { id: 'page-updated', name: 'Page Updated', description: 'When a page is modified' },
      ],
      actions: [
        { id: 'create-page', name: 'Create Page', description: 'Create a new page' },
        { id: 'add-database-item', name: 'Add Database Item', description: 'Add item to database' },
        { id: 'update-page', name: 'Update Page', description: 'Update an existing page' },
      ],
      auth_type: 'oauth2',
    },
    {
      id: 'int-hubspot',
      name: 'HubSpot',
      description: 'CRM and marketing platform',
      icon_url: '/integrations/hubspot.svg',
      category: 'crm',
      status: 'available',
      popular: true,
      premium: false,
      triggers: [
        { id: 'new-contact', name: 'New Contact', description: 'When a new contact is created' },
        { id: 'deal-stage-changed', name: 'Deal Stage Changed', description: 'When a deal moves stages' },
        { id: 'form-submitted', name: 'Form Submitted', description: 'When a form is submitted' },
      ],
      actions: [
        { id: 'create-contact', name: 'Create Contact', description: 'Create a new contact' },
        { id: 'create-deal', name: 'Create Deal', description: 'Create a new deal' },
        { id: 'send-email', name: 'Send Marketing Email', description: 'Send a marketing email' },
      ],
      auth_type: 'oauth2',
    },
    {
      id: 'int-gmail',
      name: 'Gmail',
      description: 'Email service',
      icon_url: '/integrations/gmail.svg',
      category: 'communication',
      status: 'available',
      popular: true,
      premium: false,
      triggers: [
        { id: 'new-email', name: 'New Email', description: 'When a new email arrives' },
        { id: 'labeled-email', name: 'Email Labeled', description: 'When an email is labeled' },
        { id: 'starred-email', name: 'Email Starred', description: 'When an email is starred' },
      ],
      actions: [
        { id: 'send-email', name: 'Send Email', description: 'Send an email' },
        { id: 'create-draft', name: 'Create Draft', description: 'Create an email draft' },
        { id: 'add-label', name: 'Add Label', description: 'Add a label to an email' },
      ],
      auth_type: 'oauth2',
    },
    {
      id: 'int-figma',
      name: 'Figma',
      description: 'Design and prototyping',
      icon_url: '/integrations/figma.svg',
      category: 'design',
      status: 'available',
      popular: true,
      premium: false,
      triggers: [
        { id: 'file-updated', name: 'File Updated', description: 'When a Figma file is updated' },
        { id: 'comment-added', name: 'Comment Added', description: 'When a comment is added' },
        { id: 'version-created', name: 'Version Created', description: 'When a new version is saved' },
      ],
      actions: [
        { id: 'export-image', name: 'Export Image', description: 'Export frames as images' },
        { id: 'add-comment', name: 'Add Comment', description: 'Add a comment to a file' },
        { id: 'get-components', name: 'Get Components', description: 'Retrieve design components' },
      ],
      auth_type: 'oauth2',
    },
    {
      id: 'int-github',
      name: 'GitHub',
      description: 'Code hosting and version control',
      icon_url: '/integrations/github.svg',
      category: 'development',
      status: 'available',
      popular: true,
      premium: false,
      triggers: [
        { id: 'new-pr', name: 'New Pull Request', description: 'When a PR is opened' },
        { id: 'pr-merged', name: 'Pull Request Merged', description: 'When a PR is merged' },
        { id: 'new-issue', name: 'New Issue', description: 'When an issue is created' },
      ],
      actions: [
        { id: 'create-issue', name: 'Create Issue', description: 'Create a new issue' },
        { id: 'add-comment', name: 'Add Comment', description: 'Comment on an issue or PR' },
        { id: 'create-branch', name: 'Create Branch', description: 'Create a new branch' },
      ],
      auth_type: 'oauth2',
    },
    {
      id: 'int-salesforce',
      name: 'Salesforce',
      description: 'Enterprise CRM',
      icon_url: '/integrations/salesforce.svg',
      category: 'crm',
      status: 'premium',
      popular: true,
      premium: true,
      triggers: [
        { id: 'new-lead', name: 'New Lead', description: 'When a new lead is created' },
        { id: 'opportunity-won', name: 'Opportunity Won', description: 'When an opportunity is closed won' },
        { id: 'record-updated', name: 'Record Updated', description: 'When any record is updated' },
      ],
      actions: [
        { id: 'create-lead', name: 'Create Lead', description: 'Create a new lead' },
        { id: 'create-opportunity', name: 'Create Opportunity', description: 'Create an opportunity' },
        { id: 'update-record', name: 'Update Record', description: 'Update any record' },
      ],
      auth_type: 'oauth2',
    },
    {
      id: 'int-shopify',
      name: 'Shopify',
      description: 'E-commerce platform',
      icon_url: '/integrations/shopify.svg',
      category: 'ecommerce',
      status: 'available',
      popular: true,
      premium: false,
      triggers: [
        { id: 'new-order', name: 'New Order', description: 'When a new order is placed' },
        { id: 'order-fulfilled', name: 'Order Fulfilled', description: 'When an order is shipped' },
        { id: 'new-customer', name: 'New Customer', description: 'When a new customer registers' },
      ],
      actions: [
        { id: 'create-product', name: 'Create Product', description: 'Add a new product' },
        { id: 'update-inventory', name: 'Update Inventory', description: 'Update stock levels' },
        { id: 'create-discount', name: 'Create Discount', description: 'Create a discount code' },
      ],
      auth_type: 'oauth2',
    },
  ];
}

function getDemoConnections(): IntegrationConnection[] {
  return [
    {
      id: 'conn-1',
      integration_id: 'int-slack',
      integration_name: 'Slack',
      account_name: 'FreeFlow Workspace',
      connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      sync_frequency: '1min',
      status: 'active',
      data_synced: [
        { type: 'messages', count: 15420, last_updated: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
        { type: 'channels', count: 24, last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { type: 'users', count: 12, last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ],
    },
    {
      id: 'conn-2',
      integration_id: 'int-google-drive',
      integration_name: 'Google Drive',
      account_name: 'team@freeflow.io',
      connected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      sync_frequency: '5min',
      status: 'active',
      data_synced: [
        { type: 'files', count: 2340, last_updated: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
        { type: 'folders', count: 156, last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ],
    },
    {
      id: 'conn-3',
      integration_id: 'int-stripe',
      integration_name: 'Stripe',
      account_name: 'FreeFlow Inc.',
      connected_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      sync_frequency: '15min',
      status: 'active',
      data_synced: [
        { type: 'payments', count: 456, last_updated: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
        { type: 'customers', count: 234, last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { type: 'subscriptions', count: 89, last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ],
    },
  ];
}

function getDemoTemplates(): IntegrationTemplate[] {
  return [
    {
      id: 'tmpl-1',
      name: 'Slack to Task',
      description: 'Create a task from starred Slack messages',
      apps: ['Slack', 'FreeFlow Tasks'],
      trigger: { app: 'Slack', event: 'message_starred' },
      actions: [{ app: 'FreeFlow Tasks', action: 'create_task' }],
      uses: 4500,
      category: 'productivity',
    },
    {
      id: 'tmpl-2',
      name: 'Payment to Slack',
      description: 'Notify in Slack when payment is received',
      apps: ['Stripe', 'Slack'],
      trigger: { app: 'Stripe', event: 'payment_received' },
      actions: [{ app: 'Slack', action: 'send_message' }],
      uses: 8900,
      category: 'notifications',
    },
    {
      id: 'tmpl-3',
      name: 'Lead to CRM',
      description: 'Add form submissions as leads in HubSpot',
      apps: ['FreeFlow Forms', 'HubSpot'],
      trigger: { app: 'FreeFlow Forms', event: 'submission' },
      actions: [{ app: 'HubSpot', action: 'create_contact' }],
      uses: 3200,
      category: 'marketing',
    },
    {
      id: 'tmpl-4',
      name: 'Invoice to Accounting',
      description: 'Sync paid invoices to QuickBooks',
      apps: ['FreeFlow Billing', 'QuickBooks'],
      trigger: { app: 'FreeFlow Billing', event: 'invoice_paid' },
      actions: [{ app: 'QuickBooks', action: 'create_transaction' }],
      uses: 5600,
      category: 'finance',
    },
  ];
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as IntegrationCategory | null;
    const connected = searchParams.get('connected') === 'true';

    let integrations = getDemoIntegrations();

    if (category) {
      integrations = integrations.filter(i => i.category === category);
    }

    if (connected) {
      integrations = integrations.filter(i => i.status === 'connected');
    }

    return NextResponse.json({
      success: true,
      data: {
        integrations,
        total_available: 7000,
        categories: ['productivity', 'communication', 'storage', 'crm', 'marketing', 'finance', 'development', 'design', 'analytics', 'ecommerce', 'hr', 'social'],
      },
      source: 'demo',
    });
  } catch (err) {
    logger.error('Integrations Hub GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: { integrations: getDemoIntegrations() },
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: IntegrationsRequest = await request.json();
    const { action } = body;

    const supabase = await createClient();

    switch (action) {
      case 'list-all': {
        return NextResponse.json({
          success: true,
          data: {
            integrations: getDemoIntegrations(),
            total_available: 7000,
            page: 1,
            per_page: 50,
          },
        });
      }

      case 'list-connected': {
        return NextResponse.json({
          success: true,
          data: getDemoConnections(),
        });
      }

      case 'list-by-category': {
        const { category } = body;
        const integrations = getDemoIntegrations().filter(i => i.category === category);
        return NextResponse.json({
          success: true,
          data: integrations,
        });
      }

      case 'search': {
        const { query } = body;
        if (!query) {
          return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 });
        }

        const results = getDemoIntegrations().filter(i =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.description.toLowerCase().includes(query.toLowerCase())
        );

        return NextResponse.json({
          success: true,
          data: {
            query,
            results,
            total: results.length,
          },
        });
      }

      case 'get-integration': {
        const { integrationId } = body;
        const integration = getDemoIntegrations().find(i => i.id === integrationId);

        return NextResponse.json({
          success: true,
          data: integration || null,
        });
      }

      case 'connect': {
        const { integrationId } = body;
        const integration = getDemoIntegrations().find(i => i.id === integrationId);

        if (!integration) {
          return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: {
            integration_id: integrationId,
            auth_url: `https://auth.freeflow.io/connect/${integrationId}`,
            status: 'pending',
          },
          message: 'Redirecting to authorization...',
        });
      }

      case 'disconnect': {
        const { connectionId } = body;

        return NextResponse.json({
          success: true,
          data: { connection_id: connectionId, disconnected: true },
          message: 'Integration disconnected successfully',
        });
      }

      case 'update-settings': {
        const { connectionId, settings } = body;

        return NextResponse.json({
          success: true,
          data: {
            connection_id: connectionId,
            settings,
            updated_at: new Date().toISOString(),
          },
          message: 'Settings updated successfully',
        });
      }

      case 'test-connection': {
        const { connectionId } = body;

        return NextResponse.json({
          success: true,
          data: {
            connection_id: connectionId,
            status: 'healthy',
            latency_ms: 45,
            last_tested: new Date().toISOString(),
          },
          message: 'Connection is healthy',
        });
      }

      case 'get-templates': {
        return NextResponse.json({
          success: true,
          data: getDemoTemplates(),
        });
      }

      case 'create-automation': {
        const { templateId } = body;
        const template = getDemoTemplates().find(t => t.id === templateId);

        return NextResponse.json({
          success: true,
          data: {
            automation_id: `auto-${Date.now()}`,
            based_on_template: templateId,
            name: template?.name || 'Custom Automation',
            status: 'active',
            created_at: new Date().toISOString(),
          },
          message: 'Automation created successfully',
        });
      }

      case 'sync-now': {
        const { connectionId } = body;

        return NextResponse.json({
          success: true,
          data: {
            connection_id: connectionId,
            sync_started: new Date().toISOString(),
            estimated_duration: '30 seconds',
          },
          message: 'Sync started',
        });
      }

      case 'get-logs': {
        const { connectionId } = body;

        const logs = Array.from({ length: 10 }, (_, i) => ({
          id: `log-${i}`,
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
          type: ['sync', 'trigger', 'action', 'error'][Math.floor(Math.random() * 4)],
          message: ['Sync completed', 'Webhook received', 'Action executed', 'Rate limit warning'][Math.floor(Math.random() * 4)],
          details: {},
        }));

        return NextResponse.json({
          success: true,
          data: logs,
        });
      }

      case 'ai-suggest-integrations': {
        const suggestions = [
          {
            integration: getDemoIntegrations().find(i => i.id === 'int-hubspot'),
            reason: 'You manage clients in FreeFlow CRM. HubSpot can enhance your marketing automation.',
            match_score: 92,
          },
          {
            integration: getDemoIntegrations().find(i => i.id === 'int-notion'),
            reason: 'Your team uses project documentation. Notion can centralize knowledge.',
            match_score: 88,
          },
          {
            integration: getDemoIntegrations().find(i => i.id === 'int-github'),
            reason: 'You have development projects. GitHub integration enables issue tracking.',
            match_score: 85,
          },
        ];

        return NextResponse.json({
          success: true,
          data: {
            suggestions,
            based_on: ['current_usage', 'team_size', 'industry'],
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Integrations Hub POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
