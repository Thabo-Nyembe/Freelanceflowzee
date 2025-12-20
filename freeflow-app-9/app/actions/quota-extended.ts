'use server'

/**
 * Extended Quota Server Actions - Covers all Quota-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getQuota(entityId: string, entityType: string, quotaType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotas').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('quota_type', quotaType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setQuota(entityId: string, entityType: string, quotaType: string, limit: number, used = 0, period?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotas').upsert({ entity_id: entityId, entity_type: entityType, quota_type: quotaType, limit_value: limit, used, period, reset_at: period ? getNextResetDate(period) : null, updated_at: new Date().toISOString() }, { onConflict: 'entity_id,entity_type,quota_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function getNextResetDate(period: string): string {
  const now = new Date();
  switch (period) { case 'hourly': now.setHours(now.getHours() + 1, 0, 0, 0); break; case 'daily': now.setDate(now.getDate() + 1); now.setHours(0, 0, 0, 0); break; case 'weekly': now.setDate(now.getDate() + (7 - now.getDay())); now.setHours(0, 0, 0, 0); break; case 'monthly': now.setMonth(now.getMonth() + 1, 1); now.setHours(0, 0, 0, 0); break; }
  return now.toISOString();
}

export async function useQuota(entityId: string, entityType: string, quotaType: string, amount = 1) {
  try { const supabase = await createClient(); const { data: quota } = await supabase.from('quotas').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('quota_type', quotaType).single(); if (!quota) return { success: false, error: 'Quota not found' }; if (quota.reset_at && new Date(quota.reset_at) < new Date()) { const { data, error } = await supabase.from('quotas').update({ used: amount, reset_at: getNextResetDate(quota.period) }).eq('id', quota.id).select().single(); if (error) throw error; return { success: true, data, remaining: quota.limit_value - amount }; } if (quota.used + amount > quota.limit_value) return { success: false, error: 'Quota exceeded', remaining: quota.limit_value - quota.used }; const { data, error } = await supabase.from('quotas').update({ used: quota.used + amount }).eq('id', quota.id).select().single(); if (error) throw error; return { success: true, data, remaining: quota.limit_value - quota.used - amount } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkQuota(entityId: string, entityType: string, quotaType: string, requiredAmount = 1) {
  try { const supabase = await createClient(); const { data: quota } = await supabase.from('quotas').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('quota_type', quotaType).single(); if (!quota) return { success: true, allowed: true, remaining: Infinity }; const remaining = quota.limit_value - quota.used; return { success: true, allowed: remaining >= requiredAmount, remaining, used: quota.used, limit: quota.limit_value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', allowed: false } }
}

export async function resetQuota(entityId: string, entityType: string, quotaType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotas').update({ used: 0, updated_at: new Date().toISOString() }).eq('entity_id', entityId).eq('entity_type', entityType).eq('quota_type', quotaType).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getQuotas(entityId: string, entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('quotas').select('*').eq('entity_id', entityId).eq('entity_type', entityType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
