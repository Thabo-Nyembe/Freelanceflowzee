'use server'

/**
 * Extended Navigation Server Actions - Covers all Navigation-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getNavigations(navigationType?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('navigations').select('*').order('name', { ascending: true }); if (navigationType) query = query.eq('navigation_type', navigationType); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getNavigation(navigationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('navigations').select('*').eq('id', navigationId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createNavigation(input: { name: string; slug?: string; description?: string; navigation_type: string; location?: string }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('navigations').insert({ ...input, slug, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNavigation(navigationId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('navigations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', navigationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteNavigation(navigationId: string) {
  try { const supabase = await createClient(); await supabase.from('navigation_items').delete().eq('navigation_id', navigationId); const { error } = await supabase.from('navigations').delete().eq('id', navigationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNavigationItems(navigationId: string, parentId?: string | null) {
  try { const supabase = await createClient(); let query = supabase.from('navigation_items').select('*').eq('navigation_id', navigationId).order('sort_order', { ascending: true }); if (parentId === null) query = query.is('parent_id', null); else if (parentId) query = query.eq('parent_id', parentId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getNavigationTree(navigationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('navigation_items').select('*').eq('navigation_id', navigationId).eq('is_visible', true).order('sort_order', { ascending: true }); if (error) throw error; const buildTree = (items: any[], parentId: string | null = null): any[] => { return items.filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) })); }; return { success: true, data: buildTree(data || []) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addNavigationItem(navigationId: string, item: { title: string; url?: string; icon?: string; parent_id?: string; sort_order?: number; target?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('navigation_items').insert({ navigation_id: navigationId, ...item, is_visible: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNavigationItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('navigation_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteNavigationItem(itemId: string) {
  try { const supabase = await createClient(); await supabase.from('navigation_items').update({ parent_id: null }).eq('parent_id', itemId); const { error } = await supabase.from('navigation_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderNavigationItems(itemIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < itemIds.length; i++) { await supabase.from('navigation_items').update({ sort_order: i }).eq('id', itemIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
