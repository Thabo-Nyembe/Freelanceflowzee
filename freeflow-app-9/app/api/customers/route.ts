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
    const status = searchParams.get('status')
    const segment = searchParams.get('segment')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Customers are stored in clients table
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (segment) {
      query = query.eq('type', segment)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      total: count || 0,
      active: data?.filter(c => c.status === 'active').length || 0,
      inactive: data?.filter(c => c.status === 'inactive').length || 0,
      vip: data?.filter(c => c.type === 'enterprise' || c.status === 'vip').length || 0,
      prospects: data?.filter(c => c.status === 'prospect').length || 0,
      totalRevenue: data?.reduce((sum, c) => sum + (c.total_revenue || 0), 0) || 0,
      avgLifetimeValue: data?.length ? (data.reduce((sum, c) => sum + (c.total_revenue || 0), 0) / data.length) : 0,
      avgHealthScore: data?.length ? (data.reduce((sum, c) => sum + (c.health_score || 0), 0) / data.length) : 0
    }

    return NextResponse.json({
      data,
      count,
      stats,
      pagination: { limit, offset, total: count }
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 })
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

    const clientCode = `CUS-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...body,
        user_id: user.id,
        client_code: clientCode,
        status: body.status || 'active',
        total_revenue: 0,
        total_projects: 0,
        health_score: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 })
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

    const { data, error } = await supabase
      .from('clients')
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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 })
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

    // Soft delete
    const { error } = await supabase
      .from('clients')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'archived'
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'An error occurred' }, { status: 500 })
  }
}
