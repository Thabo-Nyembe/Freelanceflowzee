'use server'

/**
 * Extended Poll Server Actions - Covers all Poll-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPolls(userId?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('polls').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPoll(pollId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').select('*').eq('id', pollId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPoll(input: { user_id: string; question: string; description?: string; poll_type?: string; allow_multiple?: boolean; is_anonymous?: boolean; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').insert({ ...input, status: 'active', total_votes: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePoll(pollId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pollId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePoll(pollId: string) {
  try { const supabase = await createClient(); await supabase.from('poll_votes').delete().eq('poll_id', pollId); await supabase.from('poll_options').delete().eq('poll_id', pollId); const { error } = await supabase.from('polls').delete().eq('id', pollId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closePoll(pollId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', pollId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPollOptions(pollId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('poll_options').select('*').eq('poll_id', pollId).order('sort_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPollOption(pollId: string, option: { text: string; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('poll_options').insert({ poll_id: pollId, ...option, vote_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePollOption(optionId: string) {
  try { const supabase = await createClient(); await supabase.from('poll_votes').delete().eq('option_id', optionId); const { error } = await supabase.from('poll_options').delete().eq('id', optionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function vote(pollId: string, optionId: string, userId: string) {
  try { const supabase = await createClient(); const { data: poll } = await supabase.from('polls').select('allow_multiple').eq('id', pollId).single(); if (!poll?.allow_multiple) { const { data: existing } = await supabase.from('poll_votes').select('id').eq('poll_id', pollId).eq('user_id', userId).single(); if (existing) throw new Error('Already voted'); } const { data, error } = await supabase.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, user_id: userId }).select().single(); if (error) throw error; const { data: option } = await supabase.from('poll_options').select('vote_count').eq('id', optionId).single(); await supabase.from('poll_options').update({ vote_count: (option?.vote_count || 0) + 1 }).eq('id', optionId); const { data: pollData } = await supabase.from('polls').select('total_votes').eq('id', pollId).single(); await supabase.from('polls').update({ total_votes: (pollData?.total_votes || 0) + 1 }).eq('id', pollId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeVote(pollId: string, optionId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('option_id', optionId).eq('user_id', userId); if (error) throw error; const { data: option } = await supabase.from('poll_options').select('vote_count').eq('id', optionId).single(); await supabase.from('poll_options').update({ vote_count: Math.max(0, (option?.vote_count || 1) - 1) }).eq('id', optionId); const { data: poll } = await supabase.from('polls').select('total_votes').eq('id', pollId).single(); await supabase.from('polls').update({ total_votes: Math.max(0, (poll?.total_votes || 1) - 1) }).eq('id', pollId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserVote(pollId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('poll_votes').select('*').eq('poll_id', pollId).eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPollResults(pollId: string) {
  try { const supabase = await createClient(); const { data: options, error } = await supabase.from('poll_options').select('*').eq('poll_id', pollId).order('vote_count', { ascending: false }); if (error) throw error; const { data: poll } = await supabase.from('polls').select('total_votes').eq('id', pollId).single(); const total = poll?.total_votes || 0; const results = options?.map(o => ({ ...o, percentage: total > 0 ? (o.vote_count / total) * 100 : 0 })); return { success: true, data: { options: results, total_votes: total } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
