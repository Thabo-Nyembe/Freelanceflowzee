/**
 * My Day API Routes
 *
 * REST endpoints for My Day Feature:
 * GET - List goals, schedule, tasks, projects, analytics
 * POST - Create goal, schedule block, task, project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('my-day')

// ============================================================================
// DEMO USER CONFIGURATION - For legitimate alex@freeflow.io account only
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

// SECURITY: Demo mode bypass removed - users must authenticate properly
function getDemoUserId(session: any): string | null {
  if (!session?.user) {
    return null  // CHANGED: No bypass - require proper authentication
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

import {
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
        // Demo data for showcase - show for all users
        if (true) {
          const today = new Date().toISOString().split('T')[0]
          const demoGoals = [
            {
              id: 'demo-goal-1',
              user_id: user.id,
              title: 'Close 3 new enterprise deals',
              description: 'Target: $300K ARR from Fortune 500 companies',
              type: 'monthly',
              status: 'in_progress',
              priority: 'high',
              progress: 60,
              target_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-goal-2',
              user_id: user.id,
              title: 'Ship AI voice synthesis feature',
              description: 'Complete development, testing, and launch',
              type: 'weekly',
              status: 'in_progress',
              priority: 'high',
              progress: 85,
              target_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-goal-3',
              user_id: user.id,
              title: 'Complete investor deck',
              description: 'Finalize Series A pitch materials',
              type: 'daily',
              status: 'in_progress',
              priority: 'urgent',
              progress: 70,
              target_date: today,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]

          const filtered = goalType
            ? demoGoals.filter(g => g.type === goalType)
            : demoGoals

          return NextResponse.json({ data: filtered })
        }

        const result = await getGoals(user.id, goalType || undefined)
        return NextResponse.json({ data: result.data })
      }

      case 'schedule': {
        // Demo data for showcase - show for all users
        if (true) {
          const demoSchedule = [
            {
              id: 'demo-schedule-1',
              user_id: user.id,
              title: 'Morning Deep Work',
              description: 'Focus time for complex tasks',
              start_time: '08:00',
              end_time: '11:00',
              type: 'focus',
              color: '#6366f1',
              recurring: true,
              recurrence_pattern: 'daily',
              task_ids: [],
              date: date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-schedule-2',
              user_id: user.id,
              title: 'Lunch Break',
              description: 'Healthy meal and walk',
              start_time: '12:00',
              end_time: '13:00',
              type: 'break',
              color: '#10b981',
              recurring: true,
              recurrence_pattern: 'daily',
              task_ids: [],
              date: date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-schedule-3',
              user_id: user.id,
              title: 'Client Meetings',
              description: 'Afternoon client calls and demos',
              start_time: '14:00',
              end_time: '16:00',
              type: 'meeting',
              color: '#f59e0b',
              recurring: false,
              task_ids: [],
              date: date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-schedule-4',
              user_id: user.id,
              title: 'Admin & Email',
              description: 'Process emails and administrative tasks',
              start_time: '16:00',
              end_time: '17:00',
              type: 'admin',
              color: '#8b5cf6',
              recurring: true,
              recurrence_pattern: 'daily',
              task_ids: [],
              date: date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]

          return NextResponse.json({ data: demoSchedule })
        }

        const result = await getSchedule(user.id, date)
        return NextResponse.json({ data: result.data })
      }

      case 'tasks': {
        // Demo data for showcase - show for all users
        if (true) {
          const today = new Date().toISOString().split('T')[0]
          const isToday = date === today

          const demoTasks = isToday ? [
            {
              id: 'demo-task-1',
              user_id: user.id,
              title: 'Review Q1 financial reports',
              description: 'Analyze revenue, expenses, and profit margins for investor meeting',
              priority: 'high',
              category: 'work',
              estimated_time: 60,
              completed: false,
              date: today,
              tags: ['finance', 'urgent', 'investor'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-2',
              user_id: user.id,
              title: 'Team standup meeting',
              description: 'Daily sync with development team',
              priority: 'medium',
              category: 'meeting',
              estimated_time: 15,
              completed: false,
              start_time: '09:00',
              end_time: '09:15',
              date: today,
              tags: ['team', 'daily'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-3',
              user_id: user.id,
              title: 'Update client proposal',
              description: 'Finalize pricing and timeline for Acme Corp project',
              priority: 'high',
              category: 'work',
              estimated_time: 90,
              completed: false,
              date: today,
              tags: ['proposal', 'client', 'acme'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-4',
              user_id: user.id,
              title: 'Code review: Authentication module',
              description: 'Review PR #234 for new OAuth implementation',
              priority: 'medium',
              category: 'work',
              estimated_time: 45,
              completed: true,
              actual_time: 38,
              date: today,
              tags: ['code-review', 'auth', 'completed'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-5',
              user_id: user.id,
              title: 'Prepare investor pitch deck',
              description: 'Update slides with latest metrics and growth projections',
              priority: 'urgent',
              category: 'work',
              estimated_time: 120,
              completed: false,
              date: today,
              tags: ['investor', 'pitch', 'urgent'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-6',
              user_id: user.id,
              title: 'Lunch with Sarah - Product Strategy',
              description: 'Discuss Q2 roadmap and feature prioritization',
              priority: 'medium',
              category: 'meeting',
              estimated_time: 60,
              completed: false,
              start_time: '12:30',
              end_time: '13:30',
              date: today,
              tags: ['strategy', 'product'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ] : []

          return NextResponse.json({ data: demoTasks })
        }

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
