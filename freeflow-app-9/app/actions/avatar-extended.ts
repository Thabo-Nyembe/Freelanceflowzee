'use server'

/**
 * Extended Avatar Server Actions - Covers all Avatar-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAvatars(userId?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('avatars').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAvatar(avatarId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('avatars').select('*').eq('id', avatarId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveAvatar(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('avatars').select('*').eq('user_id', userId).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAvatar(input: { user_id: string; url: string; thumbnail_url?: string; source?: string; metadata?: any }) {
  try { const supabase = await createClient(); await supabase.from('avatars').update({ is_active: false }).eq('user_id', input.user_id); const { data, error } = await supabase.from('avatars').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setActiveAvatar(userId: string, avatarId: string) {
  try { const supabase = await createClient(); await supabase.from('avatars').update({ is_active: false }).eq('user_id', userId); const { data, error } = await supabase.from('avatars').update({ is_active: true }).eq('id', avatarId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAvatar(avatarId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('avatars').delete().eq('id', avatarId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAllUserAvatars(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('avatars').delete().eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAvatarUploads(userId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('avatar_uploads').select('*').order('uploaded_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAvatarUpload(input: { user_id: string; original_filename: string; file_size: number; mime_type: string; temp_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('avatar_uploads').insert({ ...input, status: 'pending', uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeAvatarUpload(uploadId: string, finalUrl: string, thumbnailUrl?: string) {
  try { const supabase = await createClient(); const { data: upload, error: uploadError } = await supabase.from('avatar_uploads').update({ status: 'completed', final_url: finalUrl, thumbnail_url: thumbnailUrl, completed_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (uploadError) throw uploadError; const avatarResult = await createAvatar({ user_id: upload.user_id, url: finalUrl, thumbnail_url: thumbnailUrl, source: 'upload', metadata: { upload_id: uploadId } }); return { success: true, data: { upload, avatar: avatarResult.data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function failAvatarUpload(uploadId: string, errorMessage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('avatar_uploads').update({ status: 'failed', error_message: errorMessage, completed_at: new Date().toISOString() }).eq('id', uploadId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAvatarUpload(uploadId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('avatar_uploads').delete().eq('id', uploadId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupPendingUploads(olderThanHours = 24) {
  try { const supabase = await createClient(); const cutoffDate = new Date(); cutoffDate.setHours(cutoffDate.getHours() - olderThanHours); const { error } = await supabase.from('avatar_uploads').delete().eq('status', 'pending').lt('uploaded_at', cutoffDate.toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
