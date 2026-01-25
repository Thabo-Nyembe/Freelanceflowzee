import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('invoices-api')

// ============================================================================
// INVOICE API - Dynamic Route by ID
// ============================================================================
// Get, Update, Delete individual invoices
// ============================================================================

// ============================================================================
// GET - Fetch single invoice by ID
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID required',
      }, { status: 400 })
    }

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

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    logger.error('Invoice GET Error', { error })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch invoice',
    }, { status: 500 })
  }
}

// ============================================================================
// PUT - Update invoice by ID
// ============================================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID required',
      }, { status: 400 })
    }

    // Build update object mapping frontend to database fields
    const dbUpdates: Record<string, any> = {}

    if (body.title !== undefined) dbUpdates.title = body.title
    if (body.description !== undefined) dbUpdates.description = body.description
    if (body.status !== undefined) dbUpdates.status = body.status
    if (body.client_name !== undefined) dbUpdates.client_name = body.client_name
    if (body.clientName !== undefined) dbUpdates.client_name = body.clientName
    if (body.client_email !== undefined) dbUpdates.client_email = body.client_email
    if (body.clientEmail !== undefined) dbUpdates.client_email = body.clientEmail
    if (body.due_date !== undefined) dbUpdates.due_date = body.due_date
    if (body.dueDate !== undefined) dbUpdates.due_date = body.dueDate
    if (body.issue_date !== undefined) dbUpdates.issue_date = body.issue_date
    if (body.issueDate !== undefined) dbUpdates.issue_date = body.issueDate
    if (body.notes !== undefined) dbUpdates.notes = body.notes
    if (body.terms !== undefined) dbUpdates.terms_and_conditions = body.terms
    if (body.terms_and_conditions !== undefined) dbUpdates.terms_and_conditions = body.terms_and_conditions
    if (body.currency !== undefined) dbUpdates.currency = body.currency

    // Handle items and amounts
    if (body.items !== undefined) {
      dbUpdates.items = body.items
      dbUpdates.item_count = body.items.length
    }
    if (body.subtotal !== undefined) dbUpdates.subtotal = body.subtotal
    if (body.tax_rate !== undefined) dbUpdates.tax_rate = body.tax_rate
    if (body.tax_amount !== undefined) dbUpdates.tax_amount = body.tax_amount
    if (body.discount_amount !== undefined) dbUpdates.discount_amount = body.discount_amount
    if (body.discount_percentage !== undefined) dbUpdates.discount_percentage = body.discount_percentage
    if (body.total_amount !== undefined) dbUpdates.total_amount = body.total_amount
    if (body.amount !== undefined) dbUpdates.total_amount = body.amount
    if (body.amount_paid !== undefined) dbUpdates.amount_paid = body.amount_paid
    if (body.amount_due !== undefined) dbUpdates.amount_due = body.amount_due

    // Handle status-related updates
    if (body.status === 'sent' && !dbUpdates.sent_date) {
      dbUpdates.sent_date = new Date().toISOString()
    }
    if (body.status === 'paid' && !dbUpdates.paid_date) {
      dbUpdates.paid_date = new Date().toISOString()
    }

    dbUpdates.updated_at = new Date().toISOString()

    const { data: updatedInvoice, error } = await supabase
      .from('invoices')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Invoice PUT Error', { error })
      return NextResponse.json({
        success: false,
        error: 'Failed to update invoice',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: `Invoice ${updatedInvoice.invoice_number} updated successfully`,
    })
  } catch (error) {
    logger.error('Invoice PUT Error', { error })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invoice',
    }, { status: 500 })
  }
}

// ============================================================================
// DELETE - Delete invoice by ID
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Invoice ID required',
      }, { status: 400 })
    }

    // First get invoice info for response
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('id', id)
      .single()

    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found',
      }, { status: 404 })
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Invoice DELETE Error', { error })
      return NextResponse.json({
        success: false,
        error: 'Failed to delete invoice',
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { id: invoice.id, number: invoice.invoice_number },
      message: `Invoice ${invoice.invoice_number} deleted successfully`,
    })
  } catch (error) {
    logger.error('Invoice DELETE Error', { error })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete invoice',
    }, { status: 500 })
  }
}
