'use server'

/**
 * Extended Uploads Server Actions
 * Tables: uploads, upload_chunks, upload_metadata, upload_processing, upload_quotas, upload_shares
 */

import { createClient } from '@/lib/supabase/server'

export async function getUpload(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').select('*, upload_metadata(*), upload_processing(*), users(*)').eq('id', uploadId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUpload(uploadData: { filename: string; original_filename: string; mime_type: string; size: number; path?: string; bucket?: string; is_public?: boolean; uploaded_by: string; folder_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').insert({ ...uploadData, status: 'pending', is_public: uploadData.is_public ?? false, download_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUpload(uploadId: string, updates: Partial<{ filename: string; path: string; bucket: string; status: string; is_public: boolean; folder_id: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUpload(uploadId: string) {
  try { const supabase = await createClient(); const { data: upload } = await supabase.from('uploads').select('path, bucket').eq('id', uploadId).single(); if (upload?.path && upload?.bucket) { await supabase.storage.from(upload.bucket).remove([upload.path]) } await supabase.from('upload_chunks').delete().eq('upload_id', uploadId); await supabase.from('upload_metadata').delete().eq('upload_id', uploadId); await supabase.from('upload_processing').delete().eq('upload_id', uploadId); await supabase.from('upload_shares').delete().eq('upload_id', uploadId); const { error } = await supabase.from('uploads').delete().eq('id', uploadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUploads(options?: { uploaded_by?: string; mime_type?: string; status?: string; folder_id?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('uploads').select('*, users(*)'); if (options?.uploaded_by) query = query.eq('uploaded_by', options.uploaded_by); if (options?.mime_type) query = query.ilike('mime_type', `${options.mime_type}%`); if (options?.status) query = query.eq('status', options.status); if (options?.folder_id) query = query.eq('folder_id', options.folder_id); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('filename', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function completeUpload(uploadId: string, finalPath: string, finalSize?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ path: finalPath, size: finalSize, status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failUpload(uploadId: string, errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ status: 'failed', error_message: errorMessage, updated_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addChunk(uploadId: string, chunkData: { chunk_index: number; size: number; checksum?: string; path?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').insert({ upload_id: uploadId, ...chunkData, status: 'uploaded', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChunks(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').select('*').eq('upload_id', uploadId).order('chunk_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setMetadata(uploadId: string, metadataKey: string, metadataValue: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('upload_metadata').select('id').eq('upload_id', uploadId).eq('key', metadataKey).single(); if (existing) { const { data, error } = await supabase.from('upload_metadata').update({ value: metadataValue, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('upload_metadata').insert({ upload_id: uploadId, key: metadataKey, value: metadataValue, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetadata(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_metadata').select('*').eq('upload_id', uploadId); if (error) throw error; const metadata: Record<string, any> = {}; data?.forEach(m => { metadata[m.key] = m.value }); return { success: true, data: metadata } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startProcessing(uploadId: string, processingType: string, config?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_processing').insert({ upload_id: uploadId, processing_type: processingType, config, status: 'processing', started_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeProcessing(processingId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_processing').update({ status: 'completed', result, completed_at: new Date().toISOString() }).eq('id', processingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failProcessing(processingId: string, errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_processing').update({ status: 'failed', error_message: errorMessage, completed_at: new Date().toISOString() }).eq('id', processingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProcessingStatus(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_processing').select('*').eq('upload_id', uploadId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getQuota(userId: string) {
  try { const supabase = await createClient(); const { data: quota } = await supabase.from('upload_quotas').select('*').eq('user_id', userId).single(); const { data: uploads } = await supabase.from('uploads').select('size').eq('uploaded_by', userId).eq('status', 'completed'); const usedBytes = uploads?.reduce((sum, u) => sum + (u.size || 0), 0) || 0; return { success: true, data: { quota: quota?.max_bytes || 1073741824, used: usedBytes, remaining: (quota?.max_bytes || 1073741824) - usedBytes, file_limit: quota?.max_files || 1000 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setQuota(userId: string, maxBytes: number, maxFiles?: number) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('upload_quotas').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('upload_quotas').update({ max_bytes: maxBytes, max_files: maxFiles, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('upload_quotas').insert({ user_id: userId, max_bytes: maxBytes, max_files: maxFiles, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function shareUpload(uploadId: string, shareData: { shared_with?: string; share_type: string; permissions?: string[]; expires_at?: string; password?: string }) {
  try { const supabase = await createClient(); const shareToken = crypto.randomUUID(); const { data, error } = await supabase.from('upload_shares').insert({ upload_id: uploadId, ...shareData, share_token: shareToken, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getShares(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_shares').select('*, users(*)').eq('upload_id', uploadId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function revokeShare(shareId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upload_shares').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', shareId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordDownload(uploadId: string) {
  try { const supabase = await createClient(); await supabase.from('uploads').update({ download_count: supabase.rpc('increment_count', { row_id: uploadId, count_column: 'download_count' }), last_downloaded_at: new Date().toISOString() }).eq('id', uploadId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
