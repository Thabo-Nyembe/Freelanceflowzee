// Server Actions for Polls Management
// Created: December 14, 2024

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('polls-actions')

interface CreatePollData {
  question: string
  description?: string
  poll_type: string
  status?: string
  options: any
  option_count?: number
  allow_custom_options?: boolean
  randomize_options?: boolean
  allow_multiple_votes?: boolean
  require_authentication?: boolean
  allow_anonymous?: boolean
  show_results_before_voting?: boolean
  show_results_after_voting?: boolean
  starts_at?: string
  ends_at?: string
  duration_hours?: number
  display_mode?: string
  show_vote_count?: boolean
  show_percentage?: boolean
  show_voter_names?: boolean
  is_public?: boolean
  target_audience?: string
  allowed_voters?: any
  embedded_in_page?: string
  location?: string
  context?: any
  enable_comments?: boolean
  enable_sharing?: boolean
  enable_notifications?: boolean
  tags?: any
  metadata?: any
}

interface UpdatePollData extends Partial<CreatePollData> {
  id: string
}

// Create new poll
export async function createPoll(data: CreatePollData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: poll, error } = await supabase
      .from('polls')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create poll', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll created successfully', { pollId: poll.id })
    return actionSuccess(poll, 'Poll created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update existing poll
export async function updatePoll({ id, ...data }: UpdatePollData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: poll, error } = await supabase
      .from('polls')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update poll', { error, pollId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll updated successfully', { pollId: id })
    return actionSuccess(poll, 'Poll updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete poll (soft delete)
export async function deletePoll(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('polls')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete poll', { error, pollId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll deleted successfully', { pollId: id })
    return actionSuccess({ success: true }, 'Poll deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Activate poll
export async function activatePoll(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: poll, error } = await supabase
      .from('polls')
      .update({
        status: 'active',
        starts_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate poll', { error, pollId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll activated successfully', { pollId: id })
    return actionSuccess(poll, 'Poll activated successfully')
  } catch (error: any) {
    logger.error('Unexpected error activating poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Pause poll
export async function pausePoll(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: poll, error } = await supabase
      .from('polls')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause poll', { error, pollId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll paused successfully', { pollId: id })
    return actionSuccess(poll, 'Poll paused successfully')
  } catch (error: any) {
    logger.error('Unexpected error pausing poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Close poll
export async function closePoll(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: poll, error } = await supabase
      .from('polls')
      .update({
        status: 'closed',
        ends_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to close poll', { error, pollId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll closed successfully', { pollId: id })
    return actionSuccess(poll, 'Poll closed successfully')
  } catch (error: any) {
    logger.error('Unexpected error closing poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Duplicate poll
export async function duplicatePoll(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get original poll
    const { data: originalPoll, error: fetchError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch original poll', { error: fetchError, pollId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    // Create duplicate
    const { id: _, created_at, updated_at, deleted_at, ...pollData } = originalPoll
    const { data: duplicatedPoll, error: duplicateError } = await supabase
      .from('polls')
      .insert({
        ...pollData,
        question: `${pollData.question} (Copy)`,
        status: 'draft',
        total_votes: 0,
        total_voters: 0,
        views_count: 0,
        shares_count: 0,
        comments_count: 0,
        results: {},
        winner_option_id: null
      })
      .select()
      .single()

    if (duplicateError) {
      logger.error('Failed to duplicate poll', { error: duplicateError, pollId: id })
      return actionError(duplicateError.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/polls-v2')
    logger.info('Poll duplicated successfully', { originalId: id, duplicateId: duplicatedPoll.id })
    return actionSuccess(duplicatedPoll, 'Poll duplicated successfully')
  } catch (error: any) {
    logger.error('Unexpected error duplicating poll', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Increment poll views
export async function incrementPollViews(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_poll_views', { poll_id: id })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: poll } = await supabase
        .from('polls')
        .select('views_count')
        .eq('id', id)
        .single()

      if (poll) {
        const { error: updateError } = await supabase
          .from('polls')
          .update({ views_count: (poll.views_count || 0) + 1 })
          .eq('id', id)

        if (updateError) {
          logger.error('Failed to increment poll views', { error: updateError, pollId: id })
          return actionError(updateError.message, 'DATABASE_ERROR')
        }
      }
    }

    revalidatePath('/dashboard/polls-v2')
    return actionSuccess({ success: true }, 'Poll views incremented successfully')
  } catch (error: any) {
    logger.error('Unexpected error incrementing poll views', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get poll statistics
export async function getPollStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: polls, error } = await supabase
      .from('polls')
      .select('status, poll_type, total_votes, total_voters, views_count')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch poll stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: polls?.length || 0,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      totalVotes: 0,
      totalVoters: 0,
      totalViews: 0
    }

    polls?.forEach(poll => {
      stats.byStatus[poll.status] = (stats.byStatus[poll.status] || 0) + 1
      stats.byType[poll.poll_type] = (stats.byType[poll.poll_type] || 0) + 1
      stats.totalVotes += poll.total_votes || 0
      stats.totalVoters += poll.total_voters || 0
      stats.totalViews += poll.views_count || 0
    })

    logger.info('Poll stats fetched successfully')
    return actionSuccess(stats, 'Poll statistics retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching poll stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
