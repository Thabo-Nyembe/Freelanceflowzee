'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Download, Edit, CheckCircle, MessageSquare, FolderOpen, AlertCircle, Loader2,
  Plus, Search, Filter, BarChart3, TrendingUp, Target, RefreshCw, Eye, Copy, Trash2, MoreHorizontal, Share2, Activity,
  Archive, Sparkles
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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

import {
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'

import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Supabase Hooks
import { useProjects, Project as SupabaseProject } from '@/lib/hooks/use-projects'
import { useInsights } from '@/lib/hooks/use-insights-extended'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { useAnalyticsGoals } from '@/lib/hooks/use-analytics-extended'

// CLIENT ZONE UTILITIES
import {
  Project,
  getStatusColor,
  formatCurrency
} from '@/lib/client-zone-utils'

const logger = createSimpleLogger('ProjectsV2')




// Quick actions are defined inside component to access handlers

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectsClient() {
  const router = useRouter()
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Supabase hook for real data
  const {
    projects: dbProjects,
    stats: projectStats,
    isLoading: projectsLoading,
    error: projectsError,
    fetchProjects: refetchProjects,
    createProject: createDbProject,
    updateProject: updateDbProject,
    archiveProject: archiveDbProject,
    deleteProject: deleteDbProject
  } = useProjects()

  // Real Data Hooks
  const { insights } = useInsights({ limit: 4 })
  const { members } = useTeam()
  const { logs: activityLogs, refetch: refetchActivities } = useActivityLogs([], { category: 'project' }) // Filtering by 'project' if supported, otherwise just getting latest
  const { data: goals } = useAnalyticsGoals(userId || undefined)

  // Map Data
  const projectsAIInsights = useMemo(() => {
    if (!insights || insights.length === 0) return []
    return insights.map((insight: any) => ({
      id: insight.id,
      type: (['alert', 'recommendation', 'opportunity', 'prediction'].includes(insight.type) ? insight.type : 'alert'),
      title: insight.title || 'Insight',
      description: insight.description || '',
      priority: (insight.priority === 'high' || insight.priority === 'medium' || insight.priority === 'low') ? insight.priority : 'medium',
      timestamp: insight.created_at,
      category: insight.category || 'General'
    }))
  }, [insights])

  const projectsCollaborators = useMemo(() => {
    if (!members || members.length === 0) return []
    return members.map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar_url || '',
      status: m.status === 'active' ? 'online' : 'offline',
      role: m.role || 'Member',
      lastActive: m.updated_at ? new Date(m.updated_at).toLocaleDateString() : 'Unknown'
    })) as unknown[]
  }, [members])

  const projectsActivities = useMemo(() => {
    if (!activityLogs || activityLogs.length === 0) return []
    return activityLogs.slice(0, 5).map(log => ({
      id: log.id,
      user: {
        id: log.user_id || '0',
        name: log.user_name || log.user_email || 'Unknown User',
        avatar: '' // Placeholder if avatar not in log
      },
      action: log.action || 'updated',
      target: { type: 'project', name: log.resource_name || 'Project', url: '#' },
      timestamp: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: (['delete', 'comment', 'update', 'create', 'mention', 'assignment', 'status_change', 'milestone', 'integration'].includes(log.action) ? log.action : 'update')
    }))
  }, [activityLogs])

  const projectsPredictions = useMemo(() => {
    if (!goals || goals.length === 0) {
      // Fallback if no goals, maybe show empty or some defaults if needed, 
      // but for now let's return a valid empty structure or minimal defaults
      // so it doesn't crash if arrays are expected to be non-empty by the component (checked below: component handles it?)
      // Actually component loops, so empty array is fine.
      return []
    }
    return goals.slice(0, 3).map((g: any) => ({
      id: g.id,
      label: g.name || 'Goal',
      current: g.current_value || 0,
      target: g.target_value || 100,
      predicted: g.projected_value || 0,
      confidence: g.confidence_score || 0,
      trend: (g.trend === 'up' || g.trend === 'down') ? g.trend : 'neutral'
    })) as unknown[]
  }, [goals])


  // STATE MANAGEMENT - Simplified to use hook data directly
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  // Map Supabase projects to local format
  const projects = useMemo(() => {
    return dbProjects.map((p: SupabaseProject) => ({
      id: parseInt(p.id) || 0,
      name: p.name || 'Untitled Project',
      description: p.description || '',
      client: 'Client', // Default since not in hook
      startDate: p.start_date || new Date().toISOString(),
      dueDate: p.end_date || new Date().toISOString(),
      status: p.status || 'planning',
      progress: p.progress || 0,
      budget: p.budget || 0,
      spent: p.spent || 0,
      milestones: [],
      deliverables: [],
      team: p.team_members || [],
      tags: p.tags || [],
      phase: p.status === 'completed' ? 'Delivered' : 'Execution', // Derived phase
      lastUpdate: p.updated_at || new Date().toISOString()
    })) as Project[]
  }, [dbProjects])

  // V2 Enhanced State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<number[]>([])

  // Revision modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionProjectId, setRevisionProjectId] = useState<number | null>(null)
  const [revisionNotes, setRevisionNotes] = useState('')

  // Create project form state
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectDueDate, setNewProjectDueDate] = useState('')
  const [newProjectBudget, setNewProjectBudget] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [showInsights, setShowInsights] = useState(false) // Default hidden for "cascade" effect
  const insightsPanel = useInsightsPanel(false)

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareProjectId, setShareProjectId] = useState<number | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<string>('view')

  // ============================================================================
  // DATA FETCHING - Uses Supabase hook directly
  // ============================================================================

  // Fetch projects on mount
  useEffect(() => {
    refetchProjects()
  }, [refetchProjects])

  // ============================================================================
  // FILTERED & COMPUTED DATA
  // ============================================================================

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesTab = activeTab === 'all' ||
        (activeTab === 'active' && ['in-progress', 'review'].includes(project.status)) ||
        (activeTab === 'completed' && project.status === 'completed') ||
        (activeTab === 'pending' && project.status === 'pending')
      return matchesSearch && matchesStatus && matchesTab
    })
  }, [projects, searchQuery, statusFilter, activeTab])

  // Use Supabase stats directly
  const computedStats = useMemo(() => ({
    total: projectStats.total,
    active: projectStats.active,
    completed: projectStats.completed,
    pending: projectStats.onHold || 0,
    totalBudget: projectStats.totalBudget,
    totalSpent: projectStats.totalSpent,
    avgProgress: projectStats.avgProgress || 0,
  }), [projectStats])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRequestRevision = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    setRevisionProjectId(projectId)
    setRevisionModalOpen(true)
    setRevisionNotes('')
  }

  const submitRevisionRequest = async () => {
    if (!revisionProjectId || !revisionNotes.trim()) {
      toast.error('Please provide revision details')
      return
    }

    const project = projects.find(p => p.id === revisionProjectId)
    const actionKey = `revision-${revisionProjectId}`

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      const response = await fetch('/api/client-zone/projects/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: revisionProjectId, revisionNotes, timestamp: new Date().toISOString() })
      })

      if (!response.ok) throw new Error('Failed to submit revision')

      const result = await response.json()
      if (result.success) {
        toast.success('Revision submitted for "' + project?.name + '"')
        setRevisionModalOpen(false)
        setRevisionProjectId(null)
        setRevisionNotes('')
        await refetchProjects()
      } else {
        throw new Error(result.error || 'Failed to submit revision')
      }
    } catch (err: unknown) {
      logger.error('Revision failed', { error: err })
      toast.error('Failed to submit revision')
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleApproveDeliverable = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    const actionKey = `approve-${projectId}`
    if (!project) return

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      const response = await fetch('/api/client-zone/projects/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, timestamp: new Date().toISOString() })
      })

      if (!response.ok) throw new Error('Failed to approve')

      const result = await response.json()
      if (result.success) {
        toast.success('"' + project.name + '" approved!')
        await refetchProjects()
      } else {
        throw new Error(result.error || 'Failed to approve')
      }
    } catch (err: unknown) {
      logger.error('Approval failed', { error: err })
      toast.error('Failed to approve')
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleDownloadFiles = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    const actionKey = `download-${projectId}`
    if (!project) return

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      toast.info('Preparing download for "' + project.name + '"...')

      const response = await fetch('/api/client-zone/projects/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name.replace(/\s+/g, '_')}_files.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Files downloaded for "' + project.name + '"')
    } catch (err: unknown) {
      toast.error('Download failed')
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // ============================================================================
  // PROJECT CRUD HANDLERS
  // ============================================================================

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required')
      return
    }

    setCreateLoading(true)
    try {
      if (createDbProject) {
        await createDbProject({
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
          end_date: newProjectDueDate || undefined,
          budget: newProjectBudget ? parseFloat(newProjectBudget) : undefined,
          status: 'planning',
          priority: 'medium'
        })
        setShowCreateModal(false)
        setNewProjectName('')
        setNewProjectDescription('')
        setNewProjectDueDate('')
        setNewProjectBudget('')
        // refetchProjects is handled by hook subscription usually, or we can await it if returned
      } else {
        throw new Error('Create function not available')
      }
    } catch (err: unknown) {
      logger.error('Create project failed', { error: err })
      // toast handled by hook
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const confirmed = confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)
    if (!confirmed) return

    const actionKey = `delete-${projectId}`
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (deleteDbProject) {
        await deleteDbProject(project.id.toString()) // Assuming hook takes string ID
      }
    } catch (err: unknown) {
      logger.error('Delete project failed', { error: err })
      // toast handled by hook
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleArchiveProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const actionKey = 'archive-' + projectId
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (archiveDbProject) {
        await archiveDbProject(project.id.toString())
      }
    } catch (err: unknown) {
      logger.error('Archive project failed', { error: err })
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleExportProjectData = async () => {
    try {
      toast.info('Generating project report...')

      const response = await fetch('/api/projects?include_stats=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch project data')
      }

      const data = await response.json()

      // Generate CSV report
      const csvContent = generateProjectsCSV(data.projects || [])
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Project data exported')
    } catch (err: unknown) {
      logger.error('Export failed', { error: err })
      toast.error('Failed to export data')
    }
  }

  const handleDuplicateProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const actionKey = 'duplicate-' + projectId
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (createDbProject) {
        await createDbProject({
          name: project.name + ' (Copy)',
          description: project.description,
          budget: project.budget,
          status: 'planning',
          priority: 'medium'
        })
      }
    } catch (err: unknown) {
      logger.error('Duplicate project failed', { error: err })
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleScheduleMeeting = async () => {
    try {
      toast.info('Opening calendar...')

      // Create a calendar event URL (Google Calendar)
      const startTime = new Date()
      startTime.setHours(startTime.getHours() + 1)
      startTime.setMinutes(0)
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + 1)

      const eventTitle = encodeURIComponent('Project Team Meeting')
      const eventDetails = encodeURIComponent('Discuss project progress and next steps')
      const startStr = startTime.toISOString().replace(/-|:|\.\d\d\d/g, '')
      const endStr = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '')

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${startStr}/${endStr}`

      window.open(calendarUrl, '_blank')
      toast.success('Calendar opened')
    } catch (err: unknown) {
      toast.error('Failed to open calendar')
    }
  }

  const handleOpenShareDialog = (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    setShareProjectId(projectId)
    setShareEmail('')
    setSharePermission('view')
    setShareDialogOpen(true)
  }

  const handleShareProject = async () => {
    if (!shareProjectId) return

    const project = projects.find(p => p.id === shareProjectId)
    if (!project) return

    const actionKey = 'share-' + shareProjectId

    // If email is provided, share via email
    if (shareEmail.trim()) {
      try {
        setActionLoading(prev => ({ ...prev, [actionKey]: true }))
        toast.success('Sharing project...')
        // Call API to share project
        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: shareProjectId,
            metadata: {
              shared_with: [
                ...((project as Record<string, unknown>).metadata?.shared_with || []),
                {
                  email: shareEmail.trim(),
                  permission: sharePermission,
                  shared_at: new Date().toISOString()
                }
              ]
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to share project')
        }

        const result = await response.json()
        if (result.success) {
          toast.success('Project shared! Shared with ' + sharePermission + ' access')
          setShareDialogOpen(false)
          setShareEmail('')
          setSharePermission('view')
          await refetchProjects()
        } else {
          throw new Error(result.error || 'Failed to share project')
        }
      } catch (err: unknown) {
        logger.error('Share project failed', { error: err })
        toast.error('Failed to share project')
      } finally {
        setActionLoading(prev => ({ ...prev, [actionKey]: false }))
      }
    } else {
      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/dashboard/projects/${shareProjectId}?shared=true`
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied!')
      setShareDialogOpen(false)
    }
  }

  const handleCopyShareLink = async () => {
    if (!shareProjectId) return
    const shareUrl = `${window.location.origin}/dashboard/projects/${shareProjectId}?shared=true`
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied!')
  }

  // Helper function to generate CSV from projects
  const generateProjectsCSV = (projectList: Project[]) => {
    const headers = ['ID', 'Name', 'Description', 'Status', 'Phase', 'Progress', 'Budget', 'Spent', 'Due Date', 'Team']
    const rows = projectList.map(p => [
      p.id,
      `"${p.name?.replace(/"/g, '""') || ''}"`,
      `"${p.description?.replace(/"/g, '""') || ''}"`,
      p.status || '',
      p.phase || '',
      p.progress || 0,
      p.budget || 0,
      p.spent || 0,
      p.dueDate || '',
      `"${p.team?.join(', ') || ''}"`
    ])
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  // Quick actions with real handlers
  const projectsQuickActions = [
    { id: '1', label: 'New Project', icon: 'Plus', shortcut: 'N', action: () => setShowCreateModal(true) },
    { id: '2', label: 'Quick Report', icon: 'FileText', shortcut: 'R', action: handleExportProjectData },
    { id: '3', label: 'Team Meeting', icon: 'Users', shortcut: 'M', action: handleScheduleMeeting },
    { id: '4', label: 'Export Data', icon: 'Download', shortcut: 'E', action: handleExportProjectData },
  ]

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (projectsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState error={projectsError} onRetry={refetchProjects} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">

        {/* ================================================================
            HEADER WITH STATS
            ================================================================ */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <FolderOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Projects
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage projects, track progress, and collaborate with your team
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={refetchProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <InsightsToggleButton
              isOpen={insightsPanel.isOpen}
              onToggle={insightsPanel.toggle}
            />
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* ================================================================
            STATS CARDS
            ================================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{computedStats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{computedStats.active}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{computedStats.completed}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{computedStats.avgProgress}%</p>
                  <p className="text-xs text-gray-500">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(computedStats.totalBudget)}</p>
                  <p className="text-xs text-gray-500">Total Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50">
                  <BarChart3 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(computedStats.totalSpent)}</p>
                  <p className="text-xs text-gray-500">Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================================================================
            V2 COMPETITIVE UPGRADE COMPONENTS
            ================================================================ */}

        {/* Toggle Button for Insights is added in the header section above */}



        {/* ================================================================
            V2 COMPETITIVE UPGRADE COMPONENTS (COLLAPSIBLE)
            ================================================================ */}
        {insightsPanel.isOpen && (
          <CollapsibleInsightsPanel title="Insights & Analytics" defaultOpen={true} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <AIInsightsPanel insights={projectsAIInsights} />
              <PredictiveAnalytics predictions={projectsPredictions} />
              <CollaborationIndicator collaborators={projectsCollaborators} />
            </div>

            {/* ================================================================
                QUICK ACTIONS & ACTIVITY
                ================================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActionsToolbar actions={projectsQuickActions} />
              <ActivityFeed activities={projectsActivities} />
            </div>
          </CollapsibleInsightsPanel>
        )}

        {/* ================================================================
            MAIN CONTENT WITH TABS
            ================================================================ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/70 dark:bg-gray-800/70"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/70 dark:bg-gray-800/70">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredProjects.length === 0 ? (
              <NoDataEmptyState
                title="No projects found"
                description={searchQuery ? "Try adjusting your search or filters" : "Create your first project to get started"}
                action={{ label: 'New Project', onClick: () => setShowCreateModal(true) }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 hover:shadow-lg transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">{project.name}</CardTitle>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <CardDescription>{project.description}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
                                <Eye className="h-4 w-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownloadFiles(project.id)}>
                                <Download className="h-4 w-4 mr-2" /> Download Files
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRequestRevision(project.id)}>
                                <Edit className="h-4 w-4 mr-2" /> Request Revision
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDuplicateProject(project.id)}>
                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id.toString()).then(() => toast.success('Project ID copied'))}>
                                <Copy className="h-4 w-4 mr-2" /> Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenShareDialog(project.id)}>
                                <Share2 className="h-4 w-4 mr-2" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                                <Archive className="h-4 w-4 mr-2" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Phase</p>
                            <p className="font-medium">{project.phase}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Due Date</p>
                            <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Team</p>
                            <p className="font-medium">{project.team?.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Budget</p>
                            <p className="font-medium">{formatCurrency(project.spent || 0)} / {formatCurrency(project.budget || 0)}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleDownloadFiles(project.id)} disabled={actionLoading[`download-${project.id}`]}>
                              {actionLoading[`download-${project.id}`] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/messages?project=${project.id}`)}>
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleRequestRevision(project.id)}>
                              <Edit className="h-3 w-3 mr-1" /> Revision
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => handleApproveDeliverable(project.id)} disabled={actionLoading[`approve-${project.id}`]}>
                              {actionLoading[`approve-${project.id}`] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Approve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ================================================================
            REVISION MODAL
            ================================================================ */}
        <Dialog open={revisionModalOpen} onOpenChange={setRevisionModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Revision</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Project: <span className="font-semibold">{projects.find(p => p.id === revisionProjectId)?.name}</span>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Guidelines</p>
                    <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 mt-1">
                      <li>Be specific about changes needed</li>
                      <li>Include references if possible</li>
                      <li>Team responds within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Revision Details *</label>
                <Textarea
                  placeholder="Describe the changes you need..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRevisionModalOpen(false)}>Cancel</Button>
              <Button onClick={submitRevisionRequest} disabled={!revisionNotes.trim() || actionLoading[`revision-${revisionProjectId}`]} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                {actionLoading[`revision-${revisionProjectId}`] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================
            CREATE PROJECT MODAL
            ================================================================ */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <Input
                  placeholder="Enter project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Describe the project..."
                  className="min-h-[100px]"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={newProjectDueDate}
                    onChange={(e) => setNewProjectDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={handleCreateProject}
                disabled={createLoading || !newProjectName.trim()}
              >
                {createLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================
            SHARE PROJECT MODAL
            ================================================================ */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Share Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Project: <span className="font-semibold">{projects.find(p => p.id === shareProjectId)?.name}</span>
              </p>

              {/* Share Link Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Share Link</label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={shareProjectId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/projects/${shareProjectId}` : ''}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyShareLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Invite by Email Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Invite by Email</label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>

              {/* Permission Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Permission Level</label>
                <Select value={sharePermission} onValueChange={setSharePermission}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="comment">Can Comment</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                    <SelectItem value="admin">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                onClick={handleShareProject}
                disabled={actionLoading[`share-${shareProjectId}`]}
              >
                {actionLoading[`share-${shareProjectId}`] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                {shareEmail.trim() ? 'Send Invitation' : 'Copy Link'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  )
}
