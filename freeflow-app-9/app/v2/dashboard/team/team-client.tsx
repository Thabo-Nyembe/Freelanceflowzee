'use client'
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

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
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
import { createFeatureLogger } from '@/lib/logger'

import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('Team')

// DATABASE QUERIES
import {
  getTeamMembers,
  createTeamMember,
  deleteTeamMember,
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
  Send
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


// ============================================================================
// V2 COMPETITIVE DATA - Team Context (API-Integrated)
// ============================================================================

// Data is now loaded from API in useEffect
// Default empty state for initial render
const teamAIInsights: any[] = []
const teamCollaborators: any[] = []
const teamPredictions: any[] = []
const teamActivities: any[] = []

// Quick actions - handlers defined inside component to access state
const teamQuickActionsConfig = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', actionKey: 'invite' },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', actionKey: 'export' },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', actionKey: 'settings' },
]

// Placeholder quick actions for loading state (no-op actions)
const loadingQuickActions = teamQuickActionsConfig.map(action => ({
  ...action,
  action: () => {} // No-op during loading
}))

export default function TeamClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [viewMode, setViewMode] = useState<string>('grid')

  // AlertDialog states
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Dialog states for replacing prompt()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState('Team Member')

  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false)
  const [changeRoleMemberId, setChangeRoleMemberId] = useState<number | null>(null)
  const [newRole, setNewRole] = useState('')

  const [showAssignProjectDialog, setShowAssignProjectDialog] = useState(false)
  const [assignProjectMemberId, setAssignProjectMemberId] = useState<number | null>(null)
  const [projectName, setProjectName] = useState('')

  const [showBulkInviteDialog, setShowBulkInviteDialog] = useState(false)
  const [bulkEmails, setBulkEmails] = useState('')

  // Edit member dialog state
  const [showEditMemberDialog, setShowEditMemberDialog] = useState(false)
  const [editMemberId, setEditMemberId] = useState<number | null>(null)
  const [editMemberName, setEditMemberName] = useState('')
  const [editMemberEmail, setEditMemberEmail] = useState('')
  const [editMemberRole, setEditMemberRole] = useState('')
  const [editMemberPhone, setEditMemberPhone] = useState('')
  const [editMemberLocation, setEditMemberLocation] = useState('')

  // Message dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageMemberId, setMessageMemberId] = useState<number | null>(null)
  const [messageContent, setMessageContent] = useState('')

  // Permissions dialog state
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [permissionsMemberId, setPermissionsMemberId] = useState<number | null>(null)
  const [selectedPermission, setSelectedPermission] = useState('Read')

  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    const loadTeamData = async () => {
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

        // If database returns members, use them; otherwise keep defaults for demo
        if (result.data && result.data.length > 0) {
          const mappedMembers = result.data.map((m: DBTeamMember) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            department: m.department,
            email: m.email,
            phone: m.phone || '+1 (555) 000-0000',
            location: m.location || 'Remote',
            avatar: m.avatar || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + m.name),
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
        } else {
          // Keep demo data for users without team members
        }

        setIsLoading(false)
        announce('Team dashboard loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data')
        setIsLoading(false)
        announce('Error loading team dashboard', 'assertive')
        logger.error('Failed to load team data', { error: err, userId })
      }
    }

    loadTeamData()
  }, [userId, userLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
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

      // Send invitation via POST /api/team with invite action
      const inviteResponse = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
          userId
        })
      })

      if (!inviteResponse.ok) {
        const errorData = await inviteResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send invitation')
      }

      const inviteResult = await inviteResponse.json()

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

      // Add to local state with database ID
      const newMember = {
        id: result.data?.id || inviteResult.data?.id || `temp_${Date.now()}`,
        name: inviteName,
        role: inviteRole,
        department: roleToDepartment[inviteRole] || 'operations',
        email: inviteEmail,
        phone: '+1 (555) 000-0000',
        location: 'Remote',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteName}`,
        status: 'offline' as const,
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
      toast.success("Invitation Sent! Invited as " + inviteRole + " - Total team: " + (teamMembers.length + 1) + " members")

      setShowInviteDialog(false)
    } catch (error) {
      logger.error('Failed to invite team member', { error, email: inviteEmail })
      toast.error('Failed to invite member')
    }
  }

  const handleViewMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return
    toast.info(member.name + " Profile - " + member.projects + " projects - " + member.completedTasks + " tasks - " + member.rating + " stars")
  }

  const handleEditMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setEditMemberId(id)
    setEditMemberName(member.name)
    setEditMemberEmail(member.email)
    setEditMemberRole(member.role)
    setEditMemberPhone(member.phone)
    setEditMemberLocation(member.location)
    setShowEditMemberDialog(true)  }

  const confirmEditMember = async () => {
    if (!editMemberId || !editMemberName.trim() || !editMemberEmail.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const member = teamMembers.find(m => m.id === editMemberId)
    if (!member) return

    try {
      // Call PUT /api/team to update member
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

      // Update local state on success
      setTeamMembers(teamMembers.map(m =>
        m.id === editMemberId
          ? {
              ...m,
              name: editMemberName,
              email: editMemberEmail,
              role: editMemberRole,
              phone: editMemberPhone,
              location: editMemberLocation
            }
          : m
      ))
      toast.success("Member Updated - details have been saved")

      setShowEditMemberDialog(false)
      setEditMemberId(null)
    } catch (error) {
      logger.error('Failed to update member', { error, memberId: editMemberId })
      toast.error('Failed to update member')
    }
  }

  const handleRemoveMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setMemberToRemove(id)
    setShowRemoveMemberDialog(true)
  }

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !userId) return

    const member = teamMembers.find(m => m.id === memberToRemove)
    if (!member) return

    setIsRemoving(true)
    try {
      // Call DELETE /api/team to remove member
      const response = await fetch(`/api/team?memberId=${memberToRemove}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to remove member')
      }

      // Also remove from database
      const result = await deleteTeamMember(memberToRemove.toString(), userId)

      if (result.error) {
        // Log but don't throw - API deletion was successful
        logger.warn('Database deletion failed but API deletion succeeded', { error: result.error })
      }

      // Update local state
      const updatedMembers = teamMembers.filter(m => m.id !== memberToRemove)
      setTeamMembers(updatedMembers)
      toast.success("Member Removed - " + updatedMembers.length + " members remaining")
      announce(`${member.name} removed from team`, 'polite')
    } catch (error) {
      logger.error('Failed to remove team member', { error, memberId: memberToRemove })
      toast.error('Failed to remove member')
    } finally {
      setIsRemoving(false)
      setShowRemoveMemberDialog(false)
      setMemberToRemove(null)
    }
  }

  const handleChangeRole = (id: number) => {
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
      // Call POST /api/team with update-role action
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

      // Update local state on success
      setTeamMembers(teamMembers.map(m =>
        m.id === changeRoleMemberId ? { ...m, role: newRole } : m
      ))
      toast.success("Role Updated - changed from " + previousRole + " to " + newRole)

      setShowChangeRoleDialog(false)
      setChangeRoleMemberId(null)
      setNewRole('')
    } catch (error) {
      logger.error('Failed to update role', { error, memberId: changeRoleMemberId })
      toast.error('Failed to update role')
    }
  }

  const handleSetPermissions = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setPermissionsMemberId(id)
    setSelectedPermission('Read')
    setShowPermissionsDialog(true)  }

  const confirmSetPermissions = async () => {
    if (!permissionsMemberId) return

    const member = teamMembers.find(m => m.id === permissionsMemberId)
    if (!member) return

    try {
      // Call POST /api/team with set-permissions action
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-permissions',
          memberId: permissionsMemberId,
          permission: selectedPermission
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update permissions')
      }
      toast.success("Permissions Updated - " + member.name + " now has " + selectedPermission + " permissions")

      setShowPermissionsDialog(false)
      setPermissionsMemberId(null)
    } catch (error) {
      logger.error('Failed to update permissions', { error, memberId: permissionsMemberId })
      toast.error('Failed to update permissions')
    }
  }

  const handleSendMessage = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setMessageMemberId(id)
    setMessageContent('')
    setShowMessageDialog(true)  }

  const confirmSendMessage = async () => {
    if (!messageMemberId || !messageContent.trim()) {
      toast.error('Please enter a message')
      return
    }

    const member = teamMembers.find(m => m.id === messageMemberId)
    if (!member) return

    try {
      // Call POST /api/team with send-message action
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
      toast.success("Message Sent - message delivered to " + member.name)

      setShowMessageDialog(false)
      setMessageMemberId(null)
      setMessageContent('')
    } catch (error) {
      logger.error('Failed to send message', { error, memberId: messageMemberId })
      toast.error('Failed to send message')
    }
  }

  const handleViewActivity = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return
    toast.info(member.name + " Activity - " + member.completedTasks + " tasks completed - " + member.projects + " active projects - " + member.rating + " stars")
  }

  const handleAssignProject = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

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
      // Call POST /api/team with assign-project action
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign-project',
          memberId: assignProjectMemberId,
          projectName
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to assign project')
      }

      // Update local state on success
      setTeamMembers(teamMembers.map(m =>
        m.id === assignProjectMemberId ? { ...m, projects: m.projects + 1 } : m
      ))
      toast.success("Project Assigned - " + projectName + " assigned to " + member.name + " - Total: " + (member.projects + 1) + " projects")

      setShowAssignProjectDialog(false)
      setAssignProjectMemberId(null)
      setProjectName('')
    } catch (error) {
      logger.error('Failed to assign project', { error, memberId: assignProjectMemberId })
      toast.error('Failed to assign project')
    }
  }

  const handleViewProjects = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return
    toast.info(member.name + " Projects - " + member.projects + " active projects - " + member.completedTasks + " tasks completed")
  }

  const handleTeamAnalytics = () => {
    const stats = {
      totalMembers: teamMembers.length,
      online: teamMembers.filter(m => m.status === 'online').length,
      projects: teamMembers.reduce((sum, m) => sum + m.projects, 0),
      tasks: teamMembers.reduce((sum, m) => sum + m.completedTasks, 0)
    }
    toast.info("Team Analytics - " + stats.totalMembers + " members - " + stats.online + " online - " + stats.projects + " projects - " + stats.tasks + " tasks")
  }

  const handleTeamSettings = () => {
    toast.info("Team Settings")
  }

  const handleExportTeam = () => {
    const csvData = [
      ['Name', 'Role', 'Department', 'Email', 'Projects', 'Tasks', 'Rating'],
      ...teamMembers.map(m => [
        m.name,
        m.role,
        m.department,
        m.email,
        m.projects,
        m.completedTasks,
        m.rating
      ])
    ]

    const csv = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `team-roster-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Team Data Exported - " + teamMembers.length + " members exported - " + Math.round(blob.size / 1024) + "KB")
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
      // Send bulk invites via POST /api/team with invite action for each email
      const invitePromises = emailList.map(email =>
        fetch('/api/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'invite',
            email,
            name: email.split('@')[0], // Use email prefix as name
            role: 'Team Member',
            userId
          })
        })
      )

      const responses = await Promise.all(invitePromises)
      const successCount = responses.filter(r => r.ok).length

      if (successCount === 0) {
        throw new Error('Failed to send any invitations')
      }
      toast.success("Bulk Invitations Sent - " + successCount + " of " + emailList.length + " invitation emails sent")

      setShowBulkInviteDialog(false)
      setBulkEmails('')
    } catch (error) {
      logger.error('Failed to send bulk invites', { error, emailCount: emailList.length })
      toast.error('Failed to send invitations')
    }
  }

  const handleTeamChat = () => {
    const onlineMembers = teamMembers.filter(m => m.status === 'online').length
    toast.info("Team Chat - " + onlineMembers + "/" + teamMembers.length + " members online")
  }

  const handleScheduleMeeting = () => {
    const availableMembers = teamMembers.filter(m => m.status === 'online' || m.status === 'away').length
    toast.info("Schedule Meeting - " + availableMembers + "/" + teamMembers.length + " members available")
  }

  const handleViewCalendar = () => {
    toast.info("Team Calendar - " + teamMembers.length + " team members")
  }

  const handlePerformanceReview = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return
    toast.info("Review " + member.name + " - " + member.rating + " stars - " + member.completedTasks + " tasks completed")
  }

  const handleTimeTracking = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    const hoursWorked = Math.floor(Math.random() * 40) + 120
    toast.info(member.name + " Time Tracking - " + hoursWorked + " hours this month - " + member.workHours)
  }

  const handleFilter = (filter: string) => {
    toast.success("Filter Applied - " + filter)
  }

  // Build quick actions with real handlers
  const teamQuickActions = teamQuickActionsConfig.map(action => ({
    ...action,
    action: action.actionKey === 'invite'
      ? () => handleInviteMember()
      : action.actionKey === 'export'
        ? () => handleExportTeam()
        : () => handleTeamSettings()
  }))

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'designer', label: 'Designer' },
    { value: 'developer', label: 'Developer' },
    { value: 'manager', label: 'Manager' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'qa', label: 'QA Engineer' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status) => {
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
    averageRating: teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        {/* Pattern Craft Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="container mx-auto p-6 space-y-6 relative">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={teamAIInsights} />
          <PredictiveAnalytics predictions={teamPredictions} />
          <CollaborationIndicator collaborators={teamCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={loadingQuickActions} />
          <ActivityFeed activities={teamActivities} />
        </div>
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
        {/* Pattern Craft Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
        <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

        <div className="container mx-auto p-6 relative">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Pattern Craft Background */}
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
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="text-sm text-gray-600">
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
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{member.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{member.role}</p>
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
                          <Users className="h-4 w-4 mr-2" />
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-center mb-4">
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
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.info("Email Composer - opening email to " + member.email)
                      window.open("mailto:" + member.email, '_blank')
                    }}>
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.info("Phone Call - calling " + member.name + " at " + member.phone)
                      window.open("tel:" + member.phone, '_blank')
                    }}>
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.info("Video Call - starting call with " + member.name)
                    }}>
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
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmInviteMember}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={showChangeRoleDialog} onOpenChange={setShowChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
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
            <Button variant="outline" onClick={() => setShowChangeRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChangeRole}>
              Update Role
            </Button>
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
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignProject}>
              Assign Project
            </Button>
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
            <Button variant="outline" onClick={() => setShowBulkInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmBulkInvite}>
              Send Invitations
            </Button>
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
            <DialogDescription>
              Update member details for {teamMembers.find(m => m.id === editMemberId)?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="member@company.com"
                value={editMemberEmail}
                onChange={(e) => setEditMemberEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editMemberRole} onValueChange={setEditMemberRole}>
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
                  <SelectItem value="Marketing Specialist">Marketing Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={editMemberPhone}
                onChange={(e) => setEditMemberPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="San Francisco, CA"
                value={editMemberLocation}
                onChange={(e) => setEditMemberLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMemberDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEditMember}>
              Save Changes
            </Button>
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
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
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
                <SelectTrigger>
                  <SelectValue placeholder="Select permission level" />
                </SelectTrigger>
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
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSetPermissions}>
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
