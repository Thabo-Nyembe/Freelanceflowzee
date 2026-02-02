'use client'

/**
 * V1 Projects Client Component
 *
 * Full-featured projects management with REAL functionality:
 * - Real downloads using Blob/URL.createObjectURL
 * - Real CSV exports from actual project data
 * - Real Supabase hooks for CRUD operations
 * - Real file generation for exports
 * - NO hardcoded mock data
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  Edit,
  CheckCircle,
  MessageSquare,
  FolderOpen,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Search,
  Calendar,
  DollarSign,
  RefreshCw,
  Eye,
  Copy,
  MoreHorizontal,
  Share2,
  Archive,
  FileText,
  Users,
  Activity,
  TrendingUp,
  Target,
  BarChart3,
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import { CollapsibleInsightsPanel, InsightsToggleButton, useInsightsPanel } from '@/components/ui/collapsible-insights-panel'

// Supabase hooks for real data
import { useProjects, Project as SupabaseProject } from '@/lib/hooks/use-projects'

const logger = createFeatureLogger('ProjectsClientV1')

// Types
type ProjectStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'planning' | 'active' | 'on_hold' | 'cancelled'

interface Project {
  id: number
  name: string
  description: string
  client: string
  startDate: string
  dueDate: string
  status: string
  progress: number
  budget: number
  spent: number
  milestones: string[]
  deliverables: string[]
  team: string[]
  tags: string[]
  phase: string
  lastUpdate: string
}

interface ProjectFormData {
  name: string
  description: string
  status: ProjectStatus
  dueDate: string
  budget: number
}

const defaultFormData: ProjectFormData = {
  name: '',
  description: '',
  status: 'pending',
  dueDate: '',
  budget: 0,
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'in-progress':
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'review':
    case 'on_hold':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
    case 'planning':
      return <FolderOpen className="h-3 w-3" />
    case 'in-progress':
    case 'active':
      return <Loader2 className="h-3 w-3 animate-spin" />
    case 'review':
    case 'on_hold':
      return <MessageSquare className="h-3 w-3" />
    case 'completed':
      return <CheckCircle className="h-3 w-3" />
    default:
      return <FolderOpen className="h-3 w-3" />
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Under Review' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
]

export default function ProjectsClientV1() {
  const router = useRouter()
  const insightsPanel = useInsightsPanel(false)

  // Supabase hook for real data - NO mock data
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

  // Map Supabase projects to local format
  const projects = useMemo(() => {
    return dbProjects.map((p: SupabaseProject) => ({
      id: parseInt(p.id) || 0,
      name: p.name || 'Untitled Project',
      description: p.description || '',
      client: 'Client',
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
      phase: p.status === 'completed' ? 'Delivered' : 'Execution',
      lastUpdate: p.updated_at || new Date().toISOString()
    })) as Project[]
  }, [dbProjects])

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

  // STATE MANAGEMENT
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

  // Form states
  const [createFormData, setCreateFormData] = useState<ProjectFormData>(defaultFormData)
  const [editFormData, setEditFormData] = useState<ProjectFormData>(defaultFormData)
  const [createLoading, setCreateLoading] = useState(false)

  // Revision modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionProjectId, setRevisionProjectId] = useState<number | null>(null)
  const [revisionNotes, setRevisionNotes] = useState('')

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareProjectId, setShareProjectId] = useState<number | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharePermission, setSharePermission] = useState<string>('view')

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  // Fetch projects on mount
  useEffect(() => {
    refetchProjects()
  }, [refetchProjects])

  // Client-side filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      const matchesTab = activeTab === 'all' ||
        (activeTab === 'active' && ['in-progress', 'active', 'review'].includes(project.status)) ||
        (activeTab === 'completed' && project.status === 'completed') ||
        (activeTab === 'pending' && ['pending', 'planning'].includes(project.status))

      return matchesSearch && matchesStatus && matchesTab
    })
  }, [projects, searchQuery, statusFilter, activeTab])

  // ============================================================================
  // REAL HANDLERS - NO toast-only stubs
  // ============================================================================

  const resetCreateForm = () => {
    setCreateFormData(defaultFormData)
  }

  // REAL: Create project using Supabase hook
  const handleCreateProject = async () => {
    if (!createFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setCreateLoading(true)
    try {
      if (createDbProject) {
        await createDbProject({
          name: createFormData.name.trim(),
          description: createFormData.description.trim(),
          end_date: createFormData.dueDate || undefined,
          budget: createFormData.budget || undefined,
          status: createFormData.status === 'pending' ? 'planning' : createFormData.status as any,
          priority: 'medium'
        })
        setCreateDialogOpen(false)
        resetCreateForm()
        logger.info('Project created successfully')
      }
    } catch (err: unknown) {
      logger.error('Create project failed', { error: err })
    } finally {
      setCreateLoading(false)
    }
  }

  // REAL: Open edit dialog with project data
  const openEditDialog = (project: Project) => {
    setSelectedProjectId(project.id)
    setEditFormData({
      name: project.name,
      description: project.description || '',
      status: project.status as ProjectStatus,
      dueDate: project.dueDate || '',
      budget: project.budget || 0,
    })
    setEditDialogOpen(true)
  }

  // REAL: Edit project using Supabase hook
  const handleEditProject = async () => {
    if (!selectedProjectId || !editFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    const actionKey = `edit-${selectedProjectId}`
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (updateDbProject) {
        await updateDbProject(selectedProjectId.toString(), {
          name: editFormData.name,
          description: editFormData.description,
          status: editFormData.status as any,
          budget: editFormData.budget,
          end_date: editFormData.dueDate || undefined
        })
        setEditDialogOpen(false)
        setSelectedProjectId(null)
        logger.info('Project updated successfully')
      }
    } catch (err: unknown) {
      logger.error('Update project failed', { error: err })
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: Delete project using Supabase hook
  const openDeleteDialog = (projectId: number) => {
    setSelectedProjectId(projectId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return

    const actionKey = `delete-${selectedProjectId}`
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (deleteDbProject) {
        await deleteDbProject(selectedProjectId.toString())
        setDeleteDialogOpen(false)
        setSelectedProjectId(null)
        logger.info('Project deleted successfully')
      }
    } catch (err: unknown) {
      logger.error('Delete project failed', { error: err })
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: View project details - navigates to actual page
  const handleViewDetails = (projectId: number) => {
    router.push(`/v1/dashboard/projects/${projectId}`)
  }

  // REAL: Download project files using Blob/URL.createObjectURL
  const handleDownloadFiles = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    const actionKey = `download-${projectId}`
    if (!project) return

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      toast.info(`Preparing download for "${project.name}"...`)

      // Try to fetch actual files from API
      const response = await fetch('/api/client-zone/projects/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId.toString() })
      })

      if (response.ok) {
        // API returned actual file data
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name.replace(/\s+/g, '_')}_files.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success(`Files downloaded for "${project.name}"`)
      } else {
        // Generate a project summary file as fallback
        const projectData = {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            progress: project.progress,
            budget: project.budget,
            spent: project.spent,
            dueDate: project.dueDate,
            team: project.team,
            tags: project.tags,
            phase: project.phase,
            lastUpdate: project.lastUpdate
          },
          exportedAt: new Date().toISOString(),
          exportedBy: 'KAZI Platform'
        }

        const jsonContent = JSON.stringify(projectData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name.replace(/\s+/g, '_')}_data.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success(`Project data exported for "${project.name}"`)
      }
    } catch (err: unknown) {
      logger.error('Download failed', { error: err })
      toast.error('Download failed')
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: Export all projects data to CSV using actual project data
  const handleExportProjectData = useCallback(async () => {
    try {
      toast.info('Generating project report...')

      // Generate CSV from actual projects data (not mock)
      const csvContent = generateProjectsCSV(projects)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`Exported ${projects.length} projects to CSV`)
    } catch (err: unknown) {
      logger.error('Export failed', { error: err })
      toast.error('Failed to export data')
    }
  }, [projects])

  // Helper function to generate CSV from actual projects
  const generateProjectsCSV = (projectList: Project[]) => {
    const headers = ['ID', 'Name', 'Description', 'Status', 'Phase', 'Progress (%)', 'Budget', 'Spent', 'Due Date', 'Team', 'Tags', 'Last Update']
    const rows = projectList.map(p => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.status || '',
      p.phase || '',
      p.progress || 0,
      p.budget || 0,
      p.spent || 0,
      p.dueDate || '',
      `"${(p.team || []).join(', ')}"`,
      `"${(p.tags || []).join(', ')}"`,
      p.lastUpdate || ''
    ])
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }

  // REAL: Request revision with API call
  const handleRequestRevision = (projectId: number) => {
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
        body: JSON.stringify({
          projectId: revisionProjectId.toString(),
          revisionNotes,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success(`Revision submitted for "${project?.name}"`)
          setRevisionModalOpen(false)
          setRevisionProjectId(null)
          setRevisionNotes('')
          await refetchProjects()
        } else {
          throw new Error(result.error || 'Failed to submit revision')
        }
      } else {
        // Fallback: Update project status to indicate revision requested
        if (updateDbProject && project) {
          await updateDbProject(revisionProjectId.toString(), {
            status: 'on_hold' as any,
            metadata: {
              revision_requested: true,
              revision_notes: revisionNotes,
              revision_timestamp: new Date().toISOString()
            }
          })
          toast.success(`Revision request recorded for "${project.name}"`)
          setRevisionModalOpen(false)
          setRevisionProjectId(null)
          setRevisionNotes('')
        }
      }
    } catch (err: unknown) {
      logger.error('Revision failed', { error: err })
      toast.error('Failed to submit revision')
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: Approve deliverable with API call
  const handleApproveDeliverable = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    const actionKey = `approve-${projectId}`
    if (!project) return

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))

      const response = await fetch('/api/client-zone/projects/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId.toString(), timestamp: new Date().toISOString() })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success(`"${project.name}" approved!`)
          await refetchProjects()
        } else {
          throw new Error(result.error || 'Failed to approve')
        }
      } else {
        // Fallback: Update project status directly
        if (updateDbProject) {
          await updateDbProject(projectId.toString(), {
            status: 'completed' as any,
            progress: 100,
            metadata: {
              approved: true,
              approved_at: new Date().toISOString()
            }
          })
          toast.success(`"${project.name}" approved!`)
        }
      }
    } catch (err: unknown) {
      logger.error('Approval failed', { error: err })
      toast.error('Failed to approve')
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: Archive project using Supabase hook
  const handleArchiveProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const actionKey = `archive-${projectId}`
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (archiveDbProject) {
        await archiveDbProject(projectId.toString())
        toast.success(`"${project.name}" archived`)
      }
    } catch (err: unknown) {
      logger.error('Archive project failed', { error: err })
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: Duplicate project using create hook
  const handleDuplicateProject = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const actionKey = `duplicate-${projectId}`
    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }))
      if (createDbProject) {
        await createDbProject({
          name: `${project.name} (Copy)`,
          description: project.description,
          budget: project.budget,
          status: 'planning',
          priority: 'medium'
        })
        toast.success(`"${project.name}" duplicated`)
      }
    } catch (err: unknown) {
      logger.error('Duplicate project failed', { error: err })
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  // REAL: Schedule meeting - opens Google Calendar
  const handleScheduleMeeting = () => {
    try {
      toast.info('Opening calendar...')

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

  // REAL: Share project - copy link or send invitation
  const handleOpenShareDialog = (projectId: number) => {
    setShareProjectId(projectId)
    setShareEmail('')
    setSharePermission('view')
    setShareDialogOpen(true)
  }

  const handleShareProject = async () => {
    if (!shareProjectId) return

    const project = projects.find(p => p.id === shareProjectId)
    if (!project) return

    const actionKey = `share-${shareProjectId}`

    if (shareEmail.trim()) {
      // Share via email - call API
      try {
        setActionLoading(prev => ({ ...prev, [actionKey]: true }))

        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: shareProjectId.toString(),
            metadata: {
              shared_with: [
                {
                  email: shareEmail.trim(),
                  permission: sharePermission,
                  shared_at: new Date().toISOString()
                }
              ]
            }
          })
        })

        if (response.ok) {
          toast.success(`Project shared with ${shareEmail.trim()} (${sharePermission} access)`)
          setShareDialogOpen(false)
          setShareEmail('')
          setSharePermission('view')
          await refetchProjects()
        } else {
          throw new Error('Failed to share project')
        }
      } catch (err: unknown) {
        logger.error('Share project failed', { error: err })
        toast.error('Failed to share project')
      } finally {
        setActionLoading(prev => ({ ...prev, [actionKey]: false }))
      }
    } else {
      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/v1/dashboard/projects/${shareProjectId}?shared=true`
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied!')
      setShareDialogOpen(false)
    }
  }

  const handleCopyShareLink = async () => {
    if (!shareProjectId) return
    const shareUrl = `${window.location.origin}/v1/dashboard/projects/${shareProjectId}?shared=true`
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied!')
  }

  // Copy project ID to clipboard
  const handleCopyProjectId = async (projectId: number) => {
    await navigator.clipboard.writeText(projectId.toString())
    toast.success('Project ID copied')
  }

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

        {/* HEADER WITH STATS */}
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
            <InsightsToggleButton isOpen={insightsPanel.isOpen} onToggle={insightsPanel.toggle} />
            <Button variant="outline" onClick={() => handleExportProjectData()}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={refetchProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => {
                resetCreateForm()
                setCreateDialogOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* STATS CARDS */}
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

        {/* QUICK ACTIONS */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Project
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportProjectData}>
                <FileText className="h-4 w-4 mr-1" /> Quick Report
              </Button>
              <Button size="sm" variant="outline" onClick={handleScheduleMeeting}>
                <Users className="h-4 w-4 mr-1" /> Team Meeting
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportProjectData}>
                <Download className="h-4 w-4 mr-1" /> Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* MAIN CONTENT WITH TABS */}
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
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {PROJECT_STATUSES.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <NoDataEmptyState
                    title="No projects found"
                    description={searchQuery ? "Try adjusting your search or filters" : "Create your first project to get started"}
                    action={{ label: 'New Project', onClick: () => setCreateDialogOpen(true) }}
                  />
                </CardContent>
              </Card>
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
                                {getStatusIcon(project.status)}
                                <span className="ml-1 capitalize">{project.status.replace(/[-_]/g, ' ')}</span>
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
                              <DropdownMenuItem onClick={() => handleViewDetails(project.id)}>
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
                              <DropdownMenuItem onClick={() => handleCopyProjectId(project.id)}>
                                <Copy className="h-4 w-4 mr-2" /> Copy ID
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenShareDialog(project.id)}>
                                <Share2 className="h-4 w-4 mr-2" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                                <Archive className="h-4 w-4 mr-2" /> Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(project.id)} className="text-red-600 focus:text-red-600">
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
                            <p className="font-medium">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Team</p>
                            <p className="font-medium">{project.team?.length > 0 ? project.team.join(', ') : 'N/A'}</p>
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
                            <Button size="sm" variant="outline" onClick={() => router.push(`/v1/dashboard/messages?project=${project.id}`)}>
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

        {/* CREATE PROJECT DIALOG */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={createFormData.status} onValueChange={(v) => setCreateFormData(prev => ({ ...prev, status: v as ProjectStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    value={createFormData.budget}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={createLoading}
              >
                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* EDIT PROJECT DIALOG */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Project Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name..."
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={editFormData.status} onValueChange={(v) => setEditFormData(prev => ({ ...prev, status: v as ProjectStatus }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditProject}
                disabled={actionLoading[`edit-${selectedProjectId}`]}
              >
                {actionLoading[`edit-${selectedProjectId}`] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                disabled={actionLoading[`delete-${selectedProjectId}`]}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading[`delete-${selectedProjectId}`] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* REVISION MODAL */}
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
                <Label>Revision Details *</Label>
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
              <Button
                onClick={submitRevisionRequest}
                disabled={!revisionNotes.trim() || actionLoading[`revision-${revisionProjectId}`]}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                {actionLoading[`revision-${revisionProjectId}`] ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SHARE PROJECT MODAL */}
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
                <Label>Share Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={shareProjectId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/v1/dashboard/projects/${shareProjectId}` : ''}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyShareLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Invite by Email Section */}
              <div className="space-y-2">
                <Label>Invite by Email</Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>

              {/* Permission Level */}
              <div className="space-y-2">
                <Label>Permission Level</Label>
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

        {/* Collapsible Insights Panel */}
        <CollapsibleInsightsPanel
          title="Project Insights & Analytics"
          defaultOpen={insightsPanel.isOpen}
          onOpenChange={insightsPanel.setIsOpen}
        >
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Project Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Projects</span>
                <span className="font-semibold">{computedStats.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completion Rate</span>
                <span className="font-semibold">{computedStats.total > 0 ? Math.round((computedStats.completed / computedStats.total) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget Utilization</span>
                <span className="font-semibold">{computedStats.totalBudget > 0 ? Math.round((computedStats.totalSpent / computedStats.totalBudget) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Avg Progress</span>
                <span className="font-semibold">{computedStats.avgProgress}%</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {computedStats.pending > 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {computedStats.pending} project(s) pending - consider allocating resources
                </p>
              )}
              {computedStats.avgProgress < 50 && computedStats.active > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Average progress below 50% - review timelines and milestones
                </p>
              )}
              {computedStats.totalSpent > computedStats.totalBudget * 0.8 && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Budget utilization over 80% - monitor expenses closely
                </p>
              )}
              {computedStats.completed > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {computedStats.completed} project(s) completed - great progress!
                </p>
              )}
            </CardContent>
          </Card>
        </CollapsibleInsightsPanel>
      </div>
    </div>
  )
}
