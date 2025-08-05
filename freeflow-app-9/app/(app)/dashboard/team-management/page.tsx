'use client'

import { useState } from 'react'
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

export default function TeamManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Designer',
      email: 'sarah@kazi.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      avatar: '/avatars/sarah.jpg',
      status: 'online',
      level: 'senior',
      joinDate: '2023-01-15',
      completedProjects: 24,
      activeProjects: 3,
      rating: 4.9,
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
      currentWorkload: 85,
      availability: 'full-time',
      lastActive: '2 minutes ago',
      performance: {
        tasksCompleted: 156,
        onTimeDelivery: 98,
        clientSatisfaction: 4.8,
        teamCollaboration: 4.9
      }
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Full Stack Developer',
      email: 'michael@kazi.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, USA',
      avatar: '/avatars/michael.jpg',
      status: 'busy',
      level: 'senior',
      joinDate: '2022-11-20',
      completedProjects: 31,
      activeProjects: 5,
      rating: 4.8,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Database Design'],
      currentWorkload: 95,
      availability: 'full-time',
      lastActive: '1 hour ago',
      performance: {
        tasksCompleted: 203,
        onTimeDelivery: 95,
        clientSatisfaction: 4.7,
        teamCollaboration: 4.6
      }
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Project Manager',
      email: 'emma@kazi.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, USA',
      avatar: '/avatars/emma.jpg',
      status: 'online',
      level: 'lead',
      joinDate: '2022-08-10',
      completedProjects: 45,
      activeProjects: 8,
      rating: 4.9,
      skills: ['Project Management', 'Agile', 'Scrum', 'Team Leadership', 'Client Relations'],
      currentWorkload: 78,
      availability: 'full-time',
      lastActive: '5 minutes ago',
      performance: {
        tasksCompleted: 278,
        onTimeDelivery: 99,
        clientSatisfaction: 4.9,
        teamCollaboration: 5.0
      }
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Marketing Specialist',
      email: 'david@kazi.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, USA',
      avatar: '/avatars/david.jpg',
      status: 'away',
      level: 'mid',
      joinDate: '2023-03-05',
      completedProjects: 18,
      activeProjects: 2,
      rating: 4.6,
      skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics'],
      currentWorkload: 60,
      availability: 'part-time',
      lastActive: '3 hours ago',
      performance: {
        tasksCompleted: 89,
        onTimeDelivery: 92,
        clientSatisfaction: 4.5,
        teamCollaboration: 4.7
      }
    }
  ]

  const teamStats = {
    totalMembers: 12,
    activeMembers: 9,
    avgRating: 4.8,
    totalProjects: 156,
    completedProjects: 134,
    avgWorkload: 79,
    teamEfficiency: 94
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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button variant="outline">
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