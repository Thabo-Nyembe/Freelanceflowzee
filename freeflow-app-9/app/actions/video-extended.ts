'use server'

/**
 * Extended Video Server Actions - Covers all 29 Video-related tables
 * Auto-generated for comprehensive table coverage
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// VIDEO ANALYTICS
// ============================================

export async function getVideoAnalytics(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_analytics')
      .select('*')
      .eq('video_id', videoId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getVideoAnalyticsCountries(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_analytics_countries')
      .select('*')
      .eq('video_id', videoId)
      .order('view_count', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getVideoAnalyticsDevices(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_analytics_devices')
      .select('*')
      .eq('video_id', videoId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getVideoDailyAnalytics(videoId: string, days = 30) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_daily_analytics')
      .select('*')
      .eq('video_id', videoId)
      .order('date', { ascending: false })
      .limit(days)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// VIDEO ANNOTATIONS
// ============================================

export async function getVideoAnnotations(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_annotations')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoAnnotation(videoId: string, userId: string, input: { timestamp: number; content: string; type?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_annotations')
      .insert({ ...input, video_id: videoId, user_id: userId })
      .select()
      .single()
    if (error) throw error
    revalidatePath(`/dashboard/video-studio/${videoId}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function deleteVideoAnnotation(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('video_annotations').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO ASSETS
// ============================================

export async function getVideoAssets(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoAsset(projectId: string, input: { name: string; type: string; url: string; metadata?: any }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_assets')
      .insert({ ...input, project_id: projectId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO CAPTIONS
// ============================================

export async function getVideoCaptions(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_captions')
      .select('*')
      .eq('video_id', videoId)
      .order('language', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoCaption(videoId: string, input: { language: string; content: string; format?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_captions')
      .insert({ ...input, video_id: videoId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO CLIPS
// ============================================

export async function getVideoClips(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_clips')
      .select('*')
      .eq('video_id', videoId)
      .order('start_time', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoClip(videoId: string, userId: string, input: { start_time: number; end_time: number; title?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_clips')
      .insert({ ...input, video_id: videoId, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO COLLABORATORS
// ============================================

export async function getVideoCollaborators(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_collaborators')
      .select('*')
      .eq('video_id', videoId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function addVideoCollaborator(videoId: string, userId: string, role = 'viewer') {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_collaborators')
      .insert({ video_id: videoId, user_id: userId, role })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function removeVideoCollaborator(videoId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_collaborators')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO COMMENTS
// ============================================

export async function getVideoComments(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoComment(videoId: string, userId: string, content: string, timestamp?: number) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_comments')
      .insert({ video_id: videoId, user_id: userId, content, timestamp })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function deleteVideoComment(id: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO EFFECTS
// ============================================

export async function getVideoEffects() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_effects')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// VIDEO ENCODING JOBS
// ============================================

export async function getVideoEncodingJobs(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_encoding_jobs')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoEncodingJob(videoId: string, input: { format: string; quality: string; resolution?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_encoding_jobs')
      .insert({ ...input, video_id: videoId, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO ENGAGEMENT
// ============================================

export async function getVideoEngagementEvents(videoId: string, limit = 100) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_engagement_events')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function trackVideoEngagement(videoId: string, userId: string | null, eventType: string, metadata?: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_engagement_events')
      .insert({ video_id: videoId, user_id: userId, event_type: eventType, metadata })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getVideoEvents(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_events')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// VIDEO EXPORTS
// ============================================

export async function getVideoExports(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_exports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoExport(userId: string, videoId: string, input: { format: string; quality: string; settings?: any }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_exports')
      .insert({ ...input, user_id: userId, video_id: videoId, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO FOLDERS
// ============================================

export async function getVideoFolders(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_folders')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoFolder(userId: string, name: string, parentId?: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_folders')
      .insert({ user_id: userId, name, parent_id: parentId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function deleteVideoFolder(id: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_folders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO LIKES
// ============================================

export async function getVideoLikes(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, count, error } = await supabase
      .from('video_likes')
      .select('*', { count: 'exact' })
      .eq('video_id', videoId)
    if (error) throw error
    return { success: true, data: data || [], count: count || 0 }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], count: 0 }
  }
}

export async function toggleVideoLike(videoId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase.from('video_likes').delete().eq('id', existing.id)
      return { success: true, liked: false }
    } else {
      await supabase.from('video_likes').insert({ video_id: videoId, user_id: userId })
      return { success: true, liked: true }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO METADATA
// ============================================

export async function getVideoMetadata(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_metadata')
      .select('*')
      .eq('video_id', videoId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function updateVideoMetadata(videoId: string, metadata: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_metadata')
      .upsert({ video_id: videoId, ...metadata }, { onConflict: 'video_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO RENDER JOBS
// ============================================

export async function getVideoRenderJobs(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_render_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoRenderJob(userId: string, projectId: string, settings: any) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_render_jobs')
      .insert({ user_id: userId, project_id: projectId, settings, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO SHARES
// ============================================

export async function getVideoShares(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_shares')
      .select('*')
      .eq('video_id', videoId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoShare(videoId: string, userId: string, input: { share_type: string; expires_at?: string }) {
  try {
    const supabase = await createClient()
    const shareToken = crypto.randomUUID()
    const { data, error } = await supabase
      .from('video_shares')
      .insert({ ...input, video_id: videoId, user_id: userId, share_token: shareToken })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO TEMPLATES
// ============================================

export async function getVideoTemplates(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('video_templates').select('*')
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    else query = query.eq('is_public', true)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoTemplate(userId: string, input: { name: string; description?: string; settings: any; is_public?: boolean }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_templates')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO TIMELINE
// ============================================

export async function getVideoTimelineItems(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_timeline_items')
      .select('*')
      .eq('project_id', projectId)
      .order('track_index', { ascending: true })
      .order('start_time', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function updateVideoTimelineItems(projectId: string, items: any[]) {
  try {
    const supabase = await createClient()
    // Delete existing items
    await supabase.from('video_timeline_items').delete().eq('project_id', projectId)
    // Insert new items
    if (items.length > 0) {
      const { error } = await supabase
        .from('video_timeline_items')
        .insert(items.map(item => ({ ...item, project_id: projectId })))
      if (error) throw error
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO TRACKS
// ============================================

export async function getVideoTracks(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_tracks')
      .select('*')
      .eq('project_id', projectId)
      .order('index', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoTrack(projectId: string, input: { name: string; type: string; index: number }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_tracks')
      .insert({ ...input, project_id: projectId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO TRANSCRIPTS
// ============================================

export async function getVideoTranscripts(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_transcripts')
      .select('*')
      .eq('video_id', videoId)
      .order('language', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoTranscript(videoId: string, input: { language: string; content: string; format?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_transcripts')
      .insert({ ...input, video_id: videoId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO TRANSITIONS
// ============================================

export async function getVideoTransitions() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_transitions')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// VIDEO USAGE LOGS
// ============================================

export async function getVideoUsageLogs(userId: string, limit = 100) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function logVideoUsage(userId: string, videoId: string, action: string, metadata?: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_usage_logs')
      .insert({ user_id: userId, video_id: videoId, action, metadata })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO VERSIONS
// ============================================

export async function getVideoVersions(videoId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_versions')
      .select('*')
      .eq('video_id', videoId)
      .order('version', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createVideoVersion(videoId: string, input: { version: number; url: string; metadata?: any }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_versions')
      .insert({ ...input, video_id: videoId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO VIEWS
// ============================================

export async function getVideoViews(videoId: string) {
  try {
    const supabase = await createClient()
    const { count, error } = await supabase
      .from('video_views')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', videoId)
    if (error) throw error
    return { success: true, count: count || 0 }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 }
  }
}

export async function recordVideoView(videoId: string, userId?: string, metadata?: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_views')
      .insert({ video_id: videoId, user_id: userId, metadata })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// VIDEO WATCH TIME
// ============================================

export async function getVideoWatchTime(videoId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('video_watch_time')
      .select('*')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function updateVideoWatchTime(videoId: string, userId: string, watchedSeconds: number, totalDuration: number) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('video_watch_time')
      .upsert({
        video_id: videoId,
        user_id: userId,
        watched_seconds: watchedSeconds,
        total_duration: totalDuration,
        last_position: watchedSeconds,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'video_id,user_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}
