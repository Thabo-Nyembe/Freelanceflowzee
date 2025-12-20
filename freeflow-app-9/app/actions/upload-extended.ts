'use server'

/**
 * Extended Upload Server Actions - Covers all Upload-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUploads(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('uploads').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUpload(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').select('*').eq('id', uploadId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function initiateUpload(userId: string, input: { filename: string; file_size: number; mime_type: string; total_chunks?: number; metadata?: any }) {
  try { const supabase = await createClient(); const uploadId = crypto.randomUUID(); const { data, error } = await supabase.from('uploads').insert({ id: uploadId, user_id: userId, ...input, status: 'pending', uploaded_bytes: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUploadProgress(uploadId: string, uploadedBytes: number) {
  try { const supabase = await createClient(); const { data: upload, error: uploadError } = await supabase.from('uploads').select('file_size').eq('id', uploadId).single(); if (uploadError) throw uploadError; const progress = Math.min(100, (uploadedBytes / upload.file_size) * 100); const status = progress >= 100 ? 'completed' : 'uploading'; const updates: any = { uploaded_bytes: uploadedBytes, progress, status }; if (status === 'completed') updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('uploads').update(updates).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeUpload(uploadId: string, fileUrl: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ status: 'completed', file_url: fileUrl, progress: 100, completed_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failUpload(uploadId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ status: 'failed', error_message: errorMessage }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelUpload(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ status: 'cancelled' }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUpload(uploadId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('uploads').delete().eq('id', uploadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUploadChunks(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').select('*').eq('upload_id', uploadId).order('chunk_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveUploadChunk(uploadId: string, input: { chunk_index: number; chunk_size: number; checksum?: string; storage_path?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').insert({ upload_id: uploadId, ...input, status: 'uploaded', uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyUploadChunk(chunkId: string, isValid: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('upload_chunks').update({ status: isValid ? 'verified' : 'invalid', verified_at: new Date().toISOString() }).eq('id', chunkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUploadChunks(uploadId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('upload_chunks').delete().eq('upload_id', uploadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUploadProgress(uploadId: string) {
  try { const supabase = await createClient(); const { data: upload, error: uploadError } = await supabase.from('uploads').select('file_size, uploaded_bytes, total_chunks, status').eq('id', uploadId).single(); if (uploadError) throw uploadError; const { data: chunks, error: chunksError } = await supabase.from('upload_chunks').select('id').eq('upload_id', uploadId); if (chunksError) throw chunksError; return { success: true, data: { file_size: upload.file_size, uploaded_bytes: upload.uploaded_bytes, progress: (upload.uploaded_bytes / upload.file_size) * 100, total_chunks: upload.total_chunks, uploaded_chunks: chunks?.length || 0, status: upload.status } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resumeUpload(uploadId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('uploads').update({ status: 'uploading' }).eq('id', uploadId).eq('status', 'paused').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
