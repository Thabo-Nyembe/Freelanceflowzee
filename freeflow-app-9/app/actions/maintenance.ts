'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('maintenance-actions')

// Types
interface MaintenanceWindowInput {
  title: string
  description?: string
  type?: 'routine' | 'emergency' | 'upgrade' | 'patch' | 'inspection' | 'optimization'
  impact?: 'low' | 'medium' | 'high' | 'critical'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  start_time: string
  end_time: string
  affected_systems?: string[]
  downtime_expected?: boolean
  assigned_to?: string[]
  notification_methods?: string[]
  tags?: string[]
  metadata?: Record<string, unknown>
}

interface MaintenanceTaskInput {
  name: string
  description?: string
  task_order?: number
  estimated_duration_minutes?: number
  assigned_to?: string[]
}

// Create maintenance window
export async function createMaintenanceWindow(input: MaintenanceWindowInput): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Calculate duration
    const startTime = new Date(input.start_time)
    const endTime = new Date(input.end_time)
    const duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    const { data, error } = await supabase
      .from('maintenance_windows')
      .insert([{
        user_id: user.id,
        created_by: user.id,
        title: input.title,
        description: input.description,
        type: input.type || 'routine',
        status: 'scheduled',
        impact: input.impact || 'low',
        priority: input.priority || 'medium',
        start_time: input.start_time,
        end_time: input.end_time,
        duration_minutes,
        affected_systems: input.affected_systems || [],
        downtime_expected: input.downtime_expected || false,
        assigned_to: input.assigned_to || [],
        notification_methods: input.notification_methods || [],
        tags: input.tags || [],
        metadata: input.metadata || {}
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create maintenance window', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance window created', { id: data.id, title: input.title })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ id: data.id }, 'Maintenance window created successfully')
  } catch (error) {
    logger.error('Unexpected error creating maintenance window', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update maintenance window
export async function updateMaintenanceWindow(id: string, input: Partial<MaintenanceWindowInput>): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Recalculate duration if times changed
    let duration_minutes
    if (input.start_time && input.end_time) {
      const startTime = new Date(input.start_time)
      const endTime = new Date(input.end_time)
      duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
    }

    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        ...input,
        ...(duration_minutes && { duration_minutes })
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update maintenance window', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance window updated', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ id: data.id }, 'Maintenance window updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating maintenance window', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete maintenance window
export async function deleteMaintenanceWindow(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('maintenance_windows')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete maintenance window', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance window deleted', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ deleted: true }, 'Maintenance window deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting maintenance window', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Start maintenance
export async function startMaintenance(id: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        status: 'in-progress',
        actual_start: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start maintenance', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance started', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance started successfully')
  } catch (error) {
    logger.error('Unexpected error starting maintenance', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Complete maintenance
export async function completeMaintenance(id: string, notes?: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        status: 'completed',
        actual_end: new Date().toISOString(),
        completion_rate: 100,
        notes: notes
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete maintenance', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance completed', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing maintenance', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Cancel maintenance
export async function cancelMaintenance(id: string, reason?: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        status: 'cancelled',
        notes: reason
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel maintenance', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance cancelled', { id, reason })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance cancelled successfully')
  } catch (error) {
    logger.error('Unexpected error cancelling maintenance', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delay maintenance
export async function delayMaintenance(id: string, newStartTime: string, newEndTime: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const startTime = new Date(newStartTime)
    const endTime = new Date(newEndTime)
    const duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        status: 'delayed',
        start_time: newStartTime,
        end_time: newEndTime,
        duration_minutes
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to delay maintenance', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance delayed', { id, newStartTime })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance delayed successfully')
  } catch (error) {
    logger.error('Unexpected error delaying maintenance', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Send notifications
export async function sendMaintenanceNotifications(id: string): Promise<ActionResult<{ sent: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // In a real app, this would trigger actual notifications
    const { data, error } = await supabase
      .from('maintenance_windows')
      .update({
        notification_sent: true,
        notification_sent_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to send maintenance notifications', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance notifications sent', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ sent: true }, 'Notifications sent successfully')
  } catch (error) {
    logger.error('Unexpected error sending maintenance notifications', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =====================================================
// MAINTENANCE TASKS
// =====================================================

// Create maintenance task
export async function createMaintenanceTask(windowId: string, input: MaintenanceTaskInput): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Verify window belongs to user
    const { data: window } = await supabase
      .from('maintenance_windows')
      .select('id')
      .eq('id', windowId)
      .eq('user_id', user.id)
      .single()

    if (!window) {
      return actionError('Maintenance window not found', 'NOT_FOUND')
    }

    // Get max task order
    const { data: maxOrderTask } = await supabase
      .from('maintenance_tasks')
      .select('task_order')
      .eq('window_id', windowId)
      .order('task_order', { ascending: false })
      .limit(1)
      .single()

    const taskOrder = input.task_order ?? ((maxOrderTask?.task_order || 0) + 1)

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert([{
        window_id: windowId,
        name: input.name,
        description: input.description,
        task_order: taskOrder,
        status: 'pending',
        estimated_duration_minutes: input.estimated_duration_minutes || 15,
        assigned_to: input.assigned_to || []
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create maintenance task', { error: error.message, windowId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance task created', { id: data.id, windowId })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ id: data.id }, 'Maintenance task created successfully')
  } catch (error) {
    logger.error('Unexpected error creating maintenance task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update maintenance task
export async function updateMaintenanceTask(id: string, input: Partial<MaintenanceTaskInput>): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update maintenance task', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance task updated', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ id: data.id }, 'Maintenance task updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating maintenance task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Start task
export async function startMaintenanceTask(id: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update({
        status: 'in-progress',
        started_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start maintenance task', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance task started', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance task started successfully')
  } catch (error) {
    logger.error('Unexpected error starting maintenance task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Complete task
export async function completeMaintenanceTask(id: string, notes?: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get task to calculate duration
    const { data: task } = await supabase
      .from('maintenance_tasks')
      .select('started_at')
      .eq('id', id)
      .single()

    let actual_duration_minutes = null
    if (task?.started_at) {
      const startedAt = new Date(task.started_at)
      actual_duration_minutes = Math.round((Date.now() - startedAt.getTime()) / (1000 * 60))
    }

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: user.id,
        actual_duration_minutes,
        notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete maintenance task', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance task completed', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance task completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing maintenance task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Skip task
export async function skipMaintenanceTask(id: string, reason?: string): Promise<ActionResult<{ status: string }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update({
        status: 'skipped',
        notes: reason
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to skip maintenance task', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance task skipped', { id, reason })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ status: data.status }, 'Maintenance task skipped successfully')
  } catch (error) {
    logger.error('Unexpected error skipping maintenance task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete task
export async function deleteMaintenanceTask(id: string): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Failed to delete maintenance task', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Maintenance task deleted', { id })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ deleted: true }, 'Maintenance task deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting maintenance task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Reorder tasks
export async function reorderMaintenanceTasks(windowId: string, taskIds: string[]): Promise<ActionResult<{ reordered: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update each task's order
    const updates = taskIds.map((id, index) =>
      supabase
        .from('maintenance_tasks')
        .update({ task_order: index })
        .eq('id', id)
    )

    await Promise.all(updates)

    logger.info('Maintenance tasks reordered', { windowId, taskCount: taskIds.length })
    revalidatePath('/dashboard/maintenance-v2')
    return actionSuccess({ reordered: true }, 'Tasks reordered successfully')
  } catch (error) {
    logger.error('Unexpected error reordering maintenance tasks', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
