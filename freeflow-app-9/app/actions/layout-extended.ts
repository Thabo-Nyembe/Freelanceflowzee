'use server'

/**
 * Extended Layout Server Actions - Covers all Layout-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLayouts(layoutType?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('layouts').select('*').order('name', { ascending: true }); if (layoutType) query = query.eq('layout_type', layoutType); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLayout(layoutId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('layouts').select('*').eq('id', layoutId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLayout(input: { name: string; description?: string; layout_type: string; config?: any; preview_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('layouts').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLayout(layoutId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('layouts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', layoutId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLayout(layoutId: string) {
  try { const supabase = await createClient(); await supabase.from('layout_sections').delete().eq('layout_id', layoutId); await supabase.from('user_layouts').delete().eq('layout_id', layoutId); const { error } = await supabase.from('layouts').delete().eq('id', layoutId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateLayout(layoutId: string, newName: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('layouts').select('*').eq('id', layoutId).single(); if (origError) throw origError; const { id, created_at, updated_at, ...layoutData } = original; const { data, error } = await supabase.from('layouts').insert({ ...layoutData, name: newName }).select().single(); if (error) throw error; const { data: sections } = await supabase.from('layout_sections').select('*').eq('layout_id', layoutId); if (sections && sections.length > 0) { const newSections = sections.map(s => { const { id: sId, created_at: sCreated, layout_id, ...sData } = s; return { ...sData, layout_id: data.id }; }); await supabase.from('layout_sections').insert(newSections); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLayout(userId: string, layoutType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('user_layouts').select('*, layouts(*)').eq('user_id', userId).eq('is_active', true); if (layoutType) query = query.eq('layout_type', layoutType); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setUserLayout(userId: string, layoutId: string, layoutType: string, customizations?: any) {
  try { const supabase = await createClient(); await supabase.from('user_layouts').update({ is_active: false }).eq('user_id', userId).eq('layout_type', layoutType); const { data, error } = await supabase.from('user_layouts').upsert({ user_id: userId, layout_id: layoutId, layout_type: layoutType, customizations, is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id,layout_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLayoutSections(layoutId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('layout_sections').select('*').eq('layout_id', layoutId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLayoutSection(layoutId: string, section: { name: string; section_type: string; config?: any; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('layout_sections').insert({ layout_id: layoutId, ...section, is_visible: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLayoutSection(sectionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('layout_sections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLayoutSection(sectionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('layout_sections').delete().eq('id', sectionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderLayoutSections(sectionIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < sectionIds.length; i++) { await supabase.from('layout_sections').update({ sort_order: i }).eq('id', sectionIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
