import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';

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

/**
 * API Route: Complete Setup Wizard
 *
 * Finalizes the setup process and activates the automation agent
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { config, integrations } = await request.json();

    logger.info('Completing setup wizard', {
      integrationCount: integrations.length,
      connectedCount: integrations.filter((i: any) => i.status === 'connected').length,
    });

    // Validate required integrations
    const requiredIntegrations = integrations.filter((i: any) => i.required);
    const missingRequired = requiredIntegrations.filter((i: any) => i.status !== 'connected');

    if (missingRequired.length > 0) {
      throw new Error(`Required integrations not configured: ${missingRequired.map((i: any) => i.name).join(', ')}`);
    }

    // Create setup completion record
    const { error: setupError } = await supabase
      .from('agent_setup')
      .insert({
        completed_at: new Date().toISOString(),
        config: config,
        integrations_count: integrations.filter((i: any) => i.status === 'connected').length,
        status: 'complete',
      });

    if (setupError) {
      logger.error('Failed to save setup record', { error: setupError.message });
    }

    // Update agent configuration
    const { error: configError } = await supabase
      .from('agent_config')
      .upsert({
        id: 'default',
        enabled: true,
        auto_respond: false, // Start with approval mode
        require_approval_for_responses: true,
        require_approval_for_quotations: true,
        setup_completed: true,
        setup_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (configError) {
      logger.error('Failed to update agent config', { error: configError.message });
    }

    logger.info('Setup wizard completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        setupCompleted: true,
        agentEnabled: true,
        approvalModeEnabled: true,
      },
    });
  } catch (error) {
    logger.error('Setup completion failed', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check setup status
    const { data, error } = await supabase
      .from('agent_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      setupCompleted: data?.setup_completed || false,
      config: data || null,
    });
  } catch (error) {
    logger.error('Failed to get setup status', { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
