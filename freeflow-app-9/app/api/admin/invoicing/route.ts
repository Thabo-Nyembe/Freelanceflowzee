/**
 * Admin Invoicing API Route
 * Invoice management - invoices, payments, templates, billing stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('admin-invoicing-api')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true' ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true'
  )
}

// Demo data for fallback
const DEMO_INVOICES = [
  { id: 'inv-1', invoice_number: 'INV-001', client_name: 'Acme Corp', total: 5000, status: 'paid', due_date: '2024-01-15' },
  { id: 'inv-2', invoice_number: 'INV-002', client_name: 'TechStart', total: 3500, status: 'sent', due_date: '2024-01-25' },
  { id: 'inv-3', invoice_number: 'INV-003', client_name: 'GreenCo', total: 7500, status: 'overdue', due_date: '2024-01-10' },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'overview'

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Invoicing API request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'invoices':
          return await getInvoices(supabase, effectiveUserId, url, demoMode)
        case 'invoice':
          return await getInvoice(supabase, effectiveUserId, url, demoMode)
        case 'payments':
          return await getPayments(supabase, effectiveUserId, url, demoMode)
        case 'templates':
          return await getTemplates(supabase, effectiveUserId, url, demoMode)
        case 'recurring':
          return await getRecurringInvoices(supabase, effectiveUserId, url, demoMode)
        case 'stats':
          return await getBillingStats(supabase, effectiveUserId, demoMode)
        case 'overview':
        default:
          return await getInvoicingOverview(supabase, effectiveUserId, demoMode)
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          invoices: DEMO_INVOICES,
          stats: {
            totalOutstanding: 11000,
            paidThisMonth: 45000,
            overdueAmount: 7500,
            averagePaymentTime: 14
          }
        }
      })
    }
  } catch (error) {
    logger.error('Invoicing API error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoicing data' },
      { status: 500 }
    )
  }
}

async function getInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const status = url.searchParams.get('status')
  const clientId = url.searchParams.get('clientId')
  const search = url.searchParams.get('search')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(id, description, quantity, unit_price, total)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }
  if (clientId) {
    query = query.eq('client_id', clientId)
  }
  if (search) {
    query = query.or(`invoice_number.ilike.%${search}%,client_name.ilike.%${search}%,client_email.ilike.%${search}%`)
  }

  const { data: invoices, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          invoices: DEMO_INVOICES,
          total: DEMO_INVOICES.length,
          hasMore: false
        }
      })
    }
    throw error
  }

  // Calculate summary stats
  const totalValue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const paidValue = invoices?.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const pendingValue = invoices?.filter(inv => ['sent', 'viewed'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const overdueValue = invoices?.filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      invoices: invoices || [],
      total: count || 0,
      summary: {
        totalValue,
        paidValue,
        pendingValue,
        overdueValue
      },
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const invoiceId = url.searchParams.get('id')

  if (!invoiceId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(*),
      payments:payments(*),
      recurring:recurring_invoices(*)
    `)
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { invoice: DEMO_INVOICES[0] }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { invoice }
  })
}

async function getPayments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const invoiceId = url.searchParams.get('invoiceId')
  const status = url.searchParams.get('status')
  const method = url.searchParams.get('method')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('payments')
    .select(`
      *,
      invoice:invoices(id, invoice_number, client_name, total)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (invoiceId) {
    query = query.eq('invoice_id', invoiceId)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (method) {
    query = query.eq('method', method)
  }

  const { data: payments, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          payments: [
            { id: 'pay-1', amount: 5000, method: 'credit_card', status: 'completed', paid_at: new Date().toISOString() },
          ],
          total: 1,
          hasMore: false
        }
      })
    }
    throw error
  }

  const totalReceived = payments?.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      payments: payments || [],
      total: count || 0,
      totalReceived,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getTemplates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  const { data: templates, count, error } = await supabase
    .from('invoice_templates')
    .select(`
      *,
      items:template_items(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('usage_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          templates: [
            { id: 'tmpl-1', name: 'Standard Invoice', is_default: true, tax_rate: 10, currency: 'USD' },
            { id: 'tmpl-2', name: 'Consulting Services', is_default: false, tax_rate: 0, currency: 'USD' },
          ],
          total: 2,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      templates: templates || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getRecurringInvoices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  url: URL,
  demoMode: boolean
) {
  const enabled = url.searchParams.get('enabled')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('recurring_invoices')
    .select(`
      *,
      invoice:invoices!inner(id, invoice_number, client_name, total, user_id)
    `, { count: 'exact' })
    .eq('invoice.user_id', userId)
    .order('next_invoice_date', { ascending: true })
    .range(offset, offset + limit - 1)

  if (enabled !== null) {
    query = query.eq('enabled', enabled === 'true')
  }

  const { data: recurring, count, error } = await query

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          recurring: [
            { id: 'rec-1', cycle: 'monthly', next_invoice_date: new Date(Date.now() + 7 * 86400000).toISOString(), enabled: true },
          ],
          total: 1,
          hasMore: false
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      recurring: recurring || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    }
  })
}

async function getBillingStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Try to get from billing_stats table first
  const { data: stats, error } = await supabase
    .from('billing_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // Calculate stats manually
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total, paid_date')
      .eq('user_id', userId)

    if (invoices) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const totalOutstanding = invoices.filter(inv => ['sent', 'viewed', 'overdue'].includes(inv.status))
        .reduce((sum, inv) => sum + (inv.total || 0), 0)

      const paidThisMonth = invoices.filter(inv =>
        inv.status === 'paid' &&
        inv.paid_date &&
        new Date(inv.paid_date) >= startOfMonth
      ).reduce((sum, inv) => sum + (inv.total || 0), 0)

      const overdueAmount = invoices.filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + (inv.total || 0), 0)

      const paidInvoices = invoices.filter(inv => inv.status === 'paid')
      const averageInvoiceValue = paidInvoices.length > 0
        ? paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0) / paidInvoices.length
        : 0

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          totalOutstanding,
          paidThisMonth,
          overdueAmount,
          averageInvoiceValue: Math.round(averageInvoiceValue * 100) / 100,
          totalInvoices: invoices.length,
          paidInvoices: paidInvoices.length,
          pendingInvoices: invoices.filter(inv => ['sent', 'viewed'].includes(inv.status)).length,
          overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length
        }
      })
    }

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          totalOutstanding: 11000,
          paidThisMonth: 45000,
          overdueAmount: 7500,
          averageInvoiceValue: 3500,
          totalInvoices: 45,
          paidInvoices: 38,
          pendingInvoices: 4,
          overdueInvoices: 3
        }
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: stats
  })
}

async function getInvoicingOverview(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
) {
  // Get recent invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })
    .limit(5)

  // Get billing stats
  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('status, total')
    .eq('user_id', userId)

  const totalOutstanding = allInvoices?.filter(inv => ['sent', 'viewed', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: paidThisMonthData } = await supabase
    .from('invoices')
    .select('total')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('paid_date', startOfMonth.toISOString().split('T')[0])

  const paidThisMonth = paidThisMonthData?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  const overdueAmount = allInvoices?.filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  if (invoicesError) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          invoices: DEMO_INVOICES,
          stats: {
            totalOutstanding: 11000,
            paidThisMonth: 45000,
            overdueAmount: 7500,
            averagePaymentTime: 14
          }
        }
      })
    }
    throw invoicesError
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      invoices: invoices || [],
      stats: {
        totalOutstanding,
        paidThisMonth,
        overdueAmount,
        averagePaymentTime: 14 // Would need payment date tracking to calculate
      }
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Invoicing POST request', { action, userId: effectiveUserId })

    try {
      switch (action) {
        case 'create_invoice':
          return await createInvoice(supabase, effectiveUserId, data, demoMode)
        case 'update_invoice':
          return await updateInvoice(supabase, effectiveUserId, data, demoMode)
        case 'delete_invoice':
          return await deleteInvoice(supabase, effectiveUserId, data, demoMode)
        case 'send_invoice':
          return await sendInvoice(supabase, effectiveUserId, data, demoMode)
        case 'mark_paid':
          return await markInvoicePaid(supabase, effectiveUserId, data, demoMode)
        case 'add_item':
          return await addInvoiceItem(supabase, effectiveUserId, data, demoMode)
        case 'record_payment':
          return await recordPayment(supabase, effectiveUserId, data, demoMode)
        case 'create_template':
          return await createTemplate(supabase, effectiveUserId, data, demoMode)
        case 'setup_recurring':
          return await setupRecurring(supabase, effectiveUserId, data, demoMode)
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          )
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `demo-${Date.now()}`, ...data },
        message: `${action} completed (demo mode)`
      })
    }
  } catch (error) {
    logger.error('Invoicing POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process invoicing request' },
      { status: 500 }
    )
  }
}

function generateInvoiceNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `INV-${year}${month}-${random}`
}

async function createInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    clientId,
    client_id,
    clientName,
    client_name,
    clientEmail,
    client_email,
    clientAddress,
    client_address,
    items = [],
    taxRate,
    tax_rate,
    discount = 0,
    discountType,
    discount_type,
    currency = 'USD',
    dueDate,
    due_date,
    notes,
    terms
  } = data

  if (!(clientName || client_name) || !(clientEmail || client_email)) {
    return NextResponse.json(
      { success: false, error: 'Client name and email are required' },
      { status: 400 }
    )
  }

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: any) =>
    sum + (item.quantity || 1) * (item.unitPrice || item.unit_price || 0), 0)

  const actualTaxRate = taxRate || tax_rate || 0
  const taxAmount = (subtotal - discount) * (actualTaxRate / 100)
  const total = subtotal + taxAmount - discount

  const invoiceNumber = generateInvoiceNumber()

  // Calculate due date (default 30 days)
  const actualDueDate = dueDate || due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const invoiceData = {
    user_id: userId,
    invoice_number: invoiceNumber,
    client_id: clientId || client_id || null,
    client_name: clientName || client_name,
    client_email: clientEmail || client_email,
    client_address: clientAddress || client_address || null,
    subtotal,
    tax_rate: actualTaxRate,
    tax_amount: taxAmount,
    discount,
    discount_type: discountType || discount_type || null,
    total,
    currency,
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: actualDueDate,
    notes: notes || null,
    terms: terms || null
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `inv-${Date.now()}`, ...invoiceData },
        message: 'Invoice created (demo mode)'
      })
    }
    throw error
  }

  // Create invoice items
  if (items.length > 0) {
    const itemsData = items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || item.unit_price || 0,
      total: (item.quantity || 1) * (item.unitPrice || item.unit_price || 0),
      tax_rate: item.taxRate || item.tax_rate || null,
      tax_amount: item.taxAmount || item.tax_amount || null
    }))

    await supabase.from('invoice_items').insert(itemsData)
  }

  logger.info('Invoice created', { invoiceId: invoice.id, invoiceNumber })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: invoice,
    message: 'Invoice created successfully'
  })
}

async function updateInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, invoiceId, invoice_id, ...updateData } = data
  const actualId = id || invoiceId || invoice_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  const dbData: Record<string, any> = {}
  if (updateData.clientName || updateData.client_name) dbData.client_name = updateData.clientName || updateData.client_name
  if (updateData.clientEmail || updateData.client_email) dbData.client_email = updateData.clientEmail || updateData.client_email
  if (updateData.clientAddress || updateData.client_address) dbData.client_address = updateData.clientAddress || updateData.client_address
  if (updateData.taxRate !== undefined || updateData.tax_rate !== undefined) {
    dbData.tax_rate = updateData.taxRate ?? updateData.tax_rate
  }
  if (updateData.discount !== undefined) dbData.discount = updateData.discount
  if (updateData.currency) dbData.currency = updateData.currency
  if (updateData.dueDate || updateData.due_date) dbData.due_date = updateData.dueDate || updateData.due_date
  if (updateData.notes !== undefined) dbData.notes = updateData.notes
  if (updateData.terms !== undefined) dbData.terms = updateData.terms

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(dbData)
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, ...dbData },
        message: 'Invoice updated (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: invoice,
    message: 'Invoice updated successfully'
  })
}

async function deleteInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, invoiceId, invoice_id } = data
  const actualId = id || invoiceId || invoice_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  // Only allow deleting draft invoices
  const { data: invoice } = await supabase
    .from('invoices')
    .select('status')
    .eq('id', actualId)
    .eq('user_id', userId)
    .single()

  if (invoice && invoice.status !== 'draft' && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Can only delete draft invoices' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', actualId)
    .eq('user_id', userId)

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, deleted: true },
        message: 'Invoice deleted (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { id: actualId, deleted: true },
    message: 'Invoice deleted successfully'
  })
}

async function sendInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, invoiceId, invoice_id, emailMessage } = data
  const actualId = id || invoiceId || invoice_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({ status: 'sent' })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status: 'sent', sentAt: new Date().toISOString() },
        message: 'Invoice sent (demo mode)'
      })
    }
    throw error
  }

  // In a real implementation, send email to client here
  logger.info('Invoice sent', { invoiceId: actualId, clientEmail: invoice.client_email })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: invoice,
    message: 'Invoice sent successfully'
  })
}

async function markInvoicePaid(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { id, invoiceId, invoice_id, paymentMethod, payment_method, transactionId, transaction_id } = data
  const actualId = id || invoiceId || invoice_id

  if (!actualId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  const paidDate = new Date().toISOString().split('T')[0]

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_date: paidDate
    })
    .eq('id', actualId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: actualId, status: 'paid', paid_date: paidDate },
        message: 'Invoice marked as paid (demo mode)'
      })
    }
    throw error
  }

  // Record payment
  if (paymentMethod || payment_method) {
    await supabase.from('payments').insert({
      invoice_id: actualId,
      user_id: userId,
      amount: invoice.total,
      currency: invoice.currency,
      method: paymentMethod || payment_method,
      status: 'completed',
      transaction_id: transactionId || transaction_id || null,
      paid_at: new Date().toISOString()
    })
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: invoice,
    message: 'Invoice marked as paid'
  })
}

async function addInvoiceItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const { invoiceId, invoice_id, description, quantity = 1, unitPrice, unit_price, taxRate, tax_rate } = data
  const actualInvoiceId = invoiceId || invoice_id
  const actualUnitPrice = unitPrice || unit_price || 0

  if (!actualInvoiceId || !description) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID and item description are required' },
      { status: 400 }
    )
  }

  // Verify invoice ownership
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', actualInvoiceId)
    .eq('user_id', userId)
    .single()

  if (!invoice && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Invoice not found' },
      { status: 404 }
    )
  }

  const total = quantity * actualUnitPrice

  const itemData = {
    invoice_id: actualInvoiceId,
    description,
    quantity,
    unit_price: actualUnitPrice,
    total,
    tax_rate: taxRate || tax_rate || null
  }

  const { data: item, error } = await supabase
    .from('invoice_items')
    .insert(itemData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `item-${Date.now()}`, ...itemData },
        message: 'Item added (demo mode)'
      })
    }
    throw error
  }

  // Update invoice totals
  const { data: allItems } = await supabase
    .from('invoice_items')
    .select('total')
    .eq('invoice_id', actualInvoiceId)

  const newSubtotal = allItems?.reduce((sum, i) => sum + (i.total || 0), 0) || 0

  await supabase
    .from('invoices')
    .update({ subtotal: newSubtotal })
    .eq('id', actualInvoiceId)

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: item,
    message: 'Item added to invoice'
  })
}

async function recordPayment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    invoiceId,
    invoice_id,
    amount,
    method,
    transactionId,
    transaction_id,
    reference
  } = data
  const actualInvoiceId = invoiceId || invoice_id

  if (!actualInvoiceId || !amount || !method) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID, amount, and payment method are required' },
      { status: 400 }
    )
  }

  // Verify invoice ownership and get details
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, total, currency')
    .eq('id', actualInvoiceId)
    .eq('user_id', userId)
    .single()

  if (!invoice && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Invoice not found' },
      { status: 404 }
    )
  }

  const paymentData = {
    invoice_id: actualInvoiceId,
    user_id: userId,
    amount,
    currency: invoice?.currency || 'USD',
    method,
    status: 'completed',
    transaction_id: transactionId || transaction_id || null,
    reference: reference || null,
    paid_at: new Date().toISOString()
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `pay-${Date.now()}`, ...paymentData },
        message: 'Payment recorded (demo mode)'
      })
    }
    throw error
  }

  // Check if invoice is fully paid
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('invoice_id', actualInvoiceId)
    .eq('status', 'completed')

  const totalPaid = allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  if (invoice && totalPaid >= invoice.total) {
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', actualInvoiceId)
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: payment,
    message: 'Payment recorded successfully'
  })
}

async function createTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    name,
    description,
    defaultTerms,
    default_terms,
    defaultNotes,
    default_notes,
    taxRate,
    tax_rate,
    currency = 'USD',
    isDefault,
    is_default,
    items = []
  } = data

  if (!name) {
    return NextResponse.json(
      { success: false, error: 'Template name is required' },
      { status: 400 }
    )
  }

  const templateData = {
    user_id: userId,
    name,
    description: description || null,
    default_terms: defaultTerms || default_terms || null,
    default_notes: defaultNotes || default_notes || null,
    tax_rate: taxRate || tax_rate || 0,
    currency,
    is_default: isDefault || is_default || false
  }

  // If setting as default, unset other defaults
  if (templateData.is_default) {
    await supabase
      .from('invoice_templates')
      .update({ is_default: false })
      .eq('user_id', userId)
  }

  const { data: template, error } = await supabase
    .from('invoice_templates')
    .insert(templateData)
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `tmpl-${Date.now()}`, ...templateData },
        message: 'Template created (demo mode)'
      })
    }
    throw error
  }

  // Add template items
  if (items.length > 0) {
    const itemsData = items.map((item: any) => ({
      template_id: template.id,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || item.unit_price || 0,
      total: (item.quantity || 1) * (item.unitPrice || item.unit_price || 0)
    }))

    await supabase.from('template_items').insert(itemsData)
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: template,
    message: 'Template created successfully'
  })
}

async function setupRecurring(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
) {
  const {
    invoiceId,
    invoice_id,
    cycle = 'monthly',
    startDate,
    start_date,
    endDate,
    end_date,
    occurrences
  } = data
  const actualInvoiceId = invoiceId || invoice_id

  if (!actualInvoiceId) {
    return NextResponse.json(
      { success: false, error: 'Invoice ID is required' },
      { status: 400 }
    )
  }

  // Verify invoice ownership
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', actualInvoiceId)
    .eq('user_id', userId)
    .single()

  if (!invoice && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Invoice not found' },
      { status: 404 }
    )
  }

  const actualStartDate = startDate || start_date || new Date().toISOString().split('T')[0]

  // Calculate next invoice date based on cycle
  const nextDate = new Date(actualStartDate)
  switch (cycle) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3)
      break
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  const recurringData = {
    invoice_id: actualInvoiceId,
    enabled: true,
    cycle,
    start_date: actualStartDate,
    end_date: endDate || end_date || null,
    next_invoice_date: nextDate.toISOString().split('T')[0],
    occurrences: occurrences || null,
    current_occurrence: 0
  }

  const { data: recurring, error } = await supabase
    .from('recurring_invoices')
    .upsert(recurringData, { onConflict: 'invoice_id' })
    .select()
    .single()

  if (error) {
    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `rec-${Date.now()}`, ...recurringData },
        message: 'Recurring invoice setup (demo mode)'
      })
    }
    throw error
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: recurring,
    message: 'Recurring invoice configured successfully'
  })
}
