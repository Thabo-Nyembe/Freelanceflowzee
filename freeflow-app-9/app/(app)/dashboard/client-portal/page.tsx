'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  UserCheck, 
  Globe, 
  Lock, 
  Share2, 
  Eye, 
  Download, 
  Upload,
  MessageSquare,
  Calendar,
  FileText,
  Image,
  Video,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Settings,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Shield,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  Zap
} from 'lucide-react'

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const clients = [
    {
      id: 1,
      name: 'Acme Corporation',
      contactPerson: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corp',
      location: 'New York, USA',
      avatar: '/avatars/acme-corp.jpg',
      status: 'active',
      tier: 'premium',
      joinDate: '2023-01-15',
      totalProjects: 12,
      activeProjects: 3,
      completedProjects: 9,
      totalValue: 45000,
      lastLogin: '2 hours ago',
      portalAccess: true,
      permissions: ['view_projects', 'download_files', 'leave_feedback', 'schedule_meetings'],
      satisfaction: 4.9,
      projects: [
        { id: 1, name: 'Brand Redesign', status: 'in-progress', progress: 75 },
        { id: 2, name: 'Website Development', status: 'review', progress: 90 },
        { id: 3, name: 'Marketing Campaign', status: 'planning', progress: 25 }
      ]
    },
    {
      id: 2,
      name: 'Tech Innovations Inc',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@techinnovations.com',
      phone: '+1 (555) 234-5678',
      company: 'Tech Innovations Inc',
      location: 'San Francisco, USA',
      avatar: '/avatars/tech-innovations.jpg',
      status: 'active',
      tier: 'enterprise',
      joinDate: '2022-11-20',
      totalProjects: 18,
      activeProjects: 5,
      completedProjects: 13,
      totalValue: 78000,
      lastLogin: '1 day ago',
      portalAccess: true,
      permissions: ['view_projects', 'download_files', 'leave_feedback', 'schedule_meetings', 'manage_team'],
      satisfaction: 4.8,
      projects: [
        { id: 4, name: 'Mobile App Design', status: 'in-progress', progress: 60 },
        { id: 5, name: 'API Development', status: 'completed', progress: 100 },
        { id: 6, name: 'User Testing', status: 'in-progress', progress: 40 }
      ]
    },
    {
      id: 3,
      name: 'Creative Studio LLC',
      contactPerson: 'Michael Brown',
      email: 'michael@creativestudio.com',
      phone: '+1 (555) 345-6789',
      company: 'Creative Studio LLC',
      location: 'Los Angeles, USA',
      avatar: '/avatars/creative-studio.jpg',
      status: 'pending',
      tier: 'standard',
      joinDate: '2023-06-10',
      totalProjects: 6,
      activeProjects: 2,
      completedProjects: 4,
      totalValue: 18000,
      lastLogin: '1 week ago',
      portalAccess: false,
      permissions: ['view_projects', 'download_files'],
      satisfaction: 4.5,
      projects: [
        { id: 7, name: 'Logo Design', status: 'completed', progress: 100 },
        { id: 8, name: 'Business Cards', status: 'in-progress', progress: 80 }
      ]
    }
  ]

  const portalStats = {
    totalClients: 24,
    activePortals: 18,
    totalLogins: 1247,
    avgSatisfaction: 4.7
  }

  const recentActivity = [
    {
      id: 1,
      type: 'login',
      client: 'Acme Corporation',
      action: 'Logged into portal',
      timestamp: '2 hours ago',
      icon: UserCheck
    },
    {
      id: 2,
      type: 'download',
      client: 'Tech Innovations Inc',
      action: 'Downloaded project files',
      timestamp: '4 hours ago',
      icon: Download
    },
    {
      id: 3,
      type: 'feedback',
      client: 'Creative Studio LLC',
      action: 'Left project feedback',
      timestamp: '1 day ago',
      icon: MessageSquare
    },
    {
      id: 4,
      type: 'meeting',
      client: 'Acme Corporation',
      action: 'Scheduled project review',
      timestamp: '2 days ago',
      icon: Calendar
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      case 'standard': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'planning': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 text-white">
              <UserCheck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Client Portal
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage client access, permissions, and collaboration
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Portal Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900">{portalStats.totalClients}</p>
                  <p className="text-sm text-green-600">{portalStats.activePortals} with access</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Portals</p>
                  <p className="text-3xl font-bold text-gray-900">{portalStats.activePortals}</p>
                  <p className="text-sm text-green-600">75% adoption rate</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Logins</p>
                  <p className="text-3xl font-bold text-gray-900">{portalStats.totalLogins}</p>
                  <p className="text-sm text-purple-600">+15% this month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-3xl font-bold text-gray-900">{portalStats.avgSatisfaction}</p>
                  <p className="text-sm text-yellow-600">⭐ Excellent</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border border-white/30">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.client}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clients
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .slice(0, 4)
                    .map((client, index) => (
                      <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-600">{client.totalProjects} projects</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${client.totalValue.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">⭐ {client.satisfaction}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search clients..."
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
              {filteredClients.map((client) => (
                <Card key={client.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={client.avatar} alt={client.name} />
                          <AvatarFallback className="text-lg">{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-gray-600">{client.contactPerson}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(client.status)}>
                              {client.status}
                            </Badge>
                            <Badge className={getTierColor(client.tier)}>
                              {client.tier}
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
                        <p className="text-gray-600">Total Projects</p>
                        <p className="font-semibold text-lg">{client.totalProjects}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Value</p>
                        <p className="font-semibold text-lg text-green-600">${client.totalValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Satisfaction</p>
                        <p className="font-semibold text-lg">⭐ {client.satisfaction}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Login</p>
                        <p className="font-semibold text-lg">{client.lastLogin}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Active Projects</h4>
                      {client.projects.filter(p => p.status !== 'completed').map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{project.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getProjectStatusColor(project.status)} variant="outline">
                                {project.status}
                              </Badge>
                              <span className="text-xs text-gray-600">{project.progress}%</span>
                            </div>
                          </div>
                          <Progress value={project.progress} className="w-20 h-2" />
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{client.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Portal
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Client Permissions Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Permission Management</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Configure client access levels, permissions, and security settings for each portal.
                  </p>
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                    <Key className="h-4 w-4 mr-2" />
                    Manage Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Portal Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.client}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                        <Badge variant="outline" className="ml-2">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}