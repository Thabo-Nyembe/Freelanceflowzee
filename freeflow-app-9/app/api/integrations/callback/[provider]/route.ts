// =====================================================
// KAZI OAuth Callback Route
// Handle OAuth callbacks from providers
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
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

const logger = createFeatureLogger('integrations-oauth-callback');

// =====================================================
// GET - OAuth callback handler
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const { searchParams } = new URL(request.url);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      logger.error('OAuth error from provider', { provider, error, errorDescription });
      return NextResponse.redirect(
        new URL(
          `/dashboard/settings/integrations?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/dashboard/settings/integrations?error=Missing+authorization+code+or+state',
          request.url
        )
      );
    }

    // Exchange code for tokens and create integration
    const integration = await integrationService.handleOAuthCallback(code, state);

    // Activate the integration
    await integrationService.activateIntegration(integration.id);

    // Redirect to success page
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/integrations?success=true&integration=${integration.type}`,
        request.url
      )
    );

  } catch (error) {
    logger.error('OAuth callback error', { error });

    // Redirect to error page
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/integrations?error=${encodeURIComponent(error.message || 'Failed to complete authorization')}`,
        request.url
      )
    );
  }
}
