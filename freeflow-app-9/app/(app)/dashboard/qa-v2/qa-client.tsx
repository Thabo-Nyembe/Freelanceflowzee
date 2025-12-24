'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQATestCases, useQAMutations, QATestCase } from '@/lib/hooks/use-qa'
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  PlayCircle,
  Plus,
  Download,
  Search,
  Filter,
  Settings,
  FileText,
  FolderOpen,
  Users,
  Calendar,
  Flag,
  Bug,
  Layers,
  GitBranch,
  Clipboard,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCheck,
  Link2,
  MessageSquare,
  Paperclip,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Code,
  Terminal,
  History,
  Milestone,
  ListChecks,
  TestTube,
  FlaskConical,
  Beaker
} from 'lucide-react'

// TestRail-level types
type TestStatus = 'passed' | 'failed' | 'blocked' | 'untested' | 'retest' | 'skipped'
type TestPriority = 'critical' | 'high' | 'medium' | 'low'
type TestType = 'functional' | 'regression' | 'integration' | 'performance' | 'security' | 'acceptance' | 'smoke' | 'exploratory'
type RunStatus = 'active' | 'completed' | 'archived'
type MilestoneStatus = 'open' | 'started' | 'completed'

interface TestSuite {
  id: string
  name: string
  description: string
  parentId?: string
  testCaseCount: number
  passRate: number
  createdAt: string
}

interface TestCase {
  id: string
  suiteId: string
  title: string
  type: TestType
  priority: TestPriority
  status: TestStatus
  preconditions?: string
  steps: TestStep[]
  expectedResult: string
  estimate?: string
  automationStatus: 'automated' | 'manual' | 'planned'
  refs?: string[]
  createdBy: string
  updatedAt: string
}

interface TestStep {
  id: string
  stepNumber: number
  action: string
  expectedResult: string
  actualResult?: string
  status?: TestStatus
}

interface TestRun {
  id: string
  name: string
  description: string
  milestoneId?: string
  assignedTo: string
  status: RunStatus
  config: string
  passedCount: number
  failedCount: number
  blockedCount: number
  untestedCount: number
  totalCount: number
  startedAt: string
  completedAt?: string
}

interface Milestone {
  id: string
  name: string
  description: string
  status: MilestoneStatus
  dueDate: string
  startDate: string
  completedRuns: number
  totalRuns: number
  passRate: number
}

interface Defect {
  id: string
  title: string
  testCaseId: string
  severity: 'critical' | 'major' | 'minor' | 'trivial'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo: string
  createdAt: string
}

interface QAClientProps {
  initialTestCases: QATestCase[]
}

// Mock TestRail-level data
const mockSuites: TestSuite[] = [
  { id: 'suite_1', name: 'User Authentication', description: 'Login, logout, and session management tests', testCaseCount: 45, passRate: 94.2, createdAt: '2024-01-01' },
  { id: 'suite_2', name: 'Dashboard Features', description: 'Main dashboard functionality tests', testCaseCount: 78, passRate: 89.7, createdAt: '2024-01-05' },
  { id: 'suite_3', name: 'API Integration', description: 'REST API endpoint testing', testCaseCount: 120, passRate: 96.5, createdAt: '2024-01-10' },
  { id: 'suite_4', name: 'Payment Processing', description: 'Checkout and payment flow tests', testCaseCount: 35, passRate: 97.8, createdAt: '2024-01-15' },
  { id: 'suite_5', name: 'Mobile Responsive', description: 'Mobile device compatibility tests', testCaseCount: 62, passRate: 85.3, createdAt: '2024-01-20' }
]

