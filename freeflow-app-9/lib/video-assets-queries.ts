/**
 * Video Assets Queries
 *
 * Supabase queries for video asset management
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from './logger'

const supabase = createClient()
const logger = createFeatureLogger('VideoAssets')

// TypeScript interfaces
export interface VideoAsset {
  id: string
  user_id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'font' | 'transition' | 'effect' | 'overlay'
  duration?: number
  file_size: number
  format: string
  file_path: string
  thumbnail_path?: string
  category?: string
  tags: string[]
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AssetFilters {
  type?: VideoAsset['type']
  category?: string
  search?: string
  minFileSize?: number
  maxFileSize?: number
  minDuration?: number
  maxDuration?: number
}

export interface AssetSortOptions {
  field: 'created_at' | 'updated_at' | 'name' | 'file_size' | 'duration'
  ascending?: boolean
}

export interface AssetStats {
  total: number
  video: number
  audio: number
  image: number
  font: number
  transition: number
  effect: number
  overlay: number
  totalStorage: number
  averageFileSize: number
}

/**
 * Get all video assets for a user with optional filters and sorting
 */
export async function getVideoAssets(
  userId: string,
  filters?: AssetFilters,
  sort?: AssetSortOptions,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: VideoAsset[]; error: any; count: number }> {
  logger.info('Fetching video assets', { userId, filters, sort, limit, offset })

  try {
    let query = supabase
      .from('video_assets')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }
    if (filters?.minFileSize) {
      query = query.gte('file_size', filters.minFileSize)
    }
    if (filters?.maxFileSize) {
      query = query.lte('file_size', filters.maxFileSize)
    }
    if (filters?.minDuration) {
      query = query.gte('duration', filters.minDuration)
    }
    if (filters?.maxDuration) {
      query = query.lte('duration', filters.maxDuration)
    }

    // Apply sorting
    const sortField = sort?.field || 'created_at'
    const ascending = sort?.ascending ?? false
    query = query.order(sortField, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      logger.error('Failed to fetch video assets', { error, userId })
      return { data: [], error, count: 0 }
    }

    logger.info('Video assets fetched successfully', {
      count: data?.length || 0,
      totalCount: count,
      userId,
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error) {
    logger.error('Exception fetching video assets', { error, userId })
    return { data: [], error, count: 0 }
  }
}

/**
 * Get a single video asset by ID
 */
export async function getVideoAsset(
  assetId: string
): Promise<{ data: VideoAsset | null; error: any }> {
  logger.info('Fetching video asset', { assetId })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('id', assetId)
      .single()

    if (error) {
      logger.error('Failed to fetch video asset', { error, assetId })
      return { data: null, error }
    }

    logger.info('Video asset fetched successfully', { assetId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching video asset', { error, assetId })
    return { data: null, error }
  }
}

/**
 * Create a new video asset
 */
export async function createVideoAsset(
  userId: string,
  assetData: Partial<VideoAsset>
): Promise<{ data: VideoAsset | null; error: any }> {
  logger.info('Creating video asset', { userId, name: assetData.name })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .insert({
        user_id: userId,
        name: assetData.name,
        type: assetData.type,
        duration: assetData.duration,
        file_size: assetData.file_size || 0,
        format: assetData.format,
        file_path: assetData.file_path,
        thumbnail_path: assetData.thumbnail_path,
        category: assetData.category,
        tags: assetData.tags || [],
        metadata: assetData.metadata || {},
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create video asset', { error, userId })
      return { data: null, error }
    }

    logger.info('Video asset created successfully', {
      assetId: data.id,
      name: data.name,
      type: data.type,
      userId,
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating video asset', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a video asset
 */
export async function updateVideoAsset(
  assetId: string,
  updates: Partial<VideoAsset>
): Promise<{ data: VideoAsset | null; error: any }> {
  logger.info('Updating video asset', { assetId, updates })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update video asset', { error, assetId })
      return { data: null, error }
    }

    logger.info('Video asset updated successfully', { assetId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating video asset', { error, assetId })
    return { data: null, error }
  }
}

/**
 * Delete a video asset
 */
export async function deleteVideoAsset(
  assetId: string
): Promise<{ error: any }> {
  logger.info('Deleting video asset', { assetId })

  try {
    const { error } = await supabase
      .from('video_assets')
      .delete()
      .eq('id', assetId)

    if (error) {
      logger.error('Failed to delete video asset', { error, assetId })
      return { error }
    }

    logger.info('Video asset deleted successfully', { assetId })
    return { error: null }
  } catch (error) {
    logger.error('Exception deleting video asset', { error, assetId })
    return { error }
  }
}

/**
 * Bulk delete video assets
 */
export async function bulkDeleteVideoAssets(
  assetIds: string[]
): Promise<{ error: any }> {
  logger.info('Bulk deleting video assets', { count: assetIds.length })

  try {
    const { error } = await supabase
      .from('video_assets')
      .delete()
      .in('id', assetIds)

    if (error) {
      logger.error('Failed to bulk delete video assets', { error, count: assetIds.length })
      return { error }
    }

    logger.info('Video assets bulk deleted successfully', { count: assetIds.length })
    return { error: null }
  } catch (error) {
    logger.error('Exception bulk deleting video assets', { error })
    return { error }
  }
}

/**
 * Search video assets
 */
export async function searchVideoAssets(
  userId: string,
  searchTerm: string,
  limit: number = 20
): Promise<{ data: VideoAsset[]; error: any }> {
  logger.info('Searching video assets', { userId, searchTerm, limit })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to search video assets', { error, userId, searchTerm })
      return { data: [], error }
    }

    logger.info('Video assets search completed', {
      resultsCount: data?.length || 0,
      searchTerm,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception searching video assets', { error, userId, searchTerm })
    return { data: [], error }
  }
}

/**
 * Get assets by type
 */
export async function getAssetsByType(
  userId: string,
  type: VideoAsset['type']
): Promise<{ data: VideoAsset[]; error: any }> {
  logger.info('Fetching assets by type', { userId, type })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch assets by type', { error, userId, type })
      return { data: [], error }
    }

    logger.info('Assets by type fetched successfully', {
      count: data?.length || 0,
      type,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching assets by type', { error, userId, type })
    return { data: [], error }
  }
}

/**
 * Get assets by category
 */
export async function getAssetsByCategory(
  userId: string,
  category: string
): Promise<{ data: VideoAsset[]; error: any }> {
  logger.info('Fetching assets by category', { userId, category })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch assets by category', { error, userId, category })
      return { data: [], error }
    }

    logger.info('Assets by category fetched successfully', {
      count: data?.length || 0,
      category,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching assets by category', { error, userId, category })
    return { data: [], error }
  }
}

/**
 * Get recent assets
 */
export async function getRecentAssets(
  userId: string,
  limit: number = 10
): Promise<{ data: VideoAsset[]; error: any }> {
  logger.info('Fetching recent assets', { userId, limit })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch recent assets', { error, userId })
      return { data: [], error }
    }

    logger.info('Recent assets fetched successfully', { count: data?.length || 0, userId })
    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching recent assets', { error, userId })
    return { data: [], error }
  }
}

/**
 * Get video asset statistics for a user
 */
export async function getAssetStats(userId: string): Promise<AssetStats> {
  logger.info('Fetching asset statistics', { userId })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('type, file_size')
      .eq('user_id', userId)

    if (error) throw error

    const stats: AssetStats = {
      total: data?.length || 0,
      video: data?.filter((a) => a.type === 'video').length || 0,
      audio: data?.filter((a) => a.type === 'audio').length || 0,
      image: data?.filter((a) => a.type === 'image').length || 0,
      font: data?.filter((a) => a.type === 'font').length || 0,
      transition: data?.filter((a) => a.type === 'transition').length || 0,
      effect: data?.filter((a) => a.type === 'effect').length || 0,
      overlay: data?.filter((a) => a.type === 'overlay').length || 0,
      totalStorage: data?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0,
      averageFileSize: data?.length
        ? data.reduce((sum, a) => sum + (a.file_size || 0), 0) / data.length
        : 0,
    }

    logger.info('Asset statistics fetched', { stats, userId })
    return stats
  } catch (error) {
    logger.error('Failed to fetch asset statistics', { error, userId })
    return {
      total: 0,
      video: 0,
      audio: 0,
      image: 0,
      font: 0,
      transition: 0,
      effect: 0,
      overlay: 0,
      totalStorage: 0,
      averageFileSize: 0,
    }
  }
}

/**
 * Get assets by tags
 */
export async function getAssetsByTags(
  userId: string,
  tags: string[]
): Promise<{ data: VideoAsset[]; error: any }> {
  logger.info('Fetching assets by tags', { userId, tags })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', tags)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch assets by tags', { error, userId, tags })
      return { data: [], error }
    }

    logger.info('Assets by tags fetched successfully', {
      count: data?.length || 0,
      tags,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching assets by tags', { error, userId, tags })
    return { data: [], error }
  }
}

/**
 * Update asset tags
 */
export async function updateAssetTags(
  assetId: string,
  tags: string[]
): Promise<{ data: VideoAsset | null; error: any }> {
  logger.info('Updating asset tags', { assetId, tags })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .update({
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update asset tags', { error, assetId })
      return { data: null, error }
    }

    logger.info('Asset tags updated successfully', { assetId, tagsCount: tags.length })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating asset tags', { error, assetId })
    return { data: null, error }
  }
}

/**
 * Get all unique categories for a user's assets
 */
export async function getAssetCategories(
  userId: string
): Promise<{ data: string[]; error: any }> {
  logger.info('Fetching asset categories', { userId })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('category')
      .eq('user_id', userId)
      .not('category', 'is', null)

    if (error) {
      logger.error('Failed to fetch asset categories', { error, userId })
      return { data: [], error }
    }

    // Extract unique categories
    const categories = [...new Set(data.map((item) => item.category).filter(Boolean))] as string[]

    logger.info('Asset categories fetched successfully', {
      count: categories.length,
      userId,
    })

    return { data: categories, error: null }
  } catch (error) {
    logger.error('Exception fetching asset categories', { error, userId })
    return { data: [], error }
  }
}

/**
 * Get all unique tags for a user's assets
 */
export async function getAssetTags(
  userId: string
): Promise<{ data: string[]; error: any }> {
  logger.info('Fetching asset tags', { userId })

  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('tags')
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to fetch asset tags', { error, userId })
      return { data: [], error }
    }

    // Flatten and get unique tags
    const allTags = data.flatMap((item) => item.tags || [])
    const uniqueTags = [...new Set(allTags)].filter(Boolean)

    logger.info('Asset tags fetched successfully', {
      count: uniqueTags.length,
      userId,
    })

    return { data: uniqueTags, error: null }
  } catch (error) {
    logger.error('Exception fetching asset tags', { error, userId })
    return { data: [], error }
  }
}

// Asset archive/restore functions

export async function archiveVideoAsset(
  assetId: string
): Promise<{ data: VideoAsset | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('video_assets')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to archive video asset', { error, assetId })
      return { data: null, error }
    }

    logger.info('Video asset archived', { assetId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception archiving video asset', { error, assetId })
    return { data: null, error }
  }
}

export async function restoreVideoAsset(
  assetId: string
): Promise<{ data: VideoAsset | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('video_assets')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to restore video asset', { error, assetId })
      return { data: null, error }
    }

    logger.info('Video asset restored', { assetId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception restoring video asset', { error, assetId })
    return { data: null, error }
  }
}

export async function getAssetsByProject(
  projectId: string
): Promise<{ data: VideoAsset[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch assets by project', { error, projectId })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching assets by project', { error, projectId })
    return { data: [], error }
  }
}

export async function getAssetsByStatus(
  userId: string,
  status: string
): Promise<{ data: VideoAsset[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch assets by status', { error, status })
      return { data: [], error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching assets by status', { error, status })
    return { data: [], error }
  }
}
