'use server'

/**
 * Extended Roles Server Actions
 * Tables: roles, role_permissions, role_assignments, role_hierarchies, role_templates, role_groups
 */

import { createClient } from '@/lib/supabase/server'

export async function getRole(roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').select('*, role_permissions(*), role_groups(*)').eq('id', roleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRole(roleData: { name: string; description?: string; group_id?: string; is_system?: boolean; is_active?: boolean; permissions?: string[]; metadata?: any }) {
  try { const supabase = await createClient(); const { permissions, ...roleInfo } = roleData; const { data: role, error: roleError } = await supabase.from('roles').insert({ ...roleInfo, created_at: new Date().toISOString() }).select().single(); if (roleError) throw roleError; if (permissions && permissions.length > 0) { const permData = permissions.map(p => ({ role_id: role.id, permission_id: p, created_at: new Date().toISOString() })); await supabase.from('role_permissions').insert(permData) } return { success: true, data: role } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRole(roleId: string, updates: Partial<{ name: string; description: string; group_id: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRole(roleId: string) {
  try { const supabase = await createClient(); const { data: role } = await supabase.from('roles').select('is_system').eq('id', roleId).single(); if (role?.is_system) return { success: false, error: 'Cannot delete system role' }; await supabase.from('role_permissions').delete().eq('role_id', roleId); await supabase.from('role_assignments').delete().eq('role_id', roleId); const { error } = await supabase.from('roles').delete().eq('id', roleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoles(options?: { group_id?: string; is_active?: boolean; is_system?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('roles').select('*, role_permissions(count), role_assignments(count), role_groups(*)'); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_system !== undefined) query = query.eq('is_system', options.is_system); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignRole(userId: string, roleId: string, assignedBy: string, expiresAt?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('role_assignments').select('id').eq('user_id', userId).eq('role_id', roleId).single(); if (existing) return { success: false, error: 'Role already assigned' }; const { data, error } = await supabase.from('role_assignments').insert({ user_id: userId, role_id: roleId, assigned_by: assignedBy, assigned_at: new Date().toISOString(), expires_at: expiresAt, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeRole(userId: string, roleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('role_assignments').delete().eq('user_id', userId).eq('role_id', roleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserRoles(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('role_assignments').select('*, roles(*, role_permissions(*))').eq('user_id', userId).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRoleUsers(roleId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('role_assignments').select('*, users(*)').eq('role_id', roleId).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateRolePermissions(roleId: string, permissions: string[]) {
  try { const supabase = await createClient(); await supabase.from('role_permissions').delete().eq('role_id', roleId); if (permissions.length > 0) { const permData = permissions.map(p => ({ role_id: roleId, permission_id: p, created_at: new Date().toISOString() })); await supabase.from('role_permissions').insert(permData) } await supabase.from('roles').update({ updated_at: new Date().toISOString() }).eq('id', roleId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRolePermissions(roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('role_permissions').select('*, permissions(*)').eq('role_id', roleId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function hasPermission(userId: string, permissionCode: string) {
  try { const supabase = await createClient(); const { data: assignments } = await supabase.from('role_assignments').select('role_id').eq('user_id', userId).or('expires_at.is.null,expires_at.gt.' + new Date().toISOString()); if (!assignments || assignments.length === 0) return { success: true, data: false }; const roleIds = assignments.map(a => a.role_id); const { data: permissions } = await supabase.from('role_permissions').select('permissions(code)').in('role_id', roleIds); const hasPerm = permissions?.some(p => p.permissions?.code === permissionCode); return { success: true, data: hasPerm } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoleGroups(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('role_groups').select('*, roles(count)'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRoleTemplates(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('role_templates').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRoleFromTemplate(templateId: string, name: string, description?: string) {
  try { const supabase = await createClient(); const { data: template } = await supabase.from('role_templates').select('*').eq('id', templateId).single(); if (!template) return { success: false, error: 'Template not found' }; const { data: role, error } = await supabase.from('roles').insert({ name, description: description || template.description, permissions: template.default_permissions, metadata: template.metadata, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (template.default_permissions && template.default_permissions.length > 0) { const permData = template.default_permissions.map((p: string) => ({ role_id: role.id, permission_id: p, created_at: new Date().toISOString() })); await supabase.from('role_permissions').insert(permData) } return { success: true, data: role } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

