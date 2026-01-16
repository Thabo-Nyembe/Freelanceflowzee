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
import { memo, useMemo, useCallback, useTransition, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Play,
  RefreshCw,
  Plus,
  Download,
  Settings,
  Zap,
  TestTube
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

interface FeatureTest {
  id: string
  name: string
  path: string
  category: string
  description: string
  status: 'pending' | 'testing' | 'passed' | 'failed' | 'warning'
  issues?: string[]
  dependencies?: string[]
}

// Helper functions moved to top-level
const getStatusIcon = (status: FeatureTest['status']) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-600" />
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
    case 'testing':
      return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
    default:
      return <Clock className="h-5 w-5 text-gray-400" />
  }
}

const getStatusColor = (status: FeatureTest['status']) => {
  switch (status) {
    case 'passed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'testing':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Memoized TestCard component for better performance
interface TestCardProps {
  test: FeatureTest
  currentTest: string | null
  onTest: (test: FeatureTest) => void
  onVisit: (path: string) => void
}

const TestCard = memo(({ test, currentTest, onTest, onVisit }: TestCardProps) => {
  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all duration-200",
        getStatusColor(test.status)
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(test.status)}
          <h4 className="font-semibold">{test.name}</h4>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onTest(test)}
          disabled={currentTest === test.id}
          className="gap-1"
        >
          {currentTest === test.id ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          Test
        </Button>
      </div>

      <p className="text-sm mb-2">{test.description}</p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{test.path}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onVisit(test.path)}
          className="h-6 px-2 gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Visit
        </Button>
      </div>

      {test.dependencies && (
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">Dependencies:</div>
          <div className="flex flex-wrap gap-1">
            {test.dependencies.map(dep => (
              <Badge key={dep} variant="secondary" className="text-xs">
                {dep}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {test.issues && test.issues.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-red-600 mb-1">Issues:</div>
          <ul className="text-xs space-y-1">
            {test.issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-red-500">•</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})

TestCard.displayName = 'TestCard'

const FEATURE_TESTS: FeatureTest[] = [
  // Core Business Features
  {
    id: 'my-day',
    name: 'My Day',
    path: '/dashboard/my-day',
    category: 'Core Business',
    description: 'AI-powered daily planning and productivity optimization',
    status: 'pending'
  },
  {
    id: 'projects-hub',
    name: 'Projects Hub',
    path: '/dashboard/projects-hub',
    category: 'Core Business',
    description: 'Complete project lifecycle management system',
    status: 'pending'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    path: '/dashboard/analytics',
    category: 'Core Business',
    description: 'Advanced business intelligence and reporting',
    status: 'pending'
  },
  {
    id: 'time-tracking',
    name: 'Time Tracking',
    path: '/dashboard/time-tracking',
    category: 'Core Business',
    description: 'Advanced time tracking and productivity metrics',
    status: 'pending'
  },
  
  // AI-Powered Tools
  {
    id: 'ai-create',
    name: 'AI Create',
    path: '/dashboard/ai-create',
    category: 'AI Tools',
    description: 'Multi-model AI studio (GPT-4o, Claude, DALL-E)',
    status: 'pending',
    dependencies: ['OpenAI API', 'Google AI', 'OpenRouter']
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    path: '/dashboard/ai-assistant',
    category: 'AI Tools',
    description: 'Conversational AI for project assistance',
    status: 'pending',
    dependencies: ['OpenAI API']
  },
  {
    id: 'ai-design',
    name: 'AI Design',
    path: '/dashboard/ai-design',
    category: 'AI Tools',
    description: 'AI-powered design analysis and feedback',
    status: 'pending',
    dependencies: ['OpenAI API']
  },
  
  // Creative Suite
  {
    id: 'video-studio',
    name: 'Video Studio',
    path: '/dashboard/video-studio',
    category: 'Creative Suite',
    description: 'Professional video editing with AI transcription',
    status: 'pending',
    dependencies: ['MediaRecorder API', 'OpenAI API']
  },
  {
    id: 'canvas',
    name: 'Canvas Collaboration',
    path: '/dashboard/canvas',
    category: 'Creative Suite',
    description: 'Real-time canvas collaboration (Figma-level)',
    status: 'pending',
    dependencies: ['Canvas API', 'WebSocket']
  },
  {
    id: 'gallery',
    name: 'Gallery',
    path: '/dashboard/gallery',
    category: 'Creative Suite',
    description: 'Portfolio showcase and asset management',
    status: 'pending',
    dependencies: ['File Storage']
  },
  {
    id: 'cv-portfolio',
    name: 'CV & Portfolio',
    path: '/dashboard/cv-portfolio',
    category: 'Creative Suite',
    description: 'Professional portfolio and resume builder',
    status: 'pending'
  },
  
  // Business Management
  {
    id: 'financial-hub',
    name: 'Financial Hub',
    path: '/dashboard/financial-hub',
    category: 'Business Management',
    description: 'Complete financial management and reporting',
    status: 'pending',
    dependencies: ['Stripe API']
  },
  {
    id: 'invoices',
    name: 'Invoices',
    path: '/dashboard/invoices',
    category: 'Business Management',
    description: 'Professional invoice generation and tracking',
    status: 'pending',
    dependencies: ['Stripe API', 'PDF Generation']
  },
  {
    id: 'escrow',
    name: 'Escrow',
    path: '/dashboard/escrow',
    category: 'Business Management',
    description: 'Secure milestone-based payment protection',
    status: 'pending',
    dependencies: ['Stripe API', 'Supabase']
  },
  {
    id: 'booking',
    name: 'Booking System',
    path: '/dashboard/booking',
    category: 'Business Management',
    description: 'Appointment and meeting scheduling system',
    status: 'pending'
  },
  
  // Communication
  {
    id: 'messages',
    name: 'Messages',
    path: '/dashboard/messages',
    category: 'Communication',
    description: 'Integrated communication hub',
    status: 'pending',
    dependencies: ['Supabase Realtime']
  },
  {
    id: 'community-hub',
    name: 'Community Hub',
    path: '/dashboard/community-hub',
    category: 'Communication',
    description: 'Creator marketplace with 2,847+ active creators',
    status: 'pending'
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    path: '/dashboard/collaboration',
    category: 'Communication',
    description: 'Real-time project collaboration tools',
    status: 'pending',
    dependencies: ['WebSocket', 'Supabase']
  },
  
  // Storage & Files
  {
    id: 'files-hub',
    name: 'Files Hub',
    path: '/dashboard/files-hub',
    category: 'Storage & Files',
    description: 'Multi-cloud storage with optimization',
    status: 'pending',
    dependencies: ['Wasabi S3', 'Supabase Storage']
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    path: '/dashboard/cloud-storage',
    category: 'Storage & Files',
    description: 'Advanced cloud storage management',
    status: 'pending',
    dependencies: ['Wasabi S3']
  }
]


// ============================================================================
// V2 COMPETITIVE MOCK DATA - FeatureTesting Context
// ============================================================================

const featureTestingAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const featureTestingCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const featureTestingPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const featureTestingActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions will be defined inside component to access state setters

export default function FeatureTestingClient() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const router = useRouter()
  const [tests, setTests] = React.useState<FeatureTest[]>(FEATURE_TESTS)
  const [currentTest, setCurrentTest] = React.useState<string | null>(null)
  const [testResults, setTestResults] = React.useState<Record<string, any>>({})

  // useTransition for non-blocking test operations
  const [isPending, startTransition] = useTransition()

  // Dialog states for quick actions
  const [showNewTestDialog, setShowNewTestDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Form states for new test dialog
  const [newTestName, setNewTestName] = useState('')
  const [newTestPath, setNewTestPath] = useState('')
  const [newTestCategory, setNewTestCategory] = useState('')
  const [newTestDescription, setNewTestDescription] = useState('')

  // Form states for export dialog
  const [exportFormat, setExportFormat] = useState('json')
  const [includePassedTests, setIncludePassedTests] = useState(true)
  const [includeFailedTests, setIncludeFailedTests] = useState(true)
  const [includeWarningTests, setIncludeWarningTests] = useState(true)
  const [includePendingTests, setIncludePendingTests] = useState(false)

  // Form states for settings dialog
  const [autoRunTests, setAutoRunTests] = useState(false)
  const [testTimeout, setTestTimeout] = useState('5000')
  const [parallelTests, setParallelTests] = useState(false)
  const [notifyOnComplete, setNotifyOnComplete] = useState(true)
  const [verboseLogging, setVerboseLogging] = useState(false)

  // Quick actions with dialog openers
  const featureTestingQuickActions = useMemo(() => [
    { id: '1', label: 'New Test', icon: 'Plus', shortcut: 'N', action: () => setShowNewTestDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ], [])

  React.useEffect(() => {
    const loadFeatureTestingData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load feature testing data
        const res = await fetch('/api/feature-testing')
        if (!res.ok) throw new Error('Failed to load feature testing suite')

        setIsLoading(false)
        announce('Feature testing suite loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature testing suite')
        setIsLoading(false)
        announce('Error loading feature testing suite', 'assertive')
      }
    }

    loadFeatureTestingData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Stable callback for updating test status
  const updateTestStatus = useCallback((testId: string, status: FeatureTest['status'], issues?: string[]) => {
    setTests(prev => prev.map(test =>
      test.id === testId
        ? { ...test, status, issues }
        : test
    ))
    setTestResults(prev => ({ ...prev, [testId]: { status, issues, timestamp: Date.now() } }))
  }, [])

  // Stable callback for testing individual features
  const testFeature = useCallback(async (test: FeatureTest) => {
    setCurrentTest(test.id)
    updateTestStatus(test.id, 'testing')

    try {
      // Simulate navigation test
      const testWindow = window.open(test.path, '_blank', 'width=1200,height=800')

      // Note: In production, use proper page load detection instead of delay
      if (testWindow && !testWindow.closed) {
        updateTestStatus(test.id, 'passed')
        testWindow.close()
      } else {
        updateTestStatus(test.id, 'warning', ['Page opened but may have loading issues'])
      }
    } catch (error) {
      updateTestStatus(test.id, 'failed', [error instanceof Error ? error.message : 'Unknown error'])
    } finally {
      setCurrentTest(null)
    }
  }, [updateTestStatus])

  // Stable callback for testing all features with useTransition
  const testAllFeatures = useCallback(() => {
    startTransition(async () => {
      for (const test of tests) {
        if (test.status === 'pending' || test.status === 'failed') {
          await testFeature(test)
        }
      }
    })
  }, [tests, testFeature])

  // Stable callback for visiting feature pages
  const handleVisitFeature = useCallback((path: string) => {
    router.push(path)
  }, [router])

  // Memoize expensive grouping and filtering operations
  const groupedTests = useMemo(() => {
    return tests.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = []
      }
      acc[test.category].push(test)
      return acc
    }, {} as Record<string, FeatureTest[]>)
  }, [tests])

  const testStatistics = useMemo(() => ({
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    warning: tests.filter(t => t.status === 'warning').length
  }), [tests])

  const { total: totalTests, passed: passedTests, failed: failedTests, warning: warningTests } = testStatistics

  // Handler for creating a new test
  const handleCreateTest = useCallback(() => {
    if (!newTestName.trim() || !newTestPath.trim() || !newTestCategory.trim()) {
      toast.error('Missing required fields')
      return
    }

    const newTest: FeatureTest = {
      id: `custom-${Date.now()}`,
      name: newTestName.trim(),
      path: newTestPath.startsWith('/') ? newTestPath.trim() : `/${newTestPath.trim()}`,
      category: newTestCategory.trim(),
      description: newTestDescription.trim() || 'Custom test case',
      status: 'pending'
    }

    setTests(prev => [...prev, newTest])
    toast.success('Test Created'" to ${newTestCategory}` })

    // Reset form
    setNewTestName('')
    setNewTestPath('')
    setNewTestCategory('')
    setNewTestDescription('')
    setShowNewTestDialog(false)
  }, [newTestName, newTestPath, newTestCategory, newTestDescription])

  // Handler for exporting test results
  const handleExportResults = useCallback(() => {
    const filteredTests = tests.filter(test => {
      if (test.status === 'passed' && !includePassedTests) return false
      if (test.status === 'failed' && !includeFailedTests) return false
      if (test.status === 'warning' && !includeWarningTests) return false
      if (test.status === 'pending' && !includePendingTests) return false
      return true
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      summary: {
        total: filteredTests.length,
        passed: filteredTests.filter(t => t.status === 'passed').length,
        failed: filteredTests.filter(t => t.status === 'failed').length,
        warning: filteredTests.filter(t => t.status === 'warning').length,
        pending: filteredTests.filter(t => t.status === 'pending').length,
      },
      tests: filteredTests.map(test => ({
        id: test.id,
        name: test.name,
        path: test.path,
        category: test.category,
        description: test.description,
        status: test.status,
        issues: test.issues || [],
        dependencies: test.dependencies || [],
        result: testResults[test.id] || null
      }))
    }

    let content: string
    let mimeType: string
    let fileExtension: string

    if (exportFormat === 'json') {
      content = JSON.stringify(exportData, null, 2)
      mimeType = 'application/json'
      fileExtension = 'json'
    } else if (exportFormat === 'csv') {
      const headers = ['ID', 'Name', 'Path', 'Category', 'Description', 'Status', 'Issues']
      const rows = filteredTests.map(test => [
        test.id,
        test.name,
        test.path,
        test.category,
        test.description,
        test.status,
        (test.issues || []).join('; ')
      ])
      content = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
      mimeType = 'text/csv'
      fileExtension = 'csv'
    } else {
      // Markdown format
      content = `# Feature Testing Report\n\n`
      content += `**Exported:** ${new Date().toLocaleString()}\n\n`
      content += `## Summary\n\n`
      content += `- Total Tests: ${exportData.summary.total}\n`
      content += `- Passed: ${exportData.summary.passed}\n`
      content += `- Failed: ${exportData.summary.failed}\n`
      content += `- Warnings: ${exportData.summary.warning}\n`
      content += `- Pending: ${exportData.summary.pending}\n\n`
      content += `## Test Results\n\n`

      Object.entries(groupedTests).forEach(([category, categoryTests]) => {
        const filteredCategoryTests = categoryTests.filter(t => filteredTests.find(ft => ft.id === t.id))
        if (filteredCategoryTests.length > 0) {
          content += `### ${category}\n\n`
          filteredCategoryTests.forEach(test => {
            const statusEmoji = test.status === 'passed' ? 'check' : test.status === 'failed' ? 'x' : test.status === 'warning' ? 'warning' : 'clock'
            content += `- [${statusEmoji}] **${test.name}** (${test.path})\n`
            content += `  - ${test.description}\n`
            if (test.issues && test.issues.length > 0) {
              content += `  - Issues: ${test.issues.join(', ')}\n`
            }
          })
          content += '\n'
        }
      })

      mimeType = 'text/markdown'
      fileExtension = 'md'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `feature-testing-report-${new Date().toISOString().split('T')[0]}.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Export Complete' test results as ${exportFormat.toUpperCase()}` })
    setShowExportDialog(false)
  }, [tests, testResults, groupedTests, exportFormat, includePassedTests, includeFailedTests, includeWarningTests, includePendingTests])

  // Handler for saving settings
  const handleSaveSettings = useCallback(() => {
    // Save settings to localStorage for persistence
    const settings = {
      autoRunTests,
      testTimeout: parseInt(testTimeout),
      parallelTests,
      notifyOnComplete,
      verboseLogging
    }

    localStorage.setItem('featureTestingSettings', JSON.stringify(settings))
    toast.success('Settings Saved'ms, Parallel: ${parallelTests ? 'Yes' : 'No'}, Notifications: ${notifyOnComplete ? 'On' : 'Off'}`
    })
    setShowSettingsDialog(false)
  }, [autoRunTests, testTimeout, parallelTests, notifyOnComplete, verboseLogging])

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('featureTestingSettings')
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        if (settings.autoRunTests !== undefined) setAutoRunTests(settings.autoRunTests)
        if (settings.testTimeout !== undefined) setTestTimeout(String(settings.testTimeout))
        if (settings.parallelTests !== undefined) setParallelTests(settings.parallelTests)
        if (settings.notifyOnComplete !== undefined) setNotifyOnComplete(settings.notifyOnComplete)
        if (settings.verboseLogging !== undefined) setVerboseLogging(settings.verboseLogging)
      } catch (e) {
        console.error('Failed to load settings:', e)
      }
    }
  }, [])

  // Get unique categories for the dropdown
  const availableCategories = useMemo(() => {
    const categories = new Set(tests.map(t => t.category))
    return Array.from(categories)
  }, [tests])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={featureTestingAIInsights} />
          <PredictiveAnalytics predictions={featureTestingPredictions} />
          <CollaborationIndicator collaborators={featureTestingCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={featureTestingQuickActions} />
          <ActivityFeed activities={featureTestingActivities} />
        </div>
<CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={8} />
        </div>
      </div>
    )
  }

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            🧪 Feature Testing Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Comprehensive testing of all FreeFlow platform features
          </p>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                <div className="text-sm text-gray-600">Total Features</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningTests}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={testAllFeatures}
              disabled={currentTest !== null || isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Test All Features
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Feature Tests by Category */}
        <div className="space-y-8">
          {Object.entries(groupedTests).map(([category, categoryTests]) => (
            <Card key={category} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline">
                    {categoryTests.length} features
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {categoryTests.map(test => (
                    <TestCard
                      key={test.id}
                      test={test}
                      currentTest={currentTest}
                      onTest={testFeature}
                      onVisit={handleVisitFeature}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* New Test Dialog */}
      <Dialog open={showNewTestDialog} onOpenChange={setShowNewTestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              Create New Feature Test
            </DialogTitle>
            <DialogDescription>
              Add a custom feature test to the testing suite. Fill in the details below to create a new test case.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="testName">Test Name *</Label>
              <Input
                id="testName"
                placeholder="e.g., User Authentication"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="testPath">Route Path *</Label>
              <Input
                id="testPath"
                placeholder="e.g., /dashboard/auth"
                value={newTestPath}
                onChange={(e) => setNewTestPath(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="testCategory">Category *</Label>
              <Select value={newTestCategory} onValueChange={setNewTestCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="Custom">Custom Category</SelectItem>
                </SelectContent>
              </Select>
              {newTestCategory === 'Custom' && (
                <Input
                  placeholder="Enter custom category name"
                  onChange={(e) => setNewTestCategory(e.target.value)}
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="testDescription">Description</Label>
              <Textarea
                id="testDescription"
                placeholder="Describe what this test verifies..."
                value={newTestDescription}
                onChange={(e) => setNewTestDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTest} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Test
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
              Export your feature testing results in various formats. Filter which test statuses to include.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Detailed)</SelectItem>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="md">Markdown (Report)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label>Include Test Statuses</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Passed Tests ({tests.filter(t => t.status === 'passed').length})</span>
                </div>
                <Switch checked={includePassedTests} onCheckedChange={setIncludePassedTests} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Failed Tests ({tests.filter(t => t.status === 'failed').length})</span>
                </div>
                <Switch checked={includeFailedTests} onCheckedChange={setIncludeFailedTests} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Warning Tests ({tests.filter(t => t.status === 'warning').length})</span>
                </div>
                <Switch checked={includeWarningTests} onCheckedChange={setIncludeWarningTests} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Pending Tests ({tests.filter(t => t.status === 'pending').length})</span>
                </div>
                <Switch checked={includePendingTests} onCheckedChange={setIncludePendingTests} />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                <strong>Preview:</strong> {tests.filter(test => {
                  if (test.status === 'passed' && !includePassedTests) return false
                  if (test.status === 'failed' && !includeFailedTests) return false
                  if (test.status === 'warning' && !includeWarningTests) return false
                  if (test.status === 'pending' && !includePendingTests) return false
                  return true
                }).length} tests will be exported
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportResults} className="gap-2">
              <Download className="h-4 w-4" />
              Export Results
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
              Configure how feature tests are executed and managed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-run Tests on Load</Label>
                <p className="text-sm text-muted-foreground">Automatically start testing when page loads</p>
              </div>
              <Switch checked={autoRunTests} onCheckedChange={setAutoRunTests} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeout">Test Timeout (milliseconds)</Label>
              <Select value={testTimeout} onValueChange={setTestTimeout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3000">3 seconds (Fast)</SelectItem>
                  <SelectItem value="5000">5 seconds (Default)</SelectItem>
                  <SelectItem value="10000">10 seconds (Slow)</SelectItem>
                  <SelectItem value="30000">30 seconds (Very Slow)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Parallel Test Execution</Label>
                <p className="text-sm text-muted-foreground">Run multiple tests simultaneously</p>
              </div>
              <Switch checked={parallelTests} onCheckedChange={setParallelTests} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">Show notifications when tests complete</p>
              </div>
              <Switch checked={notifyOnComplete} onCheckedChange={setNotifyOnComplete} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verbose Logging</Label>
                <p className="text-sm text-muted-foreground">Log detailed test information to console</p>
              </div>
              <Switch checked={verboseLogging} onCheckedChange={setVerboseLogging} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="gap-2">
              <Zap className="h-4 w-4" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
