import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('invoices-api');

// ============================================================================
// INVOICE DOWNLOAD API
// ============================================================================
// Download invoice PDFs
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { invoiceId } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    if (!invoiceId) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID required',
      }, { status: 400 });
    }

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isDemo || invoiceId.startsWith('in_demo')) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          message: 'Demo mode: Invoice PDF generation not available',
          url: null,
        },
      });
    }

    // Get invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.invoice_pdf) {
      return NextResponse.json({
        success: false,
        error: 'Invoice PDF not available. The invoice may still be processing.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        url: invoice.invoice_pdf,
        number: invoice.number,
      },
    });
  } catch (error) {
    logger.error('Invoice Download Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get invoice PDF',
    }, { status: 500 });
  }
}
