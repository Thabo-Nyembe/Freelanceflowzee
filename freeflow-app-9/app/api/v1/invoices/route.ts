import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey, hasPermission, withRateLimitHeaders, logApiRequest } from '@/lib/api/middleware'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

/**
 * GET /api/v1/invoices - List all invoices
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'read')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('invoices')
      .select('*, clients(name, email)', { count: 'exact' })
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data, error: queryError, count } = await query

    if (queryError) throw queryError

    const latency = Date.now() - startTime
    await logApiRequest(context, request, 200, latency)

    const response = NextResponse.json({
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

    return withRateLimitHeaders(response, context)

  } catch (err) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await logApiRequest(context, request, 500, latency, errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * POST /api/v1/invoices - Create a new invoice
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions - write access required' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one invoice item is required' }, { status: 400 })
    }

    // Calculate totals
    const subtotal = body.items.reduce((sum: number, item: any) => {
      return sum + (item.quantity || 1) * (item.rate || 0)
    }, 0)

    const taxRate = body.tax_rate || 0
    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount - (body.discount || 0)

    // Generate invoice number
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', context.userId)

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(6, '0')}`

    const { data, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: context.userId,
        client_id: body.client_id,
        project_id: body.project_id || null,
        invoice_number: invoiceNumber,
        status: body.status || 'draft',
        items: body.items,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount: body.discount || 0,
        total,
        notes: body.notes || null,
        due_date: body.due_date || null,
        issued_date: body.issued_date || new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) throw insertError

    const latency = Date.now() - startTime
    await logApiRequest(context, request, 201, latency)

    const response = NextResponse.json({ data }, { status: 201 })
    return withRateLimitHeaders(response, context)

  } catch (err) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await logApiRequest(context, request, 500, latency, errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/invoices - Update an existing invoice
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // If items are updated, recalculate totals
    if (updates.items) {
      const subtotal = updates.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 1) * (item.rate || 0)
      }, 0)

      const taxRate = updates.tax_rate || 0
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount - (updates.discount || 0)

      updates.subtotal = subtotal
      updates.tax_amount = taxAmount
      updates.total = total
    }

    updates.updated_at = new Date().toISOString()

    const { data, error: updateError } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (updateError) throw updateError

    const latency = Date.now() - startTime
    await logApiRequest(context, request, 200, latency)

    const response = NextResponse.json({ data })
    return withRateLimitHeaders(response, context)

  } catch (err) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await logApiRequest(context, request, 500, latency, errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/invoices - Delete an invoice
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now()

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', context.userId)

    if (deleteError) throw deleteError

    const latency = Date.now() - startTime
    await logApiRequest(context, request, 200, latency)

    const response = NextResponse.json({ success: true, message: 'Invoice deleted successfully' })
    return withRateLimitHeaders(response, context)

  } catch (err) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await logApiRequest(context, request, 500, latency, errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
