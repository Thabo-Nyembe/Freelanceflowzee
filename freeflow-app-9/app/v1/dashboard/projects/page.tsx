'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Download,
  Edit,
  CheckCircle,
  MessageSquare,
  FolderOpen,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
  MoreVertical,
  Search,
  Filter,
  FileDown,
  Users,
  Calendar,
  DollarSign,
  X,
} from 'lucide-react'

// A+++ UTILITIES
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'

// CLIENT ZONE UTILITIES
import {
  Project,
  ProjectStatus,
  getStatusColor,
  getStatusIcon,
  formatCurrency
} from '@/lib/client-zone-utils'

const logger = createFeatureLogger('ClientZoneProjects')

// Status options for the dropdown
const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
]

// Available team members for picker
const AVAILABLE_TEAM_MEMBERS = [
  { id: '1', name: 'Sarah Johnson', role: 'Designer', avatar: '/avatars/sarah.jpg' },
  { id: '2', name: 'Michael Chen', role: 'Developer', avatar: '/avatars/michael.jpg' },
  { id: '3', name: 'Alex Thompson', role: 'Project Manager', avatar: '/avatars/alex.jpg' },
  { id: '4', name: 'Lisa Wang', role: 'UX Designer', avatar: '/avatars/lisa.jpg' },
  { id: '5', name: 'David Kim', role: 'Backend Developer', avatar: '/avatars/david.jpg' },
  { id: '6', name: 'Emma Wilson', role: 'Content Writer', avatar: '/avatars/emma.jpg' },
]

// ============================================================================
// FORM TYPES
// ============================================================================

interface ProjectFormData {
  name: string
  description: string
  status: ProjectStatus
  phase: string
  dueDate: string
  budget: number
  team: string[]
}

