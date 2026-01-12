'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('docs-actions')

export async function createDoc(data: {
  doc_title: string
  doc_category: string
  doc_type?: string
  content?: string
  summary?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Generate slug from title
    const slug = data.doc_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { data: doc, error } = await supabase
      .from('docs')
      .insert({
        user_id: user.id,
        ...data,
        slug,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create doc', { error: error.message, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('Doc created successfully', { docId: doc.id })
    return actionSuccess(doc, 'Doc created successfully')
  } catch (error) {
    logger.error('Unexpected error creating doc', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishDoc(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: doc, error } = await supabase
      .from('docs')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish doc', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('Doc published successfully', { docId: id })
    return actionSuccess(doc, 'Doc published successfully')
  } catch (error) {
    logger.error('Unexpected error publishing doc', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordView(id: string, isUnique: boolean = false): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('docs')
      .select('total_views, unique_views, monthly_views, weekly_views, daily_views')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const updateData: any = {
      total_views: (current?.total_views || 0) + 1,
      monthly_views: (current?.monthly_views || 0) + 1,
      weekly_views: (current?.weekly_views || 0) + 1,
      daily_views: (current?.daily_views || 0) + 1
    }

    if (isUnique) {
      updateData.unique_views = (current?.unique_views || 0) + 1
    }

    const { data: doc, error } = await supabase
      .from('docs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record view', { error: error.message, id, isUnique })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('View recorded successfully', { docId: id, isUnique })
    return actionSuccess(doc, 'View recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording view', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordFeedback(id: string, isHelpful: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('docs')
      .select('helpful_count, not_helpful_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const helpfulCount = (current?.helpful_count || 0) + (isHelpful ? 1 : 0)
    const notHelpfulCount = (current?.not_helpful_count || 0) + (isHelpful ? 0 : 1)
    const totalFeedback = helpfulCount + notHelpfulCount
    const helpfulRatingPercent = totalFeedback > 0
      ? parseFloat(((helpfulCount / totalFeedback) * 100).toFixed(2))
      : 0

    const updateData: any = {
      helpful_rating_percent: helpfulRatingPercent
    }

    if (isHelpful) {
      updateData.helpful_count = helpfulCount
    } else {
      updateData.not_helpful_count = notHelpfulCount
    }

    const { data: doc, error } = await supabase
      .from('docs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record feedback', { error: error.message, id, isHelpful })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('Feedback recorded successfully', { docId: id, isHelpful })
    return actionSuccess(doc, 'Feedback recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording feedback', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordCodeCopy(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('docs')
      .select('code_copy_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const { data: doc, error } = await supabase
      .from('docs')
      .update({
        code_copy_count: (current?.code_copy_count || 0) + 1
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record code copy', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('Code copy recorded successfully', { docId: id })
    return actionSuccess(doc, 'Code copy recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording code copy', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAPIMetrics(id: string, requestCount: number, avgResponseTime: number, successRate: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: doc, error } = await supabase
      .from('docs')
      .update({
        request_count: requestCount,
        avg_response_time_ms: avgResponseTime,
        success_rate: successRate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update API metrics', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('API metrics updated successfully', { docId: id })
    return actionSuccess(doc, 'API metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating API metrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateReadingMetrics(id: string, metrics: {
  read_time_seconds: number
  completion_rate: number
  bounce_rate: number
  scroll_depth_percent: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: doc, error } = await supabase
      .from('docs')
      .update({
        avg_read_time_seconds: metrics.read_time_seconds,
        completion_rate: metrics.completion_rate,
        bounce_rate: metrics.bounce_rate,
        scroll_depth_percent: metrics.scroll_depth_percent
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update reading metrics', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('Reading metrics updated successfully', { docId: id })
    return actionSuccess(doc, 'Reading metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating reading metrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markAsOutdated(id: string, needsReview: boolean = true): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: doc, error } = await supabase
      .from('docs')
      .update({
        is_outdated: true,
        needs_review: needsReview
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark as outdated', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/docs-v2')
    logger.info('Doc marked as outdated successfully', { docId: id, needsReview })
    return actionSuccess(doc, 'Doc marked as outdated successfully')
  } catch (error) {
    logger.error('Unexpected error marking as outdated', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
