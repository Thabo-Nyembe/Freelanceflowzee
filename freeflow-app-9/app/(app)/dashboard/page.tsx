"use client"

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Plus,
  Zap,
  Brain,
  TrendingUp,
  Shield,
  Calendar,
  Wallet,
  Video,
} from 'lucide-react'
import GlobalSearch from '@/components/global-search'
import { AnimatePresence, motion } from 'framer-motion'

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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="order-2 sm:order-1">
                <GlobalSearch />
              </div>
              <div className="flex gap-3 order-1 sm:order-2">
                <Card className="glass-card p-3 sm:p-4 flex-1 sm:flex-initial">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Earnings</p>
                      <p className="font-bold text-green-600 text-sm sm:text-base">${mockData.earnings.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="glass-card p-3 sm:p-4 flex-1 sm:flex-initial">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600">Active Projects</p>
                      <p className="font-bold text-blue-600 text-sm sm:text-base">{mockData.activeProjects}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 border border-white/20 shadow-lg">
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="flex w-max md:grid md:w-full md:grid-cols-8 bg-transparent gap-1 min-w-max">
                {tabConfig.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`flex-shrink-0 min-w-[120px] md:flex-1 group rounded-lg transition-all duration-300 ease-in-out h-20 md:h-24 flex flex-col items-center justify-center gap-1 md:gap-2 px-3 ${
                      activeTab === tab.value
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-white/80 hover:shadow-md hover:scale-105'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 md:h-6 md:w-6 transition-all ${activeTab === tab.value ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    <span className="font-semibold text-xs md:text-sm text-center leading-tight">{tab.label}</span>
                  </TabsTrigger>
                )
              })}
              </TabsList>
            </div>
          </div>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

// Placeholder Components for each tab
function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-4 lg:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {mockData.recentActivities.map(activity => (
                <li key={activity.id} className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-full">
                    {activity.type === 'project' && <FolderOpen className="h-5 w-5 text-blue-500" />}
                    {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-green-500" />}
                    {activity.type === 'feedback' && <MessageSquare className="h-5 w-5 text-yellow-500" />}
                  </div>
                  <div>
                    <p>{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Projects</CardTitle>
            <Button size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.projects.map(project => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.client}</p>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span>{project.progress}% complete</span>
                    <span>${project.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-4 lg:space-y-6">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription className="text-blue-100">Your creative co-pilot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>What would you like to do today?</p>
            <Button variant="secondary" className="w-full justify-start gap-2">
              <Zap className="h-4 w-4" /> Generate Ideas
            </Button>
            <Button variant="secondary" className="w-full justify-start gap-2">
              <FileText className="h-4 w-4" /> Draft a Proposal
            </Button>
            <Button variant="secondary" className="w-full justify-start gap-2">
              <TrendingUp className="h-4 w-4" /> Optimize my Week
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="flex flex-col h-20 sm:h-24 items-center justify-center gap-1 sm:gap-2 p-2">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">New Project</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 sm:h-24 items-center justify-center gap-1 sm:gap-2 p-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Add Client</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 sm:h-24 items-center justify-center gap-1 sm:gap-2 p-2">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">New Invoice</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 sm:h-24 items-center justify-center gap-1 sm:gap-2 p-2">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-xs sm:text-sm">Settings</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProjectsHubPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Hub</CardTitle>
        <CardDescription>All your creative endeavors, organized.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <FolderOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">Full Project Management Coming Soon</h3>
        <p className="text-gray-500">Manage tasks, timelines, and client collaboration.</p>
        <Button className="mt-4">Explore Demo</Button>
      </CardContent>
    </Card>
  )
}

function AICreatePlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Create</CardTitle>
        <CardDescription>Your personal content creation powerhouse.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <Brain className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">AI Creation Tools Are Being Warmed Up</h3>
        <p className="text-gray-500">Generate proposals, scripts, social media posts, and more.</p>
        <Button className="mt-4">Try AI Demo</Button>
      </CardContent>
    </Card>
  )
}

function VideoStudioPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Studio</CardTitle>
        <CardDescription>From recording to final cut, all in one place.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">The Studio is Under Construction</h3>
        <p className="text-gray-500">Record, edit, and collaborate on professional videos.</p>
        <Button className="mt-4">See a Preview</Button>
      </CardContent>
    </Card>
  )
}

function EscrowPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Escrow</CardTitle>
        <CardDescription>Peace of mind for you and your clients.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <Shield className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">Secure Payments on the Way</h3>
        <p className="text-gray-500">Protect your projects with milestone-based payments.</p>
        <Button className="mt-4">Learn More</Button>
      </CardContent>
    </Card>
  )
}

function FilesHubPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files Hub</CardTitle>
        <CardDescription>Your centralized, secure file storage.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">Cloud Storage is Being Provisioned</h3>
        <p className="text-gray-500">Share large files, get feedback, and keep everything organized.</p>
        <Button className="mt-4">Check Storage Options</Button>
      </CardContent>
    </Card>
  )
}

function CommunityPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community</CardTitle>
        <CardDescription>Connect, collaborate, and grow with fellow creators.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <Globe className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">The Community Hub is Launching Soon</h3>
        <p className="text-gray-500">Join discussions, share your work, and find collaborators.</p>
        <Button className="mt-4">Join Waitlist</Button>
      </CardContent>
    </Card>
  )
}

function MyDayPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Day Today</CardTitle>
        <CardDescription>Your AI-powered daily planner and focus tool.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-16">
        <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold">Your Personal AI Planner is Arriving Shortly</h3>
        <p className="text-gray-500">Get smart schedules, task prioritization, and focus timers.</p>
        <Button className="mt-4">Set up My Day</Button>
      </CardContent>
    </Card>
  )
}