'use server'

/**
 * Extended Document Server Actions - Covers all 7 Document-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDocumentActivity(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_activity').select('*').eq('document_id', documentId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logDocumentActivity(documentId: string, userId: string, activityType: string, metadata?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_activity').insert({ document_id: documentId, user_id: userId, activity_type: activityType, metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentComments(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_comments').select('*').eq('document_id', documentId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDocumentComment(documentId: string, userId: string, content: string, parentId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_comments').insert({ document_id: documentId, user_id: userId, content, parent_id: parentId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocumentComment(commentId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_comments').update({ content, updated_at: new Date().toISOString() }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDocumentComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('document_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentRequests(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDocumentRequest(userId: string, input: { title: string; description: string; requested_from?: string; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_requests').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocumentRequestStatus(requestId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentShares(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_shares').select('*').eq('document_id', documentId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function shareDocument(documentId: string, sharedBy: string, sharedWith: string, permission: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_shares').insert({ document_id: documentId, shared_by: sharedBy, shared_with: sharedWith, permission, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeDocumentShare(shareId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_shares').update({ is_active: false }).eq('id', shareId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentTemplates(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('document_templates').select('*').order('name', { ascending: true }); if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDocumentTemplate(userId: string, input: { name: string; description?: string; content: any; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocumentTemplate(templateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDocumentTemplate(templateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('document_templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentTranslations(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_translations').select('*').eq('document_id', documentId).order('language', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDocumentTranslation(documentId: string, input: { language: string; content: any; translated_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_translations').insert({ document_id: documentId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDocumentTranslation(translationId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_translations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', translationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDocumentVersions(documentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_versions').select('*').eq('document_id', documentId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDocumentVersion(documentId: string, userId: string, input: { version_number: number; content: any; changelog?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('document_versions').insert({ document_id: documentId, created_by: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreDocumentVersion(versionId: string, documentId: string) {
  try { const supabase = await createClient(); const { data: version, error: versionError } = await supabase.from('document_versions').select('content').eq('id', versionId).single(); if (versionError) throw versionError; const { data, error } = await supabase.from('documents').update({ content: version.content, updated_at: new Date().toISOString() }).eq('id', documentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
