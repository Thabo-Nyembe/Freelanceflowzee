'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute' | '*'
export type ResourceType = 'users' | 'projects' | 'tasks' | 'invoices' | 'files' | 'settings' | 'reports' | 'analytics' | 'billing' | 'integrations' | 'api' | 'admin'

export interface Permission {
  id: string
  name: string
  key: string
  description: string
  resource: ResourceType
  actions: PermissionAction[]
  isSystem: boolean
  isDeprecated: boolean
  dependencies?: string[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  key: string
  description: string
  color?: string
  icon?: string
  permissions: string[]
  isSystem: boolean
  isDefault: boolean
  userCount: number
  priority: number
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface PermissionGroup {
  id: string
  name: string
  description?: string
  resource: ResourceType
  permissions: Permission[]
}

export interface RoleAssignment {
  userId: string
  userName: string
  userEmail: string
  roleId: string
  roleName: string
  assignedBy: string
  assignedByName: string
  assignedAt: string
  expiresAt?: string
}

export interface PermissionCheck {
  permission: string
  hasPermission: boolean
  source: 'role' | 'direct' | 'inherited'
  roleName?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPermissions: Permission[] = [
  { id: 'perm-1', name: 'View Users', key: 'users:read', description: 'View user list and profiles', resource: 'users', actions: ['read'], isSystem: true, isDeprecated: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'perm-2', name: 'Manage Users', key: 'users:manage', description: 'Create, update, and delete users', resource: 'users', actions: ['create', 'read', 'update', 'delete'], isSystem: true, isDeprecated: false, dependencies: ['users:read'], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'perm-3', name: 'View Projects', key: 'projects:read', description: 'View project details', resource: 'projects', actions: ['read'], isSystem: true, isDeprecated: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'perm-4', name: 'Manage Projects', key: 'projects:manage', description: 'Full project management', resource: 'projects', actions: ['*'], isSystem: true, isDeprecated: false, dependencies: ['projects:read'], createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'perm-5', name: 'View Reports', key: 'reports:read', description: 'View analytics and reports', resource: 'reports', actions: ['read'], isSystem: true, isDeprecated: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'perm-6', name: 'Manage Billing', key: 'billing:manage', description: 'Manage billing and subscriptions', resource: 'billing', actions: ['*'], isSystem: true, isDeprecated: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'perm-7', name: 'Admin Access', key: 'admin:*', description: 'Full administrative access', resource: 'admin', actions: ['*'], isSystem: true, isDeprecated: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

const mockRoles: Role[] = [
  { id: 'role-1', name: 'Super Admin', key: 'super_admin', description: 'Full system access', color: '#dc2626', permissions: ['*'], isSystem: true, isDefault: false, userCount: 1, priority: 100, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'role-2', name: 'Admin', key: 'admin', description: 'Administrative access', color: '#f97316', permissions: ['users:manage', 'projects:manage', 'reports:read', 'billing:manage'], isSystem: true, isDefault: false, userCount: 2, priority: 80, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'role-3', name: 'Manager', key: 'manager', description: 'Team and project management', color: '#eab308', permissions: ['users:read', 'projects:manage', 'reports:read'], isSystem: true, isDefault: false, userCount: 5, priority: 60, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'role-4', name: 'Member', key: 'member', description: 'Standard user access', color: '#22c55e', permissions: ['projects:read', 'tasks:*'], isSystem: true, isDefault: true, userCount: 25, priority: 40, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'role-5', name: 'Viewer', key: 'viewer', description: 'Read-only access', color: '#3b82f6', permissions: ['projects:read', 'reports:read'], isSystem: true, isDefault: false, userCount: 10, priority: 20, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

const mockAssignments: RoleAssignment[] = [
  { userId: 'user-1', userName: 'Alex Chen', userEmail: 'alex@company.com', roleId: 'role-1', roleName: 'Super Admin', assignedBy: 'system', assignedByName: 'System', assignedAt: '2024-01-01' },
  { userId: 'user-2', userName: 'Sarah Miller', userEmail: 'sarah@company.com', roleId: 'role-2', roleName: 'Admin', assignedBy: 'user-1', assignedByName: 'Alex Chen', assignedAt: '2024-01-15' }
]

// ============================================================================
// HOOK
// ============================================================================

interface UsePermissionsOptions {
  
  userId?: string
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const {  userId } = options

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [assignments, setAssignments] = useState<RoleAssignment[]>([])
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/permissions')
      const result = await response.json()
      if (result.success) {
        setPermissions(Array.isArray(result.permissions) ? result.permissions : [])
        setRoles(Array.isArray(result.roles) ? result.roles : [])
        setAssignments(Array.isArray(result.assignments) ? result.assignments : [])
        return { permissions: result.permissions, roles: result.roles }
      }
      setPermissions([])
      setRoles([])
      return { permissions: mockPermissions, roles: mockRoles }
    } catch (err) {
      setPermissions([])
      setRoles([])
      return { permissions: mockPermissions, roles: mockRoles }
    } finally {
      setIsLoading(false)
    }
  }, [ userId])

  const createRole = useCallback(async (data: { name: string; key: string; description?: string; permissions: string[]; color?: string }) => {
    try {
      const response = await fetch('/api/permissions/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setRoles(prev => [...prev, result.role])
        return { success: true, role: result.role }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: data.name,
        key: data.key,
        description: data.description || '',
        color: data.color,
        permissions: data.permissions,
        isSystem: false,
        isDefault: false,
        userCount: 0,
        priority: 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setRoles(prev => [...prev, newRole])
      return { success: true, role: newRole }
    }
  }, [])

  const updateRole = useCallback(async (roleId: string, updates: Partial<Role>) => {
    try {
      const response = await fetch(`/api/permissions/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
      }
      return result
    } catch (err) {
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updates } : r))
      return { success: true }
    }
  }, [])

  const deleteRole = useCallback(async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      return { success: false, error: 'Cannot delete system role' }
    }

    try {
      await fetch(`/api/permissions/roles/${roleId}`, { method: 'DELETE' })
      setRoles(prev => prev.filter(r => r.id !== roleId))
      return { success: true }
    } catch (err) {
      setRoles(prev => prev.filter(r => r.id !== roleId))
      return { success: true }
    }
  }, [roles])

  const assignRole = useCallback(async (userId: string, roleId: string, expiresAt?: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return { success: false, error: 'Role not found' }

    try {
      const response = await fetch('/api/permissions/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId, expiresAt })
      })
      const result = await response.json()
      if (result.success) {
        setAssignments(prev => [...prev.filter(a => a.userId !== userId), result.assignment])
        setRoles(prev => prev.map(r => r.id === roleId ? { ...r, userCount: r.userCount + 1 } : r))
      }
      return result
    } catch (err) {
      const newAssignment: RoleAssignment = {
        userId,
        userName: 'User',
        userEmail: '',
        roleId,
        roleName: role.name,
        assignedBy: 'user-1',
        assignedByName: 'Current User',
        assignedAt: new Date().toISOString(),
        expiresAt
      }
      setAssignments(prev => [...prev.filter(a => a.userId !== userId), newAssignment])
      return { success: true, assignment: newAssignment }
    }
  }, [roles])

  const revokeRole = useCallback(async (userId: string) => {
    const assignment = assignments.find(a => a.userId === userId)
    if (assignment) {
      setRoles(prev => prev.map(r => r.id === assignment.roleId ? { ...r, userCount: Math.max(0, r.userCount - 1) } : r))
    }
    setAssignments(prev => prev.filter(a => a.userId !== userId))
    return { success: true }
  }, [assignments])

  const addPermissionToRole = useCallback(async (roleId: string, permissionKey: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return { success: false, error: 'Role not found' }
    if (role.permissions.includes(permissionKey)) return { success: true }

    return updateRole(roleId, { permissions: [...role.permissions, permissionKey] })
  }, [roles, updateRole])

  const removePermissionFromRole = useCallback(async (roleId: string, permissionKey: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return { success: false, error: 'Role not found' }

    return updateRole(roleId, { permissions: role.permissions.filter(p => p !== permissionKey) })
  }, [roles, updateRole])

  const checkPermission = useCallback((permissionKey: string): PermissionCheck => {
    // Check if user has wildcard permission
    if (userPermissions.includes('*')) {
      return { permission: permissionKey, hasPermission: true, source: 'role', roleName: userRole?.name }
    }

    // Check for exact match
    if (userPermissions.includes(permissionKey)) {
      return { permission: permissionKey, hasPermission: true, source: 'role', roleName: userRole?.name }
    }

    // Check for resource wildcard (e.g., 'projects:*' matches 'projects:read')
    const [resource, action] = permissionKey.split(':')
    if (userPermissions.includes(`${resource}:*`)) {
      return { permission: permissionKey, hasPermission: true, source: 'role', roleName: userRole?.name }
    }

    return { permission: permissionKey, hasPermission: false, source: 'role' }
  }, [userPermissions, userRole])

  const hasPermission = useCallback((permissionKey: string): boolean => {
    return checkPermission(permissionKey).hasPermission
  }, [checkPermission])

  const hasAnyPermission = useCallback((permissionKeys: string[]): boolean => {
    return permissionKeys.some(key => hasPermission(key))
  }, [hasPermission])

  const hasAllPermissions = useCallback((permissionKeys: string[]): boolean => {
    return permissionKeys.every(key => hasPermission(key))
  }, [hasPermission])

  const canManageRole = useCallback((roleId: string): boolean => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return false
    if (!userRole) return false
    return userRole.priority > role.priority
  }, [roles, userRole])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchPermissions()
  }, [fetchPermissions])

  useEffect(() => { refresh() }, [refresh])

  const permissionGroups = useMemo((): PermissionGroup[] => {
    const groups: Record<string, Permission[]> = {}
    permissions.forEach(p => {
      if (!groups[p.resource]) groups[p.resource] = []
      groups[p.resource].push(p)
    })
    return Object.entries(groups).map(([resource, perms]) => ({
      id: resource,
      name: resource.charAt(0).toUpperCase() + resource.slice(1),
      resource: resource as ResourceType,
      permissions: perms
    }))
  }, [permissions])

  const systemRoles = useMemo(() => roles.filter(r => r.isSystem), [roles])
  const customRoles = useMemo(() => roles.filter(r => !r.isSystem), [roles])
  const defaultRole = useMemo(() => roles.find(r => r.isDefault), [roles])
  const activeAssignments = useMemo(() => assignments.filter(a => !a.expiresAt || new Date(a.expiresAt) > new Date()), [assignments])
  const resources: ResourceType[] = ['users', 'projects', 'tasks', 'invoices', 'files', 'settings', 'reports', 'analytics', 'billing', 'integrations', 'api', 'admin']

  return {
    permissions, roles, assignments, userPermissions, userRole, permissionGroups, systemRoles, customRoles, defaultRole, activeAssignments, resources,
    isLoading, error,
    refresh, fetchPermissions, createRole, updateRole, deleteRole, assignRole, revokeRole,
    addPermissionToRole, removePermissionFromRole, checkPermission, hasPermission, hasAnyPermission, hasAllPermissions, canManageRole
  }
}

export default usePermissions
