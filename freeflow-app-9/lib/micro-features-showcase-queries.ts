/**
 * Micro Features Showcase Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type MicroFeatureCategory = 'animations' | 'buttons' | 'tooltips' | 'forms' | 'loading' | 'keyboard' | 'cards' | 'navigation' | 'feedback'
export type InteractionType = 'click' | 'hover' | 'scroll' | 'keyboard' | 'drag' | 'focus' | 'blur' | 'touch'
export type DemoStatus = 'active' | 'inactive' | 'archived' | 'beta' | 'stable'

export interface MicroFeature {
  id: string
  user_id: string
  name: string
  description: string
  category: MicroFeatureCategory
  component_name: string
  demo_code?: string
  preview_url?: string
  status: DemoStatus

  // Metrics
  view_count: number
  demo_count: number
  interaction_count: number
  favorite_count: number

  // Configuration
  config: Record<string, any>
  supported_interactions: InteractionType[]
  tags: string[]

  // Flags
  is_premium: boolean
  is_featured: boolean
  is_interactive: boolean

  // Documentation
  documentation_url?: string
  code_sandbox_url?: string

  created_at: string
  updated_at: string
}

export interface MicroFeatureDemonstration {
  id: string
  feature_id: string
  user_id?: string

  // Demo Details
  demo_title: string
  demo_description?: string
  interaction_type: InteractionType
  duration_ms?: number

  // Performance Metrics
  load_time_ms?: number
  fps?: number
  smooth: boolean

  // Context
  device_type?: string
  browser?: string
  screen_size?: string

  created_at: string
}

export interface MicroFeatureFavorite {
  id: string
  user_id: string
  feature_id: string
  notes?: string
  created_at: string
}

export interface MicroFeatureInteraction {
  id: string
  feature_id: string
  user_id?: string

  // Interaction Details
  interaction_type: InteractionType
  triggered_at: string

  // Context
  position_x?: number
  position_y?: number
  viewport_width?: number
  viewport_height?: number

  // Performance
  response_time_ms?: number

  // Session
  session_id?: string
  page_url?: string

  created_at: string
}

export interface MicroFeatureAnalytics {
  id: string
  feature_id: string
  date: string

  // Daily Metrics
  views: number
  demos: number
  interactions: number
  favorites: number
  unique_users: number

  // Performance Metrics
  avg_load_time_ms?: number
  avg_response_time_ms?: number
  avg_fps?: number
  smooth_percentage?: number

  // Engagement
  avg_duration_ms?: number
  bounce_rate?: number

  created_at: string
  updated_at: string
}

// MICRO FEATURES
export async function getMicroFeatures(userId: string, filters?: { category?: MicroFeatureCategory; status?: DemoStatus; is_featured?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('micro_features').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.is_featured !== undefined) query = query.eq('is_featured', filters.is_featured)
  return await query
}

export async function getAllMicroFeatures(filters?: { category?: MicroFeatureCategory; is_featured?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('micro_features').select('*').order('view_count', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.is_featured !== undefined) query = query.eq('is_featured', filters.is_featured)
  return await query
}

export async function getMicroFeature(featureId: string) {
  const supabase = createClient()
  return await supabase.from('micro_features').select('*').eq('id', featureId).single()
}

export async function searchMicroFeatures(searchTerm: string) {
  const supabase = createClient()
  return await supabase.from('micro_features')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,component_name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order('view_count', { ascending: false })
}

export async function createMicroFeature(userId: string, feature: Partial<MicroFeature>) {
  const supabase = createClient()
  return await supabase.from('micro_features').insert({ user_id: userId, ...feature }).select().single()
}

export async function updateMicroFeature(featureId: string, updates: Partial<MicroFeature>) {
  const supabase = createClient()
  return await supabase.from('micro_features').update(updates).eq('id', featureId).select().single()
}

export async function deleteMicroFeature(featureId: string) {
  const supabase = createClient()
  return await supabase.from('micro_features').delete().eq('id', featureId)
}

// MICRO FEATURE DEMONSTRATIONS
export async function getMicroFeatureDemonstrations(featureId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_demonstrations').select('*').eq('feature_id', featureId).order('created_at', { ascending: false })
}

export async function createMicroFeatureDemonstration(featureId: string, userId: string | undefined, demonstration: Partial<MicroFeatureDemonstration>) {
  const supabase = createClient()
  return await supabase.from('micro_feature_demonstrations').insert({ feature_id: featureId, user_id: userId, ...demonstration }).select().single()
}

export async function getUserDemonstrations(userId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_demonstrations').select('*, micro_features(*)').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function deleteMicroFeatureDemonstration(demonstrationId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_demonstrations').delete().eq('id', demonstrationId)
}

// MICRO FEATURE FAVORITES
export async function getMicroFeatureFavorites(userId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_favorites').select('*, micro_features(*)').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function isMicroFeatureFavorite(userId: string, featureId: string) {
  const supabase = createClient()
  const { data } = await supabase.from('micro_feature_favorites').select('id').eq('user_id', userId).eq('feature_id', featureId).single()
  return !!data
}

export async function toggleMicroFeatureFavorite(userId: string, featureId: string) {
  const supabase = createClient()
  const { data: existing } = await supabase.from('micro_feature_favorites').select('id').eq('user_id', userId).eq('feature_id', featureId).single()

  if (existing) {
    return await supabase.from('micro_feature_favorites').delete().eq('id', existing.id)
  } else {
    return await supabase.from('micro_feature_favorites').insert({ user_id: userId, feature_id: featureId }).select().single()
  }
}

export async function updateMicroFeatureFavorite(favoriteId: string, updates: Partial<MicroFeatureFavorite>) {
  const supabase = createClient()
  return await supabase.from('micro_feature_favorites').update(updates).eq('id', favoriteId).select().single()
}

export async function deleteMicroFeatureFavorite(favoriteId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_favorites').delete().eq('id', favoriteId)
}

// MICRO FEATURE INTERACTIONS
export async function getMicroFeatureInteractions(featureId: string, filters?: { interaction_type?: InteractionType; startDate?: string; endDate?: string }) {
  const supabase = createClient()
  let query = supabase.from('micro_feature_interactions').select('*').eq('feature_id', featureId).order('triggered_at', { ascending: false })
  if (filters?.interaction_type) query = query.eq('interaction_type', filters.interaction_type)
  if (filters?.startDate) query = query.gte('triggered_at', filters.startDate)
  if (filters?.endDate) query = query.lte('triggered_at', filters.endDate)
  return await query
}

export async function recordMicroFeatureInteraction(featureId: string, userId: string | undefined, interaction: Partial<MicroFeatureInteraction>) {
  const supabase = createClient()
  return await supabase.from('micro_feature_interactions').insert({ feature_id: featureId, user_id: userId, ...interaction }).select().single()
}

export async function getUserInteractions(userId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_interactions').select('*, micro_features(*)').eq('user_id', userId).order('triggered_at', { ascending: false })
}

export async function deleteMicroFeatureInteraction(interactionId: string) {
  const supabase = createClient()
  return await supabase.from('micro_feature_interactions').delete().eq('id', interactionId)
}

// MICRO FEATURE ANALYTICS
export async function getMicroFeatureAnalytics(featureId: string, filters?: { startDate?: string; endDate?: string }) {
  const supabase = createClient()
  let query = supabase.from('micro_feature_analytics').select('*').eq('feature_id', featureId).order('date', { ascending: false })
  if (filters?.startDate) query = query.gte('date', filters.startDate)
  if (filters?.endDate) query = query.lte('date', filters.endDate)
  return await query
}

export async function createMicroFeatureAnalytics(featureId: string, analytics: Partial<MicroFeatureAnalytics>) {
  const supabase = createClient()
  return await supabase.from('micro_feature_analytics').insert({ feature_id: featureId, ...analytics }).select().single()
}

export async function updateMicroFeatureAnalytics(analyticsId: string, updates: Partial<MicroFeatureAnalytics>) {
  const supabase = createClient()
  return await supabase.from('micro_feature_analytics').update(updates).eq('id', analyticsId).select().single()
}

// STATS
export async function getMicroFeaturesStats(userId: string) {
  const supabase = createClient()
  const [featuresResult, favoritesResult, demonstrationsResult, interactionsResult, analyticsResult] = await Promise.all([
    supabase.from('micro_features').select('id, category, view_count, demo_count, interaction_count, is_featured').eq('user_id', userId),
    supabase.from('micro_feature_favorites').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('micro_feature_demonstrations').select('id, smooth').eq('user_id', userId),
    supabase.from('micro_feature_interactions').select('id, interaction_type').eq('user_id', userId),
    supabase.from('micro_feature_analytics').select('views, demos, interactions, favorites').eq('user_id', userId)
  ])

  const totalViews = featuresResult.data?.reduce((sum, f) => sum + (f.view_count || 0), 0) || 0
  const totalDemos = featuresResult.data?.reduce((sum, f) => sum + (f.demo_count || 0), 0) || 0
  const totalInteractions = featuresResult.data?.reduce((sum, f) => sum + (f.interaction_count || 0), 0) || 0
  const featuredFeatures = featuresResult.data?.filter(f => f.is_featured).length || 0
  const smoothDemos = demonstrationsResult.data?.filter(d => d.smooth).length || 0
  const smoothPercentage = demonstrationsResult.data?.length ? (smoothDemos / demonstrationsResult.data.length) * 100 : 0

  // Count by category
  const categoryCounts = featuresResult.data?.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Count by interaction type
  const interactionTypeCounts = interactionsResult.data?.reduce((acc, i) => {
    acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    data: {
      total_features: featuresResult.count || 0,
      featured_features: featuredFeatures,
      total_views: totalViews,
      total_demos: totalDemos,
      total_interactions: totalInteractions,
      total_favorites: favoritesResult.count || 0,
      total_demonstrations: demonstrationsResult.count || 0,
      smooth_percentage: smoothPercentage,
      category_counts: categoryCounts,
      interaction_type_counts: interactionTypeCounts
    },
    error: featuresResult.error || favoritesResult.error || demonstrationsResult.error || interactionsResult.error || analyticsResult.error
  }
}

export async function getFeaturedMicroFeatures(limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('micro_features').select('*').eq('is_featured', true).order('view_count', { ascending: false }).limit(limit)
}

export async function getTrendingMicroFeatures(limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('micro_features').select('*').order('interaction_count', { ascending: false }).limit(limit)
}

export async function getMicroFeaturesByCategory(category: MicroFeatureCategory) {
  const supabase = createClient()
  return await supabase.from('micro_features').select('*').eq('category', category).order('view_count', { ascending: false })
}
