import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const lowStock = searchParams.get('low_stock')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('inventory')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (category) {
      query = query.eq('category', category)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (lowStock === 'true') {
      query = query.lte('quantity', supabase.rpc('get_reorder_point'))
    }

    const { data, error, count } = await query

    if (error) throw error

    // Calculate stats
    const lowStockItems = data?.filter(i => i.quantity <= (i.reorder_point || 10)) || []
    const stats = {
      totalItems: count || 0,
      totalValue: data?.reduce((sum, i) => sum + ((i.quantity || 0) * (i.unit_cost || 0)), 0) || 0,
      lowStockCount: lowStockItems.length,
      outOfStockCount: data?.filter(i => i.quantity === 0).length || 0,
      categories: [...new Set(data?.map(i => i.category))].length,
      avgTurnoverRate: data?.length ? (data.reduce((sum, i) => sum + (i.turnover_rate || 0), 0) / data.length) : 0
    }

    return NextResponse.json({
      data,
      count,
      stats,
      lowStockItems,
      pagination: { limit, offset, total: count }
    })
  } catch (error: any) {
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

    const sku = body.sku || `SKU-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        ...body,
        user_id: user.id,
        sku,
        status: body.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
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
    const { id, action, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Handle stock adjustments
    if (action === 'add_stock') {
      const { data: current } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', id)
        .single()

      if (current) {
        updates.quantity = (current.quantity || 0) + (updates.adjustment || 0)
        updates.last_restock_date = new Date().toISOString()
      }
    } else if (action === 'remove_stock') {
      const { data: current } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', id)
        .single()

      if (current) {
        updates.quantity = Math.max(0, (current.quantity || 0) - (updates.adjustment || 0))
      }
    }

    const { data, error } = await supabase
      .from('inventory')
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
  } catch (error: any) {
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
      .from('inventory')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
