import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('billing-dunning');

// Types
interface DunningSettings {
  enabled: boolean;
  maxRetries: number;
  retryIntervals: number[]; // Days between retries
  gracePeriodDays: number;
  cancelAfterFailure: boolean;
  emailTemplates: {
    firstAttempt: string;
    retry: string;
    finalWarning: string;
    cancelled: string;
  };
}

interface FailedPayment {
  id: string;
  invoiceId: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  failureCode: string;
  failureMessage: string;
  attemptCount: number;
  nextRetryAt: string;
  status: 'pending_retry' | 'exhausted' | 'recovered' | 'cancelled';
  createdAt: string;
}

// GET - Fetch dunning data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    // Fetch dunning settings
    const { data: settings } = await supabase
      .from('dunning_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    // Default settings if none exist
    const dunningSettings: DunningSettings = settings || {
      enabled: true,
      maxRetries: 4,
      retryIntervals: [1, 3, 5, 7], // Retry after 1, 3, 5, 7 days
      gracePeriodDays: 14,
      cancelAfterFailure: true,
      emailTemplates: {
        firstAttempt: 'payment_failed_first',
        retry: 'payment_failed_retry',
        finalWarning: 'payment_final_warning',
        cancelled: 'subscription_cancelled_payment'
      }
    };

    // Fetch failed payments
    let failedPaymentsQuery = supabase
      .from('failed_payments')
      .select(`
        *,
        invoices(number, total, currency),
        subscriptions(id, plan_id, plans(name)),
        users(name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (status) {
      failedPaymentsQuery = failedPaymentsQuery.eq('status', status);
    }

    const { data: failedPayments } = await failedPaymentsQuery;

    // Calculate stats
    const stats = {
      total: failedPayments?.length || 0,
      pendingRetry: failedPayments?.filter(p => p.status === 'pending_retry').length || 0,
      recovered: failedPayments?.filter(p => p.status === 'recovered').length || 0,
      exhausted: failedPayments?.filter(p => p.status === 'exhausted').length || 0,
      cancelled: failedPayments?.filter(p => p.status === 'cancelled').length || 0,
      totalAtRisk: failedPayments?.filter(p => p.status === 'pending_retry')
        .reduce((sum, p) => sum + (p.invoices?.total || 0), 0) || 0,
      recoveryRate: failedPayments?.length > 0
        ? Math.round((failedPayments.filter(p => p.status === 'recovered').length / failedPayments.length) * 100)
        : 0
    };

    return NextResponse.json({
      settings: dunningSettings,
      failedPayments: failedPayments || [],
      stats
    });
  } catch (error) {
    logger.error('Dunning fetch error', { error });
    return NextResponse.json(
      { error: 'Failed to fetch dunning data' },
      { status: 500 }
    );
  }
}

// POST - Dunning actions
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
      case 'update-settings': {
        const { organizationId, settings } = params;

        const { data, error } = await supabase
          .from('dunning_settings')
          .upsert({
            organization_id: organizationId,
            ...settings,
            updated_at: new Date().toISOString(),
            updated_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'dunning_settings_updated',
          resource_type: 'dunning_settings',
          resource_id: data.id,
          details: settings
        });

        return NextResponse.json({
          success: true,
          settings: data
        });
      }

      case 'record-failure': {
        const {
          organizationId,
          invoiceId,
          subscriptionId,
          customerId,
          amount,
          failureCode,
          failureMessage,
          paymentMethodId
        } = params;

        // Get dunning settings
        const { data: settings } = await supabase
          .from('dunning_settings')
          .select('*')
          .eq('organization_id', organizationId)
          .single();

        const retryIntervals = settings?.retry_intervals || [1, 3, 5, 7];
        const nextRetryAt = new Date();
        nextRetryAt.setDate(nextRetryAt.getDate() + retryIntervals[0]);

        // Create failed payment record
        const { data: failedPayment, error } = await supabase
          .from('failed_payments')
          .insert({
            organization_id: organizationId,
            invoice_id: invoiceId,
            subscription_id: subscriptionId,
            customer_id: customerId,
            amount,
            failure_code: failureCode,
            failure_message: failureMessage,
            payment_method_id: paymentMethodId,
            attempt_count: 1,
            next_retry_at: nextRetryAt.toISOString(),
            status: 'pending_retry'
          })
          .select()
          .single();

        if (error) throw error;

        // Update invoice status
        await supabase
          .from('invoices')
          .update({ status: 'failed', last_payment_error: failureMessage })
          .eq('id', invoiceId);

        // Queue email notification
        if (settings?.enabled !== false) {
          const { data: customer } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', customerId)
            .single();

          if (customer?.email) {
            await supabase.from('email_queue').insert({
              to: customer.email,
              template: settings?.email_templates?.firstAttempt || 'payment_failed_first',
              data: {
                customerName: customer.name,
                amount,
                failureReason: failureMessage,
                nextRetryDate: nextRetryAt.toLocaleDateString(),
                updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing/payment-methods`
              }
            });
          }
        }

        return NextResponse.json({
          success: true,
          failedPayment,
          nextRetryAt: nextRetryAt.toISOString()
        });
      }

      case 'retry-payment': {
        const { failedPaymentId, manual } = params;

        const { data: failedPayment } = await supabase
          .from('failed_payments')
          .select(`
            *,
            invoices(*),
            subscriptions(payment_method_id),
            users(email, name)
          `)
          .eq('id', failedPaymentId)
          .single();

        if (!failedPayment) {
          return NextResponse.json({ error: 'Failed payment not found' }, { status: 404 });
        }

        // Get dunning settings
        const { data: settings } = await supabase
          .from('dunning_settings')
          .select('*')
          .eq('organization_id', failedPayment.organization_id)
          .single();

        const maxRetries = settings?.max_retries || 4;
        const retryIntervals = settings?.retry_intervals || [1, 3, 5, 7];

        // In production, this would attempt payment through Stripe
        // For demo, simulate success/failure
        const paymentSucceeded = Math.random() > 0.3; // 70% success rate for retries

        if (paymentSucceeded) {
          // Update failed payment as recovered
          await supabase
            .from('failed_payments')
            .update({
              status: 'recovered',
              recovered_at: new Date().toISOString(),
              attempt_count: failedPayment.attempt_count + 1
            })
            .eq('id', failedPaymentId);

          // Update invoice as paid
          await supabase
            .from('invoices')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', failedPayment.invoice_id);

          // Create payment record
          await supabase.from('payments').insert({
            invoice_id: failedPayment.invoice_id,
            organization_id: failedPayment.organization_id,
            customer_id: failedPayment.customer_id,
            amount: failedPayment.amount,
            status: 'completed',
            payment_method_id: failedPayment.subscriptions?.payment_method_id
          });

          return NextResponse.json({
            success: true,
            recovered: true,
            message: 'Payment successful'
          });
        } else {
          // Payment failed again
          const newAttemptCount = failedPayment.attempt_count + 1;
          const isExhausted = newAttemptCount >= maxRetries;

          let status = 'pending_retry';
          let nextRetryAt = null;

          if (isExhausted) {
            status = 'exhausted';

            // Cancel subscription if configured
            if (settings?.cancel_after_failure) {
              await supabase
                .from('subscriptions')
                .update({
                  status: 'cancelled',
                  cancelled_at: new Date().toISOString(),
                  cancellation_reason: 'payment_failure'
                })
                .eq('id', failedPayment.subscription_id);

              status = 'cancelled';

              // Send cancellation email
              if (failedPayment.users?.email) {
                await supabase.from('email_queue').insert({
                  to: failedPayment.users.email,
                  template: settings?.email_templates?.cancelled || 'subscription_cancelled_payment',
                  data: {
                    customerName: failedPayment.users.name,
                    reactivateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`
                  }
                });
              }
            }
          } else {
            // Schedule next retry
            nextRetryAt = new Date();
            nextRetryAt.setDate(nextRetryAt.getDate() + (retryIntervals[newAttemptCount - 1] || 7));

            // Send retry email
            if (failedPayment.users?.email) {
              const isLastAttempt = newAttemptCount === maxRetries - 1;
              await supabase.from('email_queue').insert({
                to: failedPayment.users.email,
                template: isLastAttempt
                  ? settings?.email_templates?.finalWarning || 'payment_final_warning'
                  : settings?.email_templates?.retry || 'payment_failed_retry',
                data: {
                  customerName: failedPayment.users.name,
                  attemptNumber: newAttemptCount,
                  maxAttempts: maxRetries,
                  nextRetryDate: nextRetryAt.toLocaleDateString()
                }
              });
            }
          }

          await supabase
            .from('failed_payments')
            .update({
              status,
              attempt_count: newAttemptCount,
              next_retry_at: nextRetryAt?.toISOString(),
              last_retry_at: new Date().toISOString()
            })
            .eq('id', failedPaymentId);

          return NextResponse.json({
            success: true,
            recovered: false,
            status,
            attemptCount: newAttemptCount,
            nextRetryAt: nextRetryAt?.toISOString(),
            message: isExhausted ? 'Max retries reached' : 'Payment failed, scheduled for retry'
          });
        }
      }

      case 'skip-retry': {
        const { failedPaymentId, reason } = params;

        await supabase
          .from('failed_payments')
          .update({
            status: 'exhausted',
            skip_reason: reason,
            skipped_at: new Date().toISOString(),
            skipped_by: user.id
          })
          .eq('id', failedPaymentId);

        return NextResponse.json({
          success: true,
          message: 'Retry skipped'
        });
      }

      case 'mark-recovered': {
        const { failedPaymentId, notes } = params;

        const { data: failedPayment } = await supabase
          .from('failed_payments')
          .select('*')
          .eq('id', failedPaymentId)
          .single();

        if (!failedPayment) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Update failed payment
        await supabase
          .from('failed_payments')
          .update({
            status: 'recovered',
            recovered_at: new Date().toISOString(),
            recovery_notes: notes,
            recovered_by: user.id
          })
          .eq('id', failedPaymentId);

        // Update invoice
        await supabase
          .from('invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', failedPayment.invoice_id);

        return NextResponse.json({
          success: true,
          message: 'Marked as recovered'
        });
      }

      case 'process-scheduled': {
        // Process all scheduled retries (typically run by cron)
        const { organizationId } = params;

        const now = new Date();

        const { data: dueRetries } = await supabase
          .from('failed_payments')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('status', 'pending_retry')
          .lte('next_retry_at', now.toISOString());

        const results = [];
        for (const retry of dueRetries || []) {
          // Process each retry (in production, this would be queued)
          const result = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/billing/dunning`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'retry-payment', failedPaymentId: retry.id })
          }).then(r => r.json());

          results.push({ id: retry.id, ...result });
        }

        return NextResponse.json({
          success: true,
          processed: results.length,
          results
        });
      }

      case 'get-stats': {
        const { organizationId, period } = params;

        const startDate = new Date();
        switch (period) {
          case '7d': startDate.setDate(startDate.getDate() - 7); break;
          case '30d': startDate.setDate(startDate.getDate() - 30); break;
          case '90d': startDate.setDate(startDate.getDate() - 90); break;
          default: startDate.setDate(startDate.getDate() - 30);
        }

        const { data: failedPayments } = await supabase
          .from('failed_payments')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', startDate.toISOString());

        const total = failedPayments?.length || 0;
        const recovered = failedPayments?.filter(p => p.status === 'recovered') || [];
        const totalAmount = failedPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const recoveredAmount = recovered.reduce((sum, p) => sum + p.amount, 0);

        // Calculate average recovery time
        const recoveryTimes = recovered
          .filter(p => p.recovered_at)
          .map(p => new Date(p.recovered_at).getTime() - new Date(p.created_at).getTime());
        const avgRecoveryDays = recoveryTimes.length > 0
          ? Math.round(recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length / (1000 * 60 * 60 * 24))
          : 0;

        return NextResponse.json({
          success: true,
          stats: {
            totalFailures: total,
            recoveredCount: recovered.length,
            recoveryRate: total > 0 ? Math.round((recovered.length / total) * 100) : 0,
            totalAtRisk: totalAmount,
            recoveredAmount,
            lostAmount: totalAmount - recoveredAmount,
            avgRecoveryDays,
            byFailureCode: failedPayments?.reduce((acc, p) => {
              acc[p.failure_code] = (acc[p.failure_code] || 0) + 1;
              return acc;
            }, {} as Record<string, number>) || {}
          },
          period
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Dunning action error', { error });
    return NextResponse.json(
      { error: 'Failed to perform dunning action' },
      { status: 500 }
    );
  }
}
