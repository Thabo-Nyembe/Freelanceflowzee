'use server'

/**
 * Extended Flag Server Actions - Covers all Flag-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFlag(flagId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('flags').select('*').eq('id', flagId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFlagByKey(key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('flags').select('*').eq('flag_key', key).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFlag(flagData: { flag_key: string; name: string; description?: string; flag_type?: 'boolean' | 'percentage' | 'variant'; default_value?: any; variants?: Record<string, any>; rules?: Array<{ condition: Record<string, any>; value: any }>; is_enabled?: boolean; user_id?: string; environment?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('flags').insert({ ...flagData, flag_type: flagData.flag_type || 'boolean', is_enabled: flagData.is_enabled ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFlag(flagId: string, updates: Partial<{ name: string; description: string; default_value: any; variants: Record<string, any>; rules: Array<{ condition: Record<string, any>; value: any }>; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('flags').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', flagId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFlag(flagId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('flags').delete().eq('id', flagId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function enableFlag(flagId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('flags').update({ is_enabled: true, updated_at: new Date().toISOString() }).eq('id', flagId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disableFlag(flagId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('flags').update({ is_enabled: false, updated_at: new Date().toISOString() }).eq('id', flagId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function evaluateFlag(flagKey: string, context?: Record<string, any>) {
  try { const supabase = await createClient(); const { data: flag } = await supabase.from('flags').select('*').eq('flag_key', flagKey).single(); if (!flag) return { success: true, enabled: false, value: null }; if (!flag.is_enabled) return { success: true, enabled: false, value: flag.default_value }; if (flag.rules && context) { for (const rule of flag.rules) { if (evaluateRule(rule.condition, context)) { return { success: true, enabled: true, value: rule.value }; } } } return { success: true, enabled: true, value: flag.default_value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', enabled: false } }
}

function evaluateRule(condition: Record<string, any>, context: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(condition)) {
    if (context[key] !== value) return false;
  }
  return true;
}

export async function getFlags(options?: { environment?: string; isEnabled?: boolean; flagType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('flags').select('*'); if (options?.environment) query = query.eq('environment', options.environment); if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled); if (options?.flagType) query = query.eq('flag_type', options.flagType); const { data, error } = await query.order('flag_key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function copyFlagToEnvironment(flagId: string, targetEnvironment: string) {
  try { const supabase = await createClient(); const { data: source } = await supabase.from('flags').select('*').eq('id', flagId).single(); if (!source) return { success: false, error: 'Flag not found' }; const { id, created_at, updated_at, ...flagData } = source; const { data, error } = await supabase.from('flags').insert({ ...flagData, environment: targetEnvironment, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
