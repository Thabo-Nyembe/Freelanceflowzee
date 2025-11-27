/**
 * Video Studio Queries
 *
 * Supabase queries for video project management
 */

import { supabase } from './supabase'
import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('VideoStudio')

// TypeScript interfaces
export interface VideoProject {
  id: string
  user_id: string
  title: string
  description: string | null
  duration: number
  resolution: string
  format: 'mp4' | 'mov' | 'webm' | 'avi' | 'mkv'
  status: 'draft' | 'processing' | 'ready' | 'published' | 'archived'
  file_path: string | null
  thumbnail_path: string | null
  file_size: number
  views: number
  likes: number
  created_at: string
  updated_at: string
}

export interface VideoFilters {
  status?: VideoProject['status']
  format?: VideoProject['format']
  search?: string
  minDuration?: number
  maxDuration?: number
}

export interface VideoSortOptions {
  field: 'created_at' | 'updated_at' | 'title' | 'duration' | 'views' | 'likes'
  ascending?: boolean
}

export interface VideoStats {
  total: number
  draft: number
  processing: number
  ready: number
  published: number
  archived: number
  totalViews: number
  totalLikes: number
  totalDuration: number
  totalSize: number
  averageDuration: number
}

/**
 * Get all video projects for a user with optional filters and sorting
 */
export async function getVideoProjects(
  userId: string,
  filters?: VideoFilters,
  sort?: VideoSortOptions,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: VideoProject[]; error: any; count: number }> {
  logger.info('Fetching video projects', { userId, filters, sort, limit, offset })

  try {
    let query = supabase
      .from('video_projects')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.format) {
      query = query.eq('format', filters.format)
    }
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
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
      logger.error('Failed to fetch video projects', { error, userId })
      return { data: [], error, count: 0 }
    }

    logger.info('Video projects fetched successfully', {
      count: data?.length || 0,
      totalCount: count,
      userId,
    })

    return { data: data || [], error: null, count: count || 0 }
  } catch (error) {
    logger.error('Exception fetching video projects', { error, userId })
    return { data: [], error, count: 0 }
  }
}

/**
 * Get a single video project by ID
 */
export async function getVideoProject(
  projectId: string
): Promise<{ data: VideoProject | null; error: any }> {
  logger.info('Fetching video project', { projectId })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      logger.error('Failed to fetch video project', { error, projectId })
      return { data: null, error }
    }

    logger.info('Video project fetched successfully', { projectId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception fetching video project', { error, projectId })
    return { data: null, error }
  }
}

/**
 * Create a new video project
 */
export async function createVideoProject(
  userId: string,
  projectData: Partial<VideoProject>
): Promise<{ data: VideoProject | null; error: any }> {
  logger.info('Creating video project', { userId, title: projectData.title })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .insert({
        user_id: userId,
        title: projectData.title,
        description: projectData.description,
        duration: projectData.duration || 0,
        resolution: projectData.resolution || '1920x1080',
        format: projectData.format || 'mp4',
        status: projectData.status || 'draft',
        file_path: projectData.file_path,
        thumbnail_path: projectData.thumbnail_path,
        file_size: projectData.file_size || 0,
        views: 0,
        likes: 0,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create video project', { error, userId })
      return { data: null, error }
    }

    logger.info('Video project created successfully', {
      projectId: data.id,
      title: data.title,
      userId,
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating video project', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a video project
 */
export async function updateVideoProject(
  projectId: string,
  updates: Partial<VideoProject>
): Promise<{ data: VideoProject | null; error: any }> {
  logger.info('Updating video project', { projectId, updates })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update video project', { error, projectId })
      return { data: null, error }
    }

    logger.info('Video project updated successfully', { projectId })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating video project', { error, projectId })
    return { data: null, error }
  }
}

/**
 * Update video project status
 */
export async function updateVideoStatus(
  projectId: string,
  status: VideoProject['status']
): Promise<{ data: VideoProject | null; error: any }> {
  logger.info('Updating video status', { projectId, status })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update video status', { error, projectId, status })
      return { data: null, error }
    }

    logger.info('Video status updated successfully', { projectId, status })
    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating video status', { error, projectId, status })
    return { data: null, error }
  }
}

/**
 * Delete a video project
 */
export async function deleteVideoProject(
  projectId: string
): Promise<{ error: any }> {
  logger.info('Deleting video project', { projectId })

  try {
    const { error } = await supabase
      .from('video_projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      logger.error('Failed to delete video project', { error, projectId })
      return { error }
    }

    logger.info('Video project deleted successfully', { projectId })
    return { error: null }
  } catch (error) {
    logger.error('Exception deleting video project', { error, projectId })
    return { error }
  }
}

/**
 * Bulk delete video projects
 */
export async function bulkDeleteVideoProjects(
  projectIds: string[]
): Promise<{ error: any }> {
  logger.info('Bulk deleting video projects', { count: projectIds.length })

  try {
    const { error } = await supabase
      .from('video_projects')
      .delete()
      .in('id', projectIds)

    if (error) {
      logger.error('Failed to bulk delete video projects', { error, count: projectIds.length })
      return { error }
    }

    logger.info('Video projects bulk deleted successfully', { count: projectIds.length })
    return { error: null }
  } catch (error) {
    logger.error('Exception bulk deleting video projects', { error })
    return { error }
  }
}

/**
 * Get video project statistics for a user
 */
