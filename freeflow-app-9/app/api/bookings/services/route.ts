/**
 * Booking Services API Routes
 *
 * REST endpoints for Service Type Management:
 * GET - List all service types
 * POST - Create a new service type
 * PUT - Update a service type
 * DELETE - Delete a service type
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('booking-services')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to fetch from database
    const { data, error } = await supabase
      .from('booking_services')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error && error.code !== '42P01') {
      throw error
    }

    // Return services from DB or default services
    const services = data && data.length > 0 ? data : [
      { id: '1', name: 'Discovery Call', duration: 15, price: 0, color: 'sky', description: 'Free introductory call', buffer: 5, max_capacity: 1 },
      { id: '2', name: 'Strategy Session', duration: 60, price: 150, color: 'indigo', description: '1-hour strategy consultation', buffer: 15, max_capacity: 1 },
      { id: '3', name: 'Project Kickoff', duration: 90, price: 250, color: 'purple', description: 'Comprehensive project planning', buffer: 15, max_capacity: 5 },
      { id: '4', name: 'Workshop', duration: 180, price: 500, color: 'emerald', description: 'Half-day workshop session', buffer: 30, max_capacity: 10 },
      { id: '5', name: 'Coaching Call', duration: 45, price: 100, color: 'amber', description: 'Personal coaching session', buffer: 10, max_capacity: 1 }
    ]

    return NextResponse.json({
      success: true,
      services
    })
  } catch (error) {
    logger.error('Services GET error', { error })
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, duration, price, color, description, buffer, maxCapacity } = body

    if (!name || !duration) {
      return NextResponse.json({
        error: 'Name and duration are required'
      }, { status: 400 })
    }

    // Insert into database
    const { data, error } = await supabase
      .from('booking_services')
      .insert({
        user_id: user.id,
        name,
        duration: parseInt(duration),
        price: parseFloat(price) || 0,
        color: color || 'sky',
        description: description || '',
        buffer: parseInt(buffer) || 10,
        max_capacity: parseInt(maxCapacity) || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error && error.code !== '42P01') {
      throw error
    }

    const service = data || {
      id: `service-${Date.now()}`,
      name,
      duration: parseInt(duration),
      price: parseFloat(price) || 0,
      color: color || 'sky',
      description: description || '',
      buffer: parseInt(buffer) || 10,
      max_capacity: parseInt(maxCapacity) || 1
    }

    logger.info('Service created', { serviceId: service.id, name })

    return NextResponse.json({
      success: true,
      service,
      message: 'Service created successfully'
    })
  } catch (error) {
    logger.error('Services POST error', { error })
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, duration, price, color, description, buffer, maxCapacity } = body

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('booking_services')
      .update({
        name,
        duration: parseInt(duration),
        price: parseFloat(price) || 0,
        color: color || 'sky',
        description: description || '',
        buffer: parseInt(buffer) || 10,
        max_capacity: parseInt(maxCapacity) || 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error && error.code !== '42P01') {
      throw error
    }

    logger.info('Service updated', { serviceId: id })

    return NextResponse.json({
      success: true,
      service: data,
      message: 'Service updated successfully'
    })
  } catch (error) {
    logger.error('Services PUT error', { error })
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('booking_services')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error && error.code !== '42P01') {
      throw error
    }

    logger.info('Service deleted', { serviceId: id })

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    })
  } catch (error) {
    logger.error('Services DELETE error', { error })
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
