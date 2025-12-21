/**
 * Supabase Analytics Buckets Integration
 *
 * Supabase 2025 Feature: Analytics Buckets (Public Alpha)
 * Columnar storage for analytical workloads
 * Built on Apache Iceberg and AWS S3 Tables
 *
 * @see https://supabase.com/changelog
 */

import { createClient } from '@/lib/supabase/client'

// ============================================
// USER ACTIVITY TRACKING
// ============================================

export interface UserActivityData {
  userId: string
  sessionId?: string
  pageViews?: number
  actionsCount?: number
  durationSeconds?: number
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  browser?: string
  os?: string
}

/**
 * Track user activity for the current hour
 */
export async function trackUserActivity(data: UserActivityData) {
  const supabase = createClient()
  const now = new Date()

  const { error } = await supabase.from('analytics_user_activity').upsert(
    {
      user_id: data.userId,
      date: now.toISOString().split('T')[0],
      hour: now.getHours(),
      day_of_week: now.getDay(),
      week_of_year: getWeekNumber(now),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      sessions_count: 1,
      page_views: data.pageViews || 0,
      actions_count: data.actionsCount || 0,
      total_duration_seconds: data.durationSeconds || 0,
      device_type: data.deviceType,
      browser: data.browser,
      os: data.os,
      updated_at: now.toISOString(),
    },
    {
      onConflict: 'user_id,date,hour',
    }
  )

  if (error) console.error('Error tracking user activity:', error)
  return { success: !error }
}

/**
 * Increment specific activity metrics
 */
export async function incrementActivityMetric(
  userId: string,
  metric: 'files_uploaded' | 'files_downloaded' | 'messages_sent' | 'projects_created' | 'tasks_completed' | 'ai_generations',
  count: number = 1
) {
  const supabase = createClient()
  const now = new Date()

  // First try to increment existing record
  const { data, error } = await supabase.rpc('increment_activity_metric', {
    p_user_id: userId,
    p_date: now.toISOString().split('T')[0],
    p_hour: now.getHours(),
    p_metric: metric,
    p_count: count,
  })

  if (error) {
    // If RPC doesn't exist, fallback to direct update
    console.warn('RPC not available, using direct update')
    return { success: false }
  }

  return { success: true, data }
}

// ============================================
// FEATURE USAGE TRACKING
// ============================================

export interface FeatureUsageData {
  featureName: string
  featureCategory: 'ai' | 'storage' | 'collaboration' | 'communication' | 'billing' | 'analytics'
  success: boolean
  durationMs?: number
  userTier?: 'free' | 'pro' | 'enterprise'
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(data: FeatureUsageData) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('analytics_feature_usage').upsert(
    {
      date: today,
      feature_name: data.featureName,
      feature_category: data.featureCategory,
      total_uses: 1,
      success_count: data.success ? 1 : 0,
      error_count: data.success ? 0 : 1,
      avg_duration_ms: data.durationMs || 0,
    },
    {
      onConflict: 'date,feature_name',
    }
  )

  if (error) console.error('Error tracking feature usage:', error)
  return { success: !error }
}

// ============================================
// CONVERSION FUNNEL TRACKING
// ============================================

export interface FunnelStepData {
  funnelName: string
  step: number
  stepName: string
  completed: boolean
  timeInStepSeconds?: number
}

/**
 * Track conversion funnel progress
 */
export async function trackFunnelStep(data: FunnelStepData) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('analytics_conversion_funnels').upsert(
    {
      date: today,
      funnel_name: data.funnelName,
      funnel_step: data.step,
      step_name: data.stepName,
      users_entered: 1,
      users_completed: data.completed ? 1 : 0,
      avg_time_in_step_seconds: data.timeInStepSeconds || 0,
    },
    {
      onConflict: 'date,funnel_name,funnel_step',
    }
  )

  if (error) console.error('Error tracking funnel step:', error)
  return { success: !error }
}

// ============================================
// AI USAGE TRACKING
// ============================================

export interface AIUsageData {
  modelName: string
  modelProvider: 'openai' | 'anthropic' | 'google' | 'mistral' | 'local'
  requestType: 'chat' | 'completion' | 'embedding' | 'image'
  inputTokens: number
  outputTokens: number
  success: boolean
  latencyMs: number
  estimatedCostCents?: number
}

/**
 * Track AI model usage
 */
