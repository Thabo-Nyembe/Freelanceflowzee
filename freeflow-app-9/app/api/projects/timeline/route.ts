/**
 * KAZI Platform - Project Timeline & Gantt API
 *
 * World-class timeline management:
 * - Gantt chart data generation
 * - Task scheduling with dependencies
 * - Critical path analysis
 * - Resource allocation timeline
 * - Milestone tracking
 * - Progress visualization
 * - Timeline export (iCal, PDF)
 *
 * @module app/api/projects/timeline/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac/rbac-service'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('projects-timeline')

// ============================================================================
// TYPES
// ============================================================================

interface TimelineTask {
  id: string
  title: string
  start: string
  end: string
  progress: number
  dependencies: string[]
  assignee_id: string | null
  assignee: { id: string; name: string; avatar_url: string } | null
  status: string
  priority: string
  type: 'task' | 'milestone' | 'phase' | 'project'
  color: string
  is_critical: boolean
  is_overdue: boolean
  children?: TimelineTask[]
}

interface TimelinePhase {
  id: string
  name: string
  start: string
  end: string
  color: string
  progress: number
  tasks: TimelineTask[]
}

interface TimelineMilestone {
  id: string
  name: string
  date: string
  status: 'pending' | 'completed' | 'overdue'
  deliverables: string[]
  payment_percentage: number | null
}

interface ResourceAllocation {
  user_id: string
  user: { id: string; name: string; avatar_url: string }
  allocated_hours: number
  completed_hours: number
  tasks_count: number
  availability: number
  utilization: number
}

interface CriticalPath {
  tasks: string[]
  total_duration_days: number
  slack_time: number
  bottlenecks: { task_id: string; delay_risk: number }[]
}

// ============================================================================
// DATABASE CLIENT - Using server-side Supabase client
// ============================================================================

// ============================================================================
// GET - Get Timeline Data
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    const projectId = searchParams.get('project_id')
    const viewType = searchParams.get('view') || 'gantt' // gantt, calendar, list, kanban
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const includeResources = searchParams.get('include_resources') === 'true'
    const includeCriticalPath = searchParams.get('include_critical_path') === 'true'
    const groupBy = searchParams.get('group_by') || 'none' // none, phase, assignee, status

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        timeline: getDemoTimeline(),
        milestones: getDemoMilestones(),
        stats: getDemoTimelineStats()
      })
    }

    const userId = (session.user as { authId?: string; id: string }).authId || session.user.id

    // Check permission
    const canRead = await checkPermission(userId, 'projects', 'read', projectId)
    if (!canRead) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Get project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get tasks with dependencies
    let taskQuery = supabase
      .from('tasks')
      .select(`
        *,
        assignee:users!tasks_assignee_id_fkey(id, name, avatar_url)
      `)
      .eq('project_id', projectId)
      .neq('status', 'cancelled')
      .order('position', { ascending: true })

    if (startDate) {
      taskQuery = taskQuery.gte('due_date', startDate)
    }
    if (endDate) {
      taskQuery = taskQuery.lte('start_date', endDate)
    }

    const { data: tasks, error: tasksError } = await taskQuery

    if (tasksError) {
      logger.error('Tasks query error', { error: tasksError })
      throw tasksError
    }

    // Get milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })

    // Get phases if any
    const { data: phases } = await supabase
      .from('project_phases')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })

    // Transform to timeline format
    const timelineTasks = transformToTimelineTasks(tasks || [], project)
    const timelineMilestones = transformToTimelineMilestones(milestones || [])
    const timelinePhases = transformToTimelinePhases(phases || [], tasks || [])

    // Group tasks if requested
    let groupedData: Record<string, TimelineTask[]> | null = null
    if (groupBy !== 'none') {
      groupedData = groupTasks(timelineTasks, groupBy)
    }

    // Calculate critical path if requested
    let criticalPath: CriticalPath | null = null
    if (includeCriticalPath) {
      criticalPath = calculateCriticalPath(tasks || [], project)
    }

    // Get resource allocations if requested
    let resources: ResourceAllocation[] | null = null
    if (includeResources) {
      resources = await getResourceAllocations(supabase, projectId, tasks || [])
    }

    // Calculate timeline stats
    const stats = calculateTimelineStats(tasks || [], milestones || [], project)

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        start_date: project.start_date,
        due_date: project.due_date,
        progress: project.progress
      },
      timeline: {
        tasks: groupedData || timelineTasks,
        phases: timelinePhases,
        milestones: timelineMilestones
      },
      criticalPath,
      resources,
      stats,
      view: viewType
    })
  } catch (error) {
    logger.error('Timeline GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Timeline Actions
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

    const userId = (session.user as { authId?: string; id: string }).authId || session.user.id
    const body = await request.json()
    const { action, project_id } = body

    if (!project_id) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check permission
    const canUpdate = await checkPermission(userId, 'projects', 'update', project_id)
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    switch (action) {
      case 'update_task_dates':
        return handleUpdateTaskDates(supabase, userId, body)

      case 'update_dependencies':
        return handleUpdateDependencies(supabase, userId, body)

      case 'auto_schedule':
        return handleAutoSchedule(supabase, userId, body)

      case 'shift_timeline':
        return handleShiftTimeline(supabase, userId, body)

      case 'create_phase':
        return handleCreatePhase(supabase, userId, body)

      case 'export':
        return handleExportTimeline(supabase, userId, body)

      case 'create_baseline':
        return handleCreateBaseline(supabase, userId, body)

      case 'compare_baseline':
        return handleCompareBaseline(supabase, userId, body)

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Timeline POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleUpdateTaskDates(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_id, start_date, due_date, cascade = false } = body

  if (!task_id) {
    return NextResponse.json(
      { error: 'task_id is required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  if (start_date) updateData.start_date = start_date
  if (due_date) updateData.due_date = due_date

  const { data: task, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', task_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  // If cascade, update dependent tasks
  if (cascade && due_date) {
    const { data: dependentTasks } = await supabase
      .from('tasks')
      .select('id, start_date, due_date, dependencies')
      .contains('dependencies', [task_id])

    if (dependentTasks?.length) {
      const newDueDate = new Date(due_date as string)

      for (const depTask of dependentTasks) {
        const depStart = new Date(depTask.start_date || depTask.due_date)
        if (depStart <= newDueDate) {
          // Shift dependent task
          const duration = depTask.due_date && depTask.start_date
            ? new Date(depTask.due_date).getTime() - new Date(depTask.start_date).getTime()
            : 86400000 // 1 day default

          const newDepStart = new Date(newDueDate.getTime() + 86400000) // Next day
          const newDepEnd = new Date(newDepStart.getTime() + duration)

          await supabase
            .from('tasks')
            .update({
              start_date: newDepStart.toISOString(),
              due_date: newDepEnd.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', depTask.id)
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    task,
    cascaded: cascade,
    message: 'Task dates updated'
  })
}

async function handleUpdateDependencies(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { task_id, dependencies } = body

  if (!task_id) {
    return NextResponse.json(
      { error: 'task_id is required' },
      { status: 400 }
    )
  }

  // Validate no circular dependencies
  if (Array.isArray(dependencies) && dependencies.includes(task_id)) {
    return NextResponse.json(
      { error: 'Task cannot depend on itself' },
      { status: 400 }
    )
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      dependencies: dependencies || [],
      updated_at: new Date().toISOString()
    })
    .eq('id', task_id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return NextResponse.json({
    success: true,
    task,
    message: 'Dependencies updated'
  })
}

async function handleAutoSchedule(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, start_date, respect_dependencies = true } = body

  // Get all tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', project_id)
    .neq('status', 'cancelled')
    .order('position', { ascending: true })

  if (!tasks?.length) {
    return NextResponse.json({
      success: true,
      message: 'No tasks to schedule'
    })
  }

  // Build dependency graph and schedule
  const projectStart = start_date ? new Date(start_date as string) : new Date()
  const scheduled = scheduleTasksWithDependencies(tasks, projectStart, respect_dependencies as boolean)

  // Update tasks with new dates
  for (const task of scheduled) {
    await supabase
      .from('tasks')
      .update({
        start_date: task.start_date,
        due_date: task.due_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)
  }

  // Update project end date
  const latestEnd = scheduled.reduce((latest, task) => {
    const taskEnd = new Date(task.due_date)
    return taskEnd > latest ? taskEnd : latest
  }, projectStart)

  await supabase
    .from('projects')
    .update({
      due_date: latestEnd.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', project_id)

  return NextResponse.json({
    success: true,
    scheduled_count: scheduled.length,
    project_end_date: latestEnd.toISOString(),
    message: 'Tasks auto-scheduled'
  })
}

async function handleShiftTimeline(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, shift_days, direction = 'forward' } = body

  if (!shift_days || typeof shift_days !== 'number') {
    return NextResponse.json(
      { error: 'shift_days is required and must be a number' },
      { status: 400 }
    )
  }

  const shiftMs = (direction === 'forward' ? 1 : -1) * shift_days * 86400000

  // Get all tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, start_date, due_date')
    .eq('project_id', project_id)

  // Update each task
  for (const task of tasks || []) {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (task.start_date) {
      updates.start_date = new Date(new Date(task.start_date).getTime() + shiftMs).toISOString()
    }
    if (task.due_date) {
      updates.due_date = new Date(new Date(task.due_date).getTime() + shiftMs).toISOString()
    }

    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', task.id)
  }

  // Update project dates
  const { data: project } = await supabase
    .from('projects')
    .select('start_date, due_date')
    .eq('id', project_id)
    .single()

  if (project) {
    await supabase
      .from('projects')
      .update({
        start_date: project.start_date
          ? new Date(new Date(project.start_date).getTime() + shiftMs).toISOString()
          : null,
        due_date: project.due_date
          ? new Date(new Date(project.due_date).getTime() + shiftMs).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
  }

  // Update milestones
  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, due_date')
    .eq('project_id', project_id)

  for (const ms of milestones || []) {
    if (ms.due_date) {
      await supabase
        .from('milestones')
        .update({
          due_date: new Date(new Date(ms.due_date).getTime() + shiftMs).toISOString()
        })
        .eq('id', ms.id)
    }
  }

  return NextResponse.json({
    success: true,
    shifted_days: shift_days,
    direction,
    tasks_updated: tasks?.length || 0,
    message: `Timeline shifted ${shift_days} days ${direction}`
  })
}

async function handleCreatePhase(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, name, description, color, start_date, end_date, position } = body

  if (!name) {
    return NextResponse.json(
      { error: 'Phase name is required' },
      { status: 400 }
    )
  }

  // Get position if not provided
  let phasePosition = position
  if (phasePosition === undefined) {
    const { data: lastPhase } = await supabase
      .from('project_phases')
      .select('position')
      .eq('project_id', project_id)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    phasePosition = (lastPhase?.position || 0) + 1
  }

  const { data: phase, error } = await supabase
    .from('project_phases')
    .insert({
      project_id,
      name,
      description: description || '',
      color: color || '#3B82F6',
      start_date: start_date || null,
      end_date: end_date || null,
      position: phasePosition,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Phase creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    phase,
    message: 'Phase created'
  }, { status: 201 })
}

async function handleExportTimeline(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, format = 'ical' } = body

  // Get project and tasks
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .single()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', project_id)
    .neq('status', 'cancelled')

  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', project_id)

  if (format === 'ical') {
    const icalData = generateICalendar(project, tasks || [], milestones || [])
    return NextResponse.json({
      success: true,
      format: 'ical',
      data: icalData,
      filename: `${project?.name || 'project'}-timeline.ics`,
      mime_type: 'text/calendar'
    })
  }

  if (format === 'json') {
    return NextResponse.json({
      success: true,
      format: 'json',
      data: {
        project,
        tasks,
        milestones
      },
      filename: `${project?.name || 'project'}-timeline.json`
    })
  }

  return NextResponse.json({
    success: true,
    format,
    message: `Export format ${format} not yet implemented`
  })
}

async function handleCreateBaseline(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, name, description } = body

  // Get current state
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .single()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, start_date, due_date, status, estimated_minutes')
    .eq('project_id', project_id)

  const { data: milestones } = await supabase
    .from('milestones')
    .select('id, name, due_date, status')
    .eq('project_id', project_id)

  const baselineData = {
    project_id,
    name: name || `Baseline ${new Date().toISOString().split('T')[0]}`,
    description: description || '',
    user_id: userId,
    snapshot: {
      project: {
        start_date: project?.start_date,
        due_date: project?.due_date,
        progress: project?.progress,
        budget: project?.budget
      },
      tasks: tasks || [],
      milestones: milestones || []
    },
    created_at: new Date().toISOString()
  }

  const { data: baseline, error } = await supabase
    .from('project_baselines')
    .insert(baselineData)
    .select()
    .single()

  if (error) {
    logger.error('Baseline creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create baseline' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    baseline,
    message: 'Baseline created'
  }, { status: 201 })
}

async function handleCompareBaseline(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { project_id, baseline_id } = body

  if (!baseline_id) {
    return NextResponse.json(
      { error: 'baseline_id is required' },
      { status: 400 }
    )
  }

  // Get baseline
  const { data: baseline } = await supabase
    .from('project_baselines')
    .select('*')
    .eq('id', baseline_id)
    .single()

  if (!baseline) {
    return NextResponse.json(
      { error: 'Baseline not found' },
      { status: 404 }
    )
  }

  // Get current state
  const { data: currentTasks } = await supabase
    .from('tasks')
    .select('id, title, start_date, due_date, status, estimated_minutes')
    .eq('project_id', project_id)

  const { data: currentProject } = await supabase
    .from('projects')
    .select('start_date, due_date, progress, budget')
    .eq('id', project_id)
    .single()

  // Compare
  const comparison = {
    baseline_date: baseline.created_at,
    project: {
      baseline: baseline.snapshot.project,
      current: currentProject,
      variance: {
        schedule_days: calculateDaysDiff(
          baseline.snapshot.project.due_date,
          currentProject?.due_date
        ),
        progress_diff: (currentProject?.progress || 0) - (baseline.snapshot.project.progress || 0),
        budget_variance: (currentProject?.budget || 0) - (baseline.snapshot.project.budget || 0)
      }
    },
    tasks: {
      total_baseline: baseline.snapshot.tasks.length,
      total_current: currentTasks?.length || 0,
      added: (currentTasks || []).filter(
        t => !baseline.snapshot.tasks.find((bt: { id: string }) => bt.id === t.id)
      ).length,
      removed: baseline.snapshot.tasks.filter(
        (bt: { id: string }) => !(currentTasks || []).find(t => t.id === bt.id)
      ).length,
      schedule_variances: (currentTasks || []).map(task => {
        const baselineTask = baseline.snapshot.tasks.find((bt: { id: string }) => bt.id === task.id)
        if (!baselineTask) return null
        return {
          task_id: task.id,
          title: task.title,
          variance_days: calculateDaysDiff(baselineTask.due_date, task.due_date)
        }
      }).filter(Boolean)
    }
  }

  return NextResponse.json({
    success: true,
    comparison
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function transformToTimelineTasks(tasks: Record<string, unknown>[], project: Record<string, unknown>): TimelineTask[] {
  const projectStart = project.start_date ? new Date(project.start_date as string) : new Date()
  const projectEnd = project.due_date ? new Date(project.due_date as string) : new Date()

  return tasks.map(task => {
    const taskStart = task.start_date ? new Date(task.start_date as string) : projectStart
    const taskEnd = task.due_date ? new Date(task.due_date as string) : new Date(taskStart.getTime() + 86400000)
    const isOverdue = task.status !== 'completed' && taskEnd < new Date()

    return {
      id: task.id as string,
      title: task.title as string,
      start: taskStart.toISOString(),
      end: taskEnd.toISOString(),
      progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 50 : 0,
      dependencies: (task.dependencies as string[]) || [],
      assignee_id: task.assignee_id as string | null,
      assignee: task.assignee as { id: string; name: string; avatar_url: string } | null,
      status: task.status as string,
      priority: task.priority as string,
      type: 'task',
      color: getStatusColor(task.status as string),
      is_critical: false, // Will be set by critical path analysis
      is_overdue: isOverdue
    }
  })
}

function transformToTimelineMilestones(milestones: Record<string, unknown>[]): TimelineMilestone[] {
  return milestones.map(ms => {
    const dueDate = ms.due_date ? new Date(ms.due_date as string) : new Date()
    const isOverdue = ms.status !== 'completed' && dueDate < new Date()

    return {
      id: ms.id as string,
      name: ms.name as string,
      date: dueDate.toISOString(),
      status: isOverdue ? 'overdue' : (ms.status as 'pending' | 'completed'),
      deliverables: (ms.deliverables as string[]) || [],
      payment_percentage: ms.payment_percentage as number | null
    }
  })
}

function transformToTimelinePhases(phases: Record<string, unknown>[], tasks: Record<string, unknown>[]): TimelinePhase[] {
  return phases.map(phase => {
    const phaseTasks = tasks.filter(t => t.phase_id === phase.id)
    const completedTasks = phaseTasks.filter(t => t.status === 'completed')

    return {
      id: phase.id as string,
      name: phase.name as string,
      start: phase.start_date as string,
      end: phase.end_date as string,
      color: phase.color as string || '#3B82F6',
      progress: phaseTasks.length ? Math.round((completedTasks.length / phaseTasks.length) * 100) : 0,
      tasks: transformToTimelineTasks(phaseTasks, { start_date: phase.start_date, due_date: phase.end_date })
    }
  })
}

function groupTasks(tasks: TimelineTask[], groupBy: string): Record<string, TimelineTask[]> {
  const grouped: Record<string, TimelineTask[]> = {}

  tasks.forEach(task => {
    let key: string

    switch (groupBy) {
      case 'assignee':
        key = task.assignee?.name || 'Unassigned'
        break
      case 'status':
        key = task.status
        break
      case 'priority':
        key = task.priority
        break
      default:
        key = 'All Tasks'
    }

    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(task)
  })

  return grouped
}

function calculateCriticalPath(tasks: Record<string, unknown>[], project: Record<string, unknown>): CriticalPath {
  // Simplified critical path calculation
  const sortedTasks = [...tasks].sort((a, b) => {
    const aEnd = new Date(a.due_date as string || 0).getTime()
    const bEnd = new Date(b.due_date as string || 0).getTime()
    return bEnd - aEnd
  })

  const criticalTasks: string[] = []
  const bottlenecks: { task_id: string; delay_risk: number }[] = []

  // Tasks on critical path have dependencies or are near deadline
  sortedTasks.forEach(task => {
    const deps = (task.dependencies as string[]) || []
    const dueDate = task.due_date ? new Date(task.due_date as string) : null
    const projectEnd = project.due_date ? new Date(project.due_date as string) : null

    if (deps.length > 0 || (dueDate && projectEnd && dueDate >= projectEnd)) {
      criticalTasks.push(task.id as string)
    }

    // Check for bottlenecks (overdue or high dependency count)
    if (task.status !== 'completed') {
      const delayRisk = deps.length * 20 + (task.priority === 'urgent' ? 30 : 0)
      if (delayRisk > 30) {
        bottlenecks.push({ task_id: task.id as string, delay_risk: Math.min(delayRisk, 100) })
      }
    }
  })

  const projectStart = project.start_date ? new Date(project.start_date as string) : new Date()
  const projectEnd = project.due_date ? new Date(project.due_date as string) : new Date()

  return {
    tasks: criticalTasks,
    total_duration_days: Math.ceil((projectEnd.getTime() - projectStart.getTime()) / 86400000),
    slack_time: 0, // Would need more complex calculation
    bottlenecks
  }
}

async function getResourceAllocations(
  supabase: any,
  projectId: string,
  tasks: Record<string, unknown>[]
): Promise<ResourceAllocation[]> {
  // Group tasks by assignee
  const assigneeMap = new Map<string, Record<string, unknown>[]>()

  tasks.forEach(task => {
    const assigneeId = task.assignee_id as string
    if (assigneeId) {
      if (!assigneeMap.has(assigneeId)) {
        assigneeMap.set(assigneeId, [])
      }
      assigneeMap.get(assigneeId)!.push(task)
    }
  })

  const allocations: ResourceAllocation[] = []

  for (const [userId, userTasks] of assigneeMap) {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single()

    if (!user) continue

    const allocatedHours = userTasks.reduce((sum, t) => sum + ((t.estimated_minutes as number) || 60) / 60, 0)
    const completedHours = userTasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + ((t.actual_minutes as number) || (t.estimated_minutes as number) || 60) / 60, 0)

    allocations.push({
      user_id: userId,
      user: user as { id: string; name: string; avatar_url: string },
      allocated_hours: Math.round(allocatedHours),
      completed_hours: Math.round(completedHours),
      tasks_count: userTasks.length,
      availability: 40, // Default 40 hours/week
      utilization: Math.round((allocatedHours / 40) * 100)
    })
  }

  return allocations
}

function calculateTimelineStats(tasks: Record<string, unknown>[], milestones: Record<string, unknown>[], project: Record<string, unknown>) {
  const now = new Date()
  const projectEnd = project.due_date ? new Date(project.due_date as string) : now

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const overdueTasks = tasks.filter(t =>
    t.status !== 'completed' &&
    t.due_date &&
    new Date(t.due_date as string) < now
  ).length

  const totalMilestones = milestones.length
  const completedMilestones = milestones.filter(m => m.status === 'completed').length

  const daysRemaining = Math.max(0, Math.ceil((projectEnd.getTime() - now.getTime()) / 86400000))

  return {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    overdue_tasks: overdueTasks,
    completion_rate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    total_milestones: totalMilestones,
    completed_milestones: completedMilestones,
    days_remaining: daysRemaining,
    on_track: overdueTasks === 0,
    health_score: calculateHealthScore(completedTasks, totalTasks, overdueTasks, daysRemaining)
  }
}

function calculateHealthScore(completed: number, total: number, overdue: number, daysRemaining: number): number {
  if (total === 0) return 100

  const completionScore = (completed / total) * 40
  const overdueScore = Math.max(0, 30 - (overdue * 10))
  const timeScore = Math.min(30, daysRemaining)

  return Math.round(completionScore + overdueScore + timeScore)
}

function scheduleTasksWithDependencies(
  tasks: Record<string, unknown>[],
  startDate: Date,
  respectDependencies: boolean
): { id: string; start_date: string; due_date: string }[] {
  const scheduled: { id: string; start_date: string; due_date: string }[] = []
  const taskMap = new Map(tasks.map(t => [t.id as string, t]))

  // Sort by position and dependencies
  const sortedTasks = [...tasks].sort((a, b) => {
    const aPos = a.position as number || 0
    const bPos = b.position as number || 0
    return aPos - bPos
  })

  let currentDate = new Date(startDate)

  for (const task of sortedTasks) {
    const taskId = task.id as string
    const duration = Math.max(1, Math.ceil(((task.estimated_minutes as number) || 60) / 480)) // Convert minutes to days

    let taskStart = new Date(currentDate)

    // Check dependencies
    if (respectDependencies) {
      const deps = (task.dependencies as string[]) || []
      for (const depId of deps) {
        const depTask = scheduled.find(s => s.id === depId)
        if (depTask) {
          const depEnd = new Date(depTask.due_date)
          if (depEnd >= taskStart) {
            taskStart = new Date(depEnd.getTime() + 86400000) // Day after dependency ends
          }
        }
      }
    }

    const taskEnd = new Date(taskStart.getTime() + (duration - 1) * 86400000)

    scheduled.push({
      id: taskId,
      start_date: taskStart.toISOString(),
      due_date: taskEnd.toISOString()
    })

    // Move current date forward
    if (taskEnd > currentDate) {
      currentDate = new Date(taskEnd.getTime() + 86400000)
    }
  }

  return scheduled
}

function generateICalendar(
  project: Record<string, unknown> | null,
  tasks: Record<string, unknown>[],
  milestones: Record<string, unknown>[]
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KAZI Platform//Timeline Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${project?.name || 'Project Timeline'}`
  ]

  // Add project as event
  if (project?.start_date && project?.due_date) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:project-${project.id}@kazi.app`,
      `DTSTART:${formatICalDate(project.start_date as string)}`,
      `DTEND:${formatICalDate(project.due_date as string)}`,
      `SUMMARY:[Project] ${project.name}`,
      `DESCRIPTION:${project.description || ''}`,
      'END:VEVENT'
    )
  }

  // Add tasks
  tasks.forEach(task => {
    if (task.due_date) {
      const start = task.start_date || task.due_date
      lines.push(
        'BEGIN:VEVENT',
        `UID:task-${task.id}@kazi.app`,
        `DTSTART:${formatICalDate(start as string)}`,
        `DTEND:${formatICalDate(task.due_date as string)}`,
        `SUMMARY:${task.title}`,
        `DESCRIPTION:${task.description || ''}`,
        `STATUS:${task.status === 'completed' ? 'COMPLETED' : 'NEEDS-ACTION'}`,
        'END:VEVENT'
      )
    }
  })

  // Add milestones
  milestones.forEach(ms => {
    if (ms.due_date) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:milestone-${ms.id}@kazi.app`,
        `DTSTART:${formatICalDate(ms.due_date as string)}`,
        `DTEND:${formatICalDate(ms.due_date as string)}`,
        `SUMMARY:[Milestone] ${ms.name}`,
        `DESCRIPTION:${ms.description || ''}`,
        'END:VEVENT'
      )
    }
  })

  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

function formatICalDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function calculateDaysDiff(date1: string | null, date2: string | null): number {
  if (!date1 || !date2) return 0
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.round((d2.getTime() - d1.getTime()) / 86400000)
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    review: '#F59E0B',
    completed: '#10B981',
    blocked: '#EF4444',
    cancelled: '#9CA3AF'
  }
  return colors[status] || '#6B7280'
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoTimeline() {
  const now = new Date()
  const tasks = []

  for (let i = 0; i < 6; i++) {
    const startOffset = i * 5
    const endOffset = startOffset + 4 + Math.floor(Math.random() * 3)

    tasks.push({
      id: `demo-task-${i + 1}`,
      title: ['Discovery', 'Design', 'Development', 'Testing', 'Review', 'Launch'][i],
      start: new Date(now.getTime() + startOffset * 86400000).toISOString(),
      end: new Date(now.getTime() + endOffset * 86400000).toISOString(),
      progress: [100, 80, 50, 20, 0, 0][i],
      dependencies: i > 0 ? [`demo-task-${i}`] : [],
      assignee_id: null,
      assignee: null,
      status: ['completed', 'in_progress', 'in_progress', 'todo', 'todo', 'todo'][i],
      priority: ['high', 'high', 'urgent', 'medium', 'medium', 'high'][i],
      type: 'task',
      color: ['#10B981', '#3B82F6', '#3B82F6', '#6B7280', '#6B7280', '#6B7280'][i],
      is_critical: i >= 2,
      is_overdue: false
    })
  }

  return { tasks, phases: [], milestones: [] }
}

function getDemoMilestones() {
  const now = new Date()
  return [
    {
      id: 'demo-ms-1',
      name: 'Design Complete',
      date: new Date(now.getTime() + 10 * 86400000).toISOString(),
      status: 'completed',
      deliverables: ['UI Mockups', 'Style Guide'],
      payment_percentage: 30
    },
    {
      id: 'demo-ms-2',
      name: 'Development Complete',
      date: new Date(now.getTime() + 25 * 86400000).toISOString(),
      status: 'pending',
      deliverables: ['Working Application'],
      payment_percentage: 40
    },
    {
      id: 'demo-ms-3',
      name: 'Launch',
      date: new Date(now.getTime() + 35 * 86400000).toISOString(),
      status: 'pending',
      deliverables: ['Live Website', 'Documentation'],
      payment_percentage: 30
    }
  ]
}

function getDemoTimelineStats() {
  return {
    total_tasks: 6,
    completed_tasks: 1,
    overdue_tasks: 0,
    completion_rate: 17,
    total_milestones: 3,
    completed_milestones: 1,
    days_remaining: 35,
    on_track: true,
    health_score: 78
  }
}
