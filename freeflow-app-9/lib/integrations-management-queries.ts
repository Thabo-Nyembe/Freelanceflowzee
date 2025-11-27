/**
 * Integrations Management Database Queries
 * Templates, marketplace, rate limiting, health monitoring
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type TemplateType = 'quickstart' | 'advanced' | 'custom' | 'community' | 'official'
export type MarketplaceStatus = 'published' | 'draft' | 'pending' | 'approved' | 'rejected' | 'deprecated'
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
export type RateLimitPeriod = 'minute' | 'hour' | 'day' | 'month'

export interface IntegrationTemplate {
  id: string
  user_id?: string
  template_name: string
  template_type: TemplateType
  description: string
  integration_id?: string
  config_template: Record<string, any>
  default_settings: Record<string, any>
  required_variables: string[]
  optional_variables: string[]
  category: string
  tags: string[]
  difficulty: string
  usage_count: number
  likes_count: number
  is_published: boolean
  is_featured: boolean
  version: string
  setup_guide?: string
  video_url?: string
  examples: any[]
  created_at: string
  updated_at: string
}

export interface IntegrationMarketplace {
  id: string
  developer_user_id: string
  listing_name: string
  display_name: string
  short_description: string
  full_description: string
  status: MarketplaceStatus
  integration_category: string
  supported_platforms: string[]
  is_free: boolean
  price?: number
  pricing_model?: string
  logo_url?: string
  screenshots: string[]
  video_url?: string
  total_installs: number
  active_users: number
  average_rating: number
  total_reviews: number
  developer_name: string
  developer_website?: string
  support_email?: string
  documentation_url?: string
  published_at?: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface IntegrationRateLimit {
  id: string
  integration_id: string
  user_id: string
  endpoint?: string
  limit_period: RateLimitPeriod
  max_requests: number
  current_requests: number
  period_start: string
  period_end: string
  is_throttled: boolean
  throttled_until?: string
  auto_reset: boolean
  last_reset_at?: string
  created_at: string
  updated_at: string
}

export interface IntegrationHealthCheck {
  id: string
  integration_id: string
  health_status: HealthStatus
  response_time_ms?: number
  uptime_percentage?: number
  error_rate?: number
  last_check_at: string
  next_check_at?: string
  check_interval_minutes: number
  last_success_at?: string
  last_failure_at?: string
  consecutive_failures: number
  last_error_message?: string
  last_error_code?: string
  alert_threshold: number
  alert_sent: boolean
  alert_sent_at?: string
  created_at: string
  updated_at: string
}

export interface IntegrationDependency {
  id: string
  integration_id: string
  depends_on_integration_id: string
  dependency_type: string
  description?: string
  min_version?: string
  max_version?: string
  is_satisfied: boolean
  created_at: string
}

// ============================================================================
// INTEGRATION TEMPLATES
// ============================================================================

export async function getPublishedTemplates(category?: string, limit: number = 50) {
  const supabase = createClient()
  let query = supabase
    .from('integration_templates')
    .select('*')
    .eq('is_published', true)
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (category) {
    query = query.eq('category', category)
  }

  return await query
}

export async function getFeaturedTemplates(limit: number = 10) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('usage_count', { ascending: false })
    .limit(limit)
}

export async function getTemplateById(templateId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .select('*')
    .eq('id', templateId)
    .single()
}

export async function getUserTemplates(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createTemplate(userId: string | null, templateData: Partial<IntegrationTemplate>) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .insert({
      user_id: userId,
      ...templateData
    })
    .select()
    .single()
}

export async function updateTemplate(templateId: string, updates: Partial<IntegrationTemplate>) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()
}

export async function deleteTemplate(templateId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .delete()
    .eq('id', templateId)
}

export async function publishTemplate(templateId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .update({ is_published: true })
    .eq('id', templateId)
    .select()
    .single()
}

export async function featureTemplate(templateId: string, featured: boolean) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .update({ is_featured: featured })
    .eq('id', templateId)
    .select()
    .single()
}

export async function incrementTemplateLikes(templateId: string) {
  const supabase = createClient()

  const { data: template } = await getTemplateById(templateId)

  if (!template) {
    return { data: null, error: new Error('Template not found') }
  }

  return await supabase
    .from('integration_templates')
    .update({ likes_count: template.likes_count + 1 })
    .eq('id', templateId)
    .select()
    .single()
}

export async function searchTemplates(searchTerm: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('integration_templates')
    .select('*')
    .eq('is_published', true)
    .or(`template_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order('usage_count', { ascending: false })
    .limit(limit)
}

// ============================================================================
// MARKETPLACE
// ============================================================================

export async function getMarketplaceListings(status?: MarketplaceStatus, limit: number = 100) {
  const supabase = createClient()
  let query = supabase
    .from('integration_marketplace')
    .select('*')
    .order('total_installs', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  } else {
    query = query.in('status', ['published', 'approved'])
  }

  return await query
}

export async function getMarketplaceListingById(listingId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .select('*')
    .eq('id', listingId)
    .single()
}

export async function getDeveloperListings(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .select('*')
    .eq('developer_user_id', userId)
    .order('created_at', { ascending: false })
}

export async function createMarketplaceListing(userId: string, listingData: Partial<IntegrationMarketplace>) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .insert({
      developer_user_id: userId,
      ...listingData
    })
    .select()
    .single()
}

export async function updateMarketplaceListing(listingId: string, updates: Partial<IntegrationMarketplace>) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .update(updates)
    .eq('id', listingId)
    .select()
    .single()
}

export async function deleteMarketplaceListing(listingId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .delete()
    .eq('id', listingId)
}

export async function submitForApproval(listingId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .update({ status: 'pending' })
    .eq('id', listingId)
    .select()
    .single()
}

export async function approveListing(listingId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .update({ status: 'approved' })
    .eq('id', listingId)
    .select()
    .single()
}

export async function rejectListing(listingId: string, reason: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .update({
      status: 'rejected',
      rejection_reason: reason
    })
    .eq('id', listingId)
    .select()
    .single()
}

export async function publishListing(listingId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .update({ status: 'published' })
    .eq('id', listingId)
    .select()
    .single()
}

export async function getTopRatedListings(limit: number = 20) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .select('*')
    .in('status', ['published', 'approved'])
    .order('average_rating', { ascending: false })
    .order('total_reviews', { ascending: false })
    .limit(limit)
}

export async function searchMarketplace(searchTerm: string, limit: number = 50) {
  const supabase = createClient()
  return await supabase
    .from('integration_marketplace')
    .select('*')
    .in('status', ['published', 'approved'])
    .or(`display_name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,full_description.ilike.%${searchTerm}%`)
    .order('total_installs', { ascending: false })
    .limit(limit)
}

// ============================================================================
// RATE LIMITS
// ============================================================================

export async function getIntegrationRateLimits(integrationId: string, userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_rate_limits')
    .select('*')
    .eq('integration_id', integrationId)
    .eq('user_id', userId)
}

export async function getRateLimit(integrationId: string, userId: string, endpoint: string | null, period: RateLimitPeriod) {
  const supabase = createClient()
  let query = supabase
    .from('integration_rate_limits')
    .select('*')
    .eq('integration_id', integrationId)
    .eq('user_id', userId)
    .eq('limit_period', period)

  if (endpoint) {
    query = query.eq('endpoint', endpoint)
  }

  return await query.single()
}

export async function createRateLimit(rateLimitData: Partial<IntegrationRateLimit>) {
  const supabase = createClient()

  // Calculate period_end based on limit_period
  const now = new Date()
  let periodEnd: Date

  switch (rateLimitData.limit_period) {
    case 'minute':
      periodEnd = new Date(now.getTime() + 60 * 1000)
      break
    case 'hour':
      periodEnd = new Date(now.getTime() + 60 * 60 * 1000)
      break
    case 'day':
      periodEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      break
    case 'month':
      periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      break
    default:
      throw new Error(`Invalid rate limit period: ${rateLimitData.limit_period}`)
  }

  return await supabase
    .from('integration_rate_limits')
    .insert({
      ...rateLimitData,
      period_end: periodEnd.toISOString()
    })
    .select()
    .single()
}

export async function incrementRateLimitUsage(rateLimitId: string) {
  const supabase = createClient()

  const { data: rateLimit } = await supabase
    .from('integration_rate_limits')
    .select('current_requests')
    .eq('id', rateLimitId)
    .single()

  if (!rateLimit) {
    return { data: null, error: new Error('Rate limit not found') }
  }

  return await supabase
    .from('integration_rate_limits')
    .update({ current_requests: rateLimit.current_requests + 1 })
    .eq('id', rateLimitId)
    .select()
    .single()
}

export async function resetRateLimit(rateLimitId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_rate_limits')
    .update({
      current_requests: 0,
      is_throttled: false,
      throttled_until: null,
      last_reset_at: new Date().toISOString()
    })
    .eq('id', rateLimitId)
    .select()
    .single()
}

export async function checkRateLimitExceeded(integrationId: string, userId: string, endpoint: string | null, period: RateLimitPeriod): Promise<{ exceeded: boolean; remainingRequests: number; resetAt?: string }> {
  const { data: rateLimit } = await getRateLimit(integrationId, userId, endpoint, period)

  if (!rateLimit) {
    return { exceeded: false, remainingRequests: Infinity }
  }

  const exceeded = rateLimit.current_requests >= rateLimit.max_requests || rateLimit.is_throttled

  return {
    exceeded,
    remainingRequests: Math.max(0, rateLimit.max_requests - rateLimit.current_requests),
    resetAt: rateLimit.period_end
  }
}

export async function getThrottledIntegrations(userId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_throttled', true)
    .order('throttled_until')
}

// ============================================================================
// HEALTH CHECKS
// ============================================================================

export async function getIntegrationHealth(integrationId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_health_checks')
    .select('*')
    .eq('integration_id', integrationId)
    .single()
}

export async function createHealthCheck(integrationId: string, healthData?: Partial<IntegrationHealthCheck>) {
  const supabase = createClient()
  return await supabase
    .from('integration_health_checks')
    .insert({
      integration_id: integrationId,
      ...healthData
    })
    .select()
    .single()
}

export async function updateHealthCheck(integrationId: string, updates: Partial<IntegrationHealthCheck>) {
  const supabase = createClient()
  return await supabase
    .from('integration_health_checks')
    .update(updates)
    .eq('integration_id', integrationId)
    .select()
    .single()
}

export async function recordHealthCheckResult(integrationId: string, isSuccess: boolean, responseTimeMs?: number, errorMessage?: string, errorCode?: string) {
  const supabase = createClient()

  const healthStatus: HealthStatus = isSuccess ? 'healthy' : 'unhealthy'

  const updates: Partial<IntegrationHealthCheck> = {
    health_status: healthStatus,
    response_time_ms: responseTimeMs,
    last_check_at: new Date().toISOString()
  }

  if (isSuccess) {
    updates.last_success_at = new Date().toISOString()
  } else {
    updates.last_failure_at = new Date().toISOString()
    updates.last_error_message = errorMessage
    updates.last_error_code = errorCode
  }

  return await updateHealthCheck(integrationId, updates)
}

export async function getUnhealthyIntegrations() {
  const supabase = createClient()
  return await supabase
    .from('integration_health_checks')
    .select('*')
    .in('health_status', ['degraded', 'unhealthy'])
    .order('consecutive_failures', { ascending: false })
}

export async function getDueHealthChecks() {
  const supabase = createClient()
  return await supabase
    .from('integration_health_checks')
    .select('*')
    .lte('next_check_at', new Date().toISOString())
    .order('next_check_at')
}

export async function updateCheckInterval(integrationId: string, intervalMinutes: number) {
  const supabase = createClient()
  return await supabase
    .from('integration_health_checks')
    .update({ check_interval_minutes: intervalMinutes })
    .eq('integration_id', integrationId)
    .select()
    .single()
}

// ============================================================================
// DEPENDENCIES
// ============================================================================

export async function getIntegrationDependencies(integrationId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_dependencies')
    .select('*')
    .eq('integration_id', integrationId)
}

export async function createDependency(dependencyData: Partial<IntegrationDependency>) {
  const supabase = createClient()
  return await supabase
    .from('integration_dependencies')
    .insert(dependencyData)
    .select()
    .single()
}

export async function updateDependency(dependencyId: string, updates: Partial<IntegrationDependency>) {
  const supabase = createClient()
  return await supabase
    .from('integration_dependencies')
    .update(updates)
    .eq('id', dependencyId)
    .select()
    .single()
}

export async function deleteDependency(dependencyId: string) {
  const supabase = createClient()
  return await supabase
    .from('integration_dependencies')
    .delete()
    .eq('id', dependencyId)
}

export async function checkDependenciesSatisfied(integrationId: string): Promise<{ allSatisfied: boolean; unsatisfied: IntegrationDependency[] }> {
  const { data: dependencies } = await getIntegrationDependencies(integrationId)

  if (!dependencies) {
    return { allSatisfied: true, unsatisfied: [] }
  }

  const requiredDeps = dependencies.filter(d => d.dependency_type === 'required')
  const unsatisfied = requiredDeps.filter(d => !d.is_satisfied)

  return {
    allSatisfied: unsatisfied.length === 0,
    unsatisfied
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getIntegrationsManagementStats() {
  const supabase = createClient()

  const [
    templatesResult,
    marketplaceResult,
    rateLimitsResult,
    healthChecksResult,
    dependenciesResult
  ] = await Promise.all([
    supabase.from('integration_templates').select('*').eq('is_published', true),
    supabase.from('integration_marketplace').select('*').in('status', ['published', 'approved']),
    supabase.from('integration_rate_limits').select('*').eq('is_throttled', true),
    supabase.from('integration_health_checks').select('*'),
    supabase.from('integration_dependencies').select('*')
  ])

  const templates = templatesResult.data || []
  const listings = marketplaceResult.data || []
  const throttled = rateLimitsResult.data || []
  const healthChecks = healthChecksResult.data || []
  const dependencies = dependenciesResult.data || []

  const healthyIntegrations = healthChecks.filter(h => h.health_status === 'healthy').length
  const unhealthyIntegrations = healthChecks.filter(h => h.health_status === 'unhealthy').length
  const degradedIntegrations = healthChecks.filter(h => h.health_status === 'degraded').length

  return {
    templates: {
      total: templates.length,
      featured: templates.filter(t => t.is_featured).length,
      totalUsage: templates.reduce((sum, t) => sum + t.usage_count, 0),
      mostPopular: templates.sort((a, b) => b.usage_count - a.usage_count).slice(0, 5)
    },
    marketplace: {
      total: listings.length,
      totalInstalls: listings.reduce((sum, l) => sum + l.total_installs, 0),
      activeUsers: listings.reduce((sum, l) => sum + l.active_users, 0),
      averageRating: listings.length > 0 ? listings.reduce((sum, l) => sum + l.average_rating, 0) / listings.length : 0,
      topRated: listings.sort((a, b) => b.average_rating - a.average_rating).slice(0, 5)
    },
    rateLimits: {
      total: throttled.length,
      byPeriod: throttled.reduce((acc, r) => {
        acc[r.limit_period] = (acc[r.limit_period] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
    health: {
      total: healthChecks.length,
      healthy: healthyIntegrations,
      degraded: degradedIntegrations,
      unhealthy: unhealthyIntegrations,
      healthPercentage: healthChecks.length > 0 ? (healthyIntegrations / healthChecks.length) * 100 : 0
    },
    dependencies: {
      total: dependencies.length,
      satisfied: dependencies.filter(d => d.is_satisfied).length,
      unsatisfied: dependencies.filter(d => !d.is_satisfied).length
    }
  }
}
