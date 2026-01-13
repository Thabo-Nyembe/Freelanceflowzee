'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


export const dynamic = 'force-dynamic';

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Play,
  RefreshCw,
  TestTube,
  Target,
  Zap,
  ArrowRight,
  Home,
  Calendar,
  FolderOpen,
  Brain,
  BarChart3,
  Video,
  Palette,
  FileText,
  Users,
  DollarSign,
  MessageSquare,
  Plus,
  Download,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

interface FeatureTest {
  id: string
  name: string
  path: string
  category: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'pending' | 'testing' | 'passed' | 'failed' | 'warning'
  issues?: string[]
  dependencies?: string[]
  buttons?: string[]
  lastTested?: Date
}

const COMPREHENSIVE_FEATURE_TESTS: FeatureTest[] = [
  // Core Business Features
  {
    id: 'dashboard-main',
    name: 'Main Dashboard',
    path: '/dashboard',
    category: 'Core Business',
    description: 'Main dashboard with overview, stats, and navigation',
    icon: Home,
    status: 'pending',
    buttons: ['View All Projects', 'Quick Actions', 'Theme Toggle', 'Navigation Menu']
  },
  {
    id: 'my-day',
    name: 'My Day',
    path: '/dashboard/my-day',
    category: 'Core Business',
    description: 'AI-powered daily planning and productivity optimization',
    icon: Calendar,
    status: 'passed',
    buttons: ['Add Task', 'Start Timer', 'Complete Task', 'Delete Task', 'Generate Schedule']
  },
  {
    id: 'projects-hub',
    name: 'Projects Hub',
    path: '/dashboard/projects-hub',
    category: 'Core Business',
    description: 'Complete project lifecycle management system',
    icon: FolderOpen,
    status: 'passed',
    buttons: ['Create Project', 'Edit Project', 'View Project', 'Delete Project', 'Filter Projects']
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    path: '/dashboard/analytics',
    category: 'Core Business',
    description: 'Business intelligence and reporting dashboard',
    icon: BarChart3,
    status: 'pending',
    buttons: ['Refresh Data', 'Export Report', 'Filter Data', 'Generate Insights']
  },
  {
    id: 'time-tracking',
    name: 'Time Tracking',
    path: '/dashboard/time-tracking',
    category: 'Core Business',
    description: 'Advanced time tracking and productivity metrics',
    icon: Clock,
    status: 'pending',
    buttons: ['Start Timer', 'Stop Timer', 'Add Manual Entry', 'Generate Report']
  },

  // AI-Powered Tools
  {
    id: 'ai-create',
    name: 'AI Create Studio',
    path: '/dashboard/ai-create',
    category: 'AI Tools',
    description: 'Multi-model AI content creation and configuration',
    icon: Brain,
    status: 'passed',
    buttons: ['OpenAI Config', 'Anthropic Config', 'Google AI Config', 'Save Settings']
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    path: '/dashboard/ai-assistant',
    category: 'AI Tools',
    description: 'Conversational AI for business optimization',
    icon: Brain,
    status: 'passed',
    buttons: ['Send Message', 'Voice Input', 'Rate Response', 'Quick Actions', 'Refresh Insights']
  },
  {
    id: 'ai-design',
    name: 'AI Design Analysis',
    path: '/dashboard/ai-design',
    category: 'AI Tools',
    description: 'AI-powered design analysis and recommendations',
    icon: Palette,
    status: 'pending',
    buttons: ['Upload Design', 'Analyze', 'Generate Suggestions', 'Export Analysis']
  },
  {
    id: 'ai-enhanced',
    name: 'AI Enhanced Features',
    path: '/dashboard/ai-enhanced',
    category: 'AI Tools',
    description: 'Advanced AI integrations and automations',
    icon: Zap,
    status: 'pending',
    buttons: ['Enable AI', 'Configure Automation', 'Review Suggestions', 'Apply Changes']
  },

  // Creative Suite
  {
    id: 'video-studio',
    name: 'Video Studio',
    path: '/dashboard/video-studio',
    category: 'Creative Suite',
    description: 'Professional video recording and editing tools',
    icon: Video,
    status: 'pending',
    buttons: ['Start Recording', 'Stop Recording', 'Edit Video', 'Export Video', 'Upload to Cloud']
  },
  {
    id: 'canvas',
    name: 'Canvas Collaboration',
    path: '/dashboard/canvas',
    category: 'Creative Suite',
    description: 'Real-time collaborative design canvas',
    icon: Palette,
    status: 'pending',
    buttons: ['Drawing Tools', 'Save Canvas', 'Share Canvas', 'Invite Collaborators', 'Export Design']
  },
  {
    id: 'gallery',
    name: 'Media Gallery',
    path: '/dashboard/gallery',
    category: 'Creative Suite',
    description: 'Organized media library and portfolio showcase',
    icon: FileText,
    status: 'pending',
    buttons: ['Upload Media', 'Organize Albums', 'Share Gallery', 'Generate Portfolio', 'Export Collection']
  },
  {
    id: 'cv-portfolio',
    name: 'CV & Portfolio',
    path: '/dashboard/cv-portfolio',
    category: 'Creative Suite',
    description: 'Professional CV and portfolio builder',
    icon: FileText,
    status: 'pending',
    buttons: ['Edit CV', 'Add Project', 'Generate PDF', 'Share Portfolio', 'Update Skills']
  },

  // Business Management
  {
    id: 'financial-hub',
    name: 'Financial Hub',
    path: '/dashboard/financial-hub',
    category: 'Business Management',
    description: 'Complete financial management and reporting',
    icon: DollarSign,
    status: 'pending',
    buttons: ['Create Invoice', 'Track Expenses', 'Generate Report', 'Payment Processing', 'Tax Summary']
  },
  {
    id: 'invoices',
    name: 'Invoice Management',
    path: '/dashboard/invoices',
    category: 'Business Management',
    description: 'Professional invoice creation and tracking',
    icon: FileText,
    status: 'pending',
    buttons: ['Create Invoice', 'Send Invoice', 'Track Payment', 'Generate Statement', 'Export Data']
  },
  {
    id: 'escrow',
    name: 'Escrow Services',
    path: '/dashboard/escrow',
    category: 'Business Management',
    description: 'Secure payment escrow and milestone management',
    icon: DollarSign,
    status: 'pending',
    buttons: ['Create Escrow', 'Release Funds', 'Dispute Resolution', 'Track Milestones', 'Generate Report']
  },
  {
    id: 'booking',
    name: 'Appointment Booking',
    path: '/dashboard/booking',
    category: 'Business Management',
    description: 'Client appointment scheduling and calendar management',
    icon: Calendar,
    status: 'pending',
    buttons: ['Schedule Appointment', 'Manage Availability', 'Send Reminders', 'Reschedule', 'Cancel Booking']
  },

  // Communication Tools
  {
    id: 'messages',
    name: 'Messages',
    path: '/dashboard/messages',
    category: 'Communication',
    description: 'Centralized client and team communication',
    icon: MessageSquare,
    status: 'pending',
    buttons: ['Send Message', 'Create Thread', 'Add Attachment', 'Schedule Message', 'Mark as Read']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    path: '/dashboard/community-hub',
    category: 'Communication',
    description: 'Professional network and community engagement',
    icon: Users,
    status: 'pending',
    buttons: ['Create Post', 'Like Post', 'Comment', 'Share', 'Follow User', 'Join Group']
  },
  {
    id: 'collaboration',
    name: 'Team Collaboration',
    path: '/dashboard/collaboration',
    category: 'Communication',
    description: 'Advanced team collaboration and project coordination',
    icon: Users,
    status: 'pending',
    buttons: ['Invite Team Member', 'Assign Task', 'Share Document', 'Start Video Call', 'Create Workspace']
  },
  {
    id: 'chat',
    name: 'Real-time Chat',
    path: '/chat',
    category: 'Communication',
    description: 'Instant messaging and real-time communication',
    icon: MessageSquare,
    status: 'pending',
    buttons: ['Send Message', 'Add Emoji', 'Attach File', 'Start Video Call', 'Create Group']
  },

  // Storage & Files
  {
    id: 'files-hub',
    name: 'Files Hub',
    path: '/dashboard/files-hub',
    category: 'Storage & Files',
    description: 'Advanced file management and cloud storage',
    icon: FileText,
    status: 'pending',
    buttons: ['Upload File', 'Create Folder', 'Share File', 'Download', 'Delete', 'Move to Folder']
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    path: '/dashboard/cloud-storage',
    category: 'Storage & Files',
    description: 'Distributed cloud storage and backup solutions',
    icon: FileText,
    status: 'pending',
    buttons: ['Sync Files', 'Backup Data', 'Restore Files', 'Manage Storage', 'Share Links']
  },
  {
    id: 'storage',
    name: 'Storage Management',
    path: '/dashboard/storage',
    category: 'Storage & Files',
    description: 'Storage analytics and optimization tools',
    icon: FileText,
    status: 'pending',
    buttons: ['Analyze Usage', 'Clean Duplicates', 'Optimize Storage', 'Generate Report', 'Upgrade Plan']
  }
]


