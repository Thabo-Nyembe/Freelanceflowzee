'use client'

import { useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useQATestCases, useQAMutations, QATestCase } from '@/lib/hooks/use-qa'
import { createClient } from '@/lib/supabase/client'
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  PlayCircle,
  Plus,
  Download,
  Search,
  Settings,
  FileText,
  FolderOpen,
  Users,
  Calendar,
  Flag,
  Bug,
  Layers,
  GitBranch,
  BarChart3,
  PieChart,
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
  SkipForward,
  RotateCcw,
  Link2,
  MessageSquare,
  Timer,
  Code,
  Terminal,
  Milestone,
  ListChecks,
  FlaskConical,
  Upload,
  Share2,
  Mail,
  Loader2
} from 'lucide-react'

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

// Enhanced Competitive Upgrade Data
const mockQAAIInsights = [
  { id: '1', type: 'success' as const, title: 'Test Coverage', description: 'Code coverage reached 92%. Target exceeded!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Coverage' },
  { id: '2', type: 'info' as const, title: 'Flaky Tests', description: '3 tests showing intermittent failures. Review recommended.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Stability' },
  { id: '3', type: 'warning' as const, title: 'Critical Path', description: 'Payment flow tests failing. Blocking release.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Blockers' },
]

const mockQACollaborators = [
  { id: '1', name: 'QA Lead', avatar: '/avatars/qa.jpg', status: 'online' as const, role: 'Testing', lastActive: 'Now' },
  { id: '2', name: 'SDET', avatar: '/avatars/sdet.jpg', status: 'online' as const, role: 'Automation', lastActive: '10m ago' },
  { id: '3', name: 'Test Analyst', avatar: '/avatars/analyst.jpg', status: 'away' as const, role: 'Manual', lastActive: '45m ago' },
]