const mockTestCases: TestCase[] = [
  {
    id: 'tc_1',
    suiteId: 'suite_1',
    title: 'Verify user can login with valid credentials',
    type: 'functional',
    priority: 'critical',
    status: 'passed',
    preconditions: 'User has a valid account',
    steps: [
      { id: 's1', stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed', status: 'passed' },
      { id: 's2', stepNumber: 2, action: 'Enter valid email', expectedResult: 'Email is accepted', status: 'passed' },
      { id: 's3', stepNumber: 3, action: 'Enter valid password', expectedResult: 'Password is masked', status: 'passed' },
      { id: 's4', stepNumber: 4, action: 'Click Login button', expectedResult: 'User is redirected to dashboard', status: 'passed' }
    ],
    expectedResult: 'User successfully logs in and sees dashboard',
    estimate: '2m',
    automationStatus: 'automated',
    refs: ['REQ-001', 'JIRA-1234'],
    createdBy: 'john@company.com',
    updatedAt: '2024-01-20'
  },
  {
    id: 'tc_2',
    suiteId: 'suite_1',
    title: 'Verify error message for invalid credentials',
    type: 'functional',
    priority: 'high',
    status: 'passed',
    steps: [
      { id: 's1', stepNumber: 1, action: 'Navigate to login page', expectedResult: 'Login page is displayed', status: 'passed' },
      { id: 's2', stepNumber: 2, action: 'Enter invalid email', expectedResult: 'Email is accepted', status: 'passed' },
      { id: 's3', stepNumber: 3, action: 'Enter any password', expectedResult: 'Password is masked', status: 'passed' },
      { id: 's4', stepNumber: 4, action: 'Click Login button', expectedResult: 'Error message is displayed', status: 'passed' }
    ],
    expectedResult: 'User sees "Invalid credentials" error message',
    estimate: '1m',
    automationStatus: 'automated',
    createdBy: 'jane@company.com',
    updatedAt: '2024-01-21'
  },
  {
    id: 'tc_3',
    suiteId: 'suite_1',
    title: 'Verify password reset flow',
    type: 'functional',
    priority: 'high',
    status: 'failed',
    steps: [
      { id: 's1', stepNumber: 1, action: 'Click Forgot Password', expectedResult: 'Reset page opens', status: 'passed' },
      { id: 's2', stepNumber: 2, action: 'Enter email address', expectedResult: 'Email is accepted', status: 'passed' },
      { id: 's3', stepNumber: 3, action: 'Click Send Reset Link', expectedResult: 'Email is sent', status: 'failed', actualResult: 'Email not received' }
    ],
    expectedResult: 'User receives password reset email',
    estimate: '3m',
    automationStatus: 'manual',
    refs: ['JIRA-5678'],
    createdBy: 'mike@company.com',
    updatedAt: '2024-01-22'
  },
  {
    id: 'tc_4',
    suiteId: 'suite_2',
    title: 'Verify dashboard widgets load correctly',
    type: 'smoke',
    priority: 'critical',
    status: 'passed',
    steps: [
      { id: 's1', stepNumber: 1, action: 'Login to application', expectedResult: 'Dashboard loads', status: 'passed' },
      { id: 's2', stepNumber: 2, action: 'Verify all widgets visible', expectedResult: 'All widgets displayed', status: 'passed' }
    ],
    expectedResult: 'All dashboard widgets load with correct data',
    estimate: '1m',
    automationStatus: 'automated',
    createdBy: 'sarah@company.com',
    updatedAt: '2024-01-23'
  },
  {
    id: 'tc_5',
    suiteId: 'suite_3',
    title: 'Verify GET /api/users returns correct data',
    type: 'integration',
    priority: 'high',
    status: 'passed',
    steps: [
      { id: 's1', stepNumber: 1, action: 'Send GET request to /api/users', expectedResult: '200 OK response', status: 'passed' },
      { id: 's2', stepNumber: 2, action: 'Verify response structure', expectedResult: 'Valid JSON schema', status: 'passed' }
    ],
    expectedResult: 'API returns user list with correct schema',
    estimate: '30s',
    automationStatus: 'automated',
    refs: ['API-DOC-001'],
    createdBy: 'dev@company.com',
    updatedAt: '2024-01-24'
  }
]

const mockRuns: TestRun[] = [
  { id: 'run_1', name: 'Sprint 23 Regression', description: 'Full regression for Sprint 23', milestoneId: 'ms_1', assignedTo: 'qa_team', status: 'completed', config: 'Chrome, Windows', passedCount: 145, failedCount: 8, blockedCount: 2, untestedCount: 0, totalCount: 155, startedAt: '2024-01-15', completedAt: '2024-01-17' },
  { id: 'run_2', name: 'Payment Flow Smoke Test', description: 'Quick smoke test for payment', assignedTo: 'john@company.com', status: 'active', config: 'Safari, MacOS', passedCount: 12, failedCount: 1, blockedCount: 0, untestedCount: 5, totalCount: 18, startedAt: '2024-01-22' },
  { id: 'run_3', name: 'Mobile Compatibility', description: 'Cross-browser mobile testing', milestoneId: 'ms_2', assignedTo: 'mobile_team', status: 'active', config: 'iOS, Android', passedCount: 34, failedCount: 6, blockedCount: 3, untestedCount: 19, totalCount: 62, startedAt: '2024-01-20' },
  { id: 'run_4', name: 'API Performance Test', description: 'Load and stress testing', assignedTo: 'perf_team', status: 'completed', config: 'Production', passedCount: 89, failedCount: 2, blockedCount: 0, untestedCount: 0, totalCount: 91, startedAt: '2024-01-10', completedAt: '2024-01-12' }
]

const mockMilestones: Milestone[] = [
  { id: 'ms_1', name: 'v2.5.0 Release', description: 'Major feature release', status: 'completed', dueDate: '2024-01-20', startDate: '2024-01-01', completedRuns: 5, totalRuns: 5, passRate: 94.5 },
  { id: 'ms_2', name: 'v2.6.0 Release', description: 'Mobile optimization release', status: 'started', dueDate: '2024-02-15', startDate: '2024-01-21', completedRuns: 2, totalRuns: 8, passRate: 87.3 },
  { id: 'ms_3', name: 'v3.0.0 Release', description: 'Major platform upgrade', status: 'open', dueDate: '2024-03-30', startDate: '2024-02-16', completedRuns: 0, totalRuns: 12, passRate: 0 }
]

const mockDefects: Defect[] = [
  { id: 'def_1', title: 'Password reset email not sending', testCaseId: 'tc_3', severity: 'critical', status: 'open', assignedTo: 'dev@company.com', createdAt: '2024-01-22' },
  { id: 'def_2', title: 'Dashboard widget alignment issue on Safari', testCaseId: 'tc_4', severity: 'minor', status: 'in_progress', assignedTo: 'frontend@company.com', createdAt: '2024-01-21' },
  { id: 'def_3', title: 'API timeout on large dataset', testCaseId: 'tc_5', severity: 'major', status: 'resolved', assignedTo: 'backend@company.com', createdAt: '2024-01-20' }
]

export default function QAClient({ initialTestCases }: QAClientProps) {
  const [activeTab, setActiveTab] = useState('cases')
  const [status, setStatus] = useState<TestStatus | 'all'>('all')
  const [testType, setTestType] = useState<TestType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null)
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set(['suite_1']))
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [showCreateRun, setShowCreateRun] = useState(false)

  const { testCases: hookTestCases, stats, isLoading } = useQATestCases(initialTestCases, {
    status: status === 'all' ? undefined : status,
    testType: testType === 'all' ? undefined : testType
  })

  // Calculate stats
  const totalTests = mockTestCases.length
  const passedTests = mockTestCases.filter(t => t.status === 'passed').length
  const failedTests = mockTestCases.filter(t => t.status === 'failed').length
  const automatedTests = mockTestCases.filter(t => t.automationStatus === 'automated').length
  const overallPassRate = (passedTests / totalTests) * 100
  const activeRuns = mockRuns.filter(r => r.status === 'active').length
  const openDefects = mockDefects.filter(d => d.status === 'open' || d.status === 'in_progress').length

  const filteredTestCases = useMemo(() => {
    return mockTestCases.filter(test => {
      const matchesStatus = status === 'all' || test.status === status
      const matchesType = testType === 'all' || test.type === testType
      const matchesSearch = !searchQuery ||
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.id.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesType && matchesSearch
    })
  }, [status, testType, searchQuery])

  const getStatusColor = (s: TestStatus) => {
    switch (s) {
      case 'passed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'blocked': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'untested': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'retest': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'skipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
  }

  const getPriorityColor = (p: TestPriority) => {
    switch (p) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (s: TestStatus) => {
    switch (s) {
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'untested': return <Clock className="w-4 h-4 text-gray-500" />
      case 'retest': return <RotateCcw className="w-4 h-4 text-yellow-500" />
      case 'skipped': return <SkipForward className="w-4 h-4 text-purple-500" />
    }
  }

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-red-100 text-red-700'
      case 'major': return 'bg-orange-100 text-orange-700'
      case 'minor': return 'bg-yellow-100 text-yellow-700'
      case 'trivial': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getMilestoneStatusColor = (s: MilestoneStatus) => {
    switch (s) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'started': return 'bg-blue-100 text-blue-700'
      case 'open': return 'bg-gray-100 text-gray-700'
    }
  }

  const toggleSuite = (suiteId: string) => {
    setExpandedSuites(prev => {
      const next = new Set(prev)
      if (next.has(suiteId)) {
        next.delete(suiteId)
      } else {
        next.add(suiteId)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50/30 to-emerald-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              Test Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">TestRail-Level Quality Assurance Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Run Tests
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowCreateTest(true)}>
              <Plus className="w-4 h-4" />
              Add Test Case
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Test Cases</span>
              </div>
              <p className="text-2xl font-bold">{totalTests}</p>
              <p className="text-xs text-green-600">+12 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Pass Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{overallPassRate.toFixed(1)}%</p>
              <p className="text-xs text-green-600">+2.3% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              <p className="text-xs text-green-600">-3 from last run</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500">Automated</span>
              </div>
              <p className="text-2xl font-bold">{automatedTests}</p>
              <p className="text-xs text-gray-500">{((automatedTests / totalTests) * 100).toFixed(0)}% coverage</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <PlayCircle className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Active Runs</span>
              </div>
              <p className="text-2xl font-bold">{activeRuns}</p>
              <p className="text-xs text-gray-500">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500">Open Defects</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{openDefects}</p>
              <p className="text-xs text-gray-500">Needs attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Milestone className="w-4 h-4 text-teal-500" />
                <span className="text-xs text-gray-500">Milestones</span>
              </div>
              <p className="text-2xl font-bold">{mockMilestones.length}</p>
              <p className="text-xs text-gray-500">{mockMilestones.filter(m => m.status === 'started').length} active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border">
            <TabsTrigger value="cases" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Test Cases
            </TabsTrigger>
            <TabsTrigger value="runs" className="gap-2">
              <PlayCircle className="w-4 h-4" />
              Test Runs
              {activeRuns > 0 && <Badge className="ml-1 bg-blue-500 text-white">{activeRuns}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2">
              <Flag className="w-4 h-4" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="defects" className="gap-2">
              <Bug className="w-4 h-4" />
              Defects
              {openDefects > 0 && <Badge className="ml-1 bg-red-500 text-white">{openDefects}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Test Cases Tab */}
          <TabsContent value="cases" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Test Suites Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        Test Suites
                      </span>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mockSuites.map((suite) => (
                        <div
                          key={suite.id}
                          className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${selectedSuite?.id === suite.id ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                          onClick={() => setSelectedSuite(suite)}
                        >
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); toggleSuite(suite.id) }}>
                              {expandedSuites.has(suite.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <FolderOpen className="w-4 h-4 text-yellow-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{suite.name}</p>
                              <p className="text-xs text-gray-500">{suite.testCaseCount} tests</p>
                            </div>
                            <Badge variant="outline" className={suite.passRate >= 90 ? 'border-green-500 text-green-600' : suite.passRate >= 70 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}>
                              {suite.passRate}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Cases List */}
              <div className="lg:col-span-3 space-y-4">
                {/* Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search test cases..."
                          className="pl-10"
                        />
                      </div>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TestStatus | 'all')}
                        className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Status</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="blocked">Blocked</option>
                        <option value="untested">Untested</option>
                        <option value="retest">Retest</option>
                      </select>
                      <select
                        value={testType}
                        onChange={(e) => setTestType(e.target.value as TestType | 'all')}
                        className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                      >
                        <option value="all">All Types</option>
                        <option value="functional">Functional</option>
                        <option value="regression">Regression</option>
                        <option value="integration">Integration</option>
                        <option value="smoke">Smoke</option>
                        <option value="security">Security</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Cases */}
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredTestCases.map((test) => (
                        <div
                          key={test.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => setSelectedTestCase(test)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getStatusIcon(test.status)}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500 font-mono">{test.id.toUpperCase()}</span>
                                  <Badge className={getPriorityColor(test.priority)}>{test.priority}</Badge>
                                  <Badge variant="outline">{test.type}</Badge>
                                  {test.automationStatus === 'automated' && (
                                    <Badge className="bg-purple-100 text-purple-700">
                                      <Zap className="w-3 h-3 mr-1" />
                                      Auto
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="font-medium">{test.title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {test.estimate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {test.createdBy}
                                  </span>
                                  <span>{test.steps.length} steps</span>
                                  {test.refs && test.refs.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Link2 className="w-3 h-3" />
                                      {test.refs.length} refs
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Test Runs Tab */}
          <TabsContent value="runs" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Test Runs</h3>
                <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowCreateRun(true)}>
                  <Plus className="w-4 h-4" />
                  Create Test Run
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockRuns.map((run) => {
                  const progress = ((run.passedCount + run.failedCount + run.blockedCount) / run.totalCount) * 100
                  const passRate = run.totalCount > 0 ? (run.passedCount / (run.passedCount + run.failedCount)) * 100 : 0

                  return (
                    <Card key={run.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRun(run)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{run.name}</h4>
                              <Badge className={run.status === 'active' ? 'bg-blue-100 text-blue-700' : run.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {run.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{run.description}</p>
                          </div>
                          {run.status === 'active' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Play className="w-3 h-3 mr-1" />
                              Continue
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />

                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <p className="font-bold text-green-600">{run.passedCount}</p>
                              <p className="text-gray-500">Passed</p>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                              <p className="font-bold text-red-600">{run.failedCount}</p>
                              <p className="text-gray-500">Failed</p>
                            </div>
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                              <p className="font-bold text-orange-600">{run.blockedCount}</p>
                              <p className="text-gray-500">Blocked</p>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <p className="font-bold text-gray-600">{run.untestedCount}</p>
                              <p className="text-gray-500">Untested</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <span>{run.config}</span>
                            <span>{run.assignedTo}</span>
                            <span>{new Date(run.startedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Milestones</h3>
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockMilestones.map((milestone) => (
                  <Card key={milestone.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Flag className="w-4 h-4 text-teal-500" />
                            <h4 className="font-semibold">{milestone.name}</h4>
                          </div>
                          <Badge className={getMilestoneStatusColor(milestone.status)}>{milestone.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{milestone.description}</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Test Runs</span>
                          <span className="font-medium">{milestone.completedRuns}/{milestone.totalRuns}</span>
                        </div>
                        <Progress value={(milestone.completedRuns / milestone.totalRuns) * 100} className="h-2" />

                        {milestone.passRate > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Pass Rate</span>
                            <span className={`font-bold ${milestone.passRate >= 90 ? 'text-green-600' : milestone.passRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {milestone.passRate}%
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(milestone.startDate).toLocaleDateString()}
                          </span>
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Defects Tab */}
          <TabsContent value="defects" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Defects & Issues</h3>
                <Button className="bg-red-600 hover:bg-red-700 gap-2">
                  <Plus className="w-4 h-4" />
                  Report Defect
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockDefects.map((defect) => (
                      <div key={defect.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Bug className={`w-5 h-5 ${defect.severity === 'critical' ? 'text-red-500' : defect.severity === 'major' ? 'text-orange-500' : 'text-yellow-500'}`} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-500 font-mono">{defect.id.toUpperCase()}</span>
                                <Badge className={getSeverityColor(defect.severity)}>{defect.severity}</Badge>
                                <Badge variant="outline">{defect.status}</Badge>
                              </div>
                              <h4 className="font-medium">{defect.title}</h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  {defect.testCaseId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {defect.assignedTo}
                                </span>
                                <span>{new Date(defect.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pass Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockSuites.map((suite) => (
                        <div key={suite.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{suite.name}</span>
                            <span className={`font-bold ${suite.passRate >= 90 ? 'text-green-600' : suite.passRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {suite.passRate}%
                            </span>
                          </div>
                          <Progress value={suite.passRate} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Test Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-4">
                        <p className="text-4xl font-bold text-green-600">{((automatedTests / totalTests) * 100).toFixed(0)}%</p>
                        <p className="text-sm text-gray-500">Automation Coverage</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Automated</span>
                          <span className="font-semibold">{automatedTests}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Manual</span>
                          <span className="font-semibold">{totalTests - automatedTests}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Execution Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Passed
                          </span>
                          <span className="font-semibold text-green-600">{passedTests}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            Failed
                          </span>
                          <span className="font-semibold text-red-600">{failedTests}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Blocked
                          </span>
                          <span className="font-semibold text-orange-600">{mockTestCases.filter(t => t.status === 'blocked').length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Summary Report', 'Comparison Report', 'Milestone Report', 'Defects Report', 'Coverage Report'].map((report) => (
                        <Button key={report} variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          {report}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">TC_001 passed</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium">TC_003 failed</p>
                          <p className="text-xs text-gray-500">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <PlayCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Sprint 23 Run started</p>
                          <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Bug className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium">DEF_001 created</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Test Case Detail Dialog */}
        <Dialog open={!!selectedTestCase} onOpenChange={() => setSelectedTestCase(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-green-600" />
                Test Case Details
              </DialogTitle>
              <DialogDescription>
                {selectedTestCase?.id.toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            {selectedTestCase && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedTestCase.status)}
                  <Badge className={getStatusColor(selectedTestCase.status)}>{selectedTestCase.status}</Badge>
                  <Badge className={getPriorityColor(selectedTestCase.priority)}>{selectedTestCase.priority}</Badge>
                  <Badge variant="outline">{selectedTestCase.type}</Badge>
                  {selectedTestCase.automationStatus === 'automated' && (
                    <Badge className="bg-purple-100 text-purple-700">Automated</Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold">{selectedTestCase.title}</h3>
                </div>

                {selectedTestCase.preconditions && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Preconditions</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{selectedTestCase.preconditions}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Test Steps</h4>
                  <div className="space-y-2">
                    {selectedTestCase.steps.map((step) => (
                      <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-sm font-medium text-green-700">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{step.action}</p>
                          <p className="text-sm text-gray-500">Expected: {step.expectedResult}</p>
                          {step.actualResult && (
                            <p className="text-sm text-red-500">Actual: {step.actualResult}</p>
                          )}
                        </div>
                        {step.status && getStatusIcon(step.status)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Expected Result</h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{selectedTestCase.expectedResult}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Estimate</p>
                    <p className="font-medium">{selectedTestCase.estimate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created By</p>
                    <p className="font-medium">{selectedTestCase.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="font-medium">{selectedTestCase.updatedAt}</p>
                  </div>
                </div>

                {selectedTestCase.refs && selectedTestCase.refs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">References</h4>
                    <div className="flex items-center gap-2">
                      {selectedTestCase.refs.map((ref) => (
                        <Badge key={ref} variant="outline" className="gap-1">
                          <Link2 className="w-3 h-3" />
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Execute Test
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Test Run Detail Dialog */}
        <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                Test Run Details
              </DialogTitle>
            </DialogHeader>
            {selectedRun && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">{selectedRun.name}</h3>
                  <Badge className={selectedRun.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                    {selectedRun.status}
                  </Badge>
                </div>

                <p className="text-gray-500">{selectedRun.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{((selectedRun.passedCount + selectedRun.failedCount + selectedRun.blockedCount) / selectedRun.totalCount * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(selectedRun.passedCount + selectedRun.failedCount + selectedRun.blockedCount) / selectedRun.totalCount * 100} className="h-3" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedRun.passedCount}</p>
                    <p className="text-sm text-gray-500">Passed</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{selectedRun.failedCount}</p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">{selectedRun.blockedCount}</p>
                    <p className="text-sm text-gray-500">Blocked</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-600">{selectedRun.untestedCount}</p>
                    <p className="text-sm text-gray-500">Untested</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Configuration</p>
                    <p className="font-medium">{selectedRun.config}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{selectedRun.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Started</p>
                    <p className="font-medium">{new Date(selectedRun.startedAt).toLocaleString()}</p>
                  </div>
                  {selectedRun.completedAt && (
                    <div>
                      <p className="text-gray-500">Completed</p>
                      <p className="font-medium">{new Date(selectedRun.completedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  {selectedRun.status === 'active' && (
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Testing
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
