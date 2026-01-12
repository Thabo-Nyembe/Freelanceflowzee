/**
 * KAZI Platform - Role-Based Access Control (RBAC) Service
 *
 * Comprehensive permission management system for multi-tenant organizations.
 * Supports hierarchical roles, granular permissions, and resource-level access control.
 *
 * @module lib/rbac/rbac-service
 */

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type Role =
  | 'superadmin'    // Platform-wide admin
  | 'admin'         // Organization admin
  | 'owner'         // Resource owner
  | 'manager'       // Team/project manager
  | 'member'        // Team member
  | 'collaborator'  // External collaborator
  | 'client'        // Client with limited access
  | 'guest'         // Temporary/view-only access

export type Resource =
  | 'projects'
  | 'tasks'
  | 'files'
  | 'clients'
  | 'invoices'
  | 'messages'
  | 'teams'
  | 'settings'
  | 'analytics'
  | 'ai_features'
  | 'video_studio'
  | 'collaboration'
  | 'integrations'
  | 'billing'
  | 'users'

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'share'
  | 'export'
  | 'archive'
  | 'manage'       // Full control
  | 'invite'       // Invite others
  | 'approve'      // Approval workflows

export interface Permission {
  resource: Resource
  actions: Action[]
  conditions?: PermissionCondition[]
}

export interface PermissionCondition {
  type: 'ownership' | 'team_membership' | 'project_access' | 'time_based' | 'custom'
  value: string | boolean | Record<string, unknown>
}

export interface RoleDefinition {
  name: Role
  displayName: string
  description: string
  permissions: Permission[]
  inherits?: Role[]  // Role inheritance
  level: number      // Hierarchy level (lower = more powerful)
}

export interface UserPermissions {
  userId: string
  globalRole: Role
  teamRoles: TeamRole[]
  projectRoles: ProjectRole[]
  customPermissions: Permission[]
}

export interface TeamRole {
  teamId: string
  role: Role
  permissions: Permission[]
}

export interface ProjectRole {
  projectId: string
  role: Role
  permissions: Permission[]
}

