'use server'

/**
 * Extended Micro Server Actions
 * Tables: microservices, micro_deployments, micro_endpoints, micro_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getMicroservice(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('microservices').select('*').eq('id', serviceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMicroservice(serviceData: { name: string; description?: string; type?: string; version?: string; port?: number; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('microservices').insert({ ...serviceData, status: 'inactive', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMicroservice(serviceId: string, updates: Partial<{ name: string; description: string; version: string; port: number; config: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('microservices').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', serviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMicroservice(serviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('microservices').delete().eq('id', serviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMicroservices(options?: { type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('microservices').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMicroDeployments(serviceId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('micro_deployments').select('*').eq('service_id', serviceId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('deployed_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMicroEndpoints(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('micro_endpoints').select('*').eq('service_id', serviceId).order('path', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMicroLogs(serviceId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('micro_logs').select('*').eq('service_id', serviceId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('timestamp', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startMicroservice(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('microservices').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', serviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopMicroservice(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('microservices').update({ status: 'stopped', stopped_at: new Date().toISOString() }).eq('id', serviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
