'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Zap, Calendar, Target, BarChart3, Clock, Users, Flag,
  Settings, Plus, Search, Filter, LayoutGrid, List, ChevronRight,
  PlayCircle, PauseCircle, CheckCircle2, XCircle, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Timer,
  Layers, Hash, GitBranch, Bug, FileText, Lightbulb, MessageSquare,
  Activity, Eye, RefreshCw, Sparkles, Bell, Award, RotateCcw,
  ArrowRight, GripVertical, MoreVertical, Flame, Coffee
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS - Jira Sprints Level Sprint Management
// ============================================================================

type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled'
type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
type TaskPriority = 'critical' | 'high' | 'medium' | 'low'
type TaskType = 'story' | 'bug' | 'task' | 'subtask' | 'epic' | 'spike'

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  capacity_hours: number
  allocated_hours: number
}

interface Comment {
  id: string
  author: TeamMember
  content: string
  created_at: string
}

interface SprintTask {
  id: string
  key: string
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  assignee?: TeamMember
  reporter: TeamMember
  story_points: number
  estimate_hours: number
  logged_hours: number
  remaining_hours: number
  created_at: string
  updated_at: string
  due_date?: string
  labels: string[]
  comments: Comment[]
  subtasks: SprintTask[]
  epic_key?: string
  epic_name?: string
  blocked_by?: string
  blocker_reason?: string
}

interface BurndownPoint {
  day: number
  date: string
  ideal: number
  actual: number
  completed_points: number
}

interface VelocityData {
  sprint_name: string
  committed: number
  completed: number
  completion_rate: number
}

interface Sprint {
  id: string
  key: string
  name: string
  goal: string
  status: SprintStatus
  start_date: string
  end_date: string
  duration_days: number
  days_remaining: number
  team_id: string
  team_name: string
  scrum_master: TeamMember
  product_owner: TeamMember
  team_members: TeamMember[]
  tasks: SprintTask[]
  total_story_points: number
  completed_story_points: number
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  velocity: number
  planned_velocity: number
  capacity_hours: number
  committed_hours: number
  burned_hours: number
  burndown: BurndownPoint[]
  retrospective?: {
    what_went_well: string[]
    what_could_improve: string[]
    action_items: string[]
  }
  created_at: string
}

// ============================================================================
// MOCK DATA - Jira Sprints Level Comprehensive
// ============================================================================

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Senior Developer', capacity_hours: 32, allocated_hours: 28 },
  { id: '2', name: 'Michael Rodriguez', avatar: '/avatars/michael.jpg', role: 'Tech Lead', capacity_hours: 24, allocated_hours: 20 },
  { id: '3', name: 'Emily Watson', avatar: '/avatars/emily.jpg', role: 'Designer', capacity_hours: 32, allocated_hours: 30 },
  { id: '4', name: 'David Kim', avatar: '/avatars/david.jpg', role: 'QA Engineer', capacity_hours: 40, allocated_hours: 35 },
  { id: '5', name: 'Jessica Brown', avatar: '/avatars/jessica.jpg', role: 'Developer', capacity_hours: 40, allocated_hours: 38 },
]

