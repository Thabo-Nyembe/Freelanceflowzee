'use server'

/**
 * Extended Videos Server Actions
 * Tables: videos, video_chapters, video_thumbnails, video_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getVideo(videoId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('videos').select('*, video_chapters(*), video_thumbnails(*)').eq('id', videoId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVideo(videoData: { title: string; user_id: string; url?: string; duration?: number; description?: string; thumbnail_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('videos').insert({ ...videoData, status: 'processing', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVideo(videoId: string, updates: Partial<{ title: string; description: string; status: string; thumbnail_url: string; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('videos').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', videoId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteVideo(videoId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('videos').delete().eq('id', videoId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVideos(options?: { user_id?: string; status?: string; is_public?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('videos').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVideoChapters(videoId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('video_chapters').select('*').eq('video_id', videoId).order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addVideoChapter(videoId: string, chapterData: { title: string; start_time: number; end_time?: number; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('video_chapters').insert({ video_id: videoId, ...chapterData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordVideoView(videoId: string, viewData?: { user_id?: string; watch_duration?: number; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('video_analytics').insert({ video_id: videoId, event_type: 'view', ...viewData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
