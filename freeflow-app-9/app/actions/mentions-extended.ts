'use server'

/**
 * Extended Mentions Server Actions
 * Tables: mentions, mention_notifications, mention_settings, mention_history
 */

import { createClient } from '@/lib/supabase/server'

export async function createMention(mentionData: { mentioned_user_id: string; mentioner_user_id: string; content_type: string; content_id: string; context?: string; position?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').insert({ ...mentionData, status: 'unread', created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('mention_notifications').insert({ mention_id: data.id, user_id: mentionData.mentioned_user_id, status: 'pending', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMention(mentionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').select('*').eq('id', mentionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMentions(userId: string, options?: { content_type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('mentions').select('*').eq('mentioned_user_id', userId); if (options?.content_type) query = query.eq('content_type', options.content_type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markMentionAsRead(mentionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').update({ status: 'read', read_at: new Date().toISOString() }).eq('id', mentionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllMentionsAsRead(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').update({ status: 'read', read_at: new Date().toISOString() }).eq('mentioned_user_id', userId).eq('status', 'unread').select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteMention(mentionId: string) {
  try { const supabase = await createClient(); await supabase.from('mention_notifications').delete().eq('mention_id', mentionId); const { error } = await supabase.from('mentions').delete().eq('id', mentionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMentionsByContent(contentType: string, contentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').select('*').eq('content_type', contentType).eq('content_id', contentId).order('position', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUnreadMentionCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('mentions').select('*', { count: 'exact', head: true }).eq('mentioned_user_id', userId).eq('status', 'unread'); if (error) throw error; return { success: true, data: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: 0 } }
}

export async function getMentionSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mention_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMentionSettings(userId: string, settings: Partial<{ email_notifications: boolean; push_notifications: boolean; allowed_content_types: string[]; muted_users: string[] }>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('mention_settings').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('mention_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('mention_settings').insert({ user_id: userId, ...settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchMentionableUsers(query: string, options?: { organization_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('users').select('id, name, email, avatar_url').or(`name.ilike.%${query}%,email.ilike.%${query}%`).limit(options?.limit || 10); const { data, error } = await dbQuery; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMentionHistory(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mention_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
