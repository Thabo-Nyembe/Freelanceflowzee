/**
 * Integration Token Refresh API - FreeFlow A+++ Implementation
 * Manually refresh OAuth tokens for integrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { integrationService } from '@/lib/integrations/integration-service';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('integrations-refresh');

// POST - Refresh a specific integration's token
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // Verify integration belongs to user
    const integration = await integrationService.getIntegration(integrationId);
    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    if (integration.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if integration has a refresh token
    if (!integration.refresh_token) {
      return NextResponse.json(
        { error: 'This integration does not support token refresh' },
        { status: 400 }
      );
    }

    // Attempt to refresh the token
    const refreshedIntegration = await integrationService.refreshIntegrationToken(integrationId);

    return NextResponse.json({
      success: true,
      data: {
        id: refreshedIntegration.id,
        type: refreshedIntegration.type,
        status: refreshedIntegration.status,
        token_expires_at: refreshedIntegration.token_expires_at,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    logger.error('Token refresh failed', { error });
    return NextResponse.json(
      {
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Get integrations that need refresh
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get integrations needing refresh
    const needingRefresh = await integrationService.getIntegrationsNeedingRefresh(user.id);

    return NextResponse.json({
      success: true,
      data: needingRefresh.map(integration => ({
        id: integration.id,
        type: integration.type,
        name: integration.name,
        status: integration.status,
        token_expires_at: integration.token_expires_at,
        time_until_expiry: integration.token_expires_at
          ? Math.floor((new Date(integration.token_expires_at).getTime() - Date.now()) / 1000 / 60)
          : null, // minutes until expiry
      })),
      count: needingRefresh.length,
    });
  } catch (error) {
    logger.error('Failed to get integrations needing refresh', { error });
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// PATCH - Refresh all expiring tokens for current user
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Refresh all expiring tokens
    const { refreshed, failed } = await integrationService.refreshExpiringTokens(user.id);

    return NextResponse.json({
      success: true,
      data: {
        refreshed: refreshed.length,
        failed: failed.length,
        failedDetails: failed,
      },
      message: `Refreshed ${refreshed.length} tokens, ${failed.length} failed`,
    });
  } catch (error) {
    logger.error('Bulk token refresh failed', { error });
    return NextResponse.json(
      {
        error: 'Bulk token refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
