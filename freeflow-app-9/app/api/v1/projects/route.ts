import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { validateApiKey, hasPermission, withRateLimitHeaders, logApiRequest } from '@/lib/api/middleware'

/**
 * GET /api/v1/projects - List all projects for the authenticated user
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  // Validate API key
  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check permissions
  if (!hasPermission(context, 'read')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', context.userId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
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
 * POST /api/v1/projects - Create a new project
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // Validate API key
  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check permissions
  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions - write access required' }, { status: 403 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: context.userId,
        name: body.name,
        description: body.description || null,
        status: body.status || 'planning',
        client_id: body.client_id || null,
        budget: body.budget || null,
        deadline: body.deadline || null,
        priority: body.priority || 'medium',
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
