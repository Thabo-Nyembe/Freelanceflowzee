'use server'

/**
 * Extended Instances Server Actions
 * Tables: instances, instance_configs, instance_logs, instance_metrics, instance_snapshots, instance_scaling
 */

import { createClient } from '@/lib/supabase/server'

export async function getInstance(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').select('*, instance_configs(*), instance_metrics(*)').eq('id', instanceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInstance(instanceData: { name: string; type: string; region: string; size: string; image?: string; owner_id: string; config?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').insert({ ...instanceData, status: 'provisioning', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInstance(instanceId: string, updates: Partial<{ name: string; status: string; size: string; config: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInstance(instanceId: string) {
  try { const supabase = await createClient(); await supabase.from('instance_logs').delete().eq('instance_id', instanceId); await supabase.from('instance_metrics').delete().eq('instance_id', instanceId); await supabase.from('instance_configs').delete().eq('instance_id', instanceId); const { error } = await supabase.from('instances').delete().eq('id', instanceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstances(options?: { owner_id?: string; type?: string; status?: string; region?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('instances').select('*'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.region) query = query.eq('region', options.region); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function startInstance(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').update({ status: 'starting', updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopInstance(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').update({ status: 'stopping', updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function restartInstance(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').update({ status: 'restarting', updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInstanceConfig(instanceId: string, config: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instance_configs').upsert({ instance_id: instanceId, config, updated_at: new Date().toISOString() }, { onConflict: 'instance_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstanceLogs(instanceId: string, options?: { level?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('instance_logs').select('*').eq('instance_id', instanceId); if (options?.level) query = query.eq('level', options.level); if (options?.from_date) query = query.gte('timestamp', options.from_date); if (options?.to_date) query = query.lte('timestamp', options.to_date); const { data, error } = await query.order('timestamp', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logInstanceEvent(logData: { instance_id: string; level: string; message: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instance_logs').insert({ ...logData, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstanceMetrics(instanceId: string, options?: { from_date?: string; to_date?: string; metric_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('instance_metrics').select('*').eq('instance_id', instanceId); if (options?.metric_type) query = query.eq('metric_type', options.metric_type); if (options?.from_date) query = query.gte('timestamp', options.from_date); if (options?.to_date) query = query.lte('timestamp', options.to_date); const { data, error } = await query.order('timestamp', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createInstanceSnapshot(snapshotData: { instance_id: string; name: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instance_snapshots').insert({ ...snapshotData, status: 'creating', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstanceSnapshots(instanceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instance_snapshots').select('*').eq('instance_id', instanceId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resizeInstance(instanceId: string, newSize: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('instances').update({ size: newSize, status: 'resizing', updated_at: new Date().toISOString() }).eq('id', instanceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
