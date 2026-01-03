'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('surveys-actions')

// ===================================
// Survey Server Actions
// Created: December 14, 2024
// ===================================

export interface CreateSurveyData {
  title: string
  description?: string
  survey_type?: string
  status?: string
  starts_at?: string
  ends_at?: string
  duration_minutes?: number
  questions?: any
  question_count?: number
  allow_anonymous?: boolean
  allow_multiple_submissions?: boolean
  require_login?: boolean
  one_response_per_user?: boolean
  show_progress_bar?: boolean
  show_question_numbers?: boolean
  randomize_questions?: boolean
  randomize_options?: boolean
  thank_you_message?: string
  redirect_url?: string
  show_results_after?: boolean
  target_audience?: string
  target_criteria?: any
  is_public?: boolean
  password_protected?: boolean
  access_code?: string
  logo_url?: string
  theme_color?: string
  tags?: any
  metadata?: any
}

export async function createSurvey(data: CreateSurveyData): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: survey, error } = await supabase
      .from('surveys')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create survey', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey created', { surveyId: survey.id })
    return actionSuccess(survey, 'Survey created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating survey', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSurvey(id: string, data: Partial<CreateSurveyData>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: survey, error } = await supabase
      .from('surveys')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update survey', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey updated', { surveyId: id })
    return actionSuccess(survey, 'Survey updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating survey', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSurvey(id: string, hardDelete: boolean = false): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    if (hardDelete) {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to hard delete survey', { error: error.message, id })
        return actionError(error.message, 'DATABASE_ERROR')
      }
    } else {
      const { error } = await supabase
        .from('surveys')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('Failed to soft delete survey', { error: error.message, id })
        return actionError(error.message, 'DATABASE_ERROR')
      }
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey deleted', { surveyId: id, hardDelete })
    return actionSuccess({ success: true }, 'Survey deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting survey', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishSurvey(id: string) {
  return activateSurvey(id)
}

export async function activateSurvey(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: survey, error } = await supabase
      .from('surveys')
      .update({
        status: 'active',
        starts_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate survey', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey activated', { surveyId: id })
    return actionSuccess(survey, 'Survey activated successfully')
  } catch (error: any) {
    logger.error('Unexpected error activating survey', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function closeSurvey(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: survey, error } = await supabase
      .from('surveys')
      .update({
        status: 'closed',
        ends_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to close survey', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey closed', { surveyId: id })
    return actionSuccess(survey, 'Survey closed successfully')
  } catch (error: any) {
    logger.error('Unexpected error closing survey', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function pauseSurvey(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: survey, error } = await supabase
      .from('surveys')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause survey', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey paused', { surveyId: id })
    return actionSuccess(survey, 'Survey paused successfully')
  } catch (error: any) {
    logger.error('Unexpected error pausing survey', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function duplicateSurvey(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get original survey
    const { data: original, error: fetchError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch survey for duplication', { error: fetchError.message, id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    // Create duplicate
    const { id: _, created_at, updated_at, deleted_at, ...duplicateData } = original

    const { data: duplicate, error: createError } = await supabase
      .from('surveys')
      .insert({
        ...duplicateData,
        title: `${duplicateData.title} (Copy)`,
        status: 'draft',
        total_responses: 0,
        complete_responses: 0,
        incomplete_responses: 0
      })
      .select()
      .single()

    if (createError) {
      logger.error('Failed to create duplicate survey', { error: createError.message, id })
      return actionError(createError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/surveys-v2')
    logger.info('Survey duplicated', { originalId: id, duplicateId: duplicate.id })
    return actionSuccess(duplicate, 'Survey duplicated successfully')
  } catch (error: any) {
    logger.error('Unexpected error duplicating survey', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getSurveyStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch surveys for stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: surveys?.length || 0,
      active: surveys?.filter(s => s.status === 'active').length || 0,
      draft: surveys?.filter(s => s.status === 'draft').length || 0,
      closed: surveys?.filter(s => s.status === 'closed').length || 0,
      totalResponses: surveys?.reduce((sum, s) => sum + (s.total_responses || 0), 0) || 0,
      totalCompleteResponses: surveys?.reduce((sum, s) => sum + (s.complete_responses || 0), 0) || 0,
      avgCompletionRate: surveys && surveys.length > 0
        ? surveys.reduce((sum, s) => sum + (s.completion_rate || 0), 0) / surveys.length
        : 0
    }

    logger.info('Survey stats fetched', { total: stats.total })
    return actionSuccess(stats, 'Survey stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching survey stats', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
