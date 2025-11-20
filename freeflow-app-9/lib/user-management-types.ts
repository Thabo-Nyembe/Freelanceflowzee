/**
 * User Management Types
 * Complete type system for user and team management
 */

export type UserRole = 'owner' | 'admin' | 'manager' | 'member' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted'
export type PermissionLevel = 'none' | 'read' | 'write' | 'admin' | 'full'
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatar?: string
  role: UserRole
  status: UserStatus
  department?: string
  jobTitle?: string
  phone?: string
  location?: string
  timezone?: string
  language?: string
  joinedAt: Date
  lastActive?: Date
  permissions: UserPermissions
  settings: UserSettings
  metadata: UserMetadata
}

export interface UserPermissions {
  dashboard: PermissionLevel
  projects: PermissionLevel
  clients: PermissionLevel
  files: PermissionLevel
  analytics: PermissionLevel
  billing: PermissionLevel
  settings: PermissionLevel
  users: PermissionLevel
  integrations: PermissionLevel
  apiAccess: PermissionLevel
}

export interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    slack: boolean
    desktop: boolean
  }
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
    emailVisible: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    dateFormat: string
    timeFormat: '12h' | '24h'
  }
}

export interface UserMetadata {
  totalProjects: number
  totalTasks: number
  completionRate: number
  averageResponseTime: number
  lastLogin: Date
  loginCount: number
  storageUsed: number
}

export interface Team {
  id: string
  name: string
  description?: string
  slug: string
  avatar?: string
  members: TeamMember[]
  owner: string
  createdAt: Date
  updatedAt: Date
  settings: TeamSettings
  stats: TeamStats
}

export interface TeamMember {
  userId: string
  teamId: string
  role: UserRole
  joinedAt: Date
  invitedBy: string
  status: UserStatus
}

export interface TeamSettings {
  visibility: 'public' | 'private' | 'invite-only'
  allowMemberInvites: boolean
  requireApproval: boolean
  maxMembers: number
  features: {
    projects: boolean
    files: boolean
    chat: boolean
    video: boolean
    calendar: boolean
  }
}

export interface TeamStats {
  totalMembers: number
  activeMembers: number
  totalProjects: number
  activeProjects: number
  storageUsed: number
  storageLimit: number
}

export interface Invitation {
  id: string
  email: string
  role: UserRole
  teamId?: string
  invitedBy: string
  invitedAt: Date
  expiresAt: Date
  status: InvitationStatus
  acceptedAt?: Date
  message?: string
}

export interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  target: string
  targetId?: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface Department {
  id: string
  name: string
  description?: string
  headId?: string
  memberIds: string[]
  createdAt: Date
}

export interface RoleTemplate {
  id: string
  name: string
  description: string
  permissions: UserPermissions
  isCustom: boolean
}

export interface BulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'change-role' | 'send-message'
  userIds: string[]
  parameters?: Record<string, any>
}

export interface UserFilter {
  role?: UserRole[]
  status?: UserStatus[]
  department?: string[]
  search?: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  byRole: Record<UserRole, number>
  byStatus: Record<UserStatus, number>
  byDepartment: Record<string, number>
}
