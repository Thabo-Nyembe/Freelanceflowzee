'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tutorials-actions')

export interface TutorialInput {
  title: string
  description?: string
  status?: 'published' | 'draft' | 'scheduled' | 'archived'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  format?: 'video' | 'text' | 'interactive' | 'mixed'
  duration_minutes?: number
  lessons_count?: number
  author?: string
  thumbnail_url?: string
  video_url?: string
  content?: string
  tags?: string[]
  prerequisites?: string[]
}

export async function createTutorial(input: TutorialInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('tutorials')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create tutorial', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tutorial created successfully', { title: input.title })
    revalidatePath('/dashboard/tutorials-v2')
    return actionSuccess(data, 'Tutorial created successfully')
  } catch (error) {
    logger.error('Unexpected error creating tutorial', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTutorial(id: string, input: Partial<TutorialInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('tutorials')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update tutorial', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tutorial updated successfully', { id })
    revalidatePath('/dashboard/tutorials-v2')
    return actionSuccess(data, 'Tutorial updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating tutorial', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteTutorial(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('tutorials')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete tutorial', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tutorial deleted successfully', { id })
    revalidatePath('/dashboard/tutorials-v2')
    return actionSuccess({ success: true }, 'Tutorial deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting tutorial', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishTutorial(id: string) {
  return updateTutorial(id, { status: 'published' })
}

export async function scheduleTutorial(id: string) {
  return updateTutorial(id, { status: 'scheduled' })
}

export async function archiveTutorial(id: string) {
  return updateTutorial(id, { status: 'archived' })
}

export async function enrollInTutorial(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: tutorial } = await supabase
      .from('tutorials')
      .select('enrollments_count')
      .eq('id', id)
      .single()

    if (!tutorial) {
      return actionError('Tutorial not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('tutorials')
      .update({ enrollments_count: (tutorial.enrollments_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to enroll in tutorial', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Enrolled in tutorial successfully', { id })
    revalidatePath('/dashboard/tutorials-v2')
    return actionSuccess(data, 'Enrolled in tutorial successfully')
  } catch (error) {
    logger.error('Unexpected error enrolling in tutorial', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeTutorial(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: tutorial } = await supabase
      .from('tutorials')
      .select('completions_count')
      .eq('id', id)
      .single()

    if (!tutorial) {
      return actionError('Tutorial not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('tutorials')
      .update({ completions_count: (tutorial.completions_count || 0) + 1 })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete tutorial', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tutorial completed successfully', { id })
    revalidatePath('/dashboard/tutorials-v2')
    return actionSuccess(data, 'Tutorial completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing tutorial', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function rateTutorial(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: tutorial } = await supabase
      .from('tutorials')
      .select('rating, reviews_count')
      .eq('id', id)
      .single()

    if (!tutorial) {
      return actionError('Tutorial not found', 'NOT_FOUND')
    }

    const newReviewsCount = (tutorial.reviews_count || 0) + 1
    const currentTotal = (tutorial.rating || 0) * (tutorial.reviews_count || 0)
    const newRating = (currentTotal + rating) / newReviewsCount

    const { data, error } = await supabase
      .from('tutorials')
      .update({
        rating: Math.round(newRating * 100) / 100,
        reviews_count: newReviewsCount
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate tutorial', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tutorial rated successfully', { id, rating })
    revalidatePath('/dashboard/tutorials-v2')
    return actionSuccess(data, 'Tutorial rated successfully')
  } catch (error) {
    logger.error('Unexpected error rating tutorial', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
