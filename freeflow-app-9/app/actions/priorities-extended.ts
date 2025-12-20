'use server'

/**
 * Extended Priorities Server Actions
 * Tables: priorities, priority_levels, priority_rules, priority_assignments, priority_history, priority_escalations
 */

import { createClient } from '@/lib/supabase/server'

export async function getPriority(priorityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priorities').select('*, priority_levels(*), priority_rules(*), priority_assignments(*)').eq('id', priorityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPriority(priorityData: { name: string; level: number; color?: string; icon?: string; description?: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priorities').insert({ ...priorityData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePriority(priorityId: string, updates: Partial<{ name: string; level: number; color: string; icon: string; description: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priorities').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', priorityId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePriority(priorityId: string) {
  try { const supabase = await createClient(); await supabase.from('priority_assignments').delete().eq('priority_id', priorityId); await supabase.from('priority_rules').delete().eq('priority_id', priorityId); await supabase.from('priority_escalations').delete().eq('priority_id', priorityId); const { error } = await supabase.from('priorities').delete().eq('id', priorityId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPriorities(options?: { organization_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('priorities').select('*, priority_assignments(count)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('level', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLevels(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('priority_levels').select('*'); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.order('value', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLevel(levelData: { name: string; value: number; color: string; sla_hours?: number; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priority_levels').insert({ ...levelData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignPriority(assignmentData: { priority_id: string; entity_type: string; entity_id: string; assigned_by: string; reason?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('priority_assignments').select('id, priority_id').eq('entity_type', assignmentData.entity_type).eq('entity_id', assignmentData.entity_id).single(); if (existing) { await supabase.from('priority_history').insert({ entity_type: assignmentData.entity_type, entity_id: assignmentData.entity_id, old_priority_id: existing.priority_id, new_priority_id: assignmentData.priority_id, changed_by: assignmentData.assigned_by, reason: assignmentData.reason, changed_at: new Date().toISOString() }); const { data, error } = await supabase.from('priority_assignments').update({ priority_id: assignmentData.priority_id, assigned_by: assignmentData.assigned_by, assigned_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('priority_assignments').insert({ ...assignmentData, assigned_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAssignment(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priority_assignments').select('*, priorities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRule(ruleData: { priority_id: string; name: string; condition_type: string; condition_value: any; auto_assign?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priority_rules').insert({ ...ruleData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRules(priorityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priority_rules').select('*').eq('priority_id', priorityId).eq('is_active', true).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createEscalation(escalationData: { priority_id: string; escalate_to_priority_id: string; after_hours: number; notify_users?: string[]; auto_escalate?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priority_escalations').insert({ ...escalationData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHistory(entityType: string, entityId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('priority_history').select('*, old_priority:priorities!old_priority_id(*), new_priority:priorities!new_priority_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId).order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkEscalation(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data: assignment } = await supabase.from('priority_assignments').select('*, priorities(*)').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (!assignment) return { success: true, needsEscalation: false }; const { data: escalation } = await supabase.from('priority_escalations').select('*').eq('priority_id', assignment.priority_id).eq('is_active', true).eq('auto_escalate', true).single(); if (!escalation) return { success: true, needsEscalation: false }; const assignedTime = new Date(assignment.assigned_at); const hoursSinceAssigned = (Date.now() - assignedTime.getTime()) / (1000 * 60 * 60); const needsEscalation = hoursSinceAssigned >= escalation.after_hours; return { success: true, needsEscalation, escalation: needsEscalation ? escalation : null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
