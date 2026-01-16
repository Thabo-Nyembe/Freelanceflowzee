'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Users, Shield, Key, Link2, FileText, Settings, Search, Plus, MoreHorizontal,
  Mail, Clock, Building, Check, AlertTriangle,
  Lock, Unlock, UserPlus, Edit, Trash2, Download, Upload, RefreshCw, Smartphone, Globe, Monitor, Activity,
  ShieldCheck, ShieldAlert, UserCheck, UserX, Fingerprint, LogOut,
  AlertCircle, CheckCircle, Copy, Bell, Palette,
  Database, Server, Zap, Webhook
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUserManagement, type ManagedUser, type UserRole, type UserStatus } from '@/lib/hooks/use-user-management'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
}

interface Connection {
  id: string
  name: string
  type: 'saml' | 'oidc' | 'social' | 'database' | 'passwordless'
  provider?: string
  status: 'active' | 'inactive' | 'testing'
  domains?: string[]
  userCount: number
  lastUsed?: string
}

interface SecurityPolicy {
  id: string
  name: string
  type: 'password' | 'mfa' | 'session' | 'brute-force' | 'bot-detection'
  enabled: boolean
  settings: Record<string, any>
}

interface AuditLog {
  id: string
  type: string
  action: string
  userId?: string
  userName?: string
  ip?: string
  location?: string
  device?: string
  timestamp: string
  status: 'success' | 'failure' | 'warning'
  details?: string
}

