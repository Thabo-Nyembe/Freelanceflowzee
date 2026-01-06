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

// A+++ UTILITIES
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
  XCircle
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


// ============================================================================
// V2 COMPETITIVE MOCK DATA - Team Context
// ============================================================================

const teamAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const teamCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const teamPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const teamActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const teamQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 800)),
    { loading: 'Adding new team member...', success: 'Team member added successfully', error: 'Failed to add member' }
  ) },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 1200)),
    { loading: 'Exporting team data...', success: 'Team data exported successfully', error: 'Export failed' }
  ) },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => toast.promise(
    new Promise(resolve => setTimeout(resolve, 500)),
    { loading: 'Opening team settings...', success: 'Settings loaded', error: 'Failed to load settings' }
  ) },
]

export default function TeamClient() {
  // A+++ STATE MANAGEMENT
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

  const [teamMembers, setTeamMembers] = useState<any[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Lead Designer',
      department: 'Design',
      email: 'sarah@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      status: 'online',
      joinDate: '2023-01-15',
      projects: 12,
      completedTasks: 156,
      rating: 4.9,
      skills: ['UI/UX', 'Figma', 'Sketch'],
      availability: 'Available',
      workHours: '9:00 AM - 6:00 PM PST',
      timezone: 'PST'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Frontend Developer',
      department: 'Development',
      email: 'mike@company.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      status: 'busy',
      joinDate: '2023-03-20',
      projects: 8,
      completedTasks: 203,
      rating: 4.8,
      skills: ['React', 'TypeScript', 'Next.js'],
      availability: 'Busy until 3 PM',
      workHours: '8:00 AM - 5:00 PM EST',
      timezone: 'EST'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'Project Manager',
      department: 'Management',
      email: 'emma@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      status: 'away',
      joinDate: '2022-11-10',
      projects: 15,
      completedTasks: 89,
      rating: 4.7,
      skills: ['Project Management', 'Agile', 'Scrum'],
      availability: 'In Meeting',
      workHours: '9:00 AM - 6:00 PM CST',
      timezone: 'CST'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Backend Developer',
      department: 'Development',
      email: 'david@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      status: 'offline',
      joinDate: '2023-05-01',
      projects: 6,
      completedTasks: 134,
      rating: 4.6,
      skills: ['Node.js', 'Python', 'PostgreSQL'],
      availability: 'Offline',
      workHours: '10:00 AM - 7:00 PM PST',
      timezone: 'PST'
    },
    {
      id: 5,
      name: 'Lisa Brown',
      role: 'Marketing Specialist',
      department: 'Marketing',
      email: 'lisa@company.com',
      phone: '+1 (555) 567-8901',
      location: 'Miami, FL',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      status: 'online',
      joinDate: '2023-07-15',
      projects: 10,
      completedTasks: 67,
      rating: 4.5,
      skills: ['Content Marketing', 'SEO', 'Analytics'],
      availability: 'Available',
      workHours: '9:00 AM - 6:00 PM EST',
      timezone: 'EST'
    },
    {
      id: 6,
      name: 'Alex Rivera',
      role: 'QA Engineer',
      department: 'Quality Assurance',
      email: 'alex@company.com',
      phone: '+1 (555) 678-9012',
      location: 'Denver, CO',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      status: 'online',
      joinDate: '2023-09-01',
      projects: 7,
      completedTasks: 98,
      rating: 4.8,
      skills: ['Manual Testing', 'Automation', 'Selenium'],
      availability: 'Available',
      workHours: '8:00 AM - 5:00 PM MST',
      timezone: 'MST'
    }
  ])

  // A+++ LOAD TEAM DATA FROM DATABASE
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
          logger.info('Team members loaded from database', { count: mappedMembers.length })
        } else {
          // Keep demo data for users without team members
          logger.info('Using demo team data - no members in database', { userId })
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
        throw new Error(result.error.message || 'Failed to invite member')
      }

      // Add to local state with database ID
      const newMember = {
        id: result.data?.id || `temp_${Date.now()}`,
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

      logger.info('Team member invited and saved to database', {
        memberId: newMember.id,
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        totalMembers: teamMembers.length + 1
      })

      toast.success('Invitation Sent!', {
        description: `Invited ${inviteName} as ${inviteRole} - Total team: ${teamMembers.length + 1} members`
      })

      setShowInviteDialog(false)
    } catch (error) {
      logger.error('Failed to invite team member', { error, email: inviteEmail })
      toast.error('Failed to invite member', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleViewMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    logger.info('Viewing member profile', {
      memberId: id,
      memberName: member.name,
      role: member.role,
      projects: member.projects,
      completedTasks: member.completedTasks
    })

    toast.info(`${member.name} Profile`, {
      description: `${member.role} • ${member.projects} projects • ${member.completedTasks} tasks • ${member.rating}⭐`
    })
  }

  const handleEditMember = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    logger.info('Edit member dialog opened', {
      memberId: id,
      memberName: member.name,
      currentRole: member.role
    })

    toast.info('Edit Team Member', {
      description: `Editing ${member.name} - ${member.role}`
    })
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
      // Remove member from database
      const result = await deleteTeamMember(memberToRemove.toString(), userId)

      if (result.error) {
        throw new Error(result.error.message || 'Failed to remove member')
      }

      // Update local state
      const updatedMembers = teamMembers.filter(m => m.id !== memberToRemove)
      setTeamMembers(updatedMembers)

      logger.info('Team member removed from database', {
        memberId: memberToRemove,
        memberName: member.name,
        role: member.role,
        remainingMembers: updatedMembers.length
      })

      toast.success('Member Removed', {
        description: `${member.name} removed from team - ${updatedMembers.length} members remaining`
      })
      announce(`${member.name} removed from team`, 'polite')
    } catch (error) {
      logger.error('Failed to remove team member', { error, memberId: memberToRemove })
      toast.error('Failed to remove member', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
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

  const confirmChangeRole = () => {
    if (!changeRoleMemberId || !newRole) return

    const member = teamMembers.find(m => m.id === changeRoleMemberId)
    if (!member) return

    const previousRole = member.role
    setTeamMembers(teamMembers.map(m =>
      m.id === changeRoleMemberId ? { ...m, role: newRole } : m
    ))

    logger.info('Member role changed', {
      memberId: changeRoleMemberId,
      memberName: member.name,
      previousRole,
      newRole
    })

    toast.success('Role Updated', {
      description: `${member.name} role changed from ${previousRole} to ${newRole}`
    })

    setShowChangeRoleDialog(false)
    setChangeRoleMemberId(null)
    setNewRole('')
  }

  const handleSetPermissions = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    const permissions = ['Read', 'Write', 'Admin', 'Owner']

    logger.info('Permissions dialog opened', {
      memberId: id,
      memberName: member.name,
      role: member.role
    })

    toast.info('Set Permissions', {
      description: `Configure ${permissions.length} permission levels for ${member.name}`
    })
  }

  const handleSendMessage = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    logger.info('Message composer opened', {
      memberId: id,
      memberName: member.name,
      email: member.email,
      status: member.status
    })

    toast.info('Send Message', {
      description: `Composing message to ${member.name} (${member.email})`
    })
  }

  const handleViewActivity = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    logger.info('Viewing member activity', {
      memberId: id,
      memberName: member.name,
      projects: member.projects,
      completedTasks: member.completedTasks,
      rating: member.rating
    })

    toast.info(`${member.name} Activity`, {
      description: `${member.completedTasks} tasks completed • ${member.projects} active projects • ${member.rating}⭐ rating`
    })
  }

  const handleAssignProject = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    setAssignProjectMemberId(id)
    setProjectName('')
    setShowAssignProjectDialog(true)
  }

  const confirmAssignProject = () => {
    if (!assignProjectMemberId || !projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    const member = teamMembers.find(m => m.id === assignProjectMemberId)
    if (!member) return

    setTeamMembers(teamMembers.map(m =>
      m.id === assignProjectMemberId ? { ...m, projects: m.projects + 1 } : m
    ))

    logger.info('Project assigned to member', {
      memberId: assignProjectMemberId,
      memberName: member.name,
      projectName,
      newProjectCount: member.projects + 1
    })

    toast.success('Project Assigned', {
      description: `${projectName} assigned to ${member.name} - Total: ${member.projects + 1} projects`
    })

    setShowAssignProjectDialog(false)
    setAssignProjectMemberId(null)
    setProjectName('')
  }

  const handleViewProjects = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    logger.info('Viewing member projects', {
      memberId: id,
      memberName: member.name,
      activeProjects: member.projects
    })

    toast.info(`${member.name}'s Projects`, {
      description: `${member.projects} active projects • ${member.completedTasks} tasks completed`
    })
  }

  const handleTeamAnalytics = () => {
    const stats = {
      totalMembers: teamMembers.length,
      online: teamMembers.filter(m => m.status === 'online').length,
      projects: teamMembers.reduce((sum, m) => sum + m.projects, 0),
      tasks: teamMembers.reduce((sum, m) => sum + m.completedTasks, 0)
    }

    logger.info('Team analytics accessed', stats)

    toast.info('Team Analytics', {
      description: `${stats.totalMembers} members • ${stats.online} online • ${stats.projects} projects • ${stats.tasks} tasks`
    })
  }

  const handleTeamSettings = () => {
    logger.info('Team settings accessed', {
      totalMembers: teamMembers.length
    })

    toast.info('Team Settings', {
      description: 'Configure team preferences, roles, and permissions'
    })
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

    logger.info('Team data exported', {
      totalMembers: teamMembers.length,
      fileSize: blob.size
    })

    toast.success('Team Data Exported', {
      description: `${teamMembers.length} members exported - ${Math.round(blob.size / 1024)}KB`
    })
  }

  const handleBulkInvite = () => {
    setBulkEmails('')
    setShowBulkInviteDialog(true)
  }

  const confirmBulkInvite = () => {
    if (!bulkEmails.trim()) {
      toast.error('Please enter at least one email address')
      return
    }

    const emailList = bulkEmails.split(',').map(e => e.trim()).filter(Boolean)

    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses')
      return
    }

    logger.info('Bulk invite initiated', {
      emailCount: emailList.length,
      emails: emailList
    })

    toast.success('Bulk Invitations Sent', {
      description: `${emailList.length} invitation emails sent`
    })

    setShowBulkInviteDialog(false)
    setBulkEmails('')
  }

  const handleTeamChat = () => {
    const onlineMembers = teamMembers.filter(m => m.status === 'online').length

    logger.info('Team chat opened', {
      totalMembers: teamMembers.length,
      onlineMembers
    })

    toast.info('Team Chat', {
      description: `${onlineMembers}/${teamMembers.length} members online`
    })
  }

  const handleScheduleMeeting = () => {
    const availableMembers = teamMembers.filter(m => m.status === 'online' || m.status === 'away').length

    logger.info('Meeting scheduler opened', {
      totalMembers: teamMembers.length,
      availableMembers
    })

    toast.info('Schedule Meeting', {
      description: `${availableMembers}/${teamMembers.length} members available`
    })
  }

  const handleViewCalendar = () => {
    logger.info('Team calendar accessed', {
      totalMembers: teamMembers.length
    })

    toast.info('Team Calendar', {
      description: `View schedules for ${teamMembers.length} team members`
    })
  }

  const handlePerformanceReview = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    logger.info('Performance review opened', {
      memberId: id,
      memberName: member.name,
      rating: member.rating,
      completedTasks: member.completedTasks
    })

    toast.info(`Review ${member.name}`, {
      description: `Current rating: ${member.rating}⭐ • ${member.completedTasks} tasks completed`
    })
  }

  const handleTimeTracking = (id: number) => {
    const member = teamMembers.find(m => m.id === id)
    if (!member) return

    const hoursWorked = Math.floor(Math.random() * 40) + 120

    logger.info('Time tracking viewed', {
      memberId: id,
      memberName: member.name,
      hoursWorked
    })

    toast.info(`${member.name} Time Tracking`, {
      description: `${hoursWorked} hours this month • ${member.workHours}`
    })
  }

  const handleFilter = (filter: string) => {
    logger.info('Filter applied', {
      filterType: filter,
      totalMembers: teamMembers.length
    })

    toast.success('Filter Applied', {
      description: `Filtering team by: ${filter}`
    })
  }

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

  // A+++ LOADING STATE
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
          <QuickActionsToolbar actions={teamQuickActions} />
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

  // A+++ ERROR STATE
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
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
              <Button variant="outline" size="sm">
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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
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
    </div>
  )
}
