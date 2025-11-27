/**
 * UI Showcase Analytics Queries
 *
 * Lightweight tracking system for UI component interactions.
 * Tracks which components users interact with for analytics and UX insights.
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ComponentCategory = 'button' | 'card' | 'animation' | 'input' | 'layout' | 'navigation' | 'feedback' | 'other'
export type InteractionType = 'view' | 'hover' | 'click' | 'focus' | 'scroll'

export interface UIShowcaseVisit {
  id: string
  user_id?: string
  visited_at: string
  session_id?: string
  user_agent?: string
  viewport_width?: number
  viewport_height?: number
  duration_seconds?: number
  components_viewed: string[]
  created_at: string
}

export interface UIComponentInteraction {
  id: string
  visit_id?: string
  user_id?: string
  component_name: string
  component_category?: ComponentCategory
  interaction_type: InteractionType
  interacted_at: string
  duration_ms?: number
  metadata?: any
  created_at: string
}

export interface PopularComponent {
  component_name: string
  interaction_count: number
  unique_users: number
  avg_duration_ms: number
}

export interface ShowcaseStats {
  total_visits: number
  unique_visitors: number
  total_interactions: number
  avg_session_duration: number
  most_viewed_component: string
}

// ============================================================================
// VISIT TRACKING MODULE
// ============================================================================

/**
 * Record a visit to the UI showcase page
 */
