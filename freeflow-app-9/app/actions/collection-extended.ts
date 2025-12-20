'use server'

/**
 * Extended Collection Server Actions
 * Tables: collections, collection_items, collection_shares, collection_tags
 */

import { createClient } from '@/lib/supabase/server'

export async function getCollection(collectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collections').select('*, collection_items(*), collection_tags(*)').eq('id', collectionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCollection(collectionData: { user_id: string; name: string; description?: string; type?: string; visibility?: string; cover_image?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collections').insert({ ...collectionData, visibility: collectionData.visibility || 'private', item_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCollection(collectionId: string, updates: Partial<{ name: string; description: string; visibility: string; cover_image: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', collectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCollection(collectionId: string) {
  try { const supabase = await createClient(); await supabase.from('collection_items').delete().eq('collection_id', collectionId); await supabase.from('collection_tags').delete().eq('collection_id', collectionId); await supabase.from('collection_shares').delete().eq('collection_id', collectionId); const { error } = await supabase.from('collections').delete().eq('id', collectionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCollections(options?: { user_id?: string; type?: string; visibility?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('collections').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.visibility) query = query.eq('visibility', options.visibility); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCollectionItem(itemData: { collection_id: string; item_type: string; item_id: string; position?: number; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collection_items').insert({ ...itemData, added_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('collections').update({ item_count: supabase.rpc('increment_item_count', { collection_id: itemData.collection_id }), updated_at: new Date().toISOString() }).eq('id', itemData.collection_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCollectionItem(collectionId: string, itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('collection_items').delete().eq('collection_id', collectionId).eq('item_id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCollectionItems(collectionId: string, options?: { item_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('collection_items').select('*').eq('collection_id', collectionId); if (options?.item_type) query = query.eq('item_type', options.item_type); const { data, error } = await query.order('position', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareCollection(collectionId: string, shareWithId: string, permission?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collection_shares').insert({ collection_id: collectionId, shared_with_id: shareWithId, permission: permission || 'view', shared_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCollectionTag(collectionId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collection_tags').insert({ collection_id: collectionId, tag, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
