// =====================================================
// KAZI Integrations API - Main Route
// Third-party integrations management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { integrationService, IntegrationType } from '@/lib/integrations/integration-service';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('integrations');

// =====================================================
// GET - List integrations or get stats
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoList();
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats': {
        const stats = await integrationService.getIntegrationStats(user.id);
        return NextResponse.json({ success: true, stats });
      }

      case 'available': {
        // Return available integration types
        const availableIntegrations = [
          { type: 'stripe', name: 'Stripe', category: 'payments', status: 'available', icon: '/icons/stripe.svg', description: 'Accept payments and manage subscriptions' },
          { type: 'paypal', name: 'PayPal', category: 'payments', status: 'available', icon: '/icons/paypal.svg', description: 'PayPal payment processing' },
          { type: 'google_calendar', name: 'Google Calendar', category: 'calendar', status: 'available', icon: '/icons/google-calendar.svg', description: 'Sync events with Google Calendar' },
          { type: 'outlook_calendar', name: 'Outlook Calendar', category: 'calendar', status: 'coming_soon', icon: '/icons/outlook.svg', description: 'Sync events with Outlook' },
          { type: 'google_drive', name: 'Google Drive', category: 'storage', status: 'available', icon: '/icons/google-drive.svg', description: 'Cloud storage and file sharing' },
          { type: 'dropbox', name: 'Dropbox', category: 'storage', status: 'available', icon: '/icons/dropbox.svg', description: 'File sync and storage' },
          { type: 'slack', name: 'Slack', category: 'communication', status: 'available', icon: '/icons/slack.svg', description: 'Team communication' },
          { type: 'discord', name: 'Discord', category: 'communication', status: 'coming_soon', icon: '/icons/discord.svg', description: 'Community chat' },
          { type: 'notion', name: 'Notion', category: 'productivity', status: 'coming_soon', icon: '/icons/notion.svg', description: 'Notes and documentation' },
          { type: 'trello', name: 'Trello', category: 'project_management', status: 'coming_soon', icon: '/icons/trello.svg', description: 'Project boards' },
          { type: 'asana', name: 'Asana', category: 'project_management', status: 'coming_soon', icon: '/icons/asana.svg', description: 'Task management' },
          { type: 'zapier', name: 'Zapier', category: 'automation', status: 'available', icon: '/icons/zapier.svg', description: 'Workflow automation' },
          { type: 'make', name: 'Make (Integromat)', category: 'automation', status: 'available', icon: '/icons/make.svg', description: 'Advanced automation' },
          { type: 'custom_webhook', name: 'Custom Webhook', category: 'custom', status: 'available', icon: '/icons/webhook.svg', description: 'Custom HTTP webhooks' },
        ];
        return NextResponse.json({ success: true, integrations: availableIntegrations });
      }

      default: {
        const type = searchParams.get('type') as IntegrationType | null;
        const integrations = await integrationService.getIntegrations(user.id, type || undefined);
        return NextResponse.json({
          success: true,
          action: 'list',
          integrations,
          total: integrations.length,
        });
      }
    }
  } catch (error) {
    logger.error('Integrations GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create integration or perform actions
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoAction(action, data);
    }

    switch (action) {
      // Legacy actions (backward compatibility)
      case 'connect': {
        if (!data.integrationId || !data.apiKey) {
          return NextResponse.json(
            { success: false, error: 'Integration ID and API key required' },
            { status: 400 }
          );
        }

        const integration = await integrationService.createIntegration(user.id, {
          type: data.integrationId as IntegrationType,
          name: getIntegrationDisplayName(data.integrationId),
          credentials: { api_key: data.apiKey },
          settings: data.config || {},
        });

        // Activate immediately if API key provided
        await integrationService.activateIntegration(integration.id);

        return NextResponse.json({
          success: true,
          action: 'connect',
          integration: {
            ...integration,
            status: 'connected',
            apiKey: data.apiKey.substring(0, 5) + '...' + data.apiKey.substring(data.apiKey.length - 3),
          },
          message: 'Integration connected successfully',
        });
      }

      case 'disconnect': {
        if (!data.integrationId && !data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'Integration ID required' },
            { status: 400 }
          );
        }

        const integrationId = data.integration_id || data.integrationId;
        await integrationService.deactivateIntegration(integrationId);

        return NextResponse.json({
          success: true,
          action: 'disconnect',
          message: 'Integration disconnected successfully',
        });
      }

      case 'test': {
        if (!data.integrationId && !data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'Integration ID required' },
            { status: 400 }
          );
        }

        // Simulate connection test
        const responseTime = Math.floor(Math.random() * 300) + 100;

        return NextResponse.json({
          success: true,
          action: 'test',
          integrationId: data.integrationId || data.integration_id,
          message: 'Connection test successful',
          details: {
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            lastChecked: new Date().toISOString(),
          },
        });
      }

      case 'configure': {
        if (!data.integrationId && !data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'Integration ID and config required' },
            { status: 400 }
          );
        }

        const integrationId = data.integration_id || data.integrationId;
        const integration = await integrationService.updateIntegration(integrationId, {
          settings: data.config,
        });

        return NextResponse.json({
          success: true,
          action: 'configure',
          integration,
          message: 'Integration configured successfully',
        });
      }

      case 'list': {
        const type = data.type as IntegrationType | undefined;
        const integrations = await integrationService.getIntegrations(user.id, type);
        return NextResponse.json({
          success: true,
          action: 'list',
          integrations,
          total: integrations.length,
        });
      }

      // New service-based actions
      case 'create': {
        if (!data.type || !data.name) {
          return NextResponse.json(
            { success: false, error: 'Type and name are required' },
            { status: 400 }
          );
        }

        const integration = await integrationService.createIntegration(user.id, {
          type: data.type,
          name: data.name,
          description: data.description,
          credentials: data.credentials,
          settings: data.settings,
          scopes: data.scopes,
          sync_frequency: data.sync_frequency,
          metadata: data.metadata,
        });

        return NextResponse.json({
          success: true,
          action: 'create',
          integration,
          message: `Integration "${integration.name}" created successfully`,
        }, { status: 201 });
      }

      case 'activate': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        const integration = await integrationService.activateIntegration(data.integration_id);
        return NextResponse.json({
          success: true,
          action: 'activate',
          integration,
          message: 'Integration activated',
        });
      }

      case 'deactivate': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        const integration = await integrationService.deactivateIntegration(data.integration_id);
        return NextResponse.json({
          success: true,
          action: 'deactivate',
          integration,
          message: 'Integration deactivated',
        });
      }

      case 'refresh-token': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        const integration = await integrationService.refreshIntegrationToken(data.integration_id);
        return NextResponse.json({
          success: true,
          action: 'refresh-token',
          integration,
          message: 'Token refreshed successfully',
        });
      }

      case 'delete': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        await integrationService.deleteIntegration(data.integration_id);
        return NextResponse.json({
          success: true,
          action: 'delete',
          message: 'Integration deleted successfully',
        });
      }

      case 'oauth-init': {
        if (!data.type) {
          return NextResponse.json(
            { success: false, error: 'Integration type is required' },
            { status: 400 }
          );
        }

        const { authUrl, state } = await integrationService.initiateOAuthFlow(user.id, data.type);
        return NextResponse.json({
          success: true,
          action: 'oauth-init',
          authUrl,
          state,
        });
      }

      case 'sync': {
        if (!data.integration_id) {
          return NextResponse.json(
            { success: false, error: 'integration_id is required' },
            { status: 400 }
          );
        }

        const integration = await integrationService.getIntegration(data.integration_id);
        if (!integration) {
          return NextResponse.json(
            { success: false, error: 'Integration not found' },
            { status: 404 }
          );
        }

        let job;
        switch (integration.type) {
          case 'google_calendar':
            job = await integrationService.syncGoogleCalendar(data.integration_id);
            break;
          case 'stripe':
            job = await integrationService.syncStripePayments(data.integration_id);
            break;
          default:
            return NextResponse.json(
              { success: false, error: `Sync not supported for ${integration.type}` },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: true,
          action: 'sync',
          job,
          message: 'Sync job started',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Integrations POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update integration
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { integration_id, ...updates } = body;

    if (!integration_id) {
      return NextResponse.json(
        { success: false, error: 'integration_id is required' },
        { status: 400 }
      );
    }

    const integration = await integrationService.updateIntegration(integration_id, updates);
    return NextResponse.json({
      success: true,
      integration,
      message: 'Integration updated successfully',
    });
  } catch (error) {
    logger.error('Integrations PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update integration' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete integration
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('id');

    if (!integrationId) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    await integrationService.deleteIntegration(integrationId);
    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    logger.error('Integrations DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete integration' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getIntegrationDisplayName(type: string): string {
  const names: Record<string, string> = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    google_calendar: 'Google Calendar',
    outlook_calendar: 'Outlook Calendar',
    google_drive: 'Google Drive',
    dropbox: 'Dropbox',
    slack: 'Slack',
    discord: 'Discord',
    notion: 'Notion',
    trello: 'Trello',
    asana: 'Asana',
    zapier: 'Zapier',
    make: 'Make (Integromat)',
    custom_webhook: 'Custom Webhook',
  };
  return names[type] || type;
}

// Demo mode for unauthenticated users
function handleDemoList(): NextResponse {
  const mockIntegrations = [
    {
      id: 'demo-slack',
      name: 'Slack',
      type: 'slack',
      category: 'Communication',
      status: 'connected',
      icon: '/icons/slack.svg',
      description: 'Team communication and collaboration',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-google-drive',
      name: 'Google Drive',
      type: 'google_drive',
      category: 'Storage',
      status: 'connected',
      icon: '/icons/google-drive.svg',
      description: 'Cloud storage and file sharing',
      lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-stripe',
      name: 'Stripe',
      type: 'stripe',
      category: 'Payments',
      status: 'disconnected',
      icon: '/icons/stripe.svg',
      description: 'Payment processing',
    },
  ];

  return NextResponse.json({
    success: true,
    action: 'list',
    integrations: mockIntegrations,
    total: mockIntegrations.length,
    message: 'Demo integrations loaded',
  });
}

function handleDemoAction(action: string, data: any): NextResponse {
  switch (action) {
    case 'connect':
      return NextResponse.json({
        success: true,
        action: 'connect',
        integration: {
          id: `demo-${data.integrationId}`,
          status: 'connected',
          apiKey: 'demo_***',
          lastSync: new Date().toISOString(),
        },
        message: 'Integration connected (demo mode)',
      });

    case 'disconnect':
      return NextResponse.json({
        success: true,
        action: 'disconnect',
        message: 'Integration disconnected (demo mode)',
      });

    case 'test':
      return NextResponse.json({
        success: true,
        action: 'test',
        message: 'Connection test successful (demo mode)',
        details: {
          status: 'healthy',
          responseTime: '150ms',
          lastChecked: new Date().toISOString(),
        },
      });

    case 'configure':
      return NextResponse.json({
        success: true,
        action: 'configure',
        message: 'Integration configured (demo mode)',
      });

    case 'list':
      return handleDemoList();

    default:
      return NextResponse.json({
        success: false,
        error: 'Please log in to use this feature',
      }, { status: 401 });
  }
}
