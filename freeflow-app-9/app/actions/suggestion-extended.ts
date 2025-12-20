'use server'

/**
 * Extended Suggestion Server Actions - Covers all Suggestion-related tables
 * Tables: suggestions
 */

import { createClient } from '@/lib/supabase/server'

export async function getSuggestion(suggestionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suggestions').select('*').eq('id', suggestionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSuggestion(suggestionData: { user_id: string; type: string; title?: string; description?: string; suggestion_data?: Record<string, any>; target_id?: string; target_type?: string; priority?: number; score?: number; analysis_id?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suggestions').insert({ ...suggestionData, status: 'pending', priority: suggestionData.priority || 0, score: suggestionData.score || 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSuggestion(suggestionId: string, updates: Partial<{ title: string; description: string; suggestion_data: Record<string, any>; status: string; priority: number; score: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suggestions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', suggestionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSuggestion(suggestionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('suggestions').delete().eq('id', suggestionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSuggestions(options?: { user_id?: string; type?: string; status?: string; target_id?: string; target_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('suggestions').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.target_id) query = query.eq('target_id', options.target_id); if (options?.target_type) query = query.eq('target_type', options.target_type); const { data, error } = await query.order('score', { ascending: false }).order('priority', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function acceptSuggestion(suggestionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suggestions').update({ status: 'accepted', accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', suggestionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectSuggestion(suggestionId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suggestions').update({ status: 'rejected', rejection_reason: reason, rejected_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', suggestionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissSuggestion(suggestionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('suggestions').update({ status: 'dismissed', dismissed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', suggestionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingSuggestions(userId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('status', 'pending'); if (options?.type) query = query.eq('type', options.type); const now = new Date().toISOString(); query = query.or(`expires_at.is.null,expires_at.gt.${now}`); const { data, error } = await query.order('score', { ascending: false }).order('priority', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTopSuggestions(userId: string, options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('status', 'pending'); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('score', { ascending: false }).limit(options?.limit || 5); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSuggestionsByType(userId: string, type: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('suggestions').select('*').eq('user_id', userId).eq('type', type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSuggestionStats(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('suggestions').select('type, status').eq('user_id', userId); if (!data) return { success: true, data: { total: 0, byType: {}, byStatus: {}, acceptanceRate: 0 } }; const byType = data.reduce((acc: Record<string, number>, s) => { acc[s.type || 'unknown'] = (acc[s.type || 'unknown'] || 0) + 1; return acc }, {}); const byStatus = data.reduce((acc: Record<string, number>, s) => { acc[s.status || 'unknown'] = (acc[s.status || 'unknown'] || 0) + 1; return acc }, {}); const accepted = byStatus['accepted'] || 0; const total = data.length; const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0; return { success: true, data: { total, byType, byStatus, acceptanceRate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, byType: {}, byStatus: {}, acceptanceRate: 0 } } }
}

export async function cleanupExpiredSuggestions() {
  try { const supabase = await createClient(); const { error } = await supabase.from('suggestions').update({ status: 'expired' }).lt('expires_at', new Date().toISOString()).eq('status', 'pending'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function bulkDismissSuggestions(suggestionIds: string[]) {
  try { const supabase = await createClient(); const { error } = await supabase.from('suggestions').update({ status: 'dismissed', dismissed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).in('id', suggestionIds); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRelatedSuggestions(suggestionId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data: suggestion } = await supabase.from('suggestions').select('target_id, target_type, type, user_id').eq('id', suggestionId).single(); if (!suggestion) return { success: false, error: 'Suggestion not found', data: [] }; const { data, error } = await supabase.from('suggestions').select('*').eq('user_id', suggestion.user_id).eq('type', suggestion.type).neq('id', suggestionId).eq('status', 'pending').order('score', { ascending: false }).limit(options?.limit || 5); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function refreshSuggestions(userId: string, type: string, newSuggestions: Array<{ title?: string; description?: string; suggestion_data?: Record<string, any>; target_id?: string; target_type?: string; priority?: number; score?: number }>) {
  try { const supabase = await createClient(); await supabase.from('suggestions').delete().eq('user_id', userId).eq('type', type).eq('status', 'pending'); const suggestions = newSuggestions.map(s => ({ ...s, user_id: userId, type, status: 'pending', created_at: new Date().toISOString() })); const { data, error } = await supabase.from('suggestions').insert(suggestions).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
