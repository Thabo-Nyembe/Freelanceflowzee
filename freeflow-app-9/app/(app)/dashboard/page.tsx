"use client"

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  DollarSign,
  Users,
  FileText,
  Globe,
  Settings,
  Bell,
  Plus,
  Eye,
  Zap,
  Target,
  Brain,
  TrendingUp,
  Briefcase,
  Clock,
  Shield,
  Download,
  Calendar,
  Award,
  Activity,
  ArrowRight,
  ChevronRight,
  Wallet,
  Upload,
  Video,
  Palette,
  Mic
} from 'lucide-react'
import { GlobalSearch } from '@/components/global-search'

// Mock data
const mockData = {
  earnings: 45231,
  activeProjects: 12,
  completedProjects: 48,
  pendingPayments: 3,
  recentActivities: [
    { id: 1, type: 'project', message: 'New project "Brand Identity" started', time: '2 hours ago' },
    { id: 2, type: 'payment', message: 'Payment received from John Doe', time: '4 hours ago' },
    { id: 3, type: 'feedback', message: 'Client feedback on "Website Design"', time: '1 day ago' }
  ],
  projects: [
    { id: 1, name: 'Brand Identity Package', client: 'Acme Corp', progress: 85, status: 'In Progress', value: 2500 },
    { id: 2, name: 'Mobile App Design', client: 'Tech Startup', progress: 40, status: 'In Progress', value: 5000 }
  ]
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [notifications, setNotifications] = useState(3)

  // Mock user for demo mode
  const mockUser = {
    id: 'demo-user',
    email: 'demo@freeflowzee.com',
    user_metadata: {
      full_name: 'Demo User',
      avatar_url: undefined
    }
  }

  const tabConfig = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Dashboard overview and stats'
    },
    {
      value: 'projects-hub', 
      label: 'Projects Hub',
      icon: FolderOpen,
      description: 'Manage all your projects'
    },
    {
      value: 'ai-create',
      label: 'AI Create',
      icon: Brain,
      description: 'AI-powered content creation'
    },
    {
      value: 'video-studio',
      label: 'Video Studio', 
      icon: Video,
      description: 'Professional video creation'
    },
    {
      value: 'escrow',
      label: 'Escrow',
      icon: Shield,
      description: 'Secure payment management'
    },
    {
      value: 'files-hub',
      label: 'Files Hub',
      icon: FileText,
      description: 'File sharing and storage'
    },
    {
      value: 'community',
      label: 'Community',
      icon: Globe,
      description: 'Connect with other creators'
    },
    {
      value: 'my-day',
      label: 'My Day Today',
      icon: Calendar,
      description: 'AI-powered daily planning'
    }
  ]

  const renderTabContent = (tabValue: string) => {
    switch (tabValue) {
      case 'overview':
        return <DashboardOverview />
      case 'projects-hub':
        return <ProjectsHubPlaceholder />
      case 'ai-create':
        return <AICreatePlaceholder />
      case 'video-studio':
        return <VideoStudioPlaceholder />
      case 'escrow':
        return <EscrowPlaceholder />
      case 'files-hub':
        return <FilesHubPlaceholder />
      case 'community':
        return <CommunityPlaceholder />
      case 'my-day':
        return <MyDayPlaceholder />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <div className="border-b border-white/20 bg-white/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold luxury-text-gradient mb-2">
                Welcome to FreeflowZee
              </h1>
              <p className="text-lg text-gray-600">
                Your complete creative business platform
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <GlobalSearch />
              <Card className="glass-card p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Earnings</p>
                    <p className="font-bold text-green-600">${mockData.earnings.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="glass-card p-4">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                    <p className="font-bold text-blue-600">{mockData.activeProjects}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 border border-white/20 shadow-lg overflow-x-auto">
            <TabsList className="grid w-full grid-cols-8 bg-transparent gap-1 min-w-max">
              {tabConfig.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 whitespace-nowrap px-4 py-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.value === 'community' && notifications > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                        {notifications}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
            <div className="p-6">
              {tabConfig.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  {renderTabContent(tab.value)}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview() {
  const stats = [
    { title: "Activity", value: "89%", change: "+2.1%", icon: Activity, color: "text-blue-600", bgColor: 'bg-blue-100' },
    { title: "Revenue", value: "$45,231", change: "+12.5%", icon: DollarSign, color: "text-green-600", bgColor: 'bg-green-100' },
    { title: "Clients", value: "2,300", change: "+3.2%", icon: Users, color: "text-purple-600", bgColor: 'bg-purple-100' },
    { title: "Growth", value: "15.3%", change: "+4.3%", icon: TrendingUp, color: "text-orange-600", bgColor: 'bg-orange-100' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-card hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="mr-1">{stat.change}</Badge>
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your latest project activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.client}</p>
                  <Progress value={project.progress} className="mt-2" />
                </div>
                <div className="text-right ml-4">
                  <Badge variant="outline">{project.status}</Badge>
                  <p className="text-sm font-medium mt-1">${project.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder components for other tabs
function ProjectsHubPlaceholder() {
  return (
    <div className="text-center py-12">
      <FolderOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Projects Hub</h3>
      <p className="text-gray-600 mb-4">Manage all your projects in one place</p>
      <Button onClick={() => window.location.href = '/dashboard/projects-hub'}>
        <Eye className="h-4 w-4 mr-2" />
        Go to Projects Hub
      </Button>
    </div>
  )
}

function AICreatePlaceholder() {
  return (
    <div className="text-center py-12">
      <Brain className="h-16 w-16 text-purple-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">AI Create Studio</h3>
      <p className="text-gray-600 mb-4">Generate amazing content with AI</p>
      <Button onClick={() => window.location.href = '/dashboard/ai-create'}>
        <Zap className="h-4 w-4 mr-2" />
        Start Creating
      </Button>
    </div>
  )
}

function VideoStudioPlaceholder() {
  return (
    <div className="text-center py-12">
      <Video className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Video Studio Pro</h3>
      <p className="text-gray-600 mb-4">Professional video creation and editing</p>
      <Button onClick={() => window.location.href = '/dashboard/video-studio'}>
        <Video className="h-4 w-4 mr-2" />
        Open Studio
      </Button>
    </div>
  )
}

function EscrowPlaceholder() {
  return (
    <div className="text-center py-12">
      <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Escrow System</h3>
      <p className="text-gray-600 mb-4">Secure payment protection for your projects</p>
      <Button onClick={() => window.location.href = '/dashboard/escrow'}>
        <Shield className="h-4 w-4 mr-2" />
        View Escrow
      </Button>
    </div>
  )
}

function FilesHubPlaceholder() {
  return (
    <div className="text-center py-12">
      <FileText className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Files Hub</h3>
      <p className="text-gray-600 mb-4">Share and manage your files</p>
      <Button onClick={() => window.location.href = '/dashboard/files-hub'}>
        <Upload className="h-4 w-4 mr-2" />
        Manage Files
      </Button>
    </div>
  )
}

function CommunityPlaceholder() {
  return (
    <div className="text-center py-12">
      <Globe className="h-16 w-16 text-pink-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Community Hub</h3>
      <p className="text-gray-600 mb-4">Connect with other creators</p>
      <Button onClick={() => window.location.href = '/dashboard/community'}>
        <Users className="h-4 w-4 mr-2" />
        Join Community
      </Button>
    </div>
  )
}

function MyDayPlaceholder() {
  return (
    <div className="text-center py-12">
      <Calendar className="h-16 w-16 text-orange-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">My Day Today</h3>
      <p className="text-gray-600 mb-4">AI-powered daily planning and productivity</p>
      <Button onClick={() => window.location.href = '/dashboard/my-day'}>
        <Target className="h-4 w-4 mr-2" />
        Plan My Day
      </Button>
    </div>
  )
}