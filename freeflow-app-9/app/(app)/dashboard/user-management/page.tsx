'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('UserManagement')

import {
  Users, UserPlus, Mail, MoreVertical, Search, Filter, Download,
  Edit, Trash2, Shield, Activity, Clock, MapPin, Phone,
  Settings, TrendingUp, CheckCircle, XCircle, AlertCircle,
  Crown, Star, Zap, Globe, Calendar, BarChart, FileText,
  UserCheck, UserX, UserMinus, Send, Copy, Eye, EyeOff
} from 'lucide-react'

import {
  ROLE_TEMPLATES,
  getRoleBadgeColor,
  getStatusColor,
  formatLastActive,
  filterUsers,
  sortUsers,
  formatBytes
} from '@/lib/user-management-utils'

import type { User, UserRole, UserStatus } from '@/lib/user-management-types'

type ViewMode = 'users' | 'teams' | 'invitations' | 'activity'

export default function UserManagementPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // DATABASE STATE
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  // UI STATE
  const [viewMode, setViewMode] = useState<ViewMode>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'joined' | 'active'>('name')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  // A+++ LOAD USER MANAGEMENT DATA
  useEffect(() => {
    const loadUserManagementData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading user management data', { userId })

        // Dynamic import for code splitting
        const { getUsers, getUserStats, getInvitations, getActivities, getDepartments } = await import('@/lib/user-management-queries')

        // Load all user management data in parallel
        const [usersResult, statsResult, invitationsResult, activitiesResult, departmentsResult] = await Promise.all([
          getUsers(userId),
          getUserStats(userId),
          getInvitations(userId),
          getActivities(userId),
          getDepartments(userId)
        ])

        if (usersResult.error || statsResult.error) {
          throw new Error(usersResult.error?.message || statsResult.error?.message || 'Failed to load user management data')
        }

        // Update state with database results
        setUsers(usersResult.data || [])
        setUserStats(statsResult.data || null)
        setInvitations(invitationsResult.data || [])
        setActivities(activitiesResult.data || [])
        setDepartments(departmentsResult.data || [])

        setIsLoading(false)
        announce('User management dashboard loaded successfully', 'polite')
        logger.info('User management data loaded successfully', {
          userCount: usersResult.data?.length || 0,
          hasStats: !!statsResult.data,
          userId
        })

        toast.success('User management loaded', {
          description: `${usersResult.data?.length || 0} users from database`
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user management data'
        logger.error('Failed to load user management data', { error: errorMessage, userId })
        setError(errorMessage)
        toast.error('Failed to load user management', {
          description: errorMessage
        })
        setIsLoading(false)
        announce('Error loading user management dashboard', 'assertive')
      }
    }

    loadUserManagementData()
  }, [userId, announce])

  const filteredUsers = sortUsers(
    filterUsers(users, {
      role: roleFilter !== 'all' ? [roleFilter] : [],
      status: statusFilter !== 'all' ? [statusFilter] : [],
      search: searchQuery
    }),
    sortBy
  )

  const stats = userStats

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // A+++ CRUD HANDLERS
  const handleExportUsers = async () => {
    try {
      announce('Exporting user data', 'polite')

      const exportData = {
        users: filteredUsers,
        stats,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      announce('User data exported successfully', 'polite')
    } catch (err) {
      announce('Failed to export user data', 'assertive')
    }
  }

  const handleEditUser = (user: User) => {
    announce(`Opening edit for ${user.name}`, 'polite')
    // TODO: Implement edit user dialog
  }

  const handleDeleteUser = (user: User) => {
    announce(`Opening delete confirmation for ${user.name}`, 'assertive')
    // TODO: Implement delete confirmation dialog
  }

  const handleViewUser = (user: User) => {
    announce(`Viewing details for ${user.name}`, 'polite')
    // TODO: Implement user detail view
  }

  const handleSendEmail = (user: User) => {
    announce(`Opening email to ${user.name}`, 'polite')
    window.location.href = `mailto:${user.email}`
  }

  const handleBulkAction = (action: string) => {
    announce(`Performing ${action} on ${selectedUsers.length} users`, 'polite')
    // TODO: Implement bulk actions
  }

  const handleViewInvitation = (invitation: any) => {
    announce('Viewing invitation details', 'polite')
    // TODO: Implement invitation details view
  }

  const handleResendInvitation = (invitation: any) => {
    announce('Resending invitation', 'polite')
    // TODO: Implement resend invitation
  }

  const handleCancelInvitation = (invitation: any) => {
    announce('Canceling invitation', 'assertive')
    // TODO: Implement cancel invitation
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <ScrollReveal>
        <div className="mb-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full mb-4">
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">User Management</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <TextShimmer>Team & Users</TextShimmer>
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your team members, roles, and permissions
              </p>
            </div>
            <Button className="gap-2" onClick={() => setShowInviteModal(true)}>
              <UserPlus className="w-4 h-4" />
              Invite User
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-500" />
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.newUsersThisWeek}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-8 h-8 text-green-500" />
              <Badge variant="secondary">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.activeUsers}</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <Badge variant="secondary">{stats.byRole.admin + stats.byRole.manager}</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.byRole.owner}</div>
            <div className="text-sm text-muted-foreground">Administrators</div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-8 h-8 text-blue-500" />
              <Badge variant="secondary">{invitations.length}</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.newUsersThisMonth}</div>
            <div className="text-sm text-muted-foreground">New This Month</div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: 'users', label: 'All Users', icon: Users },
          { id: 'teams', label: 'Teams', icon: Shield },
          { id: 'invitations', label: 'Invitations', icon: Mail },
          { id: 'activity', label: 'Activity Log', icon: Activity }
        ].map((mode) => {
          const Icon = mode.icon
          return (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'outline'}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Users View */}
        {viewMode === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="email">Sort by Email</SelectItem>
                      <SelectItem value="role">Sort by Role</SelectItem>
                      <SelectItem value="joined">Sort by Joined</SelectItem>
                      <SelectItem value="active">Sort by Active</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="gap-2" onClick={handleExportUsers}>
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {selectedUsers.length} users selected
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction('edit')}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleBulkAction('message')}>
                        <Send className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleBulkAction('delete')}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </LiquidGlassCard>

            {/* Users List */}
            <LiquidGlassCard>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded"
                        />

                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{user.displayName}</h4>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                              {user.role}
                            </Badge>
                            {user.status === 'active' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            {user.department && (
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                {user.department}
                              </span>
                            )}
                            {user.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {user.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            Last active
                          </div>
                          <div className="text-sm font-medium">
                            {formatLastActive(user.lastActive)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* User Details Expandable */}
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Projects</div>
                          <div className="font-medium">{user.metadata.totalProjects}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Tasks</div>
                          <div className="font-medium">{user.metadata.totalTasks}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Completion</div>
                          <div className="font-medium">{user.metadata.completionRate}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Storage</div>
                          <div className="font-medium">{formatBytes(user.metadata.storageUsed)}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Teams View */}
        {viewMode === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Departments</h3>
                  <Button variant="outline" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Department
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <Card key={dept.id} className="p-4">
                      <h4 className="font-semibold mb-2">{dept.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{dept.memberIds.length} members</Badge>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Invitations View */}
        {viewMode === 'invitations' && (
          <motion.div
            key="invitations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>

                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <Card key={invitation.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium mb-1">{invitation.email}</div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{invitation.role}</Badge>
                            <span>Invited {formatLastActive(invitation.invitedAt)}</span>
                            <span>Expires {formatLastActive(invitation.expiresAt)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewInvitation(invitation)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleResendInvitation(invitation)}>
                            <Send className="w-4 h-4 mr-2" />
                            Resend
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleCancelInvitation(invitation)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Activity View */}
        {viewMode === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Activity className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium mb-1">{activity.userName}</div>
                        <div className="text-sm text-muted-foreground">{activity.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatLastActive(activity.timestamp)}
                        </div>
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
