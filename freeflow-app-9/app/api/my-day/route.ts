/**
 * My Day API Routes
 *
 * REST endpoints for My Day Feature:
 * GET - List goals, schedule, tasks, projects, analytics
 * POST - Create goal, schedule block, task, project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('my-day')
import {

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
  getGoals,
  createGoal,
  getSchedule,
  createScheduleBlock,
  getTasks,
  createTask,
  getMyDayProjects,
  addProjectToMyDay,
  getMyDayAnalytics
} from '@/lib/my-day-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'tasks'
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const goalType = searchParams.get('goal_type') as string | null
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    switch (type) {
      case 'goals': {
        const result = await getGoals(user.id, goalType || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'schedule': {
        const result = await getSchedule(user.id, date)
        return NextResponse.json({ data: result.data })
      }

      case 'tasks': {
        const result = await getTasks(user.id, date)
        return NextResponse.json({ data: result.data })
      }

      case 'projects': {
        const result = await getMyDayProjects(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'analytics': {
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'start_date and end_date required' }, { status: 400 })
        }
        const result = await getMyDayAnalytics(user.id, startDate, endDate)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('My Day API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch My Day data' },
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
      case 'create-goal': {
        const result = await createGoal(user.id, {
          title: payload.title,
          description: payload.description,
          type: payload.type,
          status: payload.status,
          priority: payload.priority,
          progress: payload.progress,
          target_date: payload.target_date
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-schedule-block': {
        const result = await createScheduleBlock(user.id, {
          title: payload.title,
          description: payload.description,
          start_time: payload.start_time,
          end_time: payload.end_time,
          type: payload.type,
          color: payload.color,
          recurring: payload.recurring,
          recurrence_pattern: payload.recurrence_pattern,
          task_ids: payload.task_ids,
          date: payload.date
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-task': {
        const result = await createTask(user.id, {
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          category: payload.category,
          estimated_time: payload.estimated_time,
          completed: payload.completed,
          start_time: payload.start_time,
          end_time: payload.end_time,
          project_id: payload.project_id,
          tags: payload.tags,
          date: payload.date
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-project': {
        const result = await addProjectToMyDay(user.id, {
          project_id: payload.project_id,
          project_name: payload.project_name,
          status: payload.status,
          priority: payload.priority,
          progress: payload.progress,
          deadline: payload.deadline,
          tasks_count: payload.tasks_count,
          completed_tasks: payload.completed_tasks
        })
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('My Day API error', { error })
    return NextResponse.json(
      { error: 'Failed to process My Day request' },
      { status: 500 }
    )
  }
}
