import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customer_id')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('customer_activities')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      count,
      pagination: { limit, offset, total: count }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error fetching customer activities', { error: errorMessage })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
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

    // Validate required fields
    if (!body.type || !body.subject) {
      return NextResponse.json({ error: 'Type and subject are required' }, { status: 400 })
    }

    const activityData = {
      user_id: user.id,
      customer_id: body.contactId || body.customer_id || null,
      type: body.type,
      subject: body.subject,
      description: body.description || null,
      status: body.status || 'completed',
      outcome: body.outcome || null,
      duration: body.duration || null,
      scheduled_at: body.dueDate || null,
      completed_at: body.completedDate || new Date().toISOString(),
      priority: body.priority || 'medium',
      metadata: {
        account_id: body.accountId || null,
        opportunity_id: body.opportunityId || null,
        owner_id: body.ownerId || user.id,
        owner_name: body.ownerName || 'Current User'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('customer_activities')
      .insert(activityData)
      .select()
      .single()

    if (error) {
      // If table doesn't exist, log a warning but still return success
      // Activity was logged locally in the client
      if (error.code === '42P01') {
        logger.warn('customer_activities table does not exist, activity logged locally only')
        return NextResponse.json({
          data: { ...activityData, id: body.id },
          warning: 'Activity logged locally only - database table pending creation'
        }, { status: 201 })
      }
      throw error
    }

    logger.info('Customer activity created', { activityId: data.id, type: body.type })
    return NextResponse.json({ data }, { status: 201 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error creating customer activity', { error: errorMessage })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
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
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('customer_activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    logger.info('Customer activity deleted', { activityId: id })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Error deleting customer activity', { error: errorMessage })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
