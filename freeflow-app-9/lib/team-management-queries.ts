/**
 * Team Management Queries
 *
 * Provides CRUD operations for user roles and permissions management.
 * Supports role-based access control (RBAC) and permission assignments.
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

const logger = createFeatureLogger('TeamManagement')

// ============================================================================
// TYPES
// ============================================================================

export type UserRoleType = 'owner' | 'admin' | 'manager' | 'member' | 'guest' | 'viewer'
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'view_only'

export interface UserRole {
  id: string
  user_id: string
  role_name: UserRoleType
  role_description?: string
  is_custom_role: boolean
  team_id?: string
  department?: string
  permission_level: number
  can_invite_users: boolean
  can_manage_team: boolean
  can_manage_projects: boolean
  can_manage_billing: boolean
  can_view_analytics: boolean
  can_manage_integrations: boolean
  is_active: boolean
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  notes?: string
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  user_id: string
  role_name: UserRoleType
  resource_type: string
  resource_id?: string
  allowed_actions: PermissionAction[]
  scope: string
  conditions: Record<string, JsonValue>
  priority: number
  inherited_from?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserPermission {
  id: string
  user_id: string
  target_user_id: string
  resource_type: string
  resource_id?: string
  allowed_actions: PermissionAction[]
  denied_actions: PermissionAction[]
  scope: string
  conditions: Record<string, JsonValue>
  granted_by?: string
  granted_at: string
  expires_at?: string
  revoked_at?: string
  revoked_by?: string
  revoke_reason?: string
  is_active: boolean
  notes?: string
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface RoleSummary {
  role_name: UserRoleType
  user_count: number
  active_count: number
  permission_count: number
}

export interface EffectivePermission {
  resource_type: string
  resource_id?: string
  allowed_actions: PermissionAction[]
  source: 'role' | 'direct'
}

export interface UserWithRole {
  user_id: string
  role_name: UserRoleType
  email?: string
  full_name?: string
  assigned_at: string
  is_active: boolean
}

// ============================================================================
// USER ROLES CRUD
// ============================================================================

/**
 * Get all user roles for a user
 */
