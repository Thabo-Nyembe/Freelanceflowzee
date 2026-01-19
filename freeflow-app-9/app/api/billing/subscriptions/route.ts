import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types
interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: Record<string, number>;
}

interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  metadata: Record<string, unknown>;
}

// GET - Fetch subscriptions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const subscriptionId = searchParams.get('subscriptionId');
    const status = searchParams.get('status');

    if (subscriptionId) {
      // Fetch single subscription
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans(*),
          users(id, name, email),
          organizations(id, name)
        `)
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;

      // Fetch usage for this subscription
      const { data: usage } = await supabase
        .from('usage_records')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .gte('recorded_at', subscription.current_period_start)
        .order('recorded_at', { ascending: false });

      // Fetch upcoming invoice
      const { data: upcomingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('status', 'draft')
        .single();

      return NextResponse.json({
        subscription,
        usage: usage || [],
        upcomingInvoice,
        limits: subscription.plans?.limits || {}
      });
    }

    // Fetch all subscriptions for organization
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        plans(id, name, price, interval, features),
        users(id, name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: subscriptions, error } = await query;

    if (error) throw error;

    // Calculate summary stats
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
    const mrr = activeSubscriptions.reduce((sum, s) => {
      const price = s.plans?.price || 0;
      const interval = s.plans?.interval || 'monthly';
      return sum + (interval === 'yearly' ? price / 12 : price);
    }, 0);

    return NextResponse.json({
      subscriptions: subscriptions || [],
      summary: {
        total: subscriptions?.length || 0,
        active: activeSubscriptions.length,
        cancelled: subscriptions?.filter(s => s.status === 'cancelled').length || 0,
        pastDue: subscriptions?.filter(s => s.status === 'past_due').length || 0,
        trialing: subscriptions?.filter(s => s.status === 'trialing').length || 0,
        mrr
      }
    });
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Subscription actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create': {
        const { organizationId, planId, userId, paymentMethodId, couponCode, trialDays } = params;

        // Get plan details
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (planError || !plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Check for existing active subscription
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('status', 'active')
          .single();

        if (existingSubscription) {
          return NextResponse.json(
            { error: 'Organization already has an active subscription' },
            { status: 400 }
          );
        }

        // Calculate dates
        const now = new Date();
        const trialEnd = trialDays ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
        const periodStart = trialEnd || now;
        const periodEnd = new Date(periodStart);
        if (plan.interval === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Apply coupon if provided
        let discount = 0;
        if (couponCode) {
          const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode)
            .eq('active', true)
            .single();

          if (coupon) {
            discount = coupon.percent_off
              ? (plan.price * coupon.percent_off) / 100
              : coupon.amount_off || 0;
          }
        }

        // Create subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .insert({
            organization_id: organizationId,
            user_id: userId || user.id,
            plan_id: planId,
            status: trialEnd ? 'trialing' : 'active',
            current_period_start: periodStart.toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_end: trialEnd?.toISOString(),
            payment_method_id: paymentMethodId,
            discount_amount: discount,
            coupon_code: couponCode,
            metadata: {
              created_by: user.id,
              created_at: now.toISOString()
            }
          })
          .select()
          .single();

        if (subError) throw subError;

        // Create initial invoice (if not trialing)
        if (!trialEnd) {
          await supabase.from('invoices').insert({
            subscription_id: subscription.id,
            organization_id: organizationId,
            customer_id: userId || user.id,
            amount: plan.price - discount,
            currency: 'USD',
            status: 'pending',
            due_date: now.toISOString(),
            line_items: [{
              description: `${plan.name} - ${plan.interval} subscription`,
              amount: plan.price,
              quantity: 1
            }],
            discount_amount: discount
          });
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'subscription_created',
          resource_type: 'subscription',
          resource_id: subscription.id,
          details: { planId, organizationId, trialDays }
        });

        return NextResponse.json({
          success: true,
          subscription,
          message: trialEnd
            ? `Trial started. Your trial ends on ${trialEnd.toLocaleDateString()}`
            : 'Subscription created successfully'
        });
      }

      case 'upgrade': {
        const { subscriptionId, newPlanId, immediate } = params;

        // Get current subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('id', subscriptionId)
          .single();

        if (subError || !subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Get new plan
        const { data: newPlan, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', newPlanId)
          .single();

        if (planError || !newPlan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Calculate proration if immediate
        let prorationAmount = 0;
        if (immediate) {
          const now = new Date();
          const periodStart = new Date(subscription.current_period_start);
          const periodEnd = new Date(subscription.current_period_end);
          const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
          const remainingMs = periodEnd.getTime() - now.getTime();
          const remainingFraction = remainingMs / totalPeriodMs;

          const oldPlanRemaining = subscription.plans.price * remainingFraction;
          const newPlanRemaining = newPlan.price * remainingFraction;
          prorationAmount = newPlanRemaining - oldPlanRemaining;
        }

        // Update subscription
        const updateData: Record<string, unknown> = {
          plan_id: newPlanId,
          updated_at: new Date().toISOString()
        };

        if (immediate) {
          // Immediate upgrade - keep same billing cycle
          updateData.metadata = {
            ...subscription.metadata,
            upgraded_from: subscription.plan_id,
            upgraded_at: new Date().toISOString()
          };
        } else {
          // Schedule upgrade for next billing cycle
          updateData.scheduled_plan_id = newPlanId;
          updateData.plan_id = subscription.plan_id; // Keep current plan
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscriptionId);

        if (updateError) throw updateError;

        // Create proration invoice if immediate and amount > 0
        if (immediate && prorationAmount > 0) {
          await supabase.from('invoices').insert({
            subscription_id: subscriptionId,
            organization_id: subscription.organization_id,
            customer_id: subscription.user_id,
            amount: Math.round(prorationAmount * 100) / 100,
            currency: 'USD',
            status: 'pending',
            due_date: new Date().toISOString(),
            line_items: [{
              description: `Upgrade proration: ${subscription.plans.name} → ${newPlan.name}`,
              amount: prorationAmount,
              quantity: 1
            }],
            type: 'proration'
          });
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'subscription_upgraded',
          resource_type: 'subscription',
          resource_id: subscriptionId,
          details: {
            oldPlanId: subscription.plan_id,
            newPlanId,
            immediate,
            prorationAmount
          }
        });

        return NextResponse.json({
          success: true,
          message: immediate
            ? `Upgraded to ${newPlan.name} immediately`
            : `Scheduled upgrade to ${newPlan.name} for next billing cycle`,
          prorationAmount: immediate ? prorationAmount : 0
        });
      }

      case 'downgrade': {
        const { subscriptionId, newPlanId } = params;

        // Get current subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('id', subscriptionId)
          .single();

        if (subError || !subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Get new plan
        const { data: newPlan } = await supabase
          .from('plans')
          .select('*')
          .eq('id', newPlanId)
          .single();

        if (!newPlan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Downgrades always happen at end of billing period
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            scheduled_plan_id: newPlanId,
            updated_at: new Date().toISOString(),
            metadata: {
              ...subscription.metadata,
              scheduled_downgrade: {
                from: subscription.plan_id,
                to: newPlanId,
                effective_date: subscription.current_period_end
              }
            }
          })
          .eq('id', subscriptionId);

        if (updateError) throw updateError;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'subscription_downgrade_scheduled',
          resource_type: 'subscription',
          resource_id: subscriptionId,
          details: {
            oldPlanId: subscription.plan_id,
            newPlanId,
            effectiveDate: subscription.current_period_end
          }
        });

        return NextResponse.json({
          success: true,
          message: `Downgrade to ${newPlan.name} scheduled for ${new Date(subscription.current_period_end).toLocaleDateString()}`,
          effectiveDate: subscription.current_period_end
        });
      }

      case 'cancel': {
        const { subscriptionId, cancelAtPeriodEnd, reason, feedback } = params;

        // Get subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('id', subscriptionId)
          .single();

        if (subError || !subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
          cancellation_reason: reason,
          cancellation_feedback: feedback,
          metadata: {
            ...subscription.metadata,
            cancellation: {
              requested_at: new Date().toISOString(),
              requested_by: user.id,
              reason,
              feedback
            }
          }
        };

        if (cancelAtPeriodEnd) {
          updateData.cancel_at_period_end = true;
        } else {
          updateData.status = 'cancelled';
          updateData.cancelled_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscriptionId);

        if (updateError) throw updateError;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'subscription_cancelled',
          resource_type: 'subscription',
          resource_id: subscriptionId,
          details: { cancelAtPeriodEnd, reason }
        });

        return NextResponse.json({
          success: true,
          message: cancelAtPeriodEnd
            ? `Subscription will be cancelled on ${new Date(subscription.current_period_end).toLocaleDateString()}`
            : 'Subscription cancelled immediately',
          cancelDate: cancelAtPeriodEnd ? subscription.current_period_end : new Date().toISOString()
        });
      }

      case 'reactivate': {
        const { subscriptionId } = params;

        // Get subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', subscriptionId)
          .single();

        if (subError || !subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
          return NextResponse.json({ error: 'Subscription is already active' }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            cancel_at_period_end: false,
            cancelled_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriptionId);

        if (updateError) throw updateError;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'subscription_reactivated',
          resource_type: 'subscription',
          resource_id: subscriptionId
        });

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated successfully'
        });
      }

      case 'pause': {
        const { subscriptionId, pauseUntil } = params;

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'paused',
            paused_at: new Date().toISOString(),
            resume_at: pauseUntil,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriptionId);

        if (updateError) throw updateError;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'subscription_paused',
          resource_type: 'subscription',
          resource_id: subscriptionId,
          details: { pauseUntil }
        });

        return NextResponse.json({
          success: true,
          message: `Subscription paused until ${new Date(pauseUntil).toLocaleDateString()}`
        });
      }

      case 'apply-coupon': {
        const { subscriptionId, couponCode } = params;

        // Validate coupon
        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', couponCode)
          .eq('active', true)
          .single();

        if (couponError || !coupon) {
          return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 400 });
        }

        // Check coupon limits
        if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
          return NextResponse.json({ error: 'Coupon has reached maximum redemptions' }, { status: 400 });
        }

        // Get subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('id', subscriptionId)
          .single();

        if (!subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Calculate discount
        const discount = coupon.percent_off
          ? (subscription.plans.price * coupon.percent_off) / 100
          : coupon.amount_off || 0;

        // Update subscription
        await supabase
          .from('subscriptions')
          .update({
            coupon_code: couponCode,
            discount_amount: discount,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriptionId);

        // Increment coupon usage
        await supabase
          .from('coupons')
          .update({ times_redeemed: coupon.times_redeemed + 1 })
          .eq('id', coupon.id);

        return NextResponse.json({
          success: true,
          message: `Coupon applied! You save $${discount.toFixed(2)} per billing cycle`,
          discount
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Subscription action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform subscription action' },
      { status: 500 }
    );
  }
}
