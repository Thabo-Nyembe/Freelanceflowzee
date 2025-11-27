// Feature Roadmap - Supabase Queries
// Coming soon features, user requests, voting, and notifications

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type FeatureStatus = 'planned' | 'in-progress' | 'in-review' | 'completed' | 'on-hold' | 'cancelled'
export type FeaturePriority = 'low' | 'medium' | 'high' | 'critical'
export type FeatureCategory = 'ai' | 'collaboration' | 'productivity' | 'analytics' | 'creative' | 'business' | 'security' | 'performance'
export type RequestStatus = 'pending' | 'under-review' | 'approved' | 'declined' | 'implemented'

export interface RoadmapFeature {
  id: string
  title: string
  description: string
  category: FeatureCategory
  status: FeatureStatus
  priority: FeaturePriority
  estimated_date?: string
  started_at?: string
  completed_at?: string
  progress_percentage: number
  benefits?: string[]
  tags?: string[]
  requirements?: string[]
  votes_count: number
  requests_count: number
  subscribers_count: number
  views_count: number
  is_public: boolean
  is_featured: boolean
  metadata?: any
  created_at: string
  updated_at: string
}

export interface FeatureRequest {
  id: string
  user_id: string
  roadmap_feature_id?: string
  title: string
  description: string
  category: FeatureCategory
  priority: FeaturePriority
  status: RequestStatus
  use_case?: string
  expected_benefit?: string
  alternative_solutions?: string
  votes_count: number
  comments_count: number
  admin_response?: string
  responded_at?: string
  responded_by?: string
  implemented_at?: string
  implementation_notes?: string
  created_at: string
  updated_at: string
}

export interface FeatureVote {
  id: string
  user_id: string
  roadmap_feature_id?: string
  feature_request_id?: string
  vote_type: 'upvote' | 'downvote'
  comment?: string
  created_at: string
}

export interface FeatureNotification {
  id: string
  user_id: string
  roadmap_feature_id?: string
  feature_request_id?: string
  notify_on_update: boolean
  notify_on_completion: boolean
  notify_on_status_change: boolean
  email?: string
  send_email: boolean
  subscribed_at: string
}

export interface FeatureUpdate {
  id: string
  roadmap_feature_id: string
  title: string
  description: string
  update_type: 'progress' | 'status' | 'milestone' | 'note'
  old_progress?: number
  new_progress?: number
  old_status?: FeatureStatus
  new_status?: FeatureStatus
  metadata?: any
  created_at: string
}

export interface PopularRequest {
  request_id: string
  title: string
  votes_count: number
  status: RequestStatus
  created_at: string
}

// ============================================================================
// ROADMAP FEATURES QUERIES
// ============================================================================

/**
 * Get all roadmap features
 */
