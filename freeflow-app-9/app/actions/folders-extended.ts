'use server'

/**
 * Extended Folders Server Actions
 * Tables: folders, folder_permissions, folder_shares, folder_favorites, folder_activity
 */

import { createClient } from '@/lib/supabase/server'

export async function getFolder(folderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folders').select('*, folder_permissions(*), files(*)').eq('id', folderId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFolder(folderData: { name: string; owner_id: string; parent_id?: string; description?: string; color?: string; icon?: string }) {
  try { const supabase = await createClient(); const path = folderData.parent_id ? `${folderData.parent_id}/${folderData.name}` : `/${folderData.name}`; const { data, error } = await supabase.from('folders').insert({ ...folderData, path, is_deleted: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFolder(folderId: string, updates: Partial<{ name: string; description: string; color: string; icon: string; parent_id: string; is_starred: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', folderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFolder(folderId: string, permanent?: boolean) {
  try { const supabase = await createClient(); if (permanent) { await supabase.from('folder_permissions').delete().eq('folder_id', folderId); await supabase.from('folder_shares').delete().eq('folder_id', folderId); await supabase.from('files').update({ folder_id: null }).eq('folder_id', folderId); const { error } = await supabase.from('folders').delete().eq('id', folderId); if (error) throw error } else { const { error } = await supabase.from('folders').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', folderId); if (error) throw error }; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFolders(options?: { owner_id?: string; parent_id?: string; is_deleted?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('folders').select('*'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); else if (options?.parent_id === null) query = query.is('parent_id', null); if (options?.is_deleted !== undefined) query = query.eq('is_deleted', options.is_deleted); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRootFolders(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folders').select('*').eq('owner_id', userId).is('parent_id', null).eq('is_deleted', false).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubfolders(parentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folders').select('*').eq('parent_id', parentId).eq('is_deleted', false).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFolderContents(folderId: string) {
  try { const supabase = await createClient(); const [foldersResult, filesResult] = await Promise.all([supabase.from('folders').select('*').eq('parent_id', folderId).eq('is_deleted', false).order('name', { ascending: true }), supabase.from('files').select('*').eq('folder_id', folderId).eq('is_deleted', false).order('name', { ascending: true })]); return { success: true, data: { folders: foldersResult.data || [], files: filesResult.data || [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function shareFolder(shareData: { folder_id: string; shared_with: string; permission: string; shared_by: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folder_shares').insert({ ...shareData, shared_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFolderShares(folderId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folder_shares').select('*').eq('folder_id', folderId).order('shared_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSharedFolders(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folder_shares').select('*, folders(*)').eq('shared_with', userId).order('shared_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function moveFolder(folderId: string, newParentId: string | null) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('folders').update({ parent_id: newParentId, updated_at: new Date().toISOString() }).eq('id', folderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFolderBreadcrumbs(folderId: string) {
  try { const supabase = await createClient(); const breadcrumbs: any[] = []; let currentId: string | null = folderId; while (currentId) { const { data } = await supabase.from('folders').select('id, name, parent_id').eq('id', currentId).single(); if (!data) break; breadcrumbs.unshift(data); currentId = data.parent_id }; return { success: true, data: breadcrumbs } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
