'use server'

/**
 * Extended Code Server Actions - Covers all 7 Code-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCodeAnalysis(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_analysis').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function runCodeAnalysis(projectId: string, input: { type: string; files?: string[]; options?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_analysis').insert({ project_id: projectId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCodeAnalysisStatus(analysisId: string, status: string, results?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_analysis').update({ status, results, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', analysisId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeCompletions(userId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_completions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logCodeCompletion(userId: string, input: { prompt: string; completion: string; language?: string; accepted?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_completions').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeExports(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_exports').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCodeExport(userId: string, input: { name: string; format: string; content: any; project_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_exports').insert({ user_id: userId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCodeExportStatus(exportId: string, status: string, fileUrl?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_exports').update({ status, file_url: fileUrl, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', exportId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeSnippets(userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('code_snippets').select('*').order('created_at', { ascending: false }); if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCodeSnippet(userId: string, input: { title: string; code: string; language: string; description?: string; is_public?: boolean; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_snippets').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCodeSnippet(snippetId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_snippets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', snippetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCodeSnippet(snippetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('code_snippets').delete().eq('id', snippetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeSuggestions(fileId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_suggestions').select('*').eq('file_id', fileId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCodeSuggestion(fileId: string, input: { line_number: number; suggestion: string; type: string; severity?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_suggestions').insert({ file_id: fileId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCodeSuggestionStatus(suggestionId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_suggestions').update({ status }).eq('id', suggestionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeTemplates(language?: string) {
  try { const supabase = await createClient(); let query = supabase.from('code_templates').select('*').order('name', { ascending: true }); if (language) query = query.eq('language', language); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCodeTemplate(userId: string, input: { name: string; code: string; language: string; description?: string; category?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_templates').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCodeTemplate(templateId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_templates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', templateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCodeTemplate(templateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('code_templates').delete().eq('id', templateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeVersions(snippetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_versions').select('*').eq('snippet_id', snippetId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCodeVersion(snippetId: string, userId: string, input: { version_number: number; code: string; changelog?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_versions').insert({ snippet_id: snippetId, created_by: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreCodeVersion(versionId: string, snippetId: string) {
  try { const supabase = await createClient(); const { data: version, error: versionError } = await supabase.from('code_versions').select('code').eq('id', versionId).single(); if (versionError) throw versionError; const { data, error } = await supabase.from('code_snippets').update({ code: version.code, updated_at: new Date().toISOString() }).eq('id', snippetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