export async function getRoadmapFeatures(
  status?: FeatureStatus,
  category?: FeatureCategory,
  sortBy: 'recent' | 'popular' | 'priority' = 'recent'
) {
  const supabase = createClient()

  let query = supabase
    .from('roadmap_features')
    .select('*')
    .eq('is_public', true)

  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  // Apply sorting
  switch (sortBy) {
    case 'popular':
      query = query.order('votes_count', { ascending: false })
      break
    case 'priority':
      query = query.order('priority', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data as RoadmapFeature[]
}

/**
 * Get feature by ID
 */
export async function getRoadmapFeature(featureId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roadmap_features')
    .select('*')
    .eq('id', featureId)
    .single()

  if (error) throw error

  // Increment view count
  await supabase
    .from('roadmap_features')
    .update({ views_count: data.views_count + 1 })
    .eq('id', featureId)

  return data as RoadmapFeature
}

/**
 * Get featured features
 */
export async function getFeaturedFeatures(limit: number = 6) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roadmap_features')
    .select('*')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('priority', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as RoadmapFeature[]
}

/**
 * Get in-progress features
 */
export async function getInProgressFeatures(limit: number = 10) {
  return getRoadmapFeatures('in-progress', undefined, 'priority')
}

/**
 * Get completed features
 */
export async function getCompletedFeatures(limit: number = 20) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('roadmap_features')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as RoadmapFeature[]
}

// ============================================================================
// FEATURE REQUESTS QUERIES
// ============================================================================

/**
 * Create feature request
 */
export async function createFeatureRequest(requestData: {
  title: string
  description: string
  category: FeatureCategory
  priority?: FeaturePriority
  use_case?: string
  expected_benefit?: string
  alternative_solutions?: string
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('feature_requests')
    .insert({
      ...requestData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data as FeatureRequest
}

/**
 * Get all feature requests
 */
export async function getFeatureRequests(
  status?: RequestStatus,
  category?: FeatureCategory,
  sortBy: 'recent' | 'popular' = 'popular',
  limit: number = 50
) {
  const supabase = createClient()

  let query = supabase
    .from('feature_requests')
    .select('*')
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category', category)
  }

  // Apply sorting
  if (sortBy === 'popular') {
    query = query.order('votes_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data as FeatureRequest[]
}

/**
 * Get user's feature requests
 */
export async function getUserFeatureRequests(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as FeatureRequest[]
}

/**
 * Get popular feature requests
 */
export async function getPopularRequests(
  category?: FeatureCategory,
  limit: number = 10
): Promise<PopularRequest[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_popular_requests', {
      p_category: category || null,
      p_limit: limit
    })

  if (error) throw error
  return data as PopularRequest[]
}

/**
 * Update feature request status (admin)
 */
export async function updateFeatureRequestStatus(
  requestId: string,
  status: RequestStatus,
  adminResponse?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('feature_requests')
    .update({
      status,
      admin_response: adminResponse,
      responded_at: new Date().toISOString(),
      responded_by: user.id
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// VOTING QUERIES
// ============================================================================

/**
 * Vote for roadmap feature
 */
export async function voteForRoadmapFeature(
  featureId: string,
  voteType: 'upvote' | 'downvote' = 'upvote'
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .rpc('vote_for_feature', {
      p_user_id: user.id,
      p_roadmap_feature_id: featureId,
      p_vote_type: voteType
    })

  if (error) throw error
  return data
}

/**
 * Vote for feature request
 */
export async function voteForFeatureRequest(
  requestId: string,
  voteType: 'upvote' | 'downvote' = 'upvote'
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .rpc('vote_for_feature', {
      p_user_id: user.id,
      p_feature_request_id: requestId,
      p_vote_type: voteType
    })

  if (error) throw error
  return data
}

/**
 * Remove vote
 */
export async function removeVote(
  featureId?: string,
  requestId?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('feature_votes')
    .delete()
    .eq('user_id', user.id)

  if (featureId) {
    query = query.eq('roadmap_feature_id', featureId)
  } else if (requestId) {
    query = query.eq('feature_request_id', requestId)
  }

  const { error } = await query

  if (error) throw error
}

/**
 * Check if user voted
 */
export async function hasUserVoted(
  userId: string,
  featureId?: string,
  requestId?: string
): Promise<boolean> {
  const supabase = createClient()

  let query = supabase
    .from('feature_votes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (featureId) {
    query = query.eq('roadmap_feature_id', featureId)
  } else if (requestId) {
    query = query.eq('feature_request_id', requestId)
  }

  const { count } = await query

  return (count || 0) > 0
}

/**
 * Get user's votes
 */
export async function getUserVotes(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_votes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as FeatureVote[]
}

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

/**
 * Subscribe to feature notifications
 */
export async function subscribeToFeature(
  featureId?: string,
  requestId?: string,
  email?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .rpc('subscribe_to_feature', {
      p_user_id: user.id,
      p_roadmap_feature_id: featureId || null,
      p_feature_request_id: requestId || null,
      p_email: email || null
    })

  if (error) throw error
  return data
}

/**
 * Unsubscribe from feature
 */
export async function unsubscribeFromFeature(
  featureId?: string,
  requestId?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  let query = supabase
    .from('feature_notifications')
    .delete()
    .eq('user_id', user.id)

  if (featureId) {
    query = query.eq('roadmap_feature_id', featureId)
  } else if (requestId) {
    query = query.eq('feature_request_id', requestId)
  }

  const { error } = await query

  if (error) throw error
}

/**
 * Check if user is subscribed
 */
export async function isUserSubscribed(
  userId: string,
  featureId?: string,
  requestId?: string
): Promise<boolean> {
  const supabase = createClient()

  let query = supabase
    .from('feature_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (featureId) {
    query = query.eq('roadmap_feature_id', featureId)
  } else if (requestId) {
    query = query.eq('feature_request_id', requestId)
  }

  const { count } = await query

  return (count || 0) > 0
}

/**
 * Get user's subscriptions
 */
export async function getUserSubscriptions(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_notifications')
    .select(`
      *,
      roadmap_feature:roadmap_feature_id (*),
      feature_request:feature_request_id (*)
    `)
    .eq('user_id', userId)
    .order('subscribed_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// FEATURE UPDATES QUERIES
// ============================================================================

/**
 * Create feature update
 */
export async function createFeatureUpdate(updateData: {
  roadmap_feature_id: string
  title: string
  description: string
  update_type?: 'progress' | 'status' | 'milestone' | 'note'
  old_progress?: number
  new_progress?: number
  old_status?: FeatureStatus
  new_status?: FeatureStatus
  metadata?: any
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_updates')
    .insert(updateData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get feature updates
 */
export async function getFeatureUpdates(
  featureId: string,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_updates')
    .select('*')
    .eq('roadmap_feature_id', featureId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as FeatureUpdate[]
}

/**
 * Get recent updates (all features)
 */
export async function getRecentUpdates(limit: number = 20) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('feature_updates')
    .select(`
      *,
      roadmap_feature:roadmap_feature_id (*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get roadmap statistics
 */
export async function getRoadmapStats() {
  const supabase = createClient()

  const [
    { count: totalFeatures },
    { count: inProgress },
    { count: completed },
    { count: totalRequests },
    { count: totalVotes }
  ] = await Promise.all([
    supabase.from('roadmap_features').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('roadmap_features').select('*', { count: 'exact', head: true }).eq('status', 'in-progress'),
    supabase.from('roadmap_features').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('feature_requests').select('*', { count: 'exact', head: true }),
    supabase.from('feature_votes').select('*', { count: 'exact', head: true })
  ])

  return {
    total_features: totalFeatures || 0,
    in_progress: inProgress || 0,
    completed: completed || 0,
    total_requests: totalRequests || 0,
    total_votes: totalVotes || 0
  }
}

/**
 * Get features by category
 */
export async function getFeaturesByCategory(category: FeatureCategory) {
  return getRoadmapFeatures(undefined, category, 'priority')
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export roadmap features to CSV
 */
export async function exportRoadmapFeatures() {
  const features = await getRoadmapFeatures()

  const headers = ['Title', 'Category', 'Status', 'Priority', 'Progress', 'Votes', 'Estimated Date']
  const rows = features.map(f => [
    f.title,
    f.category,
    f.status,
    f.priority,
    `${f.progress_percentage}%`,
    f.votes_count.toString(),
    f.estimated_date || ''
  ])

  return { headers, rows }
}

/**
 * Export feature requests to CSV
 */
export async function exportFeatureRequests() {
  const requests = await getFeatureRequests()

  const headers = ['Title', 'Category', 'Status', 'Priority', 'Votes', 'Created']
  const rows = requests.map(r => [
    r.title,
    r.category,
    r.status,
    r.priority,
    r.votes_count.toString(),
    r.created_at
  ])

  return { headers, rows }
}
