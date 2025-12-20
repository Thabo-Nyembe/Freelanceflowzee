'use server'

/**
 * Extended Files Server Actions
 * Tables: files, file_versions, file_shares, file_permissions, file_tags, file_metadata
 */

import { createClient } from '@/lib/supabase/server'

export async function getFile(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('files').select('*, file_versions(*), file_tags(*), file_metadata(*)').eq('id', fileId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFile(fileData: { name: string; path: string; size: number; mime_type: string; owner_id: string; folder_id?: string; storage_bucket?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('files').insert({ ...fileData, version: 1, is_deleted: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFile(fileId: string, updates: Partial<{ name: string; path: string; folder_id: string; is_starred: boolean; is_deleted: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('files').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fileId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFile(fileId: string, permanent?: boolean) {
  try { const supabase = await createClient(); if (permanent) { await supabase.from('file_versions').delete().eq('file_id', fileId); await supabase.from('file_shares').delete().eq('file_id', fileId); await supabase.from('file_tags').delete().eq('file_id', fileId); const { error } = await supabase.from('files').delete().eq('id', fileId); if (error) throw error } else { const { error } = await supabase.from('files').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', fileId); if (error) throw error }; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFiles(options?: { owner_id?: string; folder_id?: string; mime_type?: string; is_starred?: boolean; is_deleted?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('files').select('*'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.folder_id) query = query.eq('folder_id', options.folder_id); if (options?.mime_type) query = query.ilike('mime_type', `${options.mime_type}%`); if (options?.is_starred !== undefined) query = query.eq('is_starred', options.is_starred); if (options?.is_deleted !== undefined) query = query.eq('is_deleted', options.is_deleted); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFileVersion(versionData: { file_id: string; version_number: number; path: string; size: number; created_by: string; changelog?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_versions').insert({ ...versionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('files').update({ version: versionData.version_number, updated_at: new Date().toISOString() }).eq('id', versionData.file_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileVersions(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_versions').select('*').eq('file_id', fileId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareFile(shareData: { file_id: string; shared_with: string; permission: string; shared_by: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_shares').insert({ ...shareData, shared_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFileShares(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_shares').select('*').eq('file_id', fileId).order('shared_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFileTag(fileId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('file_tags').insert({ file_id: fileId, tag, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchFiles(query: string, options?: { owner_id?: string; mime_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let q = supabase.from('files').select('*').eq('is_deleted', false).ilike('name', `%${query}%`); if (options?.owner_id) q = q.eq('owner_id', options.owner_id); if (options?.mime_type) q = q.ilike('mime_type', `${options.mime_type}%`); const { data, error } = await q.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
