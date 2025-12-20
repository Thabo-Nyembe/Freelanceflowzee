'use server'

/**
 * Extended Draft Server Actions - Covers all Draft-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDrafts(userId: string, entityType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('drafts').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(limit); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveDraft(userId: string, entityType: string, content: any, title?: string, entityId?: string) {
  try { const supabase = await createClient(); if (entityId) { const { data, error } = await supabase.from('drafts').upsert({ user_id: userId, entity_type: entityType, entity_id: entityId, content, title, updated_at: new Date().toISOString() }, { onConflict: 'user_id,entity_type,entity_id' }).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('drafts').insert({ user_id: userId, entity_type: entityType, content, title }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDraft(draftId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('drafts').select('*').eq('id', draftId).eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDraftByEntity(userId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('drafts').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDraft(draftId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('drafts').delete().eq('id', draftId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishDraft(draftId: string, userId: string) {
  try { const supabase = await createClient(); const { data: draft, error: fetchError } = await supabase.from('drafts').select('*').eq('id', draftId).eq('user_id', userId).single(); if (fetchError) throw fetchError; const { data, error } = await supabase.from(draft.entity_type).insert(draft.content).select().single(); if (error) throw error; await supabase.from('drafts').delete().eq('id', draftId); return { success: true, data, publishedId: data.id } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDraftCount(userId: string, entityType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('drafts').select('*', { count: 'exact', head: true }).eq('user_id', userId); if (entityType) query = query.eq('entity_type', entityType); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function autoSaveDraft(userId: string, entityType: string, entityId: string, content: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('drafts').upsert({ user_id: userId, entity_type: entityType, entity_id: entityId, content, auto_saved: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id,entity_type,entity_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
