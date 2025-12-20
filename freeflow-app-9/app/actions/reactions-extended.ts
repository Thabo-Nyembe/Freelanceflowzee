'use server'

/**
 * Extended Reactions Server Actions
 * Tables: reactions, reaction_types, reaction_summaries, reaction_history, reaction_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getReaction(reactionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('*, reaction_types(*), users(*)').eq('id', reactionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addReaction(reactionData: { entity_type: string; entity_id: string; user_id: string; reaction_type: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('reactions').select('id, reaction_type').eq('entity_type', reactionData.entity_type).eq('entity_id', reactionData.entity_id).eq('user_id', reactionData.user_id).single(); if (existing) { if (existing.reaction_type === reactionData.reaction_type) { await supabase.from('reactions').delete().eq('id', existing.id); await updateSummary(reactionData.entity_type, reactionData.entity_id); return { success: true, removed: true, reaction_type: null } } await supabase.from('reactions').update({ reaction_type: reactionData.reaction_type, updated_at: new Date().toISOString() }).eq('id', existing.id); await updateSummary(reactionData.entity_type, reactionData.entity_id); return { success: true, removed: false, reaction_type: reactionData.reaction_type } } const { data, error } = await supabase.from('reactions').insert({ ...reactionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await updateSummary(reactionData.entity_type, reactionData.entity_id); return { success: true, data, removed: false, reaction_type: reactionData.reaction_type } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeReaction(entityType: string, entityId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('reactions').delete().eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId); if (error) throw error; await updateSummary(entityType, entityId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateSummary(entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: reactions } = await supabase.from('reactions').select('reaction_type').eq('entity_type', entityType).eq('entity_id', entityId)
  if (!reactions || reactions.length === 0) {
    await supabase.from('reaction_summaries').delete().eq('entity_type', entityType).eq('entity_id', entityId)
    return
  }
  const counts: { [key: string]: number } = {}
  reactions.forEach(r => { counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1 })
  await supabase.from('reaction_summaries').upsert({ entity_type: entityType, entity_id: entityId, total_reactions: reactions.length, reaction_counts: counts, updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id' })
}

export async function getReactions(options: { entity_type: string; entity_id: string; reaction_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reactions').select('*, users(*)').eq('entity_type', options.entity_type).eq('entity_id', options.entity_id); if (options.reaction_type) query = query.eq('reaction_type', options.reaction_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSummary(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reaction_summaries').select('*').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || { total_reactions: 0, reaction_counts: {} } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserReaction(entityType: string, entityId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReactionTypes(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('reaction_types').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReactionType(typeData: { name: string; emoji?: string; icon?: string; color?: string; category?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reaction_types').insert({ ...typeData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReactionType(typeId: string, updates: Partial<{ name: string; emoji: string; icon: string; color: string; order: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reaction_types').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', typeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBulkReactions(entityType: string, entityIds: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reaction_summaries').select('*').eq('entity_type', entityType).in('entity_id', entityIds); if (error) throw error; const summaryMap: { [key: string]: any } = {}; data?.forEach(s => { summaryMap[s.entity_id] = s }); return { success: true, data: summaryMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function getBulkUserReactions(entityType: string, entityIds: string[], userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('entity_id, reaction_type').eq('entity_type', entityType).in('entity_id', entityIds).eq('user_id', userId); if (error) throw error; const reactionMap: { [key: string]: string } = {}; data?.forEach(r => { reactionMap[r.entity_id] = r.reaction_type }); return { success: true, data: reactionMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function getReactors(entityType: string, entityId: string, reactionType: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reactions').select('*, users(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('reaction_type', reactionType).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data?.map(r => r.users) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getReactionHistory(userId: string, options?: { entity_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reactions').select('*').eq('user_id', userId); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMostReacted(entityType: string, options?: { reaction_type?: string; from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reaction_summaries').select('*').eq('entity_type', entityType); const { data, error } = await query.order('total_reactions', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
