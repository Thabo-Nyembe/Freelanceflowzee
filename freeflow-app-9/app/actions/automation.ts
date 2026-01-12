'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import type { Automation } from '@/lib/hooks/use-automation'

const logger = createFeatureLogger('automation-actions')

export async function createAutomation(data: Partial<Automation>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: automation, error } = await supabase
      .from('automation')
      .insert([{ ...data, user_id: user.id, created_by: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create automation', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Automation created successfully', { automationId: automation.id })
    revalidatePath('/dashboard/automation-v2')
    return actionSuccess(automation, 'Automation created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating automation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAutomation(id: string, data: Partial<Automation>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: automation, error } = await supabase
      .from('automation')
      .update({ ...data, updated_by: user.id })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update automation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Automation updated successfully', { automationId: id })
    revalidatePath('/dashboard/automation-v2')
    return actionSuccess(automation, 'Automation updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating automation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteAutomation(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('automation')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete automation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Automation deleted successfully', { automationId: id })
    revalidatePath('/dashboard/automation-v2')
    return actionSuccess({ success: true }, 'Automation deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting automation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function toggleAutomation(id: string, enabled: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: automation, error } = await supabase
      .from('automation')
      .update({
        is_enabled: enabled,
        status: enabled ? 'active' : 'inactive',
        updated_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle automation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Automation toggled successfully', { automationId: id, enabled })
    revalidatePath('/dashboard/automation-v2')
    return actionSuccess(automation, `Automation ${enabled ? 'enabled' : 'disabled'} successfully`)
  } catch (error: any) {
    logger.error('Unexpected error toggling automation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function runAutomation(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const startTime = Date.now()

    const { data: automation, error } = await supabase
      .from('automation')
      .update({
        is_running: true,
        status: 'running',
        last_run_at: new Date().toISOString(),
        run_count: supabase.raw('run_count + 1'),
        updated_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start automation run', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Simulate automation execution (in real app, this would trigger actual automation logic)
    const executionTime = Date.now() - startTime

    // Update with completion status
    const { data: completedAutomation, error: updateError } = await supabase
      .from('automation')
      .update({
        is_running: false,
        status: 'active',
        last_success_at: new Date().toISOString(),
        success_count: supabase.raw('success_count + 1'),
        total_execution_time_ms: supabase.raw(`total_execution_time_ms + ${executionTime}`),
        avg_execution_time_ms: supabase.raw(`(total_execution_time_ms + ${executionTime}) / run_count`)
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to complete automation run', { error: updateError.message, id })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    logger.info('Automation run completed successfully', { automationId: id, executionTime })
    revalidatePath('/dashboard/automation-v2')
    return actionSuccess(completedAutomation, 'Automation run completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error running automation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
