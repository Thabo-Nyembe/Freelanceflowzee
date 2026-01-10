'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Shield, Users, Lock, Key, Crown, UserCheck, UserX, Plus,
  Search, Filter, Download, RefreshCw, Settings, Eye, Copy,
  Trash2, CheckCircle, AlertCircle, XCircle, Globe, Clock, TrendingUp, BarChart3,
  FileText, AlertTriangle, ShieldCheck, ShieldAlert,
  UserPlus, UsersRound, FolderLock, KeyRound, Layers, Bell, Loader2
} from 'lucide-react'
import { useRoles, type UserRole } from '@/lib/hooks/use-roles'

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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

// Types
type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'pending'
type RoleType = 'admin' | 'user' | 'manager' | 'viewer' | 'custom' | 'service'
type AccessLevel = 'full' | 'write' | 'read' | 'restricted' | 'none'
type PolicyType = 'allow' | 'deny' | 'conditional'

interface Role {
  id: string
  name: string
  description: string
  roleCode: string
  type: RoleType
  status: RoleStatus
  accessLevel: AccessLevel
  permissions: Permission[]
  totalUsers: number
  activeUsers: number
  isSystem: boolean
  isDefault: boolean
  canDelegate: boolean
  expiresAt?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
  hierarchy: number
  parentRole?: string
  childRoles: string[]
  groups: string[]
}

interface Permission {
  id: string
  name: string
  code: string
  description: string
  category: string
  resource: string
  actions: string[]
  conditions?: PermissionCondition[]
  isGranted: boolean
}

interface PermissionCondition {
  type: 'time' | 'ip' | 'mfa' | 'location' | 'device'
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'between'
  value: string | string[]
}

interface UserAssignment {
  id: string
  userId: string
  userName: string
  email: string
  avatar?: string
  roleId: string
  roleName: string
  assignedAt: string
  assignedBy: string
  expiresAt?: string
  status: 'active' | 'expired' | 'suspended'
  lastAccess?: string
}

interface AccessPolicy {
  id: string
  name: string
  description: string
  type: PolicyType
  priority: number
  roles: string[]
  permissions: string[]
  conditions: PolicyCondition[]
  active: boolean
  createdAt: string
  updatedAt: string
}

interface PolicyCondition {
  field: string
  operator: string
  value: string
}

interface AuditLog {
  id: string
  action: string
  actor: string
  target: string
  targetType: 'role' | 'user' | 'permission' | 'policy'
  details: string
  timestamp: string
  ipAddress: string
  success: boolean
}

interface UserGroup {
  id: string
  name: string
  description: string
  memberCount: number
  roles: string[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  createdBy: string
  isSystem: boolean
}

// Mock Data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Administrator',
    description: 'Full system access with all permissions. Reserved for system administrators.',
    roleCode: 'SUPER_ADMIN',
    type: 'admin',
    status: 'active',
    accessLevel: 'full',
    permissions: [],
    totalUsers: 3,
    activeUsers: 3,
    isSystem: true,
    isDefault: false,
    canDelegate: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
    createdBy: 'System',
    tags: ['system', 'security-critical'],
    hierarchy: 1,
    childRoles: ['admin', 'manager'],
    groups: ['administrators']
  },
  {
    id: '2',
    name: 'Administrator',
    description: 'Administrative access for managing users, roles, and system settings.',
    roleCode: 'ADMIN',
    type: 'admin',
    status: 'active',
    accessLevel: 'full',
    permissions: [],
    totalUsers: 12,
    activeUsers: 10,
    isSystem: true,
    isDefault: false,
    canDelegate: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-18T15:30:00Z',
    createdBy: 'System',
    tags: ['system', 'management'],
    hierarchy: 2,
    parentRole: 'SUPER_ADMIN',
    childRoles: ['manager'],
    groups: ['administrators', 'staff']
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Team management access including user oversight and reporting capabilities.',
    roleCode: 'MANAGER',
    type: 'manager',
    status: 'active',
    accessLevel: 'write',
    permissions: [],
    totalUsers: 45,
    activeUsers: 38,
    isSystem: true,
    isDefault: false,
    canDelegate: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z',
    createdBy: 'System',
    tags: ['system', 'team-lead'],
    hierarchy: 3,
    parentRole: 'ADMIN',
    childRoles: ['user'],
    groups: ['managers', 'staff']
  },
  {
    id: '4',
    name: 'Standard User',
    description: 'Default role for regular platform users with standard access permissions.',
    roleCode: 'USER',
    type: 'user',
    status: 'active',
    accessLevel: 'write',
    permissions: [],
    totalUsers: 1250,
    activeUsers: 980,
    isSystem: true,
    isDefault: true,
    canDelegate: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
    createdBy: 'System',
    tags: ['system', 'default'],
    hierarchy: 4,
    parentRole: 'MANAGER',
    childRoles: ['viewer'],
    groups: ['users']
  },
  {
    id: '5',
    name: 'Viewer',
    description: 'Read-only access for viewing content without modification privileges.',
    roleCode: 'VIEWER',
    type: 'viewer',
    status: 'active',
    accessLevel: 'read',
    permissions: [],
    totalUsers: 320,
    activeUsers: 245,
    isSystem: true,
    isDefault: false,
    canDelegate: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-05T11:00:00Z',
    createdBy: 'System',
    tags: ['system', 'read-only'],
    hierarchy: 5,
    parentRole: 'USER',
    childRoles: [],
    groups: ['viewers', 'guests']
  },
  {
    id: '6',
    name: 'Finance Team',
    description: 'Custom role for finance department with billing and reporting access.',
    roleCode: 'FINANCE',
    type: 'custom',
    status: 'active',
    accessLevel: 'write',
    permissions: [],
    totalUsers: 18,
    activeUsers: 16,
    isSystem: false,
    isDefault: false,
    canDelegate: false,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z',
    createdBy: 'admin@company.com',
    tags: ['finance', 'billing', 'reports'],
    hierarchy: 4,
    parentRole: 'MANAGER',
    childRoles: [],
    groups: ['finance-team']
  },
  {
    id: '7',
    name: 'API Service Account',
    description: 'Service account for API integrations with limited scope.',
    roleCode: 'API_SERVICE',
    type: 'service',
    status: 'active',
    accessLevel: 'restricted',
    permissions: [],
    totalUsers: 8,
    activeUsers: 8,
    isSystem: false,
    isDefault: false,
    canDelegate: false,
    expiresAt: '2025-12-31T23:59:59Z',
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-12-01T12:00:00Z',
    createdBy: 'admin@company.com',
    tags: ['service', 'api', 'integration'],
    hierarchy: 5,
    childRoles: [],
    groups: ['service-accounts']
  }
]

