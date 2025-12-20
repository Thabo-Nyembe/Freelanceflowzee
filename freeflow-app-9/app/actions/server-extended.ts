'use server'

/**
 * Extended Server Server Actions
 * Tables: servers, server_metrics, server_logs, server_configs
 */

import { createClient } from '@/lib/supabase/server'

export async function getServer(serverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('servers').select('*').eq('id', serverId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createServer(serverData: { name: string; host: string; port?: number; type?: string; region?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('servers').insert({ ...serverData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateServer(serverId: string, updates: Partial<{ name: string; host: string; port: number; status: string; type: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('servers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', serverId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteServer(serverId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('servers').delete().eq('id', serverId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getServers(options?: { status?: string; type?: string; region?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('servers').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.region) query = query.eq('region', options.region); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServerMetrics(serverId: string, options?: { metric_type?: string; hours?: number }) {
  try { const supabase = await createClient(); const since = new Date(); since.setHours(since.getHours() - (options?.hours || 24)); let query = supabase.from('server_metrics').select('*').eq('server_id', serverId).gte('created_at', since.toISOString()); if (options?.metric_type) query = query.eq('metric_type', options.metric_type); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServerLogs(serverId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('server_logs').select('*').eq('server_id', serverId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServerConfig(serverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('server_configs').select('*').eq('server_id', serverId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