export async function getUserRoles(
  userId: string,
  filters?: {
    is_active?: boolean
    team_id?: string
    role_name?: UserRoleType
  }
): Promise<{ data: UserRole[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching user roles from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.team_id) {
      query = query.eq('team_id', filters.team_id)
    }

    if (filters?.role_name) {
      query = query.eq('role_name', filters.role_name)
    }

    const { data, error } = await query.order('permission_level', { ascending: false })

    if (error) {
      logger.error('Failed to fetch user roles', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('User roles fetched successfully', {
      userId,
      count: data?.length || 0
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching user roles', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get a single user role
 */
export async function getUserRole(
  roleId: string,
  userId: string
): Promise<{ data: UserRole | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching single user role', { roleId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', roleId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch user role', { error, roleId })
      return { data: null, error: toDbError(error) }
    }

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching user role', { error, roleId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a new user role
 */
export async function createUserRole(
  userId: string,
  role: {
    role_name: UserRoleType
    role_description?: string
    team_id?: string
    department?: string
    can_invite_users?: boolean
    can_manage_team?: boolean
    can_manage_projects?: boolean
    can_manage_billing?: boolean
    can_view_analytics?: boolean
    can_manage_integrations?: boolean
    assigned_by?: string
    expires_at?: string
    notes?: string
  }
): Promise<{ data: UserRole | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating user role in Supabase', { userId, role_name: role.role_name })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_name: role.role_name,
        role_description: role.role_description,
        team_id: role.team_id,
        department: role.department,
        can_invite_users: role.can_invite_users || false,
        can_manage_team: role.can_manage_team || false,
        can_manage_projects: role.can_manage_projects || false,
        can_manage_billing: role.can_manage_billing || false,
        can_view_analytics: role.can_view_analytics || false,
        can_manage_integrations: role.can_manage_integrations || false,
        assigned_by: role.assigned_by,
        expires_at: role.expires_at,
        notes: role.notes,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create user role', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('User role created successfully', {
      roleId: data.id,
      role_name: role.role_name
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating user role', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a user role
 */
export async function updateUserRole(
  roleId: string,
  userId: string,
  updates: Partial<UserRole>
): Promise<{ data: UserRole | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating user role', { roleId, userId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_roles')
      .update(updates)
      .eq('id', roleId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update user role', { error, roleId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('User role updated successfully', { roleId })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating user role', { error, roleId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a user role
 */
export async function deleteUserRole(
  roleId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting user role', { roleId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', roleId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete user role', { error, roleId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('User role deleted successfully', { roleId })

    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting user role', { error, roleId })
    return { success: false, error: toDbError(error) }
  }
}

/**
 * Deactivate a user role (soft delete)
 */
export async function deactivateUserRole(
  roleId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deactivating user role', { roleId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('id', roleId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to deactivate user role', { error, roleId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('User role deactivated successfully', { roleId })

    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deactivating user role', { error, roleId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================================
// ROLE PERMISSIONS CRUD
// ============================================================================

/**
 * Get all role permissions
 */
export async function getRolePermissions(
  userId: string,
  filters?: {
    role_name?: UserRoleType
    resource_type?: string
    is_active?: boolean
  }
): Promise<{ data: RolePermission[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching role permissions from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('role_permissions')
      .select('*')
      .eq('user_id', userId)

    if (filters?.role_name) {
      query = query.eq('role_name', filters.role_name)
    }

    if (filters?.resource_type) {
      query = query.eq('resource_type', filters.resource_type)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query.order('priority', { ascending: false })

    if (error) {
      logger.error('Failed to fetch role permissions', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Role permissions fetched successfully', {
      userId,
      count: data?.length || 0
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching role permissions', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Create a role permission
 */
export async function createRolePermission(
  userId: string,
  permission: {
    role_name: UserRoleType
    resource_type: string
    resource_id?: string
    allowed_actions: PermissionAction[]
    scope?: string
    conditions?: Record<string, JsonValue>
    priority?: number
  }
): Promise<{ data: RolePermission | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating role permission in Supabase', {
      userId,
      role_name: permission.role_name,
      resource_type: permission.resource_type
    })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('role_permissions')
      .insert({
        user_id: userId,
        role_name: permission.role_name,
        resource_type: permission.resource_type,
        resource_id: permission.resource_id,
        allowed_actions: permission.allowed_actions,
        scope: permission.scope || 'organization',
        conditions: permission.conditions || {},
        priority: permission.priority || 1,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create role permission', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Role permission created successfully', {
      permissionId: data.id,
      role_name: permission.role_name
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating role permission', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a role permission
 */
export async function updateRolePermission(
  permissionId: string,
  userId: string,
  updates: Partial<RolePermission>
): Promise<{ data: RolePermission | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating role permission', { permissionId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('role_permissions')
      .update(updates)
      .eq('id', permissionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update role permission', { error, permissionId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Role permission updated successfully', { permissionId })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating role permission', { error, permissionId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a role permission
 */
export async function deleteRolePermission(
  permissionId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting role permission', { permissionId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('role_permissions')
      .delete()
      .eq('id', permissionId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete role permission', { error, permissionId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Role permission deleted successfully', { permissionId })

    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting role permission', { error, permissionId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================================
// USER PERMISSIONS CRUD
// ============================================================================

/**
 * Get all user permissions
 */
export async function getUserPermissions(
  userId: string,
  filters?: {
    target_user_id?: string
    resource_type?: string
    is_active?: boolean
  }
): Promise<{ data: UserPermission[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching user permissions from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId)

    if (filters?.target_user_id) {
      query = query.eq('target_user_id', filters.target_user_id)
    }

    if (filters?.resource_type) {
      query = query.eq('resource_type', filters.resource_type)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query.order('granted_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch user permissions', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('User permissions fetched successfully', {
      userId,
      count: data?.length || 0
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching user permissions', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Grant permission to a user
 */
export async function grantUserPermission(
  userId: string,
  permission: {
    target_user_id: string
    resource_type: string
    resource_id?: string
    allowed_actions: PermissionAction[]
    denied_actions?: PermissionAction[]
    scope?: string
    conditions?: Record<string, JsonValue>
    expires_at?: string
    notes?: string
  }
): Promise<{ data: UserPermission | null; error: DatabaseError | null }> {
  try {
    logger.info('Granting user permission in Supabase', {
      userId,
      target_user_id: permission.target_user_id,
      resource_type: permission.resource_type
    })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_permissions')
      .insert({
        user_id: userId,
        target_user_id: permission.target_user_id,
        resource_type: permission.resource_type,
        resource_id: permission.resource_id,
        allowed_actions: permission.allowed_actions,
        denied_actions: permission.denied_actions || [],
        scope: permission.scope || 'personal',
        conditions: permission.conditions || {},
        granted_by: userId,
        expires_at: permission.expires_at,
        notes: permission.notes,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to grant user permission', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('User permission granted successfully', {
      permissionId: data.id,
      target_user_id: permission.target_user_id
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception granting user permission', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Revoke a user permission
 */
export async function revokeUserPermission(
  permissionId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Revoking user permission', { permissionId, userId, reason })

    const supabase = createClient()
    const { error } = await supabase
      .from('user_permissions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
        revoke_reason: reason
      })
      .eq('id', permissionId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to revoke user permission', { error, permissionId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('User permission revoked successfully', { permissionId })

    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception revoking user permission', { error, permissionId })
    return { success: false, error: toDbError(error) }
  }
}

/**
 * Delete a user permission
 */
export async function deleteUserPermission(
  permissionId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting user permission', { permissionId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('id', permissionId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete user permission', { error, permissionId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('User permission deleted successfully', { permissionId })

    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting user permission', { error, permissionId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================================
// HELPER FUNCTIONS & RPC CALLS
// ============================================================================

/**
 * Check if user has a specific permission
 */
export async function checkUserPermission(
  userId: string,
  resourceType: string,
  action: PermissionAction,
  resourceId?: string
): Promise<{ hasPermission: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Checking user permission', { userId, resourceType, action, resourceId })

    const supabase = createClient()
    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_resource_type: resourceType,
      p_action: action,
      p_resource_id: resourceId
    })

    if (error) {
      logger.error('Failed to check user permission', { error, userId })
      return { hasPermission: false, error: toDbError(error) }
    }

    logger.info('Permission check completed', { userId, hasPermission: data })

    return { hasPermission: data as boolean, error: null }
  } catch (error: unknown) {
    logger.error('Exception checking user permission', { error, userId })
    return { hasPermission: false, error: toDbError(error) }
  }
}

/**
 * Get user's effective permissions
 */
export async function getEffectivePermissions(
  userId: string,
  resourceType?: string
): Promise<{ data: EffectivePermission[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching effective permissions', { userId, resourceType })

    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId,
      p_resource_type: resourceType
    })

    if (error) {
      logger.error('Failed to fetch effective permissions', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Effective permissions fetched', {
      userId,
      count: data?.length || 0
    })

    return { data: data as EffectivePermission[] || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching effective permissions', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  ownerUserId: string,
  roleName: UserRoleType
): Promise<{ data: UserWithRole[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching users by role', { ownerUserId, roleName })

    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_users_by_role', {
      p_owner_user_id: ownerUserId,
      p_role_name: roleName
    })

    if (error) {
      logger.error('Failed to fetch users by role', { error, ownerUserId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Users by role fetched', {
      roleName,
      count: data?.length || 0
    })

    return { data: (data as UserWithRole[]) || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching users by role', { error, ownerUserId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get role summary
 */
export async function getRoleSummary(
  userId: string
): Promise<{ data: RoleSummary[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching role summary', { userId })

    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_role_summary', {
      p_user_id: userId
    })

    if (error) {
      logger.error('Failed to fetch role summary', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Role summary fetched', {
      userId,
      count: data?.length || 0
    })

    return { data: data as RoleSummary[] || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching role summary', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Batch grant permissions to multiple users
 */
export async function batchGrantPermissions(
  userId: string,
  targetUserIds: string[],
  permission: {
    resource_type: string
    resource_id?: string
    allowed_actions: PermissionAction[]
    scope?: string
    expires_at?: string
  }
): Promise<{ success: boolean; count: number; error: DatabaseError | null }> {
  try {
    logger.info('Batch granting permissions', {
      userId,
      targetCount: targetUserIds.length,
      resource_type: permission.resource_type
    })

    const supabase = createClient()
    const permissionsToGrant = targetUserIds.map(targetUserId => ({
      user_id: userId,
      target_user_id: targetUserId,
      resource_type: permission.resource_type,
      resource_id: permission.resource_id,
      allowed_actions: permission.allowed_actions,
      denied_actions: [] as PermissionAction[],
      scope: permission.scope || 'personal',
      conditions: {},
      granted_by: userId,
      expires_at: permission.expires_at,
      is_active: true
    }))

    const { data, error } = await supabase
      .from('user_permissions')
      .insert(permissionsToGrant)
      .select()

    if (error) {
      logger.error('Failed to batch grant permissions', { error, userId })
      return { success: false, count: 0, error: toDbError(error) }
    }

    logger.info('Batch permissions granted successfully', {
      userId,
      count: data.length
    })

    return { success: true, count: data.length, error: null }
  } catch (error: unknown) {
    logger.error('Exception batch granting permissions', { error, userId })
    return { success: false, count: 0, error: toDbError(error) }
  }
}