export async function trackAIUsage(data: AIUsageData) {
  const supabase = createClient()
  const now = new Date()

  const { error } = await supabase.from('analytics_ai_usage').upsert(
    {
      date: now.toISOString().split('T')[0],
      hour: now.getHours(),
      model_name: data.modelName,
      model_provider: data.modelProvider,
      total_requests: 1,
      successful_requests: data.success ? 1 : 0,
      failed_requests: data.success ? 0 : 1,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
      total_tokens: data.inputTokens + data.outputTokens,
      estimated_cost_cents: data.estimatedCostCents || 0,
      avg_latency_ms: data.latencyMs,
      [`${data.requestType}_requests`]: 1,
    },
    {
      onConflict: 'date,hour,model_name',
    }
  )

  if (error) console.error('Error tracking AI usage:', error)
  return { success: !error }
}

// ============================================
// REAL-TIME METRICS
// ============================================

/**
 * Push real-time metric for live dashboards
 */
export async function pushRealtimeMetric(
  metricName: string,
  value: number,
  type: 'gauge' | 'counter' | 'histogram' = 'gauge',
  tags: Record<string, string> = {}
) {
  const supabase = createClient()

  const { error } = await supabase.from('analytics_realtime_metrics').insert({
    metric_name: metricName,
    metric_value: value,
    metric_type: type,
    tags,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h TTL
  })

  if (error) console.error('Error pushing realtime metric:', error)
  return { success: !error }
}

/**
 * Get current real-time metrics
 */
export async function getRealtimeMetrics(metricNames?: string[]) {
  const supabase = createClient()

  let query = supabase
    .from('analytics_realtime_metrics')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('timestamp', { ascending: false })

  if (metricNames?.length) {
    query = query.in('metric_name', metricNames)
  }

  const { data, error } = await query.limit(100)

  if (error) throw error
  return data || []
}

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Get user activity for a date range
 */
export async function getUserActivity(
  userId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('analytics_user_activity')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('hour', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get feature usage trends
 */
export async function getFeatureUsageTrends(
  featureName: string,
  startDate: string,
  endDate: string
) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_feature_usage_trends', {
    feature: featureName,
    start_date: startDate,
    end_date: endDate,
  })

  if (error) throw error
  return data || []
}

/**
 * Get conversion funnel metrics
 */
export async function getFunnelMetrics(funnelName: string, date: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('calculate_funnel_metrics', {
    funnel: funnelName,
    target_date: date,
  })

  if (error) throw error
  return data || []
}

/**
 * Get revenue trends
 */
export async function getRevenueTrends(
  startDate: string,
  endDate: string,
  granularity: 'day' | 'week' | 'month' = 'day'
) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_revenue_trends', {
    start_date: startDate,
    end_date: endDate,
    granularity,
  })

  if (error) throw error
  return data || []
}

/**
 * Get platform metrics summary
 */
export async function getPlatformMetricsSummary(date: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('analytics_platform_metrics')
    .select('*')
    .eq('date', date)
    .order('hour', { ascending: true })

  if (error) throw error

  // Calculate daily totals
  if (data?.length) {
    return {
      date,
      hourlyData: data,
      summary: {
        totalUsers: Math.max(...data.map(d => d.total_users || 0)),
        activeUsers: data.reduce((sum, d) => sum + (d.active_users || 0), 0),
        totalSessions: data.reduce((sum, d) => sum + (d.total_sessions || 0), 0),
        avgSessionDuration: data.reduce((sum, d) => sum + (d.avg_session_duration || 0), 0) / data.length,
        aiRequests: data.reduce((sum, d) => sum + (d.ai_requests || 0), 0),
        totalRevenue: data.reduce((sum, d) => sum + (d.total_revenue_cents || 0), 0),
      },
    }
  }

  return null
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// ============================================
// EXPORT TYPES
// ============================================

export interface UserActivityMetrics {
  date: string
  hour: number
  sessions_count: number
  page_views: number
  actions_count: number
  total_duration_seconds: number
  files_uploaded: number
  files_downloaded: number
  messages_sent: number
  projects_created: number
  tasks_completed: number
  ai_generations: number
}

export interface PlatformMetrics {
  date: string
  hourlyData: Array<{
    hour: number
    active_users: number
    total_sessions: number
    avg_session_duration: number
    ai_requests: number
    total_revenue_cents: number
  }>
  summary: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    avgSessionDuration: number
    aiRequests: number
    totalRevenue: number
  }
}

export interface FeatureUsageTrend {
  date: string
  unique_users: number
  total_uses: number
  success_rate: number
}

export interface FunnelMetric {
  step: number
  step_name: string
  users: number
  conversion_rate: number
  drop_off_rate: number
}
