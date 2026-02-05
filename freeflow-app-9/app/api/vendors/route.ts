import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('vendors')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    // PERFORMANCE FIX: Select only needed vendor fields
    let query = supabase.from('vendors').select('id, name, email, phone, address, type, status, payment_terms, tax_id, created_at')

    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ vendors: data || [] })
  } catch (error) {
    logger.error('Error fetching vendors', { error })
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vendorData = {
      ...body,
      user_id: user.id,
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ vendor: data }, { status: 201 })
  } catch (error) {
    logger.error('Error creating vendor', { error })
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}
