'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface UIComponentInput {
  name: string
  description?: string
  category?: 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'media' | 'buttons' | 'overlays'
  framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'
  status?: 'published' | 'draft' | 'deprecated' | 'beta' | 'archived'
  version?: string
  author?: string
  file_size?: string
  dependencies_count?: number
  props_count?: number
  examples_count?: number
  accessibility_level?: string
  is_responsive?: boolean
  code_snippet?: string
  preview_url?: string
  tags?: string[]
}

export async function createUIComponent(input: UIComponentInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('ui_components')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/component-library-v2')
  return { data }
}

export async function updateUIComponent(id: string, input: Partial<UIComponentInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('ui_components')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/component-library-v2')
  return { data }
}

export async function deleteUIComponent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('ui_components')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/component-library-v2')
  return { success: true }
}

export async function publishComponent(id: string) {
  return updateUIComponent(id, { status: 'published' })
}

export async function deprecateComponent(id: string) {
  return updateUIComponent(id, { status: 'deprecated' })
}

export async function archiveComponent(id: string) {
  return updateUIComponent(id, { status: 'archived' })
}

export async function setBetaComponent(id: string) {
  return updateUIComponent(id, { status: 'beta' })
}

export async function rateComponent(id: string, rating: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: component } = await supabase
    .from('ui_components')
    .select('rating, reviews_count')
    .eq('id', id)
    .single()

  if (!component) {
    return { error: 'Component not found' }
  }

  const newReviewsCount = (component.reviews_count || 0) + 1
  const currentTotal = (component.rating || 0) * (component.reviews_count || 0)
  const newRating = (currentTotal + rating) / newReviewsCount

  const { data, error } = await supabase
    .from('ui_components')
    .update({
      rating: Math.round(newRating * 100) / 100,
      reviews_count: newReviewsCount
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/component-library-v2')
  return { data }
}
