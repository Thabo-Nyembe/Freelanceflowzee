/**
 * AI Video Generation Query Library
 *
 * CRUD operations for AI Video Generation System:
 * - Generated Videos (11 functions)
 * - Video Templates (6 functions)
 * - Video Metadata (3 functions)
 * - Generation Settings (4 functions)
 * - Video Analytics (4 functions)
 * - Generation History (3 functions)
 * - Statistics (2 functions)
 *
 * Total: 33 functions
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type VideoStyle = 'cinematic' | 'professional' | 'casual' | 'animated' | 'explainer' | 'social-media'
export type VideoFormat = 'landscape' | 'portrait' | 'square' | 'widescreen'
export type VideoQuality = 'sd' | 'hd' | 'full-hd' | '4k'
export type AIVideoModel = 'kazi-ai' | 'runway-gen3' | 'pika-labs' | 'stable-video'
export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'rendering' | 'completed' | 'failed'
export type VideoCategory = 'marketing' | 'tutorial' | 'entertainment' | 'business' | 'education' | 'social'

export interface GeneratedVideo {
  id: string
  user_id: string
  title: string
  prompt: string
  style: VideoStyle
  format: VideoFormat
  quality: VideoQuality
  ai_model: AIVideoModel
  status: GenerationStatus
  progress: number
  video_url: string | null
  thumbnail_url: string | null
  duration: number
  file_size: number
  views: number
  downloads: number
  likes: number
  shares: number
  is_public: boolean
  tags: string[]
  category: VideoCategory
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface VideoTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  style: VideoStyle
  format: VideoFormat
  duration: number
  scenes: number
  premium: boolean
  category: VideoCategory
  tags: string[]
  price: number
  usage_count: number
  created_at: string
  updated_at: string
}

export interface VideoMetadata {
  id: string
  video_id: string
  width: number
  height: number
  fps: number
  codec: string
  bitrate: string
  aspect_ratio: string
  color_space: string | null
  audio_codec: string | null
  audio_bitrate: string | null
  created_at: string
  updated_at: string
}

export interface GenerationSettings {
  id: string
  user_id: string
  default_model: AIVideoModel
  default_quality: VideoQuality
  default_format: VideoFormat
  auto_save: boolean
  high_quality_previews: boolean
  watermark_enabled: boolean
  max_concurrent_generations: number
  created_at: string
  updated_at: string
}

export interface VideoAnalytics {
  id: string
  video_id: string
  date: string
  views: number
  unique_views: number
  downloads: number
  shares: number
  likes: number
  avg_watch_time: number
  completion_rate: number
  engagement_score: number
  created_at: string
  updated_at: string
}

export interface GenerationHistory {
  id: string
  video_id: string
  status: GenerationStatus
  progress: number
  message: string | null
  error_details: JsonValue
  created_at: string
}

// Summary interfaces for statistics functions
export interface VideoAnalyticsSummary {
  total_views: number
  total_unique_views: number
  total_downloads: number
  total_shares: number
  total_likes: number
  avg_watch_time: number
  avg_completion_rate: number
  avg_engagement_score: number
}

export interface UserVideoStats {
  total_videos: number
  completed_videos: number
  in_progress: number
  failed_videos: number
  total_views: number
  total_likes: number
  total_downloads: number
  total_shares: number
  by_category: Record<string, number>
  by_style: Record<string, number>
  by_quality: Record<string, number>
}

// ============================================================================
// GENERATED VIDEOS (11 functions)
// ============================================================================

export async function getGeneratedVideos(
  userId: string,
  filters?: {
    status?: GenerationStatus
    style?: VideoStyle
    category?: VideoCategory
    is_public?: boolean
    search?: string
  }
): Promise<{ data: GeneratedVideo[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('generated_videos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.style) {
    query = query.eq('style', filters.style)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,prompt.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getGeneratedVideo(
  videoId: string
): Promise<{ data: GeneratedVideo | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('id', videoId)
    .single()

  return { data, error }
}

export async function createGeneratedVideo(
  userId: string,
  video: {
    title: string
    prompt: string
    style?: VideoStyle
    format?: VideoFormat
    quality?: VideoQuality
    ai_model?: AIVideoModel
    category?: VideoCategory
    tags?: string[]
  }
): Promise<{ data: GeneratedVideo | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generated_videos')
    .insert({
      user_id: userId,
      ...video
    })
    .select()
    .single()

  return { data, error }
}

export async function updateGeneratedVideo(
  videoId: string,
  updates: Partial<Omit<GeneratedVideo, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: GeneratedVideo | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generated_videos')
    .update(updates)
    .eq('id', videoId)
    .select()
    .single()

  return { data, error }
}

export async function deleteGeneratedVideo(
  videoId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('generated_videos')
    .delete()
    .eq('id', videoId)

  return { error }
}

export async function updateVideoProgress(
  videoId: string,
  status: GenerationStatus,
  progress: number
): Promise<{ data: GeneratedVideo | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generated_videos')
    .update({
      status,
      progress
    })
    .eq('id', videoId)
    .select()
    .single()

  return { data, error }
}

export async function incrementVideoViews(
  videoId: string
): Promise<{ data: GeneratedVideo | null; error: DatabaseError | null }> {
  const supabase = createClient()

  const { data: currentVideo } = await supabase
    .from('generated_videos')
    .select('views')
    .eq('id', videoId)
    .single()

  if (!currentVideo) {
    return { data: null, error: toDbError(new Error('Video not found')) }
  }

  const { data, error } = await supabase
    .from('generated_videos')
    .update({
      views: currentVideo.views + 1
    })
    .eq('id', videoId)
    .select()
    .single()

  return { data, error }
}

export async function incrementVideoLikes(
  videoId: string
): Promise<{ data: GeneratedVideo | null; error: DatabaseError | null }> {
  const supabase = createClient()

  const { data: currentVideo } = await supabase
    .from('generated_videos')
    .select('likes')
    .eq('id', videoId)
    .single()

  if (!currentVideo) {
    return { data: null, error: toDbError(new Error('Video not found')) }
  }

  const { data, error } = await supabase
    .from('generated_videos')
    .update({
      likes: currentVideo.likes + 1
    })
    .eq('id', videoId)
    .select()
    .single()

  return { data, error }
}

export async function searchVideosByTags(
  userId: string,
  tags: string[]
): Promise<{ data: GeneratedVideo[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', tags)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function getPublicVideos(
  limit: number = 20,
  category?: VideoCategory
): Promise<{ data: GeneratedVideo[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('generated_videos')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .order('views', { ascending: false })
    .limit(limit)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  return { data, error }
}

export async function bulkDeleteVideos(
  videoIds: string[]
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('generated_videos')
    .delete()
    .in('id', videoIds)

  return { error }
}

// ============================================================================
// VIDEO TEMPLATES (6 functions)
// ============================================================================

export async function getVideoTemplates(
  filters?: {
    category?: VideoCategory
    style?: VideoStyle
    premium?: boolean
  }
): Promise<{ data: VideoTemplate[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('video_templates')
    .select('*')
    .order('usage_count', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.style) {
    query = query.eq('style', filters.style)
  }
  if (filters?.premium !== undefined) {
    query = query.eq('premium', filters.premium)
  }

  const { data, error} = await query
  return { data, error }
}

export async function getVideoTemplate(
  templateId: string
): Promise<{ data: VideoTemplate | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  return { data, error }
}

export async function createVideoTemplate(
  template: {
    name: string
    description: string
    thumbnail: string
    style?: VideoStyle
    format?: VideoFormat
    duration?: number
    scenes?: number
    premium?: boolean
    category?: VideoCategory
    tags?: string[]
    price?: number
  }
): Promise<{ data: VideoTemplate | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_templates')
    .insert(template)
    .select()
    .single()

  return { data, error }
}

export async function updateVideoTemplate(
  templateId: string,
  updates: Partial<Omit<VideoTemplate, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: VideoTemplate | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()

  return { data, error }
}

export async function incrementTemplateUsage(
  templateId: string
): Promise<{ data: VideoTemplate | null; error: DatabaseError | null }> {
  const supabase = createClient()

  const { data: currentTemplate } = await supabase
    .from('video_templates')
    .select('usage_count')
    .eq('id', templateId)
    .single()

  if (!currentTemplate) {
    return { data: null, error: toDbError(new Error('Template not found')) }
  }

  const { data, error } = await supabase
    .from('video_templates')
    .update({
      usage_count: currentTemplate.usage_count + 1
    })
    .eq('id', templateId)
    .select()
    .single()

  return { data, error }
}

export async function searchTemplatesByTags(
  tags: string[]
): Promise<{ data: VideoTemplate[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_templates')
    .select('*')
    .contains('tags', tags)
    .order('usage_count', { ascending: false })

  return { data, error }
}

// ============================================================================
// VIDEO METADATA (3 functions)
// ============================================================================

export async function getVideoMetadata(
  videoId: string
): Promise<{ data: VideoMetadata | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_metadata')
    .select('*')
    .eq('video_id', videoId)
    .single()

  return { data, error }
}

export async function createVideoMetadata(
  metadata: {
    video_id: string
    width: number
    height: number
    fps?: number
    codec?: string
    bitrate?: string
    aspect_ratio?: string
    color_space?: string
    audio_codec?: string
    audio_bitrate?: string
  }
): Promise<{ data: VideoMetadata | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_metadata')
    .insert(metadata)
    .select()
    .single()

  return { data, error }
}

export async function updateVideoMetadata(
  videoId: string,
  updates: Partial<Omit<VideoMetadata, 'id' | 'video_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: VideoMetadata | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_metadata')
    .update(updates)
    .eq('video_id', videoId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// GENERATION SETTINGS (4 functions)
// ============================================================================

export async function getGenerationSettings(
  userId: string
): Promise<{ data: GenerationSettings | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generation_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function createGenerationSettings(
  userId: string,
  settings?: {
    default_model?: AIVideoModel
    default_quality?: VideoQuality
    default_format?: VideoFormat
    auto_save?: boolean
    high_quality_previews?: boolean
    watermark_enabled?: boolean
    max_concurrent_generations?: number
  }
): Promise<{ data: GenerationSettings | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generation_settings')
    .insert({
      user_id: userId,
      ...settings
    })
    .select()
    .single()

  return { data, error }
}

export async function updateGenerationSettings(
  userId: string,
  updates: Partial<Omit<GenerationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: GenerationSettings | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generation_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  return { data, error }
}

export async function getOrCreateGenerationSettings(
  userId: string
): Promise<{ data: GenerationSettings | null; error: DatabaseError | null }> {
  const { data, error } = await getGenerationSettings(userId)

  if (error && error.code === 'PGRST116') {
    // Not found, create default settings
    return await createGenerationSettings(userId)
  }

  return { data, error }
}

// ============================================================================
// VIDEO ANALYTICS (4 functions)
// ============================================================================

export async function getVideoAnalytics(
  videoId: string,
  days: number = 30
): Promise<{ data: VideoAnalytics[] | null; error: DatabaseError | null }> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('video_analytics')
    .select('*')
    .eq('video_id', videoId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false })

  return { data, error }
}

export async function createVideoAnalytics(
  analytics: {
    video_id: string
    date?: string
    views?: number
    unique_views?: number
    downloads?: number
    shares?: number
    likes?: number
    avg_watch_time?: number
    completion_rate?: number
    engagement_score?: number
  }
): Promise<{ data: VideoAnalytics | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_analytics')
    .insert(analytics)
    .select()
    .single()

  return { data, error }
}

export async function updateVideoAnalytics(
  videoId: string,
  date: string,
  updates: Partial<Omit<VideoAnalytics, 'id' | 'video_id' | 'date' | 'created_at' | 'updated_at'>>
): Promise<{ data: VideoAnalytics | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_analytics')
    .update(updates)
    .eq('video_id', videoId)
    .eq('date', date)
    .select()
    .single()

  return { data, error }
}

export async function getVideoAnalyticsSummary(
  videoId: string
): Promise<{ data: VideoAnalyticsSummary | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('video_analytics')
    .select('*')
    .eq('video_id', videoId)

  if (error) {
    return { data: null, error }
  }

  const summary = {
    total_views: data.reduce((sum, a) => sum + a.views, 0),
    total_unique_views: data.reduce((sum, a) => sum + a.unique_views, 0),
    total_downloads: data.reduce((sum, a) => sum + a.downloads, 0),
    total_shares: data.reduce((sum, a) => sum + a.shares, 0),
    total_likes: data.reduce((sum, a) => sum + a.likes, 0),
    avg_watch_time: data.length > 0 ? data.reduce((sum, a) => sum + a.avg_watch_time, 0) / data.length : 0,
    avg_completion_rate: data.length > 0 ? data.reduce((sum, a) => sum + a.completion_rate, 0) / data.length : 0,
    avg_engagement_score: data.length > 0 ? data.reduce((sum, a) => sum + a.engagement_score, 0) / data.length : 0
  }

  return { data: summary, error: null }
}

// ============================================================================
// GENERATION HISTORY (3 functions)
// ============================================================================

export async function getGenerationHistory(
  videoId: string
): Promise<{ data: GenerationHistory[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function createGenerationHistory(
  history: {
    video_id: string
    status: GenerationStatus
    progress?: number
    message?: string
    error_details?: JsonValue
  }
): Promise<{ data: GenerationHistory | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generation_history')
    .insert(history)
    .select()
    .single()

  return { data, error }
}

export async function getLatestGenerationStatus(
  videoId: string
): Promise<{ data: GenerationHistory | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

// ============================================================================
// STATISTICS (2 functions)
// ============================================================================

export async function getUserVideoStats(
  userId: string
): Promise<{ data: UserVideoStats | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    return { data: null, error }
  }

  const stats = {
    total_videos: data.length,
    completed_videos: data.filter(v => v.status === 'completed').length,
    in_progress: data.filter(v => ['analyzing', 'generating', 'rendering'].includes(v.status)).length,
    failed_videos: data.filter(v => v.status === 'failed').length,
    total_views: data.reduce((sum, v) => sum + v.views, 0),
    total_likes: data.reduce((sum, v) => sum + v.likes, 0),
    total_downloads: data.reduce((sum, v) => sum + v.downloads, 0),
    total_shares: data.reduce((sum, v) => sum + v.shares, 0),
    by_category: data.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_style: data.reduce((acc, v) => {
      acc[v.style] = (acc[v.style] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_quality: data.reduce((acc, v) => {
      acc[v.quality] = (acc[v.quality] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { data: stats, error: null }
}

export async function getTrendingVideos(
  limit: number = 10,
  days: number = 7
): Promise<{ data: GeneratedVideo[] | null; error: DatabaseError | null }> {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('generated_videos')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .order('views', { ascending: false })
    .limit(limit)

  return { data, error }
}