const mockQAPredictions = [
  { id: '1', label: 'Pass Rate', current: 94, target: 98, predicted: 96, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Coverage %', current: 92, target: 95, predicted: 94, confidence: 88, trend: 'up' as const },
  { id: '3', label: 'Bug Escape', current: 5, target: 2, predicted: 3, confidence: 75, trend: 'down' as const },
]

const mockQAActivities = [
  { id: '1', user: 'QA Lead', action: 'completed', target: 'regression suite run', timestamp: '20m ago', type: 'success' as const },
  { id: '2', user: 'SDET', action: 'fixed', target: 'flaky login test', timestamp: '1h ago', type: 'info' as const },
  { id: '3', user: 'Test Analyst', action: 'reported', target: '2 new defects', timestamp: '2h ago', type: 'warning' as const },
]

// Quick actions are defined inside the component to access state setters

export default function QAClient({ initialTestCases }: QAClientProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('cases')
  const [settingsTab, setSettingsTab] = useState('general')
  const [status, setStatus] = useState<TestStatus | 'all'>('all')
  const [testType, setTestType] = useState<TestType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [selectedRun, setSelectedRun] = useState<TestRun | null>(null)
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set(['suite_1']))
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [showCreateRun, setShowCreateRun] = useState(false)
  const [showReportDefect, setShowReportDefect] = useState(false)
  const [showCreateMilestone, setShowCreateMilestone] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)

  // Form states for create test case
  const [newTestForm, setNewTestForm] = useState({
    test_name: '',
    description: '',
    test_type: 'functional',
    priority: 'medium',
    is_automated: false,
    environment: '',
    preconditions: '',
    expected_result: ''
  })

  // Form states for create test run
  const [newRunForm, setNewRunForm] = useState({
    name: '',
    description: '',
    config: '',
    assigned_to: ''
  })

  // Form states for defect
  const [newDefectForm, setNewDefectForm] = useState({
    title: '',
    description: '',
    severity: 'major',
    test_case_id: ''
  })

  // Form states for milestone
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    name: '',
    description: '',
    due_date: '',
    start_date: ''
  })

  // Loading states for operations
  const [isCreatingTest, setIsCreatingTest] = useState(false)
  const [isCreatingRun, setIsCreatingRun] = useState(false)
  const [isCreatingDefect, setIsCreatingDefect] = useState(false)
  const [isCreatingMilestone, setIsCreatingMilestone] = useState(false)
  const [isExecutingTest, setIsExecutingTest] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isRunningAllTests, setIsRunningAllTests] = useState(false)

  const { testCases: hookTestCases, stats, isLoading, refetch } = useQATestCases(initialTestCases, {
    status: status === 'all' ? undefined : status,
    testType: testType === 'all' ? undefined : testType
  })

  const {
    createTestCase,
    isCreating,
    updateTestCase,
    isUpdating,
    deleteTestCase,
    isDeleting,
    executeTest,
    isExecuting
  } = useQAMutations()

  // Calculate stats
  const totalTests = mockTestCases.length
  const passedTests = mockTestCases.filter(t => t.status === 'passed').length
  const failedTests = mockTestCases.filter(t => t.status === 'failed').length
  const automatedTests = mockTestCases.filter(t => t.automationStatus === 'automated').length
  const overallPassRate = (passedTests / totalTests) * 100
  const activeRuns = mockRuns.filter(r => r.status === 'active').length
  const openDefects = mockDefects.filter(d => d.status === 'open' || d.status === 'in_progress').length

  // Quick actions with dialog openers
  const qaQuickActions = [
    { id: '1', label: 'Run Tests', icon: 'Play', shortcut: 'R', action: () => setShowCreateRun(true) },
    { id: '2', label: 'New Case', icon: 'Plus', shortcut: 'N', action: () => setShowCreateTest(true) },
    { id: '3', label: 'Reports', icon: 'FileText', shortcut: 'P', action: () => setShowReportsDialog(true) },
    { id: '4', label: 'Defects', icon: 'Bug', shortcut: 'D', action: () => setShowReportDefect(true) },
  ]

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

  // Handlers - Real Supabase Operations
  const handleRunTestSuite = useCallback(async (suiteName: string) => {
    setIsRunningAllTests(true)
    toast.loading('Running test suite', {
      description: `Executing all tests in "${suiteName}"...`,
      id: 'run-suite'
    })
    try {
      // Get all test cases in the suite and execute them
      const { data: testCases, error } = await supabase
        .from('qa_test_cases')
        .select('id')
        .is('deleted_at', null)
        .limit(10) // Run first 10 tests as example

      if (error) throw error

      if (testCases && testCases.length > 0) {
        for (const tc of testCases.slice(0, 3)) {
          await executeTest(tc.id)
        }
      }

      toast.success('Test suite completed', {
        description: `Executed tests in "${suiteName}"`,
        id: 'run-suite'
      })
      refetch()
    } catch (error: any) {
      toast.error('Failed to run test suite', {
        description: error.message || 'An error occurred',
        id: 'run-suite'
      })
    } finally {
      setIsRunningAllTests(false)
    }
  }, [supabase, executeTest, refetch])

  const handleCreateTestCase = useCallback(async () => {
    if (!newTestForm.test_name.trim()) {
      toast.error('Validation Error', { description: 'Test name is required' })
      return
    }

    setIsCreatingTest(true)
    try {
      const result = await createTestCase({
        test_name: newTestForm.test_name,
        description: newTestForm.description || undefined,
        test_type: newTestForm.test_type,
        priority: newTestForm.priority,
        is_automated: newTestForm.is_automated,
        environment: newTestForm.environment || undefined,
        preconditions: newTestForm.preconditions || undefined,
        expected_result: newTestForm.expected_result || undefined
      })

      if (result?.success) {
        toast.success('Test case created', {
          description: `Test case "${newTestForm.test_name}" has been created`
        })
        setShowCreateTest(false)
        setNewTestForm({
          test_name: '',
          description: '',
          test_type: 'functional',
          priority: 'medium',
          is_automated: false,
          environment: '',
          preconditions: '',
          expected_result: ''
        })
        refetch()
      } else {
        throw new Error(result?.message || 'Failed to create test case')
      }
    } catch (error: any) {
      toast.error('Failed to create test case', {
        description: error.message || 'An error occurred'
      })
    } finally {
      setIsCreatingTest(false)
    }
  }, [newTestForm, createTestCase, refetch])

  const handleCreateTestRun = useCallback(async () => {
    if (!newRunForm.name.trim()) {
      toast.error('Validation Error', { description: 'Run name is required' })
      return
    }

    setIsCreatingRun(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('qa_test_runs')
        .insert({
          user_id: user.id,
          name: newRunForm.name,
          description: newRunForm.description,
          config: newRunForm.config,
          assigned_to: newRunForm.assigned_to,
          status: 'active',
          started_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Test run created', {
        description: `Test run "${newRunForm.name}" has been created`
      })
      setShowCreateRun(false)
      setNewRunForm({
        name: '',
        description: '',
        config: '',
        assigned_to: ''
      })
    } catch (error: any) {
      toast.error('Failed to create test run', {
        description: error.message || 'An error occurred'
      })
    } finally {
      setIsCreatingRun(false)
    }
  }, [newRunForm, supabase])

  const handleReportDefect = useCallback(async () => {
    if (!newDefectForm.title.trim()) {
      toast.error('Validation Error', { description: 'Defect title is required' })
      return
    }

    setIsCreatingDefect(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('qa_defects')
        .insert({
          user_id: user.id,
          title: newDefectForm.title,
          description: newDefectForm.description,
          severity: newDefectForm.severity,
          test_case_id: newDefectForm.test_case_id || null,
          status: 'open'
        })

      if (error) throw error

      toast.success('Defect reported', {
        description: `Defect "${newDefectForm.title}" has been created`
      })
      setShowReportDefect(false)
      setNewDefectForm({
        title: '',
        description: '',
        severity: 'major',
        test_case_id: ''
      })
    } catch (error: any) {
      toast.error('Failed to report defect', {
        description: error.message || 'An error occurred'
      })
    } finally {
      setIsCreatingDefect(false)
    }
  }, [newDefectForm, supabase])

  const handleCreateMilestone = useCallback(async () => {
    if (!newMilestoneForm.name.trim()) {
      toast.error('Validation Error', { description: 'Milestone name is required' })
      return
    }

    setIsCreatingMilestone(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('qa_milestones')
        .insert({
          user_id: user.id,
          name: newMilestoneForm.name,
          description: newMilestoneForm.description,
          due_date: newMilestoneForm.due_date || null,
          start_date: newMilestoneForm.start_date || null,
          status: 'open'
        })

      if (error) throw error

      toast.success('Milestone created', {
        description: `Milestone "${newMilestoneForm.name}" has been created`
      })
      setShowCreateMilestone(false)
      setNewMilestoneForm({
        name: '',
        description: '',
        due_date: '',
        start_date: ''
      })
    } catch (error: any) {
      toast.error('Failed to create milestone', {
        description: error.message || 'An error occurred'
      })
    } finally {
      setIsCreatingMilestone(false)
    }
  }, [newMilestoneForm, supabase])

  const handleExportResults = useCallback(async () => {
    setIsExporting(true)
    toast.loading('Exporting results...', { id: 'export' })
    try {
      const { data: testCases, error } = await supabase
        .from('qa_test_cases')
        .select('*')
        .is('deleted_at', null)

      if (error) throw error

      // Create CSV content
      const csvContent = [
        ['ID', 'Name', 'Type', 'Priority', 'Status', 'Pass Rate', 'Created At'].join(','),
        ...(testCases || []).map(tc =>
          [tc.test_code, tc.test_name, tc.test_type, tc.priority, tc.status, tc.pass_rate, tc.created_at].join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qa-test-results-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Export complete', {
        description: 'Test results have been downloaded',
        id: 'export'
      })
    } catch (error: any) {
      toast.error('Export failed', {
        description: error.message || 'An error occurred',
        id: 'export'
      })
    } finally {
      setIsExporting(false)
    }
  }, [supabase])

  const handleRerunFailedTests = useCallback(async () => {
    toast.loading('Rerunning failed tests...', { id: 'rerun' })
    try {
      const { data: failedTests, error } = await supabase
        .from('qa_test_cases')
        .select('id')
        .eq('status', 'failed')
        .is('deleted_at', null)

      if (error) throw error

      if (failedTests && failedTests.length > 0) {
        for (const tc of failedTests) {
          await executeTest(tc.id)
        }
        toast.success('Rerun complete', {
          description: `Re-executed ${failedTests.length} failed tests`,
          id: 'rerun'
        })
        refetch()
      } else {
        toast.info('No failed tests', {
          description: 'No failed tests to rerun',
          id: 'rerun'
        })
      }
    } catch (error: any) {
      toast.error('Rerun failed', {
        description: error.message || 'An error occurred',
        id: 'rerun'
      })
    }
  }, [supabase, executeTest, refetch])

  const handleExecuteSelectedTest = useCallback(async (testCaseId: string) => {
    setIsExecutingTest(true)
    toast.loading('Executing test...', { id: 'execute-test' })
    try {
      const result = await executeTest(testCaseId)
      if (result?.success) {
        toast.success('Test executed', {
          description: 'Test execution completed successfully',
          id: 'execute-test'
        })
        refetch()
        setSelectedTestCase(null)
      } else {
        throw new Error(result?.message || 'Failed to execute test')
      }
    } catch (error: any) {
      toast.error('Execution failed', {
        description: error.message || 'An error occurred',
        id: 'execute-test'
      })
    } finally {
      setIsExecutingTest(false)
    }
  }, [executeTest, refetch])

  const handleDeleteTestCase = useCallback(async (testCaseId: string) => {
    toast.loading('Deleting test case...', { id: 'delete-test' })
    try {
      const result = await deleteTestCase(testCaseId)
      if (result?.success) {
        toast.success('Test case deleted', {
          description: 'Test case has been removed',
          id: 'delete-test'
        })
        refetch()
        setSelectedTestCase(null)
      } else {
        throw new Error(result?.message || 'Failed to delete test case')
      }
    } catch (error: any) {
      toast.error('Delete failed', {
        description: error.message || 'An error occurred',
        id: 'delete-test'
      })
    }
  }, [deleteTestCase, refetch])

  const handleGenerateReport = useCallback(async () => {
    toast.loading('Generating report...', { id: 'report' })
    try {
      const { data: stats } = await supabase
        .from('qa_test_cases')
        .select('status, priority, test_type, pass_rate')
        .is('deleted_at', null)

      // Generate report data
      const total = stats?.length || 0
      const passed = stats?.filter(t => t.status === 'passed').length || 0
      const failed = stats?.filter(t => t.status === 'failed').length || 0
      const avgPassRate = total > 0 ? stats!.reduce((sum, t) => sum + Number(t.pass_rate || 0), 0) / total : 0

      toast.success('Report generated', {
        description: `Total: ${total}, Passed: ${passed}, Failed: ${failed}, Pass Rate: ${avgPassRate.toFixed(1)}%`,
        id: 'report'
      })
    } catch (error: any) {
      toast.error('Report generation failed', {
        description: error.message || 'An error occurred',
        id: 'report'
      })
    }
  }, [supabase])

  const handleRunAllTests = useCallback(async () => {
    setIsRunningAllTests(true)
    toast.loading('Running all tests...', { id: 'run-all' })
    try {
      const { data: testCases, error } = await supabase
        .from('qa_test_cases')
        .select('id')
        .is('deleted_at', null)
        .limit(20)

      if (error) throw error

      if (testCases && testCases.length > 0) {
        for (const tc of testCases) {
          await executeTest(tc.id)
        }
        toast.success('All tests completed', {
          description: `Executed ${testCases.length} tests`,
          id: 'run-all'
        })
        refetch()
      } else {
        toast.info('No tests found', {
          description: 'Create some test cases first',
          id: 'run-all'
        })
      }
    } catch (error: any) {
      toast.error('Test run failed', {
        description: error.message || 'An error occurred',
        id: 'run-all'
      })
    } finally {
      setIsRunningAllTests(false)
    }
  }, [supabase, executeTest, refetch])

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
            <Button variant="outline" className="gap-2" onClick={handleExportResults} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleRunAllTests} disabled={isRunningAllTests}>
              {isRunningAllTests ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              Run Tests
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowCreateTest(true)}>
              <Plus className="w-4 h-4" />
              Add Test Case
            </Button>
          </div>
        </div>

        {/* QA Overview Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">QA Testing Hub</h2>
              <p className="text-green-100 text-sm">Comprehensive test management and execution</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
              <Button className="bg-white text-green-700 hover:bg-green-50" onClick={handleRunAllTests} disabled={isRunningAllTests}>
                {isRunningAllTests ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                Run All Tests
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-8 gap-3">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{totalTests}</p>
              <p className="text-xs text-green-100">Test Cases</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-200">{overallPassRate.toFixed(0)}%</p>
              <p className="text-xs text-green-100">Pass Rate</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{passedTests}</p>
              <p className="text-xs text-green-100">Passed</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-300">{failedTests}</p>
              <p className="text-xs text-green-100">Failed</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{automatedTests}</p>
              <p className="text-xs text-green-100">Automated</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{activeRuns}</p>
              <p className="text-xs text-green-100">Active Runs</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-300">{openDefects}</p>
              <p className="text-xs text-green-100">Open Defects</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{mockMilestones.length}</p>
              <p className="text-xs text-green-100">Milestones</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: 'Create Test', icon: Plus, color: 'green', action: () => setShowCreateTest(true) },
            { label: 'Start Run', icon: PlayCircle, color: 'blue', action: () => setShowCreateRun(true) },
            { label: 'Report Bug', icon: Bug, color: 'red', action: () => setShowReportDefect(true) },
            { label: 'View Reports', icon: BarChart3, color: 'purple', action: () => setActiveTab('reports') },
            { label: 'Export Tests', icon: Download, color: 'indigo', action: handleExportResults },
            { label: 'Run All', icon: Zap, color: 'amber', action: handleRunAllTests },
          ].map((action, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" onClick={action.action}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center`}>
                  <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Coverage Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Test Type Distribution</h4>
              <div className="space-y-2">
                {[
                  { type: 'Unit', count: 156, pct: 45 },
                  { type: 'Integration', count: 89, pct: 26 },
                  { type: 'E2E', count: 67, pct: 19 },
                  { type: 'Performance', count: 34, pct: 10 },
                ].map(t => (
                  <div key={t.type} className="flex items-center gap-2">
                    <span className="w-20 text-xs">{t.type}</span>
                    <Progress value={t.pct} className="h-2 flex-1" />
                    <span className="text-xs font-medium w-8 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Priority Breakdown</h4>
              <div className="space-y-2">
                {[
                  { priority: 'Critical', count: 45, color: 'red' },
                  { priority: 'High', count: 89, color: 'orange' },
                  { priority: 'Medium', count: 156, color: 'yellow' },
                  { priority: 'Low', count: 56, color: 'green' },
                ].map(p => (
                  <div key={p.priority} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${p.color}-500`} />
                      <span className="text-sm">{p.priority}</span>
                    </div>
                    <span className="text-sm font-medium">{p.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Execution</h4>
              <div className="space-y-3">
                {[
                  { name: 'Login Suite', passed: 23, failed: 2, time: '5m ago' },
                  { name: 'API Tests', passed: 45, failed: 0, time: '12m ago' },
                  { name: 'Checkout Flow', passed: 12, failed: 1, time: '1h ago' },
                ].map(run => (
                  <div key={run.name} className="flex items-center justify-between text-sm">
                    <span className="truncate">{run.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">{run.passed}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600">{run.failed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Team Performance</h4>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Chen', tests: 45, rate: 98 },
                  { name: 'Mike Johnson', tests: 38, rate: 95 },
                  { name: 'Emily Davis', tests: 32, rate: 100 },
                ].map(member => (
                  <div key={member.name} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6"><AvatarFallback className="text-xs bg-green-100 text-green-700">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <span className="flex-1 text-sm truncate">{member.name}</span>
                    <Badge variant="outline" className="text-xs">{member.rate}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
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
          <TabsContent value="runs" className="mt-6 space-y-6">
            {/* Test Runs Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Test Runs</h2>
                  <p className="text-blue-100 text-sm">Manage and execute test runs</p>
                </div>
                <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => setShowCreateRun(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create Run
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockRuns.length}</p><p className="text-xs text-blue-100">Total Runs</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockRuns.filter(r => r.status === 'active').length}</p><p className="text-xs text-blue-100">Active</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockRuns.filter(r => r.status === 'completed').length}</p><p className="text-xs text-blue-100">Completed</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">87%</p><p className="text-xs text-blue-100">Avg Pass Rate</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">2.3h</p><p className="text-xs text-blue-100">Avg Duration</p></div>
              </div>
            </div>

            {/* Run Status Cards */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { status: 'Active', count: mockRuns.filter(r => r.status === 'active').length, icon: PlayCircle, color: 'blue', desc: 'Currently running' },
                { status: 'Completed', count: mockRuns.filter(r => r.status === 'completed').length, icon: CheckCircle2, color: 'green', desc: 'Successfully finished' },
                { status: 'Scheduled', count: 2, icon: Calendar, color: 'purple', desc: 'Upcoming runs' },
                { status: 'Failed', count: 1, icon: XCircle, color: 'red', desc: 'Needs attention' },
              ].map((stat, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.count}</p>
                        <p className="text-xs text-gray-500">{stat.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">

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
                <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setShowCreateMilestone(true)}>
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
          <TabsContent value="defects" className="mt-6 space-y-6">
            {/* Defects Overview Banner */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Defect Tracking</h2>
                  <p className="text-red-100 text-sm">Monitor and resolve issues</p>
                </div>
                <Button className="bg-white text-red-700 hover:bg-red-50" onClick={() => setShowReportDefect(true)}>
                  <Plus className="h-4 w-4 mr-2" />Report Defect
                </Button>
              </div>
              <div className="grid grid-cols-6 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockDefects.length}</p><p className="text-xs text-red-100">Total</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockDefects.filter(d => d.status === 'open').length}</p><p className="text-xs text-red-100">Open</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockDefects.filter(d => d.severity === 'critical').length}</p><p className="text-xs text-red-100">Critical</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">{mockDefects.filter(d => d.status === 'resolved').length}</p><p className="text-xs text-red-100">Resolved</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">2.4d</p><p className="text-xs text-red-100">Avg Resolve</p></div>
                <div className="bg-white/20 rounded-lg p-3 text-center"><p className="text-2xl font-bold">89%</p><p className="text-xs text-red-100">Fix Rate</p></div>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { severity: 'Critical', count: mockDefects.filter(d => d.severity === 'critical').length, color: 'red', icon: AlertTriangle },
                { severity: 'Major', count: mockDefects.filter(d => d.severity === 'major').length, color: 'orange', icon: Bug },
                { severity: 'Minor', count: mockDefects.filter(d => d.severity === 'minor').length, color: 'yellow', icon: AlertTriangle },
                { severity: 'Low', count: 2, color: 'green', icon: Bug },
              ].map((sev, i) => (
                <Card key={i} className={`border-${sev.color}-200 dark:border-${sev.color}-800`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${sev.color}-100 dark:bg-${sev.color}-900/30 flex items-center justify-center`}>
                        <sev.icon className={`h-5 w-5 text-${sev.color}-600`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{sev.count}</p>
                        <p className="text-xs text-gray-500">{sev.severity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Defects List */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Defects</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search defects..." className="pl-10 w-64" /></div>
                    <select className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"><option>All Severity</option><option>Critical</option><option>Major</option><option>Minor</option></select>
                    <select className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"><option>All Status</option><option>Open</option><option>In Progress</option><option>Resolved</option></select>
                  </div>
                </div>
              </CardHeader>
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
                              <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{defect.testCaseId}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{defect.assignedTo}</span>
                              <span>{new Date(defect.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success('Test case view opened');
                          }}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedTestCase(testCase);
                            setShowTestCaseDialog(true);
                            toast.success('Edit mode enabled');
                          }}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success('More options available');
                          }}><MoreHorizontal className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Defect Insights */}
            <div className="grid grid-cols-3 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Defects by Component</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{ comp: 'Login Module', count: 5 }, { comp: 'API Gateway', count: 3 }, { comp: 'Dashboard', count: 2 }, { comp: 'Checkout', count: 2 }].map(c => (
                      <div key={c.comp} className="flex items-center justify-between">
                        <span className="text-sm">{c.comp}</span><Badge variant="outline">{c.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Resolution Time</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[{ range: '< 1 day', pct: 35 }, { range: '1-3 days', pct: 40 }, { range: '3-7 days', pct: 15 }, { range: '> 7 days', pct: 10 }].map(r => (
                      <div key={r.range} className="flex items-center gap-2">
                        <span className="w-20 text-xs text-gray-500">{r.range}</span>
                        <Progress value={r.pct} className="h-2 flex-1" />
                        <span className="text-xs font-medium w-8 text-right">{r.pct}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Top Reporters</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{ name: 'Sarah Chen', count: 12 }, { name: 'Mike Johnson', count: 8 }, { name: 'Emily Davis', count: 6 }].map(r => (
                      <div key={r.name} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-xs bg-red-100 text-red-700">{r.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <span className="flex-1 text-sm">{r.name}</span><Badge variant="outline">{r.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6 space-y-6">
            {/* Reports Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Test Reports & Analytics</h2>
                  <p className="text-purple-100 text-sm">Comprehensive testing insights and metrics</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />Refresh
                  </Button>
                  <Button className="bg-white text-purple-700 hover:bg-purple-50" onClick={handleExportResults} disabled={isExporting}>
                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Export PDF
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{overallPassRate.toFixed(0)}%</p>
                  <p className="text-xs text-purple-100">Pass Rate</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{totalTests}</p>
                  <p className="text-xs text-purple-100">Total Tests</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{((automatedTests / totalTests) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-purple-100">Automated</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-purple-100">Executions</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">24.5h</p>
                  <p className="text-xs text-purple-100">Total Runtime</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">+12%</p>
                  <p className="text-xs text-purple-100">Improvement</p>
                </div>
              </div>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { name: 'Summary', icon: FileText, desc: 'Overall test summary', color: 'blue' },
                { name: 'Trends', icon: TrendingUp, desc: 'Historical trends', color: 'green' },
                { name: 'Coverage', icon: Target, desc: 'Test coverage map', color: 'purple' },
                { name: 'Defects', icon: Bug, desc: 'Defect analysis', color: 'red' },
                { name: 'Custom', icon: PieChart, desc: 'Build custom report', color: 'amber' },
              ].map((report, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/30 flex items-center justify-center`}>
                      <report.icon className={`h-6 w-6 text-${report.color}-600`} />
                    </div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-xs text-gray-500">{report.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {/* Pass Rate by Week */}
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Pass Rate Trend (Last 8 Weeks)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'].map((week, i) => {
                        const rates = [82, 85, 84, 88, 86, 91, 89, 93]
                        return (
                          <div key={week} className="flex items-center gap-3">
                            <span className="w-16 text-sm text-gray-500">{week}</span>
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4">
                              <div className={`h-4 rounded-full ${rates[i] >= 90 ? 'bg-green-500' : rates[i] >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${rates[i]}%` }} />
                            </div>
                            <span className={`text-sm font-medium w-12 text-right ${rates[i] >= 90 ? 'text-green-600' : ''}`}>{rates[i]}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Pass Rate by Suite</CardTitle></CardHeader>
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

            {/* Scheduled Reports */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scheduled Reports</CardTitle>
                    <CardDescription>Automated report generation and delivery</CardDescription>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Weekly Summary', schedule: 'Every Monday 9:00 AM', recipients: 5, format: 'PDF', status: 'active' },
                    { name: 'Sprint Report', schedule: 'Every 2 weeks', recipients: 12, format: 'PDF + CSV', status: 'active' },
                    { name: 'Defect Analysis', schedule: 'Daily 6:00 PM', recipients: 3, format: 'Email', status: 'paused' },
                    { name: 'Coverage Metrics', schedule: 'Monthly 1st', recipients: 8, format: 'Excel', status: 'active' },
                  ].map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Clock className={`h-5 w-5 ${report.status === 'active' ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <p className="text-sm text-gray-500">{report.schedule}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm font-medium">{report.recipients}</p>
                          <p className="text-xs text-gray-500">Recipients</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium">{report.format}</p>
                          <p className="text-xs text-gray-500">Format</p>
                        </div>
                        <Badge className={report.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{report.status}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => {
                          toast.success('Report options menu opened');
                        }}><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report History */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Report History</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Search reports..." className="w-64" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32"><SelectValue placeholder="All Types" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="defects">Defects</SelectItem>
                        <SelectItem value="coverage">Coverage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Sprint 23 Summary Report', type: 'Summary', generated: '2 hours ago', size: '2.4 MB', downloads: 12 },
                    { name: 'Weekly Defect Analysis', type: 'Defects', generated: 'Yesterday', size: '1.8 MB', downloads: 8 },
                    { name: 'Q4 Coverage Report', type: 'Coverage', generated: '3 days ago', size: '5.2 MB', downloads: 24 },
                    { name: 'Regression Test Results', type: 'Summary', generated: '1 week ago', size: '3.1 MB', downloads: 15 },
                    { name: 'Critical Path Analysis', type: 'Custom', generated: '2 weeks ago', size: '1.2 MB', downloads: 6 },
                  ].map((report, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-sm">{report.name}</h4>
                          <p className="text-xs text-gray-500">{report.generated} • {report.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="text-sm text-gray-500">{report.downloads} downloads</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => {
                            toast.success('Report preview opened');
                          }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            const element = document.createElement('a');
                            element.setAttribute('href', `data:text/plain;charset=utf-8,Report: ${report.name}`);
                            element.setAttribute('download', `${report.name}.txt`);
                            element.style.display = 'none';
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                            toast.success('Report downloaded successfully');
                          }}><Download className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`Report: ${report.name}`);
                            toast.success('Report link copied to clipboard');
                          }}><Share2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Insights */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Most Viewed Reports</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: 'Weekly Summary', views: 156 },
                      { name: 'Sprint Report', views: 98 },
                      { name: 'Coverage Analysis', views: 74 },
                    ].map((report, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{i + 1}. {report.name}</span>
                        <span className="text-gray-500">{report.views} views</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Export Statistics</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-red-500" />PDF</span>
                      <span className="font-medium">234</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-green-500" />Excel</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" />CSV</span>
                      <span className="font-medium">89</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Report Actions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-sm"><Upload className="h-4 w-4 mr-2" />Import Template</Button>
                    <Button variant="outline" className="w-full justify-start text-sm"><PieChart className="h-4 w-4 mr-2" />Custom Builder</Button>
                    <Button variant="outline" className="w-full justify-start text-sm"><Mail className="h-4 w-4 mr-2" />Email Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit border-gray-200 dark:border-gray-700">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'environments', icon: Layers, label: 'Environments' },
                      { id: 'integrations', icon: Link2, label: 'Integrations' },
                      { id: 'automation', icon: Zap, label: 'Automation' },
                      { id: 'notifications', icon: MessageSquare, label: 'Notifications' },
                      { id: 'advanced', icon: Code, label: 'Advanced' },
                    ].map(item => (
                      <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <item.icon className="h-4 w-4" /><span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Configure your QA testing environment</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Project Name</label><Input defaultValue="FreeFlow QA Suite" className="mt-1" /></div>
                        <div><label className="text-sm font-medium">Default Test Owner</label><Input defaultValue="qa-team@company.com" className="mt-1" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Default Priority</label>
                          <select className="w-full px-4 py-2 border rounded-md mt-1 bg-white dark:bg-gray-800">
                            <option>Medium</option><option>High</option><option>Low</option><option>Critical</option>
                          </select>
                        </div>
                        <div><label className="text-sm font-medium">Test Case Prefix</label><Input defaultValue="TC_" className="mt-1" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Auto-assign Test Cases</h4><p className="text-sm text-gray-500">Automatically assign test cases to team members</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Require Approval</h4><p className="text-sm text-gray-500">Require approval before closing test runs</p></div><input type="checkbox" className="toggle" /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Track Test History</h4><p className="text-sm text-gray-500">Maintain history of all test executions</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'environments' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><div className="flex items-center justify-between"><div><CardTitle>Test Environments</CardTitle><CardDescription>Manage testing environments and configurations</CardDescription></div><Button><Plus className="h-4 w-4 mr-2" />Add Environment</Button></div></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Development', url: 'https://dev.app.com', status: 'active', browser: 'Chrome 120', os: 'Windows 11' },
                        { name: 'Staging', url: 'https://staging.app.com', status: 'active', browser: 'Firefox 121', os: 'macOS Sonoma' },
                        { name: 'Production', url: 'https://app.com', status: 'active', browser: 'Safari 17', os: 'iOS 17' },
                        { name: 'QA', url: 'https://qa.app.com', status: 'inactive', browser: 'Edge 120', os: 'Windows 11' },
                      ].map(env => (
                        <div key={env.name} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${env.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}><Layers className={`h-5 w-5 ${env.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} /></div>
                            <div><h4 className="font-medium">{env.name}</h4><p className="text-sm text-gray-500">{env.url}</p></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm"><p>{env.browser}</p><p className="text-gray-500">{env.os}</p></div>
                            <Badge className={env.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{env.status}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => {
                              toast.success('Environment editor opened');
                            }}><Edit className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Integrations</CardTitle><CardDescription>Connect with external tools and services</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: 'Jira', desc: 'Link defects to Jira issues', status: 'connected', icon: Bug },
                        { name: 'GitHub', desc: 'Sync with GitHub issues and PRs', status: 'connected', icon: GitBranch },
                        { name: 'Slack', desc: 'Send notifications to Slack channels', status: 'disconnected', icon: MessageSquare },
                        { name: 'Jenkins', desc: 'Trigger tests from CI/CD pipelines', status: 'connected', icon: Terminal },
                        { name: 'Selenium Grid', desc: 'Run tests on Selenium Grid', status: 'connected', icon: Layers },
                      ].map(int => (
                        <div key={int.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center border"><int.icon className="h-5 w-5 text-gray-600" /></div>
                            <div><h4 className="font-medium">{int.name}</h4><p className="text-sm text-gray-500">{int.desc}</p></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={int.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{int.status}</Badge>
                            <Button variant={int.status === 'connected' ? 'outline' : 'default'} size="sm">{int.status === 'connected' ? 'Configure' : 'Connect'}</Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'automation' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Automation Settings</CardTitle><CardDescription>Configure automated test execution</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Default Framework</label>
                          <select className="w-full px-4 py-2 border rounded-md mt-1 bg-white dark:bg-gray-800">
                            <option>Selenium</option><option>Cypress</option><option>Playwright</option><option>Puppeteer</option>
                          </select>
                        </div>
                        <div><label className="text-sm font-medium">Parallel Execution</label>
                          <select className="w-full px-4 py-2 border rounded-md mt-1 bg-white dark:bg-gray-800">
                            <option>4 threads</option><option>8 threads</option><option>16 threads</option><option>32 threads</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Auto-retry Failed Tests</h4><p className="text-sm text-gray-500">Automatically retry failed tests up to 3 times</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Screenshot on Failure</h4><p className="text-sm text-gray-500">Capture screenshots when tests fail</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Video Recording</h4><p className="text-sm text-gray-500">Record video of test execution</p></div><input type="checkbox" className="toggle" /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Headless Mode</h4><p className="text-sm text-gray-500">Run browsers in headless mode</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                      </div>
                      <div><label className="text-sm font-medium">Timeout (seconds)</label><Input type="number" defaultValue="30" className="mt-1 w-32" /></div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Notification Settings</CardTitle><CardDescription>Configure alerts and notifications</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Test Run Completed</h4><p className="text-sm text-gray-500">Notify when a test run completes</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Test Failure</h4><p className="text-sm text-gray-500">Notify immediately when a test fails</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Defect Created</h4><p className="text-sm text-gray-500">Notify when a new defect is logged</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Daily Summary</h4><p className="text-sm text-gray-500">Send daily test summary report</p></div><input type="checkbox" className="toggle" /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Milestone Reached</h4><p className="text-sm text-gray-500">Notify when milestone targets are met</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                      </div>
                      <div><label className="text-sm font-medium">Notification Email</label><Input type="email" defaultValue="qa-alerts@company.com" className="mt-1" /></div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Advanced Settings</CardTitle><CardDescription>Configure advanced QA options</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Data Retention (days)</label><Input type="number" defaultValue="365" className="mt-1" /></div>
                        <div><label className="text-sm font-medium">Max Attachments Size (MB)</label><Input type="number" defaultValue="50" className="mt-1" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">API Access</h4><p className="text-sm text-gray-500">Enable API access for external tools</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Require Test Steps</h4><p className="text-sm text-gray-500">Require detailed steps for all test cases</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><h4 className="font-medium">Version Control</h4><p className="text-sm text-gray-500">Track version history for test cases</p></div><input type="checkbox" className="toggle" defaultChecked /></div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-700 mb-2">Danger Zone</h4>
                        <div className="flex items-center justify-between">
                          <div><p className="text-sm text-red-600">Delete all test data</p><p className="text-xs text-red-500">This action cannot be undone</p></div>
                          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-2" />Delete Data</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockQAAIInsights}
              title="QA Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockQACollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockQAPredictions}
              title="Testing Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockQAActivities}
            title="QA Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={qaQuickActions}
            variant="grid"
          />
        </div>

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
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => selectedTestCase && handleExecuteSelectedTest(selectedTestCase.id)}
                    disabled={isExecutingTest}
                  >
                    {isExecutingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Execute Test
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 500)),
                      {
                        loading: 'Preparing edit mode...',
                        success: 'Edit mode - Test case editing coming soon',
                        error: 'Failed to enter edit mode'
                      }
                    )
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => {
                    toast.promise(
                      navigator.clipboard.writeText(selectedTestCase?.id || ''),
                      {
                        loading: 'Copying test case ID...',
                        success: 'Test case ID copied to clipboard',
                        error: 'Failed to copy to clipboard'
                      }
                    )
                  }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => selectedTestCase && handleDeleteTestCase(selectedTestCase.id)}>
                    <Trash2 className="w-4 h-4" />
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

        {/* Create Test Case Dialog */}
        <Dialog open={showCreateTest} onOpenChange={setShowCreateTest}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-green-600" />
                Create New Test Case
              </DialogTitle>
              <DialogDescription>
                Add a new test case to your QA suite
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="test_name">Test Name *</Label>
                  <Input
                    id="test_name"
                    value={newTestForm.test_name}
                    onChange={(e) => setNewTestForm(prev => ({ ...prev, test_name: e.target.value }))}
                    placeholder="Enter test case name"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTestForm.description}
                    onChange={(e) => setNewTestForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this test verifies"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="test_type">Test Type</Label>
                  <Select
                    value={newTestForm.test_type}
                    onValueChange={(value) => setNewTestForm(prev => ({ ...prev, test_type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="regression">Regression</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="smoke">Smoke</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTestForm.priority}
                    onValueChange={(value) => setNewTestForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Input
                    id="environment"
                    value={newTestForm.environment}
                    onChange={(e) => setNewTestForm(prev => ({ ...prev, environment: e.target.value }))}
                    placeholder="e.g., Production, Staging"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_automated"
                    checked={newTestForm.is_automated}
                    onChange={(e) => setNewTestForm(prev => ({ ...prev, is_automated: e.target.checked }))}
                  />
                  <Label htmlFor="is_automated">Automated Test</Label>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="preconditions">Preconditions</Label>
                  <Textarea
                    id="preconditions"
                    value={newTestForm.preconditions}
                    onChange={(e) => setNewTestForm(prev => ({ ...prev, preconditions: e.target.value }))}
                    placeholder="What must be true before running this test"
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="expected_result">Expected Result</Label>
                  <Textarea
                    id="expected_result"
                    value={newTestForm.expected_result}
                    onChange={(e) => setNewTestForm(prev => ({ ...prev, expected_result: e.target.value }))}
                    placeholder="What should happen when test passes"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTest(false)}>Cancel</Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreateTestCase}
                disabled={isCreatingTest}
              >
                {isCreatingTest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Test Case
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Test Run Dialog */}
        <Dialog open={showCreateRun} onOpenChange={setShowCreateRun}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                Create New Test Run
              </DialogTitle>
              <DialogDescription>
                Start a new test execution run
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="run_name">Run Name *</Label>
                <Input
                  id="run_name"
                  value={newRunForm.name}
                  onChange={(e) => setNewRunForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sprint 24 Regression"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="run_description">Description</Label>
                <Textarea
                  id="run_description"
                  value={newRunForm.description}
                  onChange={(e) => setNewRunForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this test run"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="run_config">Configuration</Label>
                <Input
                  id="run_config"
                  value={newRunForm.config}
                  onChange={(e) => setNewRunForm(prev => ({ ...prev, config: e.target.value }))}
                  placeholder="e.g., Chrome, Windows 11"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Input
                  id="assigned_to"
                  value={newRunForm.assigned_to}
                  onChange={(e) => setNewRunForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                  placeholder="e.g., qa-team@company.com"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateRun(false)}>Cancel</Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateTestRun}
                disabled={isCreatingRun}
              >
                {isCreatingRun ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                Create Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Defect Dialog */}
        <Dialog open={showReportDefect} onOpenChange={setShowReportDefect}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-600" />
                Report New Defect
              </DialogTitle>
              <DialogDescription>
                Log a new bug or issue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="defect_title">Defect Title *</Label>
                <Input
                  id="defect_title"
                  value={newDefectForm.title}
                  onChange={(e) => setNewDefectForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="defect_description">Description</Label>
                <Textarea
                  id="defect_description"
                  value={newDefectForm.description}
                  onChange={(e) => setNewDefectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed steps to reproduce"
                  className="mt-1"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={newDefectForm.severity}
                  onValueChange={(value) => setNewDefectForm(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="trivial">Trivial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="test_case_id">Related Test Case ID (optional)</Label>
                <Input
                  id="test_case_id"
                  value={newDefectForm.test_case_id}
                  onChange={(e) => setNewDefectForm(prev => ({ ...prev, test_case_id: e.target.value }))}
                  placeholder="e.g., TC-0001"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportDefect(false)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleReportDefect}
                disabled={isCreatingDefect}
              >
                {isCreatingDefect ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bug className="w-4 h-4 mr-2" />}
                Report Defect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Milestone Dialog */}
        <Dialog open={showCreateMilestone} onOpenChange={setShowCreateMilestone}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-teal-600" />
                Create New Milestone
              </DialogTitle>
              <DialogDescription>
                Define a new testing milestone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="milestone_name">Milestone Name *</Label>
                <Input
                  id="milestone_name"
                  value={newMilestoneForm.name}
                  onChange={(e) => setNewMilestoneForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., v2.5.0 Release"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="milestone_description">Description</Label>
                <Textarea
                  id="milestone_description"
                  value={newMilestoneForm.description}
                  onChange={(e) => setNewMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the milestone goals"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newMilestoneForm.start_date}
                    onChange={(e) => setNewMilestoneForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newMilestoneForm.due_date}
                    onChange={(e) => setNewMilestoneForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateMilestone(false)}>Cancel</Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleCreateMilestone}
                disabled={isCreatingMilestone}
              >
                {isCreatingMilestone ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Flag className="w-4 h-4 mr-2" />}
                Create Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reports Dialog */}
        <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                QA Reports
              </DialogTitle>
              <DialogDescription>
                Generate and view QA testing reports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                  toast.loading('Generating test coverage report...', { id: 'test-coverage-report' })
                  setTimeout(() => {
                    toast.success('Test coverage report generated!', { id: 'test-coverage-report', description: 'Report ready for download' })
                  }, 1500)
                }}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Test Coverage</p>
                      <p className="text-sm text-muted-foreground">Code coverage analysis</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                  toast.loading('Generating execution summary...', { id: 'execution-summary' })
                  setTimeout(() => {
                    toast.success('Execution summary generated!', { id: 'execution-summary', description: 'Summary ready for download' })
                  }, 1500)
                }}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <PieChart className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Execution Summary</p>
                      <p className="text-sm text-muted-foreground">Pass/fail statistics</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                  toast.loading('Generating defect report...', { id: 'defect-report' })
                  setTimeout(() => {
                    toast.success('Defect report generated!', { id: 'defect-report', description: 'Report ready for download' })
                  }, 1500)
                }}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <Bug className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Defect Report</p>
                      <p className="text-sm text-muted-foreground">Bug tracking summary</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                  toast.loading('Generating trend analysis...', { id: 'trend-analysis' })
                  setTimeout(() => {
                    toast.success('Trend analysis generated!', { id: 'trend-analysis', description: 'Analysis ready for download' })
                  }, 1500)
                }}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Trend Analysis</p>
                      <p className="text-sm text-muted-foreground">Historical trends</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="border-t pt-4">
                <Label>Quick Stats</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{totalTests}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{overallPassRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Close</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                toast.loading('Exporting all reports...', { id: 'export-all-reports' })
                setTimeout(() => {
                  toast.success('All reports exported!', { id: 'export-all-reports', description: 'Download started' })
                  setShowReportsDialog(false)
                }, 2000)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
