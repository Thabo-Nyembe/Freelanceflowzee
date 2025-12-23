'use client'
import { useState, useMemo } from 'react'
import {
  Users, Shield, Key, Link2, FileText, Settings, Search, Plus, MoreHorizontal,
  Mail, Phone, Calendar, Clock, MapPin, Building, Briefcase, Check, X, AlertTriangle,
  Lock, Unlock, UserPlus, UserMinus, Edit, Trash2, Download, Upload, RefreshCw,
  Eye, EyeOff, Smartphone, Globe, Monitor, Activity, Filter, ChevronDown, ChevronRight,
  ShieldCheck, ShieldAlert, UserCheck, UserX, Fingerprint, QrCode, LogIn, LogOut,
  AlertCircle, CheckCircle, Info, ArrowUpRight, Copy, ExternalLink
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function UserManagementClient({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const [activeView, setActiveView] = useState<'users' | 'roles' | 'connections' | 'security' | 'logs'>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)

  const { users, loading, error } = useUserManagement({ role: roleFilter, status: statusFilter })
  const displayUsers = users.length > 0 ? users : initialUsers

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-8">
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
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
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
                    <Input type="email" placeholder="user@company.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Send Welcome Email</label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Send invitation email with setup instructions</span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Send Invitation</Button>
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
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeView === view.id
                      ? 'bg-blue-200 dark:bg-blue-800'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {view.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Users View */}
          {activeView === 'users' && (
            <div className="p-6">
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
                    <Button size="sm" variant="ghost" className="text-blue-600">
                      <Lock className="w-4 h-4 mr-1" />
                      Suspend
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
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
                            {Math.random() > 0.3 ? (
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
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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
                        <Input placeholder="e.g., Marketing Manager" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input placeholder="What this role can do..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Permissions</label>
                        <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg dark:border-gray-700 max-h-[200px] overflow-y-auto">
                          {['users:read', 'users:write', 'users:delete', 'content:read', 'content:write', 'content:delete', 'analytics:read', 'settings:read', 'settings:write', 'billing:read', 'billing:write'].map(perm => (
                            <label key={perm} className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">{perm}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                      <Button>Create Role</Button>
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
                        <Button size="sm" variant="ghost">
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
                <Button className="gap-2">
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
                        <Button size="sm" variant="outline">Configure</Button>
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
                            onChange={() => {
                              setSecurityPolicies(prev => prev.map(p =>
                                p.id === policy.id ? { ...p, enabled: !p.enabled } : p
                              ))
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                        <Button size="sm" variant="outline">
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
                  <Button variant="outline" className="gap-2">
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
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
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
                      <div className="grid grid-cols-2 gap-4">
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
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
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
                            <Smartphone className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium">Multi-Factor Authentication</p>
                              <p className="text-sm text-gray-500">TOTP authenticator app</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Password</p>
                              <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Active Sessions</p>
                              <p className="text-sm text-gray-500">2 devices logged in</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Revoke All</Button>
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
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            {roles.map(role => (
                              <option key={role.id} value={role.id} selected={role.name.toLowerCase() === selectedUser.role}>
                                {role.name}
                              </option>
                            ))}
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
                        <Button variant="outline" className="text-orange-600 hover:text-orange-700">
                          <Lock className="w-4 h-4 mr-2" />
                          Suspend User
                        </Button>
                      ) : (
                        <Button variant="outline" className="text-green-600 hover:text-green-700">
                          <Unlock className="w-4 h-4 mr-2" />
                          Activate User
                        </Button>
                      )}
                    </div>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete User
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
