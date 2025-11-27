/**
 * Collaboration Feedback Queries
 *
 * Complete CRUD operations for feedback system:
 * - Feedback submission and management
 * - Replies and threaded discussions
 * - Voting system (upvote/downvote)
 * - Priority and status tracking
 * - Assignment to team members
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CollaborationFeedback')

// ============================================================================
// TYPES
// ============================================================================

export type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'question' | 'other'
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent'
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type VoteType = 'up' | 'down'

export interface CollaborationFeedback {
  id: string
  user_id: string
  category: FeedbackCategory
  priority: FeedbackPriority
  status: FeedbackStatus
  title: string
  description: string
  upvotes: number
  downvotes: number
  is_starred: boolean
  is_flagged: boolean
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface FeedbackReply {
  id: string
  feedback_id: string
  user_id: string
  reply_text: string
  is_solution: boolean
  created_at: string
}

export interface FeedbackVote {
  id: string
  feedback_id: string
  user_id: string
  vote_type: VoteType
  created_at: string
}

export interface FeedbackWithDetails extends CollaborationFeedback {
  reply_count?: number
  user_vote?: VoteType | null
}

// ============================================================================
// FEEDBACK CRUD OPERATIONS
// ============================================================================

/**
 * Get all feedback items with optional filters
 */