const mockTasks: SprintTask[] = [
  {
    id: 't1', key: 'PROJ-101', title: 'Implement user authentication flow', description: 'Set up OAuth and JWT authentication', type: 'story', status: 'done', priority: 'high',
    assignee: mockTeamMembers[0], reporter: mockTeamMembers[1], story_points: 8, estimate_hours: 16, logged_hours: 14, remaining_hours: 0,
    created_at: '2024-02-01', updated_at: '2024-02-15', labels: ['auth', 'security'], comments: [], subtasks: [],
  },
  {
    id: 't2', key: 'PROJ-102', title: 'Fix login form validation bug', description: 'Email validation not working properly', type: 'bug', status: 'done', priority: 'critical',
    assignee: mockTeamMembers[4], reporter: mockTeamMembers[3], story_points: 3, estimate_hours: 4, logged_hours: 3, remaining_hours: 0,
    created_at: '2024-02-05', updated_at: '2024-02-10', labels: ['bug', 'login'], comments: [], subtasks: [],
  },
  {
    id: 't3', key: 'PROJ-103', title: 'Design dashboard components', description: 'Create reusable dashboard UI components', type: 'story', status: 'in_progress', priority: 'high',
    assignee: mockTeamMembers[2], reporter: mockTeamMembers[1], story_points: 13, estimate_hours: 24, logged_hours: 16, remaining_hours: 8,
    created_at: '2024-02-08', updated_at: '2024-02-18', labels: ['ui', 'design'], comments: [], subtasks: [], due_date: '2024-02-22',
  },
  {
    id: 't4', key: 'PROJ-104', title: 'Integrate payment gateway', description: 'Stripe payment integration', type: 'story', status: 'blocked', priority: 'critical',
    assignee: mockTeamMembers[0], reporter: mockTeamMembers[1], story_points: 13, estimate_hours: 32, logged_hours: 8, remaining_hours: 24,
    created_at: '2024-02-10', updated_at: '2024-02-19', labels: ['payments', 'integration'], comments: [], subtasks: [],
    blocked_by: 'PROJ-108', blocker_reason: 'Waiting for API credentials from Stripe',
  },
  {
    id: 't5', key: 'PROJ-105', title: 'API rate limiting implementation', description: 'Add rate limiting to all public endpoints', type: 'task', status: 'review', priority: 'medium',
    assignee: mockTeamMembers[4], reporter: mockTeamMembers[1], story_points: 5, estimate_hours: 8, logged_hours: 7, remaining_hours: 1,
    created_at: '2024-02-12', updated_at: '2024-02-18', labels: ['api', 'security'], comments: [], subtasks: [],
  },
  {
    id: 't6', key: 'PROJ-106', title: 'Write API documentation', description: 'OpenAPI spec for all endpoints', type: 'task', status: 'in_progress', priority: 'medium',
    assignee: mockTeamMembers[0], reporter: mockTeamMembers[1], story_points: 5, estimate_hours: 12, logged_hours: 6, remaining_hours: 6,
    created_at: '2024-02-14', updated_at: '2024-02-19', labels: ['docs', 'api'], comments: [], subtasks: [],
  },
  {
    id: 't7', key: 'PROJ-107', title: 'Performance optimization spike', description: 'Investigate slow dashboard load times', type: 'spike', status: 'todo', priority: 'high',
    assignee: mockTeamMembers[1], reporter: mockTeamMembers[1], story_points: 3, estimate_hours: 8, logged_hours: 0, remaining_hours: 8,
    created_at: '2024-02-16', updated_at: '2024-02-16', labels: ['performance', 'investigation'], comments: [], subtasks: [],
  },
  {
    id: 't8', key: 'PROJ-108', title: 'Set up Stripe account', description: 'Admin task to get API keys', type: 'task', status: 'todo', priority: 'high',
    reporter: mockTeamMembers[1], story_points: 1, estimate_hours: 2, logged_hours: 0, remaining_hours: 2,
    created_at: '2024-02-18', updated_at: '2024-02-18', labels: ['admin', 'payments'], comments: [], subtasks: [],
  },
]

const mockBurndown: BurndownPoint[] = [
  { day: 1, date: '2024-02-05', ideal: 51, actual: 51, completed_points: 0 },
  { day: 2, date: '2024-02-06', ideal: 47.7, actual: 48, completed_points: 3 },
  { day: 3, date: '2024-02-07', ideal: 44.4, actual: 45, completed_points: 6 },
  { day: 4, date: '2024-02-08', ideal: 41.1, actual: 45, completed_points: 6 },
  { day: 5, date: '2024-02-09', ideal: 37.8, actual: 37, completed_points: 14 },
  { day: 6, date: '2024-02-10', ideal: 34.5, actual: 34, completed_points: 17 },
  { day: 7, date: '2024-02-11', ideal: 31.2, actual: 34, completed_points: 17 },
  { day: 8, date: '2024-02-12', ideal: 27.9, actual: 29, completed_points: 22 },
  { day: 9, date: '2024-02-13', ideal: 24.6, actual: 26, completed_points: 25 },
  { day: 10, date: '2024-02-14', ideal: 21.3, actual: 21, completed_points: 30 },
  { day: 11, date: '2024-02-15', ideal: 18, actual: 21, completed_points: 30 },
  { day: 12, date: '2024-02-16', ideal: 14.7, actual: 18, completed_points: 33 },
  { day: 13, date: '2024-02-17', ideal: 11.4, actual: 18, completed_points: 33 },
  { day: 14, date: '2024-02-18', ideal: 8.1, actual: 15, completed_points: 36 },
]

