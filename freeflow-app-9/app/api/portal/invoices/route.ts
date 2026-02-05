/**
 * KAZI Client Portal API - Invoices Management
 *
 * Comprehensive API for managing portal invoices with payment tracking,
 * line items, and reporting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('portal-invoices')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const invoiceId = searchParams.get('invoiceId')
    const clientId = searchParams.get('clientId')

    switch (action) {
      case 'list': {
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
          .from('portal_invoices')
          .select(`
            *,
            portal_clients!inner(id, name, company, user_id),
            portal_invoice_items(*)
          `, { count: 'exact' })
          .eq('portal_clients.user_id', user.id)

        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        if (status) {
          query = query.eq('status', status)
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
          invoices: data,
          total: count,
          limit,
          offset
        })
      }

      case 'get': {
        if (!invoiceId) {
          return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
        }

        const { data, error } = await supabase
          .from('portal_invoices')
          .select(`
            *,
            portal_clients!inner(id, name, email, company, address, user_id),
            portal_invoice_items(*),
            portal_projects(id, name)
          `)
          .eq('id', invoiceId)
          .eq('portal_clients.user_id', user.id)
          .single()

        if (error) throw error

        return NextResponse.json({ invoice: data })
      }

      case 'statistics': {
        let query = supabase
          .from('portal_invoices')
          .select('status, total, paid_amount, due_date')
          .eq('portal_clients.user_id', user.id)

        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        const { data: invoices, error } = await query

        if (error) throw error

        const now = new Date()

        const stats = {
          total_invoices: invoices.length,
          total_amount: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
          paid_amount: invoices.reduce((sum, i) => sum + (i.paid_amount || 0), 0),
          outstanding_amount: invoices
            .filter(i => i.status !== 'paid')
            .reduce((sum, i) => sum + ((i.total || 0) - (i.paid_amount || 0)), 0),
          overdue_amount: invoices
            .filter(i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < now)
            .reduce((sum, i) => sum + ((i.total || 0) - (i.paid_amount || 0)), 0),
          by_status: {
            draft: invoices.filter(i => i.status === 'draft').length,
            sent: invoices.filter(i => i.status === 'sent').length,
            viewed: invoices.filter(i => i.status === 'viewed').length,
            partial: invoices.filter(i => i.status === 'partial').length,
            paid: invoices.filter(i => i.status === 'paid').length,
            overdue: invoices.filter(i => i.status === 'overdue').length,
            cancelled: invoices.filter(i => i.status === 'cancelled').length
          }
        }

        return NextResponse.json({ statistics: stats })
      }

      case 'aging': {
        const { data: invoices, error } = await supabase
          .from('portal_invoices')
          .select('total, paid_amount, due_date, status')
          .eq('portal_clients.user_id', user.id)
          .neq('status', 'paid')
          .neq('status', 'cancelled')

        if (error) throw error

        const now = new Date()

        const aging = {
          current: 0,
          days_1_30: 0,
          days_31_60: 0,
          days_61_90: 0,
          over_90: 0
        }

        invoices.forEach(invoice => {
          const outstanding = (invoice.total || 0) - (invoice.paid_amount || 0)
          if (!invoice.due_date) {
            aging.current += outstanding
            return
          }

          const dueDate = new Date(invoice.due_date)
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysOverdue <= 0) {
            aging.current += outstanding
          } else if (daysOverdue <= 30) {
            aging.days_1_30 += outstanding
          } else if (daysOverdue <= 60) {
            aging.days_31_60 += outstanding
          } else if (daysOverdue <= 90) {
            aging.days_61_90 += outstanding
          } else {
            aging.over_90 += outstanding
          }
        })

        return NextResponse.json({ aging })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal invoices GET error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'create': {
        // Verify client belongs to user
        const { data: client, error: clientError } = await supabase
          .from('portal_clients')
          .select('id, name')
          .eq('id', data.clientId)
          .eq('user_id', user.id)
          .single()

        if (clientError || !client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Generate invoice number
        const { count } = await supabase
          .from('portal_invoices')
          .select('*', { count: 'exact', head: true })
          .eq('portal_clients.user_id', user.id)

        const invoiceNumber = `INV-${String((count || 0) + 1).padStart(6, '0')}`

        // Calculate totals
        const items = data.items || []
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
        const taxRate = data.taxRate || 0
        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount - (data.discount || 0)

        const { data: invoice, error } = await supabase
          .from('portal_invoices')
          .insert({
            client_id: data.clientId,
            project_id: data.projectId,
            invoice_number: invoiceNumber,
            status: 'draft',
            issue_date: data.issueDate || new Date().toISOString(),
            due_date: data.dueDate,
            subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            discount: data.discount || 0,
            total,
            paid_amount: 0,
            currency: data.currency || 'USD',
            notes: data.notes,
            terms: data.terms
          })
          .select()
          .single()

        if (error) throw error

        // Create invoice items
        if (items.length > 0) {
          const invoiceItems = items.map((item: any, index: number) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
            sort_order: index
          }))

          await supabase
            .from('portal_invoice_items')
            .insert(invoiceItems)
        }

        // Log activity
        await supabase
          .from('portal_client_activities')
          .insert({
            client_id: data.clientId,
            user_id: user.id,
            action: 'invoice_created',
            description: `Invoice ${invoiceNumber} created for ${data.currency || 'USD'} ${total.toFixed(2)}`,
            metadata: { invoice_id: invoice.id }
          })

        return NextResponse.json({ invoice }, { status: 201 })
      }

      case 'send': {
        const { invoiceId } = data

        const { data: invoice, error } = await supabase
          .from('portal_invoices')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
          .select(`
            *,
            portal_clients(id, name, email)
          `)
          .single()

        if (error) throw error

        // Log activity
        await supabase
          .from('portal_client_activities')
          .insert({
            client_id: invoice.client_id,
            user_id: user.id,
            action: 'invoice_sent',
            description: `Invoice ${invoice.invoice_number} sent to client`,
            metadata: { invoice_id: invoice.id }
          })

        // Send email notification to client
        let emailSent = false
        const clientEmail = invoice.portal_clients?.email
        if (process.env.RESEND_API_KEY && clientEmail) {
          try {
            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            await resend.emails.send({
              from: 'KAZI Portal <portal@kazi.app>',
              to: clientEmail,
              subject: `Invoice ${invoice.invoice_number} - Action Required`,
              html: `
                <h1>Invoice ${invoice.invoice_number}</h1>
                <p>Dear ${invoice.portal_clients?.name || 'Valued Client'},</p>
                <p>A new invoice has been issued. Amount due: ${invoice.currency || 'USD'} ${invoice.total?.toFixed(2)}</p>
                <p>Due Date: ${invoice.due_date}</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices/${invoice.id}">View & Pay Invoice</a></p>
              `
            })
            emailSent = true
          } catch {
            // Email optional
          }
        }

        return NextResponse.json({ invoice, sent: true, emailSent })
      }

      case 'record_payment': {
        const { invoiceId, amount, method, reference, date } = data

        // Get current invoice
        const { data: invoice, error: getError } = await supabase
          .from('portal_invoices')
          .select('*')
          .eq('id', invoiceId)
          .single()

        if (getError || !invoice) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        const newPaidAmount = (invoice.paid_amount || 0) + amount
        const newStatus = newPaidAmount >= invoice.total ? 'paid' : 'partial'

        const { data: updatedInvoice, error } = await supabase
          .from('portal_invoices')
          .update({
            paid_amount: newPaidAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
          .select()
          .single()

        if (error) throw error

        // Log activity
        await supabase
          .from('portal_client_activities')
          .insert({
            client_id: invoice.client_id,
            user_id: user.id,
            action: 'payment_received',
            description: `Payment of ${invoice.currency} ${amount.toFixed(2)} received for invoice ${invoice.invoice_number}`,
            metadata: {
              invoice_id: invoiceId,
              amount,
              method,
              reference,
              date
            }
          })

        return NextResponse.json({ invoice: updatedInvoice, payment_recorded: true })
      }

      case 'add_item': {
        const { invoiceId, item } = data

        const { data: invoiceItem, error } = await supabase
          .from('portal_invoice_items')
          .insert({
            invoice_id: invoiceId,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          })
          .select()
          .single()

        if (error) throw error

        // Recalculate invoice totals
        await recalculateInvoiceTotals(supabase, invoiceId)

        return NextResponse.json({ item: invoiceItem }, { status: 201 })
      }

      case 'duplicate': {
        const { invoiceId } = data

        // Get original invoice with items
        const { data: original, error: getError } = await supabase
          .from('portal_invoices')
          .select(`
            *,
            portal_invoice_items(*)
          `)
          .eq('id', invoiceId)
          .single()

        if (getError || !original) {
          return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // Generate new invoice number
        const { count } = await supabase
          .from('portal_invoices')
          .select('*', { count: 'exact', head: true })
          .eq('portal_clients.user_id', user.id)

        const newInvoiceNumber = `INV-${String((count || 0) + 1).padStart(6, '0')}`

        // Create new invoice
        const { data: newInvoice, error } = await supabase
          .from('portal_invoices')
          .insert({
            client_id: original.client_id,
            project_id: original.project_id,
            invoice_number: newInvoiceNumber,
            status: 'draft',
            issue_date: new Date().toISOString(),
            due_date: null,
            subtotal: original.subtotal,
            tax_rate: original.tax_rate,
            tax_amount: original.tax_amount,
            discount: original.discount,
            total: original.total,
            paid_amount: 0,
            currency: original.currency,
            notes: original.notes,
            terms: original.terms
          })
          .select()
          .single()

        if (error) throw error

        // Duplicate items
        if (original.portal_invoice_items?.length > 0) {
          const newItems = original.portal_invoice_items.map((item: any) => ({
            invoice_id: newInvoice.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            sort_order: item.sort_order
          }))

          await supabase.from('portal_invoice_items').insert(newItems)
        }

        return NextResponse.json({ invoice: newInvoice }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Portal invoices POST error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId, items, ...updateData } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    // Remove fields that shouldn't be updated
    delete updateData.client_id
    delete updateData.invoice_number
    delete updateData.created_at

    // If items are provided, update them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase
        .from('portal_invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)

      // Insert new items
      const newItems = items.map((item: any, index: number) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        sort_order: index
      }))

      await supabase.from('portal_invoice_items').insert(newItems)

      // Recalculate totals
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)
      const taxRate = updateData.tax_rate || 0
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount - (updateData.discount || 0)

      updateData.subtotal = subtotal
      updateData.tax_amount = taxAmount
      updateData.total = total
    }

    const { data: invoice, error } = await supabase
      .from('portal_invoices')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ invoice })
  } catch (error) {
    logger.error('Portal invoices PUT error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')
    const itemId = searchParams.get('itemId')

    if (itemId) {
      // Delete invoice item
      const { error } = await supabase
        .from('portal_invoice_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Recalculate totals
      const { data: item } = await supabase
        .from('portal_invoice_items')
        .select('invoice_id')
        .eq('id', itemId)
        .single()

      if (item) {
        await recalculateInvoiceTotals(supabase, item.invoice_id)
      }

      return NextResponse.json({ deleted: true })
    }

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 })
    }

    // Delete invoice (items will cascade)
    const { error } = await supabase
      .from('portal_invoices')
      .delete()
      .eq('id', invoiceId)

    if (error) throw error

    return NextResponse.json({ deleted: true })
  } catch (error) {
    logger.error('Portal invoices DELETE error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to recalculate invoice totals
async function recalculateInvoiceTotals(supabase: any, invoiceId: string) {
  const { data: items } = await supabase
    .from('portal_invoice_items')
    .select('amount')
    .eq('invoice_id', invoiceId)

  const { data: invoice } = await supabase
    .from('portal_invoices')
    .select('tax_rate, discount')
    .eq('id', invoiceId)
    .single()

  if (items && invoice) {
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
    const taxAmount = subtotal * ((invoice.tax_rate || 0) / 100)
    const total = subtotal + taxAmount - (invoice.discount || 0)

    await supabase
      .from('portal_invoices')
      .update({
        subtotal,
        tax_amount: taxAmount,
        total,
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
  }
}
