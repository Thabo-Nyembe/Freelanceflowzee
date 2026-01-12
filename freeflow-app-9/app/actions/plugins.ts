'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('plugins-actions')

export interface PluginInput {
  name: string
  description?: string
  version?: string
  author?: string
  category?: 'productivity' | 'security' | 'analytics' | 'integration' | 'communication' | 'automation' | 'ui-enhancement' | 'developer-tools'
  plugin_type?: 'core' | 'premium' | 'community' | 'enterprise' | 'beta'
  status?: 'active' | 'inactive' | 'updating' | 'error' | 'disabled'
  size?: string
  compatibility?: string
  permissions?: string[]
  performance_score?: number
  tags?: string[]
  icon_url?: string
  repository_url?: string
  documentation_url?: string
  metadata?: Record<string, any>
}

export async function createPlugin(input: PluginInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('plugins')
      .insert([{
        ...input,
        user_id: user.id,
        author: input.author || user.email
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePlugin(id: string, input: Partial<PluginInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('plugins')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deletePlugin(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('plugins')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess({ success: true }, 'Plugin deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function activatePlugin(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('plugins')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin activated successfully')
  } catch (error: any) {
    logger.error('Unexpected error activating plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deactivatePlugin(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('plugins')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to deactivate plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin deactivated successfully')
  } catch (error: any) {
    logger.error('Unexpected error deactivating plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePluginVersion(id: string, newVersion: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // First set to updating
    await supabase
      .from('plugins')
      .update({
        status: 'updating',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    // Then complete update
    const { data, error } = await supabase
      .from('plugins')
      .update({
        version: newVersion,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update plugin version', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin version updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating plugin version', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function installPlugin(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: plugin } = await supabase
      .from('plugins')
      .select('installs_count')
      .eq('id', id)
      .single()

    if (!plugin) {
      return actionError('Plugin not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('plugins')
      .update({
        status: 'active',
        installs_count: (plugin.installs_count || 0) + 1,
        active_users_count: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to install plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin installed successfully')
  } catch (error: any) {
    logger.error('Unexpected error installing plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function uninstallPlugin(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('plugins')
      .update({
        status: 'inactive',
        active_users_count: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to uninstall plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin uninstalled successfully')
  } catch (error: any) {
    logger.error('Unexpected error uninstalling plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function ratePlugin(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: plugin } = await supabase
      .from('plugins')
      .select('rating, reviews_count')
      .eq('id', id)
      .single()

    if (!plugin) {
      return actionError('Plugin not found', 'NOT_FOUND')
    }

    const newReviewsCount = (plugin.reviews_count || 0) + 1
    const currentTotal = (plugin.rating || 0) * (plugin.reviews_count || 0)
    const newRating = (currentTotal + rating) / newReviewsCount

    const { data, error } = await supabase
      .from('plugins')
      .update({
        rating: Math.round(newRating * 100) / 100,
        reviews_count: newReviewsCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate plugin', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/plugins-v2')
    return actionSuccess(data, 'Plugin rated successfully')
  } catch (error: any) {
    logger.error('Unexpected error rating plugin', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementApiCalls(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: plugin } = await supabase
      .from('plugins')
      .select('api_calls_count')
      .eq('id', id)
      .single()

    if (!plugin) {
      return actionError('Plugin not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('plugins')
      .update({
        api_calls_count: (plugin.api_calls_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to increment API calls', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data, 'API call count incremented')
  } catch (error: any) {
    logger.error('Unexpected error incrementing API calls', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getPlugins(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get plugins', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Plugins retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting plugins', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
