/**
 * Team Hub API Routes
 *
 * REST endpoints for Team Hub feature:
 * GET - List members, departments, get overview/stats
 * POST - Create member, department, goal, milestone, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('team-hub')
import {
  getTeamMembers,
  createTeamMember,
  getDepartments,
  createDepartment,
  getTeamOverview,
  getDepartmentStats,
  getTopPerformers,
  getOnlineMembers,
  createTeamGoal,
  createTeamMilestone,
  submitTeamFeedback,
  giveTeamRecognition,
  assignTeamTask
} from '@/lib/team-hub-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'members'
    const department = searchParams.get('department') as string | null
    const status = searchParams.get('status') as string | null
    const availability = searchParams.get('availability') as string | null
    const roleLevel = searchParams.get('role_level') as string | null
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    switch (type) {
      case 'members': {
        const { data, error } = await getTeamMembers(user.id, {
          department,
          status,
          availability,
          roleLevel,
          searchTerm: search
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'online': {
        const { data, error } = await getOnlineMembers(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'departments': {
        const { data, error } = await getDepartments(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'overview': {
        const { data, error } = await getTeamOverview(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'department-stats': {
        if (!department) {
          return NextResponse.json({ error: 'Department parameter required' }, { status: 400 })
        }
        const { data, error } = await getDepartmentStats(user.id, department)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'top-performers': {
        const { data, error } = await getTopPerformers(user.id, limit)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Team Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch team hub data' },
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
      case 'create-member': {
        const { data, error } = await createTeamMember(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-department': {
        const { data, error } = await createDepartment(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-goal': {
        const { data, error } = await createTeamGoal(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-milestone': {
        const { data, error } = await createTeamMilestone(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'submit-feedback': {
        const { data, error } = await submitTeamFeedback(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'give-recognition': {
        const { data, error } = await giveTeamRecognition(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'assign-task': {
        const { data, error } = await assignTeamTask(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Team Hub API error', { error })
    return NextResponse.json(
      { error: 'Failed to process team hub request' },
      { status: 500 }
    )
  }
}