const defaultFormData: ProjectFormData = {
  name: '',
  description: '',
  status: 'pending',
  phase: 'Planning',
  dueDate: '',
  budget: 0,
  team: [],
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientZoneProjectsPage() {
  const router = useRouter()

  // A+++ UTILITIES
  const { userId: _userId, loading: _userLoading } = useCurrentUser()
  const { announce: _announce } = useAnnouncer()

  // STATE MANAGEMENT
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean
  }>({})

  // Filter/Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  // Revision request modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionProjectId, setRevisionProjectId] = useState<number | null>(null)
  const [revisionNotes, setRevisionNotes] = useState('')

  // Create project dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState<ProjectFormData>(defaultFormData)
  const [createLoading, setCreateLoading] = useState(false)

  // Edit project dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editProjectId, setEditProjectId] = useState<number | null>(null)
  const [editFormData, setEditFormData] = useState<ProjectFormData>(defaultFormData)
  const [editLoading, setEditLoading] = useState(false)

  // Delete project confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Add team member dialog state
  const [teamMemberDialogOpen, setTeamMemberDialogOpen] = useState(false)
  const [teamMemberProjectId, setTeamMemberProjectId] = useState<number | null>(null)
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([])
  const [teamMemberLoading, setTeamMemberLoading] = useState(false)

  // ============================================================================
  // FILTERED PROJECTS
  // ============================================================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.phase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.team.some(member => member.toLowerCase().includes(searchQuery.toLowerCase()))

      // Status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Fetching client projects')

      const response = await fetch('/api/client-zone/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setProjects(data.projects || [])
        logger.info('Projects loaded successfully', {
          count: data.projects?.length || 0
        })
      } else {
        throw new Error(data.error || 'Failed to load projects')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load projects'
      setError(errorMessage)
      logger.error('Failed to fetch projects', { error: err })
      toast.error('Failed to load projects', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ============================================================================
  // CREATE PROJECT HANDLERS
  // ============================================================================

  const handleOpenCreateDialog = () => {
    setCreateFormData(defaultFormData)
    setCreateDialogOpen(true)
    logger.info('Create project dialog opened')
  }

  const handleCreateProject = async () => {
    if (!createFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (!createFormData.description.trim()) {
      toast.error('Project description is required')
      return
    }

    setCreateLoading(true)

    const createPromise = fetch('/api/client-zone/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...createFormData,
        deliverables: [],
        progress: 0,
        spent: 0,
        lastUpdate: 'Just now'
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create project')
      }
      return response.json()
    })

    toast.promise(createPromise, {
      loading: 'Creating project...',
      success: (_data) => {
        logger.info('Project created successfully', { projectName: createFormData.name })
        setCreateDialogOpen(false)
        setCreateFormData(defaultFormData)
        fetchProjects()
        return `Project "${createFormData.name}" created successfully`
      },
      error: (err) => {
        logger.error('Failed to create project', { error: err })
        return err.message || 'Failed to create project'
      }
    })

    try {
      await createPromise
    } finally {
      setCreateLoading(false)
    }
  }

  // ============================================================================
  // EDIT PROJECT HANDLERS
  // ============================================================================

  const handleOpenEditDialog = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      toast.error('Project not found')
      return
    }

    setEditProjectId(projectId)
    setEditFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      phase: project.phase,
      dueDate: project.dueDate,
      budget: project.budget,
      team: project.team,
    })
    setEditDialogOpen(true)
    logger.info('Edit project dialog opened', { projectId, projectName: project.name })
  }

  const handleEditProject = async () => {
    if (!editProjectId) return

    if (!editFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setEditLoading(true)

    const editPromise = fetch(`/api/client-zone/projects/${editProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editFormData)
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update project')
      }
      return response.json()
    })

    toast.promise(editPromise, {
      loading: 'Updating project...',
      success: (_data) => {
        logger.info('Project updated successfully', {
          projectId: editProjectId,
          projectName: editFormData.name
        })
        setEditDialogOpen(false)
        setEditProjectId(null)
        setEditFormData(defaultFormData)
        fetchProjects()
        return `Project "${editFormData.name}" updated successfully`
      },
      error: (err) => {
        logger.error('Failed to update project', { error: err, projectId: editProjectId })
        return err.message || 'Failed to update project'
      }
    })

    try {
      await editPromise
    } finally {
      setEditLoading(false)
    }
  }

  // ============================================================================
  // DELETE PROJECT HANDLERS
  // ============================================================================

  const handleOpenDeleteDialog = (projectId: number) => {
    setDeleteProjectId(projectId)
    setDeleteDialogOpen(true)
    const project = projects.find((p) => p.id === projectId)
    logger.info('Delete confirmation opened', { projectId, projectName: project?.name })
  }

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return

    const project = projects.find((p) => p.id === deleteProjectId)
    setDeleteLoading(true)

    const deletePromise = fetch(`/api/client-zone/projects/${deleteProjectId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete project')
      }
      return response.json()
    })

    toast.promise(deletePromise, {
      loading: 'Deleting project...',
      success: () => {
        logger.info('Project deleted successfully', {
          projectId: deleteProjectId,
          projectName: project?.name
        })
        setDeleteDialogOpen(false)
        setDeleteProjectId(null)
        fetchProjects()
        return `Project "${project?.name}" deleted successfully`
      },
      error: (err) => {
        logger.error('Failed to delete project', { error: err, projectId: deleteProjectId })
        return err.message || 'Failed to delete project'
      }
    })

    try {
      await deletePromise
    } finally {
      setDeleteLoading(false)
    }
  }

  // ============================================================================
  // ADD TEAM MEMBER HANDLERS
  // ============================================================================

  const handleOpenTeamMemberDialog = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      toast.error('Project not found')
      return
    }

    setTeamMemberProjectId(projectId)
    setSelectedTeamMembers([])
    setTeamMemberDialogOpen(true)
    logger.info('Add team member dialog opened', { projectId, projectName: project.name })
  }

  const handleAddTeamMembers = async () => {
    if (!teamMemberProjectId || selectedTeamMembers.length === 0) {
      toast.error('Please select at least one team member')
      return
    }

    const project = projects.find((p) => p.id === teamMemberProjectId)
    setTeamMemberLoading(true)

    const memberNames = selectedTeamMembers.map(
      (id) => AVAILABLE_TEAM_MEMBERS.find((m) => m.id === id)?.name || id
    )

    const addMembersPromise = fetch(`/api/client-zone/projects/${teamMemberProjectId}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberIds: selectedTeamMembers,
        memberNames: memberNames
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to add team members')
      }
      return response.json()
    })

    toast.promise(addMembersPromise, {
      loading: 'Adding team members...',
      success: () => {
        logger.info('Team members added successfully', {
          projectId: teamMemberProjectId,
          members: memberNames
        })
        setTeamMemberDialogOpen(false)
        setTeamMemberProjectId(null)
        setSelectedTeamMembers([])
        fetchProjects()
        return `Added ${memberNames.join(', ')} to "${project?.name}"`
      },
      error: (err) => {
        logger.error('Failed to add team members', {
          error: err,
          projectId: teamMemberProjectId
        })
        return err.message || 'Failed to add team members'
      }
    })

    try {
      await addMembersPromise
    } finally {
      setTeamMemberLoading(false)
    }
  }

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  // ============================================================================
  // CHANGE STATUS HANDLER
  // ============================================================================

  const handleChangeStatus = async (projectId: number, newStatus: ProjectStatus) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    if (project.status === newStatus) {
      toast.info('Status is already set to ' + newStatus)
      return
    }

    const actionKey = `status-${projectId}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const statusPromise = fetch(`/api/client-zone/projects/${projectId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update status')
      }
      return response.json()
    })

    toast.promise(statusPromise, {
      loading: 'Updating status...',
      success: () => {
        logger.info('Project status updated', {
          projectId,
          projectName: project.name,
          oldStatus: project.status,
          newStatus
        })
        // Optimistically update local state
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, status: newStatus } : p
          )
        )
        return `Status updated to "${newStatus.replace('-', ' ')}"`
      },
      error: (err) => {
        logger.error('Failed to update status', { error: err, projectId })
        return err.message || 'Failed to update status'
      }
    })

    try {
      await statusPromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  // ============================================================================
  // EXPORT PROJECT DATA HANDLER
  // ============================================================================

  const handleExportProject = async (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) {
      toast.error('Project not found')
      return
    }

    const actionKey = `export-${projectId}`
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    try {
      logger.info('Exporting project data', { projectId, projectName: project.name })

      const response = await fetch(`/api/client-zone/projects/${projectId}/export`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to export project data')
      }

      const data = await response.json()

      // Create downloadable JSON file
      const exportData = data.project || project
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name.replace(/\s+/g, '_')}_export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      logger.info('Project data exported successfully', {
        projectId,
        projectName: project.name
      })

      toast.success(`Project data exported for "${project.name}"`)
    } catch (err: any) {
      // Fallback: export local data if API fails
      logger.warn('API export failed, using local fallback', { error: err })

      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.name.replace(/\s+/g, '_')}_export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`Project data exported for "${project.name}"`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  // ============================================================================
  // EXISTING BUTTON HANDLERS - FULLY WIRED
  // ============================================================================

  /**
   * Handler: Request Revision
   * Opens modal for user to provide detailed revision feedback
   */
  const handleRequestRevision = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)

    logger.info('Revision request modal opened', {
      projectId,
      projectName: project?.name
    })

    setRevisionProjectId(projectId)
    setRevisionModalOpen(true)
    setRevisionNotes('')
  }

  /**
   * Submit revision request with detailed feedback
   */
  const submitRevisionRequest = async () => {
    if (!revisionProjectId || !revisionNotes.trim()) {
      toast.error('Please provide revision details', {
        description: 'Describe what changes you need'
      })
      logger.warn('Revision request validation failed', {
        reason: 'Empty notes'
      })
      return
    }

    const project = projects.find((p) => p.id === revisionProjectId)
    const actionKey = `revision-${revisionProjectId}`

    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const revisionPromise = fetch('/api/client-zone/projects/revision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: revisionProjectId,
        projectName: project?.name,
        revisionNotes: revisionNotes,
        timestamp: new Date().toISOString()
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit revision request')
      }
      return response.json()
    })

    toast.promise(revisionPromise, {
      loading: 'Submitting revision request...',
      success: () => {
        logger.info('Revision request submitted successfully', {
          projectId: revisionProjectId,
          projectName: project?.name
        })
        setRevisionModalOpen(false)
        setRevisionProjectId(null)
        setRevisionNotes('')
        fetchProjects()
        return `Revision request submitted for "${project?.name}"`
      },
      error: (err) => {
        logger.error('Failed to submit revision request', {
          error: err,
          projectId: revisionProjectId
        })
        return err.message || 'Failed to submit revision request'
      }
    })

    try {
      await revisionPromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Handler: Approve Deliverable
   * Approves project deliverable and triggers milestone payment release
   */
  const handleApproveDeliverable = async (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    const actionKey = `approve-${projectId}`

    if (!project) {
      logger.error('Project not found', { projectId })
      return
    }

    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    const approvePromise = fetch('/api/client-zone/projects/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId,
        projectName: project.name,
        currentStatus: project.status,
        deliverables: project.deliverables,
        timestamp: new Date().toISOString()
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to approve deliverable')
      }
      return response.json()
    })

    toast.promise(approvePromise, {
      loading: 'Approving deliverable...',
      success: (result) => {
        logger.info('Deliverable approved successfully', {
          projectId,
          projectName: project.name,
          newStatus: result.newStatus
        })
        // Update local state with new status
        setProjects((prevProjects) =>
          prevProjects.map((p) =>
            p.id === projectId
              ? { ...p, status: result.newStatus || 'completed' }
              : p
          )
        )
        fetchProjects()
        return `"${project.name}" approved! Milestone payment will be released.`
      },
      error: (err) => {
        logger.error('Failed to approve deliverable', {
          error: err,
          projectId,
          projectName: project.name
        })
        return err.message || 'Failed to approve deliverable'
      }
    })

    try {
      await approvePromise
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Handler: Download Files
   * Downloads project files as ZIP archive with real Blob handling
   */
  const handleDownloadFiles = async (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    const actionKey = `download-${projectId}`

    if (!project) {
      logger.error('Project not found for download', { projectId })
      return
    }

    setActionLoading((prev) => ({ ...prev, [actionKey]: true }))

    try {
      logger.info('File download initiated', {
        projectId,
        projectName: project.name,
        deliverablesCount: project.deliverables.length
      })

      toast.info('Preparing download...', {
        description: `Packaging files for "${project.name}"`
      })

      const response = await fetch('/api/client-zone/projects/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          projectName: project.name
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download files')
      }

      // Get the blob data
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename =
        filenameMatch?.[1] || `${project.name.replace(/\s+/g, '_')}_files.zip`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      logger.info('Files downloaded successfully', {
        projectId,
        projectName: project.name,
        filename,
        size: blob.size
      })

      toast.success(`Files downloaded for "${project.name}"`, {
        description: `${filename} (${(blob.size / 1024 / 1024).toFixed(2)} MB)`
      })
    } catch (err: any) {
      logger.error('Failed to download files', {
        error: err,
        projectId,
        projectName: project.name
      })

      toast.error('Failed to download files', {
        description: err.message || 'Please try again later'
      })
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }))
    }
  }

  /**
   * Handler: View Details / Navigate
   * Navigate to detailed project view page
   */
  const handleViewDetails = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)

    logger.info('Viewing project details', {
      projectId,
      projectName: project?.name
    })

    router.push(`/dashboard/client-zone/projects/${projectId}`)

    toast.info(`Opening "${project?.name}" details...`)
  }

  /**
   * Handler: Discuss Project / Contact Team
   * Navigate to messages tab with project context
   */
  const handleDiscussProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)

    logger.info('Project discussion initiated', {
      projectId,
      projectName: project?.name
    })

    router.push(`/dashboard/client-zone?tab=messages&project=${projectId}`)

    toast.info('Opening team chat...', {
      description: `Discuss "${project?.name}" with your team`
    })
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState error={error} onRetry={fetchProjects} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <NoDataEmptyState
            title="No projects found"
            description="You don't have any active projects yet. Create your first project or contact your team to get started."
            action={{
              label: 'Create Project',
              onClick: handleOpenCreateDialog
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/client-zone')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Client Zone
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Track progress, approve deliverables, and manage project files
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <FolderOpen className="h-4 w-4 mr-2" />
              {filteredProjects.length} of {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </Badge>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              onClick={handleOpenCreateDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Filter/Search Bar */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects by name, description, phase, or team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* No results message */}
        {filteredProjects.length === 0 && projects.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/40">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No matching projects</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Projects List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">
                            {project.status.replace('-', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current Phase</p>
                          <p className="font-semibold">{project.phase}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-semibold">
                            {new Date(project.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Team</p>
                          <p className="font-semibold">{project.team.join(', ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Budget</p>
                          <p className="font-semibold">
                            {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(project.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenTeamMemberDialog(project.id)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Team Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportProject(project.id)}>
                          <FileDown className="h-4 w-4 mr-2" />
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-gray-500">
                          Change Status
                        </DropdownMenuLabel>
                        {PROJECT_STATUSES.map((status) => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() => handleChangeStatus(project.id, status.value)}
                            disabled={project.status === status.value}
                          >
                            {getStatusIcon(status.value)}
                            <span className="ml-2">{status.label}</span>
                            {project.status === status.value && (
                              <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                            )}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDeleteDialog(project.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span className="font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3" />
                  </div>

                  {/* Deliverables */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      Deliverables
                      <Badge variant="outline" className="text-xs">
                        {project.deliverables.length} items
                      </Badge>
                    </h4>
                    <div className="space-y-2">
                      {project.deliverables.map((deliverable, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(deliverable.status)}
                            <div>
                              <p className="font-medium">{deliverable.name}</p>
                              <p className="text-sm text-gray-600">
                                Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={getStatusColor(deliverable.status)}
                            variant="outline"
                          >
                            {deliverable.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFiles(project.id)}
                        disabled={actionLoading[`download-${project.id}`]}
                      >
                        {actionLoading[`download-${project.id}`] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 mr-1" />
                        )}
                        Download Files
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestRevision(project.id)}
                        disabled={actionLoading[`revision-${project.id}`]}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Request Revision
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(project.id)}
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        onClick={() => handleApproveDeliverable(project.id)}
                        disabled={actionLoading[`approve-${project.id}`]}
                      >
                        {actionLoading[`approve-${project.id}`] ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => handleDiscussProject(project.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Discuss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* CREATE PROJECT DIALOG */}
      {/* ================================================================== */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-name">Project Name *</Label>
              <Input
                id="create-name"
                placeholder="Enter project name"
                value={createFormData.name}
                onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-description">Description *</Label>
              <Textarea
                id="create-description"
                placeholder="Describe the project..."
                value={createFormData.description}
                onChange={(e) => setCreateFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-phase">Phase</Label>
                <Input
                  id="create-phase"
                  placeholder="e.g., Planning, Design, Development"
                  value={createFormData.phase}
                  onChange={(e) => setCreateFormData((prev) => ({ ...prev, phase: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={createFormData.status}
                  onValueChange={(value) => setCreateFormData((prev) => ({ ...prev, status: value as ProjectStatus }))}
                >
                  <SelectTrigger id="create-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-dueDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date
                </Label>
                <Input
                  id="create-dueDate"
                  type="date"
                  value={createFormData.dueDate}
                  onChange={(e) => setCreateFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-budget">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Budget
                </Label>
                <Input
                  id="create-budget"
                  type="number"
                  placeholder="0.00"
                  value={createFormData.budget || ''}
                  onChange={(e) => setCreateFormData((prev) => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={createLoading || !createFormData.name.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {createLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* EDIT PROJECT DIALOG */}
      {/* ================================================================== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter project name"
                value={editFormData.name}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the project..."
                value={editFormData.description}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phase">Phase</Label>
                <Input
                  id="edit-phase"
                  placeholder="e.g., Planning, Design, Development"
                  value={editFormData.phase}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, phase: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, status: value as ProjectStatus }))}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Due Date
                </Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editFormData.dueDate}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-budget">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Budget
                </Label>
                <Input
                  id="edit-budget"
                  type="number"
                  placeholder="0.00"
                  value={editFormData.budget || ''}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditProject}
              disabled={editLoading || !editFormData.name.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* DELETE PROJECT CONFIRMATION */}
      {/* ================================================================== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projects.find((p) => p.id === deleteProjectId)?.name}&quot;?
              This action cannot be undone. All project data, deliverables, and associated files will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ================================================================== */}
      {/* ADD TEAM MEMBER DIALOG */}
      {/* ================================================================== */}
      <Dialog open={teamMemberDialogOpen} onOpenChange={setTeamMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Members</DialogTitle>
            <DialogDescription>
              Select team members to add to &quot;{projects.find((p) => p.id === teamMemberProjectId)?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {AVAILABLE_TEAM_MEMBERS.map((member) => {
                const isCurrentTeamMember = projects
                  .find((p) => p.id === teamMemberProjectId)
                  ?.team.includes(member.name)
                const isSelected = selectedTeamMembers.includes(member.id)

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isCurrentTeamMember
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => !isCurrentTeamMember && toggleTeamMember(member.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    {isCurrentTeamMember ? (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Already on team
                      </Badge>
                    ) : isSelected ? (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    ) : null}
                  </div>
                )
              })}
            </div>
            {selectedTeamMembers.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Selected: {selectedTeamMembers.length} member{selectedTeamMembers.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTeamMembers}
              disabled={teamMemberLoading || selectedTeamMembers.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {teamMemberLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Team
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* REVISION REQUEST MODAL (existing) */}
      {/* ================================================================== */}
      {revisionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Request Revision</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRevisionModalOpen(false)
                  setRevisionProjectId(null)
                  setRevisionNotes('')
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  Project:{' '}
                  <span className="font-semibold">
                    {projects.find((p) => p.id === revisionProjectId)?.name}
                  </span>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Revision Request Guidelines</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Be specific about what needs to change</li>
                        <li>Include reference materials if possible</li>
                        <li>Team will respond within 24 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Revision Details *
                </label>
                <Textarea
                  placeholder="Describe the changes you need in detail..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {revisionNotes.length} characters
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRevisionModalOpen(false)
                    setRevisionProjectId(null)
                    setRevisionNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={submitRevisionRequest}
                  disabled={
                    !revisionNotes.trim() ||
                    actionLoading[`revision-${revisionProjectId}`]
                  }
                >
                  {actionLoading[`revision-${revisionProjectId}`] ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Submit Revision Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
