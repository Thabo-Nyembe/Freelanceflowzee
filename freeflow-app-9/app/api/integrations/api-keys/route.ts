// =====================================================
// KAZI API Keys Management Route
// Create, list, and manage API keys
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { integrationService } from '@/lib/integrations/integration-service';
import { createSimpleLogger } from '@/lib/simple-logger';

const logger = createSimpleLogger('api-keys');

// Demo mode constants
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url);
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  );
}

// Demo API keys data
function getDemoApiKeys() {
  return [
    {
      id: 'demo-key-1',
      name: 'Production API Key',
      key_preview: 'kazi_live_xxx...xxx',
      scopes: ['read', 'write'],
      last_used_at: new Date(Date.now() - 86400000).toISOString(),
      usage_count: 1247,
      rate_limit: 1000,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-key-2',
      name: 'Development API Key',
      key_preview: 'kazi_test_xxx...xxx',
      scopes: ['read', 'write', 'delete'],
      last_used_at: new Date(Date.now() - 3600000).toISOString(),
      usage_count: 523,
      rate_limit: 500,
      expires_at: null,
      is_active: true,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-key-3',
      name: 'Webhook Integration Key',
      key_preview: 'kazi_live_yyy...yyy',
      scopes: ['read'],
      last_used_at: new Date(Date.now() - 7200000).toISOString(),
      usage_count: 89,
      rate_limit: 100,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// =====================================================
// GET - List API keys
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check for demo mode
    const demoMode = isDemoMode(request);

    // If not authenticated
    if (!user) {
      if (demoMode) {
        // Use demo user ID and try to fetch from database
        const userId = DEMO_USER_ID;

        try {
          const apiKeys = await integrationService.getApiKeys(userId);

          if (apiKeys && apiKeys.length > 0) {
            // Don't return the actual key hash for security
            const sanitizedKeys = apiKeys.map(key => ({
              id: key.id,
              name: key.name,
              key_preview: `${key.key_prefix}...`,
              scopes: key.scopes,
              last_used_at: key.last_used_at,
              usage_count: key.usage_count,
              rate_limit: key.rate_limit,
              expires_at: key.expires_at,
              is_active: key.is_active,
              created_at: key.created_at,
            }));

            return NextResponse.json({
              success: true,
              demo: true,
              api_keys: sanitizedKeys,
              total: sanitizedKeys.length,
            });
          }
        } catch (dbError) {
          // Database fetch failed, fall back to mock data
          logger.info('Demo mode: falling back to mock data');
        }

        // Return demo data
        const demoKeys = getDemoApiKeys();
        return NextResponse.json({
          success: true,
          demo: true,
          api_keys: demoKeys,
          total: demoKeys.length,
        });
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const apiKeys = await integrationService.getApiKeys(user.id);

    // Don't return the actual key hash for security
    const sanitizedKeys = apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      key_preview: `${key.key_prefix}...`,
      scopes: key.scopes,
      last_used_at: key.last_used_at,
      usage_count: key.usage_count,
      rate_limit: key.rate_limit,
      expires_at: key.expires_at,
      is_active: key.is_active,
      created_at: key.created_at,
    }));

    return NextResponse.json({
      success: true,
      api_keys: sanitizedKeys,
      total: sanitizedKeys.length,
    });
  } catch (error) {
    logger.error('API Keys GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create API key or perform actions
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create': {
        if (!data.name) {
          return NextResponse.json(
            { success: false, error: 'name is required' },
            { status: 400 }
          );
        }

        // Validate scopes
        const validScopes = ['read', 'write', 'delete', 'admin'];
        const scopes = data.scopes || ['read'];
        const invalidScopes = scopes.filter((s: string) => !validScopes.includes(s));
        if (invalidScopes.length > 0) {
          return NextResponse.json(
            { success: false, error: `Invalid scopes: ${invalidScopes.join(', ')}. Valid scopes: ${validScopes.join(', ')}` },
            { status: 400 }
          );
        }

        const { apiKey, key } = await integrationService.createApiKey(user.id, {
          name: data.name,
          scopes,
          rate_limit: data.rate_limit,
          expires_at: data.expires_at,
        });

        return NextResponse.json({
          success: true,
          action: 'create',
          api_key: {
            ...apiKey,
            key, // Only returned on creation - user must save this!
          },
          message: 'API key created successfully. Save this key now - it won\'t be shown again!',
          warning: 'This is the only time the full API key will be displayed. Please save it securely.',
        }, { status: 201 });
      }

      case 'revoke': {
        if (!data.key_id) {
          return NextResponse.json(
            { success: false, error: 'key_id is required' },
            { status: 400 }
          );
        }

        await integrationService.revokeApiKey(data.key_id);
        return NextResponse.json({
          success: true,
          action: 'revoke',
          message: 'API key revoked successfully',
        });
      }

      case 'delete': {
        if (!data.key_id) {
          return NextResponse.json(
            { success: false, error: 'key_id is required' },
            { status: 400 }
          );
        }

        await integrationService.deleteApiKey(data.key_id);
        return NextResponse.json({
          success: true,
          action: 'delete',
          message: 'API key deleted successfully',
        });
      }

      case 'validate': {
        if (!data.key) {
          return NextResponse.json(
            { success: false, error: 'key is required' },
            { status: 400 }
          );
        }

        const validKey = await integrationService.validateApiKey(data.key);
        if (!validKey) {
          return NextResponse.json({
            success: false,
            valid: false,
            error: 'Invalid or expired API key',
          }, { status: 401 });
        }

        return NextResponse.json({
          success: true,
          valid: true,
          key_id: validKey.id,
          scopes: validKey.scopes,
          rate_limit: validKey.rate_limit,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('API Keys POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete API key
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    await integrationService.deleteApiKey(keyId);
    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    logger.error('API Keys DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete API key' },
      { status: 500 }
    );
  }
}
