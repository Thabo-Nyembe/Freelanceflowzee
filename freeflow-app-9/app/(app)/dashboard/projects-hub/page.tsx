'use client'

import React, { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { NumberFlow } from '@/components/ui/number-flow'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AIEnhancedInput } from '@/components/ai-create/ai-enhanced-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Plus,
  Search,
  DollarSign,
  Users,
  CheckCircle,
  Calendar,
  Edit,
  Eye,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Brain,
  Trash2,
  LayoutTemplate,
  BarChart3,
  Upload,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// PRODUCTION LOGGER
import { createFeatureLogger } from '@/lib/logger'
const logger = createFeatureLogger('ProjectsHub')

// A+++ Utilities
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useInfiniteScroll } from '@/lib/hooks/use-infinite-scroll'

// 3-Step Project Creation Wizard
import { ProjectCreationWizard } from '@/components/projects/project-creation-wizard'

// AI FEATURES
import { RevenueInsightsWidget } from '@/components/ai/revenue-insights-widget'
import { useCurrentUser, useRevenueData } from '@/hooks/use-ai-data'

// Shared utilities
import {
  Project,
  calculateStats,
  filterProjects,
  getStatusColor,
  getPriorityColor,
  formatDate
} from '@/lib/projects-hub-utils'

// Database operations
import {
  updateProject,
  deleteProject
} from '@/lib/projects-hub-queries'

// Memoized ProjectCard component
interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onUpdateStatus: (id: string, status: string) => void
}

