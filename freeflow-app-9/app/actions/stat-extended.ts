'use server'

/**
 * Extended Stat Server Actions - Covers all Stat-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getStats(entityId: string, entityType: string, period?: string) {
  try { const supabase = await createClient(); let query = supabase.from('stats').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('recorded_at', { ascending: false }); if (period) query = query.eq('period', period); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordStat(entityId: string, entityType: string, statName: string, value: number, period = 'daily') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stats').insert({ entity_id: entityId, entity_type: entityType, stat_name: statName, value, period, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementStat(entityId: string, entityType: string, statName: string, increment = 1, period = 'daily') {
  try { const supabase = await createClient(); const today = new Date().toISOString().split('T')[0]; const { data: existing } = await supabase.from('stats').select('id, value').eq('entity_id', entityId).eq('entity_type', entityType).eq('stat_name', statName).eq('period', period).gte('recorded_at', today).single(); if (existing) { const { data, error } = await supabase.from('stats').update({ value: existing.value + increment }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } return recordStat(entityId, entityType, statName, increment, period); } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStatSummary(entityId: string, entityType: string, statName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stats').select('value').eq('entity_id', entityId).eq('entity_type', entityType).eq('stat_name', statName); if (error) throw error; const values = data?.map(s => s.value) || []; const sum = values.reduce((a, b) => a + b, 0); const avg = values.length > 0 ? sum / values.length : 0; const max = Math.max(...values, 0); const min = Math.min(...values, 0); return { success: true, data: { sum, avg, max, min, count: values.length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function getStatsByPeriod(entityId: string, entityType: string, period: string, limit = 30) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stats').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('period', period).order('recorded_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTopBystat(statName: string, entityType: string, period?: string, limit = 10) {
  try { const supabase = await createClient(); let query = supabase.from('stats').select('entity_id, value').eq('stat_name', statName).eq('entity_type', entityType); if (period) query = query.eq('period', period); const { data, error } = await query; if (error) throw error; const aggregated: Record<string, number> = {}; data?.forEach(s => { aggregated[s.entity_id] = (aggregated[s.entity_id] || 0) + s.value; }); const sorted = Object.entries(aggregated).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([entity_id, total]) => ({ entity_id, total })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteStats(entityId: string, entityType: string, olderThan?: string) {
  try { const supabase = await createClient(); let query = supabase.from('stats').delete().eq('entity_id', entityId).eq('entity_type', entityType); if (olderThan) query = query.lt('recorded_at', olderThan); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
