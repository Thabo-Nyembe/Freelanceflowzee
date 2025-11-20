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

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    email: 'sarah.johnson@company.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    role: 'owner',
    status: 'active',
    department: 'Leadership',
    jobTitle: 'CEO & Founder',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    language: 'en',
    joinedAt: new Date(Date.now() - 86400000 * 365),
    lastActive: new Date(Date.now() - 3600000),
    permissions: DEFAULT_PERMISSIONS.owner,
    settings: {
      notifications: { email: true, push: true, slack: true, desktop: true },
      privacy: { profileVisible: true, activityVisible: true, emailVisible: true },
      preferences: { theme: 'dark', language: 'en', dateFormat: 'MM/DD/YYYY', timeFormat: '12h' }
    },
    metadata: {
      totalProjects: 45,
      totalTasks: 287,
      completionRate: 94,
      averageResponseTime: 2.5,
      lastLogin: new Date(),
      loginCount: 1543,
      storageUsed: 15728640000
    }
  },
  {
    id: 'user-2',
    email: 'michael.chen@company.com',
    firstName: 'Michael',
    lastName: 'Chen',
    displayName: 'Michael Chen',
    avatar: '/avatars/michael.jpg',
    role: 'admin',
    status: 'active',
    department: 'Operations',
    jobTitle: 'Operations Director',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    timezone: 'America/New_York',
    language: 'en',
    joinedAt: new Date(Date.now() - 86400000 * 300),
    lastActive: new Date(Date.now() - 7200000),
    permissions: DEFAULT_PERMISSIONS.admin,
    settings: {
      notifications: { email: true, push: true, slack: false, desktop: true },
      privacy: { profileVisible: true, activityVisible: true, emailVisible: false },
      preferences: { theme: 'light', language: 'en', dateFormat: 'DD/MM/YYYY', timeFormat: '24h' }
    },
    metadata: {
      totalProjects: 32,
      totalTasks: 198,
      completionRate: 89,
      averageResponseTime: 3.2,
      lastLogin: new Date(Date.now() - 7200000),
      loginCount: 876,
      storageUsed: 8589934592
    }
  },
  {
    id: 'user-3',
    email: 'emma.williams@company.com',
    firstName: 'Emma',
    lastName: 'Williams',
    displayName: 'Emma Williams',
    avatar: '/avatars/emma.jpg',
    role: 'manager',
    status: 'active',
    department: 'Design',
    jobTitle: 'Design Lead',
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    language: 'en',
    joinedAt: new Date(Date.now() - 86400000 * 200),
    lastActive: new Date(Date.now() - 1800000),
    permissions: DEFAULT_PERMISSIONS.manager,
    settings: {
      notifications: { email: true, push: true, slack: true, desktop: false },
      privacy: { profileVisible: true, activityVisible: true, emailVisible: true },
      preferences: { theme: 'auto', language: 'en', dateFormat: 'MM/DD/YYYY', timeFormat: '12h' }
    },
    metadata: {
      totalProjects: 28,
      totalTasks: 156,
      completionRate: 92,
      averageResponseTime: 2.8,
      lastLogin: new Date(Date.now() - 1800000),
      loginCount: 654,
      storageUsed: 5368709120
    }
  }
]

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Product Team',
    description: 'Building amazing products',
    slug: 'product',
    members: [],
    owner: 'user-1',
    createdAt: new Date(Date.now() - 86400000 * 180),
    updatedAt: new Date(),
    settings: {
      visibility: 'private',
      allowMemberInvites: true,
      requireApproval: false,
      maxMembers: 50,
      features: {
        projects: true,
        files: true,
        chat: true,
        video: true,
        calendar: true
      }
    },
    stats: {
      totalMembers: 12,
      activeMembers: 10,
      totalProjects: 24,
      activeProjects: 8,
      storageUsed: 25769803776,
      storageLimit: 107374182400
    }
  }
]

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Leadership',
    description: 'Executive team',
    headId: 'user-1',
    memberIds: ['user-1'],
    createdAt: new Date(Date.now() - 86400000 * 365)
  },
  {
    id: 'dept-2',
    name: 'Operations',
    description: 'Operations and management',
    headId: 'user-2',
    memberIds: ['user-2'],
    createdAt: new Date(Date.now() - 86400000 * 300)
  },
  {
    id: 'dept-3',
    name: 'Design',
    description: 'Design and creative',
    headId: 'user-3',
    memberIds: ['user-3'],
    createdAt: new Date(Date.now() - 86400000 * 200)
  }
]

export const MOCK_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    email: 'john.doe@example.com',
    role: 'member',
    invitedBy: 'user-1',
    invitedAt: new Date(Date.now() - 86400000 * 2),
    expiresAt: new Date(Date.now() + 86400000 * 5),
    status: 'pending'
  }
]

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    action: 'created',
    target: 'user',
    targetId: 'user-3',
    description: 'Added Emma Williams to the team',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 'act-2',
    userId: 'user-2',
    userName: 'Michael Chen',
    action: 'updated',
    target: 'permissions',
    targetId: 'user-3',
    description: 'Updated permissions for Emma Williams',
    timestamp: new Date(Date.now() - 7200000)
  }
]

export const MOCK_USER_STATS: UserStats = {
  totalUsers: 48,
  activeUsers: 42,
  newUsersToday: 3,
  newUsersThisWeek: 12,
  newUsersThisMonth: 28,
  byRole: {
    owner: 1,
    admin: 4,
    manager: 8,
    member: 32,
    guest: 3
  },
  byStatus: {
    active: 42,
    inactive: 3,
    pending: 2,
    suspended: 1,
    deleted: 0
  },
  byDepartment: {
    Leadership: 1,
    Operations: 5,
    Design: 12,
    Development: 15,
    Marketing: 10,
    Sales: 5
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
