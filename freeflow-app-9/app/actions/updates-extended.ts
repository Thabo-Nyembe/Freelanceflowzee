'use server'

/**
 * Extended Updates Server Actions
 * Tables: updates, update_channels, update_releases, update_installations, update_rollbacks, update_notifications
 */

import { createClient } from '@/lib/supabase/server'

export async function getUpdate(updateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').select('*, update_channels(*), users(*)').eq('id', updateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUpdate(updateData: { version: string; title: string; description?: string; channel_id?: string; release_notes?: string; download_url?: string; file_size?: number; checksum?: string; min_version?: string; is_critical?: boolean; is_published?: boolean; scheduled_at?: string; created_by: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').insert({ ...updateData, is_critical: updateData.is_critical ?? false, is_published: updateData.is_published ?? false, download_count: 0, install_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUpdate(updateId: string, updates: Partial<{ version: string; title: string; description: string; channel_id: string; release_notes: string; download_url: string; file_size: number; checksum: string; min_version: string; is_critical: boolean; is_published: boolean; scheduled_at: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteUpdate(updateId: string) {
  try { const supabase = await createClient(); await supabase.from('update_installations').delete().eq('update_id', updateId); await supabase.from('update_rollbacks').delete().eq('update_id', updateId); await supabase.from('update_notifications').delete().eq('update_id', updateId); const { error } = await supabase.from('updates').delete().eq('id', updateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUpdates(options?: { channel_id?: string; is_critical?: boolean; is_published?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*, update_channels(*), update_installations(count)'); if (options?.channel_id) query = query.eq('channel_id', options.channel_id); if (options?.is_critical !== undefined) query = query.eq('is_critical', options.is_critical); if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published); if (options?.search) query = query.or(`title.ilike.%${options.search}%,version.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishUpdate(updateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').update({ is_published: true, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unpublishUpdate(updateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('updates').update({ is_published: false, updated_at: new Date().toISOString() }).eq('id', updateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createChannel(channelData: { name: string; code: string; description?: string; is_default?: boolean; is_active?: boolean; auto_update?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); if (channelData.is_default) { await supabase.from('update_channels').update({ is_default: false }).eq('is_default', true) } const { data, error } = await supabase.from('update_channels').insert({ ...channelData, is_default: channelData.is_default ?? false, is_active: channelData.is_active ?? true, auto_update: channelData.auto_update ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChannels(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('update_channels').select('*, updates(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkForUpdates(currentVersion: string, channelId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*').eq('is_published', true).gt('version', currentVersion); if (channelId) query = query.eq('channel_id', channelId); else { const { data: defaultChannel } = await supabase.from('update_channels').select('id').eq('is_default', true).single(); if (defaultChannel) query = query.eq('channel_id', defaultChannel.id) } const { data, error } = await query.order('version', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; const hasUpdate = !!data && (!data.min_version || currentVersion >= data.min_version); return { success: true, data: { available: hasUpdate, update: data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordInstallation(updateId: string, installationData: { device_id: string; device_type?: string; os_version?: string; previous_version?: string; install_method?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('update_installations').insert({ update_id: updateId, ...installationData, status: 'completed', installed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('updates').update({ install_count: supabase.rpc('increment_count', { row_id: updateId, count_column: 'install_count' }) }).eq('id', updateId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstallations(updateId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('update_installations').select('*').eq('update_id', updateId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordRollback(updateId: string, rollbackData: { device_id: string; target_version: string; reason?: string; error_details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('update_rollbacks').insert({ update_id: updateId, ...rollbackData, status: 'completed', rolled_back_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRollbacks(updateId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('update_rollbacks').select('*').eq('update_id', updateId).order('rolled_back_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createNotification(updateId: string, notificationData: { user_id?: string; device_id?: string; channel?: string; title: string; body: string; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('update_notifications').insert({ update_id: updateId, ...notificationData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markNotificationSent(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('update_notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestUpdate(channelId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('updates').select('*').eq('is_published', true); if (channelId) query = query.eq('channel_id', channelId); const { data, error } = await query.order('version', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUpdateStats(updateId: string) {
  try { const supabase = await createClient(); const [installsRes, rollbacksRes] = await Promise.all([ supabase.from('update_installations').select('status').eq('update_id', updateId), supabase.from('update_rollbacks').select('id').eq('update_id', updateId) ]); const installs = installsRes.data || []; const rollbacks = rollbacksRes.data || []; return { success: true, data: { total_installs: installs.length, successful_installs: installs.filter(i => i.status === 'completed').length, failed_installs: installs.filter(i => i.status === 'failed').length, rollbacks: rollbacks.length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
