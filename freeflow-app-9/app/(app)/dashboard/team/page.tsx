"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  const [searchTerm, setSearchTerm] = useState<any>('')
  const [selectedRole, setSelectedRole] = useState<any>('all')
  const [viewMode, setViewMode] = useState<any>('grid')

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

  const getStatusColor = (status: unknown) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: unknown) => {
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Team</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage and collaborate with your team members</p>
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
        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-primary">{teamStats.totalMembers}</div>
            <p className="text-xs text-gray-500">Active team members</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{teamStats.onlineMembers}</div>
            <p className="text-xs text-gray-500">Available for work</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{teamStats.activeProjects}</div>
            <p className="text-xs text-gray-500">In progress</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{teamStats.completedTasks}</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{teamStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-gray-500">Team performance</p>
          </CardContent>
        </Card>
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
  )
}
