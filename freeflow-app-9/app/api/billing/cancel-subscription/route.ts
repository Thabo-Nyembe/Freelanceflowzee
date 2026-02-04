// =====================================================
// Subscription Cancellation API
// Handles subscription cancellation requests
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

const logger = createFeatureLogger('billing-cancel-subscription');

// =====================================================
// POST - Cancel subscription
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'No active subscription found'
      }, { status: 404 });
    }

    // Check if already cancelled
    if (subscription.cancel_at_period_end) {
      return NextResponse.json({
        success: false,
        error: 'Subscription is already cancelled'
      }, { status: 400 });
    }

    // Calculate end of current billing period
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Mark subscription as cancelled (but still active until period end)
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (updateError && updateError.code !== '42P01') {
      throw updateError;
    }

    // Log cancellation event
    await supabase
      .from('billing_events')
      .insert({
        user_id: user.id,
        event_type: 'subscription_cancelled',
        details: {
          plan: subscription.plan_id,
          effective_date: currentPeriodEnd
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      effectiveDate: currentPeriodEnd,
      note: 'You will retain access to premium features until the end of your current billing period.'
    });
  } catch (error) {
    logger.error('Subscription cancellation error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Reactivate cancelled subscription
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('cancel_at_period_end', true)
      .single();

    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'No cancelled subscription found'
      }, { status: 404 });
    }

    // Reactivate subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        cancelled_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error && error.code !== '42P01') {
      throw error;
    }

    // Log reactivation event
    await supabase
      .from('billing_events')
      .insert({
        user_id: user.id,
        event_type: 'subscription_reactivated',
        details: { plan: subscription.plan_id },
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    logger.error('Subscription reactivation error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
