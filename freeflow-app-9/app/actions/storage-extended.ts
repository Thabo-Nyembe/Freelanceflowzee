'use server'

/**
 * Extended Storage Server Actions - Covers all 10 Storage-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getStorageAnalytics(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_analytics').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStorageAnalytics(userId: string, analytics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_analytics').upsert({ user_id: userId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageConnections(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_connections').select('*').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStorageConnection(userId: string, input: { provider_id: string; credentials: any; name?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_connections').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disconnectStorageConnection(connectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_connections').update({ is_active: false }).eq('id', connectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageFiles(folderId?: string, userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('storage_files').select('*').order('name', { ascending: true })
    if (folderId) query = query.eq('folder_id', folderId)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStorageFile(userId: string, input: { name: string; file_url: string; file_type: string; file_size: number; folder_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_files').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStorageFile(fileId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_files').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fileId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStorageFile(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('storage_files').delete().eq('id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageFilesCache(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_files_cache').select('*').eq('file_id', fileId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setStorageFileCache(fileId: string, cacheData: any, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_files_cache').upsert({ file_id: fileId, cache_data: cacheData, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function invalidateStorageFileCache(fileId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('storage_files_cache').delete().eq('file_id', fileId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageFolders(userId: string, parentId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('storage_folders').select('*').eq('user_id', userId).order('name', { ascending: true })
    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else {
      query = query.is('parent_id', null)
    }
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStorageFolder(userId: string, name: string, parentId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_folders').insert({ user_id: userId, name, parent_id: parentId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function renameStorageFolder(folderId: string, name: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_folders').update({ name, updated_at: new Date().toISOString() }).eq('id', folderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStorageFolder(folderId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('storage_folders').delete().eq('id', folderId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageOptimizationJobs(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_optimization_jobs').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStorageOptimizationJob(userId: string, jobType: string, targetFiles?: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_optimization_jobs').insert({ user_id: userId, job_type: jobType, target_files: targetFiles, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateOptimizationJobStatus(jobId: string, status: string, results?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_optimization_jobs').update({ status, results, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', jobId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageProviders() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_providers').select('*').eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStorageQuotas(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_quotas').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStorageQuotas(userId: string, usedStorage: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_quotas').upsert({ user_id: userId, used_storage: usedStorage, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageShares(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_shares').select('*').eq('file_id', fileId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createStorageShare(fileId: string, sharedBy: string, input: { shared_with?: string; permission: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_shares').insert({ file_id: fileId, shared_by: sharedBy, ...input, share_token: crypto.randomUUID(), is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeStorageShare(shareId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_shares').update({ is_active: false }).eq('id', shareId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStorageTiers() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('storage_tiers').select('*').order('storage_limit', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
