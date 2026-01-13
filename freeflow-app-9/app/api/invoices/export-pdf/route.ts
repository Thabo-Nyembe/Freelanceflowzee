import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// ============================================================================
// INVOICE EXPORT PDF API
// ============================================================================
// Export multiple invoices as PDF
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
    const { invoiceIds } = body;

    const user = await getUserFromAuth(request);
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
    console.error('Invoice Export PDF Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export invoices',
    }, { status: 500 });
  }
}
