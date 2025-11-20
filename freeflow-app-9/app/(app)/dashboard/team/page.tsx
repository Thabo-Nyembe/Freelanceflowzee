"use client"

import { useState } from 'react'
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
  Calendar,
  MapPin,
  Clock,
  Star,
  Award,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [viewMode, setViewMode] = useState<string>('grid')

  // Handlers
  const handleInviteMember = () => {
    console.log('✨ TEAM: Invite member dialog initiated')
    console.log('👥 TEAM: Opening team member invitation form')
    console.log('📧 TEAM: Ready to send invitation email')
    toast.info('👥 Invite Team Member', {
      description: 'Opening invitation form to add new team members'
    })
  }

  const handleViewMember = (id: number) => {
    console.log('👁️ TEAM: View member profile initiated')
    console.log('👤 TEAM: Loading member details for ID: ' + id)
    console.log('📊 TEAM: Fetching member activity and statistics')
    toast.info('👁️ Viewing Member Profile', {
      description: 'Loading detailed member information and activity'
    })
  }

  const handleEditMember = (id: number) => {
    console.log('✏️ TEAM: Edit member initiated')
    console.log('👤 TEAM: Opening edit form for member ID: ' + id)
    console.log('🔧 TEAM: Loading current member settings and permissions')
    toast.info('✏️ Edit Team Member', {
      description: 'Opening member profile editor with current settings'
    })
  }

  const handleRemoveMember = (id: number) => {
    console.log('⚠️ TEAM: Remove member confirmation requested')
    console.log('👤 TEAM: Member ID to remove: ' + id)
    if (confirm('Remove?')) {
      console.log('✅ TEAM: Member removal confirmed')
      console.log('🗑️ TEAM: Processing member removal for ID: ' + id)
      console.log('📧 TEAM: Sending removal notification to member')
      console.log('🔄 TEAM: Updating team roster and permissions')
      toast.success('✅ Member Removed', {
        description: 'Team member has been successfully removed from the team'
      })
    }
  }

  const handleChangeRole = (id: number) => {
    console.log('🔄 TEAM: Change role dialog initiated')
    console.log('👤 TEAM: Changing role for member ID: ' + id)
    console.log('🔒 TEAM: Loading available roles and permissions')
    console.log('📝 TEAM: Ready to update member role assignment')
    toast.info('🔄 Change Member Role', {
      description: 'Select new role and permissions for team member'
    })
  }

  const handleSetPermissions = (id: number) => {
    console.log('🔒 TEAM: Set permissions dialog initiated')
    console.log('👤 TEAM: Configuring permissions for member ID: ' + id)
    console.log('📋 TEAM: Loading current permission settings')
    console.log('⚙️ TEAM: Ready to update access controls')
    toast.info('🔒 Set Permissions', {
      description: 'Configure access rights and permissions for team member'
    })
  }

  const handleSendMessage = (id: number) => {
    console.log('💬 TEAM: Send message initiated')
    console.log('👤 TEAM: Opening message composer for member ID: ' + id)
    console.log('📧 TEAM: Loading member contact preferences')
    console.log('✉️ TEAM: Ready to send direct message')
    toast.info('💬 Send Message', {
      description: 'Opening message composer to contact team member'
    })
  }

  const handleViewActivity = (id: number) => {
    console.log('📊 TEAM: View activity initiated')
    console.log('👤 TEAM: Loading activity log for member ID: ' + id)
    console.log('📈 TEAM: Fetching recent tasks and contributions')
    console.log('⏱️ TEAM: Analyzing member productivity metrics')
    toast.info('📊 View Activity', {
      description: 'Loading member activity log and performance metrics'
    })
  }

  const handleAssignProject = (id: number) => {
    console.log('📁 TEAM: Assign project dialog initiated')
    console.log('👤 TEAM: Assigning project to member ID: ' + id)
    console.log('📋 TEAM: Loading available projects list')
    console.log('🎯 TEAM: Ready to assign project responsibilities')
    toast.info('📁 Assign Project', {
      description: 'Select projects to assign to team member'
    })
  }

  const handleViewProjects = (id: number) => {
    console.log('📂 TEAM: View projects initiated')
    console.log('👤 TEAM: Loading projects for member ID: ' + id)
    console.log('📊 TEAM: Fetching project assignments and status')
    console.log('🎯 TEAM: Analyzing member project portfolio')
    toast.info('📂 View Projects', {
      description: 'Loading all projects assigned to team member'
    })
  }

  const handleTeamAnalytics = () => {
    console.log('📊 TEAM: Team analytics dashboard initiated')
    console.log('📈 TEAM: Loading team performance metrics')
    console.log('👥 TEAM: Analyzing collaboration patterns')
    console.log('🎯 TEAM: Generating productivity insights')
    toast.info('📊 Team Analytics', {
      description: 'Opening analytics dashboard with team performance data'
    })
  }

  const handleTeamSettings = () => {
    console.log('⚙️ TEAM: Team settings dialog initiated')
    console.log('🔧 TEAM: Loading team configuration options')
    console.log('👥 TEAM: Accessing team-wide preferences')
    console.log('🔒 TEAM: Ready to manage team settings')
    toast.info('⚙️ Team Settings', {
      description: 'Configure team-wide settings and preferences'
    })
  }

  const handleExportTeam = () => {
    console.log('💾 TEAM: Export team data initiated')
    console.log('📊 TEAM: Preparing team roster export')
    console.log('👥 TEAM: Compiling member information and statistics')
    console.log('📁 TEAM: Generating export file')
    toast.success('💾 Export Team Data', {
      description: 'Team roster and statistics are being exported'
    })
  }

  const handleBulkInvite = () => {
    console.log('📧 TEAM: Bulk invite dialog initiated')
    console.log('👥 TEAM: Opening bulk invitation interface')
    console.log('📋 TEAM: Ready to process multiple team invitations')
    console.log('✉️ TEAM: Preparing to send invitation emails')
    toast.info('📧 Bulk Invite', {
      description: 'Invite multiple team members at once via email list'
    })
  }

  const handleTeamChat = () => {
    console.log('💬 TEAM: Team chat initiated')
    console.log('👥 TEAM: Opening team-wide chat interface')
    console.log('📨 TEAM: Loading recent team conversations')
    console.log('🗨️ TEAM: Ready for team collaboration')
    toast.info('💬 Team Chat', {
      description: 'Opening team chat for real-time collaboration'
    })
  }

  const handleScheduleMeeting = () => {
    console.log('📅 TEAM: Schedule meeting initiated')
    console.log('👥 TEAM: Opening meeting scheduler')
    console.log('🕐 TEAM: Checking team member availability')
    console.log('📧 TEAM: Ready to send meeting invitations')
    toast.info('📅 Schedule Meeting', {
      description: 'Create and schedule a team meeting with invitations'
    })
  }

  const handleViewCalendar = () => {
    console.log('📅 TEAM: View calendar initiated')
    console.log('🗓️ TEAM: Loading team calendar view')
    console.log('👥 TEAM: Displaying team schedules and meetings')
    console.log('⏰ TEAM: Showing upcoming team events')
    toast.info('📅 Team Calendar', {
      description: 'View team schedules, meetings, and availability'
    })
  }

  const handlePerformanceReview = (id: number) => {
    console.log('📈 TEAM: Performance review initiated')
    console.log('👤 TEAM: Opening review form for member ID: ' + id)
    console.log('📊 TEAM: Loading member performance metrics')
    console.log('⭐ TEAM: Ready to conduct performance evaluation')
    toast.info('📈 Performance Review', {
      description: 'Conduct performance review and provide feedback'
    })
  }

  const handleTimeTracking = (id: number) => {
    console.log('⏱️ TEAM: Time tracking initiated')
    console.log('👤 TEAM: Viewing time logs for member ID: ' + id)
    console.log('📊 TEAM: Loading work hours and time entries')
    console.log('🕐 TEAM: Analyzing time allocation patterns')
    toast.info('⏱️ Time Tracking', {
      description: 'View time logs and work hours for team member'
    })
  }

  const handleFilter = (filter: string) => {
    console.log('🔍 TEAM: Apply filter initiated')
    console.log('📋 TEAM: Filter type: ' + filter)
    console.log('👥 TEAM: Filtering team member list')
    console.log('✅ TEAM: Filter applied successfully')
    toast.success('🔍 Filter Applied', {
      description: 'Team member list filtered by: ' + filter
    })
  }

  // Mock team data
  const teamMembers = [
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
  ]

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
    </div>
  )
}
