'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRoles, usePermissions, useRoleAssignments, type Role, type Permission, type RoleLevel } from '@/lib/hooks/use-permissions'
import {
  Lock,
  Shield,
  Users,
  Key,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash,
  Settings,
  UserCheck,
  Crown,
  Award,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Globe,
  Building,
  Fingerprint,
  Smartphone,
  Laptop,
  LogIn,
  LogOut,
  UserPlus,
  UserMinus,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Layers,
  GitBranch,
  FileText,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Link2,
  Unlink,
  History,
  Activity,
  Zap,
  KeyRound,
  LockKeyhole,
  Unlock,
  UserCog,
  UsersRound,
  Network,
  Workflow,
  CheckSquare,
  Square,
  Copy
} from 'lucide-react'

// Okta-level types
type UserStatus = 'active' | 'pending' | 'staged' | 'suspended' | 'deprovisioned' | 'locked'
type GroupType = 'okta' | 'app' | 'built_in' | 'custom'
type PolicyType = 'sign_on' | 'password' | 'mfa' | 'session' | 'access'
type AuthFactorType = 'sms' | 'email' | 'totp' | 'push' | 'webauthn' | 'security_key'
type ApplicationStatus = 'active' | 'inactive'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  status: UserStatus
  roles: string[]
  groups: string[]
  lastLogin?: string
  createdAt: string
  mfaEnabled: boolean
  mfaFactors: AuthFactorType[]
  department?: string
  title?: string
}

interface Group {
  id: string
  name: string
  description: string
  type: GroupType
  memberCount: number
  applications: string[]
  createdAt: string
}

interface OktaRole {
  id: string
  name: string
  displayName: string
  description: string
  level: RoleLevel
  permissions: string[]
  assignedUsers: number
  isSystem: boolean
  isEditable: boolean
  createdAt: string
}

interface Policy {
  id: string
  name: string
  description: string
  type: PolicyType
  priority: number
  status: 'active' | 'inactive'
  conditions: PolicyCondition[]
  actions: PolicyAction[]
  assignedGroups: string[]
}

interface PolicyCondition {
  type: string
  value: string
}

interface PolicyAction {
  type: string
  value: string
}

interface Application {
  id: string
  name: string
  logo?: string
  status: ApplicationStatus
  type: 'saml' | 'oidc' | 'spa' | 'native'
  assignedUsers: number
  assignedGroups: string[]
  ssoEnabled: boolean
  provisioningEnabled: boolean
  createdAt: string
}

interface AuditEvent {
  id: string
  action: string
  actor: string
  target: string
  timestamp: string
  result: 'success' | 'failure'
  ipAddress: string
}

interface PermissionsClientProps {
  initialRoles: Role[]
  initialPermissions: Permission[]
}

// Mock Okta-level data
const mockUsers: User[] = [
  { id: 'user_1', email: 'john@company.com', firstName: 'John', lastName: 'Doe', displayName: 'John Doe', status: 'active', roles: ['admin'], groups: ['Engineering', 'All Users'], lastLogin: new Date().toISOString(), createdAt: '2024-01-01', mfaEnabled: true, mfaFactors: ['totp', 'push'], department: 'Engineering', title: 'Senior Engineer' },
  { id: 'user_2', email: 'jane@company.com', firstName: 'Jane', lastName: 'Smith', displayName: 'Jane Smith', status: 'active', roles: ['manager'], groups: ['Product', 'All Users'], lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: '2024-01-05', mfaEnabled: true, mfaFactors: ['sms', 'email'], department: 'Product', title: 'Product Manager' },
  { id: 'user_3', email: 'mike@company.com', firstName: 'Mike', lastName: 'Johnson', displayName: 'Mike Johnson', status: 'pending', roles: ['standard'], groups: ['Sales', 'All Users'], createdAt: '2024-01-20', mfaEnabled: false, mfaFactors: [], department: 'Sales', title: 'Account Executive' },
  { id: 'user_4', email: 'sarah@company.com', firstName: 'Sarah', lastName: 'Williams', displayName: 'Sarah Williams', status: 'active', roles: ['standard'], groups: ['Marketing', 'All Users'], lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: '2024-01-10', mfaEnabled: true, mfaFactors: ['webauthn'], department: 'Marketing', title: 'Marketing Lead' },
  { id: 'user_5', email: 'admin@company.com', firstName: 'System', lastName: 'Admin', displayName: 'System Admin', status: 'active', roles: ['system'], groups: ['IT', 'All Users'], lastLogin: new Date(Date.now() - 1800000).toISOString(), createdAt: '2023-01-01', mfaEnabled: true, mfaFactors: ['totp', 'security_key'], department: 'IT', title: 'System Administrator' }
]

