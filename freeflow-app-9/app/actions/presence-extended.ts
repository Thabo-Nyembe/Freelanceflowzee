'use server'

/**
 * Extended Presence Server Actions
 * Tables: presence, presence_sessions, presence_channels, presence_subscriptions, presence_history, presence_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getPresence(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presence').select('*, presence_sessions(*), presence_settings(*)').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePresence(userId: string, status: string, statusMessage?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('presence').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('presence').update({ status, status_message: statusMessage, last_seen: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; await supabase.from('presence_history').insert({ user_id: userId, status, status_message: statusMessage, started_at: new Date().toISOString() }); return { success: true, data } } const { data, error } = await supabase.from('presence').insert({ user_id: userId, status, status_message: statusMessage, last_seen: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setOnline(userId: string, deviceInfo?: { device_type?: string; ip_address?: string; user_agent?: string }) {
  try { const supabase = await createClient(); await supabase.from('presence').upsert({ user_id: userId, status: 'online', last_seen: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); const { data, error } = await supabase.from('presence_sessions').insert({ user_id: userId, ...deviceInfo, status: 'active', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setOffline(userId: string, sessionId?: string) {
  try { const supabase = await createClient(); await supabase.from('presence').update({ status: 'offline', last_seen: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', userId); if (sessionId) { await supabase.from('presence_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', sessionId) } else { await supabase.from('presence_sessions').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('user_id', userId).eq('status', 'active') } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function heartbeat(userId: string, sessionId?: string) {
  try { const supabase = await createClient(); await supabase.from('presence').update({ last_seen: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('user_id', userId); if (sessionId) { await supabase.from('presence_sessions').update({ last_heartbeat: new Date().toISOString() }).eq('id', sessionId) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOnlineUsers(options?: { channel_id?: string; limit?: number }) {
  try { const supabase = await createClient(); const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString(); let query = supabase.from('presence').select('*, users(*)').in('status', ['online', 'away', 'busy']).gte('last_seen', fiveMinutesAgo); const { data, error } = await query.order('last_seen', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBulkPresence(userIds: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presence').select('*').in('user_id', userIds); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function joinChannel(userId: string, channelId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('presence_subscriptions').select('id').eq('user_id', userId).eq('channel_id', channelId).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('presence_subscriptions').insert({ user_id: userId, channel_id: channelId, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('presence_channels').update({ member_count: supabase.sql`member_count + 1` }).eq('id', channelId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function leaveChannel(userId: string, channelId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('presence_subscriptions').delete().eq('user_id', userId).eq('channel_id', channelId); if (error) throw error; await supabase.from('presence_channels').update({ member_count: supabase.sql`member_count - 1` }).eq('id', channelId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChannelMembers(channelId: string) {
  try { const supabase = await createClient(); const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString(); const { data, error } = await supabase.from('presence_subscriptions').select('*, users(*), presence(*)').eq('channel_id', channelId); if (error) throw error; const activeMembers = data?.filter(m => m.presence && new Date(m.presence.last_seen) >= new Date(fiveMinutesAgo)) || []; return { success: true, data: activeMembers, total: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function createChannel(channelData: { name: string; type?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presence_channels').insert({ ...channelData, member_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPresenceHistory(userId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('presence_history').select('*').eq('user_id', userId); if (options?.from_date) query = query.gte('started_at', options.from_date); if (options?.to_date) query = query.lte('started_at', options.to_date); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(userId: string, settings: { show_online_status?: boolean; allow_tracking?: boolean; auto_away_timeout?: number; invisible_mode?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presence_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
