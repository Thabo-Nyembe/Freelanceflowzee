/**
 * Team Management API Routes
 *
 * REST endpoints for Team Management:
 * GET - User roles, role permissions, user permissions, users by role, role summary
 * POST - Create role, permission, grant permission, batch grant permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('team-management')
import {
  getUserRoles,
  createUserRole,
  getRolePermissions,
  createRolePermission,
  getUserPermissions,
  grantUserPermission,
  checkUserPermission,
  getEffectivePermissions,
  getUsersByRole,
  getRoleSummary,
  batchGrantPermissions
} from '@/lib/team-management-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'roles'
    const teamId = searchParams.get('team_id')
    const roleName = searchParams.get('role_name') as any
    const resourceType = searchParams.get('resource_type')
    const isActive = searchParams.get('is_active')
    const targetUserId = searchParams.get('target_user_id')
    const action = searchParams.get('action') as any
    const resourceId = searchParams.get('resource_id')

    switch (type) {
      case 'roles': {
        const filters: any = {}
        if (isActive !== null) filters.is_active = isActive === 'true'
        if (teamId) filters.team_id = teamId
        if (roleName) filters.role_name = roleName
        const result = await getUserRoles(user.id, Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'role-permissions': {
        const filters: any = {}
        if (roleName) filters.role_name = roleName
        if (resourceType) filters.resource_type = resourceType
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getRolePermissions(user.id, Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'user-permissions': {
        const filters: any = {}
        if (targetUserId) filters.target_user_id = targetUserId
        if (resourceType) filters.resource_type = resourceType
        if (isActive !== null) filters.is_active = isActive === 'true'
        const result = await getUserPermissions(user.id, Object.keys(filters).length > 0 ? filters : undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'check-permission': {
        if (!resourceType || !action) {
          return NextResponse.json({ error: 'resource_type and action required' }, { status: 400 })
        }
        const result = await checkUserPermission(user.id, resourceType, action, resourceId || undefined)
        return NextResponse.json({ data: { has_permission: result.hasPermission } })
      }

      case 'effective-permissions': {
        const result = await getEffectivePermissions(user.id, resourceType || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'users-by-role': {
        if (!roleName) {
          return NextResponse.json({ error: 'role_name required' }, { status: 400 })
        }
        const result = await getUsersByRole(user.id, roleName)
        return NextResponse.json({ data: result.data })
      }

      case 'role-summary': {
        const result = await getRoleSummary(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Team Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Team Management data' },
      { status: 500 }
    )
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
    const { action, ...payload } = body

    switch (action) {
      case 'create-role': {
        const result = await createUserRole(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-role-permission': {
        const result = await createRolePermission(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'grant-permission': {
        const result = await grantUserPermission(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'batch-grant-permissions': {
        const result = await batchGrantPermissions(
          user.id,
          payload.target_user_ids,
          payload.permission
        )
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Team Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Team Management request' },
      { status: 500 }
    )
  }
}
