'use server'

/**
 * Extended Collaboration Server Actions
 * Tables: collab_spaces, collab_documents, collab_cursors, collab_comments
 */

import { createClient } from '@/lib/supabase/server'

export async function getCollabSpace(spaceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_spaces').select('*, collab_documents(*)').eq('id', spaceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCollabSpace(spaceData: { owner_id: string; name: string; description?: string; type?: string; visibility?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_spaces').insert({ ...spaceData, visibility: spaceData.visibility || 'private', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCollabSpace(spaceId: string, updates: Partial<{ name: string; description: string; visibility: string; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_spaces').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', spaceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCollabSpaces(options?: { owner_id?: string; visibility?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('collab_spaces').select('*'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.visibility) query = query.eq('visibility', options.visibility); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCollabDocument(docData: { space_id: string; title: string; content?: string; type?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_documents').insert({ ...docData, version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCollabDocument(docId: string, updates: Partial<{ title: string; content: string }>, userId: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('collab_documents').select('version').eq('id', docId).single(); const { data, error } = await supabase.from('collab_documents').update({ ...updates, version: (current?.version || 0) + 1, last_edited_by: userId, updated_at: new Date().toISOString() }).eq('id', docId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCollabDocuments(spaceId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('collab_documents').select('*').eq('space_id', spaceId); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateCursorPosition(docId: string, userId: string, position: { x: number; y: number; selection?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_cursors').upsert({ document_id: docId, user_id: userId, position, last_seen: new Date().toISOString() }, { onConflict: 'document_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addCollabComment(commentData: { document_id: string; user_id: string; content: string; position?: Record<string, any>; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_comments').insert({ ...commentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCollabComments(docId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('collab_comments').select('*').eq('document_id', docId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
