'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bug,
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  BarChart3,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CircleDot,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  MessageSquare,
  Paperclip,
  Link2,
  GitBranch,
  Tag,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Activity,
  FileText,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  Flag,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Layers,
  GitPullRequest,
  AlertCircle,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Sliders,
  Bell,
  Globe,
  Database,
  Workflow,
  Mail,
  Webhook,
  Terminal,
  Archive,
  History
} from 'lucide-react'

// Types
type BugStatus = 'open' | 'in_progress' | 'in_review' | 'resolved' | 'closed' | 'wont_fix' | 'duplicate'
type BugSeverity = 'critical' | 'high' | 'medium' | 'low'
type BugPriority = 'blocker' | 'critical' | 'major' | 'minor' | 'trivial'
type BugType = 'bug' | 'defect' | 'regression' | 'performance' | 'security' | 'ui' | 'crash'

interface BugLabel {
  id: string
  name: string
  color: string
}

interface BugComment {
  id: string
  author: string
  authorAvatar?: string
  content: string
  createdAt: string
  isEdited: boolean
}

interface BugAttachment {
  id: string
  name: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: string
  url: string
}

interface LinkedIssue {
  id: string
  key: string
  title: string
  type: 'blocks' | 'blocked_by' | 'duplicates' | 'related'
  status: BugStatus
}

interface BugItem {
  id: string
  key: string
  title: string
  description: string
  status: BugStatus
  severity: BugSeverity
  priority: BugPriority
  type: BugType
  reporter: {
    id: string
    name: string
    avatar?: string
  }
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  labels: BugLabel[]
  affectedVersion: string
  fixVersion?: string
  environment: string
  stepsToReproduce: string[]
  expectedBehavior: string
  actualBehavior: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  dueDate?: string
  timeEstimate?: number
  timeSpent?: number
  comments: BugComment[]
  attachments: BugAttachment[]
  linkedIssues: LinkedIssue[]
  votes: number
  watchers: number
  sprint?: string
  component?: string
}

interface BugStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  avgResolutionTime: number
  openThisWeek: number
  resolvedThisWeek: number
}

// Mock Data
const mockLabels: BugLabel[] = [
  { id: 'l1', name: 'frontend', color: '#3b82f6' },
  { id: 'l2', name: 'backend', color: '#10b981' },
  { id: 'l3', name: 'api', color: '#f59e0b' },
  { id: 'l4', name: 'database', color: '#8b5cf6' },
  { id: 'l5', name: 'auth', color: '#ef4444' },
  { id: 'l6', name: 'performance', color: '#ec4899' },
  { id: 'l7', name: 'ui/ux', color: '#06b6d4' }
]

