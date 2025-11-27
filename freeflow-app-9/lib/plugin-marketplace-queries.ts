// Plugin Marketplace - Supabase Queries
// Comprehensive queries for plugins, authors, reviews, installations, and analytics

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type PluginCategory = 'productivity' | 'creative' | 'analytics' | 'communication' | 'integration' | 'automation' | 'ai' | 'security' | 'finance' | 'marketing'
export type PricingType = 'free' | 'one-time' | 'subscription' | 'freemium'
export type PluginStatus = 'published' | 'beta' | 'coming-soon' | 'deprecated'

export interface PluginAuthor {
  id: string
  user_id?: string
  name: string
  avatar?: string
  verified: boolean
  email?: string
  website?: string
  total_plugins: number
  total_installs: number
  created_at: string
  updated_at: string
}

export interface Plugin {
  id: string
  name: string
  slug: string
  description: string
  long_description?: string
  category: PluginCategory
  icon?: string
  author_id: string
  version: string
  rating: number
  review_count: number
  install_count: number
  active_installs: number
  price: number
  pricing_type: PricingType
  status: PluginStatus
  file_size: number
  last_updated: string
  is_verified: boolean
  is_featured: boolean
  is_trending: boolean
  is_popular: boolean
  tags: string[]
  screenshots: string[]
  compatibility: string[]
  requirements: string[]
  changelog: string[]
  download_url?: string
  documentation_url?: string
  support_url?: string
  repository_url?: string
  created_at: string
  updated_at: string
}

export interface PluginReview {
  id: string
  plugin_id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
  helpful_count: number
  verified_purchase: boolean
  created_at: string
  updated_at: string
}

export interface PluginInstallation {
  id: string
  plugin_id: string
  user_id: string
  version: string
  is_active: boolean
  settings: Record<string, any>
  installed_at: string
  activated_at?: string
  deactivated_at?: string
  updated_at: string
}

export interface PluginVersion {
  id: string
  plugin_id: string
  version: string
  changelog: string
  file_size: number
  download_url?: string
  is_stable: boolean
  min_platform_version?: string
  release_notes?: string
  released_at: string
  created_at: string
}

export interface PluginDownload {
  id: string
  plugin_id: string
  user_id?: string
  version: string
  ip_address?: string
  user_agent?: string
  country?: string
  downloaded_at: string
}

export interface PluginAnalytics {
  id: string
  plugin_id: string
  date: string
  views: number
  downloads: number
  installs: number
  uninstalls: number
  active_users: number
  created_at: string
}

// ============================================================================
// PLUGIN AUTHORS - CRUD
// ============================================================================

export async function createAuthor(authorData: Partial<PluginAuthor>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_authors')
    .insert(authorData)
    .select()
    .single()

  if (error) throw error
  return data as PluginAuthor
}

export async function getAuthor(authorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_authors')
    .select('*')
    .eq('id', authorId)
    .single()

  if (error) throw error
  return data as PluginAuthor
}

export async function getAllAuthors() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_authors')
    .select('*')
    .order('total_installs', { ascending: false })

  if (error) throw error
  return data as PluginAuthor[]
}

export async function updateAuthor(authorId: string, updates: Partial<PluginAuthor>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_authors')
    .update(updates)
    .eq('id', authorId)
    .select()
    .single()

  if (error) throw error
  return data as PluginAuthor
}

export async function deleteAuthor(authorId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('plugin_authors')
    .delete()
    .eq('id', authorId)

  if (error) throw error
  return true
}

export async function getVerifiedAuthors() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_authors')
    .select('*')
    .eq('verified', true)
    .order('total_installs', { ascending: false })

  if (error) throw error
  return data as PluginAuthor[]
}

// ============================================================================
// PLUGINS - CRUD
// ============================================================================

export async function createPlugin(pluginData: Partial<Plugin>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .insert(pluginData)
    .select()
    .single()

  if (error) throw error
  return data as Plugin
}

export async function getPlugin(pluginId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('id', pluginId)
    .single()

  if (error) throw error
  return data as Plugin & { plugin_authors: PluginAuthor }
}

export async function getPluginBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Plugin & { plugin_authors: PluginAuthor }
}