export async function getVideoStats(userId: string): Promise<VideoStats> {
  logger.info('Fetching video statistics', { userId })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .select('status, duration, file_size, views, likes')
      .eq('user_id', userId)

    if (error) throw error

    const stats: VideoStats = {
      total: data?.length || 0,
      draft: data?.filter((p) => p.status === 'draft').length || 0,
      processing: data?.filter((p) => p.status === 'processing').length || 0,
      ready: data?.filter((p) => p.status === 'ready').length || 0,
      published: data?.filter((p) => p.status === 'published').length || 0,
      archived: data?.filter((p) => p.status === 'archived').length || 0,
      totalViews: data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
      totalLikes: data?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0,
      totalDuration: data?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0,
      totalSize: data?.reduce((sum, p) => sum + (p.file_size || 0), 0) || 0,
      averageDuration: data?.length
        ? data.reduce((sum, p) => sum + (p.duration || 0), 0) / data.length
        : 0,
    }

    logger.info('Video statistics fetched', { stats, userId })
    return stats
  } catch (error) {
    logger.error('Failed to fetch video statistics', { error, userId })
    return {
      total: 0,
      draft: 0,
      processing: 0,
      ready: 0,
      published: 0,
      archived: 0,
      totalViews: 0,
      totalLikes: 0,
      totalDuration: 0,
      totalSize: 0,
      averageDuration: 0,
    }
  }
}

/**
 * Increment video views
 */
export async function incrementVideoViews(
  projectId: string
): Promise<{ error: any }> {
  logger.info('Incrementing video views', { projectId })

  try {
    const { error } = await supabase.rpc('increment_video_views', {
      project_id: projectId,
    })

    // If RPC doesn't exist, fallback to manual increment
    if (error?.code === '42883') {
      const { data: project } = await supabase
        .from('video_projects')
        .select('views')
        .eq('id', projectId)
        .single()

      if (project) {
        const { error: updateError } = await supabase
          .from('video_projects')
          .update({ views: (project.views || 0) + 1 })
          .eq('id', projectId)

        if (updateError) {
          logger.error('Failed to increment views (fallback)', { error: updateError, projectId })
          return { error: updateError }
        }

        logger.info('Video views incremented (fallback)', { projectId })
        return { error: null }
      }
    }

    if (error) {
      logger.error('Failed to increment video views', { error, projectId })
      return { error }
    }

    logger.info('Video views incremented successfully', { projectId })
    return { error: null }
  } catch (error) {
    logger.error('Exception incrementing video views', { error, projectId })
    return { error }
  }
}

/**
 * Toggle video like
 */
export async function toggleVideoLike(
  projectId: string,
  increment: boolean
): Promise<{ error: any }> {
  logger.info('Toggling video like', { projectId, increment })

  try {
    const { data: project } = await supabase
      .from('video_projects')
      .select('likes')
      .eq('id', projectId)
      .single()

    if (!project) {
      return { error: new Error('Project not found') }
    }

    const newLikes = increment
      ? (project.likes || 0) + 1
      : Math.max(0, (project.likes || 0) - 1)

    const { error } = await supabase
      .from('video_projects')
      .update({ likes: newLikes })
      .eq('id', projectId)

    if (error) {
      logger.error('Failed to toggle video like', { error, projectId })
      return { error }
    }

    logger.info('Video like toggled successfully', { projectId, increment, newLikes })
    return { error: null }
  } catch (error) {
    logger.error('Exception toggling video like', { error, projectId })
    return { error }
  }
}

/**
 * Search video projects
 */
export async function searchVideoProjects(
  userId: string,
  searchTerm: string,
  limit: number = 20
): Promise<{ data: VideoProject[]; error: any }> {
  logger.info('Searching video projects', { userId, searchTerm, limit })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to search video projects', { error, userId, searchTerm })
      return { data: [], error }
    }

    logger.info('Video projects search completed', {
      resultsCount: data?.length || 0,
      searchTerm,
      userId,
    })

    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception searching video projects', { error, userId, searchTerm })
    return { data: [], error }
  }
}

/**
 * Get recent video projects
 */
export async function getRecentVideoProjects(
  userId: string,
  limit: number = 10
): Promise<{ data: VideoProject[]; error: any }> {
  logger.info('Fetching recent video projects', { userId, limit })

  try {
    const { data, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Failed to fetch recent video projects', { error, userId })
      return { data: [], error }
    }

    logger.info('Recent video projects fetched', { count: data?.length || 0, userId })
    return { data: data || [], error: null }
  } catch (error) {
    logger.error('Exception fetching recent video projects', { error, userId })
    return { data: [], error }
  }
}

/**
 * Duplicate a video project
 */
export async function duplicateVideoProject(
  projectId: string,
  userId: string
): Promise<{ data: VideoProject | null; error: any }> {
  logger.info('Duplicating video project', { projectId, userId })

  try {
    // Get original project
    const { data: original, error: fetchError } = await getVideoProject(projectId)

    if (fetchError || !original) {
      logger.error('Failed to fetch original project', { error: fetchError, projectId })
      return { data: null, error: fetchError }
    }

    // Create duplicate
    const { data, error } = await createVideoProject(userId, {
      title: `${original.title} (Copy)`,
      description: original.description,
      duration: original.duration,
      resolution: original.resolution,
      format: original.format,
      status: 'draft',
      file_path: original.file_path,
      thumbnail_path: original.thumbnail_path,
    })

    if (error) {
      logger.error('Failed to duplicate video project', { error, projectId })
      return { data: null, error }
    }

    logger.info('Video project duplicated successfully', {
      originalId: projectId,
      duplicateId: data?.id,
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception duplicating video project', { error, projectId })
    return { data: null, error }
  }
}
