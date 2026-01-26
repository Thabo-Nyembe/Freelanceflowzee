/**
 * Video Studio Query Library
 *
 * Comprehensive video project management with database integration
 * Features: Projects, Assets, Timeline, Renders, Analytics
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import type { JsonValue } from '@/lib/types/database'

const logger = createFeatureLogger('VideoQueries')

// ============================================================================
// TYPES
// ============================================================================

export interface VideoProject {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  thumbnail_url?: string
  duration: number // seconds
  resolution: string // e.g., "1920x1080"
  fps: number
  last_saved?: string
  created_at: string
  updated_at: string
}

export interface VideoAsset {
  id: string
  project_id: string
  type: 'video' | 'audio' | 'image'
  name: string
  url: string
  duration?: number
  size: number // bytes
  mime_type: string
  metadata?: Record<string, JsonValue>
  created_at: string
}

export interface TimelineClip {
  id: string
  project_id: string
  asset_id: string
  track: number // 1, 2, 3, etc.
  start_time: number // seconds on timeline
  end_time: number
  trim_start?: number // trim from original
  trim_end?: number
  effects?: JsonValue[]
  transitions?: JsonValue[]
  position: number
  created_at: string
}

export interface RenderJob {
  id: string
  project_id: string
  user_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  format: string
  quality: string
  resolution: string
  output_url?: string
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
}

// ============================================================================
// PROJECT CRUD
// ============================================================================

export async function getVideoProjects(userId: string): Promise<VideoProject[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    logger.error('Failed to fetch video projects', { error, userId })
    throw error
  }

  return data || []
}

export async function getVideoProject(projectId: string): Promise<VideoProject | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    logger.error('Failed to fetch video project', { error, projectId })
    throw error
  }

  return data
}

export async function createVideoProject(
  userId: string,
  project: {
    title: string
    description?: string
    resolution?: string
    fps?: number
  }
): Promise<VideoProject> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_projects')
    .insert({
      user_id: userId,
      title: project.title,
      description: project.description,
      status: 'draft',
      resolution: project.resolution || '1920x1080',
      fps: project.fps || 30,
      duration: 0
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create video project', { error, userId, project })
    throw error
  }

  logger.info('Video project created', { projectId: data.id, title: data.title })
  return data
}

export async function updateVideoProject(
  projectId: string,
  updates: Partial<VideoProject>
): Promise<VideoProject> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update video project', { error, projectId, updates })
    throw error
  }

  logger.info('Video project updated', { projectId: data.id })
  return data
}

export async function deleteVideoProject(projectId: string): Promise<void> {
  const supabase = createClient()

  // Delete related assets first
  await supabase.from('video_assets').delete().eq('project_id', projectId)
  await supabase.from('timeline_clips').delete().eq('project_id', projectId)
  await supabase.from('render_jobs').delete().eq('project_id', projectId)

  const { error } = await supabase
    .from('video_projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    logger.error('Failed to delete video project', { error, projectId })
    throw error
  }

  logger.info('Video project deleted', { projectId })
}

export async function duplicateVideoProject(
  projectId: string,
  userId: string
): Promise<VideoProject> {
  const supabase = createClient()

  // Get original project
  const original = await getVideoProject(projectId)
  if (!original) throw new Error('Project not found')

  // Create duplicate
  const { data, error } = await supabase
    .from('video_projects')
    .insert({
      user_id: userId,
      title: `${original.title} (Copy)`,
      description: original.description,
      status: 'draft',
      resolution: original.resolution,
      fps: original.fps,
      duration: original.duration
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to duplicate video project', { error, projectId })
    throw error
  }

  // Copy assets and timeline (in production)
  logger.info('Video project duplicated', { originalId: projectId, newId: data.id })
  return data
}

// ============================================================================
// ASSETS
// ============================================================================

export async function getProjectAssets(projectId: string): Promise<VideoAsset[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Failed to fetch project assets', { error, projectId })
    throw error
  }

  return data || []
}

export async function addProjectAsset(
  projectId: string,
  asset: {
    type: 'video' | 'audio' | 'image'
    name: string
    url: string
    duration?: number
    size: number
    mime_type: string
    metadata?: Record<string, JsonValue>
  }
): Promise<VideoAsset> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_assets')
    .insert({
      project_id: projectId,
      ...asset
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to add project asset', { error, projectId, asset })
    throw error
  }

  logger.info('Project asset added', { assetId: data.id, type: data.type })
  return data
}

export async function deleteProjectAsset(assetId: string): Promise<void> {
  const supabase = createClient()

  // Remove from timeline first
  await supabase.from('timeline_clips').delete().eq('asset_id', assetId)

  const { error } = await supabase
    .from('video_assets')
    .delete()
    .eq('id', assetId)

  if (error) {
    logger.error('Failed to delete project asset', { error, assetId })
    throw error
  }

  logger.info('Project asset deleted', { assetId })
}

// ============================================================================
// TIMELINE
// ============================================================================

export async function getTimelineClips(projectId: string): Promise<TimelineClip[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('timeline_clips')
    .select('*, video_assets(*)')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) {
    logger.error('Failed to fetch timeline clips', { error, projectId })
    throw error
  }

  return data || []
}

export async function addTimelineClip(
  projectId: string,
  clip: {
    asset_id: string
    track: number
    start_time: number
    end_time: number
    position: number
    trim_start?: number
    trim_end?: number
  }
): Promise<TimelineClip> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('timeline_clips')
    .insert({
      project_id: projectId,
      ...clip
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to add timeline clip', { error, projectId, clip })
    throw error
  }

  logger.info('Timeline clip added', { clipId: data.id })
  return data
}

export async function updateTimelineClip(
  clipId: string,
  updates: Partial<TimelineClip>
): Promise<TimelineClip> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('timeline_clips')
    .update(updates)
    .eq('id', clipId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update timeline clip', { error, clipId, updates })
    throw error
  }

  return data
}

export async function deleteTimelineClip(clipId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('timeline_clips')
    .delete()
    .eq('id', clipId)

  if (error) {
    logger.error('Failed to delete timeline clip', { error, clipId })
    throw error
  }

  logger.info('Timeline clip deleted', { clipId })
}

// ============================================================================
// RENDERING
// ============================================================================

export async function createRenderJob(
  projectId: string,
  userId: string,
  options: {
    format: string
    quality: string
    resolution: string
  }
): Promise<RenderJob> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('render_jobs')
    .insert({
      project_id: projectId,
      user_id: userId,
      status: 'queued',
      progress: 0,
      format: options.format,
      quality: options.quality,
      resolution: options.resolution
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create render job', { error, projectId, options })
    throw error
  }

  logger.info('Render job created', { jobId: data.id, projectId })
  return data
}

export async function getRenderJob(jobId: string): Promise<RenderJob | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('render_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    logger.error('Failed to fetch render job', { error, jobId })
    throw error
  }

  return data
}

export async function updateRenderJob(
  jobId: string,
  updates: Partial<RenderJob>
): Promise<RenderJob> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('render_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update render job', { error, jobId, updates })
    throw error
  }

  return data
}

export async function getProjectRenderJobs(projectId: string): Promise<RenderJob[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('render_jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Failed to fetch project render jobs', { error, projectId })
    throw error
  }

  return data || []
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface VideoAnalyticsData {
  views: number
  watch_time: number
  completion_rate: number
  shares: number
  likes: number
}

export async function getVideoAnalytics(projectId: string): Promise<VideoAnalyticsData> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_analytics')
    .select('*')
    .eq('project_id', projectId)
    .single()

  if (error && error.code !== 'PGRST116') { // Not found is OK
    logger.error('Failed to fetch video analytics', { error, projectId })
    throw error
  }

  return data || {
    views: 0,
    watch_time: 0,
    completion_rate: 0,
    shares: 0,
    likes: 0
  }
}

// ============================================================================
// SHARING & PUBLISHING
// ============================================================================

export async function generateShareLink(
  projectId: string,
  expiresIn: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): Promise<string> {
  const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const expiresAt = new Date(Date.now() + expiresIn).toISOString()

  const supabase = createClient()

  const { data, error } = await supabase
    .from('video_shares')
    .insert({
      project_id: projectId,
      share_id: shareId,
      expires_at: expiresAt,
      is_active: true
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to generate share link', { error, projectId })
    throw error
  }

  logger.info('Share link generated', { shareId, projectId, expiresAt })
  return shareId
}

export async function publishVideo(
  projectId: string,
  platform: 'youtube' | 'vimeo' | 'custom',
  metadata: {
    title: string
    description?: string
    tags?: string[]
    visibility?: 'public' | 'private' | 'unlisted'
  }
): Promise<{ success: boolean; url?: string }> {
  logger.info('Publishing video', { projectId, platform, metadata })

  // In production: integrate with platform APIs
  // - YouTube Data API v3
  // - Vimeo API
  // - Custom storage (S3 + CloudFront)

  // Mock success
  return {
    success: true,
    url: `https://${platform}.com/watch/${projectId}`
  }
}
