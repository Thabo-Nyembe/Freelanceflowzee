// Resource Library - Supabase Queries
// Digital asset management: resources, collections, downloads, ratings, and engagement

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type ResourceType =
  | 'design-system'
  | 'code'
  | 'template'
  | 'video'
  | 'image'
  | 'audio'
  | 'document'
  | 'font'
  | '3d-model'
  | 'plugin'
  | 'tutorial'
  | 'ebook'

export type ResourceCategory =
  | 'design'
  | 'development'
  | 'branding'
  | 'motion'
  | 'photography'
  | 'illustration'
  | 'ui-kit'
  | 'icons'
  | 'fonts'
  | 'textures'
  | 'mockups'
  | 'education'
  | 'marketing'

export type ResourceFormat =
  | 'figma'
  | 'sketch'
  | 'xd'
  | 'psd'
  | 'ai'
  | 'ae'
  | 'zip'
  | 'pdf'
  | 'mp4'
  | 'mov'
  | 'jpg'
  | 'png'
  | 'svg'
  | 'mp3'
  | 'wav'
  | 'ttf'
  | 'otf'
  | 'obj'
  | 'fbx'
  | 'gltf'

export type LicenseType =
  | 'commercial'
  | 'personal'
  | 'mit'
  | 'gpl'
  | 'creative-commons'
  | 'proprietary'
  | 'public-domain'

export type AccessLevel = 'free' | 'premium' | 'subscription' | 'one-time-purchase'

