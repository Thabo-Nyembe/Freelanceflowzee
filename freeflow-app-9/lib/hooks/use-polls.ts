// Hook for Polls management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type PollType = 'single-choice' | 'multiple-choice' | 'rating' | 'ranking' | 'open-ended'
export type PollStatus = 'draft' | 'active' | 'paused' | 'closed' | 'archived'
export type DisplayMode = 'standard' | 'compact' | 'card' | 'banner'
export type TargetAudience = 'all' | 'members' | 'followers' | 'custom'

export interface Poll {
  id: string
  user_id: string
  organization_id: string | null
  question: string
  description: string | null
  poll_type: PollType
  status: PollStatus
  options: any
  option_count: number
  allow_custom_options: boolean
  randomize_options: boolean
  allow_multiple_votes: boolean
  require_authentication: boolean
  allow_anonymous: boolean
  show_results_before_voting: boolean
  show_results_after_voting: boolean
  starts_at: string | null
  ends_at: string | null
  duration_hours: number | null
  total_votes: number
  total_voters: number
  results: any
  winner_option_id: string | null
  views_count: number
  shares_count: number
  comments_count: number
  display_mode: DisplayMode
  show_vote_count: boolean
  show_percentage: boolean
  show_voter_names: boolean
  is_public: boolean
  target_audience: TargetAudience
  allowed_voters: any
  embedded_in_page: string | null
  location: string | null
  context: any
  enable_comments: boolean
  enable_sharing: boolean
  enable_notifications: boolean
  tags: any
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UsePollsOptions {
  status?: PollStatus | 'all'
  pollType?: PollType | 'all'
  limit?: number
}

export function usePolls(options: UsePollsOptions = {}) {
  const { status, pollType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (pollType && pollType !== 'all') filters.poll_type = pollType

  const queryOptions: any = {
    table: 'polls',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Poll>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'polls',
    onSuccess: refetch
  })

  return {
    polls: data,
    loading,
    error,
    mutating,
    createPoll: create,
    updatePoll: update,
    deletePoll: remove,
    refetch
  }
}
