'use server'

/**
 * Extended Reaction Server Actions - Covers all Reaction-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getReactions(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReaction(userId: string, itemId: string, itemType: string, reactionType: string) {
  try { const supabase = await createClient(); await supabase.from('reactions').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); const { data, error } = await supabase.from('reactions').insert({ user_id: userId, item_id: itemId, item_type: itemType, reaction_type: reactionType }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeReaction(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('reactions').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleReaction(userId: string, itemId: string, itemType: string, reactionType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('reactions').select('id, reaction_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { if (existing.reaction_type === reactionType) { await supabase.from('reactions').delete().eq('id', existing.id); return { success: true, reacted: false }; } const { data, error } = await supabase.from('reactions').update({ reaction_type: reactionType }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, reacted: true, data }; } const { data, error } = await supabase.from('reactions').insert({ user_id: userId, item_id: itemId, item_type: itemType, reaction_type: reactionType }).select().single(); if (error) throw error; return { success: true, reacted: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserReaction(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('reaction_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, reaction: data?.reaction_type || null } } catch (error) { return { success: false, reaction: null } }
}

export async function getReactionCounts(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('reaction_type').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1; }); return { success: true, data: counts } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function getReactionsByType(itemId: string, itemType: string, reactionType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('*').eq('item_id', itemId).eq('item_type', itemType).eq('reaction_type', reactionType).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserReactions(userId: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('reactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
