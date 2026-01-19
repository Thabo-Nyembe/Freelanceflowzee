import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types
interface ProrationCalculation {
  subscriptionId: string;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: string;
  };
  newPlan: {
    id: string;
    name: string;
    price: number;
    interval: string;
  };
  billingPeriod: {
    start: string;
    end: string;
    totalDays: number;
    daysUsed: number;
    daysRemaining: number;
  };
  proration: {
    currentPlanCredit: number;
    newPlanCharge: number;
    netAmount: number;
    effectiveDate: string;
  };
  isUpgrade: boolean;
}

// POST - Proration actions
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
      case 'calculate': {
        const { subscriptionId, newPlanId, effectiveDate } = params;

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

        // Calculate billing period
        const periodStart = new Date(subscription.current_period_start);
        const periodEnd = new Date(subscription.current_period_end);
        const effective = effectiveDate ? new Date(effectiveDate) : new Date();

        const totalPeriodMs = periodEnd.getTime() - periodStart.getTime();
        const usedMs = effective.getTime() - periodStart.getTime();
        const remainingMs = periodEnd.getTime() - effective.getTime();

        const totalDays = Math.ceil(totalPeriodMs / (1000 * 60 * 60 * 24));
        const daysUsed = Math.ceil(usedMs / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

        const remainingFraction = daysRemaining / totalDays;

        // Get prices (normalize to monthly)
        const currentMonthlyPrice = subscription.plans.interval === 'yearly'
          ? subscription.plans.price / 12
          : subscription.plans.price;

        const newMonthlyPrice = newPlan.interval === 'yearly'
          ? newPlan.price / 12
          : newPlan.price;

        // Calculate proration
        const currentPlanCredit = currentMonthlyPrice * remainingFraction;
        const newPlanCharge = newMonthlyPrice * remainingFraction;
        const netAmount = newPlanCharge - currentPlanCredit;

        const isUpgrade = newMonthlyPrice > currentMonthlyPrice;

        const calculation: ProrationCalculation = {
          subscriptionId,
          currentPlan: {
            id: subscription.plans.id,
            name: subscription.plans.name,
            price: subscription.plans.price,
            interval: subscription.plans.interval
          },
          newPlan: {
            id: newPlan.id,
            name: newPlan.name,
            price: newPlan.price,
            interval: newPlan.interval
          },
          billingPeriod: {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString(),
            totalDays,
            daysUsed,
            daysRemaining
          },
          proration: {
            currentPlanCredit: Math.round(currentPlanCredit * 100) / 100,
            newPlanCharge: Math.round(newPlanCharge * 100) / 100,
            netAmount: Math.round(netAmount * 100) / 100,
            effectiveDate: effective.toISOString()
          },
          isUpgrade
        };

        return NextResponse.json({
          success: true,
          calculation,
          summary: {
            action: isUpgrade ? 'upgrade' : 'downgrade',
            immediateCharge: isUpgrade ? Math.max(0, netAmount) : 0,
            credit: isUpgrade ? 0 : Math.abs(Math.min(0, netAmount)),
            message: isUpgrade
              ? netAmount > 0
                ? `You'll be charged $${netAmount.toFixed(2)} immediately for the upgrade`
                : `No immediate charge - credit of $${Math.abs(netAmount).toFixed(2)} will be applied`
              : `You'll receive a credit of $${Math.abs(netAmount).toFixed(2)} on your next invoice`
          }
        });
      }

      case 'preview-change': {
        const { subscriptionId, changes } = params;

        // Get subscription with all related data
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*, plans(*)')
          .eq('id', subscriptionId)
          .single();

        if (!subscription) {
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        const periodStart = new Date(subscription.current_period_start);
        const periodEnd = new Date(subscription.current_period_end);
        const now = new Date();
        const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const remainingFraction = daysRemaining / totalDays;

        const previews = [];

        for (const change of changes) {
          if (change.type === 'plan_change') {
            const { data: newPlan } = await supabase
              .from('plans')
              .select('*')
              .eq('id', change.newPlanId)
              .single();

            if (newPlan) {
              const currentPrice = subscription.plans.price;
              const newPrice = newPlan.price;
              const priceDiff = newPrice - currentPrice;
              const prorationAmount = priceDiff * remainingFraction;

              previews.push({
                type: 'plan_change',
                from: subscription.plans.name,
                to: newPlan.name,
                priceDifference: priceDiff,
                prorationAmount: Math.round(prorationAmount * 100) / 100,
                effectiveImmediately: change.immediate
              });
            }
          } else if (change.type === 'quantity_change') {
            const unitPrice = subscription.plans.price;
            const currentQuantity = subscription.quantity || 1;
            const newQuantity = change.quantity;
            const quantityDiff = newQuantity - currentQuantity;
            const prorationAmount = unitPrice * quantityDiff * remainingFraction;

            previews.push({
              type: 'quantity_change',
              from: currentQuantity,
              to: newQuantity,
              unitPrice,
              prorationAmount: Math.round(prorationAmount * 100) / 100
            });
          } else if (change.type === 'addon_change') {
            const { data: addon } = await supabase
              .from('addons')
              .select('*')
              .eq('id', change.addonId)
              .single();

            if (addon) {
              const prorationAmount = addon.price * remainingFraction;
              previews.push({
                type: change.action === 'add' ? 'addon_added' : 'addon_removed',
                addon: addon.name,
                price: addon.price,
                prorationAmount: Math.round((change.action === 'add' ? prorationAmount : -prorationAmount) * 100) / 100
              });
            }
          }
        }

        const totalProration = previews.reduce((sum, p) => sum + p.prorationAmount, 0);

        return NextResponse.json({
          success: true,
          previews,
          totalProration: Math.round(totalProration * 100) / 100,
          billingPeriod: {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString(),
            daysRemaining,
            remainingFraction: Math.round(remainingFraction * 100) / 100
          }
        });
      }

      case 'apply': {
        const { subscriptionId, newPlanId, immediate, createInvoice } = params;

        // Recalculate proration
        const calcResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/proration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'calculate', subscriptionId, newPlanId })
        });
        const calcResult = await calcResponse.json();

        if (!calcResult.success) {
          return NextResponse.json({ error: 'Failed to calculate proration' }, { status: 500 });
        }

        const { calculation } = calcResult;

        // Update subscription
        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString()
        };

        if (immediate) {
          updateData.plan_id = newPlanId;
          updateData.metadata = {
            previous_plan_id: calculation.currentPlan.id,
            changed_at: new Date().toISOString(),
            proration_applied: true,
            proration_amount: calculation.proration.netAmount
          };
        } else {
          updateData.scheduled_plan_id = newPlanId;
          updateData.scheduled_change_date = calculation.billingPeriod.end;
        }

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscriptionId);

        if (updateError) throw updateError;

        // Create proration invoice if requested and there's a charge
        let invoice = null;
        if (createInvoice && calculation.proration.netAmount > 0) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('organization_id, user_id')
            .eq('id', subscriptionId)
            .single();

          const { data: inv } = await supabase
            .from('invoices')
            .insert({
              organization_id: sub?.organization_id,
              customer_id: sub?.user_id,
              subscription_id: subscriptionId,
              type: 'proration',
              status: 'pending',
              currency: 'USD',
              subtotal: calculation.proration.netAmount,
              tax_amount: 0,
              total: calculation.proration.netAmount,
              amount_due: calculation.proration.netAmount,
              amount_paid: 0,
              line_items: [{
                description: `Proration: ${calculation.currentPlan.name} → ${calculation.newPlan.name}`,
                quantity: 1,
                unitPrice: calculation.proration.netAmount,
                amount: calculation.proration.netAmount
              }],
              due_date: new Date().toISOString()
            })
            .select()
            .single();

          invoice = inv;
        }

        // Record credit if downgrade
        if (calculation.proration.netAmount < 0) {
          await supabase.from('customer_credits').insert({
            customer_id: calculation.subscriptionId,
            amount: Math.abs(calculation.proration.netAmount),
            reason: `Proration credit: ${calculation.currentPlan.name} → ${calculation.newPlan.name}`,
            expires_at: null // Never expires
          });
        }

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'proration_applied',
          resource_type: 'subscription',
          resource_id: subscriptionId,
          details: {
            fromPlan: calculation.currentPlan.name,
            toPlan: calculation.newPlan.name,
            prorationAmount: calculation.proration.netAmount,
            immediate
          }
        });

        return NextResponse.json({
          success: true,
          calculation,
          invoice,
          effectiveDate: immediate ? new Date().toISOString() : calculation.billingPeriod.end
        });
      }

      case 'get-credits': {
        const { customerId } = params;

        const { data: credits } = await supabase
          .from('customer_credits')
          .select('*')
          .eq('customer_id', customerId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        const totalCredits = credits?.reduce((sum, c) => sum + c.amount, 0) || 0;

        return NextResponse.json({
          success: true,
          credits: credits || [],
          totalCredits
        });
      }

      case 'apply-credit': {
        const { invoiceId, creditId, amount } = params;

        const { data: credit } = await supabase
          .from('customer_credits')
          .select('*')
          .eq('id', creditId)
          .eq('status', 'active')
          .single();

        if (!credit || credit.amount < amount) {
          return NextResponse.json({ error: 'Insufficient credit' }, { status: 400 });
        }

        const { data: invoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (!invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Apply credit
        const newAmountDue = Math.max(0, invoice.amount_due - amount);
        const creditUsed = invoice.amount_due - newAmountDue;

        // Update invoice
        await supabase
          .from('invoices')
          .update({
            amount_due: newAmountDue,
            credit_applied: (invoice.credit_applied || 0) + creditUsed,
            status: newAmountDue === 0 ? 'paid' : invoice.status
          })
          .eq('id', invoiceId);

        // Update credit
        const remainingCredit = credit.amount - creditUsed;
        if (remainingCredit <= 0) {
          await supabase
            .from('customer_credits')
            .update({ status: 'exhausted', amount: 0 })
            .eq('id', creditId);
        } else {
          await supabase
            .from('customer_credits')
            .update({ amount: remainingCredit })
            .eq('id', creditId);
        }

        return NextResponse.json({
          success: true,
          creditApplied: creditUsed,
          newAmountDue,
          remainingCredit
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Proration error:', error);
    return NextResponse.json(
      { error: 'Failed to perform proration action' },
      { status: 500 }
    );
  }
}