export async function getFeedback(
  userId: string,
  filters?: {
    category?: FeedbackCategory
    priority?: FeedbackPriority
    status?: FeedbackStatus
    is_starred?: boolean
    assigned_to?: string
    search?: string
  }
): Promise<{ data: CollaborationFeedback[] | null; error: any }> {
  const startTime = performance.now()

  try {
    logger.info('Fetching feedback items', { userId, filters })

    const supabase = createClient()

    let query = supabase
      .from('collaboration_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.is_starred !== undefined) {
      query = query.eq('is_starred', filters.is_starred)
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch feedback', { error: error.message, userId })
      return { data: null, error }
    }

    const duration = performance.now() - startTime

    logger.info('Feedback fetched successfully', {
      userId,
      count: data?.length || 0,
      duration
    })

    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in getFeedback', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(
  feedbackId: string,
  userId: string
): Promise<{ data: CollaborationFeedback | null; error: any }> {
  try {
    logger.info('Fetching feedback by ID', { feedbackId, userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback')
      .select('*')
      .eq('id', feedbackId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch feedback by ID', { error: error.message, feedbackId })
      return { data: null, error }
    }

    logger.info('Feedback fetched successfully', { feedbackId })
    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in getFeedbackById', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

/**
 * Create new feedback
 */
export async function createFeedback(
  userId: string,
  feedback: {
    title: string
    description: string
    category: FeedbackCategory
    priority: FeedbackPriority
    assigned_to?: string
  }
): Promise<{ data: CollaborationFeedback | null; error: any }> {
  try {
    logger.info('Creating feedback', { userId, title: feedback.title, category: feedback.category })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback')
      .insert({
        user_id: userId,
        title: feedback.title,
        description: feedback.description,
        category: feedback.category,
        priority: feedback.priority,
        assigned_to: feedback.assigned_to || null,
        status: 'open'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create feedback', { error: error.message, userId })
      return { data: null, error }
    }

    logger.info('Feedback created successfully', {
      feedbackId: data.id,
      title: data.title,
      category: data.category
    })

    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in createFeedback', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Update feedback
 */
export async function updateFeedback(
  feedbackId: string,
  userId: string,
  updates: {
    title?: string
    description?: string
    category?: FeedbackCategory
    priority?: FeedbackPriority
    status?: FeedbackStatus
    assigned_to?: string
    is_starred?: boolean
    is_flagged?: boolean
  }
): Promise<{ data: CollaborationFeedback | null; error: any }> {
  try {
    logger.info('Updating feedback', { feedbackId, userId, updates })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback')
      .update(updates)
      .eq('id', feedbackId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update feedback', { error: error.message, feedbackId })
      return { data: null, error }
    }

    logger.info('Feedback updated successfully', {
      feedbackId,
      updatedFields: Object.keys(updates)
    })

    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in updateFeedback', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

/**
 * Delete feedback
 */
export async function deleteFeedback(
  feedbackId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting feedback', { feedbackId, userId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_feedback')
      .delete()
      .eq('id', feedbackId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete feedback', { error: error.message, feedbackId })
      return { success: false, error }
    }

    logger.info('Feedback deleted successfully', { feedbackId })
    return { success: true, error: null }

  } catch (error: any) {
    logger.error('Exception in deleteFeedback', { error: error.message, feedbackId })
    return { success: false, error }
  }
}

/**
 * Toggle starred status
 */
export async function toggleStarred(
  feedbackId: string,
  userId: string,
  isStarred: boolean
): Promise<{ data: CollaborationFeedback | null; error: any }> {
  try {
    logger.info('Toggling starred status', { feedbackId, userId, isStarred })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback')
      .update({ is_starred: isStarred })
      .eq('id', feedbackId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle starred', { error: error.message, feedbackId })
      return { data: null, error }
    }

    logger.info('Starred status toggled', { feedbackId, isStarred })
    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in toggleStarred', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

// ============================================================================
// REPLY OPERATIONS
// ============================================================================

/**
 * Get replies for a feedback item
 */
export async function getFeedbackReplies(
  feedbackId: string
): Promise<{ data: FeedbackReply[] | null; error: any }> {
  try {
    logger.info('Fetching feedback replies', { feedbackId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback_replies')
      .select('*')
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch replies', { error: error.message, feedbackId })
      return { data: null, error }
    }

    logger.info('Replies fetched successfully', {
      feedbackId,
      count: data?.length || 0
    })

    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in getFeedbackReplies', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

/**
 * Add reply to feedback
 */
export async function addFeedbackReply(
  feedbackId: string,
  userId: string,
  replyText: string,
  isSolution: boolean = false
): Promise<{ data: FeedbackReply | null; error: any }> {
  try {
    logger.info('Adding feedback reply', { feedbackId, userId, isSolution })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback_replies')
      .insert({
        feedback_id: feedbackId,
        user_id: userId,
        reply_text: replyText,
        is_solution: isSolution
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add reply', { error: error.message, feedbackId })
      return { data: null, error }
    }

    logger.info('Reply added successfully', { replyId: data.id, feedbackId })
    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in addFeedbackReply', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

/**
 * Mark reply as solution
 */
export async function markReplyAsSolution(
  replyId: string,
  userId: string
): Promise<{ data: FeedbackReply | null; error: any }> {
  try {
    logger.info('Marking reply as solution', { replyId, userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback_replies')
      .update({ is_solution: true })
      .eq('id', replyId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark as solution', { error: error.message, replyId })
      return { data: null, error }
    }

    logger.info('Reply marked as solution', { replyId })
    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in markReplyAsSolution', { error: error.message, replyId })
    return { data: null, error }
  }
}

/**
 * Delete reply
 */
export async function deleteFeedbackReply(
  replyId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting feedback reply', { replyId, userId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_feedback_replies')
      .delete()
      .eq('id', replyId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete reply', { error: error.message, replyId })
      return { success: false, error }
    }

    logger.info('Reply deleted successfully', { replyId })
    return { success: true, error: null }

  } catch (error: any) {
    logger.error('Exception in deleteFeedbackReply', { error: error.message, replyId })
    return { success: false, error }
  }
}

// ============================================================================
// VOTING OPERATIONS
// ============================================================================

/**
 * Get user's vote for a feedback item
 */
export async function getUserVote(
  feedbackId: string,
  userId: string
): Promise<{ data: FeedbackVote | null; error: any }> {
  try {
    logger.debug('Fetching user vote', { feedbackId, userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_feedback_votes')
      .select('*')
      .eq('feedback_id', feedbackId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      logger.error('Failed to fetch user vote', { error: error.message, feedbackId })
      return { data: null, error }
    }

    return { data, error: null }

  } catch (error: any) {
    logger.error('Exception in getUserVote', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

/**
 * Vote on feedback (upvote or downvote)
 * Automatically handles vote count updates via database trigger
 */
export async function voteFeedback(
  feedbackId: string,
  userId: string,
  voteType: VoteType
): Promise<{ data: FeedbackVote | null; error: any }> {
  try {
    logger.info('Voting on feedback', { feedbackId, userId, voteType })

    const supabase = createClient()

    // Check if user already voted
    const { data: existingVote } = await getUserVote(feedbackId, userId)

    if (existingVote) {
      // Update existing vote
      if (existingVote.vote_type === voteType) {
        // Same vote - remove it (toggle off)
        const { error: deleteError } = await supabase
          .from('collaboration_feedback_votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          logger.error('Failed to remove vote', { error: deleteError.message, feedbackId })
          return { data: null, error: deleteError }
        }

        logger.info('Vote removed', { feedbackId, voteType })
        return { data: null, error: null }
      } else {
        // Different vote - update it
        const { data, error } = await supabase
          .from('collaboration_feedback_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
          .select()
          .single()

        if (error) {
          logger.error('Failed to update vote', { error: error.message, feedbackId })
          return { data: null, error }
        }

        logger.info('Vote updated', { feedbackId, oldVote: existingVote.vote_type, newVote: voteType })
        return { data, error: null }
      }
    } else {
      // Insert new vote
      const { data, error } = await supabase
        .from('collaboration_feedback_votes')
        .insert({
          feedback_id: feedbackId,
          user_id: userId,
          vote_type: voteType
        })
        .select()
        .single()

      if (error) {
        logger.error('Failed to add vote', { error: error.message, feedbackId })
        return { data: null, error }
      }

      logger.info('Vote added', { feedbackId, voteType })
      return { data, error: null }
    }

  } catch (error: any) {
    logger.error('Exception in voteFeedback', { error: error.message, feedbackId })
    return { data: null, error }
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(
  userId: string
): Promise<{ data: any | null; error: any }> {
  try {
    logger.info('Fetching feedback statistics', { userId })

    const supabase = createClient()

    // Get all feedback for user
    const { data: feedback, error: feedbackError } = await supabase
      .from('collaboration_feedback')
      .select('*')
      .eq('user_id', userId)

    if (feedbackError) {
      logger.error('Failed to fetch feedback for stats', { error: feedbackError.message })
      return { data: null, error: feedbackError }
    }

    const stats = {
      total: feedback?.length || 0,
      byCategory: {
        bug: feedback?.filter(f => f.category === 'bug').length || 0,
        feature: feedback?.filter(f => f.category === 'feature').length || 0,
        improvement: feedback?.filter(f => f.category === 'improvement').length || 0,
        question: feedback?.filter(f => f.category === 'question').length || 0,
        other: feedback?.filter(f => f.category === 'other').length || 0
      },
      byPriority: {
        low: feedback?.filter(f => f.priority === 'low').length || 0,
        medium: feedback?.filter(f => f.priority === 'medium').length || 0,
        high: feedback?.filter(f => f.priority === 'high').length || 0,
        urgent: feedback?.filter(f => f.priority === 'urgent').length || 0
      },
      byStatus: {
        open: feedback?.filter(f => f.status === 'open').length || 0,
        in_progress: feedback?.filter(f => f.status === 'in_progress').length || 0,
        resolved: feedback?.filter(f => f.status === 'resolved').length || 0,
        closed: feedback?.filter(f => f.status === 'closed').length || 0
      },
      totalUpvotes: feedback?.reduce((sum, f) => sum + f.upvotes, 0) || 0,
      totalDownvotes: feedback?.reduce((sum, f) => sum + f.downvotes, 0) || 0,
      starred: feedback?.filter(f => f.is_starred).length || 0,
      flagged: feedback?.filter(f => f.is_flagged).length || 0,
      assigned: feedback?.filter(f => f.assigned_to !== null).length || 0
    }

    logger.info('Feedback statistics calculated', { userId, totalFeedback: stats.total })
    return { data: stats, error: null }

  } catch (error: any) {
    logger.error('Exception in getFeedbackStats', { error: error.message, userId })
    return { data: null, error }
  }
}

/**
 * Get reply count for a feedback item
 */
export async function getFeedbackReplyCount(
  feedbackId: string
): Promise<{ count: number; error: any }> {
  try {
    const supabase = createClient()

    const { count, error } = await supabase
      .from('collaboration_feedback_replies')
      .select('*', { count: 'exact', head: true })
      .eq('feedback_id', feedbackId)

    if (error) {
      logger.error('Failed to get reply count', { error: error.message, feedbackId })
      return { count: 0, error }
    }

    return { count: count || 0, error: null }

  } catch (error: any) {
    logger.error('Exception in getFeedbackReplyCount', { error: error.message, feedbackId })
    return { count: 0, error }
  }
}
