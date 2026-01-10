'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('widgets')

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WidgetInput {
  name: string
  description?: string
  category?: string
  widget_type?: 'chart' | 'form' | 'display' | 'interactive' | 'data-input' | 'visualization' | 'embed'
  status?: 'active' | 'beta' | 'deprecated' | 'maintenance' | 'coming-soon'
  version?: string
  author?: string
  size?: string
  dependencies_count?: number
  documentation_url?: string
  demo_url?: string
  tags?: string[]
  config?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

interface Widget extends WidgetInput {
  id: string
  user_id: string
  installs_count?: number
  active_users_count?: number
  rating?: number
  total_ratings?: number
  created_at: string
  updated_at: string
}

interface WidgetStats {
  total: number
  active: number
  beta: number
  totalInstalls: number
  totalActiveUsers: number
  avgRating: number
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all widgets for the authenticated user
 */
export async function getWidgets(): Promise<ActionResult<Widget[]>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized widgets fetch attempt', { error: authError })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to fetch widgets', { error, userId: user.id })
      return actionError('Failed to fetch widgets', 'DATABASE_ERROR')
    }

    logger.info('Widgets fetched successfully', { count: data?.length || 0, userId: user.id })
    return actionSuccess(data || [], 'Widgets fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching widgets', { error })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Create a new widget
 */
export async function createWidget(input: WidgetInput): Promise<ActionResult<Widget>> {
  try {
    // Validate required field
    if (!input.name || input.name.trim().length === 0) {
      return actionError('Widget name is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized widget creation attempt', { error: authError })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('widgets')
      .insert({
        ...input,
        user_id: user.id,
        tags: input.tags || [],
        config: input.config || {},
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create widget', { error, userId: user.id })
      return actionError('Failed to create widget', 'DATABASE_ERROR')
    }

    logger.info('Widget created successfully', { widgetId: data.id, userId: user.id })
    revalidatePath('/dashboard/widget-library-v2')

    return actionSuccess(data, 'Widget created successfully')
  } catch (error) {
    logger.error('Unexpected error creating widget', { error })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Update an existing widget
 */
export async function updateWidget(
  id: string,
  input: Partial<WidgetInput>
): Promise<ActionResult<Widget>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid widget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized widget update attempt', { error: authError, widgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('widgets')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update widget', { error, widgetId: id, userId: user.id })
      return actionError('Failed to update widget', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Widget not found for update', { widgetId: id, userId: user.id })
      return actionError('Widget not found', 'NOT_FOUND')
    }

    logger.info('Widget updated successfully', { widgetId: id, userId: user.id })
    revalidatePath('/dashboard/widget-library-v2')

    return actionSuccess(data, 'Widget updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating widget', { error, widgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Delete a widget
 */
export async function deleteWidget(id: string): Promise<ActionResult<void>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid widget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized widget deletion attempt', { error: authError, widgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('widgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete widget', { error, widgetId: id, userId: user.id })
      return actionError('Failed to delete widget', 'DATABASE_ERROR')
    }

    logger.info('Widget deleted successfully', { widgetId: id, userId: user.id })
    revalidatePath('/dashboard/widget-library-v2')

    return actionSuccess(undefined, 'Widget deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting widget', { error, widgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Install a widget (increment install counters)
 */
export async function installWidget(id: string): Promise<ActionResult<Widget>> {
  try {
    // Validate UUID
    const validation = uuidSchema.safeParse(id)
    if (!validation.success) {
      return actionError('Invalid widget ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized widget installation attempt', { error: authError, widgetId: id })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    // Fetch current widget to get install counts
    const { data: widget, error: fetchError } = await supabase
      .from('widgets')
      .select('installs_count, active_users_count')
      .eq('id', id)
      .single()

    if (fetchError || !widget) {
      logger.error('Widget not found for installation', {
        error: fetchError,
        widgetId: id,
        userId: user.id
      })
      return actionError('Widget not found', 'NOT_FOUND')
    }

    // Update install counts
    const { data, error } = await supabase
      .from('widgets')
      .update({
        installs_count: (widget.installs_count || 0) + 1,
        active_users_count: (widget.active_users_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to install widget', { error, widgetId: id, userId: user.id })
      return actionError('Failed to install widget', 'DATABASE_ERROR')
    }

    logger.info('Widget installed successfully', { widgetId: id, userId: user.id })
    revalidatePath('/dashboard/widget-library-v2')

    return actionSuccess(data, 'Widget installed successfully')
  } catch (error) {
    logger.error('Unexpected error installing widget', { error, widgetId: id })
    return actionError('An unexpected error occurred')
  }
}

/**
 * Get widget statistics
 */
export async function getWidgetStats(): Promise<ActionResult<WidgetStats>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Unauthorized widget stats fetch attempt', { error: authError })
      return actionError('Authentication required', 'UNAUTHORIZED')
    }

    const { data: widgets, error } = await supabase
      .from('widgets')
      .select('status, installs_count, active_users_count, rating, total_ratings')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to fetch widget stats', { error, userId: user.id })
      return actionError('Failed to fetch widget stats', 'DATABASE_ERROR')
    }

    // Calculate statistics
    const totalRatings = widgets?.reduce(
      (sum, w) => sum + ((w.rating || 0) * (w.total_ratings || 0)),
      0
    ) || 0
    const totalReviews = widgets?.reduce((sum, w) => sum + (w.total_ratings || 0), 0) || 0

    const stats: WidgetStats = {
      total: widgets?.length || 0,
      active: widgets?.filter(w => w.status === 'active').length || 0,
      beta: widgets?.filter(w => w.status === 'beta').length || 0,
      totalInstalls: widgets?.reduce((sum, w) => sum + (w.installs_count || 0), 0) || 0,
      totalActiveUsers: widgets?.reduce((sum, w) => sum + (w.active_users_count || 0), 0) || 0,
      avgRating: totalReviews > 0 ? Number((totalRatings / totalReviews).toFixed(1)) : 0
    }

    logger.info('Widget stats calculated', { stats, userId: user.id })
    return actionSuccess(stats, 'Widget stats fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching widget stats', { error })
    return actionError('An unexpected error occurred')
  }
}
