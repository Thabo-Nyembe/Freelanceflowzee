/**
 * Permission Revoke API
 *
 * POST /api/auth/permissions/revoke - Revoke permission (delete tuple)
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
      subject_relation
    } = body

    // Validate required fields
    if (!namespace || !object_id || !relation || !subject_id) {
      return NextResponse.json(
        { success: false, error: 'namespace, object_id, relation, and subject_id are required' },
        { status: 400 }
      )
    }

    // Check if user has permission to revoke (must be owner or admin)
    const canRevoke = await authorizationService.check({
      namespace,
      object_id,
      relation: 'can_delete',
      subject_namespace: 'user',
      subject_id: user.id
    })

    // Allow users to revoke their own permissions
    const isOwnPermission = subject_namespace === 'user' && subject_id === user.id

    if (!canRevoke.allowed && !isOwnPermission) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to revoke permissions on this object' },
        { status: 403 }
      )
    }

    // Delete the permission tuple
    const success = await authorizationService.deleteTuple(
      namespace,
      object_id,
      relation,
      subject_namespace,
      subject_id,
      subject_relation
    )

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Permission not found or already revoked' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Permission revoked successfully'
    })
  } catch (error: unknown) {
    logger.error('Permission revoke error', { error })
    const message = error instanceof Error ? error.message : 'Failed to revoke permission'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * Batch revoke permissions
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
    const { revokes } = body

    if (!Array.isArray(revokes) || revokes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'revokes array is required' },
        { status: 400 }
      )
    }

    if (revokes.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Maximum 50 revokes per request' },
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

    for (const revoke of revokes) {
      try {
        // Check authorization
        const canRevoke = await authorizationService.check({
          namespace: revoke.namespace,
          object_id: revoke.object_id,
          relation: 'can_delete',
          subject_namespace: 'user',
          subject_id: user.id
        })

        const isOwnPermission = (revoke.subject_namespace || 'user') === 'user' &&
          revoke.subject_id === user.id

        if (!canRevoke.allowed && !isOwnPermission) {
          results.push({
            success: false,
            namespace: revoke.namespace,
            object_id: revoke.object_id,
            relation: revoke.relation,
            subject_id: revoke.subject_id,
            error: 'Not authorized'
          })
          continue
        }

        const success = await authorizationService.deleteTuple(
          revoke.namespace,
          revoke.object_id,
          revoke.relation,
          revoke.subject_namespace || 'user',
          revoke.subject_id,
          revoke.subject_relation
        )

        results.push({
          success,
          namespace: revoke.namespace,
          object_id: revoke.object_id,
          relation: revoke.relation,
          subject_id: revoke.subject_id,
          error: success ? undefined : 'Permission not found'
        })
      } catch (err) {
        results.push({
          success: false,
          namespace: revoke.namespace,
          object_id: revoke.object_id,
          relation: revoke.relation,
          subject_id: revoke.subject_id,
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
    logger.error('Batch permission revoke error', { error })
    const message = error instanceof Error ? error.message : 'Batch revoke failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
