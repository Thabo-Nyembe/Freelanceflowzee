'use server'

/**
 * Extended Docs Server Actions
 * Tables: docs, doc_pages, doc_versions, doc_contributors, doc_feedback
 */

import { createClient } from '@/lib/supabase/server'

export async function getDoc(docId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('docs').select('*, doc_pages(*), doc_contributors(*)').eq('id', docId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDoc(docData: { title: string; description?: string; project_id?: string; type?: string; is_public?: boolean; owner_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('docs').insert({ ...docData, status: 'draft', version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDoc(docId: string, updates: Partial<{ title: string; description: string; status: string; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('docs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', docId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDoc(docId: string) {
  try { const supabase = await createClient(); await supabase.from('doc_pages').delete().eq('doc_id', docId); await supabase.from('doc_versions').delete().eq('doc_id', docId); await supabase.from('doc_contributors').delete().eq('doc_id', docId); const { error } = await supabase.from('docs').delete().eq('id', docId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocs(options?: { project_id?: string; type?: string; status?: string; is_public?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('docs').select('*'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDocPage(pageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('doc_pages').select('*').eq('id', pageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDocPage(pageData: { doc_id: string; title: string; content?: string; slug?: string; parent_id?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('doc_pages').insert({ ...pageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocPage(pageId: string, updates: Partial<{ title: string; content: string; slug: string; order: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('doc_pages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocPages(docId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('doc_pages').select('*').eq('doc_id', docId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveDocVersion(docId: string, versionData: { content: any; description?: string; created_by: string }) {
  try { const supabase = await createClient(); const { data: doc } = await supabase.from('docs').select('version').eq('id', docId).single(); const newVersion = (doc?.version || 0) + 1; const { data, error } = await supabase.from('doc_versions').insert({ doc_id: docId, version: newVersion, content: versionData.content, description: versionData.description, created_by: versionData.created_by, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('docs').update({ version: newVersion, updated_at: new Date().toISOString() }).eq('id', docId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addDocContributor(docId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('doc_contributors').insert({ doc_id: docId, user_id: userId, role: role || 'editor', added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addDocFeedback(feedbackData: { doc_id: string; page_id?: string; user_id?: string; type: string; content: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('doc_feedback').insert({ ...feedbackData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
