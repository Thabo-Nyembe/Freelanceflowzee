'use server'

/**
 * Extended Version Server Actions - Covers all Version-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getVersion(versionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('versions').select('*').eq('id', versionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVersionByNumber(entityType: string, entityId: string, versionNumber: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('versions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).eq('version_number', versionNumber).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVersion(versionData: { entity_type: string; entity_id: string; version_number: string; content?: Record<string, any>; changes?: string[]; change_summary?: string; is_major?: boolean; is_published?: boolean; user_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('versions').insert({ ...versionData, is_current: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVersion(versionId: string, updates: Partial<{ content: Record<string, any>; changes: string[]; change_summary: string; is_published: boolean; is_current: boolean; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); if (updates.is_current) { const { data: version } = await supabase.from('versions').select('entity_type, entity_id').eq('id', versionId).single(); if (version) { await supabase.from('versions').update({ is_current: false }).eq('entity_type', version.entity_type).eq('entity_id', version.entity_id); } } const { data, error } = await supabase.from('versions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', versionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteVersion(versionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('versions').delete().eq('id', versionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVersionHistory(entityType: string, entityId: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('versions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCurrentVersion(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('versions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).eq('is_current', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishVersion(versionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('versions').update({ is_published: true, published_at: new Date().toISOString() }).eq('id', versionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rollbackToVersion(entityType: string, entityId: string, versionId: string) {
  try { const supabase = await createClient(); await supabase.from('versions').update({ is_current: false }).eq('entity_type', entityType).eq('entity_id', entityId); const { data, error } = await supabase.from('versions').update({ is_current: true, restored_at: new Date().toISOString() }).eq('id', versionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function compareVersions(versionId1: string, versionId2: string) {
  try { const supabase = await createClient(); const { data: v1 } = await supabase.from('versions').select('*').eq('id', versionId1).single(); const { data: v2 } = await supabase.from('versions').select('*').eq('id', versionId2).single(); if (!v1 || !v2) return { success: false, error: 'Version not found' }; return { success: true, version1: v1, version2: v2 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
