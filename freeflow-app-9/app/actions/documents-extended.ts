'use server'

/**
 * Extended Documents Server Actions
 * Tables: documents, document_versions, document_shares, document_signatures
 */

import { createClient } from '@/lib/supabase/server'

export async function getDocument(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documents').select('*').eq('id', documentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDocument(docData: { user_id: string; title: string; content?: string; type?: string; folder_id?: string; is_template?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documents').insert({ ...docData, status: 'draft', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocument(documentId: string, updates: Partial<{ title: string; content: string; type: string; folder_id: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('documents').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', documentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDocument(documentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('documents').delete().eq('id', documentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocuments(options?: { user_id?: string; folder_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('documents').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.folder_id) query = query.eq('folder_id', options.folder_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDocumentVersions(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_versions').select('*').eq('document_id', documentId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareDocument(documentId: string, shareData: { shared_with: string; permission: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_shares').insert({ document_id: documentId, ...shareData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentShares(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_shares').select('*').eq('document_id', documentId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function requestSignature(documentId: string, signatureData: { signer_id: string; signer_email: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_signatures').insert({ document_id: documentId, ...signatureData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
