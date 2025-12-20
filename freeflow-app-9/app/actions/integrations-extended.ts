'use server'

/**
 * Extended Integrations Server Actions
 * Tables: integrations, integration_configs, integration_logs, integration_webhooks
 */

import { createClient } from '@/lib/supabase/server'

export async function getIntegration(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integrations').select('*').eq('id', integrationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createIntegration(integrationData: { user_id: string; name: string; type: string; provider: string; config?: Record<string, any>; credentials?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integrations').insert({ ...integrationData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateIntegration(integrationId: string, updates: Partial<{ name: string; config: Record<string, any>; status: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integrations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', integrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteIntegration(integrationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('integrations').delete().eq('id', integrationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getIntegrations(options?: { user_id?: string; type?: string; provider?: string; status?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('integrations').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.provider) query = query.eq('provider', options.provider); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getIntegrationLogs(integrationId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('integration_logs').select('*').eq('integration_id', integrationId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function testIntegration(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integrations').update({ last_tested_at: new Date().toISOString() }).eq('id', integrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function syncIntegration(integrationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('integrations').update({ last_synced_at: new Date().toISOString(), status: 'syncing' }).eq('id', integrationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
