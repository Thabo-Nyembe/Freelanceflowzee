'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type RoleLevel = 'system' | 'admin' | 'manager' | 'standard' | 'basic' | 'guest'
export type RoleType = 'system' | 'built-in' | 'custom'
export type AssignmentStatus = 'active' | 'pending' | 'suspended' | 'expired' | 'revoked'

export interface Role {
  id: string
  user_id: string

  // Role Details
  role_name: string
  display_name: string | null
  description: string | null

  // Classification
  role_level: RoleLevel
  role_type: RoleType

  // Status
  is_active: boolean
  is_editable: boolean
  is_deletable: boolean

  // Permissions
  permissions: string[]
  permission_groups: string[] | null
  inherited_from: string | null

  // Scope
  scope: string
  scope_id: string | null

  // Limits
  max_users: number
  current_users: number

  // Metadata
  color: string | null
  icon: string | null
  priority: number
  tags: string[] | null
  metadata: any

  // Audit
  created_by: string | null
  updated_by: string | null

  // Timestamps
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Permission {
  id: string
  user_id: string

  // Permission Details
  permission_key: string
  permission_name: string
  description: string | null

  // Resource
  resource: string
  resource_type: string | null

  // Actions
  actions: string[]
  allowed_actions: string[] | null
  denied_actions: string[] | null

  // Classification
  category: string | null
  permission_group: string | null
  is_system: boolean

  // Status
  is_active: boolean

  // Scope
  scope: string
  scope_conditions: any

  // Roles
  assigned_roles: string[] | null
  role_count: number

  // Dependencies
  requires_permissions: string[] | null
  conflicts_with: string[] | null

  // Metadata
  priority: number
  tags: string[] | null
  metadata: any

  // Timestamps
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RoleAssignment {
  id: string
  user_id: string

  role_id: string | null
  assigned_user_id: string
  assigned_user_email: string | null

  status: AssignmentStatus

  scope: string
  scope_id: string | null

  valid_from: string
  valid_until: string | null
  is_temporary: boolean

  assigned_by: string | null
  assigned_by_id: string | null
  assignment_reason: string | null

  revoked_at: string | null
  revoked_by: string | null
  revocation_reason: string | null

  metadata: any

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UseRolesOptions {
  level?: RoleLevel | 'all'
  type?: RoleType | 'all'
  active?: boolean
}

export function useRoles(options: UseRolesOptions = {}) {
  const { level, type, active } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('roles')
      .select('*')
      .is('deleted_at', null)
      .order('priority', { ascending: false })

    if (level && level !== 'all') {
      query = query.eq('role_level', level)
    }

    if (type && type !== 'all') {
      query = query.eq('role_type', type)
    }

    if (active !== undefined) {
      query = query.eq('is_active', active)
    }

    return query
  }

  return useSupabaseQuery<Role>('roles', buildQuery, [level, type, active])
}

export function usePermissions(resource?: string) {
  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('permissions')
      .select('*')
      .is('deleted_at', null)
      .order('priority', { ascending: false })

    if (resource && resource !== 'all') {
      query = query.eq('resource', resource)
    }

    return query
  }

  return useSupabaseQuery<Permission>('permissions', buildQuery, [resource])
}

export function useRoleAssignments(status?: AssignmentStatus) {
  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('role_assignments')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    return query
  }

  return useSupabaseQuery<RoleAssignment>('role_assignments', buildQuery, [status])
}

export function useCreateRole() {
  return useSupabaseMutation<Role>('roles', 'insert')
}

export function useUpdateRole() {
  return useSupabaseMutation<Role>('roles', 'update')
}

export function useDeleteRole() {
  return useSupabaseMutation<Role>('roles', 'delete')
}

export function useCreatePermission() {
  return useSupabaseMutation<Permission>('permissions', 'insert')
}

export function useUpdatePermission() {
  return useSupabaseMutation<Permission>('permissions', 'update')
}

export function useCreateRoleAssignment() {
  return useSupabaseMutation<RoleAssignment>('role_assignments', 'insert')
}

export function useUpdateRoleAssignment() {
  return useSupabaseMutation<RoleAssignment>('role_assignments', 'update')
}
