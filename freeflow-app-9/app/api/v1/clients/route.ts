import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateApiKey, hasPermission, withRateLimitHeaders, logApiRequest } from '@/lib/api/middleware'

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

/**
 * GET /api/v1/clients - List all clients
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
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
 * POST /api/v1/clients - Create a new client
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

    if (!body.name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }

    const { data, error: insertError } = await supabase
      .from('clients')
      .insert({
        user_id: context.userId,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        address: body.address || null,
        website: body.website || null,
        status: body.status || 'active',
        notes: body.notes || null,
        tags: body.tags || []
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
 * PATCH /api/v1/clients?id={clientId} - Update an existing client
 */
export async function PATCH(request: NextRequest) {
  const startTime = Date.now()

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions - write access required' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const body = await request.json()

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'email', 'phone', 'company', 'address', 'website', 'status', 'notes', 'tags']
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error: updateError } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .eq('user_id', context.userId) // Ensure user owns this client
      .select()
      .single()

    if (updateError) throw updateError

    if (!data) {
      return NextResponse.json({ error: 'Client not found or access denied' }, { status: 404 })
    }

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
 * DELETE /api/v1/clients?id={clientId} - Delete a client
 */
export async function DELETE(request: NextRequest) {
  const startTime = Date.now()

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'delete')) {
    return NextResponse.json({ error: 'Insufficient permissions - delete access required' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('id')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)
      .eq('user_id', context.userId) // Ensure user owns this client

    if (deleteError) throw deleteError

    const latency = Date.now() - startTime
    await logApiRequest(context, request, 200, latency)

    const response = NextResponse.json({ success: true, message: 'Client deleted successfully' })
    return withRateLimitHeaders(response, context)

  } catch (err) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await logApiRequest(context, request, 500, latency, errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
