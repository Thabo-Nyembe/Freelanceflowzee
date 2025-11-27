'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserPlus,
  Crown,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  MessageSquare,
  Settings,
  Shield,
  Target,
  Award,
  Activity,
  Mail,
  Phone,
  MapPin,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import type { UserRole, RolePermission, UserPermission } from '@/lib/team-management-queries'

const logger = createFeatureLogger('TeamManagement')

// Transform database role to UI member format
interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  location: string
  avatar: string
  status: 'online' | 'offline' | 'busy' | 'away'
  level: string
  joinDate: string
  completedProjects: number
  activeProjects: number
  rating: number
  skills: string[]
  currentWorkload: number
  availability: string
  lastActive: string
  performance: {
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
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Supabase data state
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([])
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

  // A+++ LOAD TEAM MANAGEMENT DATA FROM SUPABASE
  useEffect(() => {
    const loadTeamManagementData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading team management data from Supabase', { action: 'load_start' })

        // Dynamic imports for code splitting
        const [
          { getUserRoles },
          { getRolePermissions },
          { getUserPermissions },
          { createClient }
        ] = await Promise.all([
          import('@/lib/team-management-queries'),
          import('@/lib/team-management-queries'),
          import('@/lib/team-management-queries'),
          import('@/lib/supabase/client')
        ])

        // Get current user ID
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('User not authenticated')
        }

        // Parallel data loading
        const [rolesResult, permissionsResult, userPermsResult] = await Promise.all([
          getUserRoles(user.id),
          getRolePermissions(user.id),
          getUserPermissions(user.id)
        ])

        if (rolesResult.error) {
          logger.error('Failed to load user roles', { error: rolesResult.error })
          throw new Error('Failed to load user roles')
        }

        if (permissionsResult.error) {
          logger.error('Failed to load role permissions', { error: permissionsResult.error })
          throw new Error('Failed to load role permissions')
        }

        if (userPermsResult.error) {
          logger.error('Failed to load user permissions', { error: userPermsResult.error })
          throw new Error('Failed to load user permissions')
        }

        setUserRoles(rolesResult.data || [])
        setRolePermissions(permissionsResult.data || [])
        setUserPermissions(userPermsResult.data || [])

        // Transform roles to team members display format
        // Since we don't have team_members table yet, we'll use user_roles as mock data
        const mockMembers: TeamMember[] = rolesResult.data?.slice(0, 4).map((role, index) => ({
          id: role.id,
          name: `Team Member ${index + 1}`,
          role: role.role_name,
          email: `member${index + 1}@kazi.com`,
          phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          location: ['New York, USA', 'San Francisco, USA', 'Austin, USA', 'Seattle, USA'][index % 4],
          avatar: `/avatars/member${index + 1}.jpg`,
          status: ['online', 'busy', 'away', 'offline'][Math.floor(Math.random() * 4)] as any,
          level: role.role_name === 'owner' ? 'lead' : role.role_name === 'admin' ? 'senior' : 'mid',
          joinDate: new Date(role.created_at).toISOString().split('T')[0],
          completedProjects: Math.floor(Math.random() * 50),
          activeProjects: Math.floor(Math.random() * 10),
          rating: 4.5 + Math.random() * 0.5,
          skills: ['Leadership', 'Project Management', 'Communication'],
          currentWorkload: Math.floor(Math.random() * 40) + 60,
          availability: 'full-time',
          lastActive: `${Math.floor(Math.random() * 60)} minutes ago`,
          performance: {
            tasksCompleted: Math.floor(Math.random() * 200) + 50,
            onTimeDelivery: Math.floor(Math.random() * 10) + 90,
            clientSatisfaction: 4.5 + Math.random() * 0.5,
            teamCollaboration: 4.5 + Math.random() * 0.5
          }
        })) || []

        setTeamMembers(mockMembers)

        // Calculate stats
        const stats: TeamStats = {
          totalMembers: rolesResult.data?.length || 0,
          activeMembers: rolesResult.data?.filter(r => r.is_active).length || 0,
          avgRating: mockMembers.length > 0
            ? mockMembers.reduce((sum, m) => sum + m.rating, 0) / mockMembers.length
            : 0,
          totalProjects: mockMembers.reduce((sum, m) => sum + m.completedProjects + m.activeProjects, 0),
          completedProjects: mockMembers.reduce((sum, m) => sum + m.completedProjects, 0),
          avgWorkload: mockMembers.length > 0
            ? mockMembers.reduce((sum, m) => sum + m.currentWorkload, 0) / mockMembers.length
            : 0,
          teamEfficiency: 94
        }
        setTeamStats(stats)

        logger.info('Team management data loaded successfully', {
          roles_count: rolesResult.data?.length || 0,
          permissions_count: permissionsResult.data?.length || 0,
          user_permissions_count: userPermsResult.data?.length || 0,
          members_count: mockMembers.length
        })

        setIsLoading(false)
        announce('Team management loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load team management'
        logger.error('Failed to load team management', { error: err })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading team management', 'assertive')
      }
    }

    loadTeamManagementData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A+++ CRUD HANDLERS
  const handleAddMember = async () => {
    try {
      logger.info('Adding new team member', { action: 'add_member' })

      const { createUserRole, createClient } = await import('@/lib/team-management-queries')
      const supabase = (await import('@/lib/supabase/client')).createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create a new member role
      const newRole = await createUserRole(user.id, {
        role_name: 'member',
        role_description: 'New team member',
        can_invite_users: false,
        can_manage_team: false,
        can_manage_projects: false
      })

      if (newRole.error) {
        throw new Error('Failed to create member role')
      }

      logger.info('Team member added successfully', { role_id: newRole.data?.id })
      announce('Team member added successfully', 'polite')

      // Reload data
      window.location.reload()
    } catch (err) {
      logger.error('Failed to add team member', { error: err })
      announce('Failed to add team member', 'assertive')
    }
  }

  const handleExportData = async () => {
    try {
      logger.info('Exporting team management data', { action: 'export' })

      const exportData = {
        roles: userRoles,
        permissions: rolePermissions,
        userPermissions: userPermissions,
        teamStats,
        exportedAt: new Date().toISOString()
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
      URL.revokeObjectURL(url)

      logger.info('Team management data exported successfully', {
        roles_count: userRoles.length,
        file_name: a.download
      })
      announce('Team data exported successfully', 'polite')
    } catch (err) {
      logger.error('Failed to export team data', { error: err })
      announce('Failed to export team data', 'assertive')
    }
  }

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
      case 'senior': return { color: 'bg-blue-100 text-blue-800', icon: Star }
      case 'mid': return { color: 'bg-green-100 text-green-800', icon: Target }
      case 'junior': return { color: 'bg-gray-100 text-gray-800', icon: Users }
      default: return { color: 'bg-gray-100 text-gray-800', icon: Users }
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
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

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
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
                  <p className="text-3xl font-bold text-gray-900">{teamStats.avgRating}</p>
                  <p className="text-sm text-yellow-600">⭐ Excellent</p>
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
                  <p className="text-3xl font-bold text-gray-900">{teamStats.avgWorkload}%</p>
                  <p className="text-sm text-orange-600">Optimal range</p>
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
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
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
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
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
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMembers.map((member) => {
                const levelBadge = getLevelBadge(member.level)
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
                                {member.level}
                              </Badge>
                              <Badge variant="outline" className="bg-white">
                                ⭐ {member.rating}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Completed Projects</p>
                          <p className="font-semibold text-lg">{member.completedProjects}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Active Projects</p>
                          <p className="font-semibold text-lg">{member.activeProjects}</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Current Workload</span>
                          <span className="font-medium">{member.currentWorkload}%</span>
                        </div>
                        <Progress value={member.currentWorkload} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-1">
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
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{member.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
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
                          <span className="font-medium">{member.performance.tasksCompleted}</span>
                        </div>
                        <Progress value={Math.min(member.performance.tasksCompleted / 3, 100)} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>On-time Delivery</span>
                          <span className="font-medium">{member.performance.onTimeDelivery}%</span>
                        </div>
                        <Progress value={member.performance.onTimeDelivery} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Client Satisfaction</span>
                          <span className="font-medium">⭐ {member.performance.clientSatisfaction}</span>
                        </div>
                        <Progress value={member.performance.clientSatisfaction * 20} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Team Collaboration</span>
                          <span className="font-medium">⭐ {member.performance.teamCollaboration}</span>
                        </div>
                        <Progress value={member.performance.teamCollaboration * 20} className="h-2" />
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
    </div>
  )
}