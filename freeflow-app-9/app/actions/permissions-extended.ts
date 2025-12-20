'use server'

/**
 * Extended Permissions Server Actions
 * Tables: permissions, permission_groups, permission_assignments, permission_overrides, permission_templates, permission_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getPermission(permissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').select('*').eq('id', permissionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPermission(permissionData: { name: string; slug: string; description?: string; resource: string; action: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').insert({ ...permissionData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePermission(permissionId: string, updates: Partial<{ name: string; description: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', permissionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePermission(permissionId: string) {
  try { const supabase = await createClient(); await supabase.from('permission_assignments').delete().eq('permission_id', permissionId); await supabase.from('permission_overrides').delete().eq('permission_id', permissionId); const { error } = await supabase.from('permissions').delete().eq('id', permissionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPermissions(options?: { resource?: string; organization_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('permissions').select('*'); if (options?.resource) query = query.eq('resource', options.resource); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('resource', { ascending: true }).order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGroup(groupData: { name: string; description?: string; permissions: string[]; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_groups').insert({ ...groupData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGroup(groupId: string, updates: Partial<{ name: string; description: string; permissions: string[]; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_groups').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', groupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroups(options?: { organization_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('permission_groups').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignPermission(assignmentData: { user_id?: string; role_id?: string; group_id?: string; permission_id?: string; permission_group_id?: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_assignments').insert({ ...assignmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await logPermissionChange('assign', assignmentData); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeAssignment(assignmentId: string) {
  try { const supabase = await createClient(); const { data: assignment } = await supabase.from('permission_assignments').select('*').eq('id', assignmentId).single(); const { error } = await supabase.from('permission_assignments').delete().eq('id', assignmentId); if (error) throw error; if (assignment) await logPermissionChange('revoke', assignment); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAssignments(options?: { user_id?: string; role_id?: string; permission_id?: string; organization_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('permission_assignments').select('*, permissions(*), permission_groups(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.role_id) query = query.eq('role_id', options.role_id); if (options?.permission_id) query = query.eq('permission_id', options.permission_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setOverride(overrideData: { user_id: string; permission_id: string; allowed: boolean; resource_id?: string; expires_at?: string; reason?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('permission_overrides').select('id').eq('user_id', overrideData.user_id).eq('permission_id', overrideData.permission_id).eq('resource_id', overrideData.resource_id || null).single(); if (existing) { const { data, error } = await supabase.from('permission_overrides').update({ allowed: overrideData.allowed, expires_at: overrideData.expires_at, reason: overrideData.reason, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('permission_overrides').insert({ ...overrideData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeOverride(overrideId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('permission_overrides').delete().eq('id', overrideId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkPermission(userId: string, permissionSlug: string, resourceId?: string): Promise<{ success: boolean; allowed: boolean }> {
  try { const supabase = await createClient(); const { data: override } = await supabase.from('permission_overrides').select('allowed').eq('user_id', userId).eq('permission_id', permissionSlug).eq('resource_id', resourceId || null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).single(); if (override) return { success: true, allowed: override.allowed }; const { data: assignment } = await supabase.from('permission_assignments').select('id').eq('user_id', userId).eq('permission_id', permissionSlug).single(); return { success: true, allowed: !!assignment } } catch (error) { return { success: false, allowed: false } }
}

export async function createTemplate(templateData: { name: string; description?: string; permissions: string[]; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_templates').insert({ ...templateData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyTemplate(templateId: string, targetData: { user_id?: string; role_id?: string }) {
  try { const supabase = await createClient(); const { data: template, error: templateError } = await supabase.from('permission_templates').select('permissions').eq('id', templateId).single(); if (templateError) throw templateError; const assignments = template.permissions.map((p: string) => ({ ...targetData, permission_id: p, created_at: new Date().toISOString() })); const { data, error } = await supabase.from('permission_assignments').insert(assignments).select(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function logPermissionChange(action: string, data: any) {
  const supabase = await createClient()
  await supabase.from('permission_logs').insert({ action, data, created_at: new Date().toISOString() })
}

export async function getLogs(options?: { user_id?: string; action?: string; from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('permission_logs').select('*'); if (options?.user_id) query = query.contains('data', { user_id: options.user_id }); if (options?.action) query = query.eq('action', options.action); if (options?.from_date) query = query.gte('created_at', options.from_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
