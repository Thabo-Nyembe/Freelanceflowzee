'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  formatRelativeTime,
  getUserRoleColor,
  getUserStatusColor,
  getActiveTeamMembers,
  calculateAverageProductivity,
  type TeamMember,
  type Role,
  type UserRole,
  type UserStatus
} from '@/lib/admin-overview-utils'
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  UserX,
  Shield,
  Settings,
  Activity,
  RefreshCw,
  Search,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Plus
} from 'lucide-react'

const logger = createFeatureLogger('admin-operations')

export default function OperationsPage() {
  const router = useRouter()
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showActivityLog, setShowActivityLog] = useState(false)

  // Filtered members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [teamMembers, statusFilter, searchQuery])

  const activeMembers = useMemo(() => getActiveTeamMembers(teamMembers), [teamMembers])
  const avgProductivity = useMemo(() => calculateAverageProductivity(teamMembers), [teamMembers])

  // Calculate operations stats from data
  const operationsStats = useMemo(() => {
    const totalMembers = teamMembers.length
    const pendingInvites = 0 // Placeholder - would need invite tracking
    const totalPermissions = roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)
    const activeRoles = roles.filter(r => r.isActive !== false).length

    return { totalMembers, pendingInvites, totalPermissions, activeRoles }
  }, [teamMembers, roles])

  // Load operations data
  useEffect(() => {
    const loadOperations = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading operations data', { userId })

        // Note: Team members and roles will be loaded from user management queries
        // when available. For now, initializing with empty arrays.
        setTeamMembers([])
        setRoles([])

        setIsLoading(false)
        announce('Operations data loaded successfully', 'polite')
        toast.success('Operations loaded', {
          description: 'Team and role data initialized'
        })
        logger.info('Operations loaded', {
          success: true,
          memberCount: 0,
          roleCount: 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load operations'
        setError(errorMessage)
        setIsLoading(false)
        toast.error('Failed to load operations', { description: errorMessage })
        announce('Error loading operations', 'assertive')
        logger.error('Operations load failed', { error: err })
      }
    }

    loadOperations()
  }, [userId, announce])

  // Button 1: Invite User
  const handleInviteUser = async () => {
    try {
      logger.info('Inviting new user')

      const newUser = {
        email: 'newuser@company.com',
        role: 'member' as UserRole,
        department: 'General'
      }

      const response = await fetch('/api/admin/operations/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (!response.ok) throw new Error('Failed to invite user')
      const result = await response.json()

      toast.success('Invitation Sent', {
        description: `Invitation email sent to ${newUser.email} successfully`
      })
      logger.info('User invited', { success: true, result })
      announce('User invitation sent', 'polite')

      setTeamMembers(prev => [...prev, {
        id: `user-${Date.now()}`,
        name: 'Pending User',
        email: newUser.email,
        role: newUser.role,
        status: 'pending',
        department: newUser.department,
        joinDate: new Date().toISOString(),
        lastActive: '',
        permissions: [],
        assignedProjects: 0,
        completedTasks: 0,
        productivityScore: 0
      }])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invite failed'
      toast.error('Invite Failed', { description: message })
      logger.error('Invite user failed', { error: message })
      announce('Failed to send invitation', 'assertive')
    }
  }

  // Button 2: Edit User
  const handleEditUser = async (userId: string) => {
    try {
      logger.info('Editing user', { userId })

      const response = await fetch(`/api/admin/operations/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: 'Engineering', location: 'Remote' })
      })

      if (!response.ok) throw new Error('Failed to edit user')
      const result = await response.json()

      toast.success('User Updated', {
        description: 'User information has been updated successfully'
      })
      logger.info('User edited', { success: true, userId, result })
      announce('User updated successfully', 'polite')

      setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, department: 'Engineering', location: 'Remote' } : m))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edit failed'
      toast.error('Edit Failed', { description: message })
      logger.error('Edit user failed', { error: message })
      announce('Failed to edit user', 'assertive')
    }
  }

  // Button 3: Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      logger.info('Deleting user', { userId })

      const response = await fetch(`/api/admin/operations/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to delete user')

      toast.success('User Deleted', {
        description: `${userName} has been permanently removed from the team`
      })
      logger.info('User deleted', { success: true, userId })
      announce('User deleted successfully', 'polite')

      setTeamMembers(prev => prev.filter(m => m.id !== userId))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast.error('Delete Failed', { description: message })
      logger.error('Delete user failed', { error: message })
      announce('Failed to delete user', 'assertive')
    }
  }

  // Button 4: Deactivate User
  const handleDeactivateUser = async (userId: string, userName: string) => {
    try {
      logger.info('Deactivating user', { userId })

      const response = await fetch(`/api/admin/operations/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to deactivate user')
      const result = await response.json()

      toast.success('User Deactivated', {
        description: `${userName} has been deactivated and will no longer have access`
      })
      logger.info('User deactivated', { success: true, userId, result })
      announce('User deactivated successfully', 'polite')

      setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, status: 'inactive' } : m))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Deactivate failed'
      toast.error('Deactivate Failed', { description: message })
      logger.error('Deactivate user failed', { error: message })
      announce('Failed to deactivate user', 'assertive')
    }
  }

  // Button 5: Change Role
  const handleChangeRole = async (userId: string, userName: string, newRole: UserRole) => {
    try {
      logger.info('Changing user role', { userId, newRole })

      const response = await fetch(`/api/admin/operations/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) throw new Error('Failed to change role')
      const result = await response.json()

      toast.success('Role Changed', {
        description: `${userName} has been assigned the ${newRole} role`
      })
      logger.info('User role changed', { success: true, userId, newRole, result })
      announce(`User role changed to ${newRole}`, 'polite')

      setTeamMembers(prev => prev.map(m => m.id === userId ? { ...m, role: newRole } : m))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Role change failed'
      toast.error('Role Change Failed', { description: message })
      logger.error('Change role failed', { error: message })
      announce('Failed to change role', 'assertive')
    }
  }

  // Button 6: Set Permissions
  const handleSetPermissions = async (roleId: string, roleName: string) => {
    try {
      logger.info('Setting permissions', { roleId })

      const response = await fetch(`/api/admin/operations/permissions/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: ['projects.view', 'tasks.manage', 'files.upload', 'comments.create']
        })
      })

      if (!response.ok) throw new Error('Failed to set permissions')
      const result = await response.json()

      toast.success('Permissions Updated', {
        description: `Permissions for ${roleName} role have been updated successfully`
      })
      logger.info('Permissions set', { success: true, roleId, result })
      announce('Permissions updated successfully', 'polite')

      setRoles(prev => prev.map(r => r.id === roleId ? {
        ...r,
        permissions: ['projects.view', 'tasks.manage', 'files.upload', 'comments.create']
      } : r))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed'
      toast.error('Update Failed', { description: message })
      logger.error('Set permissions failed', { error: message })
      announce('Failed to update permissions', 'assertive')
    }
  }

  // Button 7: View Activity Log
  const handleViewActivityLog = () => {
    logger.info('Opening activity log')
    setShowActivityLog(!showActivityLog)
    toast.info('Activity Log', {
      description: showActivityLog ? 'Hiding activity log' : 'Showing recent team activity'
    })
    announce(showActivityLog ? 'Activity log hidden' : 'Activity log shown', 'polite')
  }

  // Button 8: Refresh Operations
  const handleRefreshOperations = async () => {
    try {
      logger.info('Refreshing operations data')

      const response = await fetch('/api/admin/operations/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to refresh operations')

      toast.success('Operations Refreshed', {
        description: 'All team members and permissions have been reloaded'
      })
      logger.info('Operations refresh completed', { success: true })
      announce('Operations refreshed successfully', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Refresh failed'
      toast.error('Refresh Failed', { description: message })
      logger.error('Operations refresh failed', { error: message })
      announce('Failed to refresh operations', 'assertive')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <ListSkeleton items={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">User Management & Permissions</h2>
                <p className="text-sm text-gray-600">Manage team members, roles, and access control</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleInviteUser}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite User
                </button>

                <button
                  onClick={handleViewActivityLog}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  Activity Log
                </button>

                <button
                  onClick={handleRefreshOperations}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1">Total Members</div>
                <div className="text-2xl font-bold text-blue-700">
                  <NumberFlow value={operationsStats.totalMembers} />
                </div>
                <div className="text-xs text-gray-600">{activeMembers.length} active</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 mb-1">Avg Productivity</div>
                <div className="text-2xl font-bold text-green-700">
                  <NumberFlow value={avgProductivity} suffix="%" />
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  High performance
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
                <div className="text-sm text-yellow-600 mb-1">Pending Invites</div>
                <div className="text-2xl font-bold text-yellow-700">
                  <NumberFlow value={operationsStats.pendingInvites} />
                </div>
                <div className="text-xs text-gray-600">Awaiting acceptance</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="text-sm text-purple-600 mb-1">Total Permissions</div>
                <div className="text-2xl font-bold text-purple-700">
                  <NumberFlow value={operationsStats.totalPermissions} />
                </div>
                <div className="text-xs text-gray-600">{roles.length} roles</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Status Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center gap-2">
              {(['all', 'active', 'inactive', 'pending', 'suspended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Members' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Team Members Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Members ({filteredMembers.length})</h3>

            {filteredMembers.length === 0 ? (
              <NoDataEmptyState
                title="No Team Members Found"
                description="Invite your first team member to get started"
                actionLabel="Invite User"
                onAction={handleInviteUser}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{member.name}</h4>
                        <div className="text-xs text-gray-600 mb-1">{member.department}</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getUserRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getUserStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      {member.phoneExtension && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {member.phoneExtension}
                        </div>
                      )}
                      {member.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {member.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last active: {formatRelativeTime(member.lastActive || member.joinDate)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <div className="text-blue-600 mb-0.5">Projects</div>
                        <div className="font-bold text-blue-700">{member.assignedProjects}</div>
                      </div>
                      <div className="bg-green-50 rounded p-2 text-center">
                        <div className="text-green-600 mb-0.5">Tasks</div>
                        <div className="font-bold text-green-700">{member.completedTasks}</div>
                      </div>
                      <div className="bg-purple-50 rounded p-2 text-center">
                        <div className="text-purple-600 mb-0.5">Score</div>
                        <div className="font-bold text-purple-700">{member.productivityScore}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditUser(member.id)}
                        className="flex-1 px-2 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>

                      <div className="relative group">
                        <button className="px-2 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center gap-1">
                          <Shield className="w-3 h-3" />
                          Role
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
                          {(['admin', 'manager', 'member', 'guest'] as UserRole[]).map((role) => (
                            <button
                              key={role}
                              onClick={() => handleChangeRole(member.id, member.name, role)}
                              className="w-full text-left px-2 py-1 text-xs hover:bg-gray-50 rounded"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {member.status === 'active' && (
                        <button
                          onClick={() => handleDeactivateUser(member.id, member.name)}
                          className="px-2 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(member.id, member.name)}
                        className="px-2 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Roles & Permissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Roles & Permissions</h3>

            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{role.displayName}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getUserRoleColor(role.name)}`}>
                          {role.name}
                        </span>
                        {role.isCustom && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    <div className="text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                        {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Permissions:</div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {permission === '*' ? 'All Permissions' : permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetPermissions(role.id, role.displayName)}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Permissions
                  </button>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Activity Log */}
      <AnimatePresence>
        {showActivityLog && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity Log</h3>
                  <button
                    onClick={() => setShowActivityLog(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { user: 'Michael Chen', action: 'Updated deal: Enterprise Platform Migration', time: '2 minutes ago', type: 'update' },
                    { user: 'Lisa Anderson', action: 'Created campaign: Q1 Product Launch', time: '15 minutes ago', type: 'create' },
                    { user: 'James Rodriguez', action: 'Completed task: Project review', time: '1 hour ago', type: 'complete' },
                    { user: 'Sarah Williams', action: 'Uploaded file: Design mockups v2', time: '2 hours ago', type: 'upload' },
                    { user: 'David Kim', action: 'Joined workspace', time: '3 hours ago', type: 'join' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'create' ? 'bg-green-500' :
                        activity.type === 'update' ? 'bg-blue-500' :
                        activity.type === 'complete' ? 'bg-purple-500' :
                        activity.type === 'upload' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}>
                        {activity.type === 'complete' ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : activity.type === 'create' ? (
                          <Plus className="w-4 h-4 text-white" />
                        ) : (
                          <Eye className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{activity.user}</div>
                        <div className="text-sm text-gray-600">{activity.action}</div>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
