'use server'

/**
 * Extended Upload Queue Server Actions - Covers all Upload Queue-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUploadQueue(userId: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('upload_queue').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUploadItem(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_queue').select('*').eq('id', uploadId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUploadItem(input: { user_id: string; filename: string; file_size: number; mime_type: string; destination_path?: string; is_chunked?: boolean; total_chunks?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_queue').insert({ ...input, status: 'pending', progress: 0, chunks_uploaded: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUploadProgress(uploadId: string, progress: number, status?: string) {
  try { const supabase = await createClient(); const updates: any = { progress, updated_at: new Date().toISOString() }; if (status) updates.status = status; if (progress >= 100) { updates.status = 'completed'; updates.completed_at = new Date().toISOString(); } const { data, error } = await supabase.from('upload_queue').update(updates).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failUpload(uploadId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_queue').update({ status: 'failed', error_message: errorMessage, failed_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function retryUpload(uploadId: string) {
  try { const supabase = await createClient(); const { data: upload } = await supabase.from('upload_queue').select('retry_count').eq('id', uploadId).single(); const { data, error } = await supabase.from('upload_queue').update({ status: 'pending', progress: 0, error_message: null, retry_count: (upload?.retry_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelUpload(uploadId: string) {
  try { const supabase = await createClient(); await supabase.from('upload_chunks').delete().eq('upload_id', uploadId); const { data, error } = await supabase.from('upload_queue').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUploadItem(uploadId: string) {
  try { const supabase = await createClient(); await supabase.from('upload_chunks').delete().eq('upload_id', uploadId); const { error } = await supabase.from('upload_queue').delete().eq('id', uploadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUploadChunk(uploadId: string, chunk: { chunk_index: number; chunk_size: number; etag?: string; url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').insert({ upload_id: uploadId, ...chunk, status: 'completed' }).select().single(); if (error) throw error; const { data: upload } = await supabase.from('upload_queue').select('total_chunks, chunks_uploaded').eq('id', uploadId).single(); const chunksUploaded = (upload?.chunks_uploaded || 0) + 1; const progress = upload?.total_chunks ? Math.round((chunksUploaded / upload.total_chunks) * 100) : 0; await supabase.from('upload_queue').update({ chunks_uploaded: chunksUploaded, progress, status: progress >= 100 ? 'completed' : 'uploading' }).eq('id', uploadId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUploadChunks(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').select('*').eq('upload_id', uploadId).order('chunk_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function completeChunkedUpload(uploadId: string, finalUrl: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_queue').update({ status: 'completed', progress: 100, result_url: finalUrl, completed_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; await supabase.from('upload_chunks').delete().eq('upload_id', uploadId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupOldUploads(olderThanDays = 7) {
  try { const supabase = await createClient(); const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - olderThanDays); const { data: oldUploads } = await supabase.from('upload_queue').select('id').in('status', ['completed', 'failed', 'cancelled']).lt('created_at', cutoffDate.toISOString()); if (oldUploads && oldUploads.length > 0) { const ids = oldUploads.map(u => u.id); await supabase.from('upload_chunks').delete().in('upload_id', ids); await supabase.from('upload_queue').delete().in('id', ids); } return { success: true, cleaned: oldUploads?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
