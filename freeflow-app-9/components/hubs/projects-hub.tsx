"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  Paperclip,
  Target,
  Upload,
  Rocket,
  Grid,
  List
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  budget: number
  spent: number
  client_name: string
  client_email: string
  start_date: string
  end_date: string
  progress: number
  team_members: any[]
  attachments: any[]
  comments_count: number
  created_at: string
  updated_at: string
}

interface ProjectsHubProps {
  projects: Project[]
  userId: string
}

export function ProjectsHub({ projects: initialProjects, userId }: ProjectsHubProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isQuickStartDialogOpen, setIsQuickStartDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle project creation
  const handleCreateProject = async (projectData: any) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate required fields
      if (!projectData.title?.trim()) {
        throw new Error('Title is required')
      }
      if (!projectData.description?.trim()) {
        throw new Error('Description is required')
      }
      if (projectData.client_email && !isValidEmail(projectData.client_email)) {
        throw new Error('Invalid client email format')
      }
      if (projectData.budget && isNaN(Number(projectData.budget))) {
        throw new Error('Budget must be a valid number')
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            status: projectData.status || 'active',
            progress: 0,
            budget: projectData.budget ? Number(projectData.budget) : 0
          }
        ])
        .select()

      if (error) throw error

      setProjects(prev => [...prev, data[0]])
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating project:', error)
      // Show error toast or alert
      alert(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle project import
  const handleImportProject = async (importData: any) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let projectData
      if (importData.source === 'url') {
        // Handle URL import
        const response = await fetch(importData.data)
        projectData = await response.json()
      } else {
        // Handle file import
        projectData = importData.data
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            ...projectData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            imported_from: importData.source
          }
        ])
        .select()

      if (error) throw error

      setProjects(prev => [...prev, data[0]])
      setIsImportDialogOpen(false)
    } catch (error) {
      console.error('Error importing project:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  // Handle quick start template
  const handleQuickStart = async (template: any) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title: `${template.name} Project`,
            description: template.description,
            user_id: user.id,
            created_at: new Date().toISOString(),
            status: 'active',
            progress: 0,
            template_id: template.id,
            deliverables: template.deliverables,
            timeline: template.timeline
          }
        ])
        .select()

      if (error) throw error

      setProjects(prev => [...prev, data[0]])
      setIsQuickStartDialogOpen(false)
    } catch (error) {
      console.error('Error creating project from template:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!selectedProject) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== selectedProject.id))
      setIsDeleteDialogOpen(false)
      setSelectedProject(null)
    } catch (error) {
      console.error('Error deleting project:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  // Handle project status update
  const handleStatusUpdate = async (projectId: string, newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId)

      if (error) throw error

      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      ))
    } catch (error) {
      console.error('Error updating project status:', error)
      // TODO: Show error toast
    }
  }

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    paused: projects.filter(p => p.status === 'paused').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="h-4 w-4" />;
      case 'active': return <PlayCircle className="h-4 w-4" />;
      case 'in-progress': return <PlayCircle className="h-4 w-4" />;
      case 'on-hold': return <PauseCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    }

    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }

    const daysLeft = getDaysUntilDeadline(project.end_date);
    const isOverdue = daysLeft < 0;
    const isUrgent = daysLeft >= 0 && daysLeft <= 3;

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/collaborate`)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Collaborate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/gallery`)}>
                    <Paperclip className="mr-2 h-4 w-4" />
                    Gallery
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      setSelectedProject(project)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Progress */}
          <div className="space-y-2">
                          <div className="flex items-center justify-between">
               <Badge className={statusColors[project.status]}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
               </Badge>
              <span className="text-sm text-muted-foreground">{project.progress}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Client and Budget */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium truncate">{project.client_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-medium">{formatCurrency(project.budget)}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatDate(project.start_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{formatDate(project.end_date)}</p>
            </div>
          </div>

          {/* Team and Activity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {project.team_members?.length || 0} members
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{project.comments_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{project.attachments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Used</span>
              <span>{formatCurrency(project.spent)} / {formatCurrency(project.budget)}</span>
            </div>
            <Progress 
              value={(project.spent / project.budget) * 100} 
              className="h-2"
            />
          </div>

          {/* Deadline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Due {formatDate(project.end_date)}</span>
            </div>
            {isOverdue && (
              <Badge variant="destructive">Overdue</Badge>
            )}
            {isUrgent && !isOverdue && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Due Soon
              </Badge>
            )}
          </div>

          {/* Team Members */}
          {project.team_members && project.team_members.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Team:</span>
              <div className="flex -space-x-2">
                {project.team_members.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.team_members.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      +{project.team_members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div data-testid="projects-hub" className="h-full">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-primary" />
                Projects Hub
              </CardTitle>
              <CardDescription>
                Manage all your freelance projects in one place
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(true)}
                data-testid="import-project-btn"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Project
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsQuickStartDialogOpen(true)}
                data-testid="quick-start-btn"
              >
                <Rocket className="h-4 w-4 mr-2" />
                Quick Start
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                data-testid="create-project-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="tab-content-container">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="tabs-list-fixed">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <div className="tabs-content-area">
                {/* Overview Tab */}
                <TabsContent value="overview" className="h-full m-0">
                  <div className="tab-panel p-6 space-y-6">
              {/* Project Statistics */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Projects</p>
                        <p className="text-2xl font-bold">{projectStats.total}</p>
                      </div>
                      <FileText className="h-8 w-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active</p>
                        <p className="text-2xl font-bold text-green-600">{projectStats.active}</p>
                      </div>
                      <PlayCircle className="h-8 w-8 text-green-500/60" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-blue-600">{projectStats.completed}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-500/60" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-2xl font-bold">{formatCurrency(projectStats.totalBudget)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-500/60" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {projects.length === 0 
                      ? "Get started by creating your first project." 
                      : "Try adjusting your search or filters."}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </div>
              )}
                  </div>
                </TabsContent>

                {/* Active Tab */}
                <TabsContent value="active" className="h-full m-0">
                  <div className="tab-panel p-6">
                    <div className="space-y-4">
                      {projects.filter(p => p.status === 'active').map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Completed Tab */}
                <TabsContent value="completed" className="h-full m-0">
                  <div className="tab-panel p-6">
                    <div className="space-y-4">
                      {projects.filter(p => p.status === 'completed').map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="h-full m-0">
                  <div className="tab-panel p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Average Completion Rate</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>On-time Delivery</span>
                        <span className="font-semibold">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Client Satisfaction</span>
                        <span className="font-semibold">4.8/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Budget</span>
                        <span className="font-semibold">{formatCurrency(projectStats.totalBudget)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Spent</span>
                        <span className="font-semibold">{formatCurrency(projectStats.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Remaining Budget</span>
                        <span className="font-semibold">{formatCurrency(projectStats.totalBudget - projectStats.totalSpent)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 