const mockPermissions: Permission[] = [
  { id: '1', name: 'View Users', code: 'users:read', description: 'View user profiles and lists', category: 'Users', resource: 'users', actions: ['read'], isGranted: true },
  { id: '2', name: 'Create Users', code: 'users:create', description: 'Create new user accounts', category: 'Users', resource: 'users', actions: ['create'], isGranted: true },
  { id: '3', name: 'Edit Users', code: 'users:update', description: 'Modify user information', category: 'Users', resource: 'users', actions: ['update'], isGranted: true },
  { id: '4', name: 'Delete Users', code: 'users:delete', description: 'Remove user accounts', category: 'Users', resource: 'users', actions: ['delete'], isGranted: false },
  { id: '5', name: 'View Roles', code: 'roles:read', description: 'View role definitions', category: 'Roles', resource: 'roles', actions: ['read'], isGranted: true },
  { id: '6', name: 'Manage Roles', code: 'roles:manage', description: 'Create and modify roles', category: 'Roles', resource: 'roles', actions: ['create', 'update', 'delete'], isGranted: false },
  { id: '7', name: 'View Reports', code: 'reports:read', description: 'Access analytics and reports', category: 'Reports', resource: 'reports', actions: ['read'], isGranted: true },
  { id: '8', name: 'Export Data', code: 'data:export', description: 'Export data from the system', category: 'Data', resource: 'data', actions: ['export'], isGranted: true },
  { id: '9', name: 'System Settings', code: 'settings:manage', description: 'Configure system settings', category: 'Settings', resource: 'settings', actions: ['read', 'update'], isGranted: false },
  { id: '10', name: 'Billing Access', code: 'billing:manage', description: 'Access billing and payments', category: 'Billing', resource: 'billing', actions: ['read', 'update'], isGranted: false }
]

const mockUserAssignments: UserAssignment[] = [
  { id: '1', userId: 'u1', userName: 'John Smith', email: 'john@company.com', roleId: '1', roleName: 'Super Administrator', assignedAt: '2024-01-15T10:00:00Z', assignedBy: 'System', status: 'active', lastAccess: '2024-12-25T08:30:00Z' },
  { id: '2', userId: 'u2', userName: 'Sarah Johnson', email: 'sarah@company.com', roleId: '2', roleName: 'Administrator', assignedAt: '2024-02-01T09:00:00Z', assignedBy: 'john@company.com', status: 'active', lastAccess: '2024-12-24T16:45:00Z' },
  { id: '3', userId: 'u3', userName: 'Mike Wilson', email: 'mike@company.com', roleId: '3', roleName: 'Manager', assignedAt: '2024-03-10T14:00:00Z', assignedBy: 'sarah@company.com', status: 'active', lastAccess: '2024-12-25T09:15:00Z' },
  { id: '4', userId: 'u4', userName: 'Emily Brown', email: 'emily@company.com', roleId: '4', roleName: 'Standard User', assignedAt: '2024-04-20T11:00:00Z', assignedBy: 'mike@company.com', status: 'active', lastAccess: '2024-12-23T12:00:00Z' },
  { id: '5', userId: 'u5', userName: 'David Lee', email: 'david@company.com', roleId: '4', roleName: 'Standard User', assignedAt: '2024-05-15T10:30:00Z', assignedBy: 'sarah@company.com', status: 'active', lastAccess: '2024-12-22T18:30:00Z' },
  { id: '6', userId: 'u6', userName: 'Lisa Chen', email: 'lisa@company.com', roleId: '6', roleName: 'Finance Team', assignedAt: '2024-06-01T09:00:00Z', assignedBy: 'john@company.com', status: 'active', lastAccess: '2024-12-24T14:20:00Z' }
]

const mockPolicies: AccessPolicy[] = [
  { id: '1', name: 'Admin MFA Required', description: 'Require MFA for all admin role access', type: 'conditional', priority: 1, roles: ['SUPER_ADMIN', 'ADMIN'], permissions: ['*'], conditions: [{ field: 'mfa', operator: 'equals', value: 'true' }], active: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z' },
  { id: '2', name: 'Office Hours Only', description: 'Restrict access to office hours for certain roles', type: 'conditional', priority: 2, roles: ['USER', 'VIEWER'], permissions: ['data:export'], conditions: [{ field: 'time', operator: 'between', value: '09:00-18:00' }], active: true, createdAt: '2024-02-15T00:00:00Z', updatedAt: '2024-11-15T00:00:00Z' },
  { id: '3', name: 'Block External IPs', description: 'Deny admin access from external networks', type: 'deny', priority: 1, roles: ['ADMIN'], permissions: ['settings:manage'], conditions: [{ field: 'ip', operator: 'not_in', value: '10.0.0.0/8' }], active: true, createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-10-20T00:00:00Z' },
  { id: '4', name: 'Allow API Access', description: 'Allow API service accounts full API access', type: 'allow', priority: 3, roles: ['API_SERVICE'], permissions: ['api:*'], conditions: [], active: true, createdAt: '2024-06-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z' }
]

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'role.assigned', actor: 'sarah@company.com', target: 'emily@company.com', targetType: 'user', details: 'Assigned role: Standard User', timestamp: '2024-12-25T10:30:00Z', ipAddress: '10.0.1.50', success: true },
  { id: '2', action: 'role.updated', actor: 'john@company.com', target: 'Finance Team', targetType: 'role', details: 'Added permission: reports:read', timestamp: '2024-12-24T15:45:00Z', ipAddress: '10.0.1.10', success: true },
  { id: '3', action: 'permission.denied', actor: 'mike@company.com', target: 'settings:manage', targetType: 'permission', details: 'Attempted access denied by policy', timestamp: '2024-12-24T14:20:00Z', ipAddress: '192.168.1.100', success: false },
  { id: '4', action: 'role.created', actor: 'sarah@company.com', target: 'Marketing Team', targetType: 'role', details: 'New custom role created', timestamp: '2024-12-23T11:00:00Z', ipAddress: '10.0.1.25', success: true },
  { id: '5', action: 'policy.updated', actor: 'john@company.com', target: 'Admin MFA Required', targetType: 'policy', details: 'Modified condition parameters', timestamp: '2024-12-22T09:30:00Z', ipAddress: '10.0.1.10', success: true }
]

