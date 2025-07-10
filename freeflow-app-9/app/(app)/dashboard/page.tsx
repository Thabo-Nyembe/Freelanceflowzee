"use client"

import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
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
  Loader2,
} from 'lucide-react'
import GlobalSearch from '@/components/global-search'
import { AnimatePresence, motion } from 'framer-motion'

// Lazy load heavy components for better performance
const AICreateStudio = lazy(() => import('@/components/ai/ai-create-studio').then(m => ({ default: m.AICreateStudio })))
const FilesHub = lazy(() => import('@/components/hubs/files-hub'))
const CommunityHub = lazy(() => import('@/components/hubs/community-hub'))
const ProjectsHub = lazy(() => import('@/components/hubs/projects-hub'))
const MyDayToday = lazy(() => import('@/components/my-day-today').then(m => ({ default: m.MyDayToday })))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
)

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

  // Memoize tab configuration to prevent unnecessary re-renders
  const tabConfig = useMemo(() => [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Enterprise dashboard with analytics and insights'
    },
    {
      value: 'projects-hub', 
      label: 'Projects Hub',
      icon: FolderOpen,
      description: 'Complete project lifecycle management system'
    },
    {
      value: 'ai-create',
      label: 'AI Create',
      icon: Brain,
      description: 'Multi-model AI studio (GPT-4o, Claude, DALL-E, Google AI)'
    },
    {
      value: 'video-studio',
      label: 'Video Studio', 
      icon: Video,
      description: 'Professional editing with AI transcription and collaboration'
    },
    {
      value: 'escrow',
      label: 'Escrow',
      icon: Shield,
      description: 'Secure milestone-based payment protection system'
    },
    {
      value: 'files-hub',
      label: 'Files Hub',
      icon: FileText,
      description: 'Multi-cloud storage with 70% cost optimization'
    },
    {
      value: 'community',
      label: 'Community',
      icon: Globe,
      description: 'Connect with 2,800+ verified creative professionals'
    },
    {
      value: 'my-day',
      label: 'My Day Today',
      icon: Calendar,
      description: 'AI-powered daily planning and productivity optimization'
    }
  ], [])

  // Memoize tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  // Memoize tab content rendering for better performance
  const renderTabContent = useCallback((tabValue: string) => {
    switch (tabValue) {
      case 'overview':
        return <DashboardOverview />
      case 'projects-hub':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProjectsHubTab />
          </Suspense>
        )
      case 'ai-create':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AICreateTab />
          </Suspense>
        )
      case 'video-studio':
        return <VideoStudioPlaceholder />
      case 'escrow':
        return <EscrowPlaceholder />
      case 'files-hub':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <FilesHubTab />
          </Suspense>
        )
      case 'community':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CommunityTab />
          </Suspense>
        )
      case 'my-day':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MyDayTab />
          </Suspense>
        )
      default:
        return <DashboardOverview />
    }
  }, [])

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 kazi-bg-light dark:kazi-bg-dark">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-2 kazi-headline">
                Welcome to KAZI
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 kazi-body">
                Your complete creative business platform
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="order-2 sm:order-1">
                <GlobalSearch />
              </div>
              <div className="flex gap-3 order-1 sm:order-2">
                <Card className="kazi-card p-3 sm:p-4 flex-1 sm:flex-initial kazi-hover-scale">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 kazi-text-accent" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 kazi-body">Earnings</p>
                      <p className="font-bold kazi-text-accent text-sm sm:text-base kazi-body-medium">${mockData.earnings.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="kazi-card p-3 sm:p-4 flex-1 sm:flex-initial kazi-hover-scale">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 kazi-text-primary" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 kazi-body">Active Projects</p>
                      <p className="font-bold kazi-text-primary text-sm sm:text-base kazi-body-medium">{mockData.activeProjects}</p>
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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

// Removed unused placeholder components as they've been replaced with working components

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

// All placeholder components have been replaced with working implementations

// Working Components
function AICreateTab() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI Create Studio</h2>
        <p className="text-gray-600">Generate content using advanced AI models</p>
      </div>
      <AICreateStudio />
    </div>
  )
}

function ProjectsHubTab() {
  const sampleProjects = [
    {
      id: 'proj_001',
      title: 'Brand Identity Package',
      description: 'Complete brand identity design including logo, colors, typography, and brand guidelines for Acme Corp.',
      status: 'active' as const,
      progress: 75,
      client_name: 'Acme Corp',
      budget: 5000,
      spent: 3750,
      start_date: '2024-01-15',
      end_date: '2024-03-15',
      team_members: [
        { id: 'user_001', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { id: 'user_002', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' }
      ],
      priority: 'high' as const,
      comments_count: 12,
      attachments: [{}, {}, {}]
    },
    {
      id: 'proj_002',
      title: 'E-commerce Website',
      description: 'Full-stack e-commerce platform with modern design and advanced features for Tech Startup.',
      status: 'active' as const,
      progress: 45,
      client_name: 'Tech Startup',
      budget: 15000,
      spent: 6750,
      start_date: '2024-02-01',
      end_date: '2024-05-01',
      team_members: [
        { id: 'user_003', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { id: 'user_004', name: 'Emma Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' }
      ],
      priority: 'medium' as const,
      comments_count: 8,
      attachments: [{}, {}]
    },
    {
      id: 'proj_003',
      title: 'Mobile App Design',
      description: 'Native mobile app design for iOS and Android with user experience optimization.',
      status: 'completed' as const,
      progress: 100,
      client_name: 'FinTech Solutions',
      budget: 8000,
      spent: 8000,
      start_date: '2023-11-01',
      end_date: '2024-01-30',
      team_members: [
        { id: 'user_005', name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' }
      ],
      priority: 'high' as const,
      comments_count: 15,
      attachments: [{}, {}, {}, {}]
    }
  ]

  return (
    <div className="space-y-6">
      <ProjectsHub
        projects={sampleProjects}
        _userId="current-user"
      />
    </div>
  )
}

function FilesHubTab() {
  return (
    <div className="space-y-6">
      <FilesHub
        userId="current-user"
        onFileUpload={(files) => console.log('Files uploaded:', files)}
        onFileDelete={(fileId) => console.log('File deleted:', fileId)}
        onFileShare={(fileId) => console.log('File shared:', fileId)}
      />
    </div>
  )
}

function CommunityTab() {
  return (
    <div className="space-y-6">
      <CommunityHub
        currentUserId="current-user"
        onPostCreate={(post) => console.log('Post created:', post)}
        onMemberConnect={(memberId) => console.log('Connected to member:', memberId)}
      />
    </div>
  )
}

function MyDayTab() {
  return (
    <div className="space-y-6">
      <MyDayToday />
    </div>
  )
}