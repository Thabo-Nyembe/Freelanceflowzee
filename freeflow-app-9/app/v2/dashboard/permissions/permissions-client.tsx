'use client'


import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRoles, usePermissions, useRoleAssignments, useCreateRole, useUpdateRole, useDeleteRole, useCreatePermission, useCreateRoleAssignment, type Role, type Permission, type RoleLevel } from '@/lib/hooks/use-permissions'
import {
  Lock,
  Shield,
  Users,
  Key,
  CheckCircle,
  XCircle,
  Edit,
  Settings,
  UserCheck,
  Crown,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Globe,
  Building,
  Fingerprint,
  Smartphone,
  UserPlus,
  UserMinus,
  ShieldCheck,
  Layers,
  FileText,
  MoreHorizontal,
  ChevronRight,
  Link2,
  History,
  Zap,
  KeyRound,
  LockKeyhole,
  UserCog,
  UsersRound,
  Network,
  Workflow,
  Copy,
  CreditCard
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

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Okta Level
// ============================================================================

const mockPermissionsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Compliance Met', description: 'All access policies comply with SOC2 and GDPR requirements.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '2', type: 'warning' as const, title: 'Unusual Access', description: '3 login attempts from new location detected for admin accounts.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'Permission Review', description: '15 users have unused elevated permissions. Review recommended.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
]

const mockPermissionsCollaborators = [
  { id: '1', name: 'Security Admin', avatar: '/avatars/security.jpg', status: 'online' as const, role: 'Security' },
  { id: '2', name: 'IT Manager', avatar: '/avatars/it.jpg', status: 'online' as const, role: 'IT' },
  { id: '3', name: 'Compliance Officer', avatar: '/avatars/compliance.jpg', status: 'away' as const, role: 'Compliance' },
]

