'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { hasPermission } from '@/lib/auth/permissions'

const logger = createSimpleLogger('roles-actions')

// Types
interface RoleInput {
  name: string
  description?: string
  type?: 'admin' | 'manager' | 'user' | 'viewer' | 'custom'
  access_level?: 'full' | 'write' | 'read' | 'restricted'
  permissions?: string[]
  can_delegate?: boolean
  is_default?: boolean
  tags?: string[]
  metadata?: Record<string, any>
}

interface PermissionInput {
  permission_key: string
  display_name: string
  description?: string
  category?: string
}

// Create role
export async function createRole(input: RoleInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role creation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check - manage_team required for role management
    if (!(await hasPermission(user.id, 'manage_team'))) {
      logger.warn('Permission denied for role creation', { userId: user.id })
      return actionError('Insufficient permissions to manage roles', 'FORBIDDEN')
    }

    // If setting as default, unset other defaults first
    if (input.is_default) {
      await supabase
        .from('user_roles')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
    }

    const { data, error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: user.id,
        created_by: user.id,
        name: input.name,
        description: input.description,
        type: input.type || 'custom',
        status: 'active',
        access_level: input.access_level || 'read',
        permissions: input.permissions || [],
        can_delegate: input.can_delegate || false,
        is_default: input.is_default || false,
        is_system: false,
        tags: input.tags || [],
        metadata: input.metadata || {}
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create role', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role created successfully', { name: input.name })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Role created successfully')
  } catch (error) {
    logger.error('Unexpected error creating role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update role
export async function updateRole(id: string, input: Partial<RoleInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // If setting as default, unset other defaults first
    if (input.is_default) {
      await supabase
        .from('user_roles')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('id', id)
    }

    const { data, error } = await supabase
      .from('user_roles')
      .update({
        ...input,
        last_modified_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update role', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role updated successfully', { id })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Role updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete role
export async function deleteRole(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role deletion attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Check if role is system role
    const { data: role } = await supabase
      .from('user_roles')
      .select('is_system')
      .eq('id', id)
      .single()

    if (role?.is_system) {
      logger.warn('Attempted to delete system role', { id })
      return actionError('Cannot delete system roles', 'FORBIDDEN')
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete role', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role deleted successfully', { id })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess({ success: true }, 'Role deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Activate role
export async function activateRole(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role activation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_roles')
      .update({
        status: 'active',
        last_modified_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to activate role', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role activated successfully', { id })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Role activated successfully')
  } catch (error) {
    logger.error('Unexpected error activating role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Deactivate role
export async function deactivateRole(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role deactivation attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_roles')
      .update({
        status: 'inactive',
        last_modified_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to deactivate role', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role deactivated successfully', { id })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Role deactivated successfully')
  } catch (error) {
    logger.error('Unexpected error deactivating role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Set as default
export async function setDefaultRole(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized default role setting attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Unset all defaults first
    await supabase
      .from('user_roles')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('is_default', true)

    // Set new default
    const { data, error } = await supabase
      .from('user_roles')
      .update({
        is_default: true,
        last_modified_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to set default role', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Default role set successfully', { id })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Default role set successfully')
  } catch (error) {
    logger.error('Unexpected error setting default role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Clone role
export async function cloneRole(id: string, newName: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role cloning attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get role to clone
    const { data: roleToClone } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!roleToClone) {
      logger.warn('Role not found for cloning', { id })
      return actionError('Role not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: user.id,
        created_by: user.id,
        name: newName,
        description: `Clone of ${roleToClone.name}`,
        type: 'custom',
        status: 'active',
        access_level: roleToClone.access_level,
        permissions: roleToClone.permissions,
        can_delegate: roleToClone.can_delegate,
        is_default: false,
        is_system: false,
        tags: roleToClone.tags,
        metadata: roleToClone.metadata
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to clone role', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role cloned successfully', { id, newName })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Role cloned successfully')
  } catch (error) {
    logger.error('Unexpected error cloning role', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update permissions
export async function updateRolePermissions(id: string, permissions: string[]): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized role permissions update attempt')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('user_roles')
      .update({
        permissions,
        last_modified_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update role permissions', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Role permissions updated successfully', { id })
    revalidatePath('/dashboard/roles-v2')
    return actionSuccess(data, 'Role permissions updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating role permissions', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// =====================================================
// ROLE ASSIGNMENTS
// =====================================================

// Assign role to user
export async function assignRole(roleId: string, assignedUserId: string, notes?: string, expiresAt?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify role belongs to user
  const { data: role } = await supabase
    .from('user_roles')
    .select('id')
    .eq('id', roleId)
    .eq('user_id', user.id)
    .single()

  if (!role) {
    return { error: 'Role not found' }
  }

  const { data, error } = await supabase
    .from('role_assignments')
    .insert([{
      role_id: roleId,
      assigned_user_id: assignedUserId,
      assigned_by: user.id,
      notes,
      expires_at: expiresAt
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}

// Revoke role assignment
export async function revokeRoleAssignment(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('role_assignments')
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString(),
      deactivated_by: user.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}

// Reactivate role assignment
export async function reactivateRoleAssignment(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('role_assignments')
    .update({
      is_active: true,
      deactivated_at: null,
      deactivated_by: null
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}

// Delete role assignment
export async function deleteRoleAssignment(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('role_assignments')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { success: true }
}

// =====================================================
// ROLE PERMISSIONS
// =====================================================

// Create permission
export async function createPermission(input: PermissionInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('role_permissions')
    .insert([{
      user_id: user.id,
      permission_key: input.permission_key,
      display_name: input.display_name,
      description: input.description,
      category: input.category,
      is_active: true
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}

// Update permission
export async function updatePermission(id: string, input: Partial<PermissionInput>) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('role_permissions')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}

// Toggle permission
export async function togglePermission(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('role_permissions')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}

// Delete permission
export async function deletePermission(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { success: true }
}

// Bulk create permissions
export async function bulkCreatePermissions(permissions: PermissionInput[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const permissionsToInsert = permissions.map(p => ({
    user_id: user.id,
    permission_key: p.permission_key,
    display_name: p.display_name,
    description: p.description,
    category: p.category,
    is_active: true
  }))

  const { data, error } = await supabase
    .from('role_permissions')
    .insert(permissionsToInsert)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/roles-v2')
  return { data }
}
