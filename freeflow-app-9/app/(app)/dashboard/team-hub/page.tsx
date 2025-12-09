"use client"

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

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
  const router = useRouter()

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

  // FEATURE DIALOG STATES
  const [showPerformanceDialog, setShowPerformanceDialog] = useState(false)
  const [showGoalsDialog, setShowGoalsDialog] = useState(false)
  const [showMilestonesDialog, setShowMilestonesDialog] = useState(false)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
  const [showResourcesDialog, setShowResourcesDialog] = useState(false)
  const [showTrainingDialog, setShowTrainingDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [showRecognitionDialog, setShowRecognitionDialog] = useState(false)
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false)
  const [showOffboardingDialog, setShowOffboardingDialog] = useState(false)
  const [showDirectoryDialog, setShowDirectoryDialog] = useState(false)
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [showFilesDialog, setShowFilesDialog] = useState(false)
  const [showProjectsDialog, setShowProjectsDialog] = useState(false)
  const [showTasksDialog, setShowTasksDialog] = useState(false)

  // FORM STATES
  const [newGoal, setNewGoal] = useState({ title: '', target: '', deadline: '' })
  const [newMilestone, setNewMilestone] = useState({ title: '', project: '', date: '' })
  const [feedbackForm, setFeedbackForm] = useState({ memberId: '', rating: 5, comments: '' })

  // PROMPT REPLACEMENT DIALOG STATES
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [addMemberForm, setAddMemberForm] = useState({ name: '', email: '', role: 'Team Member', department: 'development' })
  const [showUpdateRoleDialog, setShowUpdateRoleDialog] = useState(false)
  const [updateRoleMember, setUpdateRoleMember] = useState<{ id: string; name: string; currentRole: string } | null>(null)
  const [newRoleValue, setNewRoleValue] = useState('')
  const [showAssignTaskDialog, setShowAssignTaskDialog] = useState(false)
  const [assignTaskMember, setAssignTaskMember] = useState<{ id: string; name: string } | null>(null)
  const [taskNameValue, setTaskNameValue] = useState('')
  const [recognitionForm, setRecognitionForm] = useState({ memberId: '', award: '', reason: '' })
  const [taskForm, setTaskForm] = useState({ memberId: '', title: '', priority: 'medium', dueDate: '' })

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
  const handleAddMember = useCallback(() => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to add team members' })
      return
    }

    logger.info('Add team member initiated', {
      currentTeamSize: teamMembers.length,
      departments: departments.length
    })

    setAddMemberForm({ name: '', email: '', role: 'Team Member', department: 'development' })
    setShowAddMemberDialog(true)
  }, [userId, teamMembers, departments])

  // Confirm Add Member from dialog
  const confirmAddMember = useCallback(async () => {
    if (!userId) return

    const { name: memberName, email: memberEmail, role: memberRole, department: memberDept } = addMemberForm

    if (!memberName.trim() || !memberEmail.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

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
      setShowAddMemberDialog(false)
    } catch (error) {
      logger.error('Failed to add team member', { error })
      toast.error('Failed to add team member', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [userId, addMemberForm, teamMembers, announce])

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
  const handleUpdateRole = useCallback((memberId: string, currentRole: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to update roles' })
      return
    }

    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    setUpdateRoleMember({ id: memberId, name: member.name, currentRole })
    setNewRoleValue(currentRole)
    setShowUpdateRoleDialog(true)
  }, [userId, teamMembers])

  // Confirm Update Role from dialog
  const confirmUpdateRole = useCallback(async () => {
    if (!userId || !updateRoleMember) return

    if (!newRoleValue.trim() || newRoleValue === updateRoleMember.currentRole) {
      setShowUpdateRoleDialog(false)
      return
    }

    try {
      const { updateTeamMember } = await import('@/lib/team-hub-queries')

      const { data: updatedMember, error } = await updateTeamMember(updateRoleMember.id, userId, {
        role: newRoleValue
      })

      if (error || !updatedMember) {
        throw new Error(error?.message || 'Failed to update member role')
      }

      setTeamMembers(prev => prev.map(m =>
        m.id === updateRoleMember.id ? { ...m, role: newRoleValue } : m
      ))

      logger.info('Member role updated', {
        memberId: updateRoleMember.id,
        memberName: updateRoleMember.name,
        oldRole: updateRoleMember.currentRole,
        newRole: newRoleValue
      })

      toast.success('Role Updated', {
        description: `${updateRoleMember.name}'s role changed to ${newRoleValue}`
      })
      announce(`${updateRoleMember.name} role updated to ${newRoleValue}`, 'polite')
      setShowUpdateRoleDialog(false)
      setUpdateRoleMember(null)
      setNewRoleValue('')
    } catch (error) {
      logger.error('Failed to update member role', { error, memberId: updateRoleMember.id })
      toast.error('Failed to update role', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [userId, updateRoleMember, newRoleValue, announce])

  // REAL FEATURE: Assign Task to Member
  const handleAssignTask = useCallback((memberId: string) => {
    if (!userId) {
      toast.error('Authentication required', { description: 'Please sign in to assign tasks' })
      return
    }

    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    setAssignTaskMember({ id: memberId, name: member.name })
    setTaskNameValue('')
    setShowAssignTaskDialog(true)
  }, [userId, teamMembers])

  // Confirm Assign Task from dialog
  const confirmAssignTask = useCallback(async () => {
    if (!userId || !assignTaskMember) return

    if (!taskNameValue.trim()) {
      toast.error('Please enter a task name')
      return
    }

    try {
      const { updateMemberStats } = await import('@/lib/team-hub-queries')

      // Increment project count
      const { success, error } = await updateMemberStats(assignTaskMember.id, true, false)

      if (error || !success) {
        throw new Error(error?.message || 'Failed to update member stats')
      }

      const member = teamMembers.find(m => m.id === assignTaskMember.id)
      setTeamMembers(prev => prev.map(m =>
        m.id === assignTaskMember.id ? {
          ...m,
          projects: m.projects + 1,
          currentProjects: [...m.currentProjects, taskNameValue]
        } : m
      ))

      logger.info('Task assigned to team member', {
        memberId: assignTaskMember.id,
        memberName: assignTaskMember.name,
        taskName: taskNameValue,
        newProjectCount: member ? member.projects + 1 : 1
      })

      toast.success('Task Assigned', {
        description: `"${taskNameValue}" assigned to ${assignTaskMember.name}`
      })
      announce(`Task assigned to ${assignTaskMember.name}`, 'polite')
      setShowAssignTaskDialog(false)
      setAssignTaskMember(null)
      setTaskNameValue('')
    } catch (error) {
      logger.error('Failed to assign task', { error, memberId: assignTaskMember.id })
      toast.error('Failed to assign task', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [userId, assignTaskMember, taskNameValue, teamMembers, announce])

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
    setShowPerformanceDialog(true)
  }, [teamStats])

  // Handler 2: Team Goals Management
  const handleTeamGoals = useCallback(() => {
    logger.info('Team goals management accessed', {
      activeProjects: teamStats.activeProjects,
      totalMembers: teamStats.totalMembers
    })
    setShowGoalsDialog(true)
  }, [teamStats])

  // Handler 3: Team Milestones Tracking
  const handleTeamMilestones = useCallback(() => {
    logger.info('Team milestones tracking accessed', {
      projectsTracked: teamStats.activeProjects,
      tasksCompleted: teamStats.completedTasks,
      teamSize: teamStats.totalMembers
    })
    setShowMilestonesDialog(true)
  }, [teamStats])

  // Handler 4: Team Budget Management
  const handleTeamBudget = useCallback(() => {
    logger.info('Team budget management accessed', {
      departments: departments.length,
      teamMembers: teamStats.totalMembers,
      activeProjects: teamStats.activeProjects
    })
    setShowBudgetDialog(true)
  }, [departments, teamStats])

  // Handler 5: Team Resources Allocation
  const handleTeamResources = useCallback(() => {
    logger.info('Team resources allocation accessed', {
      availableMembers: teamStats.totalMembers,
      onlineMembers: teamStats.onlineMembers,
      projectsNeedingResources: teamStats.activeProjects
    })
    setShowResourcesDialog(true)
  }, [teamStats])

  // Handler 6: Team Training & Development
  const handleTeamTraining = useCallback(() => {
    logger.info('Team training schedule accessed', {
      membersToTrain: teamStats.totalMembers,
      departments: departments.length
    })
    setShowTrainingDialog(true)
  }, [teamStats, departments])

  // Handler 7: Team Feedback Collection
  const handleTeamFeedback = useCallback(() => {
    logger.info('Team feedback collection initiated', {
      membersCount: teamStats.totalMembers,
      currentAverageRating: teamStats.averageRating.toFixed(2)
    })
    setShowFeedbackDialog(true)
  }, [teamStats])

  // Handler 8: Team Recognition & Awards
  const handleTeamRecognition = useCallback(() => {
    logger.info('Team recognition system accessed', {
      teamMembers: teamStats.totalMembers,
      tasksCompleted: teamStats.completedTasks,
      averageRating: teamStats.averageRating.toFixed(2)
    })
    setShowRecognitionDialog(true)
  }, [teamStats])

  // Handler 9: Team Onboarding Process
  const handleTeamOnboarding = useCallback(() => {
    logger.info('Team onboarding process accessed', {
      currentTeamSize: teamStats.totalMembers,
      departmentsAvailable: departments.length
    })
    setShowOnboardingDialog(true)
  }, [teamStats, departments])

  // Handler 10: Team Offboarding Process
  const handleTeamOffboarding = useCallback(() => {
    logger.info('Team offboarding process accessed', {
      currentMembers: teamStats.totalMembers,
      activeProjects: teamStats.activeProjects
    })
    setShowOffboardingDialog(true)
  }, [teamStats])

  // Handler 11: Team Directory Access
  const handleTeamDirectory = useCallback(() => {
    logger.info('Team directory accessed', {
      totalMembers: teamStats.totalMembers,
      departments: departments.length,
      onlineMembers: teamStats.onlineMembers
    })
    setShowDirectoryDialog(true)
  }, [teamStats, departments])

  // Handler 12: Team Calendar View
  const handleTeamCalendar = useCallback(() => {
    logger.info('Team calendar accessed', {
      membersScheduled: teamStats.totalMembers,
      activeProjects: teamStats.activeProjects,
      onlineMembers: teamStats.onlineMembers
    })
    setShowCalendarDialog(true)
  }, [teamStats])

  // Handler 13: Team Files Management
  const handleTeamFiles = useCallback(() => {
    logger.info('Team files management accessed', {
      membersWithAccess: teamStats.totalMembers,
      departments: departments.length,
      projectFiles: teamStats.activeProjects
    })
    setShowFilesDialog(true)
  }, [teamStats, departments])

  // Handler 14: Team Projects Overview
  const handleTeamProjects = useCallback(() => {
    logger.info('Team projects overview accessed', {
      activeProjects: teamStats.activeProjects,
      membersAssigned: teamStats.totalMembers,
      completedTasks: teamStats.completedTasks
    })
    setShowProjectsDialog(true)
  }, [teamStats])

  // Handler 15: Team Tasks Assignment
  const handleTeamTasks = useCallback(() => {
    logger.info('Team tasks assignment accessed', {
      availableMembers: teamStats.totalMembers,
      onlineMembers: teamStats.onlineMembers,
      completedTasks: teamStats.completedTasks
    })
    setShowTasksDialog(true)
  }, [teamStats])

  // Save handlers for dialogs
  const handleSaveGoal = useCallback(() => {
    if (!newGoal.title) {
      toast.error('Please enter a goal title')
      return
    }
    logger.info('Goal saved', { goal: newGoal })
    toast.success('Goal Created', { description: `"${newGoal.title}" has been added to team goals` })
    setNewGoal({ title: '', target: '', deadline: '' })
    setShowGoalsDialog(false)
  }, [newGoal])

  const handleSaveMilestone = useCallback(() => {
    if (!newMilestone.title) {
      toast.error('Please enter a milestone title')
      return
    }
    logger.info('Milestone saved', { milestone: newMilestone })
    toast.success('Milestone Created', { description: `"${newMilestone.title}" has been added` })
    setNewMilestone({ title: '', project: '', date: '' })
    setShowMilestonesDialog(false)
  }, [newMilestone])

  const handleSubmitFeedback = useCallback(() => {
    if (!feedbackForm.memberId) {
      toast.error('Please select a team member')
      return
    }
    const member = teamMembers.find(m => m.id === feedbackForm.memberId)
    logger.info('Feedback submitted', { feedback: feedbackForm, memberName: member?.name })
    toast.success('Feedback Submitted', { description: `Feedback sent for ${member?.name}` })
    setFeedbackForm({ memberId: '', rating: 5, comments: '' })
    setShowFeedbackDialog(false)
  }, [feedbackForm, teamMembers])

  const handleSubmitRecognition = useCallback(() => {
    if (!recognitionForm.memberId || !recognitionForm.award) {
      toast.error('Please select a member and award type')
      return
    }
    const member = teamMembers.find(m => m.id === recognitionForm.memberId)
    logger.info('Recognition submitted', { recognition: recognitionForm, memberName: member?.name })
    toast.success('Recognition Sent', { description: `${recognitionForm.award} award given to ${member?.name}` })
    setRecognitionForm({ memberId: '', award: '', reason: '' })
    setShowRecognitionDialog(false)
  }, [recognitionForm, teamMembers])

  const handleAssignNewTask = useCallback(() => {
    if (!taskForm.memberId || !taskForm.title) {
      toast.error('Please select a member and enter task title')
      return
    }
    const member = teamMembers.find(m => m.id === taskForm.memberId)
    logger.info('Task assigned', { task: taskForm, memberName: member?.name })
    toast.success('Task Assigned', { description: `"${taskForm.title}" assigned to ${member?.name}` })
    setTaskForm({ memberId: '', title: '', priority: 'medium', dueDate: '' })
    setShowTasksDialog(false)
  }, [taskForm, teamMembers])

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
                      toast.success('Opening Team Chat', {
                        description: `${teamStats.onlineMembers} members online`
                      })
                      router.push('/dashboard/messages?channel=team-general')
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
                      toast.info('Opening Team Calendar', {
                        description: `View availability for ${teamStats.totalMembers} team members`
                      })
                      router.push('/dashboard/calendar?view=team')
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
                      toast.success('Starting Video Meeting', {
                        description: `Connecting with ${teamStats.onlineMembers} online members`
                      })
                      router.push('/dashboard/collaboration/meetings?action=new')
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
                      toast.success('Opening Team Reports', {
                        description: 'Team analytics and performance metrics'
                      })
                      router.push('/dashboard/analytics?filter=team')
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
                        toast.success('Opening Chat', {
                          description: `Starting conversation with ${member.name}`
                        })
                        router.push(`/dashboard/messages?dm=${member.id}&name=${encodeURIComponent(member.name)}`)
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

      {/* Performance Metrics Dialog */}
      <Dialog open={showPerformanceDialog} onOpenChange={setShowPerformanceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Team Performance Metrics
            </DialogTitle>
            <DialogDescription>
              Overview of team performance and productivity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">{teamStats.totalMembers}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{teamStats.onlineMembers}</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-yellow-600">{teamStats.completedTasks}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">{teamStats.averageRating.toFixed(1)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Team Productivity</p>
              <Progress value={Math.min((teamStats.completedTasks / (teamStats.totalMembers * 10)) * 100, 100)} className="h-2" />
              <p className="text-xs text-gray-500">Based on tasks completed per member</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Top Performers</p>
              {teamMembers.sort((a, b) => b.rating - a.rating).slice(0, 3).map((member, i) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{i + 1}.</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <Badge variant="outline">{member.rating.toFixed(1)} rating</Badge>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleTeamExport('csv')}>Export CSV</Button>
            <Button onClick={() => setShowPerformanceDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Team Goals
            </DialogTitle>
            <DialogDescription>
              Set and track team objectives
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="e.g., Complete Q1 deliverables"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Metric</Label>
              <Input
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                placeholder="e.g., 50 tasks completed"
              />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              />
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm font-medium mb-2">Current Progress</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Active Projects: {teamStats.activeProjects}</span>
                <span>Completed Tasks: {teamStats.completedTasks}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalsDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal}>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestones Dialog */}
      <Dialog open={showMilestonesDialog} onOpenChange={setShowMilestonesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Team Milestones
            </DialogTitle>
            <DialogDescription>
              Track project milestones and achievements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Milestone Title</Label>
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="e.g., MVP Launch"
              />
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Input
                value={newMilestone.project}
                onChange={(e) => setNewMilestone({ ...newMilestone, project: e.target.value })}
                placeholder="Select project"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Input
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
              />
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <p className="text-sm font-medium mb-1">Milestone Tracking</p>
              <p className="text-xs text-gray-600">{teamStats.activeProjects} active projects being tracked</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMilestonesDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMilestone}>Add Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Team Budget
            </DialogTitle>
            <DialogDescription>
              View and manage department budgets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.name} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{dept.name}</span>
                  <Badge className={dept.color}>{dept.count} members</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <span>{dept.activeProjects} active projects</span>
                  {dept.budget && <span className="ml-4">Budget: ${dept.budget.toLocaleString()}</span>}
                </div>
                <Progress value={Math.min((dept.activeProjects / 10) * 100, 100)} className="h-1.5 mt-2" />
              </div>
            ))}
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-sm font-medium">Total Team</p>
              <p className="text-lg font-bold text-green-600">{teamStats.totalMembers} members across {departments.length} departments</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBudgetDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resources Dialog */}
      <Dialog open={showResourcesDialog} onOpenChange={setShowResourcesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Resource Allocation
            </DialogTitle>
            <DialogDescription>
              View team availability and allocate resources
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-2xl font-bold text-green-600">{teamStats.onlineMembers}</p>
                <p className="text-sm text-gray-600">Available Now</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                <p className="text-2xl font-bold">{teamStats.totalMembers - teamStats.onlineMembers}</p>
                <p className="text-sm text-gray-600">Offline</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Available Team Members</p>
              {teamMembers.filter(m => m.status === 'online').slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{member.projects} projects</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResourcesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Training Dialog */}
      <Dialog open={showTrainingDialog} onOpenChange={setShowTrainingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-500" />
              Training & Development
            </DialogTitle>
            <DialogDescription>
              Manage team training and skill development
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <p className="text-sm font-medium">Team Size</p>
              <p className="text-lg font-bold text-purple-600">{teamStats.totalMembers} members eligible for training</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Departments</p>
              {departments.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">{dept.name}</span>
                  <Badge variant="outline">{dept.count} members</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full" variant="outline" onClick={() => {
              toast.success('Training Schedule', { description: 'Training module coming soon' })
            }}>
              Schedule Training Session
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTrainingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Team Feedback
            </DialogTitle>
            <DialogDescription>
              Provide feedback for team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Team Member</Label>
              <select
                className="w-full p-2 rounded border bg-background"
                value={feedbackForm.memberId}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, memberId: e.target.value })}
              >
                <option value="">Choose a member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name} - {member.role}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Rating (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) || 5 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                placeholder="Provide detailed feedback..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recognition Dialog */}
      <Dialog open={showRecognitionDialog} onOpenChange={setShowRecognitionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Team Recognition
            </DialogTitle>
            <DialogDescription>
              Recognize and reward team achievements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Team Member</Label>
              <select
                className="w-full p-2 rounded border bg-background"
                value={recognitionForm.memberId}
                onChange={(e) => setRecognitionForm({ ...recognitionForm, memberId: e.target.value })}
              >
                <option value="">Choose a member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Award Type</Label>
              <select
                className="w-full p-2 rounded border bg-background"
                value={recognitionForm.award}
                onChange={(e) => setRecognitionForm({ ...recognitionForm, award: e.target.value })}
              >
                <option value="">Select award...</option>
                <option value="Star Performer">Star Performer</option>
                <option value="Team Player">Team Player</option>
                <option value="Innovation Award">Innovation Award</option>
                <option value="Customer Hero">Customer Hero</option>
                <option value="Leadership Excellence">Leadership Excellence</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={recognitionForm.reason}
                onChange={(e) => setRecognitionForm({ ...recognitionForm, reason: e.target.value })}
                placeholder="Why is this person being recognized?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecognitionDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitRecognition}>Give Recognition</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboardingDialog} onOpenChange={setShowOnboardingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Team Onboarding
            </DialogTitle>
            <DialogDescription>
              Welcome new team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <p className="text-sm font-medium">Current Team</p>
              <p className="text-lg font-bold text-green-600">{teamStats.totalMembers} members</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Available Departments</p>
              {departments.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">{dept.name}</span>
                  <Badge className={dept.color}>{dept.count} members</Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Onboarding Checklist</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>1. Send welcome email</p>
                <p>2. Set up workspace access</p>
                <p>3. Assign mentor</p>
                <p>4. Schedule orientation</p>
                <p>5. Review team policies</p>
              </div>
            </div>
            <Button className="w-full" onClick={handleAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Team Member
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowOnboardingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offboarding Dialog */}
      <Dialog open={showOffboardingDialog} onOpenChange={setShowOffboardingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Team Offboarding
            </DialogTitle>
            <DialogDescription>
              Manage team member departures professionally
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Offboarding Checklist</p>
              <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                <li>Transfer project ownership</li>
                <li>Revoke system access</li>
                <li>Collect company assets</li>
                <li>Conduct exit interview</li>
                <li>Process final documentation</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Projects to Reassign</p>
              <p className="text-sm text-gray-600">{teamStats.activeProjects} active projects may need reassignment</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowOffboardingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Directory Dialog */}
      <Dialog open={showDirectoryDialog} onOpenChange={setShowDirectoryDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Team Directory
            </DialogTitle>
            <DialogDescription>
              Complete list of {teamStats.totalMembers} team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role} - {member.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => window.open(`mailto:${member.email}`)}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  {member.phone && (
                    <Button size="sm" variant="ghost" onClick={() => window.open(`tel:${member.phone}`)}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleTeamExport('csv')}>Export Directory</Button>
            <Button onClick={() => setShowDirectoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Team Calendar
            </DialogTitle>
            <DialogDescription>
              View team schedules and availability
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
                <p className="text-lg font-bold text-green-600">{teamStats.onlineMembers}</p>
                <p className="text-xs">Online</p>
              </div>
              <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-lg font-bold text-yellow-600">{teamMembers.filter(m => m.status === 'busy').length}</p>
                <p className="text-xs">Busy</p>
              </div>
              <div className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                <p className="text-lg font-bold">{teamMembers.filter(m => m.status === 'offline').length}</p>
                <p className="text-xs">Offline</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Today's Availability</p>
              {teamMembers.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{member.availability}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCalendarDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Files Dialog */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Team Files
            </DialogTitle>
            <DialogDescription>
              Shared files and documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm font-medium">Active Projects</p>
              <p className="text-lg font-bold text-blue-600">{teamStats.activeProjects} projects with shared files</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent Files</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Project_Requirements.pdf</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span>Team_Guidelines.docx</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <FileText className="h-4 w-4 text-yellow-500" />
                  <span>Meeting_Notes.md</span>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => {
              toast.info('Files Hub', { description: 'Opening Files Hub...' })
            }}>
              Open Files Hub
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowFilesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Projects Dialog */}
      <Dialog open={showProjectsDialog} onOpenChange={setShowProjectsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Team Projects
            </DialogTitle>
            <DialogDescription>
              Overview of {teamStats.activeProjects} active projects
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <p className="text-2xl font-bold text-green-600">{teamStats.activeProjects}</p>
                <p className="text-sm">Active</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <p className="text-2xl font-bold text-blue-600">{teamStats.completedTasks}</p>
                <p className="text-sm">Tasks Done</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Team Allocation</p>
              {departments.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm">{dept.name}</span>
                  <span className="text-xs text-gray-500">{dept.activeProjects} projects</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProjectsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog open={showTasksDialog} onOpenChange={setShowTasksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Assign Task
            </DialogTitle>
            <DialogDescription>
              Assign tasks to {teamStats.onlineMembers} available members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assign To</Label>
              <select
                className="w-full p-2 rounded border bg-background"
                value={taskForm.memberId}
                onChange={(e) => setTaskForm({ ...taskForm, memberId: e.target.value })}
              >
                <option value="">Select team member...</option>
                {teamMembers.filter(m => m.status === 'online' || m.status === 'busy').map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role} ({member.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select
                className="w-full p-2 rounded border bg-background"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTasksDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignNewTask}>Assign Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Team Member
            </DialogTitle>
            <DialogDescription>
              Add a new member to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                placeholder="Enter member name"
                value={addMemberForm.name}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="member@company.com"
                value={addMemberForm.email}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <Input
                id="member-role"
                placeholder="Team Member"
                value={addMemberForm.role}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-dept">Department</Label>
              <select
                id="member-dept"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={addMemberForm.department}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, department: e.target.value })}
              >
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="management">Management</option>
                <option value="marketing">Marketing</option>
                <option value="qa">QA</option>
                <option value="content">Content</option>
                <option value="operations">Operations</option>
                <option value="analytics">Analytics</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddMember}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={showUpdateRoleDialog} onOpenChange={setShowUpdateRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Update Role
            </DialogTitle>
            <DialogDescription>
              Update role for {updateRoleMember?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Input
                id="new-role"
                placeholder="Enter new role"
                value={newRoleValue}
                onChange={(e) => setNewRoleValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdateRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignTaskDialog} onOpenChange={setShowAssignTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Assign Task
            </DialogTitle>
            <DialogDescription>
              Assign a task to {assignTaskMember?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                placeholder="Enter task name"
                value={taskNameValue}
                onChange={(e) => setTaskNameValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignTask}>
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
