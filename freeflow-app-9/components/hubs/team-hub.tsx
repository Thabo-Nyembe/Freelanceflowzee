"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users,
  UserPlus,
  Crown,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Settings,
  Mail,
  Phone,
  MapPin,
  Star,
  Activity,
  Plus,
  Search,
  Filter,
  Shield,
  User
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'developer' | 'designer' | 'client'
  avatar_url?: string
  status: 'active' | 'inactive' | 'pending'
  skills: string[]
  projects: string[]
  joined_date: string
  last_active: string
  hourly_rate?: number
}

interface TeamHubProps {
  projects: any[]
  userId: string
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  developer: 'bg-green-100 text-green-800',
  designer: 'bg-pink-100 text-pink-800',
  client: 'bg-orange-100 text-orange-800',
}

const roleIcons = {
  admin: Crown,
  manager: Shield,
  developer: User,
  designer: Star,
  client: User,
}

export function TeamHub({ projects, userId }: TeamHubProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Mock data for demo
  useEffect(() => {
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'John Developer',
        email: 'john@example.com',
        role: 'developer',
        status: 'active',
        skills: ['React', 'TypeScript', 'Design'],
        projects: ['proj-1', 'proj-2'],
        joined_date: '2024-01-01',
        last_active: '2024-02-15T10:30:00Z',
        hourly_rate: 85
      },
      {
        id: '2',
        name: 'Sarah Designer',
        email: 'sarah@example.com',
        role: 'designer',
        status: 'active',
        skills: ['UI/UX', 'Figma', 'Prototyping'],
        projects: ['proj-1', 'proj-3'],
        joined_date: '2024-01-15',
        last_active: '2024-02-15T09:15:00Z',
        hourly_rate: 65
      },
      {
        id: '3',
        name: 'Mike Manager',
        email: 'mike@example.com',
        role: 'manager',
        status: 'active',
        skills: ['Backend', 'Node.js', 'Database'],
        projects: ['proj-1', 'proj-2', 'proj-3'],
        joined_date: '2023-12-01',
        last_active: '2024-02-15T11:00:00Z',
        hourly_rate: 95
      },
      {
        id: '4',
        name: 'Emily Client',
        email: 'emily@techcorp.com',
        role: 'client',
        status: 'active',
        skills: [],
        projects: ['proj-1'],
        joined_date: '2024-02-01',
        last_active: '2024-02-14T16:45:00Z',
        hourly_rate: undefined
      }
    ]
    setTeamMembers(mockTeamMembers)
  }, [])

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Team statistics
  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    pending: teamMembers.filter(m => m.status === 'pending').length,
    avgRate: teamMembers.reduce((sum, m) => sum + (m.hourly_rate || 0), 0) / teamMembers.length || 0
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'collaborator': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
  }

  const TeamMemberCard = ({ member }: { member: TeamMember }) => {
    const RoleIcon = roleIcons[member.role]
    
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.avatar_url} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{member.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getRoleColor(member.role)}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </Badge>
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skills */}
          <div>
            <p className="text-sm font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{member.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Projects and Rate */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Projects</p>
              <p className="font-medium">{member.projects.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rate</p>
              <p className="font-medium">
                {member.hourly_rate ? `$${member.hourly_rate}/hr` : 'Not set'}
              </p>
            </div>
          </div>

          {/* Activity */}
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{formatDate(member.joined_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Active</span>
              <span>{getTimeAgo(member.last_active)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              Team Hub
            </CardTitle>
            <CardDescription>
              Manage team members, roles, and collaboration
            </CardDescription>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input 
                    id="invite-email" 
                    type="email" 
                    placeholder="colleague@example.com" 
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invite-projects">Projects (Optional)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to projects" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                  <Textarea 
                    id="invite-message" 
                    placeholder="Welcome to our team! Looking forward to working with you."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsInviteDialogOpen(false)}>
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Team Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Members</p>
                      <p className="text-2xl font-bold">{teamStats.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold text-green-600">{teamStats.active}</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{teamStats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500/60" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rate</p>
                      <p className="text-2xl font-bold">${teamStats.avgRate.toFixed(0)}/hr</p>
                    </div>
                    <Star className="h-8 w-8 text-blue-500/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Button className="flex-col h-auto py-4 gap-2">
                    <UserPlus className="h-6 w-6" />
                    <span>Invite Member</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Schedule Meeting</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Team Report</span>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-4 gap-2">
                    <Settings className="h-6 w-6" />
                    <span>Team Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Team Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'Alex Johnson', action: 'completed project milestone', time: '2 hours ago' },
                    { user: 'Sarah Chen', action: 'uploaded design files', time: '4 hours ago' },
                    { user: 'Mike Rodriguez', action: 'joined the team', time: '1 day ago' },
                    { user: 'Alex Johnson', action: 'created new project', time: '2 days ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="client">Client</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Team Members Grid */}
            {filteredMembers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">No team members found</h3>
                <p className="text-muted-foreground mb-4">
                  {teamStats.total === 0 
                    ? "Start building your team by inviting members." 
                    : "Try adjusting your search or filters."}
                </p>
                {!searchQuery && roleFilter === 'all' && (
                  <div className="mt-6">
                    <Button onClick={() => setIsInviteDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Member
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Team Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Detailed activity timeline coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Team configuration options coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 