'use server'

/**
 * Extended Subscriber Server Actions - Covers all Subscriber-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSubscribers(listId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('subscribers').select('*').eq('list_id', listId).order('subscribed_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSubscriber(subscriberId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscribers').select('*').eq('id', subscriberId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addSubscriber(listId: string, input: { email: string; first_name?: string; last_name?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscribers').insert({ list_id: listId, ...input, status: 'active', subscribed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment', { table_name: 'subscriber_lists', column_name: 'subscriber_count', row_id: listId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubscriber(subscriberId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscribers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', subscriberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribe(subscriberId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscribers').update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), unsubscribe_reason: reason }).eq('id', subscriberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resubscribe(subscriberId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscribers').update({ status: 'active', unsubscribed_at: null, unsubscribe_reason: null, resubscribed_at: new Date().toISOString() }).eq('id', subscriberId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSubscriber(subscriberId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('subscribers').delete().eq('id', subscriberId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscriberLists(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriber_lists').select('*').eq('owner_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSubscriberList(userId: string, input: { name: string; description?: string; double_opt_in?: boolean; welcome_email_template_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriber_lists').insert({ owner_id: userId, ...input, subscriber_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubscriberList(listId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriber_lists').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', listId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSubscriberList(listId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('subscriber_lists').delete().eq('id', listId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubscriberSegments(listId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriber_segments').select('*').eq('list_id', listId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSubscriberSegment(listId: string, input: { name: string; description?: string; rules: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriber_segments').insert({ list_id: listId, ...input, subscriber_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSubscriberSegment(segmentId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('subscriber_segments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', segmentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSubscriberSegment(segmentId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('subscriber_segments').delete().eq('id', segmentId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSegmentSubscribers(segmentId: string) {
  try { const supabase = await createClient(); const { data: segment, error: segmentError } = await supabase.from('subscriber_segments').select('list_id, rules').eq('id', segmentId).single(); if (segmentError) throw segmentError; const { data, error } = await supabase.from('subscribers').select('*').eq('list_id', segment.list_id).eq('status', 'active'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
