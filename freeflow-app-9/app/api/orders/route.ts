import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Handle export action
    if (action === 'export') {
      const format = searchParams.get('format') || 'json'
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (format === 'csv') {
        const csvRows = ['Order Number,Customer,Status,Total,Created At']
        data?.forEach(o => {
          csvRows.push(`"${o.order_number}","${o.customer_name || 'N/A'}","${o.status}","${o.total_amount}","${o.created_at}"`)
        })
        return new NextResponse(csvRows.join('\n'), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="orders-export-${Date.now()}.csv"`
          }
        })
      }
      return NextResponse.json({ data })
    }

    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      total: count || 0,
      pending: data?.filter(o => o.status === 'pending').length || 0,
      processing: data?.filter(o => o.status === 'processing').length || 0,
      shipped: data?.filter(o => o.status === 'shipped').length || 0,
      delivered: data?.filter(o => o.status === 'delivered').length || 0,
      cancelled: data?.filter(o => o.status === 'cancelled').length || 0,
      totalRevenue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
      avgOrderValue: data?.length ? (data.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.length) : 0
    }

    return NextResponse.json({
      data,
      count,
      stats,
      pagination: { limit, offset, total: count }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    // Handle action-based requests
    switch (action) {
      case 'generate_shipping_label': {
        const { orderId, orderNumber } = body
        // In production: call shipping API (UPS, FedEx, etc.)
        return NextResponse.json({
          success: true,
          labelUrl: `/labels/shipping-${orderNumber || orderId}-${Date.now()}.pdf`,
          trackingNumber: `TRK${Date.now().toString(36).toUpperCase()}`
        })
      }

      case 'generate_return_label': {
        const { returnId, orderNumber } = body
        return NextResponse.json({
          success: true,
          labelUrl: `/labels/return-${orderNumber || returnId}-${Date.now()}.pdf`,
          trackingNumber: `RTN${Date.now().toString(36).toUpperCase()}`
        })
      }

      case 'approve_return': {
        const { returnId, orderNumber } = body
        const { data, error } = await supabase
          .from('order_returns')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', returnId)
          .select()
          .single()
        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, orderNumber })
      }

      case 'reject_return': {
        const { returnId, orderNumber, reason } = body
        const { data, error } = await supabase
          .from('order_returns')
          .update({ status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason })
          .eq('id', returnId)
          .select()
          .single()
        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, orderNumber })
      }

      case 'archive_old_orders': {
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        const { data, error } = await supabase
          .from('orders')
          .update({ status: 'archived', archived_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .lt('created_at', oneYearAgo.toISOString())
          .select()
        if (error) throw error
        return NextResponse.json({ success: true, archived: data?.length || 0 })
      }

      case 'delete_test_orders': {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('user_id', user.id)
          .or('order_number.ilike.%TEST%,order_number.ilike.%SANDBOX%')
        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'print_order': {
        const { orderId, orderNumber } = body
        return NextResponse.json({
          success: true,
          printUrl: `/print/order-${orderNumber || orderId}-${Date.now()}.pdf`
        })
      }

      case 'send_status_update': {
        const { orderId, orderNumber, customerEmail, status } = body
        // In production: send email via Resend/SendGrid
        return NextResponse.json({ success: true, sentTo: customerEmail })
      }

      default: {
        // Create new order
        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`

        const { data, error } = await supabase
          .from('orders')
          .insert({
            ...body,
            user_id: user.id,
            order_number: orderNumber,
            status: body.status || 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Handle status changes
    if (updates.status === 'shipped') {
      updates.shipped_at = new Date().toISOString()
    } else if (updates.status === 'delivered') {
      updates.delivered_at = new Date().toISOString()
    } else if (updates.status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
