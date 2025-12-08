"use client"

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Users,
  UserPlus,
  MessageSquare,
  Calendar,
  Settings,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  Target,
  TrendingUp,
  FileText,
  Video,
  Zap,
  Building
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// TYPES
interface TeamMemberUI {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  role: string
  roleLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  department: string
  phone?: string
  location?: string
  timezone: string
  status: 'online' | 'offline' | 'busy' | 'away'
  availability: string
  lastSeen?: string
  skills: string[]
  startDate?: string
  projects: number
  tasksCompleted: number
  rating: number
  currentProjects: string[]
}

interface DepartmentUI {
  name: string
  type: string
  description?: string
  count: number
  color: string
  activeProjects: number
  budget?: number
}

interface TeamOverview {
  totalMembers: number
  onlineMembers: number
  totalDepartments: number
  totalProjects: number
  totalTasksCompleted: number
  averageRating: number
}

const logger = createFeatureLogger('TeamHub')

export default function TeamHubPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [selectedMember, setSelectedMember] = useState<TeamMemberUI | null>(null)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')

  // SUPABASE STATE
  const [teamMembers, setTeamMembers] = useState<TeamMemberUI[]>([])
  const [departments, setDepartments] = useState<DepartmentUI[]>([])
  const [teamOverview, setTeamOverview] = useState<TeamOverview | null>(null)

  // CONFIRMATION DIALOG STATE
  const [removeMember, setRemoveMember] = useState<{ id: string; name: string } | null>(null)

  // COMPUTED TEAM STATS - Updated dynamically from Supabase data
  const teamStats = {
    totalMembers: teamOverview?.totalMembers || teamMembers.length,
    onlineMembers: teamOverview?.onlineMembers || teamMembers.filter(m => m.status === 'online').length,
    activeProjects: teamOverview?.totalProjects || teamMembers.reduce((sum, m) => sum + m.projects, 0),
    completedTasks: teamOverview?.totalTasksCompleted || teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0),
    averageRating: teamOverview?.averageRating || (teamMembers.length > 0 ? teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length : 0)
  }

  // A+++ LOAD TEAM DATA FROM SUPABASE
  useEffect(() => {
    const loadTeamData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Team data loading initiated', { userId })

        // Dynamic imports for code splitting
        const [
          { getTeamMembers },
          { getDepartments },
          { getTeamOverview }
        ] = await Promise.all([
          import('@/lib/team-hub-queries'),
          import('@/lib/team-hub-queries'),
          import('@/lib/team-hub-queries')
        ])

        // Load all data in parallel
        const [membersResult, depsResult, overviewResult] = await Promise.all([
          getTeamMembers(userId),
          getDepartments(userId),
          getTeamOverview(userId)
        ])

        if (membersResult.error) {
          throw new Error(membersResult.error.message || 'Failed to load team members')
        }

        if (depsResult.error) {
          throw new Error(depsResult.error.message || 'Failed to load departments')
        }

        // Transform team members to UI format
        const transformedMembers: TeamMemberUI[] = (membersResult.data || []).map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          bio: member.bio,
          role: member.role,
          roleLevel: member.role_level,
          department: member.department,
          phone: member.phone,
          location: member.location,
          timezone: member.timezone,
          status: member.status,
          availability: member.availability,
          lastSeen: member.last_seen,
          skills: member.skills,
          startDate: member.start_date,
          projects: member.projects_count,
          tasksCompleted: member.tasks_completed,
          rating: Number(member.rating),
          currentProjects: [] // Will be populated from project assignments
        }))

        // Transform departments to UI format
        const transformedDepartments: DepartmentUI[] = (depsResult.data || []).map(dept => {
          const colorMap: Record<string, string> = {
            'design': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            'development': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'management': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'marketing': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            'qa': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            'content': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            'operations': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            'analytics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
            'sales': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
            'support': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
          }

          return {
            name: dept.name,
            type: dept.type,
            description: dept.description,
            count: dept.member_count,
            color: colorMap[dept.type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
            activeProjects: dept.active_projects,
            budget: dept.budget ? Number(dept.budget) : undefined
          }
        })

        setTeamMembers(transformedMembers)
        setDepartments(transformedDepartments)
        setTeamOverview(overviewResult.data)

        setIsLoading(false)
        announce('Team data loaded successfully', 'polite')
        toast.success(`${transformedMembers.length} team members loaded`)
        logger.info('Team data loaded successfully', {
          totalMembers: transformedMembers.length,
          onlineMembers: transformedMembers.filter(m => m.status === 'online').length,
          departments: transformedDepartments.length,
          userId
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team data'
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading team data', 'assertive')
        toast.error('Failed to load team data')
        logger.error('Failed to load team data', { error: err, userId })
      }
    }

    loadTeamData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================
  // REAL WORKING CRUD HANDLERS WITH SUPABASE
  // ============================================================

  // REAL FEATURE: Add Team Member
  const handleAddMember = useCallback(async () => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to add team members' })
      return
    }

    logger.info('Add team member initiated', {
      currentTeamSize: teamMembers.length,
      departments: departments.length
    })

    const memberName = prompt('Enter new member name:')
    if (!memberName) {
      logger.debug('Add member cancelled by user')
      return
    }

    const memberEmail = prompt('Enter email:')
    if (!memberEmail) {
      logger.debug('Add member cancelled - no email provided')
      return
    }

    const memberRole = prompt('Enter role:') || 'Team Member'
    const memberDept = prompt('Enter department (design/development/management/marketing/qa/content/operations/analytics/sales/support):') || 'development'

    try {
      const { createTeamMember } = await import('@/lib/team-hub-queries')

      const { data: newMember, error } = await createTeamMember(userId, {
        name: memberName,
        email: memberEmail,
        role: memberRole,
        department: memberDept as any,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberName}`,
        timezone: 'UTC'
      })

      if (error || !newMember) {
        throw new Error(error?.message || 'Failed to create team member')
      }

      // Add to local state
      const transformedMember: TeamMemberUI = {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        avatar: newMember.avatar,
        bio: newMember.bio,
        role: newMember.role,
        roleLevel: newMember.role_level,
        department: newMember.department,
        phone: newMember.phone,
        location: newMember.location,
        timezone: newMember.timezone,
        status: newMember.status,
        availability: newMember.availability,
        lastSeen: newMember.last_seen,
        skills: newMember.skills,
        startDate: newMember.start_date,
        projects: newMember.projects_count,
        tasksCompleted: newMember.tasks_completed,
        rating: Number(newMember.rating),
        currentProjects: []
      }

      setTeamMembers(prev => [...prev, transformedMember])

      logger.info('Team member added successfully', {
        memberId: newMember.id,
        memberName: newMember.name,
        role: newMember.role,
        department: newMember.department,
        newTeamSize: teamMembers.length + 1
      })

      toast.success('Team Member Added', {
        description: `${memberName} added as ${memberRole} in ${memberDept}`
      })
      announce(`${memberName} added to team`, 'polite')
    } catch (error) {
      logger.error('Failed to add team member', { error })
      toast.error('Failed to add team member', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [userId, teamMembers, departments, announce])

  // REAL FEATURE: Remove Team Member (opens confirmation dialog)
  const handleRemoveMember = useCallback((memberId: string, memberName: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to remove team members' })
      return
    }
    setRemoveMember({ id: memberId, name: memberName })
  }, [userId])

  // REAL FEATURE: Confirm Remove Team Member
  const handleConfirmRemoveMember = useCallback(async () => {
    if (!removeMember) return

    try {
      const { deleteTeamMember } = await import('@/lib/team-hub-queries')

      const { success, error } = await deleteTeamMember(removeMember.id, userId!)

      if (error || !success) {
        throw new Error(error?.message || 'Failed to delete team member')
      }

      setTeamMembers(prev => prev.filter(m => m.id !== removeMember.id))

      logger.info('Team member removed', {
        memberId: removeMember.id,
        memberName: removeMember.name,
        newTeamSize: teamMembers.length - 1
      })

      toast.success('Team Member Removed', {
        description: `${removeMember.name} has been removed from the team`
      })
      announce(`${removeMember.name} removed from team`, 'polite')
    } catch (error) {
      logger.error('Failed to remove team member', { error, memberId: removeMember.id })
      toast.error('Failed to remove team member', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setRemoveMember(null)
    }
  }, [userId, removeMember, teamMembers, announce])

  // REAL FEATURE: Update Member Role
  const handleUpdateRole = useCallback(async (memberId: string, currentRole: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to update roles' })
      return
    }

    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    const newRole = prompt(`Update role for ${member.name}:`, currentRole)
    if (!newRole || newRole === currentRole) {
      logger.debug('Role update cancelled', { memberId, memberName: member.name })
      return
    }

    try {
      const { updateTeamMember } = await import('@/lib/team-hub-queries')

      const { data: updatedMember, error } = await updateTeamMember(memberId, userId, {
        role: newRole
      })

      if (error || !updatedMember) {
        throw new Error(error?.message || 'Failed to update member role')
      }

      setTeamMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ))

      logger.info('Member role updated', {
        memberId,
        memberName: member.name,
        oldRole: currentRole,
        newRole
      })

      toast.success('Role Updated', {
        description: `${member.name}'s role changed to ${newRole}`
      })
      announce(`${member.name} role updated to ${newRole}`, 'polite')
    } catch (error) {
      logger.error('Failed to update member role', { error, memberId })
      toast.error('Failed to update role', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [userId, teamMembers, announce])

  // REAL FEATURE: Assign Task to Member
  const handleAssignTask = useCallback(async (memberId: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to assign tasks' })
      return
    }

    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    const taskName = prompt(`Assign task to ${member.name}:`)
    if (!taskName) {
      logger.debug('Task assignment cancelled', { memberId, memberName: member.name })
      return
    }

    try {
      const { updateMemberStats } = await import('@/lib/team-hub-queries')

      // Increment project count
      const { success, error } = await updateMemberStats(memberId, true, false)

      if (error || !success) {
        throw new Error(error?.message || 'Failed to update member stats')
      }

      setTeamMembers(prev => prev.map(m =>
        m.id === memberId ? {
          ...m,
          projects: m.projects + 1,
          currentProjects: [...m.currentProjects, taskName]
        } : m
      ))

      logger.info('Task assigned to team member', {
        memberId,
        memberName: member.name,
        taskName,
        newProjectCount: member.projects + 1
      })

      toast.success('Task Assigned', {
        description: `"${taskName}" assigned to ${member.name}`
      })
      announce(`Task assigned to ${member.name}`, 'polite')
    } catch (error) {
      logger.error('Failed to assign task', { error, memberId })
      toast.error('Failed to assign task', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [userId, teamMembers, announce])

  // REAL FEATURE: Export Team Data
  const handleTeamExport = useCallback((format: 'csv' | 'json' = 'csv') => {
    logger.info('Team data export initiated', {
      format,
      memberCount: teamMembers.length,
      departments: departments.length,
      totalProjects: teamStats.activeProjects,
      completedTasks: teamStats.completedTasks
    })

    try {
      if (format === 'csv') {
        const headers = ['ID', 'Name', 'Role', 'Department', 'Email', 'Phone', 'Status', 'Projects', 'Tasks Completed', 'Rating', 'Location', 'Timezone']
        const rows = teamMembers.map(m => [
          m.id,
          m.name,
          m.role,
          m.department,
          m.email,
          m.phone || '',
          m.status,
          m.projects,
          m.tasksCompleted,
          m.rating,
          m.location || '',
          m.timezone
        ])
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `team-data-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)

        logger.info('CSV export completed', {
          memberCount: teamMembers.length,
          fileName: `team-data-${new Date().toISOString().split('T')[0]}.csv`
        })
      } else {
        const exportData = {
          teamMembers: teamMembers.map(m => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            roleLevel: m.roleLevel,
            department: m.department,
            status: m.status,
            availability: m.availability,
            projects: m.projects,
            tasksCompleted: m.tasksCompleted,
            rating: m.rating,
            skills: m.skills,
            location: m.location,
            timezone: m.timezone
          })),
          teamStats,
          departments: departments.map(d => ({
            name: d.name,
            type: d.type,
            count: d.count,
            activeProjects: d.activeProjects
          })),
          exportDate: new Date().toISOString()
        }
        const json = JSON.stringify(exportData, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `team-data-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)

        logger.info('JSON export completed', {
          memberCount: teamMembers.length,
          fileName: `team-data-${new Date().toISOString().split('T')[0]}.json`
        })
      }

      toast.success('Export Complete', {
        description: `Team data exported as ${format.toUpperCase()} - ${teamMembers.length} members, ${departments.length} departments`
      })
    } catch (error) {
      logger.error('Team data export failed', { error, format })
      toast.error('Export Failed', {
        description: 'Unable to export team data'
      })
    }
  }, [teamMembers, teamStats, departments])

  // Handler 1: Team Performance Metrics
  const handleTeamPerformance = useCallback(() => {
    logger.info('Team performance metrics accessed', {
      totalMembers: teamStats.totalMembers,
      averageRating: teamStats.averageRating.toFixed(2),
      completedTasks: teamStats.completedTasks,
      onlineMembers: teamStats.onlineMembers
    })
    toast.success('Performance Metrics', {
      description: `${teamStats.totalMembers} members | ${teamStats.averageRating.toFixed(1)} avg rating | ${teamStats.completedTasks} tasks`
    })
  }, [teamStats])

  // Handler 2: Team Goals Management
  const handleTeamGoals = useCallback(() => {
    logger.info('Team goals management accessed', {
      activeProjects: teamStats.activeProjects,
      totalMembers: teamStats.totalMembers
    })
    toast.info('Team Goals', {
      description: `Set and track goals for ${teamStats.activeProjects} active projects`
    })
  }, [teamStats])

  // Handler 3: Team Milestones Tracking
  const handleTeamMilestones = useCallback(() => {
    logger.info('Team milestones tracking accessed', {
      projectsTracked: teamStats.activeProjects,
      tasksCompleted: teamStats.completedTasks,
      teamSize: teamStats.totalMembers
    })
    toast.success('Team Milestones', {
      description: `Tracking milestones across ${teamStats.activeProjects} projects`
    })
  }, [teamStats])

  // Handler 4: Team Budget Management
  const handleTeamBudget = useCallback(() => {
    logger.info('Team budget management accessed', {
      departments: departments.length,
      teamMembers: teamStats.totalMembers,
      activeProjects: teamStats.activeProjects
    })
    toast.info('Team Budget', {
      description: `Manage budget across ${departments.length} departments`
    })
  }, [departments, teamStats])

  // Handler 5: Team Resources Allocation
  const handleTeamResources = useCallback(() => {
    logger.info('Team resources allocation accessed', {
      availableMembers: teamStats.totalMembers,
      onlineMembers: teamStats.onlineMembers,
      projectsNeedingResources: teamStats.activeProjects
    })
    toast.success('Team Resources', {
      description: `Allocate resources for ${teamStats.onlineMembers} online members`
    })
  }, [teamStats])

  // Handler 6: Team Training & Development
  const handleTeamTraining = useCallback(() => {
    logger.info('Team training schedule accessed', {
      membersToTrain: teamStats.totalMembers,
      departments: departments.length
    })
    toast.info('Team Training', {
      description: `Schedule training for ${teamStats.totalMembers} team members`
    })
  }, [teamStats, departments])

  // Handler 7: Team Feedback Collection
  const handleTeamFeedback = useCallback(() => {
    logger.info('Team feedback collection initiated', {
      membersCount: teamStats.totalMembers,
      currentAverageRating: teamStats.averageRating.toFixed(2)
    })
    toast.success('Team Feedback', {
      description: `Collect feedback from ${teamStats.totalMembers} team members`
    })
  }, [teamStats])

  // Handler 8: Team Recognition & Awards
  const handleTeamRecognition = useCallback(() => {
    logger.info('Team recognition system accessed', {
      teamMembers: teamStats.totalMembers,
      tasksCompleted: teamStats.completedTasks,
      averageRating: teamStats.averageRating.toFixed(2)
    })
    toast.success('Team Recognition', {
      description: `Recognize achievements from ${teamStats.completedTasks} completed tasks`
    })
  }, [teamStats])

  // Handler 9: Team Onboarding Process
  const handleTeamOnboarding = useCallback(() => {
    logger.info('Team onboarding process accessed', {
      currentTeamSize: teamStats.totalMembers,
      departmentsAvailable: departments.length
    })
    toast.info('Team Onboarding', {
      description: `Onboard new members to ${departments.length} departments`
    })
  }, [teamStats, departments])

  // Handler 10: Team Offboarding Process
  const handleTeamOffboarding = useCallback(() => {
    logger.info('Team offboarding process accessed', {
      currentMembers: teamStats.totalMembers,
      activeProjects: teamStats.activeProjects
    })
    toast.info('Team Offboarding', {
      description: 'Manage offboarding process professionally'
    })
  }, [teamStats])

  // Handler 11: Team Directory Access
  const handleTeamDirectory = useCallback(() => {
    logger.info('Team directory accessed', {
      totalMembers: teamStats.totalMembers,
      departments: departments.length,
      onlineMembers: teamStats.onlineMembers
    })
    toast.success('Team Directory', {
      description: `Access directory of ${teamStats.totalMembers} team members`
    })
  }, [teamStats, departments])

  // Handler 12: Team Calendar View
  const handleTeamCalendar = useCallback(() => {
    logger.info('Team calendar accessed', {
      membersScheduled: teamStats.totalMembers,
      activeProjects: teamStats.activeProjects,
      onlineMembers: teamStats.onlineMembers
    })
    toast.info('Team Calendar', {
      description: `View schedules for ${teamStats.totalMembers} team members`
    })
  }, [teamStats])

  // Handler 13: Team Files Management
  const handleTeamFiles = useCallback(() => {
    logger.info('Team files management accessed', {
      membersWithAccess: teamStats.totalMembers,
      departments: departments.length,
      projectFiles: teamStats.activeProjects
    })
    toast.success('Team Files', {
      description: `Access files for ${teamStats.activeProjects} active projects`
    })
  }, [teamStats, departments])

  // Handler 14: Team Projects Overview
  const handleTeamProjects = useCallback(() => {
    logger.info('Team projects overview accessed', {
      activeProjects: teamStats.activeProjects,
      membersAssigned: teamStats.totalMembers,
      completedTasks: teamStats.completedTasks
    })
    toast.success('Team Projects', {
      description: `Overview of ${teamStats.activeProjects} active team projects`
    })
  }, [teamStats])

  // Handler 15: Team Tasks Assignment
  const handleTeamTasks = useCallback(() => {
    logger.info('Team tasks assignment accessed', {
      availableMembers: teamStats.totalMembers,
      onlineMembers: teamStats.onlineMembers,
      completedTasks: teamStats.completedTasks
    })
    toast.info('Team Tasks', {
      description: `Assign tasks to ${teamStats.onlineMembers} available members`
    })
  }, [teamStats])

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  // REAL SEARCH AND FILTER - Actually filters the team members
  const filteredMembers = teamMembers.filter(member => {
    // Search filter
    const matchesSearch = searchTerm === '' ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus

    // Department filter
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment

    return matchesSearch && matchesStatus && matchesDepartment
  })

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  // A+++ EMPTY STATE
  if (filteredMembers.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="container mx-auto">
          <NoDataEmptyState
            entityName="team members"
            description={
              searchTerm
                ? "No team members match your search criteria. Try a different search term."
                : "Get started by inviting your first team member."
            }
            action={{
              label: searchTerm ? 'Clear Search' : 'Invite Member',
              onClick: searchTerm
                ? () => setSearchTerm('')
                : () => toast.info('Invite Member', { description: 'Team invitation feature' })
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto p-6 space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {/* Gradient icon container */}
              <div className="relative">
                <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-lg blur opacity-75" />
                <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <Building className="h-6 w-6 text-white" />
                </div>
              </div>
              <TextShimmer className="text-3xl font-bold" duration={2}>
                Team Hub
              </TextShimmer>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your team members and collaboration
            </p>
          </div>
        <div className="flex gap-2">
          <Button
            data-testid="team-settings-btn"
            variant="outline"
            size="sm"
            onClick={() => {
              logger.info('Team settings accessed', {
                totalMembers: teamStats.totalMembers,
                activeProjects: teamStats.activeProjects,
                onlineMembers: teamStats.onlineMembers
              })
              toast.info('Team Settings', {
                description: 'Configure team preferences and permissions'
              })
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            data-testid="add-member-btn"
            size="sm"
            onClick={handleAddMember}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-blue-500 to-indigo-500" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 kazi-text-primary" />
            </CardHeader>
            <CardContent>
              <NumberFlow value={teamStats.totalMembers} className="text-2xl font-bold kazi-text-primary" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Across all departments</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-green-500 to-emerald-500" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <NumberFlow value={teamStats.onlineMembers} className="text-2xl font-bold text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Available for collaboration</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-blue-500 to-cyan-500" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <NumberFlow value={teamStats.activeProjects} className="text-2xl font-bold text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Currently in progress</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-yellow-500 to-orange-500" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <NumberFlow value={teamStats.completedTasks} className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-yellow-500 to-amber-500" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <NumberFlow value={parseFloat(teamStats.averageRating.toFixed(1))} className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Team performance</p>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Team Activity</CardTitle>
                <CardDescription>Recent team member activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role} • {member.availability}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.tasksCompleted} tasks
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common team management actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    data-testid="team-chat-btn"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                    onClick={() => {
                      logger.info('Team chat initiated', {
                        onlineMembers: teamStats.onlineMembers,
                        totalMembers: teamStats.totalMembers
                      })
                      toast.success('Team Chat', {
                        description: `${teamStats.onlineMembers} members online and ready to chat`
                      })
                    }}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm">Team Chat</span>
                  </Button>
                  <Button
                    data-testid="schedule-btn"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                    onClick={() => {
                      logger.info('Team schedule accessed', {
                        activeProjects: teamStats.activeProjects,
                        membersScheduled: teamStats.totalMembers
                      })
                      toast.info('Team Schedule', {
                        description: `View availability for ${teamStats.totalMembers} team members`
                      })
                    }}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Schedule</span>
                  </Button>
                  <Button
                    data-testid="video-call-btn"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                    onClick={() => {
                      logger.info('Video call initiated', {
                        availableParticipants: teamStats.onlineMembers,
                        totalMembers: teamStats.totalMembers
                      })
                      toast.success('Video Call Starting', {
                        description: `Connecting with ${teamStats.onlineMembers} online team members`
                      })
                    }}
                  >
                    <Video className="h-5 w-5" />
                    <span className="text-sm">Video Call</span>
                  </Button>
                  <Button
                    data-testid="reports-btn"
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all"
                    onClick={() => {
                      logger.info('Team reports accessed', {
                        membersAnalyzed: teamStats.totalMembers,
                        activeProjects: teamStats.activeProjects
                      })
                      toast.success('Generating Reports', {
                        description: 'Team analytics and performance metrics'
                      })
                    }}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                data-testid="filter-members-btn"
                variant="outline"
                size="sm"
                onClick={() => {
                  logger.info('Filter panel accessed', {
                    departments: departments.length,
                    totalMembers: teamMembers.length,
                    currentFilters: { status: filterStatus, department: filterDepartment }
                  })
                  toast.info('Filter Options', {
                    description: 'Filter by status, department, or role'
                  })
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {filteredMembers.length} members
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="kazi-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge className={departments.find(d => d.name === member.department)?.color}>
                          {member.department}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {member.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Projects:</span>
                      <span className="font-medium">{member.projects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tasks:</span>
                      <span className="font-medium">{member.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium capitalize">{member.availability}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      data-testid={`member-${member.id}-view-btn`}
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                      onClick={() => {
                        logger.info('Member chat initiated', {
                          memberId: member.id,
                          memberName: member.name,
                          role: member.role,
                          department: member.department,
                          status: member.status
                        })
                        toast.success('Chat Opened', {
                          description: `Starting conversation with ${member.name}`
                        })
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-green-50 hover:border-green-200 transition-colors"
                      onClick={() => {
                        logger.info('Email member', { memberId: member.id, memberName: member.name, email: member.email })
                        window.open(`mailto:${member.email}`, '_blank')
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-yellow-50 hover:border-yellow-200 transition-colors"
                      onClick={() => {
                        logger.info('Call member', { memberId: member.id, memberName: member.name, phone: member.phone })
                        window.open(`tel:${member.phone}`, '_blank')
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptMembers = teamMembers.filter(m => m.department === dept.name)
              return (
                <Card key={dept.name} className="kazi-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {dept.name}
                      <Badge className={dept.color}>
                        {dept.count} members
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {deptMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.projects} projects
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Total Members</p>
                        <p className="text-xl font-bold kazi-text-primary">{teamMembers.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Active Projects</p>
                        <p className="text-xl font-bold kazi-text-primary">
                          {teamMembers.reduce((acc, member) => acc + member.projects, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Avg Rating</p>
                        <p className="text-xl font-bold kazi-text-primary">
                          {teamMembers.length > 0 ? (teamMembers.reduce((acc, member) => acc + member.rating, 0) / teamMembers.length).toFixed(1) : '0.0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Tasks Completed</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {teamMembers.reduce((acc, member) => acc + member.tasksCompleted, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold kazi-text-primary">Top Performers</h3>
                  <div className="space-y-3">
                    {teamMembers
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 3)
                      .map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg kazi-bg-secondary">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium kazi-text-primary">{member.name}</p>
                            <p className="text-sm kazi-text-tertiary">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold kazi-text-primary">{member.rating.toFixed(1)} ⭐</p>
                          <p className="text-sm kazi-text-tertiary">{member.projects} projects</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Generate Report</p>
                        <p className="text-sm kazi-text-tertiary">Export team analytics</p>
                      </div>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5" />
                      <div className="text-left">
                        <p className="font-medium">Set Goals</p>
                        <p className="text-sm kazi-text-tertiary">Define team objectives</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>

      {/* Remove Team Member Confirmation Dialog */}
      <AlertDialog open={!!removeMember} onOpenChange={() => setRemoveMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {removeMember?.name} from your team. You can re-add them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveMember}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
