'use server'

/**
 * Extended Service Server Actions
 * Tables: services, service_instances, service_health, service_dependencies
 */

import { createClient } from '@/lib/supabase/server'

export async function getService(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('services').select('*').eq('id', serviceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createService(serviceData: { name: string; type?: string; description?: string; endpoint?: string; version?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('services').insert({ ...serviceData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateService(serviceId: string, updates: Partial<{ name: string; type: string; description: string; endpoint: string; status: string; version: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('services').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', serviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteService(serviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('services').delete().eq('id', serviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getServices(options?: { status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('services').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServiceInstances(serviceId: string, options?: { status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('service_instances').select('*').eq('service_id', serviceId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getServiceHealth(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('service_health').select('*').eq('service_id', serviceId).order('checked_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getServiceDependencies(serviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('service_dependencies').select('*, dependent_service:services!service_dependencies_dependent_id_fkey(*)').eq('service_id', serviceId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
