'use server'

/**
 * Extended Mention Server Actions - Covers all Mention-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMentions(userId: string, unreadOnly = false, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('mentions').select('*').eq('mentioned_user_id', userId).order('created_at', { ascending: false }).limit(limit); if (unreadOnly) query = query.eq('is_read', false); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMention(mentionerId: string, mentionedUserId: string, itemId: string, itemType: string, context?: string) {
  try { const supabase = await createClient(); if (mentionerId === mentionedUserId) return { success: true, skipped: true }; const { data, error } = await supabase.from('mentions').insert({ mentioner_id: mentionerId, mentioned_user_id: mentionedUserId, item_id: itemId, item_type: itemType, context, is_read: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBulkMentions(mentionerId: string, mentionedUserIds: string[], itemId: string, itemType: string, context?: string) {
  try { const supabase = await createClient(); const mentions = mentionedUserIds.filter(id => id !== mentionerId).map(userId => ({ mentioner_id: mentionerId, mentioned_user_id: userId, item_id: itemId, item_type: itemType, context, is_read: false })); if (mentions.length === 0) return { success: true, data: [] }; const { data, error } = await supabase.from('mentions').insert(mentions).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markMentionRead(mentionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', mentionId).eq('mentioned_user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllMentionsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('mentions').update({ is_read: true, read_at: new Date().toISOString() }).eq('mentioned_user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMention(mentionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('mentions').delete().eq('id', mentionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadMentionCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('mentions').select('*', { count: 'exact', head: true }).eq('mentioned_user_id', userId).eq('is_read', false); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getMentionsByItem(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecentMentioners(userId: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('mentions').select('mentioner_id').eq('mentioned_user_id', userId).order('created_at', { ascending: false }).limit(100); if (error) throw error; const unique = [...new Set(data?.map(m => m.mentioner_id) || [])].slice(0, limit); return { success: true, data: unique } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
