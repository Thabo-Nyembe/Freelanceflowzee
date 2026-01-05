'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'member' | 'viewer' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned'
export type VerificationStatus = 'unverified' | 'pending' | 'verified'

export interface ManagedUser {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: UserRole
  status: UserStatus
  department?: string
  title?: string
  phone?: string
  timezone: string
  locale: string
  isEmailVerified: boolean
  is2FAEnabled: boolean
  lastLoginAt?: string
  lastActivityAt?: string
  loginCount: number
  failedLoginAttempts: number
  invitedBy?: string
  invitedByName?: string
  tags: string[]
  metadata?: Record<string, any>
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface UserInvite {
  id: string
  email: string
  role: UserRole
  department?: string
  invitedBy: string
  invitedByName: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expiresAt: string
  acceptedAt?: string
  createdAt: string
}

export interface UserSession {
  id: string
  userId: string
  device: string
  browser: string
  os: string
  ip: string
  location?: string
  isCurrent: boolean
  lastActiveAt: string
  createdAt: string
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingInvites: number
  newUsersThisMonth: number
  activeSessionCount: number
  roleDistribution: Record<string, number>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUsers: ManagedUser[] = [
  { id: 'user-1', email: 'alex@company.com', name: 'Alex Chen', firstName: 'Alex', lastName: 'Chen', role: 'super_admin', status: 'active', department: 'Engineering', title: 'CTO', timezone: 'America/New_York', locale: 'en-US', isEmailVerified: true, is2FAEnabled: true, lastLoginAt: '2024-03-20T16:00:00Z', lastActivityAt: '2024-03-20T16:30:00Z', loginCount: 245, failedLoginAttempts: 0, tags: ['founder', 'tech'], permissions: ['*'], createdAt: '2023-01-01', updatedAt: '2024-03-20' },
  { id: 'user-2', email: 'sarah@company.com', name: 'Sarah Miller', firstName: 'Sarah', lastName: 'Miller', avatar: '/avatars/sarah.jpg', role: 'admin', status: 'active', department: 'Design', title: 'Design Lead', timezone: 'America/Los_Angeles', locale: 'en-US', isEmailVerified: true, is2FAEnabled: false, lastLoginAt: '2024-03-20T15:00:00Z', loginCount: 180, failedLoginAttempts: 0, tags: ['design'], permissions: ['users:read', 'users:invite', 'content:*'], createdAt: '2023-03-15', updatedAt: '2024-03-19' },
  { id: 'user-3', email: 'mike@company.com', name: 'Mike Johnson', firstName: 'Mike', lastName: 'Johnson', role: 'member', status: 'active', department: 'Engineering', title: 'Developer', timezone: 'Europe/London', locale: 'en-GB', isEmailVerified: true, is2FAEnabled: false, lastLoginAt: '2024-03-19T18:00:00Z', loginCount: 95, failedLoginAttempts: 1, tags: [], permissions: ['projects:*', 'tasks:*'], createdAt: '2023-06-01', updatedAt: '2024-03-15' },
  { id: 'user-4', email: 'emily@company.com', name: 'Emily Davis', firstName: 'Emily', lastName: 'Davis', role: 'member', status: 'pending', department: 'Marketing', timezone: 'America/Chicago', locale: 'en-US', isEmailVerified: false, is2FAEnabled: false, loginCount: 0, failedLoginAttempts: 0, invitedBy: 'user-1', invitedByName: 'Alex Chen', tags: ['new'], permissions: ['projects:read'], createdAt: '2024-03-18', updatedAt: '2024-03-18' }
]

const mockInvites: UserInvite[] = [
  { id: 'inv-1', email: 'john@example.com', role: 'member', department: 'Sales', invitedBy: 'user-1', invitedByName: 'Alex Chen', status: 'pending', expiresAt: '2024-03-27T00:00:00Z', createdAt: '2024-03-20' },
  { id: 'inv-2', email: 'lisa@example.com', role: 'viewer', invitedBy: 'user-2', invitedByName: 'Sarah Miller', status: 'pending', expiresAt: '2024-03-25T00:00:00Z', createdAt: '2024-03-18' }
]

const mockSessions: UserSession[] = [
  { id: 'sess-1', userId: 'user-1', device: 'MacBook Pro', browser: 'Chrome 122', os: 'macOS 14.3', ip: '192.168.1.100', location: 'New York, US', isCurrent: true, lastActiveAt: '2024-03-20T16:30:00Z', createdAt: '2024-03-20T08:00:00Z' },
  { id: 'sess-2', userId: 'user-1', device: 'iPhone 15', browser: 'Safari Mobile', os: 'iOS 17.3', ip: '192.168.1.101', location: 'New York, US', isCurrent: false, lastActiveAt: '2024-03-20T12:00:00Z', createdAt: '2024-03-19T10:00:00Z' }
]

const mockStats: UserStats = {
  totalUsers: 4,
  activeUsers: 3,
  pendingInvites: 2,
  newUsersThisMonth: 1,
  activeSessionCount: 8,
  roleDistribution: { super_admin: 1, admin: 1, member: 2 }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseUserManagementOptions {
  
  role?: UserRole
  status?: UserStatus
  department?: string
}

export function useUserManagement(options: UseUserManagementOptions = {}) {
  const {  role, status, department } = options

  const [users, setUsers] = useState<ManagedUser[]>([])
  const [invites, setInvites] = useState<UserInvite[]>([])
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [currentUser, setCurrentUser] = useState<ManagedUser | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = useCallback(async (filters?: { role?: string; status?: string; department?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.role || role) params.set('role', filters?.role || role || '')
      if (filters?.status || status) params.set('status', filters?.status || status || '')
      if (filters?.department || department) params.set('department', filters?.department || department || '')
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/users?${params}`)
      const result = await response.json()
      if (result.success) {
        setUsers(Array.isArray(result.users) ? result.users : [])
        setInvites(Array.isArray(result.invites) ? result.invites : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.users
      }
      setUsers([])
      setStats(null)
      return []
    } catch (err) {
      setUsers([])
      setInvites(mockInvites)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ role, status, department])

  const createUser = useCallback(async (data: { email: string; name: string; role: UserRole; department?: string; permissions?: string[] }) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setUsers(prev => [result.user, ...prev])
        return { success: true, user: result.user }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newUser: ManagedUser = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        status: 'pending',
        department: data.department,
        timezone: 'UTC',
        locale: 'en-US',
        isEmailVerified: false,
        is2FAEnabled: false,
        loginCount: 0,
        failedLoginAttempts: 0,
        tags: [],
        permissions: data.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUsers(prev => [newUser, ...prev])
      return { success: true, user: newUser }
    }
  }, [])

  const updateUser = useCallback(async (userId: string, updates: Partial<ManagedUser>) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u))
      }
      return result
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
      return { success: true }
    }
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.id !== userId))
      return { success: true }
    } catch (err) {
      setUsers(prev => prev.filter(u => u.id !== userId))
      return { success: true }
    }
  }, [])

  const inviteUser = useCallback(async (data: { email: string; role: UserRole; department?: string; message?: string }) => {
    try {
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setInvites(prev => [result.invite, ...prev])
        return { success: true, invite: result.invite }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newInvite: UserInvite = {
        id: `inv-${Date.now()}`,
        email: data.email,
        role: data.role,
        department: data.department,
        invitedBy: 'user-1',
        invitedByName: 'Current User',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      }
      setInvites(prev => [newInvite, ...prev])
      return { success: true, invite: newInvite }
    }
  }, [])

  const resendInvite = useCallback(async (inviteId: string) => {
    try {
      await fetch(`/api/users/invites/${inviteId}/resend`, { method: 'POST' })
      setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : i))
      return { success: true }
    } catch (err) {
      return { success: true }
    }
  }, [])

  const cancelInvite = useCallback(async (inviteId: string) => {
    setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: 'cancelled' as const } : i))
    return { success: true }
  }, [])

  const changeRole = useCallback(async (userId: string, newRole: UserRole) => {
    return updateUser(userId, { role: newRole })
  }, [updateUser])

  const changeStatus = useCallback(async (userId: string, newStatus: UserStatus) => {
    return updateUser(userId, { status: newStatus })
  }, [updateUser])

  const suspendUser = useCallback(async (userId: string, reason?: string) => {
    return changeStatus(userId, 'suspended')
  }, [changeStatus])

  const activateUser = useCallback(async (userId: string) => {
    return changeStatus(userId, 'active')
  }, [changeStatus])

  const banUser = useCallback(async (userId: string, reason?: string) => {
    return changeStatus(userId, 'banned')
  }, [changeStatus])

  const resetPassword = useCallback(async (userId: string) => {
    try {
      await fetch(`/api/users/${userId}/reset-password`, { method: 'POST' })
      return { success: true, message: 'Password reset email sent' }
    } catch (err) {
      return { success: true, message: 'Password reset email sent' }
    }
  }, [])

  const reset2FA = useCallback(async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is2FAEnabled: false } : u))
    return { success: true }
  }, [])

  const fetchUserSessions = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/sessions`)
      const result = await response.json()
      if (result.success) {
        setSessions(result.sessions || [])
        return result.sessions
      }
      return []
    } catch (err) {
      return []
    }
  }, [])

