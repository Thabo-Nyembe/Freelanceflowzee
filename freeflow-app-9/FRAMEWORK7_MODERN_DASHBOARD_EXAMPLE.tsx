'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Calendar,
  FolderOpen,
  Users,
  CreditCard,
  FileText,
  Globe,
  User,
  Bell,
  Settings,
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
  Activity
} from 'lucide-react'

// Framework7-inspired Color Palette
const colors = {
  primary: '#007AFF',
  secondary: '#5856D6', 
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#000000',
  background: '#FFFFFF',
  surface: '#F2F2F7'
}

// Modern Card Component with Framework7 Design
const ModernCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  raised = false,
  outline = false 
}: any) => {
  const baseClasses = "transition-all duration-300 hover:shadow-lg"
  const variantClasses = {
    default: "bg-white border border-gray-200",
    raised: "bg-white shadow-lg border-0",
    outline: "bg-transparent border-2 border-gray-200",
    gradient: "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

// Modern Stats Card
const StatsCard = ({ title, value, change, icon: Icon, color = colors.primary }: any) => (
  <ModernCard variant="raised" className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div 
        className="p-3 rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon 
          className="w-6 h-6" 
          style={{ color }}
        />
      </div>
    </div>
  </ModernCard>
)

// Modern Action Card
const ActionCard = ({ title, description, icon: Icon, color = colors.primary, onClick }: any) => (
  <ModernCard 
    variant="outline" 
    className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-xl group"
    onClick={onClick}
  >
    <div className="flex items-start space-x-4">
      <div 
        className="p-3 rounded-full group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon 
          className="w-6 h-6" 
          style={{ color }}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
    </div>
  </ModernCard>
)

// Modern Project Card
const ProjectCard = ({ project }: any) => (
  <ModernCard variant="raised" className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
        <p className="text-sm text-gray-600">{project.client}</p>
      </div>
      <Badge 
        variant={project.status === 'completed' ? 'default' : 'secondary'}
        className="capitalize"
      >
        {project.status}
      </Badge>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">{project.progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${project.progress}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{project.dueDate}</span>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-600">{project.value}</span>
        </div>
      </div>
    </div>
  </ModernCard>
)

// Main Modern Dashboard Component
export default function ModernDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { title: 'Total Projects', value: '24', change: '+12%', icon: FolderOpen, color: colors.primary },
    { title: 'Active Clients', value: '16', change: '+8%', icon: Users, color: colors.success },
    { title: 'Revenue', value: '$42.5K', change: '+23%', icon: DollarSign, color: colors.warning },
    { title: 'Completed', value: '18', change: '+15%', icon: CheckCircle2, color: colors.info }
  ]

  const quickActions = [
    { 
      title: 'Create Project', 
      description: 'Start a new project with client collaboration',
      icon: Plus, 
      color: colors.primary 
    },
    { 
      title: 'Schedule Meeting', 
      description: 'Book a meeting with clients or team members',
      icon: Calendar, 
      color: colors.secondary 
    },
    { 
      title: 'Generate Invoice', 
      description: 'Create and send professional invoices',
      icon: FileText, 
      color: colors.success 
    },
    { 
      title: 'View Analytics', 
      description: 'Check your business performance metrics',
      icon: Activity, 
      color: colors.info 
    }
  ]

  const recentProjects = [
    { 
      name: 'Brand Identity Design', 
      client: 'Tech Startup Inc.', 
      progress: 85, 
      status: 'in-progress',
      dueDate: 'Dec 15',
      value: '$3,500'
    },
    { 
      name: 'Website Redesign', 
      client: 'Fashion Brand', 
      progress: 100, 
      status: 'completed',
      dueDate: 'Dec 10',
      value: '$5,200'
    },
    { 
      name: 'Mobile App UI', 
      client: 'Local Restaurant', 
      progress: 45, 
      status: 'in-progress',
      dueDate: 'Dec 20',
      value: '$2,800'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Good morning, Alex! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your freelance business today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Avatar>
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback>AK</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <ModernCard variant="raised" className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <ActionCard key={index} {...action} />
              ))}
            </div>
          </ModernCard>

          {/* Recent Projects */}
          <ModernCard variant="raised" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {recentProjects.map((project, index) => (
                <ProjectCard key={index} project={project} />
              ))}
            </div>
          </ModernCard>
        </TabsContent>

        <TabsContent value="projects">
          <ModernCard variant="raised" className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Management</h2>
            <p className="text-gray-600">Advanced project tracking and collaboration tools.</p>
          </ModernCard>
        </TabsContent>

        <TabsContent value="clients">
          <ModernCard variant="raised" className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Management</h2>
            <p className="text-gray-600">Manage your client relationships and communications.</p>
          </ModernCard>
        </TabsContent>

        <TabsContent value="analytics">
          <ModernCard variant="raised" className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Analytics</h2>
            <p className="text-gray-600">Track your performance and business metrics.</p>
          </ModernCard>
        </TabsContent>
      </Tabs>
    </div>
  )
} 