import { createClient } from '@/lib/supabase/server'

/**
 * User roles and their default permissions
 */
export const ROLE_PERMISSIONS = {
  admin: ['*'], // All permissions
  owner: ['read', 'write', 'delete', 'manage_team', 'manage_billing', 'view_analytics'],
  manager: ['read', 'write', 'delete', 'manage_team', 'view_analytics'],
  member: ['read', 'write', 'view_analytics'],
  viewer: ['read'],
  guest: ['read:limited']
} as const

export type UserRole = keyof typeof ROLE_PERMISSIONS

/**
 * Permission types
 */
export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_team'
  | 'manage_billing'
  | 'view_analytics'
  | 'manage_integrations'
  | 'export_data'
  | 'read:limited'
  | '*'

/**
 * Gets the current user and their permissions
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user's role from user_profiles or users table
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, permissions, team_id')
    .eq('id', user.id)
    .single()

  const role = (profile?.role || 'member') as UserRole
  const customPermissions = profile?.permissions || []
  const basePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.member

  return {
    id: user.id,
    email: user.email,
    role,
    teamId: profile?.team_id,
    permissions: [...basePermissions, ...customPermissions]
  }
}

/**
 * Checks if the current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  // Admin has all permissions
  if (user.permissions.includes('*')) {
    return true
  }

  return user.permissions.includes(permission)
}

/**
 * Checks if the current user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  if (user.permissions.includes('*')) {
    return true
  }

  return permissions.some(p => user.permissions.includes(p))
}

/**
 * Checks if the current user has all of the specified permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  if (user.permissions.includes('*')) {
    return true
  }

  return permissions.every(p => user.permissions.includes(p))
}

/**
 * Requires a specific permission, throws if not authorized
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await hasPermission(permission)

  if (!allowed) {
    throw new Error(`Permission denied: ${permission} required`)
  }
}

/**
 * Checks if the current user owns a resource
 */
export async function isResourceOwner(
  resourceTable: string,
  resourceId: string
): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from(resourceTable)
    .select('user_id')
    .eq('id', resourceId)
    .single()

  return data?.user_id === user.id
}

/**
 * Checks if the current user can access a resource (owner or team member)
 */
export async function canAccessResource(
  resourceTable: string,
  resourceId: string
): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user) {
    return false
  }

  // Admin can access everything
  if (user.permissions.includes('*')) {
    return true
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from(resourceTable)
    .select('user_id, team_id')
    .eq('id', resourceId)
    .single()

  if (!data) {
    return false
  }

  // Owner can always access
  if (data.user_id === user.id) {
    return true
  }

  // Team members can access team resources
  if (user.teamId && data.team_id === user.teamId) {
    return true
  }

  return false
}

/**
 * Decorator to require authentication for server actions
 */
export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T,
  requiredPermission?: Permission
): T {
  return (async (...args: Parameters<T>) => {
    const user = await getCurrentUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    if (requiredPermission) {
      const hasAccess = user.permissions.includes('*') || user.permissions.includes(requiredPermission)
      if (!hasAccess) {
        return { error: `Permission denied: ${requiredPermission} required` }
      }
    }

    return action(...args)
  }) as T
}

/**
 * Gets all permissions for display in UI
 */
export function getAllPermissions(): { value: Permission; label: string; description: string }[] {
  return [
    { value: 'read', label: 'Read', description: 'View data and resources' },
    { value: 'write', label: 'Write', description: 'Create and edit resources' },
    { value: 'delete', label: 'Delete', description: 'Remove resources' },
    { value: 'manage_team', label: 'Manage Team', description: 'Add/remove team members' },
    { value: 'manage_billing', label: 'Manage Billing', description: 'View and modify billing' },
    { value: 'view_analytics', label: 'View Analytics', description: 'Access analytics dashboards' },
    { value: 'manage_integrations', label: 'Manage Integrations', description: 'Configure third-party integrations' },
    { value: 'export_data', label: 'Export Data', description: 'Export data and reports' }
  ]
}