export interface Resource {
  id: string
  user_id: string
  title: string
  description: string
  slug: string
  resource_type: ResourceType
  category_id?: string
  format: ResourceFormat
  file_url?: string
  file_size?: number
  file_size_formatted?: string
  thumbnail_url?: string
  preview_urls?: string[]
  version?: string
  author_name?: string
  source_url?: string
  documentation_url?: string
  demo_url?: string
  license: LicenseType
  access_level: AccessLevel
  price: number
  downloads_count: number
  views_count: number
  likes_count: number
  bookmarks_count: number
  comments_count: number
  rating_average: number
  rating_count: number
  is_premium: boolean
  is_featured: boolean
  is_verified: boolean
  is_published: boolean
  tags?: string[]
  keywords?: string[]
  requirements?: any
  compatibility?: any
  metadata?: any
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: string
  resource_count: number
  total_downloads: number
  display_order: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ResourceCollection {
  id: string
  user_id: string
  name: string
  description?: string
  slug: string
  thumbnail_url?: string
  items_count: number
  total_downloads: number
  views_count: number
  is_public: boolean
  is_featured: boolean
  metadata?: any
  created_at: string
  updated_at: string
}

export interface CollectionItem {
  id: string
  collection_id: string
  resource_id: string
  display_order: number
  notes?: string
  added_at: string
}

export interface ResourceDownload {
  id: string
  resource_id: string
  user_id?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  metadata?: any
  downloaded_at: string
}

export interface ResourceRating {
  id: string
  resource_id: string
  user_id: string
  rating: number
  review?: string
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface ResourceComment {
  id: string
  resource_id: string
  user_id: string
  parent_id?: string
  content: string
  likes_count: number
  replies_count: number
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ResourceBookmark {
  id: string
  resource_id: string
  user_id: string
  folder?: string
  notes?: string
  created_at: string
}

export interface ResourceTag {
  id: string
  name: string
  slug: string
  usage_count: number
  created_at: string
}

export interface ResourceFilters {
  type?: ResourceType
  category_id?: string
  format?: ResourceFormat
  license?: LicenseType
  access_level?: AccessLevel
  is_premium?: boolean
  is_featured?: boolean
  min_rating?: number
  tags?: string[]
  search?: string
}

export interface PopularResource {
  resource_id: string
  title: string
  downloads: number
  rank: number
}

// ============================================================================
// RESOURCE QUERIES
// ============================================================================

/**
 * Get all resources
 */
export async function getResources(
  filters?: ResourceFilters,
  sortBy: 'recent' | 'popular' | 'rating' | 'downloads' = 'recent',
  limit: number = 50
) {
  const supabase = createClient()

  let query = supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .limit(limit)

  // Apply filters
  if (filters?.type) {
    query = query.eq('resource_type', filters.type)
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.format) {
    query = query.eq('format', filters.format)
  }

  if (filters?.license) {
    query = query.eq('license', filters.license)
  }

  if (filters?.access_level) {
    query = query.eq('access_level', filters.access_level)
  }

  if (filters?.is_premium !== undefined) {
    query = query.eq('is_premium', filters.is_premium)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters?.min_rating) {
    query = query.gte('rating_average', filters.min_rating)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  // Apply sorting
  switch (sortBy) {
    case 'popular':
      query = query.order('views_count', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_average', { ascending: false })
      break
    case 'downloads':
      query = query.order('downloads_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data as Resource[]
}

/**
 * Get resource by ID
 */
export async function getResourceById(resourceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', resourceId)
    .single()

  if (error) throw error

  // Increment view count
  await supabase
    .from('resources')
    .update({ views_count: data.views_count + 1 })
    .eq('id', resourceId)

  return data as Resource
}

/**
 * Get resource by slug
 */
export async function getResourceBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Resource
}

/**
 * Create resource
 */
export async function createResource(resourceData: Partial<Resource>) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('resources')
    .insert({
      ...resourceData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data as Resource
}

/**
 * Update resource
 */
export async function updateResource(
  resourceId: string,
  updates: Partial<Resource>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resources')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', resourceId)
    .select()
    .single()

  if (error) throw error
  return data as Resource
}

/**
 * Delete resource
 */
export async function deleteResource(resourceId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId)

  if (error) throw error
}

/**
 * Get featured resources
 */
export async function getFeaturedResources(limit: number = 10) {
  return getResources({ is_featured: true }, 'recent', limit)
}

/**
 * Get user's resources
 */
export async function getUserResources(userId: string, limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Resource[]
}

/**
 * Search resources
 */
export async function searchResources(query: string, limit: number = 50) {
  return getResources({ search: query }, 'recent', limit)
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

/**
 * Get all categories
 */
export async function getCategories() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) throw error
  return data as ResourceCategory[]
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error) throw error
  return data as ResourceCategory
}

/**
 * Get featured categories
 */
export async function getFeaturedCategories() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_categories')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('display_order')

  if (error) throw error
  return data as ResourceCategory[]
}

// ============================================================================
// COLLECTION QUERIES
// ============================================================================

/**
 * Get user's collections
 */
export async function getUserCollections(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ResourceCollection[]
}

/**
 * Get public collections
 */
export async function getPublicCollections(limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ResourceCollection[]
}

/**
 * Create collection
 */
export async function createCollection(collectionData: {
  name: string
  description?: string
  is_public?: boolean
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const slug = collectionData.name.toLowerCase().replace(/\s+/g, '-')

  const { data, error } = await supabase
    .from('resource_collections')
    .insert({
      ...collectionData,
      user_id: user.id,
      slug
    })
    .select()
    .single()

  if (error) throw error
  return data as ResourceCollection
}

/**
 * Add resource to collection
 */
export async function addResourceToCollection(
  collectionId: string,
  resourceId: string,
  notes?: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      resource_id: resourceId,
      notes
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove resource from collection
 */
export async function removeResourceFromCollection(
  collectionId: string,
  resourceId: string
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('resource_id', resourceId)

  if (error) throw error
}

/**
 * Get collection items
 */
export async function getCollectionItems(collectionId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('collection_items')
    .select(`
      *,
      resource:resource_id (*)
    `)
    .eq('collection_id', collectionId)
    .order('display_order')

  if (error) throw error
  return data
}

// ============================================================================
// DOWNLOAD QUERIES
// ============================================================================

/**
 * Record download
 */
export async function recordDownload(
  resourceId: string,
  metadata?: any
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .rpc('record_download', {
      p_resource_id: resourceId,
      p_user_id: user?.id || null,
      p_metadata: metadata || {}
    })

  if (error) throw error
  return data
}

/**
 * Get user's download history
 */
export async function getUserDownloads(userId: string, limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_downloads')
    .select(`
      *,
      resource:resource_id (*)
    `)
    .eq('user_id', userId)
    .order('downloaded_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get resource download stats
 */
export async function getResourceDownloadStats(resourceId: string) {
  const supabase = createClient()

  const { count: total } = await supabase
    .from('resource_downloads')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId)

  const { count: today } = await supabase
    .from('resource_downloads')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId)
    .gte('downloaded_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

  const { count: week } = await supabase
    .from('resource_downloads')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId)
    .gte('downloaded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return {
    total: total || 0,
    today: today || 0,
    week: week || 0
  }
}

// ============================================================================
// RATING & REVIEW QUERIES
// ============================================================================

/**
 * Rate resource
 */
export async function rateResource(
  resourceId: string,
  rating: number,
  review?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('resource_ratings')
    .upsert({
      resource_id: resourceId,
      user_id: user.id,
      rating,
      review,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get resource ratings
 */
export async function getResourceRatings(
  resourceId: string,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_ratings')
    .select('*')
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ResourceRating[]
}

/**
 * Get user's rating for resource
 */
export async function getUserRating(resourceId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_ratings')
    .select('*')
    .eq('resource_id', resourceId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as ResourceRating | null
}

// ============================================================================
// COMMENT QUERIES
// ============================================================================

/**
 * Add comment
 */
export async function addComment(
  resourceId: string,
  content: string,
  parentId?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('resource_comments')
    .insert({
      resource_id: resourceId,
      user_id: user.id,
      content,
      parent_id: parentId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get resource comments
 */
export async function getResourceComments(
  resourceId: string,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_comments')
    .select('*')
    .eq('resource_id', resourceId)
    .eq('is_deleted', false)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ResourceComment[]
}

/**
 * Get comment replies
 */
export async function getCommentReplies(parentId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_comments')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as ResourceComment[]
}

/**
 * Update comment
 */
export async function updateComment(commentId: string, content: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_comments')
    .update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_comments')
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// BOOKMARK QUERIES
// ============================================================================

/**
 * Bookmark resource
 */
export async function bookmarkResource(
  resourceId: string,
  folder?: string,
  notes?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('resource_bookmarks')
    .insert({
      resource_id: resourceId,
      user_id: user.id,
      folder,
      notes
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove bookmark
 */
export async function removeBookmark(resourceId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('resource_bookmarks')
    .delete()
    .eq('resource_id', resourceId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Get user's bookmarks
 */
export async function getUserBookmarks(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_bookmarks')
    .select(`
      *,
      resource:resource_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Check if resource is bookmarked
 */
export async function isResourceBookmarked(
  resourceId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()

  const { count } = await supabase
    .from('resource_bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('resource_id', resourceId)
    .eq('user_id', userId)

  return (count || 0) > 0
}

// ============================================================================
// TAG QUERIES
// ============================================================================

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('resource_tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ResourceTag[]
}

/**
 * Get resources by tag
 */
export async function getResourcesByTag(tagSlug: string, limit: number = 50) {
  const supabase = createClient()

  // Get tag name from slug
  const { data: tag } = await supabase
    .from('resource_tags')
    .select('name')
    .eq('slug', tagSlug)
    .single()

  if (!tag) return []

  return getResources({ tags: [tag.name] }, 'recent', limit)
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get popular resources
 */
export async function getPopularResources(
  timePeriod: '24h' | '7d' | '30d' = '7d',
  limit: number = 10
): Promise<PopularResource[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_popular_resources', {
      p_time_period: timePeriod,
      p_limit: limit
    })

  if (error) throw error
  return data as PopularResource[]
}

/**
 * Get resource library stats
 */
export async function getLibraryStats() {
  const supabase = createClient()

  const { count: totalResources } = await supabase
    .from('resources')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: totalDownloads } = await supabase
    .from('resource_downloads')
    .select('*', { count: 'exact', head: true })

  const { count: totalCollections } = await supabase
    .from('resource_collections')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true)

  const { count: totalRatings } = await supabase
    .from('resource_ratings')
    .select('*', { count: 'exact', head: true })

  return {
    total_resources: totalResources || 0,
    total_downloads: totalDownloads || 0,
    total_collections: totalCollections || 0,
    total_ratings: totalRatings || 0
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export resources to CSV
 */
export async function exportResources(filters?: ResourceFilters) {
  const resources = await getResources(filters, 'recent', 10000)

  const headers = [
    'Title',
    'Type',
    'Format',
    'License',
    'Downloads',
    'Rating',
    'Price',
    'Created'
  ]

  const rows = resources.map(r => [
    r.title,
    r.resource_type,
    r.format,
    r.license,
    r.downloads_count.toString(),
    r.rating_average.toString(),
    r.price.toString(),
    r.created_at
  ])

  return { headers, rows }
}
