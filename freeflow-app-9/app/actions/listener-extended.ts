'use server'

/**
 * Extended Listener Server Actions - Covers all Listener-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getListener(listenerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').select('*').eq('id', listenerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createListener(listenerData: { name: string; listener_type: string; event_pattern: string; channel?: string; filter_conditions?: Record<string, any>; handler_id?: string; callback_url?: string; priority?: number; user_id?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').insert({ ...listenerData, is_active: true, events_received: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateListener(listenerId: string, updates: Partial<{ name: string; event_pattern: string; filter_conditions: Record<string, any>; handler_id: string; callback_url: string; priority: number; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', listenerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteListener(listenerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('listeners').delete().eq('id', listenerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateListener(listenerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', listenerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateListener(listenerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', listenerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordListenerEvent(listenerId: string, eventData: { event_type: string; payload: Record<string, any>; source?: string; processed?: boolean; processing_time_ms?: number }) {
  try { const supabase = await createClient(); await supabase.from('listeners').update({ events_received: supabase.rpc('increment_listener_events', { listener_id: listenerId }), last_event_at: new Date().toISOString() }).eq('id', listenerId); await supabase.from('listener_events').insert({ listener_id: listenerId, ...eventData, received_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getListenersForChannel(channel: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').select('*').eq('channel', channel).eq('is_active', true).order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getListenersForPattern(eventPattern: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listeners').select('*').eq('is_active', true); if (error) throw error; const matching = data?.filter(l => new RegExp(l.event_pattern).test(eventPattern)) || []; return { success: true, data: matching } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserListeners(userId: string, options?: { isActive?: boolean; listenerType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('listeners').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.listenerType) query = query.eq('listener_type', options.listenerType); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getListenerEvents(listenerId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('listener_events').select('*').eq('listener_id', listenerId).order('received_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
