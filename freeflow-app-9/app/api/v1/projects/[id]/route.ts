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
 * GET /api/v1/projects/[id] - Get a specific project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const { id } = await params

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'read')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const { data, error: queryError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', context.userId)
      .single()

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      throw queryError
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
 * PATCH /api/v1/projects/[id] - Update a project
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const { id } = await params

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, 'write')) {
    return NextResponse.json({ error: 'Insufficient permissions - write access required' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()

    // Remove fields that shouldn't be updated via API
    delete body.id
    delete body.user_id
    delete body.created_at

    const { data, error: updateError } = await supabase
      .from('projects')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      throw updateError
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
 * DELETE /api/v1/projects/[id] - Delete (archive) a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const { id } = await params

  const { context, error } = await validateApiKey(request)
  if (error) return error
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(context, ['delete', 'admin'])) {
    return NextResponse.json({ error: 'Insufficient permissions - delete access required' }, { status: 403 })
  }

  const supabase = await createClient()

  try {
    // Soft delete by setting archived_at
    const { data, error: deleteError } = await supabase
      .from('projects')
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', context.userId)
      .select()
      .single()

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
      throw deleteError
    }

    const latency = Date.now() - startTime
    await logApiRequest(context, request, 200, latency)

    const response = NextResponse.json({ message: 'Project archived successfully', data })
    return withRateLimitHeaders(response, context)

  } catch (err) {
    const latency = Date.now() - startTime
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    await logApiRequest(context, request, 500, latency, errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
