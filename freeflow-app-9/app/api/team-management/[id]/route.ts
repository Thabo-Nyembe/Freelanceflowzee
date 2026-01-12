/**
 * Team Management API - Single Resource Routes
 *
 * GET - Get single role, role permission, user permission
 * PUT - Update role, role permission, revoke user permission
 * DELETE - Delete role, role permission, user permission, deactivate role
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getUserRole,
  updateUserRole,
  deleteUserRole,
  deactivateUserRole,
  updateRolePermission,
  deleteRolePermission,
  revokeUserPermission,
  deleteUserPermission
} from '@/lib/team-management-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'role'

    switch (type) {
      case 'role': {
        const result = await getUserRole(id, user.id)
        if (!result.data) {
          return NextResponse.json({ error: 'Role not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Team Management API error:', error)
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
      case 'role': {
        if (action === 'deactivate') {
          const result = await deactivateUserRole(id, user.id)
          return NextResponse.json({ data: { success: result.success } })
        } else {
          const result = await updateUserRole(id, user.id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'role-permission': {
        const result = await updateRolePermission(id, user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'user-permission': {
        if (action === 'revoke') {
          const result = await revokeUserPermission(id, user.id, updates.reason)
          return NextResponse.json({ data: { success: result.success } })
        }
        return NextResponse.json({ error: 'Invalid action for user-permission' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Team Management API error:', error)
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
    const type = searchParams.get('type') || 'role'

    switch (type) {
      case 'role': {
        const result = await deleteUserRole(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      case 'role-permission': {
        const result = await deleteRolePermission(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      case 'user-permission': {
        const result = await deleteUserPermission(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Team Management API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