const mockVelocity: VelocityData[] = [
  { sprint_name: 'Sprint 20', committed: 45, completed: 42, completion_rate: 93 },
  { sprint_name: 'Sprint 21', committed: 48, completed: 44, completion_rate: 92 },
  { sprint_name: 'Sprint 22', committed: 50, completed: 38, completion_rate: 76 },
  { sprint_name: 'Sprint 23', committed: 42, completed: 40, completion_rate: 95 },
  { sprint_name: 'Sprint 24', committed: 51, completed: 36, completion_rate: 71 },
]

const mockSprints: Sprint[] = [
  {
    id: '1', key: 'SPR-24', name: 'Sprint 24 - Q1 Features', goal: 'Complete core platform features for Q1 release',
    status: 'active', start_date: '2024-02-05', end_date: '2024-02-18', duration_days: 14, days_remaining: 3,
    team_id: 't1', team_name: 'Platform Team',
    scrum_master: mockTeamMembers[1], product_owner: mockTeamMembers[1],
    team_members: mockTeamMembers,
    tasks: mockTasks,
    total_story_points: 51, completed_story_points: 36,
    total_tasks: 8, completed_tasks: 2, in_progress_tasks: 3, blocked_tasks: 1,
    velocity: 36, planned_velocity: 45,
    capacity_hours: 168, committed_hours: 106, burned_hours: 54,
    burndown: mockBurndown,
    created_at: '2024-02-01',
  },
  {
    id: '2', key: 'SPR-25', name: 'Sprint 25 - Mobile Focus', goal: 'Mobile app beta features',
    status: 'planning', start_date: '2024-02-19', end_date: '2024-03-03', duration_days: 14, days_remaining: 14,
    team_id: 't2', team_name: 'Mobile Team',
    scrum_master: mockTeamMembers[0], product_owner: mockTeamMembers[1],
    team_members: [mockTeamMembers[0], mockTeamMembers[4]],
    tasks: [],
    total_story_points: 42, completed_story_points: 0,
    total_tasks: 12, completed_tasks: 0, in_progress_tasks: 0, blocked_tasks: 0,
    velocity: 0, planned_velocity: 40,
    capacity_hours: 144, committed_hours: 96, burned_hours: 0,
    burndown: [],
    created_at: '2024-02-15',
  },
  {
    id: '3', key: 'SPR-23', name: 'Sprint 23 - Bug Fixes', goal: 'Address critical bugs from Q4',
    status: 'completed', start_date: '2024-01-22', end_date: '2024-02-04', duration_days: 14, days_remaining: 0,
    team_id: 't1', team_name: 'Platform Team',
    scrum_master: mockTeamMembers[1], product_owner: mockTeamMembers[1],
    team_members: mockTeamMembers,
    tasks: [],
    total_story_points: 42, completed_story_points: 40,
    total_tasks: 15, completed_tasks: 14, in_progress_tasks: 0, blocked_tasks: 0,
    velocity: 40, planned_velocity: 42,
    capacity_hours: 168, committed_hours: 120, burned_hours: 115,
    burndown: [],
    retrospective: {
      what_went_well: ['Team collaboration was excellent', 'Good estimation accuracy', 'Clear sprint goal'],
      what_could_improve: ['More testing time needed', 'Better documentation of decisions'],
      action_items: ['Schedule design review earlier', 'Add testing buffer to estimates'],
    },
    created_at: '2024-01-18',
  },
]

