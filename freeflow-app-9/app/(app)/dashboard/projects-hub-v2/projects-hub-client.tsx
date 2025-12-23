'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  FolderOpen, Plus, Search, Filter, DollarSign, Users, CheckCircle2,
  Calendar, TrendingUp, Briefcase, Eye, Edit, Clock, Target, BarChart3,
  Settings, ArrowUpRight, Trash2, LayoutGrid, List, GanttChartSquare,
  CalendarDays, ChevronDown, MoreHorizontal, Flag, Tag, Paperclip,
  MessageSquare, Link2, Copy, Archive, Star, Sparkles, Zap, Timer,
  AlertTriangle, CheckSquare, Square, GripVertical, ArrowRight, Play,
  Pause, UserPlus, Milestone, GitBranch, Layers, PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProjects, Project } from '@/lib/hooks/use-projects'
import { createProject, updateProject, deleteProject } from '@/app/actions/projects'

// View types
type ViewType = 'list' | 'board' | 'timeline' | 'calendar'

// Priority colors
const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Critical', icon: '🔴' },
  high: { color: 'bg-orange-500', label: 'High', icon: '🟠' },
  medium: { color: 'bg-blue-500', label: 'Medium', icon: '🔵' },
  low: { color: 'bg-gray-400', label: 'Low', icon: '⚪' },
}

