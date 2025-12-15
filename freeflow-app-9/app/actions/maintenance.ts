'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
  metadata?: Record<string, any>
}

interface MaintenanceTaskInput {
  name: string
  description?: string
  task_order?: number
  estimated_duration_minutes?: number
  assigned_to?: string[]
}

// Create maintenance window
export async function createMaintenanceWindow(input: MaintenanceWindowInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Update maintenance window
export async function updateMaintenanceWindow(id: string, input: Partial<MaintenanceWindowInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Delete maintenance window
export async function deleteMaintenanceWindow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('maintenance_windows')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { success: true }
}

// Start maintenance
export async function startMaintenance(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Complete maintenance
export async function completeMaintenance(id: string, notes?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Cancel maintenance
export async function cancelMaintenance(id: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Delay maintenance
export async function delayMaintenance(id: string, newStartTime: string, newEndTime: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Send notifications
export async function sendMaintenanceNotifications(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// =====================================================
// MAINTENANCE TASKS
// =====================================================

// Create maintenance task
export async function createMaintenanceTask(windowId: string, input: MaintenanceTaskInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify window belongs to user
  const { data: window } = await supabase
    .from('maintenance_windows')
    .select('id')
    .eq('id', windowId)
    .eq('user_id', user.id)
    .single()

  if (!window) {
    return { error: 'Maintenance window not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Update maintenance task
export async function updateMaintenanceTask(id: string, input: Partial<MaintenanceTaskInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('maintenance_tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Start task
export async function startMaintenanceTask(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Complete task
export async function completeMaintenanceTask(id: string, notes?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Skip task
export async function skipMaintenanceTask(id: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { data }
}

// Delete task
export async function deleteMaintenanceTask(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('maintenance_tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/maintenance-v2')
  return { success: true }
}

// Reorder tasks
export async function reorderMaintenanceTasks(windowId: string, taskIds: string[]) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update each task's order
  const updates = taskIds.map((id, index) =>
    supabase
      .from('maintenance_tasks')
      .update({ task_order: index })
      .eq('id', id)
  )

  await Promise.all(updates)

  revalidatePath('/dashboard/maintenance-v2')
  return { success: true }
}
