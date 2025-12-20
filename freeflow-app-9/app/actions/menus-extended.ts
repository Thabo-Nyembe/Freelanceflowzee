'use server'

/**
 * Extended Menus Server Actions
 * Tables: menus, menu_items, menu_categories, menu_modifiers, menu_prices, menu_availability
 */

import { createClient } from '@/lib/supabase/server'

export async function getMenu(menuId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menus').select('*, menu_items(*), menu_categories(*)').eq('id', menuId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMenu(menuData: { name: string; description?: string; organization_id: string; type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menus').insert({ ...menuData, type: menuData.type || 'standard', is_active: menuData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMenu(menuId: string, updates: Partial<{ name: string; description: string; type: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menus').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', menuId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMenu(menuId: string) {
  try { const supabase = await createClient(); await supabase.from('menu_items').delete().eq('menu_id', menuId); await supabase.from('menu_categories').delete().eq('menu_id', menuId); const { error } = await supabase.from('menus').delete().eq('id', menuId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMenus(organizationId: string, options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('menus').select('*').eq('organization_id', organizationId); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMenuItem(itemData: { menu_id: string; name: string; description?: string; category_id?: string; price: number; image_url?: string; is_available?: boolean; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').insert({ ...itemData, is_available: itemData.is_available ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMenuItem(itemId: string, updates: Partial<{ name: string; description: string; category_id: string; price: number; image_url: string; is_available: boolean; sort_order: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMenuItem(itemId: string) {
  try { const supabase = await createClient(); await supabase.from('menu_modifiers').delete().eq('item_id', itemId); await supabase.from('menu_prices').delete().eq('item_id', itemId); const { error } = await supabase.from('menu_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMenuItems(menuId: string, options?: { category_id?: string; is_available?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('menu_items').select('*, menu_categories(*), menu_modifiers(*), menu_prices(*)').eq('menu_id', menuId); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available); const { data, error } = await query.order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCategory(categoryData: { menu_id: string; name: string; description?: string; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_categories').insert({ ...categoryData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCategory(categoryId: string, updates: Partial<{ name: string; description: string; sort_order: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_categories').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCategory(categoryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('menu_categories').delete().eq('id', categoryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories(menuId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_categories').select('*').eq('menu_id', menuId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addModifier(modifierData: { item_id: string; name: string; price_adjustment?: number; is_required?: boolean; max_selections?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_modifiers').insert({ ...modifierData, is_required: modifierData.is_required ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setAvailability(itemId: string, availability: { day_of_week?: number[]; start_time?: string; end_time?: string; is_available: boolean }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('menu_availability').select('id').eq('item_id', itemId).single(); if (existing) { const { data, error } = await supabase.from('menu_availability').update({ ...availability, updated_at: new Date().toISOString() }).eq('item_id', itemId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('menu_availability').insert({ item_id: itemId, ...availability, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPrice(itemId: string, priceData: { price_type: string; price: number; currency?: string; start_date?: string; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('menu_prices').insert({ item_id: itemId, ...priceData, currency: priceData.currency || 'USD', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