// Status columns for Kanban
const statusColumns = [
  { id: 'planning', label: 'Planning', color: 'bg-purple-500', icon: '📋' },
  { id: 'active', label: 'In Progress', color: 'bg-blue-500', icon: '🚀' },
  { id: 'review', label: 'Review', color: 'bg-yellow-500', icon: '👀' },
  { id: 'completed', label: 'Completed', color: 'bg-green-500', icon: '✅' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-gray-500', icon: '⏸️' },
]

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee?: { name: string; avatar?: string }
  dueDate?: string
  tags?: string[]
  progress?: number
  dependencies?: string[]
}

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
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewType, setViewType] = useState<ViewType>('board')
  const [showNewProject, setShowNewProject] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectDetail, setShowProjectDetail] = useState(false)

  // New project form state
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: 0,
    priority: 'medium',
    startDate: '',
    endDate: '',
    tags: [] as string[],
    template: '',
  })

  const { projects, stats, fetchProjects } = useProjects(initialProjects)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const displayStats = stats.total > 0 ? stats : initialStats

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let filtered = projects

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(p => p.status === selectedFilter || p.priority === selectedFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.project_code?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [projects, selectedFilter, searchQuery])

  // Group projects by status for Kanban
  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {}
    statusColumns.forEach(col => {
      grouped[col.id] = filteredProjects.filter(p => p.status === col.id)
    })
    return grouped
  }, [filteredProjects])

  // Calculate timeline data
  const timelineData = useMemo(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)

    return filteredProjects.map(p => ({
      ...p,
      startX: p.start_date ? Math.max(0, (new Date(p.start_date).getTime() - startOfMonth.getTime()) / (endOfMonth.getTime() - startOfMonth.getTime()) * 100) : 0,
      width: p.start_date && p.end_date ? Math.min(100, (new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / (endOfMonth.getTime() - startOfMonth.getTime()) * 100) : 20,
    }))
  }, [filteredProjects])

  const getStatusColor = (status: string) => {
    const col = statusColumns.find(c => c.id === status)
    return col?.color || 'bg-gray-500'
  }

  const getPriorityConfig = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description,
        budget: newProject.budget || undefined,
        priority: newProject.priority,
        start_date: newProject.startDate || undefined,
        end_date: newProject.endDate || undefined,
        status: 'planning'
      })
      setNewProject({ name: '', description: '', budget: 0, priority: 'medium', startDate: '', endDate: '', tags: [], template: '' })
      setShowNewProject(false)
      fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      await updateProject(projectId, {
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : undefined
      })
      fetchProjects()
    } catch (error) {
      console.error('Error updating project:', error)
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

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project)
    setShowProjectDetail(true)
  }

  // Render project card (used in both list and board views)
  const ProjectCard = ({ project, compact = false }: { project: Project; compact?: boolean }) => {
    const priorityConf = getPriorityConfig(project.priority)
    const isOverdue = project.end_date && new Date(project.end_date) < new Date() && project.status !== 'completed'

    return (
      <Card
        className={`group cursor-pointer transition-all hover:shadow-lg border-l-4 ${getStatusColor(project.status)} ${isOverdue ? 'ring-2 ring-red-200' : ''}`}
        onClick={() => openProjectDetail(project)}
      >
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold truncate ${compact ? 'text-sm' : ''}`}>{project.name}</h3>
                {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
              </div>
              {!compact && project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openProjectDetail(project); }}>
                  <Eye className="h-4 w-4 mr-2" />View Details
                </DropdownMenuItem>
                <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem><Copy className="h-4 w-4 mr-2" />Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                {statusColumns.map(col => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project.id, col.id); }}
                  >
                    <span className="mr-2">{col.icon}</span>
                    Move to {col.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem><Archive className="h-4 w-4 mr-2" />Archive</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Priority & Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="outline" className="text-xs">
              <span className={`w-2 h-2 rounded-full ${priorityConf.color} mr-1`} />
              {priorityConf.label}
            </Badge>
            {project.project_code && (
              <Badge variant="secondary" className="text-xs">{project.project_code}</Badge>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {project.budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {(project.budget / 1000).toFixed(0)}K
                </span>
              )}
              {project.team_members && project.team_members.length > 0 && (
                <div className="flex -space-x-1">
                  {project.team_members.slice(0, 3).map((member, i) => (
                    <Avatar key={i} className="h-5 w-5 border-2 border-white">
                      <AvatarFallback className="text-[8px]">{member.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ))}
                  {project.team_members.length > 3 && (
                    <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px]">
                      +{project.team_members.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
            {project.end_date && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                <Calendar className="h-3 w-3" />
                {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Projects Hub</h1>
                <p className="text-white/80">Manage projects with Kanban, Timeline & more</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <Settings className="h-4 w-4 mr-2" />Settings
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-white/90" onClick={() => setShowNewProject(true)}>
                <Plus className="h-4 w-4 mr-2" />New Project
              </Button>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <LayoutGrid className="h-3 w-3 mr-1" /> Kanban Board
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <GanttChartSquare className="h-3 w-3 mr-1" /> Timeline View
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <GitBranch className="h-3 w-3 mr-1" /> Dependencies
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Users className="h-3 w-3 mr-1" /> Team Assign
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" /> AI Insights
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{displayStats.total}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{displayStats.active}</p>
                </div>
                <Play className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{displayStats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${(displayStats.totalBudget / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{displayStats.avgProgress}%</p>
              </div>
              <Progress value={displayStats.avgProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Used</p>
                  <p className="text-2xl font-bold">${(displayStats.totalSpent / 1000).toFixed(0)}K</p>
                </div>
                <PieChart className="h-8 w-8 text-violet-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedFilter('all')}>All Projects</DropdownMenuItem>
                <DropdownMenuSeparator />
                {statusColumns.map(col => (
                  <DropdownMenuItem key={col.id} onClick={() => setSelectedFilter(col.id)}>
                    <span className="mr-2">{col.icon}</span>{col.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {Object.entries(priorityConfig).map(([key, conf]) => (
                  <DropdownMenuItem key={key} onClick={() => setSelectedFilter(key)}>
                    <span className={`w-2 h-2 rounded-full ${conf.color} mr-2`} />{conf.label} Priority
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewType === 'board' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('board')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />Board
            </Button>
            <Button
              variant={viewType === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('list')}
            >
              <List className="h-4 w-4 mr-1" />List
            </Button>
            <Button
              variant={viewType === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('timeline')}
            >
              <GanttChartSquare className="h-4 w-4 mr-1" />Timeline
            </Button>
            <Button
              variant={viewType === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('calendar')}
            >
              <CalendarDays className="h-4 w-4 mr-1" />Calendar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {viewType === 'board' && (
          <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
            {statusColumns.map(column => (
              <div key={column.id} className="min-w-[280px]">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold">{column.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {projectsByStatus[column.id]?.length || 0}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {projectsByStatus[column.id]?.map(project => (
                    <ProjectCard key={project.id} project={project} compact />
                  ))}
                  {projectsByStatus[column.id]?.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      No projects
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewType === 'list' && (
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                <Button onClick={() => setShowNewProject(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create Project
                </Button>
              </Card>
            ) : (
              filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        )}

        {viewType === 'timeline' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GanttChartSquare className="h-5 w-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>Dec 2025</span>
                <div className="flex-1 h-px bg-border" />
                <span>Jan 2026</span>
                <div className="flex-1 h-px bg-border" />
                <span>Feb 2026</span>
              </div>
              <div className="space-y-3">
                {timelineData.map(project => (
                  <div key={project.id} className="flex items-center gap-4">
                    <div className="w-48 truncate text-sm font-medium">{project.name}</div>
                    <div className="flex-1 relative h-8 bg-muted rounded">
                      <div
                        className={`absolute h-full rounded ${getStatusColor(project.status)} opacity-80`}
                        style={{
                          left: `${project.startX}%`,
                          width: `${Math.max(project.width, 5)}%`,
                        }}
                      >
                        <div className="px-2 text-xs text-white truncate leading-8">
                          {project.progress}%
                        </div>
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm text-muted-foreground">
                      {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </div>
                  </div>
                ))}
              </div>
              {timelineData.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <GanttChartSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects with dates to display</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewType === 'calendar' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 6 + 1
                  const date = new Date()
                  date.setDate(day)
                  const projectsOnDay = filteredProjects.filter(p => {
                    if (!p.end_date) return false
                    const dueDate = new Date(p.end_date)
                    return dueDate.toDateString() === date.toDateString()
                  })

                  return (
                    <div
                      key={i}
                      className={`min-h-[80px] p-1 border rounded ${day > 0 && day <= 31 ? 'bg-white dark:bg-gray-800' : 'bg-muted/50'}`}
                    >
                      {day > 0 && day <= 31 && (
                        <>
                          <div className="text-xs text-muted-foreground mb-1">{day}</div>
                          <div className="space-y-1">
                            {projectsOnDay.slice(0, 2).map(p => (
                              <div
                                key={p.id}
                                className={`text-xs p-1 rounded truncate ${getStatusColor(p.status)} text-white`}
                              >
                                {p.name}
                              </div>
                            ))}
                            {projectsOnDay.length > 2 && (
                              <div className="text-xs text-muted-foreground">+{projectsOnDay.length - 2} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Project Modal */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Create New Project
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the project..."
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Budget</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProject.budget || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                  value={newProject.priority}
                  onChange={(e) => setNewProject(prev => ({ ...prev, priority: e.target.value }))}
                >
                  {Object.entries(priorityConfig).map(([key, conf]) => (
                    <option key={key} value={key}>{conf.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Quick Templates */}
            <div>
              <Label className="mb-2 block">Quick Start Template</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'website', label: 'Website Project', icon: '🌐' },
                  { id: 'app', label: 'App Development', icon: '📱' },
                  { id: 'marketing', label: 'Marketing Campaign', icon: '📣' },
                  { id: 'design', label: 'Design Project', icon: '🎨' },
                  { id: 'video', label: 'Video Production', icon: '🎬' },
                  { id: 'custom', label: 'Custom', icon: '✨' },
                ].map(template => (
                  <button
                    key={template.id}
                    onClick={() => setNewProject(prev => ({ ...prev, template: template.id }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      newProject.template === template.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">{template.icon}</span>
                    <span className="text-xs font-medium">{template.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProject(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Detail Modal */}
      <Dialog open={showProjectDetail} onOpenChange={setShowProjectDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(selectedProject.status)}`}>
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedProject.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedProject.project_code}</p>
                  </div>
                </div>
              </DialogHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        <Badge className={getStatusColor(selectedProject.status)}>
                          {statusColumns.find(c => c.id === selectedProject.status)?.label}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Priority</p>
                        <Badge variant="outline">
                          <span className={`w-2 h-2 rounded-full ${getPriorityConfig(selectedProject.priority).color} mr-1`} />
                          {getPriorityConfig(selectedProject.priority).label}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Budget</p>
                        <p className="text-xl font-bold">${selectedProject.budget?.toLocaleString() || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">Progress</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">{selectedProject.progress}%</p>
                          <Progress value={selectedProject.progress} className="flex-1 h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {selectedProject.description && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Description</p>
                        <p>{selectedProject.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="tasks" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tasks will be displayed here</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />Add Task
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />
                      <div>
                        <p className="font-medium">Due Date</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="files" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No files attached</p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />Upload File
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SY</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm"><span className="font-medium">System</span> created this project</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedProject.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
