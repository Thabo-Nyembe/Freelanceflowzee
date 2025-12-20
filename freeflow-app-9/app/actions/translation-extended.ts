'use server'

/**
 * Extended Translation Server Actions - Covers all 6 Translation-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTranslationAnalytics(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_analytics').select('*').eq('project_id', projectId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslationAnalytics(projectId: string, analytics: { total_words?: number; translated_words?: number; languages?: number; completion_rate?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_analytics').upsert({ project_id: projectId, ...analytics, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationGlossaries(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_glossaries').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTranslationGlossary(userId: string, input: { name: string; source_language: string; target_language: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_glossaries').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslationGlossary(glossaryId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_glossaries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', glossaryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTranslationGlossary(glossaryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('translation_glossaries').delete().eq('id', glossaryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationGlossaryTerms(glossaryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_glossary_terms').select('*').eq('glossary_id', glossaryId).order('term', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTranslationGlossaryTerm(glossaryId: string, input: { term: string; translation: string; definition?: string; context?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_glossary_terms').insert({ glossary_id: glossaryId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslationGlossaryTerm(termId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_glossary_terms').update(updates).eq('id', termId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTranslationGlossaryTerm(termId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('translation_glossary_terms').delete().eq('id', termId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationMemory(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_memory').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addToTranslationMemory(userId: string, input: { source_text: string; translated_text: string; source_language: string; target_language: string; context?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_memory').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchTranslationMemory(userId: string, sourceText: string, sourceLanguage: string, targetLanguage: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_memory').select('*').eq('user_id', userId).eq('source_language', sourceLanguage).eq('target_language', targetLanguage).ilike('source_text', `%${sourceText}%`).limit(10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteFromTranslationMemory(memoryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('translation_memory').delete().eq('id', memoryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationRequests(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTranslationRequest(userId: string, input: { source_text: string; source_language: string; target_languages: string[]; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_requests').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslationRequestStatus(requestId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelTranslationRequest(requestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_requests').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationResults(requestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_results').select('*').eq('request_id', requestId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTranslationResult(requestId: string, input: { target_language: string; translated_text: string; provider?: string; confidence?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_results').insert({ request_id: requestId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function approveTranslationResult(resultId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_results').update({ is_approved: true, approved_at: new Date().toISOString() }).eq('id', resultId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectTranslationResult(resultId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_results').update({ is_approved: false, rejection_reason: reason }).eq('id', resultId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
