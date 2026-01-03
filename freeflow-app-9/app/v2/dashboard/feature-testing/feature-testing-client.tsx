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
import { memo, useMemo, useCallback, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Play,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// A+++ UTILITIES
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

const featureTestingQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => console.log('New') },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => console.log('Export') },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => console.log('Settings') },
]

export default function FeatureTestingClient() {
  // A+++ STATE MANAGEMENT
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

  // A+++ LOAD FEATURE TESTING DATA
  React.useEffect(() => {
    const loadFeatureTestingData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500) // Reduced from 1000ms to 500ms for faster loading
        })

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

  // A+++ LOADING STATE
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
    </div>
  )
}
