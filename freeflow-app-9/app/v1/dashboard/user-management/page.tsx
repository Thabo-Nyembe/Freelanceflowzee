'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createSimpleLogger('UserManagement')

import {
  Users, UserPlus, Mail, MoreVertical, Search, Download,
  Edit, Trash2, Shield, Activity, MapPin, TrendingUp, CheckCircle, XCircle,
  Crown, Star,
  UserCheck, Send, Copy, Eye
} from 'lucide-react'

import {
  getRoleBadgeColor,
  getStatusColor,
  formatLastActive,
  filterUsers,
  sortUsers,
  formatBytes
} from '@/lib/user-management-utils'

import type { User } from '@/lib/user-management-types'

type ViewMode = 'users' | 'teams' | 'invitations' | 'activity'

export default function UserManagementPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // DATABASE STATE
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    byRole: { owner: 0, admin: 0, manager: 0, member: 0 }
  })
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

  // MODAL STATES
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false)
  const [isInvitationDetailsOpen, setIsInvitationDetailsOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null)
  const [bulkActionType, setBulkActionType] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  // EDIT USER FORM STATE
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'member' as string,
    department: '',
    status: 'active' as string
  })

  // BULK EDIT STATE
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [bulkEditForm, setBulkEditForm] = useState({
    updateRole: false,
    role: 'member' as string,
    updateDepartment: false,
    department: '',
    updateStatus: false,
    status: 'active' as string
  })

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
    announce('Exporting user data', 'polite')

    const exportPromise = (async () => {
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
    })()

    toast.promise(exportPromise, {
      loading: 'Preparing export...',
      success: 'User data exported successfully',
      error: 'Failed to export user data'
    })
  }

  const handleEditUser = useCallback((user: User) => {
    announce(`Opening edit for ${user.name}`, 'polite')
    setSelectedUser(user)
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department || '',
      status: user.status
    })
    setIsEditDialogOpen(true)
  }, [announce])

  const handleSaveUserEdit = useCallback(async () => {
    if (!selectedUser) return

    setIsProcessing(true)
    const updatePromise = (async () => {
      // Dynamic import for code splitting
      const { updateUser } = await import('@/lib/user-management-queries')
      await updateUser(selectedUser.id, editForm)
      setIsEditDialogOpen(false)
      announce('User updated successfully', 'polite')
      // Refresh users list
      window.location.reload()
    })()

    toast.promise(updatePromise, {
      loading: 'Updating user...',
      success: `${editForm.firstName} ${editForm.lastName} has been updated`,
      error: 'Failed to update user'
    })

    try {
      await updatePromise
    } catch (err) {
      announce('Failed to update user', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedUser, editForm, announce])

  const handleDeleteUser = useCallback((user: User) => {
    announce(`Opening delete confirmation for ${user.name}`, 'assertive')
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }, [announce])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedUser) return

    setIsProcessing(true)
    const userName = selectedUser.name
    const deletePromise = (async () => {
      // Dynamic import for code splitting
      const { deleteUser } = await import('@/lib/user-management-queries')
      await deleteUser(selectedUser.id)
      setIsDeleteDialogOpen(false)
      setSelectedUsers(prev => prev.filter(id => id !== selectedUser.id))
      announce('User deleted successfully', 'polite')
      // Refresh users list
      window.location.reload()
    })()

    toast.promise(deletePromise, {
      loading: 'Deleting user...',
      success: `${userName} has been removed successfully`,
      error: 'Failed to delete user'
    })

    try {
      await deletePromise
    } catch (err) {
      announce('Failed to delete user', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedUser, announce])

  const handleViewUser = useCallback((user: User) => {
    announce(`Viewing details for ${user.name}`, 'polite')
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }, [announce])

  const handleSendEmail = useCallback((user: User) => {
    toast.promise(
      (async () => {
        // Log email action to analytics
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'email_opened', userId: user.id })
        }).catch(() => {}) // Non-blocking analytics
        window.location.href = `mailto:${user.email}`
        announce(`Opening email to ${user.name}`, 'polite')
      })(),
      {
        loading: 'Opening email client...',
        success: `Email client opened for ${user.name}`,
        error: 'Failed to open email client'
      }
    )
  }, [announce])

  const handleBulkAction = useCallback((action: string) => {
    announce(`Performing ${action} on ${selectedUsers.length} users`, 'polite')
    setBulkActionType(action)
    setIsBulkActionDialogOpen(true)
  }, [selectedUsers.length, announce])

  const handleConfirmBulkAction = useCallback(async () => {
    setIsProcessing(true)
    const userCount = selectedUsers.length

    if (bulkActionType === 'delete') {
      const bulkDeletePromise = (async () => {
        const { bulkDeleteUsers } = await import('@/lib/user-management-queries')
        await bulkDeleteUsers(selectedUsers)
        setIsBulkActionDialogOpen(false)
        setSelectedUsers([])
        announce('Bulk action completed', 'polite')
      })()

      toast.promise(bulkDeletePromise, {
        loading: `Deleting ${userCount} users...`,
        success: `${userCount} users deleted successfully`,
        error: 'Failed to delete users'
      })

      try {
        await bulkDeletePromise
      } catch (err) {
        announce('Bulk action failed', 'assertive')
      } finally {
        setIsProcessing(false)
      }
    } else if (bulkActionType === 'message') {
      toast.promise(
        (async () => {
          // Log bulk email action
          await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'bulk_email', userIds: selectedUsers })
          }).catch(() => {}) // Non-blocking
          const emails = users.filter(u => selectedUsers.includes(u.id)).map(u => u.email).join(',')
          window.location.href = `mailto:${emails}`
          setIsBulkActionDialogOpen(false)
          setSelectedUsers([])
          announce('Bulk action completed', 'polite')
        })(),
        {
          loading: 'Opening email client...',
          success: 'Email client opened with selected recipients',
          error: 'Failed to open email client'
        }
      )
      setIsProcessing(false)
    } else if (bulkActionType === 'edit') {
      // Open bulk edit modal
      setIsBulkEditOpen(true)
      setIsBulkActionDialogOpen(false)
      setIsProcessing(false)
      return // Don't clear selectedUsers yet
    }
  }, [bulkActionType, selectedUsers, users, announce])

  const handleViewInvitation = useCallback((invitation: any) => {
    announce('Viewing invitation details', 'polite')
    setSelectedInvitation(invitation)
    setIsInvitationDetailsOpen(true)
  }, [announce])

  const handleCopyInviteLink = useCallback((invitation: any) => {
    const inviteLink = `${window.location.origin}/invite/${invitation.id}`
    toast.promise(
      navigator.clipboard.writeText(inviteLink).then(() => {
        announce('Invite link copied', 'polite')
      }),
      {
        loading: 'Copying invite link...',
        success: 'Invite link copied to clipboard!',
        error: 'Failed to copy invite link'
      }
    )
  }, [announce])

  const handleResendInvitation = useCallback(async (invitation: any) => {
    setIsProcessing(true)
    announce('Resending invitation', 'polite')

    const resendPromise = (async () => {
      // Dynamic import for code splitting
      const { resendInvitation } = await import('@/lib/user-management-queries')
      await resendInvitation(invitation.id)
      announce('Invitation resent successfully', 'polite')
    })()

    toast.promise(resendPromise, {
      loading: 'Resending invitation...',
      success: `New invitation email sent to ${invitation.email}`,
      error: 'Failed to resend invitation'
    })

    try {
      await resendPromise
    } catch (err) {
      announce('Failed to resend invitation', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [announce])

  const handleCancelInvitation = useCallback(async (invitation: any) => {
    setIsProcessing(true)
    announce('Canceling invitation', 'assertive')

    const cancelPromise = (async () => {
      // Dynamic import for code splitting
      const { cancelInvitation } = await import('@/lib/user-management-queries')
      await cancelInvitation(invitation.id)
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
      announce('Invitation canceled', 'polite')
    })()

    toast.promise(cancelPromise, {
      loading: 'Canceling invitation...',
      success: `Invitation to ${invitation.email} has been revoked`,
      error: 'Failed to cancel invitation'
    })

    try {
      await cancelPromise
    } catch (err) {
      announce('Failed to cancel invitation', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [announce])

  const handleApplyBulkEdit = useCallback(async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected')
      return
    }

    const updates: any = {}
    if (bulkEditForm.updateRole) updates.role = bulkEditForm.role
    if (bulkEditForm.updateDepartment) updates.department = bulkEditForm.department
    if (bulkEditForm.updateStatus) updates.status = bulkEditForm.status

    if (Object.keys(updates).length === 0) {
      toast.error('No changes selected')
      return
    }

    setIsProcessing(true)
    announce('Applying bulk edits', 'polite')
    const userCount = selectedUsers.length

    const bulkEditPromise = (async () => {
      const { bulkUpdateUsers } = await import('@/lib/user-management-queries')
      await bulkUpdateUsers(selectedUsers, updates)

      // Update local state
      setUsers(prev => prev.map(user =>
        selectedUsers.includes(user.id) ? { ...user, ...updates } : user
      ))

      announce(`${userCount} users updated`, 'polite')
      setIsBulkEditOpen(false)
      setSelectedUsers([])
      setBulkEditForm({
        updateRole: false,
        role: 'member',
        updateDepartment: false,
        department: '',
        updateStatus: false,
        status: 'active'
      })
    })()

    toast.promise(bulkEditPromise, {
      loading: `Updating ${userCount} users...`,
      success: `Successfully updated ${userCount} users`,
      error: 'Failed to apply bulk edit'
    })

    try {
      await bulkEditPromise
    } catch (err) {
      announce('Bulk edit failed', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedUsers, bulkEditForm, announce])

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
                          <AvatarImage src={user.avatar} alt="User avatar" />
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
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={async () => {
                      toast.promise(
                        (async () => {
                          const { createDepartment } = await import('@/lib/user-management-queries')
                          await createDepartment(userId || '', { name: 'New Department', description: 'Add description' })
                        })(),
                        {
                          loading: 'Creating department...',
                          success: 'Department created! Use the form to add details.',
                          error: 'Failed to create department'
                        }
                      )
                    }}
                  >
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                          toast.info(`${dept.name} Department`, {
                            description: `${dept.memberIds.length} members - ${dept.description}`
                          })
                        }}
                        >
                          View
                        </Button>
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

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={editForm.department}
                onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Engineering, Design"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserEdit} disabled={isProcessing}>
              {isProcessing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              All associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isProcessing}
            >
              {isProcessing ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* VIEW USER DETAILS DIALOG */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  User Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedUser.avatar} alt="User avatar" />
                    <AvatarFallback className="text-xl">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUser.displayName}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getRoleBadgeColor(selectedUser.role)}>
                        {selectedUser.role}
                      </Badge>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Department</div>
                    <div className="font-medium">{selectedUser.department || 'Not assigned'}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{selectedUser.location || 'Not specified'}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Last Active</div>
                    <div className="font-medium">{formatLastActive(selectedUser.lastActive)}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Joined</div>
                    <div className="font-medium">{formatLastActive(selectedUser.createdAt)}</div>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Activity Stats</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.metadata.totalProjects}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedUser.metadata.totalTasks}</div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedUser.metadata.completionRate}%</div>
                      <div className="text-xs text-muted-foreground">Completion</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{formatBytes(selectedUser.metadata.storageUsed)}</div>
                      <div className="text-xs text-muted-foreground">Storage</div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => handleSendEmail(selectedUser)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEditUser(selectedUser)
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* BULK ACTION CONFIRMATION DIALOG */}
      <AlertDialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionType === 'delete' ? 'Delete Selected Users' :
               bulkActionType === 'message' ? 'Send Message to Users' :
               'Bulk Edit Users'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionType === 'delete'
                ? `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`
                : bulkActionType === 'message'
                ? `Send an email to ${selectedUsers.length} selected users?`
                : `Apply bulk changes to ${selectedUsers.length} selected users?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkAction}
              className={bulkActionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* INVITATION DETAILS DIALOG */}
      <Dialog open={isInvitationDetailsOpen} onOpenChange={setIsInvitationDetailsOpen}>
        <DialogContent>
          {selectedInvitation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Invitation Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-2 bg-muted rounded-md">{selectedInvitation.email}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Badge variant="outline">{selectedInvitation.role}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Badge variant="secondary">{selectedInvitation.status || 'Pending'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Invited</Label>
                    <div className="text-sm">{formatLastActive(selectedInvitation.invitedAt)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Expires</Label>
                    <div className="text-sm">{formatLastActive(selectedInvitation.expiresAt)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Invite Link</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${selectedInvitation.id}`}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => handleCopyInviteLink(selectedInvitation)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleResendInvitation(selectedInvitation)}
                  disabled={isProcessing}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Resend
                </Button>
                <Button
                  variant="outline"
                  className="text-red-500"
                  onClick={() => {
                    setIsInvitationDetailsOpen(false)
                    handleCancelInvitation(selectedInvitation)
                  }}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Invitation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Bulk Edit Users
            </DialogTitle>
            <DialogDescription>
              Apply changes to {selectedUsers.length} selected user(s). Only enabled fields will be updated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Role Update */}
            <div className="flex items-center space-x-4">
              <Switch
                id="update-role"
                checked={bulkEditForm.updateRole}
                onCheckedChange={(checked) => setBulkEditForm(prev => ({ ...prev, updateRole: checked }))}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="update-role" className={!bulkEditForm.updateRole ? 'text-muted-foreground' : ''}>
                  Update Role
                </Label>
                <Select
                  value={bulkEditForm.role}
                  onValueChange={(value) => setBulkEditForm(prev => ({ ...prev, role: value }))}
                  disabled={!bulkEditForm.updateRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Department Update */}
            <div className="flex items-center space-x-4">
              <Switch
                id="update-department"
                checked={bulkEditForm.updateDepartment}
                onCheckedChange={(checked) => setBulkEditForm(prev => ({ ...prev, updateDepartment: checked }))}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="update-department" className={!bulkEditForm.updateDepartment ? 'text-muted-foreground' : ''}>
                  Update Department
                </Label>
                <Select
                  value={bulkEditForm.department}
                  onValueChange={(value) => setBulkEditForm(prev => ({ ...prev, department: value }))}
                  disabled={!bulkEditForm.updateDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Update */}
            <div className="flex items-center space-x-4">
              <Switch
                id="update-status"
                checked={bulkEditForm.updateStatus}
                onCheckedChange={(checked) => setBulkEditForm(prev => ({ ...prev, updateStatus: checked }))}
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="update-status" className={!bulkEditForm.updateStatus ? 'text-muted-foreground' : ''}>
                  Update Status
                </Label>
                <Select
                  value={bulkEditForm.status}
                  onValueChange={(value) => setBulkEditForm(prev => ({ ...prev, status: value }))}
                  disabled={!bulkEditForm.updateStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Users Preview */}
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Selected Users ({selectedUsers.length})</h4>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {users
                  .filter(u => selectedUsers.includes(u.id))
                  .slice(0, 5)
                  .map(user => (
                    <Badge key={user.id} variant="secondary" className="text-xs">
                      {user.firstName} {user.lastName}
                    </Badge>
                  ))}
                {selectedUsers.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedUsers.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkEditOpen(false)
                setBulkEditForm({
                  updateRole: false,
                  role: 'member',
                  updateDepartment: false,
                  department: '',
                  updateStatus: false,
                  status: 'active'
                })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyBulkEdit}
              disabled={isProcessing || (!bulkEditForm.updateRole && !bulkEditForm.updateDepartment && !bulkEditForm.updateStatus)}
            >
              {isProcessing ? 'Applying...' : 'Apply Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
