'use server'

/**
 * Extended Libraries Server Actions
 * Tables: libraries, library_items, library_collections, library_shares, library_favorites, library_tags
 */

import { createClient } from '@/lib/supabase/server'

export async function getLibrary(libraryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('libraries').select('*, library_collections(*)').eq('id', libraryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLibrary(libraryData: { name: string; description?: string; type?: string; owner_id: string; organization_id?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('libraries').insert({ ...libraryData, item_count: 0, is_public: libraryData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLibrary(libraryId: string, updates: Partial<{ name: string; description: string; type: string; is_public: boolean; cover_image: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('libraries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', libraryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLibrary(libraryId: string) {
  try { const supabase = await createClient(); await supabase.from('library_items').delete().eq('library_id', libraryId); await supabase.from('library_collections').delete().eq('library_id', libraryId); const { error } = await supabase.from('libraries').delete().eq('id', libraryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLibraries(userId: string, options?: { type?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('libraries').select('*').eq('owner_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLibraryItem(itemData: { library_id: string; title: string; type: string; content_url?: string; thumbnail_url?: string; metadata?: any; added_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_items').insert({ ...itemData, view_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: library } = await supabase.from('libraries').select('item_count').eq('id', itemData.library_id).single(); await supabase.from('libraries').update({ item_count: (library?.item_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', itemData.library_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLibraryItem(itemId: string, updates: Partial<{ title: string; description: string; thumbnail_url: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLibraryItem(itemId: string, libraryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('library_items').delete().eq('id', itemId); if (error) throw error; const { data: library } = await supabase.from('libraries').select('item_count').eq('id', libraryId).single(); await supabase.from('libraries').update({ item_count: Math.max(0, (library?.item_count || 1) - 1) }).eq('id', libraryId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLibraryItems(libraryId: string, options?: { type?: string; collection_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('library_items').select('*, library_tags(*)').eq('library_id', libraryId); if (options?.type) query = query.eq('type', options.type); if (options?.collection_id) query = query.eq('collection_id', options.collection_id); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCollection(collectionData: { library_id: string; name: string; description?: string; cover_image?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_collections').insert({ ...collectionData, item_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLibraryCollections(libraryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_collections').select('*').eq('library_id', libraryId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareLibrary(shareData: { library_id: string; shared_with: string; permission: string; shared_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_shares').insert({ ...shareData, shared_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSharedLibraries(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_shares').select('*, libraries(*)').eq('shared_with', userId).order('shared_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleFavorite(userId: string, itemId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('library_favorites').select('id').eq('user_id', userId).eq('item_id', itemId).single(); if (existing) { await supabase.from('library_favorites').delete().eq('id', existing.id); return { success: true, data: { favorited: false } } } else { await supabase.from('library_favorites').insert({ user_id: userId, item_id: itemId, created_at: new Date().toISOString() }); return { success: true, data: { favorited: true } } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserFavorites(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('library_favorites').select('*, library_items(*, libraries(*))').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