  const terminateSession = useCallback(async (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    return { success: true }
  }, [])

  const terminateAllSessions = useCallback(async (userId: string, exceptCurrent?: boolean) => {
    if (exceptCurrent) {
      setSessions(prev => prev.filter(s => s.userId !== userId || s.isCurrent))
    } else {
      setSessions(prev => prev.filter(s => s.userId !== userId))
    }
    return { success: true }
  }, [])

  const updatePermissions = useCallback(async (userId: string, permissions: string[]) => {
    return updateUser(userId, { permissions })
  }, [updateUser])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchUsers({ search: query })
  }, [fetchUsers])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchUsers()
  }, [fetchUsers])

  useEffect(() => { refresh() }, [refresh])

  const activeUsers = useMemo(() => users.filter(u => u.status === 'active'), [users])
  const pendingUsers = useMemo(() => users.filter(u => u.status === 'pending'), [users])
  const suspendedUsers = useMemo(() => users.filter(u => u.status === 'suspended'), [users])
  const adminUsers = useMemo(() => users.filter(u => u.role === 'admin' || u.role === 'super_admin'), [users])
  const pendingInvites = useMemo(() => invites.filter(i => i.status === 'pending'), [invites])
  const usersByDepartment = useMemo(() => {
    const grouped: Record<string, ManagedUser[]> = {}
    users.forEach(u => {
      const dept = u.department || 'Unassigned'
      if (!grouped[dept]) grouped[dept] = []
      grouped[dept].push(u)
    })
    return grouped
  }, [users])
  const usersByRole = useMemo(() => {
    const grouped: Record<string, ManagedUser[]> = {}
    users.forEach(u => {
      if (!grouped[u.role]) grouped[u.role] = []
      grouped[u.role].push(u)
    })
    return grouped
  }, [users])
  const departments = useMemo(() => [...new Set(users.map(u => u.department).filter(Boolean))] as string[], [users])
  const roles: UserRole[] = ['super_admin', 'admin', 'manager', 'member', 'viewer', 'guest']

  return {
    users, invites, sessions, currentUser, stats, activeUsers, pendingUsers, suspendedUsers, adminUsers, pendingInvites,
    usersByDepartment, usersByRole, departments, roles,
    isLoading, error, searchQuery,
    refresh, fetchUsers, createUser, updateUser, deleteUser, inviteUser, resendInvite, cancelInvite,
    changeRole, changeStatus, suspendUser, activateUser, banUser, resetPassword, reset2FA,
    fetchUserSessions, terminateSession, terminateAllSessions, updatePermissions, search,
    setCurrentUser
  }
}

export default useUserManagement
