'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('video-projects-actions')

export interface VideoProjectInput {
  title: string
  description?: string
  thumbnail_url?: string
  video_url?: string
  duration_seconds?: number
  file_size_bytes?: number
  status?: 'draft' | 'processing' | 'ready' | 'failed' | 'archived'
  tags?: string[]
  category?: string
  ai_analysis?: Record<string, any>
  has_captions?: boolean
  has_thumbnail?: boolean
  metadata?: Record<string, any>
}

export async function getVideoProjects(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get video projects', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Video projects retrieved', { userId: user.id, count: data?.length })
    return actionSuccess(data, 'Video projects retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error in getVideoProjects', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getVideoProject(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('video_projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to get video project', { error, userId: user.id, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Video project retrieved', { userId: user.id, projectId: id })
    return actionSuccess(data, 'Video project retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error in getVideoProject', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createVideoProject(input: VideoProjectInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('video_projects')
      .insert({
        ...input,
        user_id: user.id,
        tags: input.tags || [],
        ai_analysis: input.ai_analysis || {},
        metadata: input.metadata || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create video project', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/video-studio-v2')
    logger.info('Video project created', { userId: user.id, projectId: data.id })
    return actionSuccess(data, 'Video project created successfully')
  } catch (error) {
    logger.error('Unexpected error in createVideoProject', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateVideoProject(id: string, input: Partial<VideoProjectInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('video_projects')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update video project', { error, userId: user.id, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/video-studio-v2')
    logger.info('Video project updated', { userId: user.id, projectId: id })
    return actionSuccess(data, 'Video project updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateVideoProject', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteVideoProject(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('video_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete video project', { error, userId: user.id, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/video-studio-v2')
    logger.info('Video project deleted', { userId: user.id, projectId: id })
    return actionSuccess({ id }, 'Video project deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteVideoProject', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function processVideoProject(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Set status to processing
    const { error: updateError } = await supabase
      .from('video_projects')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Failed to set video project to processing', { error: updateError, userId: user.id, projectId: id })
      return actionError(updateError.message, 'DATABASE_ERROR')
    }

    // Simulate processing completion (in production this would be async)
    const { data, error } = await supabase
      .from('video_projects')
      .update({
        status: 'ready',
        rendered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete video project processing', { error, userId: user.id, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/video-studio-v2')
    logger.info('Video project processed', { userId: user.id, projectId: id })
    return actionSuccess(data, 'Video project processed successfully')
  } catch (error) {
    logger.error('Unexpected error in processVideoProject', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getVideoProjectStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: projects, error } = await supabase
      .from('video_projects')
      .select('status, views_count, likes_count, duration_seconds')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to get video project stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const totalDuration = projects?.reduce((sum, p) => sum + (p.duration_seconds || 0), 0) || 0
    const stats = {
      total: projects?.length || 0,
      draft: projects?.filter(p => p.status === 'draft').length || 0,
      processing: projects?.filter(p => p.status === 'processing').length || 0,
      ready: projects?.filter(p => p.status === 'ready').length || 0,
      totalViews: projects?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0,
      totalLikes: projects?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0,
      avgDuration: projects && projects.length > 0 ? Math.round(totalDuration / projects.length) : 0
    }

    logger.info('Video project stats retrieved', { userId: user.id })
    return actionSuccess(stats, 'Video project stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error in getVideoProjectStats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
