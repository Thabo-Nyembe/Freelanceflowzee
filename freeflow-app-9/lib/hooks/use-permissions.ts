'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

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

  const filters: Record<string, any> = {}
  if (level && level !== 'all') filters.role_level = level
  if (type && type !== 'all') filters.role_type = type
  if (active !== undefined) filters.is_active = active

  const { data, loading, error, refetch } = useSupabaseQuery<Role>({
    table: 'roles',
    filters,
    orderBy: { column: 'priority', ascending: false },
    realtime: true,
    softDelete: true
  })

  return { data, isLoading: loading, error, refetch }
}

export function usePermissions(resource?: string) {
  const filters: Record<string, any> = {}
  if (resource && resource !== 'all') filters.resource = resource

  const { data, loading, error, refetch } = useSupabaseQuery<Permission>({
    table: 'permissions',
    filters,
    orderBy: { column: 'priority', ascending: false },
    realtime: true,
    softDelete: true
  })

  return { data, isLoading: loading, error, refetch }
}

export function useRoleAssignments(status?: AssignmentStatus) {
  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status

  const { data, loading, error, refetch } = useSupabaseQuery<RoleAssignment>({
    table: 'role_assignments',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true,
    softDelete: true
  })

  return { data, isLoading: loading, error, refetch }
}

export function useRoleMutations(onSuccess?: () => void) {
  return useSupabaseMutation({
    table: 'roles',
    onSuccess,
    enableRealtime: true
  })
}

export function usePermissionMutations(onSuccess?: () => void) {
  return useSupabaseMutation({
    table: 'permissions',
    onSuccess,
    enableRealtime: true
  })
}

export function useRoleAssignmentMutations(onSuccess?: () => void) {
  return useSupabaseMutation({
    table: 'role_assignments',
    onSuccess,
    enableRealtime: true
  })
}

// Legacy exports for backward compatibility
export function useCreateRole() {
  return useSupabaseMutation({ table: 'roles' })
}

export function useUpdateRole() {
  return useSupabaseMutation({ table: 'roles' })
}

export function useDeleteRole() {
  return useSupabaseMutation({ table: 'roles' })
}

export function useCreatePermission() {
  return useSupabaseMutation({ table: 'permissions' })
}

export function useUpdatePermission() {
  return useSupabaseMutation({ table: 'permissions' })
}

export function useCreateRoleAssignment() {
  return useSupabaseMutation({ table: 'role_assignments' })
}

export function useUpdateRoleAssignment() {
  return useSupabaseMutation({ table: 'role_assignments' })
}
