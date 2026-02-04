/**
 * Token Refresh Cron Job - FreeFlow A+++ Implementation
 * Automatically refreshes OAuth tokens before they expire
 *
 * This endpoint should be called periodically (e.g., every 5 minutes) by a cron service
 * Vercel: Configure in vercel.json or use Vercel Cron
 * Self-hosted: Use system cron or a job scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { integrationService } from '@/lib/integrations/integration-service';
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

const logger = createFeatureLogger('cron-token-refresh');

// Verify the request is from an authorized source
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createClient();

    // Get all users with active integrations that have refresh tokens
    const { data: integrations, error: fetchError } = await supabase
      .from('integrations')
      .select('user_id')
      .eq('status', 'active')
      .not('refresh_token', 'is', null)
      .not('token_expires_at', 'is', null);

    if (fetchError) {
      logger.error('Failed to fetch integrations', { error: fetchError });
      return NextResponse.json(
        { error: 'Failed to fetch integrations' },
        { status: 500 }
      );
    }

    // Get unique user IDs
    const userIds = [...new Set(integrations?.map(i => i.user_id) || [])];

    // Track results
    const results = {
      processed: 0,
      refreshed: 0,
      failed: 0,
      errors: [] as Array<{ userId: string; integrationId: string; error: string }>,
    };

    // Process each user's integrations
    for (const userId of userIds) {
      try {
        const { refreshed, failed } = await integrationService.refreshExpiringTokens(userId);

        results.processed += refreshed.length + failed.length;
        results.refreshed += refreshed.length;
        results.failed += failed.length;

        // Track failures
        for (const failure of failed) {
          results.errors.push({
            userId,
            integrationId: failure.integrationId,
            error: failure.error,
          });
        }
      } catch (error) {
        logger.error('Failed to refresh tokens for user', { userId, error });
      }
    }

    // Log summary
    logger.info('Token refresh cron completed', {
      refreshed: results.refreshed,
      failed: results.failed,
      errors: results.errors.length
    });

    return NextResponse.json({
      success: true,
      data: {
        usersProcessed: userIds.length,
        integrationsProcessed: results.processed,
        tokensRefreshed: results.refreshed,
        tokensFailed: results.failed,
        errors: results.errors.slice(0, 10), // Only return first 10 errors
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Token refresh cron failed', { error });
    return NextResponse.json(
      {
        error: 'Token refresh cron failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
