'use server'

/**
 * Extended Vote Server Actions - Covers all Vote-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getVotes(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('votes').select('*').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function upvote(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('votes').select('id, vote_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { if (existing.vote_type === 'up') return { success: true, data: existing }; const { data, error } = await supabase.from('votes').update({ vote_type: 'up' }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('votes').insert({ user_id: userId, item_id: itemId, item_type: itemType, vote_type: 'up' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function downvote(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('votes').select('id, vote_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { if (existing.vote_type === 'down') return { success: true, data: existing }; const { data, error } = await supabase.from('votes').update({ vote_type: 'down' }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('votes').insert({ user_id: userId, item_id: itemId, item_type: itemType, vote_type: 'down' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeVote(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('votes').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleVote(userId: string, itemId: string, itemType: string, voteType: 'up' | 'down') {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('votes').select('id, vote_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { if (existing.vote_type === voteType) { await supabase.from('votes').delete().eq('id', existing.id); return { success: true, vote: null }; } const { data, error } = await supabase.from('votes').update({ vote_type: voteType }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, vote: voteType, data }; } const { data, error } = await supabase.from('votes').insert({ user_id: userId, item_id: itemId, item_type: itemType, vote_type: voteType }).select().single(); if (error) throw error; return { success: true, vote: voteType, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserVote(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('votes').select('vote_type').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, vote: data?.vote_type || null } } catch (error) { return { success: false, vote: null } }
}

export async function getVoteScore(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('votes').select('vote_type').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; const upvotes = data?.filter(v => v.vote_type === 'up').length || 0; const downvotes = data?.filter(v => v.vote_type === 'down').length || 0; return { success: true, score: upvotes - downvotes, upvotes, downvotes } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', score: 0, upvotes: 0, downvotes: 0 } }
}

export async function getTopVoted(itemType: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('votes').select('item_id, vote_type').eq('item_type', itemType); if (error) throw error; const scores: Record<string, number> = {}; data?.forEach(v => { scores[v.item_id] = (scores[v.item_id] || 0) + (v.vote_type === 'up' ? 1 : -1); }); const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([item_id, score]) => ({ item_id, score })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
