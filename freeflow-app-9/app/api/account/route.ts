// =====================================================
// Account Management API
// Handles account deletion, deactivation, and status
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

const logger = createFeatureLogger('account');

// =====================================================
// GET - Get account status
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for pending deletion request
    const { data: deletionRequest } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    // Check account status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status, deactivated_at')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      account: {
        id: user.id,
        email: user.email,
        status: profile?.status || 'active',
        deactivatedAt: profile?.deactivated_at || null,
        pendingDeletion: deletionRequest ? {
          requestedAt: deletionRequest.requested_at,
          scheduledDeletion: deletionRequest.scheduled_deletion
        } : null
      }
    });
  } catch (error) {
    logger.error('Account GET error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to get account status' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Request account deletion
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing deletion request
    const { data: existingRequest } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'Account deletion already requested'
      }, { status: 400 });
    }

    // Schedule deletion for 30 days from now
    const scheduledDeletion = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Create deletion request
    const { error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        requested_at: new Date().toISOString(),
        scheduled_deletion: scheduledDeletion,
        status: 'pending'
      });

    if (insertError) {
      // If table doesn't exist, handle gracefully
      if (insertError.code === '42P01') {
        // Mark user for deletion in user_profiles instead
        await supabase
          .from('user_profiles')
          .update({
            status: 'pending_deletion',
            deletion_scheduled_at: scheduledDeletion,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        return NextResponse.json({
          success: true,
          message: 'Account deletion requested',
          scheduledDeletion
        });
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion requested. You have 30 days to cancel.',
      scheduledDeletion
    });
  } catch (error) {
    logger.error('Account DELETE error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to request account deletion' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Account actions (deactivate, reactivate, cancel deletion)
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

    switch (action) {
      case 'deactivate': {
        // Deactivate account (can be reactivated)
        const { error } = await supabase
          .from('user_profiles')
          .update({
            status: 'deactivated',
            deactivated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error && error.code !== '42P01') throw error;

        // Sign out user
        await supabase.auth.signOut();

        return NextResponse.json({
          success: true,
          message: 'Account deactivated. You can reactivate by logging in again.'
        });
      }

      case 'reactivate': {
        // Reactivate a deactivated account
        const { error } = await supabase
          .from('user_profiles')
          .update({
            status: 'active',
            deactivated_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: 'Account reactivated successfully'
        });
      }

      case 'cancel-deletion': {
        // Cancel pending deletion request
        const { error } = await supabase
          .from('account_deletion_requests')
          .update({ status: 'cancelled' })
          .eq('user_id', user.id)
          .eq('status', 'pending');

        if (error && error.code !== '42P01') {
          // Try updating user_profiles instead
          await supabase
            .from('user_profiles')
            .update({
              status: 'active',
              deletion_scheduled_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        }

        return NextResponse.json({
          success: true,
          message: 'Account deletion cancelled'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Account POST error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}
