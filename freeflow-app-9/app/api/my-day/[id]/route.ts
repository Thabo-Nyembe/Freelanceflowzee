/**
 * My Day API - Single Resource Routes
 *
 * PUT - Update goal, schedule block, task, project
 * DELETE - Delete goal, schedule block, task, project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('my-day')
import {
  updateGoal,
  deleteGoal,
  updateScheduleBlock,
  deleteScheduleBlock,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  updateMyDayProject,
  removeProjectFromMyDay
} from '@/lib/my-day-queries'

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
      case 'goal': {
        const result = await updateGoal(user.id, id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'schedule': {
        const result = await updateScheduleBlock(user.id, id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'task': {
        if (action === 'toggle-complete') {
          const result = await toggleTaskComplete(user.id, id)
          return NextResponse.json({ data: result.data })
        } else {
          const result = await updateTask(user.id, id, updates)
          return NextResponse.json({ data: result.data })
        }
      }

      case 'project': {
        const result = await updateMyDayProject(user.id, id, updates)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('My Day API error', { error })
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
    const type = searchParams.get('type') || 'task'

    switch (type) {
      case 'goal': {
        const result = await deleteGoal(user.id, id)
        return NextResponse.json({ success: result.success })
      }

      case 'schedule': {
        const result = await deleteScheduleBlock(user.id, id)
        return NextResponse.json({ success: result.success })
      }

      case 'task': {
        const result = await deleteTask(user.id, id)
        return NextResponse.json({ success: result.success })
      }

      case 'project': {
        const result = await removeProjectFromMyDay(user.id, id)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('My Day API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
