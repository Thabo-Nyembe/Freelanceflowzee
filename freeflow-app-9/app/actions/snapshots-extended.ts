'use server'

/**
 * Extended Snapshots Server Actions
 * Tables: snapshots, snapshot_items, snapshot_schedules, snapshot_comparisons, snapshot_exports, snapshot_tags
 */

import { createClient } from '@/lib/supabase/server'

export async function getSnapshot(snapshotId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snapshots').select('*, snapshot_items(*), snapshot_tags(*), users(*)').eq('id', snapshotId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSnapshot(snapshotData: { name: string; description?: string; entity_type: string; entity_id?: string; snapshot_type?: string; data: any; items?: any[]; tags?: string[]; created_by?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { items, tags, ...snapshotInfo } = snapshotData; const { data: snapshot, error: snapshotError } = await supabase.from('snapshots').insert({ ...snapshotInfo, status: 'active', snapshot_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (snapshotError) throw snapshotError; if (items && items.length > 0) { const itemsData = items.map(i => ({ snapshot_id: snapshot.id, ...i, created_at: new Date().toISOString() })); await supabase.from('snapshot_items').insert(itemsData) } if (tags && tags.length > 0) { const tagsData = tags.map(t => ({ snapshot_id: snapshot.id, tag: t, created_at: new Date().toISOString() })); await supabase.from('snapshot_tags').insert(tagsData) } return { success: true, data: snapshot } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSnapshot(snapshotId: string, updates: Partial<{ name: string; description: string; status: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snapshots').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', snapshotId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSnapshot(snapshotId: string) {
  try { const supabase = await createClient(); await supabase.from('snapshot_items').delete().eq('snapshot_id', snapshotId); await supabase.from('snapshot_tags').delete().eq('snapshot_id', snapshotId); const { error } = await supabase.from('snapshots').delete().eq('id', snapshotId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSnapshots(options?: { entity_type?: string; entity_id?: string; snapshot_type?: string; created_by?: string; status?: string; tag?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('snapshots').select('*, snapshot_items(count), snapshot_tags(*), users(*)'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.snapshot_type) query = query.eq('snapshot_type', options.snapshot_type); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('snapshot_at', options.from_date); if (options?.to_date) query = query.lte('snapshot_at', options.to_date); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('snapshot_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; let snapshots = data || []; if (options?.tag) { const snapshotIds = snapshots.map(s => s.id); const { data: tagData } = await supabase.from('snapshot_tags').select('snapshot_id').in('snapshot_id', snapshotIds).eq('tag', options.tag); const taggedIds = new Set(tagData?.map(t => t.snapshot_id) || []); snapshots = snapshots.filter(s => taggedIds.has(s.id)) } return { success: true, data: snapshots } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function compareSnapshots(snapshotId1: string, snapshotId2: string) {
  try { const supabase = await createClient(); const [snapshot1, snapshot2] = await Promise.all([
    supabase.from('snapshots').select('*, snapshot_items(*)').eq('id', snapshotId1).single(),
    supabase.from('snapshots').select('*, snapshot_items(*)').eq('id', snapshotId2).single()
  ]); if (!snapshot1.data || !snapshot2.data) return { success: false, error: 'Snapshots not found' }; const { data: comparison, error } = await supabase.from('snapshot_comparisons').insert({ snapshot1_id: snapshotId1, snapshot2_id: snapshotId2, differences: computeDifferences(snapshot1.data, snapshot2.data), compared_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { comparison, snapshot1: snapshot1.data, snapshot2: snapshot2.data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function computeDifferences(snapshot1: any, snapshot2: any): any {
  const data1 = snapshot1.data || {}
  const data2 = snapshot2.data || {}
  const added: string[] = []
  const removed: string[] = []
  const modified: string[] = []
  const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)])
  allKeys.forEach(key => {
    if (!(key in data1)) added.push(key)
    else if (!(key in data2)) removed.push(key)
    else if (JSON.stringify(data1[key]) !== JSON.stringify(data2[key])) modified.push(key)
  })
  return { added, removed, modified, summary: { addedCount: added.length, removedCount: removed.length, modifiedCount: modified.length } }
}

export async function restoreSnapshot(snapshotId: string, restoredBy?: string) {
  try { const supabase = await createClient(); const { data: snapshot } = await supabase.from('snapshots').select('*').eq('id', snapshotId).single(); if (!snapshot) return { success: false, error: 'Snapshot not found' }; await supabase.from('snapshots').update({ restored_at: new Date().toISOString(), restored_by: restoredBy, updated_at: new Date().toISOString() }).eq('id', snapshotId); return { success: true, data: snapshot } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function scheduleSnapshot(scheduleData: { name: string; entity_type: string; entity_id?: string; schedule_type: 'hourly' | 'daily' | 'weekly' | 'monthly'; schedule_time?: string; days_of_week?: number[]; retention_count?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('snapshot_schedules').insert({ ...scheduleData, is_active: scheduleData.is_active ?? true, last_run_at: null, next_run_at: calculateNextRun(scheduleData.schedule_type, scheduleData.schedule_time), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function calculateNextRun(scheduleType: string, scheduleTime?: string): string {
  const now = new Date()
  const time = scheduleTime?.split(':') || ['00', '00']
  const next = new Date(now)
  next.setHours(parseInt(time[0]), parseInt(time[1]), 0, 0)
  if (next <= now) {
    switch (scheduleType) {
      case 'hourly': next.setHours(next.getHours() + 1); break
      case 'daily': next.setDate(next.getDate() + 1); break
      case 'weekly': next.setDate(next.getDate() + 7); break
      case 'monthly': next.setMonth(next.getMonth() + 1); break
    }
  }
  return next.toISOString()
}

export async function getSnapshotSchedules(options?: { entity_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('snapshot_schedules').select('*'); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function exportSnapshot(snapshotId: string, format: 'json' | 'csv' | 'pdf') {
  try { const supabase = await createClient(); const { data: snapshot } = await supabase.from('snapshots').select('*, snapshot_items(*)').eq('id', snapshotId).single(); if (!snapshot) return { success: false, error: 'Snapshot not found' }; const { data: exportRecord, error } = await supabase.from('snapshot_exports').insert({ snapshot_id: snapshotId, format, status: 'completed', export_url: `/exports/snapshot-${snapshotId}.${format}`, exported_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { export: exportRecord, snapshot } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

