"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  Shield, Users, Lock, TrendingUp, Plus,
  Copy, Eye, Download, RefreshCw, Settings,
  CheckCircle, AlertCircle, Crown, UserCheck
} from 'lucide-react'

type RoleStatus = 'active' | 'inactive' | 'deprecated'
type RoleType = 'admin' | 'user' | 'manager' | 'viewer' | 'custom'
type AccessLevel = 'full' | 'write' | 'read' | 'restricted'

interface Role {
  id: string
  name: string
  description: string
  type: RoleType
  status: RoleStatus
  accessLevel: AccessLevel
  createdBy: string
  createdDate: string
  lastModified: string
  totalUsers: number
  activeUsers: number
  permissions: string[]
  canDelegate: boolean
  isDefault: boolean
  isSystem: boolean
  tags: string[]
}

const roles: Role[] = [
  {
    id: 'ROLE-2847',
    name: 'Super Administrator',
    description: 'Full system access with all permissions including user management, system configuration, and security settings.',
    type: 'admin',
    status: 'active',
    accessLevel: 'full',
    createdBy: 'System',
    createdDate: '2023-01-01T00:00:00',
    lastModified: '2024-01-10T14:00:00',
    totalUsers: 5,
    activeUsers: 4,
    permissions: [
      'users:*',
      'roles:*',
      'settings:*',
      'billing:*',
      'analytics:*',
      'api:*',
      'security:*',
      'system:*'
    ],
    canDelegate: true,
    isDefault: false,
    isSystem: true,
    tags: ['System', 'Admin', 'Full Access']
  },
  {
    id: 'ROLE-2846',
    name: 'Team Manager',
    description: 'Manage team members, assign tasks, view reports, and configure team settings.',
    type: 'manager',
    status: 'active',
    accessLevel: 'write',
    createdBy: 'Admin',
    createdDate: '2023-06-15T10:00:00',
    lastModified: '2024-01-08T11:00:00',
    totalUsers: 47,
    activeUsers: 42,
    permissions: [
      'users:read',
      'users:invite',
      'teams:write',
      'projects:write',
      'tasks:write',
      'reports:read',
      'analytics:read'
    ],
    canDelegate: true,
    isDefault: false,
    isSystem: false,
    tags: ['Manager', 'Team Lead', 'Write Access']
  },
  {
    id: 'ROLE-2845',
    name: 'Standard User',
    description: 'Default role for regular users with access to core features and personal workspace.',
    type: 'user',
    status: 'active',
    accessLevel: 'write',
    createdBy: 'System',
    createdDate: '2023-01-01T00:00:00',
    lastModified: '2024-01-05T09:00:00',
    totalUsers: 2847,
    activeUsers: 2456,
    permissions: [
      'profile:write',
      'projects:read',
      'projects:create',
      'tasks:write',
      'files:write',
      'messages:write',
      'notifications:read'
    ],
    canDelegate: false,
    isDefault: true,
    isSystem: true,
    tags: ['Default', 'Standard', 'User']
  },
  {
    id: 'ROLE-2844',
    name: 'Viewer',
    description: 'Read-only access to projects, reports, and analytics without edit permissions.',
    type: 'viewer',
    status: 'active',
    accessLevel: 'read',
    createdBy: 'Admin',
    createdDate: '2023-03-20T10:00:00',
    lastModified: '2023-12-15T14:00:00',
    totalUsers: 892,
    activeUsers: 678,
    permissions: [
      'profile:read',
      'projects:read',
      'tasks:read',
      'files:read',
      'reports:read',
      'analytics:read'
    ],
    canDelegate: false,
    isDefault: false,
    isSystem: false,
    tags: ['Read Only', 'Viewer', 'Limited']
  },
  {
    id: 'ROLE-2843',
    name: 'Billing Administrator',
    description: 'Manage subscriptions, payments, invoices, and financial settings.',
    type: 'admin',
    status: 'active',
    accessLevel: 'write',
    createdBy: 'Admin',
    createdDate: '2023-07-10T11:00:00',
    lastModified: '2024-01-11T10:00:00',
    totalUsers: 12,
    activeUsers: 11,
    permissions: [
      'billing:write',
      'invoices:write',
      'payments:read',
      'subscriptions:write',
      'reports:read',
      'analytics:read'
    ],
    canDelegate: false,
    isDefault: false,
    isSystem: false,
    tags: ['Billing', 'Finance', 'Admin']
  },
  {
    id: 'ROLE-2842',
    name: 'Developer',
    description: 'Access to API keys, webhooks, integrations, and technical documentation.',
    type: 'custom',
    status: 'active',
    accessLevel: 'write',
    createdBy: 'Engineering Team',
    createdDate: '2023-05-01T09:00:00',
    lastModified: '2024-01-09T15:00:00',
    totalUsers: 156,
    activeUsers: 134,
    permissions: [
      'api:read',
      'api:write',
      'webhooks:write',
      'integrations:write',
      'docs:read',
      'logs:read',
      'settings:read'
    ],
    canDelegate: false,
    isDefault: false,
    isSystem: false,
    tags: ['Developer', 'API', 'Technical']
  },
  {
    id: 'ROLE-2841',
    name: 'Support Agent',
    description: 'Handle customer inquiries, tickets, and provide technical assistance.',
    type: 'custom',
    status: 'active',
    accessLevel: 'write',
    createdBy: 'Support Manager',
    createdDate: '2023-08-15T10:00:00',
    lastModified: '2024-01-07T12:00:00',
    totalUsers: 67,
    activeUsers: 58,
    permissions: [
      'tickets:write',
      'users:read',
      'messages:write',
      'knowledgebase:read',
      'reports:read',
      'analytics:read'
    ],
    canDelegate: false,
    isDefault: false,
    isSystem: false,
    tags: ['Support', 'Customer Service', 'Tickets']
  },
  {
    id: 'ROLE-2840',
    name: 'Legacy Admin (Deprecated)',
    description: 'Old admin role being phased out. Migrate users to Super Administrator.',
    type: 'admin',
    status: 'deprecated',
    accessLevel: 'full',
    createdBy: 'System',
    createdDate: '2022-01-01T00:00:00',
    lastModified: '2023-06-01T10:00:00',
    totalUsers: 3,
    activeUsers: 0,
    permissions: [
      'users:*',
      'settings:*',
      'billing:*'
    ],
    canDelegate: true,
    isDefault: false,
    isSystem: true,
    tags: ['Deprecated', 'Legacy', 'Migration Required']
  }
]

