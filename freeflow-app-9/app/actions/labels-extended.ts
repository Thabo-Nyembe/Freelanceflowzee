'use server'

/**
 * Extended Labels Server Actions
 * Tables: labels, label_assignments, label_groups, label_colors, label_rules
 */

import { createClient } from '@/lib/supabase/server'

export async function getLabel(labelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('labels').select('*, label_groups(*)').eq('id', labelId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLabel(labelData: { name: string; color?: string; description?: string; group_id?: string; organization_id?: string; created_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('labels').insert({ ...labelData, color: labelData.color || '#6B7280', usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLabel(labelId: string, updates: Partial<{ name: string; color: string; description: string; group_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('labels').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', labelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLabel(labelId: string) {
  try { const supabase = await createClient(); await supabase.from('label_assignments').delete().eq('label_id', labelId); const { error } = await supabase.from('labels').delete().eq('id', labelId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLabels(options?: { organization_id?: string; group_id?: string; search?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('labels').select('*, label_groups(*)'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignLabel(assignmentData: { label_id: string; entity_type: string; entity_id: string; assigned_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('label_assignments').insert({ ...assignmentData, assigned_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: label } = await supabase.from('labels').select('usage_count').eq('id', assignmentData.label_id).single(); await supabase.from('labels').update({ usage_count: (label?.usage_count || 0) + 1 }).eq('id', assignmentData.label_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeLabel(labelId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('label_assignments').delete().eq('label_id', labelId).eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; const { data: label } = await supabase.from('labels').select('usage_count').eq('id', labelId).single(); await supabase.from('labels').update({ usage_count: Math.max(0, (label?.usage_count || 1) - 1) }).eq('id', labelId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEntityLabels(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('label_assignments').select('*, labels(*)').eq('entity_type', entityType).eq('entity_id', entityId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLabelGroups(organizationId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('label_groups').select('*, labels(*)'); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLabelGroup(groupData: { name: string; description?: string; organization_id?: string; is_exclusive?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('label_groups').insert({ ...groupData, is_exclusive: groupData.is_exclusive ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLabelColors() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('label_colors').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPopularLabels(organizationId?: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('labels').select('*'); if (organizationId) query = query.eq('organization_id', organizationId); const { data, error } = await query.order('usage_count', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLabelRule(ruleData: { label_id: string; condition: any; auto_apply?: boolean; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('label_rules').insert({ ...ruleData, auto_apply: ruleData.auto_apply ?? true, is_enabled: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
