'use server'

/**
 * Extended Conversion Server Actions
 * Tables: conversions, conversion_funnels, conversion_goals, conversion_events
 */

import { createClient } from '@/lib/supabase/server'

export async function getConversion(conversionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversions').select('*, conversion_events(*)').eq('id', conversionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackConversion(conversionData: { user_id?: string; goal_id: string; funnel_id?: string; value?: number; source?: string; medium?: string; campaign?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversions').insert({ ...conversionData, converted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConversions(options?: { goal_id?: string; funnel_id?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('conversions').select('*'); if (options?.goal_id) query = query.eq('goal_id', options.goal_id); if (options?.funnel_id) query = query.eq('funnel_id', options.funnel_id); if (options?.date_from) query = query.gte('converted_at', options.date_from); if (options?.date_to) query = query.lte('converted_at', options.date_to); const { data, error } = await query.order('converted_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createConversionGoal(goalData: { name: string; description?: string; type: string; target_value?: number; value_per_conversion?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversion_goals').insert({ ...goalData, is_active: goalData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateConversionGoal(goalId: string, updates: Partial<{ name: string; description: string; target_value: number; value_per_conversion: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversion_goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConversionGoals(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('conversion_goals').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createConversionFunnel(funnelData: { name: string; description?: string; steps: { name: string; order: number }[]; goal_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversion_funnels').insert({ ...funnelData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackFunnelEvent(eventData: { funnel_id: string; step_name: string; user_id?: string; session_id?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('conversion_events').insert({ ...eventData, occurred_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConversionRate(goalId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let convQuery = supabase.from('conversions').select('*', { count: 'exact', head: true }).eq('goal_id', goalId); if (options?.date_from) convQuery = convQuery.gte('converted_at', options.date_from); if (options?.date_to) convQuery = convQuery.lte('converted_at', options.date_to); const { count: conversions } = await convQuery; const { data: goal } = await supabase.from('conversion_goals').select('target_value').eq('id', goalId).single(); const rate = goal?.target_value && goal.target_value > 0 ? ((conversions || 0) / goal.target_value) * 100 : 0; return { success: true, data: { conversions: conversions || 0, target: goal?.target_value || 0, rate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { conversions: 0, target: 0, rate: 0 } } }
}
