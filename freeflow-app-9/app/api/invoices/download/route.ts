import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// ============================================================================
// INVOICE DOWNLOAD API
// ============================================================================
// Download invoice PDFs
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// HELPER: Get user from auth header
// ============================================================================
async function getUserFromAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  }
  return null;
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    const user = await getUserFromAuth(request);
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
    console.error('Invoice Download Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get invoice PDF',
    }, { status: 500 });
  }
}
