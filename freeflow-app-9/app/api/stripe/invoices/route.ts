import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// ============================================================================
// STRIPE INVOICES API
// ============================================================================
// Manage Stripe invoices
// - Retry payment
// - Get invoice details
// - Download invoice PDF
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface InvoiceRequest {
  action: string;
  invoiceId?: string;
}

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
    const body: InvoiceRequest = await request.json();
    const { action, invoiceId } = body;

    const user = await getUserFromAuth(request);
    const userId = user?.id;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    switch (action) {
      // ======================================================================
      // RETRY PAYMENT
      // ======================================================================
      case 'retry-payment': {
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

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Payment retry would be attempted',
              invoiceId,
              status: 'paid',
            },
          });
        }

        // Pay the invoice
        const invoice = await stripe.invoices.pay(invoiceId);
        const isPaid = invoice.status === 'paid';

        return NextResponse.json({
          success: true,
          data: {
            message: isPaid ? 'Payment successful' : 'Payment is processing',
            invoiceId: invoice.id,
            status: invoice.status,
            paid: isPaid,
          },
        });
      }

      // ======================================================================
      // GET INVOICE DETAILS
      // ======================================================================
      case 'get-invoice': {
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

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              invoice: {
                id: invoiceId,
                number: 'INV-DEMO-001',
                status: 'paid',
                amount: 2900,
                currency: 'usd',
                created: new Date().toISOString(),
                pdfUrl: null,
                hostedUrl: null,
                lines: [
                  { description: 'Professional Plan (Monthly)', amount: 2900 },
                ],
              },
            },
          });
        }

        const invoice = await stripe.invoices.retrieve(invoiceId);

        return NextResponse.json({
          success: true,
          data: {
            invoice: {
              id: invoice.id,
              number: invoice.number,
              status: invoice.status,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              created: new Date(invoice.created * 1000).toISOString(),
              pdfUrl: invoice.invoice_pdf,
              hostedUrl: invoice.hosted_invoice_url,
              lines: invoice.lines.data.map(line => ({
                description: line.description,
                amount: line.amount,
              })),
            },
          },
        });
      }

      // ======================================================================
      // DOWNLOAD INVOICE PDF
      // ======================================================================
      case 'download-pdf': {
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

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Invoice PDF not available',
              url: null,
            },
          });
        }

        const invoice = await stripe.invoices.retrieve(invoiceId);

        if (!invoice.invoice_pdf) {
          return NextResponse.json({
            success: false,
            error: 'Invoice PDF not available',
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: {
            url: invoice.invoice_pdf,
          },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: ['retry-payment', 'get-invoice', 'download-pdf'],
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Invoices API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}
