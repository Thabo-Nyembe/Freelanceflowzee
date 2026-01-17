/**
 * User Management Utilities
 * Helper functions and mock data for user management
 */

import {
  User,
  UserRole,
  UserStatus,
  Team,
  Invitation,
  Activity,
  Department,
  RoleTemplate,
  UserStats,
  UserPermissions,
  PermissionLevel
} from './user-management-types'

export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  owner: {
    dashboard: 'full',
    projects: 'full',
    clients: 'full',
    files: 'full',
    analytics: 'full',
    billing: 'full',
    settings: 'full',
    users: 'full',
    integrations: 'full',
    apiAccess: 'full'
  },
  admin: {
    dashboard: 'full',
    projects: 'full',
    clients: 'full',
    files: 'full',
    analytics: 'full',
    billing: 'admin',
    settings: 'admin',
    users: 'admin',
    integrations: 'admin',
    apiAccess: 'write'
  },
  manager: {
    dashboard: 'write',
    projects: 'write',
    clients: 'write',
    files: 'write',
    analytics: 'read',
    billing: 'read',
    settings: 'read',
    users: 'read',
    integrations: 'read',
    apiAccess: 'none'
  },
  member: {
    dashboard: 'read',
    projects: 'write',
    clients: 'read',
    files: 'write',
    analytics: 'read',
    billing: 'none',
    settings: 'read',
    users: 'read',
    integrations: 'none',
    apiAccess: 'none'
  },
  guest: {
    dashboard: 'read',
    projects: 'read',
    clients: 'none',
    files: 'read',
    analytics: 'none',
    billing: 'none',
    settings: 'none',
    users: 'none',
    integrations: 'none',
    apiAccess: 'none'
  }
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'template-1',
    name: 'Project Manager',
    description: 'Full access to projects and clients',
    permissions: DEFAULT_PERMISSIONS.manager,
    isCustom: false
  },
  {
    id: 'template-2',
    name: 'Designer',
    description: 'Access to projects and files',
    permissions: {
      ...DEFAULT_PERMISSIONS.member,
      files: 'full'
    },
    isCustom: false
  },
  {
    id: 'template-3',
    name: 'Developer',
    description: 'Technical access with API permissions',
    permissions: {
      ...DEFAULT_PERMISSIONS.member,
      apiAccess: 'write',
      integrations: 'write'
    },
    isCustom: false
  }
]

// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_USERS: User[] = []

// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_TEAMS: Team[] = []

// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_DEPARTMENTS: Department[] = []

// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_INVITATIONS: Invitation[] = []

// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_ACTIVITIES: Activity[] = []

// MIGRATED: Batch #14 - Removed mock data, using database hooks
export const MOCK_USER_STATS: UserStats = {
  totalUsers: 0,
  activeUsers: 0,
  newUsersToday: 0,
  newUsersThisWeek: 0,
  newUsersThisMonth: 0,
  byRole: {
    owner: 0,
    admin: 0,
    manager: 0,
    member: 0,
    guest: 0
  },
  byStatus: {
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
    deleted: 0
  },
  byDepartment: {
    Leadership: 0,
    Operations: 0,
    Design: 0,
    Development: 0,
    Marketing: 0,
    Sales: 0
  }
}

// Helper Functions
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'text-purple-500',
    admin: 'text-red-500',
    manager: 'text-blue-500',
    member: 'text-green-500',
    guest: 'text-gray-500'
  }
  return colors[role]
}

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-blue-100 text-blue-700',
    member: 'bg-green-100 text-green-700',
    guest: 'bg-gray-100 text-gray-700'
  }
  return colors[role]
}

export function getStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    active: 'text-green-500',
    inactive: 'text-gray-500',
    pending: 'text-yellow-500',
    suspended: 'text-red-500',
    deleted: 'text-gray-400'
  }
  return colors[status]
}

export function formatLastActive(date?: Date): string {
  if (!date) return 'Never'

  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function hasPermission(user: User, resource: keyof UserPermissions, level: PermissionLevel): boolean {
  const userLevel = user.permissions[resource]
  const levels: PermissionLevel[] = ['none', 'read', 'write', 'admin', 'full']
  return levels.indexOf(userLevel) >= levels.indexOf(level)
}

export function filterUsers(users: User[], filters: any): User[] {
  return users.filter(user => {
    if (filters.role && filters.role.length > 0 && !filters.role.includes(user.role)) return false
    if (filters.status && filters.status.length > 0 && !filters.status.includes(user.status)) return false
    if (filters.department && filters.department.length > 0 && !filters.department.includes(user.department)) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.displayName.toLowerCase().includes(search)
      )
    }
    return true
  })
}

export function sortUsers(users: User[], sortBy: 'name' | 'email' | 'role' | 'joined' | 'active'): User[] {
  const sorted = [...users]

  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName))
    case 'email':
      return sorted.sort((a, b) => a.email.localeCompare(b.email))
    case 'role':
      return sorted.sort((a, b) => a.role.localeCompare(b.role))
    case 'joined':
      return sorted.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime())
    case 'active':
      return sorted.sort((a, b) => {
        if (!a.lastActive) return 1
        if (!b.lastActive) return -1
        return b.lastActive.getTime() - a.lastActive.getTime()
      })
    default:
      return sorted
  }
}

export function generateInviteLink(invitationId: string): string {
  return `${window.location.origin}/invite/${invitationId}`
}

export function calculateStoragePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