const mockGroups: Group[] = [
  { id: 'group_1', name: 'All Users', description: 'All organization users', type: 'built_in', memberCount: 156, applications: ['Slack', 'Google Workspace', 'Jira'], createdAt: '2023-01-01' },
  { id: 'group_2', name: 'Engineering', description: 'Engineering team members', type: 'okta', memberCount: 42, applications: ['GitHub', 'AWS', 'Datadog'], createdAt: '2024-01-01' },
  { id: 'group_3', name: 'Product', description: 'Product team members', type: 'okta', memberCount: 18, applications: ['Figma', 'Amplitude', 'Linear'], createdAt: '2024-01-01' },
  { id: 'group_4', name: 'Sales', description: 'Sales team members', type: 'okta', memberCount: 35, applications: ['Salesforce', 'HubSpot', 'Gong'], createdAt: '2024-01-01' },
  { id: 'group_5', name: 'IT', description: 'IT and operations', type: 'okta', memberCount: 8, applications: ['All Apps'], createdAt: '2023-01-01' }
]

const mockRoles: OktaRole[] = [
  { id: 'role_1', name: 'super_admin', displayName: 'Super Admin', description: 'Full system access with all permissions', level: 'system', permissions: ['*'], assignedUsers: 2, isSystem: true, isEditable: false, createdAt: '2023-01-01' },
  { id: 'role_2', name: 'org_admin', displayName: 'Organization Admin', description: 'Administrative access to organization settings', level: 'admin', permissions: ['org:manage', 'users:manage', 'groups:manage', 'apps:manage'], assignedUsers: 5, isSystem: true, isEditable: false, createdAt: '2023-01-01' },
  { id: 'role_3', name: 'user_admin', displayName: 'User Administrator', description: 'Manage user lifecycle and credentials', level: 'admin', permissions: ['users:manage', 'users:reset_password', 'users:unlock'], assignedUsers: 8, isSystem: true, isEditable: false, createdAt: '2023-01-01' },
  { id: 'role_4', name: 'app_admin', displayName: 'Application Administrator', description: 'Manage application assignments and settings', level: 'admin', permissions: ['apps:manage', 'apps:assign'], assignedUsers: 6, isSystem: true, isEditable: false, createdAt: '2023-01-01' },
  { id: 'role_5', name: 'helpdesk', displayName: 'Help Desk', description: 'Basic user support capabilities', level: 'manager', permissions: ['users:view', 'users:reset_password', 'users:unlock'], assignedUsers: 12, isSystem: true, isEditable: true, createdAt: '2023-01-01' },
  { id: 'role_6', name: 'read_only', displayName: 'Read Only Admin', description: 'View-only access to all resources', level: 'standard', permissions: ['*:read'], assignedUsers: 15, isSystem: true, isEditable: false, createdAt: '2023-01-01' }
]

const mockPolicies: Policy[] = [
  { id: 'policy_1', name: 'Default Sign-On Policy', description: 'Default authentication policy for all users', type: 'sign_on', priority: 1, status: 'active', conditions: [{ type: 'user_type', value: 'all' }], actions: [{ type: 'allow', value: 'mfa_required' }], assignedGroups: ['All Users'] },
  { id: 'policy_2', name: 'Password Policy', description: 'Password complexity and rotation requirements', type: 'password', priority: 1, status: 'active', conditions: [], actions: [{ type: 'min_length', value: '12' }, { type: 'require_special', value: 'true' }], assignedGroups: ['All Users'] },
  { id: 'policy_3', name: 'MFA Enrollment', description: 'Multi-factor authentication requirements', type: 'mfa', priority: 1, status: 'active', conditions: [], actions: [{ type: 'required_factors', value: '2' }], assignedGroups: ['All Users'] },
  { id: 'policy_4', name: 'Session Policy', description: 'Session timeout and management', type: 'session', priority: 1, status: 'active', conditions: [], actions: [{ type: 'max_idle', value: '30m' }, { type: 'max_session', value: '24h' }], assignedGroups: ['All Users'] }
]