export async function getAllPlugins() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .order('install_count', { ascending: false })

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function updatePlugin(pluginId: string, updates: Partial<Plugin>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .update(updates)
    .eq('id', pluginId)
    .select()
    .single()

  if (error) throw error
  return data as Plugin
}

export async function deletePlugin(pluginId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('plugins')
    .delete()
    .eq('id', pluginId)

  if (error) throw error
  return true
}

// ============================================================================
// PLUGINS - FILTERS & QUERIES
// ============================================================================

export async function getPluginsByCategory(category: PluginCategory) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('category', category)
    .eq('status', 'published')
    .order('install_count', { ascending: false })

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function getPluginsByAuthor(authorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function getFeaturedPlugins(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('is_featured', true)
    .eq('status', 'published')
    .order('install_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function getTrendingPlugins(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('is_trending', true)
    .eq('status', 'published')
    .order('install_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function getPopularPlugins(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('status', 'published')
    .order('install_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function getTopRatedPlugins(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('status', 'published')
    .gte('review_count', 5) // At least 5 reviews
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function getFreePlugins() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .eq('pricing_type', 'free')
    .eq('status', 'published')
    .order('install_count', { ascending: false })

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function searchPlugins(searchTerm: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugins')
    .select('*, plugin_authors(*)')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .eq('status', 'published')
    .order('install_count', { ascending: false })

  if (error) throw error
  return data as (Plugin & { plugin_authors: PluginAuthor })[]
}

export async function incrementPluginViews(pluginId: string) {
  const supabase = createClient()
  // This would typically be handled by a database function or trigger
  // For now, we'll just return success
  return true
}

export async function incrementPluginInstalls(pluginId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('increment_plugin_installs', { plugin_id: pluginId })

  if (error) throw error
  return data
}

// ============================================================================
// PLUGIN REVIEWS - CRUD
// ============================================================================

export async function createReview(reviewData: Partial<PluginReview>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_reviews')
    .insert(reviewData)
    .select()
    .single()

  if (error) throw error
  return data as PluginReview
}

export async function getReview(reviewId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_reviews')
    .select('*')
    .eq('id', reviewId)
    .single()

  if (error) throw error
  return data as PluginReview
}

export async function getReviewsByPlugin(pluginId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_reviews')
    .select('*')
    .eq('plugin_id', pluginId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as PluginReview[]
}

export async function getReviewsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_reviews')
    .select('*, plugins(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (PluginReview & { plugins: Plugin })[]
}

export async function updateReview(reviewId: string, updates: Partial<PluginReview>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data as PluginReview
}

export async function deleteReview(reviewId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('plugin_reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
  return true
}

export async function markReviewHelpful(reviewId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_reviews')
    .update({ helpful_count: supabase.raw('helpful_count + 1') })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data as PluginReview
}

// ============================================================================
// PLUGIN INSTALLATIONS - CRUD
// ============================================================================

export async function createInstallation(userId: string, installationData: Partial<PluginInstallation>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_installations')
    .insert({
      user_id: userId,
      ...installationData
    })
    .select()
    .single()

  if (error) throw error
  return data as PluginInstallation
}

export async function getInstallation(installationId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_installations')
    .select('*, plugins(*)')
    .eq('id', installationId)
    .single()

  if (error) throw error
  return data as PluginInstallation & { plugins: Plugin }
}

export async function getInstallationsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_installations')
    .select('*, plugins(*)')
    .eq('user_id', userId)
    .order('installed_at', { ascending: false })

  if (error) throw error
  return data as (PluginInstallation & { plugins: Plugin })[]
}

export async function getActiveInstallations(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_installations')
    .select('*, plugins(*)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('activated_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as (PluginInstallation & { plugins: Plugin })[]
}

export async function updateInstallation(installationId: string, updates: Partial<PluginInstallation>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_installations')
    .update(updates)
    .eq('id', installationId)
    .select()
    .single()

  if (error) throw error
  return data as PluginInstallation
}

export async function deleteInstallation(installationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('plugin_installations')
    .delete()
    .eq('id', installationId)

  if (error) throw error
  return true
}

export async function activatePlugin(installationId: string) {
  return updateInstallation(installationId, {
    is_active: true,
    activated_at: new Date().toISOString()
  })
}

export async function deactivatePlugin(installationId: string) {
  return updateInstallation(installationId, {
    is_active: false,
    deactivated_at: new Date().toISOString()
  })
}

export async function isPluginInstalled(userId: string, pluginId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_installations')
    .select('id')
    .eq('user_id', userId)
    .eq('plugin_id', pluginId)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return !!data
}

// ============================================================================
// PLUGIN VERSIONS - CRUD
// ============================================================================

export async function createVersion(versionData: Partial<PluginVersion>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_versions')
    .insert(versionData)
    .select()
    .single()

  if (error) throw error
  return data as PluginVersion
}

export async function getVersionsByPlugin(pluginId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_versions')
    .select('*')
    .eq('plugin_id', pluginId)
    .order('released_at', { ascending: false })

  if (error) throw error
  return data as PluginVersion[]
}

export async function getLatestVersion(pluginId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_versions')
    .select('*')
    .eq('plugin_id', pluginId)
    .eq('is_stable', true)
    .order('released_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error
  return data as PluginVersion
}

// ============================================================================
// PLUGIN DOWNLOADS - TRACKING
// ============================================================================

export async function trackDownload(downloadData: Partial<PluginDownload>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_downloads')
    .insert(downloadData)
    .select()
    .single()

  if (error) throw error
  return data as PluginDownload
}

export async function getDownloadsByPlugin(pluginId: string, limit: number = 100) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_downloads')
    .select('*')
    .eq('plugin_id', pluginId)
    .order('downloaded_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as PluginDownload[]
}

// ============================================================================
// PLUGIN ANALYTICS
// ============================================================================

export async function getPluginAnalytics(pluginId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('plugin_analytics')
    .select('*')
    .eq('plugin_id', pluginId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) throw error
  return data as PluginAnalytics[]
}

export async function updatePluginAnalytics(pluginId: string, date: string, updates: Partial<PluginAnalytics>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('plugin_analytics')
    .upsert({
      plugin_id: pluginId,
      date,
      ...updates
    })
    .select()
    .single()

  if (error) throw error
  return data as PluginAnalytics
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getMarketplaceStats() {
  const supabase = createClient()

  const [
    pluginsResult,
    authorsResult,
    reviewsResult,
    installationsResult
  ] = await Promise.all([
    supabase.from('plugins').select('id', { count: 'exact', head: true }),
    supabase.from('plugin_authors').select('id', { count: 'exact', head: true }),
    supabase.from('plugin_reviews').select('id', { count: 'exact', head: true }),
    supabase.from('plugin_installations').select('id', { count: 'exact', head: true })
  ])

  return {
    total_plugins: pluginsResult.count || 0,
    total_authors: authorsResult.count || 0,
    total_reviews: reviewsResult.count || 0,
    total_installations: installationsResult.count || 0
  }
}

export async function getPluginStats(pluginId: string) {
  const supabase = createClient()

  const [
    plugin,
    reviews,
    installations
  ] = await Promise.all([
    supabase.from('plugins').select('*').eq('id', pluginId).single(),
    supabase.from('plugin_reviews').select('id, rating', { count: 'exact' }).eq('plugin_id', pluginId),
    supabase.from('plugin_installations').select('id, is_active', { count: 'exact' }).eq('plugin_id', pluginId)
  ])

  const activeInstalls = installations.data?.filter(i => i.is_active).length || 0
  const avgRating = reviews.data?.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.data?.length || 1, 1)

  return {
    plugin: plugin.data,
    total_reviews: reviews.count || 0,
    average_rating: avgRating,
    total_installations: installations.count || 0,
    active_installations: activeInstalls
  }
}

export async function getUserPluginStats(userId: string) {
  const supabase = createClient()

  const [
    installed,
    active,
    reviews
  ] = await Promise.all([
    supabase.from('plugin_installations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('plugin_installations').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
    supabase.from('plugin_reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  return {
    total_installed: installed.count || 0,
    total_active: active.count || 0,
    total_reviews: reviews.count || 0
  }
}
