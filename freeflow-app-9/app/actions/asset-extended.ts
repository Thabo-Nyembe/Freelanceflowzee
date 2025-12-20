'use server'

/**
 * Extended Asset Server Actions - Covers all Asset-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAssets(userId?: string, assetType?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('assets').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (assetType) query = query.eq('asset_type', assetType); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAsset(assetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('assets').select('*').eq('id', assetId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAsset(input: { user_id: string; name: string; asset_type: string; url: string; thumbnail_url?: string; file_size?: number; mime_type?: string; metadata?: any; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('assets').insert({ ...input, status: 'active', version: 1, usage_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAsset(assetId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('assets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAsset(assetId: string) {
  try { const supabase = await createClient(); await supabase.from('asset_versions').delete().eq('asset_id', assetId); const { error } = await supabase.from('assets').delete().eq('id', assetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function archiveAsset(assetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('assets').update({ status: 'archived', archived_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAssetVersion(assetId: string, input: { url: string; file_size?: number; changelog?: string }) {
  try { const supabase = await createClient(); const { data: asset } = await supabase.from('assets').select('version').eq('id', assetId).single(); const newVersion = (asset?.version || 0) + 1; const { data, error } = await supabase.from('asset_versions').insert({ asset_id: assetId, version_number: newVersion, ...input }).select().single(); if (error) throw error; await supabase.from('assets').update({ version: newVersion, url: input.url, updated_at: new Date().toISOString() }).eq('id', assetId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAssetVersions(assetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('asset_versions').select('*').eq('asset_id', assetId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function revertAssetVersion(assetId: string, versionNumber: number) {
  try { const supabase = await createClient(); const { data: version, error: versionError } = await supabase.from('asset_versions').select('url, file_size').eq('asset_id', assetId).eq('version_number', versionNumber).single(); if (versionError) throw versionError; const { data, error } = await supabase.from('assets').update({ url: version.url, file_size: version.file_size, updated_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementAssetUsage(assetId: string) {
  try { const supabase = await createClient(); const { data: asset } = await supabase.from('assets').select('usage_count').eq('id', assetId).single(); const { data, error } = await supabase.from('assets').update({ usage_count: (asset?.usage_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', assetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchAssets(query: string, assetType?: string, limit = 20) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('assets').select('*').ilike('name', `%${query}%`).eq('status', 'active').limit(limit); if (assetType) dbQuery = dbQuery.eq('asset_type', assetType); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateAsset(assetId: string, userId: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('assets').select('*').eq('id', assetId).single(); if (origError) throw origError; const { id, created_at, updated_at, usage_count, ...assetData } = original; const { data, error } = await supabase.from('assets').insert({ ...assetData, user_id: userId, name: `Copy of ${original.name}`, version: 1, usage_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
