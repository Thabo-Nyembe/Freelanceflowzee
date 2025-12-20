'use server'

/**
 * Extended Board Server Actions
 * Tables: boards, board_columns, board_cards, board_members
 */

import { createClient } from '@/lib/supabase/server'

export async function getBoard(boardId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('boards').select('*, board_columns(*, board_cards(*))').eq('id', boardId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBoard(boardData: { user_id: string; name: string; description?: string; type?: string; is_public?: boolean; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('boards').insert({ ...boardData, is_public: boardData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBoard(boardId: string, updates: Partial<{ name: string; description: string; type: string; is_public: boolean; settings: Record<string, any>; is_archived: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('boards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', boardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteBoard(boardId: string) {
  try { const supabase = await createClient(); await supabase.from('board_cards').delete().eq('board_id', boardId); await supabase.from('board_columns').delete().eq('board_id', boardId); await supabase.from('board_members').delete().eq('board_id', boardId); const { error } = await supabase.from('boards').delete().eq('id', boardId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBoards(options?: { user_id?: string; type?: string; is_archived?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('boards').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.is_archived !== undefined) query = query.eq('is_archived', options.is_archived); const { data, error } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createBoardColumn(columnData: { board_id: string; name: string; position?: number; color?: string; limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('board_columns').insert({ ...columnData, position: columnData.position || 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBoardColumn(columnId: string, updates: Partial<{ name: string; position: number; color: string; limit: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('board_columns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', columnId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBoardCard(cardData: { board_id: string; column_id: string; title: string; description?: string; position?: number; assignee_id?: string; due_date?: string; labels?: string[]; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('board_cards').insert({ ...cardData, position: cardData.position || 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBoardCard(cardId: string, updates: Partial<{ title: string; description: string; column_id: string; position: number; assignee_id: string; due_date: string; labels: string[]; priority: string; is_completed: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('board_cards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', cardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function moveCard(cardId: string, columnId: string, position: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('board_cards').update({ column_id: columnId, position, updated_at: new Date().toISOString() }).eq('id', cardId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addBoardMember(boardId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('board_members').insert({ board_id: boardId, user_id: userId, role: role || 'member', joined_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
