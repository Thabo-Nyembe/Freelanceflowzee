/**
 * Gallery Queries
 *
 * Supabase queries for gallery image and album management
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError, toDbError } from '@/lib/types/database'

const supabase = createClient()
const logger = createSimpleLogger('Gallery')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ImageType = 'image' | 'video' | 'audio' | 'document'

export type ImageCategory =
  | 'branding'
  | 'web-design'
  | 'mobile'
  | 'social'
  | 'print'
  | 'video'
  | 'photography'
  | 'illustration'
  | '3d'
  | 'animation'
  | 'ai-generated'
  | 'other'

export type AlbumPrivacy = 'private' | 'unlisted' | 'public'

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GalleryImage {
  id: string
  user_id: string
  title: string
  description: string | null
  file_name: string
  file_size: number
  width: number
  height: number
  format: string
  url: string
  thumbnail: string | null
  type: ImageType
  category: ImageCategory
  album_id: string | null
  tags: string[]
  is_favorite: boolean
  is_public: boolean
  processing_status: ProcessingStatus
  client: string | null
  project: string | null
  views: number
  likes: number
  downloads: number
  ai_generated: boolean
  created_at: string
  updated_at: string
}

export interface GalleryAlbum {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_image: string | null
  privacy: AlbumPrivacy
  image_count: number
  total_size: number
  views: number
  created_at: string
  updated_at: string
}

export interface GalleryStats {
  total: number
  images: number
  videos: number
  favorites: number
  albums: number
  totalSize: number
  totalViews: number
  totalLikes: number
  totalDownloads: number
}

export interface ImageFilters {
  type?: ImageType[]
  category?: ImageCategory[]
  album_id?: string
  is_favorite?: boolean
  ai_generated?: boolean
  search?: string
}

export interface ImageSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'views' | 'likes' | 'downloads'
  direction: 'asc' | 'desc'
}

/** Partial image data returned from stats queries */
interface ImageStatsRow {
  type: ImageType
  file_size: number
  views: number
  likes: number
  downloads: number
  is_favorite: boolean
}

// ============================================================================
// GALLERY IMAGES QUERIES
// ============================================================================

/**
 * Get all gallery images for a user with optional filtering and sorting
 */
export async function getGalleryImages(
  userId: string,
  filters?: ImageFilters,
  sort?: ImageSortOptions,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: GalleryImage[]; error: DatabaseError | null; count: number }> {
  logger.info('Fetching gallery images', { userId, filters, sort, limit, offset })

  try {
    let query = supabase
      .from('gallery_images')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters) {
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }
      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category)
      }
      if (filters.album_id) {
        query = query.eq('album_id', filters.album_id)
      }
      if (filters.is_favorite !== undefined) {
        query = query.eq('is_favorite', filters.is_favorite)
      }
      if (filters.ai_generated !== undefined) {
        query = query.eq('ai_generated', filters.ai_generated)
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
    }

    // Apply sorting
    const sortField = sort?.field || 'created_at'
    const ascending = sort?.direction === 'asc'
    query = query.order(sortField, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      logger.error('Failed to fetch gallery images', { error, userId })
      return { data: [], error: toDbError(error), count: 0 }
    }

    logger.info('Gallery images fetched successfully', {
      count: data?.length || 0,
      totalCount: count,
      userId,
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error: unknown) {
    logger.error('Exception fetching gallery images', { error, userId })
    return { data: [], error: toDbError(error), count: 0 }
  }
}

/**
 * Get a single gallery image by ID
 */
