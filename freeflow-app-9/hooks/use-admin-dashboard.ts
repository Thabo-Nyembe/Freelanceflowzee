'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface AdminOverview {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  totalRevenue: number
  monthlyRevenue: number
  totalProjects: number
  activeProjects: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  uptime: number
  lastIncident?: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'superadmin'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  plan: string
  createdAt: string
  lastLoginAt?: string
  projectsCount: number
  totalRevenue: number
}

export interface AdminStats {
  userGrowth: { date: string; count: number }[]
  revenueGrowth: { date: string; amount: number }[]
  projectsCreated: { date: string; count: number }[]
  activeUsersTrend: { date: string; count: number }[]
}

export interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  threshold?: number
}

export interface AdminAuditLog {
  id: string
  action: string
  resource: string
  resourceId?: string
  userId: string
  userName: string
  ipAddress?: string
  timestamp: string
  details?: Record<string, any>
}

export interface AdminSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerificationRequired: boolean
  maxProjectsPerUser: number
  maxStoragePerUser: number
  defaultUserPlan: string
  supportEmail: string
  apiRateLimit: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockOverview: AdminOverview = {
  totalUsers: 12450,
  activeUsers: 8320,
  newUsersToday: 47,
  newUsersThisWeek: 312,
  totalRevenue: 1250000,
  monthlyRevenue: 125000,
  totalProjects: 45200,
  activeProjects: 12300,
  systemHealth: 'healthy',
  uptime: 99.98
}

const mockUsers: AdminUser[] = [
  { id: 'u-1', email: 'john@example.com', name: 'John Smith', role: 'user', status: 'active', plan: 'Pro', createdAt: '2024-01-15', lastLoginAt: new Date().toISOString(), projectsCount: 12, totalRevenue: 4500 },
  { id: 'u-2', email: 'jane@example.com', name: 'Jane Doe', role: 'admin', status: 'active', plan: 'Enterprise', createdAt: '2023-11-20', lastLoginAt: new Date(Date.now() - 3600000).toISOString(), projectsCount: 45, totalRevenue: 25000 },
  { id: 'u-3', email: 'bob@example.com', name: 'Bob Wilson', role: 'user', status: 'suspended', plan: 'Basic', createdAt: '2024-06-10', projectsCount: 3, totalRevenue: 500 },
  { id: 'u-4', email: 'alice@example.com', name: 'Alice Brown', role: 'user', status: 'pending', plan: 'Pro', createdAt: new Date().toISOString(), projectsCount: 0, totalRevenue: 0 },
  { id: 'u-5', email: 'charlie@example.com', name: 'Charlie Davis', role: 'user', status: 'active', plan: 'Pro', createdAt: '2024-03-22', lastLoginAt: new Date(Date.now() - 86400000).toISOString(), projectsCount: 28, totalRevenue: 12000 }
]

const mockStats: AdminStats = {
  userGrowth: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    count: 12000 + Math.floor(Math.random() * 500)
  })),
  revenueGrowth: Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 30 * 86400000).toISOString().split('T')[0],
    amount: 100000 + Math.floor(Math.random() * 30000)
  })),
  projectsCreated: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
    count: 50 + Math.floor(Math.random() * 30)
  })),
  activeUsersTrend: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
    count: 8000 + Math.floor(Math.random() * 500)
  }))
}

const mockMetrics: SystemMetric[] = [
  { name: 'CPU Usage', value: 42, unit: '%', status: 'normal', threshold: 80 },
  { name: 'Memory Usage', value: 68, unit: '%', status: 'normal', threshold: 85 },
  { name: 'Disk Usage', value: 55, unit: '%', status: 'normal', threshold: 90 },
  { name: 'API Response Time', value: 145, unit: 'ms', status: 'normal', threshold: 500 },
  { name: 'Database Connections', value: 42, unit: '', status: 'normal', threshold: 100 },
  { name: 'Error Rate', value: 0.12, unit: '%', status: 'normal', threshold: 1 }
]

const mockAuditLogs: AdminAuditLog[] = [
  { id: 'al-1', action: 'user.suspend', resource: 'users', resourceId: 'u-3', userId: 'admin-1', userName: 'Admin User', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'al-2', action: 'settings.update', resource: 'system', userId: 'admin-1', userName: 'Admin User', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'al-3', action: 'user.create', resource: 'users', resourceId: 'u-4', userId: 'system', userName: 'System', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'al-4', action: 'plan.upgrade', resource: 'subscriptions', resourceId: 'sub-123', userId: 'u-2', userName: 'Jane Doe', timestamp: new Date(Date.now() - 172800000).toISOString() }
]

const mockSettings: AdminSettings = {
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  maxProjectsPerUser: 100,
  maxStoragePerUser: 10737418240, // 10GB
  defaultUserPlan: 'free',
  supportEmail: 'support@kazi.app',
  apiRateLimit: 1000
}

// ============================================================================
// HOOK
// ============================================================================