const mockApplications: Application[] = [
  { id: 'app_1', name: 'Slack', status: 'active', type: 'saml', assignedUsers: 156, assignedGroups: ['All Users'], ssoEnabled: true, provisioningEnabled: true, createdAt: '2023-06-01' },
  { id: 'app_2', name: 'GitHub', status: 'active', type: 'saml', assignedUsers: 42, assignedGroups: ['Engineering'], ssoEnabled: true, provisioningEnabled: true, createdAt: '2023-06-15' },
  { id: 'app_3', name: 'Salesforce', status: 'active', type: 'saml', assignedUsers: 35, assignedGroups: ['Sales'], ssoEnabled: true, provisioningEnabled: false, createdAt: '2023-07-01' },
  { id: 'app_4', name: 'AWS Console', status: 'active', type: 'saml', assignedUsers: 42, assignedGroups: ['Engineering', 'IT'], ssoEnabled: true, provisioningEnabled: false, createdAt: '2023-08-01' },
  { id: 'app_5', name: 'Google Workspace', status: 'active', type: 'saml', assignedUsers: 156, assignedGroups: ['All Users'], ssoEnabled: true, provisioningEnabled: true, createdAt: '2023-01-01' }
]

const mockAuditEvents: AuditEvent[] = [
  { id: 'event_1', action: 'user.login', actor: 'john@company.com', target: 'Slack', timestamp: new Date().toISOString(), result: 'success', ipAddress: '192.168.1.100' },
  { id: 'event_2', action: 'user.password_reset', actor: 'admin@company.com', target: 'mike@company.com', timestamp: new Date(Date.now() - 3600000).toISOString(), result: 'success', ipAddress: '192.168.1.10' },
  { id: 'event_3', action: 'user.mfa_challenge', actor: 'jane@company.com', target: 'AWS Console', timestamp: new Date(Date.now() - 7200000).toISOString(), result: 'success', ipAddress: '10.0.0.50' },
  { id: 'event_4', action: 'user.login_failure', actor: 'unknown@attacker.com', target: 'Google Workspace', timestamp: new Date(Date.now() - 10800000).toISOString(), result: 'failure', ipAddress: '203.0.113.45' },
  { id: 'event_5', action: 'group.member_added', actor: 'admin@company.com', target: 'Engineering', timestamp: new Date(Date.now() - 14400000).toISOString(), result: 'success', ipAddress: '192.168.1.10' }
]

