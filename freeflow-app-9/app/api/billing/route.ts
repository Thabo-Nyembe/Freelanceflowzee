// =====================================================
// Billing API
// Handles subscription and billing operations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('billing');

// =====================================================
// GET - Get billing information
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Get payment methods
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('id, type, last4, brand, exp_month, exp_year, is_default')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    // Get recent invoices
    const { data: invoices } = await supabase
      .from('billing_invoices')
      .select('id, amount, currency, status, created_at, paid_at, invoice_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get usage statistics
    const { data: usage } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      billing: {
        subscription: subscription || {
          plan: 'free',
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodEnd: null
        },
        paymentMethods: paymentMethods || [],
        invoices: invoices || [],
        usage: usage || {
          storage_used: 0,
          storage_limit: 5368709120, // 5GB in bytes
          api_calls: 0,
          api_calls_limit: 1000,
          team_members: 1,
          team_members_limit: 1
        }
      }
    });
  } catch (error: any) {
    logger.error('Billing GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get billing information' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Billing actions
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'update-payment-method': {
        // Update default payment method
        if (data.paymentMethodId) {
          // Unset all as default first
          await supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('user_id', user.id);

          // Set new default
          const { error } = await supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', data.paymentMethodId)
            .eq('user_id', user.id);

          if (error) throw error;
        }

        return NextResponse.json({
          success: true,
          message: 'Payment method updated'
        });
      }

      case 'upgrade-plan': {
        // Handle plan upgrade
        const { planId, billingCycle } = data;

        // Update subscription
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            plan_id: planId,
            billing_cycle: billingCycle || 'monthly',
            status: 'active',
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: `Upgraded to ${planId} plan`,
          redirectUrl: `/checkout?plan=${planId}&cycle=${billingCycle}`
        });
      }

      case 'downgrade-plan': {
        // Schedule downgrade at end of billing period
        const { error } = await supabase
          .from('subscriptions')
          .update({
            scheduled_downgrade: data.planId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error && error.code !== '42P01') throw error;

        return NextResponse.json({
          success: true,
          message: 'Plan downgrade scheduled for end of billing period'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error('Billing POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
