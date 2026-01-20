'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjects as useProjectsOld } from '@/lib/hooks/use-projects'
import {
  useProjects as useProjectsApi,
  useDeleteProject as useDeleteProjectApi,
  useUpdateProject as useUpdateProjectApi,
  useProjectStats,
  useTasks,
  useUpdateTask,
  type Project as ApiProject,
  type ProjectFilters,
  type Task
} from '@/lib/api-clients'
import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterConfig
} from '@/components/world-class/data-table/data-table'
import { useSprints, useSprintMutations, Sprint as SprintDB } from '@/lib/hooks/use-sprints'
import { useMilestones, useMilestoneMutations, Milestone as MilestoneDB } from '@/lib/hooks/use-milestones'
import { useRoadmapInitiatives, useRoadmapMutations, RoadmapInitiative } from '@/lib/hooks/use-roadmap'
import { useAutomations } from '@/lib/hooks/use-automations'
import { useTimeTracking } from '@/lib/hooks/use-time-tracking'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import {
  FolderOpen, Plus, Search, Filter, DollarSign, Users, CheckCircle2, Calendar, TrendingUp,
  Briefcase, Edit, Target, BarChart3, Settings, Trash2, LayoutGrid,
  List, GanttChartSquare, ChevronDown, MoreHorizontal, Flag, Tag, MessageSquare, Archive, Star, Zap, Timer, AlertTriangle, CheckSquare, Play, Milestone, GitBranch, Layers, ArrowRight, RefreshCw, Copy, Workflow, FileText, Bell, Shield, Link, ExternalLink, Activity,
  Key, Webhook, Database, Lock, AlertOctagon, Mail, Globe, Upload, Download,
  BellRing, Slack, Layout, Code, Hash, Columns, ChevronRight
} from 'lucide-react'

// Lazy-loaded Enhanced & Competitive Upgrade Components for code splitting
import { TabContentSkeleton } from '@/components/dashboard/lazy'

const AIInsightsPanel = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.AIInsightsPanel })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const CollaborationIndicator = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.CollaborationIndicator })),
  {
    loading: () => <div className="animate-pulse h-8 w-32 bg-muted rounded" />,
    ssr: false
  }
)

