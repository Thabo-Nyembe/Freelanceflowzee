'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createSurvey(data: CreateSurveyData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: survey, error } = await supabase
    .from('surveys')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/surveys-v2')
  return survey
}

export async function updateSurvey(id: string, data: Partial<CreateSurveyData>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: survey, error } = await supabase
    .from('surveys')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/surveys-v2')
  return survey
}

export async function deleteSurvey(id: string, hardDelete: boolean = false) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (hardDelete) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('surveys')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  revalidatePath('/dashboard/surveys-v2')
  return { success: true }
}

export async function publishSurvey(id: string) {
  return activateSurvey(id)
}

export async function activateSurvey(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/surveys-v2')
  return survey
}

export async function closeSurvey(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/surveys-v2')
  return survey
}

export async function pauseSurvey(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: survey, error } = await supabase
    .from('surveys')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/surveys-v2')
  return survey
}

export async function duplicateSurvey(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get original survey
  const { data: original, error: fetchError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) throw fetchError

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

  if (createError) throw createError

  revalidatePath('/dashboard/surveys-v2')
  return duplicate
}

export async function getSurveyStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

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

  return stats
}
