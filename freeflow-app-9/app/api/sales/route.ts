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
    const stage = searchParams.get('stage')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('sales_deals')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (stage) {
      query = query.eq('stage', stage)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Calculate stats
    const stats = {
      totalDeals: count || 0,
      totalValue: data?.reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0,
      wonDeals: data?.filter(d => d.stage === 'closed_won').length || 0,
      wonValue: data?.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0,
      lostDeals: data?.filter(d => d.stage === 'closed_lost').length || 0,
      pipelineValue: data?.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((sum, d) => sum + (d.deal_value || 0), 0) || 0
    }

    return NextResponse.json({
      data,
      count,
      stats,
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

    // Generate deal code
    const dealCode = `DEAL-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('sales_deals')
      .insert({
        ...body,
        user_id: user.id,
        deal_code: dealCode,
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Handle stage changes
    if (updates.stage === 'closed_won') {
      updates.won_at = new Date().toISOString()
      updates.actual_close_date = new Date().toISOString()
    } else if (updates.stage === 'closed_lost') {
      updates.lost_at = new Date().toISOString()
      updates.actual_close_date = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('sales_deals')
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

    // Soft delete
    const { error } = await supabase
      .from('sales_deals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
