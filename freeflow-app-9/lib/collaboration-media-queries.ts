/**
 * Collaboration Media Queries
 *
 * Supabase queries for media sharing in collaboration workspaces:
 * - Upload and manage media files (images, videos, audio, documents)
 * - Share media with other users
 * - Track views, downloads, favorites
 * - Tag and organize media
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

const logger = createSimpleLogger('CollaborationMedia')

// ============================================================================
// TYPES
// ============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document'

export interface CollaborationMedia {
  id: string
  user_id: string
  name: string
  media_type: MediaType
  file_url: string
  thumbnail_url?: string
  file_size: number
  duration_seconds?: number
  dimensions?: {
    width: number
    height: number
  }
  is_favorite: boolean
  download_count: number
  view_count: number
  tags: string[]
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface MediaShare {
  id: string
  media_id: string
  shared_with_user_id: string
  shared_by: string
  created_at: string
}

export interface MediaWithShares extends CollaborationMedia {
  shares?: MediaShare[]
  shared_with_count?: number
}

// ============================================================================
// MEDIA CRUD OPERATIONS
// ============================================================================

/**
 * Get all media files for a user
 */
export async function getMedia(
  userId: string,
  filters?: {
    media_type?: MediaType
    is_favorite?: boolean
    tags?: string[]
    search?: string
  }
): Promise<{ data: CollaborationMedia[] | null; error: DatabaseError | null }> {
  const startTime = performance.now()

  try {
    logger.info('Fetching media files', { userId, filters })

    const supabase = createClient()

    let query = supabase
      .from('collaboration_media')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.media_type) {
      query = query.eq('media_type', filters.media_type)
    }

    if (filters?.is_favorite !== undefined) {
      query = query.eq('is_favorite', filters.is_favorite)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch media files', { error: error.message, userId })
      return { data: null, error: toDbError(error) }
    }

    const duration = performance.now() - startTime

    logger.info('Media files fetched successfully', {
      userId,
      count: data?.length || 0,
      duration
    })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getMedia', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Get a single media file by ID
 */
export async function getMediaById(
  mediaId: string,
  userId: string
): Promise<{ data: CollaborationMedia | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching media by ID', { mediaId, userId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_media')
      .select('*')
      .eq('id', mediaId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch media', { error: error.message, mediaId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Media fetched successfully', { mediaId })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getMediaById', { error: dbError.message, mediaId })
    return { data: null, error: dbError }
  }
}

/**
 * Create a new media file
 */
export async function createMedia(
  userId: string,
  media: {
    name: string
    media_type: MediaType
    file_url: string
    thumbnail_url?: string
    file_size: number
    duration_seconds?: number
    dimensions?: { width: number; height: number }
    tags?: string[]
    metadata?: Record<string, JsonValue>
  }
): Promise<{ data: CollaborationMedia | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating media file', { userId, name: media.name, type: media.media_type })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_media')
      .insert({
        user_id: userId,
        name: media.name,
        media_type: media.media_type,
        file_url: media.file_url,
        thumbnail_url: media.thumbnail_url,
        file_size: media.file_size,
        duration_seconds: media.duration_seconds,
        dimensions: media.dimensions,
        tags: media.tags || [],
        metadata: media.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create media', { error: error.message, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Media created successfully', {
      mediaId: data.id,
      name: data.name,
      size: data.file_size
    })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in createMedia', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Update media file metadata
 */
export async function updateMedia(
  mediaId: string,
  userId: string,
  updates: {
    name?: string
    is_favorite?: boolean
    tags?: string[]
    metadata?: Record<string, JsonValue>
  }
): Promise<{ data: CollaborationMedia | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating media file', { mediaId, userId, updates })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_media')
      .update(updates)
      .eq('id', mediaId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update media', { error: error.message, mediaId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Media updated successfully', { mediaId })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in updateMedia', { error: dbError.message, mediaId })
    return { data: null, error: dbError }
  }
}

/**
 * Delete a media file
 */
export async function deleteMedia(
  mediaId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting media file', { mediaId, userId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_media')
      .delete()
      .eq('id', mediaId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete media', { error: error.message, mediaId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Media deleted successfully', { mediaId })

    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in deleteMedia', { error: dbError.message, mediaId })
    return { success: false, error: dbError }
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  mediaId: string,
  userId: string,
  isFavorite: boolean
): Promise<{ data: CollaborationMedia | null; error: DatabaseError | null }> {
  try {
    logger.info('Toggling favorite status', { mediaId, userId, isFavorite })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_media')
      .update({ is_favorite: isFavorite })
      .eq('id', mediaId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle favorite', { error: error.message, mediaId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Favorite toggled successfully', { mediaId, isFavorite })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in toggleFavorite', { error: dbError.message, mediaId })
    return { data: null, error: dbError }
  }
}

/**
 * Increment view count
 */
export async function incrementViewCount(
  mediaId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.rpc('increment', {
      table_name: 'collaboration_media',
      row_id: mediaId,
      column_name: 'view_count'
    })

    // If RPC doesn't exist, fall back to manual increment
    if (error) {
      const { data: current } = await supabase
        .from('collaboration_media')
        .select('view_count')
        .eq('id', mediaId)
        .single()

      if (current) {
        await supabase
          .from('collaboration_media')
          .update({ view_count: (current.view_count || 0) + 1 })
          .eq('id', mediaId)
      }
    }

    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in incrementViewCount', { error: dbError.message, mediaId })
    return { success: false, error: dbError }
  }
}

