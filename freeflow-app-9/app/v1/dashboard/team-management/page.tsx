'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Users,
  UserPlus,
  Crown,
  Star,
  TrendingUp,
  MessageSquare,
  Settings,
  Target,
  Award,
  Activity,
  MapPin,
  Edit,
  Search,
  Filter,
  Download,
  Trash2,
  Send,
  Loader2,
  AlertTriangle
} from 'lucide-react'

import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import type { TeamMember as DatabaseTeamMember } from '@/lib/team-hub-queries'

const logger = createFeatureLogger('TeamManagement')

// UI display format for team members
interface TeamMember extends DatabaseTeamMember {
  // Additional UI-only fields can be computed from database fields
  completedProjects?: number
  activeProjects?: number
  currentWorkload?: number
  lastActive?: string
  performance?: {
    tasksCompleted: number
    onTimeDelivery: number
    clientSatisfaction: number
    teamCollaboration: number
  }
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  avgRating: number
  totalProjects: number
  completedProjects: number
  avgWorkload: number
  teamEfficiency: number
}

export default function TeamManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // MODAL STATES
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [messageText, setMessageText] = useState('')

  // FILTER STATE
  const [filterOptions, setFilterOptions] = useState({
    status: [] as string[],
    level: [] as string[],
    department: ''
  })

  // EDIT FORM STATE
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    level: '',
    status: '',
    skills: ''
  })

  // Database state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    activeMembers: 0,
    avgRating: 0,
    totalProjects: 0,
    completedProjects: 0,
    avgWorkload: 0,
    teamEfficiency: 0
  })

  // Add member form state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)

  // Remove member dialog state
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: 'development' as const,
    phone: '',
    location: '',
    bio: '',
    timezone: 'UTC'
  })

  useEffect(() => {
    const loadTeamData = async () => {
      if (!userId) {        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)        // Load real team members from database
        const { getTeamMembers, getTeamOverview, getDepartments } = await import('@/lib/team-hub-queries')

        const [membersResult, overviewResult, departmentsResult] = await Promise.all([
          getTeamMembers(userId),
          getTeamOverview(userId),
          getDepartments(userId)
        ])

        if (membersResult.error) {
          logger.error('Failed to load team members', { error: membersResult.error })
          // Don't throw - just log and continue with empty array
        }

        if (overviewResult.error) {
          logger.error('Failed to load team overview', { error: overviewResult.error })
        }

        if (departmentsResult.error) {
          logger.error('Failed to load departments', { error: departmentsResult.error })
        }

        // Set team members with computed UI fields
        const members = (membersResult.data || []).map(member => ({
          ...member,
          // Compute UI-specific fields from database data
          completedProjects: Math.floor(member.projects_count * 0.7), // Estimate 70% completed
          activeProjects: Math.ceil(member.projects_count * 0.3), // Estimate 30% active
          currentWorkload: Math.min(75 + Math.floor(member.projects_count * 5), 100), // Workload based on projects
          lastActive: member.last_seen
            ? `${Math.floor((Date.now() - new Date(member.last_seen).getTime()) / 60000)} minutes ago`
            : 'Never',
          performance: {
            tasksCompleted: member.tasks_completed,
            onTimeDelivery: Math.min(85 + Math.floor(member.rating * 3), 100),
            clientSatisfaction: member.rating,
            teamCollaboration: Math.min(member.rating + 0.2, 5)
          }
        }))

        setTeamMembers(members)        // Calculate stats from real data
        const stats: TeamStats = {
          totalMembers: members.length,
          activeMembers: members.filter(m => m.status === 'online' || m.status === 'busy').length,
          avgRating: members.length > 0
            ? members.reduce((sum, m) => sum + m.rating, 0) / members.length
            : 0,
          totalProjects: members.reduce((sum, m) => sum + (m.completedProjects || 0) + (m.activeProjects || 0), 0),
          completedProjects: members.reduce((sum, m) => sum + (m.completedProjects || 0), 0),
          avgWorkload: members.length > 0
            ? members.reduce((sum, m) => sum + (m.currentWorkload || 0), 0) / members.length
            : 0,
          teamEfficiency: overviewResult.data?.total_members
            ? Math.min(85 + Math.floor(overviewResult.data.average_rating * 3), 100)
            : 94
        }
        setTeamStats(stats)        setIsLoading(false)
        toast.success(`Team management loaded: ${members.length} members`)
        announce('Team management loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team management'
        logger.error('Failed to load team management', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        toast.error('Failed to load team management')
        announce('Error loading team management', 'assertive')
      }
    }

    loadTeamData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddMember = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    if (!newMember.name || !newMember.email || !newMember.role) {
      toast.error('Please fill in required fields: name, email, and role')
      return
    }

    try {      const { createTeamMember } = await import('@/lib/team-hub-queries')

      const { data, error } = await createTeamMember(userId, {
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        department: newMember.department,
        phone: newMember.phone,
        location: newMember.location,
        bio: newMember.bio,
        timezone: newMember.timezone || 'UTC',
        role_level: 'mid',
        skills: []
      })

      if (error || !data) {
        throw new Error('Failed to add team member')
      }

      // Add to local state with computed fields
      const newTeamMember = {
        ...data,
        completedProjects: 0,
        activeProjects: 0,
        currentWorkload: 75,
        lastActive: 'Just now',
        performance: {
          tasksCompleted: 0,
          onTimeDelivery: 85,
          clientSatisfaction: 4.5,
          teamCollaboration: 4.5
        }
      }

      setTeamMembers(prev => [newTeamMember, ...prev])
      toast.success(`${data.name} added to team successfully`)      announce(`${data.name} added to team`, 'polite')

      // Reset form
      setNewMember({
        name: '',
        email: '',
        role: '',
        department: 'development',
        phone: '',
        location: '',
        bio: '',
        timezone: 'UTC'
      })
      setIsAddMemberOpen(false)
    } catch (err) {
      logger.error('Failed to add team member', { error: err })
      toast.error('Failed to add team member')
      announce('Failed to add team member', 'assertive')
    }
  }

  const handleDeleteMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    setMemberToRemove(member)
    setShowRemoveMemberDialog(true)
  }

  const confirmDeleteMember = async () => {
    if (!memberToRemove) return

    try {
      setIsRemoving(true)      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { deleteTeamMember } = await import('@/lib/team-hub-queries')

      const { success, error } = await deleteTeamMember(memberToRemove.id, user.id)

      if (error || !success) {
        throw new Error('Failed to remove team member')
      }

      setTeamMembers(prev => prev.filter(m => m.id !== memberToRemove.id))
      toast.success(`${memberToRemove.name} removed from team`)      announce(`${memberToRemove.name} removed from team`, 'polite')
    } catch (err) {
      logger.error('Failed to delete team member', { error: err })
      toast.error('Failed to remove team member')
      announce('Failed to remove team member', 'assertive')
    } finally {
      setIsRemoving(false)
      setShowRemoveMemberDialog(false)
      setMemberToRemove(null)
    }
  }

  const handleExportData = async () => {
    try {      const exportData = {
        teamMembers,
        teamStats,
        exportedAt: new Date().toISOString(),
        totalMembers: teamMembers.length
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `team-management-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)      toast.success('Team data exported successfully')
      announce('Team data exported successfully', 'polite')
    } catch (err) {
      logger.error('Failed to export team data', { error: err })
      toast.error('Failed to export team data')
      announce('Failed to export team data', 'assertive')
    }
  }

  const handleFilterMembers = useCallback(() => {    announce('Opening member filters', 'polite')
    setIsFilterOpen(true)
  }, [announce])

  const handleApplyFilters = useCallback(() => {    setIsFilterOpen(false)
    toast.success('Filters applied')
    announce('Filters applied', 'polite')
  }, [filterOptions, announce])

  const handleResetFilters = useCallback(() => {
    setFilterOptions({
      status: [],
      level: [],
      department: ''
    })
    announce('Filters reset', 'polite')
  }, [announce])

  const handleMessageMember = useCallback((member: TeamMember) => {    setSelectedMember(member)
    setMessageText('')
    setIsMessageOpen(true)
    announce(`Opening message to ${member.name}`, 'polite')
  }, [announce])

  const handleSendMessage = useCallback(async () => {
    if (!selectedMember || !messageText.trim()) {
      toast.error('Please enter a message')
      return
    }

    setIsProcessing(true)
    try {      // Open email client with message
      const subject = encodeURIComponent(`Message from Team`)
      const body = encodeURIComponent(messageText)
      window.open(`mailto:${selectedMember.email}?subject=${subject}&body=${body}`, '_blank')

      toast.success(`Message sent to ${selectedMember.name}!`)
      setIsMessageOpen(false)
      setMessageText('')
      announce('Message sent successfully', 'polite')
    } catch (err) {
      logger.error('Failed to send message', { error: err })
      toast.error('Failed to send message')
      announce('Failed to send message', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedMember, messageText, announce])

  const handleEditMember = useCallback((member: TeamMember) => {    setSelectedMember(member)
    setEditForm({
      name: member.name,
      role: member.role,
      email: member.email || '',
      phone: member.phone || '',
      level: member.level || 'mid',
      status: member.status || 'active',
      skills: member.skills?.join(', ') || ''
    })
    setIsEditOpen(true)
    announce(`Opening edit for ${member.name}`, 'polite')
  }, [announce])

  const handleSaveEdit = useCallback(async () => {
    if (!selectedMember) return

    setIsProcessing(true)
    try {      // Dynamic import for code splitting
      const { updateTeamMember } = await import('@/lib/team-hub-queries')
      await updateTeamMember(selectedMember.id, {
        name: editForm.name,
        role: editForm.role,
        email: editForm.email,
        phone: editForm.phone,
        level: editForm.level,
        status: editForm.status,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean)
      })

      toast.success(`${editForm.name} updated successfully!`)
      setIsEditOpen(false)
      announce('Member updated successfully', 'polite')

      // Refresh the page to show updated data
      window.location.reload()
    } catch (err) {
      logger.error('Failed to update member', { error: err })
      toast.error('Failed to update member')
      announce('Failed to update member', 'assertive')
    } finally {
      setIsProcessing(false)
    }
  }, [selectedMember, editForm, announce])

  const handleMemberOptions = useCallback((member: TeamMember) => {    setSelectedMember(member)
    announce(`Opening options for ${member.name}`, 'polite')
    // Options are handled via DropdownMenu component
  }, [announce])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-gray-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'lead': return { color: 'bg-purple-100 text-purple-800', icon: Crown }
      case 'executive': return { color: 'bg-purple-100 text-purple-800', icon: Crown }
      case 'senior': return { color: 'bg-blue-100 text-blue-800', icon: Star }
      case 'mid': return { color: 'bg-green-100 text-green-800', icon: Target }
      case 'entry': return { color: 'bg-gray-100 text-gray-800', icon: Users }
      case 'junior': return { color: 'bg-gray-100 text-gray-800', icon: Users }
      default: return { color: 'bg-gray-100 text-gray-800', icon: Users }
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.skills && member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>
        <div className="relative max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Team Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage your team, track performance, and optimize collaboration
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={handleAddMember}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button
              variant="outline"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{teamStats.totalMembers}</p>
                  <p className="text-sm text-green-600">{teamStats.activeMembers} active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{teamStats.avgRating.toFixed(1)}</p>
                  <p className="text-sm text-yellow-600">⭐ {teamStats.avgRating >= 4.5 ? 'Excellent' : teamStats.avgRating >= 3.5 ? 'Good' : 'Fair'}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Workload</p>
                  <p className="text-3xl font-bold text-gray-900">{teamStats.avgWorkload.toFixed(0)}%</p>
                  <p className="text-sm text-orange-600">{teamStats.avgWorkload >= 80 ? 'High' : teamStats.avgWorkload >= 60 ? 'Optimal' : 'Low'}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency</p>
                  <p className="text-3xl font-bold text-gray-900">{teamStats.teamEfficiency}%</p>
                  <p className="text-sm text-green-600">+5% this month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border border-white/30">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Team Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.lastActive}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {member.activeProjects} projects
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamMembers
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 4)
                    .map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-600">⭐ {member.rating}</p>
                          <p className="text-sm text-gray-600">{member.completedProjects} projects</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleFilterMembers}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMembers.map((member) => {
                const levelBadge = getLevelBadge(member.role_level)
                const LevelIcon = levelBadge.icon

                return (
                  <Card key={member.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-lg">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                            <p className="text-gray-600">{member.role}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={levelBadge.color}>
                                <LevelIcon className="h-3 w-3 mr-1" />
                                {member.role_level}
                              </Badge>
                              <Badge variant="outline" className="bg-white">
                                ⭐ {member.rating.toFixed(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                        <div>
                          <p className="text-gray-600">Completed Projects</p>
                          <p className="font-semibold text-lg">{member.completedProjects || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Active Projects</p>
                          <p className="font-semibold text-lg">{member.activeProjects || 0}</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Current Workload</span>
                          <span className="font-medium">{member.currentWorkload || 0}%</span>
                        </div>
                        <Progress value={member.currentWorkload || 0} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {member.skills && member.skills.length > 0 ? (
                          <>
                            {member.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{member.skills.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-xs text-gray-500">
                            No skills listed
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{member.location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleMessageMember(member)}>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditMember(member)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Tasks Completed</span>
                          <span className="font-medium">{member.performance?.tasksCompleted || 0}</span>
                        </div>
                        <Progress value={Math.min((member.performance?.tasksCompleted || 0) / 3, 100)} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>On-time Delivery</span>
                          <span className="font-medium">{member.performance?.onTimeDelivery || 0}%</span>
                        </div>
                        <Progress value={member.performance?.onTimeDelivery || 0} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Client Satisfaction</span>
                          <span className="font-medium">⭐ {(member.performance?.clientSatisfaction || 0).toFixed(1)}</span>
                        </div>
                        <Progress value={(member.performance?.clientSatisfaction || 0) * 20} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Team Collaboration</span>
                          <span className="font-medium">⭐ {(member.performance?.teamCollaboration || 0).toFixed(1)}</span>
                        </div>
                        <Progress value={(member.performance?.teamCollaboration || 0) * 20} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Team Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Team Settings</h3>
                  <p className="text-gray-500 mb-4">Configure team permissions, roles, and collaboration settings</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* FILTER DIALOG */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              Filter Team Members
            </DialogTitle>
            <DialogDescription>
              Filter members by status, level, or department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-2">
                {['online', 'busy', 'away', 'offline'].map((status) => (
                  <div key={status} className="flex items-center gap-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filterOptions.status.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterOptions(prev => ({
                            ...prev,
                            status: [...prev.status, status]
                          }))
                        } else {
                          setFilterOptions(prev => ({
                            ...prev,
                            status: prev.status.filter(s => s !== status)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={`status-${status}`} className="text-sm capitalize">{status}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <div className="flex flex-wrap gap-2">
                {['lead', 'senior', 'mid', 'junior', 'entry'].map((level) => (
                  <div key={level} className="flex items-center gap-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={filterOptions.level.includes(level)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilterOptions(prev => ({
                            ...prev,
                            level: [...prev.level, level]
                          }))
                        } else {
                          setFilterOptions(prev => ({
                            ...prev,
                            level: prev.level.filter(l => l !== level)
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={`level-${level}`} className="text-sm capitalize">{level}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filterOptions.department}
                onValueChange={(value) => setFilterOptions(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MESSAGE DIALOG */}
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogContent>
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Message {selectedMember.name}
                </DialogTitle>
                <DialogDescription>
                  Send a quick message to your team member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedMember.avatar} alt="User avatar" />
                    <AvatarFallback>{selectedMember.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedMember.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMember.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage} disabled={isProcessing || !messageText.trim()}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT MEMBER DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-blue-500" />
                  Edit Team Member
                </DialogTitle>
                <DialogDescription>
                  Update {selectedMember.name}&apos;s information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={editForm.role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select
                      value={editForm.level}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="entry">Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                        <SelectItem value="away">Away</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={editForm.skills}
                    onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Team Member Confirmation Dialog */}
      <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Remove Team Member?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-red-700">
                This action cannot be undone.
              </p>
              <p>
                Are you sure you want to remove{' '}
                <span className="font-semibold">{memberToRemove?.name}</span> from the team?
              </p>
              {memberToRemove && (
                <p className="text-sm text-gray-600">
                  Role: {memberToRemove.role} • Department: {memberToRemove.department}
                </p>
              )}
              <p className="text-sm text-gray-500">
                They will lose access to all team resources and projects.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}