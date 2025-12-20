'use server'

/**
 * Extended Counter Server Actions - Covers all Counter-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCounter(entityId: string, entityType: string, counterName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('counters').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('counter_name', counterName).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data, value: data?.value || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', value: 0 } }
}

export async function incrementCounter(entityId: string, entityType: string, counterName: string, increment = 1) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('counters').select('id, value').eq('entity_id', entityId).eq('entity_type', entityType).eq('counter_name', counterName).single(); if (existing) { const { data, error } = await supabase.from('counters').update({ value: existing.value + increment, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data, value: data.value }; } const { data, error } = await supabase.from('counters').insert({ entity_id: entityId, entity_type: entityType, counter_name: counterName, value: increment }).select().single(); if (error) throw error; return { success: true, data, value: data.value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function decrementCounter(entityId: string, entityType: string, counterName: string, decrement = 1, allowNegative = false) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('counters').select('id, value').eq('entity_id', entityId).eq('entity_type', entityType).eq('counter_name', counterName).single(); if (!existing) return { success: true, value: 0 }; const newValue = allowNegative ? existing.value - decrement : Math.max(0, existing.value - decrement); const { data, error } = await supabase.from('counters').update({ value: newValue, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data, value: data.value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setCounter(entityId: string, entityType: string, counterName: string, value: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('counters').upsert({ entity_id: entityId, entity_type: entityType, counter_name: counterName, value, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type,counter_name' }).select().single(); if (error) throw error; return { success: true, data, value: data.value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetCounter(entityId: string, entityType: string, counterName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('counters').update({ value: 0, updated_at: new Date().toISOString() }).eq('entity_id', entityId).eq('entity_type', entityType).eq('counter_name', counterName).select().single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, value: 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCounters(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('counters').select('*').eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTopCounters(counterName: string, entityType: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('counters').select('entity_id, value').eq('counter_name', counterName).eq('entity_type', entityType).order('value', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteCounter(entityId: string, entityType: string, counterName: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('counters').delete().eq('entity_id', entityId).eq('entity_type', entityType).eq('counter_name', counterName); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