/**
 * Increment download count
 */
export async function incrementDownloadCount(
  mediaId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Incrementing download count', { mediaId })

    const supabase = createClient()

    const { data: current } = await supabase
      .from('collaboration_media')
      .select('download_count')
      .eq('id', mediaId)
      .single()

    if (current) {
      await supabase
        .from('collaboration_media')
        .update({ download_count: (current.download_count || 0) + 1 })
        .eq('id', mediaId)
    }

    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in incrementDownloadCount', { error: dbError.message, mediaId })
    return { success: false, error: dbError }
  }
}

// ============================================================================
// MEDIA SHARING
// ============================================================================

/**
 * Share media with a user
 */
export async function shareMedia(
  mediaId: string,
  sharedWithUserId: string,
  sharedBy: string
): Promise<{ data: MediaShare | null; error: DatabaseError | null }> {
  try {
    logger.info('Sharing media', { mediaId, sharedWithUserId, sharedBy })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_media_shares')
      .insert({
        media_id: mediaId,
        shared_with_user_id: sharedWithUserId,
        shared_by: sharedBy
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to share media', { error: error.message, mediaId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Media shared successfully', { mediaId, sharedWithUserId })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in shareMedia', { error: dbError.message, mediaId })
    return { data: null, error: dbError }
  }
}

/**
 * Unshare media with a user
 */
export async function unshareMedia(
  mediaId: string,
  sharedWithUserId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Unsharing media', { mediaId, sharedWithUserId })

    const supabase = createClient()

    const { error } = await supabase
      .from('collaboration_media_shares')
      .delete()
      .eq('media_id', mediaId)
      .eq('shared_with_user_id', sharedWithUserId)

    if (error) {
      logger.error('Failed to unshare media', { error: error.message, mediaId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Media unshared successfully', { mediaId, sharedWithUserId })

    return { success: true, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in unshareMedia', { error: dbError.message, mediaId })
    return { success: false, error: dbError }
  }
}

/**
 * Get media shared with a user
 */
export async function getSharedMedia(
  userId: string
): Promise<{ data: MediaWithShares[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching shared media', { userId })

    const supabase = createClient()

    // Get media IDs shared with this user
    const { data: shares, error: sharesError } = await supabase
      .from('collaboration_media_shares')
      .select('media_id')
      .eq('shared_with_user_id', userId)

    if (sharesError) {
      logger.error('Failed to fetch shares', { error: sharesError.message })
      return { data: null, error: toDbError(sharesError) }
    }

    if (!shares || shares.length === 0) {
      return { data: [], error: null }
    }

    const mediaIds = shares.map(s => s.media_id)

    // Get the actual media files
    const { data: media, error: mediaError } = await supabase
      .from('collaboration_media')
      .select('*')
      .in('id', mediaIds)
      .order('created_at', { ascending: false })

    if (mediaError) {
      logger.error('Failed to fetch shared media', { error: mediaError.message })
      return { data: null, error: toDbError(mediaError) }
    }

    logger.info('Shared media fetched successfully', { userId, count: media?.length || 0 })

    return { data: media, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getSharedMedia', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}

/**
 * Get users a media file is shared with
 */
export async function getMediaShares(
  mediaId: string
): Promise<{ data: MediaShare[] | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching media shares', { mediaId })

    const supabase = createClient()

    const { data, error } = await supabase
      .from('collaboration_media_shares')
      .select('*')
      .eq('media_id', mediaId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch media shares', { error: error.message, mediaId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Media shares fetched successfully', { mediaId, count: data?.length || 0 })

    return { data, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getMediaShares', { error: dbError.message, mediaId })
    return { data: null, error: dbError }
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get media statistics
 */
export async function getMediaStats(
  userId: string
): Promise<{
  data: {
    total: number
    byType: Record<MediaType, number>
    totalSize: number
    favorites: number
    totalViews: number
    totalDownloads: number
  } | null
  error: DatabaseError | null
}> {
  try {
    logger.info('Fetching media statistics', { userId })

    const supabase = createClient()

    const { data: media, error } = await supabase
      .from('collaboration_media')
      .select('media_type, file_size, is_favorite, view_count, download_count')
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to fetch media stats', { error: error.message })
      return { data: null, error: toDbError(error) }
    }

    const stats = {
      total: media?.length || 0,
      byType: {
        image: media?.filter(m => m.media_type === 'image').length || 0,
        video: media?.filter(m => m.media_type === 'video').length || 0,
        audio: media?.filter(m => m.media_type === 'audio').length || 0,
        document: media?.filter(m => m.media_type === 'document').length || 0
      },
      totalSize: media?.reduce((sum, m) => sum + (m.file_size || 0), 0) || 0,
      favorites: media?.filter(m => m.is_favorite).length || 0,
      totalViews: media?.reduce((sum, m) => sum + (m.view_count || 0), 0) || 0,
      totalDownloads: media?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0
    }

    logger.info('Media statistics calculated', { userId, stats })

    return { data: stats, error: null }
  } catch (error: unknown) {
    const dbError = toDbError(error)
    logger.error('Exception in getMediaStats', { error: dbError.message, userId })
    return { data: null, error: dbError }
  }
}
