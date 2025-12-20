'use server'

/**
 * Extended Attachment Server Actions - Covers all Attachment-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAttachments(parentId: string, parentType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attachments').select('*').eq('parent_id', parentId).eq('parent_type', parentType).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAttachment(attachmentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attachments').select('*').eq('id', attachmentId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAttachment(input: { user_id: string; parent_id: string; parent_type: string; filename: string; original_filename: string; file_type: string; mime_type: string; file_size: number; url: string; thumbnail_url?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attachments').insert({ ...input, download_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAttachment(attachmentId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attachments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', attachmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAttachment(attachmentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('attachments').delete().eq('id', attachmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementDownloadCount(attachmentId: string) {
  try { const supabase = await createClient(); const { data: attachment } = await supabase.from('attachments').select('download_count').eq('id', attachmentId).single(); const { data, error } = await supabase.from('attachments').update({ download_count: (attachment?.download_count || 0) + 1, last_downloaded_at: new Date().toISOString() }).eq('id', attachmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserAttachments(userId: string, fileType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('attachments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (fileType) query = query.eq('file_type', fileType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAttachmentStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attachments').select('file_type, file_size').eq('user_id', userId); if (error) throw error; const stats = { total_count: data?.length || 0, total_size: data?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0, by_type: {} as Record<string, { count: number; size: number }> }; data?.forEach(a => { if (!stats.by_type[a.file_type]) stats.by_type[a.file_type] = { count: 0, size: 0 }; stats.by_type[a.file_type].count++; stats.by_type[a.file_type].size += a.file_size || 0; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function bulkDeleteAttachments(attachmentIds: string[]) {
  try { const supabase = await createClient(); const { error } = await supabase.from('attachments').delete().in('id', attachmentIds); if (error) throw error; return { success: true, deleted: attachmentIds.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveAttachment(attachmentId: string, newParentId: string, newParentType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('attachments').update({ parent_id: newParentId, parent_type: newParentType, updated_at: new Date().toISOString() }).eq('id', attachmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
