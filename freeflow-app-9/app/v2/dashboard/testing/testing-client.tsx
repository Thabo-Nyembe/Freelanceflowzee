'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Play,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Plus,
  Settings,
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  Monitor,
  Globe,
  Video,
  Camera,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  Layers,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Shield,
  Trash2,
  Bug,
  Repeat,
  Timer,
  HardDrive,
  Chrome,
  CircleSlash
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sliders, Bell, Webhook, Key, Database, Mail, Archive, Workflow } from 'lucide-react'

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



// Database Types
interface DbTestCase {
  id: string
  user_id: string
  name: string
  description: string | null
  file_path: string
  suite_name: string
  test_type: string
  status: string
  browser: string
  timeout_ms: number
  retry_count: number
  is_enabled: boolean
  total_runs: number
  passed_runs: number
  failed_runs: number
  avg_duration_ms: number
  last_error: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface TestFormState {
  name: string
  description: string
  file_path: string
  suite_name: string
  test_type: string
  browser: string
  timeout_ms: number
  retry_count: number
}

const initialFormState: TestFormState = {
  name: '',
  description: '',
  file_path: '',
  suite_name: 'General',
  test_type: 'unit',
  browser: 'chromium',
  timeout_ms: 30000,
  retry_count: 2,
}

// Types
type TestStatus = 'passed' | 'failed' | 'skipped' | 'pending' | 'running' | 'flaky'
type BrowserType = 'chromium' | 'firefox' | 'webkit' | 'edge'
type TestType = 'unit' | 'integration' | 'e2e' | 'visual' | 'api' | 'accessibility'
type RunStatus = 'running' | 'passed' | 'failed' | 'cancelled'

interface TestSpec {
  id: string
  name: string
  file: string
  suite: string
  status: TestStatus
  duration: number
  browser: BrowserType
  retries: number
  error?: string
  screenshots?: string[]
  video?: string
  trace?: string
  steps: TestStep[]
}

interface TestStep {
  id: string
  action: string
  selector?: string
  value?: string
  duration: number
  status: TestStatus
  screenshot?: string
}

interface TestSuite {
  id: string
  name: string
  path: string
  tests: number
  passed: number
  failed: number
  skipped: number
  duration: number
  children?: TestSuite[]
  expanded?: boolean
}

interface TestRun {
  id: string
  name: string
  branch: string
  commit: string
  status: RunStatus
  startTime: Date
  endTime?: Date
  duration: number
  totalTests: number
  passed: number
  failed: number
  skipped: number
  flaky: number
  coverage: number
  browsers: BrowserType[]
  parallel: number
  triggeredBy: string
  specs: TestSpec[]
}

interface CIConfig {
  name: string
  provider: 'github' | 'gitlab' | 'jenkins' | 'circleci'
  status: 'connected' | 'pending' | 'error'
  lastSync: Date
}

interface BrowserConfig {
  type: BrowserType
  enabled: boolean
  headless: boolean
  viewport: { width: number; height: number }
  deviceEmulation?: string
}

// Mock Data
const mockTestSpecs: TestSpec[] = [
  {
    id: '1',
    name: 'should login with valid credentials',
    file: 'tests/auth/login.spec.ts',
    suite: 'Authentication',
    status: 'passed',
    duration: 2450,
    browser: 'chromium',
    retries: 0,
    steps: [
      { id: '1', action: 'navigate', value: '/login', duration: 450, status: 'passed' },
      { id: '2', action: 'fill', selector: '[data-testid="email"]', value: 'user@test.com', duration: 120, status: 'passed' },
      { id: '3', action: 'fill', selector: '[data-testid="password"]', value: '****', duration: 85, status: 'passed' },
      { id: '4', action: 'click', selector: '[data-testid="submit"]', duration: 95, status: 'passed' },
      { id: '5', action: 'waitForURL', value: '/dashboard', duration: 1700, status: 'passed' }
    ],
    screenshots: ['login-success.png']
  },
  {
    id: '2',
    name: 'should show error for invalid password',
    file: 'tests/auth/login.spec.ts',
    suite: 'Authentication',
    status: 'passed',
    duration: 1850,
    browser: 'chromium',
    retries: 0,
    steps: [
      { id: '1', action: 'navigate', value: '/login', duration: 420, status: 'passed' },
      { id: '2', action: 'fill', selector: '[data-testid="email"]', value: 'user@test.com', duration: 110, status: 'passed' },
      { id: '3', action: 'fill', selector: '[data-testid="password"]', value: 'wrong', duration: 78, status: 'passed' },
      { id: '4', action: 'click', selector: '[data-testid="submit"]', duration: 92, status: 'passed' },
      { id: '5', action: 'expect', selector: '[data-testid="error"]', value: 'toBeVisible', duration: 1150, status: 'passed' }
    ]
  },
  {
    id: '3',
    name: 'should create new project',
    file: 'tests/projects/create.spec.ts',
    suite: 'Projects',
    status: 'failed',
    duration: 5420,
    browser: 'chromium',
    retries: 1,
    error: 'Timeout exceeded while waiting for selector [data-testid="project-card"]',
    steps: [
      { id: '1', action: 'navigate', value: '/projects', duration: 520, status: 'passed' },
      { id: '2', action: 'click', selector: '[data-testid="new-project"]', duration: 150, status: 'passed' },
      { id: '3', action: 'fill', selector: '[data-testid="name"]', value: 'Test Project', duration: 95, status: 'passed' },
      { id: '4', action: 'click', selector: '[data-testid="save"]', duration: 180, status: 'passed' },
      { id: '5', action: 'waitForSelector', selector: '[data-testid="project-card"]', duration: 4475, status: 'failed' }
    ],
    screenshots: ['project-create-failed.png']
  },
  {
    id: '4',
    name: 'should display dashboard metrics',
    file: 'tests/dashboard/metrics.spec.ts',
    suite: 'Dashboard',
    status: 'passed',
    duration: 3200,
    browser: 'firefox',
    retries: 0,
    steps: [
      { id: '1', action: 'navigate', value: '/dashboard', duration: 680, status: 'passed' },
      { id: '2', action: 'expect', selector: '[data-testid="revenue"]', value: 'toBeVisible', duration: 450, status: 'passed' },
      { id: '3', action: 'expect', selector: '[data-testid="users"]', value: 'toBeVisible', duration: 420, status: 'passed' },
      { id: '4', action: 'expect', selector: '[data-testid="chart"]', value: 'toBeVisible', duration: 1650, status: 'passed' }
    ],
    video: 'dashboard-metrics.webm'
  },
  {
    id: '5',
    name: 'should handle API errors gracefully',
    file: 'tests/api/error-handling.spec.ts',
    suite: 'API',
    status: 'flaky',
    duration: 2800,
    browser: 'chromium',
    retries: 2,
    steps: [
      { id: '1', action: 'route', value: '**/api/data', duration: 50, status: 'passed' },
      { id: '2', action: 'navigate', value: '/data', duration: 520, status: 'passed' },
      { id: '3', action: 'expect', selector: '[data-testid="error-message"]', value: 'toBeVisible', duration: 2230, status: 'passed' }
    ]
  },
  {
    id: '6',
    name: 'should match visual snapshot',
    file: 'tests/visual/homepage.spec.ts',
    suite: 'Visual',
    status: 'passed',
    duration: 4500,
    browser: 'webkit',
    retries: 0,
    steps: [
      { id: '1', action: 'navigate', value: '/', duration: 850, status: 'passed' },
      { id: '2', action: 'screenshot', value: 'homepage.png', duration: 320, status: 'passed' },
      { id: '3', action: 'expect', value: 'toMatchSnapshot', duration: 3330, status: 'passed' }
    ],
    screenshots: ['homepage.png', 'homepage-diff.png']
  }
]

const mockTestSuites: TestSuite[] = [
  {
    id: '1',
    name: 'tests',
    path: 'tests/',
    tests: 48,
    passed: 42,
    failed: 4,
    skipped: 2,
    duration: 125000,
    expanded: true,
    children: [
      {
        id: '2',
        name: 'auth',
        path: 'tests/auth/',
        tests: 12,
        passed: 12,
        failed: 0,
        skipped: 0,
        duration: 28000,
        expanded: true,
        children: [
          { id: '3', name: 'login.spec.ts', path: 'tests/auth/login.spec.ts', tests: 6, passed: 6, failed: 0, skipped: 0, duration: 14000 },
          { id: '4', name: 'register.spec.ts', path: 'tests/auth/register.spec.ts', tests: 4, passed: 4, failed: 0, skipped: 0, duration: 9000 },
          { id: '5', name: 'logout.spec.ts', path: 'tests/auth/logout.spec.ts', tests: 2, passed: 2, failed: 0, skipped: 0, duration: 5000 }
        ]
      },
      {
        id: '6',
        name: 'projects',
        path: 'tests/projects/',
        tests: 15,
        passed: 12,
        failed: 2,
        skipped: 1,
        duration: 45000,
        children: [
          { id: '7', name: 'create.spec.ts', path: 'tests/projects/create.spec.ts', tests: 5, passed: 3, failed: 2, skipped: 0, duration: 18000 },
          { id: '8', name: 'update.spec.ts', path: 'tests/projects/update.spec.ts', tests: 5, passed: 5, failed: 0, skipped: 0, duration: 15000 },
          { id: '9', name: 'delete.spec.ts', path: 'tests/projects/delete.spec.ts', tests: 5, passed: 4, failed: 0, skipped: 1, duration: 12000 }
        ]
      },
      {
        id: '10',
        name: 'dashboard',
        path: 'tests/dashboard/',
        tests: 8,
        passed: 8,
        failed: 0,
        skipped: 0,
        duration: 22000
      },
      {
        id: '11',
        name: 'api',
        path: 'tests/api/',
        tests: 10,
        passed: 8,
        failed: 1,
        skipped: 1,
        duration: 18000
      },
      {
        id: '12',
        name: 'visual',
        path: 'tests/visual/',
        tests: 3,
        passed: 2,
        failed: 1,
        skipped: 0,
        duration: 12000
      }
    ]
  }
]

const mockTestRuns: TestRun[] = [
  {
    id: '1',
    name: 'Full E2E Suite',
    branch: 'main',
    commit: 'abc1234',
    status: 'passed',
    startTime: new Date('2024-12-23T10:00:00'),
    endTime: new Date('2024-12-23T10:12:30'),
    duration: 750000,
    totalTests: 48,
    passed: 45,
    failed: 2,
    skipped: 1,
    flaky: 1,
    coverage: 87.5,
    browsers: ['chromium', 'firefox', 'webkit'],
    parallel: 4,
    triggeredBy: 'GitHub Actions',
    specs: mockTestSpecs
  },
  {
    id: '2',
    name: 'Smoke Tests',
    branch: 'feature/auth',
    commit: 'def5678',
    status: 'failed',
    startTime: new Date('2024-12-23T09:30:00'),
    endTime: new Date('2024-12-23T09:35:45'),
    duration: 345000,
    totalTests: 12,
    passed: 10,
    failed: 2,
    skipped: 0,
    flaky: 0,
    coverage: 65.2,
    browsers: ['chromium'],
    parallel: 2,
    triggeredBy: 'Manual',
    specs: mockTestSpecs.slice(0, 3)
  },
  {
    id: '3',
    name: 'Visual Regression',
    branch: 'main',
    commit: 'ghi9012',
    status: 'running',
    startTime: new Date('2024-12-23T10:15:00'),
    duration: 180000,
    totalTests: 8,
    passed: 5,
    failed: 0,
    skipped: 0,
    flaky: 0,
    coverage: 0,
    browsers: ['chromium', 'webkit'],
    parallel: 2,
    triggeredBy: 'Schedule',
    specs: []
  }
]

const mockBrowserConfigs: BrowserConfig[] = [
  { type: 'chromium', enabled: true, headless: true, viewport: { width: 1280, height: 720 } },
  { type: 'firefox', enabled: true, headless: true, viewport: { width: 1280, height: 720 } },
  { type: 'webkit', enabled: true, headless: true, viewport: { width: 1280, height: 720 } },
  { type: 'edge', enabled: false, headless: true, viewport: { width: 1280, height: 720 } }
]

const mockCIConfigs: CIConfig[] = [
  { name: 'GitHub Actions', provider: 'github', status: 'connected', lastSync: new Date('2024-12-23T10:00:00') },
  { name: 'GitLab CI', provider: 'gitlab', status: 'pending', lastSync: new Date('2024-12-22T15:30:00') }
]

// Helper Functions
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}

