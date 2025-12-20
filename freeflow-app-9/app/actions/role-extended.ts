'use server'

/**
 * Extended Role Server Actions - Covers all Role-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRoles() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRole(roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').select('*').eq('id', roleId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRole(input: { name: string; description?: string; is_system?: boolean; permissions?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').insert({ ...input, is_active: true, user_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRole(roleId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', roleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleRoleActive(roleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('roles').update({ is_active: isActive }).eq('id', roleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRole(roleId: string) {
  try { const supabase = await createClient(); const { data: role, error: roleError } = await supabase.from('roles').select('is_system').eq('id', roleId).single(); if (roleError) throw roleError; if (role?.is_system) throw new Error('Cannot delete system role'); const { error } = await supabase.from('roles').delete().eq('id', roleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRolePermissions(roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('role_permissions').select('*, permissions(*)').eq('role_id', roleId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPermissionToRole(roleId: string, permissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('role_permissions').insert({ role_id: roleId, permission_id: permissionId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('role_permissions').delete().eq('role_id', roleId).eq('permission_id', permissionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setRolePermissions(roleId: string, permissionIds: string[]) {
  try { const supabase = await createClient(); await supabase.from('role_permissions').delete().eq('role_id', roleId); if (permissionIds.length > 0) { const inserts = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid })); const { error } = await supabase.from('role_permissions').insert(inserts); if (error) throw error; } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUsersByRole(roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_roles').select('*, users(*)').eq('role_id', roleId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignRoleToUser(userId: string, roleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_roles').insert({ user_id: userId, role_id: roleId }).select().single(); if (error) throw error; await supabase.from('roles').update({ user_count: supabase.rpc('increment_count', { row_id: roleId }) }).eq('id', roleId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role_id', roleId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserRoles(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_roles').select('*, roles(*)').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkUserPermission(userId: string, permissionName: string) {
  try { const supabase = await createClient(); const { data: userRoles, error: rolesError } = await supabase.from('user_roles').select('role_id').eq('user_id', userId); if (rolesError) throw rolesError; if (!userRoles?.length) return { success: true, data: { hasPermission: false } }; const roleIds = userRoles.map(ur => ur.role_id); const { data: permissions, error: permError } = await supabase.from('role_permissions').select('permissions(name)').in('role_id', roleIds); if (permError) throw permError; const hasPermission = permissions?.some(p => (p as any).permissions?.name === permissionName) || false; return { success: true, data: { hasPermission } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
