'use server'

/**
 * Extended Permission Server Actions - Covers all Permission-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPermissions(category?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('permissions').select('*').order('name', { ascending: true }); if (category) query = query.eq('category', category); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPermission(permissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').select('*').eq('id', permissionId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPermissionByName(name: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').select('*').eq('name', name).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPermission(input: { name: string; description?: string; category?: string; resource?: string; actions?: string[]; is_system?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePermission(permissionId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', permissionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function togglePermissionActive(permissionId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permissions').update({ is_active: isActive }).eq('id', permissionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePermission(permissionId: string) {
  try { const supabase = await createClient(); const { data: permission, error: permError } = await supabase.from('permissions').select('is_system').eq('id', permissionId).single(); if (permError) throw permError; if (permission?.is_system) throw new Error('Cannot delete system permission'); const { error } = await supabase.from('permissions').delete().eq('id', permissionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPermissionGroups(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('permission_groups').select('*').order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPermissionGroup(groupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_groups').select('*').eq('id', groupId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPermissionGroup(input: { name: string; description?: string; permission_ids?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_groups').insert({ name: input.name, description: input.description, is_active: true }).select().single(); if (error) throw error; if (input.permission_ids?.length) { const groupPermissions = input.permission_ids.map(pid => ({ group_id: data.id, permission_id: pid })); await supabase.from('group_permissions').insert(groupPermissions); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePermissionGroup(groupId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('permission_groups').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', groupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePermissionGroup(groupId: string) {
  try { const supabase = await createClient(); await supabase.from('group_permissions').delete().eq('group_id', groupId); const { error } = await supabase.from('permission_groups').delete().eq('id', groupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroupPermissions(groupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('group_permissions').select('*, permissions(*)').eq('group_id', groupId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPermissionToGroup(groupId: string, permissionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('group_permissions').insert({ group_id: groupId, permission_id: permissionId }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removePermissionFromGroup(groupId: string, permissionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('group_permissions').delete().eq('group_id', groupId).eq('permission_id', permissionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setGroupPermissions(groupId: string, permissionIds: string[]) {
  try { const supabase = await createClient(); await supabase.from('group_permissions').delete().eq('group_id', groupId); if (permissionIds.length > 0) { const inserts = permissionIds.map(pid => ({ group_id: groupId, permission_id: pid })); const { error } = await supabase.from('group_permissions').insert(inserts); if (error) throw error; } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkPermission(userId: string, permissionName: string) {
  try { const supabase = await createClient(); const { data: userRoles, error: rolesError } = await supabase.from('user_roles').select('role_id').eq('user_id', userId); if (rolesError) throw rolesError; if (!userRoles?.length) return { success: true, data: { hasPermission: false } }; const roleIds = userRoles.map(ur => ur.role_id); const { data: rolePermissions, error: rpError } = await supabase.from('role_permissions').select('permission_id').in('role_id', roleIds); if (rpError) throw rpError; const permissionIds = rolePermissions?.map(rp => rp.permission_id) || []; const { data: permission, error: permError } = await supabase.from('permissions').select('id').eq('name', permissionName).in('id', permissionIds).single(); if (permError && permError.code !== 'PGRST116') throw permError; return { success: true, data: { hasPermission: !!permission } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
