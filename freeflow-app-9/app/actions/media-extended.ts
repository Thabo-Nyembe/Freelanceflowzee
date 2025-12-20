'use server'

/**
 * Extended Media Server Actions - Covers all Media-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMedia(userId?: string, mediaType?: string, folderId?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('media').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (mediaType) query = query.eq('media_type', mediaType); if (folderId) query = query.eq('folder_id', folderId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMediaItem(mediaId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('media').select('*').eq('id', mediaId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMedia(input: { user_id: string; filename: string; original_filename: string; url: string; thumbnail_url?: string; media_type: string; mime_type: string; size_bytes: number; folder_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('media').insert({ ...input, status: 'active', view_count: 0, download_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMedia(mediaId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('media').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', mediaId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMedia(mediaId: string) {
  try { const supabase = await createClient(); await supabase.from('media_metadata').delete().eq('media_id', mediaId); const { error } = await supabase.from('media').delete().eq('id', mediaId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveMedia(mediaId: string, folderId: string | null) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('media').update({ folder_id: folderId, updated_at: new Date().toISOString() }).eq('id', mediaId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementMediaViewCount(mediaId: string) {
  try { const supabase = await createClient(); const { data: media, error: mediaError } = await supabase.from('media').select('view_count').eq('id', mediaId).single(); if (mediaError) throw mediaError; const { data, error } = await supabase.from('media').update({ view_count: (media.view_count || 0) + 1, last_viewed_at: new Date().toISOString() }).eq('id', mediaId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementMediaDownloadCount(mediaId: string) {
  try { const supabase = await createClient(); const { data: media, error: mediaError } = await supabase.from('media').select('download_count').eq('id', mediaId).single(); if (mediaError) throw mediaError; const { data, error } = await supabase.from('media').update({ download_count: (media.download_count || 0) + 1, last_downloaded_at: new Date().toISOString() }).eq('id', mediaId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchMedia(query: string, userId?: string, mediaType?: string, limit = 50) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('media').select('*').or(`filename.ilike.%${query}%,original_filename.ilike.%${query}%`).limit(limit); if (userId) dbQuery = dbQuery.eq('user_id', userId); if (mediaType) dbQuery = dbQuery.eq('media_type', mediaType); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMediaMetadata(mediaId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('media_metadata').select('*').eq('media_id', mediaId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setMediaMetadata(mediaId: string, metadata: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('media_metadata').select('id').eq('media_id', mediaId).single(); if (existing) { const { data, error } = await supabase.from('media_metadata').update({ ...metadata, updated_at: new Date().toISOString() }).eq('media_id', mediaId).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('media_metadata').insert({ media_id: mediaId, ...metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMediaWithMetadata(mediaId: string) {
  try { const supabase = await createClient(); const { data: media, error: mediaError } = await supabase.from('media').select('*').eq('id', mediaId).single(); if (mediaError) throw mediaError; const { data: metadata } = await supabase.from('media_metadata').select('*').eq('media_id', mediaId).single(); return { success: true, data: { ...media, metadata } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMediaStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('media').select('media_type, size_bytes').eq('user_id', userId); if (error) throw error; const stats = { total_count: data?.length || 0, total_size: data?.reduce((sum, m) => sum + (m.size_bytes || 0), 0) || 0, by_type: {} as Record<string, { count: number; size: number }> }; data?.forEach(m => { if (!stats.by_type[m.media_type]) { stats.by_type[m.media_type] = { count: 0, size: 0 }; } stats.by_type[m.media_type].count++; stats.by_type[m.media_type].size += m.size_bytes || 0; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateMedia(mediaId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('media').select('*').eq('id', mediaId).single(); if (origError) throw origError; const { id, created_at, updated_at, view_count, download_count, ...mediaData } = original; const { data, error } = await supabase.from('media').insert({ ...mediaData, user_id: userId, filename: `Copy of ${original.filename}`, view_count: 0, download_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
