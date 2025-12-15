// Server Actions for Polls Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function createPoll(data: CreatePollData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: poll, error } = await supabase
    .from('polls')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/polls-v2')
  return poll
}

// Update existing poll
export async function updatePoll({ id, ...data }: UpdatePollData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: poll, error } = await supabase
    .from('polls')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/polls-v2')
  return poll
}

// Delete poll (soft delete)
export async function deletePoll(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('polls')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/polls-v2')
}

// Activate poll
export async function activatePoll(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

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

  if (error) throw error

  revalidatePath('/dashboard/polls-v2')
  return poll
}

// Pause poll
export async function pausePoll(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: poll, error } = await supabase
    .from('polls')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/polls-v2')
  return poll
}

// Close poll
export async function closePoll(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

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

  if (error) throw error

  revalidatePath('/dashboard/polls-v2')
  return poll
}

// Duplicate poll
export async function duplicatePoll(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get original poll
  const { data: originalPoll, error: fetchError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) throw fetchError

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

  if (duplicateError) throw duplicateError

  revalidatePath('/dashboard/polls-v2')
  return duplicatedPoll
}

// Increment poll views
export async function incrementPollViews(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase.rpc('increment_poll_views', { poll_id: id })

  if (error) {
    // Fallback if RPC doesn't exist
    const { data: poll } = await supabase
      .from('polls')
      .select('views_count')
      .eq('id', id)
      .single()

    if (poll) {
      await supabase
        .from('polls')
        .update({ views_count: (poll.views_count || 0) + 1 })
        .eq('id', id)
    }
  }

  revalidatePath('/dashboard/polls-v2')
}

// Get poll statistics
export async function getPollStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: polls, error } = await supabase
    .from('polls')
    .select('status, poll_type, total_votes, total_voters, views_count')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) throw error

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

  return stats
}
