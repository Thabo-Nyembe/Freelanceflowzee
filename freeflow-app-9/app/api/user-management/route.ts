/**
 * User Management API Routes
 *
 * REST endpoints for User Management:
 * GET - List users, invitations, activity, departments, teams, stats, permissions
 * POST - Create invitation, department, team, log activity, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('user-management')
import {
  getAllUsers,
  getUsersByRole,
  getUsersByStatus,
  searchUsers,
  getUserStats,
  getActiveUsersCount,
  getUserGrowth,
  getPendingInvitations,
  sendInvitation,
  getRecentActivity,
  getActivityByType,
  logActivity,
  getDepartments,
  createDepartment,
  getDepartmentStats,
  getTeams,
  createTeam,
  getRolePermissions,
  bulkInviteUsers,
  bulkUpdateRoles,
  bulkDeactivateUsers,
  exportUsersToCSV,
  exportActivityToCSV
} from '@/lib/user-management-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users'
    const role = searchParams.get('role') as string | null
    const status = searchParams.get('status') as string | null
    const activityType = searchParams.get('activity_type') as string | null
    const search = searchParams.get('search')
    const days = parseInt(searchParams.get('days') || '30')
    const months = parseInt(searchParams.get('months') || '6')
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (type) {
      case 'users': {
        let data
        if (role) {
          data = await getUsersByRole(role)
        } else if (status) {
          data = await getUsersByStatus(status)
        } else if (search) {
          data = await searchUsers(search)
        } else {
          data = await getAllUsers()
        }
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getUserStats()
        return NextResponse.json({ data })
      }

      case 'active-users-count': {
        const data = await getActiveUsersCount(days)
        return NextResponse.json({ data: { count: data } })
      }

      case 'user-growth': {
        const data = await getUserGrowth(months)
        return NextResponse.json({ data })
      }

      case 'invitations': {
        const data = await getPendingInvitations()
        return NextResponse.json({ data })
      }

      case 'activity': {
        let data
        if (activityType) {
          data = await getActivityByType(activityType, limit)
        } else {
          data = await getRecentActivity(limit)
        }
        return NextResponse.json({ data })
      }

      case 'departments': {
        const data = await getDepartments()
        return NextResponse.json({ data })
      }

      case 'department-stats': {
        const data = await getDepartmentStats()
        return NextResponse.json({ data })
      }

      case 'teams': {
        const data = await getTeams()
        return NextResponse.json({ data })
      }

      case 'permissions': {
        if (!role) {
          return NextResponse.json({ error: 'role parameter required' }, { status: 400 })
        }
        const data = await getRolePermissions(role)
        return NextResponse.json({ data })
      }

      case 'export-users': {
        const data = await exportUsersToCSV()
        return NextResponse.json({ data })
      }

      case 'export-activity': {
        const userId = searchParams.get('user_id') || undefined
        const data = await exportActivityToCSV(userId)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch User Management data' },
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
      case 'send-invitation': {
        const data = await sendInvitation({
          email: payload.email,
          role: payload.role,
          message: payload.message,
          invited_by: user.id
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'bulk-invite': {
        const data = await bulkInviteUsers(payload.invitations, user.id)
        return NextResponse.json({ data })
      }

      case 'bulk-update-roles': {
        const data = await bulkUpdateRoles(payload.updates)
        return NextResponse.json({ data })
      }

      case 'bulk-deactivate': {
        const data = await bulkDeactivateUsers(payload.user_ids)
        return NextResponse.json({ data })
      }

      case 'log-activity': {
        const data = await logActivity({
          user_id: user.id,
          activity_type: payload.activity_type,
          description: payload.description,
          resource: payload.resource,
          resource_id: payload.resource_id,
          metadata: payload.metadata
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-department': {
        const data = await createDepartment({
          name: payload.name,
          description: payload.description,
          manager_id: payload.manager_id
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-team': {
        const data = await createTeam({
          name: payload.name,
          description: payload.description,
          department_id: payload.department_id,
          owner_id: user.id
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('User Management API error', { error })
    return NextResponse.json(
      { error: 'Failed to process User Management request' },
      { status: 500 }
    )
  }
}
