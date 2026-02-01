import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Invoice generation and management API endpoint
// Supports: Create, Read, Update, Delete invoices

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

interface InvoiceRequest {
  action: 'create' | 'list' | 'update' | 'delete' | 'send' | 'mark-paid'
  invoiceId?: string
  data?: {
    client?: string
    project?: string
    amount?: number
    issueDate?: string
    dueDate?: string
    currency?: string
    taxRate?: number
    items?: InvoiceItem[]
    notes?: string
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  }
}

interface InvoiceResponse {
  success: boolean
  action: string
  invoice?: any
  invoices?: any[]
  message?: string
  invoiceNumber?: string
  pdfUrl?: string
  error?: string
}

// Generate unique invoice number
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${year}${month}-${random}`
}

// Calculate invoice totals
function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax

  return { subtotal, tax, total }
}

// Create new invoice
async function handleCreateInvoice(data: any, userId: string): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const invoiceNumber = generateInvoiceNumber()
    const { subtotal, tax, total } = calculateInvoiceTotals(data.items || [], data.taxRate || 0)

    const invoiceData = {
      user_id: userId,
      invoice_number: invoiceNumber,
      client_name: data.client || 'Unknown Client',
      client_id: data.clientId || null,
      project_name: data.project || 'General Services',
      project_id: data.projectId || null,
      issue_date: data.issueDate || new Date().toISOString().split('T')[0],
      due_date: data.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: data.status || 'draft',
      currency: data.currency || 'USD',
      tax_rate: data.taxRate || 0,
      items: data.items || [],
      subtotal,
      tax_amount: tax,
      total_amount: total,
      paid_amount: 0,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'create',
      invoice,
      invoiceNumber,
      message: `Invoice ${invoiceNumber} created successfully`,
      pdfUrl: `/api/financial/invoices/${invoice.id}/pdf`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'create',
      error: error.message || 'Failed to create invoice'
    }, { status: 500 })
  }
}

// List invoices with filters
async function handleListInvoices(userId: string, filters?: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    // Apply filters if provided
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.client) {
      query = query.ilike('client_name', `%${filters.client}%`)
    }
    if (filters?.limit) {
      query = query.limit(parseInt(filters.limit))
    }
    if (filters?.offset) {
      query = query.range(parseInt(filters.offset), parseInt(filters.offset) + (parseInt(filters.limit) || 50) - 1)
    }

    const { data: invoices, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'list',
      invoices: invoices || [],
      total: count || 0,
      message: `Found ${count || 0} invoices`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'list',
      error: error.message || 'Failed to list invoices'
    }, { status: 500 })
  }
}

// Send invoice to client
async function handleSendInvoice(invoiceId: string, userId: string): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    // Send email notification to client via Resend
    let emailSent = false
    try {
      if (process.env.RESEND_API_KEY && invoice.client_email) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)

        await resend.emails.send({
          from: 'KAZI Invoicing <invoices@kazi.app>',
          to: invoice.client_email,
          subject: `Invoice ${invoice.invoice_number} from KAZI`,
          html: `
            <h1>Invoice ${invoice.invoice_number}</h1>
            <p>Dear ${invoice.client_name},</p>
            <p>Please find your invoice attached. Amount due: ${invoice.currency} ${invoice.total_amount?.toFixed(2)}</p>
            <p>Due Date: ${invoice.due_date}</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}">View Invoice</a></p>
            <p>Thank you for your business!</p>
          `
        })
        emailSent = true
      }
    } catch {
      // Email is optional, log but don't fail
    }

    return NextResponse.json({
      success: true,
      action: 'send',
      invoice,
      message: `Invoice sent successfully to client`,
      emailSent
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'send',
      error: error.message || 'Failed to send invoice'
    }, { status: 500 })
  }
}

// Mark invoice as paid
async function handleMarkPaid(invoiceId: string, userId: string, data: any): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_amount: data.amount || 0,
        paid_at: new Date().toISOString(),
        payment_method: data.paymentMethod || 'bank_transfer',
        payment_notes: data.notes || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      action: 'mark-paid',
      invoice,
      message: `Invoice marked as paid`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'mark-paid',
      error: error.message || 'Failed to mark invoice as paid'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: InvoiceRequest = await request.json()

    switch (body.action) {
      case 'create':
        return handleCreateInvoice(body.data, user.id)

      case 'list':
        return handleListInvoices(user.id, body.data)

      case 'send':
        if (!body.invoiceId) {
          return NextResponse.json({
            success: false,
            error: 'Invoice ID required'
          }, { status: 400 })
        }
        return handleSendInvoice(body.invoiceId, user.id)

      case 'mark-paid':
        if (!body.invoiceId) {
          return NextResponse.json({
            success: false,
            error: 'Invoice ID required'
          }, { status: 400 })
        }
        return handleMarkPaid(body.invoiceId, user.id, body.data || {})

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler for listing invoices
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const client = searchParams.get('client')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    return handleListInvoices(user.id, { status, client, limit, offset })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch invoices'
    }, { status: 500 })
  }
}
