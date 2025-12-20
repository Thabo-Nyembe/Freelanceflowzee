'use server'

/**
 * Extended Archive Server Actions - Covers all Archive-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getArchives(userId?: string, entityType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('archives').select('*').order('archived_at', { ascending: false }).limit(limit); if (userId) query = query.eq('archived_by', userId); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function archiveItem(entityId: string, entityType: string, entityData: any, archivedBy: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('archives').insert({ entity_id: entityId, entity_type: entityType, entity_data: entityData, archived_by: archivedBy, reason, archived_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreFromArchive(archiveId: string, restoredBy: string) {
  try { const supabase = await createClient(); const { data: archive, error: fetchError } = await supabase.from('archives').select('*').eq('id', archiveId).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from(archive.entity_type).insert(archive.entity_data).select().single(); if (error) throw error; await supabase.from('archives').update({ restored_at: new Date().toISOString(), restored_by: restoredBy, status: 'restored' }).eq('id', archiveId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getArchiveById(archiveId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('archives').select('*').eq('id', archiveId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchArchives(query: string, entityType?: string, limit = 50) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('archives').select('*').order('archived_at', { ascending: false }).limit(limit); if (entityType) dbQuery = dbQuery.eq('entity_type', entityType); const { data, error } = await dbQuery; if (error) throw error; const filtered = data?.filter(a => JSON.stringify(a.entity_data).toLowerCase().includes(query.toLowerCase())) || []; return { success: true, data: filtered } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteArchive(archiveId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('archives').delete().eq('id', archiveId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getArchiveStats(entityType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('archives').select('entity_type, status'); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query; if (error) throw error; const stats: Record<string, { total: number; restored: number; pending: number }> = {}; data?.forEach(a => { if (!stats[a.entity_type]) stats[a.entity_type] = { total: 0, restored: 0, pending: 0 }; stats[a.entity_type].total++; if (a.status === 'restored') stats[a.entity_type].restored++; else stats[a.entity_type].pending++; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function cleanupOldArchives(olderThan: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('archives').delete().lt('archived_at', olderThan); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