interface UseAdminDashboardOptions {
  
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAdminDashboard(options: UseAdminDashboardOptions = {}) {
  const {
    
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  // State
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([])
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [userFilter, setUserFilter] = useState<{
    status?: string
    role?: string
    plan?: string
    search?: string
  }>({})

  // Fetch overview
  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/overview')
      const result = await response.json()

      if (result.success && result.data) {
        const overview: AdminOverview = {
          totalUsers: result.data.totalUsers || 0,
          activeUsers: result.data.activeUsers || 0,
          newUsersToday: result.data.newUsersToday || 0,
          newUsersThisWeek: result.data.newUsersThisWeek || 0,
          totalRevenue: result.data.totalRevenue || 0,
          monthlyRevenue: result.data.monthlyRevenue || 0,
          totalProjects: result.data.activeProjects || 0,
          activeProjects: result.data.activeProjects || 0,
          systemHealth: 'healthy',
          uptime: 99.98
        }
        setOverview(overview)
        return overview
      }
      setOverview(null)
      return []
    } catch (err) {
      console.error('Error fetching admin overview:', err)
      setOverview(null)
      return []
    }
  }, [])

  // Fetch users
  const fetchUsers = useCallback(async (filters?: typeof userFilter) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.role) params.set('role', filters.role)
      if (filters?.plan) params.set('plan', filters.plan)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/admin/users?${params}`)
      const result = await response.json()

      if (result.success && result.users) {
        setUsers(result.users)
        return result.users
      }
      setUsers([])
      return []
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([])
      return []
    }
  }, [])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      const result = await response.json()

      if (result.success && result.data) {
        setStats(null) // Use mock for chart data
        return []
      }
      setStats(null)
      return []
    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setStats(null)
      return []
    }
  }, [])

  // Fetch system metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      const result = await response.json()

      if (result.success && result.metrics) {
        setMetrics(result.metrics)
        return result.metrics
      }
      setMetrics(null)
      return []
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setMetrics(null)
      return []
    }
  }, [])

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async (limit = 50) => {
    try {
      const response = await fetch(`/api/logs?action=audit&limit=${limit}`)
      const result = await response.json()

      if (result.success && result.audit) {
        setAuditLogs(result.audit)
        return result.audit
      }
      setAuditLogs([])
      return []
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setAuditLogs([])
      return []
    }
  }, [])

  // Fetch admin settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const result = await response.json()

      if (result.success && result.settings) {
        setSettings(result.settings)
        return result.settings
      }
      setSettings(mockSettings)
      return []
    } catch (err) {
      console.error('Error fetching admin settings:', err)
      setSettings(mockSettings)
      return []
    }
  }, [])

  // User management actions
  const updateUserStatus = useCallback(async (userId: string, status: AdminUser['status']) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const result = await response.json()
      if (result.success) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status } : u
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error updating user status:', err)
      return { success: false, error: 'Failed to update user status' }
    }
  }, [])

  const updateUserRole = useCallback(async (userId: string, role: AdminUser['role']) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      const result = await response.json()
      if (result.success) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, role } : u
        ))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error updating user role:', err)
      return { success: false, error: 'Failed to update user role' }
    }
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error deleting user:', err)
      return { success: false, error: 'Failed to delete user' }
    }
  }, [])

  // Update admin settings
  const updateSettings = useCallback(async (updates: Partial<AdminSettings>) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const result = await response.json()
      if (result.success) {
        setSettings(prev => prev ? { ...prev, ...updates } : null)
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      console.error('Error updating settings:', err)
      return { success: false, error: 'Failed to update settings' }
    }
  }, [])

  // Toggle maintenance mode
  const toggleMaintenanceMode = useCallback(async (enabled: boolean) => {
    return updateSettings({ maintenanceMode: enabled })
  }, [updateSettings])

  // Refresh all data
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([
      fetchOverview(),
      fetchUsers(userFilter),
      fetchStats(),
      fetchMetrics(),
      fetchAuditLogs(),
      fetchSettings()
    ])
    setIsLoading(false)
  }, [fetchOverview, fetchUsers, fetchStats, fetchMetrics, fetchAuditLogs, fetchSettings, userFilter])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Re-fetch users when filter changes
  useEffect(() => {
    fetchUsers(userFilter)
  }, [userFilter, fetchUsers])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchOverview()
      fetchMetrics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchOverview, fetchMetrics])

  // Computed values
  const activeUsersPercentage = useMemo(() => {
    if (!overview) return 0
    return Math.round((overview.activeUsers / overview.totalUsers) * 100)
  }, [overview])

  const usersByStatus = useMemo(() => {
    const counts: Record<string, number> = { active: 0, inactive: 0, suspended: 0, pending: 0 }
    users.forEach(u => {
      counts[u.status] = (counts[u.status] || 0) + 1
    })
    return counts
  }, [users])

  const usersByRole = useMemo(() => {
    const counts: Record<string, number> = { user: 0, admin: 0, superadmin: 0 }
    users.forEach(u => {
      counts[u.role] = (counts[u.role] || 0) + 1
    })
    return counts
  }, [users])

  const criticalMetrics = useMemo(() =>
    metrics.filter(m => m.status === 'critical'),
  [metrics])

  const warningMetrics = useMemo(() =>
    metrics.filter(m => m.status === 'warning'),
  [metrics])

  return {
    // Data
    overview,
    users,
    stats,
    metrics,
    auditLogs,
    settings,
    usersByStatus,
    usersByRole,
    criticalMetrics,
    warningMetrics,

    // State
    isLoading,
    error,
    userFilter,
    activeUsersPercentage,

    // Fetch methods
    refresh,
    fetchOverview,
    fetchUsers,
    fetchStats,
    fetchMetrics,
    fetchAuditLogs,
    fetchSettings,

    // User actions
    setUserFilter,
    updateUserStatus,
    updateUserRole,
    deleteUser,

    // Settings actions
    updateSettings,
    toggleMaintenanceMode,
  }
}

export default useAdminDashboard