const mockBugs: BugItem[] = [
  {
    id: 'bug-1',
    key: 'BUG-1234',
    title: 'Login form crashes when password contains special characters',
    description: 'Users report that the login form crashes when entering passwords with special characters like @ or #. This is blocking multiple users from accessing the system.',
    status: 'open',
    severity: 'critical',
    priority: 'blocker',
    type: 'crash',
    reporter: { id: 'u1', name: 'John Smith', avatar: 'JS' },
    assignee: { id: 'u2', name: 'Sarah Chen', avatar: 'SC' },
    labels: [mockLabels[0], mockLabels[4]],
    affectedVersion: '2.4.1',
    fixVersion: '2.4.2',
    environment: 'Production',
    stepsToReproduce: ['Navigate to login page', 'Enter username', 'Enter password with @ symbol', 'Click login button'],
    expectedBehavior: 'User should be logged in successfully',
    actualBehavior: 'Application crashes with white screen',
    createdAt: '2024-01-15T10:30:00',
    updatedAt: '2024-01-15T14:20:00',
    dueDate: '2024-01-18',
    timeEstimate: 4,
    timeSpent: 2,
    comments: [
      { id: 'c1', author: 'Sarah Chen', content: 'Investigating this now. Seems related to regex validation.', createdAt: '2024-01-15T11:00:00', isEdited: false },
      { id: 'c2', author: 'John Smith', content: 'Thanks for the quick response!', createdAt: '2024-01-15T11:15:00', isEdited: false }
    ],
    attachments: [
      { id: 'a1', name: 'error_screenshot.png', type: 'image/png', size: 245000, uploadedBy: 'John Smith', uploadedAt: '2024-01-15T10:35:00', url: '#' },
      { id: 'a2', name: 'console_log.txt', type: 'text/plain', size: 1200, uploadedBy: 'John Smith', uploadedAt: '2024-01-15T10:36:00', url: '#' }
    ],
    linkedIssues: [
      { id: 'li1', key: 'BUG-1200', title: 'Input validation improvements', type: 'related', status: 'closed' }
    ],
    votes: 24,
    watchers: 15,
    sprint: 'Sprint 12',
    component: 'Authentication'
  },
  {
    id: 'bug-2',
    key: 'BUG-1235',
    title: 'Dashboard loads slowly with large datasets',
    description: 'Dashboard takes over 30 seconds to load when displaying more than 1000 records. Users are experiencing timeouts and poor performance.',
    status: 'in_progress',
    severity: 'high',
    priority: 'major',
    type: 'performance',
    reporter: { id: 'u3', name: 'Mike Johnson', avatar: 'MJ' },
    assignee: { id: 'u4', name: 'Alex Rivera', avatar: 'AR' },
    labels: [mockLabels[0], mockLabels[5]],
    affectedVersion: '2.4.0',
    fixVersion: '2.5.0',
    environment: 'Production',
    stepsToReproduce: ['Login as admin', 'Navigate to dashboard', 'Set date range to last year'],
    expectedBehavior: 'Dashboard loads within 3 seconds',
    actualBehavior: 'Dashboard takes 30+ seconds or times out',
    createdAt: '2024-01-14T09:00:00',
    updatedAt: '2024-01-15T16:00:00',
    dueDate: '2024-01-20',
    timeEstimate: 16,
    timeSpent: 8,
    comments: [
      { id: 'c3', author: 'Alex Rivera', content: 'Implementing pagination and lazy loading. PR coming soon.', createdAt: '2024-01-15T15:00:00', isEdited: true }
    ],
    attachments: [],
    linkedIssues: [],
    votes: 18,
    watchers: 22,
    sprint: 'Sprint 12',
    component: 'Dashboard'
  },
  {
    id: 'bug-3',
    key: 'BUG-1236',
    title: 'Export to CSV missing some columns',
    description: 'When exporting data to CSV, the "Created Date" and "Modified Date" columns are missing from the output file.',
    status: 'in_review',
    severity: 'medium',
    priority: 'minor',
    type: 'bug',
    reporter: { id: 'u5', name: 'Emily Davis', avatar: 'ED' },
    assignee: { id: 'u2', name: 'Sarah Chen', avatar: 'SC' },
    labels: [mockLabels[1], mockLabels[2]],
    affectedVersion: '2.4.1',
    environment: 'Staging',
    stepsToReproduce: ['Go to Reports', 'Select any report', 'Click Export to CSV'],
    expectedBehavior: 'All columns including dates should be exported',
    actualBehavior: 'Date columns are missing',
    createdAt: '2024-01-12T14:30:00',
    updatedAt: '2024-01-15T10:00:00',
    timeEstimate: 2,
    timeSpent: 1.5,
    comments: [],
    attachments: [
      { id: 'a3', name: 'exported_file.csv', type: 'text/csv', size: 5000, uploadedBy: 'Emily Davis', uploadedAt: '2024-01-12T14:35:00', url: '#' }
    ],
    linkedIssues: [],
    votes: 8,
    watchers: 5,
    sprint: 'Sprint 11',
    component: 'Reporting'
  },
  {
    id: 'bug-4',
    key: 'BUG-1237',
    title: 'Button color inconsistent in dark mode',
    description: 'Primary action buttons appear with wrong color in dark mode theme.',
    status: 'resolved',
    severity: 'low',
    priority: 'trivial',
    type: 'ui',
    reporter: { id: 'u6', name: 'Chris Brown', avatar: 'CB' },
    assignee: { id: 'u7', name: 'Lisa Park', avatar: 'LP' },
    labels: [mockLabels[0], mockLabels[6]],
    affectedVersion: '2.4.0',
    fixVersion: '2.4.1',
    environment: 'Development',
    stepsToReproduce: ['Enable dark mode', 'Navigate to settings page', 'Observe button colors'],
    expectedBehavior: 'Buttons should have correct brand color',
    actualBehavior: 'Buttons appear gray instead of blue',
    createdAt: '2024-01-10T11:00:00',
    updatedAt: '2024-01-14T09:00:00',
    resolvedAt: '2024-01-14T09:00:00',
    timeEstimate: 1,
    timeSpent: 0.5,
    comments: [
      { id: 'c4', author: 'Lisa Park', content: 'Fixed in PR #456. Updated CSS variables for dark mode.', createdAt: '2024-01-14T09:00:00', isEdited: false }
    ],
    attachments: [],
    linkedIssues: [],
    votes: 3,
    watchers: 2,
    component: 'UI Components'
  },
  {
    id: 'bug-5',
    key: 'BUG-1238',
    title: 'API rate limiting not working correctly',
    description: 'Rate limiting is allowing more requests than configured. Set to 100 req/min but allowing 500+.',
    status: 'open',
    severity: 'high',
    priority: 'critical',
    type: 'security',
    reporter: { id: 'u8', name: 'David Kim', avatar: 'DK' },
    labels: [mockLabels[1], mockLabels[2]],
    affectedVersion: '2.4.1',
    environment: 'Production',
    stepsToReproduce: ['Send 100+ requests in 1 minute', 'Observe no rate limiting'],
    expectedBehavior: 'Requests should be blocked after 100/minute',
    actualBehavior: 'No rate limiting is applied',
    createdAt: '2024-01-15T08:00:00',
    updatedAt: '2024-01-15T08:00:00',
    dueDate: '2024-01-16',
    timeEstimate: 8,
    comments: [],
    attachments: [],
    linkedIssues: [
      { id: 'li2', key: 'SEC-89', title: 'Security audit findings', type: 'related', status: 'open' }
    ],
    votes: 12,
    watchers: 18,
    sprint: 'Sprint 12',
    component: 'API Gateway'
  },
  {
    id: 'bug-6',
    key: 'BUG-1239',
    title: 'Duplicate email notifications',
    description: 'Users receiving 2-3 copies of the same notification email.',
    status: 'closed',
    severity: 'medium',
    priority: 'minor',
    type: 'bug',
    reporter: { id: 'u9', name: 'Rachel Green', avatar: 'RG' },
    assignee: { id: 'u4', name: 'Alex Rivera', avatar: 'AR' },
    labels: [mockLabels[1]],
    affectedVersion: '2.3.5',
    fixVersion: '2.4.0',
    environment: 'Production',
    stepsToReproduce: ['Trigger any notification', 'Check email inbox'],
    expectedBehavior: 'One email per notification',
    actualBehavior: 'Multiple duplicate emails received',
    createdAt: '2024-01-05T16:00:00',
    updatedAt: '2024-01-08T10:00:00',
    resolvedAt: '2024-01-07T15:00:00',
    timeEstimate: 4,
    timeSpent: 3,
    comments: [],
    attachments: [],
    linkedIssues: [],
    votes: 45,
    watchers: 32,
    component: 'Notifications'
  }
]

