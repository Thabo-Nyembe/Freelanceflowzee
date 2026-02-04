// =====================================================
// Account Deletion API
// Handles permanent account deletion requests
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

const logger = createFeatureLogger('account-delete');

// =====================================================
// DELETE - Request permanent account deletion
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Schedule deletion for 30 days from now (grace period)
    const scheduledDeletion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Try to insert deletion request
    const { error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        requested_at: new Date().toISOString(),
        scheduled_deletion: scheduledDeletion,
        status: 'pending',
        reason: 'user_requested'
      });

    if (insertError && insertError.code === '42P01') {
      // Table doesn't exist - use user_settings instead
      const { error: settingsError } = await supabase
        .from('user_settings')
        .update({
          deletion_requested: true,
          deletion_scheduled_at: scheduledDeletion,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (settingsError && settingsError.code !== '42703') {
        logger.error('Settings update error', { error: settingsError });
      }
    } else if (insertError) {
      throw insertError;
    }

    // Mark account as pending deletion in profile
    await supabase
      .from('user_profiles')
      .update({
        status: 'pending_deletion',
        deletion_scheduled_at: scheduledDeletion,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Sign out user
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Account deletion requested. You have 30 days to cancel by logging in.',
      scheduledDeletion,
      gracePeriodDays: 30
    });
  } catch (error) {
    logger.error('Account deletion request error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to request account deletion' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Cancel account deletion request
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'cancel') {
      // Cancel deletion request
      const { error: deleteError } = await supabase
        .from('account_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (deleteError && deleteError.code !== '42P01') {
        // Try user_settings
        await supabase
          .from('user_settings')
          .update({
            deletion_requested: false,
            deletion_scheduled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      // Restore account status
      await supabase
        .from('user_profiles')
        .update({
          status: 'active',
          deletion_scheduled_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return NextResponse.json({
        success: true,
        message: 'Account deletion cancelled. Your account is now active.'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Cancel deletion error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel deletion' },
      { status: 500 }
    );
  }
}
