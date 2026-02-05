/**
 * User Management API - Single Resource Routes
 *
 * GET - Get single user, user activity
 * PUT - Update user role, deactivate, reactivate, update department/team, update permissions
 * DELETE - Delete user, cancel invitation, delete department/team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/demo-mode'

const logger = createSimpleLogger('user-management')
import {
  getUserById,
  getUserActivity,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  deleteUser,
  cancelInvitation,
  resendInvitation,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  addUserToTeam,
  removeUserFromTeam,
  updateRolePermissions,
  checkUserPermission
} from '@/lib/user-management-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user'
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (type) {
      case 'user': {
        const data = await getUserById(id)
        if (!data) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'user-activity': {
        const data = await getUserActivity(id, limit)
        return NextResponse.json({ data })
      }

      case 'department': {
        const data = await getDepartmentById(id)
        if (!data) {
          return NextResponse.json({ error: 'Department not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'check-permission': {
        const resource = searchParams.get('resource')
        const action = searchParams.get('action') as 'create' | 'read' | 'update' | 'delete'
        if (!resource || !action) {
          return NextResponse.json({ error: 'resource and action required' }, { status: 400 })
        }
        const hasPermission = await checkUserPermission(id, resource, action)
        return NextResponse.json({ data: { has_permission: hasPermission } })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'user': {
        if (action === 'update-role') {
          const data = await updateUserRole(id, updates.role)
          return NextResponse.json({ data })
        } else if (action === 'deactivate') {
          const data = await deactivateUser(id)
          return NextResponse.json({ data })
        } else if (action === 'reactivate') {
          const data = await reactivateUser(id)
          return NextResponse.json({ data })
        } else if (action === 'add-to-team') {
          const data = await addUserToTeam(id, updates.team_id)
          return NextResponse.json({ data })
        } else if (action === 'remove-from-team') {
          const data = await removeUserFromTeam(id, updates.team_id)
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for user' }, { status: 400 })
      }

      case 'invitation': {
        if (action === 'resend') {
          const data = await resendInvitation(id)
          return NextResponse.json({ data })
        }
        return NextResponse.json({ error: 'Invalid action for invitation' }, { status: 400 })
      }

      case 'department': {
        const data = await updateDepartment(id, updates)
        return NextResponse.json({ data })
      }

      case 'permissions': {
        const data = await updateRolePermissions(updates.role, updates.resource, updates.permissions)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user'

    switch (type) {
      case 'user': {
        await deleteUser(id)
        return NextResponse.json({ success: true })
      }

      case 'invitation': {
        const data = await cancelInvitation(id)
        return NextResponse.json({ data })
      }

      case 'department': {
        const data = await deleteDepartment(id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
