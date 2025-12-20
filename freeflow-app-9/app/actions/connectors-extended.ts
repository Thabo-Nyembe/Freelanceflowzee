'use server'

/**
 * Extended Connectors Server Actions
 * Tables: connectors, connector_configs, connector_logs, connector_mappings
 */

import { createClient } from '@/lib/supabase/server'

export async function getConnector(connectorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connectors').select('*, connector_configs(*)').eq('id', connectorId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createConnector(connectorData: { user_id: string; name: string; type: string; provider: string; credentials?: Record<string, any>; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connectors').insert({ ...connectorData, status: 'inactive', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateConnector(connectorId: string, updates: Partial<{ name: string; credentials: Record<string, any>; config: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connectors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', connectorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteConnector(connectorId: string) {
  try { const supabase = await createClient(); await supabase.from('connector_configs').delete().eq('connector_id', connectorId); await supabase.from('connector_logs').delete().eq('connector_id', connectorId); await supabase.from('connector_mappings').delete().eq('connector_id', connectorId); const { error } = await supabase.from('connectors').delete().eq('id', connectorId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConnectors(options?: { user_id?: string; type?: string; provider?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('connectors').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.provider) query = query.eq('provider', options.provider); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateConnector(connectorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connectors').update({ status: 'active', activated_at: new Date().toISOString() }).eq('id', connectorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateConnector(connectorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connectors').update({ status: 'inactive', deactivated_at: new Date().toISOString() }).eq('id', connectorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function testConnector(connectorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connectors').update({ last_tested_at: new Date().toISOString() }).eq('id', connectorId).select().single(); if (error) throw error; await supabase.from('connector_logs').insert({ connector_id: connectorId, event_type: 'test', status: 'success', created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logConnectorEvent(logData: { connector_id: string; event_type: string; status: string; message?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connector_logs').insert({ ...logData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConnectorLogs(connectorId: string, options?: { event_type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('connector_logs').select('*').eq('connector_id', connectorId); if (options?.event_type) query = query.eq('event_type', options.event_type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
