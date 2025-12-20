'use server'

/**
 * Extended Platforms Server Actions
 * Tables: platforms, platform_connections, platform_credentials, platform_sync_logs, platform_mappings, platform_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getPlatform(platformId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platforms').select('*').eq('id', platformId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPlatform(platformData: { name: string; slug: string; type: string; description?: string; api_base_url?: string; auth_type?: string; icon_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platforms').insert({ ...platformData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlatform(platformId: string, updates: Partial<{ name: string; description: string; api_base_url: string; is_active: boolean; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platforms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', platformId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlatforms(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('platforms').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createConnection(connectionData: { platform_id: string; user_id?: string; organization_id?: string; name?: string; credentials_id?: string; settings?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_connections').insert({ ...connectionData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateConnection(connectionId: string, updates: Partial<{ name: string; status: string; settings: any; last_sync_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_connections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', connectionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteConnection(connectionId: string) {
  try { const supabase = await createClient(); const { data: connection } = await supabase.from('platform_connections').select('credentials_id').eq('id', connectionId).single(); await supabase.from('platform_sync_logs').delete().eq('connection_id', connectionId); await supabase.from('platform_mappings').delete().eq('connection_id', connectionId); if (connection?.credentials_id) { await supabase.from('platform_credentials').delete().eq('id', connection.credentials_id) } const { error } = await supabase.from('platform_connections').delete().eq('id', connectionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConnections(options?: { platform_id?: string; user_id?: string; organization_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('platform_connections').select('*, platforms(*)'); if (options?.platform_id) query = query.eq('platform_id', options.platform_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function storeCredentials(credentialsData: { connection_id?: string; platform_id: string; user_id?: string; access_token?: string; refresh_token?: string; token_expires_at?: string; api_key?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_credentials').insert({ ...credentialsData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (credentialsData.connection_id) { await supabase.from('platform_connections').update({ credentials_id: data.id, status: 'active', updated_at: new Date().toISOString() }).eq('id', credentialsData.connection_id) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function refreshCredentials(credentialsId: string, newTokens: { access_token: string; refresh_token?: string; token_expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_credentials').update({ ...newTokens, updated_at: new Date().toISOString() }).eq('id', credentialsId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logSync(logData: { connection_id: string; sync_type: string; status: string; records_synced?: number; error_message?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_sync_logs').insert({ ...logData, started_at: new Date().toISOString() }).select().single(); if (error) throw error; if (logData.status === 'completed' || logData.status === 'failed') { await supabase.from('platform_connections').update({ last_sync_at: new Date().toISOString(), last_sync_status: logData.status }).eq('id', logData.connection_id) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSyncLogs(connectionId: string, options?: { status?: string; sync_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('platform_sync_logs').select('*').eq('connection_id', connectionId); if (options?.status) query = query.eq('status', options.status); if (options?.sync_type) query = query.eq('sync_type', options.sync_type); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMapping(mappingData: { connection_id: string; local_entity: string; local_field: string; remote_entity: string; remote_field: string; transform?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_mappings').insert({ ...mappingData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMappings(connectionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_mappings').select('*').eq('connection_id', connectionId).eq('is_active', true).order('local_entity', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(connectionId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('platform_settings').select('id').eq('connection_id', connectionId).single(); if (existing) { const { data, error } = await supabase.from('platform_settings').update({ settings, updated_at: new Date().toISOString() }).eq('connection_id', connectionId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('platform_settings').insert({ connection_id: connectionId, settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
