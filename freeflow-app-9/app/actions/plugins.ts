'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createPlugin(input: PluginInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function updatePlugin(id: string, input: Partial<PluginInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function deletePlugin(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('plugins')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { success: true }
}

export async function activatePlugin(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function deactivatePlugin(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function updatePluginVersion(id: string, newVersion: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function installPlugin(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: plugin } = await supabase
    .from('plugins')
    .select('installs_count')
    .eq('id', id)
    .single()

  if (!plugin) {
    return { error: 'Plugin not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function uninstallPlugin(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function ratePlugin(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: plugin } = await supabase
    .from('plugins')
    .select('rating, reviews_count')
    .eq('id', id)
    .single()

  if (!plugin) {
    return { error: 'Plugin not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/plugins-v2')
  return { data }
}

export async function incrementApiCalls(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: plugin } = await supabase
    .from('plugins')
    .select('api_calls_count')
    .eq('id', id)
    .single()

  if (!plugin) {
    return { error: 'Plugin not found' }
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
    return { error: error.message }
  }

  return { data }
}

export async function getPlugins() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('plugins')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
