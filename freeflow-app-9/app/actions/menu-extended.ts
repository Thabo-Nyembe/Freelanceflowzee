'use server'

/**
 * Extended Menu Server Actions - Covers all Menu-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMenus(menuType?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('menus').select('*').order('name', { ascending: true }); if (menuType) query = query.eq('menu_type', menuType); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMenu(menuId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menus').select('*').eq('id', menuId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMenuBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menus').select('*').eq('slug', slug).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMenu(input: { name: string; slug?: string; description?: string; menu_type: string; location?: string }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('menus').insert({ ...input, slug, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMenu(menuId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menus').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', menuId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMenu(menuId: string) {
  try { const supabase = await createClient(); await supabase.from('menu_items').delete().eq('menu_id', menuId); const { error } = await supabase.from('menus').delete().eq('id', menuId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMenuItems(menuId: string, parentId?: string | null) {
  try { const supabase = await createClient(); let query = supabase.from('menu_items').select('*').eq('menu_id', menuId).order('sort_order', { ascending: true }); if (parentId === null) query = query.is('parent_id', null); else if (parentId) query = query.eq('parent_id', parentId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMenuTree(menuId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').select('*').eq('menu_id', menuId).eq('is_visible', true).order('sort_order', { ascending: true }); if (error) throw error; const buildTree = (items: any[], parentId: string | null = null): any[] => { return items.filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) })); }; return { success: true, data: buildTree(data || []) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMenuItem(menuId: string, item: { title: string; url?: string; icon?: string; parent_id?: string; sort_order?: number; target?: string; css_class?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').insert({ menu_id: menuId, ...item, is_visible: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMenuItem(itemId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMenuItem(itemId: string) {
  try { const supabase = await createClient(); await supabase.from('menu_items').update({ parent_id: null }).eq('parent_id', itemId); const { error } = await supabase.from('menu_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleMenuItemVisibility(itemId: string, isVisible: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').update({ is_visible: isVisible }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderMenuItems(itemIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < itemIds.length; i++) { await supabase.from('menu_items').update({ sort_order: i }).eq('id', itemIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveMenuItem(itemId: string, parentId: string | null) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').update({ parent_id: parentId }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateMenu(menuId: string, newName: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('menus').select('*').eq('id', menuId).single(); if (origError) throw origError; const { id, created_at, updated_at, ...menuData } = original; const { data: newMenu, error } = await supabase.from('menus').insert({ ...menuData, name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') }).select().single(); if (error) throw error; const { data: items } = await supabase.from('menu_items').select('*').eq('menu_id', menuId); if (items && items.length > 0) { const idMap: Record<string, string> = {}; for (const item of items.filter(i => !i.parent_id)) { const { id: oldId, created_at: iCreated, menu_id, ...itemData } = item; const { data: newItem } = await supabase.from('menu_items').insert({ ...itemData, menu_id: newMenu.id }).select().single(); if (newItem) idMap[oldId] = newItem.id; } for (const item of items.filter(i => i.parent_id)) { const { id: oldId, created_at: iCreated, menu_id, parent_id, ...itemData } = item; await supabase.from('menu_items').insert({ ...itemData, menu_id: newMenu.id, parent_id: idMap[parent_id] || null }); } } return { success: true, data: newMenu } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
