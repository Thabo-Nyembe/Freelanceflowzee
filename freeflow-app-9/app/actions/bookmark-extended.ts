'use server'

/**
 * Extended Bookmark Server Actions - Covers all Bookmark-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBookmarks(userId: string, itemType?: string, folderId?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); if (folderId) query = query.eq('folder_id', folderId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBookmark(bookmarkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookmarks').select('*').eq('id', bookmarkId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBookmark(input: { user_id: string; item_id: string; item_type: string; title?: string; description?: string; url?: string; folder_id?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('bookmarks').select('id').eq('user_id', input.user_id).eq('item_id', input.item_id).eq('item_type', input.item_type).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('bookmarks').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBookmark(bookmarkId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('bookmarks').delete().eq('id', bookmarkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeBookmark(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleBookmark(userId: string, itemId: string, itemType: string, title?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { await supabase.from('bookmarks').delete().eq('id', existing.id); return { success: true, bookmarked: false }; } const { data, error } = await supabase.from('bookmarks').insert({ user_id: userId, item_id: itemId, item_type: itemType, title }).select().single(); if (error) throw error; return { success: true, bookmarked: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function isBookmarked(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('bookmarks').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); return { success: true, bookmarked: !!data } } catch (error) { return { success: false, bookmarked: false } }
}

export async function moveBookmark(bookmarkId: string, folderId: string | null) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookmarks').update({ folder_id: folderId }).eq('id', bookmarkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookmarkFolders(userId: string, parentId?: string | null) {
  try { const supabase = await createClient(); let query = supabase.from('bookmark_folders').select('*').eq('user_id', userId).order('name', { ascending: true }); if (parentId === null) query = query.is('parent_id', null); else if (parentId) query = query.eq('parent_id', parentId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBookmarkFolder(input: { user_id: string; name: string; description?: string; parent_id?: string; color?: string; icon?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookmark_folders').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBookmarkFolder(folderId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookmark_folders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', folderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBookmarkFolder(folderId: string) {
  try { const supabase = await createClient(); await supabase.from('bookmarks').update({ folder_id: null }).eq('folder_id', folderId); await supabase.from('bookmark_folders').update({ parent_id: null }).eq('parent_id', folderId); const { error } = await supabase.from('bookmark_folders').delete().eq('id', folderId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBookmarkStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('bookmarks').select('item_type').eq('user_id', userId); if (error) throw error; const stats = { total: data?.length || 0, by_type: {} as Record<string, number> }; data?.forEach(b => { stats.by_type[b.item_type] = (stats.by_type[b.item_type] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
