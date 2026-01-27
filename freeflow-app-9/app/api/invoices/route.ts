import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-Invoices')

// Helper function to get invoice stats for a user
async function getInvoiceStats(supabase: any, userId?: string) {
  let query = supabase.from('invoices').select('status, total_amount')
  if (userId) {
    query = query.eq('user_id', userId)
  }
  const { data: allInvoices } = await query

  return {
    totalInvoiced: allInvoices?.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0,
    totalPaid: allInvoices?.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0,
    totalPending: allInvoices?.filter((inv: any) => inv.status === 'pending' || inv.status === 'sent').reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0,
    totalOverdue: allInvoices?.filter((inv: any) => inv.status === 'overdue').reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) || 0,
    totalInvoices: allInvoices?.length || 0
  }
}

// GET: Fetch invoices with optional filters from Supabase
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          invoices: [],
          stats: { totalInvoiced: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0, totalInvoices: 0 }
        }
      })
    }

    // Use authId for database queries (auth.users FK constraints)
    const userId = (session.user as any).authId || session.user.id

    // Build query
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (dateFrom) {
      query = query.gte('issue_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('issue_date', dateTo)
    }

    const { data: invoices, error } = await query

    if (error) {
      logger.error('Supabase query error', { error })
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    // Calculate stats for this user
    const stats = await getInvoiceStats(supabase, userId)

    return NextResponse.json({
      success: true,
      data: {
        invoices: invoices || [],
        stats
      }
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    logger.error('Invoice GET error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST: Handle various invoice actions with Supabase
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const body = await request.json().catch(() => ({}))
    const { action } = body

    // Require authentication
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Use authId for database queries (auth.users FK constraints)
    const userId = (session.user as any).authId || session.user.id

    switch (action) {
      case 'create': {
        const {
          number, project, clientName, clientEmail, description,
          issueDate, dueDate, notes, items, amount, client_id,
          title, currency, subtotal, tax_amount, tax_rate,
          discount_amount, discount_percentage, terms_and_conditions,
          is_recurring, recurring_schedule
        } = body

        // Generate invoice number if not provided
        const { count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })

        const invoiceNumber = number || `INV-${Date.now()}`
        const totalAmount = amount || items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0

        const { data: newInvoice, error } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            invoice_number: invoiceNumber,
            title: title || description || project || 'Invoice',
            description: description || '',
            client_id: client_id || null,
            client_name: clientName,
            client_email: clientEmail,
            status: 'draft',
            subtotal: subtotal || totalAmount,
            tax_rate: tax_rate || 0,
            tax_amount: tax_amount || 0,
            discount_amount: discount_amount || 0,
            discount_percentage: discount_percentage || 0,
            total_amount: totalAmount,
            amount_paid: 0,
            amount_due: totalAmount,
            currency: currency || 'USD',
            items: items || [],
            item_count: items?.length || 0,
            issue_date: issueDate || new Date().toISOString().split('T')[0],
            due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: notes || null,
            terms_and_conditions: terms_and_conditions || null,
            is_recurring: is_recurring || false,
            recurring_schedule: recurring_schedule || null
          })
          .select()
          .single()

        if (error) {
          logger.error('Create invoice error', { error })
          return NextResponse.json(
            { success: false, error: 'Failed to create invoice' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: newInvoice,
          message: `Invoice ${invoiceNumber} created successfully`
        })
      }

      case 'update-status': {
        const { invoiceId, status, paymentMethod, paymentReference, paidDate } = body

        const updateData: any = { status }
        if (paymentMethod) updateData.payment_method = paymentMethod
        if (paymentReference) updateData.payment_reference = paymentReference
        if (paidDate) updateData.paid_date = paidDate
        if (status === 'sent') updateData.sent_date = new Date().toISOString()
        if (status === 'paid') {
          updateData.paid_date = paidDate || new Date().toISOString()
        }

        const { data: updatedInvoice, error } = await supabase
          .from('invoices')
          .update(updateData)
          .eq('id', invoiceId)
          .select()
          .single()

        if (error) {
          logger.error('Update status error', { error })
          return NextResponse.json(
            { success: false, error: 'Invoice not found or update failed' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: updatedInvoice,
          message: `Invoice status updated to ${status}`
        })
      }

      case 'send': {
        const { invoiceId, email } = body

        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (fetchError || !invoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        // Update invoice status to sent
        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            status: 'sent',
            sent_date: new Date().toISOString()
          })
          .eq('id', invoiceId)

        if (updateError) {
          logger.error('Send invoice error', { error: updateError })
        }

        // In production, integrate with email service here
        logger.info('Sending invoice', { invoiceNumber: invoice.invoice_number, email: email || invoice.client_email })

        return NextResponse.json({
          success: true,
          data: { invoiceId, email: email || invoice.client_email, sentAt: new Date().toISOString() },
          message: `Invoice sent to ${email || invoice.client_email}`
        })
      }

      case 'mark-paid': {
        const { invoiceId, paymentMethod, paymentReference, amount } = body

        // Get current invoice to calculate amount_paid
        const { data: currentInvoice } = await supabase
          .from('invoices')
          .select('total_amount, amount_paid')
          .eq('id', invoiceId)
          .single()

        if (!currentInvoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        const paymentAmount = amount || currentInvoice.total_amount
        const newAmountPaid = (currentInvoice.amount_paid || 0) + paymentAmount
        const newAmountDue = Math.max(0, currentInvoice.total_amount - newAmountPaid)
        const newStatus = newAmountDue === 0 ? 'paid' : 'partial'

        const { data: updatedInvoice, error } = await supabase
          .from('invoices')
          .update({
            status: newStatus,
            payment_method: paymentMethod || 'Other',
            payment_reference: paymentReference || null,
            paid_date: new Date().toISOString(),
            amount_paid: newAmountPaid,
            amount_due: newAmountDue
          })
          .eq('id', invoiceId)
          .select()
          .single()

        if (error) {
          logger.error('Mark paid error', { error })
          return NextResponse.json(
            { success: false, error: 'Failed to mark invoice as paid' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: updatedInvoice,
          message: `Invoice ${updatedInvoice.invoice_number} marked as ${newStatus}`
        })
      }

      case 'add-payment': {
        const { invoiceId, amount, paymentMethod, paymentReference, paymentDate } = body

        // Get current invoice
        const { data: currentInvoice } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (!currentInvoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        const newAmountPaid = (currentInvoice.amount_paid || 0) + amount
        const newAmountDue = Math.max(0, currentInvoice.total_amount - newAmountPaid)
        const newStatus = newAmountDue === 0 ? 'paid' : 'partial'

        const { data: updatedInvoice, error } = await supabase
          .from('invoices')
          .update({
            status: newStatus,
            payment_method: paymentMethod || currentInvoice.payment_method || 'Other',
            payment_reference: paymentReference || currentInvoice.payment_reference,
            paid_date: paymentDate || new Date().toISOString(),
            amount_paid: newAmountPaid,
            amount_due: newAmountDue
          })
          .eq('id', invoiceId)
          .select()
          .single()

        if (error) {
          logger.error('Add payment error', { error })
          return NextResponse.json(
            { success: false, error: 'Failed to add payment' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: updatedInvoice,
          message: `Payment of ${amount} added to invoice`
        })
      }

      case 'duplicate': {
        const { invoiceId } = body

        const { data: originalInvoice, error: fetchError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (fetchError || !originalInvoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        // Create a copy without id and with new dates
        const { id, created_at, updated_at, ...invoiceData } = originalInvoice

        const { data: newInvoice, error: createError } = await supabase
          .from('invoices')
          .insert({
            ...invoiceData,
            invoice_number: `INV-${Date.now()}`,
            status: 'draft',
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            sent_date: null,
            paid_date: null,
            viewed_date: null,
            amount_paid: 0,
            amount_due: originalInvoice.total_amount,
            reminder_sent_count: 0,
            last_reminder_sent_at: null
          })
          .select()
          .single()

        if (createError) {
          logger.error('Duplicate invoice error', { error: createError })
          return NextResponse.json(
            { success: false, error: 'Failed to duplicate invoice' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: newInvoice,
          message: `Invoice duplicated as ${newInvoice.invoice_number}`
        })
      }

      case 'send-reminder': {
        const { invoiceId } = body

        const { data: invoice, error: fetchError } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (fetchError || !invoice) {
          return NextResponse.json(
            { success: false, error: 'Invoice not found' },
            { status: 404 }
          )
        }

        const { error: updateError } = await supabase
          .from('invoices')
          .update({
            reminder_sent_count: (invoice.reminder_sent_count || 0) + 1,
            last_reminder_sent_at: new Date().toISOString()
          })
          .eq('id', invoiceId)

        if (updateError) {
          logger.error('Send reminder error', { error: updateError })
          return NextResponse.json(
            { success: false, error: 'Failed to update reminder count' },
            { status: 500 }
          )
        }

        // In production, integrate with email service here
        logger.info('Sending reminder', { invoiceNumber: invoice.invoice_number, email: invoice.client_email })

        return NextResponse.json({
          success: true,
          data: { invoiceId, reminderCount: (invoice.reminder_sent_count || 0) + 1 },
          message: `Reminder sent for invoice ${invoice.invoice_number}`
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Invoice POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process invoice action' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing invoice in Supabase
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json().catch(() => ({}))
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Map frontend field names to database column names
    const dbUpdateData: Record<string, any> = {}

    if (updateData.title !== undefined) dbUpdateData.title = updateData.title
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description
    if (updateData.clientName !== undefined) dbUpdateData.client_name = updateData.clientName
    if (updateData.client_name !== undefined) dbUpdateData.client_name = updateData.client_name
    if (updateData.clientEmail !== undefined) dbUpdateData.client_email = updateData.clientEmail
    if (updateData.client_email !== undefined) dbUpdateData.client_email = updateData.client_email
    if (updateData.status !== undefined) dbUpdateData.status = updateData.status
    if (updateData.dueDate !== undefined) dbUpdateData.due_date = updateData.dueDate
    if (updateData.due_date !== undefined) dbUpdateData.due_date = updateData.due_date
    if (updateData.issueDate !== undefined) dbUpdateData.issue_date = updateData.issueDate
    if (updateData.issue_date !== undefined) dbUpdateData.issue_date = updateData.issue_date
    if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes
    if (updateData.terms !== undefined) dbUpdateData.terms_and_conditions = updateData.terms
    if (updateData.terms_and_conditions !== undefined) dbUpdateData.terms_and_conditions = updateData.terms_and_conditions
    if (updateData.currency !== undefined) dbUpdateData.currency = updateData.currency

    // Handle items and recalculate amounts
    if (updateData.items !== undefined) {
      dbUpdateData.items = updateData.items
      dbUpdateData.item_count = updateData.items.length
      const calculatedAmount = updateData.items.reduce((sum: number, item: any) =>
        sum + (item.total || item.amount || (item.quantity * item.unitPrice) || 0), 0)
      dbUpdateData.subtotal = updateData.subtotal || calculatedAmount
      dbUpdateData.total_amount = updateData.amount || updateData.total_amount || calculatedAmount
      dbUpdateData.amount_due = dbUpdateData.total_amount - (updateData.amount_paid || 0)
    }

    if (updateData.subtotal !== undefined) dbUpdateData.subtotal = updateData.subtotal
    if (updateData.tax_amount !== undefined) dbUpdateData.tax_amount = updateData.tax_amount
    if (updateData.tax_rate !== undefined) dbUpdateData.tax_rate = updateData.tax_rate
    if (updateData.discount_amount !== undefined) dbUpdateData.discount_amount = updateData.discount_amount
    if (updateData.total_amount !== undefined) dbUpdateData.total_amount = updateData.total_amount
    if (updateData.amount !== undefined) dbUpdateData.total_amount = updateData.amount
    if (updateData.amount_paid !== undefined) dbUpdateData.amount_paid = updateData.amount_paid
    if (updateData.amount_due !== undefined) dbUpdateData.amount_due = updateData.amount_due

    dbUpdateData.updated_at = new Date().toISOString()

    const { data: updatedInvoice, error } = await supabase
      .from('invoices')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Invoice PUT error', { error })
      return NextResponse.json(
        { success: false, error: 'Invoice not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: `Invoice ${updatedInvoice.invoice_number} updated successfully`
    })
  } catch (error) {
    logger.error('Invoice PUT error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE: Delete an invoice from Supabase
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // First get the invoice to return info about it
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, invoice_number')
      .eq('id', id)
      .single()

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Invoice DELETE error', { error })
      return NextResponse.json(
        { success: false, error: 'Failed to delete invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: invoice.id, number: invoice.invoice_number },
      message: `Invoice ${invoice.invoice_number} deleted successfully`
    })
  } catch (error) {
    logger.error('Invoice DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
