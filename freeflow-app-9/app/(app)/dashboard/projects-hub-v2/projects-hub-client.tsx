'use client'

import { useState, useEffect } from 'react'
import {
  BentoGrid,
  BentoCard,
  BentoStat,
  BentoChart,
  BentoList,
  BentoProgress
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  RankingList,
  ActivityFeed,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Briefcase,
  Eye,
  Edit,
  Clock,
  Target,
  BarChart3,
  Settings,
  ArrowUpRight,
  Trash2
} from 'lucide-react'
import { useProjects, Project } from '@/lib/hooks/use-projects'
import { createProject, updateProject, archiveProject, deleteProject } from '@/app/actions/projects'

interface ProjectsHubClientProps {
  initialProjects: Project[]
  initialStats: {
    total: number
    active: number
    completed: number
    totalBudget: number
    totalSpent: number
    avgProgress: number
  }
}

export default function ProjectsHubClient({ initialProjects, initialStats }: ProjectsHubClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', budget: 0 })

  const { projects, stats, fetchProjects } = useProjects(initialProjects)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const displayStats = stats.total > 0 ? stats : initialStats

  const filteredProjects = projects.filter(project => {
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'active' && project.status === 'active') ||
      (selectedFilter === 'completed' && project.status === 'completed')
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')

  const statsDisplay = [
    { label: 'Total Projects', value: String(displayStats.total), change: 12.5, icon: <FolderOpen className="w-5 h-5" /> },
    { label: 'Active Projects', value: String(displayStats.active), change: 8.3, icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Total Budget', value: `$${(displayStats.totalBudget / 1000).toFixed(0)}K`, change: 15.2, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Avg Progress', value: `${displayStats.avgProgress}%`, change: 5.0, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const topProjects = [...projects]
    .sort((a, b) => (b.budget || 0) - (a.budget || 0))
    .slice(0, 5)
    .map((project, index) => ({
      rank: index + 1,
      name: project.name,
      value: project.budget ? `$${(project.budget / 1000).toFixed(1)}K` : '$0',
      avatar: undefined,
      change: project.progress - 50
    }))

  const recentActivity = projects.slice(0, 4).map(p => ({
    icon: <FolderOpen className="w-5 h-5" />,
    title: p.name,
    description: `${p.status} - ${p.progress}% complete`,
    time: new Date(p.updated_at).toLocaleDateString(),
    status: p.status === 'completed' ? 'success' as const : 'info' as const
  }))

  const projectListItems = projects.slice(0, 6).map(project => ({
    icon: <FolderOpen className="w-4 h-4" />,
    title: project.name,
    subtitle: project.project_code || 'No code',
    value: `${project.progress}%`
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'completed': return 'bg-green-100 text-green-700 border-green-300'
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'planning': return 'bg-purple-100 text-purple-700 border-purple-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-blue-500'
      case 'low': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description,
        budget: newProject.budget || undefined,
        status: 'planning'
      })
      setNewProject({ name: '', description: '', budget: 0 })
      setShowNewProject(false)
      fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleUpdateProgress = async (projectId: string, progress: number) => {
    try {
      await updateProject(projectId, { progress })
      fetchProjects()
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleCompleteProject = async (projectId: string) => {
    try {
      await updateProject(projectId, { status: 'completed', progress: 100 })
      fetchProjects()
    } catch (error) {
      console.error('Error completing project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 dark:from-blue-950 dark:via-indigo-950/30 dark:to-purple-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Briefcase className="w-10 h-10 text-blue-600" />
              Projects Hub
            </h1>
            <p className="text-muted-foreground">Manage and track all your projects in one place</p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="blue" to="indigo" onClick={() => setShowNewProject(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </GradientButton>
          </div>
        </div>

        {/* KPI Stats */}
        <StatGrid columns={4} stats={statsDisplay} />

        {/* New Project Form */}
        {showNewProject && (
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Project name"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="text"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={newProject.budget || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                placeholder="Budget ($)"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <ModernButton variant="primary" onClick={handleCreateProject}>Create Project</ModernButton>
              <ModernButton variant="ghost" onClick={() => setShowNewProject(false)}>Cancel</ModernButton>
            </div>
          </BentoCard>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All Projects</PillButton>
            <PillButton variant={selectedFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('active')}>Active</PillButton>
            <PillButton variant={selectedFilter === 'completed' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('completed')}>Completed</PillButton>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-2 space-y-6">
            {filteredProjects.length === 0 ? (
              <BentoCard className="p-12 text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                <ModernButton variant="primary" onClick={() => setShowNewProject(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </ModernButton>
              </BentoCard>
            ) : (
              filteredProjects.map((project) => (
                <BentoCard key={project.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-md border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${getPriorityDot(project.priority)}`} />
                      </div>
                      {project.description && (
                        <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      )}

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Project Code</p>
                          <p className="font-medium">{project.project_code || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-semibold">{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {project.team_members?.length || 0} members
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Updated {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('View', project.id)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          {project.status === 'active' && (
                            <ModernButton variant="primary" size="sm" onClick={() => handleCompleteProject(project.id)}>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </ModernButton>
                          )}
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            ariaLabel="Delete"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </BentoCard>
              ))
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <BentoProgress
              title="Project Metrics"
              items={[
                { label: 'Overall Completion', value: displayStats.avgProgress, total: 100, color: 'bg-blue-600' },
                { label: 'Active Projects', value: displayStats.active, total: Math.max(displayStats.total, 1), color: 'bg-green-600' },
                { label: 'Budget Used', value: displayStats.totalSpent, total: Math.max(displayStats.totalBudget, 1), color: 'bg-violet-600' }
              ]}
            />

            {topProjects.length > 0 && (
              <RankingList title="Top Projects by Budget" items={topProjects} />
            )}

            {recentActivity.length > 0 && (
              <ActivityFeed title="Recent Activity" activities={recentActivity} />
            )}

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    On Track
                  </div>
                  <div className="font-semibold">{activeProjects.filter(p => p.progress >= 50).length}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Completed
                  </div>
                  <div className="font-semibold">{completedProjects.length}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Avg. Progress
                  </div>
                  <div className="font-semibold">{displayStats.avgProgress}%</div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComparisonCard
            title="Project Status Comparison"
            leftLabel="Active"
            leftValue={String(activeProjects.length)}
            rightLabel="Completed"
            rightValue={String(completedProjects.length)}
            icon={<Briefcase className="w-5 h-5" />}
          />

          <ComparisonCard
            title="Budget Overview"
            leftLabel="Total Budget"
            leftValue={`$${(displayStats.totalBudget / 1000).toFixed(0)}K`}
            rightLabel="Spent"
            rightValue={`$${(displayStats.totalSpent / 1000).toFixed(0)}K`}
            icon={<DollarSign className="w-5 h-5" />}
          />
        </div>

        {/* Charts Section */}
        <BentoGrid columns={2} gap="md">
          <BentoChart
            title="Project Timeline"
            subtitle="Monthly project completion trend"
            action={
              <ModernButton variant="ghost" size="sm">
                View Details
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </ModernButton>
            }
          >
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <BarChart3 className="w-16 h-16 mx-auto text-blue-600" />
                <p className="text-muted-foreground">Chart visualization ready</p>
                <div className="flex gap-4 justify-center text-sm">
                  <div>
                    <div className="font-bold text-blue-600">{displayStats.total}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">{displayStats.completed}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </BentoChart>

          <BentoList title="Recent Projects" items={projectListItems} />
        </BentoGrid>
      </div>
    </div>
  )
}
