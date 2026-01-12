'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('dashboard-widgets-actions')

export interface DashboardWidgetInput {
  widget_type: string
  title: string
  position?: number
  width?: string
  height?: string
  config?: Record<string, any>
  is_visible?: boolean
}

export async function createDashboardWidget(input: DashboardWidgetInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create dashboard widget', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/overview-v2')
    logger.info('Dashboard widget created successfully', { widgetId: data.id })
    return actionSuccess(data, 'Dashboard widget created successfully')
  } catch (error) {
    logger.error('Unexpected error creating dashboard widget', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDashboardWidget(id: string, updates: Partial<DashboardWidgetInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update dashboard widget', { error: error.message, id, updates })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/overview-v2')
    logger.info('Dashboard widget updated successfully', { widgetId: id })
    return actionSuccess(data, 'Dashboard widget updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating dashboard widget', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteDashboardWidget(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete dashboard widget', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/overview-v2')
    logger.info('Dashboard widget deleted successfully', { widgetId: id })
    return actionSuccess(null, 'Dashboard widget deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting dashboard widget', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function reorderDashboardWidgets(widgetPositions: { id: string; position: number }[]): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    for (const widget of widgetPositions) {
      const { error } = await supabase
        .from('dashboard_widgets')
        .update({ position: widget.position })
        .eq('id', widget.id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to reorder dashboard widget', { error: error.message, widgetId: widget.id })
        return actionError(error.message, 'DATABASE_ERROR')
      }
    }

    revalidatePath('/dashboard/overview-v2')
    logger.info('Dashboard widgets reordered successfully', { count: widgetPositions.length })
    return actionSuccess(null, 'Dashboard widgets reordered successfully')
  } catch (error) {
    logger.error('Unexpected error reordering dashboard widgets', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getDashboardWidgets(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      logger.error('Failed to get dashboard widgets', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Dashboard widgets retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Dashboard widgets retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting dashboard widgets', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