export async function recordShowcaseVisit(visitData: {
  session_id?: string
  user_agent?: string
  viewport_width?: number
  viewport_height?: number
}): Promise<UIShowcaseVisit> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('ui_showcase_visits')
    .insert({
      ...visitData,
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update visit duration when user leaves
 */
export async function updateVisitDuration(
  visitId: string,
  durationSeconds: number,
  componentsViewed: string[]
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('ui_showcase_visits')
    .update({
      duration_seconds: durationSeconds,
      components_viewed: componentsViewed
    })
    .eq('id', visitId)

  if (error) throw error
}

/**
 * Get recent visits
 */
export async function getRecentVisits(limit: number = 50): Promise<UIShowcaseVisit[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ui_showcase_visits')
    .select('*')
    .order('visited_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// ============================================================================
// INTERACTION TRACKING MODULE
// ============================================================================

/**
 * Record a component interaction
 */
export async function recordComponentInteraction(interactionData: {
  visit_id?: string
  component_name: string
  component_category?: ComponentCategory
  interaction_type: InteractionType
  duration_ms?: number
  metadata?: any
}): Promise<UIComponentInteraction> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('ui_component_interactions')
    .insert({
      ...interactionData,
      user_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get interactions for a specific visit
 */
export async function getVisitInteractions(visitId: string): Promise<UIComponentInteraction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ui_component_interactions')
    .select('*')
    .eq('visit_id', visitId)
    .order('interacted_at', { ascending: true })

  if (error) throw error
  return data || []
}

/**
 * Get interactions for a specific component
 */
export async function getComponentInteractions(
  componentName: string,
  filters?: {
    interaction_type?: InteractionType
    days?: number
    limit?: number
  }
): Promise<UIComponentInteraction[]> {
  const supabase = createClient()

  let query = supabase
    .from('ui_component_interactions')
    .select('*')
    .eq('component_name', componentName)
    .order('interacted_at', { ascending: false })

  if (filters?.interaction_type) {
    query = query.eq('interaction_type', filters.interaction_type)
  }

  if (filters?.days) {
    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - filters.days)
    query = query.gte('interacted_at', sinceDate.toISOString())
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// ============================================================================
// ANALYTICS MODULE
// ============================================================================

/**
 * Get popular components (most interacted with)
 */
export async function getPopularComponents(
  days: number = 7,
  limit: number = 10
): Promise<PopularComponent[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_popular_components', {
      p_days: days,
      p_limit: limit
    })

  if (error) throw error
  return data || []
}

/**
 * Get showcase statistics
 */
export async function getShowcaseStats(days: number = 7): Promise<ShowcaseStats | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_showcase_stats', { p_days: days })

  if (error) throw error
  return data?.[0] || null
}

/**
 * Get interaction trends over time
 */
export async function getInteractionTrends(
  componentName?: string,
  days: number = 30
): Promise<{ date: string; count: number }[]> {
  const supabase = createClient()

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - days)

  let query = supabase
    .from('ui_component_interactions')
    .select('interacted_at')
    .gte('interacted_at', sinceDate.toISOString())

  if (componentName) {
    query = query.eq('component_name', componentName)
  }

  const { data, error } = await query

  if (error) throw error

  // Group by date
  const trendsMap = new Map<string, number>()

  for (const interaction of data || []) {
    const date = new Date(interaction.interacted_at).toISOString().split('T')[0]
    trendsMap.set(date, (trendsMap.get(date) || 0) + 1)
  }

  return Array.from(trendsMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get component engagement metrics
 */
export async function getComponentEngagement(
  componentName: string,
  days: number = 7
): Promise<{
  total_interactions: number
  unique_users: number
  views: number
  hovers: number
  clicks: number
  avg_hover_duration: number
}> {
  const supabase = createClient()

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - days)

  const { data, error } = await supabase
    .from('ui_component_interactions')
    .select('*')
    .eq('component_name', componentName)
    .gte('interacted_at', sinceDate.toISOString())

  if (error) throw error

  const interactions = data || []

  return {
    total_interactions: interactions.length,
    unique_users: new Set(interactions.map(i => i.user_id).filter(Boolean)).size,
    views: interactions.filter(i => i.interaction_type === 'view').length,
    hovers: interactions.filter(i => i.interaction_type === 'hover').length,
    clicks: interactions.filter(i => i.interaction_type === 'click').length,
    avg_hover_duration: Math.round(
      interactions
        .filter(i => i.interaction_type === 'hover' && i.duration_ms)
        .reduce((sum, i) => sum + (i.duration_ms || 0), 0) /
      Math.max(1, interactions.filter(i => i.interaction_type === 'hover' && i.duration_ms).length)
    )
  }
}

/**
 * Get components by category
 */
export async function getComponentsByCategory(
  days: number = 7
): Promise<{
  category: ComponentCategory
  count: number
  unique_components: number
}[]> {
  const supabase = createClient()

  const sinceDate = new Date()
  sinceDate.setDate(sinceDate.getDate() - days)

  const { data, error } = await supabase
    .from('ui_component_interactions')
    .select('component_category, component_name')
    .gte('interacted_at', sinceDate.toISOString())
    .not('component_category', 'is', null)

  if (error) throw error

  // Group by category
  const categoryMap = new Map<ComponentCategory, Set<string>>()

  for (const interaction of data || []) {
    const category = interaction.component_category as ComponentCategory
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Set())
    }
    categoryMap.get(category)!.add(interaction.component_name)
  }

  return Array.from(categoryMap.entries()).map(([category, components]) => ({
    category,
    count: (data || []).filter(i => i.component_category === category).length,
    unique_components: components.size
  }))
}

// ============================================================================
// EXPORT MODULE
// ============================================================================

/**
 * Export showcase analytics as CSV
 */
export async function exportShowcaseAnalytics(days: number = 30): Promise<string> {
  const [stats, popular] = await Promise.all([
    getShowcaseStats(days),
    getPopularComponents(days, 50)
  ])

  if (!stats && popular.length === 0) {
    return 'No analytics data found'
  }

  const headers = ['Component Name', 'Interactions', 'Unique Users', 'Avg Duration (ms)']
  const rows = popular.map(comp => [
    comp.component_name,
    comp.interaction_count,
    comp.unique_users,
    comp.avg_duration_ms
  ])

  // Add summary
  rows.push([])
  rows.push(['=== SUMMARY ==='])
  if (stats) {
    rows.push(['Total Visits', stats.total_visits.toString()])
    rows.push(['Unique Visitors', stats.unique_visitors.toString()])
    rows.push(['Total Interactions', stats.total_interactions.toString()])
    rows.push(['Avg Session Duration (s)', stats.avg_session_duration?.toString() || '0'])
    rows.push(['Most Viewed Component', stats.most_viewed_component || 'N/A'])
  }

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}
