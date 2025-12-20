'use server'

/**
 * Extended Polls Server Actions
 * Tables: polls, poll_options, poll_votes, poll_results, poll_comments, poll_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getPoll(pollId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').select('*, poll_options(*), poll_settings(*)').eq('id', pollId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPoll(pollData: { title: string; description?: string; creator_id: string; type?: string; visibility?: string; ends_at?: string; options: { text: string; order?: number }[]; settings?: { allow_multiple?: boolean; show_results_before_voting?: boolean; anonymous?: boolean } }) {
  try { const supabase = await createClient(); const { options, settings, ...pollInfo } = pollData; const { data: poll, error: pollError } = await supabase.from('polls').insert({ ...pollInfo, type: pollData.type || 'single', visibility: pollData.visibility || 'public', status: 'active', vote_count: 0, created_at: new Date().toISOString() }).select().single(); if (pollError) throw pollError; const optionsData = options.map((opt, idx) => ({ poll_id: poll.id, text: opt.text, order: opt.order ?? idx, vote_count: 0, created_at: new Date().toISOString() })); await supabase.from('poll_options').insert(optionsData); if (settings) { await supabase.from('poll_settings').insert({ poll_id: poll.id, ...settings, created_at: new Date().toISOString() }) } return { success: true, data: poll } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePoll(pollId: string, updates: Partial<{ title: string; description: string; ends_at: string; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pollId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closePoll(pollId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('polls').update({ status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', pollId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePoll(pollId: string) {
  try { const supabase = await createClient(); await supabase.from('poll_votes').delete().eq('poll_id', pollId); await supabase.from('poll_options').delete().eq('poll_id', pollId); await supabase.from('poll_comments').delete().eq('poll_id', pollId); await supabase.from('poll_settings').delete().eq('poll_id', pollId); const { error } = await supabase.from('polls').delete().eq('id', pollId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPolls(options?: { creator_id?: string; status?: string; visibility?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('polls').select('*, poll_options(*)'); if (options?.creator_id) query = query.eq('creator_id', options.creator_id); if (options?.status) query = query.eq('status', options.status); if (options?.visibility) query = query.eq('visibility', options.visibility); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function vote(pollId: string, userId: string, optionIds: string[]) {
  try { const supabase = await createClient(); const { data: poll } = await supabase.from('polls').select('status, type, ends_at').eq('id', pollId).single(); if (!poll || poll.status !== 'active') return { success: false, error: 'Poll is not active' }; if (poll.ends_at && new Date(poll.ends_at) < new Date()) return { success: false, error: 'Poll has ended' }; const { data: existingVote } = await supabase.from('poll_votes').select('id').eq('poll_id', pollId).eq('user_id', userId).single(); if (existingVote) return { success: false, error: 'Already voted' }; if (poll.type === 'single' && optionIds.length > 1) return { success: false, error: 'Only one option allowed' }; const votes = optionIds.map(optionId => ({ poll_id: pollId, option_id: optionId, user_id: userId, voted_at: new Date().toISOString() })); const { data, error } = await supabase.from('poll_votes').insert(votes).select(); if (error) throw error; for (const optionId of optionIds) { await supabase.from('poll_options').update({ vote_count: supabase.sql`vote_count + 1` }).eq('id', optionId) } await supabase.from('polls').update({ vote_count: supabase.sql`vote_count + 1` }).eq('id', pollId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function changeVote(pollId: string, userId: string, newOptionIds: string[]) {
  try { const supabase = await createClient(); const { data: existingVotes } = await supabase.from('poll_votes').select('option_id').eq('poll_id', pollId).eq('user_id', userId); const oldOptionIds = existingVotes?.map(v => v.option_id) || []; await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', userId); for (const optionId of oldOptionIds) { await supabase.from('poll_options').update({ vote_count: supabase.sql`GREATEST(vote_count - 1, 0)` }).eq('id', optionId) } const votes = newOptionIds.map(optionId => ({ poll_id: pollId, option_id: optionId, user_id: userId, voted_at: new Date().toISOString() })); const { data, error } = await supabase.from('poll_votes').insert(votes).select(); if (error) throw error; for (const optionId of newOptionIds) { await supabase.from('poll_options').update({ vote_count: supabase.sql`vote_count + 1` }).eq('id', optionId) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getResults(pollId: string) {
  try { const supabase = await createClient(); const { data: options, error } = await supabase.from('poll_options').select('*').eq('poll_id', pollId).order('vote_count', { ascending: false }); if (error) throw error; const { data: poll } = await supabase.from('polls').select('vote_count').eq('id', pollId).single(); const totalVotes = poll?.vote_count || 0; const results = options?.map(opt => ({ ...opt, percentage: totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0 })) || []; return { success: true, data: { options: results, totalVotes } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function hasVoted(pollId: string, userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('poll_votes').select('option_id').eq('poll_id', pollId).eq('user_id', userId); return { success: true, data: { hasVoted: (data?.length || 0) > 0, votedOptions: data?.map(v => v.option_id) || [] } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addComment(pollId: string, commentData: { user_id: string; content: string; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('poll_comments').insert({ poll_id: pollId, ...commentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComments(pollId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('poll_comments').select('*, users(*)').eq('poll_id', pollId).is('parent_id', null).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addOption(pollId: string, optionData: { text: string }) {
  try { const supabase = await createClient(); const { data: lastOption } = await supabase.from('poll_options').select('order').eq('poll_id', pollId).order('order', { ascending: false }).limit(1).single(); const { data, error } = await supabase.from('poll_options').insert({ poll_id: pollId, text: optionData.text, order: (lastOption?.order || 0) + 1, vote_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
