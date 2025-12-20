'use server'

/**
 * Extended Realtime Server Actions
 * Tables: realtime_connections, realtime_channels, realtime_messages, realtime_presence
 */

import { createClient } from '@/lib/supabase/server'

export async function getRealtimeConnection(connectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('realtime_connections').select('*').eq('id', connectionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRealtimeConnection(connectionData: { user_id: string; channel_id?: string; device_info?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('realtime_connections').insert({ ...connectionData, status: 'connected', connected_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function disconnectRealtimeConnection(connectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('realtime_connections').update({ status: 'disconnected', disconnected_at: new Date().toISOString() }).eq('id', connectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRealtimeConnections(options?: { user_id?: string; channel_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('realtime_connections').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.channel_id) query = query.eq('channel_id', options.channel_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('connected_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRealtimeChannels(options?: { type?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('realtime_channels').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRealtimeChannel(channelData: { name: string; type?: string; config?: Record<string, any>; is_private?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('realtime_channels').insert({ ...channelData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRealtimeMessages(channelId: string, options?: { limit?: number; since?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('realtime_messages').select('*').eq('channel_id', channelId); if (options?.since) query = query.gt('created_at', options.since); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendRealtimeMessage(channelId: string, messageData: { user_id: string; content: string; type?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('realtime_messages').insert({ channel_id: channelId, ...messageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRealtimePresence(channelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('realtime_presence').select('*').eq('channel_id', channelId).eq('is_online', true).order('last_seen_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
