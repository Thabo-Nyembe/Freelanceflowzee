/**
 * Payment Confirmation API - FreeFlow A+++ Implementation
 * Handles payment confirmation, webhook processing, and receipt generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('payment-confirm');

// Initialize Stripe if API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'confirm-payment-intent': {
        return await confirmPaymentIntent(data);
      }

      case 'confirm-invoice-payment': {
        return await confirmInvoicePayment(data);
      }

      case 'process-webhook': {
        return await processWebhook(request);
      }

      case 'verify-payment': {
        return await verifyPayment(data);
      }

      case 'generate-receipt': {
        return await generateReceipt(data);
      }

      case 'refund': {
        return await processRefund(data);
      }

      default:
        // Default: confirm a payment intent
        return await confirmPaymentIntent(data);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Payment confirm error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent');
    const invoiceId = searchParams.get('invoice_id');

    if (paymentIntentId) {
      return await getPaymentStatus(paymentIntentId);
    }

    if (invoiceId) {
      return await getInvoicePaymentStatus(invoiceId);
    }

    return NextResponse.json({
      success: true,
      service: 'Payment Confirmation Service',
      version: '2.0.0',
      status: 'operational',
      capabilities: [
        'confirm_payment_intent',
        'confirm_invoice_payment',
        'process_webhook',
        'verify_payment',
        'generate_receipt',
        'process_refund'
      ]
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Payment confirm GET error', { error: errorMessage });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function confirmPaymentIntent(data: any) {
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Payment processing not configured' },
      { status: 503 }
    );
  }

  const { paymentIntentId, paymentMethodId } = data;

  if (!paymentIntentId) {
    return NextResponse.json(
      { success: false, error: 'Payment intent ID required' },
      { status: 400 }
    );
  }

  try {
    // Confirm the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    // Update local database
    const supabase = await createClient();

    if (paymentIntent.status === 'succeeded') {
      // Find and update the associated payment record
      const { data: payment, error: findError } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (!findError && payment) {
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.id);

        // Update associated invoice if exists
        if (payment.invoice_id) {
          await supabase
            .from('invoices')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.invoice_id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret
      }
    });
  } catch (stripeError: any) {
    logger.error('Stripe confirmation error', { error: stripeError });
    return NextResponse.json(
      {
        success: false,
        error: stripeError.message,
        code: stripeError.code
      },
      { status: 400 }
    );
  }
}

async function confirmInvoicePayment(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { invoiceId, paymentMethod, transactionId, amount } = data;

  if (!invoiceId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID required' },
      { status: 400 }
    );
  }

  // Get the invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    return NextResponse.json(
      { success: false, error: 'Invoice not found' },
      { status: 404 }
    );
  }

  // Verify amount if provided
  if (amount && Math.abs(amount - invoice.total) > 0.01) {
    return NextResponse.json(
      { success: false, error: 'Payment amount does not match invoice total' },
      { status: 400 }
    );
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: invoice.user_id,
      invoice_id: invoiceId,
      amount: invoice.total,
      currency: invoice.currency || 'usd',
      payment_method: paymentMethod || 'manual',
      transaction_id: transactionId,
      status: 'completed',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (paymentError) {
    throw paymentError;
  }

  // Update invoice status
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', invoiceId);

  // Create transaction record
  await supabase.from('transactions').insert({
    user_id: invoice.user_id,
    type: 'payment',
    amount: invoice.total,
    currency: invoice.currency || 'usd',
    description: `Payment for invoice ${invoice.invoice_number || invoiceId}`,
    reference_type: 'invoice',
    reference_id: invoiceId,
    status: 'completed',
    created_at: new Date().toISOString()
  });

  return NextResponse.json({
    success: true,
    data: {
      payment,
      invoice: {
        id: invoice.id,
        status: 'paid',
        paidAt: new Date().toISOString()
      }
    },
    message: 'Payment confirmed successfully'
  });
}

async function processWebhook(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Webhook processing not configured' },
      { status: 503 }
    );
  }

  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { success: false, error: 'Missing webhook signature or secret' },
      { status: 400 }
    );
  }

  try {
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(supabase, paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(supabase, charge);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    logger.error('Webhook error', { error: err.message });
    return NextResponse.json(
      { success: false, error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }
}

async function handlePaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  // Find and update payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (payment) {
    await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    // Update associated invoice
    if (payment.invoice_id) {
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.invoice_id);
    }
  }
}

async function handlePaymentFailure(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (payment) {
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        error_message: paymentIntent.last_payment_error?.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);
  }
}

async function handleRefund(supabase: any, charge: Stripe.Charge) {
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_charge_id', charge.id)
    .single();

  if (payment) {
    const refundAmount = charge.amount_refunded / 100;

    await supabase
      .from('payments')
      .update({
        status: charge.refunded ? 'refunded' : 'partially_refunded',
        refunded_amount: refundAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    // Create refund transaction
    await supabase.from('transactions').insert({
      user_id: payment.user_id,
      type: 'refund',
      amount: -refundAmount,
      currency: charge.currency,
      description: `Refund for payment ${payment.id}`,
      reference_type: 'payment',
      reference_id: payment.id,
      status: 'completed',
      created_at: new Date().toISOString()
    });
  }
}

async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  const { data: localInvoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('stripe_invoice_id', invoice.id)
    .single();

  if (localInvoice) {
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', localInvoice.id);
  }
}

async function verifyPayment(data: any) {
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Payment verification not configured' },
      { status: 503 }
    );
  }

  const { paymentIntentId } = data;

  if (!paymentIntentId) {
    return NextResponse.json(
      { success: false, error: 'Payment intent ID required' },
      { status: 400 }
    );
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return NextResponse.json({
    success: true,
    data: {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method,
      created: new Date(paymentIntent.created * 1000).toISOString()
    }
  });
}

async function getPaymentStatus(paymentIntentId: string) {
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Payment service not configured' },
      { status: 503 }
    );
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return NextResponse.json({
    success: true,
    data: {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    }
  });
}

async function getInvoicePaymentStatus(invoiceId: string) {
  const supabase = await createClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('id, status, total, paid_at')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) {
    return NextResponse.json(
      { success: false, error: 'Invoice not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      invoiceId: invoice.id,
      status: invoice.status,
      amount: invoice.total,
      paidAt: invoice.paid_at
    }
  });
}

async function generateReceipt(data: any) {
  const supabase = await createClient();
  const { paymentId, invoiceId } = data;

  let payment;
  let invoice;

  if (paymentId) {
    const { data: p } = await supabase
      .from('payments')
      .select('*, invoice:invoices(*)')
      .eq('id', paymentId)
      .single();
    payment = p;
    invoice = p?.invoice;
  } else if (invoiceId) {
    const { data: i } = await supabase
      .from('invoices')
      .select('*, payments(*)')
      .eq('id', invoiceId)
      .single();
    invoice = i;
    payment = i?.payments?.[0];
  }

  if (!payment && !invoice) {
    return NextResponse.json(
      { success: false, error: 'Payment or invoice not found' },
      { status: 404 }
    );
  }

  // Generate receipt data
  const receipt = {
    receiptNumber: `RCP-${Date.now()}`,
    date: payment?.paid_at || invoice?.paid_at || new Date().toISOString(),
    payment: payment ? {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.payment_method,
      transactionId: payment.transaction_id
    } : null,
    invoice: invoice ? {
      id: invoice.id,
      number: invoice.invoice_number,
      total: invoice.total,
      items: invoice.items || []
    } : null,
    status: 'completed'
  };

  return NextResponse.json({
    success: true,
    data: receipt
  });
}

async function processRefund(data: any) {
  if (!stripe) {
    // Manual refund processing
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, amount, reason } = data;

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_amount: amount,
        refund_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    return NextResponse.json({
      success: true,
      message: 'Refund recorded (manual processing required)'
    });
  }

  const { paymentIntentId, amount, reason } = data;

  if (!paymentIntentId) {
    return NextResponse.json(
      { success: false, error: 'Payment intent ID required' },
      { status: 400 }
    );
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason === 'duplicate' ? 'duplicate' :
              reason === 'fraudulent' ? 'fraudulent' : 'requested_by_customer'
    });

    return NextResponse.json({
      success: true,
      data: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        currency: refund.currency
      }
    });
  } catch (stripeError: any) {
    logger.error('Stripe refund error', { error: stripeError });
    return NextResponse.json(
      {
        success: false,
        error: stripeError.message,
        code: stripeError.code
      },
      { status: 400 }
    );
  }
}
