// =====================================================
// KAZI OAuth Callback Route
// Handle OAuth callbacks from providers
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { integrationService } from '@/lib/integrations/integration-service';
import { createFeatureLogger } from '@/lib/logger';

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
