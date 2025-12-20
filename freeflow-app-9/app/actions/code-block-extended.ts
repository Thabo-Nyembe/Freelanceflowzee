'use server'

/**
 * Extended Code Block Server Actions - Covers all Code Block-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCodeBlock(codeBlockId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_blocks').select('*').eq('id', codeBlockId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCodeBlock(codeBlockData: { title?: string; language: string; code: string; filename?: string; line_start?: number; line_end?: number; highlights?: number[]; theme?: string; show_line_numbers?: boolean; word_wrap?: boolean; entity_type?: string; entity_id?: string; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_blocks').insert({ ...codeBlockData, show_line_numbers: codeBlockData.show_line_numbers ?? true, word_wrap: codeBlockData.word_wrap ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCodeBlock(codeBlockId: string, updates: Partial<{ title: string; code: string; filename: string; line_start: number; line_end: number; highlights: number[]; theme: string; show_line_numbers: boolean; word_wrap: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_blocks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', codeBlockId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCodeBlock(codeBlockId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('code_blocks').delete().eq('id', codeBlockId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeBlocks(options?: { language?: string; entityType?: string; entityId?: string; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('code_blocks').select('*'); if (options?.language) query = query.eq('language', options.language); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.entityId) query = query.eq('entity_id', options.entityId); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getEntityCodeBlocks(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_blocks').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCodeBlockComment(codeBlockId: string, comment: { line_number: number; content: string; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_block_comments').insert({ code_block_id: codeBlockId, ...comment, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCodeBlockComments(codeBlockId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('code_block_comments').select('*, users(id, full_name, avatar_url)').eq('code_block_id', codeBlockId).order('line_number', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteCodeBlockComment(commentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('code_block_comments').delete().eq('id', commentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateCodeBlock(codeBlockId: string, newTitle?: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('code_blocks').select('*').eq('id', codeBlockId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, ...codeBlockData } = original; const { data, error } = await supabase.from('code_blocks').insert({ ...codeBlockData, title: newTitle || (original.title ? `${original.title} (Copy)` : null), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
