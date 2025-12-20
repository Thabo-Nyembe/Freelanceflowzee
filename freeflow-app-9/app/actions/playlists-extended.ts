'use server'

/**
 * Extended Playlists Server Actions
 * Tables: playlists, playlist_items, playlist_shares, playlist_collaborators, playlist_followers, playlist_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPlaylist(playlistId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('playlists').select('*, playlist_items(*, media(*)), playlist_collaborators(*, users(*))').eq('id', playlistId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPlaylist(playlistData: { name: string; description?: string; owner_id: string; visibility?: string; cover_image_url?: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('playlists').insert({ ...playlistData, visibility: playlistData.visibility || 'private', item_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlaylist(playlistId: string, updates: Partial<{ name: string; description: string; visibility: string; cover_image_url: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('playlists').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', playlistId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePlaylist(playlistId: string) {
  try { const supabase = await createClient(); await supabase.from('playlist_items').delete().eq('playlist_id', playlistId); await supabase.from('playlist_shares').delete().eq('playlist_id', playlistId); await supabase.from('playlist_collaborators').delete().eq('playlist_id', playlistId); await supabase.from('playlist_followers').delete().eq('playlist_id', playlistId); const { error } = await supabase.from('playlists').delete().eq('id', playlistId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlaylists(options?: { owner_id?: string; visibility?: string; type?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('playlists').select('*, playlist_items(count)'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.visibility) query = query.eq('visibility', options.visibility); if (options?.type) query = query.eq('type', options.type); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addItem(playlistId: string, itemData: { media_id: string; position?: number; added_by?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data: playlist } = await supabase.from('playlists').select('item_count').eq('id', playlistId).single(); const position = itemData.position ?? ((playlist?.item_count || 0) + 1); const { data, error } = await supabase.from('playlist_items').insert({ playlist_id: playlistId, ...itemData, position, added_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('playlists').update({ item_count: (playlist?.item_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', playlistId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeItem(itemId: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('playlist_items').select('playlist_id').eq('id', itemId).single(); const { error } = await supabase.from('playlist_items').delete().eq('id', itemId); if (error) throw error; if (item) { const { data: count } = await supabase.from('playlist_items').select('id', { count: 'exact' }).eq('playlist_id', item.playlist_id); await supabase.from('playlists').update({ item_count: count?.length || 0, updated_at: new Date().toISOString() }).eq('id', item.playlist_id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderItems(playlistId: string, itemOrders: { id: string; position: number }[]) {
  try { const supabase = await createClient(); for (const item of itemOrders) { await supabase.from('playlist_items').update({ position: item.position }).eq('id', item.id) } await supabase.from('playlists').update({ updated_at: new Date().toISOString() }).eq('id', playlistId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getItems(playlistId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('playlist_items').select('*, media(*)').eq('playlist_id', playlistId).order('position', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sharePlaylist(playlistId: string, shareData: { shared_with_id?: string; shared_email?: string; permission?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const shareCode = crypto.randomUUID().slice(0, 8); const { data, error } = await supabase.from('playlist_shares').insert({ playlist_id: playlistId, ...shareData, share_code: shareCode, permission: shareData.permission || 'view', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeShare(shareId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('playlist_shares').delete().eq('id', shareId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCollaborator(playlistId: string, collaboratorData: { user_id: string; role?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('playlist_collaborators').insert({ playlist_id: playlistId, ...collaboratorData, role: collaboratorData.role || 'editor', added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCollaborator(collaboratorId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('playlist_collaborators').delete().eq('id', collaboratorId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function followPlaylist(playlistId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('playlist_followers').insert({ playlist_id: playlistId, user_id: userId, followed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('playlists').update({ follower_count: supabase.sql`follower_count + 1` }).eq('id', playlistId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unfollowPlaylist(playlistId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('playlist_followers').delete().eq('playlist_id', playlistId).eq('user_id', userId); if (error) throw error; await supabase.from('playlists').update({ follower_count: supabase.sql`GREATEST(follower_count - 1, 0)` }).eq('id', playlistId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordPlay(playlistId: string, userId?: string) {
  try { const supabase = await createClient(); await supabase.from('playlists').update({ play_count: supabase.sql`play_count + 1`, last_played_at: new Date().toISOString() }).eq('id', playlistId); await supabase.from('playlist_analytics').insert({ playlist_id: playlistId, user_id: userId, action: 'play', recorded_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