const PredictiveAnalytics = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.PredictiveAnalytics })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const ActivityFeed = dynamic(
  () => import('@/components/ui/competitive-upgrades-extended').then(mod => ({ default: mod.ActivityFeed })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const QuickActionsToolbar = dynamic(
  () => import('@/components/ui/competitive-upgrades-extended').then(mod => ({ default: mod.QuickActionsToolbar })),
  {
    loading: () => <div className="animate-pulse h-12 w-full bg-muted rounded" />,
    ssr: false
  }
)


// Project status configuration
const projectsStatusColumns = [
  { id: 'planning', label: 'Planning', color: 'bg-blue-500' },
  { id: 'active', label: 'Active', color: 'bg-green-500' },
  { id: 'review', label: 'Review', color: 'bg-yellow-500' },
  { id: 'completed', label: 'Completed', color: 'bg-purple-500' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-gray-500' }
]

// Types
type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'on_hold'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type SprintStatus = 'upcoming' | 'active' | 'completed'

interface Project {
  id: string
  name: string
  description?: string
  projectCode: string
  status: ProjectStatus
  priority: Priority
  progress: number
  budget?: number
  spent: number
  startDate?: string
  endDate?: string
  teamMembers: string[]
  tags: string[]
  tasksTotal: number
  tasksCompleted: number
}

interface Sprint {
  id: string
  name: string
  goal: string
  status: SprintStatus
  startDate: string
  endDate: string
  velocity: number
  tasksTotal: number
  tasksCompleted: number
}

interface BacklogItem {
  id: string
  title: string
  description: string
  priority: Priority
  points: number
  type: 'feature' | 'bug' | 'improvement' | 'task'
  assignee?: string
  sprint?: string
}

interface RoadmapItem {
  id: string
  title: string
  quarter: string
  status: 'planned' | 'in_progress' | 'completed'
  progress: number
  projectIds: string[]
}

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  runsCount: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  tasksCount: number
  usageCount: number
}

interface Issue {
  id: string
  key: string
  title: string
  description: string
  type: 'story' | 'bug' | 'task' | 'epic' | 'subtask'
  status: 'open' | 'in_progress' | 'in_review' | 'done' | 'blocked'
  priority: Priority
  assignee?: string
  reporter: string
  labels: string[]
  storyPoints?: number
  timeEstimate?: number
  timeSpent?: number
  createdAt: string
  updatedAt: string
  dueDate?: string
  epicId?: string
  sprintId?: string
  comments: Comment[]
  attachments: number
  watchers: string[]
}

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

interface Epic {
  id: string
  key: string
  name: string
  summary: string
  status: 'to_do' | 'in_progress' | 'done'
  color: string
  startDate: string
  dueDate: string
  progress: number
  issuesCount: number
  issuesCompleted: number
}

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'user' | 'url'
  required: boolean
  options?: string[]
  appliesTo: string[]
}

interface Activity {
  id: string
  type: 'comment' | 'status_change' | 'assignment' | 'priority_change' | 'label_add' | 'sprint_move'
  user: string
  issueKey: string
  details: string
  timestamp: string
}

interface Report {
  id: string
  name: string
  type: 'burndown' | 'velocity' | 'cumulative_flow' | 'sprint_report' | 'version_report' | 'epic_report'
  description: string
  lastGenerated: string
  isFavorite: boolean
}

interface Integration {
  id: string
  name: string
  type: 'github' | 'gitlab' | 'slack' | 'confluence' | 'bitbucket' | 'teams'
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  icon: string
}

// Status columns configuration
const statusColumns = projectsStatusColumns

const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Critical' },
  high: { color: 'bg-orange-500', label: 'High' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  low: { color: 'bg-gray-400', label: 'Low' }
}

// Custom fields configuration - to be fetched from real API endpoint /api/projects/custom-fields
// Using hook-based data fetching pattern for custom field configuration
const customFieldsConfig: CustomField[] = []
// FUTURE: Replace with useProjectCustomFields() hook when available (enhancement, not blocking)
// Previously contained 5 hardcoded custom fields (Customer Impact, Technical Debt, Release Version, QA Contact, Documentation Link)

const getIssueTypeColor = (type: Issue['type']): string => {
  const colors = { story: 'bg-green-100 text-green-700', bug: 'bg-red-100 text-red-700', task: 'bg-blue-100 text-blue-700', epic: 'bg-purple-100 text-purple-700', subtask: 'bg-gray-100 text-gray-700' }
  return colors[type] || 'bg-gray-100'
}

const getIssueStatusColor = (status: Issue['status']): string => {
  const colors = { open: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', in_review: 'bg-yellow-100 text-yellow-700', done: 'bg-green-100 text-green-700', blocked: 'bg-red-100 text-red-700' }
  return colors[status] || 'bg-gray-100'
}

const getIntegrationStatusColor = (status: Integration['status']): string => {
  const colors = { connected: 'bg-green-100 text-green-700', disconnected: 'bg-gray-100 text-gray-700', error: 'bg-red-100 text-red-700' }
  return colors[status] || 'bg-gray-100'
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = { comment: MessageSquare, status_change: RefreshCw, assignment: Users, priority_change: Flag, label_add: Tag, sprint_move: GitBranch }
  return icons[type] || MessageSquare
}

export default function ProjectsHubClient() {
  const [activeTab, setActiveTab] = useState('projects')
  const [viewType, setViewType] = useState<'board' | 'list' | 'timeline'>('board')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showIssueDialog, setShowIssueDialog] = useState(false)

  // Dialog states for buttons without onClick handlers
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [showSprintBoardDialog, setShowSprintBoardDialog] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [showBacklogItemDialog, setShowBacklogItemDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showAutomationDialog, setShowAutomationDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showSlackConfigDialog, setShowSlackConfigDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showApiTokenDialog, setShowApiTokenDialog] = useState(false)
  const [showCustomFieldDialog, setShowCustomFieldDialog] = useState(false)
  const [selectedCustomField, setSelectedCustomField] = useState<CustomField | null>(null)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showWorkflowStatusDialog, setShowWorkflowStatusDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [showLogTimeDialog, setShowLogTimeDialog] = useState(false)
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false)
  const [showLinkIssueDialog, setShowLinkIssueDialog] = useState(false)
  const [showEditIssueDialog, setShowEditIssueDialog] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [showTeamMemberDialog, setShowTeamMemberDialog] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Form states for dialogs
  const [milestoneForm, setMilestoneForm] = useState({ title: '', quarter: 'Q1 2026', status: 'planned' })
  const [backlogForm, setBacklogForm] = useState({ title: '', description: '', type: 'feature', priority: 'medium', points: 3 })
  const [reportForm, setReportForm] = useState({ name: '', type: 'burndown', description: '' })
  const [automationForm, setAutomationForm] = useState({ name: '', trigger: '', action: '', enabled: true })
  const [webhookForm, setWebhookForm] = useState({ url: '', events: ['issue.created'] })
  const [customFieldForm, setCustomFieldForm] = useState({ name: '', type: 'text', required: false, appliesTo: ['story'] })
  const [workflowStatusForm, setWorkflowStatusForm] = useState({ name: '', color: 'bg-gray-500' })
  const [logTimeForm, setLogTimeForm] = useState({ hours: 0, description: '' })
  const [linkIssueForm, setLinkIssueForm] = useState({ issueKey: '', linkType: 'blocks' })
  const [filterState, setFilterState] = useState({ status: 'all', priority: 'all', assignee: 'all' })
  const [slackChannel, setSlackChannel] = useState('#engineering')
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', budget: 0, priority: 'medium' as Priority, status: 'planning' as ProjectStatus })

  // Settings state for toggles
  const [settingsState, setSettingsState] = useState({
    showProgressBars: true,
    showBudgetInfo: true,
    compactMode: false,
    enableTimeTracking: true,
    autoGenerateKeys: true,
    emailIssueAssigned: true,
    emailStatusChanged: true,
    emailMentioned: true,
    emailDueDateApproaching: true,
    emailDailySummary: false,
    inAppSprintNotifications: true,
    inAppNewComments: true,
    inAppAutomationRuns: false,
    inAppIntegrationErrors: true,
    slackPostNewIssues: true,
    slackSprintUpdates: true,
    slackReleaseNotifications: false,
    allowExternalCollaborators: false,
    requireAdminApproval: false,
    requireCommentOnBlock: true,
    autoAssignOnProgress: true,
    requireReviewerForReview: false,
    preventReopeningDone: false,
  })

  // Local state for webhooks and custom fields (for deletion)
  const [localWebhooks, setLocalWebhooks] = useState([
    { url: 'https://api.company.com/webhooks/jira', events: ['issue.created', 'issue.updated'], status: 'active' },
    { url: 'https://hooks.zapier.com/hooks/catch/123456', events: ['sprint.completed'], status: 'active' },
  ])
  const [localCustomFields, setLocalCustomFields] = useState<CustomField[]>(customFieldsConfig)
  const [localAutomations, setLocalAutomations] = useState<Automation[]>([])
  const [localIssues, setLocalIssues] = useState<Issue[]>([])
  const [localBacklogItems, setLocalBacklogItems] = useState<BacklogItem[]>([])
  const [localMilestones, setLocalMilestones] = useState<RoadmapItem[]>([])
  const [localSprints, setLocalSprints] = useState<Sprint[]>([])

  // Database integration - use real projects hook (legacy)
  const { projects: dbProjects, fetchProjects, createProject, updateProject, deleteProject, isLoading: projectsLoading } = useProjectsOld()

  // TanStack Query integration for DataTable (new world-class pattern)
  const [dataTablePage, setDataTablePage] = useState(1)
  const [dataTablePageSize, setDataTablePageSize] = useState(10)
  const [dataTableFilters, setDataTableFilters] = useState<ProjectFilters>({})
  const [selectedProjectRows, setSelectedProjectRows] = useState<Project[]>([])

  const {
    data: apiProjectsData,
    isLoading: apiProjectsLoading,
    error: apiProjectsError,
    refetch: refetchApiProjects
  } = useProjectsApi(dataTablePage, dataTablePageSize, dataTableFilters)

  const deleteProjectMutation = useDeleteProjectApi()
  const updateProjectMutation = useUpdateProjectApi()
  const { data: projectStatsData } = useProjectStats()

  // Bulk actions for DataTable
  const handleBulkDelete = useCallback(async () => {
    if (selectedProjectRows.length === 0) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedProjectRows.length} project(s)? This action cannot be undone.`
    )
    if (!confirmDelete) return

    try {
      await Promise.all(
        selectedProjectRows.map(project => deleteProjectMutation.mutateAsync(project.id))
      )
      toast.success(`Successfully deleted ${selectedProjectRows.length} project(s)`)
      setSelectedProjectRows([])
    } catch (error) {
      toast.error('Failed to delete some projects')
    }
  }, [selectedProjectRows, deleteProjectMutation])

  const handleBulkArchive = useCallback(async () => {
    if (selectedProjectRows.length === 0) return

    try {
      await Promise.all(
        selectedProjectRows.map(project =>
          updateProjectMutation.mutateAsync({
            id: project.id,
            updates: { status: 'on-hold' as const }
          })
        )
      )
      toast.success(`Successfully archived ${selectedProjectRows.length} project(s)`)
      setSelectedProjectRows([])
    } catch (error) {
      toast.error('Failed to archive some projects')
    }
  }, [selectedProjectRows, updateProjectMutation])

  const handleBulkExport = useCallback(() => {
    if (selectedProjectRows.length === 0) {
      toast.error('Select projects to export')
      return
    }

    const exportData = selectedProjectRows.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      budget: project.budget,
      spent: project.spent,
      startDate: project.startDate,
      endDate: project.endDate
    }))

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${selectedProjectRows.length} project(s)`)
  }, [selectedProjectRows])

  // DataTable column definitions
  const projectColumns: ColumnDef<Project>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-gray-500">{row.original.projectCode}</p>
        </div>
      ),
      enableSorting: true,
      filterFn: 'fuzzy'
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {statusColumns.find(c => c.id === row.original.status)?.label || row.original.status}
        </Badge>
      ),
      enableSorting: true,
      filterFn: 'array'
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const config = getPriorityConfig(row.original.priority)
        return (
          <Badge className={`${config.color} text-white`}>
            {config.label}
          </Badge>
        )
      },
      enableSorting: true,
      filterFn: 'array'
    },
    {
      accessorKey: 'progress',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progress" />
      ),
      cell: ({ row }) => (
        <div className="w-24">
          <div className="flex justify-between text-xs mb-1">
            <span>{row.original.progress}%</span>
          </div>
          <Progress value={row.original.progress} className="h-1.5" />
        </div>
      ),
      enableSorting: true
    },
    {
      accessorKey: 'budget',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Budget" />
      ),
      cell: ({ row }) => (
        row.original.budget ? (
          <div>
            <span className="font-medium">${((row.original.spent || 0) / 1000).toFixed(0)}K</span>
            <span className="text-gray-500"> / ${(row.original.budget / 1000).toFixed(0)}K</span>
          </div>
        ) : '-'
      ),
      enableSorting: true
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => (
        row.original.endDate
          ? new Date(row.original.endDate).toLocaleDateString()
          : '-'
      ),
      enableSorting: true
    }
  ], [])

  // DataTable filter configs
  const projectFilterConfigs: DataTableFilterConfig[] = useMemo(() => [
    {
      columnId: 'status',
      title: 'Status',
      options: statusColumns.map(col => ({
        label: col.label,
        value: col.id
      }))
    },
    {
      columnId: 'priority',
      title: 'Priority',
      options: [
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' }
      ]
    }
  ], [])

  // Gantt Chart - Tasks integration for timeline view
  const [ganttTimeRange, setGanttTimeRange] = useState<'week' | 'month' | 'quarter'>('month')
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const {
    data: tasksData,
    isLoading: tasksLoading,
    refetch: refetchTasks
  } = useTasks(1, 100) // Fetch all tasks for Gantt view

  const updateTaskMutation = useUpdateTask()

  // Calculate Gantt chart date range
  const ganttDateRange = useMemo(() => {
    const now = new Date()
    let startDate: Date
    let endDate: Date
    let daysInRange: number

    switch (ganttTimeRange) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7)
        daysInRange = 7
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        break
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        daysInRange = endDate.getDate()
    }

    return { startDate, endDate, daysInRange }
  }, [ganttTimeRange])

  // Calculate task position in Gantt chart
  const getTaskGanttPosition = useCallback((task: { start_date?: string | null; deadline?: string | null }) => {
    const { startDate, endDate, daysInRange } = ganttDateRange
    const rangeMs = endDate.getTime() - startDate.getTime()

    const taskStart = task.start_date ? new Date(task.start_date) : new Date()
    const taskEnd = task.deadline ? new Date(task.deadline) : new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    const startOffset = Math.max(0, (taskStart.getTime() - startDate.getTime()) / rangeMs * 100)
    const width = Math.min(100 - startOffset, Math.max(5, (taskEnd.getTime() - taskStart.getTime()) / rangeMs * 100))

    return { left: `${startOffset}%`, width: `${width}%` }
  }, [ganttDateRange])

  // Handle drag and drop for task scheduling
  const handleTaskDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId)
  }, [])

  const handleTaskDragEnd = useCallback(async (taskId: string, newStartDate: Date) => {
    const task = tasksData?.data?.find((t: Task) => t.id === taskId)
    if (!task) return

    const duration = task.deadline && task.start_date
      ? new Date(task.deadline).getTime() - new Date(task.start_date).getTime()
      : 7 * 24 * 60 * 60 * 1000 // Default 7 days

    const newEndDate = new Date(newStartDate.getTime() + duration)

    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        updates: {
          start_date: newStartDate.toISOString().split('T')[0],
          deadline: newEndDate.toISOString().split('T')[0]
        }
      })
      toast.success('Task rescheduled successfully')
    } catch (error) {
      toast.error('Failed to reschedule task')
    }

    setDraggedTask(null)
  }, [tasksData, updateTaskMutation])

  // Generate Gantt chart header dates
  const ganttHeaderDates = useMemo(() => {
    const { startDate, daysInRange } = ganttDateRange
    const dates: Date[] = []

    for (let i = 0; i < daysInRange; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }

    return dates
  }, [ganttDateRange])

  // Sprints integration - real Supabase data
  const { sprints: dbSprints, isLoading: sprintsLoading, refetch: refetchSprints } = useSprints()
  const { createSprint, updateSprint, completeSprint, isCreatingSprint, isCompletingSprint } = useSprintMutations()

  // Milestones integration - real Supabase data
  const { milestones: dbMilestones, isLoading: milestonesLoading, refetch: refetchMilestones } = useMilestones()
  const { createMilestone, updateMilestone, isCreating: isCreatingMilestone } = useMilestoneMutations()

  // Roadmap integration - real Supabase data
  const { data: roadmapInitiatives, isLoading: roadmapLoading, refetch: refetchRoadmap } = useRoadmapInitiatives()

  // Automations integration - real Supabase data
  const { workflows: dbAutomations, loading: automationsLoading, createWorkflow, updateWorkflow, refetch: refetchAutomations } = useAutomations()

  // Time tracking integration
  const { timeEntries, loading: timeTrackingLoading, createEntry: createTimeEntry, updateEntry: updateTimeEntry } = useTimeTracking()

  // New project form state
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    description: '',
    budget: 0,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    start_date: '',
    end_date: ''
  })

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Combine database projects with mock data for display (fallback to mock if DB is empty)
  const allProjects = useMemo(() => {
    if (dbProjects.length > 0) {
      // Map DB projects to component format
      return dbProjects.map(p => ({
        id: p.id,
        name: p.name || 'Untitled',
        description: p.description || '',
        projectCode: p.project_code || `PRJ-${p.id.substring(0, 4).toUpperCase()}`,
        status: (p.status as ProjectStatus) || 'planning',
        priority: (p.priority as Priority) || 'medium',
        progress: p.progress || 0,
        budget: p.budget || 0,
        spent: p.spent || 0,
        startDate: p.start_date,
        endDate: p.end_date,
        teamMembers: p.team_members || [],
        tags: p.tags || [],
        tasksTotal: 0,
        tasksCompleted: 0
      })) as Project[]
    }
    return [] // Return empty array instead of mock data - real projects from Supabase
  }, [dbProjects])

  // Map database sprints to component format
  const allSprints: Sprint[] = useMemo(() => {
    if (dbSprints && dbSprints.length > 0) {
      return dbSprints.map(s => ({
        id: s.id,
        name: s.name || 'Untitled Sprint',
        goal: s.goal || '',
        status: (s.status === 'planning' ? 'upcoming' : s.status === 'active' ? 'active' : 'completed') as SprintStatus,
        startDate: s.start_date || '',
        endDate: s.end_date || '',
        velocity: s.velocity || 0,
        tasksTotal: s.total_tasks || 0,
        tasksCompleted: s.completed_tasks || 0
      }))
    }
    return []
  }, [dbSprints])

  // Map database milestones to roadmap format
  const allRoadmapItems: RoadmapItem[] = useMemo(() => {
    if (dbMilestones && dbMilestones.length > 0) {
      return dbMilestones.map(m => ({
        id: m.id,
        title: m.name || 'Untitled Milestone',
        quarter: m.due_date ? `Q${Math.ceil((new Date(m.due_date).getMonth() + 1) / 3)} ${new Date(m.due_date).getFullYear()}` : 'TBD',
        status: (m.status === 'in-progress' ? 'in_progress' : m.status === 'completed' ? 'completed' : 'planned') as 'planned' | 'in_progress' | 'completed',
        progress: m.progress || 0,
        projectIds: []
      }))
    }
    return []
  }, [dbMilestones])

  // Map roadmap initiatives from real database
  const allInitiatives = useMemo(() => {
    if (roadmapInitiatives && Array.isArray(roadmapInitiatives) && roadmapInitiatives.length > 0) {
      return roadmapInitiatives.map(i => ({
        id: i.id,
        title: i.title,
        quarter: i.quarter || 'TBD',
        status: i.status,
        progress: i.progress_percentage || 0,
        projectIds: []
      }))
    }
    return []
  }, [roadmapInitiatives])

  // Combined roadmap - use milestones if no initiatives
  const combinedRoadmap = useMemo(() => {
    return allInitiatives.length > 0 ? allInitiatives : allRoadmapItems
  }, [allInitiatives, allRoadmapItems])

  // Map database automations to component format
  const allAutomations: Automation[] = useMemo(() => {
    if (dbAutomations && dbAutomations.length > 0) {
      return dbAutomations.map(a => ({
        id: a.id,
        name: a.workflow_name || 'Untitled Automation',
        trigger: a.trigger_type || 'manual',
        action: a.steps?.[0]?.action || 'notify',
        enabled: a.is_enabled || false,
        runsCount: a.total_executions || 0
      }))
    }
    return []
  }, [dbAutomations])

  // Handle creating a new project - writes to Supabase
  const handleSubmitNewProject = async () => {
    if (!newProjectForm.title) {
      toast.error('Please enter a project name')
      return
    }
    try {
      await createProject({
        name: newProjectForm.title,
        description: newProjectForm.description,
        budget: newProjectForm.budget,
        start_date: newProjectForm.start_date || null,
        end_date: newProjectForm.end_date || null,
        progress: 0,
        spent: 0,
        status: 'planning',
        priority: newProjectForm.priority
      })
      toast.success('Project created successfully!')
      setShowNewProjectDialog(false)
      setNewProjectForm({ title: '', description: '', budget: 0, priority: 'medium', start_date: '', end_date: '' })
    } catch (error) {
      toast.error('Failed to create project')
      console.error('Failed to create project:', error)
    }
  }

  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter || project.priority === selectedFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, selectedFilter, allProjects])

  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {}
    statusColumns.forEach(col => {
      grouped[col.id] = filteredProjects.filter(p => p.status === col.id)
    })
    return grouped
  }, [filteredProjects])

  const stats = useMemo(() => {
    const projects = allProjects || []
    const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0)
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onTrack: projects.filter(p => p.progress >= 50 && p.status !== 'on_hold').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
      avgProgress: projects.length > 0 ? Math.round(totalProgress / projects.length) : 0,
      overdue: projects.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.status !== 'completed').length
    }
  }, [allProjects])

  const statsCards = [
    { label: 'Total Projects', value: stats.total.toString(), icon: FolderOpen, color: 'from-blue-500 to-blue-600', trend: '+2' },
    { label: 'Active', value: stats.active.toString(), icon: Play, color: 'from-green-500 to-green-600', trend: '' },
    { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', trend: '+1' },
    { label: 'On Track', value: stats.onTrack.toString(), icon: Target, color: 'from-purple-500 to-purple-600', trend: '' },
    { label: 'Total Budget', value: `$${(stats.totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-amber-500 to-amber-600', trend: '' },
    { label: 'Spent', value: `$${(stats.totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'from-orange-500 to-orange-600', trend: '' },
    { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: BarChart3, color: 'from-indigo-500 to-indigo-600', trend: '+5%' },
    { label: 'Overdue', value: stats.overdue.toString(), icon: AlertTriangle, color: 'from-red-500 to-red-600', trend: '' }
  ]

  const getStatusColor = (status: string): string => statusColumns.find(c => c.id === status)?.color || 'bg-gray-500'
  const getPriorityConfig = (priority: Priority) => priorityConfig[priority] || priorityConfig.medium

  const getSprintStatusColor = (status: SprintStatus): string => {
    const colors: Record<SprintStatus, string> = { upcoming: 'bg-gray-100 text-gray-700', active: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' }
    return colors[status] || 'bg-gray-100'
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = { feature: 'bg-purple-100 text-purple-700', bug: 'bg-red-100 text-red-700', improvement: 'bg-blue-100 text-blue-700', task: 'bg-gray-100 text-gray-700' }
    return colors[type] || 'bg-gray-100'
  }

  // Real handlers that work with Supabase
  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      toast.success('Project deleted successfully')
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const handleUpdateProjectStatus = async (projectId: string, status: ProjectStatus) => {
    try {
      await updateProject(projectId, { status: status as any })
      toast.success('Project status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleExportProjects = () => {
    try {
      const csv = allProjects.map(p =>
        `${p.name},${p.status},${p.priority},${p.progress}%,$${p.budget},$${p.spent}`
      ).join('\n')
      const blob = new Blob([`Name,Status,Priority,Progress,Budget,Spent\n${csv}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'projects-export.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Projects exported to CSV')
    } catch (error) {
      toast.error('Failed to export projects')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><Briefcase className="h-6 w-6 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects Hub</h1><p className="text-gray-500 dark:text-gray-400">GitHub Projects level management</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search projects..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Button variant="outline" onClick={() => setShowFilterDialog(true)}><Filter className="h-4 w-4 mr-2" />Filter</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => setShowNewProjectDialog(true)}><Plus className="h-4 w-4 mr-2" />New Project</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}><stat.icon className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="flex items-center gap-1"><p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>{stat.trend && <span className="text-xs text-green-600">{stat.trend}</span>}</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="projects" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><LayoutGrid className="h-4 w-4 mr-2" />Projects</TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Milestone className="h-4 w-4 mr-2" />Roadmap</TabsTrigger>
            <TabsTrigger value="sprints" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><RefreshCw className="h-4 w-4 mr-2" />Sprints</TabsTrigger>
            <TabsTrigger value="backlog" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Layers className="h-4 w-4 mr-2" />Backlog</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><BarChart3 className="h-4 w-4 mr-2" />Insights</TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Workflow className="h-4 w-4 mr-2" />Automations</TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6 space-y-4">
            {/* Projects Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Projects Hub</h2>
                  <p className="text-violet-100">Monday.com-level project management</p>
                  <p className="text-violet-200 text-xs mt-1">Board • Timeline • Automations • Insights</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{allProjects.length}</p>
                    <p className="text-violet-200 text-sm">Projects</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewType === 'board' ? 'default' : 'outline'} size="sm" onClick={() => setViewType('board')}><LayoutGrid className="h-4 w-4 mr-1" />Board</Button>
              <Button variant={viewType === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewType('list')}><List className="h-4 w-4 mr-1" />List</Button>
              <Button variant={viewType === 'timeline' ? 'default' : 'outline'} size="sm" onClick={() => setViewType('timeline')}><GanttChartSquare className="h-4 w-4 mr-1" />Timeline</Button>
            </div>

            {viewType === 'board' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 overflow-x-auto pb-4">
                {projectsLoading && (
                  <div className="col-span-5 flex items-center justify-center py-12">
                    <div className="flex items-center gap-2 text-gray-500">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Loading projects...</span>
                    </div>
                  </div>
                )}
                {!projectsLoading && allProjects.length === 0 && (
                  <div className="col-span-5 flex flex-col items-center justify-center py-12 text-gray-500">
                    <FolderOpen className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No projects yet</p>
                    <p className="text-sm mb-4">Create your first project to get started</p>
                    <Button onClick={() => setShowNewProjectDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <Plus className="h-4 w-4 mr-2" />Create Project
                    </Button>
                  </div>
                )}
                {!projectsLoading && allProjects.length > 0 && statusColumns.map(column => (
                  <div key={column.id} className="min-w-[280px]">
                    <div className="flex items-center justify-between mb-3 px-2">
                      <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${column.color}`} /><h3 className="font-semibold">{column.label}</h3><Badge variant="secondary" className="text-xs">{projectsByStatus[column.id]?.length || 0}</Badge></div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setShowNewProjectDialog(true) }}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-3">
                      {projectsByStatus[column.id]?.map(project => (
                        <Card key={project.id} className={`cursor-pointer hover:shadow-lg border-l-4 ${getStatusColor(project.status)}`} onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">{project.name}</h4>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(project.priority).color} mr-1`} />{getPriorityConfig(project.priority).label}</Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                                      <FolderOpen className="h-4 w-4 mr-2" />View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedProject(project); setEditProjectForm({ name: project.name, description: project.description || '', budget: project.budget || 0, priority: project.priority, status: project.status }); setShowEditProjectDialog(true) }}>
                                      <Edit className="h-4 w-4 mr-2" />Edit Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedProject(project); setShowTeamMemberDialog(true) }}>
                                      <Users className="h-4 w-4 mr-2" />Add Team Member
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                    {statusColumns.filter(col => col.id !== project.status).map(col => (
                                      <DropdownMenuItem key={col.id} onClick={() => {
                                        toast.promise(
                                          handleUpdateProjectStatus(project.id, col.id as ProjectStatus),
                                          {
                                            loading: 'Updating status...',
                                            success: `Status changed to ${col.label}`,
                                            error: 'Failed to update status'
                                          }
                                        )
                                      }}>
                                        <span className={`w-2 h-2 rounded-full ${col.color} mr-2`} />{col.label}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleExportProjects()}>
                                      <Download className="h-4 w-4 mr-2" />Export
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedProject(project); setShowDeleteProjectDialog(true) }}>
                                      <Trash2 className="h-4 w-4 mr-2" />Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs mb-2"><span className="text-gray-500">{project.projectCode}</span><span>{project.tasksCompleted}/{project.tasksTotal} tasks</span></div>
                            <Progress value={project.progress} className="h-1.5 mb-2" />
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-1">{project.teamMembers.slice(0, 3).map((m, i) => <Avatar key={i} className="h-5 w-5 border-2 border-white"><AvatarFallback className="text-[8px]">{m.slice(0, 2)}</AvatarFallback></Avatar>)}</div>
                              {project.endDate && <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewType === 'list' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  {/* Bulk Actions Toolbar */}
                  {selectedProjectRows.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">{selectedProjectRows.length} selected</span>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" onClick={handleBulkExport}>
                        <Download className="h-4 w-4 mr-2" />Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                        <Archive className="h-4 w-4 mr-2" />Archive
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />Delete
                      </Button>
                    </div>
                  )}

                  <DataTable
                    columns={projectColumns}
                    data={filteredProjects}
                    isLoading={projectsLoading || apiProjectsLoading}
                    isError={!!apiProjectsError}
                    errorMessage={apiProjectsError?.message}
                    onRetry={() => refetchApiProjects()}
                    enableRowSelection={true}
                    onRowSelectionChange={setSelectedProjectRows}
                    enableSorting={true}
                    enableFiltering={true}
                    enableGlobalFilter={true}
                    searchPlaceholder="Search projects..."
                    filterConfigs={projectFilterConfigs}
                    enablePagination={true}
                    defaultPageSize={10}
                    pageSizeOptions={[10, 20, 50, 100]}
                    enableColumnVisibility={true}
                    showExport={true}
                    showRefresh={true}
                    showAdd={true}
                    addButtonLabel="New Project"
                    onAdd={() => setShowNewProjectDialog(true)}
                    onRefresh={() => { fetchProjects(); refetchApiProjects() }}
                    onRowView={(project) => { setSelectedProject(project); setShowProjectDialog(true) }}
                    onRowEdit={(project) => {
                      setSelectedProject(project)
                      setEditProjectForm({
                        name: project.name,
                        description: project.description || '',
                        budget: project.budget || 0,
                        priority: project.priority,
                        status: project.status
                      })
                      setShowEditProjectDialog(true)
                    }}
                    onRowDelete={(project) => {
                      setSelectedProject(project)
                      setShowDeleteProjectDialog(true)
                    }}
                    onRowClick={(project) => { setSelectedProject(project); setShowProjectDialog(true) }}
                    emptyState={{
                      title: "No projects found",
                      description: "Get started by creating your first project.",
                      action: {
                        label: "Create Project",
                        onClick: () => setShowNewProjectDialog(true)
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {viewType === 'timeline' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GanttChartSquare className="h-5 w-5" />Gantt Chart - Project Timeline
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={ganttTimeRange} onValueChange={(v) => setGanttTimeRange(v as 'week' | 'month' | 'quarter')}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => refetchTasks()}>
                      <RefreshCw className="h-4 w-4 mr-2" />Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Gantt Chart Header - Date Range */}
                  <div className="mb-4 overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Date headers */}
                      <div className="flex border-b pb-2 mb-2">
                        <div className="w-48 flex-shrink-0 font-medium text-sm">Project / Task</div>
                        <div className="flex-1 flex">
                          {ganttTimeRange === 'week' && ganttHeaderDates.map((date, i) => (
                            <div key={i} className="flex-1 text-center text-xs text-gray-500">
                              {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                            </div>
                          ))}
                          {ganttTimeRange === 'month' && (
                            <>
                              <div className="w-1/4 text-center text-xs text-gray-500">Week 1</div>
                              <div className="w-1/4 text-center text-xs text-gray-500">Week 2</div>
                              <div className="w-1/4 text-center text-xs text-gray-500">Week 3</div>
                              <div className="w-1/4 text-center text-xs text-gray-500">Week 4</div>
                            </>
                          )}
                          {ganttTimeRange === 'quarter' && (
                            <>
                              <div className="w-1/3 text-center text-xs text-gray-500">Month 1</div>
                              <div className="w-1/3 text-center text-xs text-gray-500">Month 2</div>
                              <div className="w-1/3 text-center text-xs text-gray-500">Month 3</div>
                            </>
                          )}
                        </div>
                        <div className="w-24 text-right text-xs text-gray-500">Due Date</div>
                      </div>

                      {/* Projects and their tasks */}
                      <div className="space-y-1">
                        {filteredProjects.map(project => {
                          const projectTasks = tasksData?.data?.filter((t: Task) => t.project_id === project.id) || []
                          const projectPosition = getTaskGanttPosition({
                            start_date: project.startDate,
                            deadline: project.endDate
                          })

                          return (
                            <div key={project.id} className="group">
                              {/* Project row */}
                              <div
                                className="flex items-center gap-4 py-2 hover:bg-muted/50 rounded cursor-pointer"
                                onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}
                              >
                                <div className="w-48 flex-shrink-0 flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                                  <span className="text-sm font-medium truncate">{project.name}</span>
                                </div>
                                <div className="flex-1 relative h-6 bg-muted/30 rounded">
                                  <div
                                    className={`absolute h-full rounded ${getStatusColor(project.status)} opacity-70 transition-all`}
                                    style={projectPosition}
                                  >
                                    <div className="px-2 text-xs text-white truncate leading-6">
                                      {project.progress}%
                                    </div>
                                  </div>
                                </div>
                                <div className="w-24 text-right text-xs text-gray-500">
                                  {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                </div>
                              </div>

                              {/* Task rows for this project (draggable) */}
                              {projectTasks.slice(0, 5).map((task: Task) => {
                                const taskPosition = getTaskGanttPosition(task)
                                return (
                                  <div
                                    key={task.id}
                                    className="flex items-center gap-4 py-1 pl-4 hover:bg-muted/30 rounded cursor-move"
                                    draggable
                                    onDragStart={() => handleTaskDragStart(task.id)}
                                    onDragEnd={(e) => {
                                      const container = e.currentTarget.parentElement?.querySelector('.relative.h-5') as HTMLElement
                                      if (container) {
                                        const rect = container.getBoundingClientRect()
                                        const relativeX = e.clientX - rect.left
                                        const percentage = relativeX / rect.width
                                        const { startDate, daysInRange } = ganttDateRange
                                        const newDate = new Date(startDate.getTime() + percentage * daysInRange * 24 * 60 * 60 * 1000)
                                        handleTaskDragEnd(task.id, newDate)
                                      }
                                    }}
                                  >
                                    <div className="w-44 flex-shrink-0 flex items-center gap-2 text-xs text-gray-600">
                                      <CheckSquare className="h-3 w-3" />
                                      <span className="truncate">{task.title}</span>
                                    </div>
                                    <div className="flex-1 relative h-5 bg-muted/20 rounded">
                                      <div
                                        className={`absolute h-full rounded transition-all ${draggedTask === task.id
                                            ? 'bg-blue-500 opacity-100 ring-2 ring-blue-300'
                                            : task.status === 'completed'
                                              ? 'bg-green-400 opacity-60'
                                              : task.status === 'in_progress'
                                                ? 'bg-blue-400 opacity-60'
                                                : 'bg-gray-400 opacity-60'
                                          }`}
                                        style={taskPosition}
                                      >
                                        <div className="px-1 text-[10px] text-white truncate leading-5">
                                          {task.title}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-24 text-right text-[10px] text-gray-400">
                                      {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                    </div>
                                  </div>
                                )
                              })}
                              {projectTasks.length > 5 && (
                                <div className="pl-4 text-xs text-gray-400">
                                  +{projectTasks.length - 5} more tasks
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Loading state */}
                      {(projectsLoading || tasksLoading) && (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          <span className="text-gray-500">Loading timeline...</span>
                        </div>
                      )}

                      {/* Empty state */}
                      {!projectsLoading && !tasksLoading && filteredProjects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <GanttChartSquare className="h-12 w-12 mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No projects to display</p>
                          <p className="text-sm">Create a project to see it in the timeline</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Roadmap</CardTitle><Button onClick={() => setShowMilestoneDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Milestone</Button></CardHeader>
              <CardContent className="space-y-6">
                {(milestonesLoading || roadmapLoading) && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-500">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Loading roadmap...</span>
                    </div>
                  </div>
                )}
                {!milestonesLoading && !roadmapLoading && combinedRoadmap.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Milestone className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No milestones yet</p>
                    <p className="text-sm mb-4">Add milestones to track your product roadmap</p>
                  </div>
                )}
                {!milestonesLoading && !roadmapLoading && combinedRoadmap.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div><h3 className="font-semibold text-lg">{item.title}</h3><p className="text-sm text-gray-500">{item.quarter}</p></div>
                      <Badge className={(item.status as string) === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{String(item.status).replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2"><span className="text-sm text-gray-500">{item.progress}% complete</span></div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex items-center gap-2 mt-3"><span className="text-xs text-gray-500">{item.projectIds?.length || 0} projects linked</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="mt-6">
            {sprintsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading sprints...</span>
                </div>
              </div>
            )}
            {!sprintsLoading && allSprints.length === 0 && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <RefreshCw className="h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No sprints yet</p>
                  <p className="text-sm mb-4">Create your first sprint to start tracking progress</p>
                  <Button onClick={() => {
                    toast.promise(
                      createSprint({
                        name: 'Sprint 1',
                        goal: 'Initial sprint goals',
                        status: 'planning',
                        total_tasks: 0,
                        completed_tasks: 0,
                        velocity: 0
                      }),
                      {
                        loading: 'Creating sprint...',
                        success: () => { refetchSprints(); return 'Sprint created!' },
                        error: 'Failed to create sprint'
                      }
                    )
                  }} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="h-4 w-4 mr-2" />Create Sprint
                  </Button>
                </CardContent>
              </Card>
            )}
            {!sprintsLoading && allSprints.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
                {allSprints.map(sprint => (
                  <Card key={sprint.id} className={`border-gray-200 dark:border-gray-700 ${sprint.status === 'active' ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between"><CardTitle className="text-lg">{sprint.name}</CardTitle><Badge className={getSprintStatusColor(sprint.status)}>{sprint.status}</Badge></div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">{sprint.goal}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm"><span>Tasks</span><span className="font-medium">{sprint.tasksCompleted}/{sprint.tasksTotal}</span></div>
                        <Progress value={sprint.tasksTotal > 0 ? (sprint.tasksCompleted / sprint.tasksTotal) * 100 : 0} className="h-2" />
                        <div className="flex justify-between text-sm"><span>Velocity</span><span className="font-medium">{sprint.velocity} pts</span></div>
                        <div className="text-xs text-gray-500">{sprint.startDate} - {sprint.endDate}</div>
                      </div>
                      {sprint.status === 'active' && <Button className="w-full mt-4" onClick={() => { setSelectedSprint(sprint); setShowSprintBoardDialog(true) }}><Play className="h-4 w-4 mr-2" />View Sprint Board</Button>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Backlog Tab */}
          <TabsContent value="backlog" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Backlog</CardTitle><Button onClick={() => setShowBacklogItemDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Item</Button></CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {localBacklogItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Layers className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No backlog items</p>
                    <p className="text-sm mb-4">Add items to your product backlog to start planning</p>
                  </div>
                )}
                {localBacklogItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><h4 className="font-medium">{item.title}</h4><Badge className={getTypeColor(item.type)}>{item.type}</Badge></div>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(item.priority as Priority).color} mr-1`} />{getPriorityConfig(item.priority as Priority).label}</Badge>
                    <Badge variant="secondary">{item.points} pts</Badge>
                    {item.assignee && <Avatar className="h-8 w-8"><AvatarFallback>{item.assignee.slice(0, 2)}</AvatarFallback></Avatar>}
                    {item.sprint && <Badge className="bg-blue-100 text-blue-700">Sprint {item.sprint}</Badge>}
                    <Button variant="ghost" size="icon" onClick={() => { setLocalBacklogItems(prev => prev.filter(i => i.id !== item.id)); toast.success('Item removed from backlog') }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-6 space-y-6">
            {/* Reports Section */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Reports & Analytics</CardTitle><Button variant="outline" onClick={() => setShowReportDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Report</Button></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[].map(report => (
                    <div key={report.id} className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {report.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          <span className="font-medium">{report.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{report.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{report.description}</p>
                      <p className="text-xs text-gray-400">Last generated: {new Date(report.lastGenerated).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Epics Progress */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Epics Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[].map(epic => (
                    <div key={epic.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epic.color }} />
                          <div><p className="font-medium">{epic.name}</p><p className="text-xs text-gray-500">{epic.key}</p></div>
                        </div>
                        <Badge className={epic.status === 'done' ? 'bg-green-100 text-green-700' : epic.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{epic.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{epic.summary}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{epic.issuesCompleted}/{epic.issuesCount} issues</span>
                        <span className="text-sm font-medium">{epic.progress}%</span>
                      </div>
                      <Progress value={epic.progress} className="h-2" />
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{epic.startDate} - {epic.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Project Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusColumns.map(col => {
                      const projects = allProjects || []
                      const count = projects.filter(p => p.status === col.id).length
                      const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0
                      return (
                        <div key={col.id}>
                          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${col.color}`} /><span className="text-sm">{col.label}</span></div><span className="text-sm font-medium">{count}</span></div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Budget Overview</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center mb-6"><p className="text-4xl font-bold">${(stats.totalSpent / 1000).toFixed(0)}K</p><p className="text-gray-500">of ${(stats.totalBudget / 1000).toFixed(0)}K spent</p></div>
                  <Progress value={(stats.totalSpent / stats.totalBudget) * 100} className="h-3 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"><p className="text-2xl font-bold text-green-600">${((stats.totalBudget - stats.totalSpent) / 1000).toFixed(0)}K</p><p className="text-xs text-gray-500">Remaining</p></div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><p className="text-2xl font-bold text-blue-600">{Math.round((stats.totalSpent / stats.totalBudget) * 100)}%</p><p className="text-xs text-gray-500">Utilized</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Stream */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[].map(activity => {
                      const ActivityIcon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ActivityIcon className="h-4 w-4 text-blue-600" /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.user}</span>
                              <Badge variant="outline" className="text-xs">{activity.issueKey}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Issue Breakdown */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Issues Overview</CardTitle></CardHeader>
              <CardContent>
                {localIssues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No issues tracked</p>
                    <p className="text-sm">Issues from sprints and backlog will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b"><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Summary</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th></tr></thead>
                      <tbody className="divide-y">
                        {localIssues.map(issue => (
                          <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedIssue(issue); setShowIssueDialog(true) }}>
                            <td className="px-4 py-3"><span className="text-blue-600 font-medium">{issue.key}</span></td>
                            <td className="px-4 py-3"><p className="font-medium">{issue.title}</p></td>
                            <td className="px-4 py-3"><Badge className={getIssueTypeColor(issue.type)}>{issue.type}</Badge></td>
                            <td className="px-4 py-3"><Badge className={getIssueStatusColor(issue.status)}>{issue.status.replace('_', ' ')}</Badge></td>
                            <td className="px-4 py-3"><Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(issue.priority).color} mr-1`} />{getPriorityConfig(issue.priority).label}</Badge></td>
                            <td className="px-4 py-3">{issue.assignee ? <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{issue.assignee.slice(0, 2)}</AvatarFallback></Avatar> : <span className="text-gray-400">Unassigned</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Workflow Automations</CardTitle><Button onClick={() => setShowAutomationDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Automation</Button></CardHeader>
              <CardContent className="space-y-4">
                {automationsLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-500">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Loading automations...</span>
                    </div>
                  </div>
                )}
                {!automationsLoading && allAutomations.length === 0 && localAutomations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Workflow className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No automations yet</p>
                    <p className="text-sm mb-4">Create workflow automations to streamline your processes</p>
                  </div>
                )}
                {!automationsLoading && [...allAutomations, ...localAutomations].map((auto, autoIdx) => (
                  <div key={auto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${auto.enabled ? 'bg-green-100' : 'bg-gray-100'}`}><Workflow className={`h-5 w-5 ${auto.enabled ? 'text-green-600' : 'text-gray-400'}`} /></div>
                    <div className="flex-1"><h4 className="font-medium">{auto.name}</h4><p className="text-sm text-gray-500">{auto.trigger} → {auto.action}</p></div>
                    <Badge variant="outline">{auto.runsCount} runs</Badge>
                    <Switch checked={auto.enabled} onCheckedChange={(checked) => {
                      if (allAutomations.find(a => a.id === auto.id)) {
                        // Update database automation
                        updateWorkflow?.({ id: auto.id, is_enabled: checked })
                        refetchAutomations()
                      } else {
                        // Update local automation
                        setLocalAutomations(prev => prev.map(a => a.id === auto.id ? { ...a, enabled: checked } : a))
                      }
                      toast.success(checked ? `Automation "${auto.name}" enabled` : `Automation "${auto.name}" disabled`)
                    }} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No project templates</p>
                <p className="text-sm mb-4 text-center">Project templates allow you to quickly create new projects with predefined structures</p>
                <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Create Template</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Project Settings</h2>
                <p className="text-sm text-gray-500">Configure your project management platform</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'integrations', icon: Link, label: 'Integrations' },
                        { id: 'custom_fields', icon: Tag, label: 'Custom Fields' },
                        { id: 'permissions', icon: Shield, label: 'Permissions' },
                        { id: 'workflow', icon: Workflow, label: 'Workflow' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${settingsTab === item.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
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
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="h-5 w-5" />
                          Display Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select defaultValue="board">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="board">Board View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="timeline">Timeline View</SelectItem>
                                <SelectItem value="calendar">Calendar View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Projects Per Page</Label>
                            <Select defaultValue="20">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 projects</SelectItem>
                                <SelectItem value="20">20 projects</SelectItem>
                                <SelectItem value="50">50 projects</SelectItem>
                                <SelectItem value="100">100 projects</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Progress Bars</div>
                            <div className="text-sm text-gray-500">Display progress bars on project cards</div>
                          </div>
                          <Switch checked={settingsState.showProgressBars} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, showProgressBars: checked })); toast.success(checked ? 'Progress bars enabled' : 'Progress bars disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Budget Information</div>
                            <div className="text-sm text-gray-500">Display budget and spending on project cards</div>
                          </div>
                          <Switch checked={settingsState.showBudgetInfo} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, showBudgetInfo: checked })); toast.success(checked ? 'Budget info enabled' : 'Budget info disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Compact Mode</div>
                            <div className="text-sm text-gray-500">Use a more compact layout for project lists</div>
                          </div>
                          <Switch checked={settingsState.compactMode} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, compactMode: checked })); toast.success(checked ? 'Compact mode enabled' : 'Compact mode disabled') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Project Defaults
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Project Key Prefix</Label>
                            <Input defaultValue="PRJ" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Sprint Length</Label>
                            <Select defaultValue="2">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Week</SelectItem>
                                <SelectItem value="2">2 Weeks</SelectItem>
                                <SelectItem value="3">3 Weeks</SelectItem>
                                <SelectItem value="4">4 Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Story Point Scale</Label>
                            <Select defaultValue="fibonacci">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fibonacci">Fibonacci (1,2,3,5,8,13)</SelectItem>
                                <SelectItem value="linear">Linear (1,2,3,4,5)</SelectItem>
                                <SelectItem value="tshirt">T-Shirt (XS,S,M,L,XL)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Issue Type</Label>
                            <Select defaultValue="story">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="story">Story</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="bug">Bug</SelectItem>
                                <SelectItem value="epic">Epic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Time Tracking</div>
                            <div className="text-sm text-gray-500">Track time spent on issues</div>
                          </div>
                          <Switch checked={settingsState.enableTimeTracking} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, enableTimeTracking: checked })); toast.success(checked ? 'Time tracking enabled' : 'Time tracking disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-generate Project Keys</div>
                            <div className="text-sm text-gray-500">Automatically generate project keys from names</div>
                          </div>
                          <Switch checked={settingsState.autoGenerateKeys} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, autoGenerateKeys: checked })); toast.success(checked ? 'Auto-generate keys enabled' : 'Auto-generate keys disabled') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Regional Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                                <SelectItem value="cet">Central European Time (CET)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="mdy">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Week Start Day</Label>
                            <Select defaultValue="monday">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunday">Sunday</SelectItem>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="jpy">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Issue Assigned to Me</div>
                            <div className="text-sm text-gray-500">When issues are assigned to you</div>
                          </div>
                          <Switch checked={settingsState.emailIssueAssigned} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, emailIssueAssigned: checked })); toast.success(checked ? 'Email notification enabled' : 'Email notification disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Issue Status Changed</div>
                            <div className="text-sm text-gray-500">When watching issue status changes</div>
                          </div>
                          <Switch checked={settingsState.emailStatusChanged} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, emailStatusChanged: checked })); toast.success(checked ? 'Email notification enabled' : 'Email notification disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Mentioned in Comments</div>
                            <div className="text-sm text-gray-500">When someone @mentions you</div>
                          </div>
                          <Switch checked={settingsState.emailMentioned} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, emailMentioned: checked })); toast.success(checked ? 'Email notification enabled' : 'Email notification disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Due Date Approaching</div>
                            <div className="text-sm text-gray-500">Issues due within 24 hours</div>
                          </div>
                          <Switch checked={settingsState.emailDueDateApproaching} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, emailDueDateApproaching: checked })); toast.success(checked ? 'Email notification enabled' : 'Email notification disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Daily Summary Email</div>
                            <div className="text-sm text-gray-500">Receive daily digest of activity</div>
                          </div>
                          <Switch checked={settingsState.emailDailySummary} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, emailDailySummary: checked })); toast.success(checked ? 'Daily summary enabled' : 'Daily summary disabled') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BellRing className="h-5 w-5" />
                          In-App Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Started/Ended</div>
                            <div className="text-sm text-gray-500">Sprint lifecycle notifications</div>
                          </div>
                          <Switch checked={settingsState.inAppSprintNotifications} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, inAppSprintNotifications: checked })); toast.success(checked ? 'Sprint notifications enabled' : 'Sprint notifications disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Comments</div>
                            <div className="text-sm text-gray-500">Comments on issues you're watching</div>
                          </div>
                          <Switch checked={settingsState.inAppNewComments} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, inAppNewComments: checked })); toast.success(checked ? 'Comment notifications enabled' : 'Comment notifications disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Automation Runs</div>
                            <div className="text-sm text-gray-500">When automations execute actions</div>
                          </div>
                          <Switch checked={settingsState.inAppAutomationRuns} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, inAppAutomationRuns: checked })); toast.success(checked ? 'Automation notifications enabled' : 'Automation notifications disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Integration Errors</div>
                            <div className="text-sm text-gray-500">When integrations fail to sync</div>
                          </div>
                          <Switch checked={settingsState.inAppIntegrationErrors} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, inAppIntegrationErrors: checked })); toast.success(checked ? 'Integration error notifications enabled' : 'Integration error notifications disabled') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Slack className="h-5 w-5" />
                          Slack Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Slack className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Slack Connected</div>
                              <div className="text-sm text-gray-500">#engineering channel</div>
                            </div>
                            <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowSlackConfigDialog(true)}>Configure Channel</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Post New Issues</div>
                            <div className="text-sm text-gray-500">Share new issues to Slack</div>
                          </div>
                          <Switch checked={settingsState.slackPostNewIssues} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, slackPostNewIssues: checked })); toast.success(checked ? 'Slack issue posting enabled' : 'Slack issue posting disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Updates</div>
                            <div className="text-sm text-gray-500">Post sprint start/end notifications</div>
                          </div>
                          <Switch checked={settingsState.slackSprintUpdates} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, slackSprintUpdates: checked })); toast.success(checked ? 'Slack sprint updates enabled' : 'Slack sprint updates disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Release Notifications</div>
                            <div className="text-sm text-gray-500">Announce new releases to Slack</div>
                          </div>
                          <Switch checked={settingsState.slackReleaseNotifications} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, slackReleaseNotifications: checked })); toast.success(checked ? 'Slack release notifications enabled' : 'Slack release notifications disabled') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border rounded-lg divide-y">
                          {localWebhooks.map((webhook, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{webhook.url}</code>
                                <div className="flex items-center gap-2 mt-2">
                                  {webhook.events.map(event => (
                                    <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">{webhook.status}</Badge>
                                <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this webhook?')) { setLocalWebhooks(prev => prev.filter((_, idx) => idx !== i)); toast.success('Webhook deleted') } }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowWebhookDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Link className="h-5 w-5" />
                            Connected Services
                          </CardTitle>
                          <Button size="sm" onClick={() => setShowIntegrationDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Integration
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[].map(integration => (
                          <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <div className="font-medium">{integration.name}</div>
                                <div className="text-sm text-gray-500">
                                  {integration.lastSync ? `Last sync: ${new Date(integration.lastSync).toLocaleString()}` : 'Never synced'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getIntegrationStatusColor(integration.status)}>{integration.status}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedIntegration(integration); setShowIntegrationDialog(true) }}>Configure</Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">API Token</div>
                            <Button variant="outline" size="sm" onClick={() => { setShowApiTokenDialog(true) }}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              prj_live_•••••••••••••••••••••••
                            </code>
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('prj_live_abc123xyz789'); toast.success('API token copied to clipboard') }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">24,567</div>
                            <div className="text-sm text-gray-500">API Calls (30 days)</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">89ms</div>
                            <div className="text-sm text-gray-500">Avg Response Time</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => window.open('https://docs.freeflowapi.com', '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Documentation
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Developer Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">REST API</div>
                            <div className="text-sm text-gray-500">Access projects via REST endpoints</div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">GraphQL API</div>
                            <div className="text-sm text-gray-500">Query projects with GraphQL</div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">CLI Tool</div>
                            <div className="text-sm text-gray-500">Command-line interface for automation</div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            toast.success('CLI tool download started')
                            window.open('/downloads/freeflow-cli', '_blank')
                          }}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Custom Fields Settings */}
                {settingsTab === 'custom_fields' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Custom Fields
                          </CardTitle>
                          <Button size="sm" onClick={() => { setSelectedCustomField(null); setShowCustomFieldDialog(true) }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {localCustomFields.map(field => (
                          <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Tag className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{field.name}</div>
                                <div className="text-sm text-gray-500">
                                  Type: {field.type} • Applies to: {field.appliesTo.join(', ')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {field.required && <Badge variant="outline">Required</Badge>}
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedCustomField(field); setCustomFieldForm({ name: field.name, type: field.type, required: field.required, appliesTo: field.appliesTo }); setShowCustomFieldDialog(true) }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Delete custom field "${field.name}"?`)) { setLocalCustomFields(prev => prev.filter(f => f.id !== field.id)); toast.success(`Custom field "${field.name}" deleted`) } }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          Field Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {[
                            { type: 'Text', description: 'Single or multi-line text', icon: FileText },
                            { type: 'Number', description: 'Numeric values', icon: Hash },
                            { type: 'Date', description: 'Date or datetime', icon: Calendar },
                            { type: 'Select', description: 'Single choice dropdown', icon: ChevronDown },
                            { type: 'Multi-select', description: 'Multiple choice', icon: CheckSquare },
                            { type: 'User', description: 'Team member picker', icon: Users },
                          ].map((item) => (
                            <div key={item.type} className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{item.type}</span>
                              </div>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Project Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Default Project Visibility</div>
                            <div className="text-sm text-gray-500">Visibility for new projects</div>
                          </div>
                          <Select defaultValue="team">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="team">Team Only</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Allow External Collaborators</div>
                            <div className="text-sm text-gray-500">Invite users outside organization</div>
                          </div>
                          <Switch checked={settingsState.allowExternalCollaborators} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, allowExternalCollaborators: checked })); toast.success(checked ? 'External collaborators allowed' : 'External collaborators restricted') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Admin Approval</div>
                            <div className="text-sm text-gray-500">For creating new projects</div>
                          </div>
                          <Switch checked={settingsState.requireAdminApproval} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, requireAdminApproval: checked })); toast.success(checked ? 'Admin approval required' : 'Admin approval not required') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Role Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Allow Issue Deletion</div>
                            <div className="text-sm text-gray-500">Who can delete issues</div>
                          </div>
                          <Select defaultValue="admin">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admins Only</SelectItem>
                              <SelectItem value="lead">Project Leads</SelectItem>
                              <SelectItem value="all">All Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Export Restrictions</div>
                            <div className="text-sm text-gray-500">Who can export project data</div>
                          </div>
                          <Select defaultValue="lead">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admins Only</SelectItem>
                              <SelectItem value="lead">Project Leads</SelectItem>
                              <SelectItem value="all">All Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Management</div>
                            <div className="text-sm text-gray-500">Who can start/complete sprints</div>
                          </div>
                          <Select defaultValue="lead">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admins Only</SelectItem>
                              <SelectItem value="lead">Project Leads</SelectItem>
                              <SelectItem value="all">All Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Archive All Projects</div>
                            <div className="text-sm text-gray-500">Move all projects to archive</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowArchiveDialog(true)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Delete All Data</div>
                            <div className="text-sm text-gray-500">Permanently delete all projects and issues</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteAllDialog(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Workflow Settings */}
                {settingsTab === 'workflow' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Columns className="h-5 w-5" />
                          Issue Status Workflow
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 overflow-x-auto py-4">
                          {['Open', 'In Progress', 'In Review', 'Done'].map((status, i) => (
                            <div key={status} className="flex items-center">
                              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium whitespace-nowrap">
                                {status}
                              </div>
                              {i < 3 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" onClick={() => setShowWorkflowStatusDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Status
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="h-5 w-5" />
                          Transition Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Comment on Block</div>
                            <div className="text-sm text-gray-500">Force comment when moving to Blocked</div>
                          </div>
                          <Switch checked={settingsState.requireCommentOnBlock} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, requireCommentOnBlock: checked })); toast.success(checked ? 'Comment required on block' : 'Comment not required on block') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-assign on In Progress</div>
                            <div className="text-sm text-gray-500">Assign to current user when starting work</div>
                          </div>
                          <Switch checked={settingsState.autoAssignOnProgress} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, autoAssignOnProgress: checked })); toast.success(checked ? 'Auto-assign enabled' : 'Auto-assign disabled') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Reviewer for Review</div>
                            <div className="text-sm text-gray-500">Must have reviewer before moving to Review</div>
                          </div>
                          <Switch checked={settingsState.requireReviewerForReview} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, requireReviewerForReview: checked })); toast.success(checked ? 'Reviewer required' : 'Reviewer not required') }} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Prevent Reopening Done Issues</div>
                            <div className="text-sm text-gray-500">Require admin approval to reopen</div>
                          </div>
                          <Switch checked={settingsState.preventReopeningDone} onCheckedChange={(checked) => { setSettingsState(s => ({ ...s, preventReopeningDone: checked })); toast.success(checked ? 'Reopening restricted' : 'Reopening allowed') }} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Automation Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {localAutomations.map((auto, autoIdx) => (
                          <div key={auto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className={`p-2 rounded-lg ${auto.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <Workflow className={`h-5 w-5 ${auto.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{auto.name}</h4>
                              <p className="text-sm text-gray-500">{auto.trigger} → {auto.action}</p>
                            </div>
                            <Badge variant="outline">{auto.runsCount} runs</Badge>
                            <Switch checked={auto.enabled} onCheckedChange={(checked) => { setLocalAutomations(prev => prev.map((a, idx) => idx === autoIdx ? { ...a, enabled: checked } : a)); toast.success(checked ? `Automation "${auto.name}" enabled` : `Automation "${auto.name}" disabled`) }} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAutomationDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Automation Rule
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{allProjects.length}</div>
                            <div className="text-sm text-gray-500">Projects</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{[].length}</div>
                            <div className="text-sm text-gray-500">Issues</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">12.4 MB</div>
                            <div className="text-sm text-gray-500">Storage Used</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setShowExportDialog(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowImportDialog(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                          </Button>
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
          {/* AI Insights Panel */}
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[] as any}
              onInsightAction={(insight: any) => {
                toast.promise(
                  fetch('/api/projects/insights/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ insightId: insight.id, action: insight.action })
                  }).then(res => {
                    if (!res.ok) throw new Error('Failed to apply insight')
                    return res.json()
                  }),
                  {
                    loading: `Processing insight: ${insight.title || 'AI recommendation'}...`,
                    success: `Insight action completed: ${insight.title || 'Applied AI recommendation'}`,
                    error: 'Failed to apply insight'
                  }
                )
              }}
            />
          </div>

          {/* Team Collaboration & Activity */}
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[].map(c => ({ ...c, color: c.color || '#6366f1' })) as any}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[] as any}
            />
          </div>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[] as any}
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[] as any}
          />
        </div>

        {/* Project Detail Dialog */}
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="max-w-3xl">
            {selectedProject && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${getStatusColor(selectedProject.status)}`}><Briefcase className="h-5 w-5 text-white" /></div><div><DialogTitle className="text-xl">{selectedProject.name}</DialogTitle><p className="text-sm text-gray-500">{selectedProject.projectCode}</p></div></div>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Status</p><Badge className={getStatusColor(selectedProject.status)}>{statusColumns.find(c => c.id === selectedProject.status)?.label}</Badge></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Priority</p><Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(selectedProject.priority).color} mr-1`} />{getPriorityConfig(selectedProject.priority).label}</Badge></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Budget</p><p className="text-xl font-bold">${selectedProject.budget?.toLocaleString() || 0}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Progress</p><div className="flex items-center gap-2"><p className="text-xl font-bold">{selectedProject.progress}%</p><Progress value={selectedProject.progress} className="flex-1 h-2" /></div></CardContent></Card>
                  </div>
                  {selectedProject.description && <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-2">Description</p><p>{selectedProject.description}</p></CardContent></Card>}
                  <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-2">Team Members</p><div className="flex gap-2">{selectedProject.teamMembers.map((m, i) => <Avatar key={i}><AvatarFallback>{m.slice(0, 2)}</AvatarFallback></Avatar>)}</div></CardContent></Card>
                </div>
                <DialogFooter className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteProjectDialog(true)}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                    <Button variant="outline" onClick={() => setShowTeamMemberDialog(true)}><Users className="h-4 w-4 mr-2" />Add Member</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowProjectDialog(false)}>Close</Button>
                    <Button onClick={() => { setEditProjectForm({ name: selectedProject.name, description: selectedProject.description || '', budget: selectedProject.budget || 0, priority: selectedProject.priority, status: selectedProject.status }); setShowEditProjectDialog(true) }}><Edit className="h-4 w-4 mr-2" />Edit Project</Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create New Project</DialogTitle><DialogDescription>Set up a new project with details</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Project Name</Label><Input placeholder="Enter project name" className="mt-1" value={newProjectForm.title} onChange={(e) => setNewProjectForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea placeholder="Describe the project..." className="mt-1" value={newProjectForm.description} onChange={(e) => setNewProjectForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Budget</Label><Input type="number" placeholder="0" className="mt-1" value={newProjectForm.budget} onChange={(e) => setNewProjectForm(f => ({ ...f, budget: parseFloat(e.target.value) || 0 }))} /></div><div><Label>Priority</Label><Select value={newProjectForm.priority} onValueChange={(v) => setNewProjectForm(f => ({ ...f, priority: v as any }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Start Date</Label><Input type="date" className="mt-1" value={newProjectForm.start_date} onChange={(e) => setNewProjectForm(f => ({ ...f, start_date: e.target.value }))} /></div><div><Label>Due Date</Label><Input type="date" className="mt-1" value={newProjectForm.end_date} onChange={(e) => setNewProjectForm(f => ({ ...f, end_date: e.target.value }))} /></div></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleSubmitNewProject} disabled={!newProjectForm.title}>Create Project</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Issue Detail Dialog */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedIssue && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <Badge className={getIssueTypeColor(selectedIssue.type)}>{selectedIssue.type}</Badge>
                    <DialogTitle className="text-xl">{selectedIssue.key}: {selectedIssue.title}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 mt-4">
                  {/* Main Content */}
                  <div className="col-span-2 space-y-6">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base">Description</CardTitle></CardHeader>
                      <CardContent><p className="text-gray-600 dark:text-gray-400">{selectedIssue.description}</p></CardContent>
                    </Card>

                    {/* Activity Section */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Activity</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedIssue.comments.length > 0 ? (
                            selectedIssue.comments.map(comment => (
                              <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Avatar className="h-8 w-8"><AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{comment.author}</span>
                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No comments yet</p>
                          )}
                          <div className="pt-4 border-t">
                            <Textarea placeholder="Add a comment..." className="mb-2" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                            <Button size="sm" onClick={() => {
                              if (commentText.trim() && selectedIssue) {
                                const newComment: Comment = {
                                  id: `comment-${Date.now()}`,
                                  author: 'Current User',
                                  content: commentText.trim(),
                                  createdAt: new Date().toISOString()
                                };
                                // Update the selectedIssue with the new comment
                                const updatedIssue = { ...selectedIssue, comments: [...selectedIssue.comments, newComment] };
                                setSelectedIssue(updatedIssue);
                                // Update local issues state
                                setLocalIssues(prev => prev.map(issue =>
                                  issue.id === selectedIssue.id ? updatedIssue : issue
                                ));
                                setCommentText('');
                                toast.success('Comment added successfully');
                              } else {
                                toast.error('Please enter a comment');
                              }
                            }}>Add Comment</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time Tracking */}
                    {(selectedIssue.timeEstimate || selectedIssue.timeSpent) && (
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Timer className="h-4 w-4" />Time Tracking</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">{selectedIssue.timeSpent || 0}h</p>
                              <p className="text-xs text-gray-500">Time Spent</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-2xl font-bold">{selectedIssue.timeEstimate || 0}h</p>
                              <p className="text-xs text-gray-500">Estimated</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">{Math.max((selectedIssue.timeEstimate || 0) - (selectedIssue.timeSpent || 0), 0)}h</p>
                              <p className="text-xs text-gray-500">Remaining</p>
                            </div>
                          </div>
                          {selectedIssue.timeEstimate && selectedIssue.timeSpent && (
                            <Progress value={(selectedIssue.timeSpent / selectedIssue.timeEstimate) * 100} className="h-2 mt-4" />
                          )}
                          <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowLogTimeDialog(true)}><Timer className="h-4 w-4 mr-2" />Log Time</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div><Label className="text-xs text-gray-500">Status</Label><div className="mt-1"><Badge className={getIssueStatusColor(selectedIssue.status)}>{selectedIssue.status.replace('_', ' ')}</Badge></div></div>
                        <div><Label className="text-xs text-gray-500">Priority</Label><div className="mt-1"><Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(selectedIssue.priority).color} mr-1`} />{getPriorityConfig(selectedIssue.priority).label}</Badge></div></div>
                        <div><Label className="text-xs text-gray-500">Assignee</Label><div className="mt-1 flex items-center gap-2">{selectedIssue.assignee ? <><Avatar className="h-6 w-6"><AvatarFallback>{selectedIssue.assignee.slice(0, 2)}</AvatarFallback></Avatar><span>{selectedIssue.assignee}</span></> : <span className="text-gray-400">Unassigned</span>}</div></div>
                        <div><Label className="text-xs text-gray-500">Reporter</Label><div className="mt-1 flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback>{selectedIssue.reporter.slice(0, 2)}</AvatarFallback></Avatar><span>{selectedIssue.reporter}</span></div></div>
                        {selectedIssue.storyPoints && <div><Label className="text-xs text-gray-500">Story Points</Label><div className="mt-1"><Badge variant="secondary">{selectedIssue.storyPoints} pts</Badge></div></div>}
                        {selectedIssue.dueDate && <div><Label className="text-xs text-gray-500">Due Date</Label><div className="mt-1 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>{new Date(selectedIssue.dueDate).toLocaleDateString()}</span></div></div>}
                        <div><Label className="text-xs text-gray-500">Labels</Label><div className="mt-1 flex flex-wrap gap-1">{selectedIssue.labels.map((label, i) => <Badge key={i} variant="outline" className="text-xs">{label}</Badge>)}</div></div>
                        <div><Label className="text-xs text-gray-500">Watchers</Label><div className="mt-1 flex -space-x-1">{selectedIssue.watchers.map((w, i) => <Avatar key={i} className="h-6 w-6 border-2 border-white"><AvatarFallback className="text-xs">{w.slice(0, 2)}</AvatarFallback></Avatar>)}</div></div>
                        <div><Label className="text-xs text-gray-500">Created</Label><p className="mt-1 text-sm">{new Date(selectedIssue.createdAt).toLocaleString()}</p></div>
                        <div><Label className="text-xs text-gray-500">Updated</Label><p className="mt-1 text-sm">{new Date(selectedIssue.updatedAt).toLocaleString()}</p></div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <Label className="text-xs text-gray-500">Attachments</Label>
                        <div className="mt-2 p-3 border-2 border-dashed rounded-lg text-center text-gray-500 text-sm">
                          {selectedIssue.attachments > 0 ? (
                            <p>{selectedIssue.attachments} file(s) attached</p>
                          ) : (
                            <p>No attachments</p>
                          )}
                          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAttachmentDialog(true)}><Plus className="h-4 w-4 mr-1" />Add Attachment</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <Label className="text-xs text-gray-500">Linked Issues</Label>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500" onClick={() => setShowLinkIssueDialog(true)}><Link className="h-4 w-4 mr-2" />Link an issue</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Close</Button>
                  <Button variant="outline" onClick={() => setShowEditIssueDialog(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={async () => {
                    toast.loading('Moving issue...', { id: 'move-issue' })
                    try {
                      const res = await fetch(`/api/projects/issues/${selectedIssue.id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'in_progress' })
                      })
                      if (!res.ok) throw new Error('Failed to move issue')
                      setLocalIssues(prev => prev.map(i => i.id === selectedIssue.id ? { ...i, status: 'in_progress' } : i))
                      toast.success(`Issue ${selectedIssue.key} moved to In Progress`, { id: 'move-issue' })
                      setShowIssueDialog(false)
                    } catch {
                      toast.error('Failed to move issue', { id: 'move-issue' })
                    }
                  }}><ArrowRight className="h-4 w-4 mr-2" />Move to In Progress</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Projects</DialogTitle>
              <DialogDescription>Filter projects by status, priority, or assignee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filterState.status} onValueChange={(v) => setFilterState(s => ({ ...s, status: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={filterState.priority} onValueChange={(v) => setFilterState(s => ({ ...s, priority: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setFilterState({ status: 'all', priority: 'all', assignee: 'all' }); setSelectedFilter('all') }}>Reset</Button>
              <Button onClick={() => { setSelectedFilter(filterState.status !== 'all' ? filterState.status : filterState.priority); setShowFilterDialog(false); toast.success('Filters applied') }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Milestone Dialog */}
        <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
              <DialogDescription>Create a new milestone for your product roadmap</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Milestone Title</Label>
                <Input placeholder="Enter milestone title" value={milestoneForm.title} onChange={(e) => setMilestoneForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select value={milestoneForm.quarter} onValueChange={(v) => setMilestoneForm(f => ({ ...f, quarter: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select quarter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                    <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                    <SelectItem value="Q3 2026">Q3 2026</SelectItem>
                    <SelectItem value="Q4 2026">Q4 2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={milestoneForm.status} onValueChange={(v) => setMilestoneForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Creating milestone...', { id: 'create-milestone' })
                try {
                  const res = await fetch('/api/projects/milestones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(milestoneForm)
                  })
                  if (!res.ok) throw new Error('Failed to create milestone')
                  const data = await res.json()
                  setLocalMilestones(prev => [...prev, { id: data.id || `M-${Date.now()}`, title: milestoneForm.title, quarter: milestoneForm.quarter, status: milestoneForm.status as 'planned' | 'in_progress' | 'completed', progress: 0, projectIds: [] }])
                  refetchMilestones()
                  toast.success(`Milestone "${milestoneForm.title}" created`, { id: 'create-milestone' })
                  setShowMilestoneDialog(false)
                  setMilestoneForm({ title: '', quarter: 'Q1 2026', status: 'planned' })
                } catch {
                  toast.error('Failed to create milestone', { id: 'create-milestone' })
                }
              }} disabled={!milestoneForm.title}>Create Milestone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sprint Board Dialog */}
        <Dialog open={showSprintBoardDialog} onOpenChange={setShowSprintBoardDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedSprint?.name || 'Sprint'} Board</DialogTitle>
              <DialogDescription>View and manage sprint tasks</DialogDescription>
            </DialogHeader>
            {selectedSprint && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="font-medium mb-2">Sprint Goal</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSprint.goal}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {['To Do', 'In Progress', 'In Review', 'Done'].map(status => (
                    <div key={status} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-sm mb-3">{status}</h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded border text-sm">Sample Task</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: {selectedSprint.tasksCompleted}/{selectedSprint.tasksTotal} tasks</span>
                  <span>Velocity: {selectedSprint.velocity} pts</span>
                </div>
                <Progress value={(selectedSprint.tasksCompleted / selectedSprint.tasksTotal) * 100} className="h-2" />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSprintBoardDialog(false)}>Close</Button>
              <Button onClick={async () => {
                if (!selectedSprint) return
                toast.loading('Completing sprint...', { id: 'complete-sprint' })
                try {
                  await completeSprint({ id: selectedSprint.id })
                  refetchSprints()
                  toast.success('Sprint completed', { id: 'complete-sprint', description: 'Tasks moved to next sprint' })
                  setShowSprintBoardDialog(false)
                } catch {
                  toast.error('Failed to complete sprint', { id: 'complete-sprint' })
                }
              }}>Complete Sprint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Backlog Item Dialog */}
        <Dialog open={showBacklogItemDialog} onOpenChange={setShowBacklogItemDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Backlog Item</DialogTitle>
              <DialogDescription>Create a new item for the product backlog</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Enter item title" value={backlogForm.title} onChange={(e) => setBacklogForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the item..." value={backlogForm.description} onChange={(e) => setBacklogForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={backlogForm.type} onValueChange={(v) => setBacklogForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={backlogForm.priority} onValueChange={(v) => setBacklogForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Story Points</Label>
                <Input type="number" placeholder="3" value={backlogForm.points} onChange={(e) => setBacklogForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBacklogItemDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Adding backlog item...', { id: 'add-backlog' })
                try {
                  const res = await fetch('/api/projects/backlog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backlogForm)
                  })
                  if (!res.ok) throw new Error('Failed to add backlog item')
                  const data = await res.json()
                  setLocalBacklogItems(prev => [...prev, { id: data.id || `BL-${Date.now()}`, title: backlogForm.title, description: backlogForm.description, type: backlogForm.type as BacklogItem['type'], priority: backlogForm.priority as Priority, points: backlogForm.points }])
                  toast.success(`Backlog item "${backlogForm.title}" created`, { id: 'add-backlog' })
                  setShowBacklogItemDialog(false)
                  setBacklogForm({ title: '', description: '', type: 'feature', priority: 'medium', points: 3 })
                } catch {
                  toast.error('Failed to add backlog item', { id: 'add-backlog' })
                }
              }} disabled={!backlogForm.title}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Report</DialogTitle>
              <DialogDescription>Generate a new project report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input placeholder="Enter report name" value={reportForm.name} onChange={(e) => setReportForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportForm.type} onValueChange={(v) => setReportForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="burndown">Burndown Chart</SelectItem>
                    <SelectItem value="velocity">Velocity Report</SelectItem>
                    <SelectItem value="cumulative_flow">Cumulative Flow</SelectItem>
                    <SelectItem value="sprint_report">Sprint Report</SelectItem>
                    <SelectItem value="version_report">Version Report</SelectItem>
                    <SelectItem value="epic_report">Epic Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the report..." value={reportForm.description} onChange={(e) => setReportForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Creating report...', { id: 'create-report' })
                try {
                  const res = await fetch('/api/projects/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reportForm)
                  })
                  if (!res.ok) throw new Error('Failed to create report')
                  const reportData = await res.json()
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${reportForm.name.replace(/\s+/g, '-').toLowerCase()}-report.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success(`Report "${reportForm.name}" created`, { id: 'create-report', description: 'Download started' })
                  setShowReportDialog(false)
                  setReportForm({ name: '', type: 'burndown', description: '' })
                } catch {
                  toast.error('Failed to create report', { id: 'create-report' })
                }
              }} disabled={!reportForm.name}>Create Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Automation Dialog */}
        <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
              <DialogDescription>Set up an automated workflow rule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Automation Name</Label>
                <Input placeholder="Enter automation name" value={automationForm.name} onChange={(e) => setAutomationForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select value={automationForm.trigger} onValueChange={(v) => setAutomationForm(f => ({ ...f, trigger: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select trigger" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issue_created">Issue Created</SelectItem>
                    <SelectItem value="issue_updated">Issue Updated</SelectItem>
                    <SelectItem value="status_changed">Status Changed</SelectItem>
                    <SelectItem value="sprint_started">Sprint Started</SelectItem>
                    <SelectItem value="sprint_completed">Sprint Completed</SelectItem>
                    <SelectItem value="due_date_approaching">Due Date Approaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={automationForm.action} onValueChange={(v) => setAutomationForm(f => ({ ...f, action: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_notification">Send Notification</SelectItem>
                    <SelectItem value="assign_user">Assign User</SelectItem>
                    <SelectItem value="change_status">Change Status</SelectItem>
                    <SelectItem value="add_label">Add Label</SelectItem>
                    <SelectItem value="post_slack">Post to Slack</SelectItem>
                    <SelectItem value="create_subtask">Create Subtask</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">Enable Automation</div>
                  <div className="text-sm text-gray-500">Run this automation when triggered</div>
                </div>
                <Switch checked={automationForm.enabled} onCheckedChange={(v) => setAutomationForm(f => ({ ...f, enabled: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Creating automation...', { id: 'create-automation' })
                try {
                  const res = await fetch('/api/projects/automations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(automationForm)
                  })
                  if (!res.ok) throw new Error('Failed to create automation')
                  const data = await res.json()
                  setLocalAutomations(prev => [...prev, { id: data.id || `AUTO-${Date.now()}`, name: automationForm.name, trigger: automationForm.trigger, action: automationForm.action, enabled: automationForm.enabled, runsCount: 0 }])
                  refetchAutomations()
                  toast.success(`Automation "${automationForm.name}" created`, { id: 'create-automation' })
                  setShowAutomationDialog(false)
                  setAutomationForm({ name: '', trigger: '', action: '', enabled: true })
                } catch {
                  toast.error('Failed to create automation', { id: 'create-automation' })
                }
              }} disabled={!automationForm.name || !automationForm.trigger || !automationForm.action}>Create Automation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use Template</DialogTitle>
              <DialogDescription>Create a new project from {selectedTemplate?.name || 'template'}</DialogDescription>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{selectedTemplate.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{selectedTemplate.tasksCount} tasks</span>
                    <span>Used {selectedTemplate.usageCount} times</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Project Name</Label>
                  <Input placeholder="Enter project name" />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Creating project from template...', { id: 'create-from-template' })
                try {
                  const res = await fetch('/api/projects/from-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: selectedTemplate?.id })
                  })
                  if (!res.ok) throw new Error('Failed to create project')
                  const data = await res.json()
                  fetchProjects() // Refetch projects from database
                  toast.success(`Project created from "${selectedTemplate?.name}" template`, { id: 'create-from-template' })
                  setShowTemplateDialog(false)
                } catch {
                  toast.error('Failed to create project', { id: 'create-from-template' })
                }
              }}>Create from Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Slack Config Dialog */}
        <Dialog open={showSlackConfigDialog} onOpenChange={setShowSlackConfigDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Slack Channel</DialogTitle>
              <DialogDescription>Choose which Slack channel to post notifications to</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Slack Channel</Label>
                <Select value={slackChannel} onValueChange={setSlackChannel}>
                  <SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#general">#general</SelectItem>
                    <SelectItem value="#engineering">#engineering</SelectItem>
                    <SelectItem value="#product">#product</SelectItem>
                    <SelectItem value="#design">#design</SelectItem>
                    <SelectItem value="#alerts">#alerts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Notifications will be posted to the selected channel when events occur.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSlackConfigDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving Slack configuration...', { id: 'save-slack' })
                try {
                  const res = await fetch('/api/integrations/slack/channel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ channel: slackChannel })
                  })
                  if (!res.ok) throw new Error('Failed to save configuration')
                  toast.success(`Slack channel updated to ${slackChannel}`, { id: 'save-slack' })
                  setShowSlackConfigDialog(false)
                } catch {
                  toast.error('Failed to save configuration', { id: 'save-slack' })
                }
              }}>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>Configure a new webhook endpoint</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input placeholder="https://your-webhook-endpoint.com" value={webhookForm.url} onChange={(e) => setWebhookForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="space-y-2">
                  {['issue.created', 'issue.updated', 'sprint.started', 'sprint.completed'].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <input type="checkbox" id={event} checked={webhookForm.events.includes(event)} onChange={(e) => setWebhookForm(f => ({ ...f, events: e.target.checked ? [...f.events, event] : f.events.filter(ev => ev !== event) }))} className="rounded" />
                      <label htmlFor={event} className="text-sm">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Adding webhook...', { id: 'add-webhook' })
                try {
                  const res = await fetch('/api/projects/webhooks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookForm)
                  })
                  if (!res.ok) throw new Error('Failed to add webhook')
                  const data = await res.json()
                  setWebhooks(prev => [...prev, { id: data.id || `WH-${Date.now()}`, ...webhookForm }])
                  toast.success('Webhook added successfully', { id: 'add-webhook' })
                  setShowWebhookDialog(false)
                  setWebhookForm({ url: '', events: ['issue.created'] })
                } catch {
                  toast.error('Failed to add webhook', { id: 'add-webhook' })
                }
              }} disabled={!webhookForm.url}>Add Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedIntegration ? `Configure ${selectedIntegration.name}` : 'Add Integration'}</DialogTitle>
              <DialogDescription>{selectedIntegration ? 'Update integration settings' : 'Connect a new service'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!selectedIntegration && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  {[
                    { name: 'GitHub', icon: 'GH' },
                    { name: 'GitLab', icon: 'GL' },
                    { name: 'Slack', icon: 'SL' },
                    { name: 'Confluence', icon: 'CF' },
                    { name: 'Bitbucket', icon: 'BB' },
                    { name: 'MS Teams', icon: 'MT' }
                  ].map(int => (
                    <div key={int.name} className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-sm">{int.icon}</div>
                        <span className="font-medium">{int.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedIntegration && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-2xl">{selectedIntegration.icon}</span>
                    <div>
                      <div className="font-medium">{selectedIntegration.name}</div>
                      <Badge className={getIntegrationStatusColor(selectedIntegration.status)}>{selectedIntegration.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sync Frequency</Label>
                    <Select defaultValue="15">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowIntegrationDialog(false); setSelectedIntegration(null) }}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading(selectedIntegration ? 'Saving settings...' : 'Connecting...', { id: 'integration-action' })
                try {
                  const res = await fetch(`/api/integrations/${selectedIntegration?.id || 'new'}`, {
                    method: selectedIntegration ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ integrationId: selectedIntegration?.id })
                  })
                  if (!res.ok) throw new Error('Action failed')
                  if (selectedIntegration) {
                    setIntegrations(prev => prev.map(i => i.id === selectedIntegration.id ? { ...i, connected: true } : i))
                  }
                  toast.success(selectedIntegration ? `${selectedIntegration.name} settings updated` : 'Integration connected', { id: 'integration-action' })
                  setShowIntegrationDialog(false)
                  setSelectedIntegration(null)
                } catch {
                  toast.error('Action failed', { id: 'integration-action' })
                }
              }}>{selectedIntegration ? 'Save Changes' : 'Connect'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Token Dialog */}
        <Dialog open={showApiTokenDialog} onOpenChange={setShowApiTokenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate API Token</DialogTitle>
              <DialogDescription>This will invalidate your current token</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-700 dark:text-yellow-500">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">Regenerating your API token will invalidate all existing integrations using the current token. You will need to update any services that use this token.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApiTokenDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Regenerating API token...', { id: 'regen-token' })
                try {
                  const res = await fetch('/api/projects/tokens/regenerate', { method: 'POST' })
                  if (!res.ok) throw new Error('Failed to regenerate token')
                  const data = await res.json()
                  const newToken = data.token || `pat_${Math.random().toString(36).substring(2, 30)}`
                  await navigator.clipboard.writeText(newToken)
                  toast.success('New API token generated', { id: 'regen-token', description: 'Copied to clipboard' })
                  setShowApiTokenDialog(false)
                } catch {
                  toast.error('Failed to regenerate token', { id: 'regen-token' })
                }
              }}>Regenerate Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Field Dialog */}
        <Dialog open={showCustomFieldDialog} onOpenChange={setShowCustomFieldDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCustomField ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
              <DialogDescription>Configure a custom field for your issues</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input placeholder="Enter field name" value={customFieldForm.name} onChange={(e) => setCustomFieldForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select value={customFieldForm.type} onValueChange={(v) => setCustomFieldForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="multiselect">Multi-select</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">Required Field</div>
                  <div className="text-sm text-gray-500">Make this field mandatory</div>
                </div>
                <Switch checked={customFieldForm.required} onCheckedChange={(v) => setCustomFieldForm(f => ({ ...f, required: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCustomFieldDialog(false); setSelectedCustomField(null) }}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading(selectedCustomField ? 'Updating field...' : 'Creating field...', { id: 'custom-field-action' })
                try {
                  const res = await fetch(`/api/projects/custom-fields${selectedCustomField ? `/${selectedCustomField.id}` : ''}`, {
                    method: selectedCustomField ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customFieldForm)
                  })
                  if (!res.ok) throw new Error('Action failed')
                  const data = await res.json()
                  if (selectedCustomField) {
                    setCustomFields(prev => prev.map(f => f.id === selectedCustomField.id ? { ...f, ...customFieldForm } : f))
                  } else {
                    setCustomFields(prev => [...prev, { id: data.id || `CF-${Date.now()}`, ...customFieldForm }])
                  }
                  toast.success(selectedCustomField ? `Field "${customFieldForm.name}" updated` : `Field "${customFieldForm.name}" created`, { id: 'custom-field-action' })
                  setShowCustomFieldDialog(false)
                  setSelectedCustomField(null)
                  setCustomFieldForm({ name: '', type: 'text', required: false, appliesTo: ['story'] })
                } catch {
                  toast.error('Action failed', { id: 'custom-field-action' })
                }
              }} disabled={!customFieldForm.name}>{selectedCustomField ? 'Save Changes' : 'Add Field'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive All Projects</DialogTitle>
              <DialogDescription>This action will archive all {allProjects.length} projects</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-700 dark:text-yellow-500">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">Archived projects will be moved to the archive and will no longer appear in the main project list. You can restore them later from the archive.</p>
              </div>
              <div className="space-y-2">
                <Label>Type "ARCHIVE" to confirm</Label>
                <Input placeholder="ARCHIVE" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Archiving projects...', { id: 'archive-all' })
                try {
                  const res = await fetch('/api/projects/archive-all', { method: 'POST' })
                  if (!res.ok) throw new Error('Archive failed')
                  const projectCount = projects.length
                  fetchProjects() // Refetch projects to reflect archived status
                  toast.success('All projects archived', { id: 'archive-all', description: `${projectCount} projects archived` })
                  setShowArchiveDialog(false)
                } catch {
                  toast.error('Failed to archive projects', { id: 'archive-all' })
                }
              }}>Archive All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Dialog */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Data</DialogTitle>
              <DialogDescription>This action is irreversible</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertOctagon className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700 dark:text-red-500">Danger</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-500">This will permanently delete all projects, issues, and related data. This action cannot be undone.</p>
              </div>
              <div className="space-y-2">
                <Label>Type "DELETE ALL" to confirm</Label>
                <Input placeholder="DELETE ALL" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Deleting all data...', { id: 'delete-all' })
                try {
                  const res = await fetch('/api/projects/delete-all', { method: 'DELETE' })
                  if (!res.ok) throw new Error('Delete failed')
                  // Refresh all data from database
                  fetchProjects()
                  refetchSprints()
                  refetchMilestones()
                  setLocalIssues([])
                  setLocalBacklogItems([])
                  toast.success('All data deleted', { id: 'delete-all' })
                  setShowDeleteAllDialog(false)
                } catch {
                  toast.error('Failed to delete data', { id: 'delete-all' })
                }
              }}>Delete All Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workflow Status Dialog */}
        <Dialog open={showWorkflowStatusDialog} onOpenChange={setShowWorkflowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Workflow Status</DialogTitle>
              <DialogDescription>Create a new status for issue workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status Name</Label>
                <Input placeholder="Enter status name" value={workflowStatusForm.name} onChange={(e) => setWorkflowStatusForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={workflowStatusForm.color} onValueChange={(v) => setWorkflowStatusForm(f => ({ ...f, color: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select color" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-gray-500">Gray</SelectItem>
                    <SelectItem value="bg-blue-500">Blue</SelectItem>
                    <SelectItem value="bg-green-500">Green</SelectItem>
                    <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                    <SelectItem value="bg-red-500">Red</SelectItem>
                    <SelectItem value="bg-purple-500">Purple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${workflowStatusForm.color}`} />
                <span className="text-sm">{workflowStatusForm.name || 'Preview'}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWorkflowStatusDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Adding status...', { id: 'add-status' })
                try {
                  const res = await fetch('/api/projects/workflow-statuses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workflowStatusForm)
                  })
                  if (!res.ok) throw new Error('Failed to add status')
                  const data = await res.json()
                  setWorkflowStatuses(prev => [...prev, { id: data.id || `ST-${Date.now()}`, ...workflowStatusForm }])
                  toast.success(`Status "${workflowStatusForm.name}" added`, { id: 'add-status' })
                  setShowWorkflowStatusDialog(false)
                  setWorkflowStatusForm({ name: '', color: 'bg-gray-500' })
                } catch {
                  toast.error('Failed to add status', { id: 'add-status' })
                }
              }} disabled={!workflowStatusForm.name}>Add Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export All Data</DialogTitle>
              <DialogDescription>Download your project data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="space-y-2">
                  {['Projects', 'Issues', 'Sprints', 'Comments', 'Attachments'].map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <input type="checkbox" id={item} defaultChecked className="rounded" />
                      <label htmlFor={item} className="text-sm">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={() => { handleExportProjects(); setShowExportDialog(false) }}><Download className="h-4 w-4 mr-2" />Export Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Data</DialogTitle>
              <DialogDescription>Upload data from a file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop your file here, or click to browse</p>
                <p className="text-sm text-gray-500">Supports CSV, JSON, XLSX</p>
                <Button variant="outline" className="mt-4" onClick={() => document.getElementById('import-file-input')?.click()}>Browse Files</Button>
                <input id="import-file-input" type="file" accept=".csv,.json,.xlsx" className="hidden" onChange={(e) => { if (e.target.files?.length) { toast.success(`File "${e.target.files[0].name}" selected`) } }} />
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">Imported data will be merged with existing projects. Duplicate entries will be skipped.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Importing data...', { id: 'import-data' })
                try {
                  const res = await fetch('/api/projects/import', { method: 'POST' })
                  if (!res.ok) throw new Error('Import failed')
                  toast.success('Data imported successfully', { id: 'import-data' })
                  setShowImportDialog(false)
                } catch {
                  toast.error('Import failed', { id: 'import-data' })
                }
              }}><Upload className="h-4 w-4 mr-2" />Import Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input placeholder="Enter project name" value={editProjectForm.name} onChange={(e) => setEditProjectForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the project..." value={editProjectForm.description} onChange={(e) => setEditProjectForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input type="number" placeholder="0" value={editProjectForm.budget} onChange={(e) => setEditProjectForm(f => ({ ...f, budget: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={editProjectForm.priority} onValueChange={(v) => setEditProjectForm(f => ({ ...f, priority: v as Priority }))}>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editProjectForm.status} onValueChange={(v) => setEditProjectForm(f => ({ ...f, status: v as ProjectStatus }))}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{statusColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>Cancel</Button>
              <Button onClick={async () => { if (selectedProject) { try { await updateProject(selectedProject.id, { name: editProjectForm.name, description: editProjectForm.description, budget: editProjectForm.budget, priority: editProjectForm.priority, status: editProjectForm.status }); toast.success('Project updated successfully'); setShowEditProjectDialog(false); setShowProjectDialog(false) } catch { toast.error('Failed to update project') } } }} disabled={!editProjectForm.name}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Time Dialog */}
        <Dialog open={showLogTimeDialog} onOpenChange={setShowLogTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time</DialogTitle>
              <DialogDescription>Record time spent on this issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Hours Spent</Label>
                <Input type="number" placeholder="0" value={logTimeForm.hours} onChange={(e) => setLogTimeForm(f => ({ ...f, hours: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea placeholder="What did you work on?" value={logTimeForm.description} onChange={(e) => setLogTimeForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogTimeDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Logging time...', { id: 'log-time' })
                try {
                  const res = await fetch('/api/projects/time-entries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...logTimeForm, date: new Date().toISOString() })
                  })
                  if (!res.ok) throw new Error('Failed to log time')
                  const data = await res.json()
                  setTimeEntries(prev => [...prev, { id: data.id || `TE-${Date.now()}`, ...logTimeForm, date: new Date().toISOString() }])
                  toast.success(`${logTimeForm.hours} hours logged`, { id: 'log-time' })
                  setShowLogTimeDialog(false)
                  setLogTimeForm({ hours: 0, description: '' })
                } catch {
                  toast.error('Failed to log time', { id: 'log-time' })
                }
              }} disabled={logTimeForm.hours <= 0}>Log Time</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Attachment Dialog */}
        <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Attachment</DialogTitle>
              <DialogDescription>Upload files to this issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-sm text-gray-500">Max file size: 10MB</p>
                <Button variant="outline" className="mt-4" onClick={() => document.getElementById('attachment-file-input')?.click()}>Browse Files</Button>
                <input id="attachment-file-input" type="file" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) { toast.success(`${e.target.files.length} file(s) selected`) } }} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Uploading attachment...', { id: 'upload-attachment' })
                try {
                  const res = await fetch('/api/projects/attachments', { method: 'POST' })
                  if (!res.ok) throw new Error('Upload failed')
                  toast.success('Attachment uploaded', { id: 'upload-attachment' })
                  setShowAttachmentDialog(false)
                } catch {
                  toast.error('Upload failed', { id: 'upload-attachment' })
                }
              }}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Issue Dialog */}
        <Dialog open={showLinkIssueDialog} onOpenChange={setShowLinkIssueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Issue</DialogTitle>
              <DialogDescription>Create a link to another issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Link Type</Label>
                <Select value={linkIssueForm.linkType} onValueChange={(v) => setLinkIssueForm(f => ({ ...f, linkType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select link type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blocks">Blocks</SelectItem>
                    <SelectItem value="blocked_by">Is blocked by</SelectItem>
                    <SelectItem value="duplicates">Duplicates</SelectItem>
                    <SelectItem value="relates_to">Relates to</SelectItem>
                    <SelectItem value="causes">Causes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue Key</Label>
                <Input placeholder="e.g., PRJ-123" value={linkIssueForm.issueKey} onChange={(e) => setLinkIssueForm(f => ({ ...f, issueKey: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLinkIssueDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Linking issue...', { id: 'link-issue' })
                try {
                  const res = await fetch('/api/projects/issue-links', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(linkIssueForm)
                  })
                  if (!res.ok) throw new Error('Failed to link issue')
                  const data = await res.json()
                  setIssueLinks(prev => [...prev, { id: data.id || `LNK-${Date.now()}`, ...linkIssueForm }])
                  toast.success(`Issue linked to ${linkIssueForm.issueKey}`, { id: 'link-issue' })
                  setShowLinkIssueDialog(false)
                  setLinkIssueForm({ issueKey: '', linkType: 'blocks' })
                } catch {
                  toast.error('Failed to link issue', { id: 'link-issue' })
                }
              }} disabled={!linkIssueForm.issueKey}>Link Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Issue Dialog */}
        <Dialog open={showEditIssueDialog} onOpenChange={setShowEditIssueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Issue</DialogTitle>
              <DialogDescription>Update issue details for {selectedIssue?.key}</DialogDescription>
            </DialogHeader>
            {selectedIssue && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input defaultValue={selectedIssue.title} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea defaultValue={selectedIssue.description} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue={selectedIssue.status}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select defaultValue={selectedIssue.priority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Story Points</Label>
                  <Input type="number" defaultValue={selectedIssue.storyPoints} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditIssueDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                toast.loading('Saving changes...', { id: 'save-issue' })
                try {
                  const res = await fetch(`/api/projects/issues/${selectedIssue?.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(selectedIssue)
                  })
                  if (!res.ok) throw new Error('Failed to save changes')
                  toast.success(`Issue ${selectedIssue?.key} updated`, { id: 'save-issue' })
                  setShowEditIssueDialog(false)
                } catch {
                  toast.error('Failed to save changes', { id: 'save-issue' })
                }
              }}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Confirmation Dialog */}
        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertOctagon className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-700 dark:text-red-500">Warning</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-500">
                  You are about to delete <strong>{selectedProject?.name}</strong>. All project data, tasks, and history will be permanently removed.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Type "{selectedProject?.name}" to confirm</Label>
                <Input
                  placeholder={selectedProject?.name || ''}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteProjectDialog(false); setDeleteConfirmText('') }}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteConfirmText !== selectedProject?.name}
                onClick={() => {
                  if (selectedProject) {
                    toast.promise(
                      handleDeleteProject(selectedProject.id),
                      {
                        loading: 'Deleting project...',
                        success: `Project "${selectedProject.name}" deleted successfully`,
                        error: 'Failed to delete project'
                      }
                    )
                    setShowDeleteProjectDialog(false)
                    setShowProjectDialog(false)
                    setDeleteConfirmText('')
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Member Picker Dialog */}
        <Dialog open={showTeamMemberDialog} onOpenChange={setShowTeamMemberDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>Add a team member to {selectedProject?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Search Team Members</Label>
                <Input placeholder="Search by name or email..." />
              </div>
              <div className="space-y-2">
                <Label>Available Members</Label>
                <ScrollArea className="h-[200px] border rounded-lg">
                  <div className="p-2 space-y-1">
                    {['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis', 'Frank Miller'].map((member) => (
                      <div
                        key={member}
                        className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                        onClick={() => {
                          if (selectedProject) {
                            toast.promise(
                              updateProject(selectedProject.id, {
                                team_members: [...(selectedProject.teamMembers || []), member]
                              }),
                              {
                                loading: 'Adding team member...',
                                success: `${member} added to ${selectedProject.name}`,
                                error: 'Failed to add team member'
                              }
                            )
                            setShowTeamMemberDialog(false)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{member.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{member}</p>
                            <p className="text-xs text-gray-500">{member.toLowerCase().replace(' ', '.')}@company.com</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              {selectedProject && selectedProject.teamMembers.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Team ({selectedProject.teamMembers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.teamMembers.map((member, i) => (
                      <Badge key={i} variant="secondary" className="pl-1 pr-2">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarFallback className="text-[8px]">{member.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTeamMemberDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
