'use server'

/**
 * Extended Snapshot Server Actions - Covers all Snapshot-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSnapshots(entityId: string, entityType: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snapshots').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSnapshot(entityId: string, entityType: string, data: any, name?: string, createdBy?: string) {
  try { const supabase = await createClient(); const { data: snapshot, error } = await supabase.from('snapshots').insert({ entity_id: entityId, entity_type: entityType, snapshot_data: data, name: name || `Snapshot ${new Date().toISOString()}`, created_by: createdBy }).select().single(); if (error) throw error; return { success: true, data: snapshot } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSnapshotById(snapshotId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snapshots').select('*').eq('id', snapshotId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreSnapshot(snapshotId: string, restoredBy: string) {
  try { const supabase = await createClient(); const { data: snapshot, error: fetchError } = await supabase.from('snapshots').select('*').eq('id', snapshotId).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from(snapshot.entity_type).update(snapshot.snapshot_data).eq('id', snapshot.entity_id).select().single(); if (error) throw error; await supabase.from('snapshots').update({ last_restored_at: new Date().toISOString(), restored_by: restoredBy }).eq('id', snapshotId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSnapshot(snapshotId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('snapshots').delete().eq('id', snapshotId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function renameSnapshot(snapshotId: string, name: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snapshots').update({ name }).eq('id', snapshotId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function compareSnapshots(snapshotId1: string, snapshotId2: string) {
  try { const supabase = await createClient(); const [{ data: snap1 }, { data: snap2 }] = await Promise.all([ supabase.from('snapshots').select('snapshot_data, created_at').eq('id', snapshotId1).single(), supabase.from('snapshots').select('snapshot_data, created_at').eq('id', snapshotId2).single() ]); if (!snap1 || !snap2) return { success: false, error: 'One or both snapshots not found' }; const differences: Record<string, { before: any; after: any }> = {}; const allKeys = new Set([...Object.keys(snap1.snapshot_data || {}), ...Object.keys(snap2.snapshot_data || {})]); allKeys.forEach(key => { if (JSON.stringify(snap1.snapshot_data?.[key]) !== JSON.stringify(snap2.snapshot_data?.[key])) { differences[key] = { before: snap1.snapshot_data?.[key], after: snap2.snapshot_data?.[key] }; } }); return { success: true, differences, snap1Date: snap1.created_at, snap2Date: snap2.created_at } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSnapshotCount(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('snapshots').select('*', { count: 'exact', head: true }).eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}
