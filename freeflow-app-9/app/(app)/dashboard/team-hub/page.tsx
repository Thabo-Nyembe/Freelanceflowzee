"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Zap
} from 'lucide-react'

export default function TeamHubPage() {
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<any>('overview')
  const [searchTerm, setSearchTerm] = useState<any>('')

  // Mock team data
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Lead Designer',
      department: 'Design',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      status: 'online',
      email: 'sarah@company.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      joinDate: '2023-01-15',
      projects: 12,
      tasksCompleted: 156,
      rating: 4.9,
      skills: ['UI/UX Design', 'Figma', 'Sketch', 'Adobe Creative Suite'],
      currentProjects: ['Brand Identity', 'Website Redesign'],
      availability: 'Available'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Frontend Developer',
      department: 'Development',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      status: 'busy',
      email: 'mike@company.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      joinDate: '2023-03-20',
      projects: 8,
      tasksCompleted: 203,
      rating: 4.8,
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      currentProjects: ['E-commerce Platform', 'Mobile App'],
      availability: 'Busy until 3 PM'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'Project Manager',
      department: 'Management',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      status: 'away',
      email: 'emma@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      joinDate: '2022-11-10',
      projects: 15,
      tasksCompleted: 89,
      rating: 4.7,
      skills: ['Project Management', 'Agile', 'Scrum', 'Team Leadership'],
      currentProjects: ['Client Onboarding', 'Team Training'],
      availability: 'In Meeting'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Backend Developer',
      department: 'Development',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      status: 'offline',
      email: 'david@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      joinDate: '2023-05-01',
      projects: 6,
      tasksCompleted: 134,
      rating: 4.6,
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      currentProjects: ['API Development', 'Database Migration'],
      availability: 'Offline'
    },
    {
      id: 5,
      name: 'Lisa Brown',
      role: 'Content Strategist',
      department: 'Marketing',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      status: 'online',
      email: 'lisa@company.com',
      phone: '+1 (555) 567-8901',
      location: 'Miami, FL',
      joinDate: '2023-07-15',
      projects: 10,
      tasksCompleted: 67,
      rating: 4.5,
      skills: ['Content Strategy', 'SEO', 'Social Media', 'Analytics'],
      currentProjects: ['Content Calendar', 'Brand Guidelines'],
      availability: 'Available'
    },
    {
      id: 6,
      name: 'Alex Rivera',
      role: 'QA Engineer',
      department: 'Quality Assurance',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      status: 'online',
      email: 'alex@company.com',
      phone: '+1 (555) 678-9012',
      location: 'Denver, CO',
      joinDate: '2023-09-01',
      projects: 7,
      tasksCompleted: 98,
      rating: 4.8,
      skills: ['Manual Testing', 'Automation', 'Selenium', 'Jest'],
      currentProjects: ['Test Automation', 'Quality Assurance'],
      availability: 'Available'
    }
  ]

  const departments = [
    { name: 'Design', count: 1, color: 'bg-purple-100 text-purple-800' },
    { name: 'Development', count: 2, color: 'bg-blue-100 text-blue-800' },
    { name: 'Management', count: 1, color: 'bg-green-100 text-green-800' },
    { name: 'Marketing', count: 1, color: 'bg-orange-100 text-orange-800' },
    { name: 'Quality Assurance', count: 1, color: 'bg-red-100 text-red-800' }
  ]

  const teamStats = {
    totalMembers: teamMembers.length,
    onlineMembers: teamMembers.filter(m => m.status === 'online').length,
    activeProjects: teamMembers.reduce((sum, m) => sum + m.projects, 0),
    completedTasks: teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0),
    averageRating: teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'away': return 'bg-orange-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Team Hub</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your team members and collaboration</p>
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

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-primary">{teamStats.totalMembers}</div>
            <p className="text-xs text-gray-500">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{teamStats.onlineMembers}</div>
            <p className="text-xs text-gray-500">Available for collaboration</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{teamStats.activeProjects}</div>
            <p className="text-xs text-gray-500">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{teamStats.completedTasks}</div>
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
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm">Team Chat</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Schedule</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Video className="h-5 w-5" />
                    <span className="text-sm">Video Call</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
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
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Team analytics and reporting coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