const stats = [
  {
    label: 'Total Roles',
    value: '42',
    change: 8.5,
    trend: 'up' as const,
    icon: Shield
  },
  {
    label: 'Active Users',
    value: '3,847',
    change: 15.3,
    trend: 'up' as const,
    icon: Users
  },
  {
    label: 'Custom Roles',
    value: '18',
    change: 12.5,
    trend: 'up' as const,
    icon: Settings
  },
  {
    label: 'Avg Permissions',
    value: '8.4',
    change: 3.2,
    trend: 'up' as const,
    icon: Lock
  }
]

const quickActions = [
  { label: 'Create Role', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Clone Role', icon: Copy, gradient: 'from-green-500 to-emerald-600' },
  { label: 'View Details', icon: Eye, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Roles', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Manage Permissions', icon: Lock, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Assign Users', icon: UserCheck, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Role Settings', icon: Settings, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Role modified', details: 'Team Manager permissions updated', time: '2 hours ago' },
  { action: 'User assigned', details: '15 users assigned to Support Agent role', time: '5 hours ago' },
  { action: 'Role created', details: 'New Developer role with API access', time: '1 day ago' },
  { action: 'Role deprecated', details: 'Legacy Admin marked for removal', time: '3 days ago' },
  { action: 'Permissions changed', details: 'Billing Admin scope expanded', time: '1 week ago' }
]

const topRoles = [
  { name: 'Standard User', metric: '2,847 users' },
  { name: 'Viewer', metric: '892 users' },
  { name: 'Developer', metric: '156 users' },
  { name: 'Support Agent', metric: '67 users' },
  { name: 'Team Manager', metric: '47 users' }
]

export default function RolesV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'system' | 'custom'>('all')

  const filteredRoles = roles.filter(role => {
    if (viewMode === 'all') return true
    if (viewMode === 'active') return role.status === 'active'
    if (viewMode === 'system') return role.isSystem
    if (viewMode === 'custom') return !role.isSystem && role.type === 'custom'
    return true
  })

  const getStatusColor = (status: RoleStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'deprecated': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: RoleStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'inactive': return <AlertCircle className="w-3 h-3" />
      case 'deprecated': return <AlertCircle className="w-3 h-3" />
      default: return <Shield className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: RoleType) => {
    switch (type) {
      case 'admin': return 'bg-red-50 text-red-600 border-red-100'
      case 'manager': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'user': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'viewer': return 'bg-green-50 text-green-600 border-green-100'
      case 'custom': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case 'full': return 'bg-red-50 text-red-600 border-red-100'
      case 'write': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'read': return 'bg-green-50 text-green-600 border-green-100'
      case 'restricted': return 'bg-gray-50 text-gray-600 border-gray-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: RoleType) => {
    switch (type) {
      case 'admin': return 'from-red-500 to-orange-600'
      case 'manager': return 'from-purple-500 to-pink-600'
      case 'user': return 'from-blue-500 to-cyan-600'
      case 'viewer': return 'from-green-500 to-emerald-600'
      case 'custom': return 'from-indigo-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateActiveRate = (active: number, total: number) => {
    if (total === 0) return 0
    return Math.round((active / total) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Roles & Permissions
            </h1>
            <p className="text-gray-600 mt-2">Manage user roles and access control</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Role
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Roles"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="System Roles"
            isActive={viewMode === 'system'}
            onClick={() => setViewMode('system')}
          />
          <PillButton
            label="Custom Roles"
            isActive={viewMode === 'custom'}
            onClick={() => setViewMode('custom')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Roles List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Roles'}
              {viewMode === 'active' && 'Active Roles'}
              {viewMode === 'system' && 'System Roles'}
              {viewMode === 'custom' && 'Custom Roles'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredRoles.length} total)
              </span>
            </h2>

            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(role.status)} flex items-center gap-1`}>
                        {getStatusIcon(role.status)}
                        {role.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(role.type)}`}>
                        {role.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAccessLevelColor(role.accessLevel)}`}>
                        {role.accessLevel}
                      </span>
                      {role.isDefault && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-600 border-yellow-100">
                          Default
                        </span>
                      )}
                      {role.isSystem && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-600 border-purple-100 flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          System
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {role.name}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {role.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {role.id} • Created by {role.createdBy} • {formatDate(role.createdDate)}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(role.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Users</p>
                    <p className="text-sm font-semibold text-gray-900">{role.totalUsers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Active Users</p>
                    <p className="text-sm font-semibold text-gray-900">{role.activeUsers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Permissions</p>
                    <p className="text-sm font-semibold text-gray-900">{role.permissions.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(role.lastModified)}</p>
                  </div>
                </div>

                {/* Active Rate Progress */}
                {role.totalUsers > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Active User Rate</span>
                      <span>{calculateActiveRate(role.activeUsers, role.totalUsers)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(role.type)} rounded-full transition-all`}
                        style={{ width: `${calculateActiveRate(role.activeUsers, role.totalUsers)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Permissions */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Permissions ({role.permissions.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.slice(0, 6).map((permission, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded font-mono text-xs border border-blue-100"
                      >
                        {permission}
                      </span>
                    ))}
                    {role.permissions.length > 6 && (
                      <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-100">
                        +{role.permissions.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Flags */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  {role.canDelegate && (
                    <div className="flex items-center gap-1">
                      <UserCheck className="w-4 h-4 text-green-600" />
                      <span>Can Delegate</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {role.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Role Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Role Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'user', count: 18, percentage: 43 },
                  { type: 'custom', count: 12, percentage: 29 },
                  { type: 'manager', count: 6, percentage: 14 },
                  { type: 'admin', count: 4, percentage: 9 },
                  { type: 'viewer', count: 2, percentage: 5 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as RoleType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Roles by Users */}
            <RankingList
              title="Most Assigned"
              items={topRoles}
              gradient="from-purple-500 to-indigo-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Roles per User"
              value="1.2"
              change={-5.3}
              trend="down"
            />

            <ProgressCard
              title="Security Compliance"
              current={94}
              target={100}
              label="score"
              gradient="from-purple-500 to-indigo-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