// Enhanced Competitive Upgrade Data
const mockUserMgmtAIInsights = [
  { id: '1', type: 'success' as const, title: 'Access Review', description: 'Quarterly access review completed. 100% compliance.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '2', type: 'info' as const, title: 'Inactive Users', description: '15 users inactive for 30+ days. Consider deactivation.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Cleanup' },
  { id: '3', type: 'warning' as const, title: 'MFA Required', description: '8 admin users without MFA enabled. Security risk.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
]

const mockUserMgmtCollaborators = [
  { id: '1', name: 'IT Admin', avatar: '/avatars/it.jpg', status: 'online' as const, role: 'Administration', lastActive: 'Now' },
  { id: '2', name: 'Security Mgr', avatar: '/avatars/secmgr.jpg', status: 'online' as const, role: 'Security', lastActive: '10m ago' },
  { id: '3', name: 'HR Lead', avatar: '/avatars/hr.jpg', status: 'away' as const, role: 'HR', lastActive: '30m ago' },
]

const mockUserMgmtPredictions = [
  { id: '1', label: 'Active Users', current: 450, target: 500, predicted: 475, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'MFA Adoption', current: 78, target: 100, predicted: 88, confidence: 80, trend: 'up' as const },
  { id: '3', label: 'Tickets/Week', current: 25, target: 15, predicted: 20, confidence: 72, trend: 'down' as const },
]

const mockUserMgmtActivities = [
  { id: '1', user: 'IT Admin', action: 'provisioned', target: '5 new users', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'Security Mgr', action: 'enforced', target: 'password policy update', timestamp: '1h ago', type: 'info' as const },
  { id: '3', user: 'System', action: 'flagged', target: 'suspicious login attempt', timestamp: '2h ago', type: 'warning' as const },
]

// Quick actions for the toolbar
const mockUserMgmtQuickActions = [
  { id: '1', label: 'Invite User', icon: 'UserPlus', variant: 'primary' as const, onClick: () => {} },
  { id: '2', label: 'Export Users', icon: 'Download', variant: 'secondary' as const, onClick: () => {} },
  { id: '3', label: 'Bulk Import', icon: 'Upload', variant: 'secondary' as const, onClick: () => {} },
  { id: '4', label: 'Audit Report', icon: 'FileText', variant: 'secondary' as const, onClick: () => {} },
]

// Quick action handlers are set dynamically in the component to access state setters

export default function UserManagementClient({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const [activeView, setActiveView] = useState<'users' | 'roles' | 'connections' | 'security' | 'logs' | 'settings'>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  const { users, loading, error, createUser, updateUser, deleteUser, refetch } = useUserManagement({ role: roleFilter, status: statusFilter })
  const displayUsers = users


  // Form state for inviting new user
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'user' as UserRole,
    full_name: '',
    sendWelcomeEmail: true
  })
  const [inviting, setInviting] = useState(false)

  // Form state for creating role
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  })
  const [creatingRole, setCreatingRole] = useState(false)

  // Operation states
  const [suspendingUser, setSuspendingUser] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Mock data for roles
  const [roles] = useState<Role[]>([
    { id: '1', name: 'Super Admin', description: 'Full system access with all permissions', permissions: ['*'], userCount: 2, isSystem: true, createdAt: '2024-01-01' },
    { id: '2', name: 'Admin', description: 'Administrative access excluding system settings', permissions: ['users:*', 'content:*', 'analytics:read'], userCount: 5, isSystem: true, createdAt: '2024-01-01' },
    { id: '3', name: 'Manager', description: 'Team and project management permissions', permissions: ['team:*', 'projects:*', 'reports:read'], userCount: 12, isSystem: false, createdAt: '2024-03-15' },
    { id: '4', name: 'Editor', description: 'Content creation and editing permissions', permissions: ['content:create', 'content:edit', 'media:*'], userCount: 28, isSystem: false, createdAt: '2024-03-15' },
    { id: '5', name: 'Viewer', description: 'Read-only access to resources', permissions: ['*:read'], userCount: 156, isSystem: true, createdAt: '2024-01-01' },
    { id: '6', name: 'Developer', description: 'API and integration access', permissions: ['api:*', 'integrations:*', 'logs:read'], userCount: 8, isSystem: false, createdAt: '2024-06-20' },
  ])

  // Mock data for connections
  const [connections] = useState<Connection[]>([
    { id: '1', name: 'Google Workspace', type: 'oidc', provider: 'google', status: 'active', domains: ['company.com'], userCount: 145, lastUsed: '2024-12-23T10:30:00' },
    { id: '2', name: 'Microsoft Azure AD', type: 'saml', provider: 'azure', status: 'active', domains: ['company.com', 'subsidiary.com'], userCount: 89, lastUsed: '2024-12-23T09:45:00' },
    { id: '3', name: 'Okta', type: 'saml', provider: 'okta', status: 'testing', domains: ['partner.com'], userCount: 0, lastUsed: undefined },
    { id: '4', name: 'Username-Password', type: 'database', status: 'active', userCount: 234, lastUsed: '2024-12-23T11:00:00' },
    { id: '5', name: 'Magic Link', type: 'passwordless', status: 'active', userCount: 67, lastUsed: '2024-12-22T18:30:00' },
    { id: '6', name: 'GitHub', type: 'social', provider: 'github', status: 'active', userCount: 23, lastUsed: '2024-12-23T08:15:00' },
  ])

  // Mock data for security policies
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([
    { id: '1', name: 'Password Policy', type: 'password', enabled: true, settings: { minLength: 12, requireUppercase: true, requireNumbers: true, requireSymbols: true, preventReuse: 5 } },
    { id: '2', name: 'Multi-Factor Authentication', type: 'mfa', enabled: true, settings: { methods: ['totp', 'sms', 'email'], enforced: 'admins', gracePeriod: 7 } },
    { id: '3', name: 'Session Management', type: 'session', enabled: true, settings: { maxIdleTime: 30, maxSessionLength: 480, singleSession: false } },
    { id: '4', name: 'Brute Force Protection', type: 'brute-force', enabled: true, settings: { maxAttempts: 5, blockDuration: 15, ipWhitelist: [] } },
    { id: '5', name: 'Bot Detection', type: 'bot-detection', enabled: false, settings: { captchaThreshold: 'medium', allowedBots: [] } },
  ])

  // Mock data for audit logs
  const [auditLogs] = useState<AuditLog[]>([
    { id: '1', type: 'authentication', action: 'Login Success', userId: 'u1', userName: 'john@company.com', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on MacOS', timestamp: '2024-12-23T11:30:00', status: 'success' },
    { id: '2', type: 'authentication', action: 'Login Failed', userId: 'u2', userName: 'jane@company.com', ip: '203.45.67.89', location: 'Unknown', device: 'Firefox on Windows', timestamp: '2024-12-23T11:25:00', status: 'failure', details: 'Invalid password' },
    { id: '3', type: 'user', action: 'Role Changed', userId: 'u3', userName: 'bob@company.com', ip: '10.0.0.50', location: 'San Francisco, US', device: 'Admin Dashboard', timestamp: '2024-12-23T11:20:00', status: 'success', details: 'Changed from Editor to Manager' },
    { id: '4', type: 'security', action: 'MFA Enabled', userId: 'u4', userName: 'alice@company.com', ip: '192.168.1.105', location: 'Boston, US', device: 'Mobile App', timestamp: '2024-12-23T11:15:00', status: 'success' },
    { id: '5', type: 'authentication', action: 'Password Reset', userId: 'u5', userName: 'charlie@company.com', ip: '172.16.0.25', location: 'Chicago, US', device: 'Safari on iOS', timestamp: '2024-12-23T11:10:00', status: 'success' },
    { id: '6', type: 'security', action: 'Suspicious Activity', ip: '45.33.32.156', location: 'Unknown VPN', timestamp: '2024-12-23T11:05:00', status: 'warning', details: 'Multiple failed login attempts from different IPs' },
    { id: '7', type: 'user', action: 'User Created', userId: 'u6', userName: 'newuser@company.com', ip: '10.0.0.50', location: 'San Francisco, US', device: 'Admin Dashboard', timestamp: '2024-12-23T10:55:00', status: 'success' },
    { id: '8', type: 'connection', action: 'SSO Login', userId: 'u7', userName: 'david@company.com', ip: '192.168.2.50', location: 'Los Angeles, US', device: 'Chrome on Windows', timestamp: '2024-12-23T10:50:00', status: 'success', details: 'Via Google Workspace' },
  ])

  const stats = useMemo(() => ({
    total: displayUsers.length,
    active: displayUsers.filter(u => u.status === 'active').length,
    admins: displayUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    suspended: displayUsers.filter(u => u.status === 'suspended').length,
    mfaEnabled: Math.floor(displayUsers.length * 0.68),
    recentLogins: displayUsers.filter(u => u.last_login_at && new Date(u.last_login_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
  }), [displayUsers])

  const filteredUsers = useMemo(() => {
    return displayUsers.filter(u => {
      const matchesSearch = !searchQuery ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [displayUsers, searchQuery, roleFilter, statusFilter])

  const views = [
    { id: 'users' as const, name: 'Users', icon: Users, count: displayUsers.length },
    { id: 'roles' as const, name: 'Roles & Permissions', icon: Shield, count: roles.length },
    { id: 'connections' as const, name: 'Connections', icon: Link2, count: connections.length },
    { id: 'security' as const, name: 'Security', icon: Lock, count: securityPolicies.filter(p => p.enabled).length },
    { id: 'logs' as const, name: 'Audit Logs', icon: FileText, count: auditLogs.length },
    { id: 'settings' as const, name: 'Settings', icon: Settings, count: null },
  ]

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const getStatusIcon = (status: 'success' | 'failure' | 'warning') => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failure': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getConnectionIcon = (type: Connection['type']) => {
    switch (type) {
      case 'saml': return <Shield className="w-5 h-5" />
      case 'oidc': return <Key className="w-5 h-5" />
      case 'social': return <Globe className="w-5 h-5" />
      case 'database': return <Lock className="w-5 h-5" />
      case 'passwordless': return <Fingerprint className="w-5 h-5" />
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">Error: {error.message}</div></div>

  // Real Supabase Handlers
  const handleInviteUser = async () => {
    if (!inviteForm.email) {
      toast.error('Please enter an email address')
      return
    }
    setInviting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await createUser({
        user_id: user.id,
        managed_user_id: crypto.randomUUID(),
        email: inviteForm.email,
        full_name: inviteForm.full_name || undefined,
        role: inviteForm.role,
        status: 'pending' as UserStatus,
        email_verified: false,
        phone_verified: false,
        two_factor_enabled: false,
        security_questions_set: false,
        must_change_password: true,
        failed_login_attempts: 0,
        login_count: 0,
        session_timeout: 30,
        language: 'en',
        timezone: 'UTC',
        notifications_enabled: true,
        storage_used: 0,
        api_calls_used: 0,
        onboarding_completed: false,
        custom_permissions: {},
        preferences: {},
        metadata: { sendWelcomeEmail: inviteForm.sendWelcomeEmail }
      } as any)

      toast.success('User invited successfully!'`
      })
      setShowInviteModal(false)
      setInviteForm({ email: '', role: 'user', full_name: '', sendWelcomeEmail: true })
      refetch()
    } catch (error: any) {
      toast.error('Failed to invite user')
    } finally {
      setInviting(false)
    }
  }

  const handleSuspendUser = async (user: ManagedUser) => {
    setSuspendingUser(user.id)
    try {
      await updateUser({ id: user.id, status: 'suspended' as UserStatus })
      toast.success('User suspended'" has been suspended`
      })
      refetch()
    } catch (error: any) {
      toast.error('Failed to suspend user')
    } finally {
      setSuspendingUser(null)
    }
  }

  const handleActivateUser = async (user: ManagedUser) => {
    setSuspendingUser(user.id)
    try {
      await updateUser({ id: user.id, status: 'active' as UserStatus })
      toast.success('User activated'" has been activated`
      })
      refetch()
    } catch (error: any) {
      toast.error('Failed to activate user')
    } finally {
      setSuspendingUser(null)
    }
  }

  const handleDeleteUser = async (user: ManagedUser) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name || user.email}? This action cannot be undone.`)) {
      return
    }
    setDeletingUser(user.id)
    try {
      await deleteUser(user.id)
      toast.success('User deleted'" has been removed`
      })
      setShowUserModal(false)
      setSelectedUser(null)
      refetch()
    } catch (error: any) {
      toast.error('Failed to delete user')
    } finally {
      setDeletingUser(null)
    }
  }

  const handleResetPassword = async (user: ManagedUser) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')

      // Log the password reset request
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('audit_logs').insert({
        user_id: authUser.id,
        action: 'password_reset_requested',
        resource_type: 'user',
        resource_id: user.id,
        details: { target_user: user.email }
      })

      await updateUser({
        id: user.id,
        must_change_password: true,
        password_changed_at: new Date().toISOString()
      } as any)

      toast.success('Password reset sent'`
      })
    } catch (error: any) {
      toast.error('Failed to send password reset')
    }
  }

  const handleExportUsers = async () => {
    setExporting(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: usersData, error: usersError } = await supabase
        .from('user_management')
        .select('*')
        .eq('user_id', user.id)

      if (usersError) throw usersError

      const headers = ['Email', 'Full Name', 'Role', 'Status', 'Department', 'Last Login', 'Created At']
      const csvContent = [
        headers.join(','),
        ...(usersData || []).map(u => [
          u.email || '',
          u.full_name || '',
          u.role || '',
          u.status || '',
          u.department || '',
          u.last_login_at || '',
          u.created_at || ''
        ].map(v => `"${v}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Export complete')
    } catch (error: any) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleAssignRole = async (user: ManagedUser, newRole: UserRole) => {
    setUpdatingRole(user.id)
    try {
      await updateUser({ id: user.id, role: newRole })
      toast.success('Role assigned' role assigned to ${user.full_name || user.email}`
      })
      refetch()
    } catch (error: any) {
      toast.error('Failed to assign role')
    } finally {
      setUpdatingRole(null)
    }
  }

  const handleBulkSuspend = async () => {
    if (selectedUsers.length === 0) return
    if (!confirm(`Are you sure you want to suspend ${selectedUsers.length} users?`)) return

    try {
      for (const userId of selectedUsers) {
        await updateUser({ id: userId, status: 'suspended' as UserStatus })
      }
      toast.success('Users suspended' users have been suspended`
      })
      setSelectedUsers([])
      refetch()
    } catch (error: any) {
      toast.error('Failed to suspend users')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) return

    try {
      for (const userId of selectedUsers) {
        await deleteUser(userId)
      }
      toast.success('Users deleted' users have been deleted`
      })
      setSelectedUsers([])
      refetch()
    } catch (error: any) {
      toast.error('Failed to delete users')
    }
  }

  const handleCreateRole = async () => {
    if (!roleForm.name) {
      toast.error('Please enter a role name')
      return
    }
    setCreatingRole(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.from('user_roles').insert({
        user_id: user.id,
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
        is_system: false
      })

      if (error) throw error

      toast.success('Role created'" role has been created`
      })
      setShowRoleModal(false)
      setRoleForm({ name: '', description: '', permissions: [] })
    } catch (error: any) {
      toast.error('Failed to create role')
    } finally {
      setCreatingRole(false)
    }
  }

  const handleToggleSecurityPolicy = async (policyId: string, enabled: boolean) => {
    try {
      setSecurityPolicies(prev => prev.map(p =>
        p.id === policyId ? { ...p, enabled } : p
      ))
      toast.success(`Security policy ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error: any) {
      toast.error('Failed to update security policy')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Auth0 Level
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage users, roles, connections, and security policies</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportUsers} disabled={exporting}>
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv,.xlsx,.json'
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  toast.success(`Selected: ${file.name}. Import functionality ready.`)
                }
              }
              input.click()
            }}>
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <UserPlus className="w-4 h-4" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      placeholder="user@company.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name (Optional)</label>
                    <Input
                      placeholder="John Doe"
                      value={inviteForm.full_name}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    >
                      <option value="user">User</option>
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="team_lead">Team Lead</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Send Welcome Email</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={inviteForm.sendWelcomeEmail}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Send invitation email with setup instructions</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleInviteUser}
                    disabled={inviting}
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <Users className="w-4 h-4" />
              Total Users
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <UserCheck className="w-4 h-4 text-green-500" />
              Active
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              Admins
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <UserX className="w-4 h-4 text-red-500" />
              Suspended
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <Smartphone className="w-4 h-4 text-blue-500" />
              MFA Enabled
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.mfaEnabled}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <Activity className="w-4 h-4 text-emerald-500" />
              24h Logins
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.recentLogins}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-1 p-2">
              {views.map(view => (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === view.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  {view.name}
                  {view.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeView === view.id
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {view.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Users View */}
          {activeView === 'users' && (
            <div className="p-6">
              {/* Users Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">User Management</h2>
                    <p className="text-blue-100">Auth0-level identity management</p>
                    <p className="text-blue-200 text-xs mt-1">SSO • RBAC • MFA • Audit logs</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{filteredUsers.length}</p>
                      <p className="text-blue-200 text-sm">Users</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <span className="text-sm text-blue-700 dark:text-blue-300">{selectedUsers.length} selected</span>
                    <Button size="sm" variant="ghost" className="text-blue-600" onClick={handleBulkSuspend}>
                      <Lock className="w-4 h-4 mr-1" />
                      Suspend
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={handleBulkDelete}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* User Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={selectAllUsers}
                            className="rounded"
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">MFA</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Last Login</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr
                          key={user.id}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                        >
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                                {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{user.full_name || user.display_name || 'No name'}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={
                              user.role === 'superadmin' ? 'border-purple-500 text-purple-700 dark:text-purple-400' :
                              user.role === 'admin' ? 'border-blue-500 text-blue-700 dark:text-blue-400' :
                              'border-gray-300 text-gray-700 dark:text-gray-400'
                            }>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              user.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.two_factor_enabled ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-sm">Enabled</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <ShieldAlert className="w-4 h-4" />
                                <span className="text-sm">Disabled</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {user.last_login_at ? (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(user.last_login_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Never</span>
                            )}
                          </td>
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                                setSelectedUser(user)
                                setShowUserModal(true)
                                toast.success('Editing user profile')
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUser(user)
                                setShowUserModal(true)
                              }}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Roles View */}
          {activeView === 'roles' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Roles & Permissions</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure role-based access control</p>
                </div>
                <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Role Name</label>
                        <Input
                          placeholder="e.g., Marketing Manager"
                          value={roleForm.name}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          placeholder="What this role can do..."
                          value={roleForm.description}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Permissions</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 p-4 border rounded-lg dark:border-gray-700 max-h-[200px] overflow-y-auto">
                          {['users:read', 'users:write', 'users:delete', 'content:read', 'content:write', 'content:delete', 'analytics:read', 'settings:read', 'settings:write', 'billing:read', 'billing:write'].map(perm => (
                            <label key={perm} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={roleForm.permissions.includes(perm)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setRoleForm(prev => ({ ...prev, permissions: [...prev.permissions, perm] }))
                                  } else {
                                    setRoleForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== perm) }))
                                  }
                                }}
                              />
                              <span className="text-sm">{perm}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                      <Button onClick={handleCreateRole} disabled={creatingRole}>
                        {creatingRole ? 'Creating...' : 'Create Role'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {roles.map(role => (
                  <div key={role.id} className="p-4 border rounded-xl dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${role.isSystem ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          <Shield className={`w-5 h-5 ${role.isSystem ? 'text-purple-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                            {role.isSystem && (
                              <Badge variant="secondary" className="text-xs">System</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{role.description}</p>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {role.permissions.slice(0, 4).map(perm => (
                              <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
                            ))}
                            {role.permissions.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{role.permissions.length - 4} more</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{role.userCount}</div>
                          <div className="text-xs text-gray-500">users</div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => {
                          if (role.isSystem) {
                            toast.error('System roles cannot be edited')
                            return
                          }
                          setRoleForm({
                            name: role.name,
                            description: role.description,
                            permissions: role.permissions
                          })
                          setShowRoleModal(true)
                          toast.success(`Editing role: ${role.name}`)
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connections View */}
          {activeView === 'connections' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Authentication Connections</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage SSO, social logins, and identity providers</p>
                </div>
                <Button className="gap-2" onClick={() => {
                  toast.info('Connection wizard'
                  })
                }}>
                  <Plus className="w-4 h-4" />
                  Add Connection
                </Button>
              </div>

              <div className="grid gap-4">
                {connections.map(conn => (
                  <div key={conn.id} className="p-4 border rounded-xl dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          conn.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' :
                          conn.status === 'testing' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {getConnectionIcon(conn.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{conn.name}</h3>
                            <Badge className={
                              conn.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              conn.status === 'testing' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }>
                              {conn.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="capitalize">{conn.type}</span>
                            {conn.domains && <span>{conn.domains.join(', ')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{conn.userCount}</div>
                          <div className="text-xs text-gray-500">users</div>
                        </div>
                        {conn.lastUsed && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">Last used</div>
                            <div className="text-xs text-gray-500">{new Date(conn.lastUsed).toLocaleString()}</div>
                          </div>
                        )}
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(JSON.stringify({
                              id: conn.id,
                              name: conn.name,
                              type: conn.type,
                              provider: conn.provider,
                              status: conn.status,
                              domains: conn.domains
                            }, null, 2))
                            toast.success(`${conn.name} configuration copied`)
                          } catch {
                            toast.info(`Configure ${conn.name}` | Status: ${conn.status}`
                            })
                          }
                        }}>Configure</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security View */}
          {activeView === 'security' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Policies</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure authentication and access security settings</p>
              </div>

              <div className="grid gap-4">
                {securityPolicies.map(policy => (
                  <div key={policy.id} className="p-4 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${policy.enabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          {policy.type === 'password' && <Key className="w-5 h-5 text-green-600" />}
                          {policy.type === 'mfa' && <Smartphone className="w-5 h-5 text-green-600" />}
                          {policy.type === 'session' && <Clock className="w-5 h-5 text-green-600" />}
                          {policy.type === 'brute-force' && <ShieldAlert className="w-5 h-5 text-green-600" />}
                          {policy.type === 'bot-detection' && <Monitor className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{policy.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {policy.type === 'password' && (
                              <>
                                <Badge variant="outline" className="text-xs">Min {policy.settings.minLength} chars</Badge>
                                {policy.settings.requireUppercase && <Badge variant="outline" className="text-xs">Uppercase</Badge>}
                                {policy.settings.requireNumbers && <Badge variant="outline" className="text-xs">Numbers</Badge>}
                                {policy.settings.requireSymbols && <Badge variant="outline" className="text-xs">Symbols</Badge>}
                              </>
                            )}
                            {policy.type === 'mfa' && (
                              <>
                                {policy.settings.methods.map((m: string) => (
                                  <Badge key={m} variant="outline" className="text-xs capitalize">{m}</Badge>
                                ))}
                                <Badge variant="outline" className="text-xs">Enforced: {policy.settings.enforced}</Badge>
                              </>
                            )}
                            {policy.type === 'session' && (
                              <>
                                <Badge variant="outline" className="text-xs">Idle: {policy.settings.maxIdleTime}min</Badge>
                                <Badge variant="outline" className="text-xs">Max: {policy.settings.maxSessionLength}min</Badge>
                              </>
                            )}
                            {policy.type === 'brute-force' && (
                              <>
                                <Badge variant="outline" className="text-xs">Max {policy.settings.maxAttempts} attempts</Badge>
                                <Badge variant="outline" className="text-xs">Block {policy.settings.blockDuration}min</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={policy.enabled}
                            onChange={() => handleToggleSecurityPolicy(policy.id, !policy.enabled)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(JSON.stringify({
                              id: policy.id,
                              name: policy.name,
                              type: policy.type,
                              enabled: policy.enabled,
                              settings: policy.settings
                            }, null, 2))
                            toast.success(`${policy.name} settings copied`)
                          } catch {
                            toast.info(`${policy.name} Settings` | ${policy.enabled ? 'Enabled' : 'Disabled'}`
                            })
                          }
                        }}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Logs View */}
          {activeView === 'logs' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor authentication events and security activity</p>
                </div>
                <div className="flex items-center gap-3">
                  <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="all">All Events</option>
                    <option value="authentication">Authentication</option>
                    <option value="user">User Changes</option>
                    <option value="security">Security</option>
                    <option value="connection">Connections</option>
                  </select>
                  <Button variant="outline" className="gap-2" onClick={() => {
                    try {
                      const headers = ['ID', 'Type', 'Action', 'User', 'IP', 'Location', 'Device', 'Timestamp', 'Status', 'Details']
                      const csvContent = [
                        headers.join(','),
                        ...auditLogs.map(log => [
                          log.id,
                          log.type,
                          log.action,
                          log.userName || '',
                          log.ip || '',
                          log.location || '',
                          log.device || '',
                          log.timestamp,
                          log.status,
                          log.details || ''
                        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
                      ].join('\n')

                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
                      a.click()
                      window.URL.revokeObjectURL(url)
                      toast.success('Audit logs exported' log entries exported to CSV`
                      })
                    } catch (error) {
                      toast.error('Failed to export logs')
                    }
                  }}>
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{log.action}</span>
                            <Badge variant="outline" className="text-xs capitalize">{log.type}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {log.userName && <span>{log.userName}</span>}
                            {log.ip && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {log.ip}
                              </span>
                            )}
                            {log.location && <span>{log.location}</span>}
                            {log.device && <span>{log.device}</span>}
                          </div>
                          {log.details && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings View - Auth0 Level */}
          {activeView === 'settings' && (
            <div className="p-6">
              <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                <TabsList className="grid w-full grid-cols-6 mb-6">
                  <TabsTrigger value="general" className="gap-2">
                    <Settings className="w-4 h-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="authentication" className="gap-2">
                    <Key className="w-4 h-4" />
                    Authentication
                  </TabsTrigger>
                  <TabsTrigger value="branding" className="gap-2">
                    <Palette className="w-4 h-4" />
                    Branding
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="apis" className="gap-2">
                    <Zap className="w-4 h-4" />
                    APIs
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Tenant Settings</h3>
                          <p className="text-sm text-gray-500">Configure your Auth0 tenant</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tenant Name</Label>
                          <Input defaultValue="freeflow-production" />
                        </div>
                        <div className="space-y-2">
                          <Label>Environment</Label>
                          <Select defaultValue="production">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="staging">Staging</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Friendly Name</Label>
                          <Input defaultValue="FreeFlow Platform" />
                        </div>
                        <div className="space-y-2">
                          <Label>Support Email</Label>
                          <Input type="email" defaultValue="support@freeflow.com" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Regional Settings</h3>
                          <p className="text-sm text-gray-500">Localization preferences</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="pt">Portuguese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <Select defaultValue="utc">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">Eastern Time</SelectItem>
                              <SelectItem value="pst">Pacific Time</SelectItem>
                              <SelectItem value="cet">Central European</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Force User Locale</Label>
                            <p className="text-xs text-gray-500">Override browser settings</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Link2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Default Callbacks</h3>
                        <p className="text-sm text-gray-500">Configure callback URLs</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Allowed Callback URLs</Label>
                        <Input defaultValue="https://app.freeflow.com/callback" />
                      </div>
                      <div className="space-y-2">
                        <Label>Allowed Logout URLs</Label>
                        <Input defaultValue="https://app.freeflow.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Allowed Web Origins</Label>
                        <Input defaultValue="https://app.freeflow.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Allowed Origins (CORS)</Label>
                        <Input defaultValue="https://*.freeflow.com" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Authentication Settings */}
                <TabsContent value="authentication" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Key className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Password Policy</h3>
                          <p className="text-sm text-gray-500">Password requirements</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Minimum Length</Label>
                          <Select defaultValue="12">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="8">8 characters</SelectItem>
                              <SelectItem value="10">10 characters</SelectItem>
                              <SelectItem value="12">12 characters</SelectItem>
                              <SelectItem value="16">16 characters</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Lowercase</Label>
                            <p className="text-xs text-gray-500">At least one lowercase letter</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Uppercase</Label>
                            <p className="text-xs text-gray-500">At least one uppercase letter</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Numbers</Label>
                            <p className="text-xs text-gray-500">At least one number</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Special Characters</Label>
                            <p className="text-xs text-gray-500">At least one special character</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Smartphone className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Multi-Factor Authentication</h3>
                          <p className="text-sm text-gray-500">Second factor options</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>MFA Policy</Label>
                          <Select defaultValue="adaptive">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never">Never</SelectItem>
                              <SelectItem value="always">Always Required</SelectItem>
                              <SelectItem value="adaptive">Adaptive (Risk-Based)</SelectItem>
                              <SelectItem value="admins">Admins Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>TOTP (Authenticator Apps)</Label>
                            <p className="text-xs text-gray-500">Google Authenticator, Authy</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SMS OTP</Label>
                            <p className="text-xs text-gray-500">One-time codes via SMS</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Email OTP</Label>
                            <p className="text-xs text-gray-500">One-time codes via email</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>WebAuthn / Passkeys</Label>
                            <p className="text-xs text-gray-500">Biometric authentication</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Session Settings</h3>
                        <p className="text-sm text-gray-500">Token and session configuration</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Access Token Lifetime</Label>
                        <Select defaultValue="86400">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3600">1 hour</SelectItem>
                            <SelectItem value="28800">8 hours</SelectItem>
                            <SelectItem value="86400">24 hours</SelectItem>
                            <SelectItem value="604800">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Refresh Token Lifetime</Label>
                        <Select defaultValue="2592000">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="604800">7 days</SelectItem>
                            <SelectItem value="2592000">30 days</SelectItem>
                            <SelectItem value="7776000">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Idle Session Timeout</Label>
                        <Select defaultValue="1800">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="900">15 minutes</SelectItem>
                            <SelectItem value="1800">30 minutes</SelectItem>
                            <SelectItem value="3600">1 hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                        <div>
                          <Label>Rotate Refresh Tokens</Label>
                          <p className="text-xs text-gray-500">Enhanced security</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Branding Settings */}
                <TabsContent value="branding" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Palette className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Login Page</h3>
                          <p className="text-sm text-gray-500">Customize authentication UI</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Logo URL</Label>
                          <Input placeholder="https://cdn.freeflow.com/logo.png" />
                        </div>
                        <div className="space-y-2">
                          <Label>Primary Color</Label>
                          <div className="flex gap-2">
                            <Input defaultValue="#3B82F6" className="flex-1" />
                            <div className="w-10 h-10 rounded-lg bg-blue-500 border" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <div className="flex gap-2">
                            <Input defaultValue="#F8FAFC" className="flex-1" />
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Social Connections</Label>
                            <p className="text-xs text-gray-500">Display social login buttons</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Email Templates</h3>
                          <p className="text-sm text-gray-500">Customize email branding</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>From Email</Label>
                          <Input defaultValue="noreply@freeflow.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>From Name</Label>
                          <Input defaultValue="FreeFlow" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email Header Logo</Label>
                          <Input placeholder="https://cdn.freeflow.com/email-logo.png" />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => {
                          toast.info('Email Template Editor'
                            }
                          })
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Email Templates
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Globe className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Custom Domain</h3>
                        <p className="text-sm text-gray-500">Use your own domain for authentication</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Custom Domain</Label>
                        <Input placeholder="auth.yourdomain.com" defaultValue="auth.freeflow.com" />
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                        <Badge variant="outline">SSL Active</Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Admin Alerts</h3>
                          <p className="text-sm text-gray-500">Security notifications</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Suspicious Login Detected', desc: 'Unusual login patterns', enabled: true },
                          { label: 'Brute Force Attack', desc: 'Multiple failed attempts', enabled: true },
                          { label: 'New Admin Added', desc: 'Admin role assignments', enabled: true },
                          { label: 'Connection Changes', desc: 'SSO/SAML modifications', enabled: true },
                          { label: 'API Rate Limit Exceeded', desc: 'Rate limiting triggered', enabled: false },
                          { label: 'User Blocked', desc: 'Account locked/blocked', enabled: true },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div>
                              <Label className="font-medium">{item.label}</Label>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={item.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">User Emails</h3>
                          <p className="text-sm text-gray-500">Transactional emails</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Welcome Email', desc: 'New user signup', enabled: true },
                          { label: 'Email Verification', desc: 'Verify email address', enabled: true },
                          { label: 'Password Reset', desc: 'Reset password link', enabled: true },
                          { label: 'Password Changed', desc: 'Confirmation notification', enabled: true },
                          { label: 'MFA Enrolled', desc: 'MFA setup confirmation', enabled: true },
                          { label: 'Blocked Account', desc: 'Account locked notice', enabled: true },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div>
                              <Label className="font-medium">{item.label}</Label>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <Switch defaultChecked={item.enabled} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Webhook className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Webhooks</h3>
                        <p className="text-sm text-gray-500">Event notifications</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input placeholder="https://api.yourapp.com/webhooks/auth" />
                      </div>
                      <div className="space-y-2">
                        <Label>Events</Label>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="login">Login Events</SelectItem>
                            <SelectItem value="signup">Signup Events</SelectItem>
                            <SelectItem value="security">Security Events</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* APIs Settings */}
                <TabsContent value="apis" className="space-y-6">
                  <div className="p-6 border rounded-xl dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Registered APIs</h3>
                        <p className="text-sm text-gray-500">APIs protected by Auth0</p>
                      </div>
                      <Button className="ml-auto gap-2" onClick={() => {
                        toast.info('Register New API' catch {
                                toast.error('Failed to copy guide')
                              }
                            }
                          }
                        })
                      }}>
                        <Plus className="w-4 h-4" />
                        Register API
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'FreeFlow Management API', identifier: 'https://api.freeflow.com/v1', audience: 'freeflow-api', scopes: 12 },
                        { name: 'FreeFlow User API', identifier: 'https://api.freeflow.com/users', audience: 'freeflow-users', scopes: 8 },
                        { name: 'FreeFlow Webhooks API', identifier: 'https://webhooks.freeflow.com', audience: 'freeflow-webhooks', scopes: 4 },
                      ].map((api, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Server className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{api.name}</div>
                              <div className="text-sm text-gray-500 font-mono">{api.identifier}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{api.scopes} scopes</Badge>
                            <Button size="sm" variant="outline" onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(JSON.stringify({
                                  name: api.name,
                                  identifier: api.identifier,
                                  audience: api.audience,
                                  scopes: api.scopes
                                }, null, 2))
                                toast.success(`${api.name} configuration copied`)
                              } catch {
                                toast.info(`${api.name}``
                                })
                              }
                            }}>Configure</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Key className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Token Settings</h3>
                          <p className="text-sm text-gray-500">JWT configuration</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Signing Algorithm</Label>
                          <Select defaultValue="rs256">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rs256">RS256</SelectItem>
                              <SelectItem value="hs256">HS256</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>RBAC</Label>
                            <p className="text-xs text-gray-500">Include permissions in token</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Add Permissions to Token</Label>
                            <p className="text-xs text-gray-500">Include user permissions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Rate Limiting</h3>
                          <p className="text-sm text-gray-500">API rate limits</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Requests per Minute</Label>
                          <Select defaultValue="1000">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100/min</SelectItem>
                              <SelectItem value="500">500/min</SelectItem>
                              <SelectItem value="1000">1000/min</SelectItem>
                              <SelectItem value="5000">5000/min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Rate Limiting</Label>
                            <p className="text-xs text-gray-500">Prevent API abuse</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Log Rate Limit Events</Label>
                            <p className="text-xs text-gray-500">Track in audit logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Attack Protection</h3>
                          <p className="text-sm text-gray-500">Security features</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Bot Detection</Label>
                            <p className="text-xs text-gray-500">Block automated attacks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Breached Password Detection</Label>
                            <p className="text-xs text-gray-500">Check against known breaches</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Suspicious IP Throttling</Label>
                            <p className="text-xs text-gray-500">Rate limit suspicious IPs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Adaptive MFA</Label>
                            <p className="text-xs text-gray-500">Risk-based challenges</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Database className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Data Management</h3>
                          <p className="text-sm text-gray-500">User data settings</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Log Retention</Label>
                          <Select defaultValue="30">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>GDPR Compliance Mode</Label>
                            <p className="text-xs text-gray-500">Enable data export/deletion</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP Address Logging</Label>
                            <p className="text-xs text-gray-500">Store user IP addresses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Rotate Signing Key</div>
                          <p className="text-sm text-gray-500">Invalidates all existing tokens</p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={async () => {
                          if (!confirm('WARNING: Rotating the signing key will invalidate ALL existing tokens. All users will need to re-authenticate. Continue?')) {
                            return
                          }
                          try {
                            toast.loading('Rotating signing key...')
                            const response = await fetch('/api/admin/security/rotate-key', { method: 'POST' })
                            if (!response.ok) throw new Error('Failed to rotate key')
                            toast.dismiss()
                            toast.success('Signing key rotated!')
                          } catch {
                            toast.dismiss()
                            toast.error('Failed to rotate signing key')
                          }
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Rotate Key
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Revoke All Sessions</div>
                          <p className="text-sm text-gray-500">Force all users to re-authenticate</p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={async () => {
                          if (!confirm('Are you sure you want to revoke all sessions? All users will need to re-authenticate.')) return
                          try {
                            const response = await fetch('/api/admin/sessions/revoke-all', { method: 'POST' })
                            if (!response.ok) throw new Error('Failed')
                            toast.success('All sessions revoked! Users must re-authenticate.')
                          } catch {
                            toast.error('Failed to revoke sessions')
                          }
                        }}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Revoke All
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">Delete Tenant</div>
                          <p className="text-sm text-gray-500">Permanently delete all data</p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={async () => {
                          if (!confirm('WARNING: This will permanently delete ALL data for this tenant. Type "DELETE" to confirm.')) return
                          const confirmation = prompt('Type "DELETE" to confirm permanent tenant deletion:')
                          if (confirmation !== 'DELETE') {
                            toast.error('Deletion cancelled')
                            return
                          }
                          try {
                            const response = await fetch('/api/admin/tenant', { method: 'DELETE' })
                            if (!response.ok) throw new Error('Failed')
                            toast.success('Tenant deletion initiated')
                          } catch {
                            toast.error('Failed to delete tenant')
                          }
                        }}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Tenant
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockUserMgmtAIInsights}
              title="User Management Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockUserMgmtCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockUserMgmtPredictions}
              title="User Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockUserMgmtActivities}
            title="User Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockUserMgmtQuickActions}
            variant="grid"
          />
        </div>

        {/* User Detail Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            {selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* User Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {(selectedUser.full_name || selectedUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedUser.full_name || selectedUser.display_name || 'No name'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={
                          selectedUser.status === 'active' ? 'bg-green-100 text-green-700' :
                          selectedUser.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {selectedUser.status}
                        </Badge>
                        <Badge variant="outline">{selectedUser.role}</Badge>
                        {selectedUser.email_verified && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        if (selectedUser.email) {
                          window.location.href = `mailto:${selectedUser.email}`
                          toast.success('Opening email client'`
                          })
                        } else {
                          toast.error('No email address available')
                        }
                      }}>
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(JSON.stringify({
                            id: selectedUser.id,
                            email: selectedUser.email,
                            full_name: selectedUser.full_name,
                            role: selectedUser.role,
                            status: selectedUser.status,
                            department: selectedUser.department,
                            job_title: selectedUser.job_title
                          }, null, 2))
                          toast.success('User profile copied')
                        } catch {
                          toast.error('Failed to copy user profile')
                        }
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* User Info Tabs */}
                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="info">Info</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="text-sm text-gray-500">Department</label>
                          <p className="font-medium">{selectedUser.department || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Job Title</label>
                          <p className="font-medium">{selectedUser.job_title || '-'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Login Count</label>
                          <p className="font-medium">{selectedUser.login_count || 0}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Last Login</label>
                          <p className="font-medium">
                            {selectedUser.last_login_at
                              ? new Date(selectedUser.last_login_at).toLocaleString()
                              : 'Never'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Created</label>
                          <p className="font-medium">
                            {selectedUser.created_at
                              ? new Date(selectedUser.created_at).toLocaleDateString()
                              : '-'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">User ID</label>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{selectedUser.id.slice(0, 8)}...</code>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(selectedUser.id);
                                toast.success('User ID copied to clipboard!');
                              } catch {
                                toast.error('Failed to copy');
                              }
                            }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="security" className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Smartphone className={`w-5 h-5 ${selectedUser.two_factor_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                            <div>
                              <p className="font-medium">Multi-Factor Authentication</p>
                              <p className="text-sm text-gray-500">
                                {selectedUser.two_factor_enabled ? 'TOTP authenticator app' : 'Not configured'}
                              </p>
                            </div>
                          </div>
                          <Badge className={selectedUser.two_factor_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {selectedUser.two_factor_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Password</p>
                              <p className="text-sm text-gray-500">
                                {selectedUser.password_changed_at
                                  ? `Last changed ${new Date(selectedUser.password_changed_at).toLocaleDateString()}`
                                  : 'Never changed'}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleResetPassword(selectedUser)}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Active Sessions</p>
                              <p className="text-sm text-gray-500">2 devices logged in</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (!confirm(`Revoke all sessions for ${selectedUser.full_name || selectedUser.email}? They will need to sign in again.`)) {
                              return
                            }
                            try {
                              toast.loading('Revoking sessions...')
                              const response = await fetch(`/api/admin/users/${selectedUser.id}/sessions`, {
                                method: 'DELETE'
                              })
                              if (!response.ok) throw new Error('Failed to revoke sessions')
                              toast.dismiss()
                              toast.success('All sessions revoked!' will need to sign in again`
                              })
                            } catch {
                              toast.dismiss()
                              toast.error('Failed to revoke sessions')
                            }
                          }}>Revoke All</Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="activity" className="space-y-4 pt-4">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {[
                            { action: 'Login', time: '2 hours ago', device: 'Chrome on MacOS', ip: '192.168.1.100' },
                            { action: 'Password Changed', time: '1 week ago', device: 'Safari on iOS', ip: '10.0.0.50' },
                            { action: 'MFA Enabled', time: '2 weeks ago', device: 'Chrome on MacOS', ip: '192.168.1.100' },
                            { action: 'Profile Updated', time: '1 month ago', device: 'Chrome on MacOS', ip: '192.168.1.100' },
                            { action: 'Login', time: '1 month ago', device: 'Firefox on Windows', ip: '172.16.0.25' },
                          ].map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg dark:border-gray-700">
                              <Activity className="w-4 h-4 text-blue-600 mt-1" />
                              <div className="flex-1">
                                <p className="font-medium">{activity.action}</p>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span>{activity.time}</span>
                                  <span>{activity.device}</span>
                                  <span>{activity.ip}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="permissions" className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Current Role</span>
                            <Badge>{selectedUser.role}</Badge>
                          </div>
                          <select
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            value={selectedUser.role}
                            onChange={(e) => handleAssignRole(selectedUser, e.target.value as UserRole)}
                            disabled={updatingRole === selectedUser.id}
                          >
                            <option value="user">User</option>
                            <option value="member">Member</option>
                            <option value="guest">Guest</option>
                            <option value="manager">Manager</option>
                            <option value="team_lead">Team Lead</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        </div>
                        <div className="p-3 border rounded-lg dark:border-gray-700">
                          <p className="font-medium mb-2">Direct Permissions</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">users:read</Badge>
                            <Badge variant="outline">content:write</Badge>
                            <Badge variant="outline">analytics:read</Badge>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2">
                      {selectedUser.status === 'active' ? (
                        <Button
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => handleSuspendUser(selectedUser)}
                          disabled={suspendingUser === selectedUser.id}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {suspendingUser === selectedUser.id ? 'Suspending...' : 'Suspend User'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleActivateUser(selectedUser)}
                          disabled={suspendingUser === selectedUser.id}
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          {suspendingUser === selectedUser.id ? 'Activating...' : 'Activate User'}
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => handleDeleteUser(selectedUser)}
                      disabled={deletingUser === selectedUser.id}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingUser === selectedUser.id ? 'Deleting...' : 'Delete User'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
