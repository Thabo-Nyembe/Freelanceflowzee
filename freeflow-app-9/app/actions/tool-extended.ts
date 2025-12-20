'use server'

/**
 * Extended Tool Server Actions
 * Tables: tools, tool_settings, tool_usage, tool_integrations
 */

import { createClient } from '@/lib/supabase/server'

export async function getTool(toolId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tools').select('*').eq('id', toolId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTool(toolData: { name: string; description?: string; type?: string; config?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tools').insert({ ...toolData, is_active: toolData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTool(toolId: string, updates: Partial<{ name: string; description: string; type: string; config: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tools').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', toolId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTool(toolId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('tools').delete().eq('id', toolId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTools(options?: { type?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tools').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getToolSettings(toolId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tool_settings').select('*').eq('tool_id', toolId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getToolUsage(toolId: string, options?: { days?: number }) {
  try { const supabase = await createClient(); const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); const { data, error } = await supabase.from('tool_usage').select('*').eq('tool_id', toolId).gte('created_at', since.toISOString()).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getToolIntegrations(toolId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tool_integrations').select('*').eq('tool_id', toolId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
