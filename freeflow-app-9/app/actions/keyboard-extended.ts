'use server'

/**
 * Extended Keyboard Server Actions
 * Tables: keyboard_shortcuts, keyboard_layouts, keyboard_bindings, keyboard_profiles, keyboard_macros
 */

import { createClient } from '@/lib/supabase/server'

export async function getKeyboardShortcut(shortcutId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_shortcuts').select('*').eq('id', shortcutId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKeyboardShortcut(shortcutData: { user_id: string; key_combination: string; action: string; context?: string; description?: string; is_global?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_shortcuts').insert({ ...shortcutData, is_enabled: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateKeyboardShortcut(shortcutId: string, updates: Partial<{ key_combination: string; action: string; context: string; is_enabled: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_shortcuts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', shortcutId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteKeyboardShortcut(shortcutId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('keyboard_shortcuts').delete().eq('id', shortcutId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserShortcuts(userId: string, options?: { context?: string; is_enabled?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('keyboard_shortcuts').select('*').eq('user_id', userId); if (options?.context) query = query.eq('context', options.context); if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled); const { data, error } = await query.order('key_combination', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getKeyboardLayouts() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_layouts').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setUserKeyboardLayout(userId: string, layoutId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_profiles').upsert({ user_id: userId, layout_id: layoutId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createKeyboardMacro(macroData: { user_id: string; name: string; key_sequence: string[]; actions: any[]; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_macros').insert({ ...macroData, is_enabled: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserMacros(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('keyboard_macros').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDefaultShortcuts(context?: string) {
  try { const supabase = await createClient(); let query = supabase.from('keyboard_shortcuts').select('*').eq('is_global', true); if (context) query = query.eq('context', context); const { data, error } = await query.order('key_combination', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