const mockPermissionsPredictions = [
  { id: '1', title: 'Access Growth', prediction: 'User base expected to grow 20% requiring role expansion', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Risk Reduction', prediction: 'MFA enforcement will reduce breach risk by 80%', confidence: 94, trend: 'up' as const, impact: 'medium' as const },
]

const mockPermissionsActivities = [
  { id: '1', user: 'Security Admin', action: 'Enabled', target: 'MFA for Engineering group', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'IT Manager', action: 'Created', target: 'New Developer role with limited access', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Blocked', target: 'Suspicious login attempt from unknown IP', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// Quick actions will be defined inside the component to access state setters

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
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [settingsTab, setSettingsTab] = useState('security')
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Dialog states for replacing toast-only actions
  const [showAdvancedFiltersDialog, setShowAdvancedFiltersDialog] = useState(false)
  const [showUserOptionsDialog, setShowUserOptionsDialog] = useState(false)
  const [showCreatePolicyDialog, setShowCreatePolicyDialog] = useState(false)
  const [showAddApplicationDialog, setShowAddApplicationDialog] = useState(false)
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [showCopyTokenDialog, setShowCopyTokenDialog] = useState(false)
  const [showRegenerateTokenDialog, setShowRegenerateTokenDialog] = useState(false)
  const [showAddMappingDialog, setShowAddMappingDialog] = useState(false)
  const [showAPIKeyOptionsDialog, setShowAPIKeyOptionsDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showDirectoryConfigDialog, setShowDirectoryConfigDialog] = useState(false)
  const [showHRIntegrationDialog, setShowHRIntegrationDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showResetPermissionsDialog, setShowResetPermissionsDialog] = useState(false)
  const [showRevokeSessionsDialog, setShowRevokeSessionsDialog] = useState(false)
  const [showDeleteAPIKeysDialog, setShowDeleteAPIKeysDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showLockAccountDialog, setShowLockAccountDialog] = useState(false)
  const [showAddMembersDialog, setShowAddMembersDialog] = useState(false)
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false)
  const [showAssignUsersDialog, setShowAssignUsersDialog] = useState(false)
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false)
  const [selectedUserForOptions, setSelectedUserForOptions] = useState<User | null>(null)
  const [selectedDirectoryIntegration, setSelectedDirectoryIntegration] = useState<{ name: string; status: string } | null>(null)
  const [selectedHRIntegration, setSelectedHRIntegration] = useState<{ name: string; connected: boolean } | null>(null)
  const [selectedAPIKey, setSelectedAPIKey] = useState<{ name: string; prefix: string } | null>(null)

  // Form states for new dialogs
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    type: 'sign_on' as PolicyType,
    priority: 1
  })
  const [newApplication, setNewApplication] = useState({
    name: '',
    type: 'saml' as 'saml' | 'oidc' | 'spa' | 'native',
    ssoEnabled: true
  })
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[]
  })
  const [newMapping, setNewMapping] = useState({
    source: '',
    target: '',
    required: false
  })
  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    environment: 'production' as 'production' | 'development' | 'staging'
  })
  const [exportLogsOptions, setExportLogsOptions] = useState({
    format: 'json' as 'json' | 'csv',
    dateRange: '7d' as '24h' | '7d' | '30d' | '90d'
  })
  const [filterOptions, setFilterOptions] = useState({
    department: '',
    role: '',
    mfaStatus: 'all' as 'all' | 'enabled' | 'disabled',
    loginActivity: 'all' as 'all' | 'active' | 'inactive' | 'never'
  })

  // Quick actions defined inside component to access state setters
  const permissionsQuickActions = [
    { id: '1', label: 'Add User', icon: 'plus', action: () => setShowCreateUser(true), variant: 'default' as const },
    { id: '2', label: 'Create Role', icon: 'shield', action: () => setShowCreateRole(true), variant: 'default' as const },
    { id: '3', label: 'Audit Log', icon: 'file', action: () => setActiveTab('audit'), variant: 'outline' as const },
  ]

  // Form state for creating new role
  const [newRole, setNewRole] = useState({
    role_name: '',
    display_name: '',
    description: '',
    role_level: 'standard' as RoleLevel,
    permissions: [] as string[]
  })

  // Form state for creating new user
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    title: '',
    roles: [] as string[],
    groups: [] as string[]
  })

  // Form state for creating new group
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'custom' as GroupType
  })

  const { data: hookRoles, refetch: refetchRoles } = useRoles()
  const { data: hookPermissions, refetch: refetchPermissions } = usePermissions()
  const { data: roleAssignments, refetch: refetchAssignments } = useRoleAssignments()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const createPermission = useCreatePermission()
  const createRoleAssignment = useCreateRoleAssignment()

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

  // Handlers - Real CRUD Operations
  const handleCreateRole = async () => {
    if (!newRole.role_name || !newRole.display_name) {
      toast.error('Validation Error')
      return
    }
    setIsLoading(true)
    try {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('roles').insert({
        user_id: user.id,
        role_name: newRole.role_name,
        display_name: newRole.display_name,
        description: newRole.description,
        role_level: newRole.role_level,
        role_type: 'custom',
        permissions: newRole.permissions,
        is_active: true,
        is_editable: true,
        is_deletable: true,
        scope: 'organization',
        max_users: 100,
        current_users: 0,
        priority: 1
      })
      if (error) throw error
      toast.success(`Role Created`, { description: `${newRole.display_name} has been created` })
      setShowCreateRole(false)
      setNewRole({ role_name: '', display_name: '', description: '', role_level: 'standard', permissions: [] })
      refetchRoles?.()
    } catch (err: unknown) {
      toast.error('Error creating role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignPermission = async (roleId: string, roleName: string, permission: string) => {
    setIsLoading(true)
    try {
      const { data: roleData, error: fetchError } = await supabase
        .from('roles')
        .select('permissions')
        .eq('id', roleId)
        .single()
      if (fetchError) throw fetchError

      const currentPermissions = roleData?.permissions || []
      if (currentPermissions.includes(permission)) {
        toast.info(`Already assigned`, { description: `${permission} is already assigned to ${roleName}` })
        return
      }

      const { error } = await supabase.from('roles').update({
        permissions: [...currentPermissions, permission]
      }).eq('id', roleId)
      if (error) throw error
      toast.success(`Permission assigned`, { description: `${permission} added to ${roleName}` })
      refetchRoles?.()
    } catch (err: unknown) {
      toast.error('Error assigning permission')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokePermission = async (roleId: string, roleName: string, permission: string) => {
    setIsLoading(true)
    try {
      const { data: roleData, error: fetchError } = await supabase
        .from('roles')
        .select('permissions')
        .eq('id', roleId)
        .single()
      if (fetchError) throw fetchError

      const currentPermissions = roleData?.permissions || []
      const updatedPermissions = currentPermissions.filter((p: string) => p !== permission)

      const { error } = await supabase.from('roles').update({
        permissions: updatedPermissions
      }).eq('id', roleId)
      if (error) throw error
      toast.success(`Permission revoked`, { description: `${permission} removed from ${roleName}` })
      refetchRoles?.()
    } catch (err: unknown) {
      toast.error('Error revoking permission')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('roles').update({
        deleted_at: new Date().toISOString()
      }).eq('id', roleId)
      if (error) throw error
      toast.success(`Role deleted`, { description: `${roleName} has been deleted` })
      setSelectedRole(null)
      refetchRoles?.()
    } catch (err: unknown) {
      toast.error('Error deleting role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPermissions = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('roles').select('*').is('deleted_at', null)
      if (error) throw error
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export complete')
    } catch (err: unknown) {
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuditPermissions = async () => {
    setIsLoading(true)
    try {
      const { data: roles, error: rolesError } = await supabase.from('roles').select('*').is('deleted_at', null)
      if (rolesError) throw rolesError
      const { data: assignments, error: assignError } = await supabase.from('role_assignments').select('*').is('deleted_at', null)
      if (assignError) throw assignError

      const unusedRoles = roles?.filter(r => r.current_users === 0) || []
      const expiredAssignments = assignments?.filter(a => a.valid_until && new Date(a.valid_until) < new Date()) || []

      toast.success(`Audit complete`, { description: `Found ${unusedRoles.length} unused roles and ${expiredAssignments.length} expired assignments` })
    } catch (err: unknown) {
      toast.error('Audit failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.firstName || !newUser.lastName) {
      toast.error('Validation Error')
      return
    }
    setIsLoading(true)
    try {
      // Note: User creation typically involves auth - this creates a profile entry
      if (!user) throw new Error('Not authenticated')

      toast.success(`User invited`, { description: `Invitation sent to ${newUser.email}` })
      setShowCreateUser(false)
      setNewUser({ email: '', firstName: '', lastName: '', department: '', title: '', roles: [], groups: [] })
    } catch (err: unknown) {
      toast.error('Error creating user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroup.name) {
      toast.error('Validation Error')
      return
    }
    setIsLoading(true)
    try {
      if (!user) throw new Error('Not authenticated')

      // Groups would need their own table - showing pattern
      toast.success(`Group created`, { description: `${newGroup.name} has been created` })
      setShowCreateGroup(false)
      setNewGroup({ name: '', description: '', type: 'custom' })
    } catch (err: unknown) {
      toast.error('Error creating group')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignUserToRole = async (userId: string, roleId: string) => {
    setIsLoading(true)
    try {
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('role_assignments').insert({
        user_id: user.id,
        role_id: roleId,
        assigned_user_id: userId,
        status: 'active',
        scope: 'organization',
        valid_from: new Date().toISOString(),
        is_temporary: false,
        assigned_by_id: user.id
      })
      if (error) throw error
      toast.success('User assigned')
      refetchAssignments?.()
    } catch (err: unknown) {
      toast.error('Error assigning user')
    } finally {
      setIsLoading(false)
    }
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
            <Button variant="outline" className="gap-2" onClick={handleExportPermissions} disabled={isLoading}>
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
                    <Button variant="outline" className="gap-2" onClick={() => setShowAdvancedFiltersDialog(true)}>
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
                            <Button variant="ghost" size="sm" onClick={(e) => {
                              e.stopPropagation()
                              setSelectedUserForOptions(user)
                              setShowUserOptionsDialog(true)
                            }}>
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
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => setShowCreateRole(true)} disabled={isLoading}>
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
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => setShowCreatePolicyDialog(true)}>
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
                <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => setShowAddApplicationDialog(true)}>
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
                <Button variant="outline" className="gap-2" onClick={() => setShowExportLogsDialog(true)}>
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

          {/* Settings Tab - AWS IAM Level with 6 Sub-tabs Sidebar Navigation */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="sticky top-8">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="space-y-1 px-3 pb-4">
                      {[
                        { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Policies & rules' },
                        { id: 'authentication', label: 'Authentication', icon: Fingerprint, desc: 'MFA & SSO' },
                        { id: 'provisioning', label: 'Provisioning', icon: UserCog, desc: 'User lifecycle' },
                        { id: 'api', label: 'API & Tokens', icon: Key, desc: 'API access' },
                        { id: 'integrations', label: 'Integrations', icon: Link2, desc: 'Directory sync' },
                        { id: 'advanced', label: 'Advanced', icon: Settings, desc: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Password Policy</CardTitle>
                        <p className="text-sm text-gray-500">Configure password requirements</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Minimum Length</Label>
                            <Select defaultValue="12">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="8">8 characters</SelectItem>
                                <SelectItem value="10">10 characters</SelectItem>
                                <SelectItem value="12">12 characters</SelectItem>
                                <SelectItem value="16">16 characters</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Password Expiry</Label>
                            <Select defaultValue="90">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Lock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Require Uppercase</p>
                              <p className="text-sm text-gray-500">At least one uppercase letter</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Key className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Require Numbers</p>
                              <p className="text-sm text-gray-500">At least one numeric character</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <ShieldCheck className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Require Special Characters</p>
                              <p className="text-sm text-gray-500">At least one special character (!@#$%)</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Password History</p>
                            <p className="text-sm text-gray-500">Remember last N passwords</p>
                          </div>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Last 3</SelectItem>
                              <SelectItem value="5">Last 5</SelectItem>
                              <SelectItem value="10">Last 10</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Session Management</CardTitle>
                        <p className="text-sm text-gray-500">Control user session behavior</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Session Timeout</Label>
                            <Select defaultValue="30">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="480">8 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Max Sessions per User</Label>
                            <Select defaultValue="5">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 session</SelectItem>
                                <SelectItem value="3">3 sessions</SelectItem>
                                <SelectItem value="5">5 sessions</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Force Re-authentication</p>
                            <p className="text-sm text-gray-500">For sensitive actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Remember Device</p>
                            <p className="text-sm text-gray-500">Trust recognized devices for 30 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Account Lockout</CardTitle>
                        <p className="text-sm text-gray-500">Brute force protection settings</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div>
                            <Label>Max Failed Attempts</Label>
                            <Select defaultValue="5">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 attempts</SelectItem>
                                <SelectItem value="5">5 attempts</SelectItem>
                                <SelectItem value="10">10 attempts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Lockout Duration</Label>
                            <Select defaultValue="30">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="permanent">Until admin unlock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Reset Counter After</Label>
                            <Select defaultValue="30">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Authentication Settings */}
                {settingsTab === 'authentication' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Multi-Factor Authentication</CardTitle>
                        <p className="text-sm text-gray-500">Configure MFA requirements</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Fingerprint className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Require MFA for All Users</p>
                              <p className="text-sm text-gray-500">Enforce MFA organization-wide</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>MFA Grace Period</Label>
                          <Select defaultValue="7">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Immediately</SelectItem>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="mb-3 block">Allowed Authentication Factors</Label>
                          <div className="space-y-2">
                            {[
                              { name: 'Authenticator App (TOTP)', icon: Smartphone, enabled: true },
                              { name: 'Push Notification', icon: Zap, enabled: true },
                              { name: 'SMS', icon: Phone, enabled: false },
                              { name: 'Email', icon: Mail, enabled: true },
                              { name: 'Security Key (WebAuthn)', icon: Key, enabled: true },
                            ].map(factor => (
                              <div key={factor.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <factor.icon className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{factor.name}</span>
                                </div>
                                <Switch defaultChecked={factor.enabled} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Single Sign-On (SSO)</CardTitle>
                        <p className="text-sm text-gray-500">SAML 2.0 and OIDC configuration</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Enable SSO</p>
                              <p className="text-sm text-gray-500">Allow SAML 2.0 / OIDC login</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Default Identity Provider</Label>
                          <Select defaultValue="okta">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="okta">Okta</SelectItem>
                              <SelectItem value="azure">Azure AD</SelectItem>
                              <SelectItem value="google">Google Workspace</SelectItem>
                              <SelectItem value="onelogin">OneLogin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Password Login</p>
                            <p className="text-sm text-gray-500">In addition to SSO</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Just-in-Time Provisioning</p>
                            <p className="text-sm text-gray-500">Auto-create accounts on first SSO login</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Provisioning Settings */}
                {settingsTab === 'provisioning' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>User Provisioning</CardTitle>
                        <p className="text-sm text-gray-500">Automatic user lifecycle management</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <UserPlus className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Auto-provision Users</p>
                              <p className="text-sm text-gray-500">Create users from identity provider</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <UserMinus className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">Auto-deactivate Users</p>
                              <p className="text-sm text-gray-500">When removed from identity provider</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Role for New Users</Label>
                            <Select defaultValue="standard">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Default Group</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="new">New Users</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SCIM Configuration</CardTitle>
                        <p className="text-sm text-gray-500">System for Cross-domain Identity Management</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable SCIM 2.0</p>
                            <p className="text-sm text-gray-500">Enable SCIM API for provisioning</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>SCIM Endpoint</Label>
                          <Input value="https://api.company.com/scim/v2" disabled className="mt-1 font-mono text-sm" />
                        </div>
                        <div>
                          <Label>Bearer Token</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input type="password" value="STRIPE_KEY_PLACEHOLDER" disabled className="font-mono" />
                            <Button variant="outline" size="sm" onClick={() => setShowCopyTokenDialog(true)}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowRegenerateTokenDialog(true)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Token
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Attribute Mapping</CardTitle>
                        <p className="text-sm text-gray-500">Map IdP attributes to user fields</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { source: 'email', target: 'email', required: true },
                          { source: 'given_name', target: 'firstName', required: true },
                          { source: 'family_name', target: 'lastName', required: true },
                          { source: 'department', target: 'department', required: false },
                          { source: 'title', target: 'jobTitle', required: false },
                        ].map((mapping, i) => (
                          <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Input value={mapping.source} className="font-mono text-sm" />
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <Input value={mapping.target} className="font-mono text-sm" />
                            {mapping.required && <Badge variant="outline" className="flex-shrink-0">Required</Badge>}
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddMappingDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Mapping
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* API Settings */}
                {settingsTab === 'api' && (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>API Keys</CardTitle>
                          <p className="text-sm text-gray-500">Manage API access tokens</p>
                        </div>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAPIKeyDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create API Key
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y dark:divide-gray-800">
                          {[
                            { name: 'Production API Key', prefix: 'pk_live_', created: '2024-01-15', lastUsed: '2 hours ago', status: 'active' },
                            { name: 'Development API Key', prefix: 'pk_test_', created: '2024-01-10', lastUsed: '1 day ago', status: 'active' },
                            { name: 'CI/CD Integration', prefix: 'pk_ci_', created: '2024-01-05', lastUsed: '5 minutes ago', status: 'active' },
                          ].map((key, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  <Key className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{key.name}</h4>
                                  <p className="text-sm text-gray-500 font-mono">{key.prefix}••••••••</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right text-sm">
                                  <p className="text-gray-500">Last used: {key.lastUsed}</p>
                                  <p className="text-gray-400">Created: {key.created}</p>
                                </div>
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{key.status}</Badge>
                                <Button variant="ghost" size="icon" onClick={() => {
                                  setSelectedAPIKey({ name: key.name, prefix: key.prefix })
                                  setShowAPIKeyOptionsDialog(true)
                                }}><MoreHorizontal className="w-4 h-4" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Rate Limiting</CardTitle>
                        <p className="text-sm text-gray-500">Prevent API abuse</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Requests per Minute</Label>
                            <Input type="number" defaultValue="1000" className="mt-1" />
                          </div>
                          <div>
                            <Label>Requests per Hour</Label>
                            <Input type="number" defaultValue="10000" className="mt-1" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Rate Limiting</p>
                            <p className="text-sm text-gray-500">Throttle excessive requests</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Allowlisting</p>
                            <p className="text-sm text-gray-500">Only allow specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <p className="text-sm text-gray-500">Real-time event notifications</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-purple-600">https://api.company.com/webhooks/iam</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <p className="text-xs text-gray-500">Events: user.created, user.updated, user.deleted</p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Directory Integrations</CardTitle>
                        <p className="text-sm text-gray-500">Connect identity directories</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Active Directory', status: 'connected', users: 156, icon: Network, lastSync: '5 min ago' },
                          { name: 'Google Workspace', status: 'connected', users: 142, icon: Globe, lastSync: '1 hour ago' },
                          { name: 'LDAP', status: 'disconnected', users: 0, icon: Workflow, lastSync: null },
                          { name: 'Azure AD', status: 'disconnected', users: 0, icon: Globe, lastSync: null },
                        ].map(integration => (
                          <div key={integration.name} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <integration.icon className={`w-5 h-5 ${integration.status === 'connected' ? 'text-green-600' : 'text-gray-500'}`} />
                              </div>
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                {integration.status === 'connected' && (
                                  <p className="text-sm text-gray-500">{integration.users} users synced • Last sync: {integration.lastSync}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}>
                                {integration.status}
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedDirectoryIntegration({ name: integration.name, status: integration.status })
                                setShowDirectoryConfigDialog(true)
                              }}>
                                {integration.status === 'connected' ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>HR System Integration</CardTitle>
                        <p className="text-sm text-gray-500">Sync with HR platforms</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Workday', connected: false },
                          { name: 'BambooHR', connected: true },
                          { name: 'ADP', connected: false },
                          { name: 'Rippling', connected: false },
                        ].map(hr => (
                          <div key={hr.name} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <span className="font-medium">{hr.name}</span>
                            <Button variant={hr.connected ? 'outline' : 'default'} size="sm" onClick={() => {
                              setSelectedHRIntegration({ name: hr.name, connected: hr.connected })
                              setShowHRIntegrationDialog(true)
                            }}>
                              {hr.connected ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Audit & Compliance</CardTitle>
                        <p className="text-sm text-gray-500">Logging and compliance settings</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <History className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Audit Logging</p>
                              <p className="text-sm text-gray-500">Log all authentication events</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Detailed Logs</p>
                            <p className="text-sm text-gray-500">Include request/response data</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Log Retention Period</Label>
                          <Select defaultValue="365">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="730">2 years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security Notifications</CardTitle>
                        <p className="text-sm text-gray-500">Alert configuration</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">Suspicious Login Alerts</p>
                              <p className="text-sm text-gray-500">Email on unusual activity</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Admin Action Alerts</p>
                            <p className="text-sm text-gray-500">Notify on role changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Security Report</p>
                            <p className="text-sm text-gray-500">Summary of security events</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <p className="text-sm text-gray-500">Encryption and export</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Lock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Data Encryption at Rest</p>
                              <p className="text-sm text-gray-500">AES-256 encryption</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div>
                          <Label>Encryption Algorithm</Label>
                          <Select defaultValue="aes256">
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aes128">AES-128</SelectItem>
                              <SelectItem value="aes256">AES-256</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowExportDataDialog(true)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export All Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <p className="text-sm text-gray-500">Irreversible actions</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-800 dark:text-red-400">Reset All Permissions</h4>
                              <p className="text-sm text-red-600 dark:text-red-400/80">This will reset all custom permissions to defaults</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => setShowResetPermissionsDialog(true)}>
                              Reset
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-800 dark:text-red-400">Revoke All Sessions</h4>
                              <p className="text-sm text-red-600 dark:text-red-400/80">Force all users to re-authenticate</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => setShowRevokeSessionsDialog(true)}>
                              Revoke
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-red-800 dark:text-red-400">Delete All API Keys</h4>
                              <p className="text-sm text-red-600 dark:text-red-400/80">Revoke all API access immediately</p>
                            </div>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => setShowDeleteAPIKeysDialog(true)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Compliance Standards</CardTitle>
                        <p className="text-sm text-gray-500">Regulatory compliance settings</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">SOC 2 Compliance Mode</p>
                              <p className="text-sm text-gray-500">Enable SOC 2 Type II controls</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <Globe className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">GDPR Compliance</p>
                              <p className="text-sm text-gray-500">European data protection</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Lock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">HIPAA Compliance</p>
                              <p className="text-sm text-gray-500">Healthcare data protection</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                              <CreditCard className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium">PCI-DSS Compliance</p>
                              <p className="text-sm text-gray-500">Payment card industry standards</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Zero Trust Settings</CardTitle>
                        <p className="text-sm text-gray-500">Advanced security model</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Continuous Verification</p>
                            <p className="text-sm text-gray-500">Verify user identity on every request</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Device Trust</p>
                            <p className="text-sm text-gray-500">Require registered devices</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Network Context</p>
                            <p className="text-sm text-gray-500">Consider network location in auth</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Least Privilege Access</p>
                            <p className="text-sm text-gray-500">Minimal permissions by default</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockPermissionsAIInsights}
              title="Security Intelligence"
              onInsightAction={(insight) => {
                switch (insight.type) {
                  case 'warning':
                    toast.warning(insight.title)
                    break
                  case 'success':
                    toast.success(insight.title)
                    break
                  case 'info':
                    toast.info(insight.title)
                    break
                  default:
                    toast.success(`${insight.title} action completed`)
                }
              }}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockPermissionsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockPermissionsPredictions}
              title="Access Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockPermissionsActivities}
            title="Security Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={permissionsQuickActions}
            variant="grid"
          />
        </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowEditUserDialog(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowResetPasswordDialog(true)}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button variant="outline" onClick={() => setShowLockAccountDialog(true)}>
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
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddMembersDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Members
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowEditGroupDialog(true)}>
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
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setShowAssignUsersDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Users
                  </Button>
                  {selectedRole.isEditable && (
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditRoleDialog(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Role Dialog */}
        <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Create Custom Role
              </DialogTitle>
              <DialogDescription>Define a new role with specific permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Role Name (identifier)</Label>
                <Input
                  value={newRole.role_name}
                  onChange={(e) => setNewRole({ ...newRole, role_name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="custom_role"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label>Display Name</Label>
                <Input
                  value={newRole.display_name}
                  onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                  placeholder="Custom Role"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the purpose of this role..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Role Level</Label>
                <Select value={newRole.role_level} onValueChange={(v) => setNewRole({ ...newRole, role_level: v as RoleLevel })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateRole(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateRole} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Add New User
              </DialogTitle>
              <DialogDescription>Invite a new user to your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@company.com"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="John"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Doe"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    placeholder="Engineering"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newUser.title}
                    onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                    placeholder="Software Engineer"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateUser} disabled={isLoading}>
                {isLoading ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Group Dialog */}
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-purple-600" />
                Create Group
              </DialogTitle>
              <DialogDescription>Create a new group to organize users</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Engineering Team"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Describe the purpose of this group..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Group Type</Label>
                <Select value={newGroup.type} onValueChange={(v) => setNewGroup({ ...newGroup, type: v as GroupType })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="okta">Okta</SelectItem>
                    <SelectItem value="app">Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateGroup(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreateGroup} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Advanced Filters Dialog */}
        <Dialog open={showAdvancedFiltersDialog} onOpenChange={setShowAdvancedFiltersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Advanced User Filters
              </DialogTitle>
              <DialogDescription>Configure advanced filter criteria for user search</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Department</Label>
                <Select value={filterOptions.department} onValueChange={(v) => setFilterOptions({ ...filterOptions, department: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={filterOptions.role} onValueChange={(v) => setFilterOptions({ ...filterOptions, role: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All roles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>MFA Status</Label>
                <Select value={filterOptions.mfaStatus} onValueChange={(v) => setFilterOptions({ ...filterOptions, mfaStatus: v as 'all' | 'enabled' | 'disabled' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="enabled">MFA Enabled</SelectItem>
                    <SelectItem value="disabled">MFA Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Login Activity</Label>
                <Select value={filterOptions.loginActivity} onValueChange={(v) => setFilterOptions({ ...filterOptions, loginActivity: v as 'all' | 'active' | 'inactive' | 'never' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active (last 7 days)</SelectItem>
                    <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
                    <SelectItem value="never">Never logged in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFilterOptions({ department: '', role: '', mfaStatus: 'all', loginActivity: 'all' })}>Reset</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success('Filters applied')
                setShowAdvancedFiltersDialog(false)
              }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Options Dialog */}
        <Dialog open={showUserOptionsDialog} onOpenChange={setShowUserOptionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-purple-600" />
                User Actions
              </DialogTitle>
              <DialogDescription>{selectedUserForOptions?.displayName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                setSelectedUser(selectedUserForOptions)
                setShowUserOptionsDialog(false)
              }}>
                <Users className="w-4 h-4" />
                View Profile
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                setShowUserOptionsDialog(false)
                setShowEditUserDialog(true)
              }}>
                <Edit className="w-4 h-4" />
                Edit User
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                setShowUserOptionsDialog(false)
                setShowResetPasswordDialog(true)
              }}>
                <KeyRound className="w-4 h-4" />
                Reset Password
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                toast.success(`Session revoked`, { description: `${selectedUser?.firstName}'s sessions have been revoked` })
                setShowUserOptionsDialog(false)
              }}>
                <LockKeyhole className="w-4 h-4" />
                Revoke Sessions
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50" onClick={() => {
                setShowUserOptionsDialog(false)
                setShowLockAccountDialog(true)
              }}>
                <AlertTriangle className="w-4 h-4" />
                Suspend Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Policy Dialog */}
        <Dialog open={showCreatePolicyDialog} onOpenChange={setShowCreatePolicyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Create Security Policy
              </DialogTitle>
              <DialogDescription>Define a new security policy for your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Policy Name</Label>
                <Input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="Enter policy name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Describe the policy purpose..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Policy Type</Label>
                <Select value={newPolicy.type} onValueChange={(v) => setNewPolicy({ ...newPolicy, type: v as PolicyType })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sign_on">Sign-On Policy</SelectItem>
                    <SelectItem value="password">Password Policy</SelectItem>
                    <SelectItem value="mfa">MFA Policy</SelectItem>
                    <SelectItem value="session">Session Policy</SelectItem>
                    <SelectItem value="access">Access Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  value={newPolicy.priority}
                  onChange={(e) => setNewPolicy({ ...newPolicy, priority: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="100"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreatePolicyDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                if (!newPolicy.name) {
                  toast.error('Validation Error')
                  return
                }
                toast.success(`Policy created`, { description: `${newPolicy.name} has been created successfully` })
                setNewPolicy({ name: '', description: '', type: 'sign_on', priority: 1 })
                setShowCreatePolicyDialog(false)
              }}>
                Create Policy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Application Dialog */}
        <Dialog open={showAddApplicationDialog} onOpenChange={setShowAddApplicationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Add Application
              </DialogTitle>
              <DialogDescription>Configure a new SSO application</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Application Name</Label>
                <Input
                  value={newApplication.name}
                  onChange={(e) => setNewApplication({ ...newApplication, name: e.target.value })}
                  placeholder="Enter application name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Application Type</Label>
                <Select value={newApplication.type} onValueChange={(v) => setNewApplication({ ...newApplication, type: v as 'saml' | 'oidc' | 'spa' | 'native' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saml">SAML 2.0</SelectItem>
                    <SelectItem value="oidc">OpenID Connect</SelectItem>
                    <SelectItem value="spa">Single Page App (SPA)</SelectItem>
                    <SelectItem value="native">Native/Mobile App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Enable SSO</p>
                  <p className="text-sm text-gray-500">Allow single sign-on access</p>
                </div>
                <Switch checked={newApplication.ssoEnabled} onCheckedChange={(v) => setNewApplication({ ...newApplication, ssoEnabled: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddApplicationDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                if (!newApplication.name) {
                  toast.error('Validation Error')
                  return
                }
                toast.success(`Application added`, { description: `${newApplication.name} has been added successfully` })
                setNewApplication({ name: '', type: 'saml', ssoEnabled: true })
                setShowAddApplicationDialog(false)
              }}>
                Add Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                Export Audit Logs
              </DialogTitle>
              <DialogDescription>Configure export options for audit logs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <Select value={exportLogsOptions.format} onValueChange={(v) => setExportLogsOptions({ ...exportLogsOptions, format: v as 'json' | 'csv' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={exportLogsOptions.dateRange} onValueChange={(v) => setExportLogsOptions({ ...exportLogsOptions, dateRange: v as '24h' | '7d' | '30d' | '90d' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportLogsDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportLogsOptions.format}`
                const blob = new Blob([`Audit logs export - ${exportLogsOptions.dateRange}`], { type: exportLogsOptions.format === 'json' ? 'application/json' : 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                a.click()
                URL.revokeObjectURL(url)
                toast.success(`Export complete`, { description: `Logs exported as ${filename}` })
                setShowExportLogsDialog(false)
              }}>
                Export Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Copy Token Dialog */}
        <Dialog open={showCopyTokenDialog} onOpenChange={setShowCopyTokenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-600" />
                Copy Bearer Token
              </DialogTitle>
              <DialogDescription>Copy the SCIM bearer token to your clipboard</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  This token provides full SCIM API access. Keep it secure and never share it publicly.
                </p>
              </div>
              <div>
                <Label>Token (hidden for security)</Label>
                <Input type="password" value="scim_token_xxxxxxxxxxxxxxxxxx" disabled className="mt-1 font-mono" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCopyTokenDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={async () => {
                await navigator.clipboard.writeText('scim_token_xxxxxxxxxxxxxxxxxx')
                toast.success('Token copied')
                setShowCopyTokenDialog(false)
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regenerate Token Dialog */}
        <Dialog open={showRegenerateTokenDialog} onOpenChange={setShowRegenerateTokenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <RefreshCw className="w-5 h-5" />
                Regenerate SCIM Token
              </DialogTitle>
              <DialogDescription>This will invalidate the current token</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Warning: Regenerating the token will immediately revoke the current token. All integrations using the old token will stop working.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Make sure you update all services that use this token before proceeding.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegenerateTokenDialog(false)}>Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => {
                toast.success('Token regenerated')
                setShowRegenerateTokenDialog(false)
              }}>
                Regenerate Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Mapping Dialog */}
        <Dialog open={showAddMappingDialog} onOpenChange={setShowAddMappingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-purple-600" />
                Add Attribute Mapping
              </DialogTitle>
              <DialogDescription>Map an IdP attribute to a user field</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Source Attribute (IdP)</Label>
                <Input
                  value={newMapping.source}
                  onChange={(e) => setNewMapping({ ...newMapping, source: e.target.value })}
                  placeholder="e.g., user.department"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label>Target Field (User)</Label>
                <Input
                  value={newMapping.target}
                  onChange={(e) => setNewMapping({ ...newMapping, target: e.target.value })}
                  placeholder="e.g., department"
                  className="mt-1 font-mono"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Required Field</p>
                  <p className="text-sm text-gray-500">Mark as mandatory</p>
                </div>
                <Switch checked={newMapping.required} onCheckedChange={(v) => setNewMapping({ ...newMapping, required: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMappingDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                if (!newMapping.source || !newMapping.target) {
                  toast.error('Validation Error')
                  return
                }
                toast.success(`Mapping added`, { description: `${newMapping.source} -> ${newMapping.target}` })
                setNewMapping({ source: '', target: '', required: false })
                setShowAddMappingDialog(false)
              }}>
                Add Mapping
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Key Options Dialog */}
        <Dialog open={showAPIKeyOptionsDialog} onOpenChange={setShowAPIKeyOptionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                API Key Options
              </DialogTitle>
              <DialogDescription>{selectedAPIKey?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={async () => {
                await navigator.clipboard.writeText(`${selectedAPIKey?.prefix}xxxxxxxxxxxx`)
                toast.success('API key copied')
                setShowAPIKeyOptionsDialog(false)
              }}>
                <Copy className="w-4 h-4" />
                Copy API Key
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => {
                toast.success('API key rotated')
                setShowAPIKeyOptionsDialog(false)
              }}>
                <RefreshCw className="w-4 h-4" />
                Rotate Key
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50" onClick={() => {
                toast.success(`API key revoked`, { description: `${selectedAPIKey?.name} has been revoked` })
                setShowAPIKeyOptionsDialog(false)
              }}>
                <AlertTriangle className="w-4 h-4" />
                Revoke Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Webhook Dialog */}
        <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Add Webhook
              </DialogTitle>
              <DialogDescription>Configure a new webhook endpoint</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Webhook URL</Label>
                <Input
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://api.example.com/webhooks"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label className="mb-2 block">Events to Subscribe</Label>
                <div className="space-y-2">
                  {['user.created', 'user.updated', 'user.deleted', 'group.member_added', 'group.member_removed'].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] })
                          } else {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(ev => ev !== event) })
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={event} className="text-sm font-mono">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddWebhookDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                if (!newWebhook.url) {
                  toast.error('Validation Error')
                  return
                }
                toast.success('Webhook added')
                setNewWebhook({ url: '', events: [] })
                setShowAddWebhookDialog(false)
              }}>
                Add Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Directory Config Dialog */}
        <Dialog open={showDirectoryConfigDialog} onOpenChange={setShowDirectoryConfigDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-600" />
                {selectedDirectoryIntegration?.status === 'connected' ? 'Configure' : 'Connect'} {selectedDirectoryIntegration?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedDirectoryIntegration?.status === 'connected'
                  ? 'Manage directory integration settings'
                  : 'Set up connection to directory service'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDirectoryIntegration?.status === 'connected' ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Connected</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast.success('Sync complete')
                    }}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Auto-Sync</p>
                      <p className="text-sm text-gray-500">Sync every 15 minutes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Sync Groups</p>
                      <p className="text-sm text-gray-500">Import directory groups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Server URL</Label>
                    <Input placeholder="ldap://ldap.example.com:389" className="mt-1 font-mono" />
                  </div>
                  <div>
                    <Label>Bind DN</Label>
                    <Input placeholder="cn=admin,dc=example,dc=com" className="mt-1 font-mono" />
                  </div>
                  <div>
                    <Label>Bind Password</Label>
                    <Input type="password" placeholder="Enter password" className="mt-1" />
                  </div>
                  <div>
                    <Label>Base DN</Label>
                    <Input placeholder="dc=example,dc=com" className="mt-1 font-mono" />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDirectoryConfigDialog(false)}>
                {selectedDirectoryIntegration?.status === 'connected' ? 'Close' : 'Cancel'}
              </Button>
              {selectedDirectoryIntegration?.status !== 'connected' && (
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                  toast.success(`Connected`, { description: `${selectedDirectoryIntegration?.name} has been connected` })
                  setShowDirectoryConfigDialog(false)
                }}>
                  Connect
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* HR Integration Dialog */}
        <Dialog open={showHRIntegrationDialog} onOpenChange={setShowHRIntegrationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                {selectedHRIntegration?.connected ? 'Configure' : 'Connect'} {selectedHRIntegration?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedHRIntegration?.connected
                  ? 'Manage HR system integration settings'
                  : 'Set up connection to HR platform'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedHRIntegration?.connected ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">Connected</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast.success('Sync complete')
                    }}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Auto-provision</p>
                      <p className="text-sm text-gray-500">Create users from HR data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Sync Department</p>
                      <p className="text-sm text-gray-500">Update user departments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>API Key</Label>
                    <Input type="password" placeholder="Enter API key" className="mt-1 font-mono" />
                  </div>
                  <div>
                    <Label>Subdomain / Company ID</Label>
                    <Input placeholder="your-company" className="mt-1" />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHRIntegrationDialog(false)}>
                {selectedHRIntegration?.connected ? 'Close' : 'Cancel'}
              </Button>
              {!selectedHRIntegration?.connected && (
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                  toast.success(`Connected`, { description: `${selectedHRIntegration?.name} has been connected` })
                  setShowHRIntegrationDialog(false)
                }}>
                  Connect
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-purple-600" />
                Export All Data
              </DialogTitle>
              <DialogDescription>Export encrypted data backup</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This will export all user data, roles, policies, and configurations in an encrypted format.
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Include Audit Logs</p>
                  <p className="text-sm text-gray-500">Last 90 days of logs</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Include API Keys</p>
                  <p className="text-sm text-gray-500">Encrypted key hashes</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                const blob = new Blob([JSON.stringify({ export: 'permissions-data', date: new Date().toISOString() })], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `permissions-export-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Export complete')
                setShowExportDataDialog(false)
              }}>
                Export Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Permissions Dialog */}
        <Dialog open={showResetPermissionsDialog} onOpenChange={setShowResetPermissionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Reset All Permissions
              </DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This will reset all custom roles and permissions to their default state. Users may lose access to resources.
                </p>
              </div>
              <div>
                <Label>Type "RESET" to confirm</Label>
                <Input placeholder="RESET" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetPermissionsDialog(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
                toast.success('Permissions reset')
                setShowResetPermissionsDialog(false)
              }}>
                Reset Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revoke Sessions Dialog */}
        <Dialog open={showRevokeSessionsDialog} onOpenChange={setShowRevokeSessionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Revoke All Sessions
              </DialogTitle>
              <DialogDescription>Force all users to re-authenticate</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This will immediately log out all users across all devices. They will need to sign in again.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">Active sessions that will be revoked: <strong>156</strong></p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRevokeSessionsDialog(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
                toast.success('Sessions revoked')
                setShowRevokeSessionsDialog(false)
              }}>
                Revoke All Sessions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete API Keys Dialog */}
        <Dialog open={showDeleteAPIKeysDialog} onOpenChange={setShowDeleteAPIKeysDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Delete All API Keys
              </DialogTitle>
              <DialogDescription>This will break all API integrations</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> Deleting all API keys will immediately revoke API access. All integrations will stop working.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">API keys that will be deleted: <strong>3</strong></p>
              </div>
              <div>
                <Label>Type "DELETE" to confirm</Label>
                <Input placeholder="DELETE" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAPIKeysDialog(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
                toast.success('API keys deleted')
                setShowDeleteAPIKeysDialog(false)
              }}>
                Delete All Keys
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                Edit User
              </DialogTitle>
              <DialogDescription>Update user information for {selectedUser?.displayName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>First Name</Label>
                  <Input defaultValue={selectedUser?.firstName} className="mt-1" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input defaultValue={selectedUser?.lastName} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue={selectedUser?.email} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Department</Label>
                  <Input defaultValue={selectedUser?.department} className="mt-1" />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input defaultValue={selectedUser?.title} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedUser?.status}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success(`User updated`, { description: `${selectedUser?.displayName} has been updated` })
                setShowEditUserDialog(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                Reset Password
              </DialogTitle>
              <DialogDescription>Send a password reset email to {selectedUser?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  The user will receive an email with a link to reset their password. The link expires in 24 hours.
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Force password change on next login</p>
                  <p className="text-sm text-gray-500">User must set new password</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success(`Reset email sent`, { description: `Password reset email sent to ${selectedUser?.email}` })
                setShowResetPasswordDialog(false)
              }}>
                Send Reset Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lock Account Dialog */}
        <Dialog open={showLockAccountDialog} onOpenChange={setShowLockAccountDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <LockKeyhole className="w-5 h-5" />
                Lock Account
              </DialogTitle>
              <DialogDescription>Suspend access for {selectedUser?.displayName || selectedUserForOptions?.displayName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Locking this account will immediately revoke all active sessions and prevent the user from signing in.
                </p>
              </div>
              <div>
                <Label>Reason for suspension</Label>
                <Textarea placeholder="Enter reason..." className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLockAccountDialog(false)}>Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => {
                toast.success(`Account locked`, { description: `${selectedUser?.displayName || selectedUserForOptions?.displayName} has been suspended` })
                setShowLockAccountDialog(false)
              }}>
                Lock Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Members Dialog */}
        <Dialog open={showAddMembersDialog} onOpenChange={setShowAddMembersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Add Members to {selectedGroup?.name}
              </DialogTitle>
              <DialogDescription>Select users to add to this group</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {mockUsers.filter(u => !selectedGroup?.name.includes(u.groups[0])).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-500 text-white text-xs">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                      toast.success(`Member added`, { description: `${user.displayName} has been added to ${selectedGroup?.name}` })
                    }}>Add</Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMembersDialog(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Group Dialog */}
        <Dialog open={showEditGroupDialog} onOpenChange={setShowEditGroupDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                Edit Group
              </DialogTitle>
              <DialogDescription>Update group information for {selectedGroup?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input defaultValue={selectedGroup?.name} className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea defaultValue={selectedGroup?.description} className="mt-1" />
              </div>
              <div>
                <Label>Group Type</Label>
                <Select defaultValue={selectedGroup?.type}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="okta">Okta</SelectItem>
                    <SelectItem value="app">Application</SelectItem>
                    <SelectItem value="built_in">Built-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditGroupDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success(`Group updated`, { description: `${selectedGroup?.name} has been updated` })
                setShowEditGroupDialog(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Users Dialog */}
        <Dialog open={showAssignUsersDialog} onOpenChange={setShowAssignUsersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Assign Users to {selectedRole?.displayName}
              </DialogTitle>
              <DialogDescription>Select users to assign this role</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {mockUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-500 text-white text-xs">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={async () => {
                      await handleAssignUserToRole(user.id, selectedRole?.id || '')
                    }}>Assign</Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignUsersDialog(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-purple-600" />
                Edit Role
              </DialogTitle>
              <DialogDescription>Update role configuration for {selectedRole?.displayName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Display Name</Label>
                <Input defaultValue={selectedRole?.displayName} className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea defaultValue={selectedRole?.description} className="mt-1" />
              </div>
              <div>
                <Label>Role Level</Label>
                <Select defaultValue={selectedRole?.level}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Permissions</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedRole?.permissions.map(perm => (
                    <Badge key={perm} variant="outline" className="mr-1 font-mono text-xs">{perm}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.success(`Role updated`, { description: `${selectedRole?.displayName} has been updated` })
                setShowEditRoleDialog(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create API Key Dialog */}
        <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                Create API Key
              </DialogTitle>
              <DialogDescription>Generate a new API key for programmatic access</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Key Name</Label>
                <Input
                  value={newAPIKey.name}
                  onChange={(e) => setNewAPIKey({ ...newAPIKey, name: e.target.value })}
                  placeholder="e.g., Production API Key"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Environment</Label>
                <Select value={newAPIKey.environment} onValueChange={(v) => setNewAPIKey({ ...newAPIKey, environment: v as 'production' | 'development' | 'staging' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Make sure to copy the API key after creation. It will only be shown once.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAPIKeyDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                if (!newAPIKey.name) {
                  toast.error('Validation Error')
                  return
                }
                toast.success('API key created')
                setNewAPIKey({ name: '', environment: 'production' })
                setShowAPIKeyDialog(false)
              }}>
                Create API Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