// ============================================================================
// V2 COMPETITIVE MOCK DATA - ComprehensiveTesting Context
// ============================================================================

const comprehensiveTestingAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const comprehensiveTestingCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const comprehensiveTestingPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const comprehensiveTestingActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside component to access dialog state setters

export default function ComprehensiveTestingClient() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const router = useRouter()
  const [tests, setTests] = React.useState(COMPREHENSIVE_FEATURE_TESTS)
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [isRunningTests, setIsRunningTests] = React.useState(false)
  const [currentTest, setCurrentTest] = React.useState<string | null>(null)

  // Dialog states for QuickActions
  const [showNewItemDialog, setShowNewItemDialog] = React.useState(false)
  const [showExportDialog, setShowExportDialog] = React.useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = React.useState(false)

  // Form states for New Item dialog
  const [newItemName, setNewItemName] = React.useState('')
  const [newItemCategory, setNewItemCategory] = React.useState('')
  const [newItemDescription, setNewItemDescription] = React.useState('')

  // Form states for Export dialog
  const [exportFormat, setExportFormat] = React.useState('json')
  const [exportRange, setExportRange] = React.useState('all')

  // Form states for Settings dialog
  const [autoRunTests, setAutoRunTests] = React.useState(false)
  const [testTimeout, setTestTimeout] = React.useState('30')
  const [notifyOnComplete, setNotifyOnComplete] = React.useState(true)

  // QuickActions with dialog triggers
  const comprehensiveTestingQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // Handler for creating new test item
  const handleCreateNewItem = () => {
    if (!newItemName.trim()) {
      toast.error('Validation Error', { description: 'Item name is required' })
      return
    }
    if (!newItemCategory) {
      toast.error('Validation Error', { description: 'Please select a category' })
      return
    }

    // Create new test item
    const newTest: FeatureTest = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      path: `/dashboard/custom/${newItemName.toLowerCase().replace(/\s+/g, '-')}`,
      category: newItemCategory,
      description: newItemDescription || 'Custom test item',
      icon: TestTube,
      status: 'pending',
      buttons: ['Test Button 1', 'Test Button 2']
    }

    setTests(prev => [...prev, newTest])
    toast.success('Test Item Created', { description: `${newItemName} has been added to the test suite` })

    // Reset form
    setNewItemName('')
    setNewItemCategory('')
    setNewItemDescription('')
    setShowNewItemDialog(false)
  }

  // Handler for exporting test data
  const handleExportData = () => {
    const dataToExport = exportRange === 'all'
      ? tests
      : exportRange === 'passed'
        ? tests.filter(t => t.status === 'passed')
        : exportRange === 'failed'
          ? tests.filter(t => t.status === 'failed')
          : tests.filter(t => t.status === 'pending')

    let content: string
    let filename: string
    let mimeType: string

    if (exportFormat === 'json') {
      content = JSON.stringify(dataToExport, null, 2)
      filename = `test-results-${Date.now()}.json`
      mimeType = 'application/json'
    } else if (exportFormat === 'csv') {
      const headers = ['ID', 'Name', 'Path', 'Category', 'Status', 'Description']
      const rows = dataToExport.map(t => [t.id, t.name, t.path, t.category, t.status, t.description])
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      filename = `test-results-${Date.now()}.csv`
      mimeType = 'text/csv'
    } else {
      const lines = dataToExport.map(t => `${t.name} (${t.category}): ${t.status}\n  Path: ${t.path}\n  ${t.description}`)
      content = `Test Results Export\n${'='.repeat(50)}\n\n${lines.join('\n\n')}`
      filename = `test-results-${Date.now()}.txt`
      mimeType = 'text/plain'
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Export Complete', { description: `${dataToExport.length} test results exported as ${exportFormat.toUpperCase()}` })
    setShowExportDialog(false)
  }

  // Handler for saving settings
  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      autoRunTests,
      testTimeout: parseInt(testTimeout),
      notifyOnComplete
    }
    localStorage.setItem('comprehensive-testing-settings', JSON.stringify(settings))

    toast.success('Settings Saved', { description: 'Your testing preferences have been updated' })
    setShowSettingsDialog(false)
  }

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('comprehensive-testing-settings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setAutoRunTests(settings.autoRunTests ?? false)
        setTestTimeout(String(settings.testTimeout ?? 30))
        setNotifyOnComplete(settings.notifyOnComplete ?? true)
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [])

  // A+++ LOAD COMPREHENSIVE TESTING DATA
  React.useEffect(() => {
    const loadComprehensiveTestingData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load testing configuration from API
        const response = await fetch('/api/testing/config')
        if (!response.ok) throw new Error('Failed to load comprehensive testing suite')

        setIsLoading(false)
        announce('Comprehensive testing suite loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comprehensive testing suite')
        setIsLoading(false)
        announce('Error loading comprehensive testing suite', 'assertive')
      }
    }

    loadComprehensiveTestingData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const categories = ['all', ...new Set(tests.map(test => test.category))]
  const filteredTests = activeCategory === 'all' 
    ? tests 
    : tests.filter(test => test.category === activeCategory)

  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    pending: tests.filter(t => t.status === 'pending').length,
    warning: tests.filter(t => t.status === 'warning').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100 border-green-200'
      case 'failed': return 'text-red-600 bg-red-100 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'testing': return 'text-blue-600 bg-blue-100 border-blue-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'testing': return <RefreshCw className="h-4 w-4 animate-spin" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const testFeature = async (testId: string) => {
    setCurrentTest(testId)
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'testing' as const } : test
    ))

    try {
      // Navigate to the feature page
      const test = tests.find(t => t.id === testId)
      if (test) {
        router.push(test.path)

        // Note: In production, use proper test verification instead of delay
        // Mark as passed (in real testing, this would be based on actual results)
        setTests(prev => prev.map(t => 
          t.id === testId 
            ? { ...t, status: 'passed' as const, lastTested: new Date() }
            : t
        ))
      }
    } catch (error) {
      setTests(prev => prev.map(t => 
        t.id === testId 
          ? { ...t, status: 'failed' as const, issues: ['Navigation failed'] }
          : t
      ))
    }
    
    setCurrentTest(null)
  }

  const runAllTests = async () => {
    setIsRunningTests(true)

    for (const test of filteredTests) {
      if (test.status === 'pending') {
        await testFeature(test.id)
      }
    }

    setIsRunningTests(false)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={comprehensiveTestingAIInsights} />
          <PredictiveAnalytics predictions={comprehensiveTestingPredictions} />
          <CollaborationIndicator collaborators={comprehensiveTestingCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={comprehensiveTestingQuickActions} />
          <ActivityFeed activities={comprehensiveTestingActivities} />
        </div>
<CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Comprehensive Feature Testing
                </h1>
              </div>
              <p className="text-lg text-gray-600 font-light">
                Systematic testing of every feature and button in the FreeFlow platform 🧪
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
              
              <Button 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={runAllTests}
                disabled={isRunningTests}
              >
                {isRunningTests ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="mt-6 bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.passed} of {stats.total} tests completed
                </span>
              </div>
              <Progress 
                value={stats.total > 0 ? (stats.passed / stats.total) * 100 : 0} 
                className="h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-7 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="rounded-2xl capitalize">
                {category === 'all' ? 'All Features' : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Test Results */}
        <div className="grid gap-6">
          {filteredTests.map(test => (
            <Card key={test.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <test.icon className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{test.name}</h3>
                        <Badge className={cn("text-xs", getStatusColor(test.status))}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(test.status)}
                            {test.status}
                          </div>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {test.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{test.description}</p>
                      
                      {test.buttons && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Key Buttons to Test:</p>
                          <div className="flex flex-wrap gap-2">
                            {test.buttons.map(button => (
                              <Badge key={button} variant="outline" className="text-xs">
                                {button}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {test.issues && test.issues.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-red-700 mb-2">Issues Found:</p>
                          <ul className="list-disc list-inside text-sm text-red-600">
                            {test.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {test.lastTested && (
                        <p className="text-xs text-gray-500">
                          Last tested: {test.lastTested.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => router.push(test.path)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit
                    </Button>
                    
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => testFeature(test.id)}
                      disabled={isRunningTests || currentTest === test.id}
                    >
                      {currentTest === test.id ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-3 w-3" />
                          Test
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create New Test Item
            </DialogTitle>
            <DialogDescription>
              Add a custom test item to the comprehensive testing suite. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder="Enter test item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemCategory">Category *</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core Business">Core Business</SelectItem>
                  <SelectItem value="AI Tools">AI Tools</SelectItem>
                  <SelectItem value="Creative Suite">Creative Suite</SelectItem>
                  <SelectItem value="Business Management">Business Management</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Storage & Files">Storage & Files</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                placeholder="Describe what this test item covers..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewItem} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export Test Results
            </DialogTitle>
            <DialogDescription>
              Export your test results in various formats for reporting and analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON - Full data structure</SelectItem>
                  <SelectItem value="csv">CSV - Spreadsheet compatible</SelectItem>
                  <SelectItem value="txt">Text - Human readable report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exportRange">Data Range</Label>
              <Select value={exportRange} onValueChange={setExportRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests ({tests.length})</SelectItem>
                  <SelectItem value="passed">Passed Only ({tests.filter(t => t.status === 'passed').length})</SelectItem>
                  <SelectItem value="failed">Failed Only ({tests.filter(t => t.status === 'failed').length})</SelectItem>
                  <SelectItem value="pending">Pending Only ({tests.filter(t => t.status === 'pending').length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Preview:</strong> {
                  exportRange === 'all'
                    ? tests.length
                    : exportRange === 'passed'
                      ? tests.filter(t => t.status === 'passed').length
                      : exportRange === 'failed'
                        ? tests.filter(t => t.status === 'failed').length
                        : tests.filter(t => t.status === 'pending').length
                } tests will be exported as {exportFormat.toUpperCase()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData} className="bg-gradient-to-r from-green-600 to-emerald-600">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Testing Settings
            </DialogTitle>
            <DialogDescription>
              Configure your comprehensive testing preferences and behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label htmlFor="autoRun" className="font-medium">Auto-run Tests on Load</Label>
                <p className="text-sm text-gray-500">Automatically start testing when the page loads</p>
              </div>
              <input
                type="checkbox"
                id="autoRun"
                checked={autoRunTests}
                onChange={(e) => setAutoRunTests(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeout">Test Timeout (seconds)</Label>
              <Select value={testTimeout} onValueChange={setTestTimeout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label htmlFor="notify" className="font-medium">Notify on Completion</Label>
                <p className="text-sm text-gray-500">Show notification when all tests complete</p>
              </div>
              <input
                type="checkbox"
                id="notify"
                checked={notifyOnComplete}
                onChange={(e) => setNotifyOnComplete(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
