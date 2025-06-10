'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  LayoutDashboard, 
  Calendar,
  FolderOpen,
  Users,
  CreditCard,
  FileText,
  TrendingUp,
  Clock,
  Target,
  Briefcase,
  DollarSign,
  ArrowRight,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Star,
  Activity,
  Zap,
  Award,
  Rocket,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
  Bell,
  MessageSquare
} from 'lucide-react'

// Framework7-inspired modern color palette
const modernColors = {
  primary: '#007AFF',
  secondary: '#5856D6', 
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#17A2B8',
  light: '#F8F9FA',
  dark: '#343A40',
  gradient: {
    primary: 'from-blue-500 to-purple-600',
    success: 'from-green-400 to-blue-500',
    warning: 'from-yellow-400 to-orange-500',
    info: 'from-cyan-400 to-blue-500'
  }
}

// Mock data for demonstration
const mockStats = [
  { 
    title: 'Active Projects', 
    value: '24', 
    change: '+12%', 
    icon: FolderOpen, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50',
    gradient: modernColors.gradient.primary
  },
  { 
    title: 'Revenue This Month', 
    value: '$15,750', 
    change: '+8%', 
    icon: DollarSign, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50',
    gradient: modernColors.gradient.success
  },
  { 
    title: 'Hours Tracked', 
    value: '186', 
    change: '+5%', 
    icon: Clock, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50',
    gradient: modernColors.gradient.warning
  },
  { 
    title: 'Client Satisfaction', 
    value: '4.9/5', 
    change: '+0.2', 
    icon: Star, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50',
    gradient: modernColors.gradient.info
  }
]

const recentProjects = [
  {
    id: 1,
    name: 'E-commerce Website',
    client: 'TechCorp Inc.',
    status: 'In Progress',
    progress: 75,
    deadline: '2024-01-15',
    priority: 'High',
    team: ['JD', 'AS', 'MK']
  },
  {
    id: 2,
    name: 'Mobile App Design',
    client: 'StartupXYZ',
    status: 'Review',
    progress: 90,
    deadline: '2024-01-10',
    priority: 'Medium',
    team: ['JD', 'LR']
  },
  {
    id: 3,
    name: 'Brand Identity',
    client: 'Creative Agency',
    status: 'Planning',
    progress: 25,
    deadline: '2024-01-20',
    priority: 'Low',
    team: ['AS', 'MK', 'TR']
  }
]

const upcomingTasks = [
  { id: 1, title: 'Client meeting with TechCorp', time: '2:00 PM', priority: 'high' },
  { id: 2, title: 'Design review for Mobile App', time: '4:30 PM', priority: 'medium' },
  { id: 3, title: 'Invoice generation', time: '6:00 PM', priority: 'low' },
  { id: 4, title: 'Team standup meeting', time: '9:00 AM Tomorrow', priority: 'medium' }
]

export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const StatCard = ({ stat, index }: { stat: any, index: number }) => (
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h4>
            <p className="text-sm text-gray-600">{project.client}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {project.priority}
            </Badge>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{project.deadline}</span>
            </div>
            <div className="flex -space-x-2">
              {project.team.map((member: string, i: number) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-xs">{member}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const TaskItem = ({ task }: { task: any }) => (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 rounded-full ${
        task.priority === 'high' ? 'bg-red-500' : 
        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
        <p className="text-xs text-gray-500">{task.time}</p>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
        <CheckCircle2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome back, John! 👋
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Projects */}
              <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
                    <Button variant="ghost" size="sm" className="gap-2">
                      View All <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Projects</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Project
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <PieChart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Revenue chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Project Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Performance metrics will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Task Management</CardTitle>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <TaskItem task={task} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
  
