/**
 * Permission Grant API
 *
 * POST /api/auth/permissions/grant - Grant permission (create tuple)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authorizationService } from '@/lib/auth/authorization-service'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('auth-api')

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
      subject_relation
    } = body

    // Validate required fields
    if (!namespace || !object_id || !relation || !subject_id) {
      return NextResponse.json(
        { success: false, error: 'namespace, object_id, relation, and subject_id are required' },
        { status: 400 }
      )
    }

    // Check if user has permission to grant (must be owner or admin)
    const canGrant = await authorizationService.check({
      namespace,
      object_id,
      relation: 'can_delete', // Only owners/admins can grant
      subject_namespace: 'user',
      subject_id: user.id
    })

    if (!canGrant.allowed) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to grant permissions on this object' },
        { status: 403 }
      )
    }

    // Create the permission tuple
    const tuple = await authorizationService.writeTuple({
      namespace,
      object_id,
      relation,
      subject_namespace,
      subject_id,
      subject_relation,
      created_by: user.id
    })

    return NextResponse.json({
      success: true,
      tuple: {
        id: tuple.id,
        namespace: tuple.namespace,
        object_id: tuple.object_id,
        relation: tuple.relation,
        subject_namespace: tuple.subject_namespace,
        subject_id: tuple.subject_id,
        subject_relation: tuple.subject_relation
      }
    })
  } catch (error: unknown) {
    logger.error('Permission grant error', { error })
    const message = error instanceof Error ? error.message : 'Failed to grant permission'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Batch grant permissions
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
    const { grants } = body

    if (!Array.isArray(grants) || grants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'grants array is required' },
        { status: 400 }
      )
    }

    if (grants.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 grants per request' },
        { status: 400 }
      )
    }

    const results: Array<{
      success: boolean
      namespace: string
      object_id: string
      relation: string
      subject_id: string
      error?: string
    }> = []

    for (const grant of grants) {
      try {
        // Check authorization for each grant
        const canGrant = await authorizationService.check({
          namespace: grant.namespace,
          object_id: grant.object_id,
          relation: 'can_delete',
          subject_namespace: 'user',
          subject_id: user.id
        })

        if (!canGrant.allowed) {
          results.push({
            success: false,
            namespace: grant.namespace,
            object_id: grant.object_id,
            relation: grant.relation,
            subject_id: grant.subject_id,
            error: 'Not authorized'
          })
          continue
        }

        await authorizationService.writeTuple({
          namespace: grant.namespace,
          object_id: grant.object_id,
          relation: grant.relation,
          subject_namespace: grant.subject_namespace || 'user',
          subject_id: grant.subject_id,
          subject_relation: grant.subject_relation,
          created_by: user.id
        })

        results.push({
          success: true,
          namespace: grant.namespace,
          object_id: grant.object_id,
          relation: grant.relation,
          subject_id: grant.subject_id
        })
      } catch (err) {
        results.push({
          success: false,
          namespace: grant.namespace,
          object_id: grant.object_id,
          relation: grant.relation,
          subject_id: grant.subject_id,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    })
  } catch (error: unknown) {
    logger.error('Batch permission grant error', { error })
    const message = error instanceof Error ? error.message : 'Batch grant failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