const backlogTasks: SprintTask[] = [
  {
    id: 'b1', key: 'PROJ-110', title: 'User profile settings page', description: 'Allow users to update their profile', type: 'story', status: 'backlog', priority: 'medium',
    reporter: mockTeamMembers[1], story_points: 8, estimate_hours: 16, logged_hours: 0, remaining_hours: 16,
    created_at: '2024-02-01', updated_at: '2024-02-01', labels: ['user', 'settings'], comments: [], subtasks: [],
  },
  {
    id: 'b2', key: 'PROJ-111', title: 'Email notification system', description: 'Transactional email templates', type: 'story', status: 'backlog', priority: 'high',
    reporter: mockTeamMembers[1], story_points: 13, estimate_hours: 24, logged_hours: 0, remaining_hours: 24,
    created_at: '2024-02-05', updated_at: '2024-02-05', labels: ['email', 'notifications'], comments: [], subtasks: [],
  },
  {
    id: 'b3', key: 'PROJ-112', title: 'Analytics dashboard', description: 'Usage analytics for admin', type: 'epic', status: 'backlog', priority: 'medium',
    reporter: mockTeamMembers[1], story_points: 21, estimate_hours: 48, logged_hours: 0, remaining_hours: 48,
    created_at: '2024-02-08', updated_at: '2024-02-08', labels: ['analytics', 'admin'], comments: [], subtasks: [],
  },
  {
    id: 'b4', key: 'PROJ-113', title: 'Dark mode support', description: 'Theme toggle functionality', type: 'story', status: 'backlog', priority: 'low',
    reporter: mockTeamMembers[2], story_points: 5, estimate_hours: 8, logged_hours: 0, remaining_hours: 8,
    created_at: '2024-02-10', updated_at: '2024-02-10', labels: ['ui', 'theme'], comments: [], subtasks: [],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: SprintStatus) => {
  const colors = {
    planning: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
    active: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[status]
}

const getTaskStatusColor = (status: TaskStatus) => {
  const colors = {
    backlog: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    todo: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    review: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
    done: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    blocked: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
  }
  return colors[status]
}

const getPriorityColor = (priority: TaskPriority) => {
  const colors = {
    critical: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
  }
  return colors[priority]
}

const getTypeIcon = (type: TaskType) => {
  const icons = {
    story: FileText,
    bug: Bug,
    task: CheckCircle2,
    subtask: GitBranch,
    epic: Flame,
    spike: Lightbulb,
  }
  return icons[type]
}

const getTypeColor = (type: TaskType) => {
  const colors = {
    story: 'text-green-600 dark:text-green-400',
    bug: 'text-red-600 dark:text-red-400',
    task: 'text-blue-600 dark:text-blue-400',
    subtask: 'text-purple-600 dark:text-purple-400',
    epic: 'text-orange-600 dark:text-orange-400',
    spike: 'text-cyan-600 dark:text-cyan-400',
  }
  return colors[type]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SprintsClient() {
  const [activeTab, setActiveTab] = useState('sprints')
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [selectedTask, setSelectedTask] = useState<SprintTask | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SprintStatus | 'all'>('all')

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockSprints.length
    const active = mockSprints.filter(s => s.status === 'active').length
    const planning = mockSprints.filter(s => s.status === 'planning').length
    const completed = mockSprints.filter(s => s.status === 'completed').length
    const avgVelocity = mockVelocity.reduce((sum, v) => sum + v.completed, 0) / mockVelocity.length
    const completionRate = mockVelocity.reduce((sum, v) => sum + v.completion_rate, 0) / mockVelocity.length
    const totalStoryPoints = mockSprints.reduce((sum, s) => sum + s.total_story_points, 0)
    const completedPoints = mockSprints.reduce((sum, s) => sum + s.completed_story_points, 0)
    const totalTasks = mockSprints.reduce((sum, s) => sum + s.total_tasks, 0)
    const completedTasks = mockSprints.reduce((sum, s) => sum + s.completed_tasks, 0)
    const blockedTasks = mockSprints.reduce((sum, s) => sum + s.blocked_tasks, 0)

    return {
      total, active, planning, completed, avgVelocity, completionRate,
      totalStoryPoints, completedPoints, totalTasks, completedTasks, blockedTasks,
      backlogItems: backlogTasks.length,
    }
  }, [])

  // Filter sprints
  const filteredSprints = useMemo(() => {
    return mockSprints.filter(sprint => {
      const matchesSearch = searchQuery === '' ||
        sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sprint.key.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Get active sprint
  const activeSprint = mockSprints.find(s => s.status === 'active')

  // Group tasks by status for board view
  const tasksByStatus = useMemo(() => {
    if (!activeSprint) return {}
    const groups: Record<TaskStatus, SprintTask[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    }
    activeSprint.tasks.forEach(task => {
      groups[task.status].push(task)
    })
    return groups
  }, [activeSprint])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Sprint Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Jira level agile sprint planning and tracking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Sprint
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Sprints', value: stats.active, icon: PlayCircle, color: 'from-teal-500 to-cyan-500' },
            { label: 'Planning', value: stats.planning, icon: Target, color: 'from-purple-500 to-violet-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'Avg Velocity', value: Math.round(stats.avgVelocity), icon: Zap, color: 'from-orange-500 to-amber-500' },
            { label: 'Completion Rate', value: `${Math.round(stats.completionRate)}%`, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Story Points', value: `${stats.completedPoints}/${stats.totalStoryPoints}`, icon: Award, color: 'from-pink-500 to-rose-500' },
            { label: 'Blocked Tasks', value: stats.blockedTasks, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
            { label: 'Backlog Items', value: stats.backlogItems, icon: Layers, color: 'from-slate-500 to-gray-500' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="sprints" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <Zap className="w-4 h-4 mr-2" />
                Sprints
              </TabsTrigger>
              <TabsTrigger value="board" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Board
              </TabsTrigger>
              <TabsTrigger value="backlog" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <Layers className="w-4 h-4 mr-2" />
                Backlog
              </TabsTrigger>
              <TabsTrigger value="burndown" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <TrendingDown className="w-4 h-4 mr-2" />
                Burndown
              </TabsTrigger>
              <TabsTrigger value="velocity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Velocity
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search sprints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/80 dark:bg-slate-900/80"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SprintStatus | 'all')}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="space-y-6">
            <div className="space-y-4">
              {filteredSprints.map((sprint) => (
                <Card
                  key={sprint.id}
                  className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => setSelectedSprint(sprint)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          sprint.status === 'active' ? 'bg-gradient-to-br from-teal-500 to-cyan-500' :
                          sprint.status === 'planning' ? 'bg-gradient-to-br from-purple-500 to-violet-500' :
                          'bg-gradient-to-br from-green-500 to-emerald-500'
                        }`}>
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm text-slate-500">{sprint.key}</span>
                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                              {sprint.name}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{sprint.goal}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline" className={getStatusColor(sprint.status)}>
                              {sprint.status}
                            </Badge>
                            <span className="text-slate-500">
                              {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                            </span>
                            <span className="text-slate-500">{sprint.team_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-teal-600">
                          {Math.round((sprint.completed_story_points / sprint.total_story_points) * 100)}%
                        </div>
                        <div className="text-sm text-slate-500">Complete</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          {sprint.completed_story_points} / {sprint.total_story_points} story points
                        </span>
                        {sprint.days_remaining > 0 && (
                          <span className={`font-medium ${sprint.days_remaining <= 3 ? 'text-red-600' : 'text-slate-600'}`}>
                            {sprint.days_remaining} days remaining
                          </span>
                        )}
                      </div>
                      <Progress value={(sprint.completed_story_points / sprint.total_story_points) * 100} className="h-2" />
                    </div>

                    {/* Task Stats */}
                    <div className="grid grid-cols-5 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">{sprint.total_tasks}</div>
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{sprint.completed_tasks}</div>
                        <div className="text-xs text-slate-500">Done</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{sprint.in_progress_tasks}</div>
                        <div className="text-xs text-slate-500">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{sprint.blocked_tasks}</div>
                        <div className="text-xs text-slate-500">Blocked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-teal-600">{sprint.velocity}</div>
                        <div className="text-xs text-slate-500">Velocity</div>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex -space-x-2">
                        {sprint.team_members.slice(0, 5).map((member, idx) => (
                          <Avatar key={idx} className="w-8 h-8 border-2 border-white dark:border-slate-900">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {sprint.team_members.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-slate-900">
                            +{sprint.team_members.length - 5}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        SM: {sprint.scrum_master.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board" className="space-y-6">
            {activeSprint ? (
              <div className="grid grid-cols-6 gap-4">
                {(['todo', 'in_progress', 'review', 'done', 'blocked'] as TaskStatus[]).map((status) => (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-sm">
                        {status.replace('_', ' ')}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {tasksByStatus[status]?.length || 0}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {tasksByStatus[status]?.map((task) => {
                        const TypeIcon = getTypeIcon(task.type)
                        return (
                          <Card
                            key={task.id}
                            className="border-0 shadow-md bg-white dark:bg-slate-800 cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => setSelectedTask(task)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2 mb-2">
                                <TypeIcon className={`w-4 h-4 mt-0.5 ${getTypeColor(task.type)}`} />
                                <div className="flex-1">
                                  <span className="text-xs text-slate-500">{task.key}</span>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                                    {task.title}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">{task.story_points} pts</span>
                                  {task.assignee && (
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src={task.assignee.avatar} />
                                      <AvatarFallback className="bg-teal-500 text-white text-[8px]">
                                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">No Active Sprint</h3>
                  <p className="text-sm text-slate-500 mt-2">Start a sprint to see the board view</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Backlog Tab */}
          <TabsContent value="backlog" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-500" />
                    Product Backlog
                  </span>
                  <Badge variant="outline">{backlogTasks.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backlogTasks.map((task, idx) => {
                    const TypeIcon = getTypeIcon(task.type)
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 transition-colors cursor-pointer group"
                      >
                        <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
                        <span className="text-sm text-slate-500 w-8">#{idx + 1}</span>
                        <TypeIcon className={`w-5 h-5 ${getTypeColor(task.type)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500">{task.key}</span>
                            <span className="font-medium text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.labels.map((label, labelIdx) => (
                              <span key={labelIdx} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <div className="text-right w-20">
                          <div className="text-lg font-bold text-teal-600">{task.story_points}</div>
                          <div className="text-xs text-slate-500">points</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Add to Sprint
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Burndown Tab */}
          <TabsContent value="burndown" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-teal-500" />
                  Sprint Burndown Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSprint ? (
                  <div className="h-80 relative">
                    {/* Chart Grid */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4">
                      {[0, 20, 40, 60, 80, 100].reverse().map((val) => (
                        <div key={val} className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-8">{Math.round(activeSprint.total_story_points * val / 100)}</span>
                          <div className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-700" />
                        </div>
                      ))}
                    </div>

                    {/* Chart Data */}
                    <svg className="absolute inset-0 mt-4 mb-4 ml-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Ideal Line */}
                      <line
                        x1="0" y1="0"
                        x2="100" y2="100"
                        stroke="#94a3b8"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                      />
                      {/* Actual Line */}
                      <polyline
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="1"
                        points={mockBurndown.map((point, idx) =>
                          `${(idx / (mockBurndown.length - 1)) * 100},${(point.actual / activeSprint.total_story_points) * 100}`
                        ).join(' ')}
                      />
                    </svg>

                    {/* Legend */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-slate-400" style={{ borderTop: '2px dashed #94a3b8' }} />
                        <span className="text-sm text-slate-500">Ideal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-teal-500" />
                        <span className="text-sm text-slate-500">Actual</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-slate-500">No active sprint</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Velocity Tab */}
          <TabsContent value="velocity" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-500" />
                  Team Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockVelocity.map((velocity, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 dark:text-white">{velocity.sprint_name}</span>
                        <span className="text-sm text-slate-500">
                          {velocity.completed} / {velocity.committed} points ({velocity.completion_rate}%)
                        </span>
                      </div>
                      <div className="flex gap-1 h-8">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-l"
                          style={{ width: `${(velocity.completed / 60) * 100}%` }}
                        />
                        <div
                          className="bg-slate-200 dark:bg-slate-700 rounded-r"
                          style={{ width: `${((velocity.committed - velocity.completed) / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-teal-600">{Math.round(stats.avgVelocity)}</div>
                        <div className="text-sm text-slate-500">Avg Velocity</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{Math.round(stats.completionRate)}%</div>
                        <div className="text-sm text-slate-500">Avg Completion</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">+5%</div>
                        <div className="text-sm text-slate-500">Trend</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Sprint Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Default sprint duration', value: '2 weeks', icon: Calendar },
                    { label: 'Story points scale', value: 'Fibonacci', icon: Hash },
                    { label: 'Velocity calculation', value: 'Last 5 sprints', icon: BarChart3 },
                    { label: 'Auto-close completed tasks', value: 'Enabled', icon: CheckCircle2 },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                          <setting.icon className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{setting.label}</span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{setting.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Sprint start/end reminders', enabled: true },
                    { label: 'Daily standup reminders', enabled: true },
                    { label: 'Blocked task alerts', enabled: true },
                    { label: 'Velocity changes', enabled: false },
                    { label: 'Retrospective reminders', enabled: true },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{setting.label}</span>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors ${
                        setting.enabled ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'
                      } relative cursor-pointer`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          setting.enabled ? 'right-1' : 'left-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Sprint Detail Dialog */}
        <Dialog open={!!selectedSprint} onOpenChange={() => setSelectedSprint(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedSprint && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedSprint.status === 'active' ? 'bg-gradient-to-br from-teal-500 to-cyan-500' :
                      selectedSprint.status === 'planning' ? 'bg-gradient-to-br from-purple-500 to-violet-500' :
                      'bg-gradient-to-br from-green-500 to-emerald-500'
                    }`}>
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedSprint.name}</h2>
                      <p className="text-sm text-slate-500 font-normal">{selectedSprint.key}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription>{selectedSprint.goal}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6 py-4">
                    {/* Sprint Stats */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-center">
                        <div className="text-2xl font-bold text-teal-600">
                          {Math.round((selectedSprint.completed_story_points / selectedSprint.total_story_points) * 100)}%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Progress</div>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedSprint.velocity}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Velocity</div>
                      </div>
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedSprint.completed_tasks}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Done</div>
                      </div>
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedSprint.blocked_tasks}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Blocked</div>
                      </div>
                    </div>

                    {/* Team */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Sprint Team</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSprint.team_members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retrospective */}
                    {selectedSprint.retrospective && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Retrospective
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">What went well</h5>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                              {selectedSprint.retrospective.what_went_well.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <h5 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">What could improve</h5>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                              {selectedSprint.retrospective.what_could_improve.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <h5 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Action items</h5>
                            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                              {selectedSprint.retrospective.action_items.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            {selectedTask && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    {(() => {
                      const TypeIcon = getTypeIcon(selectedTask.type)
                      return <TypeIcon className={`w-5 h-5 ${getTypeColor(selectedTask.type)}`} />
                    })()}
                    <div>
                      <span className="text-sm text-slate-500">{selectedTask.key}</span>
                      <h2 className="text-lg font-bold">{selectedTask.title}</h2>
                    </div>
                  </DialogTitle>
                  <DialogDescription>{selectedTask.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getTaskStatusColor(selectedTask.status)}>
                      {selectedTask.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                      {selectedTask.priority}
                    </Badge>
                    <span className="text-sm text-slate-500">{selectedTask.story_points} story points</span>
                  </div>
                  {selectedTask.assignee && (
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedTask.assignee.avatar} />
                        <AvatarFallback className="bg-teal-500 text-white text-xs">
                          {selectedTask.assignee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedTask.assignee.name}</p>
                        <p className="text-xs text-slate-500">Assignee</p>
                      </div>
                    </div>
                  )}
                  {selectedTask.blocker_reason && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Blocked by {selectedTask.blocked_by}</span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">{selectedTask.blocker_reason}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Estimate: {selectedTask.estimate_hours}h</span>
                    <span>Logged: {selectedTask.logged_hours}h</span>
                    <span>Remaining: {selectedTask.remaining_hours}h</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
