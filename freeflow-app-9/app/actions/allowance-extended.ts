'use server'

/**
 * Extended Allowance Server Actions - Covers all Allowance-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAllowance(entityId: string, entityType: string, allowanceType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allowances').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setAllowance(entityId: string, entityType: string, allowanceType: string, amount: number, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allowances').upsert({ entity_id: entityId, entity_type: entityType, allowance_type: allowanceType, amount, remaining: amount, expires_at: expiresAt, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type,allowance_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function useAllowance(entityId: string, entityType: string, allowanceType: string, amount = 1) {
  try { const supabase = await createClient(); const { data: allowance } = await supabase.from('allowances').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).single(); if (!allowance) return { success: false, error: 'No allowance found' }; if (allowance.expires_at && new Date(allowance.expires_at) < new Date()) return { success: false, error: 'Allowance expired', expired: true }; if (allowance.remaining < amount) return { success: false, error: 'Insufficient allowance', remaining: allowance.remaining }; const { data, error } = await supabase.from('allowances').update({ remaining: allowance.remaining - amount, last_used_at: new Date().toISOString() }).eq('id', allowance.id).select().single(); if (error) throw error; return { success: true, data, remaining: data.remaining } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkAllowance(entityId: string, entityType: string, allowanceType: string, requiredAmount = 1) {
  try { const supabase = await createClient(); const { data: allowance } = await supabase.from('allowances').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).single(); if (!allowance) return { success: true, allowed: false, reason: 'No allowance' }; if (allowance.expires_at && new Date(allowance.expires_at) < new Date()) return { success: true, allowed: false, reason: 'Expired', expired: true }; return { success: true, allowed: allowance.remaining >= requiredAmount, remaining: allowance.remaining, total: allowance.amount } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', allowed: false } }
}

export async function refundAllowance(entityId: string, entityType: string, allowanceType: string, amount: number) {
  try { const supabase = await createClient(); const { data: allowance } = await supabase.from('allowances').select('id, remaining, amount').eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).single(); if (!allowance) return { success: false, error: 'Allowance not found' }; const newRemaining = Math.min(allowance.remaining + amount, allowance.amount); const { data, error } = await supabase.from('allowances').update({ remaining: newRemaining }).eq('id', allowance.id).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAllowances(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allowances').select('*').eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resetAllowance(entityId: string, entityType: string, allowanceType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('allowances').update({ remaining: supabase.from('allowances').select('amount'), updated_at: new Date().toISOString() }).eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAllowance(entityId: string, entityType: string, allowanceType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('allowances').delete().eq('entity_id', entityId).eq('entity_type', entityType).eq('allowance_type', allowanceType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
