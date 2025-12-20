'use server'

/**
 * Extended Severity Server Actions - Covers all Severity-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSeverity(severityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('severities').select('*').eq('id', severityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSeverity(severityData: { name: string; level: number; color?: string; icon?: string; description?: string; response_time_hours?: number; escalation_after_hours?: number; is_critical?: boolean; entity_type?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('severities').insert({ ...severityData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSeverity(severityId: string, updates: Partial<{ name: string; level: number; color: string; icon: string; description: string; response_time_hours: number; escalation_after_hours: number; is_critical: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('severities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', severityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSeverity(severityId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('severities').delete().eq('id', severityId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSeverities(options?: { entityType?: string; workspaceId?: string; isCritical?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('severities').select('*'); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); if (options?.isCritical !== undefined) query = query.eq('is_critical', options.isCritical); const { data, error } = await query.order('level', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCriticalSeverities(entityType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('severities').select('*').eq('is_critical', true); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query.order('level', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setEntitySeverity(entityType: string, entityId: string, severityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_severities').upsert({ entity_type: entityType, entity_id: entityId, severity_id: severityId, updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEntitySeverity(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('entity_severities').select('severity_id, severities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.severities || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEntitiesBySeverity(severityId: string, entityType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('entity_severities').select('entity_id, entity_type').eq('severity_id', severityId); if (entityType) query = query.eq('entity_type', entityType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkSLABreach(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data: entitySeverity } = await supabase.from('entity_severities').select('severity_id, created_at, severities(response_time_hours)').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (!entitySeverity || !entitySeverity.severities) return { success: true, breached: false }; const responseTimeHours = (entitySeverity.severities as any).response_time_hours; if (!responseTimeHours) return { success: true, breached: false }; const createdAt = new Date(entitySeverity.created_at); const deadline = new Date(createdAt.getTime() + responseTimeHours * 60 * 60 * 1000); const now = new Date(); return { success: true, breached: now > deadline, deadline: deadline.toISOString(), hoursRemaining: Math.max(0, (deadline.getTime() - now.getTime()) / (60 * 60 * 1000)) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', breached: false } }
}
