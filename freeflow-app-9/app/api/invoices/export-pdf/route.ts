import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('invoices-api');

// ============================================================================
// INVOICE EXPORT PDF API
// ============================================================================
// Export multiple invoices as PDF
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
    const { invoiceIds } = body;

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invoice IDs required',
      }, { status: 400 });
    }

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder');

    if (isDemo) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          message: 'Demo mode: Bulk PDF export not available. Individual invoice PDFs can be downloaded from the invoice list.',
          invoices: invoiceIds.map(id => ({
            id,
            pdfUrl: null,
          })),
        },
      });
    }

    // Get PDFs for all invoices
    const pdfUrls: Array<{ id: string; pdfUrl: string | null; number: string | null }> = [];

    for (const invoiceId of invoiceIds) {
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);
        pdfUrls.push({
          id: invoiceId,
          pdfUrl: invoice.invoice_pdf,
          number: invoice.number,
        });
      } catch (err) {
        pdfUrls.push({
          id: invoiceId,
          pdfUrl: null,
          number: null,
        });
      }
    }

    // Filter to only invoices with PDFs
    const availablePdfs = pdfUrls.filter(p => p.pdfUrl);

    if (availablePdfs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No invoice PDFs available for the selected invoices',
      }, { status: 404 });
    }

    // If only one PDF, return direct URL
    if (availablePdfs.length === 1) {
      return NextResponse.json({
        success: true,
        data: {
          url: availablePdfs[0].pdfUrl,
          invoices: availablePdfs,
        },
      });
    }

    // For multiple PDFs, return list of URLs
    // In a production environment, you might want to:
    // 1. Generate a combined PDF
    // 2. Create a ZIP file with all PDFs
    // 3. Return a temporary download page

    return NextResponse.json({
      success: true,
      data: {
        message: `${availablePdfs.length} invoice PDFs available`,
        invoices: availablePdfs,
        // Client should open each PDF URL
      },
    });
  } catch (error) {
    logger.error('Invoice Export PDF Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export invoices',
    }, { status: 500 });
  }
}
