'use server'

/**
 * Extended State Server Actions - Covers all State-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getState(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').select('*').eq('entity_id', entityId).eq('entity_type', entityType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setState(entityId: string, entityType: string, state: Record<string, any>, merge = true) {
  try { const supabase = await createClient(); if (merge) { const { data: existing } = await supabase.from('states').select('state').eq('entity_id', entityId).eq('entity_type', entityType).single(); const mergedState = { ...(existing?.state || {}), ...state }; const { data, error } = await supabase.from('states').upsert({ entity_id: entityId, entity_type: entityType, state: mergedState, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type' }).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('states').upsert({ entity_id: entityId, entity_type: entityType, state, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStateValue(entityId: string, entityType: string, key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').select('state').eq('entity_id', entityId).eq('entity_type', entityType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, value: data?.state?.[key] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setStateValue(entityId: string, entityType: string, key: string, value: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('states').select('state').eq('entity_id', entityId).eq('entity_type', entityType).single(); const newState = { ...(existing?.state || {}), [key]: value }; const { data, error } = await supabase.from('states').upsert({ entity_id: entityId, entity_type: entityType, state: newState, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStateKey(entityId: string, entityType: string, key: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('states').select('state').eq('entity_id', entityId).eq('entity_type', entityType).single(); if (!existing?.state) return { success: true }; const newState = { ...existing.state }; delete newState[key]; const { error } = await supabase.from('states').update({ state: newState, updated_at: new Date().toISOString() }).eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearState(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('states').delete().eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStatesByType(entityType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').select('*').eq('entity_type', entityType).order('updated_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function findByStateValue(entityType: string, key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').select('entity_id, state').eq('entity_type', entityType); if (error) throw error; const matches = data?.filter(s => s.state?.[key] === value).map(s => s.entity_id) || []; return { success: true, data: matches } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
