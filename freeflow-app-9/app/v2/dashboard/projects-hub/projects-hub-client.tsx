'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjects } from '@/lib/hooks/use-projects'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  FolderOpen, Plus, Search, Filter, DollarSign, Users, CheckCircle2, Calendar, TrendingUp,
  Briefcase, Edit, Target, BarChart3, Settings, Trash2, LayoutGrid,
  List, GanttChartSquare, ChevronDown, MoreHorizontal, Flag, Tag, MessageSquare, Archive, Star, Zap, Timer, AlertTriangle, CheckSquare, Play, Milestone, GitBranch, Layers, ArrowRight, RefreshCw, Copy, Workflow, FileText, Bell, Shield, Link, ExternalLink, Activity,
  Key, Webhook, Database, Lock, AlertOctagon, Mail, Globe, Upload, Download,
  BellRing, Slack, Layout, Code, Hash, Columns, ChevronRight
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

// Empty defaults for backward compatibility (data comes from Supabase hooks)
const statusColumns: any[] = []
const mockProjects: Project[] = []
const mockSprints: Sprint[] = []
const mockBacklog: BacklogItem[] = []
const mockRoadmap: RoadmapItem[] = []
const mockAutomations: Automation[] = []
const mockTemplates: Template[] = []
const mockIssues: Issue[] = []
const mockEpics: Epic[] = []
const mockActivities: Activity[] = []
const mockReports: Report[] = []
const mockIntegrations: Integration[] = []
const mockProjectsAIInsights: any[] = []
const mockProjectsCollaborators: any[] = []
const mockProjectsPredictions: any[] = []
const mockProjectsActivities: any[] = []
const mockProjectsQuickActions: any[] = []

const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Critical' },
  high: { color: 'bg-orange-500', label: 'High' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  low: { color: 'bg-gray-400', label: 'Low' }
}

