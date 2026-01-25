/**
 * Permission Check API
 *
 * POST /api/auth/permissions/check - Check if subject has permission
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authorizationService } from '@/lib/auth/authorization-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('auth-api')

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      namespace,
      object_id,
      relation,
      subject_namespace = 'user',
      subject_id,
      context
    } = body

    // Validate required fields
    if (!namespace || !object_id || !relation) {
      return NextResponse.json(
        { success: false, error: 'namespace, object_id, and relation are required' },
        { status: 400 }
      )
    }

    // Use current user if no subject specified
    const checkSubjectId = subject_id || user.id

    // Perform permission check
    const result = await authorizationService.check({
      namespace,
      object_id,
      relation,
      subject_namespace,
      subject_id: checkSubjectId,
      context
    })

    return NextResponse.json({
      success: true,
      allowed: result.allowed,
      cached: result.cached,
      debug: process.env.NODE_ENV === 'development' ? result.debug : undefined
    })
  } catch (error: unknown) {
    logger.error('Permission check error', { error })
    const message = error instanceof Error ? error.message : 'Permission check failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Batch permission check
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { checks } = body

    if (!Array.isArray(checks) || checks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'checks array is required' },
        { status: 400 }
      )
    }

    if (checks.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Maximum 100 checks per request' },
        { status: 400 }
      )
    }

    // Perform batch checks
    const results = await Promise.all(
      checks.map(async (check: {
        namespace: string
        object_id: string
        relation: string
        subject_namespace?: string
        subject_id?: string
      }) => {
        const result = await authorizationService.check({
          namespace: check.namespace,
          object_id: check.object_id,
          relation: check.relation,
          subject_namespace: check.subject_namespace || 'user',
          subject_id: check.subject_id || user.id
        })

        return {
          namespace: check.namespace,
          object_id: check.object_id,
          relation: check.relation,
          allowed: result.allowed
        }
      })
    )

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error: unknown) {
    logger.error('Batch permission check error', { error })
    const message = error instanceof Error ? error.message : 'Batch permission check failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
