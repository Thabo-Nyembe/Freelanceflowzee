import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createSimpleLogger } from '@/lib/simple-logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

const logger = createSimpleLogger('stripe-api');

// ============================================================================
// REFUNDS API
// ============================================================================
// Handle refund requests
// - Submit refund request
// - Get refund status
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

interface RefundRequest {
  invoiceId?: string;
  chargeId?: string;
  amount?: number;
  reason?: string;
}

// ============================================================================
// POST HANDLER - Submit refund request
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: RefundRequest = await request.json();
    const { invoiceId, chargeId, amount, reason } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    if (!invoiceId && !chargeId) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID or Charge ID required',
      }, { status: 400 });
    }

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isDemo) {
      // In demo mode, create a refund request record
      const refundRequest = {
        id: `rfr_demo_${Date.now()}`,
        userId,
        invoiceId,
        status: 'pending',
        reason: reason || 'Customer requested refund',
        createdAt: new Date().toISOString(),
      };

      // Try to store in database
      try {
        await supabase
          .from('refund_requests')
          .insert({
            user_id: userId,
            invoice_id: invoiceId,
            status: 'pending',
            reason: reason || 'Customer requested refund',
          });
      } catch {
        // Table may not exist in demo
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          refundRequest,
          message: 'Refund request submitted. We will review and respond within 3-5 business days.',
        },
      });
    }

    // Production: Get the charge from the invoice
    let charge: string | undefined;

    if (chargeId) {
      charge = chargeId;
    } else if (invoiceId) {
      const invoice = await stripe.invoices.retrieve(invoiceId) as Stripe.Invoice & { charge?: string | Stripe.Charge | null };
      if (invoice.charge && typeof invoice.charge === 'string') {
        charge = invoice.charge;
      } else if (invoice.charge && typeof invoice.charge === 'object' && 'id' in invoice.charge) {
        charge = invoice.charge.id;
      }
    }

    if (!charge) {
      // No charge found - create a refund request for manual processing
      await supabase
        .from('refund_requests')
        .insert({
          user_id: userId,
          invoice_id: invoiceId,
          status: 'pending_review',
          reason: reason || 'Customer requested refund',
        });

      return NextResponse.json({
        success: true,
        data: {
          status: 'pending_review',
          message: 'Refund request submitted for review. Our team will process this within 3-5 business days.',
        },
      });
    }

    // Create the refund
    const refund = await stripe.refunds.create({
      charge,
      ...(amount && { amount }),
      reason: 'requested_by_customer',
      metadata: {
        userId,
        invoiceId: invoiceId || '',
        customerReason: reason || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        message: refund.status === 'succeeded'
          ? 'Refund processed successfully'
          : 'Refund is being processed',
      },
    });
  } catch (error) {
    logger.error('Refunds API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund request',
    }, { status: 500 });
  }
}

// ============================================================================
// GET HANDLER - Get refund status
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const refundId = searchParams.get('id');

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          refunds: [
            {
              id: 'rf_demo_1',
              status: 'pending',
              amount: 2900,
              createdAt: new Date().toISOString(),
              reason: 'Customer requested refund',
            },
          ],
        },
      });
    }

    if (refundId) {
      const refund = await stripe.refunds.retrieve(refundId);
      return NextResponse.json({
        success: true,
        data: {
          refund: {
            id: refund.id,
            status: refund.status,
            amount: refund.amount,
            createdAt: new Date(refund.created * 1000).toISOString(),
          },
        },
      });
    }

    // Get all refund requests for user from database
    const { data: requests } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        refundRequests: requests || [],
      },
    });
  } catch (error) {
    logger.error('Refunds GET Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get refund status',
    }, { status: 500 });
  }
}
