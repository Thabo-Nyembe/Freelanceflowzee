'use client'

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
  CheckCircle, AlertCircle, Crown, UserCheck,
  Trash2, RotateCw, Power, PowerOff
} from 'lucide-react'
import { useRoles, UserRole, RoleStats } from '@/lib/hooks/use-roles'

type RoleStatus = 'active' | 'inactive' | 'deprecated'
type RoleType = 'admin' | 'user' | 'manager' | 'viewer' | 'custom'
type AccessLevel = 'full' | 'write' | 'read' | 'restricted'

interface RolesClientProps {
  initialRoles: UserRole[]
  initialStats: RoleStats
}

export default function RolesClient({ initialRoles, initialStats }: RolesClientProps) {
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'system' | 'custom'>('all')

  const {
    roles,
    loading,
    createRole,
    updateRole,
    deleteRole,
    activateRole,
    deactivateRole,
    setAsDefault,
    cloneRole,
    getStats
  } = useRoles()

  // Use real-time data if available, otherwise use initial data
  const displayRoles = roles.length > 0 ? roles : initialRoles
  const stats = roles.length > 0 ? getStats() : initialStats

  const filteredRoles = displayRoles.filter(role => {
    if (viewMode === 'all') return true
    if (viewMode === 'active') return role.status === 'active'
    if (viewMode === 'system') return role.is_system
    if (viewMode === 'custom') return !role.is_system && role.type === 'custom'
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateActiveRate = (active: number, total: number) => {
    if (total === 0) return 0
    return Math.round((active / total) * 100)
  }

  const handleCreateRole = async () => {
    await createRole({
      name: 'New Custom Role',
      description: 'A new custom role with configurable permissions',
      type: 'custom',
      access_level: 'read',
      permissions: []
    })
  }

  const handleCloneRole = async (roleId: string, roleName: string) => {
    await cloneRole(roleId, `${roleName} (Copy)`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Roles & Permissions
            </h1>
            <p className="text-gray-600 mt-2">Manage user roles and access control</p>
          </div>
          <button
            onClick={handleCreateRole}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Role
          </button>
        </div>

        {/* Stats */}
        <StatGrid
          stats={[
            {
              label: 'Total Roles',
              value: stats.totalRoles.toString(),
              icon: Shield,
              trend: { value: 8.5, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Active Users',
              value: stats.activeAssignments.toLocaleString(),
              icon: Users,
              trend: { value: 15.3, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Custom Roles',
              value: stats.customRoles.toString(),
              icon: Settings,
              trend: { value: 12.5, isPositive: true },
              color: 'indigo'
            },
            {
              label: 'Total Permissions',
              value: stats.totalPermissions.toString(),
              icon: Lock,
              trend: { value: 3.2, isPositive: true },
              color: 'green'
            }
          ]}
        />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction
            actions={[
              {
                title: 'Create Role',
                description: 'Add new role',
                icon: Plus,
                gradient: 'from-blue-500 to-cyan-600',
                onClick: handleCreateRole
              },
              {
                title: 'Clone Role',
                description: 'Duplicate existing',
                icon: Copy,
                gradient: 'from-green-500 to-emerald-600',
                onClick: () => console.log('Clone')
              },
              {
                title: 'View Details',
                description: 'Inspect role',
                icon: Eye,
                gradient: 'from-purple-500 to-indigo-600',
                onClick: () => console.log('View')
              },
              {
                title: 'Export Roles',
                description: 'Download config',
                icon: Download,
                gradient: 'from-orange-500 to-red-600',
                onClick: () => console.log('Export')
              },
              {
                title: 'Manage Permissions',
                description: 'Edit access',
                icon: Lock,
                gradient: 'from-cyan-500 to-blue-600',
                onClick: () => console.log('Permissions')
              },
              {
                title: 'Assign Users',
                description: 'Add members',
                icon: UserCheck,
                gradient: 'from-pink-500 to-rose-600',
                onClick: () => console.log('Assign')
              },
              {
                title: 'Role Settings',
                description: 'Configure',
                icon: Settings,
                gradient: 'from-indigo-500 to-purple-600',
                onClick: () => console.log('Settings')
              },
              {
                title: 'Refresh',
                description: 'Sync data',
                icon: RefreshCw,
                gradient: 'from-red-500 to-pink-600',
                onClick: () => window.location.reload()
              }
            ]}
          />
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

            {loading && displayRoles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <RotateCw className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-4" />
                <p className="text-gray-600">Loading roles...</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No roles found</h3>
                <p className="text-gray-600 mb-4">Create your first role to get started</p>
                <button
                  onClick={handleCreateRole}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Create Role
                </button>
              </div>
            ) : (
              filteredRoles.map((role) => (
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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAccessLevelColor(role.access_level)}`}>
                          {role.access_level}
                        </span>
                        {role.is_default && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-600 border-yellow-100">
                            Default
                          </span>
                        )}
                        {role.is_system && (
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
                        {role.role_code || role.id.slice(0, 8)} • Created {formatDate(role.created_at)}
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
                      <p className="text-sm font-semibold text-gray-900">{role.total_users.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Active Users</p>
                      <p className="text-sm font-semibold text-gray-900">{role.active_users.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Permissions</p>
                      <p className="text-sm font-semibold text-gray-900">{role.permissions.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Modified</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(role.updated_at)}</p>
                    </div>
                  </div>

                  {/* Active Rate Progress */}
                  {role.total_users > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Active User Rate</span>
                        <span>{calculateActiveRate(role.active_users, role.total_users)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeGradient(role.type)} rounded-full transition-all`}
                          style={{ width: `${calculateActiveRate(role.active_users, role.total_users)}%` }}
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
                      {role.permissions.length === 0 && (
                        <span className="text-xs text-gray-400">No permissions assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Additional Flags */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    {role.can_delegate && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span>Can Delegate</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {role.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleCloneRole(role.id, role.name)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-1"
                    >
                      <Copy className="w-4 h-4" />
                      Clone
                    </button>
                    {!role.is_default && !role.is_system && (
                      <button
                        onClick={() => setAsDefault(role.id)}
                        className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-all flex items-center gap-1"
                      >
                        <Crown className="w-4 h-4" />
                        Set Default
                      </button>
                    )}
                    {role.status === 'active' && !role.is_system && (
                      <button
                        onClick={() => deactivateRole(role.id)}
                        className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-all flex items-center gap-1"
                      >
                        <PowerOff className="w-4 h-4" />
                        Deactivate
                      </button>
                    )}
                    {role.status === 'inactive' && (
                      <button
                        onClick={() => activateRole(role.id)}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all flex items-center gap-1"
                      >
                        <Power className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    {!role.is_system && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Role Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Role Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'user' as RoleType, count: displayRoles.filter(r => r.type === 'user').length },
                  { type: 'custom' as RoleType, count: displayRoles.filter(r => r.type === 'custom').length },
                  { type: 'manager' as RoleType, count: displayRoles.filter(r => r.type === 'manager').length },
                  { type: 'admin' as RoleType, count: displayRoles.filter(r => r.type === 'admin').length },
                  { type: 'viewer' as RoleType, count: displayRoles.filter(r => r.type === 'viewer').length }
                ].filter(item => item.count > 0).map((item) => {
                  const percentage = displayRoles.length > 0
                    ? Math.round((item.count / displayRoles.length) * 100)
                    : 0
                  return (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 capitalize">{item.type}</span>
                        <span className="text-gray-900 font-semibold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeGradient(item.type)} rounded-full`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top Roles by Users */}
            <RankingList
              title="Most Assigned"
              items={displayRoles
                .sort((a, b) => b.total_users - a.total_users)
                .slice(0, 5)
                .map((role, idx) => ({
                  label: role.name,
                  value: `${role.total_users.toLocaleString()} users`,
                  rank: idx + 1
                }))}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={displayRoles.slice(0, 5).map((role) => ({
                id: role.id,
                title: role.name,
                description: `${role.total_users} users assigned`,
                timestamp: formatDate(role.updated_at),
                type: role.status === 'active' ? 'success' : 'info'
              }))}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Roles per User"
              value="1.2"
              icon={Users}
              trend={{ value: 5.3, isPositive: false }}
            />

            <ProgressCard
              title="Security Compliance"
              progress={94}
              subtitle="Based on role configuration"
              color="purple"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
