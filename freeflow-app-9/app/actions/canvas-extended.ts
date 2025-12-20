'use server'

/**
 * Extended Canvas Server Actions - Covers all 16 Canvas-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCanvasActivityLog(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_activity_log').select('*').eq('board_id', boardId).order('created_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logCanvasActivity(boardId: string, userId: string, action: string, details?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_activity_log').insert({ board_id: boardId, user_id: userId, action, details }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasArtboards(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_artboards').select('*').eq('project_id', projectId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasArtboard(projectId: string, input: { name: string; width: number; height: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_artboards').insert({ project_id: projectId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasBoards(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_boards').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasBoard(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_boards').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCanvasBoard(boardId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_boards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', boardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCanvasBoard(boardId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('canvas_boards').delete().eq('id', boardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasCollaborators(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_collaborators').select('*').eq('board_id', boardId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCanvasCollaborator(boardId: string, userId: string, role: string = 'viewer') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_collaborators').insert({ board_id: boardId, user_id: userId, role }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCanvasCollaborator(boardId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('canvas_collaborators').delete().eq('board_id', boardId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasCommentReplies(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_comment_replies').select('*').eq('comment_id', commentId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasCommentReply(commentId: string, userId: string, content: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_comment_replies').insert({ comment_id: commentId, user_id: userId, content }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasComments(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_comments').select('*').eq('board_id', boardId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasComment(boardId: string, userId: string, input: { content: string; x?: number; y?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_comments').insert({ board_id: boardId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveCanvasComment(commentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_comments').update({ is_resolved: true }).eq('id', commentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasConnectors(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_connectors').select('*').eq('board_id', boardId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasConnector(boardId: string, input: { from_element_id: string; to_element_id: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_connectors').insert({ board_id: boardId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasElements(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_elements').select('*').eq('board_id', boardId).order('z_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasElement(boardId: string, input: { type: string; x: number; y: number; width: number; height: number; data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_elements').insert({ board_id: boardId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCanvasElement(elementId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_elements').update(updates).eq('id', elementId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCanvasElement(elementId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('canvas_elements').delete().eq('id', elementId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasExports(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_exports').select('*').eq('board_id', boardId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasExport(boardId: string, format: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_exports').insert({ board_id: boardId, format, status: 'processing' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasLayers(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_layers').select('*').eq('board_id', boardId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasLayer(boardId: string, name: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_layers').insert({ board_id: boardId, name }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasPages(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_pages').select('*').eq('project_id', projectId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasPage(projectId: string, name: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_pages').insert({ project_id: projectId, name }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasProjects(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasProject(userId: string, input: { name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_projects').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasSessions(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_sessions').select('*').eq('board_id', boardId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinCanvasSession(boardId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_sessions').insert({ board_id: boardId, user_id: userId, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveCanvasSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_sessions').update({ is_active: false, left_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasStats(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_stats').select('*').eq('board_id', boardId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasTemplates() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_templates').select('*').eq('is_public', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasTemplate(userId: string, boardId: string, input: { name: string; description?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_templates').insert({ user_id: userId, board_id: boardId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCanvasVersions(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_versions').select('*').eq('board_id', boardId).order('version_number', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCanvasVersion(boardId: string, userId: string, versionNumber: number, snapshotData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('canvas_versions').insert({ board_id: boardId, created_by: userId, version_number: versionNumber, snapshot_data: snapshotData }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restoreCanvasVersion(versionId: string) {
  try { const supabase = await createClient(); const { data: version, error: versionError } = await supabase.from('canvas_versions').select('*').eq('id', versionId).single(); if (versionError) throw versionError; return { success: true, data: version } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
