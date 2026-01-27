/**
 * KAZI Platform - Comprehensive Tasks API
 *
 * Full-featured task management with database integration.
 * Supports CRUD operations, time tracking, AI optimization,
 * subtasks, dependencies, and productivity analytics.
 *
 * @module app/api/tasks/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac/rbac-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tasks-api')

// ============================================================================
// TYPES
// ============================================================================

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'work' | 'personal' | 'meeting' | 'break' | 'admin' | 'creative'
  type: 'task' | 'milestone' | 'bug' | 'feature' | 'improvement'
  user_id: string
  project_id: string
  parent_id: string
  assignee_id: string
  reviewer_id: string
  estimated_minutes: number
  actual_minutes: number
  start_date: string
  due_date: string
  completed_at: string
  position: number
  tags: string[]
  labels: string[]
  checklist: ChecklistItem[]
  dependencies: string[]
  blockers: string[]
  attachments: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  created_at: string
}

interface TimeEntry {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time: string
  duration: number
  description: string
  billable: boolean
  created_at: string
}

interface TaskStats {
  total: number
  completed: number
  in_progress: number
  todo: number
  overdue: number
  urgent: number
  total_estimated_minutes: number
  total_actual_minutes: number
  completion_rate: number
}

// ============================================================================
// GET - List Tasks / Get Single Task
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const taskId = searchParams.get('id')
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const assigneeId = searchParams.get('assignee_id')
    const search = searchParams.get('search')
    const dueDate = searchParams.get('due_date')
    const overdue = searchParams.get('overdue')
    const today = searchParams.get('today')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeSubtasks = searchParams.get('include_subtasks') === 'true'
    const includeTimeEntries = searchParams.get('include_time_entries') === 'true'

    // Unauthenticated users get empty data
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        tasks: [],
        stats: {
          total: 0,
          completed: 0,
          in_progress: 0,
          todo: 0,
          overdue: 0,
          urgent: 0,
          total_estimated_minutes: 0,
          total_actual_minutes: 0,
          completion_rate: 0
        },
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      })
    }

    // Use authId for database queries (auth.users FK constraints)
    // Fall back to session.user.id if authId is not available
    const userId = (session.user as any).authId || session.user.id
    const userEmail = session.user.email

    // Demo mode ONLY for demo account (test@kazi.dev)
    const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'

    if (isDemoAccount && !taskId) {
      return NextResponse.json({
        success: true,
        demo: true,
        tasks: getDemoTasks(),
        stats: getDemoStats(),
        pagination: {
          page: 1,
          limit: 50,
          total: 6,
          totalPages: 1
        }
      })
    }

    // Single task fetch
    if (taskId) {
      // Check permission
      const canRead = await checkPermission(userId, 'tasks', 'read', taskId)
      if (!canRead) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        )
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (error || !task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }

      // Get subtasks if requested
      let subtasks: unknown[] = []
      if (includeSubtasks) {
        const { data: subtaskData } = await supabase
          .from('tasks')
          .select('id, title, status, priority, assignee_id, due_date')
          .eq('parent_id', taskId)
          .order('position', { ascending: true })

        subtasks = subtaskData || []
      }

      // Get time entries if requested
      let timeEntries: TimeEntry[] = []
      if (includeTimeEntries) {
        const { data: timeData } = await supabase
          .from('time_entries')
          .select(`
            *,
            user:users(id, name, avatar_url)
          `)
          .eq('task_id', taskId)
          .order('start_time', { ascending: false })

        timeEntries = timeData || []
      }

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId)

      return NextResponse.json({
        success: true,
        task: {
          ...task,
          subtasks,
          time_entries: timeEntries,
          comments_count: commentsCount || 0
        }
      })
    }

    // Build query for task list
    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })

    // Filter by user access (own tasks, assigned tasks, or project member)
    query = query.or(`user_id.eq.${userId},assignee_id.eq.${userId}`)

    // Apply filters
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    if (status && status !== 'all') {
      if (status.includes(',')) {
        query = query.in('status', status.split(','))
      } else {
        query = query.eq('status', status)
      }
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (assigneeId) {
      query = query.eq('assignee_id', assigneeId)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (dueDate) {
      query = query.eq('due_date', dueDate)
    }

    if (overdue === 'true') {
      query = query
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed')
        .neq('status', 'cancelled')
    }

    if (today === 'true') {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      query = query
        .gte('due_date', todayStart.toISOString())
        .lte('due_date', todayEnd.toISOString())
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: tasks, error, count } = await query

    if (error) {
      logger.error('Tasks query error', { error })
      console.error('Tasks query error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    // Get stats
    const stats = await getTaskStats(supabase, userId, projectId || undefined)

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Tasks GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Task / Handle Actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()
    const { action = 'create' } = body

    const supabase = await createClient()

    // Handle different actions
    switch (action) {
      case 'create':
        return handleCreateTask(supabase, userId, body)

      case 'complete':
        return handleCompleteTask(supabase, userId, body)

      case 'start_timer':
        return handleStartTimer(supabase, userId, body)

      case 'stop_timer':
        return handleStopTimer(supabase, userId, body)

      case 'log_time':
        return handleLogTime(supabase, userId, body)

      case 'reorder':
        return handleReorderTasks(supabase, userId, body)

      case 'bulk_update':
        return handleBulkUpdate(supabase, userId, body)

      case 'bulk_delete':
        return handleBulkDelete(supabase, userId, body)

      case 'ai_optimize':
        return handleAIOptimize(supabase, userId, body)

      case 'duplicate':
        return handleDuplicateTask(supabase, userId, body)

      default:
        return handleCreateTask(supabase, userId, body)
    }
  } catch (error) {
    logger.error('Tasks POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Task
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canUpdate = await checkPermission(userId, 'tasks', 'update', id)
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Get current task for comparison
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const allowedFields = [
      'title', 'description', 'status', 'priority', 'category', 'type',
      'project_id', 'parent_id', 'assignee_id', 'reviewer_id',
      'estimated_minutes', 'start_date', 'due_date', 'position',
      'tags', 'labels', 'checklist', 'dependencies', 'blockers',
      'attachments', 'metadata'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Handle status change to completed
    if (updates.status === 'completed' && currentTask.status !== 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else if (updates.status && updates.status !== 'completed' && currentTask.status === 'completed') {
      updateData.completed_at = null
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Task update error', { error })
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Log activity
    await logTaskActivity(supabase, id, userId, 'updated', {
      fields_updated: Object.keys(updateData).filter(k => k !== 'updated_at'),
      old_status: currentTask.status,
      new_status: updates.status
    })

    // Update project progress if task completed
    if (updates.status === 'completed' && currentTask.project_id) {
      await updateProjectProgress(supabase, currentTask.project_id)
    }

    return NextResponse.json({
      success: true,
      task,
      message: 'Task updated successfully'
    })
  } catch (error) {
    logger.error('Tasks PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Task
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).authId || session.user.id
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Check permission
    const canDelete = await checkPermission(userId, 'tasks', 'delete', taskId)
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Get task info for logging
    const { data: task } = await supabase
      .from('tasks')
      .select('title, project_id')
      .eq('id', taskId)
      .single()

    if (permanent) {
      // Delete subtasks first
      await supabase
        .from('tasks')
        .delete()
        .eq('parent_id', taskId)

      // Permanent delete
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        logger.error('Task deletion error', { error })
        return NextResponse.json(
          { error: 'Failed to delete task' },
          { status: 500 }
        )
      }
    } else {
      // Soft delete - mark as cancelled
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) {
        logger.error('Task archive error', { error })
        return NextResponse.json(
          { error: 'Failed to archive task' },
          { status: 500 }
        )
      }
    }

    // Log activity
    await logTaskActivity(supabase, taskId, userId, permanent ? 'deleted' : 'cancelled', {
      task_title: task?.title
    })

    // Update project progress
    if (task?.project_id) {
      await updateProjectProgress(supabase, task.project_id)
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'Task deleted permanently' : 'Task cancelled successfully'
    })
  } catch (error) {
    logger.error('Tasks DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateTask(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  // Check permission
  const canCreate = await checkPermission(userId, 'tasks', 'create')
  if (!canCreate) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  const {
    title,
    description,
    status = 'todo',
    priority = 'medium',
    category = 'work',
    type = 'task',
    project_id,
    parent_id,
    assignee_id,
    reviewer_id,
    estimated_minutes = 60,
    start_date,
    due_date,
    position,
    tags = [],
    labels = [],
    checklist = [],
    dependencies = [],
    metadata = {}
  } = body

  // Validation
  if (!title || (typeof title === 'string' && title.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Task title is required' },
      { status: 400 }
    )
  }

  // Get position if not provided
  let taskPosition = position as number | undefined
  if (taskPosition === undefined) {
    const { data: lastTask } = await supabase
      .from('tasks')
      .select('position')
      .eq('user_id', userId)
      .is('parent_id', parent_id || null)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    taskPosition = (lastTask?.position || 0) + 1
  }

  // Create task
  const taskData = {
    title: typeof title === 'string' ? title.trim() : title,
    description: description || '',
    status,
    priority,
    category,
    type,
    user_id: userId,
    project_id: project_id || null,
    parent_id: parent_id || null,
    assignee_id: assignee_id || userId,
    reviewer_id: reviewer_id || null,
    estimated_minutes,
    actual_minutes: 0,
    start_date: start_date || null,
    due_date: due_date || null,
    completed_at: null,
    position: taskPosition,
    tags: tags || [],
    labels: labels || [],
    checklist: checklist || [],
    dependencies: dependencies || [],
    blockers: [],
    attachments: [],
    metadata: metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    logger.error('Task creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }

  // Log activity
  await logTaskActivity(supabase, task.id, userId, 'created', {
    task_title: task.title,
    project_id
  })

  return NextResponse.json({
    success: true,
    task,
    message: 'Task created successfully'
  }, { status: 201 })
}

async function handleCompleteTask(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_id, completed = true } = body

  if (!task_id) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    )
  }

  // Check permission
  const canUpdate = await checkPermission(userId, 'tasks', 'update', task_id as string)
  if (!canUpdate) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }

  const status = completed ? 'completed' : 'todo'
  const completedAt = completed ? new Date().toISOString() : null

  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      status,
      completed_at: completedAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', task_id)
    .select()
    .single()

  if (error) {
    logger.error('Task completion error', { error })
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }

  // Update project progress
  if (task.project_id) {
    await updateProjectProgress(supabase, task.project_id)
  }

  // Log activity
  await logTaskActivity(supabase, task_id as string, userId, completed ? 'completed' : 'reopened', {
    task_title: task.title
  })

  return NextResponse.json({
    success: true,
    task,
    message: completed ? 'Task completed!' : 'Task reopened',
    celebration: completed ? {
      message: 'Great job! Task completed!',
      points: 10
    } : undefined
  })
}

async function handleStartTimer(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_id, description } = body

  if (!task_id) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    )
  }

  // Check for existing running timer
  const { data: runningTimer } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', userId)
    .is('end_time', null)
    .single()

  if (runningTimer) {
    return NextResponse.json(
      { error: 'You already have a running timer. Stop it first.' },
      { status: 400 }
    )
  }

  const { data: timeEntry, error } = await supabase
    .from('time_entries')
    .insert({
      task_id,
      user_id: userId,
      start_time: new Date().toISOString(),
      description: description || '',
      billable: true,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Timer start error', { error })
    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    )
  }

  // Update task status to in_progress
  await supabase
    .from('tasks')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', task_id)
    .eq('status', 'todo')

  return NextResponse.json({
    success: true,
    time_entry: timeEntry,
    message: 'Timer started'
  })
}

async function handleStopTimer(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { time_entry_id, task_id } = body

  let query = supabase
    .from('time_entries')
    .select('*')
    .eq('user_id', userId)
    .is('end_time', null)

  if (time_entry_id) {
    query = query.eq('id', time_entry_id)
  } else if (task_id) {
    query = query.eq('task_id', task_id)
  }

  const { data: runningTimer } = await query.single()

  if (!runningTimer) {
    return NextResponse.json(
      { error: 'No running timer found' },
      { status: 404 }
    )
  }

  const endTime = new Date()
  const startTime = new Date(runningTimer.start_time)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000) // minutes

  const { data: timeEntry, error } = await supabase
    .from('time_entries')
    .update({
      end_time: endTime.toISOString(),
      duration
    })
    .eq('id', runningTimer.id)
    .select()
    .single()

  if (error) {
    logger.error('Timer stop error', { error })
    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    )
  }

  // Update task actual_minutes
  await supabase.rpc('increment_task_actual_minutes', {
    p_task_id: runningTimer.task_id,
    p_minutes: duration
  }).catch(() => {
    // Fallback if RPC doesn't exist
    supabase
      .from('tasks')
      .update({
        actual_minutes: supabase.rpc('coalesce', { value: 'actual_minutes', default_value: 0 }) as unknown as number + duration
      })
      .eq('id', runningTimer.task_id)
  })

  return NextResponse.json({
    success: true,
    time_entry: timeEntry,
    duration,
    message: `Timer stopped. Duration: ${duration} minutes`
  })
}

async function handleLogTime(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_id, duration, description, start_time, end_time, billable = true } = body

  if (!task_id || !duration) {
    return NextResponse.json(
      { error: 'Task ID and duration are required' },
      { status: 400 }
    )
  }

  const startTimeVal = start_time || new Date(Date.now() - (duration as number) * 60000).toISOString()
  const endTimeVal = end_time || new Date().toISOString()

  const { data: timeEntry, error } = await supabase
    .from('time_entries')
    .insert({
      task_id,
      user_id: userId,
      start_time: startTimeVal,
      end_time: endTimeVal,
      duration,
      description: description || '',
      billable,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Time log error', { error })
    return NextResponse.json(
      { error: 'Failed to log time' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    time_entry: timeEntry,
    message: `Logged ${duration} minutes`
  })
}

async function handleReorderTasks(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_orders } = body // Array of { id, position }

  if (!Array.isArray(task_orders) || task_orders.length === 0) {
    return NextResponse.json(
      { error: 'Task orders are required' },
      { status: 400 }
    )
  }

  // Update positions
  for (const order of task_orders) {
    await supabase
      .from('tasks')
      .update({ position: order.position, updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('user_id', userId)
  }

  return NextResponse.json({
    success: true,
    message: 'Tasks reordered successfully'
  })
}

async function handleBulkUpdate(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_ids, updates } = body

  if (!Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json(
      { error: 'Task IDs are required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  const allowedBulkFields = ['status', 'priority', 'category', 'assignee_id', 'due_date', 'tags', 'labels']
  for (const field of allowedBulkFields) {
    if ((updates as Record<string, unknown>)?.[field] !== undefined) {
      updateData[field] = (updates as Record<string, unknown>)[field]
    }
  }

  // Handle completion
  if ((updates as Record<string, unknown>)?.status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .in('id', task_ids)
    .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)

  if (error) {
    logger.error('Bulk update error', { error })
    return NextResponse.json(
      { error: 'Failed to update tasks' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    updated_count: task_ids.length,
    message: `${task_ids.length} tasks updated successfully`
  })
}

async function handleBulkDelete(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_ids, permanent = false } = body

  if (!Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json(
      { error: 'Task IDs are required' },
      { status: 400 }
    )
  }

  if (permanent) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', task_ids)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)

    if (error) {
      logger.error('Bulk delete error', { error })
      return NextResponse.json(
        { error: 'Failed to delete tasks' },
        { status: 500 }
      )
    }
  } else {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .in('id', task_ids)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)

    if (error) {
      logger.error('Bulk cancel error', { error })
      return NextResponse.json(
        { error: 'Failed to cancel tasks' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({
    success: true,
    deleted_count: task_ids.length,
    message: `${task_ids.length} tasks ${permanent ? 'deleted' : 'cancelled'} successfully`
  })
}

async function handleAIOptimize(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { date } = body
  const targetDate = date ? new Date(date as string) : new Date()

  // Get user's tasks for the day
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
    .neq('status', 'completed')
    .neq('status', 'cancelled')
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true })

  // AI-powered schedule optimization (simplified version)
  const urgentTasks = tasks?.filter(t => t.priority === 'urgent') || []
  const highTasks = tasks?.filter(t => t.priority === 'high') || []
  const mediumTasks = tasks?.filter(t => t.priority === 'medium') || []
  const lowTasks = tasks?.filter(t => t.priority === 'low') || []

  const timeBlocks = [
    {
      id: 'block_1',
      title: 'Deep Focus: Urgent & High Priority',
      start: '09:00',
      end: '11:00',
      type: 'focus',
      tasks: [...urgentTasks, ...highTasks].slice(0, 3).map(t => t.id),
      reason: 'Peak productivity hours for challenging tasks',
      energyLevel: 'high'
    },
    {
      id: 'block_2',
      title: 'Communication & Meetings',
      start: '11:00',
      end: '12:30',
      type: 'meeting',
      tasks: tasks?.filter(t => t.category === 'meeting').slice(0, 2).map(t => t.id) || [],
      reason: 'Good time for collaborative work',
      energyLevel: 'medium'
    },
    {
      id: 'block_3',
      title: 'Creative Work',
      start: '14:00',
      end: '16:00',
      type: 'focus',
      tasks: mediumTasks.slice(0, 3).map(t => t.id),
      reason: 'Post-lunch energy for creative tasks',
      energyLevel: 'medium-high'
    },
    {
      id: 'block_4',
      title: 'Review & Admin',
      start: '16:00',
      end: '17:00',
      type: 'admin',
      tasks: lowTasks.slice(0, 3).map(t => t.id),
      reason: 'Lower energy suitable for routine tasks',
      energyLevel: 'medium'
    }
  ]

  const totalEstimated = tasks?.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0) || 0

  return NextResponse.json({
    success: true,
    schedule: {
      date: targetDate.toISOString().split('T')[0],
      timeBlocks,
      insights: {
        totalTasks: tasks?.length || 0,
        totalEstimatedMinutes: totalEstimated,
        urgentCount: urgentTasks.length,
        recommendations: [
          urgentTasks.length > 3 ? 'Consider delegating some urgent tasks' : null,
          totalEstimated > 480 ? 'Your day is overloaded. Prioritize ruthlessly.' : null,
          'Take breaks between focus blocks for optimal performance'
        ].filter(Boolean)
      },
      aiConfidence: 85
    },
    message: 'AI-optimized schedule generated'
  })
}

async function handleDuplicateTask(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_id, include_subtasks = false } = body

  if (!task_id) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    )
  }

  // Get original task
  const { data: original, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', task_id)
    .single()

  if (fetchError || !original) {
    return NextResponse.json(
      { error: 'Task not found' },
      { status: 404 }
    )
  }

  // Create duplicate
  const duplicateData = {
    ...original,
    id: undefined,
    title: `${original.title} (Copy)`,
    status: 'todo',
    completed_at: null,
    actual_minutes: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  delete duplicateData.id

  const { data: duplicate, error: createError } = await supabase
    .from('tasks')
    .insert(duplicateData)
    .select()
    .single()

  if (createError) {
    logger.error('Task duplication error', { error: createError })
    return NextResponse.json(
      { error: 'Failed to duplicate task' },
      { status: 500 }
    )
  }

  // Duplicate subtasks if requested
  if (include_subtasks) {
    const { data: subtasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_id', task_id)

    if (subtasks?.length) {
      const subtaskDuplicates = subtasks.map(st => ({
        ...st,
        id: undefined,
        parent_id: duplicate.id,
        status: 'todo',
        completed_at: null,
        actual_minutes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      for (const st of subtaskDuplicates) {
        delete st.id
      }

      await supabase.from('tasks').insert(subtaskDuplicates)
    }
  }

  return NextResponse.json({
    success: true,
    task: duplicate,
    message: 'Task duplicated successfully'
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getTaskStats(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  projectId?: string
): Promise<TaskStats> {
  try {
    let baseQuery = supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)

    if (projectId) {
      baseQuery = baseQuery.eq('project_id', projectId)
    }

    const { count: total } = await baseQuery

    const { count: completed } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .eq('status', 'completed')
      .match(projectId ? { project_id: projectId } : {})

    const { count: inProgress } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .eq('status', 'in_progress')
      .match(projectId ? { project_id: projectId } : {})

    const { count: todo } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .eq('status', 'todo')
      .match(projectId ? { project_id: projectId } : {})

    const { count: overdue } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .lt('due_date', new Date().toISOString())
      .not('status', 'in', '("completed","cancelled")')
      .match(projectId ? { project_id: projectId } : {})

    const { count: urgent } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .eq('priority', 'urgent')
      .not('status', 'in', '("completed","cancelled")')
      .match(projectId ? { project_id: projectId } : {})

    // Get time totals
    const { data: timeTasks } = await supabase
      .from('tasks')
      .select('estimated_minutes, actual_minutes')
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .match(projectId ? { project_id: projectId } : {})

    const totalEstimated = timeTasks?.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0) || 0
    const totalActual = timeTasks?.reduce((sum, t) => sum + (t.actual_minutes || 0), 0) || 0

    return {
      total: total || 0,
      completed: completed || 0,
      in_progress: inProgress || 0,
      todo: todo || 0,
      overdue: overdue || 0,
      urgent: urgent || 0,
      total_estimated_minutes: totalEstimated,
      total_actual_minutes: totalActual,
      completion_rate: total ? Math.round(((completed || 0) / total) * 100) : 0
    }
  } catch (error) {
    logger.error('Error getting task stats', { error })
    return {
      total: 0,
      completed: 0,
      in_progress: 0,
      todo: 0,
      overdue: 0,
      urgent: 0,
      total_estimated_minutes: 0,
      total_actual_minutes: 0,
      completion_rate: 0
    }
  }
}

async function updateProjectProgress(
  supabase: ReturnType<typeof createClient>,
  projectId: string
) {
  try {
    const { count: total } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .not('status', 'eq', 'cancelled')

    const { count: completed } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', 'completed')

    const progress = total ? Math.round(((completed || 0) / total) * 100) : 0

    await supabase
      .from('projects')
      .update({
        progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
  } catch (error) {
    logger.error('Error updating project progress', { error })
  }
}

async function logTaskActivity(
  supabase: ReturnType<typeof createClient>,
  taskId: string,
  userId: string,
  action: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('activity_log').insert({
      entity_type: 'task',
      entity_id: taskId,
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error logging task activity', { error })
  }
}

function getDemoTasks(): Partial<Task>[] {
  return [
    {
      id: 'demo-1',
      title: 'Complete logo design mockups',
      description: 'Create 3 logo variations for TechCorp client',
      status: 'in_progress',
      priority: 'high',
      category: 'work',
      estimated_minutes: 120,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design', 'branding'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: 'Review brand guidelines',
      description: 'Final review before client presentation',
      status: 'completed',
      priority: 'medium',
      category: 'work',
      estimated_minutes: 45,
      tags: ['review'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      title: 'Client call - Project Alpha',
      description: 'Weekly sync with stakeholders',
      status: 'todo',
      priority: 'urgent',
      category: 'meeting',
      estimated_minutes: 60,
      due_date: new Date().toISOString(),
      tags: ['meeting', 'client'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-4',
      title: 'Update portfolio website',
      description: 'Add recent projects and testimonials',
      status: 'todo',
      priority: 'low',
      category: 'personal',
      estimated_minutes: 90,
      tags: ['portfolio', 'website'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-5',
      title: 'Send invoice to Design Studio',
      description: 'Invoice for completed branding project',
      status: 'todo',
      priority: 'medium',
      category: 'admin',
      estimated_minutes: 15,
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['invoice', 'billing'],
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-6',
      title: 'Prepare presentation slides',
      description: 'Quarterly review presentation',
      status: 'blocked',
      priority: 'high',
      category: 'work',
      estimated_minutes: 180,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['presentation'],
      created_at: new Date().toISOString()
    }
  ]
}

function getDemoStats(): TaskStats {
  return {
    total: 6,
    completed: 1,
    in_progress: 1,
    todo: 3,
    overdue: 0,
    urgent: 1,
    total_estimated_minutes: 510,
    total_actual_minutes: 45,
    completion_rate: 17
  }
}
