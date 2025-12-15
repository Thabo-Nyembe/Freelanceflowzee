// Server Actions for Feedback Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function createFeedback(data: CreateFeedbackData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
  return feedback
}

// Update existing feedback
export async function updateFeedback({ id, ...data }: UpdateFeedbackData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: feedback, error } = await supabase
    .from('feedback')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
  return feedback
}

// Delete feedback (soft delete)
export async function deleteFeedback(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('feedback')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
}

// Update feedback status
export async function updateFeedbackStatus(id: string, status: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: feedback, error } = await supabase
    .from('feedback')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
  return feedback
}

// Assign feedback to user
export async function assignFeedback(id: string, assignedTo: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

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

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
  return feedback
}

// Respond to feedback
export async function respondToFeedback(id: string, responseText: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

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

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
  return feedback
}

// Mark feedback as spam
export async function markFeedbackAsSpam(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('feedback')
    .update({ is_spam: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/feedback-v2')
}

// Get feedback statistics
export async function getFeedbackStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: feedback, error } = await supabase
    .from('feedback')
    .select('status, feedback_type, priority, sentiment')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) throw error

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

  return stats
}
