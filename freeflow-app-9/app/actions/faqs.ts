'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('faqs-actions')

export interface FAQInput {
  question: string
  answer: string
  category?: string
  status?: 'draft' | 'published' | 'review' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  author?: string
  average_read_time?: number
  metadata?: Record<string, any>
}

export async function getFAQs(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get FAQs', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'FAQs retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting FAQs', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createFAQ(input: FAQInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('faqs')
      .insert({
        ...input,
        user_id: user.id,
        tags: input.tags || [],
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create FAQ', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('FAQ created successfully', { id: data.id })
    revalidatePath('/dashboard/faq-v2')
    return actionSuccess(data, 'FAQ created successfully')
  } catch (error) {
    logger.error('Unexpected error creating FAQ', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateFAQ(id: string, input: Partial<FAQInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('faqs')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update FAQ', { error, id, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('FAQ updated successfully', { id })
    revalidatePath('/dashboard/faq-v2')
    return actionSuccess(data, 'FAQ updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating FAQ', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteFAQ(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete FAQ', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('FAQ deleted successfully', { id })
    revalidatePath('/dashboard/faq-v2')
    return actionSuccess({ success: true }, 'FAQ deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting FAQ', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markFAQHelpful(id: string, helpful: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: faq } = await supabase
      .from('faqs')
      .select('helpful_count, not_helpful_count')
      .eq('id', id)
      .single()

    if (!faq) {
      return actionError('FAQ not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('faqs')
      .update({
        helpful_count: helpful ? (faq.helpful_count || 0) + 1 : faq.helpful_count,
        not_helpful_count: !helpful ? (faq.not_helpful_count || 0) + 1 : faq.not_helpful_count,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark FAQ helpful', { error, id, helpful })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('FAQ marked helpful', { id, helpful })
    revalidatePath('/dashboard/faq-v2')
    return actionSuccess(data, 'Feedback recorded successfully')
  } catch (error) {
    logger.error('Unexpected error marking FAQ helpful', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getFAQStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('status, views_count, helpful_count, not_helpful_count')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to get FAQ stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const totalHelpful = faqs?.reduce((sum, f) => sum + (f.helpful_count || 0), 0) || 0
    const totalNotHelpful = faqs?.reduce((sum, f) => sum + (f.not_helpful_count || 0), 0) || 0
    const total = totalHelpful + totalNotHelpful

    const stats = {
      total: faqs?.length || 0,
      published: faqs?.filter(f => f.status === 'published').length || 0,
      draft: faqs?.filter(f => f.status === 'draft').length || 0,
      review: faqs?.filter(f => f.status === 'review').length || 0,
      archived: faqs?.filter(f => f.status === 'archived').length || 0,
      totalViews: faqs?.reduce((sum, f) => sum + (f.views_count || 0), 0) || 0,
      totalHelpful,
      avgHelpfulness: total > 0 ? Math.round((totalHelpful / total) * 100) : 0
    }

    return actionSuccess(stats, 'FAQ stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting FAQ stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