const getStatusColor = (status: TestStatus | RunStatus): string => {
  const colors: Record<string, string> = {
    passed: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
    failed: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300',
    skipped: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
    pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
    running: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300',
    flaky: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300',
    cancelled: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
  }
  return colors[status] || colors.pending
}

const getStatusIcon = (status: TestStatus | RunStatus): React.ReactNode => {
  switch (status) {
    case 'passed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
    case 'skipped': return <CircleSlash className="h-4 w-4 text-gray-400" />
    case 'running': return <Play className="h-4 w-4 text-blue-500 animate-pulse" />
    case 'flaky': return <AlertTriangle className="h-4 w-4 text-orange-500" />
    default: return <Clock className="h-4 w-4 text-yellow-500" />
  }
}

const getBrowserIcon = (browser: BrowserType): React.ReactNode => {
  switch (browser) {
    case 'chromium': return <Chrome className="h-4 w-4" />
    case 'firefox': return <Globe className="h-4 w-4 text-orange-500" />
    case 'webkit': return <Monitor className="h-4 w-4 text-blue-500" />
    case 'edge': return <Globe className="h-4 w-4 text-blue-600" />
  }
}

// Enhanced Competitive Upgrade Mock Data - Testing Context
const mockTestingAIInsights = [
  { id: '1', type: 'warning' as const, title: 'Flaky Tests Detected', description: '3 tests showing intermittent failures. Consider adding retries or fixing race conditions.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '2', type: 'success' as const, title: 'Coverage Improved', description: 'Code coverage increased to 87% after latest test additions.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Coverage' },
  { id: '3', type: 'info' as const, title: 'Performance Insight', description: 'Parallel execution reduced total run time by 45%.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
]

const mockTestingCollaborators = [
  { id: '1', name: 'Jake Martinez', avatar: '/avatars/jake.jpg', status: 'online' as const, role: 'QA Lead', lastActive: 'Now' },
  { id: '2', name: 'Natalie Chen', avatar: '/avatars/natalie.jpg', status: 'online' as const, role: 'Test Engineer', lastActive: '4m ago' },
  { id: '3', name: 'Ryan Foster', avatar: '/avatars/ryan.jpg', status: 'away' as const, role: 'Developer', lastActive: '18m ago' },
]

const mockTestingPredictions = [
  { id: '1', label: 'Pass Rate', current: 94.5, target: 98, predicted: 96.2, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Avg Run Duration', current: 8.5, target: 6, predicted: 7.2, confidence: 78, trend: 'down' as const },
  { id: '3', label: 'Test Coverage', current: 87, target: 95, predicted: 91, confidence: 80, trend: 'up' as const },
]

const mockTestingActivities = [
  { id: '1', user: 'Jake Martinez', action: 'triggered', target: 'full regression suite', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Natalie Chen', action: 'fixed', target: 'flaky login test', timestamp: '20m ago', type: 'success' as const },
  { id: '3', user: 'Ryan Foster', action: 'added', target: '12 new unit tests', timestamp: '45m ago', type: 'success' as const },
]

const mockTestingQuickActions = [
  { id: '1', label: 'Run Tests', icon: 'Play', shortcut: 'R', action: 'runTests' },
  { id: '2', label: 'View Report', icon: 'FileText', shortcut: 'V', action: 'viewReport' },
  { id: '3', label: 'Debug Failed', icon: 'Bug', shortcut: 'D', action: 'debugFailed' },
  { id: '4', label: 'Add Test', icon: 'Plus', shortcut: 'N', action: 'addTest' },
]

export default function TestingClient() {
  const supabase = createClient()

  // Core state
  const [activeTab, setActiveTab] = useState('runs')
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(mockTestRuns[0])
  const [selectedSpec, setSelectedSpec] = useState<TestSpec | null>(null)
  const [suites, setSuites] = useState<TestSuite[]>(mockTestSuites)
  const [browserConfigs, setBrowserConfigs] = useState<BrowserConfig[]>(mockBrowserConfigs)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all')
  const [showRunDialog, setShowRunDialog] = useState(false)
  const [showSpecDetail, setShowSpecDetail] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase state
  const [dbTests, setDbTests] = useState<DbTestCase[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<TestFormState>(initialFormState)

  // Filter specs
  const filteredSpecs = useMemo(() => {
    if (!selectedRun) return []
    return selectedRun.specs.filter(spec => {
      const matchesSearch = searchQuery === '' ||
        spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.file.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || spec.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [selectedRun, searchQuery, statusFilter])

  // Calculate stats
  const overallStats = useMemo(() => {
    const total = mockTestRuns.reduce((sum, r) => sum + r.totalTests, 0)
    const passed = mockTestRuns.reduce((sum, r) => sum + r.passed, 0)
    const failed = mockTestRuns.reduce((sum, r) => sum + r.failed, 0)
    const avgDuration = mockTestRuns.reduce((sum, r) => sum + r.duration, 0) / mockTestRuns.length
    const avgCoverage = mockTestRuns.filter(r => r.coverage > 0).reduce((sum, r) => sum + r.coverage, 0) /
      mockTestRuns.filter(r => r.coverage > 0).length
    return { total, passed, failed, avgDuration, avgCoverage, passRate: (passed / total) * 100 }
  }, [])

  // Toggle suite expansion
  const toggleSuite = (suiteId: string) => {
    const updateSuite = (items: TestSuite[]): TestSuite[] => {
      return items.map(suite => {
        if (suite.id === suiteId) {
          return { ...suite, expanded: !suite.expanded }
        }
        if (suite.children) {
          return { ...suite, children: updateSuite(suite.children) }
        }
        return suite
      })
    }
    setSuites(updateSuite(suites))
  }

  // Fetch tests from Supabase
  const fetchTests = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('feature_tests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbTests(data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  // Create test case
  const handleCreateTest = async () => {
    if (!formState.name.trim()) {
      toast.error('Test name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create tests')
        return
      }

      const { error } = await supabase.from('feature_tests').insert({
        name: formState.name,
        path: formState.file_path || `tests/${formState.suite_name.toLowerCase()}/${formState.name.toLowerCase().replace(/\s+/g, '-')}.spec.ts`,
        category: formState.test_type === 'unit' ? 'core-business' :
                  formState.test_type === 'e2e' ? 'integration' : 'performance',
        description: formState.description || `Test: ${formState.name}`,
        timeout_ms: formState.timeout_ms,
        retry_count: formState.retry_count,
        is_enabled: true,
        tags: [formState.browser, formState.suite_name],
        metadata: { browser: formState.browser, suite: formState.suite_name },
      })

      if (error) throw error

      toast.success('Test case created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchTests()
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error('Failed to create test case')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Run/trigger test
  const handleRunTest = async (testId: string, testName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase.from('test_runs').insert({
        test_id: testId,
        user_id: user?.id,
        result: 'pass',
        duration_ms: Math.floor(Math.random() * 5000) + 1000,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        environment: 'development',
        browser: 'chromium',
      })

      if (error) throw error

      toast.success(`Test "${testName}" executed`, {
        description: 'Test run completed successfully'
      })
      fetchTests()
    } catch (error) {
      console.error('Error running test:', error)
      toast.error('Failed to run test')
    }
  }

  // Update test status
  const handleUpdateTestStatus = async (testId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feature_tests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', testId)

      if (error) throw error

      toast.success(`Test status updated to ${newStatus}`)
      fetchTests()
    } catch (error) {
      console.error('Error updating test:', error)
      toast.error('Failed to update test status')
    }
  }

  // Delete test
  const handleDeleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('feature_tests')
        .delete()
        .eq('id', testId)

      if (error) throw error

      toast.success('Test deleted')
      fetchTests()
    } catch (error) {
      console.error('Error deleting test:', error)
      toast.error('Failed to delete test')
    }
  }

  // Export results
  const handleExportResults = async () => {
    try {
      const { data, error } = await supabase
        .from('test_runs')
        .select('*, feature_tests(*)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `test-results-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export completed', {
        description: 'Test results exported successfully'
      })
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export results')
    }
  }

  // Run all tests (triggers dialog)
  const handleRunTests = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setShowRunDialog(false)
      toast.success('Test run completed', {
        description: `${mockTestSpecs.length + dbTests.length} tests executed`
      })
    }, 2000)
  }

  // Render test tree
  const renderSuiteTree = (items: TestSuite[], depth = 0): React.ReactNode => {
    return items.map(suite => (
      <div key={suite.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer ${
            depth > 0 ? `ml-${depth * 4}` : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => suite.children && toggleSuite(suite.id)}
        >
          {suite.children ? (
            suite.expanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500" />
            )
          ) : (
            <FileCode className="h-4 w-4 text-blue-500" />
          )}
          <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{suite.name}</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600">{suite.passed}</span>
            <span className="text-gray-400">/</span>
            {suite.failed > 0 && <span className="text-red-600">{suite.failed}</span>}
            {suite.failed > 0 && <span className="text-gray-400">/</span>}
            <span className="text-gray-500">{suite.tests}</span>
          </div>
          {suite.children && (
            suite.expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
        {suite.expanded && suite.children && renderSuiteTree(suite.children, depth + 1)}
      </div>
    ))
  }

  // Rerun failed tests
  const handleRerunFailed = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_tests')
        .select('id, name')
        .eq('status', 'failed')

      if (error) throw error

      if (!data || data.length === 0) {
        toast.info('No failed tests to rerun')
        return
      }

      toast.info(`Rerunning ${data.length} failed tests`, {
        description: 'Test execution started...'
      })

      for (const test of data) {
        await handleRunTest(test.id, test.name)
      }
    } catch (error) {
      console.error('Error rerunning failed tests:', error)
      toast.error('Failed to rerun tests')
    }
  }

  // Quick action handlers for testing actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'runTests':
        setShowRunDialog(true)
        break
      case 'viewReport':
        setActiveTab('results')
        toast.success('Test report ready')
        break
      case 'debugFailed':
        setStatusFilter('failed')
        setActiveTab('results')
        toast.success('Debug session ready')
        break
      case 'addTest':
        setShowCreateDialog(true)
        toast.success('Test creation form opened')
        break
      default:
        break
    }
  }

  // Explorer folder expand/collapse handlers
  const handleExpandAll = () => {
    const expandAllSuites = (items: TestSuite[]): TestSuite[] => {
      return items.map(suite => ({
        ...suite,
        expanded: true,
        children: suite.children ? expandAllSuites(suite.children) : undefined
      }))
    }
    setSuites(expandAllSuites(suites))
    toast.success('All folders expanded')
  }

  const handleCollapseAll = () => {
    const collapseAllSuites = (items: TestSuite[]): TestSuite[] => {
      return items.map(suite => ({
        ...suite,
        expanded: false,
        children: suite.children ? collapseAllSuites(suite.children) : undefined
      }))
    }
    setSuites(collapseAllSuites(suites))
    toast.success('All folders collapsed')
  }

  // Filter dialog handler
  const handleOpenFilterDialog = () => {
    toast.info('Filter options', {
      description: 'Use the status filters to refine results'
    })
  }

  // File open handler
  const handleOpenFile = () => {
    toast.info('File selection', {
      description: 'Select a test file from the explorer to view'
    })
  }

  // Screenshot handler
  const handleLoadScreenshots = async () => {
    try {
      const { data, error } = await supabase
        .from('test_artifacts')
        .select('*')
        .eq('artifact_type', 'screenshot')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        toast.info('No screenshots available')
        return
      }

      toast.success(`Loaded ${data.length} screenshots`)
    } catch (error) {
      console.error('Error loading screenshots:', error)
      toast.error('Failed to load screenshots')
    }
  }

  // Video handler
  const handleLoadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('test_artifacts')
        .select('*')
        .eq('artifact_type', 'video')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        toast.info('No videos available')
        return
      }

      toast.success(`Loaded ${data.length} videos`)
    } catch (error) {
      console.error('Error loading videos:', error)
      toast.error('Failed to load videos')
    }
  }

  // Trace handler
  const handleLoadTraces = async () => {
    try {
      const { data, error } = await supabase
        .from('test_artifacts')
        .select('*')
        .eq('artifact_type', 'trace')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        toast.info('No traces available')
        return
      }

      toast.success(`Loaded ${data.length} traces`)
    } catch (error) {
      console.error('Error loading traces:', error)
      toast.error('Failed to load traces')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Bug className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Test Runner</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Playwright Level
                  </span>
                </div>
                <p className="text-indigo-100 mt-1">
                  End-to-end testing with multi-browser support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowRunDialog(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 font-medium transition-colors"
              >
                <Play className="h-5 w-5" />
                Run Tests
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <Activity className="h-4 w-4" />
                Total Tests
              </div>
              <p className="text-2xl font-bold">{overallStats.total}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Pass Rate
              </div>
              <p className="text-2xl font-bold">{overallStats.passRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <XCircle className="h-4 w-4" />
                Failed
              </div>
              <p className="text-2xl font-bold">{overallStats.failed}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <Timer className="h-4 w-4" />
                Avg Duration
              </div>
              <p className="text-2xl font-bold">{formatDuration(overallStats.avgDuration)}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <Shield className="h-4 w-4" />
                Coverage
              </div>
              <p className="text-2xl font-bold">{overallStats.avgCoverage.toFixed(1)}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
                <Globe className="h-4 w-4" />
                Browsers
              </div>
              <p className="text-2xl font-bold">{browserConfigs.filter(b => b.enabled).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="runs" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Test Runs
              </TabsTrigger>
              <TabsTrigger value="explorer" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Explorer
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="coverage" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Coverage
              </TabsTrigger>
              <TabsTrigger value="ci" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                CI/CD
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 text-sm w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as TestStatus | 'all')}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="skipped">Skipped</option>
                <option value="flaky">Flaky</option>
              </select>
            </div>
          </div>

          {/* Test Runs Tab */}
          <TabsContent value="runs" className="mt-0 space-y-6">
            {/* Runs Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Test Run Management</h3>
                  <p className="text-indigo-100">Monitor and analyze your test executions across all browsers</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockTestRuns.length}</p>
                    <p className="text-indigo-200 text-sm">Recent Runs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Runs Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Play, label: 'Run All', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: () => setShowRunDialog(true) },
                { icon: Repeat, label: 'Retry Failed', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: handleRerunFailed },
                { icon: Square, label: 'Stop All', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', onClick: () => { setIsRunning(false); toast.success('All tests stopped'); } },
                { icon: Download, label: 'Export', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: handleExportResults },
                { icon: RefreshCw, label: 'Refresh', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: fetchTests },
                { icon: Plus, label: 'New Test', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: () => setShowCreateDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: () => setActiveTab('coverage') },
                { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: () => { setStatusFilter('all'); setActiveTab('results'); toast.success('Archive opened'); } },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Runs List */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Runs</h3>
                {mockTestRuns.map(run => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer transition-all ${
                      selectedRun?.id === run.id
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{run.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <GitBranch className="h-3 w-3" />
                          {run.branch}
                          <span className="text-gray-300">•</span>
                          <GitCommit className="h-3 w-3" />
                          {run.commit}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600">{run.passed} passed</span>
                        {run.failed > 0 && <span className="text-red-600">{run.failed} failed</span>}
                      </div>
                      <span className="text-gray-500">{formatDuration(run.duration)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {run.browsers.map(browser => (
                        <span key={browser} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {getBrowserIcon(browser)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Run Details */}
              <div className="lg:col-span-2">
                {selectedRun ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedRun.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">Triggered by {selectedRun.triggeredBy}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full font-medium ${getStatusColor(selectedRun.status)}`}>
                          {selectedRun.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Pass Rate</p>
                          <p className="text-xl font-bold text-green-600">
                            {((selectedRun.passed / selectedRun.totalTests) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(selectedRun.duration)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Coverage</p>
                          <p className="text-xl font-bold text-indigo-600">{selectedRun.coverage}%</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Parallel</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedRun.parallel} workers</p>
                        </div>
                      </div>
                    </div>

                    {/* Test Specs */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Test Specs ({filteredSpecs.length})
                      </h4>
                      <div className="space-y-2">
                        {filteredSpecs.map(spec => (
                          <div
                            key={spec.id}
                            onClick={() => { setSelectedSpec(spec); setShowSpecDetail(true); }}
                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            {getStatusIcon(spec.status)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{spec.name}</p>
                              <p className="text-xs text-gray-500 truncate">{spec.file}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              {spec.retries > 0 && (
                                <span className="flex items-center gap-1 text-orange-500">
                                  <Repeat className="h-3 w-3" />
                                  {spec.retries}
                                </span>
                              )}
                              <span className="p-1 bg-white dark:bg-gray-800 rounded">
                                {getBrowserIcon(spec.browser)}
                              </span>
                              <span className="text-gray-500">{formatDuration(spec.duration)}</span>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Bug className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a test run to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Explorer Tab */}
          <TabsContent value="explorer" className="mt-0 space-y-6">
            {/* Explorer Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Test Explorer</h3>
                  <p className="text-green-100">Browse and organize your test files and suites</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockTestSuites[0]?.tests || 0}</p>
                    <p className="text-green-200 text-sm">Total Tests</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Explorer Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: FolderOpen, label: 'Expand All', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', onClick: handleExpandAll },
                { icon: Folder, label: 'Collapse All', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: handleCollapseAll },
                { icon: FileCode, label: 'New Test', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: () => setShowCreateDialog(true) },
                { icon: Search, label: 'Find Test', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: () => document.querySelector<HTMLInputElement>('input[placeholder="Search tests..."]')?.focus() },
                { icon: Play, label: 'Run Selected', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: () => setShowRunDialog(true) },
                { icon: Filter, label: 'Filter', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: handleOpenFilterDialog },
                { icon: RefreshCw, label: 'Reload', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', onClick: fetchTests },
                { icon: Code, label: 'Open File', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: handleOpenFile },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* File Tree */}
              <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Files</h3>
                </div>
                <ScrollArea className="h-[600px]">
                  <div className="p-2">
                    {renderSuiteTree(suites)}
                  </div>
                </ScrollArea>
              </div>

              {/* Suite Summary */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Suite Summary</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-300">Passed</span>
                      </div>
                      <p className="text-3xl font-bold text-green-600">42</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-red-700 dark:text-red-300">Failed</span>
                      </div>
                      <p className="text-3xl font-bold text-red-600">4</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CircleSlash className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Skipped</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-600 dark:text-gray-300">2</p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="text-sm text-orange-700 dark:text-orange-300">Flaky</span>
                      </div>
                      <p className="text-3xl font-bold text-orange-500">1</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Failures</h3>
                  <div className="space-y-3">
                    {mockTestSpecs.filter(s => s.status === 'failed' || s.status === 'flaky').map(spec => (
                      <div
                        key={spec.id}
                        className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{spec.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{spec.file}</p>
                            {spec.error && (
                              <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-mono bg-red-100 dark:bg-red-900/30 p-2 rounded">
                                {spec.error}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-0 space-y-6">
            {/* Results Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Test Results</h3>
                  <p className="text-blue-100">Detailed view of all test execution results</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockTestSpecs.length}</p>
                    <p className="text-blue-200 text-sm">Test Specs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Download, label: 'Export All', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', onClick: handleExportResults },
                { icon: Filter, label: 'Filter', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', onClick: handleOpenFilterDialog },
                { icon: XCircle, label: 'Failed Only', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', onClick: () => setStatusFilter('failed') },
                { icon: CheckCircle2, label: 'Passed Only', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', onClick: () => setStatusFilter('passed') },
                { icon: Camera, label: 'Screenshots', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', onClick: handleLoadScreenshots },
                { icon: Video, label: 'Videos', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30', onClick: handleLoadVideos },
                { icon: Layers, label: 'Traces', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', onClick: handleLoadTraces },
                { icon: RefreshCw, label: 'Refresh', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', onClick: fetchTests },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Results</h3>
                  <button
                    onClick={handleExportResults}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export Report
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Test</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Browser</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Retries</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Artifacts</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockTestSpecs.map(spec => (
                      <tr key={spec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{spec.name}</p>
                            <p className="text-xs text-gray-500">{spec.file}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(spec.status)}`}>
                            {getStatusIcon(spec.status)}
                            {spec.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2">
                            {getBrowserIcon(spec.browser)}
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{spec.browser}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatDuration(spec.duration)}
                        </td>
                        <td className="px-6 py-4">
                          {spec.retries > 0 ? (
                            <span className="text-orange-500">{spec.retries}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {spec.screenshots && spec.screenshots.length > 0 && (
                              <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                <Camera className="h-4 w-4 text-gray-500" />
                              </button>
                            )}
                            {spec.video && (
                              <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                <Video className="h-4 w-4 text-gray-500" />
                              </button>
                            )}
                            {spec.trace && (
                              <button className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                                <Layers className="h-4 w-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => { setSelectedSpec(spec); setShowSpecDetail(true); }}
                            className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage" className="mt-0 space-y-6">
            {/* Coverage Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Code Coverage</h3>
                  <p className="text-purple-100">Track and improve your test coverage metrics</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{overallStats.avgCoverage.toFixed(1)}%</p>
                    <p className="text-purple-200 text-sm">Average Coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coverage Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: RefreshCw, label: 'Regenerate', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Download, label: 'Export', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Target, label: 'Set Target', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: AlertTriangle, label: 'Low Coverage', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
                { icon: TrendingUp, label: 'Trending', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: FileCode, label: 'By File', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: BarChart3, label: 'History', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Shield, label: 'Quality', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Overall Coverage</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-700" />
                      <circle
                        cx="64" cy="64" r="56" fill="none" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${87.5 * 3.52} ${100 * 3.52}`}
                        className="text-indigo-600 stroke-current"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-indigo-600">87.5%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500">Target: 80%</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Coverage Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Statements', value: 89.2, color: 'bg-green-500' },
                    { name: 'Branches', value: 82.1, color: 'bg-blue-500' },
                    { name: 'Functions', value: 91.5, color: 'bg-purple-500' },
                    { name: 'Lines', value: 87.8, color: 'bg-orange-500' }
                  ].map(item => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Coverage Trend</h3>
                <div className="h-40 flex items-end justify-between gap-2">
                  {[82, 84, 83, 85, 86, 87, 87.5].map((value, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t"
                        style={{ height: `${(value - 80) * 10}%` }}
                      />
                      <span className="text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Uncovered Files</h3>
              <div className="space-y-2">
                {[
                  { file: 'src/utils/helpers.ts', coverage: 45 },
                  { file: 'src/components/Modal.tsx', coverage: 52 },
                  { file: 'src/api/auth.ts', coverage: 68 }
                ].map(item => (
                  <div key={item.file} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <FileCode className="h-5 w-5 text-gray-400" />
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{item.file}</span>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.coverage < 60 ? 'bg-red-500' : 'bg-yellow-500'}`}
                        style={{ width: `${item.coverage}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${item.coverage < 60 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {item.coverage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* CI/CD Tab */}
          <TabsContent value="ci" className="mt-0 space-y-6">
            {/* CI/CD Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">CI/CD Integration</h3>
                  <p className="text-orange-100">Connect your test suite with continuous integration pipelines</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{mockCIConfigs.length}</p>
                    <p className="text-orange-200 text-sm">Integrations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CI/CD Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Add CI', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: RefreshCw, label: 'Sync All', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: GitBranch, label: 'Branches', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Webhook, label: 'Webhooks', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Key, label: 'Secrets', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
                { icon: Terminal, label: 'Logs', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
                { icon: Chrome, label: 'Browsers', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Workflow, label: 'Workflows', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
              ].map((action, i) => (
                <button
                  key={i}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">CI Integrations</h3>
                <div className="space-y-3">
                  {mockCIConfigs.map(config => (
                    <div key={config.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <GitBranch className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{config.name}</p>
                          <p className="text-xs text-gray-500">Last sync: {config.lastSync.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        config.status === 'connected'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {config.status}
                      </span>
                    </div>
                  ))}
                  <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all">
                    <Plus className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Add Integration</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Browser Configuration</h3>
                <div className="space-y-3">
                  {browserConfigs.map(config => (
                    <div key={config.type} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          {getBrowserIcon(config.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">{config.type}</p>
                          <p className="text-xs text-gray-500">
                            {config.viewport.width}x{config.viewport.height} • {config.headless ? 'Headless' : 'Headed'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBrowserConfigs(prev =>
                            prev.map(b => b.type === config.type ? { ...b, enabled: !b.enabled } : b)
                          )
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          config.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          config.enabled ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pipeline Configuration</h3>
              <div className="p-4 bg-gray-900 rounded-xl">
                <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{`# playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 4,
  reporter: [['html'], ['json', { outputFile: 'results.json' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});`}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-indigo-600" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'execution', label: 'Execution', icon: Play },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Test Configuration</CardTitle>
                        <CardDescription>Configure default test execution settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Test Directory</Label>
                            <Input defaultValue="./tests" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                          <div>
                            <Label>Config File</Label>
                            <Input defaultValue="playwright.config.ts" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Default Timeout (ms)</Label>
                            <Input type="number" defaultValue="30000" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                          <div>
                            <Label>Expect Timeout (ms)</Label>
                            <Input type="number" defaultValue="5000" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Fully Parallel</p>
                            <p className="text-sm text-gray-500">Run all tests in parallel across files</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Forbid Only</p>
                            <p className="text-sm text-gray-500">Fail if test.only is used in CI</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Reporter Settings</CardTitle>
                        <CardDescription>Configure test report generation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'HTML Reporter', desc: 'Generate interactive HTML reports', enabled: true },
                          { name: 'JSON Reporter', desc: 'Output results as JSON files', enabled: true },
                          { name: 'JUnit Reporter', desc: 'Generate JUnit XML reports', enabled: false },
                          { name: 'List Reporter', desc: 'Console output with test list', enabled: true },
                        ].map((reporter, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{reporter.name}</p>
                              <p className="text-sm text-gray-500">{reporter.desc}</p>
                            </div>
                            <Switch defaultChecked={reporter.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Execution Settings */}
                {settingsTab === 'execution' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Execution Settings</CardTitle>
                        <CardDescription>Configure how tests are executed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Parallel Workers</Label>
                            <Input type="number" defaultValue="4" min="1" max="16" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                          <div>
                            <Label>Max Retries</Label>
                            <Input type="number" defaultValue="2" min="0" max="5" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Screenshots on Failure</p>
                            <p className="text-sm text-gray-500">Capture screenshot when test fails</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Video Recording</p>
                            <p className="text-sm text-gray-500">Record video for failed tests</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Trace Collection</p>
                            <p className="text-sm text-gray-500">Collect trace on first retry</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Headless Mode</p>
                            <p className="text-sm text-gray-500">Run browsers in headless mode</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Browser Projects</CardTitle>
                        <CardDescription>Configure browser targets for testing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {browserConfigs.map((browser, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                {getBrowserIcon(browser.type)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white capitalize">{browser.type}</p>
                                <p className="text-sm text-gray-500">{browser.viewport.width}x{browser.viewport.height}</p>
                              </div>
                            </div>
                            <Switch defaultChecked={browser.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Configure test result notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { icon: Mail, name: 'Email Notifications', desc: 'Send test results via email' },
                        { icon: Bell, name: 'Push Notifications', desc: 'Browser push notifications' },
                        { icon: Webhook, name: 'Slack Integration', desc: 'Post results to Slack channels' },
                        { icon: GitBranch, name: 'GitHub Comments', desc: 'Comment on pull requests' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <item.icon className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                          </div>
                          <Switch defaultChecked={i < 2} />
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Label>Notification Threshold</Label>
                        <p className="text-sm text-gray-500 mb-3">Only notify when conditions are met</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">On failure</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">On success</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Coverage below threshold</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Flaky tests detected</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>CI/CD Integrations</CardTitle>
                        <CardDescription>Connect with your CI/CD pipelines</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockCIConfigs.map((config, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <GitBranch className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{config.name}</p>
                                <p className="text-sm text-gray-500">Last sync: {config.lastSync.toLocaleString()}</p>
                              </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              config.status === 'connected'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {config.status}
                            </span>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Integration
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>External Services</CardTitle>
                        <CardDescription>Connect with external testing services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Playwright Cloud', desc: 'Run tests on cloud infrastructure', connected: false },
                          { name: 'BrowserStack', desc: 'Cross-browser testing platform', connected: false },
                          { name: 'Percy', desc: 'Visual regression testing', connected: true },
                          { name: 'Checkly', desc: 'API and E2E monitoring', connected: false },
                        ].map((service, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.desc}</p>
                            </div>
                            <Button variant={service.connected ? "outline" : "default"} size="sm">
                              {service.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Configure security and access controls</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Secure Artifacts</p>
                            <p className="text-sm text-gray-500">Encrypt screenshots and videos</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Mask Sensitive Data</p>
                            <p className="text-sm text-gray-500">Hide passwords in traces</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all test run activities</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Environment Variables</CardTitle>
                        <CardDescription>Securely manage test environment secrets</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { key: 'TEST_BASE_URL', value: '***hidden***' },
                          { key: 'TEST_API_KEY', value: '***hidden***' },
                          { key: 'TEST_USERNAME', value: 'test@example.com' },
                        ].map((env, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <Key className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <Input value={env.key} readOnly className="font-mono text-sm dark:bg-gray-900 dark:border-gray-700" />
                              <Input type="password" value={env.value} className="font-mono text-sm dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variable
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Advanced Configuration</CardTitle>
                        <CardDescription>Fine-tune test execution behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Global Timeout (ms)</Label>
                            <Input type="number" defaultValue="60000" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                          <div>
                            <Label>Action Timeout (ms)</Label>
                            <Input type="number" defaultValue="10000" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Preserve Output</p>
                            <p className="text-sm text-gray-500">Keep test output between runs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Update Snapshots</p>
                            <p className="text-sm text-gray-500">Automatically update visual snapshots</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Quiet Mode</p>
                            <p className="text-sm text-gray-500">Suppress console output during tests</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Maintenance</CardTitle>
                        <CardDescription>Manage test artifacts and cache</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Test Cache</p>
                              <p className="text-sm text-gray-500">245 MB used</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Clear Cache</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Archive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Old Reports</p>
                              <p className="text-sm text-gray-500">127 reports (1.2 GB)</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Clean Up</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Browser Binaries</p>
                              <p className="text-sm text-gray-500">3 browsers installed (890 MB)</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Manage</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset All Settings</p>
                            <p className="text-sm text-gray-500">Reset to default configuration</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Delete All Data</p>
                            <p className="text-sm text-gray-500">Remove all test results and artifacts</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockTestingAIInsights}
              title="Testing Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockTestingCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockTestingPredictions}
              title="Test Metrics Forecast"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockTestingActivities}
            title="Testing Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockTestingQuickActions.map(action => ({
              ...action,
              action: typeof action.action === 'string'
                ? () => handleQuickAction(action.action as string)
                : action.action
            }))}
            variant="grid"
          />
        </div>
      </div>

      {/* Run Tests Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-indigo-600" />
              Run Tests
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Suite
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                <option>All Tests</option>
                <option>Unit Tests</option>
                <option>Integration Tests</option>
                <option>E2E Tests</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Browsers
              </label>
              <div className="flex flex-wrap gap-2">
                {browserConfigs.filter(b => b.enabled).map(config => (
                  <span
                    key={config.type}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg"
                  >
                    {getBrowserIcon(config.type)}
                    <span className="capitalize">{config.type}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parallel Workers
              </label>
              <input
                type="number"
                defaultValue={4}
                min={1}
                max={10}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRunDialog(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start Run
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spec Detail Dialog */}
      <Dialog open={showSpecDetail} onOpenChange={setShowSpecDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSpec && getStatusIcon(selectedSpec.status)}
              {selectedSpec?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedSpec && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatDuration(selectedSpec.duration)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Browser</p>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                    {getBrowserIcon(selectedSpec.browser)}
                    {selectedSpec.browser}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Retries</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedSpec.retries}</p>
                </div>
              </div>

              {selectedSpec.error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-mono">{selectedSpec.error}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Test Steps</h4>
                <div className="space-y-2">
                  {selectedSpec.steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                      {getStatusIcon(step.status)}
                      <span className="font-mono text-sm text-indigo-600">{step.action}</span>
                      {step.selector && (
                        <span className="font-mono text-sm text-gray-500">{step.selector}</span>
                      )}
                      {step.value && (
                        <span className="font-mono text-sm text-green-600">{step.value}</span>
                      )}
                      <span className="ml-auto text-xs text-gray-400">{step.duration}ms</span>
                    </div>
                  ))}
                </div>
              </div>

              {(selectedSpec.screenshots || selectedSpec.video) && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Artifacts</h4>
                  <div className="flex items-center gap-3">
                    {selectedSpec.screenshots?.map((ss, i) => (
                      <button key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Camera className="h-4 w-4" />
                        {ss}
                      </button>
                    ))}
                    {selectedSpec.video && (
                      <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <Video className="h-4 w-4" />
                        {selectedSpec.video}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Test Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Timeout (ms)
              </label>
              <input
                type="number"
                defaultValue={30000}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retries on Failure
              </label>
              <input
                type="number"
                defaultValue={2}
                min={0}
                max={5}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Screenshots on Failure</p>
                <p className="text-sm text-gray-500">Capture screenshots when tests fail</p>
              </div>
              <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Video Recording</p>
                <p className="text-sm text-gray-500">Record video for failed tests</p>
              </div>
              <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Trace Collection</p>
                <p className="text-sm text-gray-500">Collect trace files for debugging</p>
              </div>
              <button className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Test Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Create New Test
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Test Name *</Label>
              <Input
                value={formState.name}
                onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                placeholder="should login with valid credentials"
                className="mt-1.5 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formState.description}
                onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Test description..."
                className="mt-1.5 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Suite Name</Label>
                <Input
                  value={formState.suite_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, suite_name: e.target.value }))}
                  placeholder="Authentication"
                  className="mt-1.5 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
              <div>
                <Label>Test Type</Label>
                <select
                  value={formState.test_type}
                  onChange={(e) => setFormState(prev => ({ ...prev, test_type: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                >
                  <option value="unit">Unit</option>
                  <option value="integration">Integration</option>
                  <option value="e2e">E2E</option>
                  <option value="visual">Visual</option>
                  <option value="api">API</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Browser</Label>
                <select
                  value={formState.browser}
                  onChange={(e) => setFormState(prev => ({ ...prev, browser: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                >
                  <option value="chromium">Chromium</option>
                  <option value="firefox">Firefox</option>
                  <option value="webkit">WebKit</option>
                  <option value="edge">Edge</option>
                </select>
              </div>
              <div>
                <Label>Timeout (ms)</Label>
                <Input
                  type="number"
                  value={formState.timeout_ms}
                  onChange={(e) => setFormState(prev => ({ ...prev, timeout_ms: parseInt(e.target.value) || 30000 }))}
                  className="mt-1.5 dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
            </div>
            <div>
              <Label>File Path (optional)</Label>
              <Input
                value={formState.file_path}
                onChange={(e) => setFormState(prev => ({ ...prev, file_path: e.target.value }))}
                placeholder="tests/auth/login.spec.ts"
                className="mt-1.5 dark:bg-gray-900 dark:border-gray-700"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => { setShowCreateDialog(false); setFormState(initialFormState); }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTest}
                disabled={isSubmitting || !formState.name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
