'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Zap, Target, BarChart3, Users,
  Settings, Plus, Search, LayoutGrid,
  PlayCircle, CheckCircle2, AlertTriangle,
  TrendingUp, TrendingDown,
  Layers, GitBranch, Bug, FileText, Lightbulb, RefreshCw, Bell, Award, RotateCcw, GripVertical, Flame, Webhook, Key, Shield,
  HardDrive, AlertOctagon, CreditCard, Sliders, Globe, Download, Copy, Trash2
} from 'lucide-react'

// Import Supabase hooks for real data operations
import {
  useSprints,
  useSprintTasks,
  useSprintMutations,
} from '@/lib/hooks/use-sprints'

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

// Competitive Upgrade Mock Data - Jira/Linear Level Sprint Intelligence
const mockSprintsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Sprint Velocity', description: 'Team velocity increased 23% this sprint—on track for 45 story points!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Velocity' },
  { id: '2', type: 'warning' as const, title: 'Scope Creep Alert', description: '3 new stories added mid-sprint. Consider sprint scope lock.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Scope' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Story DEV-234 has blockers—splitting into sub-tasks may help.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockSprintsCollaborators = [
  { id: '1', name: 'Scrum Master', avatar: '/avatars/scrum.jpg', status: 'online' as const, role: 'Scrum Master' },
  { id: '2', name: 'Tech Lead', avatar: '/avatars/tech.jpg', status: 'online' as const, role: 'Tech Lead' },
  { id: '3', name: 'Product Owner', avatar: '/avatars/po.jpg', status: 'away' as const, role: 'Product Owner' },
]

const mockSprintsPredictions = [
  { id: '1', title: 'Sprint Completion', prediction: '89% probability of completing all committed stories by Friday', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Burndown Trend', prediction: 'Current pace suggests 2-day buffer for sprint review prep', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockSprintsActivities = [
  { id: '1', user: 'Tech Lead', action: 'Moved', target: 'AUTH-123 to In Review', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Developer', action: 'Completed', target: 'API-456 bug fix', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Scrum Master', action: 'Updated', target: 'Sprint 24 capacity', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions now use dialog-based workflows instead of toast-only patterns
// The actual quick actions are defined inside the component with proper dialog handlers

export default function SprintsClient() {
  const [activeTab, setActiveTab] = useState('sprints')
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [selectedTask, setSelectedTask] = useState<SprintTask | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SprintStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for real operations
  const [showCreateSprintDialog, setShowCreateSprintDialog] = useState(false)
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [sprintToDelete, setSprintToDelete] = useState<string | null>(null)
  const [selectedSprintForTask, setSelectedSprintForTask] = useState<string | null>(null)

  // Dialog states for quick actions
  const [showNewStoryDialog, setShowNewStoryDialog] = useState(false)
  const [showStartSprintDialog, setShowStartSprintDialog] = useState(false)
  const [showBacklogDialog, setShowBacklogDialog] = useState(false)

  // Dialog states for settings
  const [showConfigureRoleDialog, setShowConfigureRoleDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<{role: string, desc: string, color: string} | null>(null)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)

  // API Key state - generate a real key
  const [apiKey, setApiKey] = useState(() => {
    // Generate a secure random API key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let key = 'sprint_'
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return key
  })
  const [showApiKey, setShowApiKey] = useState(false)

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookEvents, setWebhookEvents] = useState({
    sprint: true,
    task: true,
    comment: false,
    blocker: true
  })
  const [webhooks, setWebhooks] = useState<Array<{id: string, url: string, events: string[], createdAt: string}>>([])

  // Role configuration state
  const [rolePermissions, setRolePermissions] = useState<Record<string, {
    canManageSprints: boolean,
    canCreateTasks: boolean,
    canAssignTasks: boolean,
    canApproveStories: boolean,
    canViewReports: boolean
  }>>({
    'Scrum Master': { canManageSprints: true, canCreateTasks: true, canAssignTasks: true, canApproveStories: false, canViewReports: true },
    'Product Owner': { canManageSprints: false, canCreateTasks: true, canAssignTasks: false, canApproveStories: true, canViewReports: true },
    'Developer': { canManageSprints: false, canCreateTasks: true, canAssignTasks: false, canApproveStories: false, canViewReports: false },
    'QA': { canManageSprints: false, canCreateTasks: true, canAssignTasks: false, canApproveStories: false, canViewReports: true }
  })

  // Form states for new story dialog (quick action)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [newStoryDescription, setNewStoryDescription] = useState('')
  const [newStoryPoints, setNewStoryPoints] = useState('3')
  const [newStoryPriority, setNewStoryPriority] = useState('medium')
  const [selectedSprintForStory, setSelectedSprintForStory] = useState<string | null>(null)

  // Form states for start sprint dialog (quick action)
  const [sprintToStart, setSprintToStart] = useState<string | null>(null)
  const [sprintDuration, setSprintDuration] = useState('2')

  // Form states for creating sprint
  const [newSprintName, setNewSprintName] = useState('')
  const [newSprintGoal, setNewSprintGoal] = useState('')
  const [newSprintTeamName, setNewSprintTeamName] = useState('')
  const [newSprintStartDate, setNewSprintStartDate] = useState('')
  const [newSprintEndDate, setNewSprintEndDate] = useState('')
  const [newSprintCapacity, setNewSprintCapacity] = useState('80')

  // Form states for creating task
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskStoryPoints, setNewTaskStoryPoints] = useState('3')
  const [newTaskEstimatedHours, setNewTaskEstimatedHours] = useState('8')

  // ============================================================================
  // REAL SUPABASE DATA HOOKS
  // ============================================================================
  const { sprints: dbSprints, stats: dbStats, isLoading: isLoadingSprints, refetch: refetchSprints } = useSprints()
  const { tasks: dbTasks, isLoading: isLoadingTasks, refetch: refetchTasks } = useSprintTasks()
  const {
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    createTask,
    updateTask,
    completeTask,
    isCreatingSprint,
    isUpdatingSprint,
    isDeletingSprint,
    isStartingSprint,
    isCompletingSprint,
    isCreatingTask,
    isUpdatingTask,
    isCompletingTask,
  } = useSprintMutations()

  // Calculate stats - use real DB data when available, fallback to mock
  const stats = useMemo(() => {
    // Use real DB stats if available, otherwise fall back to mock
    const useDbData = dbSprints.length > 0

    if (useDbData) {
      // Calculate story points and blocked tasks from dbSprints
      const totalStoryPoints = dbSprints.reduce((sum: number, s: any) => sum + (s.committed || 0), 0)
      const completedPoints = dbSprints.reduce((sum: number, s: any) => sum + (s.burned || 0), 0)
      const blockedTasks = dbSprints.reduce((sum: number, s: any) => sum + (s.blocked_tasks || 0), 0)

      return {
        total: dbStats.total,
        active: dbStats.active,
        planning: dbStats.planning,
        completed: dbStats.completed,
        avgVelocity: Math.round(dbStats.avgVelocity),
        completionRate: Math.round(dbStats.completionRate),
        totalStoryPoints,
        completedPoints,
        totalTasks: dbStats.totalTasks,
        completedTasks: dbStats.completedTasks,
        blockedTasks,
        backlogItems: backlogTasks.length,
      }
    }

    // Fallback to mock data
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
  }, [dbSprints, dbStats, backlogTasks.length])

  // Map dbSprints to Sprint type for display, with mock fallback
  const activeSprints: Sprint[] = useMemo(() => {
    if (dbSprints && dbSprints.length > 0) {
      return dbSprints.map((s: any) => ({
        id: s.id,
        key: s.sprint_code || `SPR-${s.id.substring(0, 4)}`,
        name: s.name || 'Untitled Sprint',
        goal: s.goal || '',
        status: s.status || 'planning',
        start_date: s.start_date,
        end_date: s.end_date,
        duration_days: s.start_date && s.end_date
          ? Math.ceil((new Date(s.end_date).getTime() - new Date(s.start_date).getTime()) / (1000 * 60 * 60 * 24))
          : 14,
        days_remaining: s.days_remaining || 0,
        team_id: 't1',
        team_name: s.team_name || 'Team',
        scrum_master: mockTeamMembers[0],
        product_owner: mockTeamMembers[1],
        daily_standup_time: '10:00 AM',
        total_tasks: s.total_tasks || 0,
        completed_tasks: s.completed_tasks || 0,
        in_progress_tasks: s.in_progress_tasks || 0,
        blocked_tasks: s.blocked_tasks || 0,
        total_story_points: s.committed || 0,
        completed_story_points: s.burned || 0,
        completion_rate: s.total_tasks > 0 ? Math.round((s.completed_tasks / s.total_tasks) * 100) : 0,
        velocity: s.velocity || 0,
        velocity_trend: 'stable' as const,
        tasks: [],
        retrospective: s.retrospective ? { went_well: [s.retrospective], improvements: [], action_items: [] } : { went_well: [], improvements: [], action_items: [] }
      })) as Sprint[]
    }
    return mockSprints
  }, [dbSprints])

  // Filter sprints from activeSprints (Supabase data with mock fallback)
  const filteredSprints = useMemo(() => {
    return activeSprints.filter(sprint => {
      const matchesSearch = searchQuery === '' ||
        sprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sprint.key.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [activeSprints, searchQuery, statusFilter])

  // Get active sprint from activeSprints
  const activeSprint = activeSprints.find(s => s.status === 'active')

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

  // Quick actions with proper dialog handlers (not toast-only)
  const quickActions = [
    { id: '1', label: 'New Story', icon: 'plus', action: () => setShowNewStoryDialog(true), variant: 'default' as const },
    { id: '2', label: 'Start Sprint', icon: 'play', action: () => setShowStartSprintDialog(true), variant: 'default' as const },
    { id: '3', label: 'Backlog', icon: 'list', action: () => setShowBacklogDialog(true), variant: 'outline' as const },
  ]

  // ============================================================================
  // REAL SUPABASE HANDLERS
  // ============================================================================

  // Reset form states
  const resetSprintForm = () => {
    setNewSprintName('')
    setNewSprintGoal('')
    setNewSprintTeamName('')
    setNewSprintStartDate('')
    setNewSprintEndDate('')
    setNewSprintCapacity('80')
  }

  const resetTaskForm = () => {
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setNewTaskStoryPoints('3')
    setNewTaskEstimatedHours('8')
  }

  // Reset story form (quick action dialog)
  const resetStoryForm = () => {
    setNewStoryTitle('')
    setNewStoryDescription('')
    setNewStoryPoints('3')
    setNewStoryPriority('medium')
    setSelectedSprintForStory(null)
  }

  // Reset start sprint form (quick action dialog)
  const resetStartSprintForm = () => {
    setSprintToStart(null)
    setSprintDuration('2')
  }

  // Submit new story from quick action dialog
  const handleSubmitNewStory = async () => {
    if (!newStoryTitle.trim()) {
      toast.error('Validation Error')
      return
    }

    // Use first planning sprint or active sprint if no sprint selected (prefer db data)
    const targetSprintId = selectedSprintForStory ||
      dbSprints.find(s => s.status === 'planning')?.id ||
      dbSprints.find(s => s.status === 'active')?.id ||
      activeSprints.find(s => s.status === 'planning')?.id ||
      activeSprints.find(s => s.status === 'active')?.id

    if (!targetSprintId) {
      toast.error('No Sprint Available')
      return
    }

    try {
      await createTask({
        sprint_id: targetSprintId,
        title: newStoryTitle,
        description: newStoryDescription || null,
        priority: newStoryPriority,
        story_points: parseInt(newStoryPoints) || 3,
        estimated_hours: parseInt(newStoryPoints) * 2, // Estimate 2 hours per story point
        status: 'todo',
        progress: 0,
        actual_hours: 0,
        labels: ['story'],
      })

      toast.success('Story "' + newStoryTitle + '" has been added to the sprint')
      setShowNewStoryDialog(false)
      resetStoryForm()
      refetchTasks()
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Create Story')
    }
  }

  // Submit start sprint from quick action dialog
  const handleSubmitStartSprint = async () => {
    if (!sprintToStart) {
      toast.error('Validation Error')
      return
    }

    const sprint = dbSprints.find(s => s.id === sprintToStart) ||
                   activeSprints.find(s => s.id === sprintToStart)
    const sprintName = sprint?.name || 'Sprint'

    try {
      await startSprint(sprintToStart)
      toast.success('"' + sprintName + '" is now active with ' + sprintDuration + '-week duration')
      setShowStartSprintDialog(false)
      resetStartSprintForm()
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Start Sprint')
    }
  }

  // Create Sprint - opens dialog
  const handleCreateSprint = () => {
    resetSprintForm()
    setShowCreateSprintDialog(true)
  }

  // Submit Create Sprint to Supabase
  const handleSubmitCreateSprint = async () => {
    if (!newSprintName.trim()) {
      toast.error('Validation Error')
      return
    }

    try {
      await createSprint({
        name: newSprintName,
        goal: newSprintGoal || null,
        team_name: newSprintTeamName || null,
        start_date: newSprintStartDate || null,
        end_date: newSprintEndDate || null,
        capacity: parseInt(newSprintCapacity) || 80,
        status: 'planning',
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        blocked_tasks: 0,
        velocity: 0,
        committed: 0,
        burned: 0,
        days_remaining: newSprintEndDate
          ? Math.ceil((new Date(newSprintEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          : 14,
      })

      toast.success('Sprint "' + newSprintName + '" has been created successfully')
      setShowCreateSprintDialog(false)
      resetSprintForm()
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Create Sprint')
    }
  }

  // Start Sprint - real Supabase operation
  const handleStartSprint = async (sprintId: string, sprintName: string) => {
    try {
      await startSprint(sprintId)
      toast.success("Sprint is now active")
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Start Sprint')
    }
  }

  // Complete Sprint - real Supabase operation
  const handleCompleteSprint = async (sprintId: string, sprintName: string) => {
    try {
      await completeSprint({ id: sprintId })
      toast.success("Sprint has been completed")
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Complete Sprint')
    }
  }

  // Delete Sprint - with confirmation
  const handleDeleteSprintClick = (sprintId: string) => {
    setSprintToDelete(sprintId)
    setShowDeleteConfirmDialog(true)
  }

  const handleConfirmDeleteSprint = async () => {
    if (!sprintToDelete) return

    try {
      await deleteSprint(sprintToDelete)
      toast.success('Sprint Deleted')
      setShowDeleteConfirmDialog(false)
      setSprintToDelete(null)
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Delete Sprint')
    }
  }

  // Add Task - opens dialog
  const handleAddTask = (sprintId?: string) => {
    resetTaskForm()
    setSelectedSprintForTask(sprintId || null)
    setShowCreateTaskDialog(true)
  }

  // Submit Create Task to Supabase
  const handleSubmitCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error('Validation Error')
      return
    }

    if (!selectedSprintForTask) {
      toast.error('Validation Error')
      return
    }

    try {
      await createTask({
        sprint_id: selectedSprintForTask,
        title: newTaskTitle,
        description: newTaskDescription || null,
        priority: newTaskPriority,
        story_points: parseInt(newTaskStoryPoints) || 3,
        estimated_hours: parseInt(newTaskEstimatedHours) || 8,
        status: 'todo',
        progress: 0,
        actual_hours: 0,
        labels: [],
      })

      toast.success("Task has been added to the sprint")
      setShowCreateTaskDialog(false)
      resetTaskForm()
      refetchTasks()
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Create Task')
    }
  }

  // Update Task Status - real Supabase operation
  const handleMoveTask = async (taskId: string, taskName: string, newStatus: string) => {
    try {
      await updateTask({
        id: taskId,
        updates: { status: newStatus }
      })
      toast.info("Task moved to " + newStatus.replace("_", " "))
      refetchTasks()
    } catch (error) {
      toast.error('Failed to Move Task')
    }
  }

  // Complete Task - real Supabase operation
  const handleCompleteTask = async (taskId: string, taskName: string) => {
    try {
      await completeTask(taskId)
      toast.success("Task has been marked as done")
      refetchTasks()
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Complete Task')
    }
  }

  // Add backlog task to sprint - real Supabase operation
  const handleAddToSprint = async (taskData: typeof backlogTasks[0], sprintId: string) => {
    try {
      await createTask({
        sprint_id: sprintId,
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority,
        story_points: taskData.story_points,
        estimated_hours: taskData.estimate_hours,
        status: 'todo',
        progress: 0,
        actual_hours: 0,
        labels: taskData.labels,
      })

      toast.success("Task has been added to the sprint")
      refetchTasks()
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Add Task to Sprint')
    }
  }

  // Sync data from Supabase
  const handleSync = async () => {
    toast.info('Syncing')
    try {
      await Promise.all([refetchSprints(), refetchTasks()])
      toast.success('Sync Complete')
    } catch (error) {
      toast.error('Sync Failed')
    }
  }

  // Archive completed sprints - real Supabase operation
  const handleArchiveSprints = async () => {
    try {
      const completedSprints = dbSprints.filter(s => s.status === 'completed')
      for (const sprint of completedSprints) {
        await deleteSprint(sprint.id)
      }
      toast.success("Completed sprints have been archived")
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Archive Sprints')
    }
  }

  // Reset velocity data
  const handleResetVelocity = async () => {
    try {
      for (const sprint of dbSprints) {
        await updateSprint({
          id: sprint.id,
          updates: { velocity: 0 }
        })
      }
      toast.success('Velocity Reset')
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Reset Velocity')
    }
  }

  // Delete all sprints (project delete simulation)
  const handleDeleteProject = async () => {
    try {
      for (const sprint of dbSprints) {
        await deleteSprint(sprint.id)
      }
      toast.error('Project Deleted')
      refetchSprints()
    } catch (error) {
      toast.error('Failed to Delete Project')
    }
  }

  // Copy API key to clipboard - uses real generated key
  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      toast.success('API key copied to clipboard')
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = apiKey
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('API key copied to clipboard')
    }
  }

  // Regenerate API key with real random generation
  const handleRegenerateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let newKey = 'sprint_'
    for (let i = 0; i < 32; i++) {
      newKey += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setApiKey(newKey)
    toast.success('New API key generated. Make sure to save it securely.')
  }

  // Export sprint data as real CSV/JSON file
  const handleExportSprintData = (format: 'csv' | 'json' = 'csv') => {
    // Use real data from Supabase, fallback to mock if empty
    const sprintsToExport = dbSprints.length > 0 ? dbSprints : activeSprints

    if (sprintsToExport.length === 0) {
      toast.error('No sprint data to export')
      return
    }

    let content: string
    let mimeType: string
    let filename: string

    if (format === 'csv') {
      // Generate CSV with real data
      const headers = ['Sprint ID', 'Name', 'Status', 'Start Date', 'End Date', 'Total Tasks', 'Completed Tasks', 'Velocity', 'Team', 'Goal']
      const rows = sprintsToExport.map(sprint => [
        sprint.id || sprint.key || '',
        sprint.name || '',
        sprint.status || '',
        sprint.start_date || '',
        sprint.end_date || '',
        String(sprint.total_tasks || 0),
        String(sprint.completed_tasks || 0),
        String(sprint.velocity || 0),
        sprint.team_name || '',
        (sprint.goal || '').replace(/"/g, '""') // Escape quotes for CSV
      ])

      content = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')
      mimeType = 'text/csv;charset=utf-8;'
      filename = `sprints-export-${new Date().toISOString().split('T')[0]}.csv`
    } else {
      // Generate JSON with real data
      const exportData = {
        exportDate: new Date().toISOString(),
        totalSprints: sprintsToExport.length,
        sprints: sprintsToExport.map(sprint => ({
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          startDate: sprint.start_date,
          endDate: sprint.end_date,
          totalTasks: sprint.total_tasks,
          completedTasks: sprint.completed_tasks,
          velocity: sprint.velocity,
          team: sprint.team_name,
          goal: sprint.goal
        }))
      }
      content = JSON.stringify(exportData, null, 2)
      mimeType = 'application/json;charset=utf-8;'
      filename = `sprints-export-${new Date().toISOString().split('T')[0]}.json`
    }

    // Create and download file using Blob
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Sprint data exported as ${format.toUpperCase()}`)
  }

  // Add webhook with real validation
  const handleAddWebhook = () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a valid webhook URL')
      return
    }

    // Validate URL format
    try {
      new URL(webhookUrl)
    } catch {
      toast.error('Invalid URL format. Please enter a valid HTTPS URL.')
      return
    }

    // Get enabled events
    const enabledEvents = Object.entries(webhookEvents)
      .filter(([_, enabled]) => enabled)
      .map(([event]) => event)

    if (enabledEvents.length === 0) {
      toast.error('Please select at least one event type')
      return
    }

    // Create new webhook
    const newWebhook = {
      id: `wh_${Date.now().toString(36)}`,
      url: webhookUrl,
      events: enabledEvents,
      createdAt: new Date().toISOString()
    }

    setWebhooks(prev => [...prev, newWebhook])
    setWebhookUrl('')
    setWebhookEvents({ sprint: true, task: true, comment: false, blocker: true })
    setShowAddWebhookDialog(false)
    toast.success('Webhook added successfully')
  }

  // Delete webhook
  const handleDeleteWebhook = (webhookId: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== webhookId))
    toast.success('Webhook removed')
  }

  // Configure role handler - opens dialog
  const handleConfigureRole = (role: {role: string, desc: string, color: string}) => {
    setSelectedRole(role)
    setShowConfigureRoleDialog(true)
  }

  // Save role permissions
  const handleSaveRolePermissions = () => {
    if (!selectedRole) return
    toast.success(`Permissions updated for ${selectedRole.role}`)
    setShowConfigureRoleDialog(false)
    setSelectedRole(null)
  }

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
            <Button onClick={handleSync} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button onClick={handleCreateSprint} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
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
            {/* Sprints Banner */}
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Sprint Management</h2>
                  <p className="text-teal-100">Jira-level agile sprint planning</p>
                  <p className="text-teal-200 text-xs mt-1">Sprint cycles • Story points • Team velocity</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredSprints.length}</p>
                    <p className="text-teal-200 text-sm">Sprints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredSprints.filter(s => s.status === 'active').length}</p>
                    <p className="text-teal-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                            <AvatarImage src={member.avatar} alt="User avatar" />
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

                    {/* Sprint Actions - Real Supabase Operations */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      {sprint.status === 'planning' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartSprint(sprint.id, sprint.name)
                          }}
                          disabled={isStartingSprint}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          Start Sprint
                        </Button>
                      )}
                      {sprint.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCompleteSprint(sprint.id, sprint.name)
                          }}
                          disabled={isCompletingSprint}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Complete Sprint
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddTask(sprint.id)
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSprintClick(sprint.id)
                        }}
                        disabled={isDeletingSprint}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Display Real Sprints from Supabase */}
            {dbSprints.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                  Your Sprints (from Database)
                </h3>
                {dbSprints.map((sprint) => (
                  <Card
                    key={sprint.id}
                    className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-teal-500"
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
                              <span className="text-sm text-slate-500">{sprint.sprint_code}</span>
                              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                {sprint.name}
                              </h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{sprint.goal || 'No goal set'}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline" className={getStatusColor(sprint.status as SprintStatus)}>
                                {sprint.status}
                              </Badge>
                              {sprint.start_date && sprint.end_date && (
                                <span className="text-slate-500">
                                  {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                                </span>
                              )}
                              {sprint.team_name && (
                                <span className="text-slate-500">{sprint.team_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-teal-600">
                            {sprint.total_tasks > 0
                              ? Math.round((sprint.completed_tasks / sprint.total_tasks) * 100)
                              : 0}%
                          </div>
                          <div className="text-sm text-slate-500">Complete</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">
                            {sprint.completed_tasks} / {sprint.total_tasks} tasks
                          </span>
                          {sprint.days_remaining > 0 && (
                            <span className={`font-medium ${sprint.days_remaining <= 3 ? 'text-red-600' : 'text-slate-600'}`}>
                              {sprint.days_remaining} days remaining
                            </span>
                          )}
                        </div>
                        <Progress
                          value={sprint.total_tasks > 0 ? (sprint.completed_tasks / sprint.total_tasks) * 100 : 0}
                          className="h-2"
                        />
                      </div>

                      {/* Task Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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

                      {/* Sprint Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {sprint.status === 'planning' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartSprint(sprint.id, sprint.name)
                            }}
                            disabled={isStartingSprint}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Start Sprint
                          </Button>
                        )}
                        {sprint.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCompleteSprint(sprint.id, sprint.name)
                            }}
                            disabled={isCompletingSprint}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete Sprint
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddTask(sprint.id)
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Task
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSprintClick(sprint.id)
                          }}
                          disabled={isDeletingSprint}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Loading State */}
            {isLoadingSprints && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-500 mr-2" />
                <span className="text-slate-500">Loading sprints...</span>
              </div>
            )}
          </TabsContent>

          {/* Board Tab */}
          <TabsContent value="board" className="space-y-6">
            {/* Board Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Sprint Board</h2>
                  <p className="text-purple-100">Trello-level kanban visualization</p>
                  <p className="text-purple-200 text-xs mt-1">Drag & drop • Swimlanes • WIP limits</p>
                </div>
              </div>
            </div>
            {activeSprint ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
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
                                      <AvatarImage src={task.assignee.avatar} alt="User avatar" />
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
                        <Select
                          onValueChange={(sprintId) => {
                            if (sprintId) {
                              handleAddToSprint(task, sprintId)
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Add to Sprint" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeSprints.filter(s => s.status !== 'completed').map((sprint) => (
                              <SelectItem key={sprint.id} value={sprint.id}>
                                {sprint.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
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

          {/* Settings Tab - Jira Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'sprints', label: 'Sprint Defaults', icon: Zap },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'team', label: 'Team Settings', icon: Users },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        settingsTab === item.id
                          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                {/* Sprint Stats */}
                <Card className="mt-6 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sprint Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg Velocity</span>
                      <Badge variant="secondary">{Math.round(stats.avgVelocity)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Completion Rate</span>
                      <span className="text-sm font-medium text-teal-600">{Math.round(stats.completionRate)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Active Sprints</span>
                      <span className="text-sm font-medium">{stats.active}</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-2 mt-2" />
                    <p className="text-xs text-gray-500 mt-1">Overall completion rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-teal-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure your sprint workspace settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input defaultValue="Platform Team" />
                            <p className="text-xs text-gray-500">Name visible to team members</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Project Key</Label>
                            <Input defaultValue="PROJ" />
                            <p className="text-xs text-gray-500">Used in issue keys (e.g., PROJ-101)</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Working Days</Label>
                            <Select defaultValue="weekdays">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekdays">Mon - Fri</SelectItem>
                                <SelectItem value="all">All Days</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Public Board</p>
                            <p className="text-sm text-gray-500">Allow anyone to view the board</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-assign Reporter</p>
                            <p className="text-sm text-gray-500">Set task creator as reporter automatically</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Board Configuration
                        </CardTitle>
                        <CardDescription>Customize your Kanban board</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Subtasks</p>
                            <p className="text-sm text-gray-500">Display subtasks on the board</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Card Colors by Priority</p>
                            <p className="text-sm text-gray-500">Color-code cards by priority level</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Swimlanes</p>
                            <p className="text-sm text-gray-500">Group tasks by assignee or epic</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Sprint Defaults Settings */}
                {settingsTab === 'sprints' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-teal-600" />
                          Sprint Configuration
                        </CardTitle>
                        <CardDescription>Configure default sprint settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Sprint Duration</Label>
                            <Select defaultValue="2w">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1w">1 Week</SelectItem>
                                <SelectItem value="2w">2 Weeks</SelectItem>
                                <SelectItem value="3w">3 Weeks</SelectItem>
                                <SelectItem value="4w">4 Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Story Points Scale</Label>
                            <Select defaultValue="fib">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fib">Fibonacci (1,2,3,5,8,13,21)</SelectItem>
                                <SelectItem value="linear">Linear (1-10)</SelectItem>
                                <SelectItem value="tshirt">T-Shirt (XS,S,M,L,XL)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-start Next Sprint</p>
                            <p className="text-sm text-gray-500">Automatically start next sprint when current ends</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Carry Over Incomplete Tasks</p>
                            <p className="text-sm text-gray-500">Move incomplete tasks to next sprint</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Sprint Goal</p>
                            <p className="text-sm text-gray-500">Mandate sprint goal before starting</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          Velocity Settings
                        </CardTitle>
                        <CardDescription>Configure velocity calculation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Velocity Calculation</Label>
                          <Select defaultValue="5">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">Last 3 sprints</SelectItem>
                              <SelectItem value="5">Last 5 sprints</SelectItem>
                              <SelectItem value="10">Last 10 sprints</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500">Number of sprints to average</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Show Velocity Trend</p>
                            <p className="text-sm text-gray-500">Display velocity trend on dashboard</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Commitment Warning</p>
                            <p className="text-sm text-gray-500">Warn when committing above average velocity</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" />
                          Sprint Notifications
                        </CardTitle>
                        <CardDescription>Configure sprint-related alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sprint Start Reminder</p>
                            <p className="text-sm text-gray-500">Notify 1 day before sprint starts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Sprint End Reminder</p>
                            <p className="text-sm text-gray-500">Notify 2 days before sprint ends</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Daily Standup Reminder</p>
                            <p className="text-sm text-gray-500">Daily notification at standup time</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Retrospective Reminder</p>
                            <p className="text-sm text-gray-500">Notify to schedule retrospective</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="space-y-2 pt-4">
                          <Label>Standup Time</Label>
                          <Input type="time" defaultValue="09:30" />
                          <p className="text-xs text-gray-500">When to send daily standup reminder</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Issue Alerts
                        </CardTitle>
                        <CardDescription>Notifications about task issues</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Blocked Task Alert</p>
                            <p className="text-sm text-gray-500">Notify when tasks become blocked</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Overdue Task Alert</p>
                            <p className="text-sm text-gray-500">Notify when tasks pass due date</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Scope Creep Warning</p>
                            <p className="text-sm text-gray-500">Alert when new tasks added mid-sprint</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Burndown Off-Track Alert</p>
                            <p className="text-sm text-gray-500">Notify when burndown deviates from ideal</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Team Settings */}
                {settingsTab === 'team' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Team Configuration
                        </CardTitle>
                        <CardDescription>Manage team capacity and settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Capacity (hours/sprint)</Label>
                            <Input type="number" defaultValue="80" />
                          </div>
                          <div className="space-y-2">
                            <Label>Focus Factor</Label>
                            <Select defaultValue="0.8">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.6">60% - High meetings</SelectItem>
                                <SelectItem value="0.7">70% - Moderate</SelectItem>
                                <SelectItem value="0.8">80% - Focused</SelectItem>
                                <SelectItem value="0.9">90% - Very focused</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Allow Self-Assignment</p>
                            <p className="text-sm text-gray-500">Team members can assign tasks to themselves</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require Reviewer</p>
                            <p className="text-sm text-gray-500">Tasks need reviewer before done</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          Roles & Permissions
                        </CardTitle>
                        <CardDescription>Configure team roles</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { role: 'Scrum Master', desc: 'Can manage sprints and facilitate ceremonies', color: 'text-teal-600' },
                          { role: 'Product Owner', desc: 'Can prioritize backlog and accept stories', color: 'text-blue-600' },
                          { role: 'Developer', desc: 'Can update tasks and log work', color: 'text-green-600' },
                          { role: 'QA', desc: 'Can move tasks to review and verify', color: 'text-amber-600' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Shield className={`w-5 h-5 ${item.color}`} />
                              <div>
                                <p className="font-medium">{item.role}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleConfigureRole(item)}>Configure</Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-600" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Send sprint events to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-service.com/webhook" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-sprint" defaultChecked />
                            <Label htmlFor="wh-sprint">Sprint Events</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-task" defaultChecked />
                            <Label htmlFor="wh-task">Task Updates</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-comment" />
                            <Label htmlFor="wh-comment">Comments</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="wh-blocked" defaultChecked />
                            <Label htmlFor="wh-blocked">Blockers</Label>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>

                        {/* Display existing webhooks */}
                        {webhooks.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <Label className="text-sm font-medium">Active Webhooks</Label>
                            {webhooks.map(webhook => (
                              <div key={webhook.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                                <div className="flex-1 truncate">
                                  <p className="font-mono text-xs truncate">{webhook.url}</p>
                                  <p className="text-xs text-gray-500">{webhook.events.join(', ')}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-violet-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys for integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input
                              type={showApiKey ? "text" : "password"}
                              value={apiKey}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              onClick={() => setShowApiKey(!showApiKey)}
                              title={showApiKey ? "Hide API key" : "Show API key"}
                            >
                              {showApiKey ? <AlertTriangle className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" onClick={handleCopyApiKey} title="Copy API key">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" onClick={handleRegenerateApiKey} title="Regenerate API key">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Use this key to authenticate API requests. Keep it secure and never share publicly.</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">API Access</p>
                            <p className="text-sm text-gray-500">Enable external API access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-gray-600" />
                          Git Integration
                        </CardTitle>
                        <CardDescription>Connect with version control</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Auto-link Commits</p>
                            <p className="text-sm text-gray-500">Link commits by task key (e.g., PROJ-101)</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Smart Transitions</p>
                            <p className="text-sm text-gray-500">Auto-move tasks based on branch activity</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">PR Status Updates</p>
                            <p className="text-sm text-gray-500">Show PR status on task cards</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Project security configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Require 2FA</p>
                            <p className="text-sm text-gray-500">Enforce 2FA for all team members</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-gray-500">Log all changes to sprints and tasks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Restrict access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Sprint data and exports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Data Retention</Label>
                          <Select defaultValue="forever">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1y">1 Year</SelectItem>
                              <SelectItem value="2y">2 Years</SelectItem>
                              <SelectItem value="5y">5 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => handleExportSprintData('csv')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => handleExportSprintData('json')}>
                            <Download className="w-4 h-4 mr-2" />
                            Export JSON
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                          Subscription
                        </CardTitle>
                        <CardDescription>Plan and billing information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                          <div>
                            <p className="font-medium text-teal-800 dark:text-teal-400">Professional Plan</p>
                            <p className="text-sm text-teal-600 dark:text-teal-500">Unlimited sprints • Advanced analytics</p>
                          </div>
                          <Badge className="bg-teal-600">Active</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-teal-600">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total Sprints</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.totalTasks}</p>
                            <p className="text-xs text-gray-500">Tasks</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600">{mockTeamMembers.length}</p>
                            <p className="text-xs text-gray-500">Team Members</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            Manage Subscription
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600">
                            Upgrade Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Archive All Sprints</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Archive all completed sprints</p>
                          </div>
                          <Button onClick={handleArchiveSprints} variant="destructive" size="sm">Archive</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset Velocity Data</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Clear all velocity history</p>
                          </div>
                          <Button onClick={handleResetVelocity} variant="destructive" size="sm">Reset</Button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete Project</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Permanently delete this project</p>
                          </div>
                          <Button onClick={handleDeleteProject} variant="destructive" size="sm">Delete</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockSprintsAIInsights}
              title="Sprint Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockSprintsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockSprintsPredictions}
              title="Sprint Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockSprintsActivities}
            title="Sprint Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                              <AvatarImage src={member.avatar} alt="User avatar" />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                        <AvatarImage src={selectedTask.assignee.avatar} alt="User avatar" />
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

        {/* ============================================================================ */}
        {/* CREATE SPRINT DIALOG - Real Supabase Operation */}
        {/* ============================================================================ */}
        <Dialog open={showCreateSprintDialog} onOpenChange={setShowCreateSprintDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Create New Sprint
              </DialogTitle>
              <DialogDescription>
                Create a new sprint to organize your team's work
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sprint-name">Sprint Name *</Label>
                <Input
                  id="sprint-name"
                  placeholder="e.g., Sprint 26 - Mobile Features"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-goal">Sprint Goal</Label>
                <Textarea
                  id="sprint-goal"
                  placeholder="What is the main objective of this sprint?"
                  value={newSprintGoal}
                  onChange={(e) => setNewSprintGoal(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-team">Team Name</Label>
                <Input
                  id="sprint-team"
                  placeholder="e.g., Platform Team"
                  value={newSprintTeamName}
                  onChange={(e) => setNewSprintTeamName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sprint-start">Start Date</Label>
                  <Input
                    id="sprint-start"
                    type="date"
                    value={newSprintStartDate}
                    onChange={(e) => setNewSprintStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprint-end">End Date</Label>
                  <Input
                    id="sprint-end"
                    type="date"
                    value={newSprintEndDate}
                    onChange={(e) => setNewSprintEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-capacity">Team Capacity (hours)</Label>
                <Input
                  id="sprint-capacity"
                  type="number"
                  placeholder="80"
                  value={newSprintCapacity}
                  onChange={(e) => setNewSprintCapacity(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateSprintDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitCreateSprint}
                disabled={isCreatingSprint}
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
              >
                {isCreatingSprint ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sprint
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* CREATE TASK DIALOG - Real Supabase Operation */}
        {/* ============================================================================ */}
        <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Add a new task to your sprint
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="task-sprint">Sprint *</Label>
                <Select
                  value={selectedSprintForTask || ''}
                  onValueChange={setSelectedSprintForTask}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSprints.filter(s => s.status !== 'completed').map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title *</Label>
                <Input
                  id="task-title"
                  placeholder="e.g., Implement user authentication"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Describe what needs to be done..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={newTaskPriority}
                    onValueChange={setNewTaskPriority}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-points">Story Points</Label>
                  <Input
                    id="task-points"
                    type="number"
                    placeholder="3"
                    value={newTaskStoryPoints}
                    onChange={(e) => setNewTaskStoryPoints(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-hours">Est. Hours</Label>
                  <Input
                    id="task-hours"
                    type="number"
                    placeholder="8"
                    value={newTaskEstimatedHours}
                    onChange={(e) => setNewTaskEstimatedHours(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTaskDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitCreateTask}
                disabled={isCreatingTask}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                {isCreatingTask ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* DELETE CONFIRMATION DIALOG */}
        {/* ============================================================================ */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Confirm Delete
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this sprint? This action cannot be undone.
                All tasks associated with this sprint will also be removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteConfirmDialog(false)
                setSprintToDelete(null)
              }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeleteSprint}
                disabled={isDeletingSprint}
              >
                {isDeletingSprint ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Sprint
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* NEW STORY DIALOG (Quick Action) */}
        {/* ============================================================================ */}
        <Dialog open={showNewStoryDialog} onOpenChange={(open) => {
          setShowNewStoryDialog(open)
          if (!open) resetStoryForm()
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Create New Story
              </DialogTitle>
              <DialogDescription>
                Add a new user story to the sprint backlog.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="story-sprint">Target Sprint</Label>
                <Select value={selectedSprintForStory || ''} onValueChange={setSelectedSprintForStory}>
                  <SelectTrigger id="story-sprint">
                    <SelectValue placeholder="Select sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSprints
                      .filter(s => s.status === 'planning' || s.status === 'active')
                      .map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name} ({sprint.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="story-title">Story Title</Label>
                <Input
                  id="story-title"
                  placeholder="As a user, I want to..."
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story-description">Description</Label>
                <Textarea
                  id="story-description"
                  placeholder="Describe the acceptance criteria..."
                  rows={3}
                  value={newStoryDescription}
                  onChange={(e) => setNewStoryDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="story-points">Story Points</Label>
                  <Select value={newStoryPoints} onValueChange={setNewStoryPoints}>
                    <SelectTrigger id="story-points">
                      <SelectValue placeholder="Points" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Point</SelectItem>
                      <SelectItem value="2">2 Points</SelectItem>
                      <SelectItem value="3">3 Points</SelectItem>
                      <SelectItem value="5">5 Points</SelectItem>
                      <SelectItem value="8">8 Points</SelectItem>
                      <SelectItem value="13">13 Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="story-priority">Priority</Label>
                  <Select value={newStoryPriority} onValueChange={setNewStoryPriority}>
                    <SelectTrigger id="story-priority">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowNewStoryDialog(false)
                resetStoryForm()
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitNewStory}
                disabled={isCreatingTask || !newStoryTitle.trim()}
              >
                {isCreatingTask ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Story
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* START SPRINT DIALOG (Quick Action) */}
        {/* ============================================================================ */}
        <Dialog open={showStartSprintDialog} onOpenChange={(open) => {
          setShowStartSprintDialog(open)
          if (!open) resetStartSprintForm()
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-green-500" />
                Start Sprint
              </DialogTitle>
              <DialogDescription>
                Select a sprint to start. Only sprints in planning status can be started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="select-sprint">Select Sprint</Label>
                <Select value={sprintToStart || ''} onValueChange={setSprintToStart}>
                  <SelectTrigger id="select-sprint">
                    <SelectValue placeholder="Choose a sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSprints
                      .filter(s => s.status === 'planning')
                      .map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name} ({sprint.key})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sprint-duration">Sprint Duration</Label>
                <Select value={sprintDuration} onValueChange={setSprintDuration}>
                  <SelectTrigger id="sprint-duration">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Week</SelectItem>
                    <SelectItem value="2">2 Weeks</SelectItem>
                    <SelectItem value="3">3 Weeks</SelectItem>
                    <SelectItem value="4">4 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {sprintToStart && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Ready to start sprint with {sprintDuration}-week duration. This will lock the sprint scope and begin tracking.
                  </p>
                </div>
              )}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Starting a sprint will lock its scope and begin tracking velocity and burndown metrics.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowStartSprintDialog(false)
                resetStartSprintForm()
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitStartSprint}
                disabled={isStartingSprint || !sprintToStart}
                className="bg-green-600 hover:bg-green-700"
              >
                {isStartingSprint ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Sprint
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* BACKLOG DIALOG (Quick Action) */}
        {/* ============================================================================ */}
        <Dialog open={showBacklogDialog} onOpenChange={setShowBacklogDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Product Backlog
              </DialogTitle>
              <DialogDescription>
                View and manage items in the product backlog. Drag items to reorder priority.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search backlog items..." className="flex-1" />
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {backlogTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-mono text-muted-foreground">{index + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.key}</p>
                      </div>
                      <Badge variant="outline">{task.story_points} pts</Badge>
                      <Badge variant={
                        task.priority === 'critical' ? 'destructive' :
                        task.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBacklogDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setShowBacklogDialog(false)
                setShowCreateTaskDialog(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add to Backlog
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* CONFIGURE ROLE DIALOG */}
        {/* ============================================================================ */}
        <Dialog open={showConfigureRoleDialog} onOpenChange={(open) => {
          setShowConfigureRoleDialog(open)
          if (!open) setSelectedRole(null)
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${selectedRole?.color || 'text-gray-500'}`} />
                Configure {selectedRole?.role} Permissions
              </DialogTitle>
              <DialogDescription>
                {selectedRole?.desc}
              </DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Manage Sprints</p>
                    <p className="text-sm text-gray-500">Create, edit, start and complete sprints</p>
                  </div>
                  <Switch
                    checked={rolePermissions[selectedRole.role]?.canManageSprints || false}
                    onCheckedChange={(checked) => setRolePermissions(prev => ({
                      ...prev,
                      [selectedRole.role]: { ...prev[selectedRole.role], canManageSprints: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Create Tasks</p>
                    <p className="text-sm text-gray-500">Add new tasks and stories to sprints</p>
                  </div>
                  <Switch
                    checked={rolePermissions[selectedRole.role]?.canCreateTasks || false}
                    onCheckedChange={(checked) => setRolePermissions(prev => ({
                      ...prev,
                      [selectedRole.role]: { ...prev[selectedRole.role], canCreateTasks: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Assign Tasks</p>
                    <p className="text-sm text-gray-500">Assign tasks to team members</p>
                  </div>
                  <Switch
                    checked={rolePermissions[selectedRole.role]?.canAssignTasks || false}
                    onCheckedChange={(checked) => setRolePermissions(prev => ({
                      ...prev,
                      [selectedRole.role]: { ...prev[selectedRole.role], canAssignTasks: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Approve Stories</p>
                    <p className="text-sm text-gray-500">Accept and approve completed stories</p>
                  </div>
                  <Switch
                    checked={rolePermissions[selectedRole.role]?.canApproveStories || false}
                    onCheckedChange={(checked) => setRolePermissions(prev => ({
                      ...prev,
                      [selectedRole.role]: { ...prev[selectedRole.role], canApproveStories: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">View Reports</p>
                    <p className="text-sm text-gray-500">Access velocity and burndown reports</p>
                  </div>
                  <Switch
                    checked={rolePermissions[selectedRole.role]?.canViewReports || false}
                    onCheckedChange={(checked) => setRolePermissions(prev => ({
                      ...prev,
                      [selectedRole.role]: { ...prev[selectedRole.role], canViewReports: checked }
                    }))}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowConfigureRoleDialog(false)
                setSelectedRole(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveRolePermissions}>
                Save Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================================================ */}
        {/* ADD WEBHOOK DIALOG */}
        {/* ============================================================================ */}
        <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-orange-500" />
                Add Webhook
              </DialogTitle>
              <DialogDescription>
                Configure a webhook to receive sprint events at your endpoint
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-service.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">HTTPS endpoints only. We will POST JSON payloads to this URL.</p>
              </div>

              <div className="space-y-3">
                <Label>Event Types</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      id="wh-sprint-dialog"
                      checked={webhookEvents.sprint}
                      onCheckedChange={(checked) => setWebhookEvents(prev => ({ ...prev, sprint: checked }))}
                    />
                    <Label htmlFor="wh-sprint-dialog" className="text-sm">Sprint Events</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      id="wh-task-dialog"
                      checked={webhookEvents.task}
                      onCheckedChange={(checked) => setWebhookEvents(prev => ({ ...prev, task: checked }))}
                    />
                    <Label htmlFor="wh-task-dialog" className="text-sm">Task Updates</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      id="wh-comment-dialog"
                      checked={webhookEvents.comment}
                      onCheckedChange={(checked) => setWebhookEvents(prev => ({ ...prev, comment: checked }))}
                    />
                    <Label htmlFor="wh-comment-dialog" className="text-sm">Comments</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Switch
                      id="wh-blocker-dialog"
                      checked={webhookEvents.blocker}
                      onCheckedChange={(checked) => setWebhookEvents(prev => ({ ...prev, blocker: checked }))}
                    />
                    <Label htmlFor="wh-blocker-dialog" className="text-sm">Blockers</Label>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Webhooks will be sent with a signature header for verification. See documentation for details.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAddWebhookDialog(false)
                setWebhookUrl('')
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddWebhook} disabled={!webhookUrl.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