const mockUserGroups: UserGroup[] = [
  { id: '1', name: 'Administrators', description: 'System administrators with full access', memberCount: 15, roles: ['SUPER_ADMIN', 'ADMIN'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-20T10:00:00Z', createdBy: 'System', isSystem: true },
  { id: '2', name: 'Staff', description: 'Regular staff members', memberCount: 245, roles: ['USER', 'MANAGER'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-15T09:00:00Z', createdBy: 'System', isSystem: true },
  { id: '3', name: 'Managers', description: 'Team managers with oversight permissions', memberCount: 45, roles: ['MANAGER'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-10T14:00:00Z', createdBy: 'System', isSystem: true },
  { id: '4', name: 'Finance Team', description: 'Finance department members', memberCount: 18, roles: ['FINANCE', 'USER'], status: 'active', createdAt: '2024-03-15T10:00:00Z', updatedAt: '2024-12-20T16:00:00Z', createdBy: 'admin@company.com', isSystem: false },
  { id: '5', name: 'Viewers', description: 'Read-only access users', memberCount: 320, roles: ['VIEWER'], status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-05T11:00:00Z', createdBy: 'System', isSystem: true },
  { id: '6', name: 'Guests', description: 'External guest users', memberCount: 85, roles: ['VIEWER'], status: 'active', createdAt: '2024-02-01T09:00:00Z', updatedAt: '2024-11-30T15:00:00Z', createdBy: 'admin@company.com', isSystem: false },
  { id: '7', name: 'Service Accounts', description: 'API and integration accounts', memberCount: 8, roles: ['API_SERVICE'], status: 'active', createdAt: '2024-06-01T09:00:00Z', updatedAt: '2024-12-01T12:00:00Z', createdBy: 'admin@company.com', isSystem: false }
]

// Helper functions
const getStatusColor = (status: RoleStatus): string => {
  const colors: Record<RoleStatus, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    deprecated: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return colors[status]
}

const getTypeColor = (type: RoleType): string => {
  const colors: Record<RoleType, string> = {
    admin: 'bg-red-100 text-red-700',
    manager: 'bg-purple-100 text-purple-700',
    user: 'bg-blue-100 text-blue-700',
    viewer: 'bg-green-100 text-green-700',
    custom: 'bg-indigo-100 text-indigo-700',
    service: 'bg-orange-100 text-orange-700'
  }
  return colors[type]
}

const getAccessLevelColor = (level: AccessLevel): string => {
  const colors: Record<AccessLevel, string> = {
    full: 'bg-red-100 text-red-700',
    write: 'bg-blue-100 text-blue-700',
    read: 'bg-green-100 text-green-700',
    restricted: 'bg-yellow-100 text-yellow-700',
    none: 'bg-gray-100 text-gray-700'
  }
  return colors[level]
}

const getPolicyTypeColor = (type: PolicyType): string => {
  const colors: Record<PolicyType, string> = {
    allow: 'bg-green-100 text-green-700',
    deny: 'bg-red-100 text-red-700',
    conditional: 'bg-blue-100 text-blue-700'
  }
  return colors[type]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Enhanced Competitive Upgrade Mock Data
const mockRolesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Access Control', description: 'Role-based security 100% compliant. All permissions properly scoped.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '2', type: 'info' as const, title: 'Role Optimization', description: '3 roles have overlapping permissions. Consider consolidation.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
  { id: '3', type: 'warning' as const, title: 'Unused Roles', description: '2 roles have no assigned users. Review for cleanup.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Cleanup' },
]

const mockRolesCollaborators = [
  { id: '1', name: 'Security Admin', avatar: '/avatars/security.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'IT Manager', avatar: '/avatars/it.jpg', status: 'online' as const, role: 'Manager' },
  { id: '3', name: 'HR Lead', avatar: '/avatars/hr.jpg', status: 'away' as const, role: 'HR' },
]

const mockRolesPredictions = [
  { id: '1', title: 'Role Growth', prediction: '5 new roles needed for Q2 expansion', confidence: 78, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Permission Audit', prediction: 'Audit due in 30 days', confidence: 100, trend: 'stable' as const, impact: 'medium' as const },
]

const mockRolesActivities = [
  { id: '1', user: 'Admin', action: 'Created role', target: 'Project Manager', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'System', action: 'Auto-assigned', target: '12 users to Developer role', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Security', action: 'Updated permissions for', target: 'Admin role', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions will be defined inside the component to access state setters and handlers

// Initial form state for creating/editing roles
const initialRoleFormState = {
  name: '',
  description: '',
  role_code: '',
  type: 'user' as 'admin' | 'manager' | 'user' | 'viewer' | 'custom',
  status: 'active' as 'active' | 'inactive' | 'deprecated',
  access_level: 'read' as 'full' | 'write' | 'read' | 'restricted',
  can_delegate: false,
  is_default: false,
  permissions: [] as string[],
  tags: [] as string[],
}

export default function RolesClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [typeFilter, setTypeFilter] = useState<RoleType | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase hooks
  const {
    roles: dbRoles,
    loading: rolesLoading,
    createRole,
    updateRole,
    deleteRole,
    activateRole,
    deactivateRole,
    cloneRole,
    fetchRoles
  } = useRoles()

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)
  const [roleToClone, setRoleToClone] = useState<{ id: string; name: string } | null>(null)
  const [cloneName, setCloneName] = useState('')
  const [editingRole, setEditingRole] = useState<UserRole | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formState, setFormState] = useState(initialRoleFormState)

  // Reset form
  const resetForm = () => {
    setFormState(initialRoleFormState)
  }

  // Map database roles to display format (combine with mock data for display)
  const combinedRoles = useMemo(() => {
    const dbRolesMapped: Role[] = dbRoles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      roleCode: r.role_code,
      type: r.type as RoleType,
      status: r.status as RoleStatus,
      accessLevel: r.access_level as AccessLevel,
      permissions: [],
      totalUsers: r.total_users || 0,
      activeUsers: r.active_users || 0,
      isSystem: r.is_system,
      isDefault: r.is_default,
      canDelegate: r.can_delegate,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      createdBy: r.created_by || 'System',
      tags: r.tags || [],
      hierarchy: 1,
      childRoles: [],
      groups: []
    }))
    // Return database roles if available, otherwise fallback to mock
    return dbRolesMapped.length > 0 ? dbRolesMapped : mockRoles
  }, [dbRoles])

  // Computed stats
  const stats = useMemo(() => {
    const rolesData = combinedRoles.length > 0 ? combinedRoles : mockRoles
    const totalUsers = rolesData.reduce((sum, r) => sum + r.totalUsers, 0)
    const activeUsers = rolesData.reduce((sum, r) => sum + r.activeUsers, 0)
    const systemRoles = rolesData.filter(r => r.isSystem).length
    const customRoles = rolesData.filter(r => !r.isSystem).length
    const activeRoles = rolesData.filter(r => r.status === 'active').length
    const activePolicies = mockPolicies.filter(p => p.active).length

    return {
      totalRoles: rolesData.length,
      activeRoles,
      systemRoles,
      customRoles,
      totalUsers,
      activeUsers,
      totalPermissions: mockPermissions.length,
      activePolicies
    }
  }, [combinedRoles])

  // Filtered roles
  const filteredRoles = useMemo(() => {
    const rolesData = combinedRoles.length > 0 ? combinedRoles : mockRoles
    return rolesData.filter(role => {
      const matchesSearch = searchQuery === '' ||
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.roleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || role.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [searchQuery, typeFilter, combinedRoles])

  // Grouped permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped: Record<string, Permission[]> = {}
    mockPermissions.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = []
      }
      grouped[perm.category].push(perm)
    })
    return grouped
  }, [])

  // Handlers
  const handleCreateRole = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  const handleSubmitCreate = async () => {
    if (!formState.name.trim()) {
      toast.error('Validation Error', { description: 'Role name is required' })
      return
    }
    if (!formState.role_code.trim()) {
      toast.error('Validation Error', { description: 'Role code is required' })
      return
    }

    setIsSubmitting(true)
    try {
      await createRole({
        name: formState.name,
        description: formState.description || null,
        role_code: formState.role_code.toUpperCase().replace(/\s+/g, '_'),
        type: formState.type,
        status: formState.status,
        access_level: formState.access_level,
        can_delegate: formState.can_delegate,
        is_default: formState.is_default,
        permissions: formState.permissions,
        tags: formState.tags,
      })
      setCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRole = (role: Role) => {
    // Find the database role
    const dbRole = dbRoles.find(r => r.id === role.id)
    if (dbRole) {
      setEditingRole(dbRole)
      setFormState({
        name: dbRole.name,
        description: dbRole.description || '',
        role_code: dbRole.role_code,
        type: dbRole.type,
        status: dbRole.status,
        access_level: dbRole.access_level,
        can_delegate: dbRole.can_delegate,
        is_default: dbRole.is_default,
        permissions: dbRole.permissions || [],
        tags: dbRole.tags || [],
      })
      setEditDialogOpen(true)
    } else {
      toast.info('Edit Role', { description: `Viewing "${role.name}" (mock data)` })
    }
  }

  const handleSubmitEdit = async () => {
    if (!editingRole) return
    if (!formState.name.trim()) {
      toast.error('Validation Error', { description: 'Role name is required' })
      return
    }

    setIsSubmitting(true)
    try {
      await updateRole(editingRole.id, {
        name: formState.name,
        description: formState.description || null,
        type: formState.type,
        status: formState.status,
        access_level: formState.access_level,
        can_delegate: formState.can_delegate,
        is_default: formState.is_default,
        permissions: formState.permissions,
        tags: formState.tags,
      })
      setEditDialogOpen(false)
      setEditingRole(null)
      resetForm()
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRole = (roleId: string, roleName: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error('Cannot Delete', { description: 'System roles cannot be deleted' })
      return
    }
    setRoleToDelete(roleId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return

    setIsSubmitting(true)
    try {
      await deleteRole(roleToDelete)
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicateRole = (role: Role) => {
    setRoleToClone({ id: role.id, name: role.name })
    setCloneName(`${role.name} (Copy)`)
    setCloneDialogOpen(true)
  }

  const handleConfirmClone = async () => {
    if (!roleToClone || !cloneName.trim()) {
      toast.error('Validation Error', { description: 'Clone name is required' })
      return
    }

    setIsSubmitting(true)
    try {
      await cloneRole(roleToClone.id, cloneName)
      setCloneDialogOpen(false)
      setRoleToClone(null)
      setCloneName('')
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleRoleStatus = async (roleId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'active') {
        await deactivateRole(roleId)
      } else {
        await activateRole(roleId)
      }
    } catch (error) {
      // Error is handled by the hook
    }
  }

  const handleAssignRole = (roleName: string) => {
    toast.info('Assign Role', { description: `Assigning "${roleName}" to users...` })
  }

  const handleRefreshRoles = async () => {
    toast.info('Refreshing', { description: 'Fetching latest roles...' })
    await fetchRoles()
    toast.success('Refreshed', { description: 'Role data updated' })
  }

  const handleExportRoles = () => {
    const exportData = combinedRoles.map(r => ({
      name: r.name,
      code: r.roleCode,
      type: r.type,
      status: r.status,
      accessLevel: r.accessLevel,
      totalUsers: r.totalUsers,
      isSystem: r.isSystem,
      createdAt: r.createdAt
    }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `roles-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', { description: 'Roles data exported successfully' })
  }

  // Export audit logs as JSON
  const handleExportAuditLogs = () => {
    const blob = new Blob([JSON.stringify(mockAuditLogs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', { description: 'Audit logs exported successfully' })
  }

  // Export user assignments as JSON
  const handleExportUserAssignments = () => {
    const blob = new Blob([JSON.stringify(mockUserAssignments, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-assignments-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Exported', { description: 'User assignments exported successfully' })
  }

  // Handle permission sync (refresh permissions from server)
  const handleSyncPermissions = async () => {
    toast.info('Syncing', { description: 'Syncing permissions...' })
    await fetchRoles()
    toast.success('Synced', { description: 'Permissions synced successfully' })
  }

  // Handle policy evaluation
  const handleEvaluatePolicies = () => {
    toast.info('Evaluating', { description: 'Evaluating access policies...' })
    // Simulate policy evaluation
    setTimeout(() => {
      toast.success('Evaluated', { description: `${mockPolicies.filter(p => p.active).length} active policies evaluated` })
    }, 1000)
  }

  // Handle user group sync
  const handleSyncUserGroups = async () => {
    toast.info('Syncing', { description: 'Syncing user groups...' })
    await fetchRoles()
    toast.success('Synced', { description: 'User groups synced successfully' })
  }

  // Handle filter apply (for demonstration)
  const handleApplyFilter = (section: string) => {
    toast.success('Filters Applied', { description: `${section} filters applied successfully` })
  }

  // Settings save handlers
  const handleSaveGeneralSettings = () => {
    toast.success('Settings Saved', { description: 'General settings saved successfully' })
  }

  const handleSaveSecuritySettings = () => {
    toast.success('Settings Saved', { description: 'Security settings saved successfully' })
  }

  const handleSavePermissionSettings = () => {
    toast.success('Settings Saved', { description: 'Permission settings saved successfully' })
  }

  const handleSaveNotificationSettings = () => {
    toast.success('Settings Saved', { description: 'Notification settings saved successfully' })
  }

  const handleSaveAdvancedSettings = () => {
    toast.success('Settings Saved', { description: 'Advanced settings saved successfully' })
  }

  // Handle integration connect/configure
  const handleIntegrationAction = (name: string, status: string) => {
    if (status === 'connected') {
      toast.success('Configured', { description: `${name} configured successfully` })
    } else {
      toast.success('Connected', { description: `Connected to ${name} successfully` })
    }
  }

  // Danger zone actions
  const handleResetPermissions = () => {
    if (confirm('Are you sure you want to reset all permissions? This action cannot be undone.')) {
      toast.success('Reset Complete', { description: 'All permissions have been reset' })
    }
  }

  const handleClearAuditLogs = () => {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      toast.success('Cleared', { description: 'Audit logs have been cleared' })
    }
  }

  // Handle permission audit
  const handleAuditPermissions = () => {
    toast.info('Auditing', { description: 'Running permission audit...' })
    setTimeout(() => {
      toast.success('Audit Complete', { description: `Audit complete! ${combinedRoles.filter(r => r.type === 'admin').length} roles have elevated access` })
    }, 1500)
  }

  // Quick actions for the QuickActionsToolbar component
  const rolesQuickActions = [
    { id: '1', label: 'New Role', icon: 'plus', action: () => setCreateDialogOpen(true), variant: 'default' as const },
    { id: '2', label: 'Audit Permissions', icon: 'shield', action: handleAuditPermissions, variant: 'default' as const },
    { id: '3', label: 'Export Report', icon: 'download', action: handleExportRoles, variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Identity & Access Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Okta-level role-based access control and permissions
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportRoles}>
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button onClick={handleCreateRole} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Role
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Total Roles', value: stats.totalRoles.toString(), icon: Shield, gradient: 'from-purple-500 to-indigo-600' },
              { label: 'Active Roles', value: stats.activeRoles.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600' },
              { label: 'System Roles', value: stats.systemRoles.toString(), icon: Crown, gradient: 'from-yellow-500 to-orange-600' },
              { label: 'Custom Roles', value: stats.customRoles.toString(), icon: Layers, gradient: 'from-blue-500 to-cyan-600' },
              { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, gradient: 'from-pink-500 to-rose-600' },
              { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: UserCheck, gradient: 'from-cyan-500 to-blue-600' },
              { label: 'Permissions', value: stats.totalPermissions.toString(), icon: Key, gradient: 'from-orange-500 to-amber-600' },
              { label: 'Policies', value: stats.activePolicies.toString(), icon: ShieldCheck, gradient: 'from-red-500 to-pink-600' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Key className="w-4 h-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <UsersRound className="w-4 h-4 mr-2" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="policies" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <FolderLock className="w-4 h-4 mr-2" />
                Policies
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Audit Log
              </TabsTrigger>
              <TabsTrigger value="groups" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <UsersRound className="w-4 h-4 mr-2" />
                Groups
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* IAM Overview Banner */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Identity & Access Management Overview</h2>
                    <p className="text-purple-100 text-sm">Enterprise-grade role-based access control</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleRefreshRoles}><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
                    <Button onClick={handleCreateRole} className="bg-white text-purple-700 hover:bg-purple-50"><Plus className="h-4 w-4 mr-2" />New Role</Button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.totalRoles}</p>
                    <p className="text-xs text-purple-100">Total Roles</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.activeRoles}</p>
                    <p className="text-xs text-purple-100">Active Roles</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-purple-100">Total Users</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.totalPermissions}</p>
                    <p className="text-xs text-purple-100">Permissions</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.activePolicies}</p>
                    <p className="text-xs text-purple-100">Active Policies</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-xs text-purple-100">Uptime</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-6 gap-4">
                {[
                  { name: 'Create Role', icon: Plus, desc: 'Add new role', color: 'purple' },
                  { name: 'Assign User', icon: UserPlus, desc: 'User to role', color: 'blue' },
                  { name: 'Add Policy', icon: FolderLock, desc: 'Access policy', color: 'green' },
                  { name: 'Audit Log', icon: FileText, desc: 'View activity', color: 'amber' },
                  { name: 'Security', icon: ShieldCheck, desc: 'Check status', color: 'red' },
                  { name: 'Reports', icon: BarChart3, desc: 'Analytics', color: 'indigo' },
                ].map((action, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center`}>
                        <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <h4 className="font-medium text-sm">{action.name}</h4>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Distribution */}
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      Role Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {combinedRoles.slice(0, 5).map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{role.name}</p>
                              <p className="text-sm text-gray-500">{role.totalUsers.toLocaleString()} users assigned</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getTypeColor(role.type)}>{role.type}</Badge>
                            <div className="mt-2 w-32">
                              <Progress value={role.totalUsers > 0 ? (role.activeUsers / role.totalUsers) * 100 : 0} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">{role.activeUsers} active</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Overview */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      Security Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">MFA Enabled</span>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">94%</p>
                        <p className="text-xs text-green-600">of admin accounts</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Active Sessions</span>
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">1,245</p>
                        <p className="text-xs text-blue-600">across all roles</p>
                      </div>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Pending Reviews</span>
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">12</p>
                        <p className="text-xs text-yellow-600">roles need review</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAuditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${log.success ? 'bg-green-100' : 'bg-red-100'}`}>
                            {log.success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{log.action.replace('.', ' ').replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500">{log.actor} → {log.target}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Role Insights */}
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Top Assigned Roles</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...combinedRoles].sort((a, b) => b.totalUsers - a.totalUsers).slice(0, 4).map((role, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">{i + 1}.</span>
                            <span className="text-sm">{role.name}</span>
                          </div>
                          <span className="text-sm font-bold">{role.totalUsers}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Security Compliance</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'MFA Enforcement', value: 89, color: 'green' },
                        { name: 'Session Security', value: 95, color: 'green' },
                        { name: 'Role Audit Coverage', value: 78, color: 'yellow' },
                        { name: 'Policy Compliance', value: 92, color: 'green' },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{item.name}</span>
                            <span className={`font-bold text-${item.color}-600`}>{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button onClick={handleCreateRole} variant="outline" className="w-full justify-start text-sm"><Plus className="w-4 h-4 mr-2" />Create New Role</Button>
                      <Button onClick={() => handleAssignRole('selected role')} variant="outline" className="w-full justify-start text-sm"><UserPlus className="w-4 h-4 mr-2" />Assign Users</Button>
                      <Button onClick={handleExportRoles} variant="outline" className="w-full justify-start text-sm"><Download className="w-4 h-4 mr-2" />Export Report</Button>
                      <Button onClick={handleRefreshRoles} variant="outline" className="w-full justify-start text-sm"><RefreshCw className="w-4 h-4 mr-2" />Sync Directory</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Role Analytics Summary */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Avg Users/Role', value: stats.totalRoles > 0 ? Math.round(stats.totalUsers / stats.totalRoles) : 0, trend: '+12%', color: 'purple' },
                  { label: 'Delegation Rate', value: `${combinedRoles.length > 0 ? Math.round((combinedRoles.filter(r => r.canDelegate).length / combinedRoles.length) * 100) : 0}%`, trend: '+5%', color: 'blue' },
                  { label: 'Custom Roles', value: stats.customRoles, trend: '+3', color: 'green' },
                  { label: 'Active Sessions', value: '1,245', trend: '-8%', color: 'amber' },
                ].map((item, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{item.label}</span>
                        <Badge className={`text-xs ${item.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.trend}</Badge>
                      </div>
                      <p className={`text-2xl font-bold mt-2 text-${item.color}-600`}>{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Access Trends */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Access Trends (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const values = [45, 62, 78, 85, 72, 35, 28]
                      return (
                        <div key={day} className="text-center">
                          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-lg" style={{ height: `${values[i]}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{day}</p>
                          <p className="text-xs font-bold">{values[i]}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">All IAM Systems Operational</span>
                    </div>
                    <span className="text-sm text-gray-400">Last sync: 2 minutes ago</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              {/* Roles Overview Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Role Management</h2>
                    <p className="text-indigo-100 text-sm">Configure and manage access roles</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleExportRoles}><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Button onClick={handleCreateRole} className="bg-white text-indigo-700 hover:bg-indigo-50"><Plus className="h-4 w-4 mr-2" />Create Role</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.systemRoles}</p>
                    <p className="text-xs text-indigo-100">System Roles</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.customRoles}</p>
                    <p className="text-xs text-indigo-100">Custom Roles</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.activeRoles}</p>
                    <p className="text-xs text-indigo-100">Active</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{combinedRoles.filter(r => r.status === 'inactive').length}</p>
                    <p className="text-xs text-indigo-100">Inactive</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{combinedRoles.filter(r => r.canDelegate).length}</p>
                    <p className="text-xs text-indigo-100">Delegatable</p>
                  </div>
                </div>
              </div>

              {/* Role Types Distribution */}
              <div className="grid grid-cols-6 gap-4">
                {[
                  { type: 'admin', count: combinedRoles.filter(r => r.type === 'admin').length, color: 'red', icon: Crown },
                  { type: 'manager', count: combinedRoles.filter(r => r.type === 'manager').length, color: 'orange', icon: Users },
                  { type: 'user', count: combinedRoles.filter(r => r.type === 'user').length, color: 'blue', icon: UserCheck },
                  { type: 'viewer', count: combinedRoles.filter(r => r.type === 'viewer').length, color: 'green', icon: Eye },
                  { type: 'custom', count: combinedRoles.filter(r => r.type === 'custom').length, color: 'purple', icon: Shield },
                  { type: 'service', count: combinedRoles.filter(r => r.type === 'service').length, color: 'gray', icon: KeyRound },
                ].map((item, i) => (
                  <Card key={i} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all ${typeFilter === item.type ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setTypeFilter(item.type as any)}>
                    <CardContent className="p-4 text-center">
                      <item.icon className={`h-6 w-6 mx-auto mb-2 text-${item.color}-600`} />
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search roles by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'admin', 'manager', 'user', 'viewer', 'custom', 'service'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={typeFilter === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTypeFilter(type)}
                      className={typeFilter === type ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : ''}
                    >
                      {type === 'all' ? 'All' : type}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Roles List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredRoles.map((role) => (
                  <Card key={role.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{role.name}</CardTitle>
                              {role.isSystem && <Crown className="w-4 h-4 text-yellow-500" />}
                              {role.isDefault && <Badge className="bg-yellow-100 text-yellow-700">Default</Badge>}
                            </div>
                            <CardDescription className="mt-1">{role.roleCode}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(role.status)}>{role.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{role.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getTypeColor(role.type)}>{role.type}</Badge>
                        <Badge className={getAccessLevelColor(role.accessLevel)}>{role.accessLevel} access</Badge>
                        {role.canDelegate && <Badge variant="outline">Can Delegate</Badge>}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{role.totalUsers}</p>
                          <p className="text-xs text-gray-500">Total Users</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{role.activeUsers}</p>
                          <p className="text-xs text-gray-500">Active</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{role.hierarchy}</p>
                          <p className="text-xs text-gray-500">Hierarchy</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {role.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditRole(role)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDuplicateRole(role)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!role.isSystem && (
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteRole(role.id, role.name, role.isSystem)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-6">
              {/* Permissions Overview Banner */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Permission Management</h2>
                    <p className="text-amber-100 text-sm">Fine-grained access control configuration</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleSyncPermissions}><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
                    <Button onClick={handleCreateRole} className="bg-white text-amber-700 hover:bg-amber-50"><Plus className="h-4 w-4 mr-2" />Add Permission</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{stats.totalPermissions}</p>
                    <p className="text-xs text-amber-100">Total</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{Object.keys(permissionsByCategory).length}</p>
                    <p className="text-xs text-amber-100">Categories</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPermissions.filter(p => p.isGranted).length}</p>
                    <p className="text-xs text-amber-100">Granted</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPermissions.filter(p => !p.isGranted).length}</p>
                    <p className="text-xs text-amber-100">Denied</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPermissions.filter(p => p.conditions && p.conditions.length > 0).length}</p>
                    <p className="text-xs text-amber-100">Conditional</p>
                  </div>
                </div>
              </div>

              {/* Permission Categories */}
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(permissionsByCategory).slice(0, 4).map(([category, perms], i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <FolderLock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{category}</h4>
                          <p className="text-xs text-gray-500">{perms.length} permissions</p>
                        </div>
                      </div>
                      <Progress value={(perms.filter(p => p.isGranted).length / perms.length) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{perms.filter(p => p.isGranted).length} granted</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    Permission Matrix
                  </CardTitle>
                  <CardDescription>Manage granular permissions across the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-6">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <div key={category}>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <FolderLock className="w-4 h-4 text-purple-600" />
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {permissions.map((perm) => (
                              <div key={perm.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${perm.isGranted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <KeyRound className={`w-4 h-4 ${perm.isGranted ? 'text-green-600' : 'text-gray-400'}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{perm.name}</p>
                                    <p className="text-sm text-gray-500">{perm.code}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1">
                                    {perm.actions.map((action, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">{action}</Badge>
                                    ))}
                                  </div>
                                  <Switch checked={perm.isGranted} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-6">
              {/* Assignments Overview Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">User Role Assignments</h2>
                    <p className="text-blue-100 text-sm">Manage user-to-role mappings</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleExportUserAssignments}><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Button onClick={() => handleAssignRole('selected user')} className="bg-white text-blue-700 hover:bg-blue-50"><UserPlus className="h-4 w-4 mr-2" />Assign Role</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserAssignments.length}</p>
                    <p className="text-xs text-blue-100">Total</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserAssignments.filter(a => a.status === 'active').length}</p>
                    <p className="text-xs text-blue-100">Active</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserAssignments.filter(a => a.status === 'expired').length}</p>
                    <p className="text-xs text-blue-100">Expired</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserAssignments.filter(a => a.expiresAt).length}</p>
                    <p className="text-xs text-blue-100">Temporary</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{new Set(mockUserAssignments.map(a => a.roleName)).size}</p>
                    <p className="text-xs text-blue-100">Roles Used</p>
                  </div>
                </div>
              </div>

              {/* Assignment Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { status: 'Active', count: mockUserAssignments.filter(a => a.status === 'active').length, color: 'green', icon: UserCheck },
                  { status: 'Expired', count: mockUserAssignments.filter(a => a.status === 'expired').length, color: 'red', icon: UserX },
                  { status: 'Suspended', count: mockUserAssignments.filter(a => a.status === 'suspended').length, color: 'orange', icon: AlertTriangle },
                  { status: 'Pending', count: 0, color: 'blue', icon: Clock },
                ].map((item, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <item.icon className={`h-8 w-8 mx-auto mb-2 text-${item.color}-600`} />
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-sm text-gray-500">{item.status}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UsersRound className="w-5 h-5 text-indigo-600" />
                        User Assignments
                      </CardTitle>
                      <CardDescription>Manage role assignments for users</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Search users..." className="w-64" />
                      <Button variant="outline" onClick={() => handleApplyFilter('Assignments')}><Filter className="w-4 h-4 mr-2" />Filter</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {mockUserAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                                {assignment.userName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{assignment.userName}</p>
                              <p className="text-sm text-gray-500">{assignment.email}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <Badge className="bg-purple-100 text-purple-700">{assignment.roleName}</Badge>
                            <p className="text-xs text-gray-500 mt-1">Since {formatDate(assignment.assignedAt)}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {assignment.status}
                            </Badge>
                            {assignment.lastAccess && (
                              <p className="text-xs text-gray-500 mt-1">Last: {formatDateTime(assignment.lastAccess)}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditRole(assignment.roleName)}>Edit</Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteRole(assignment.roleName)}>
                              <UserX className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-6">
              {/* Policies Overview Banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Access Policies</h2>
                    <p className="text-green-100 text-sm">Conditional access and security rules</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleEvaluatePolicies}><RefreshCw className="h-4 w-4 mr-2" />Evaluate</Button>
                    <Button onClick={handleCreateRole} className="bg-white text-green-700 hover:bg-green-50"><Plus className="h-4 w-4 mr-2" />Add Policy</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPolicies.length}</p>
                    <p className="text-xs text-green-100">Total</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPolicies.filter(p => p.active).length}</p>
                    <p className="text-xs text-green-100">Active</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPolicies.filter(p => p.type === 'allow').length}</p>
                    <p className="text-xs text-green-100">Allow</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPolicies.filter(p => p.type === 'deny').length}</p>
                    <p className="text-xs text-green-100">Deny</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockPolicies.filter(p => p.type === 'conditional').length}</p>
                    <p className="text-xs text-green-100">Conditional</p>
                  </div>
                </div>
              </div>

              {/* Policy Type Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { type: 'Allow', desc: 'Grant access when conditions match', color: 'green', count: mockPolicies.filter(p => p.type === 'allow').length },
                  { type: 'Deny', desc: 'Block access explicitly', color: 'red', count: mockPolicies.filter(p => p.type === 'deny').length },
                  { type: 'Conditional', desc: 'Context-aware access decisions', color: 'blue', count: mockPolicies.filter(p => p.type === 'conditional').length },
                ].map((item, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold text-${item.color}-600`}>{item.type} Policies</h4>
                        <span className="text-2xl font-bold">{item.count}</span>
                      </div>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        Policy Rules
                      </CardTitle>
                      <CardDescription>Configure conditional access and security policies</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Search policies..." className="w-64" />
                      <Button variant="outline" onClick={() => handleApplyFilter('Policies')}><Filter className="w-4 h-4 mr-2" />Filter</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPolicies.map((policy) => (
                      <div key={policy.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${policy.type === 'allow' ? 'bg-green-100' : policy.type === 'deny' ? 'bg-red-100' : 'bg-blue-100'}`}>
                              <ShieldAlert className={`w-5 h-5 ${policy.type === 'allow' ? 'text-green-600' : policy.type === 'deny' ? 'text-red-600' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{policy.name}</h4>
                              <p className="text-sm text-gray-500">{policy.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getPolicyTypeColor(policy.type)}>{policy.type}</Badge>
                            <Switch checked={policy.active} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs text-gray-500">Roles:</span>
                          {policy.roles.map((role, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs text-gray-500">Conditions:</span>
                          {policy.conditions.map((cond, idx) => (
                            <Badge key={idx} className="bg-gray-100 text-gray-700 text-xs">
                              {cond.field} {cond.operator} {cond.value}
                            </Badge>
                          ))}
                          {policy.conditions.length === 0 && (
                            <span className="text-xs text-gray-400">No conditions</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-xs text-gray-500">Priority: {policy.priority}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditRole(policy.name)}>Edit</Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteRole(policy.name)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="space-y-6">
              {/* Audit Overview Banner */}
              <div className="bg-gradient-to-r from-slate-600 to-gray-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Audit Trail</h2>
                    <p className="text-slate-200 text-sm">Complete activity log and compliance tracking</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleExportAuditLogs}><Download className="h-4 w-4 mr-2" />Export</Button>
                    <Button className="bg-white text-slate-700 hover:bg-slate-50" onClick={() => handleApplyFilter('Audit')}><Filter className="h-4 w-4 mr-2" />Filter</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAuditLogs.length}</p>
                    <p className="text-xs text-slate-200">Total Events</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAuditLogs.filter(l => l.success).length}</p>
                    <p className="text-xs text-slate-200">Successful</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockAuditLogs.filter(l => !l.success).length}</p>
                    <p className="text-xs text-slate-200">Failed</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{new Set(mockAuditLogs.map(l => l.actor)).size}</p>
                    <p className="text-xs text-slate-200">Actors</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-xs text-slate-200">Retention</p>
                  </div>
                </div>
              </div>

              {/* Audit Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Role Changes', count: mockAuditLogs.filter(l => l.targetType === 'role').length, icon: Shield, color: 'purple' },
                  { label: 'User Changes', count: mockAuditLogs.filter(l => l.targetType === 'user').length, icon: Users, color: 'blue' },
                  { label: 'Permission Changes', count: mockAuditLogs.filter(l => l.targetType === 'permission').length, icon: Key, color: 'amber' },
                  { label: 'Policy Changes', count: mockAuditLogs.filter(l => l.targetType === 'policy').length, icon: FolderLock, color: 'green' },
                ].map((item, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <item.icon className={`h-6 w-6 mx-auto mb-2 text-${item.color}-600`} />
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-sm text-gray-500">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Activity Log
                      </CardTitle>
                      <CardDescription>Complete history of role and permission changes</CardDescription>
                    </div>
                    <Input placeholder="Search events..." className="w-64" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {mockAuditLogs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${log.success ? 'bg-green-100' : 'bg-red-100'}`}>
                              {log.success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {log.action.replace('.', ' ').replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-500">{log.details}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {log.actor}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {log.ipAddress}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{log.targetType}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(log.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              {/* Groups Overview Banner */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">User Groups</h2>
                    <p className="text-rose-100 text-sm">Organize users for bulk role management</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={handleSyncUserGroups}><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
                    <Button onClick={handleCreateRole} className="bg-white text-rose-700 hover:bg-rose-50"><Plus className="h-4 w-4 mr-2" />Create Group</Button>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserGroups.length}</p>
                    <p className="text-xs text-rose-100">Total Groups</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserGroups.filter(g => g.status === 'active').length}</p>
                    <p className="text-xs text-rose-100">Active</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserGroups.reduce((sum, g) => sum + g.memberCount, 0)}</p>
                    <p className="text-xs text-rose-100">Total Members</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{mockUserGroups.filter(g => g.isSystem).length}</p>
                    <p className="text-xs text-rose-100">System Groups</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{new Set(mockUserGroups.flatMap(g => g.roles)).size}</p>
                    <p className="text-xs text-rose-100">Roles Linked</p>
                  </div>
                </div>
              </div>

              {/* Group Status Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Active Groups', count: mockUserGroups.filter(g => g.status === 'active').length, icon: CheckCircle, color: 'green' },
                  { label: 'Inactive Groups', count: mockUserGroups.filter(g => g.status === 'inactive').length, icon: AlertCircle, color: 'gray' },
                  { label: 'System Groups', count: mockUserGroups.filter(g => g.isSystem).length, icon: Crown, color: 'amber' },
                  { label: 'Custom Groups', count: mockUserGroups.filter(g => !g.isSystem).length, icon: UsersRound, color: 'purple' },
                ].map((item, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <item.icon className={`h-6 w-6 mx-auto mb-2 text-${item.color}-600`} />
                      <p className="text-2xl font-bold">{item.count}</p>
                      <p className="text-sm text-gray-500">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <UsersRound className="w-5 h-5 text-indigo-600" />
                        Group Directory
                      </CardTitle>
                      <CardDescription>Manage user groups for bulk role assignments</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Search groups..." className="w-64" />
                      <Button variant="outline" onClick={() => handleApplyFilter('Groups')}><Filter className="w-4 h-4 mr-2" />Filter</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockUserGroups.map((group) => (
                      <Card key={group.id} className="bg-gray-50 dark:bg-gray-700/50 border-0">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                <UsersRound className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{group.name}</h4>
                                  {group.isSystem && <Crown className="w-4 h-4 text-yellow-500" />}
                                </div>
                                <p className="text-xs text-gray-500">{group.memberCount} members</p>
                              </div>
                            </div>
                            <Badge className={group.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {group.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{group.description}</p>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {group.roles.map((role, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{role}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditRole(group.name)}>
                              <Eye className="w-4 h-4 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleAssignRole(group.name)}>
                              <UserPlus className="w-4 h-4" />
                            </Button>
                            {!group.isSystem && (
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteRole(group.name)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <Card className="col-span-3 h-fit bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'security', icon: ShieldCheck, label: 'Security' },
                        { id: 'permissions', icon: Key, label: 'Permissions' },
                        { id: 'integrations', icon: Globe, label: 'Integrations' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'advanced', icon: Layers, label: 'Advanced' },
                      ].map(item => (
                        <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                          <item.icon className="h-4 w-4" /><span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Settings Content */}
                <div className="col-span-9 space-y-6">
                  {settingsTab === 'general' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Configure default role behaviors and inheritance</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">Default Role</label><Input defaultValue="Standard User" className="mt-1" /></div>
                          <div><label className="text-sm font-medium">Role Hierarchy Depth</label><Input type="number" defaultValue="5" className="mt-1" /></div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Auto-assign default role</p><p className="text-sm text-gray-500">Automatically assign default role to new users</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Role inheritance</p><p className="text-sm text-gray-500">Allow roles to inherit permissions from parent roles</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Delegation enabled</p><p className="text-sm text-gray-500">Allow roles with delegation flag to assign roles</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Role expiration</p><p className="text-sm text-gray-500">Enable time-limited role assignments</p></div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Conflict resolution</p><p className="text-sm text-gray-500">Use most permissive role when conflicts occur</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveGeneralSettings}>Save General Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'security' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader><CardTitle>Security Settings</CardTitle><CardDescription>Configure authentication and access security</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="border"><CardContent className="p-4 text-center">
                            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="font-medium">MFA Enabled</p><p className="text-2xl font-bold text-green-600">89%</p>
                          </CardContent></Card>
                          <Card className="border"><CardContent className="p-4 text-center">
                            <Lock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-medium">Secure Sessions</p><p className="text-2xl font-bold text-blue-600">1,245</p>
                          </CardContent></Card>
                          <Card className="border"><CardContent className="p-4 text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                            <p className="font-medium">Security Alerts</p><p className="text-2xl font-bold text-orange-600">3</p>
                          </CardContent></Card>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Require MFA for admins</p><p className="text-sm text-gray-500">Force multi-factor authentication for admin roles</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Session timeout (30 min)</p><p className="text-sm text-gray-500">Automatically log out inactive users</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">IP restrictions</p><p className="text-sm text-gray-500">Limit access based on IP addresses</p></div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Device fingerprinting</p><p className="text-sm text-gray-500">Track and verify user devices</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Audit all actions</p><p className="text-sm text-gray-500">Log all role and permission changes</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveSecuritySettings}>Save Security Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'permissions' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader><CardTitle>Permission Settings</CardTitle><CardDescription>Configure default permission behaviors</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">Default Access Level</label><Input defaultValue="Read" className="mt-1" /></div>
                          <div><label className="text-sm font-medium">Permission Scope</label><Input defaultValue="Project" className="mt-1" /></div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Implicit deny</p><p className="text-sm text-gray-500">Deny access when no explicit permission exists</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Permission caching</p><p className="text-sm text-gray-500">Cache permissions for faster access checks</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Resource-level permissions</p><p className="text-sm text-gray-500">Enable fine-grained resource permissions</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Conditional access</p><p className="text-sm text-gray-500">Enable time/location-based permissions</p></div>
                            <Switch />
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSavePermissionSettings}>Save Permission Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'integrations' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader><CardTitle>Identity Integrations</CardTitle><CardDescription>Connect with identity providers and directories</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { name: 'Okta', status: 'connected', icon: '🔐', users: 1245 },
                            { name: 'Azure AD', status: 'connected', icon: '☁️', users: 890 },
                            { name: 'Google Workspace', status: 'available', icon: '🟢', users: 0 },
                            { name: 'LDAP', status: 'available', icon: '📁', users: 0 },
                          ].map((integration, i) => (
                            <Card key={i} className={`border ${integration.status === 'connected' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{integration.icon}</span>
                                    <h4 className="font-medium">{integration.name}</h4>
                                  </div>
                                  <Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{integration.status}</Badge>
                                </div>
                                {integration.status === 'connected' && <p className="text-sm text-gray-500">{integration.users} users synced</p>}
                                <Button variant={integration.status === 'connected' ? 'outline' : 'default'} className="w-full mt-3" size="sm" onClick={() => handleIntegrationAction(integration.name, integration.status)}>
                                  {integration.status === 'connected' ? 'Configure' : 'Connect'}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Auto-sync users</p><p className="text-sm text-gray-500">Automatically sync users from identity providers</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">SCIM provisioning</p><p className="text-sm text-gray-500">Enable SCIM for user provisioning</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'notifications' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>Configure alerts and notification preferences</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="border"><CardContent className="p-4 text-center">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <p className="font-medium">Email Alerts</p><p className="text-sm text-gray-500">Enabled</p>
                          </CardContent></Card>
                          <Card className="border"><CardContent className="p-4 text-center">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <p className="font-medium">Slack</p><p className="text-sm text-gray-500">Connected</p>
                          </CardContent></Card>
                          <Card className="border"><CardContent className="p-4 text-center">
                            <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="font-medium">Webhooks</p><p className="text-sm text-gray-500">3 Active</p>
                          </CardContent></Card>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Role changes</p><p className="text-sm text-gray-500">Notify when roles are created, modified, or deleted</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Permission denials</p><p className="text-sm text-gray-500">Alert on permission denial events</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Policy violations</p><p className="text-sm text-gray-500">Notify on access policy violations</p></div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">User assignments</p><p className="text-sm text-gray-500">Notify when users are assigned to roles</p></div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Security alerts</p><p className="text-sm text-gray-500">Immediate alerts for security events</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveNotificationSettings}>Save Notification Settings</Button>
                      </CardContent>
                    </Card>
                  )}

                  {settingsTab === 'advanced' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader><CardTitle>Advanced Settings</CardTitle><CardDescription>Advanced configuration and data management</CardDescription></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="text-sm font-medium">Cache TTL (seconds)</label><Input type="number" defaultValue="300" className="mt-1" /></div>
                          <div><label className="text-sm font-medium">Max Roles per User</label><Input type="number" defaultValue="10" className="mt-1" /></div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">Debug mode</p><p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p></div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div><p className="font-medium">API rate limiting</p><p className="text-sm text-gray-500">Limit API calls for role operations</p></div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium">Data Management</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="justify-start" onClick={handleExportRoles}><Download className="w-4 h-4 mr-2" />Export Roles & Permissions</Button>
                            <Button variant="outline" className="justify-start" onClick={handleExportAuditLogs}><FileText className="w-4 h-4 mr-2" />Export Audit Logs</Button>
                            <Button variant="outline" className="justify-start" onClick={handleExportUserAssignments}><Users className="w-4 h-4 mr-2" />Export User Assignments</Button>
                            <Button variant="outline" className="justify-start" onClick={handleRefreshRoles}><RefreshCw className="w-4 h-4 mr-2" />Sync with Directory</Button>
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
                          <p className="text-sm text-red-600 dark:text-red-300 mb-3">These actions are irreversible. Proceed with caution.</p>
                          <div className="flex gap-3">
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleResetPermissions}>Reset All Permissions</Button>
                            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleClearAuditLogs}>Clear Audit Logs</Button>
                          </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSaveAdvancedSettings}>Save Advanced Settings</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={mockRolesAIInsights}
                title="Role Intelligence"
                onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={mockRolesCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={mockRolesPredictions}
                title="Role Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={mockRolesActivities}
              title="Role Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={rolesQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions and access levels
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  placeholder="e.g., Project Manager"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-code">Role Code *</Label>
                <Input
                  id="role-code"
                  placeholder="e.g., PROJECT_MANAGER"
                  value={formState.role_code}
                  onChange={(e) => setFormState(prev => ({ ...prev, role_code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                placeholder="Describe the purpose and scope of this role..."
                value={formState.description}
                onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Role Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: any) => setFormState(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value: any) => setFormState(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select
                  value={formState.access_level}
                  onValueChange={(value: any) => setFormState(prev => ({ ...prev, access_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="can-delegate"
                  checked={formState.can_delegate}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, can_delegate: checked }))}
                />
                <Label htmlFor="can-delegate">Can Delegate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-default"
                  checked={formState.is_default}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, is_default: checked }))}
                />
                <Label htmlFor="is-default">Default Role</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Edit Role
            </DialogTitle>
            <DialogDescription>
              Modify role settings and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role-name">Role Name *</Label>
                <Input
                  id="edit-role-name"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role-code">Role Code</Label>
                <Input
                  id="edit-role-code"
                  value={formState.role_code}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={formState.description}
                onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Role Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: any) => setFormState(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value: any) => setFormState(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select
                  value={formState.access_level}
                  onValueChange={(value: any) => setFormState(prev => ({ ...prev, access_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="read">Read Only</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-can-delegate"
                  checked={formState.can_delegate}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, can_delegate: checked }))}
                />
                <Label htmlFor="edit-can-delegate">Can Delegate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-default"
                  checked={formState.is_default}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, is_default: checked }))}
                />
                <Label htmlFor="edit-is-default">Default Role</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingRole(null); resetForm() }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clone Role Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5 text-purple-600" />
              Clone Role
            </DialogTitle>
            <DialogDescription>
              Create a copy of "{roleToClone?.name}" with a new name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clone-name">New Role Name *</Label>
              <Input
                id="clone-name"
                placeholder="Enter name for the cloned role"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setCloneDialogOpen(false); setRoleToClone(null); setCloneName('') }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClone}
              disabled={isSubmitting || !cloneName.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Clone Role
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              Any users assigned to this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteDialogOpen(false); setRoleToDelete(null) }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Role
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
