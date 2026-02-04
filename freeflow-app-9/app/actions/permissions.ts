'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { hasPermission } from '@/lib/auth/permissions'

const logger = createSimpleLogger('permissions-actions')

export async function createRole(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check - manage_team required for permission management
    if (!(await hasPermission(user.id, 'manage_team'))) {
      return actionError('Insufficient permissions to manage roles', 'FORBIDDEN')
    }

    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        ...data,
        user_id: user.id,
        created_by: user.email || 'Unknown'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(role, 'Role created successfully')
  } catch (error) {
    logger.error('Unexpected error creating role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRole(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(role, 'Role updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteRole(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check if role is deletable
    const { data: existingRole } = await supabase
      .from('roles')
      .select('is_deletable')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingRole?.is_deletable) {
      return actionError('This role cannot be deleted', 'VALIDATION_ERROR')
    }

    const { data: role, error } = await supabase
      .from('roles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to delete role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(role, 'Role deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createPermission(data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: permission, error } = await supabase
      .from('permissions')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create permission', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(permission, 'Permission created successfully')
  } catch (error) {
    logger.error('Unexpected error creating permission', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePermission(id: string, data: any): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update permission', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(permission, 'Permission updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating permission', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function assignRole(roleId: string, assignedUserId: string, assignedUserEmail: string, options?: {
  validUntil?: string
  isTemporary?: boolean
  reason?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to assign role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update role user count
    await supabase.rpc('increment_role_user_count', { role_id: roleId })

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(assignment, 'Role assigned successfully')
  } catch (error) {
    logger.error('Unexpected error assigning role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function revokeRole(assignmentId: string, reason: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to revoke role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update role user count
    if (assignment.role_id) {
      await supabase.rpc('decrement_role_user_count', { role_id: assignment.role_id })
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(assignment, 'Role revoked successfully')
  } catch (error) {
    logger.error('Unexpected error revoking role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addPermissionToRole(roleId: string, permissionKey: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current permissions
    const { data: role } = await supabase
      .from('roles')
      .select('permissions')
      .eq('id', roleId)
      .eq('user_id', user.id)
      .single()

    if (!role) {
      return actionError('Role not found', 'NOT_FOUND')
    }

    const currentPermissions = role.permissions || []
    if (currentPermissions.includes(permissionKey)) {
      return actionSuccess(role, 'Permission already exists in role')
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

    if (error) {
      logger.error('Failed to add permission to role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(updatedRole, 'Permission added to role successfully')
  } catch (error) {
    logger.error('Unexpected error adding permission to role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function removePermissionFromRole(roleId: string, permissionKey: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current permissions
    const { data: role } = await supabase
      .from('roles')
      .select('permissions')
      .eq('id', roleId)
      .eq('user_id', user.id)
      .single()

    if (!role) {
      return actionError('Role not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to remove permission from role', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/permissions-v2')
    return actionSuccess(updatedRole, 'Permission removed from role successfully')
  } catch (error) {
    logger.error('Unexpected error removing permission from role', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getPermissionStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

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

    const stats = {
      totalRoles: rolesResult.data?.length || 0,
      totalPermissions: permissionsResult.data?.length || 0,
      activeAssignments: assignmentsResult.data?.filter(a => a.status === 'active').length || 0,
      systemRoles: rolesResult.data?.filter(r => r.role_level === 'system').length || 0,
      adminRoles: rolesResult.data?.filter(r => r.role_level === 'admin').length || 0
    }

    return actionSuccess(stats, 'Permission stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting permission stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
