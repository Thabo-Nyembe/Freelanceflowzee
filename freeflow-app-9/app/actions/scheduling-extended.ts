'use server'

/**
 * Extended Scheduling Server Actions
 * Tables: scheduling_slots, scheduling_rules, scheduling_blocks, scheduling_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getSchedulingSlot(slotId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduling_slots').select('*').eq('id', slotId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSchedulingSlot(slotData: { user_id: string; start_time: string; end_time: string; is_available?: boolean; slot_type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduling_slots').insert({ ...slotData, is_available: slotData.is_available ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSchedulingSlot(slotId: string, updates: Partial<{ start_time: string; end_time: string; is_available: boolean; slot_type: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduling_slots').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', slotId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSchedulingSlots(options?: { user_id?: string; is_available?: boolean; date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduling_slots').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available); if (options?.date) query = query.gte('start_time', options.date).lt('start_time', new Date(new Date(options.date).getTime() + 86400000).toISOString()); const { data, error } = await query.order('start_time', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSchedulingRules(options?: { user_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduling_rules').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSchedulingBlocks(options?: { user_id?: string; block_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('scheduling_blocks').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.block_type) query = query.eq('block_type', options.block_type); const { data, error } = await query.order('start_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSchedulingPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduling_preferences').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSchedulingPreferences(userId: string, preferences: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('scheduling_preferences').upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
