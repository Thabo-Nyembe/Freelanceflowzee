/**
 * A-Plus Showcase Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type ComponentCategory = 'ui' | 'layout' | 'animation' | 'data-display' | 'navigation' | 'feedback' | 'forms' | 'utilities'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type CodeLanguage = 'typescript' | 'javascript' | 'tsx' | 'jsx' | 'css' | 'html' | 'json'

export interface ComponentShowcase {
  id: string
  user_id: string
  name: string
  description: string
  category: ComponentCategory
  difficulty: DifficultyLevel
  code: string
  preview?: string
  language: CodeLanguage
  tags: string[]
  popularity: number
  downloads: number
  views: number
  is_premium: boolean
  is_verified: boolean
  version: string
  dependencies: string[]
  license: string
  repository?: string
  documentation?: string
  created_at: string
  updated_at: string
}

export interface ComponentExample {
  id: string
  component_id: string
  title: string
  description: string
  code: string
  preview?: string
  language: CodeLanguage
  order_index: number
  created_at: string
  updated_at: string
}

export interface ComponentVersion {
  id: string
  component_id: string
  version: string
  release_date: string
  changes: string[]
  code: string
  breaking: boolean
  created_at: string
}

export interface ComponentFavorite {
  id: string
  user_id: string
  component_id: string
  created_at: string
}

export interface ComponentReview {
  id: string
  component_id: string
  user_id: string
  rating: number
  comment: string
  helpful: number
  created_at: string
  updated_at: string
}

export interface ComponentDownload {
  id: string
  component_id: string
  user_id?: string
  downloaded_at: string
  ip_address?: string
  created_at: string
}

export interface ComponentCollection {
  id: string
  user_id: string
  name: string
  description?: string
  component_ids: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ComponentAnalytics {
  id: string
  component_id: string
  date: string
  views: number
  downloads: number
  favorites: number
  copies: number
  created_at: string
  updated_at: string
}

// COMPONENT SHOWCASES
export async function getComponentShowcases(userId: string, filters?: { category?: ComponentCategory; difficulty?: DifficultyLevel; is_premium?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('component_showcases').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty)
  if (filters?.is_premium !== undefined) query = query.eq('is_premium', filters.is_premium)
  return await query
}

export async function getAllComponentShowcases(filters?: { category?: ComponentCategory; difficulty?: DifficultyLevel; is_verified?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('component_showcases').select('*').order('popularity', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty)
  if (filters?.is_verified !== undefined) query = query.eq('is_verified', filters.is_verified)
  return await query
}

export async function getComponentShowcase(componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_showcases').select('*').eq('id', componentId).single()
}

export async function searchComponentShowcases(searchTerm: string) {
  const supabase = createClient()
  return await supabase.from('component_showcases')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
    .order('popularity', { ascending: false })
}

export async function createComponentShowcase(userId: string, component: Partial<ComponentShowcase>) {
  const supabase = createClient()
  return await supabase.from('component_showcases').insert({ user_id: userId, ...component }).select().single()
}

export async function updateComponentShowcase(componentId: string, updates: Partial<ComponentShowcase>) {
  const supabase = createClient()
  return await supabase.from('component_showcases').update(updates).eq('id', componentId).select().single()
}

export async function deleteComponentShowcase(componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_showcases').delete().eq('id', componentId)
}

// COMPONENT EXAMPLES
export async function getComponentExamples(componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_examples').select('*').eq('component_id', componentId).order('order_index')
}

export async function createComponentExample(componentId: string, example: Partial<ComponentExample>) {
  const supabase = createClient()
  return await supabase.from('component_examples').insert({ component_id: componentId, ...example }).select().single()
}

export async function updateComponentExample(exampleId: string, updates: Partial<ComponentExample>) {
  const supabase = createClient()
  return await supabase.from('component_examples').update(updates).eq('id', exampleId).select().single()
}

export async function deleteComponentExample(exampleId: string) {
  const supabase = createClient()
  return await supabase.from('component_examples').delete().eq('id', exampleId)
}

// COMPONENT VERSIONS
export async function getComponentVersions(componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_versions').select('*').eq('component_id', componentId).order('release_date', { ascending: false })
}

export async function getComponentVersion(componentId: string, version: string) {
  const supabase = createClient()
  return await supabase.from('component_versions').select('*').eq('component_id', componentId).eq('version', version).single()
}

export async function createComponentVersion(componentId: string, version: Partial<ComponentVersion>) {
  const supabase = createClient()
  return await supabase.from('component_versions').insert({ component_id: componentId, ...version }).select().single()
}

export async function deleteComponentVersion(versionId: string) {
  const supabase = createClient()
  return await supabase.from('component_versions').delete().eq('id', versionId)
}

// COMPONENT FAVORITES
export async function getComponentFavorites(userId: string) {
  const supabase = createClient()
  return await supabase.from('component_favorites').select('*, component_showcases(*)').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function isFavorite(userId: string, componentId: string) {
  const supabase = createClient()
  const { data } = await supabase.from('component_favorites').select('id').eq('user_id', userId).eq('component_id', componentId).single()
  return !!data
}

export async function toggleFavorite(userId: string, componentId: string) {
  const supabase = createClient()
  const { data: existing } = await supabase.from('component_favorites').select('id').eq('user_id', userId).eq('component_id', componentId).single()

  if (existing) {
    return await supabase.from('component_favorites').delete().eq('id', existing.id)
  } else {
    return await supabase.from('component_favorites').insert({ user_id: userId, component_id: componentId }).select().single()
  }
}

export async function deleteFavorite(favoriteId: string) {
  const supabase = createClient()
  return await supabase.from('component_favorites').delete().eq('id', favoriteId)
}

// COMPONENT REVIEWS
export async function getComponentReviews(componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_reviews').select('*').eq('component_id', componentId).order('created_at', { ascending: false })
}

export async function getUserReview(userId: string, componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_reviews').select('*').eq('user_id', userId).eq('component_id', componentId).single()
}

export async function createComponentReview(userId: string, componentId: string, review: Partial<ComponentReview>) {
  const supabase = createClient()
  return await supabase.from('component_reviews').insert({ user_id: userId, component_id: componentId, ...review }).select().single()
}

export async function updateComponentReview(reviewId: string, updates: Partial<ComponentReview>) {
  const supabase = createClient()
  return await supabase.from('component_reviews').update(updates).eq('id', reviewId).select().single()
}

export async function deleteComponentReview(reviewId: string) {
  const supabase = createClient()
  return await supabase.from('component_reviews').delete().eq('id', reviewId)
}

// COMPONENT DOWNLOADS
export async function recordComponentDownload(componentId: string, userId?: string, ipAddress?: string) {
  const supabase = createClient()
  return await supabase.from('component_downloads').insert({ component_id: componentId, user_id: userId, ip_address: ipAddress }).select().single()
}

export async function getComponentDownloads(componentId: string) {
  const supabase = createClient()
  return await supabase.from('component_downloads').select('*').eq('component_id', componentId).order('downloaded_at', { ascending: false })
}

export async function getUserDownloads(userId: string) {
  const supabase = createClient()
  return await supabase.from('component_downloads').select('*, component_showcases(*)').eq('user_id', userId).order('downloaded_at', { ascending: false })
}

// COMPONENT COLLECTIONS
export async function getComponentCollections(userId: string, filters?: { is_public?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('component_collections').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  return await query
}

export async function getComponentCollection(collectionId: string) {
  const supabase = createClient()
  return await supabase.from('component_collections').select('*').eq('id', collectionId).single()
}

export async function createComponentCollection(userId: string, collection: Partial<ComponentCollection>) {
  const supabase = createClient()
  return await supabase.from('component_collections').insert({ user_id: userId, ...collection }).select().single()
}

export async function updateComponentCollection(collectionId: string, updates: Partial<ComponentCollection>) {
  const supabase = createClient()
  return await supabase.from('component_collections').update(updates).eq('id', collectionId).select().single()
}

export async function addComponentToCollection(collectionId: string, componentId: string) {
  const supabase = createClient()
  const { data: collection } = await supabase.from('component_collections').select('component_ids').eq('id', collectionId).single()
  if (!collection) return { data: null, error: new Error('Collection not found') }

  const componentIds = [...(collection.component_ids || []), componentId]
  return await supabase.from('component_collections').update({ component_ids: componentIds }).eq('id', collectionId).select().single()
}

export async function removeComponentFromCollection(collectionId: string, componentId: string) {
  const supabase = createClient()
  const { data: collection } = await supabase.from('component_collections').select('component_ids').eq('id', collectionId).single()
  if (!collection) return { data: null, error: new Error('Collection not found') }

  const componentIds = (collection.component_ids || []).filter(id => id !== componentId)
  return await supabase.from('component_collections').update({ component_ids: componentIds }).eq('id', collectionId).select().single()
}

export async function deleteComponentCollection(collectionId: string) {
  const supabase = createClient()
  return await supabase.from('component_collections').delete().eq('id', collectionId)
}

// COMPONENT ANALYTICS
export async function getComponentAnalytics(componentId: string, filters?: { startDate?: string; endDate?: string }) {
  const supabase = createClient()
  let query = supabase.from('component_analytics').select('*').eq('component_id', componentId).order('date', { ascending: false })
  if (filters?.startDate) query = query.gte('date', filters.startDate)
  if (filters?.endDate) query = query.lte('date', filters.endDate)
  return await query
}

export async function createComponentAnalytics(componentId: string, analytics: Partial<ComponentAnalytics>) {
  const supabase = createClient()
  return await supabase.from('component_analytics').insert({ component_id: componentId, ...analytics }).select().single()
}

export async function updateComponentAnalytics(analyticsId: string, updates: Partial<ComponentAnalytics>) {
  const supabase = createClient()
  return await supabase.from('component_analytics').update(updates).eq('id', analyticsId).select().single()
}

// STATS
export async function getComponentShowcaseStats(userId: string) {
  const supabase = createClient()
  const [componentsResult, favoritesResult, reviewsResult, downloadsResult, collectionsResult] = await Promise.all([
    supabase.from('component_showcases').select('id, popularity, downloads, views, is_premium').eq('user_id', userId),
    supabase.from('component_favorites').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('component_reviews').select('id, rating').eq('user_id', userId),
    supabase.from('component_downloads').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('component_collections').select('id, is_public').eq('user_id', userId)
  ])

  const totalPopularity = componentsResult.data?.reduce((sum, c) => sum + (c.popularity || 0), 0) || 0
  const totalDownloads = componentsResult.data?.reduce((sum, c) => sum + (c.downloads || 0), 0) || 0
  const totalViews = componentsResult.data?.reduce((sum, c) => sum + (c.views || 0), 0) || 0
  const premiumComponents = componentsResult.data?.filter(c => c.is_premium).length || 0
  const avgRating = reviewsResult.data?.reduce((sum, r) => sum + (r.rating || 0), 0) / (reviewsResult.data?.length || 1) || 0
  const publicCollections = collectionsResult.data?.filter(c => c.is_public).length || 0

  return {
    data: {
      total_components: componentsResult.count || 0,
      premium_components: premiumComponents,
      total_popularity: totalPopularity,
      total_downloads: totalDownloads,
      total_views: totalViews,
      total_favorites: favoritesResult.count || 0,
      total_reviews: reviewsResult.count || 0,
      average_rating: avgRating,
      total_user_downloads: downloadsResult.count || 0,
      total_collections: collectionsResult.count || 0,
      public_collections: publicCollections
    },
    error: componentsResult.error || favoritesResult.error || reviewsResult.error || downloadsResult.error || collectionsResult.error
  }
}

export async function getPopularComponents(limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('component_showcases').select('*').order('popularity', { ascending: false }).limit(limit)
}

export async function getTrendingComponents(limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('component_showcases').select('*').order('views', { ascending: false }).limit(limit)
}