export async function getGalleryImage(
  imageId: string
): Promise<{ data: GalleryImage | null; error: DatabaseError | null }> {
  logger.info('Fetching gallery image', { imageId })

  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('id', imageId)
      .single()

    if (error) {
      logger.error('Failed to fetch gallery image', { error, imageId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Gallery image fetched successfully', { imageId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching gallery image', { error, imageId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a new gallery image
 */
export async function createGalleryImage(
  userId: string,
  imageData: Partial<GalleryImage>
): Promise<{ data: GalleryImage | null; error: DatabaseError | null }> {
  logger.info('Creating gallery image', { userId, title: imageData.title })

  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        user_id: userId,
        title: imageData.title,
        description: imageData.description,
        file_name: imageData.file_name,
        file_size: imageData.file_size,
        width: imageData.width,
        height: imageData.height,
        format: imageData.format,
        url: imageData.url,
        thumbnail: imageData.thumbnail,
        type: imageData.type || 'image',
        category: imageData.category || 'other',
        album_id: imageData.album_id,
        tags: imageData.tags || [],
        is_favorite: imageData.is_favorite || false,
        is_public: imageData.is_public || false,
        processing_status: imageData.processing_status || 'completed',
        client: imageData.client,
        project: imageData.project,
        ai_generated: imageData.ai_generated || false,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create gallery image', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Gallery image created successfully', {
      imageId: data.id,
      title: data.title,
      userId,
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating gallery image', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a gallery image
 */
export async function updateGalleryImage(
  imageId: string,
  updates: Partial<GalleryImage>
): Promise<{ data: GalleryImage | null; error: DatabaseError | null }> {
  logger.info('Updating gallery image', { imageId, updates: Object.keys(updates) })

  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update gallery image', { error, imageId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Gallery image updated successfully', { imageId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating gallery image', { error, imageId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a gallery image
 */
export async function deleteGalleryImage(imageId: string): Promise<{ error: DatabaseError | null }> {
  logger.info('Deleting gallery image', { imageId })

  try {
    const { error } = await supabase.from('gallery_images').delete().eq('id', imageId)

    if (error) {
      logger.error('Failed to delete gallery image', { error, imageId })
      return { error: toDbError(error) }
    }

    logger.info('Gallery image deleted successfully', { imageId })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting gallery image', { error, imageId })
    return { error: toDbError(error) }
  }
}

/**
 * Bulk delete gallery images
 */
export async function bulkDeleteGalleryImages(imageIds: string[]): Promise<{ error: DatabaseError | null }> {
  logger.info('Bulk deleting gallery images', { count: imageIds.length })

  try {
    const { error } = await supabase.from('gallery_images').delete().in('id', imageIds)

    if (error) {
      logger.error('Failed to bulk delete gallery images', { error, count: imageIds.length })
      return { error: toDbError(error) }
    }

    logger.info('Gallery images bulk deleted successfully', { count: imageIds.length })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception bulk deleting gallery images', { error })
    return { error: toDbError(error) }
  }
}

/**
 * Toggle image favorite status
 */
export async function toggleImageFavorite(
  imageId: string,
  isFavorite: boolean
): Promise<{ error: DatabaseError | null }> {
  logger.info('Toggling image favorite', { imageId, isFavorite })

  try {
    const { error } = await supabase
      .from('gallery_images')
      .update({ is_favorite: isFavorite })
      .eq('id', imageId)

    if (error) {
      logger.error('Failed to toggle image favorite', { error, imageId })
      return { error: toDbError(error) }
    }

    logger.info('Image favorite toggled successfully', { imageId, isFavorite })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception toggling image favorite', { error, imageId })
    return { error: toDbError(error) }
  }
}

/**
 * Increment image views
 */
export async function incrementImageViews(imageId: string): Promise<{ error: DatabaseError | null }> {
  logger.info('Incrementing image views', { imageId })

  try {
    // Get current views
    const { data: image } = await supabase
      .from('gallery_images')
      .select('views')
      .eq('id', imageId)
      .single()

    if (image) {
      const { error } = await supabase
        .from('gallery_images')
        .update({ views: (image.views || 0) + 1 })
        .eq('id', imageId)

      if (error) {
        logger.error('Failed to increment image views', { error, imageId })
        return { error: toDbError(error) }
      }

      logger.info('Image views incremented successfully', { imageId })
      return { error: null }
    }

    return { error: toDbError(new Error('Image not found')) }
  } catch (error: unknown) {
    logger.error('Exception incrementing image views', { error, imageId })
    return { error: toDbError(error) }
  }
}

/**
 * Increment image likes
 */
export async function incrementImageLikes(imageId: string): Promise<{ error: DatabaseError | null }> {
  logger.info('Incrementing image likes', { imageId })

  try {
    const { data: image } = await supabase
      .from('gallery_images')
      .select('likes')
      .eq('id', imageId)
      .single()

    if (image) {
      const { error } = await supabase
        .from('gallery_images')
        .update({ likes: (image.likes || 0) + 1 })
        .eq('id', imageId)

      if (error) {
        logger.error('Failed to increment image likes', { error, imageId })
        return { error: toDbError(error) }
      }

      logger.info('Image likes incremented successfully', { imageId })
      return { error: null }
    }

    return { error: toDbError(new Error('Image not found')) }
  } catch (error: unknown) {
    logger.error('Exception incrementing image likes', { error, imageId })
    return { error: toDbError(error) }
  }
}

/**
 * Increment image downloads
 */
export async function incrementImageDownloads(imageId: string): Promise<{ error: DatabaseError | null }> {
  logger.info('Incrementing image downloads', { imageId })

  try {
    const { data: image } = await supabase
      .from('gallery_images')
      .select('downloads')
      .eq('id', imageId)
      .single()

    if (image) {
      const { error } = await supabase
        .from('gallery_images')
        .update({ downloads: (image.downloads || 0) + 1 })
        .eq('id', imageId)

      if (error) {
        logger.error('Failed to increment image downloads', { error, imageId })
        return { error: toDbError(error) }
      }

      logger.info('Image downloads incremented successfully', { imageId })
      return { error: null }
    }

    return { error: toDbError(new Error('Image not found')) }
  } catch (error: unknown) {
    logger.error('Exception incrementing image downloads', { error, imageId })
    return { error: toDbError(error) }
  }
}

/**
 * Search gallery images
 */
export async function searchGalleryImages(
  userId: string,
  searchTerm: string,
  limit: number = 20
): Promise<{ data: GalleryImage[]; error: DatabaseError | null }> {
  logger.info('Searching gallery images', { userId, searchTerm, limit })

  return getGalleryImages(
    userId,
    { search: searchTerm },
    { field: 'created_at', direction: 'desc' },
    limit
  ).then(({ data, error }) => ({ data, error }))
}

// ============================================================================
// GALLERY ALBUMS QUERIES
// ============================================================================

/**
 * Get all albums for a user
 */
export async function getGalleryAlbums(
  userId: string
): Promise<{ data: GalleryAlbum[]; error: DatabaseError | null }> {
  logger.info('Fetching gallery albums', { userId })

  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch gallery albums', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Gallery albums fetched successfully', { count: data?.length || 0, userId })
    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching gallery albums', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get a single album by ID
 */
export async function getGalleryAlbum(
  albumId: string
): Promise<{ data: GalleryAlbum | null; error: DatabaseError | null }> {
  logger.info('Fetching gallery album', { albumId })

  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .eq('id', albumId)
      .single()

    if (error) {
      logger.error('Failed to fetch gallery album', { error, albumId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Gallery album fetched successfully', { albumId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching gallery album', { error, albumId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a new album
 */
export async function createGalleryAlbum(
  userId: string,
  albumData: Partial<GalleryAlbum>
): Promise<{ data: GalleryAlbum | null; error: DatabaseError | null }> {
  logger.info('Creating gallery album', { userId, name: albumData.name })

  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .insert({
        user_id: userId,
        name: albumData.name,
        description: albumData.description,
        cover_image: albumData.cover_image,
        privacy: albumData.privacy || 'private',
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create gallery album', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Gallery album created successfully', {
      albumId: data.id,
      name: data.name,
      userId,
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating gallery album', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update an album
 */
export async function updateGalleryAlbum(
  albumId: string,
  updates: Partial<GalleryAlbum>
): Promise<{ data: GalleryAlbum | null; error: DatabaseError | null }> {
  logger.info('Updating gallery album', { albumId, updates: Object.keys(updates) })

  try {
    const { data, error } = await supabase
      .from('gallery_albums')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', albumId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update gallery album', { error, albumId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Gallery album updated successfully', { albumId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating gallery album', { error, albumId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete an album
 */
export async function deleteGalleryAlbum(albumId: string): Promise<{ error: DatabaseError | null }> {
  logger.info('Deleting gallery album', { albumId })

  try {
    const { error } = await supabase.from('gallery_albums').delete().eq('id', albumId)

    if (error) {
      logger.error('Failed to delete gallery album', { error, albumId })
      return { error: toDbError(error) }
    }

    logger.info('Gallery album deleted successfully', { albumId })
    return { error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting gallery album', { error, albumId })
    return { error: toDbError(error) }
  }
}

/**
 * Get gallery statistics
 */
export async function getGalleryStats(userId: string): Promise<GalleryStats> {
  logger.info('Fetching gallery statistics', { userId })

  try {
    // Get images
    const { data: images, error: imagesError } = await supabase
      .from('gallery_images')
      .select('type, file_size, views, likes, downloads, is_favorite')
      .eq('user_id', userId)

    if (imagesError) throw imagesError

    // Get albums
    const { data: albums, error: albumsError } = await supabase
      .from('gallery_albums')
      .select('id')
      .eq('user_id', userId)

    if (albumsError) throw albumsError

    const typedImages = (images || []) as ImageStatsRow[]
    const stats: GalleryStats = {
      total: typedImages.length,
      images: typedImages.filter((i: ImageStatsRow) => i.type === 'image').length,
      videos: typedImages.filter((i: ImageStatsRow) => i.type === 'video').length,
      favorites: typedImages.filter((i: ImageStatsRow) => i.is_favorite).length,
      albums: albums?.length || 0,
      totalSize: typedImages.reduce((sum: number, i: ImageStatsRow) => sum + (i.file_size || 0), 0),
      totalViews: typedImages.reduce((sum: number, i: ImageStatsRow) => sum + (i.views || 0), 0),
      totalLikes: typedImages.reduce((sum: number, i: ImageStatsRow) => sum + (i.likes || 0), 0),
      totalDownloads: typedImages.reduce((sum: number, i: ImageStatsRow) => sum + (i.downloads || 0), 0),
    }

    logger.info('Gallery statistics fetched', { stats, userId })
    return stats
  } catch (error: unknown) {
    logger.error('Failed to fetch gallery statistics', { error, userId })
    return {
      total: 0,
      images: 0,
      videos: 0,
      favorites: 0,
      albums: 0,
      totalSize: 0,
      totalViews: 0,
      totalLikes: 0,
      totalDownloads: 0,
    }
  }
}
