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
import {
  FolderOpen,
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
  Brain
} from 'lucide-react'
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
  mockProjects,
  calculateStats,
  filterProjects,
  getStatusColor,
  getPriorityColor,
  formatDate
} from '@/lib/projects-hub-utils'

// Memoized ProjectCard component
interface ProjectCardProps {
  project: Project
  onView: (project: Project) => void
  onEdit: (project: Project) => void
  onUpdateStatus: (id: string, status: string) => void
}

const ProjectCard = memo(({ project, onView, onEdit, onUpdateStatus }: ProjectCardProps) => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(project.status))}>
                {project.status}
              </Badge>
              <div className={cn("w-3 h-3 rounded-full", getPriorityColor(project.priority))} title={`${project.priority} priority`}></div>
            </div>

            <p className="text-gray-600 mb-4">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{project.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-medium">${project.budget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">{formatDate(project.end_date)}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.team_members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{project.comments_count} comments</span>
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

  const handleEditProject = (project: Project) => {
    logger.info('Project edit opened', { projectId: project.id, title: project.title })
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title')
      return
    }

    logger.info('Project creation started', { title: newProject.title })

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            title: newProject.title,
            description: newProject.description,
            client_name: newProject.client_name,
            budget: parseFloat(newProject.budget) || 0,
            end_date: newProject.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            priority: newProject.priority as 'low' | 'medium' | 'high' | 'urgent',
            category: newProject.category
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create project')

      const result = await response.json()

      if (result.success) {
        logger.info('Project created successfully', { projectId: result.projectId })
        setProjects([...projects, result.project])
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
          description: result.project.title + ' - Ready to add milestones and team members'
        })
      }
    } catch (error: any) {
      logger.error('Failed to create project', { error })
      toast.error('Failed to create project', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
    const project = projects.find(p => p.id === projectId)
    logger.info('Project status update started', { projectId, newStatus })

    try {
      const response = await fetch('/api/projects/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-status',
          projectId,
          data: { status: newStatus }
        })
      })

      if (!response.ok) throw new Error('Failed to update project status')

      const result = await response.json()

      if (result.success) {
        logger.info('Project status updated successfully', { projectId, newStatus })
        setProjects(projects.map(p =>
          p.id === projectId ? { ...p, status: newStatus as Project['status'], progress: newStatus === 'completed' ? 100 : p.progress } : p
        ))
        toast.success(result.message)
      }
    } catch (error: any) {
      logger.error('Failed to update project status', { error, projectId })
      toast.error('Failed to update project status', {
        description: error.message || 'Please try again later'
      })
    }
  }

  useEffect(() => {
    const loadProjects = async () => {
      try {
        logger.info('Loading projects')
        setLoading(true)
        setError(null)

        await new Promise((resolve) => setTimeout(resolve, 500))

        logger.info('Projects loaded', { count: mockProjects.length })
        setProjects(mockProjects)
        setFilteredProjects(mockProjects)
        setLoading(false)
        announce(`${mockProjects.length} projects loaded successfully`, 'polite')
      } catch (err) {
        logger.error('Failed to load projects', { error: err })
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setLoading(false)
        announce('Error loading projects', 'assertive')
      }
    }

    loadProjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
                <div className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-xl backdrop-blur-sm">
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
              <div className="p-3 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-xl backdrop-blur-sm">
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
              <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-xl backdrop-blur-sm">
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
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-xl backdrop-blur-sm">
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
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onUpdateStatus={handleUpdateProjectStatus}
              />
            ))}

            {isLoadingMore && displayedProjectsCount < filteredProjects.length && (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500 mt-2">Loading more projects...</p>
              </div>
            )}

            {displayedProjectsCount < filteredProjects.length && !isLoadingMore && (
              <div className="text-center py-6 text-sm text-gray-500">
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
    </div>
  )
}
