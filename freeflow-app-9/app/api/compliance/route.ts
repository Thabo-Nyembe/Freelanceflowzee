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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get compliance items
    let query = supabase
      .from('compliance_items')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('due_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (type) {
      query = query.eq('compliance_type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: items, error: itemsError, count } = await query

    if (itemsError) throw itemsError

    // Get compliance policies
    const { data: policies, error: policiesError } = await supabase
      .from('compliance_policies')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (policiesError) throw policiesError

    // Get compliance audits
    const { data: audits, error: auditsError } = await supabase
      .from('compliance_audits')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('audit_date', { ascending: false })
      .limit(10)

    if (auditsError) throw auditsError

    // Calculate stats
    const stats = {
      total: count || 0,
      compliant: items?.filter(i => i.status === 'compliant').length || 0,
      nonCompliant: items?.filter(i => i.status === 'non_compliant').length || 0,
      pending: items?.filter(i => i.status === 'pending').length || 0,
      overdue: items?.filter(i => i.status === 'overdue' || (i.due_date && new Date(i.due_date) < new Date())).length || 0,
      complianceScore: items?.length ? Math.round((items.filter(i => i.status === 'compliant').length / items.length) * 100) : 100,
      totalPolicies: policies?.length || 0,
      totalAudits: audits?.length || 0
    }

    return NextResponse.json({
      items,
      policies,
      audits,
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
    const { type, ...data } = body

    let result

    if (type === 'item') {
      const { data: item, error } = await supabase
        .from('compliance_items')
        .insert({
          ...data,
          user_id: user.id,
          status: data.status || 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      result = item
    } else if (type === 'policy') {
      const { data: policy, error } = await supabase
        .from('compliance_policies')
        .insert({
          ...data,
          user_id: user.id,
          status: data.status || 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      result = policy
    } else if (type === 'audit') {
      const auditNumber = `AUD-${Date.now().toString(36).toUpperCase()}`
      const { data: audit, error } = await supabase
        .from('compliance_audits')
        .insert({
          ...data,
          user_id: user.id,
          audit_number: auditNumber,
          status: data.status || 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      result = audit
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ data: result }, { status: 201 })
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
    const { id, type, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = type === 'policy' ? 'compliance_policies' : type === 'audit' ? 'compliance_audits' : 'compliance_items'

    const { data, error } = await supabase
      .from(table)
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
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = type === 'policy' ? 'compliance_policies' : type === 'audit' ? 'compliance_audits' : 'compliance_items'

    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
