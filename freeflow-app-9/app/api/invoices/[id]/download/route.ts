import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// INVOICE DOWNLOAD API - Dynamic Route
// ============================================================================
// Download individual invoice as PDF or text format
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ============================================================================
// GET HANDLER - Download invoice by ID
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID required',
      }, { status: 400 })
    }

    // Fetch invoice from Supabase
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found',
      }, { status: 404 })
    }

    // Generate invoice content as formatted text (can be extended to PDF with libraries like PDFKit)
    const getCurrencySymbol = (currency: string) => {
      const symbols: Record<string, string> = {
        'USD': '$', 'EUR': '\\u20AC', 'GBP': '\\u00A3', 'JPY': '\\u00A5',
        'CAD': 'C$', 'AUD': 'A$', 'CHF': 'Fr', 'CNY': '\\u00A5',
        'INR': '\\u20B9', 'ZAR': 'R'
      }
      return symbols[currency] || '$'
    }

    const currencySymbol = getCurrencySymbol(invoice.currency || 'USD')
    const formatAmount = (amount: number | null) =>
      `${currencySymbol}${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    // Parse line items if available
    let lineItemsText = ''
    if (invoice.items && Array.isArray(invoice.items)) {
      lineItemsText = '\nLINE ITEMS:\n' + '-'.repeat(60) + '\n'
      invoice.items.forEach((item: any, index: number) => {
        const qty = item.quantity || 1
        const rate = item.rate || item.unitPrice || 0
        const total = item.amount || item.total || (qty * rate)
        lineItemsText += `${index + 1}. ${item.description || 'Item'}\n`
        lineItemsText += `   Quantity: ${qty} x ${formatAmount(rate)} = ${formatAmount(total)}\n`
      })
      lineItemsText += '-'.repeat(60) + '\n'
    }

    const invoiceContent = `
===============================================================================
                                    INVOICE
===============================================================================

Invoice Number: ${invoice.invoice_number}
Issue Date:     ${invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : 'N/A'}
Due Date:       ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
Status:         ${(invoice.status || 'draft').toUpperCase()}

-------------------------------------------------------------------------------
CLIENT INFORMATION
-------------------------------------------------------------------------------
Name:           ${invoice.client_name || 'N/A'}
Email:          ${invoice.client_email || 'N/A'}
Phone:          ${invoice.client_phone || 'N/A'}
Address:        ${invoice.client_address || 'N/A'}

-------------------------------------------------------------------------------
INVOICE DETAILS
-------------------------------------------------------------------------------
Title:          ${invoice.title || 'Invoice'}
Description:    ${invoice.description || 'N/A'}
${lineItemsText}
-------------------------------------------------------------------------------
FINANCIAL SUMMARY
-------------------------------------------------------------------------------
Subtotal:       ${formatAmount(invoice.subtotal)}
Tax (${invoice.tax_rate || 0}%):    ${formatAmount(invoice.tax_amount)}
Discount:       ${formatAmount(invoice.discount_amount)}
-------------------------------------------------------------------------------
TOTAL:          ${formatAmount(invoice.total_amount)}
Amount Paid:    ${formatAmount(invoice.amount_paid)}
AMOUNT DUE:     ${formatAmount(invoice.amount_due)}

-------------------------------------------------------------------------------
PAYMENT INFORMATION
-------------------------------------------------------------------------------
Payment Terms:  ${invoice.payment_terms || 'Net 30'}
Payment Method: ${invoice.payment_method || 'N/A'}
${invoice.paid_date ? `Paid Date:      ${new Date(invoice.paid_date).toLocaleDateString()}` : ''}

-------------------------------------------------------------------------------
NOTES
-------------------------------------------------------------------------------
${invoice.notes || 'No additional notes.'}

-------------------------------------------------------------------------------
TERMS & CONDITIONS
-------------------------------------------------------------------------------
${invoice.terms_and_conditions || 'Payment is due within 30 days of invoice date.'}

===============================================================================
                          Thank you for your business!
===============================================================================
`.trim()

    // Return as downloadable text file
    const blob = new Blob([invoiceContent], { type: 'text/plain' })

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.txt"`,
      },
    })
  } catch (error) {
    console.error('Invoice Download Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download invoice',
    }, { status: 500 })
  }
}
