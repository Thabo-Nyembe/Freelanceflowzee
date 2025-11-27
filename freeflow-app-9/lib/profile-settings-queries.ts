/**
 * Profile Settings Database Queries
 * Profile analytics, activity tracking, social connections, privacy settings
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type ActivityType = 'login' | 'profile_update' | 'settings_change' | 'data_export' | 'password_change' | 'email_change' | 'avatar_upload' | 'skill_add' | 'skill_remove' | 'social_add'
export type ConnectionStatus = 'pending' | 'accepted' | 'blocked' | 'rejected'
export type VisibilityLevel = 'public' | 'connections' | 'private'

export interface ProfileAnalytics {
  id: string
  user_id: string
  total_views: number
  views_this_week: number
  views_this_month: number
  unique_viewers: number
  profile_completeness: number
  response_rate: number
  avg_response_time: number
  followers_count: number
  following_count: number
  connections_count: number
  last_viewed_at?: string
  analytics_refreshed_at: string
  created_at: string
  updated_at: string
}

export interface ProfileActivityLog {
  id: string
  user_id: string
  activity_type: ActivityType
  action: string
  description?: string
  ip_address?: string
  user_agent?: string
  device?: string
  location?: string
  metadata: Record<string, any>
  before_value?: Record<string, any>
  after_value?: Record<string, any>
  created_at: string
}

export interface SocialConnection {
  id: string
  user_id: string
  connected_user_id: string
  status: ConnectionStatus
  connection_type?: string
  requested_at: string
  accepted_at?: string
  rejected_at?: string
  blocked_at?: string
  message?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProfileView {
  id: string
  profile_user_id: string
  viewer_user_id?: string
  view_count: number
  last_viewed_at: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  location?: string
  is_anonymous: boolean
  created_at: string
}

export interface ProfilePrivacySettings {
  id: string
  user_id: string
  profile_visibility: VisibilityLevel
  show_email: VisibilityLevel
  show_phone: VisibilityLevel
  show_location: VisibilityLevel
  show_social_links: VisibilityLevel
  show_online_status: boolean
  show_last_active: boolean
  show_activity: boolean
  searchable: boolean
  allow_indexing: boolean
  show_in_directory: boolean
  notify_on_profile_view: boolean
  notify_on_connection_request: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// PROFILE ANALYTICS
// ============================================================================

export async function getProfileAnalytics(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function createProfileAnalytics(userId: string, analyticsData?: Partial<ProfileAnalytics>) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .insert({
      user_id: userId,
      ...analyticsData
    })
    .select()
    .single()
}

export async function updateProfileAnalytics(userId: string, updates: Partial<ProfileAnalytics>) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function incrementProfileViews(userId: string, weeklyIncrement: boolean = true, monthlyIncrement: boolean = true) {
  const supabase = createClient()

  const { data: analytics } = await getProfileAnalytics(userId)

  if (!analytics) {
    return await createProfileAnalytics(userId, {
      total_views: 1,
      views_this_week: weeklyIncrement ? 1 : 0,
      views_this_month: monthlyIncrement ? 1 : 0
    })
  }

  return await supabase
    .from('profile_analytics')
    .update({
      total_views: analytics.total_views + 1,
      views_this_week: weeklyIncrement ? analytics.views_this_week + 1 : analytics.views_this_week,
      views_this_month: monthlyIncrement ? analytics.views_this_month + 1 : analytics.views_this_month,
      last_viewed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function updateProfileCompleteness(userId: string, completeness: number) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .update({ profile_completeness: Math.min(100, Math.max(0, completeness)) })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function updateResponseMetrics(userId: string, responseRate: number, avgResponseTime: number) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .update({
      response_rate: Math.min(100, Math.max(0, responseRate)),
      avg_response_time: Math.max(0, avgResponseTime)
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function refreshWeeklyViews(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .update({
      views_this_week: 0,
      analytics_refreshed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function refreshMonthlyViews(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_analytics')
    .update({
      views_this_month: 0,
      analytics_refreshed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()
}

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export async function getUserActivityLogs(userId: string, limit: number = 100) {
  const supabase = createClient()
  return await supabase
    .from('profile_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function getActivityLogsByType(userId: string, activityType: ActivityType, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('profile_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_type', activityType)
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function createActivityLog(userId: string, logData: Partial<ProfileActivityLog>) {
  const supabase = createClient()
  return await supabase
    .from('profile_activity_logs')
    .insert({
      user_id: userId,
      ...logData
    })
    .select()
    .single()
}

export async function getRecentActivity(userId: string, days: number = 30, limit: number = 100) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return await supabase
    .from('profile_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)
}

export async function getActivityByDateRange(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_activity_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })
}

export async function deleteOldActivityLogs(userId: string, daysToKeep: number = 90) {
  const supabase = createClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  return await supabase
    .from('profile_activity_logs')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', cutoffDate.toISOString())
}

// ============================================================================
// SOCIAL CONNECTIONS
// ============================================================================

export async function getUserConnections(userId: string, status?: ConnectionStatus) {
  const supabase = createClient()
  let query = supabase
    .from('social_connections')
    .select('*')
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  return await query
}

export async function getPendingConnectionRequests(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .select('*')
    .eq('connected_user_id', userId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })
}

export async function getSentConnectionRequests(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false })
}

export async function getAcceptedConnections(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .select('*')
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })
}

export async function createConnectionRequest(userId: string, connectedUserId: string, message?: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .insert({
      user_id: userId,
      connected_user_id: connectedUserId,
      status: 'pending',
      message
    })
    .select()
    .single()
}

export async function acceptConnectionRequest(connectionId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', connectionId)
    .select()
    .single()
}

export async function rejectConnectionRequest(connectionId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString()
    })
    .eq('id', connectionId)
    .select()
    .single()
}

export async function blockConnection(connectionId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .update({
      status: 'blocked',
      blocked_at: new Date().toISOString()
    })
    .eq('id', connectionId)
    .select()
    .single()
}

export async function removeConnection(connectionId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .delete()
    .eq('id', connectionId)
}

export async function getConnectionById(connectionId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .select('*')
    .eq('id', connectionId)
    .single()
}

export async function checkConnectionExists(userId: string, connectedUserId: string) {
  const supabase = createClient()
  return await supabase
    .from('social_connections')
    .select('*')
    .or(`and(user_id.eq.${userId},connected_user_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},connected_user_id.eq.${userId})`)
    .single()
}

// ============================================================================
// PROFILE VIEWS
// ============================================================================

export async function getProfileViews(profileUserId: string, limit: number = 100) {
  const supabase = createClient()
  return await supabase
    .from('profile_views')
    .select('*')
    .eq('profile_user_id', profileUserId)
    .order('last_viewed_at', { ascending: false })
    .limit(limit)
}

export async function recordProfileView(profileUserId: string, viewerUserId?: string, viewContext?: Partial<ProfileView>) {
  const supabase = createClient()

  // Check if view already exists
  const { data: existingView } = await supabase
    .from('profile_views')
    .select('*')
    .eq('profile_user_id', profileUserId)
    .eq('viewer_user_id', viewerUserId || '')
    .single()

  if (existingView) {
    // Update existing view
    return await supabase
      .from('profile_views')
      .update({
        view_count: existingView.view_count + 1,
        last_viewed_at: new Date().toISOString(),
        ...viewContext
      })
      .eq('id', existingView.id)
      .select()
      .single()
  } else {
    // Create new view record
    return await supabase
      .from('profile_views')
      .insert({
        profile_user_id: profileUserId,
        viewer_user_id: viewerUserId,
        is_anonymous: !viewerUserId,
        ...viewContext
      })
      .select()
      .single()
  }
}

export async function getUniqueViewers(profileUserId: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_views')
    .select('viewer_user_id')
    .eq('profile_user_id', profileUserId)
    .not('viewer_user_id', 'is', null)
}

export async function getRecentViewers(profileUserId: string, limit: number = 20) {
  const supabase = createClient()
  return await supabase
    .from('profile_views')
    .select('*')
    .eq('profile_user_id', profileUserId)
    .not('viewer_user_id', 'is', null)
    .order('last_viewed_at', { ascending: false })
    .limit(limit)
}

export async function getAnonymousViews(profileUserId: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_views')
    .select('*')
    .eq('profile_user_id', profileUserId)
    .eq('is_anonymous', true)
    .order('last_viewed_at', { ascending: false })
}

// ============================================================================
// PRIVACY SETTINGS
// ============================================================================

export async function getPrivacySettings(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
}

export async function createPrivacySettings(userId: string, settingsData?: Partial<ProfilePrivacySettings>) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .insert({
      user_id: userId,
      ...settingsData
    })
    .select()
    .single()
}

export async function updatePrivacySettings(userId: string, updates: Partial<ProfilePrivacySettings>) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
}

export async function updateProfileVisibility(userId: string, visibility: VisibilityLevel) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .update({ profile_visibility: visibility })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function updateContactVisibility(userId: string, emailVisibility: VisibilityLevel, phoneVisibility: VisibilityLevel) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .update({
      show_email: emailVisibility,
      show_phone: phoneVisibility
    })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function toggleSearchability(userId: string, searchable: boolean) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .update({ searchable })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function toggleDirectoryListing(userId: string, showInDirectory: boolean) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .update({ show_in_directory: showInDirectory })
    .eq('user_id', userId)
    .select()
    .single()
}

export async function toggleOnlineStatus(userId: string, showOnlineStatus: boolean) {
  const supabase = createClient()
  return await supabase
    .from('profile_privacy_settings')
    .update({ show_online_status: showOnlineStatus })
    .eq('user_id', userId)
    .select()
    .single()
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getProfileStats(userId: string) {
  const supabase = createClient()

  const [
    analyticsResult,
    connectionsResult,
    viewsResult,
    activityResult,
    privacyResult
  ] = await Promise.all([
    getProfileAnalytics(userId),
    getUserConnections(userId),
    getProfileViews(userId, 100),
    getUserActivityLogs(userId, 100),
    getPrivacySettings(userId)
  ])

  const connections = connectionsResult.data || []
  const views = viewsResult.data || []
  const activity = activityResult.data || []

  const pendingConnections = connections.filter(c => c.status === 'pending').length
  const acceptedConnections = connections.filter(c => c.status === 'accepted').length
  const blockedConnections = connections.filter(c => c.status === 'blocked').length

  const uniqueViewers = new Set(views.filter(v => v.viewer_user_id).map(v => v.viewer_user_id)).size
  const anonymousViews = views.filter(v => v.is_anonymous).length

  const activityByType = activity.reduce((acc, log) => {
    acc[log.activity_type] = (acc[log.activity_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    analytics: analyticsResult.data,
    connections: {
      total: connections.length,
      pending: pendingConnections,
      accepted: acceptedConnections,
      blocked: blockedConnections
    },
    views: {
      total: views.length,
      uniqueViewers,
      anonymousViews,
      recentViews: views.slice(0, 10)
    },
    activity: {
      total: activity.length,
      byType: activityByType,
      recentActivity: activity.slice(0, 20)
    },
    privacy: privacyResult.data
  }
}

export async function getEngagementMetrics(userId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [viewsResult, connectionsResult, activityResult] = await Promise.all([
    supabase
      .from('profile_views')
      .select('*')
      .eq('profile_user_id', userId)
      .gte('last_viewed_at', startDate.toISOString()),
    supabase
      .from('social_connections')
      .select('*')
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .eq('status', 'accepted')
      .gte('accepted_at', startDate.toISOString()),
    supabase
      .from('profile_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
  ])

  const views = viewsResult.data || []
  const newConnections = connectionsResult.data || []
  const activity = activityResult.data || []

  return {
    period: `Last ${days} days`,
    views: views.length,
    newConnections: newConnections.length,
    activityCount: activity.length,
    averageViewsPerDay: views.length / days,
    averageConnectionsPerDay: newConnections.length / days
  }
}