const mockStats: BugStats = {
  total: 156,
  open: 42,
  inProgress: 28,
  resolved: 54,
  closed: 32,
  critical: 5,
  high: 18,
  medium: 45,
  low: 88,
  avgResolutionTime: 3.2,
  openThisWeek: 12,
  resolvedThisWeek: 18
}

// Helper functions
const getStatusColor = (status: BugStatus) => {
  switch (status) {
    case 'open': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'in_review': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    case 'wont_fix': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'duplicate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
}

const getStatusIcon = (status: BugStatus) => {
  switch (status) {
    case 'open': return <AlertCircle className="w-4 h-4" />
    case 'in_progress': return <Play className="w-4 h-4" />
    case 'in_review': return <Eye className="w-4 h-4" />
    case 'resolved': return <CheckCircle className="w-4 h-4" />
    case 'closed': return <XCircle className="w-4 h-4" />
    case 'wont_fix': return <Minus className="w-4 h-4" />
    case 'duplicate': return <Copy className="w-4 h-4" />
  }
}

const getSeverityColor = (severity: BugSeverity) => {
  switch (severity) {
    case 'critical': return 'bg-red-600 text-white'
    case 'high': return 'bg-orange-500 text-white'
    case 'medium': return 'bg-yellow-500 text-white'
    case 'low': return 'bg-blue-500 text-white'
  }
}

const getPriorityIcon = (priority: BugPriority) => {
  switch (priority) {
    case 'blocker': return <ArrowUp className="w-4 h-4 text-red-600" />
    case 'critical': return <ArrowUp className="w-4 h-4 text-orange-600" />
    case 'major': return <Minus className="w-4 h-4 text-yellow-600" />
    case 'minor': return <ArrowDown className="w-4 h-4 text-blue-600" />
    case 'trivial': return <ArrowDown className="w-4 h-4 text-gray-500" />
  }
}

const getTypeIcon = (type: BugType) => {
  switch (type) {
    case 'bug': return <Bug className="w-4 h-4 text-red-600" />
    case 'defect': return <AlertTriangle className="w-4 h-4 text-orange-600" />
    case 'regression': return <RotateCcw className="w-4 h-4 text-purple-600" />
    case 'performance': return <Zap className="w-4 h-4 text-yellow-600" />
    case 'security': return <AlertCircle className="w-4 h-4 text-red-600" />
    case 'ui': return <Layers className="w-4 h-4 text-blue-600" />
    case 'crash': return <XCircle className="w-4 h-4 text-red-600" />
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function BugsClient() {
  const [activeTab, setActiveTab] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all')
  const [severityFilter, setSeverityFilter] = useState<BugSeverity | 'all'>('all')
  const [selectedBug, setSelectedBug] = useState<BugItem | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [settingsTab, setSettingsTab] = useState('general')

  // Computed values
  const filteredBugs = useMemo(() => {
    return mockBugs.filter(bug => {
      const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter
      const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter
      return matchesSearch && matchesStatus && matchesSeverity
    })
  }, [searchTerm, statusFilter, severityFilter])

  const bugsByStatus = useMemo(() => {
    return {
      open: mockBugs.filter(b => b.status === 'open'),
      in_progress: mockBugs.filter(b => b.status === 'in_progress'),
      in_review: mockBugs.filter(b => b.status === 'in_review'),
      resolved: mockBugs.filter(b => b.status === 'resolved'),
      closed: mockBugs.filter(b => b.status === 'closed')
    }
  }, [])

  const boardColumns = [
    { id: 'open', label: 'Open', bugs: bugsByStatus.open, color: 'border-red-500' },
    { id: 'in_progress', label: 'In Progress', bugs: bugsByStatus.in_progress, color: 'border-blue-500' },
    { id: 'in_review', label: 'In Review', bugs: bugsByStatus.in_review, color: 'border-purple-500' },
    { id: 'resolved', label: 'Resolved', bugs: bugsByStatus.resolved, color: 'border-green-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-amber-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bug Tracker</h1>
              <p className="text-gray-600 dark:text-gray-400">Jira-level issue tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <Bug className="w-4 h-4" />
                <span className="text-xs font-medium">Total Bugs</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.total}</p>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Open</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.open}</p>
              <p className="text-xs text-red-600">+{mockStats.openThisWeek} this week</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Play className="w-4 h-4" />
                <span className="text-xs font-medium">In Progress</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.inProgress}</p>
              <p className="text-xs text-muted-foreground">being fixed</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Resolved</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.resolved}</p>
              <p className="text-xs text-green-600">+{mockStats.resolvedThisWeek} this week</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Critical</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.critical}</p>
              <p className="text-xs text-muted-foreground">need attention</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Flag className="w-4 h-4" />
                <span className="text-xs font-medium">High</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.high}</p>
              <p className="text-xs text-muted-foreground">priority</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Timer className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Resolution</span>
              </div>
              <p className="text-2xl font-bold">{mockStats.avgResolutionTime}d</p>
              <p className="text-xs text-muted-foreground">days to fix</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-cyan-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Resolution</span>
              </div>
              <Progress value={Math.round((mockStats.resolved / mockStats.total) * 100)} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round((mockStats.resolved / mockStats.total) * 100)}% fixed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white/80 dark:bg-gray-800/80">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Bugs
              </TabsTrigger>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="sprints" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Sprints
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bugs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 bg-white/80 dark:bg-gray-800/80"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Bugs List Tab */}
          <TabsContent value="list" className="space-y-4">
            {/* Bugs List Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Bug className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Bug List</h3>
                  <Badge className="bg-white/20 text-white border-0">{filteredBugs.length} Items</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Track and manage bugs across your entire project. Filter by status, severity, or search to find specific issues.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-red-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Plus, label: 'Report Bug', color: 'from-red-500 to-orange-500' },
                    { icon: Search, label: 'Search Issues', color: 'from-blue-500 to-cyan-500' },
                    { icon: Filter, label: 'Advanced Filter', color: 'from-green-500 to-emerald-500' },
                    { icon: Archive, label: 'View Archive', color: 'from-gray-500 to-slate-500' },
                    { icon: Download, label: 'Export CSV', color: 'from-violet-500 to-purple-500' },
                    { icon: Upload, label: 'Import Bugs', color: 'from-pink-500 to-rose-500' },
                    { icon: GitBranch, label: 'Link PRs', color: 'from-teal-500 to-green-500' },
                    { icon: History, label: 'View History', color: 'from-amber-500 to-orange-500' },
                  ].map((action, idx) => (
                    <button key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 group">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              {(['all', 'open', 'in_progress', 'in_review', 'resolved', 'closed'] as const).map(s => (
                <Button
                  key={s}
                  variant={statusFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                  className="capitalize"
                >
                  {s === 'all' ? 'All' : s.replace('_', ' ')}
                </Button>
              ))}
              <span className="text-sm font-medium text-muted-foreground ml-4">Severity:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(s => (
                <Button
                  key={s}
                  variant={severityFilter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSeverityFilter(s)}
                  className="capitalize"
                >
                  {s === 'all' ? 'All' : s}
                </Button>
              ))}
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y dark:divide-gray-700">
                    {filteredBugs.map(bug => (
                      <div
                        key={bug.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedBug(bug)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(bug.type)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-muted-foreground">{bug.key}</span>
                                <Badge className={getSeverityColor(bug.severity)}>{bug.severity}</Badge>
                                <Badge className={getStatusColor(bug.status)} variant="outline">
                                  {getStatusIcon(bug.status)}
                                  <span className="ml-1 capitalize">{bug.status.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                              <h3 className="font-semibold mb-1">{bug.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  {getPriorityIcon(bug.priority)}
                                  <span className="capitalize">{bug.priority}</span>
                                </span>
                                <span>v{bug.affectedVersion}</span>
                                {bug.component && <span>{bug.component}</span>}
                                <span>{formatDate(bug.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {bug.labels.slice(0, 3).map(label => (
                                  <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>
                                    {label.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {bug.assignee && (
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-red-100 text-red-700 text-xs">
                                  {bug.assignee.avatar || bug.assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {bug.comments.length}
                              </span>
                              <span className="flex items-center gap-1">
                                <Paperclip className="w-4 h-4" />
                                {bug.attachments.length}
                              </span>
                              <span className="flex items-center gap-1">
                                <ArrowUp className="w-4 h-4" />
                                {bug.votes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board" className="space-y-4">
            {/* Board Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <LayoutGrid className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Kanban Board</h3>
                  <Badge className="bg-white/20 text-white border-0">4 Columns</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Visualize your bug workflow with drag-and-drop kanban. Move issues through stages from open to resolved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {boardColumns.map(column => (
                <div key={column.id} className="space-y-4">
                  <div className={`flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border-t-4 ${column.color}`}>
                    <h3 className="font-semibold">{column.label}</h3>
                    <Badge variant="secondary">{column.bugs.length}</Badge>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3 pr-2">
                      {column.bugs.map(bug => (
                        <Card key={bug.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedBug(bug)}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">{bug.key}</span>
                              <Badge className={getSeverityColor(bug.severity)} className="text-[10px]">{bug.severity}</Badge>
                            </div>
                            <h4 className="text-sm font-medium mb-2 line-clamp-2">{bug.title}</h4>
                            <div className="flex items-center justify-between">
                              {bug.assignee ? (
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="bg-red-100 text-red-700 text-[10px]">
                                    {bug.assignee.avatar || bug.assignee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unassigned</span>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {getPriorityIcon(bug.priority)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="space-y-4">
            {/* Sprints Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Sprint Planning</h3>
                  <Badge className="bg-white/20 text-white border-0">Active Sprints</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Organize bugs into sprints for agile development. Track sprint progress and manage your backlog efficiently.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {['Sprint 12', 'Sprint 11', 'Backlog'].map(sprint => {
                const sprintBugs = mockBugs.filter(b => b.sprint === sprint || (!b.sprint && sprint === 'Backlog'))
                return (
                  <Card key={sprint} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          {sprint}
                        </CardTitle>
                        <Badge variant="secondary">{sprintBugs.length} bugs</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {sprintBugs.slice(0, 3).map(bug => (
                          <div key={bug.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(bug.type)}
                              <span className="text-sm font-medium">{bug.key}</span>
                              <span className="text-sm text-muted-foreground truncate max-w-[300px]">{bug.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(bug.status)} variant="outline">{bug.status.replace('_', ' ')}</Badge>
                              {bug.assignee && (
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-[10px]">{bug.assignee.avatar}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        ))}
                        {sprintBugs.length > 3 && (
                          <Button variant="ghost" className="w-full text-sm">
                            View all {sprintBugs.length} bugs
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Bug Analytics</h3>
                  <Badge className="bg-white/20 text-white border-0">Insights</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Analyze bug trends, resolution times, and team performance. Make data-driven decisions to improve quality.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockStats.avgResolutionTime}d</div>
                    <div className="text-xs text-white/70">Avg Resolution</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockStats.resolvedThisWeek}</div>
                    <div className="text-xs text-white/70">Fixed This Week</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{Math.round((mockStats.resolved / mockStats.total) * 100)}%</div>
                    <div className="text-xs text-white/70">Resolution Rate</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockStats.critical}</div>
                    <div className="text-xs text-white/70">Critical Issues</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Bug Trend (14 days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const opened = Math.floor(Math.random() * 8) + 2
                      const resolved = Math.floor(Math.random() * 10) + 3
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col gap-1">
                            <div
                              className="w-full bg-green-500 rounded-t"
                              style={{ height: `${resolved * 4}px` }}
                            />
                            <div
                              className="w-full bg-red-500"
                              style={{ height: `${opened * 4}px` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-sm">Opened</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-sm">Resolved</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Severity Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Critical', count: mockStats.critical, color: 'bg-red-500', total: mockStats.total },
                      { label: 'High', count: mockStats.high, color: 'bg-orange-500', total: mockStats.total },
                      { label: 'Medium', count: mockStats.medium, color: 'bg-yellow-500', total: mockStats.total },
                      { label: 'Low', count: mockStats.low, color: 'bg-blue-500', total: mockStats.total }
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="w-16 text-sm font-medium">{item.label}</span>
                        <div className="flex-1">
                          <Progress value={(item.count / item.total) * 100} className={`h-3 ${item.color}`} />
                        </div>
                        <span className="w-12 text-sm text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Top Bug Fixers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah Chen', fixed: 24, avatar: 'SC' },
                      { name: 'Alex Rivera', fixed: 19, avatar: 'AR' },
                      { name: 'Lisa Park', fixed: 15, avatar: 'LP' },
                      { name: 'David Kim', fixed: 12, avatar: 'DK' }
                    ].map((user, idx) => (
                      <div key={user.name} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-red-100 text-red-700 text-xs">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{user.name}</p>
                          <Progress value={(user.fixed / 24) * 100} className="h-2 mt-1" />
                        </div>
                        <span className="font-bold">{user.fixed}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Bugs by Component
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Authentication', count: 12, color: '#ef4444' },
                      { name: 'Dashboard', count: 18, color: '#f59e0b' },
                      { name: 'API Gateway', count: 8, color: '#10b981' },
                      { name: 'Notifications', count: 6, color: '#6366f1' },
                      { name: 'Reporting', count: 15, color: '#ec4899' }
                    ].map(component => (
                      <div key={component.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: component.color }} />
                        <span className="flex-1 text-sm">{component.name}</span>
                        <Badge variant="secondary">{component.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            {/* Team Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Bug Fix Team</h3>
                  <Badge className="bg-white/20 text-white border-0">6 Members</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Track team workload, bug assignments, and resolution performance. Manage team capacity and distribution.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-xs text-white/70">Team Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">23</div>
                    <div className="text-xs text-white/70">Active Bugs</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">70</div>
                    <div className="text-xs text-white/70">Bugs Resolved</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">94%</div>
                    <div className="text-xs text-white/70">SLA Compliance</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Sarah Chen', role: 'Senior Developer', avatar: 'SC', assigned: 8, resolved: 24, inProgress: 3 },
                { name: 'Alex Rivera', role: 'Full Stack Developer', avatar: 'AR', assigned: 6, resolved: 19, inProgress: 2 },
                { name: 'Lisa Park', role: 'Frontend Developer', avatar: 'LP', assigned: 4, resolved: 15, inProgress: 2 },
                { name: 'David Kim', role: 'Backend Developer', avatar: 'DK', assigned: 5, resolved: 12, inProgress: 3 },
                { name: 'Mike Johnson', role: 'QA Engineer', avatar: 'MJ', assigned: 0, resolved: 0, inProgress: 0 },
                { name: 'Emily Davis', role: 'Product Manager', avatar: 'ED', assigned: 0, resolved: 0, inProgress: 0 }
              ].map(member => (
                <Card key={member.name} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-red-100 text-red-700">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-lg font-bold text-blue-600">{member.assigned}</p>
                        <p className="text-xs text-muted-foreground">Assigned</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-lg font-bold text-orange-600">{member.inProgress}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-lg font-bold text-green-600">{member.resolved}</p>
                        <p className="text-xs text-muted-foreground">Resolved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs with Sidebar */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Bug Tracker Settings</h3>
                  <Badge className="bg-red-500/20 text-red-300 border-0">Jira Level</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your bug tracking system, workflows, integrations, notifications, and team permissions.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockLabels.length}</div>
                    <div className="text-xs text-white/70">Labels</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-xs text-white/70">Workflow States</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-xs text-white/70">Integrations</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-xs text-white/70">Team Members</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                        { id: 'workflow', label: 'Workflow', icon: Workflow, description: 'Bug states & transitions' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
                        { id: 'integrations', label: 'Integrations', icon: Zap, description: 'Third-party apps' },
                        { id: 'security', label: 'Security', icon: Shield, description: 'Access control' },
                        { id: 'advanced', label: 'Advanced', icon: Sliders, description: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-l-4 border-red-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-red-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
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
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-red-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure basic bug tracker preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-assign Bugs</p>
                            <p className="text-sm text-gray-500">Automatically assign new bugs based on component</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Duplicate Detection</p>
                            <p className="text-sm text-gray-500">Suggest potential duplicates when creating bugs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Time Tracking</p>
                            <p className="text-sm text-gray-500">Enable time estimates and logging</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require Description</p>
                            <p className="text-sm text-gray-500">Make description field mandatory</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="w-5 h-5 text-blue-600" />
                          Labels
                        </CardTitle>
                        <CardDescription>Manage bug labels and categories</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {mockLabels.map(label => (
                          <div key={label.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: label.color }} />
                              <span className="font-medium">{label.name}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Label
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Workflow Settings */}
                {settingsTab === 'workflow' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-orange-600" />
                        Workflow Configuration
                      </CardTitle>
                      <CardDescription>Define bug states and transitions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        {['open', 'in_progress', 'in_review', 'resolved', 'closed'].map((status, idx, arr) => (
                          <div key={status} className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(status as BugStatus)} capitalize`}>
                              {status.replace('_', ' ')}
                            </Badge>
                            {idx < arr.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Allow Backward Transitions</p>
                          <p className="text-sm text-gray-500">Enable moving bugs to previous states</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Require Comments on Transition</p>
                          <p className="text-sm text-gray-500">Force comment when changing status</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Auto-close Resolved Bugs</p>
                          <p className="text-sm text-gray-500">Automatically close after 14 days</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Status
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Notifications */}
                {settingsTab === 'notifications' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-600" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Configure how you receive bug updates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive bug updates via email</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Slack Notifications</p>
                          <p className="text-sm text-gray-500">Get notified in Slack channels</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Critical Bug Alerts</p>
                          <p className="text-sm text-gray-500">Immediate alerts for critical issues</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Daily Digest</p>
                          <p className="text-sm text-gray-500">Summary of bug activity each day</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Mention Notifications</p>
                          <p className="text-sm text-gray-500">Alert when mentioned in comments</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Integrations */}
                {settingsTab === 'integrations' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        Integrations
                      </CardTitle>
                      <CardDescription>Connect with third-party tools</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'GitHub', icon: '🐙', status: 'Connected', description: 'Link PRs to bugs automatically' },
                          { name: 'Slack', icon: '💬', status: 'Connected', description: 'Bug notifications to channels' },
                          { name: 'Sentry', icon: '🔍', status: 'Not connected', description: 'Auto-create bugs from errors' },
                          { name: 'Jira', icon: '📋', status: 'Not connected', description: 'Sync with Jira issues' },
                          { name: 'GitLab', icon: '🦊', status: 'Not connected', description: 'Link merge requests' },
                          { name: 'PagerDuty', icon: '🔔', status: 'Not connected', description: 'On-call alerts for critical bugs' }
                        ].map(integration => (
                          <div key={integration.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{integration.icon}</span>
                                <span className="font-semibold">{integration.name}</span>
                              </div>
                              <Badge variant={integration.status === 'Connected' ? 'default' : 'secondary'}>
                                {integration.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                            <Button variant="outline" size="sm" className="w-full">
                              {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Security */}
                {settingsTab === 'security' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Configure access control and permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">Require 2FA for all users</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">IP Whitelist</p>
                          <p className="text-sm text-gray-500">Restrict access by IP address</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Audit Logging</p>
                          <p className="text-sm text-gray-500">Track all user actions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                          <p className="text-sm text-gray-500">Auto-logout after 30 minutes of inactivity</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Sensitive Bug Masking</p>
                          <p className="text-sm text-gray-500">Hide security bugs from non-members</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-cyan-600" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Power user features and configurations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">API Access</p>
                            <p className="text-sm text-gray-500">Enable REST API for bug management</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Webhooks</p>
                            <p className="text-sm text-gray-500">Send events to external endpoints</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Custom Fields</p>
                            <p className="text-sm text-gray-500">Add custom fields to bug forms</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Beta Features</p>
                            <p className="text-sm text-gray-500">Access experimental features</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 bg-white/80 dark:bg-gray-800/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Archive All Closed Bugs</p>
                            <p className="text-sm text-gray-500">Move all closed bugs to archive</p>
                          </div>
                          <Button variant="destructive" size="sm">Archive</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Test Data</p>
                            <p className="text-sm text-gray-500">Remove all test and demo bugs</p>
                          </div>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Project</p>
                            <p className="text-sm text-gray-500">Delete all bugs and reset to default</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bug Detail Dialog */}
        <Dialog open={!!selectedBug} onOpenChange={() => setSelectedBug(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedBug && getTypeIcon(selectedBug.type)}
                <span className="text-muted-foreground">{selectedBug?.key}</span>
                {selectedBug?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedBug && (
              <div className="space-y-6">
                {/* Status & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(selectedBug.severity)}>{selectedBug.severity}</Badge>
                    <Badge className={getStatusColor(selectedBug.status)} variant="outline">
                      {getStatusIcon(selectedBug.status)}
                      <span className="ml-1 capitalize">{selectedBug.status.replace('_', ' ')}</span>
                    </Badge>
                    {selectedBug.labels.map(label => (
                      <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Progress
                    </Button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Priority</p>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(selectedBug.priority)}
                      <span className="font-medium capitalize">{selectedBug.priority}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Reporter</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px]">{selectedBug.reporter.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{selectedBug.reporter.name}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                    {selectedBug.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[10px]">{selectedBug.assignee.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedBug.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                    <span className="font-medium">{selectedBug.dueDate ? formatDate(selectedBug.dueDate) : 'Not set'}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedBug.description}</p>
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <h4 className="font-medium mb-2">Steps to Reproduce</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {selectedBug.stepsToReproduce.map((step, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Expected vs Actual */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Expected Behavior</h4>
                    <p className="text-sm">{selectedBug.expectedBehavior}</p>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-700 dark:text-red-400 mb-1">Actual Behavior</h4>
                    <p className="text-sm">{selectedBug.actualBehavior}</p>
                  </div>
                </div>

                {/* Comments */}
                {selectedBug.comments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Comments ({selectedBug.comments.length})</h4>
                    <div className="space-y-3">
                      {selectedBug.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{comment.author.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                              {comment.isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedBug.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Attachments ({selectedBug.attachments.length})</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedBug.attachments.map(att => (
                        <div key={att.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Paperclip className="w-5 h-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{att.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(att.size)}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Issues */}
                {selectedBug.linkedIssues.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Linked Issues</h4>
                    <div className="space-y-2">
                      {selectedBug.linkedIssues.map(issue => (
                        <div key={issue.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className="capitalize">{issue.type.replace('_', ' ')}</Badge>
                            <span className="text-sm font-medium">{issue.key}</span>
                            <span className="text-sm text-muted-foreground">{issue.title}</span>
                          </div>
                          <Badge className={getStatusColor(issue.status)} variant="outline">
                            {issue.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Activity Info */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t dark:border-gray-700">
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedBug.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Updated</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedBug.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Votes</p>
                    <p className="text-sm font-medium">{selectedBug.votes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Watchers</p>
                    <p className="text-sm font-medium">{selectedBug.watchers}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
