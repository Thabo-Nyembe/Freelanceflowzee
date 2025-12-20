'use server'

/**
 * Extended Notes Server Actions
 * Tables: notes, note_folders, note_tags, note_shares, note_versions, note_attachments
 */

import { createClient } from '@/lib/supabase/server'

export async function getNote(noteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notes').select('*, note_folders(*), note_tags(*), note_attachments(*)').eq('id', noteId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createNote(noteData: { title: string; content?: string; user_id: string; folder_id?: string; is_pinned?: boolean; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notes').insert({ ...noteData, is_pinned: noteData.is_pinned ?? false, is_archived: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNote(noteId: string, updates: Partial<{ title: string; content: string; folder_id: string; is_pinned: boolean; is_archived: boolean; color: string }>) {
  try { const supabase = await createClient(); const { data: currentNote } = await supabase.from('notes').select('content').eq('id', noteId).single(); if (currentNote && updates.content && currentNote.content !== updates.content) { await supabase.from('note_versions').insert({ note_id: noteId, content: currentNote.content, created_at: new Date().toISOString() }) } const { data, error } = await supabase.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', noteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteNote(noteId: string) {
  try { const supabase = await createClient(); await supabase.from('note_tags').delete().eq('note_id', noteId); await supabase.from('note_shares').delete().eq('note_id', noteId); await supabase.from('note_versions').delete().eq('note_id', noteId); await supabase.from('note_attachments').delete().eq('note_id', noteId); const { error } = await supabase.from('notes').delete().eq('id', noteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotes(userId: string, options?: { folder_id?: string; is_archived?: boolean; is_pinned?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('notes').select('*, note_folders(*), note_tags(*)').eq('user_id', userId); if (options?.folder_id) query = query.eq('folder_id', options.folder_id); if (options?.is_archived !== undefined) query = query.eq('is_archived', options.is_archived); if (options?.is_pinned !== undefined) query = query.eq('is_pinned', options.is_pinned); if (options?.search) query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`); const { data, error } = await query.order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFolder(folderData: { name: string; user_id: string; parent_id?: string; color?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('note_folders').insert({ ...folderData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFolder(folderId: string, updates: Partial<{ name: string; parent_id: string; color: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('note_folders').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', folderId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFolder(folderId: string) {
  try { const supabase = await createClient(); await supabase.from('notes').update({ folder_id: null }).eq('folder_id', folderId); const { error } = await supabase.from('note_folders').delete().eq('id', folderId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFolders(userId: string, parentId?: string | null) {
  try { const supabase = await createClient(); let query = supabase.from('note_folders').select('*').eq('user_id', userId); if (parentId !== undefined) query = parentId ? query.eq('parent_id', parentId) : query.is('parent_id', null); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTag(noteId: string, tagName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('note_tags').insert({ note_id: noteId, name: tagName, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTag(tagId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('note_tags').delete().eq('id', tagId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function shareNote(noteId: string, shareData: { shared_with_id?: string; shared_with_email?: string; permission: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('note_shares').insert({ note_id: noteId, ...shareData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unshareNote(shareId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('note_shares').delete().eq('id', shareId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVersions(noteId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('note_versions').select('*').eq('note_id', noteId).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function restoreVersion(versionId: string) {
  try { const supabase = await createClient(); const { data: version, error: vError } = await supabase.from('note_versions').select('note_id, content').eq('id', versionId).single(); if (vError) throw vError; const { data, error } = await supabase.from('notes').update({ content: version.content, updated_at: new Date().toISOString() }).eq('id', version.note_id).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addAttachment(noteId: string, attachmentData: { file_name: string; file_path: string; file_type: string; file_size: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('note_attachments').insert({ note_id: noteId, ...attachmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
