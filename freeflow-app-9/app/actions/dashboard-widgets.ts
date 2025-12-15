'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface DashboardWidgetInput {
  widget_type: string
  title: string
  position?: number
  width?: string
  height?: string
  config?: Record<string, any>
  is_visible?: boolean
}

export async function createDashboardWidget(input: DashboardWidgetInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/overview-v2')
  return data
}

export async function updateDashboardWidget(id: string, updates: Partial<DashboardWidgetInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/overview-v2')
  return data
}

export async function deleteDashboardWidget(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('dashboard_widgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/overview-v2')
  return { success: true }
}

export async function reorderDashboardWidgets(widgetPositions: { id: string; position: number }[]) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  for (const widget of widgetPositions) {
    await supabase
      .from('dashboard_widgets')
      .update({ position: widget.position })
      .eq('id', widget.id)
      .eq('user_id', user.id)
  }

  revalidatePath('/dashboard/overview-v2')
  return { success: true }
}

export async function getDashboardWidgets() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}