export interface AccessCheckResult {
  allowed: boolean
  reason?: string
  conditions?: PermissionCondition[]
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  superadmin: {
    name: 'superadmin',
    displayName: 'Super Administrator',
    description: 'Platform-wide administrator with full access to all resources',
    level: 0,
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'share', 'export', 'archive', 'manage'] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
      { resource: 'files', actions: ['create', 'read', 'update', 'delete', 'share', 'export', 'manage'] },
      { resource: 'clients', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
      { resource: 'messages', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'teams', actions: ['create', 'read', 'update', 'delete', 'manage', 'invite'] },
      { resource: 'settings', actions: ['read', 'update', 'manage'] },
      { resource: 'analytics', actions: ['read', 'export', 'manage'] },
      { resource: 'ai_features', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'video_studio', actions: ['create', 'read', 'update', 'delete', 'manage', 'export'] },
      { resource: 'collaboration', actions: ['create', 'read', 'update', 'delete', 'manage', 'invite'] },
      { resource: 'integrations', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'billing', actions: ['read', 'update', 'manage'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage', 'invite'] }
    ]
  },

  admin: {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Organization administrator with broad access',
    level: 1,
    inherits: ['manager'],
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'share', 'export', 'archive', 'manage'] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
      { resource: 'files', actions: ['create', 'read', 'update', 'delete', 'share', 'export', 'manage'] },
      { resource: 'clients', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'manage', 'approve'] },
      { resource: 'messages', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'teams', actions: ['create', 'read', 'update', 'delete', 'manage', 'invite'] },
      { resource: 'settings', actions: ['read', 'update', 'manage'] },
      { resource: 'analytics', actions: ['read', 'export'] },
      { resource: 'ai_features', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'video_studio', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'collaboration', actions: ['create', 'read', 'update', 'delete', 'invite'] },
      { resource: 'integrations', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'billing', actions: ['read', 'update'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'invite'] }
    ]
  },

  owner: {
    name: 'owner',
    displayName: 'Owner',
    description: 'Resource owner with full control over owned resources',
    level: 2,
    inherits: ['manager'],
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'share', 'export', 'archive'], conditions: [{ type: 'ownership', value: true }] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve'], conditions: [{ type: 'ownership', value: true }] },
      { resource: 'files', actions: ['create', 'read', 'update', 'delete', 'share', 'export'], conditions: [{ type: 'ownership', value: true }] },
      { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'approve'] },
      { resource: 'messages', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'teams', actions: ['create', 'read', 'update', 'invite'] },
      { resource: 'settings', actions: ['read', 'update'] },
      { resource: 'analytics', actions: ['read', 'export'] },
      { resource: 'ai_features', actions: ['create', 'read', 'update'] },
      { resource: 'video_studio', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { resource: 'collaboration', actions: ['create', 'read', 'update', 'invite'] },
      { resource: 'integrations', actions: ['create', 'read', 'update'] },
      { resource: 'billing', actions: ['read'] },
      { resource: 'users', actions: ['read'] }
    ]
  },

  manager: {
    name: 'manager',
    displayName: 'Manager',
    description: 'Team or project manager with elevated permissions',
    level: 3,
    inherits: ['member'],
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'share', 'export'], conditions: [{ type: 'team_membership', value: true }] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'approve'], conditions: [{ type: 'team_membership', value: true }] },
      { resource: 'files', actions: ['create', 'read', 'update', 'share', 'export'], conditions: [{ type: 'team_membership', value: true }] },
      { resource: 'clients', actions: ['create', 'read', 'update'] },
      { resource: 'invoices', actions: ['create', 'read', 'update'] },
      { resource: 'messages', actions: ['create', 'read', 'update'] },
      { resource: 'teams', actions: ['read', 'update', 'invite'] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'ai_features', actions: ['create', 'read'] },
      { resource: 'video_studio', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'collaboration', actions: ['create', 'read', 'update', 'invite'] },
      { resource: 'integrations', actions: ['read'] },
      { resource: 'billing', actions: ['read'] },
      { resource: 'users', actions: ['read'] }
    ]
  },

  member: {
    name: 'member',
    displayName: 'Team Member',
    description: 'Standard team member with basic access',
    level: 4,
    permissions: [
      { resource: 'projects', actions: ['read', 'update'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'tasks', actions: ['create', 'read', 'update'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'files', actions: ['create', 'read', 'update'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'clients', actions: ['read'] },
      { resource: 'invoices', actions: ['read'] },
      { resource: 'messages', actions: ['create', 'read'] },
      { resource: 'teams', actions: ['read'] },
      { resource: 'settings', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'ai_features', actions: ['create', 'read'] },
      { resource: 'video_studio', actions: ['create', 'read', 'update'] },
      { resource: 'collaboration', actions: ['create', 'read', 'update'] },
      { resource: 'integrations', actions: ['read'] },
      { resource: 'billing', actions: [] },
      { resource: 'users', actions: ['read'] }
    ]
  },

  collaborator: {
    name: 'collaborator',
    displayName: 'Collaborator',
    description: 'External collaborator with project-specific access',
    level: 5,
    permissions: [
      { resource: 'projects', actions: ['read'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'tasks', actions: ['read', 'update'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'files', actions: ['read', 'update'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'clients', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'messages', actions: ['create', 'read'] },
      { resource: 'teams', actions: [] },
      { resource: 'settings', actions: [] },
      { resource: 'analytics', actions: [] },
      { resource: 'ai_features', actions: ['read'] },
      { resource: 'video_studio', actions: ['read'] },
      { resource: 'collaboration', actions: ['create', 'read', 'update'] },
      { resource: 'integrations', actions: [] },
      { resource: 'billing', actions: [] },
      { resource: 'users', actions: [] }
    ]
  },

  client: {
    name: 'client',
    displayName: 'Client',
    description: 'Client with access to their projects and deliverables',
    level: 6,
    permissions: [
      { resource: 'projects', actions: ['read'], conditions: [{ type: 'ownership', value: 'client' }] },
      { resource: 'tasks', actions: ['read'] },
      { resource: 'files', actions: ['read'], conditions: [{ type: 'ownership', value: 'client' }] },
      { resource: 'clients', actions: [] },
      { resource: 'invoices', actions: ['read'], conditions: [{ type: 'ownership', value: 'client' }] },
      { resource: 'messages', actions: ['create', 'read'] },
      { resource: 'teams', actions: [] },
      { resource: 'settings', actions: [] },
      { resource: 'analytics', actions: [] },
      { resource: 'ai_features', actions: [] },
      { resource: 'video_studio', actions: ['read'] },
      { resource: 'collaboration', actions: ['read'] },
      { resource: 'integrations', actions: [] },
      { resource: 'billing', actions: ['read'] },
      { resource: 'users', actions: [] }
    ]
  },

  guest: {
    name: 'guest',
    displayName: 'Guest',
    description: 'Temporary guest with view-only access',
    level: 7,
    permissions: [
      { resource: 'projects', actions: ['read'], conditions: [{ type: 'project_access', value: true }] },
      { resource: 'tasks', actions: ['read'] },
      { resource: 'files', actions: ['read'] },
      { resource: 'clients', actions: [] },
      { resource: 'invoices', actions: [] },
      { resource: 'messages', actions: ['read'] },
      { resource: 'teams', actions: [] },
      { resource: 'settings', actions: [] },
      { resource: 'analytics', actions: [] },
      { resource: 'ai_features', actions: [] },
      { resource: 'video_studio', actions: ['read'] },
      { resource: 'collaboration', actions: ['read'] },
      { resource: 'integrations', actions: [] },
      { resource: 'billing', actions: [] },
      { resource: 'users', actions: [] }
    ]
  }
}

// ============================================================================
// RBAC SERVICE CLASS
// ============================================================================

export class RBACService {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // --------------------------------------------------------------------------
  // PERMISSION CHECKING
  // --------------------------------------------------------------------------

  /**
   * Check if a user can perform an action on a resource
   */
  async canAccess(
    userId: string,
    resource: Resource,
    action: Action,
    resourceId?: string
  ): Promise<AccessCheckResult> {
    try {
      // Get user permissions
      const userPermissions = await this.getUserPermissions(userId)
      if (!userPermissions) {
        return { allowed: false, reason: 'User not found' }
      }

      // Check global role permissions
      const globalRoleDef = ROLE_DEFINITIONS[userPermissions.globalRole]
      const globalPermission = this.findPermission(globalRoleDef.permissions, resource, action)

      if (globalPermission && !globalPermission.conditions?.length) {
        return { allowed: true }
      }

      // Check team-level permissions
      for (const teamRole of userPermissions.teamRoles) {
        const teamPermission = this.findPermission(teamRole.permissions, resource, action)
        if (teamPermission) {
          if (!teamPermission.conditions?.length) {
            return { allowed: true }
          }

          // Evaluate conditions
          const conditionsMet = await this.evaluateConditions(
            userId,
            resourceId,
            teamPermission.conditions
          )
          if (conditionsMet) {
            return { allowed: true, conditions: teamPermission.conditions }
          }
        }
      }

      // Check project-level permissions
      for (const projectRole of userPermissions.projectRoles) {
        const projectPermission = this.findPermission(projectRole.permissions, resource, action)
        if (projectPermission) {
          if (!projectPermission.conditions?.length) {
            return { allowed: true }
          }

          // Evaluate conditions
          const conditionsMet = await this.evaluateConditions(
            userId,
            resourceId,
            projectPermission.conditions
          )
          if (conditionsMet) {
            return { allowed: true, conditions: projectPermission.conditions }
          }
        }
      }

      // Check custom permissions
      const customPermission = this.findPermission(userPermissions.customPermissions, resource, action)
      if (customPermission) {
        if (!customPermission.conditions?.length) {
          return { allowed: true }
        }

        const conditionsMet = await this.evaluateConditions(
          userId,
          resourceId,
          customPermission.conditions
        )
        if (conditionsMet) {
          return { allowed: true, conditions: customPermission.conditions }
        }
      }

      // Check with conditions from global role
      if (globalPermission?.conditions?.length && resourceId) {
        const conditionsMet = await this.evaluateConditions(
          userId,
          resourceId,
          globalPermission.conditions
        )
        if (conditionsMet) {
          return { allowed: true, conditions: globalPermission.conditions }
        }
      }

      return { allowed: false, reason: 'Insufficient permissions' }
    } catch (error) {
      console.error('RBAC access check error:', error)
      return { allowed: false, reason: 'Permission check failed' }
    }
  }

  /**
   * Check multiple permissions at once
   */
  async canAccessMultiple(
    userId: string,
    checks: Array<{ resource: Resource; action: Action; resourceId?: string }>
  ): Promise<Record<string, AccessCheckResult>> {
    const results: Record<string, AccessCheckResult> = {}

    await Promise.all(
      checks.map(async (check) => {
        const key = `${check.resource}:${check.action}:${check.resourceId || 'any'}`
        results[key] = await this.canAccess(userId, check.resource, check.action, check.resourceId)
      })
    )

    return results
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    try {
      // Get user's global role
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, role')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return null
      }

      // Get team memberships
      const { data: teamMemberships } = await this.supabase
        .from('team_members')
        .select('team_id, role, permissions')
        .eq('user_id', userId)

      // Get project access
      const { data: projectAccess } = await this.supabase
        .from('project_members')
        .select('project_id, role, permissions')
        .eq('user_id', userId)

      // Get custom permissions - using actual database schema
      // The existing user_permissions table uses: resource_type, allowed_actions, conditions
      const { data: customPerms } = await this.supabase
        .from('user_permissions')
        .select('resource_type, allowed_actions, conditions')
        .eq('target_user_id', userId)
        .eq('is_active', true)

      const globalRole = (user.role as Role) || 'member'
      const globalRoleDef = ROLE_DEFINITIONS[globalRole]

      return {
        userId,
        globalRole,
        teamRoles: (teamMemberships || []).map(tm => ({
          teamId: tm.team_id,
          role: tm.role as Role,
          permissions: tm.permissions || ROLE_DEFINITIONS[tm.role as Role]?.permissions || []
        })),
        projectRoles: (projectAccess || []).map(pa => ({
          projectId: pa.project_id,
          role: pa.role as Role,
          permissions: pa.permissions || ROLE_DEFINITIONS[pa.role as Role]?.permissions || []
        })),
        customPermissions: (customPerms || []).map(cp => ({
          resource: cp.resource_type as Resource,
          actions: (cp.allowed_actions || []) as Action[],
          conditions: cp.conditions as PermissionCondition[]
        }))
      }
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return null
    }
  }

  // --------------------------------------------------------------------------
  // ROLE MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Assign a role to a user for a team
   */
  async assignTeamRole(
    userId: string,
    teamId: string,
    role: Role,
    assignedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('team_members')
        .upsert({
          user_id: userId,
          team_id: teamId,
          role,
          permissions: ROLE_DEFINITIONS[role].permissions,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString()
        })

      if (error) throw error

      // Log the role assignment
      await this.logPermissionChange(userId, 'team_role_assigned', {
        teamId,
        role,
        assignedBy
      })

      return true
    } catch (error) {
      console.error('Error assigning team role:', error)
      return false
    }
  }

  /**
   * Assign a role to a user for a project
   */
  async assignProjectRole(
    userId: string,
    projectId: string,
    role: Role,
    assignedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('project_members')
        .upsert({
          user_id: userId,
          project_id: projectId,
          role,
          permissions: ROLE_DEFINITIONS[role].permissions,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString()
        })

      if (error) throw error

      // Log the role assignment
      await this.logPermissionChange(userId, 'project_role_assigned', {
        projectId,
        role,
        assignedBy
      })

      return true
    } catch (error) {
      console.error('Error assigning project role:', error)
      return false
    }
  }

  /**
   * Update a user's global role
   */
  async updateGlobalRole(
    userId: string,
    newRole: Role,
    updatedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      // Log the role change
      await this.logPermissionChange(userId, 'global_role_updated', {
        newRole,
        updatedBy
      })

      return true
    } catch (error) {
      console.error('Error updating global role:', error)
      return false
    }
  }

  /**
   * Grant custom permission to a user
   */
  async grantCustomPermission(
    userId: string,
    permission: Permission,
    grantedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          resource: permission.resource,
          actions: permission.actions,
          conditions: permission.conditions || [],
          granted_by: grantedBy,
          granted_at: new Date().toISOString()
        })

      if (error) throw error

      // Log the permission grant
      await this.logPermissionChange(userId, 'custom_permission_granted', {
        permission,
        grantedBy
      })

      return true
    } catch (error) {
      console.error('Error granting custom permission:', error)
      return false
    }
  }

  /**
   * Revoke custom permission from a user
   */
  async revokeCustomPermission(
    userId: string,
    resource: Resource,
    revokedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('resource', resource)

      if (error) throw error

      // Log the permission revocation
      await this.logPermissionChange(userId, 'custom_permission_revoked', {
        resource,
        revokedBy
      })

      return true
    } catch (error) {
      console.error('Error revoking custom permission:', error)
      return false
    }
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  /**
   * Find a permission for a resource and action
   */
  private findPermission(
    permissions: Permission[],
    resource: Resource,
    action: Action
  ): Permission | undefined {
    return permissions.find(
      p => p.resource === resource && p.actions.includes(action)
    )
  }

  /**
   * Evaluate permission conditions
   */
  private async evaluateConditions(
    userId: string,
    resourceId: string | undefined,
    conditions: PermissionCondition[]
  ): Promise<boolean> {
    if (!conditions.length) return true
    if (!resourceId) return false

    for (const condition of conditions) {
      switch (condition.type) {
        case 'ownership':
          const isOwner = await this.checkOwnership(userId, resourceId)
          if (!isOwner) return false
          break

        case 'team_membership':
          const isTeamMember = await this.checkTeamMembership(userId, resourceId)
          if (!isTeamMember) return false
          break

        case 'project_access':
          const hasProjectAccess = await this.checkProjectAccess(userId, resourceId)
          if (!hasProjectAccess) return false
          break

        case 'time_based':
          const isWithinTime = this.checkTimeBased(condition.value as Record<string, unknown>)
          if (!isWithinTime) return false
          break

        case 'custom':
          // Custom conditions can be extended here
          break
      }
    }

    return true
  }

  /**
   * Check if user owns a resource
   */
  private async checkOwnership(userId: string, resourceId: string): Promise<boolean> {
    // Check across multiple tables for ownership
    const tables = ['projects', 'tasks', 'files', 'invoices']

    for (const table of tables) {
      const { data } = await this.supabase
        .from(table)
        .select('user_id, created_by')
        .eq('id', resourceId)
        .single()

      if (data && (data.user_id === userId || data.created_by === userId)) {
        return true
      }
    }

    return false
  }

  /**
   * Check if user is a member of the team that owns the resource
   */
  private async checkTeamMembership(userId: string, resourceId: string): Promise<boolean> {
    // Get the team associated with the resource
    const { data: resource } = await this.supabase
      .from('projects')
      .select('team_id')
      .eq('id', resourceId)
      .single()

    if (!resource?.team_id) return false

    // Check if user is a member of that team
    const { data: membership } = await this.supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .eq('team_id', resource.team_id)
      .single()

    return !!membership
  }

  /**
   * Check if user has access to a project
   */
  private async checkProjectAccess(userId: string, resourceId: string): Promise<boolean> {
    // Direct project access
    const { data: projectMember } = await this.supabase
      .from('project_members')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', resourceId)
      .single()

    if (projectMember) return true

    // Check if resource belongs to a project the user has access to
    const { data: resource } = await this.supabase
      .from('tasks')
      .select('project_id')
      .eq('id', resourceId)
      .single()

    if (resource?.project_id) {
      const { data: access } = await this.supabase
        .from('project_members')
        .select('id')
        .eq('user_id', userId)
        .eq('project_id', resource.project_id)
        .single()

      return !!access
    }

    return false
  }

  /**
   * Check time-based conditions
   */
  private checkTimeBased(value: Record<string, unknown>): boolean {
    const now = new Date()

    if (value.startDate && new Date(value.startDate as string) > now) {
      return false
    }

    if (value.endDate && new Date(value.endDate as string) < now) {
      return false
    }

    return true
  }

  /**
   * Log permission changes for audit trail
   */
  private async logPermissionChange(
    userId: string,
    action: string,
    details: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.supabase
        .from('permission_audit_log')
        .insert({
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error logging permission change:', error)
    }
  }

  // --------------------------------------------------------------------------
  // UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Get role definition
   */
  getRoleDefinition(role: Role): RoleDefinition {
    return ROLE_DEFINITIONS[role]
  }

  /**
   * Get all roles
   */
  getAllRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS)
  }

  /**
   * Get roles available for assignment (excluding superadmin)
   */
  getAssignableRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS)
      .filter(r => r.name !== 'superadmin')
      .sort((a, b) => a.level - b.level)
  }

  /**
   * Check if roleA can assign roleB
   */
  canAssignRole(assignerRole: Role, targetRole: Role): boolean {
    const assigner = ROLE_DEFINITIONS[assignerRole]
    const target = ROLE_DEFINITIONS[targetRole]

    // Can only assign roles at or below your level (higher number = lower privilege)
    return assigner.level < target.level
  }

  /**
   * Get effective permissions for a role (including inherited)
   */
  getEffectivePermissions(role: Role): Permission[] {
    const roleDef = ROLE_DEFINITIONS[role]
    const permissions = [...roleDef.permissions]

    // Add inherited permissions
    if (roleDef.inherits) {
      for (const inheritedRole of roleDef.inherits) {
        const inheritedPerms = this.getEffectivePermissions(inheritedRole)
        for (const perm of inheritedPerms) {
          const existing = permissions.find(p => p.resource === perm.resource)
          if (!existing) {
            permissions.push(perm)
          } else {
            // Merge actions
            const mergedActions = [...new Set([...existing.actions, ...perm.actions])]
            existing.actions = mergedActions as Action[]
          }
        }
      }
    }

    return permissions
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let rbacServiceInstance: RBACService | null = null

export function getRBACService(): RBACService {
  if (!rbacServiceInstance) {
    rbacServiceInstance = new RBACService()
  }
  return rbacServiceInstance
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick permission check
 */
export async function checkPermission(
  userId: string,
  resource: Resource,
  action: Action,
  resourceId?: string
): Promise<boolean> {
  const rbac = getRBACService()
  const result = await rbac.canAccess(userId, resource, action, resourceId)
  return result.allowed
}

/**
 * Require permission (throws if not allowed)
 */
export async function requirePermission(
  userId: string,
  resource: Resource,
  action: Action,
  resourceId?: string
): Promise<void> {
  const rbac = getRBACService()
  const result = await rbac.canAccess(userId, resource, action, resourceId)

  if (!result.allowed) {
    throw new Error(result.reason || `Permission denied: ${action} on ${resource}`)
  }
}

/**
 * Get user's role for a project
 */
export async function getProjectRole(userId: string, projectId: string): Promise<Role | null> {
  const rbac = getRBACService()
  const permissions = await rbac.getUserPermissions(userId)

  if (!permissions) return null

  const projectRole = permissions.projectRoles.find(pr => pr.projectId === projectId)
  return projectRole?.role || null
}

/**
 * Get user's role for a team
 */
export async function getTeamRole(userId: string, teamId: string): Promise<Role | null> {
  const rbac = getRBACService()
  const permissions = await rbac.getUserPermissions(userId)

  if (!permissions) return null

  const teamRole = permissions.teamRoles.find(tr => tr.teamId === teamId)
  return teamRole?.role || null
}
