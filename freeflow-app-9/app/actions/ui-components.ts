'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ui-components-actions')

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

export async function createUIComponent(input: UIComponentInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('ui_components')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create UI component', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('UI component created successfully', { name: input.name })
    revalidatePath('/dashboard/component-library-v2')
    return actionSuccess(data, 'UI component created successfully')
  } catch (error) {
    logger.error('Unexpected error creating UI component', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateUIComponent(id: string, input: Partial<UIComponentInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('ui_components')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update UI component', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('UI component updated successfully', { id })
    revalidatePath('/dashboard/component-library-v2')
    return actionSuccess(data, 'UI component updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating UI component', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteUIComponent(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('ui_components')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete UI component', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('UI component deleted successfully', { id })
    revalidatePath('/dashboard/component-library-v2')
    return actionSuccess({ success: true }, 'UI component deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting UI component', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
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

export async function rateComponent(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: component } = await supabase
      .from('ui_components')
      .select('rating, reviews_count')
      .eq('id', id)
      .single()

    if (!component) {
      return actionError('Component not found', 'NOT_FOUND')
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
      logger.error('Failed to rate component', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Component rated successfully', { id, rating })
    revalidatePath('/dashboard/component-library-v2')
    return actionSuccess(data, 'Component rated successfully')
  } catch (error) {
    logger.error('Unexpected error rating component', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
