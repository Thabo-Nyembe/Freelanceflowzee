'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createRole(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: role, error } = await supabase
    .from('roles')
    .insert({
      ...data,
      user_id: user.id,
      created_by: user.email || 'Unknown'
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return role
}

export async function updateRole(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: role, error } = await supabase
    .from('roles')
    .update({
      ...data,
      updated_by: user.email || 'Unknown',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return role
}

export async function deleteRole(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if role is deletable
  const { data: existingRole } = await supabase
    .from('roles')
    .select('is_deletable')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existingRole?.is_deletable) {
    throw new Error('This role cannot be deleted')
  }

  const { data: role, error } = await supabase
    .from('roles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return role
}

export async function createPermission(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: permission, error } = await supabase
    .from('permissions')
    .insert({
      ...data,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return permission
}

export async function updatePermission(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: permission, error } = await supabase
    .from('permissions')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return permission
}

export async function assignRole(roleId: string, assignedUserId: string, assignedUserEmail: string, options?: {
  validUntil?: string
  isTemporary?: boolean
  reason?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: assignment, error } = await supabase
    .from('role_assignments')
    .insert({
      user_id: user.id,
      role_id: roleId,
      assigned_user_id: assignedUserId,
      assigned_user_email: assignedUserEmail,
      assigned_by: user.email || 'Unknown',
      assigned_by_id: user.id,
      assignment_reason: options?.reason,
      valid_until: options?.validUntil,
      is_temporary: options?.isTemporary || false,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error

  // Update role user count
  await supabase.rpc('increment_role_user_count', { role_id: roleId })

  revalidatePath('/dashboard/permissions-v2')
  return assignment
}

export async function revokeRole(assignmentId: string, reason: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: assignment, error } = await supabase
    .from('role_assignments')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: user.email || 'Unknown',
      revocation_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // Update role user count
  if (assignment.role_id) {
    await supabase.rpc('decrement_role_user_count', { role_id: assignment.role_id })
  }

  revalidatePath('/dashboard/permissions-v2')
  return assignment
}

export async function addPermissionToRole(roleId: string, permissionKey: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current permissions
  const { data: role } = await supabase
    .from('roles')
    .select('permissions')
    .eq('id', roleId)
    .eq('user_id', user.id)
    .single()

  if (!role) throw new Error('Role not found')

  const currentPermissions = role.permissions || []
  if (currentPermissions.includes(permissionKey)) {
    return role // Already has permission
  }

  const { data: updatedRole, error } = await supabase
    .from('roles')
    .update({
      permissions: [...currentPermissions, permissionKey],
      updated_by: user.email || 'Unknown',
      updated_at: new Date().toISOString()
    })
    .eq('id', roleId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return updatedRole
}

export async function removePermissionFromRole(roleId: string, permissionKey: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current permissions
  const { data: role } = await supabase
    .from('roles')
    .select('permissions')
    .eq('id', roleId)
    .eq('user_id', user.id)
    .single()

  if (!role) throw new Error('Role not found')

  const currentPermissions = role.permissions || []
  const updatedPermissions = currentPermissions.filter((p: string) => p !== permissionKey)

  const { data: updatedRole, error } = await supabase
    .from('roles')
    .update({
      permissions: updatedPermissions,
      updated_by: user.email || 'Unknown',
      updated_at: new Date().toISOString()
    })
    .eq('id', roleId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/permissions-v2')
  return updatedRole
}

export async function getPermissionStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const [rolesResult, permissionsResult, assignmentsResult] = await Promise.all([
    supabase
      .from('roles')
      .select('id, role_level')
      .eq('user_id', user.id)
      .is('deleted_at', null),
    supabase
      .from('permissions')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null),
    supabase
      .from('role_assignments')
      .select('id, status')
      .eq('user_id', user.id)
      .is('deleted_at', null)
  ])

  return {
    totalRoles: rolesResult.data?.length || 0,
    totalPermissions: permissionsResult.data?.length || 0,
    activeAssignments: assignmentsResult.data?.filter(a => a.status === 'active').length || 0,
    systemRoles: rolesResult.data?.filter(r => r.role_level === 'system').length || 0,
    adminRoles: rolesResult.data?.filter(r => r.role_level === 'admin').length || 0
  }
}
