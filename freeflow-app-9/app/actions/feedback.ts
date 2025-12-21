// Server Actions for Feedback Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('feedback-actions')

interface CreateFeedbackData {
  title: string
  description: string
  feedback_type: string
  status?: string
  priority?: string
  category?: string
  subcategory?: string
  tags?: any
  rating?: number
  sentiment?: string
  satisfaction_score?: number
  related_feature?: string
  related_url?: string
  related_version?: string
  is_public?: boolean
  is_anonymous?: boolean
  attachments?: any
  screenshots?: any
  browser_info?: any
  device_info?: any
  metadata?: any
}

interface UpdateFeedbackData extends Partial<CreateFeedbackData> {
  id: string
}

// Create new feedback
export async function createFeedback(data: CreateFeedbackData): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create feedback', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback created successfully', { feedbackId: feedback.id })
    return actionSuccess(feedback, 'Feedback created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating feedback', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update existing feedback
export async function updateFeedback({ id, ...data }: UpdateFeedbackData): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feedback, error } = await supabase
      .from('feedback')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update feedback', { error, feedbackId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback updated successfully', { feedbackId: id })
    return actionSuccess(feedback, 'Feedback updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating feedback', { error, feedbackId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete feedback (soft delete)
export async function deleteFeedback(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('feedback')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete feedback', { error, feedbackId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback deleted successfully', { feedbackId: id })
    return actionSuccess(undefined, 'Feedback deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting feedback', { error, feedbackId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update feedback status
export async function updateFeedbackStatus(id: string, status: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feedback, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update feedback status', { error, feedbackId: id, status })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback status updated successfully', { feedbackId: id, status })
    return actionSuccess(feedback, 'Feedback status updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating feedback status', { error, feedbackId: id, status })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Assign feedback to user
export async function assignFeedback(id: string, assignedTo: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feedback, error } = await supabase
      .from('feedback')
      .update({
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to assign feedback', { error, feedbackId: id, assignedTo })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback assigned successfully', { feedbackId: id, assignedTo })
    return actionSuccess(feedback, 'Feedback assigned successfully')
  } catch (error: any) {
    logger.error('Unexpected error assigning feedback', { error, feedbackId: id, assignedTo })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Respond to feedback
export async function respondToFeedback(id: string, responseText: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feedback, error } = await supabase
      .from('feedback')
      .update({
        response_text: responseText,
        response_status: 'responded',
        responded_at: new Date().toISOString(),
        responded_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to respond to feedback', { error, feedbackId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback response added successfully', { feedbackId: id })
    return actionSuccess(feedback, 'Feedback response added successfully')
  } catch (error: any) {
    logger.error('Unexpected error responding to feedback', { error, feedbackId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Mark feedback as spam
export async function markFeedbackAsSpam(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('feedback')
      .update({ is_spam: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to mark feedback as spam', { error, feedbackId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/feedback-v2')
    logger.info('Feedback marked as spam successfully', { feedbackId: id })
    return actionSuccess(undefined, 'Feedback marked as spam successfully')
  } catch (error: any) {
    logger.error('Unexpected error marking feedback as spam', { error, feedbackId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get feedback statistics
export async function getFeedbackStats(): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('status, feedback_type, priority, sentiment')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get feedback stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: feedback?.length || 0,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      bySentiment: {} as Record<string, number>
    }

    feedback?.forEach(item => {
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1
      stats.byType[item.feedback_type] = (stats.byType[item.feedback_type] || 0) + 1
      stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1
      if (item.sentiment) {
        stats.bySentiment[item.sentiment] = (stats.bySentiment[item.sentiment] || 0) + 1
      }
    })

    logger.info('Feedback stats retrieved successfully', { total: stats.total })
    return actionSuccess(stats, 'Feedback stats retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting feedback stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
