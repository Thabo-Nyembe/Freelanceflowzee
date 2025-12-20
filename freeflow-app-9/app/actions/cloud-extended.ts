'use server'

/**
 * Extended Cloud Server Actions
 * Tables: cloud_providers, cloud_resources, cloud_costs, cloud_monitoring
 */

import { createClient } from '@/lib/supabase/server'

export async function getCloudProvider(providerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cloud_providers').select('*, cloud_resources(*)').eq('id', providerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCloudProvider(providerData: { user_id: string; name: string; type: string; credentials?: Record<string, any>; region?: string; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cloud_providers').insert({ ...providerData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCloudProvider(providerId: string, updates: Partial<{ name: string; credentials: Record<string, any>; region: string; config: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cloud_providers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', providerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCloudProviders(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cloud_providers').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCloudResource(resourceData: { provider_id: string; name: string; type: string; region?: string; size?: string; config?: Record<string, any>; cost_per_hour?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cloud_resources').insert({ ...resourceData, status: 'provisioning', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateResourceStatus(resourceId: string, status: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (metadata) updates.metadata = metadata; if (status === 'running') updates.started_at = new Date().toISOString(); if (status === 'stopped' || status === 'terminated') updates.stopped_at = new Date().toISOString(); const { data, error } = await supabase.from('cloud_resources').update(updates).eq('id', resourceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCloudResources(providerId: string, options?: { type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cloud_resources').select('*').eq('provider_id', providerId); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordCloudCost(costData: { provider_id: string; resource_id?: string; amount: number; currency?: string; period: string; breakdown?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cloud_costs').insert({ ...costData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCloudCosts(providerId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('cloud_costs').select('*').eq('provider_id', providerId); if (options?.date_from) query = query.gte('period', options.date_from); if (options?.date_to) query = query.lte('period', options.date_to); const { data, error } = await query.order('period', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCloudMonitoringAlert(alertData: { resource_id: string; metric: string; threshold: number; condition: string; notification_channels?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cloud_monitoring').insert({ ...alertData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
