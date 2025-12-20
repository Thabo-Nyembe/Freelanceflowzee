'use server'

/**
 * Extended File Server Actions - Covers all 20 File-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFileAccessLogs(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_access_logs').select('*').eq('file_id', fileId).order('accessed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logFileAccess(fileId: string, userId: string, accessType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_access_logs').insert({ file_id: fileId, user_id: userId, access_type: accessType, accessed_at: new Date().toISOString() }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileActivities(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileActivity(userId: string, fileId: string, activityType: string, metadata?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_activities').insert({ user_id: userId, file_id: fileId, activity_type: activityType, metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileActivity(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_activity').select('*').eq('file_id', fileId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFileActivityLog(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_activity_log').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFileAnalytics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_analytics').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFileBackups(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_backups').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileBackup(userId: string, fileId: string, backupUrl: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_backups').insert({ user_id: userId, file_id: fileId, backup_url: backupUrl }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileCache(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_cache').select('*').eq('file_id', fileId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setFileCache(fileId: string, cacheData: any, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_cache').upsert({ file_id: fileId, cache_data: cacheData, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileCollaborators(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_collaborators').select('*').eq('file_id', fileId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFileCollaborator(fileId: string, userId: string, role: string = 'viewer') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_collaborators').insert({ file_id: fileId, user_id: userId, role }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeFileCollaborator(fileId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_collaborators').delete().eq('file_id', fileId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileComments(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_comments').select('*').eq('file_id', fileId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileComment(fileId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_comments').insert({ file_id: fileId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFileComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileConversions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_conversions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileConversion(userId: string, fileId: string, targetFormat: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_conversions').insert({ user_id: userId, file_id: fileId, target_format: targetFormat, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileDeliveryRecipients(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_delivery_recipients').select('*').eq('delivery_id', deliveryId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFileDeliveryRecipient(deliveryId: string, email: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_delivery_recipients').insert({ delivery_id: deliveryId, email }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileDownloadTransactions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_download_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFileDownloads(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_downloads').select('*').eq('file_id', fileId).order('downloaded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordFileDownload(fileId: string, userId?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_downloads').insert({ file_id: fileId, user_id: userId, downloaded_at: new Date().toISOString() }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileLock(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_locks').select('*').eq('file_id', fileId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function lockFile(fileId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_locks').insert({ file_id: fileId, locked_by: userId, locked_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unlockFile(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_locks').delete().eq('file_id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileMetadata(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_metadata').select('*').eq('file_id', fileId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFileMetadata(fileId: string, metadata: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_metadata').upsert({ file_id: fileId, ...metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFilePreviews(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_previews').select('*').eq('file_id', fileId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFilePreview(fileId: string, previewUrl: string, previewType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_previews').insert({ file_id: fileId, preview_url: previewUrl, preview_type: previewType }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileShares(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_shares').select('*').eq('file_id', fileId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileShare(fileId: string, userId: string, shareType: string, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_shares').insert({ file_id: fileId, shared_by: userId, share_type: shareType, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFileShare(shareId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_shares').delete().eq('id', shareId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileTags(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_tags').select('*').eq('file_id', fileId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFileTag(fileId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_tags').insert({ file_id: fileId, tag }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeFileTag(fileId: string, tag: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('file_tags').delete().eq('file_id', fileId).eq('tag', tag); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileThumbnails(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_thumbnails').select('*').eq('file_id', fileId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileThumbnail(fileId: string, thumbnailUrl: string, size: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_thumbnails').insert({ file_id: fileId, thumbnail_url: thumbnailUrl, size }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileVersions(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_versions').select('*').eq('file_id', fileId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileVersion(fileId: string, userId: string, versionNumber: number, fileUrl: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_versions').insert({ file_id: fileId, created_by: userId, version_number: versionNumber, file_url: fileUrl }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
