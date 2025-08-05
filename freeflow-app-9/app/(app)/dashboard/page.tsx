"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Bell,
  User,
  Clock,
  Briefcase,
  Image,
  Cloud,
  Palette,
  Target,
  ArrowRight,
  Activity,
  Star,
  CheckCircle,
  Building,
  ChevronLeft,
  ChevronRight,
  Workflow,
  Receipt,
  UserCheck,
  Archive,
  Monitor,
  Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const mockData = {
  earnings: 45231,
  activeProjects: 12,
  completedProjects: 48,
  totalClients: 156,
  hoursThisMonth: 187,
  recentActivities: [
    { id: 1, type: 'project', message: 'New project "Brand Identity" started', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'payment', message: 'Payment received from John Doe', time: '4 hours ago', status: 'success' },
    { id: 3, type: 'feedback', message: 'Client feedback on "Website Design"', time: '1 day ago', status: 'info' }
  ],
  projects: [
    { id: 1, name: 'Brand Identity Package', client: 'Acme Corp', progress: 85, status: 'In Progress', value: 2500, priority: 'high' },
    { id: 2, name: 'Mobile App Design', client: 'Tech Startup', progress: 40, status: 'In Progress', value: 5000, priority: 'urgent' }
  ]
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  const navigateToPage = (path: string) => {
    router.push(`/dashboard/${path}`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  // All available features organized by category - EXPANDED LIST
  const features = {
    core: [
      { name: 'My Day', path: 'my-day', icon: Calendar, description: 'AI-powered daily planning and productivity optimization' },
      { name: 'Projects Hub', path: 'projects-hub', icon: FolderOpen, description: 'Complete project lifecycle management system' },
      { name: 'Analytics', path: 'analytics', icon: TrendingUp, description: 'Advanced business intelligence and reporting' },
      { name: 'Time Tracking', path: 'time-tracking', icon: Clock, description: 'Advanced time tracking and productivity metrics' }
    ],
    ai: [
      { name: 'AI Create', path: 'ai-create', icon: Brain, description: 'Multi-model AI studio (GPT-4o, Claude, DALL-E)' },
      { name: 'AI Design', path: 'ai-design', icon: Palette, description: 'AI-powered design generation and optimization' },
      { name: 'AI Assistant', path: 'ai-assistant', icon: Zap, description: 'Personal AI assistant for workflow automation' },
      { name: 'AI Enhanced', path: 'ai-enhanced', icon: Star, description: 'Enhanced AI features and capabilities' }
    ],
    creative: [
      { name: 'Video Studio', path: 'video-studio', icon: Video, description: 'Professional video editing with AI transcription' },
      { name: 'Canvas', path: 'canvas', icon: Monitor, description: 'Interactive design and collaboration canvas' },
      { name: 'Canvas Collaboration', path: 'canvas-collaboration', icon: Users, description: 'Real-time canvas collaboration' },
      { name: 'Gallery', path: 'gallery', icon: Image, description: 'Portfolio showcase and asset management' },
      { name: 'CV & Portfolio', path: 'cv-portfolio', icon: User, description: 'Professional portfolio and resume builder' }
    ],
    business: [
      { name: 'Financial Hub', path: 'financial-hub', icon: DollarSign, description: 'Complete financial management and reporting' },
      { name: 'Financial', path: 'financial', icon: Wallet, description: 'Financial tracking and budgeting' },
      { name: 'Invoices', path: 'invoices', icon: Receipt, description: 'Invoice generation and payment tracking' },
      { name: 'Escrow', path: 'escrow', icon: Shield, description: 'Secure milestone-based payment protection' },
      { name: 'Bookings', path: 'bookings', icon: Calendar, description: 'Appointment and meeting scheduling system' },
      { name: 'Booking', path: 'booking', icon: Calendar, description: 'Simple booking management' }
    ],
    communication: [
      { name: 'Messages', path: 'messages', icon: MessageSquare, description: 'Integrated communication hub' },
      { name: 'Collaboration', path: 'collaboration', icon: Users, description: 'Real-time project collaboration tools' },
      { name: 'Team Hub', path: 'team-hub', icon: Building, description: 'Team management and coordination' },
      { name: 'Team', path: 'team', icon: Users, description: 'Team member management' },
      { name: 'Client Zone', path: 'client-zone', icon: UserCheck, description: 'Client portal and project sharing' },
      { name: 'Clients', path: 'clients', icon: Users, description: 'Client relationship management' }
    ],
    storage: [
      { name: 'Files Hub', path: 'files-hub', icon: FileText, description: 'Multi-cloud storage with optimization' },
      { name: 'Files', path: 'files', icon: Archive, description: 'File management and organization' },
      { name: 'Cloud Storage', path: 'cloud-storage', icon: Cloud, description: 'Advanced cloud storage management' },
      { name: 'Storage', path: 'storage', icon: Archive, description: 'Storage management and analytics' }
    ],
    productivity: [
      { name: 'Workflow Builder', path: 'workflow-builder', icon: Workflow, description: 'Custom workflow automation and templates' },
      { name: 'Notifications', path: 'notifications', icon: Bell, description: 'Smart notification management center' },
      { name: 'Calendar', path: 'calendar', icon: Calendar, description: 'Advanced calendar and scheduling' }
    ],
    community: [
      { name: 'Community Hub', path: 'community-hub', icon: Globe, description: 'Connect with 2,800+ creative professionals' },
      { name: 'Community', path: 'community', icon: Globe, description: 'Community features and networking' }
    ],
    settings: [
      { name: 'Settings', path: 'settings', icon: Settings, description: 'Platform configuration and preferences' },
      { name: 'Profile', path: 'profile', icon: User, description: 'Personal profile and account management' }
    ]
  }

  const renderOverviewTab = () => (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-8 pr-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">${mockData.earnings.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+12% from last month</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{mockData.activeProjects}</p>
                  <p className="text-sm text-blue-600">{mockData.completedProjects} completed</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900">{mockData.totalClients}</p>
                  <p className="text-sm text-purple-600">+8 this month</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{mockData.hoursThisMonth}</p>
                  <p className="text-sm text-orange-600">23h this week</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Active Projects
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateToPage('projects-hub')}
                className="gap-2"
              >
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.projects.map(project => (
              <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <Badge variant="outline" className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <div className={cn("w-2 h-2 rounded-full", getPriorityColor(project.priority))} />
                  </div>
                  <span className="font-medium text-green-600">${project.value.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Client: {project.client}</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                className="h-auto p-4 flex-col gap-2" 
                variant="outline"
                onClick={() => navigateToPage('projects-hub')}
              >
                <Plus className="h-5 w-5" />
                New Project
              </Button>
              <Button 
                className="h-auto p-4 flex-col gap-2" 
                variant="outline"
                onClick={() => navigateToPage('ai-create')}
              >
                <Brain className="h-5 w-5" />
                AI Create
              </Button>
              <Button 
                className="h-auto p-4 flex-col gap-2" 
                variant="outline"
                onClick={() => navigateToPage('my-day')}
              >
                <Calendar className="h-5 w-5" />
                My Day
              </Button>
              <Button 
                className="h-auto p-4 flex-col gap-2" 
                variant="outline"
                onClick={() => navigateToPage('messages')}
              >
                <MessageSquare className="h-5 w-5" />
                Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )

  const renderFeatureGrid = (categoryKey: string) => {
    const categoryFeatures = features[categoryKey]
    if (!categoryFeatures) return null

    const categoryNames = {
      core: 'Core Features',
      ai: 'AI Tools',
      creative: 'Creative Suite',
      business: 'Business Tools',
      communication: 'Communication',
      storage: 'Storage & Files',
      productivity: 'Productivity',
      community: 'Community',
      settings: 'Settings'
    }

    return (
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-6 pr-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{categoryNames[categoryKey]}</h3>
            <p className="text-gray-600">Explore our comprehensive {categoryNames[categoryKey].toLowerCase()}</p>
            <Badge variant="outline" className="mt-2">
              {categoryFeatures.length} tools available
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryFeatures.map(feature => {
              const Icon = feature.icon
              return (
                <Card 
                  key={feature.path} 
                  className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group h-full"
                  onClick={() => navigateToPage(feature.path)}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                          {feature.name}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 flex-1 line-clamp-3">
                      {feature.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 group-hover:bg-blue-50 group-hover:border-blue-200 text-xs"
                    >
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-white/20 bg-white/30 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
                  Welcome to KAZI
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-light">
                  Your complete creative business platform with 25+ integrated tools
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 p-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-600">Platform Status</p>
                      <p className="text-sm font-semibold text-green-600">All Systems Operational</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Flexible */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Scrollable Tab List */}
            <div className="mb-6">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-12 items-center justify-start rounded-3xl bg-white/60 backdrop-blur-xl border border-white/30 p-1 shadow-xl min-w-max">
                  <TabsTrigger value="overview" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="core" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Target className="h-4 w-4" />
                    <span>Core</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Brain className="h-4 w-4" />
                    <span>AI Tools</span>
                  </TabsTrigger>
                  <TabsTrigger value="creative" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Palette className="h-4 w-4" />
                    <span>Creative</span>
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <DollarSign className="h-4 w-4" />
                    <span>Business</span>
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <MessageSquare className="h-4 w-4" />
                    <span>Communication</span>
                  </TabsTrigger>
                  <TabsTrigger value="storage" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Cloud className="h-4 w-4" />
                    <span>Storage</span>
                  </TabsTrigger>
                  <TabsTrigger value="productivity" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Clock className="h-4 w-4" />
                    <span>Productivity</span>
                  </TabsTrigger>
                  <TabsTrigger value="community" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Globe className="h-4 w-4" />
                    <span>Community</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1">
              <TabsContent value="overview" className="mt-0 h-full">{renderOverviewTab()}</TabsContent>
              <TabsContent value="core" className="mt-0 h-full">{renderFeatureGrid('core')}</TabsContent>
              <TabsContent value="ai" className="mt-0 h-full">{renderFeatureGrid('ai')}</TabsContent>
              <TabsContent value="creative" className="mt-0 h-full">{renderFeatureGrid('creative')}</TabsContent>
              <TabsContent value="business" className="mt-0 h-full">{renderFeatureGrid('business')}</TabsContent>
              <TabsContent value="communication" className="mt-0 h-full">{renderFeatureGrid('communication')}</TabsContent>
              <TabsContent value="storage" className="mt-0 h-full">{renderFeatureGrid('storage')}</TabsContent>
              <TabsContent value="productivity" className="mt-0 h-full">{renderFeatureGrid('productivity')}</TabsContent>
              <TabsContent value="community" className="mt-0 h-full">{renderFeatureGrid('community')}</TabsContent>
              <TabsContent value="settings" className="mt-0 h-full">{renderFeatureGrid('settings')}</TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}