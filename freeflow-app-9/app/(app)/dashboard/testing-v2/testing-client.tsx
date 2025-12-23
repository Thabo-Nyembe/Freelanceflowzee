'use client'

import { useState, useMemo } from 'react'
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Image as ImageIcon,
  Video,
  Camera,
  Code,
  Terminal,
  GitBranch,
  GitCommit,
  Layers,
  Box,
  Zap,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Shield,
  Lock,
  Unlock,
  Copy,
  Check,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  Save,
  Bug,
  Repeat,
  Timer,
  Cpu,
  HardDrive,
  Wifi,
  Chrome,
  CircleSlash
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

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

export default function TestingClient() {
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

  // Run tests
  const handleRunTests = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setShowRunDialog(false)
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
          <TabsContent value="explorer" className="mt-0">
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
          <TabsContent value="results" className="mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Test Results</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
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
        </Tabs>
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
    </div>
  )
}
