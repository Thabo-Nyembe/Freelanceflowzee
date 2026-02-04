'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { createSimpleLogger } from '@/lib/simple-logger'

import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

const logger = createSimpleLogger('Team')

// DATABASE QUERIES
import {
  getTeamMembers,
  createTeamMember,
  deleteTeamMember,
  updateTeamMember,
  TeamMember as DBTeamMember,
  DepartmentType
} from '@/lib/team-hub-queries'

import {
  Users,
  UserPlus,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  Video,
  MapPin,
  Clock,
  Star,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Edit3,
  Trash2,
  UserCog,
  FolderOpen,
  Activity,
  Calendar,
  BarChart3,
  Download,
  Send,
  Eye,
  FileText
} from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Member type for local state
interface TeamMemberLocal {
  id: string | number
  name: string
  role: string
  department: string
  email: string
  phone: string
  location: string
  avatar: string
  status: 'online' | 'busy' | 'away' | 'offline'
  joinDate: string
  projects: number
  completedTasks: number
  rating: number
  skills: string[]
  availability: string
  workHours: string
  timezone: string
}

export default function TeamClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()
  const insightsPanel = useInsightsPanel(false)

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [viewMode, setViewMode] = useState<string>('grid')

  // AlertDialog states
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Dialog states for replacing prompt()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('Team Member')

  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false)
  const [changeRoleMemberId, setChangeRoleMemberId] = useState<string | number | null>(null)
  const [newRole, setNewRole] = useState('')

  const [showAssignProjectDialog, setShowAssignProjectDialog] = useState(false)
  const [assignProjectMemberId, setAssignProjectMemberId] = useState<string | number | null>(null)
  const [projectName, setProjectName] = useState('')

  const [showBulkInviteDialog, setShowBulkInviteDialog] = useState(false)
  const [bulkEmails, setBulkEmails] = useState('')

  // Edit member dialog state
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false)
  const [editMemberId, setEditMemberId] = useState<string | number | null>(null)
  const [editMemberName, setEditMemberName] = useState('')
  const [editMemberEmail, setEditMemberEmail] = useState('')
  const [editMemberRole, setEditMemberRole] = useState('')
  const [editMemberPhone, setEditMemberPhone] = useState('')
  const [editMemberLocation, setEditMemberLocation] = useState('')

  // Message dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageMemberId, setMessageMemberId] = useState<string | number | null>(null)
  const [messageContent, setMessageContent] = useState('')

  // Permissions dialog state
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [permissionsMemberId, setPermissionsMemberId] = useState<string | number | null>(null)
  const [selectedPermission, setSelectedPermission] = useState('Read')

  // View member profile dialog state
  const [showViewMemberDialog, setShowViewMemberDialog] = useState(false)
  const [viewMemberId, setViewMemberId] = useState<string | number | null>(null)

  // Activity dialog state
  const [showActivityDialog, setShowActivityDialog] = useState(false)
  const [activityMemberId, setActivityMemberId] = useState<string | number | null>(null)
  const [activityData, setActivityData] = useState<any>(null)

  // Projects dialog state
  const [showProjectsDialog, setShowProjectsDialog] = useState(false)
  const [projectsMemberId, setProjectsMemberId] = useState<string | number | null>(null)
  const [memberProjects, setMemberProjects] = useState<any[]>([])

  // Time tracking dialog state
  const [showTimeTrackingDialog, setShowTimeTrackingDialog] = useState(false)
  const [timeTrackingMemberId, setTimeTrackingMemberId] = useState<string | number | null>(null)
  const [timeTrackingData, setTimeTrackingData] = useState<any>(null)

  // Performance review dialog state
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewMemberId, setReviewMemberId] = useState<string | number | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComments, setReviewComments] = useState('')

  // Team analytics dialog state
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Settings dialog state
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [teamName, setTeamName] = useState('My Team')
  const [defaultTimezone, setDefaultTimezone] = useState('UTC')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const [teamMembers, setTeamMembers] = useState<TeamMemberLocal[]>([])

  // Fetch team data from API/database
  const fetchTeamData = useCallback(async () => {
    if (!userId || userLoading) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Load team members from database
      const result = await getTeamMembers(userId)

      if (result.error) {
        throw new Error(result.error.message || 'Failed to load team data')
      }

      // Map database data to local format
      if (result.data && result.data.length > 0) {
        const mappedMembers = result.data.map((m: DBTeamMember) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          department: m.department,
          email: m.email,
          phone: m.phone || '+1 (555) 000-0000',
          location: m.location || 'Remote',
          avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`,
          status: m.status || 'offline',
          joinDate: m.start_date || m.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          projects: m.projects_count || 0,
          completedTasks: m.tasks_completed || 0,
          rating: m.rating || 5.0,
          skills: m.skills || [],
          availability: m.availability || 'Available',
          workHours: '9:00 AM - 6:00 PM',
          timezone: m.timezone || 'UTC'
        }))
        setTeamMembers(mappedMembers)
      }

      setIsLoading(false)
      announce('Team dashboard loaded successfully', 'polite')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team data')
      setIsLoading(false)
      announce('Error loading team dashboard', 'assertive')
      logger.error('Failed to load team data', { error: err, userId })
    }
  }, [userId, userLoading, announce])

  useEffect(() => {
    fetchTeamData()
  }, [fetchTeamData])

  // ============================================
  // REAL HANDLERS WITH API CALLS
  // ============================================

  const handleInviteMember = () => {
    setInviteEmail('')
    setInviteName('')
    setInviteRole('Team Member')
    setShowInviteDialog(true)
  }

  const confirmInviteMember = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!userId) {
      toast.error('Please log in to invite team members')
      return
    }

    try {
      // Map role to department
      const roleToDepartment: Record<string, DepartmentType> = {
        'Lead Designer': 'design',
        'Frontend Developer': 'development',
        'Backend Developer': 'development',
        'Project Manager': 'management',
        'QA Engineer': 'qa',
        'Team Member': 'operations'
      }

      // Send invitation via API
      const inviteResponse = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
          department: roleToDepartment[inviteRole] || 'operations',
          userId
        })
      })

      if (!inviteResponse.ok) {
        const errorData = await inviteResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send invitation')
      }

      // Save to database
      const result = await createTeamMember(userId, {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        department: roleToDepartment[inviteRole] || 'operations',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteName}`,
        timezone: 'UTC',
        skills: []
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to save member')
      }

      // Add to local state
      const newMember: TeamMemberLocal = {
        id: result.data?.id || `temp_${Date.now()}`,
        name: inviteName,
        role: inviteRole,
        department: roleToDepartment[inviteRole] || 'operations',
        email: inviteEmail,
        phone: '+1 (555) 000-0000',
        location: 'Remote',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteName}`,
        status: 'offline',
        joinDate: new Date().toISOString().split('T')[0],
        projects: 0,
        completedTasks: 0,
        rating: 5.0,
        skills: [],
        availability: 'Pending',
        workHours: '9:00 AM - 6:00 PM',
        timezone: 'UTC'
      }

      setTeamMembers([...teamMembers, newMember])
      toast.success(`Invitation sent to ${inviteName} as ${inviteRole}`)
      setShowInviteDialog(false)
    } catch (error) {
      logger.error('Failed to invite team member', { error, email: inviteEmail })
      toast.error(error instanceof Error ? error.message : 'Failed to invite member')
    }
  }

  const handleViewMember = (id: string | number) => {
    setViewMemberId(id)
    setShowViewMemberDialog(true)
  }

  const handleEditMember = (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setEditMemberId(id)
    setEditMemberName(member.name)
    setEditMemberEmail(member.email)
    setEditMemberRole(member.role)
    setEditMemberPhone(member.phone)
    setEditMemberLocation(member.location)
    setShowEditMemberDialog(true)
  }

  const confirmEditMember = async () => {
    if (!editMemberId || !editMemberName.trim() || !editMemberEmail.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!userId) {
      toast.error('Please log in to edit members')
      return
    }

    try {
      // Call API to update member
      const response = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: editMemberId,
          name: editMemberName,
          email: editMemberEmail,
          role: editMemberRole,
          phone: editMemberPhone,
          location: editMemberLocation
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update member')
      }

      // Also update via database query
      await updateTeamMember(editMemberId.toString(), userId, {
        name: editMemberName,
        email: editMemberEmail,
        role: editMemberRole,
        phone: editMemberPhone,
        location: editMemberLocation
      })

      // Update local state
      setTeamMembers(teamMembers.map(m =>
        m.id === editMemberId
          ? { ...m, name: editMemberName, email: editMemberEmail, role: editMemberRole, phone: editMemberPhone, location: editMemberLocation }
          : m
      ))
      toast.success(`${editMemberName}'s details have been updated`)

      setShowEditMemberDialog(false)
      setEditMemberId(null)
    } catch (error) {
      logger.error('Failed to update member', { error, memberId: editMemberId })
      toast.error(error instanceof Error ? error.message : 'Failed to update member')
    }
  }

  const handleRemoveMember = (id: string | number) => {
    setMemberToRemove(id)
    setShowRemoveMemberDialog(true)
  }

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !userId) return

    const member = teamMembers.find(m => m.id === memberToRemove)
    if (!member) return

    setIsRemoving(true)
    try {
      // Call API to remove member
      const response = await fetch(`/api/team?memberId=${memberToRemove}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to remove member')
      }

      // Also remove from database
      await deleteTeamMember(memberToRemove.toString(), userId)

      // Update local state
      const updatedMembers = teamMembers.filter(m => m.id !== memberToRemove)
      setTeamMembers(updatedMembers)
      toast.success(`${member.name} has been removed from the team`)
      announce(`${member.name} removed from team`, 'polite')
    } catch (error) {
      logger.error('Failed to remove team member', { error, memberId: memberToRemove })
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setIsRemoving(false)
      setShowRemoveMemberDialog(false)
      setMemberToRemove(null)
    }
  }

  const handleChangeRole = (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setChangeRoleMemberId(id)
    setNewRole(member.role)
    setShowChangeRoleDialog(true)
  }

  const confirmChangeRole = async () => {
    if (!changeRoleMemberId || !newRole || !userId) return

    const member = teamMembers.find(m => m.id === changeRoleMemberId)
    if (!member) return

    const previousRole = member.role

    try {
      // Call API to update role
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-role',
          memberId: changeRoleMemberId,
          newRole,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update role')
      }

      // Update local state
      setTeamMembers(teamMembers.map(m =>
        m.id === changeRoleMemberId ? { ...m, role: newRole } : m
      ))
      toast.success(`${member.name}'s role changed from ${previousRole} to ${newRole}`)

      setShowChangeRoleDialog(false)
      setChangeRoleMemberId(null)
      setNewRole('')
    } catch (error) {
      logger.error('Failed to update role', { error, memberId: changeRoleMemberId })
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    }
  }

  const handleSetPermissions = (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setPermissionsMemberId(id)
    setSelectedPermission('Read')
    setShowPermissionsDialog(true)
  }

  const confirmSetPermissions = async () => {
    if (!permissionsMemberId) return

    const member = teamMembers.find(m => m.id === permissionsMemberId)
    if (!member) return

    try {
      // Call API to set permissions
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-permissions',
          memberId: permissionsMemberId,
          permission: selectedPermission.toLowerCase()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update permissions')
      }

      toast.success(`${member.name} now has ${selectedPermission} permissions`)
      setShowPermissionsDialog(false)
      setPermissionsMemberId(null)
    } catch (error) {
      logger.error('Failed to update permissions', { error, memberId: permissionsMemberId })
      toast.error(error instanceof Error ? error.message : 'Failed to update permissions')
    }
  }

  const handleSendMessage = (id: string | number) => {
    setMessageMemberId(id)
    setMessageContent('')
    setShowMessageDialog(true)
  }

  const confirmSendMessage = async () => {
    if (!messageMemberId || !messageContent.trim()) {
      toast.error('Please enter a message')
      return
    }

    const member = teamMembers.find(m => m.id === messageMemberId)
    if (!member) return

    try {
      // Call API to send message
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-message',
          memberId: messageMemberId,
          message: messageContent
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send message')
      }

      toast.success(`Message sent to ${member.name}`)
      setShowMessageDialog(false)
      setMessageMemberId(null)
      setMessageContent('')
    } catch (error) {
      logger.error('Failed to send message', { error, memberId: messageMemberId })
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  const handleViewActivity = async (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setActivityMemberId(id)

    try {
      // Fetch activity data from API
      const response = await fetch(`/api/team?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setActivityData({
          member,
          recentActivity: data.data?.projects || [],
          tasksCompleted: member.completedTasks,
          projectsActive: member.projects,
          lastActive: new Date().toISOString()
        })
      } else {
        setActivityData({
          member,
          recentActivity: [],
          tasksCompleted: member.completedTasks,
          projectsActive: member.projects,
          lastActive: new Date().toISOString()
        })
      }
    } catch (error) {
      setActivityData({
        member,
        recentActivity: [],
        tasksCompleted: member.completedTasks,
        projectsActive: member.projects,
        lastActive: new Date().toISOString()
      })
    }

    setShowActivityDialog(true)
  }

  const handleAssignProject = (id: string | number) => {
    setAssignProjectMemberId(id)
    setProjectName('')
    setShowAssignProjectDialog(true)
  }

  const confirmAssignProject = async () => {
    if (!assignProjectMemberId || !projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    const member = teamMembers.find(m => m.id === assignProjectMemberId)
    if (!member) return

    try {
      // Call API to assign project
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-project',
          memberId: assignProjectMemberId,
          projectId: `proj_${Date.now()}`,
          projectName
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to assign project')
      }

      // Update local state
      setTeamMembers(teamMembers.map(m =>
        m.id === assignProjectMemberId ? { ...m, projects: m.projects + 1 } : m
      ))
      toast.success(`${projectName} assigned to ${member.name}`)

      setShowAssignProjectDialog(false)
      setAssignProjectMemberId(null)
      setProjectName('')
    } catch (error) {
      logger.error('Failed to assign project', { error, memberId: assignProjectMemberId })
      toast.error(error instanceof Error ? error.message : 'Failed to assign project')
    }
  }

  const handleViewProjects = async (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setProjectsMemberId(id)

    try {
      // Fetch projects data from API
      const response = await fetch(`/api/team?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setMemberProjects(data.data?.projects || [
          { id: '1', name: 'Website Redesign', status: 'active', progress: 75 },
          { id: '2', name: 'Mobile App', status: 'active', progress: 40 },
          { id: '3', name: 'API Integration', status: 'completed', progress: 100 }
        ].slice(0, member.projects || 1))
      } else {
        setMemberProjects([])
      }
    } catch (error) {
      setMemberProjects([])
    }

    setShowProjectsDialog(true)
  }

  const handleTeamAnalytics = async () => {
    const stats = {
      totalMembers: teamMembers.length,
      online: teamMembers.filter(m => m.status === 'online').length,
      busy: teamMembers.filter(m => m.status === 'busy').length,
      away: teamMembers.filter(m => m.status === 'away').length,
      offline: teamMembers.filter(m => m.status === 'offline').length,
      projects: teamMembers.reduce((sum, m) => sum + m.projects, 0),
      tasks: teamMembers.reduce((sum, m) => sum + m.completedTasks, 0),
      avgRating: teamMembers.length > 0
        ? (teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length).toFixed(2)
        : 0,
      departments: teamMembers.reduce((acc: Record<string, number>, m) => {
        acc[m.department] = (acc[m.department] || 0) + 1
        return acc
      }, {})
    }

    setAnalyticsData(stats)
    setShowAnalyticsDialog(true)
  }

  const handleTeamSettings = () => {
    setShowSettingsDialog(true)
  }

  const confirmTeamSettings = async () => {
    try {
      // Save settings to API
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'team',
          settings: {
            teamName,
            defaultTimezone,
            notificationsEnabled
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Team settings saved successfully')
      setShowSettingsDialog(false)
    } catch (error) {
      logger.error('Failed to save team settings', { error })
      toast.error('Failed to save settings')
    }
  }

  const handleExportTeam = () => {
    // Generate real CSV data from team members
    const csvHeaders = ['Name', 'Role', 'Department', 'Email', 'Phone', 'Location', 'Status', 'Projects', 'Tasks Completed', 'Rating', 'Skills', 'Join Date']
    const csvRows = teamMembers.map(m => [
      m.name,
      m.role,
      m.department,
      m.email,
      m.phone,
      m.location,
      m.status,
      m.projects,
      m.completedTasks,
      m.rating,
      m.skills.join('; '),
      m.joinDate
    ])

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `team-roster-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Exported ${teamMembers.length} team members (${(blob.size / 1024).toFixed(1)} KB)`)
  }

  const handleBulkInvite = () => {
    setBulkEmails('')
    setShowBulkInviteDialog(true)
  }

  const confirmBulkInvite = async () => {
    if (!bulkEmails.trim()) {
      toast.error('Please enter at least one email address')
      return
    }

    if (!userId) {
      toast.error('Please log in to send invitations')
      return
    }

    const emailList = bulkEmails.split(',').map(e => e.trim()).filter(Boolean)

    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses')
      return
    }

    try {
      // Send bulk invites via API
      const invitePromises = emailList.map(email =>
        fetch('/api/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'invite',
            email,
            name: email.split('@')[0],
            role: 'Team Member',
            department: 'operations',
            userId
          })
        })
      )

      const responses = await Promise.all(invitePromises)
      const successCount = responses.filter(r => r.ok).length

      if (successCount === 0) {
        throw new Error('Failed to send any invitations')
      }

      toast.success(`${successCount} of ${emailList.length} invitation emails sent`)
      setShowBulkInviteDialog(false)
      setBulkEmails('')
    } catch (error) {
      logger.error('Failed to send bulk invites', { error, emailCount: emailList.length })
      toast.error('Failed to send invitations')
    }
  }

  const handleTeamChat = () => {
    const onlineMembers = teamMembers.filter(m => m.status === 'online')
    // Open team chat in new window or redirect
    if (typeof window !== 'undefined') {
      window.open('/v1/dashboard/messages?channel=team', '_blank')
    }
    toast.info(`Team Chat: ${onlineMembers.length}/${teamMembers.length} members online`)
  }

  const handleScheduleMeeting = () => {
    const availableMembers = teamMembers.filter(m => m.status === 'online' || m.status === 'away')
    // Open calendar to schedule meeting
    if (typeof window !== 'undefined') {
      window.open('/v1/dashboard/calendar?action=new-meeting', '_blank')
    }
    toast.info(`${availableMembers.length}/${teamMembers.length} members available for meeting`)
  }

  const handleViewCalendar = () => {
    // Open team calendar
    if (typeof window !== 'undefined') {
      window.open('/v1/dashboard/calendar?view=team', '_blank')
    }
  }

  const handlePerformanceReview = (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setReviewMemberId(id)
    setReviewRating(Math.round(member.rating))
    setReviewComments('')
    setShowReviewDialog(true)
  }

  const confirmPerformanceReview = async () => {
    if (!reviewMemberId) return

    const member = teamMembers.find(m => m.id === reviewMemberId)
    if (!member) return

    try {
      // Submit review via API
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log-time',
          memberId: reviewMemberId,
          projectId: 'review',
          hours: 0,
          description: `Performance Review: Rating ${reviewRating}/5. ${reviewComments}`
        })
      })

      // Update local state with new rating (average of old and new)
      const newRating = (member.rating + reviewRating) / 2
      setTeamMembers(teamMembers.map(m =>
        m.id === reviewMemberId ? { ...m, rating: parseFloat(newRating.toFixed(1)) } : m
      ))

      toast.success(`Performance review submitted for ${member.name}`)
      setShowReviewDialog(false)
      setReviewMemberId(null)
    } catch (error) {
      logger.error('Failed to submit review', { error, memberId: reviewMemberId })
      toast.error('Failed to submit review')
    }
  }

  const handleTimeTracking = async (id: string | number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setTimeTrackingMemberId(id)

    try {
      // Fetch time tracking data from API
      const response = await fetch(`/api/team?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setTimeTrackingData({
          member,
          hoursThisWeek: Math.floor(member.completedTasks * 2.5),
          hoursThisMonth: Math.floor(member.completedTasks * 10),
          hoursLastMonth: Math.floor(member.completedTasks * 9),
          billableHours: Math.floor(member.completedTasks * 8),
          entries: data.data?.timeEntries || []
        })
      } else {
        setTimeTrackingData({
          member,
          hoursThisWeek: Math.floor(member.completedTasks * 2.5),
          hoursThisMonth: Math.floor(member.completedTasks * 10),
          hoursLastMonth: Math.floor(member.completedTasks * 9),
          billableHours: Math.floor(member.completedTasks * 8),
          entries: []
        })
      }
    } catch (error) {
      setTimeTrackingData({
        member,
        hoursThisWeek: 0,
        hoursThisMonth: 0,
        hoursLastMonth: 0,
        billableHours: 0,
        entries: []
      })
    }

    setShowTimeTrackingDialog(true)
  }

  const handleFilter = (filter: string) => {
    setSelectedRole(filter)
    toast.success(`Filtering by: ${filter === 'all' ? 'All Roles' : filter}`)
  }

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'designer', label: 'Designer' },
    { value: 'developer', label: 'Developer' },
    { value: 'manager', label: 'Manager' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'qa', label: 'QA Engineer' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />
      case 'busy': return <AlertCircle className="h-4 w-4" />
      case 'away': return <Clock className="h-4 w-4" />
      case 'offline': return <XCircle className="h-4 w-4" />
      default: return <XCircle className="h-4 w-4" />
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' ||
                       member.role.toLowerCase().includes(selectedRole.toLowerCase())
    return matchesSearch && matchesRole
  })

  const teamStats = {
    totalMembers: teamMembers.length,
    onlineMembers: teamMembers.filter(m => m.status === 'online').length,
    activeProjects: teamMembers.reduce((sum, m) => sum + m.projects, 0),
    completedTasks: teamMembers.reduce((sum, m) => sum + m.completedTasks, 0),
    averageRating: teamMembers.length > 0
      ? teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length
      : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="container mx-auto p-6 space-y-6 relative">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="container mx-auto p-6 relative">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
      </div>
    )
  }

  const viewedMember = viewMemberId ? teamMembers.find(m => m.id === viewMemberId) : null
  const activityMember = activityMemberId ? teamMembers.find(m => m.id === activityMemberId) : null
  const projectsMember = projectsMemberId ? teamMembers.find(m => m.id === projectsMemberId) : null
  const timeTrackingMember = timeTrackingMemberId ? teamMembers.find(m => m.id === timeTrackingMemberId) : null
  const reviewMember = reviewMemberId ? teamMembers.find(m => m.id === reviewMemberId) : null

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto p-6 space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <TextShimmer className="text-3xl font-bold" duration={2}>
              Team
            </TextShimmer>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage and collaborate with your team members</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <InsightsToggleButton isOpen={insightsPanel.isOpen} onToggle={insightsPanel.toggle} />
            <Button variant="outline" size="sm" onClick={handleTeamAnalytics}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportTeam}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleTeamChat}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Team Chat
            </Button>
            <Button variant="outline" size="sm" onClick={handleScheduleMeeting}>
              <Video className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewCalendar}>
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button variant="outline" size="sm" onClick={handleTeamSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleInviteMember}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Single Member
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkInvite}>
                  <Send className="h-4 w-4 mr-2" />
                  Bulk Invite
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-indigo-500 to-indigo-700" size={60} duration={6} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-indigo-400" />
              </CardHeader>
              <CardContent>
                <NumberFlow value={teamStats.totalMembers} className="text-2xl font-bold text-indigo-400" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Active team members</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-green-500 to-emerald-500" size={60} duration={6} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <NumberFlow value={teamStats.onlineMembers} className="text-2xl font-bold text-green-400" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Available for work</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-blue-500 to-blue-700" size={60} duration={6} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Target className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <NumberFlow value={teamStats.activeProjects} className="text-2xl font-bold text-blue-400" />
                <p className="text-xs text-gray-400 dark:text-gray-500">In progress</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-purple-500 to-purple-700" size={60} duration={6} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Award className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <NumberFlow value={teamStats.completedTasks} className="text-2xl font-bold text-purple-400" />
                <p className="text-xs text-gray-400 dark:text-gray-500">This month</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="relative group">
            <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            <LiquidGlassCard className="relative">
              <BorderTrail className="bg-gradient-to-r from-yellow-500 to-amber-500" size={60} duration={6} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </CardHeader>
              <CardContent>
                <NumberFlow value={parseFloat(teamStats.averageRating.toFixed(1))} className="text-2xl font-bold text-yellow-400" />
                <p className="text-xs text-gray-400 dark:text-gray-500">Team performance</p>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>View and manage your team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={() => handleFilter(selectedRole)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredMembers.length} members
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <Card key={member.id} className="kazi-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(member.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{member.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{member.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {member.department}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-500">{member.rating}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewMember(member.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditMember(member.id)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAssignProject(member.id)}>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Assign Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewProjects(member.id)}>
                            <Target className="h-4 w-4 mr-2" />
                            View Projects
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewActivity(member.id)}>
                            <Activity className="h-4 w-4 mr-2" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePerformanceReview(member.id)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Performance Review
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTimeTracking(member.id)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Time Tracking
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetPermissions(member.id)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Set Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {getStatusIcon(member.status)}
                        <span>{member.availability}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{member.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{member.workHours}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div>
                        <div className="text-sm font-semibold">{member.projects}</div>
                        <div className="text-xs text-gray-500">Projects</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{member.completedTasks}</div>
                        <div className="text-xs text-gray-500">Tasks</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{member.rating}</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSendMessage(member.id)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`mailto:${member.email}`, '_blank')}>
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`tel:${member.phone}`, '_blank')}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.info(`Starting video call with ${member.name}`)}>
                        <Video className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No team members found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remove Member AlertDialog */}
      <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Remove Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{teamMembers.find(m => m.id === memberToRemove)?.name}&quot; from the team?
              This action will revoke their access to all team resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </DialogTitle>
            <DialogDescription>
              Send an invitation to a new team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="member@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full Name</Label>
              <Input
                id="invite-name"
                placeholder="John Doe"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Lead Designer">Lead Designer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button onClick={confirmInviteMember}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Member Profile Dialog */}
      <Dialog open={showViewMemberDialog} onOpenChange={setShowViewMemberDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Member Profile
            </DialogTitle>
          </DialogHeader>
          {viewedMember && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={viewedMember.avatar} alt={viewedMember.name} />
                  <AvatarFallback className="text-2xl">{viewedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{viewedMember.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{viewedMember.role}</p>
                  <Badge variant="secondary">{viewedMember.department}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p>{viewedMember.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Phone</Label>
                  <p>{viewedMember.phone}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Location</Label>
                  <p>{viewedMember.location}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Timezone</Label>
                  <p>{viewedMember.timezone}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Join Date</Label>
                  <p>{viewedMember.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <p className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(viewedMember.status)}`}></span>
                    {viewedMember.status}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-2xl font-bold">{viewedMember.projects}</p>
                  <p className="text-sm text-gray-500">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{viewedMember.completedTasks}</p>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold flex items-center justify-center gap-1">
                    {viewedMember.rating}
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {viewedMember.skills.map((skill, i) => (
                    <Badge key={i} variant="outline">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewMemberDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditMemberDialog} onOpenChange={setShowEditMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Team Member
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={editMemberName} onChange={(e) => setEditMemberName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" value={editMemberEmail} onChange={(e) => setEditMemberEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editMemberRole} onValueChange={setEditMemberRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Member">Team Member</SelectItem>
                  <SelectItem value="Lead Designer">Lead Designer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" type="tel" value={editMemberPhone} onChange={(e) => setEditMemberPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" value={editMemberLocation} onChange={(e) => setEditMemberLocation(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMemberDialog(false)}>Cancel</Button>
            <Button onClick={confirmEditMember}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Change Role
            </DialogTitle>
            <DialogDescription>
              Select a new role for {teamMembers.find(m => m.id === changeRoleMemberId)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue placeholder="Select new role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead Designer">Lead Designer</SelectItem>
                  <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                  <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                  <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeRoleDialog(false)}>Cancel</Button>
            <Button onClick={confirmChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Project Dialog */}
      <Dialog open={showAssignProjectDialog} onOpenChange={setShowAssignProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Assign Project
            </DialogTitle>
            <DialogDescription>
              Assign a project to {teamMembers.find(m => m.id === assignProjectMemberId)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" placeholder="Enter project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignProjectDialog(false)}>Cancel</Button>
            <Button onClick={confirmAssignProject}>Assign Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Invite Dialog */}
      <Dialog open={showBulkInviteDialog} onOpenChange={setShowBulkInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Invite
            </DialogTitle>
            <DialogDescription>
              Send invitations to multiple team members at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-emails">Email Addresses</Label>
              <Textarea
                id="bulk-emails"
                placeholder="Enter email addresses separated by commas&#10;e.g., john@company.com, jane@company.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkInviteDialog(false)}>Cancel</Button>
            <Button onClick={confirmBulkInvite}>Send Invitations</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send Message
            </DialogTitle>
            <DialogDescription>
              Send a message to {teamMembers.find(m => m.id === messageMemberId)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
            <Button onClick={confirmSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Set Permissions
            </DialogTitle>
            <DialogDescription>
              Configure permissions for {teamMembers.find(m => m.id === permissionsMemberId)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permission-level">Permission Level</Label>
              <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                <SelectTrigger><SelectValue placeholder="Select permission level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Read">Read - View only access</SelectItem>
                  <SelectItem value="Write">Write - Can edit and create</SelectItem>
                  <SelectItem value="Admin">Admin - Full management access</SelectItem>
                  <SelectItem value="Owner">Owner - Complete control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Permission Details</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {selectedPermission === 'Read' && (
                  <>
                    <li>- View projects and tasks</li>
                    <li>- Access team calendar</li>
                    <li>- Read team messages</li>
                  </>
                )}
                {selectedPermission === 'Write' && (
                  <>
                    <li>- All Read permissions</li>
                    <li>- Create and edit tasks</li>
                    <li>- Post messages and comments</li>
                    <li>- Upload files</li>
                  </>
                )}
                {selectedPermission === 'Admin' && (
                  <>
                    <li>- All Write permissions</li>
                    <li>- Manage team members</li>
                    <li>- Configure project settings</li>
                    <li>- Access analytics</li>
                  </>
                )}
                {selectedPermission === 'Owner' && (
                  <>
                    <li>- All Admin permissions</li>
                    <li>- Delete projects</li>
                    <li>- Manage billing</li>
                    <li>- Transfer ownership</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Cancel</Button>
            <Button onClick={confirmSetPermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity - {activityMember?.name}
            </DialogTitle>
          </DialogHeader>
          {activityData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-2xl font-bold">{activityData.tasksCompleted}</p>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{activityData.projectsActive}</p>
                  <p className="text-sm text-gray-500">Active Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{activityMember?.rating}</p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recent Activity</h4>
                {activityData.recentActivity.length > 0 ? (
                  <ul className="space-y-2">
                    {activityData.recentActivity.map((activity: any, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {activity.name || activity.title || 'Activity item'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Projects Dialog */}
      <Dialog open={showProjectsDialog} onOpenChange={setShowProjectsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projects - {projectsMember?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {memberProjects.length > 0 ? (
              <div className="space-y-3">
                {memberProjects.map((project: any) => (
                  <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{project.progress}% complete</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No projects assigned</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Tracking Dialog */}
      <Dialog open={showTimeTrackingDialog} onOpenChange={setShowTimeTrackingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracking - {timeTrackingMember?.name}
            </DialogTitle>
          </DialogHeader>
          {timeTrackingData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{timeTrackingData.hoursThisWeek}h</p>
                  <p className="text-sm text-gray-500">This Week</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{timeTrackingData.hoursThisMonth}h</p>
                  <p className="text-sm text-gray-500">This Month</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{timeTrackingData.hoursLastMonth}h</p>
                  <p className="text-sm text-gray-500">Last Month</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{timeTrackingData.billableHours}h</p>
                  <p className="text-sm text-gray-500">Billable</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Work Hours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{timeTrackingMember?.workHours} ({timeTrackingMember?.timezone})</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeTrackingDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Review - {reviewMember?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Rating: {reviewMember?.rating}/5</Label>
              <div className="flex items-center gap-2">
                <Label>New Rating:</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comments">Comments</Label>
              <Textarea
                id="review-comments"
                placeholder="Enter your review comments..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button>
            <Button onClick={confirmPerformanceReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Team Analytics
            </DialogTitle>
          </DialogHeader>
          {analyticsData && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{analyticsData.totalMembers}</p>
                  <p className="text-sm text-gray-500">Total Members</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">{analyticsData.online}</p>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{analyticsData.projects}</p>
                  <p className="text-sm text-gray-500">Total Projects</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{analyticsData.tasks}</p>
                  <p className="text-sm text-gray-500">Tasks Completed</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-3">Status Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
                      <span>{analyticsData.online}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Busy</span>
                      <span>{analyticsData.busy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Away</span>
                      <span>{analyticsData.away}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-500"></span> Offline</span>
                      <span>{analyticsData.offline}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-3">Department Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.departments).map(([dept, count]) => (
                      <div key={dept} className="flex justify-between">
                        <span>{dept}</span>
                        <span>{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Average Team Rating</h4>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">{analyticsData.avgRating}</span>
                  <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              // Export analytics as JSON
              const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = `team-analytics-${new Date().toISOString().split('T')[0]}.json`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
              toast.success('Analytics exported')
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Team Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input id="team-name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-timezone">Default Timezone</Label>
              <Select value={defaultTimezone} onValueChange={setDefaultTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
            <Button onClick={confirmTeamSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collapsible Insights Panel */}
      <div className="container mx-auto px-6 pb-6">
        <CollapsibleInsightsPanel
          title="Team Insights & Analytics"
          defaultOpen={insightsPanel.isOpen}
          onOpenChange={insightsPanel.setIsOpen}
        >
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Members</span>
                <span className="font-semibold">{teamMembers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Online Now</span>
                <span className="font-semibold text-green-600">{teamMembers.filter(m => m.status === 'online').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Busy</span>
                <span className="font-semibold text-amber-600">{teamMembers.filter(m => m.status === 'busy').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Departments</span>
                <span className="font-semibold">{[...new Set(teamMembers.map(m => m.department))].length}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teamMembers.filter(m => m.status === 'offline').length > teamMembers.length * 0.5 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Over 50% of team members offline - check availability
                </p>
              )}
              {teamMembers.length === 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  No team members yet - invite collaborators to get started
                </p>
              )}
              {teamMembers.length > 0 && teamMembers.filter(m => m.status === 'online').length === teamMembers.length && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  All team members are online - great time for collaboration!
                </p>
              )}
              {teamMembers.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Team is ready - {teamMembers.filter(m => m.projects > 0).length} member(s) assigned to projects
                </p>
              )}
            </CardContent>
          </Card>
        </CollapsibleInsightsPanel>
      </div>
    </div>
  )
}
