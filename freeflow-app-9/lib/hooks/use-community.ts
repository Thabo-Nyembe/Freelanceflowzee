'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type CommunityType = 'public' | 'private' | 'invite_only' | 'premium' | 'enterprise' | 'beta'
export type CommunityStatus = 'active' | 'inactive' | 'archived' | 'suspended' | 'deleted'

export interface Community {
  id: string
  user_id: string
  community_name: string
  description?: string
  community_type: CommunityType
  member_count: number
  active_members: number
  pending_requests: number
  max_members?: number
  allow_join_requests: boolean
  require_approval: boolean
  post_count: number
  comment_count: number
  discussion_count: number
  total_posts: number
  total_comments: number
  view_count: number
  like_count: number
  share_count: number
  reaction_count: number
  engagement_score: number
  engagement_rate?: number
  daily_active_users: number
  weekly_active_users: number
  monthly_active_users: number
  last_post_at?: string
  last_activity_at?: string
  moderator_count: number
  moderators?: any[]
  admin_count: number
  admins?: any[]
  banned_users?: any[]
  banned_count: number
  rules?: any[]
  guidelines?: string
  code_of_conduct?: string
  enforce_rules: boolean
  enable_posts: boolean
  enable_comments: boolean
  enable_discussions: boolean
  enable_polls: boolean
  enable_events: boolean
  enable_announcements: boolean
  enable_reactions: boolean
  enable_file_sharing: boolean
  auto_moderation: boolean
  moderation_queue_count: number
  flagged_content_count: number
  removed_content_count: number
  spam_filter_enabled: boolean
  is_public: boolean
  is_searchable: boolean
  is_indexed: boolean
  require_verification: boolean
  minimum_karma: number
  enable_points: boolean
  enable_badges: boolean
  enable_leaderboard: boolean
  total_points_awarded: number
  notify_new_members: boolean
  notify_new_posts: boolean
  notify_mentions: boolean
  notification_settings?: any
  growth_rate?: number
  retention_rate?: number
  churn_rate?: number
  avg_session_duration?: number
  category?: string
  tags?: string[]
  topics?: any[]
  logo_url?: string
  banner_url?: string
  theme?: any
  custom_css?: string
  website_url?: string
  social_links?: any
  contact_email?: string
  is_premium: boolean
  subscription_tier?: string
  subscription_price?: number
  status: CommunityStatus
  is_verified: boolean
  verified_at?: string
  settings?: any
  custom_fields?: any
  notes?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCommunityOptions {
  communityType?: CommunityType | 'all'
  status?: CommunityStatus | 'all'
  limit?: number
}

export function useCommunity(options: UseCommunityOptions = {}) {
  const { communityType, status, limit } = options

  const filters: Record<string, any> = {}
  if (communityType && communityType !== 'all') filters.community_type = communityType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'community',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Community>(queryOptions)

  const { mutate: createCommunity } = useSupabaseMutation({
    table: 'community',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateCommunity } = useSupabaseMutation({
    table: 'community',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteCommunity } = useSupabaseMutation({
    table: 'community',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    communities: data,
    loading,
    error,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    refetch
  }
}
