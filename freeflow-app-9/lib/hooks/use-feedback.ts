// Hook for Feedback management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type FeedbackType = 'bug' | 'feature-request' | 'improvement' | 'complaint' | 'praise' | 'question' | 'general' | 'other'
export type FeedbackStatus = 'new' | 'reviewing' | 'planned' | 'in-progress' | 'completed' | 'declined' | 'duplicate' | 'archived'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical'
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative'
export type ResponseStatus = 'pending' | 'acknowledged' | 'in-review' | 'responded' | 'resolved'

export interface Feedback {
  id: string
  user_id: string
  organization_id: string | null
  submitted_by_user_id: string | null
  submitted_by_name: string | null
  submitted_by_email: string | null
  title: string
  description: string
  feedback_type: FeedbackType
  status: FeedbackStatus
  priority: FeedbackPriority
  category: string | null
  subcategory: string | null
  tags: any
  rating: number | null
  sentiment: FeedbackSentiment | null
  satisfaction_score: number | null
  related_feature: string | null
  related_url: string | null
  related_version: string | null
  upvotes_count: number
  downvotes_count: number
  comments_count: number
  views_count: number
  response_status: ResponseStatus
  responded_at: string | null
  responded_by: string | null
  response_text: string | null
  internal_notes: string | null
  assigned_to: string | null
  assigned_at: string | null
  is_public: boolean
  is_featured: boolean
  is_spam: boolean
  is_anonymous: boolean
  attachments: any
  screenshots: any
  browser_info: any
  device_info: any
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseFeedbackOptions {
  status?: FeedbackStatus | 'all'
  feedbackType?: FeedbackType | 'all'
  priority?: FeedbackPriority | 'all'
  limit?: number
}

export function useFeedback(options: UseFeedbackOptions = {}) {
  const { status, feedbackType, priority, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (feedbackType && feedbackType !== 'all') filters.feedback_type = feedbackType
  if (priority && priority !== 'all') filters.priority = priority

  const queryOptions: any = {
    table: 'feedback',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Feedback>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'feedback',
    onSuccess: refetch
  })

  return {
    feedback: data,
    loading,
    error,
    mutating,
    createFeedback: create,
    updateFeedback: update,
    deleteFeedback: remove,
    refetch
  }
}
