'use server'

/**
 * Extended Feedback Server Actions - Covers all Feedback-related tables
 * Tables: feedback, feedback_replies, feedback_votes, feedback_submissions
 */

import { createClient } from '@/lib/supabase/server'

export async function getFeedback(feedbackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback').select('*, feedback_replies(*), feedback_votes(*)').eq('id', feedbackId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFeedback(feedbackData: { user_id: string; target_type: string; target_id?: string; category?: string; title?: string; message: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; status?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback').insert({ ...feedbackData, status: feedbackData.status || 'pending', priority: feedbackData.priority || 'medium', vote_count: 0, reply_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFeedback(feedbackId: string, updates: Partial<{ title: string; message: string; category: string; priority: string; status: string; assigned_to: string; is_starred: boolean; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', feedbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFeedback(feedbackId: string) {
  try { const supabase = await createClient(); await supabase.from('feedback_votes').delete().eq('feedback_id', feedbackId); await supabase.from('feedback_replies').delete().eq('feedback_id', feedbackId); const { error } = await supabase.from('feedback').delete().eq('id', feedbackId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeedbacks(options?: { user_id?: string; target_type?: string; target_id?: string; category?: string; status?: string; priority?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('feedback').select('*, feedback_replies(count)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.target_type) query = query.eq('target_type', options.target_type); if (options?.target_id) query = query.eq('target_id', options.target_id); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFeedbackReply(replyData: { feedback_id: string; user_id: string; message: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback_replies').insert({ ...replyData, is_internal: replyData.is_internal || false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_feedback_reply_count', { fb_id: replyData.feedback_id }).catch(() => {}); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeedbackReplies(feedbackId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback_replies').select('*').eq('feedback_id', feedbackId).order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteFeedbackReply(replyId: string) {
  try { const supabase = await createClient(); const { data: reply } = await supabase.from('feedback_replies').select('feedback_id').eq('id', replyId).single(); const { error } = await supabase.from('feedback_replies').delete().eq('id', replyId); if (error) throw error; if (reply) await supabase.rpc('decrement_feedback_reply_count', { fb_id: reply.feedback_id }).catch(() => {}); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function voteFeedback(feedbackId: string, userId: string, voteType: 'up' | 'down') {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('feedback_votes').select('id, vote_type').eq('feedback_id', feedbackId).eq('user_id', userId).single(); if (existing) { if (existing.vote_type === voteType) { await supabase.from('feedback_votes').delete().eq('id', existing.id); return { success: true, action: 'removed' } } else { await supabase.from('feedback_votes').update({ vote_type: voteType, updated_at: new Date().toISOString() }).eq('id', existing.id); return { success: true, action: 'changed' } } } else { await supabase.from('feedback_votes').insert({ feedback_id: feedbackId, user_id: userId, vote_type: voteType, created_at: new Date().toISOString() }); return { success: true, action: 'added' } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeedbackVotes(feedbackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback_votes').select('*').eq('feedback_id', feedbackId); if (error) throw error; const upvotes = (data || []).filter(v => v.vote_type === 'up').length; const downvotes = (data || []).filter(v => v.vote_type === 'down').length; return { success: true, data: { upvotes, downvotes, total: upvotes - downvotes, votes: data || [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { upvotes: 0, downvotes: 0, total: 0, votes: [] } } }
}

export async function getUserVote(feedbackId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback_votes').select('vote_type').eq('feedback_id', feedbackId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.vote_type || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: null } }
}

export async function assignFeedback(feedbackId: string, assigneeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback').update({ assigned_to: assigneeId, status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', feedbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveFeedback(feedbackId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', feedbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeedbackStats(options?: { user_id?: string; target_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('feedback').select('status, priority, category'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.target_type) query = query.eq('target_type', options.target_type); const { data } = await query; if (!data) return { success: true, data: { total: 0, byStatus: {}, byPriority: {}, byCategory: {} } }; const byStatus = data.reduce((acc: Record<string, number>, f) => { acc[f.status || 'unknown'] = (acc[f.status || 'unknown'] || 0) + 1; return acc }, {}); const byPriority = data.reduce((acc: Record<string, number>, f) => { acc[f.priority || 'medium'] = (acc[f.priority || 'medium'] || 0) + 1; return acc }, {}); const byCategory = data.reduce((acc: Record<string, number>, f) => { acc[f.category || 'general'] = (acc[f.category || 'general'] || 0) + 1; return acc }, {}); return { success: true, data: { total: data.length, byStatus, byPriority, byCategory } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, byStatus: {}, byPriority: {}, byCategory: {} } } }
}

export async function getPopularFeedback(options?: { target_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('feedback').select('*').eq('status', 'pending'); if (options?.target_type) query = query.eq('target_type', options.target_type); const { data, error } = await query.order('vote_count', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchFeedback(searchTerm: string, options?: { target_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('feedback').select('*').or(`title.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`); if (options?.target_type) query = query.eq('target_type', options.target_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function starFeedback(feedbackId: string, isStarred: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feedback').update({ is_starred: isStarred, updated_at: new Date().toISOString() }).eq('id', feedbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
