'use server'

/**
 * Extended Category Server Actions - Covers all Category-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCategories(parentId?: string | null, isActive?: boolean, categoryType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('categories').select('*').order('sort_order', { ascending: true }); if (parentId === null) query = query.is('parent_id', null); else if (parentId) query = query.eq('parent_id', parentId); if (isActive !== undefined) query = query.eq('is_active', isActive); if (categoryType) query = query.eq('category_type', categoryType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCategory(categoryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('categories').select('*').eq('id', categoryId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategoryBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCategory(input: { name: string; slug?: string; description?: string; parent_id?: string; category_type?: string; icon?: string; color?: string; image_url?: string; sort_order?: number }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('categories').insert({ ...input, slug, is_active: true, item_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCategory(categoryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('categories').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('categories').update({ is_active: isActive }).eq('id', categoryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCategory(categoryId: string) {
  try { const supabase = await createClient(); await supabase.from('category_items').delete().eq('category_id', categoryId); await supabase.from('categories').update({ parent_id: null }).eq('parent_id', categoryId); const { error } = await supabase.from('categories').delete().eq('id', categoryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderCategories(categoryIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < categoryIds.length; i++) { await supabase.from('categories').update({ sort_order: i }).eq('id', categoryIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategoryTree(categoryType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }); if (categoryType) query = query.eq('category_type', categoryType); const { data, error } = await query; if (error) throw error; const buildTree = (items: any[], parentId: string | null = null): any[] => { return items.filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) })); }; return { success: true, data: buildTree(data || []) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCategoryItems(categoryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('category_items').select('*').eq('category_id', categoryId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItemToCategory(categoryId: string, itemId: string, itemType: string, sortOrder?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('category_items').insert({ category_id: categoryId, item_id: itemId, item_type: itemType, sort_order: sortOrder || 0 }).select().single(); if (error) throw error; const { data: category } = await supabase.from('categories').select('item_count').eq('id', categoryId).single(); await supabase.from('categories').update({ item_count: (category?.item_count || 0) + 1 }).eq('id', categoryId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeItemFromCategory(categoryId: string, itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('category_items').delete().eq('category_id', categoryId).eq('item_id', itemId); if (error) throw error; const { data: category } = await supabase.from('categories').select('item_count').eq('id', categoryId).single(); await supabase.from('categories').update({ item_count: Math.max(0, (category?.item_count || 1) - 1) }).eq('id', categoryId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItemCategories(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('category_items').select('*, categories(*)').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
