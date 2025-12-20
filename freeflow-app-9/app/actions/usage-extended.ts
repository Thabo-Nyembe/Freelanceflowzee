'use server'

/**
 * Extended Usage Server Actions - Covers all Usage-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getUsage(entityId: string, entityType: string, usageType: string, period?: string) {
  try { const supabase = await createClient(); let query = supabase.from('usage').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType); if (period) query = query.eq('period', period); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordUsage(entityId: string, entityType: string, usageType: string, amount: number, period = 'daily', metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const periodKey = getPeriodKey(period); const { data: existing } = await supabase.from('usage').select('id, amount').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType).eq('period_key', periodKey).single(); if (existing) { const { data, error } = await supabase.from('usage').update({ amount: existing.amount + amount, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('usage').insert({ entity_id: entityId, entity_type: entityType, usage_type: usageType, amount, period, period_key: periodKey, metadata, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function getPeriodKey(period: string): string {
  const now = new Date();
  switch (period) { case 'hourly': return `${now.toISOString().slice(0, 13)}`; case 'daily': return now.toISOString().slice(0, 10); case 'weekly': const week = Math.ceil((now.getDate() + 6 - now.getDay()) / 7); return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`; case 'monthly': return now.toISOString().slice(0, 7); default: return now.toISOString().slice(0, 10); }
}

export async function getUsageHistory(entityId: string, entityType: string, usageType: string, limit = 30) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('usage').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType).order('recorded_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUsageSummary(entityId: string, entityType: string, usageType: string, since?: string) {
  try { const supabase = await createClient(); let query = supabase.from('usage').select('amount').eq('entity_id', entityId).eq('entity_type', entityType).eq('usage_type', usageType); if (since) query = query.gte('recorded_at', since); const { data, error } = await query; if (error) throw error; const total = data?.reduce((sum, u) => sum + u.amount, 0) || 0; const count = data?.length || 0; return { success: true, total, count, average: count > 0 ? total / count : 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', total: 0 } }
}

export async function getTopUsage(usageType: string, entityType: string, period?: string, limit = 10) {
  try { const supabase = await createClient(); let query = supabase.from('usage').select('entity_id, amount').eq('usage_type', usageType).eq('entity_type', entityType); if (period) query = query.eq('period_key', getPeriodKey(period)); const { data, error } = await query; if (error) throw error; const aggregated: Record<string, number> = {}; data?.forEach(u => { aggregated[u.entity_id] = (aggregated[u.entity_id] || 0) + u.amount; }); const sorted = Object.entries(aggregated).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([entity_id, total]) => ({ entity_id, total })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resetUsage(entityId: string, entityType: string, usageType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('usage').delete().eq('entity_id', entityId).eq('entity_type', entityType); if (usageType) query = query.eq('usage_type', usageType); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
