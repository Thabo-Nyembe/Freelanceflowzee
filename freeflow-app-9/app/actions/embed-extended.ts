'use server'

/**
 * Extended Embed Server Actions - Covers all Embed-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getEmbed(embedId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('embeds').select('*').eq('id', embedId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEmbed(embedData: { name: string; embed_type: string; source_url?: string; embed_code?: string; width?: number; height?: number; allow_fullscreen?: boolean; sandbox?: string[]; metadata?: Record<string, any>; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('embeds').insert({ ...embedData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateEmbed(embedId: string, updates: Partial<{ name: string; source_url: string; embed_code: string; width: number; height: number; allow_fullscreen: boolean; sandbox: string[]; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('embeds').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', embedId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteEmbed(embedId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('embeds').delete().eq('id', embedId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEmbeds(options?: { embedType?: string; workspaceId?: string; userId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('embeds').select('*'); if (options?.embedType) query = query.eq('embed_type', options.embedType); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); if (options?.userId) query = query.eq('user_id', options.userId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function attachEmbedToEntity(embedId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_embeds').insert({ embed_id: embedId, entity_type: entityType, entity_id: entityId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function detachEmbedFromEntity(embedId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('entity_embeds').delete().eq('embed_id', embedId).eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEntityEmbeds(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_embeds').select('embed_id, embeds(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true, data: data?.map(ee => ee.embeds) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function duplicateEmbed(embedId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('embeds').select('*').eq('id', embedId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, ...embedData } = original; const { data, error } = await supabase.from('embeds').insert({ ...embedData, name: newName || `${original.name} (Copy)`, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
