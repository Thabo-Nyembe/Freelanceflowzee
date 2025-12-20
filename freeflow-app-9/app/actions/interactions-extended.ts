'use server'

/**
 * Extended Interactions Server Actions
 * Tables: interactions, interaction_types, interaction_logs, interaction_analytics, interaction_rules, interaction_triggers
 */

import { createClient } from '@/lib/supabase/server'

export async function getInteraction(interactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('interactions').select('*, interaction_types(*)').eq('id', interactionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInteraction(interactionData: { user_id: string; target_id: string; target_type: string; interaction_type: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('interactions').insert({ ...interactionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInteractions(options?: { user_id?: string; target_id?: string; target_type?: string; interaction_type?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('interactions').select('*, interaction_types(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.target_id) query = query.eq('target_id', options.target_id); if (options?.target_type) query = query.eq('target_type', options.target_type); if (options?.interaction_type) query = query.eq('interaction_type', options.interaction_type); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserInteractions(userId: string, options?: { target_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('interactions').select('*').eq('user_id', userId); if (options?.target_type) query = query.eq('target_type', options.target_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTargetInteractions(targetId: string, targetType: string, options?: { interaction_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('interactions').select('*').eq('target_id', targetId).eq('target_type', targetType); if (options?.interaction_type) query = query.eq('interaction_type', options.interaction_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInteractionTypes(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('interaction_types').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logInteraction(logData: { interaction_id: string; action: string; details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('interaction_logs').insert({ ...logData, logged_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInteractionLogs(interactionId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('interaction_logs').select('*').eq('interaction_id', interactionId).order('logged_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInteractionAnalytics(options?: { target_type?: string; interaction_type?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('interaction_analytics').select('*'); if (options?.target_type) query = query.eq('target_type', options.target_type); if (options?.interaction_type) query = query.eq('interaction_type', options.interaction_type); if (options?.from_date) query = query.gte('date', options.from_date); if (options?.to_date) query = query.lte('date', options.to_date); const { data, error } = await query.order('date', { ascending: false }).limit(30); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInteractionRule(ruleData: { name: string; description?: string; trigger_type: string; conditions: any; actions: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('interaction_rules').insert({ ...ruleData, is_active: ruleData.is_active ?? true, execution_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInteractionRules(options?: { trigger_type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('interaction_rules').select('*'); if (options?.trigger_type) query = query.eq('trigger_type', options.trigger_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function triggerInteraction(triggerData: { rule_id: string; interaction_id: string; context?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('interaction_triggers').insert({ ...triggerData, status: 'triggered', triggered_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: rule } = await supabase.from('interaction_rules').select('execution_count').eq('id', triggerData.rule_id).single(); await supabase.from('interaction_rules').update({ execution_count: (rule?.execution_count || 0) + 1 }).eq('id', triggerData.rule_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInteractionCount(targetId: string, targetType: string, interactionType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('interactions').select('id', { count: 'exact' }).eq('target_id', targetId).eq('target_type', targetType); if (interactionType) query = query.eq('interaction_type', interactionType); const { count, error } = await query; if (error) throw error; return { success: true, data: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: 0 } }
}