const ProjectCard = memo(({ project, onView, onEdit, onDelete, onUpdateStatus }: ProjectCardProps) => {
  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.title}</h3>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(project.status))}>
                {project.status}
              </Badge>
              <div className={cn("w-3 h-3 rounded-full", getPriorityColor(project.priority))} title={`${project.priority} priority`}></div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                <p className="font-medium dark:text-gray-200">{project.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                <p className="font-medium dark:text-gray-200">${project.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                <p className="font-medium dark:text-gray-200">{formatDate(project.end_date)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Progress</span>
                <span className="text-sm font-medium dark:text-gray-200">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{project.team_members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{project.comments_count} comments</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onView(project)}
                  data-testid="view-project-btn"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEdit(project)}
                  data-testid="edit-project-btn"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(project)}
                  data-testid="delete-project-btn"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>

                {project.status === 'active' && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => onUpdateStatus(project.id, 'completed')}
                    data-testid="complete-project-btn"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProjectCard.displayName = 'ProjectCard'

export default function ProjectsOverviewPage() {
  // REAL USER AUTH & REVENUE DATA
  const { userId, loading: userLoading } = useCurrentUser()
  const { data: revenueData, loading: revenueLoading, refresh: refreshRevenue } = useRevenueData(userId || undefined)

  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // NEW: CRUD Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    client: '',
    budget: 0,
    deadline: '',
    start_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general',
    status: 'Not Started' as 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'
  })
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client_name: '',
    budget: '',
    end_date: '',
    start_date: '',
    priority: 'medium',
    category: 'web-development',
    team_members: [] as string[],
    initial_files: [] as File[],
    milestones: [] as { title: string; amount: string; dueDate: string }[],
    permissions: 'private' as 'private' | 'team' | 'public'
  })

  // Infinite Scroll State
  const [displayedProjectsCount, setDisplayedProjectsCount] = useState(12)

  // AI Panel State
  const [showAIPanel, setShowAIPanel] = useState(true)

  // A+++ Accessibility
  const { announce } = useAnnouncer()

  // INFINITE SCROLL
  const handleLoadMoreProjects = React.useCallback(() => {
    if (displayedProjectsCount < filteredProjects.length) {
      logger.info('Loading more projects', {
        currentCount: displayedProjectsCount,
        totalProjects: filteredProjects.length,
        loadingMore: 12
      })

      setDisplayedProjectsCount(prev => Math.min(prev + 12, filteredProjects.length))

      toast.info('Loading more projects...', {
        description: `Showing ${Math.min(displayedProjectsCount + 12, filteredProjects.length)} of ${filteredProjects.length} projects`
      })
    }
  }, [displayedProjectsCount, filteredProjects.length])

  const { ref: scrollContainerRef, isLoading: isLoadingMore } = useInfiniteScroll(
    handleLoadMoreProjects,
    { threshold: 300, enabled: displayedProjectsCount < filteredProjects.length }
  )

  // Displayed Projects
  const displayedProjects = React.useMemo(() => {
    return filteredProjects.slice(0, displayedProjectsCount)
  }, [filteredProjects, displayedProjectsCount])

  // Enhanced Handlers
  const handleViewProject = (project: Project) => {
    logger.info('Project view opened', { projectId: project.id, title: project.title })
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  // NEW: Handle Edit Project with CRUD modal
  const handleEditProject = (project: Project) => {
    logger.info('Project edit opened', { projectId: project.id, title: project.title })
    setSelectedProject(project)

    // Convert UI project to edit form data
    setEditFormData({
      name: project.title,
      description: project.description || '',
      client: project.client_name || '',
      budget: project.budget || 0,
      deadline: project.end_date || '',
      start_date: project.start_date || '',
      priority: project.priority || 'medium',
      category: project.category || 'general',
      status: project.status === 'active' ? 'In Progress' :
              project.status === 'completed' ? 'Completed' :
              project.status === 'paused' ? 'On Hold' :
              project.status === 'cancelled' ? 'Cancelled' : 'Not Started'
    })

    setShowEditModal(true)
  }

  // NEW: Handle Update Project with Database
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId || !selectedProject) {
      toast.error('Please log in to update projects')
      logger.warn('Project update attempted without authentication')
      return
    }

    if (!editFormData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    try {
      logger.info('Updating project', { projectId: selectedProject.id, userId })

      const { data, error } = await updateProject(selectedProject.id, {
        name: editFormData.name,
        description: editFormData.description,
        client: editFormData.client,
        budget: editFormData.budget,
        deadline: editFormData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: editFormData.start_date || new Date().toISOString(),
        priority: editFormData.priority,
        category: editFormData.category,
        status: editFormData.status,
        updated_at: new Date().toISOString()
      } as any)

      if (error || !data) {
        logger.error('Failed to update project', { error, projectId: selectedProject.id })
        toast.error('Failed to update project', {
          description: error?.message || 'Please try again'
        })
        return
      }

      // Transform updated data back to UI format
      const updatedUIProject = {
        ...selectedProject,
        title: data.name,
        description: data.description || '',
        client_name: data.client,
        budget: data.budget,
        end_date: data.deadline,
        start_date: data.start_date,
        priority: data.priority,
        category: data.category,
        status: data.status === 'In Progress' ? 'active' as const :
                data.status === 'Completed' ? 'completed' as const :
                data.status === 'On Hold' ? 'paused' as const :
                data.status === 'Cancelled' ? 'cancelled' as const : 'draft' as const
      }

      // Update local state
      setProjects(projects.map(p =>
        p.id === selectedProject.id ? updatedUIProject : p
      ))

      toast.success(`Project "${data.name}" updated!`, {
        description: `Budget: $${data.budget.toLocaleString()} • Priority: ${data.priority}`
      })

      logger.info('Project updated successfully', {
        projectId: data.id,
        projectName: data.name
      })

      setShowEditModal(false)
      setSelectedProject(null)

      announce(`Project ${data.name} updated successfully`, 'polite')
    } catch (err) {
      logger.error('Unexpected error updating project', { error: err, projectId: selectedProject.id })
      toast.error('Unexpected error occurred')
      announce('Error updating project', 'assertive')
    }
  }

  // NEW: Handle Delete Project
  const handleDeleteProject = (project: Project) => {
    logger.info('Project delete dialog opened', { projectId: project.id, title: project.title })
    setSelectedProject(project)
    setShowDeleteDialog(true)
  }

  // NEW: Handle Confirm Delete with Database
  const handleConfirmDelete = async () => {
    if (!userId || !selectedProject) {
      toast.error('Please log in to delete projects')
      logger.warn('Project deletion attempted without authentication')
      return
    }

    try {
      logger.info('Deleting project', { projectId: selectedProject.id, userId })

      const { success, error } = await deleteProject(selectedProject.id)

      if (error || !success) {
        logger.error('Failed to delete project', { error, projectId: selectedProject.id })
        toast.error('Failed to delete project', {
          description: error?.message || 'Please try again'
        })
        return
      }

      // Remove from local state
      setProjects(projects.filter(p => p.id !== selectedProject.id))

      toast.success(`Project "${selectedProject.title}" deleted`, {
        description: 'Project has been permanently removed'
      })

      logger.info('Project deleted successfully', {
        projectId: selectedProject.id,
        projectName: selectedProject.title
      })

      setShowDeleteDialog(false)
      setSelectedProject(null)

      announce(`Project ${selectedProject.title} deleted`, 'polite')
    } catch (err) {
      logger.error('Unexpected error deleting project', { error: err, projectId: selectedProject.id })
      toast.error('Unexpected error occurred')
      announce('Error deleting project', 'assertive')
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title')
      return
    }

    logger.info('Project creation started', { title: newProject.title, userId })

    try {
      // Import projects queries utility
      const { createProject } = await import('@/lib/projects-hub-queries')

      // Create project in Supabase
      const { data: createdProject, error: createError } = await createProject(userId, {
        name: newProject.title,
        description: newProject.description,
        client: newProject.client_name,
        budget: parseFloat(newProject.budget) || 0,
        deadline: newProject.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: newProject.start_date || new Date().toISOString(),
        priority: newProject.priority as 'low' | 'medium' | 'high' | 'urgent',
        category: newProject.category,
        tags: [],
        status: 'Not Started',
        progress: 0
      })

      if (createError || !createdProject) {
        throw new Error(createError?.message || 'Failed to create project')
      }

      // Transform to UI format
      const uiProject = {
        id: createdProject.id,
        title: createdProject.name,
        description: createdProject.description || '',
        status: 'draft' as const,
        progress: 0,
        client_name: createdProject.client,
        budget: createdProject.budget,
        spent: 0,
        start_date: createdProject.start_date,
        end_date: createdProject.deadline,
        team_members: [],
        priority: createdProject.priority,
        comments_count: 0,
        attachments: [],
        category: createdProject.category,
        tags: []
      }

      logger.info('Project created successfully in Supabase', { projectId: createdProject.id })

      setProjects([...projects, uiProject])
      setIsCreateModalOpen(false)
      setNewProject({
        title: '',
        description: '',
        client_name: '',
        budget: '',
        end_date: '',
        start_date: '',
        priority: 'medium',
        category: 'web-development',
        team_members: [],
        initial_files: [],
        milestones: [],
        permissions: 'private'
      })

      toast.success('Project created successfully!', {
        description: `${newProject.title} - Ready to add milestones and team members`
      })
      announce(`Project ${newProject.title} created successfully`, 'polite')
    } catch (error: any) {
      logger.error('Failed to create project', { error, userId })
      toast.error('Failed to create project', {
        description: error.message || 'Please try again later'
      })
      announce('Error creating project', 'assertive')
    }
  }

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    const project = projects.find(p => p.id === projectId)
    logger.info('Project status update started', { projectId, newStatus, projectName: project?.title })

    try {
      // Import projects queries utility
      const { updateProjectStatus } = await import('@/lib/projects-hub-queries')

      // Map UI status to database status
      const dbStatus = newStatus === 'active' ? 'In Progress' :
                      newStatus === 'completed' ? 'Completed' :
                      newStatus === 'paused' ? 'On Hold' :
                      newStatus === 'cancelled' ? 'Cancelled' : 'Not Started'

      // Update status in Supabase
      const { data: updatedProject, error: updateError } = await updateProjectStatus(
        projectId,
        dbStatus as any
      )

      if (updateError || !updatedProject) {
        throw new Error(updateError?.message || 'Failed to update project status')
      }

      logger.info('Project status updated successfully in Supabase', {
        projectId,
        newStatus: dbStatus,
        projectName: project?.title
      })

      // Update local state
      setProjects(projects.map(p =>
        p.id === projectId ? {
          ...p,
          status: newStatus as Project['status'],
          progress: newStatus === 'completed' ? 100 : p.progress
        } : p
      ))

      toast.success(`Project status updated to ${newStatus}`, {
        description: `${project?.title || 'Project'} is now ${newStatus}`
      })
      announce(`Project status changed to ${newStatus}`, 'polite')
    } catch (error: any) {
      logger.error('Failed to update project status', { error, projectId })
      toast.error('Failed to update project status', {
        description: error.message || 'Please try again later'
      })
      announce('Error updating project status', 'assertive')
    }
  }

  useEffect(() => {
    const loadProjects = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setLoading(false)
        return
      }

      try {
        logger.info('Loading projects from Supabase', { userId })
        setLoading(true)
        setError(null)

        // Import projects queries utility
        const { getProjects } = await import('@/lib/projects-hub-queries')

        // Fetch projects from Supabase
        const { data: projectsData, error: projectsError, count } = await getProjects(userId)

        if (projectsError) {
          throw new Error(projectsError.message || 'Failed to load projects')
        }

        // Transform database projects to UI format
        const transformedProjects = (projectsData || []).map((p: any) => ({
          id: p.id,
          title: p.name,
          description: p.description || '',
          status: p.status === 'In Progress' ? 'active' :
                  p.status === 'Completed' ? 'completed' :
                  p.status === 'On Hold' ? 'paused' :
                  p.status === 'Cancelled' ? 'cancelled' : 'draft',
          progress: p.progress,
          client_name: p.client,
          budget: p.budget,
          spent: p.spent,
          start_date: p.start_date,
          end_date: p.deadline,
          team_members: [], // TODO: Fetch from team_project_members table
          priority: p.priority,
          comments_count: 0, // TODO: Implement comments
          attachments: [], // TODO: Implement attachments
          category: p.category,
          tags: p.tags || []
        }))

        logger.info('Projects loaded from Supabase', {
          count: transformedProjects.length,
          total: count
        })

        setProjects(transformedProjects)
        setFilteredProjects(transformedProjects)
        setLoading(false)

        announce(`${transformedProjects.length} projects loaded successfully`, 'polite')
        toast.success('Projects loaded', {
          description: `${transformedProjects.length} projects from database`
        })
      } catch (err) {
        logger.error('Failed to load projects', { error: err, userId })
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setLoading(false)
        announce('Error loading projects', 'assertive')
        toast.error('Failed to load projects', {
          description: err instanceof Error ? err.message : 'Please try again'
        })
      }
    }

    loadProjects()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const filtered = filterProjects(projects, searchTerm, statusFilter, priorityFilter)
    logger.debug('Projects filtered', { resultCount: filtered.length })
    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const stats = calculateStats(projects)

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <ListSkeleton items={8} />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        action={{
          label: 'Retry',
          onClick: () => window.location.reload()
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Sub-Page Navigation */}
      <LiquidGlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Projects Hub</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage all your projects</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link href="/dashboard/projects-hub/create">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800/70 dark:border-gray-700 dark:hover:border-blue-500">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-gray-100">Create</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">New project</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/projects-hub/active">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800/70 dark:border-gray-700 dark:hover:border-blue-500">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-gray-100">Active</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">In progress</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/projects-hub/templates">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800/70 dark:border-gray-700 dark:hover:border-blue-500">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LayoutTemplate className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-gray-100">Templates</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quick start</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/projects-hub/import">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800/70 dark:border-gray-700 dark:hover:border-blue-500">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-gray-100">Import</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">From file</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/projects-hub/analytics">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300 dark:bg-gray-800/70 dark:border-gray-700 dark:hover:border-blue-500">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm dark:text-gray-100">Analytics</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Insights</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }}>
          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Projects</p>
                  <NumberFlow value={stats.total} className="text-3xl font-bold text-gray-900 dark:text-gray-100" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <NumberFlow value={stats.active} className="inline-block" /> active
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-xl backdrop-blur-sm">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        <LiquidGlassCard variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed</p>
                <NumberFlow value={stats.completed} className="text-3xl font-bold text-gray-900 dark:text-gray-100" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Projects finished</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue</p>
                <NumberFlow value={stats.revenue} format="currency" className="text-3xl font-bold text-gray-900 dark:text-gray-100" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Total earned</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficiency</p>
                <div className="flex items-baseline">
                  <NumberFlow value={stats.efficiency} className="text-3xl font-bold text-gray-900 dark:text-gray-100" />
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">%</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average progress</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* AI REVENUE INSIGHTS PANEL */}
      {showAIPanel && (
        <div className="mb-8">
          <RevenueInsightsWidget
            userId={userId || "demo-user-id"}
            revenueData={revenueData || {
              userId: userId || "demo-user-id",
              timeframe: "monthly" as const,
              totalRevenue: stats.revenue,
              revenueBySource: {
                projects: stats.revenue * 0.7,
                retainers: stats.revenue * 0.2,
                passive: stats.revenue * 0.1,
                other: 0
              },
              revenueByClient: projects.slice(0, 5).map(p => ({
                clientId: p.id,
                clientName: p.client_name,
                revenue: p.budget,
                projectCount: 1
              })),
              expenses: stats.revenue * 0.3,
              netProfit: stats.revenue * 0.7,
              currency: "USD"
            }}
            showActions={true}
          />
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowAIPanel(!showAIPanel)}
        >
          <Brain className="h-4 w-4" />
          {showAIPanel ? 'Hide' : 'Show'} AI Revenue
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Dashboard
          </Button>

          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={() => setIsCreateModalOpen(true)}
            data-testid="create-project-btn"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/40 dark:border-gray-700/40 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects, clients, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-projects"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="status-filter"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                data-testid="priority-filter"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div ref={scrollContainerRef} className="grid gap-6 max-h-[800px] overflow-y-auto">
        {filteredProjects.length === 0 ? (
          <NoDataEmptyState
            entityName="projects"
            description={
              searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? "No projects match your search criteria. Try adjusting your filters."
                : undefined
            }
            action={{
              label: 'Create Your First Project',
              onClick: () => setIsCreateModalOpen(true)
            }}
          />
        ) : (
          <>
            {displayedProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onUpdateStatus={handleUpdateProjectStatus}
              />
            ))}

            {isLoadingMore && displayedProjectsCount < filteredProjects.length && (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading more projects...</p>
              </div>
            )}

            {displayedProjectsCount < filteredProjects.length && !isLoadingMore && (
              <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
                Showing {displayedProjectsCount} of {filteredProjects.length} projects - Scroll down for more
              </div>
            )}
          </>
        )}
      </div>

      {/* 3-STEP PROJECT CREATION WIZARD */}
      <ProjectCreationWizard
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectData={newProject}
        onProjectDataChange={setNewProject}
        onSubmit={handleCreateProject}
        wizardStep={wizardStep}
        setWizardStep={setWizardStep}
      />

      {/* EDIT PROJECT MODAL */}
      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details and settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProject}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Project Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Website Redesign"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <AIEnhancedInput
                    value={editFormData.description || ''}
                    onChange={(text) => setEditFormData(prev => ({ ...prev, description: text }))}
                    contentType="description"
                    placeholder="Project description and goals..."
                    showSuggestions={true}
                    showEnhance={true}
                    showGenerate={true}
                    minRows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-client">Client Name</Label>
                  <Input
                    id="edit-client"
                    placeholder="Client or company name"
                    value={editFormData.client}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, client: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget">Budget ($)</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      min="0"
                      step="100"
                      value={editFormData.budget}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editFormData.start_date ? new Date(editFormData.start_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-deadline">Deadline</Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={editFormData.deadline ? new Date(editFormData.deadline).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editFormData.priority}
                      onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={editFormData.category}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="web-development">Web Development</SelectItem>
                        <SelectItem value="mobile-development">Mobile Development</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{selectedProject?.title}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete:
                </p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                  <li>Project details and settings</li>
                  <li>All associated tasks and milestones</li>
                  <li>Project files and attachments</li>
                  <li>Activity history and comments</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