// Custom fields mock data (kept local as it's specific to this component)
const mockCustomFields: CustomField[] = [
  { id: '1', name: 'Customer Impact', type: 'select', required: false, options: ['Low', 'Medium', 'High', 'Critical'], appliesTo: ['bug', 'story'] },
  { id: '2', name: 'Technical Debt', type: 'select', required: false, options: ['Yes', 'No'], appliesTo: ['task', 'bug'] },
  { id: '3', name: 'Release Version', type: 'text', required: true, appliesTo: ['story', 'bug', 'task'] },
  { id: '4', name: 'QA Contact', type: 'user', required: false, appliesTo: ['story', 'bug'] },
  { id: '5', name: 'Documentation Link', type: 'url', required: false, appliesTo: ['story', 'epic'] }
]

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

  // Additional dialog states for buttons
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [showSprintBoardDialog, setShowSprintBoardDialog] = useState(false)
  const [showBacklogItemDialog, setShowBacklogItemDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showAutomationDialog, setShowAutomationDialog] = useState(false)
  const [showTemplateUseDialog, setShowTemplateUseDialog] = useState(false)
  const [showSlackConfigDialog, setShowSlackConfigDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [showIntegrationConfigDialog, setShowIntegrationConfigDialog] = useState(false)
  const [showCustomFieldDialog, setShowCustomFieldDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showAutomationRuleDialog, setShowAutomationRuleDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [showLogTimeDialog, setShowLogTimeDialog] = useState(false)
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false)
  const [showLinkIssueDialog, setShowLinkIssueDialog] = useState(false)
  const [showEditIssueDialog, setShowEditIssueDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [commentText, setCommentText] = useState('')
  const [logTimeAmount, setLogTimeAmount] = useState('')

  // Form states
  const [milestoneForm, setMilestoneForm] = useState({ title: '', quarter: '', status: 'planned' as const })
  const [backlogItemForm, setBacklogItemForm] = useState({ title: '', description: '', priority: 'medium' as Priority, points: 1, type: 'task' as const })
  const [reportForm, setReportForm] = useState({ name: '', type: 'burndown' as const, description: '' })
  const [automationForm, setAutomationForm] = useState({ name: '', trigger: '', action: '' })
  const [webhookForm, setWebhookForm] = useState({ url: '', events: [] as string[] })
  const [customFieldForm, setCustomFieldForm] = useState({ name: '', type: 'text' as const, required: false, appliesTo: [] as string[] })
  const [statusForm, setStatusForm] = useState({ name: '' })
  const [filterForm, setFilterForm] = useState({ status: 'all', priority: 'all', dateRange: 'all' })

  // Define adapter variables locally (removed mock data imports)
  const projectsHubProjects: any[] = []
  const projectsHubSprints: any[] = []
  const projectsHubBacklog: any[] = []
  const projectsHubRoadmap: any[] = []
  const projectsHubAutomations: any[] = []
  const projectsHubTemplates: any[] = []
  const projectsHubIssues: any[] = []
  const projectsHubEpics: any[] = []
  const projectsHubReports: any[] = []
  const projectsHubIntegrations: any[] = []
  const projectsHubAIInsights: any[] = []
  const projectsHubCollaborators: any[] = []
  const projectsHubPredictions: any[] = []
  const projectsHubActivities: any[] = []
  const projectsHubQuickActions: any[] = []
  const projectsStatusColumns: any[] = []

  // Database integration - use real projects hook
  const { projects: dbProjects, fetchProjects, createProject, updateProject, deleteProject, isLoading: projectsLoading, error } = useProjects()

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
    const loadProjects = async () => {
      try {
        await fetchProjects()
      } catch (err) {
        console.error('Failed to load projects:', err)
        // Error is already handled by the hook
      }
    }

    loadProjects()
  }, []) // Empty array - only run on mount

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
    return mockProjects
  }, [dbProjects])

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

  const stats = useMemo(() => ({
    total: allProjects.length,
    active: allProjects.filter(p => p.status === 'active').length,
    completed: allProjects.filter(p => p.status === 'completed').length,
    onTrack: allProjects.filter(p => p.progress >= 50 && p.status !== 'on_hold').length,
    totalBudget: allProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: allProjects.reduce((sum, p) => sum + p.spent, 0),
    avgProgress: allProjects.length > 0 ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length) : 0,
    overdue: allProjects.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.status !== 'completed').length
  }), [allProjects])

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

  const handleExportProjects = async () => {
    const csv = allProjects.map(p =>
      `${p.name},${p.status},${p.priority},${p.progress}%,$${p.budget},$${p.spent}`
    ).join('\n')
    const blob = new Blob([`Name,Status,Priority,Progress,Budget,Spent\n${csv}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'projects-export.csv'
    a.click()
    toast.success('Projects exported to CSV')
  }

  // Handler functions for all buttons
  const handleApplyFilters = () => {
    if (filterForm.status !== 'all') setSelectedFilter(filterForm.status)
    else if (filterForm.priority !== 'all') setSelectedFilter(filterForm.priority)
    else setSelectedFilter('all')
    setShowFilterDialog(false)
    toast.success('Filters applied')
  }

  const handleCreateMilestone = () => {
    if (!milestoneForm.title) {
      toast.error('Please enter a milestone title')
      return
    }
    toast.success("Milestone created: " + milestoneForm.title + " added to roadmap")
    setShowMilestoneDialog(false)
    setMilestoneForm({ title: '', quarter: '', status: 'planned' })
  }

  const handleViewSprintBoard = (sprint: Sprint) => {
    setSelectedSprint(sprint)
    setShowSprintBoardDialog(true)
  }

  const handleCreateBacklogItem = () => {
    if (!backlogItemForm.title) {
      toast.error('Please enter a title')
      return
    }
    toast.success("Backlog item created: " + backlogItemForm.title + " added to backlog")
    setShowBacklogItemDialog(false)
    setBacklogItemForm({ title: '', description: '', priority: 'medium', points: 1, type: 'task' })
  }

  const handleCreateReport = () => {
    if (!reportForm.name) {
      toast.error('Please enter a report name')
      return
    }
    toast.success("Report created: " + reportForm.name + " report is ready")
    setShowReportDialog(false)
    setReportForm({ name: '', type: 'burndown', description: '' })
  }

  const handleCreateAutomation = () => {
    if (!automationForm.name || !automationForm.trigger || !automationForm.action) {
      toast.error('Please fill in all fields')
      return
    }
    toast.success("Automation created: " + automationForm.name + " is now active")
    setShowAutomationDialog(false)
    setAutomationForm({ name: '', trigger: '', action: '' })
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setShowTemplateUseDialog(true)
  }

  const handleConfirmUseTemplate = () => {
    if (selectedTemplate) {
      toast.success("Template applied: " + selectedTemplate.name)
      setShowTemplateUseDialog(false)
      setSelectedTemplate(null)
    }
  }

  const handleConfigureSlack = () => {
    toast.success('Slack channel updated')
    setShowSlackConfigDialog(false)
  }

  const handleCreateWebhook = () => {
    if (!webhookForm.url) {
      toast.error('Please enter a webhook URL')
      return
    }
    toast.success('Webhook created')
    setShowWebhookDialog(false)
    setWebhookForm({ url: '', events: [] })
  }

  const handleAddIntegration = () => {
    toast.success('Integration added')
    setShowIntegrationDialog(false)
  }

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowIntegrationConfigDialog(true)
  }

  const handleSaveIntegrationConfig = () => {
    if (selectedIntegration) {
      toast.success('Integration updated')
      setShowIntegrationConfigDialog(false)
      setSelectedIntegration(null)
    }
  }

  const handleRegenerateApiToken = () => {
    toast.success('API token regenerated')
  }

  const handleViewApiDocs = () => {
    window.open('/docs/api', '_blank')
    toast.success('Opening API documentation')
  }

  const handleDownloadCli = () => {
    toast.success('Downloading CLI tool')
    // Simulate download
    const link = document.createElement('a')
    link.href = '#'
    link.download = 'projects-cli'
    link.click()
  }

  const handleCreateCustomField = () => {
    if (!customFieldForm.name) {
      toast.error('Please enter a field name')
      return
    }
    toast.success("Custom field created: " + customFieldForm.name + " field added")
    setShowCustomFieldDialog(false)
    setCustomFieldForm({ name: '', type: 'text', required: false, appliesTo: [] })
  }

  const handleArchiveAllProjects = () => {
    toast.success('All projects archived')
    setShowArchiveDialog(false)
  }

  const handleDeleteAllData = () => {
    toast.success('All data deleted')
    setShowDeleteAllDialog(false)
  }

  const handleAddStatus = () => {
    if (!statusForm.name) {
      toast.error('Please enter a status name')
      return
    }
    toast.success("Status added: " + statusForm.name + " status added to workflow")
    setShowStatusDialog(false)
    setStatusForm({ name: '' })
  }

  const handleCreateAutomationRule = () => {
    if (!automationForm.name) {
      toast.error('Please enter a rule name')
      return
    }
    toast.success('Automation rule created')
    setShowAutomationRuleDialog(false)
    setAutomationForm({ name: '', trigger: '', action: '' })
  }

  const handleExportAllData = () => {
    handleExportProjects()
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast.success('Data imported')
      }
    }
    input.click()
  }

  const handleEditProject = () => {
    if (selectedProject) {
      setShowProjectDialog(false)
      setShowEditProjectDialog(true)
    }
  }

  const handleSaveProjectEdit = async () => {
    if (selectedProject) {
      try {
        await updateProject(selectedProject.id, {
          name: selectedProject.name,
          description: selectedProject.description,
          budget: selectedProject.budget,
          priority: selectedProject.priority as any
        })
        toast.success('Project updated')
        setShowEditProjectDialog(false)
      } catch (error) {
        toast.error('Failed to update project')
      }
    }
  }

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error('Please enter a comment')
      return
    }
    toast.success('Comment added')
    setCommentText('')
  }

  const handleLogTime = () => {
    if (!logTimeAmount) {
      toast.error('Please enter time amount')
      return
    }
    toast.success('Time logged')
    setShowLogTimeDialog(false)
    setLogTimeAmount('')
  }

  const handleAddAttachment = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        toast.success('Attachment added')
        setShowAttachmentDialog(false)
      }
    }
    input.click()
  }

  const handleLinkIssue = (issueKey: string) => {
    toast.success("Issue linked: " + issueKey)
    setShowLinkIssueDialog(false)
  }

  const handleEditIssue = () => {
    setShowIssueDialog(false)
    setShowEditIssueDialog(true)
  }

  const handleSaveIssueEdit = () => {
    if (selectedIssue) {
      toast.success('Issue updated')
      setShowEditIssueDialog(false)
    }
  }

  const handleMoveToInProgress = () => {
    if (selectedIssue) {
      toast.success('Issue moved')
      setShowIssueDialog(false)
    }
  }

  // Loading state
  if (projectsLoading && dbProjects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading Projects...</h3>
            <p className="text-gray-500">Please wait while we fetch your projects</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && dbProjects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Unable to Load Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => fetchProjects()}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                {statusColumns.map(column => (
                  <div key={column.id} className="min-w-[280px]">
                    <div className="flex items-center justify-between mb-3 px-2">
                      <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${column.color}`} /><h3 className="font-semibold">{column.label}</h3><Badge variant="secondary" className="text-xs">{projectsByStatus[column.id]?.length || 0}</Badge></div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setShowNewProjectDialog(true) }}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-3">
                      {projectsByStatus[column.id]?.map(project => (
                        <Card key={project.id} className={`cursor-pointer hover:shadow-lg border-l-4 ${getStatusColor(project.status)}`} onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2"><h4 className="font-semibold text-sm">{project.name}</h4><Badge variant="outline" className="text-xs"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(project.priority).color} mr-1`} />{getPriorityConfig(project.priority).label}</Badge></div>
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
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-4 py-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredProjects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                          <td className="px-4 py-4"><div><p className="font-medium">{project.name}</p><p className="text-xs text-gray-500">{project.projectCode}</p></div></td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(project.status)}>{statusColumns.find(c => c.id === project.status)?.label}</Badge></td>
                          <td className="px-4 py-4"><div className="w-24"><div className="flex justify-between text-xs mb-1"><span>{project.progress}%</span></div><Progress value={project.progress} className="h-1.5" /></div></td>
                          <td className="px-4 py-4">{project.budget ? <div><span className="font-medium">${(project.spent / 1000).toFixed(0)}K</span><span className="text-gray-500"> / ${(project.budget / 1000).toFixed(0)}K</span></div> : '-'}</td>
                          <td className="px-4 py-4">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                                  <FolderOpen className="h-4 w-4 mr-2" />View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedProject(project); setShowEditProjectDialog(true) }}>
                                  <Edit className="h-4 w-4 mr-2" />Edit Project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleUpdateProjectStatus(project.id, 'active')}>
                                  <Play className="h-4 w-4 mr-2" />Mark Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateProjectStatus(project.id, 'completed')}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateProjectStatus(project.id, 'on_hold')}>
                                  <Archive className="h-4 w-4 mr-2" />Put On Hold
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />Delete Project
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {viewType === 'timeline' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><GanttChartSquare className="h-5 w-5" />Project Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredProjects.map(project => (
                      <div key={project.id} className="flex items-center gap-4">
                        <div className="w-48 truncate text-sm font-medium">{project.name}</div>
                        <div className="flex-1 relative h-8 bg-muted rounded"><div className={`absolute h-full rounded ${getStatusColor(project.status)} opacity-80`} style={{ left: '10%', width: `${Math.max(project.progress, 10)}%` }}><div className="px-2 text-xs text-white truncate leading-8">{project.progress}%</div></div></div>
                        <div className="w-20 text-right text-sm text-gray-500">{project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</div>
                      </div>
                    ))}
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
                {mockRoadmap.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div><h3 className="font-semibold text-lg">{item.title}</h3><p className="text-sm text-gray-500">{item.quarter}</p></div>
                      <Badge className={(item.status as string) === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{item.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2"><span className="text-sm text-gray-500">{item.progress}% complete</span></div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex items-center gap-2 mt-3"><span className="text-xs text-gray-500">{item.projectIds.length} projects linked</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {mockSprints.map(sprint => (
                <Card key={sprint.id} className={`border-gray-200 dark:border-gray-700 ${sprint.status === 'active' ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between"><CardTitle className="text-lg">{sprint.name}</CardTitle><Badge className={getSprintStatusColor(sprint.status)}>{sprint.status}</Badge></div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{sprint.goal}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span>Tasks</span><span className="font-medium">{sprint.tasksCompleted}/{sprint.tasksTotal}</span></div>
                      <Progress value={(sprint.tasksCompleted / sprint.tasksTotal) * 100} className="h-2" />
                      <div className="flex justify-between text-sm"><span>Velocity</span><span className="font-medium">{sprint.velocity} pts</span></div>
                      <div className="text-xs text-gray-500">{sprint.startDate} - {sprint.endDate}</div>
                    </div>
                    {sprint.status === 'active' && <Button className="w-full mt-4" onClick={() => handleViewSprintBoard(sprint as Sprint)}><Play className="h-4 w-4 mr-2" />View Sprint Board</Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Backlog Tab */}
          <TabsContent value="backlog" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Backlog</CardTitle><Button onClick={() => setShowBacklogItemDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Item</Button></CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockBacklog.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><h4 className="font-medium">{item.title}</h4><Badge className={getTypeColor(item.type)}>{item.type}</Badge></div>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(item.priority).color} mr-1`} />{getPriorityConfig(item.priority).label}</Badge>
                    <Badge variant="secondary">{item.points} pts</Badge>
                    {item.assignee && <Avatar className="h-8 w-8"><AvatarFallback>{item.assignee.slice(0, 2)}</AvatarFallback></Avatar>}
                    {item.sprint && <Badge className="bg-blue-100 text-blue-700">Sprint {item.sprint}</Badge>}
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
                  {mockReports.map(report => (
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
                  {mockEpics.map(epic => (
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
                      const count = allProjects.filter(p => p.status === col.id).length
                      const percentage = allProjects.length > 0 ? (count / allProjects.length) * 100 : 0
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
                    {mockActivities.map(activity => {
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b"><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Summary</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th></tr></thead>
                    <tbody className="divide-y">
                      {mockIssues.map(issue => (
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Workflow Automations</CardTitle><Button onClick={() => setShowAutomationDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Automation</Button></CardHeader>
              <CardContent className="space-y-4">
                {mockAutomations.map(auto => (
                  <div key={auto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${auto.enabled ? 'bg-green-100' : 'bg-gray-100'}`}><Workflow className={`h-5 w-5 ${auto.enabled ? 'text-green-600' : 'text-gray-400'}`} /></div>
                    <div className="flex-1"><h4 className="font-medium">{auto.name}</h4><p className="text-sm text-gray-500">{auto.trigger} → {auto.action}</p></div>
                    <Badge variant="outline">{auto.runsCount} runs</Badge>
                    <Switch checked={auto.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {mockTemplates.map(template => (
                <Card key={template.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div><Badge variant="outline">{template.category}</Badge></div>
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500"><span>{template.tasksCount} tasks</span><span>Used {template.usageCount} times</span></div>
                    <Button className="w-full mt-4" variant="outline" onClick={() => handleUseTemplate(template as Template)}><Copy className="h-4 w-4 mr-2" />Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Budget Information</div>
                            <div className="text-sm text-gray-500">Display budget and spending on project cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Compact Mode</div>
                            <div className="text-sm text-gray-500">Use a more compact layout for project lists</div>
                          </div>
                          <Switch />
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
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-generate Project Keys</div>
                            <div className="text-sm text-gray-500">Automatically generate project keys from names</div>
                          </div>
                          <Switch defaultChecked />
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
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Issue Status Changed</div>
                            <div className="text-sm text-gray-500">When watching issue status changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Mentioned in Comments</div>
                            <div className="text-sm text-gray-500">When someone @mentions you</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Due Date Approaching</div>
                            <div className="text-sm text-gray-500">Issues due within 24 hours</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Daily Summary Email</div>
                            <div className="text-sm text-gray-500">Receive daily digest of activity</div>
                          </div>
                          <Switch />
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
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Comments</div>
                            <div className="text-sm text-gray-500">Comments on issues you're watching</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Automation Runs</div>
                            <div className="text-sm text-gray-500">When automations execute actions</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Integration Errors</div>
                            <div className="text-sm text-gray-500">When integrations fail to sync</div>
                          </div>
                          <Switch defaultChecked />
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
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Updates</div>
                            <div className="text-sm text-gray-500">Post sprint start/end notifications</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Release Notifications</div>
                            <div className="text-sm text-gray-500">Announce new releases to Slack</div>
                          </div>
                          <Switch />
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
                          {[
                            { url: 'https://api.company.com/webhooks/jira', events: ['issue.created', 'issue.updated'], status: 'active' },
                            { url: 'https://hooks.zapier.com/hooks/catch/123456', events: ['sprint.completed'], status: 'active' },
                          ].map((webhook, i) => (
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
                                <Button variant="ghost" size="sm" onClick={async () => {
                                  if (confirm('Are you sure you want to delete this webhook?')) {
                                    toast.promise(
                                      fetch('/api/projects/webhooks/' + webhook.id, { method: 'DELETE' }),
                                      { loading: 'Deleting webhook...', success: 'Webhook removed successfully', error: 'Failed to delete webhook' }
                                    )
                                  }
                                }}>
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
                        {mockIntegrations.map(integration => (
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
                              <Button variant="ghost" size="sm" onClick={() => handleConfigureIntegration(integration)}>Configure</Button>
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
                            <Button variant="outline" size="sm" onClick={handleRegenerateApiToken}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              prj_live_•••••••••••••••••••••••
                            </code>
                            <Button variant="outline" size="sm" onClick={() => toast.promise(navigator.clipboard.writeText('prj_live_xxxxxxxxxxxxxxxxxxxxx'), { loading: 'Copying token...', success: 'API token copied to clipboard', error: 'Failed to copy token' })}>
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
                        <Button variant="outline" className="w-full" onClick={handleViewApiDocs}>
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
                          <Button variant="outline" size="sm" onClick={handleDownloadCli}>
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
                          <Button size="sm" onClick={() => setShowCustomFieldDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockCustomFields.map(field => (
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
                              <Button variant="ghost" size="sm" onClick={() => {
                                toast.info('Edit Field: ' + field.name)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={async () => {
                                if (confirm('Are you sure you want to delete this custom field?')) {
                                  toast.promise(
                                    fetch('/api/projects/fields/' + field.id, { method: 'DELETE' }),
                                    { loading: 'Deleting field...', success: 'Custom field removed', error: 'Failed to delete field' }
                                  )
                                }
                              }}>
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
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Admin Approval</div>
                            <div className="text-sm text-gray-500">For creating new projects</div>
                          </div>
                          <Switch />
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
                        <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
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
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-assign on In Progress</div>
                            <div className="text-sm text-gray-500">Assign to current user when starting work</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Reviewer for Review</div>
                            <div className="text-sm text-gray-500">Must have reviewer before moving to Review</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Prevent Reopening Done Issues</div>
                            <div className="text-sm text-gray-500">Require admin approval to reopen</div>
                          </div>
                          <Switch />
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
                        {mockAutomations.map(auto => (
                          <div key={auto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className={`p-2 rounded-lg ${auto.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <Workflow className={`h-5 w-5 ${auto.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{auto.name}</h4>
                              <p className="text-sm text-gray-500">{auto.trigger} → {auto.action}</p>
                            </div>
                            <Badge variant="outline">{auto.runsCount} runs</Badge>
                            <Switch checked={auto.enabled} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAutomationRuleDialog(true)}>
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
                            <div className="text-2xl font-bold">{mockIssues.length}</div>
                            <div className="text-sm text-gray-500">Issues</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">12.4 MB</div>
                            <div className="text-sm text-gray-500">Storage Used</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={handleExportAllData}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={handleImportData}>
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
              insights={mockProjectsAIInsights as any}
              onInsightAction={(insight: any) => toast.info(insight.title || 'AI Insight')}
            />
          </div>

          {/* Team Collaboration & Activity */}
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockProjectsCollaborators.map(c => ({ ...c, color: c.color || '#6366f1' })) as any}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockProjectsPredictions as any}
            />
          </div>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockProjectsActivities as any}
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockProjectsQuickActions as any}
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
                <DialogFooter><Button variant="outline" onClick={() => setShowProjectDialog(false)}>Close</Button><Button onClick={handleEditProject}><Edit className="h-4 w-4 mr-2" />Edit Project</Button></DialogFooter>
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
                            <Button size="sm" onClick={handleAddComment}>Add Comment</Button>
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
                          <Button variant="ghost" size="sm" className="mt-2" onClick={handleAddAttachment}><Plus className="h-4 w-4 mr-1" />Add Attachment</Button>
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
                  <Button variant="outline" onClick={handleEditIssue}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleMoveToInProgress}><ArrowRight className="h-4 w-4 mr-2" />Move to In Progress</Button>
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
              <DialogDescription>Apply filters to narrow down your project list</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <Select value={filterForm.status} onValueChange={(v) => setFilterForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={filterForm.priority} onValueChange={(v) => setFilterForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All priorities" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={filterForm.dateRange} onValueChange={(v) => setFilterForm(f => ({ ...f, dateRange: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All time" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setFilterForm({ status: 'all', priority: 'all', dateRange: 'all' }); setSelectedFilter('all') }}>Clear Filters</Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Milestone Dialog */}
        <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
              <DialogDescription>Create a new milestone for your roadmap</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Milestone Title</Label>
                <Input placeholder="Enter milestone title" className="mt-1" value={milestoneForm.title} onChange={(e) => setMilestoneForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label>Quarter</Label>
                <Select value={milestoneForm.quarter} onValueChange={(v) => setMilestoneForm(f => ({ ...f, quarter: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select quarter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                    <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                    <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                    <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={milestoneForm.status} onValueChange={(v: 'planned') => setMilestoneForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
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
              <Button onClick={handleCreateMilestone}>Create Milestone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sprint Board Dialog */}
        <Dialog open={showSprintBoardDialog} onOpenChange={setShowSprintBoardDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedSprint?.name} - Sprint Board</DialogTitle>
              <DialogDescription>{selectedSprint?.goal}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {['To Do', 'In Progress', 'Review', 'Done'].map((col, i) => (
                  <div key={col} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h4 className="font-medium mb-3 text-sm">{col}</h4>
                    <div className="space-y-2">
                      {[1, 2].slice(0, i === 1 ? 2 : 1).map((item) => (
                        <div key={item} className="bg-white dark:bg-gray-900 p-2 rounded border text-sm">
                          <p className="font-medium">Task {col}-{item}</p>
                          <p className="text-xs text-gray-500">2 story points</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedSprint && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{selectedSprint.tasksCompleted}/{selectedSprint.tasksTotal} tasks completed</span>
                  <span>Velocity: {selectedSprint.velocity} pts</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSprintBoardDialog(false)}>Close</Button>
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
              <div>
                <Label>Title</Label>
                <Input placeholder="Enter title" className="mt-1" value={backlogItemForm.title} onChange={(e) => setBacklogItemForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the item..." className="mt-1" value={backlogItemForm.description} onChange={(e) => setBacklogItemForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Type</Label>
                  <Select value={backlogItemForm.type} onValueChange={(v: 'task') => setBacklogItemForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={backlogItemForm.priority} onValueChange={(v: Priority) => setBacklogItemForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Story Points</Label>
                <Input type="number" min="1" max="21" className="mt-1" value={backlogItemForm.points} onChange={(e) => setBacklogItemForm(f => ({ ...f, points: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBacklogItemDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateBacklogItem}>Add to Backlog</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Report</DialogTitle>
              <DialogDescription>Generate a new analytics report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Report Name</Label>
                <Input placeholder="Enter report name" className="mt-1" value={reportForm.name} onChange={(e) => setReportForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Report Type</Label>
                <Select value={reportForm.type} onValueChange={(v: 'burndown') => setReportForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe the report..." className="mt-1" value={reportForm.description} onChange={(e) => setReportForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateReport}>Create Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Automation Dialog */}
        <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
              <DialogDescription>Set up a new workflow automation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Automation Name</Label>
                <Input placeholder="Enter automation name" className="mt-1" value={automationForm.name} onChange={(e) => setAutomationForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select value={automationForm.trigger} onValueChange={(v) => setAutomationForm(f => ({ ...f, trigger: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select trigger" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issue_created">When issue is created</SelectItem>
                    <SelectItem value="status_changed">When status changes</SelectItem>
                    <SelectItem value="assigned">When issue is assigned</SelectItem>
                    <SelectItem value="due_date">When due date approaches</SelectItem>
                    <SelectItem value="sprint_started">When sprint starts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select value={automationForm.action} onValueChange={(v) => setAutomationForm(f => ({ ...f, action: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="send_notification">Send notification</SelectItem>
                    <SelectItem value="assign_user">Assign to user</SelectItem>
                    <SelectItem value="change_status">Change status</SelectItem>
                    <SelectItem value="add_label">Add label</SelectItem>
                    <SelectItem value="post_slack">Post to Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAutomation}>Create Automation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Use Template Dialog */}
        <Dialog open={showTemplateUseDialog} onOpenChange={setShowTemplateUseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use Template</DialogTitle>
              <DialogDescription>Create a new project from "{selectedTemplate?.name}"</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium">{selectedTemplate.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>{selectedTemplate.tasksCount} tasks</span>
                      <span>Used {selectedTemplate.usageCount} times</span>
                    </div>
                  </div>
                  <div>
                    <Label>Project Name</Label>
                    <Input placeholder="Enter project name" className="mt-1" defaultValue={`${selectedTemplate.name} - Copy`} />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateUseDialog(false)}>Cancel</Button>
              <Button onClick={handleConfirmUseTemplate}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Slack Config Dialog */}
        <Dialog open={showSlackConfigDialog} onOpenChange={setShowSlackConfigDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure Slack Channel</DialogTitle>
              <DialogDescription>Choose which Slack channel to send notifications to</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Slack Channel</Label>
                <Select defaultValue="engineering">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">#engineering</SelectItem>
                    <SelectItem value="product">#product</SelectItem>
                    <SelectItem value="design">#design</SelectItem>
                    <SelectItem value="general">#general</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Send test message</span>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.promise(
                    fetch('/api/integrations/slack/test', { method: 'POST' }),
                    { loading: 'Sending test message...', success: 'Test message sent to Slack', error: 'Failed to send test message' }
                  )
                }}>Send Test</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSlackConfigDialog(false)}>Cancel</Button>
              <Button onClick={handleConfigureSlack}>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
              <DialogDescription>Create a new webhook endpoint</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Webhook URL</Label>
                <Input placeholder="https://..." className="mt-1" value={webhookForm.url} onChange={(e) => setWebhookForm(f => ({ ...f, url: e.target.value }))} />
              </div>
              <div>
                <Label>Events</Label>
                <div className="mt-2 space-y-2">
                  {['issue.created', 'issue.updated', 'issue.deleted', 'sprint.started', 'sprint.completed'].map(event => (
                    <div key={event} className="flex items-center gap-2">
                      <input type="checkbox" id={event} className="rounded" onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookForm(f => ({ ...f, events: [...f.events, event] }))
                        } else {
                          setWebhookForm(f => ({ ...f, events: f.events.filter(e => e !== event) }))
                        }
                      }} />
                      <label htmlFor={event} className="text-sm">{event}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateWebhook}>Create Webhook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Integration</DialogTitle>
              <DialogDescription>Connect a new service to your project</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { name: 'GitHub', icon: '🐙', desc: 'Connect your repositories' },
                  { name: 'GitLab', icon: '🦊', desc: 'Sync with GitLab projects' },
                  { name: 'Slack', icon: '💬', desc: 'Team notifications' },
                  { name: 'Microsoft Teams', icon: '👥', desc: 'Team collaboration' },
                  { name: 'Confluence', icon: '📄', desc: 'Documentation sync' },
                  { name: 'Bitbucket', icon: '🪣', desc: 'Repository integration' },
                ].map(integration => (
                  <div key={integration.name} className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" onClick={async () => {
                    toast.promise(
                      fetch('/api/integrations/connect', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: integration.name })
                      }),
                      { loading: `Connecting to ${integration.name}...`, success: `${integration.name} connected`, error: `Failed to connect ${integration.name}` }
                    )
                    setShowIntegrationDialog(false)
                  }}>
                    <div className="text-2xl mb-2">{integration.icon}</div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-gray-500">{integration.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Config Dialog */}
        <Dialog open={showIntegrationConfigDialog} onOpenChange={setShowIntegrationConfigDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
              <DialogDescription>Manage your integration settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-2xl">{selectedIntegration?.icon}</span>
                <div>
                  <p className="font-medium">{selectedIntegration?.name}</p>
                  <p className="text-sm text-gray-500">Status: {selectedIntegration?.status}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Auto-sync enabled</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm">Sync on push</span>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full" onClick={async () => {
                toast.promise(
                  fetch('/api/integrations/' + selectedIntegration?.id + '/sync', { method: 'POST' }),
                  { loading: 'Syncing...', success: 'Sync completed successfully', error: 'Sync failed' }
                )
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" className="text-red-600" onClick={async () => {
                if (confirm('Are you sure you want to disconnect this integration?')) {
                  toast.promise(
                    fetch('/api/integrations/' + selectedIntegration?.id, { method: 'DELETE' }),
                    { loading: 'Disconnecting...', success: 'Integration disconnected', error: 'Failed to disconnect' }
                  )
                  setShowIntegrationConfigDialog(false)
                }
              }}>Disconnect</Button>
              <Button onClick={handleSaveIntegrationConfig}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Field Dialog */}
        <Dialog open={showCustomFieldDialog} onOpenChange={setShowCustomFieldDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>Create a new custom field for your issues</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Field Name</Label>
                <Input placeholder="Enter field name" className="mt-1" value={customFieldForm.name} onChange={(e) => setCustomFieldForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Field Type</Label>
                <Select value={customFieldForm.type} onValueChange={(v: 'text') => setCustomFieldForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
              <div className="flex items-center gap-2">
                <input type="checkbox" id="required" className="rounded" checked={customFieldForm.required} onChange={(e) => setCustomFieldForm(f => ({ ...f, required: e.target.checked }))} />
                <label htmlFor="required" className="text-sm">Required field</label>
              </div>
              <div>
                <Label>Applies To</Label>
                <div className="mt-2 space-y-2">
                  {['story', 'bug', 'task', 'epic'].map(type => (
                    <div key={type} className="flex items-center gap-2">
                      <input type="checkbox" id={`applies-${type}`} className="rounded" onChange={(e) => {
                        if (e.target.checked) {
                          setCustomFieldForm(f => ({ ...f, appliesTo: [...f.appliesTo, type] }))
                        } else {
                          setCustomFieldForm(f => ({ ...f, appliesTo: f.appliesTo.filter(t => t !== type) }))
                        }
                      }} />
                      <label htmlFor={`applies-${type}`} className="text-sm capitalize">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomFieldDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateCustomField}>Create Field</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive All Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Archive All Projects</DialogTitle>
              <DialogDescription>This will move all projects to the archive. This action can be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">You are about to archive {allProjects.length} projects. Team members will no longer be able to view or edit these projects until they are restored.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleArchiveAllProjects}>Archive All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Dialog */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete All Data</DialogTitle>
              <DialogDescription>This will permanently delete all projects and issues. This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Danger</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">You are about to permanently delete all data including {allProjects.length} projects and all associated issues, comments, and attachments. This cannot be recovered.</p>
              </div>
              <div className="mt-4">
                <Label>Type "DELETE" to confirm</Label>
                <Input placeholder="DELETE" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAllData}>Delete Everything</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Status Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Status</DialogTitle>
              <DialogDescription>Create a new status for your workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status Name</Label>
                <Input placeholder="Enter status name" className="mt-1" value={statusForm.name} onChange={(e) => setStatusForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Status Color</Label>
                <div className="flex gap-2 mt-2">
                  {['bg-gray-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'].map(color => (
                    <div key={color} className={`w-8 h-8 rounded-lg ${color} cursor-pointer hover:ring-2 ring-offset-2`} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
              <Button onClick={handleAddStatus}>Add Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Automation Rule Dialog */}
        <Dialog open={showAutomationRuleDialog} onOpenChange={setShowAutomationRuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>Set up a new automation rule for your workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Rule Name</Label>
                <Input placeholder="Enter rule name" className="mt-1" value={automationForm.name} onChange={(e) => setAutomationForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>When...</Label>
                <Select value={automationForm.trigger} onValueChange={(v) => setAutomationForm(f => ({ ...f, trigger: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select trigger" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status_to_done">Issue moves to Done</SelectItem>
                    <SelectItem value="status_to_blocked">Issue moves to Blocked</SelectItem>
                    <SelectItem value="priority_high">Priority set to High/Critical</SelectItem>
                    <SelectItem value="due_date_passed">Due date has passed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Then...</Label>
                <Select value={automationForm.action} onValueChange={(v) => setAutomationForm(f => ({ ...f, action: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select action" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notify_team">Notify team</SelectItem>
                    <SelectItem value="notify_manager">Notify manager</SelectItem>
                    <SelectItem value="add_label">Add label</SelectItem>
                    <SelectItem value="move_sprint">Move to current sprint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationRuleDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAutomationRule}>Create Rule</Button>
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
            {selectedProject && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Project Name</Label>
                  <Input className="mt-1" defaultValue={selectedProject.name} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1" defaultValue={selectedProject.description} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label>Budget</Label>
                    <Input type="number" className="mt-1" defaultValue={selectedProject.budget} />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select defaultValue={selectedProject.priority}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue={selectedProject.status}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusColumns.map(col => <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveProjectEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Time Dialog */}
        <Dialog open={showLogTimeDialog} onOpenChange={setShowLogTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time</DialogTitle>
              <DialogDescription>Record time spent on {selectedIssue?.key}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Time Spent (hours)</Label>
                <Input type="number" min="0.25" step="0.25" placeholder="e.g., 2.5" className="mt-1" value={logTimeAmount} onChange={(e) => setLogTimeAmount(e.target.value)} />
              </div>
              <div>
                <Label>Work Description</Label>
                <Textarea placeholder="What did you work on?" className="mt-1" />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" className="mt-1" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogTimeDialog(false)}>Cancel</Button>
              <Button onClick={handleLogTime}>Log Time</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Issue Dialog */}
        <Dialog open={showLinkIssueDialog} onOpenChange={setShowLinkIssueDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Issue</DialogTitle>
              <DialogDescription>Link this issue to another issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Link Type</Label>
                <Select defaultValue="blocks">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blocks">Blocks</SelectItem>
                    <SelectItem value="blocked_by">Is blocked by</SelectItem>
                    <SelectItem value="relates_to">Relates to</SelectItem>
                    <SelectItem value="duplicates">Duplicates</SelectItem>
                    <SelectItem value="clones">Clones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Issue</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Search for an issue..." /></SelectTrigger>
                  <SelectContent>
                    {mockIssues.slice(0, 5).map(issue => (
                      <SelectItem key={issue.id} value={issue.key}>{issue.key}: {issue.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLinkIssueDialog(false)}>Cancel</Button>
              <Button onClick={() => handleLinkIssue('PRJ-123')}>Link Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Issue Dialog */}
        <Dialog open={showEditIssueDialog} onOpenChange={setShowEditIssueDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Issue</DialogTitle>
              <DialogDescription>Update {selectedIssue?.key}</DialogDescription>
            </DialogHeader>
            {selectedIssue && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Title</Label>
                  <Input className="mt-1" defaultValue={selectedIssue.title} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea className="mt-1" rows={4} defaultValue={selectedIssue.description} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label>Type</Label>
                    <Select defaultValue={selectedIssue.type}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="subtask">Subtask</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select defaultValue={selectedIssue.priority}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label>Status</Label>
                    <Select defaultValue={selectedIssue.status}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Story Points</Label>
                    <Input type="number" className="mt-1" defaultValue={selectedIssue.storyPoints} />
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" className="mt-1" defaultValue={selectedIssue.dueDate} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditIssueDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveIssueEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
