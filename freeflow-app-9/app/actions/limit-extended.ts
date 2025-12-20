'use server'

/**
 * Extended Limit Server Actions - Covers all Limit-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLimit(entityId: string, entityType: string, limitType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('limits').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('limit_type', limitType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setLimit(entityId: string, entityType: string, limitType: string, maxValue: number, period?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('limits').upsert({ entity_id: entityId, entity_type: entityType, limit_type: limitType, max_value: maxValue, period, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type,limit_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkLimit(entityId: string, entityType: string, limitType: string, currentValue: number) {
  try { const supabase = await createClient(); const { data } = await supabase.from('limits').select('max_value').eq('entity_id', entityId).eq('entity_type', entityType).eq('limit_type', limitType).single(); if (!data) return { success: true, allowed: true, remaining: Infinity }; const allowed = currentValue < data.max_value; return { success: true, allowed, remaining: Math.max(0, data.max_value - currentValue), maxValue: data.max_value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', allowed: false } }
}

export async function getLimits(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('limits').select('*').eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteLimit(entityId: string, entityType: string, limitType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('limits').delete().eq('entity_id', entityId).eq('entity_type', entityType).eq('limit_type', limitType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLimitsByType(limitType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('limits').select('*').eq('limit_type', limitType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkSetLimits(limits: Array<{ entityId: string; entityType: string; limitType: string; maxValue: number }>) {
  try { const supabase = await createClient(); const records = limits.map(l => ({ entity_id: l.entityId, entity_type: l.entityType, limit_type: l.limitType, max_value: l.maxValue, updated_at: new Date().toISOString() })); const { data, error } = await supabase.from('limits').upsert(records, { onConflict: 'entity_id,entity_type,limit_type' }).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
