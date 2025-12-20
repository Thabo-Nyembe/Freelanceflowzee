'use server'

/**
 * Extended Audit Server Actions - Covers all 5 Audit-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAuditAlertRules(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_alert_rules').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAuditAlertRule(userId: string, input: { name: string; event_type: string; condition: any; actions: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_alert_rules').insert({ user_id: userId, ...input, is_active: input.is_active ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAuditAlertRule(ruleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_alert_rules').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleAuditAlertRule(ruleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_alert_rules').update({ is_active: isActive }).eq('id', ruleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAuditAlertRule(ruleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('audit_alert_rules').delete().eq('id', ruleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAuditEvents(filters?: { entityType?: string; entityId?: string; startDate?: string; endDate?: string }, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('audit_events').select('*').order('created_at', { ascending: false }); if (filters?.entityType) query = query.eq('entity_type', filters.entityType); if (filters?.entityId) query = query.eq('entity_id', filters.entityId); if (filters?.startDate) query = query.gte('created_at', filters.startDate); if (filters?.endDate) query = query.lte('created_at', filters.endDate); const { data, error } = await query.limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAuditEvent(input: { event_type: string; entity_type: string; entity_id: string; user_id?: string; action: string; details?: any; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_events').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAuditFindings(auditId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_findings').select('*').eq('audit_id', auditId).order('severity', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAuditFinding(auditId: string, input: { title: string; description: string; severity: string; category?: string; recommendation?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_findings').insert({ audit_id: auditId, ...input, status: 'open' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAuditFinding(findingId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_findings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', findingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveAuditFinding(findingId: string, resolution: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_findings').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() }).eq('id', findingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAuditLogs(userId?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); const { data, error } = await query.limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAuditLog(input: { user_id?: string; action: string; resource_type: string; resource_id?: string; details?: any; ip_address?: string; user_agent?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_logs').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAuditRetentionPolicies() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_retention_policies').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAuditRetentionPolicy(input: { name: string; description?: string; retention_days: number; event_types?: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_retention_policies').insert({ ...input, is_active: input.is_active ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAuditRetentionPolicy(policyId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('audit_retention_policies').update(updates).eq('id', policyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAuditRetentionPolicy(policyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('audit_retention_policies').delete().eq('id', policyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