export default function PermissionsClient({ initialRoles, initialPermissions }: PermissionsClientProps) {
  const [activeTab, setActiveTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedRole, setSelectedRole] = useState<OktaRole | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [settingsTab, setSettingsTab] = useState('security')
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)

  const { roles: hookRoles } = useRoles()
  const { permissions: hookPermissions } = usePermissions()
  const { roleAssignments } = useRoleAssignments()

  // Stats
  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter(u => u.status === 'active').length
  const mfaEnabledUsers = mockUsers.filter(u => u.mfaEnabled).length
  const totalGroups = mockGroups.length
  const totalApps = mockApplications.length
  const pendingUsers = mockUsers.filter(u => u.status === 'pending').length

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter
      const matchesSearch = !searchQuery ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [userStatusFilter, searchQuery])

  const getUserStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'staged': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'suspended': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'deprovisioned': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'locked': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const getRoleLevelColor = (level: RoleLevel) => {
    switch (level) {
      case 'system': return 'bg-red-500 text-white'
      case 'admin': return 'bg-orange-500 text-white'
      case 'manager': return 'bg-yellow-500 text-black'
      case 'standard': return 'bg-blue-500 text-white'
      case 'basic': return 'bg-gray-500 text-white'
    }
  }

  const getGroupTypeColor = (type: GroupType) => {
    switch (type) {
      case 'built_in': return 'bg-purple-100 text-purple-700'
      case 'okta': return 'bg-blue-100 text-blue-700'
      case 'app': return 'bg-green-100 text-green-700'
      case 'custom': return 'bg-gray-100 text-gray-700'
    }
  }

  const getPolicyTypeColor = (type: PolicyType) => {
    switch (type) {
      case 'sign_on': return 'bg-blue-100 text-blue-700'
      case 'password': return 'bg-purple-100 text-purple-700'
      case 'mfa': return 'bg-green-100 text-green-700'
      case 'session': return 'bg-orange-100 text-orange-700'
      case 'access': return 'bg-red-100 text-red-700'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              Identity & Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Okta-Level Identity and Access Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => setShowCreateUser(true)}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-green-600">+12 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              <p className="text-xs text-gray-500">{((activeUsers / totalUsers) * 100).toFixed(0)}% of total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{pendingUsers}</p>
              <p className="text-xs text-gray-500">Awaiting activation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500">MFA Enabled</span>
              </div>
              <p className="text-2xl font-bold">{mfaEnabledUsers}</p>
              <p className="text-xs text-green-600">{((mfaEnabledUsers / totalUsers) * 100).toFixed(0)}% coverage</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <UsersRound className="w-4 h-4 text-teal-500" />
                <span className="text-xs text-gray-500">Groups</span>
              </div>
              <p className="text-2xl font-bold">{totalGroups}</p>
              <p className="text-xs text-gray-500">Organization groups</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-gray-500">Applications</span>
              </div>
              <p className="text-2xl font-bold">{totalApps}</p>
              <p className="text-xs text-gray-500">SSO enabled</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <UsersRound className="w-4 h-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Crown className="w-4 h-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="w-4 h-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <Layers className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by name or email..."
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value as UserStatus | 'all')}
                      className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option value="locked">Locked</option>
                    </select>
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* User List */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                {user.firstName[0]}{user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{user.displayName}</h4>
                                <Badge className={getUserStatusColor(user.status)}>{user.status}</Badge>
                                {user.mfaEnabled && (
                                  <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                                    <Fingerprint className="w-3 h-3" />
                                    MFA
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {user.department}
                                </span>
                                <span>{user.title}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-medium">{user.roles.length} roles</p>
                              <p className="text-xs text-gray-500">{user.groups.length} groups</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Last login</p>
                              <p className="text-sm">{user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Never'}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Groups</h3>
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => setShowCreateGroup(true)}>
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedGroup(group)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <UsersRound className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold">{group.name}</h4>
                          </div>
                          <Badge className={getGroupTypeColor(group.type)}>{group.type}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{group.memberCount}</p>
                          <p className="text-xs text-gray-500">members</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{group.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {group.applications.slice(0, 3).map((app) => (
                          <Badge key={app} variant="outline" className="text-xs">{app}</Badge>
                        ))}
                        {group.applications.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{group.applications.length - 3}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Administrator Roles</h3>
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Custom Role
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRoles.map((role) => (
                  <Card key={role.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRole(role)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Crown className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold">{role.displayName}</h4>
                            {role.isSystem && (
                              <Badge variant="outline" className="text-xs">System</Badge>
                            )}
                          </div>
                          <Badge className={getRoleLevelColor(role.level)}>{role.level}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{role.assignedUsers}</p>
                          <p className="text-xs text-gray-500">assigned</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{role.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {role.permissions.slice(0, 3).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs font-mono">{perm}</Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{role.permissions.length - 3}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Security Policies</h3>
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Policy
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockPolicies.map((policy) => (
                  <Card key={policy.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPolicy(policy)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold">{policy.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPolicyTypeColor(policy.type)}>{policy.type.replace('_', ' ')}</Badge>
                            <Badge className={policy.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {policy.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Priority {policy.priority}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{policy.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Assigned to:</span>
                        {policy.assignedGroups.map((group) => (
                          <Badge key={group} variant="outline" className="text-xs">{group}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="apps" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Applications</h3>
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Application
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockApplications.map((app) => (
                  <Card key={app.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {app.name[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{app.name}</h4>
                            <Badge className={app.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Type</span>
                          <Badge variant="outline" className="uppercase">{app.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Assigned Users</span>
                          <span className="font-medium">{app.assignedUsers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">SSO</span>
                          {app.ssoEnabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Provisioning</span>
                          {app.provisioningEnabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">System Logs</h3>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Logs
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockAuditEvents.map((event) => (
                      <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.result === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                              {event.result === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium font-mono text-sm">{event.action}</span>
                                <Badge className={event.result === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {event.result}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">{event.actor}</span>
                                <span className="mx-2">→</span>
                                <span>{event.target}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{formatTimeAgo(event.timestamp)}</p>
                            <p className="text-xs text-gray-500 font-mono">{event.ipAddress}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="security"><ShieldCheck className="w-4 h-4 mr-2" />Security</TabsTrigger>
                <TabsTrigger value="authentication"><Fingerprint className="w-4 h-4 mr-2" />Authentication</TabsTrigger>
                <TabsTrigger value="provisioning"><UserCog className="w-4 h-4 mr-2" />Provisioning</TabsTrigger>
                <TabsTrigger value="api"><Key className="w-4 h-4 mr-2" />API</TabsTrigger>
                <TabsTrigger value="integrations"><Link2 className="w-4 h-4 mr-2" />Integrations</TabsTrigger>
                <TabsTrigger value="advanced"><Settings className="w-4 h-4 mr-2" />Advanced</TabsTrigger>
              </TabsList>

              {/* Security Settings */}
              <TabsContent value="security">
                <div className="grid grid-cols-2 gap-6">
                  <Card><CardHeader><CardTitle>Password Policy</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div><Label>Minimum Length</Label><Select defaultValue="12"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="8">8 characters</SelectItem><SelectItem value="10">10 characters</SelectItem><SelectItem value="12">12 characters</SelectItem><SelectItem value="16">16 characters</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Require Uppercase</p><p className="text-sm text-gray-500">At least one uppercase letter</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Require Numbers</p><p className="text-sm text-gray-500">At least one number</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Require Special Characters</p><p className="text-sm text-gray-500">At least one special character</p></div><Switch defaultChecked /></div>
                    <div><Label>Password Expiry</Label><Select defaultValue="90"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 days</SelectItem><SelectItem value="60">60 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="never">Never</SelectItem></SelectContent></Select></div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Session Management</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div><Label>Session Timeout</Label><Select defaultValue="30"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="480">8 hours</SelectItem></SelectContent></Select></div>
                    <div><Label>Max Sessions per User</Label><Select defaultValue="5"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 session</SelectItem><SelectItem value="3">3 sessions</SelectItem><SelectItem value="5">5 sessions</SelectItem><SelectItem value="unlimited">Unlimited</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Force Re-authentication</p><p className="text-sm text-gray-500">For sensitive actions</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Remember Device</p><p className="text-sm text-gray-500">Trust recognized devices</p></div><Switch defaultChecked /></div>
                  </CardContent></Card>
                  <Card className="col-span-2"><CardHeader><CardTitle>Account Lockout</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div><Label>Max Failed Attempts</Label><Select defaultValue="5"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">3 attempts</SelectItem><SelectItem value="5">5 attempts</SelectItem><SelectItem value="10">10 attempts</SelectItem></SelectContent></Select></div>
                      <div><Label>Lockout Duration</Label><Select defaultValue="30"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="permanent">Until admin unlock</SelectItem></SelectContent></Select></div>
                      <div><Label>Reset Counter After</Label><Select defaultValue="30"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 minutes</SelectItem><SelectItem value="30">30 minutes</SelectItem><SelectItem value="60">1 hour</SelectItem></SelectContent></Select></div>
                    </div>
                  </CardContent></Card>
                </div>
              </TabsContent>

              {/* Authentication Settings */}
              <TabsContent value="authentication">
                <div className="grid grid-cols-2 gap-6">
                  <Card><CardHeader><CardTitle>Multi-Factor Authentication</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Require MFA</p><p className="text-sm text-gray-500">For all users</p></div><Switch defaultChecked /></div>
                    <div><Label>MFA Grace Period</Label><Select defaultValue="7"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Immediately</SelectItem><SelectItem value="1">1 day</SelectItem><SelectItem value="7">7 days</SelectItem><SelectItem value="30">30 days</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2">
                      <Label>Allowed Factors</Label>
                      {['Authenticator App (TOTP)', 'Push Notification', 'SMS', 'Email', 'Security Key (WebAuthn)'].map(factor => (
                        <div key={factor} className="flex items-center justify-between p-2 border rounded-lg"><span className="text-sm">{factor}</span><Switch defaultChecked={factor !== 'SMS'} /></div>
                      ))}
                    </div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Single Sign-On</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Enable SSO</p><p className="text-sm text-gray-500">SAML 2.0 / OIDC</p></div><Switch defaultChecked /></div>
                    <div><Label>Default Identity Provider</Label><Select defaultValue="okta"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="okta">Okta</SelectItem><SelectItem value="azure">Azure AD</SelectItem><SelectItem value="google">Google Workspace</SelectItem><SelectItem value="onelogin">OneLogin</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Allow Password Login</p><p className="text-sm text-gray-500">In addition to SSO</p></div><Switch /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Just-in-Time Provisioning</p><p className="text-sm text-gray-500">Auto-create accounts</p></div><Switch defaultChecked /></div>
                  </CardContent></Card>
                </div>
              </TabsContent>

              {/* Provisioning Settings */}
              <TabsContent value="provisioning">
                <div className="grid grid-cols-2 gap-6">
                  <Card><CardHeader><CardTitle>User Provisioning</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Auto-provision Users</p><p className="text-sm text-gray-500">From identity provider</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Auto-deactivate Users</p><p className="text-sm text-gray-500">When removed from IdP</p></div><Switch defaultChecked /></div>
                    <div><Label>Default Role for New Users</Label><Select defaultValue="standard"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="basic">Basic</SelectItem><SelectItem value="standard">Standard</SelectItem><SelectItem value="manager">Manager</SelectItem></SelectContent></Select></div>
                    <div><Label>Default Group</Label><Select defaultValue="all"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="new">New Users</SelectItem></SelectContent></Select></div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>SCIM Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Enable SCIM</p><p className="text-sm text-gray-500">System for Cross-domain Identity Management</p></div><Switch /></div>
                    <div><Label>SCIM Endpoint</Label><Input value="https://api.company.com/scim/v2" disabled className="mt-1 font-mono text-sm" /></div>
                    <div><Label>Bearer Token</Label><div className="flex items-center gap-2 mt-1"><Input type="password" value="sk_live_xxxxxxxxxxxxx" disabled /><Button variant="outline" size="sm"><Copy className="w-4 h-4" /></Button></div></div>
                    <Button variant="outline" className="w-full"><RefreshCw className="w-4 h-4 mr-2" />Regenerate Token</Button>
                  </CardContent></Card>
                </div>
              </TabsContent>

              {/* API Settings */}
              <TabsContent value="api">
                <div className="space-y-6">
                  <Card><CardHeader><div className="flex items-center justify-between"><CardTitle>API Keys</CardTitle><Button size="sm" onClick={() => setShowAPIKeyDialog(true)}><Plus className="w-4 h-4 mr-2" />Create API Key</Button></div></CardHeader><CardContent className="p-0">
                    <div className="divide-y">
                      {[
                        { name: 'Production API Key', prefix: 'pk_live_', created: '2024-01-15', lastUsed: '2 hours ago', status: 'active' },
                        { name: 'Development API Key', prefix: 'pk_test_', created: '2024-01-10', lastUsed: '1 day ago', status: 'active' },
                        { name: 'CI/CD Integration', prefix: 'pk_ci_', created: '2024-01-05', lastUsed: '5 minutes ago', status: 'active' },
                      ].map((key, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Key className="w-5 h-5 text-purple-600" /></div>
                            <div><h4 className="font-medium">{key.name}</h4><p className="text-sm text-gray-500 font-mono">{key.prefix}••••••••</p></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm"><p className="text-gray-500">Last used: {key.lastUsed}</p><p className="text-gray-400">Created: {key.created}</p></div>
                            <Badge className="bg-green-100 text-green-700">{key.status}</Badge>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Rate Limiting</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Requests per Minute</Label><Input type="number" defaultValue="1000" className="mt-1" /></div>
                      <div><Label>Requests per Hour</Label><Input type="number" defaultValue="10000" className="mt-1" /></div>
                    </div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Enable Rate Limiting</p><p className="text-sm text-gray-500">Prevent API abuse</p></div><Switch defaultChecked /></div>
                  </CardContent></Card>
                </div>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations">
                <Card><CardHeader><CardTitle>Directory Integrations</CardTitle></CardHeader><CardContent className="space-y-4">
                  {[
                    { name: 'Active Directory', status: 'connected', users: 156, icon: Network },
                    { name: 'Google Workspace', status: 'connected', users: 142, icon: Globe },
                    { name: 'LDAP', status: 'disconnected', users: 0, icon: Workflow },
                    { name: 'Azure AD', status: 'disconnected', users: 0, icon: Globe },
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <integration.icon className={`w-5 h-5 ${integration.status === 'connected' ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div><h4 className="font-medium">{integration.name}</h4>{integration.status === 'connected' && <p className="text-sm text-gray-500">{integration.users} users synced</p>}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{integration.status}</Badge>
                        <Button variant="outline" size="sm">{integration.status === 'connected' ? 'Configure' : 'Connect'}</Button>
                      </div>
                    </div>
                  ))}
                </CardContent></Card>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced">
                <div className="grid grid-cols-2 gap-6">
                  <Card><CardHeader><CardTitle>Audit & Compliance</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Audit Logging</p><p className="text-sm text-gray-500">Log all authentication events</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Detailed Logs</p><p className="text-sm text-gray-500">Include request/response data</p></div><Switch /></div>
                    <div><Label>Log Retention</Label><Select defaultValue="365"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="90">90 days</SelectItem><SelectItem value="180">180 days</SelectItem><SelectItem value="365">1 year</SelectItem><SelectItem value="730">2 years</SelectItem></SelectContent></Select></div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Security Notifications</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Suspicious Login Alerts</p><p className="text-sm text-gray-500">Email on unusual activity</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Admin Action Alerts</p><p className="text-sm text-gray-500">Notify on role changes</p></div><Switch defaultChecked /></div>
                    <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Security Report</p><p className="text-sm text-gray-500">Summary of security events</p></div><Switch defaultChecked /></div>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Data Management</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between"><div><p className="font-medium">Data Encryption</p><p className="text-sm text-gray-500">Encrypt data at rest</p></div><Switch defaultChecked /></div>
                    <div><Label>Encryption Key</Label><Select defaultValue="aes256"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="aes128">AES-128</SelectItem><SelectItem value="aes256">AES-256</SelectItem></SelectContent></Select></div>
                    <Button variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />Export All Data</Button>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle>Danger Zone</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800">Reset All Permissions</h4>
                      <p className="text-sm text-red-600 mb-3">This will reset all custom permissions to defaults</p>
                      <Button variant="outline" className="text-red-600 border-red-200">Reset Permissions</Button>
                    </div>
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800">Revoke All Sessions</h4>
                      <p className="text-sm text-red-600 mb-3">Force all users to re-authenticate</p>
                      <Button variant="outline" className="text-red-600 border-red-200">Revoke Sessions</Button>
                    </div>
                  </CardContent></Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* User Detail Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl">{selectedUser?.displayName}</p>
                  <p className="text-sm text-gray-500 font-normal">{selectedUser?.email}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={getUserStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                  {selectedUser.mfaEnabled && (
                    <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                      <Fingerprint className="w-3 h-3" />
                      MFA Enabled
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{selectedUser.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="font-medium">{selectedUser.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">{selectedUser.lastLogin ? formatTimeAgo(selectedUser.lastLogin) : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Roles</p>
                  <div className="flex items-center gap-2">
                    {selectedUser.roles.map((role) => (
                      <Badge key={role} className="bg-purple-100 text-purple-700">{role}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Groups</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedUser.groups.map((group) => (
                      <Badge key={group} variant="outline">{group}</Badge>
                    ))}
                  </div>
                </div>

                {selectedUser.mfaEnabled && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">MFA Factors</p>
                    <div className="flex items-center gap-2">
                      {selectedUser.mfaFactors.map((factor) => (
                        <Badge key={factor} variant="outline" className="gap-1">
                          <Fingerprint className="w-3 h-3" />
                          {factor.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button variant="outline">
                    <LockKeyhole className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Group Detail Dialog */}
        <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-purple-600" />
                {selectedGroup?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedGroup && (
              <div className="space-y-4">
                <Badge className={getGroupTypeColor(selectedGroup.type)}>{selectedGroup.type}</Badge>
                <p className="text-gray-500">{selectedGroup.description}</p>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-3xl font-bold">{selectedGroup.memberCount}</p>
                  <p className="text-sm text-gray-500">Members</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Applications</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedGroup.applications.map((app) => (
                      <Badge key={app} variant="outline">{app}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Members
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Role Detail Dialog */}
        <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                {selectedRole?.displayName}
              </DialogTitle>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getRoleLevelColor(selectedRole.level)}>{selectedRole.level}</Badge>
                  {selectedRole.isSystem && <Badge variant="outline">System Role</Badge>}
                </div>
                <p className="text-gray-500">{selectedRole.description}</p>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-3xl font-bold">{selectedRole.assignedUsers}</p>
                  <p className="text-sm text-gray-500">Assigned Users</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Permissions</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedRole.permissions.map((perm) => (
                      <Badge key={perm} variant="outline" className="font-mono">{perm}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Users
                  </Button>
                  {selectedRole.isEditable && (
                    <Button variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
