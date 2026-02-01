import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

/**
 * Integration Status Check API
 *
 * Returns the connection status of a specific integration
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('id');

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    logger.info('Checking integration status', { integrationId });

    // Query database for actual connection status
    if (user) {
      const { data: integration, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', integrationId)
        .single();

      if (!error && integration) {
        // Check if token is still valid (not expired)
        const isTokenValid = integration.expires_at
          ? new Date(integration.expires_at) > new Date()
          : true;

        return NextResponse.json({
          success: true,
          integrationId,
          connected: integration.is_active && isTokenValid,
          lastConnected: integration.connected_at,
          lastChecked: new Date().toISOString(),
          metadata: {
            scope: integration.scope,
            accountName: integration.account_name
          }
        });
      }
    }

    // Check environment variables for API-key based integrations
    const envBasedIntegrations: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      stripe: process.env.STRIPE_SECRET_KEY,
      twilio: process.env.TWILIO_ACCOUNT_SID,
      resend: process.env.RESEND_API_KEY,
      sendgrid: process.env.SENDGRID_API_KEY,
    };

    const envKey = envBasedIntegrations[integrationId];
    if (envKey && !envKey.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        integrationId,
        connected: true,
        configuredVia: 'environment',
        lastChecked: new Date().toISOString()
      });
    }

    // Not connected
    return NextResponse.json({
      success: true,
      integrationId,
      connected: false,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Integration status check error', { error: error.message });

    return NextResponse.json(
      { error: error.message || 'Failed to check integration status' },
      { status: 500 }
    );
  }
}
