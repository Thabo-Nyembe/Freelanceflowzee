import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
 * POST /api/features/request - Submit a feature request
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { feature_request, user_id, source, priority } = body

        // Validate input
        if (!feature_request || !feature_request.trim()) {
            return NextResponse.json({
                success: false,
                error: 'Feature request description required'
            }, { status: 400 })
        }

        // Insert feature request
        const { data, error } = await supabase
            .from('feature_requests')
            .insert({
                user_id,
                feature_request: feature_request.trim(),
                source: source || 'manual',
                priority: priority || 'normal',
                status: 'submitted',
                votes: 0,
                submitted_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            // If table doesn't exist, create a fallback request log
            if (error.code === '42P01') {
                // Table doesn't exist - log to console for now
                console.log('Feature request:', { feature_request, user_id, source, priority })
                return NextResponse.json({
                    success: true,
                    message: 'Request received (logging mode)',
                    data: { feature_request, priority }
                })
            }
            throw error
        }

        // Log the request for analytics
        console.log('New feature request:', {
            id: data.id,
            request: feature_request,
            user_id,
            source
        })

        return NextResponse.json({
            success: true,
            message: 'Feature request submitted successfully',
            data
        })
    } catch (error) {
        console.error('Feature request error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit request'
        }, { status: 500 })
    }
}

/**
 * GET /api/features/request - Get all feature requests (with pagination)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)

        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = parseInt(searchParams.get('offset') || '0')
        const status = searchParams.get('status') || 'all'
        const sortBy = searchParams.get('sortBy') || 'votes'

        let query = supabase
            .from('feature_requests')
            .select('*', { count: 'exact' })

        // Filter by status
        if (status !== 'all') {
            query = query.eq('status', status)
        }

        // Sort
        if (sortBy === 'votes') {
            query = query.order('votes', { ascending: false })
        } else if (sortBy === 'recent') {
            query = query.order('submitted_at', { ascending: false })
        }

        // Pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            if (error.code === '42P01') {
                return NextResponse.json({
                    success: true,
                    data: [],
                    count: 0,
                    message: 'No feature requests table'
                })
            }
            throw error
        }

        return NextResponse.json({
            success: true,
            data: data || [],
            count: count || 0,
            pagination: {
                limit,
                offset,
                total: count || 0,
                hasMore: (offset + limit) < (count || 0)
            }
        })
    } catch (error) {
        console.error('Get feature requests error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch requests'
        }, { status: 500 })
    }
}
