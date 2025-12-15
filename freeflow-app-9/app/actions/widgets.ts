'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
  config?: Record<string, any>
  metadata?: Record<string, any>
}

export async function getWidgets() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createWidget(input: WidgetInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/widget-library-v2')
  return { data, error: null }
}

export async function updateWidget(id: string, input: Partial<WidgetInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/widget-library-v2')
  return { data, error: null }
}

export async function deleteWidget(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('widgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/widget-library-v2')
  return { success: true, error: null }
}

export async function installWidget(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: widget } = await supabase
    .from('widgets')
    .select('installs_count, active_users_count')
    .eq('id', id)
    .single()

  if (!widget) {
    return { error: 'Widget not found', data: null }
  }

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/widget-library-v2')
  return { data, error: null }
}

export async function getWidgetStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: widgets, error } = await supabase
    .from('widgets')
    .select('status, installs_count, active_users_count, rating, total_ratings')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, data: null }
  }

  const totalRatings = widgets?.reduce((sum, w) => sum + ((w.rating || 0) * (w.total_ratings || 0)), 0) || 0
  const totalReviews = widgets?.reduce((sum, w) => sum + (w.total_ratings || 0), 0) || 0

  const stats = {
    total: widgets?.length || 0,
    active: widgets?.filter(w => w.status === 'active').length || 0,
    beta: widgets?.filter(w => w.status === 'beta').length || 0,
    totalInstalls: widgets?.reduce((sum, w) => sum + (w.installs_count || 0), 0) || 0,
    totalActiveUsers: widgets?.reduce((sum, w) => sum + (w.active_users_count || 0), 0) || 0,
    avgRating: totalReviews > 0 ? Number((totalRatings / totalReviews).toFixed(1)) : 0
  }

  return { data: stats, error: null }
}
