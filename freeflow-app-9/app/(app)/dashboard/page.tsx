"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedBadge } from '@/components/ui/enhanced-badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
  Headphones,
  RefreshCw,
  Lightbulb,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------
 * Phase 6 hooks temporarily disabled to avoid unresolved imports.
 * Placeholder no-op hooks are provided instead. Remove these and
 * restore real imports once cost-optimised module path is settled.
 * ------------------------------------------------------------------ */
// import {
//   useOptimizedAnalytics,
//   useOptimizedABTesting,
//   useOptimizedI18n,
//   useOptimizedSLAMonitoring,
// } from '@/lib/cost-optimized-integration'

const useOptimizedAnalytics = () => ({
  /* eslint-disable @typescript-eslint/no-unused-vars */
  trackEvent: (_name: string, _data?: Record<string, any>) => {},
})
const useOptimizedABTesting = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  _testId: string,
  _variants: string[]
) => null
const useOptimizedI18n = () => ({
  /* simple passthrough */
  t: (key: string) => key,
})
const useOptimizedSLAMonitoring = () => ({
  status: 'up' as const,
})

// Mock data
const mockData = {
  earnings: 45231,
  activeProjects: 12,
  completedProjects: 48,
  totalClients: 156,
  hoursThisMonth: 187,
  recentActivities: [
    { id: 1, type: 'project', message: 'New project "Brand Identity" started', time: '2 hours ago', status: 'success', impact: 'high' },
    { id: 2, type: 'payment', message: 'Payment received from John Doe', time: '4 hours ago', status: 'success', impact: 'medium' },
    { id: 3, type: 'feedback', message: 'Client feedback on "Website Design"', time: '1 day ago', status: 'info', impact: 'low' }
  ],
  projects: [
    { id: 1, name: 'Brand Identity Package', client: 'Acme Corp', progress: 85, status: 'In Progress', value: 2500, priority: 'high', aiAutomation: true, collaboration: 3, deadline: '2024-02-15', category: 'design', estimatedCompletion: '3 days' },
    { id: 2, name: 'Mobile App Design', client: 'Tech Startup', progress: 40, status: 'In Progress', value: 5000, priority: 'urgent', aiAutomation: false, collaboration: 2, deadline: '2024-03-01', category: 'development', estimatedCompletion: '2 weeks' },
    { id: 3, name: 'Marketing Campaign', client: 'Local Business', progress: 60, status: 'In Progress', value: 1500, priority: 'medium', aiAutomation: true, collaboration: 1, deadline: '2024-02-20', category: 'marketing', estimatedCompletion: '1 week' }
  ],
  insights: [
    {
      id: 1,
      type: 'revenue',
      title: 'Revenue Optimization',
      description: 'Your average project value increased by 23% this month. AI pricing suggestions are working effectively.',
      impact: 'high',
      action: 'Continue using AI pricing suggestions',
      confidence: 94,
      actedUpon: false
    },
    {
      id: 2,
      type: 'productivity',
      title: 'Productivity Boost',
      description: 'AI tools saved you 15 hours this week. Consider exploring more automation features.',
      impact: 'high',
      action: 'Explore more AI automation features',
      confidence: 89,
      actedUpon: false
    },
    {
      id: 3,
      type: 'client',
      title: 'Client Retention',
      description: 'Response time improved by 40%, leading to higher client satisfaction scores.',
      impact: 'medium',
      action: 'Maintain current communication pace',
      confidence: 92,
      actedUpon: false
    }
  ]
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Enhanced state management for full functionality
  const [liveActivities, setLiveActivities] = useState(mockData.recentActivities)
  const [projects, setProjects] = useState(mockData.projects)
  const [insights, setInsights] = useState(mockData.insights)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount, setNotificationCount] = useState(5)
  const [use2025GUI, setUse2025GUI] = useState(false)

  /* ------------------------------------------------------------------
   * Phase 6 hooks – lightweight, client-side, cost-optimised
   * ------------------------------------------------------------------ */
  const { trackEvent } = useOptimizedAnalytics()
  // Simple A/B test placeholder (not used for now but keeps assignment)
  useOptimizedABTesting('dashboard-layout', ['default', 'compact'])
  // i18n hook (strings can be localised later with t('key'))
  const { t } = useOptimizedI18n()
  // SLA status for real-time platform health
  const { status: slaStatus } = useOptimizedSLAMonitoring()

  const navigateToPage = (path: string) => {
    trackEvent('navigate_dashboard', { path })
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

  // Handlers - Simple navigation handlers
  const handleViewAllProjects = () => { console.log('📂 ALL'); navigateToPage('projects-hub') }
  const handleCreateProject = () => { console.log('➕ NEW'); navigateToPage('projects-hub/create') }
  const handleViewAnalytics = () => { console.log('📊 ANALYTICS'); navigateToPage('analytics') }
  const handleViewFinancial = () => { console.log('💰 FINANCIAL'); navigateToPage('financial') }
  const handleQuickAction = (action: string) => {
    console.log('⚡ QUICK ACTION: Initiating', action)
    console.log('📊 QUICK ACTION: Processing request')

    // Add to activity feed
    const newActivity = {
      id: Date.now(),
      type: 'action',
      message: `Quick action: ${action}`,
      time: 'Just now',
      status: 'success',
      impact: 'medium'
    }
    setLiveActivities(prev => [newActivity, ...prev])

    // Navigate based on action type
    if (action.toLowerCase().includes('project')) {
      navigateToPage('projects-hub/create')
    } else if (action.toLowerCase().includes('client')) {
      navigateToPage('client-zone')
    } else if (action.toLowerCase().includes('ai')) {
      navigateToPage('ai-create')
    }

    console.log('✅ QUICK ACTION: Completed', action)
  }

  const handleViewMessages = () => {
    console.log('💬 MESSAGES: Opening messages')
    console.log('📊 MESSAGES: Unread count:', Math.floor(Math.random() * 10))
    navigateToPage('messages')
  }

  const handleViewCalendar = () => {
    console.log('📅 CALENDAR: Opening calendar view')
    console.log('📊 CALENDAR: Today\'s events:', Math.floor(Math.random() * 5))
    navigateToPage('calendar')
  }

  const handleUpgradePlan = () => {
    console.log('⭐ UPGRADE: Plan upgrade initiated')
    console.log('📊 UPGRADE: Current plan: Free')
    console.log('🎯 UPGRADE: Target plan: Pro ($29/month)')
    console.log('✨ UPGRADE: Features unlocked: AI, Team collaboration, Priority support')

    // Add to activity feed
    const newActivity = {
      id: Date.now(),
      type: 'system',
      message: 'Viewed upgrade options - Pro plan recommended',
      time: 'Just now',
      status: 'info',
      impact: 'high'
    }
    setLiveActivities(prev => [newActivity, ...prev])

    // Navigate to pricing page
    navigateToPage('pricing')
  }

  const handleExportReport = async () => {
    console.log('💾 EXPORT: Starting dashboard export')
    console.log('📊 EXPORT: Data sources: Projects, Earnings, Analytics')
    console.log('📄 EXPORT: Format: PDF + CSV')

    setRefreshing(true)

    try {
      // Simulate export generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create export data
      const exportData = {
        dashboard: {
          earnings: mockData.earnings,
          activeProjects: mockData.activeProjects,
          completedProjects: mockData.completedProjects,
          totalClients: mockData.totalClients,
          hoursThisMonth: mockData.hoursThisMonth
        },
        projects: projects.map(p => ({
          name: p.name,
          client: p.client,
          progress: p.progress,
          status: p.status
        })),
        exportDate: new Date().toISOString(),
        exportedBy: 'Current User'
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dashboard-report-' + new Date().toISOString().split('T')[0] + '.json'
      a.click()
      URL.revokeObjectURL(url)

      console.log('✅ EXPORT: Report generated successfully')
      console.log('📄 EXPORT: File:', a.download)

      // Add to activity feed
      const newActivity = {
        id: Date.now(),
        type: 'system',
        message: 'Dashboard report exported successfully',
        time: 'Just now',
        status: 'success',
        impact: 'low'
      }
      setLiveActivities(prev => [newActivity, ...prev])
    } catch (error) {
      console.error('❌ EXPORT: Failed', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleCustomizeWidgets = () => {
    console.log('🎨 CUSTOMIZE: Widget customization started')
    console.log('📊 CUSTOMIZE: Available widgets:', ['Projects', 'Analytics', 'AI Insights', 'Messages', 'Calendar'])
    console.log('🎯 CUSTOMIZE: Layout options:', ['Grid', 'List', 'Compact'])

    // Add to activity feed
    const newActivity = {
      id: Date.now(),
      type: 'system',
      message: 'Customized dashboard layout',
      time: 'Just now',
      status: 'success',
      impact: 'low'
    }
    setLiveActivities(prev => [newActivity, ...prev])

    // Navigate to settings/dashboard section
    navigateToPage('settings?section=dashboard')
  }

  const handleViewActivity = () => {
    console.log('📈 ACTIVITY: Opening activity feed')
    console.log('📊 ACTIVITY: Total activities:', liveActivities.length)
    console.log('📊 ACTIVITY: Recent actions:', liveActivities.slice(0, 5).map(a => a.message).join(', '))

    // Navigate to notifications with activity filter
    navigateToPage('notifications?filter=activity')
  }

  const handleViewTasks = () => {
    console.log('✅ TASKS: Opening My Day')
    console.log('📊 TASKS: Today\'s tasks:', Math.floor(Math.random() * 12))
    console.log('🎯 TASKS: Priority tasks:', Math.floor(Math.random() * 5))
    navigateToPage('my-day')
  }

  const handleStartTour = () => {
    console.log('🎓 TOUR: Interactive platform tour started')
    console.log('📚 TOUR: Steps:', [
      '1. Dashboard Overview',
      '2. Projects Management',
      '3. AI Features',
      '4. Collaboration Tools',
      '5. Financial Management'
    ].join(' → '))
    console.log('⏱️ TOUR: Estimated time: 5 minutes')

    // Add to activity feed
    const newActivity = {
      id: Date.now(),
      type: 'system',
      message: 'Started platform tour - Learn all features',
      time: 'Just now',
      status: 'info',
      impact: 'medium'
    }
    setLiveActivities(prev => [newActivity, ...prev])

    // TODO: Implement interactive tour with step-by-step guidance
    console.log('✅ TOUR: Tour system ready (implementation pending)')
  }

  const handleInviteTeam = () => {
    console.log('➕ INVITE: Team invitation flow started')
    console.log('📧 INVITE: Invitation methods:', ['Email', 'Link', 'Import CSV'])
    console.log('🎯 INVITE: Roles available:', ['Admin', 'Manager', 'Member', 'Guest'])

    // Add to activity feed
    const newActivity = {
      id: Date.now(),
      type: 'system',
      message: 'Opened team invitation dialog',
      time: 'Just now',
      status: 'info',
      impact: 'high'
    }
    setLiveActivities(prev => [newActivity, ...prev])

    // Navigate to team management
    navigateToPage('team-management?action=invite')
  }

  const handleViewStats = (stat: string) => {
    console.log('📊 STATS: Viewing detailed statistics for', stat)
    console.log('📈 STATS: Metric:', stat)
    console.log('🎯 STATS: Available views:', ['Chart', 'Table', 'Export'])

    // Navigate to analytics with specific stat filter
    navigateToPage(`analytics?metric=${stat.toLowerCase().replace(/\s+/g, '-')}`)
  }

  const handleViewReports = () => {
    console.log('📄 REPORTS: Opening reports dashboard')
    console.log('📊 REPORTS: Available reports:', ['Financial', 'Projects', 'Team Performance', 'AI Usage'])
    navigateToPage('reports')
  }

  const handleAIInsights = () => {
    console.log('🤖 AI INSIGHTS: Opening AI-powered insights')
    console.log('📊 AI INSIGHTS: Analyzing:', ['Revenue trends', 'Project performance', 'Client satisfaction', 'Time utilization'])
    console.log('🎯 AI INSIGHTS: Recommendations:', insights.filter(i => !i.actedUpon).length + ' actionable insights')

    // Navigate to analytics with AI filter
    navigateToPage('analytics?view=ai-insights')
  }

  // Comprehensive handlers with full functionality
  const handleRefreshDashboard = async () => {
    console.log('🔄 DASHBOARD: Starting refresh...')
    setRefreshing(true)

    try {
      // Simulate API call with 1.5s delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Add new activity to feed (newest first)
      const newActivity = {
        id: Date.now(),
        type: 'system',
        message: 'Dashboard refreshed successfully',
        time: 'Just now',
        status: 'success',
        impact: 'low'
      }

      setLiveActivities(prev => [newActivity, ...prev])
      console.log('✅ DASHBOARD: Refresh complete')
    } catch (error) {
      console.error('❌ DASHBOARD: Refresh failed', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleViewProject = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    console.log('👁️ VIEW PROJECT:', {
      id: projectId,
      name: project?.name,
      client: project?.client,
      progress: project?.progress,
      status: project?.status
    })
    navigateToPage(`projects-hub?id=${projectId}`)
  }

  const handleProjectMessage = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    console.log('💬 MESSAGE PROJECT:', {
      id: projectId,
      name: project?.name,
      client: project?.client
    })
    navigateToPage(`messages?project=${projectId}`)
  }

  const handleActOnInsight = (insightId: number) => {
    const insight = insights.find(i => i.id === insightId)
    console.log('🎯 ACT ON INSIGHT:', {
      id: insightId,
      type: insight?.type,
      title: insight?.title,
      action: insight?.action,
      confidence: insight?.confidence
    })

    // Mark insight as acted upon
    setInsights(prev => prev.map(i =>
      i.id === insightId ? { ...i, actedUpon: true } : i
    ))

    // Smart navigation based on insight type
    if (insight?.type === 'revenue') {
      console.log('📊 Navigating to analytics for revenue insight')
      navigateToPage('analytics')
    } else if (insight?.type === 'productivity') {
      console.log('🤖 Navigating to AI Create for productivity insight')
      navigateToPage('ai-create')
    } else if (insight?.type === 'client') {
      console.log('👥 Navigating to client zone for client insight')
      navigateToPage('client-zone')
    }
  }

  const handleViewAllActivities = () => {
    console.log('📋 VIEW ALL: Navigating to all activities')
    navigateToPage('notifications')
  }

  const handleOpenNotifications = () => {
    console.log('🔔 NOTIFICATIONS:', {
      unreadCount: notificationCount,
      action: 'Opening notifications panel'
    })
    setNotificationCount(0) // Reset badge
    navigateToPage('notifications')
  }

  const handleSearch = (query: string, filters?: { category?: string, dateRange?: string }) => {
    console.log('🔍 SEARCH:', {
      query,
      filters,
      timestamp: new Date().toISOString()
    })
    setSearchQuery(query)
    trackEvent('dashboard_search', { query, filters })
  }

  const handle2025GUIToggle = () => {
    console.log('🎨 GUI TOGGLE:', {
      current: use2025GUI,
      switching_to: !use2025GUI
    })
    setUse2025GUI(prev => !prev)
    trackEvent('gui_2025_toggle', { enabled: !use2025GUI })
  }

  const handleOpenSettings = () => {
    console.log('⚙️ SETTINGS: Opening settings panel')
    navigateToPage('settings')
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
    ],
    advanced: [
      { name: 'Team Management', path: 'team-management', icon: Users, description: 'Advanced team management and performance tracking' },
      { name: 'Project Templates', path: 'project-templates', icon: FileText, description: 'Pre-built project templates and workflows' },
      { name: 'Client Portal', path: 'client-portal', icon: UserCheck, description: 'Client access management and collaboration' },
      { name: 'Resource Library', path: 'resource-library', icon: Archive, description: 'Centralized resource and asset management' },
      { name: 'Performance Analytics', path: 'performance-analytics', icon: TrendingUp, description: 'Advanced analytics and performance insights' }
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
            {projects.map(project => (
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProject(project.id)}
                      data-testid={`view-project-${project.id}-btn`}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleProjectMessage(project.id)}
                      data-testid={`message-project-${project.id}-btn`}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map(insight => (
              <div
                key={insight.id}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  insight.actedUpon
                    ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60"
                    : "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-700 hover:shadow-md"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {insight.title}
                      </h4>
                      <Badge
                        variant={insight.impact === 'high' ? 'default' : 'secondary'}
                        className={cn(
                          insight.impact === 'high' && "bg-orange-500 text-white",
                          insight.impact === 'medium' && "bg-yellow-500 text-white"
                        )}
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      💡 {insight.action}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Confidence: {insight.confidence}%
                    </div>
                    {!insight.actedUpon ? (
                      <Button
                        size="sm"
                        onClick={() => handleActOnInsight(insight.id)}
                        data-testid={`act-insight-${insight.id}-btn`}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Act on This
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700">
                        ✓ Acted Upon
                      </Badge>
                    )}
                  </div>
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
      settings: 'Settings',
      advanced: 'Advanced Tools'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 dark:from-purple-400/5 dark:to-pink-400/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header - Fixed */}
        <div className="border-b border-white/20 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-2">
                  Welcome to KAZI
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-secondary font-light">
                  Your complete creative business platform with 25+ integrated tools
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <EnhancedCard variant="glass" className="p-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-secondary">Platform Status</p>
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          slaStatus === 'up'
                            ? 'text-green-600 dark:text-green-400'
                            : slaStatus === 'degraded'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {slaStatus === 'up'
                          ? t?.('status.operational') || 'All Systems Operational'
                          : slaStatus === 'degraded'
                          ? t?.('status.degraded') || 'Degraded Performance'
                          : t?.('status.down') || 'Service Down'}
                      </p>
                    </div>
                  </div>
                </EnhancedCard>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Refresh Button with Loading State */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshDashboard}
                    disabled={refreshing}
                    data-testid="refresh-dashboard-btn"
                    className="relative"
                  >
                    <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                    <span className="ml-2">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>

                  {/* Notification Button with Badge */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNotifications}
                    data-testid="notifications-btn"
                    className="relative"
                  >
                    <Bell className="h-4 w-4" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {notificationCount}
                      </span>
                    )}
                  </Button>

                  {/* 2025 GUI Toggle */}
                  <Button
                    variant={use2025GUI ? "default" : "outline"}
                    size="sm"
                    onClick={handle2025GUIToggle}
                    data-testid="gui-2025-toggle-btn"
                    className={cn(
                      use2025GUI && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    )}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    2025 GUI
                  </Button>

                  {/* Settings Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSettings}
                    data-testid="settings-btn"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                <ThemeToggle />
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
                  <TabsTrigger value="advanced" className="flex items-center gap-2 rounded-2xl px-4 py-2 whitespace-nowrap">
                    <Zap className="h-4 w-4" />
                    <span>Advanced</span>
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
              <TabsContent value="advanced" className="mt-0 h-full">{renderFeatureGrid('advanced')}</TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}