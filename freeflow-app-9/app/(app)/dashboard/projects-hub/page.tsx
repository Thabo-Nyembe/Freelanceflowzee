'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  FolderOpen, 
  Plus, 
  Search, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Activity,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Filter,
  TrendingUp,
  Target,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  title: string
  description: string
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'draft'
  progress: number
  client_name: string
  budget: number
  spent: number
  start_date: string
  end_date: string
  team_members: { id: string; name: string; avatar: string }[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  comments_count: number
  attachments: string[]
  category: string
  tags: string[]
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  revenue: number
  efficiency: number
}

export default function ProjectsHubPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    client_name: '',
    budget: '',
    end_date: '',
    priority: 'medium',
    category: 'web-development'
  })

  // Handlers
  const handleCreateProject = () => { console.log('➕ NEW'); router.push('/dashboard/projects-hub/create') }
  const handleViewProject = (id: string) => { console.log('👁️ VIEW:', id); alert(`👁️ Project ${id}`) }
  const handleEditProject = (id: string) => { console.log('✏️ EDIT:', id); alert(`✏️ Edit ${id}`) }
  const handleDeleteProject = (id: string) => { console.log('🗑️ DEL:', id); confirm('Delete?') && alert('✅ Deleted') }
  const handleDuplicateProject = (id: string) => { console.log('📋 DUP:', id); alert('📋 Duplicated') }
  const handleArchiveProject = (id: string) => { console.log('📦 ARCH:', id); alert('📦 Archived') }
  const handleFilterStatus = (status: string) => { console.log('🔍 FILT:', status); setStatusFilter(status) }
  const handleSearch = (query: string) => { console.log('🔍 SEARCH:', query); setSearchTerm(query) }
  const handleSort = (by: string) => { console.log('🔃 SORT:', by); alert(`🔃 ${by}`) }
  const handleExportProjects = () => { console.log('💾 EXPORT'); alert('💾 Exporting...') }
  const handleImportProjects = () => { console.log('📤 IMPORT'); alert('📤 Import') }
  const handleBulkAction = (action: string, ids: string[]) => { console.log('☑️ BULK:', action); alert(`☑️ ${action}`) }
  const handleShareProject = (id: string) => { console.log('🔗 SHARE:', id); alert('🔗 Shared') }
  const handleProjectAnalytics = (id: string) => { console.log('📊 ANA:', id); alert('📊 Analytics') }
  const handleAssignTeam = (id: string) => { console.log('👥 TEAM:', id); alert('👥 Assign') }
  const handleSetBudget = (id: string) => { console.log('💰 BUDGET:', id); alert('💰 Budget') }
  const handleSetDeadline = (id: string) => { console.log('📅 DATE:', id); alert('📅 Deadline') }
  const handleProjectTemplates = () => { console.log('📋 TEMP'); router.push('/dashboard/projects-hub/templates') }
  const handleProjectReports = () => { console.log('📄 REP'); alert('📄 Reports') }
  const handleQuickStats = () => { console.log('📊 STATS'); alert('📊 Stats') }

  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'E-commerce Website Redesign',
      description: 'Complete redesign of online store with modern UI/UX, mobile optimization, and enhanced checkout flow.',
      status: 'active',
      progress: 75,
      client_name: 'TechCorp Inc.',
      budget: 12000,
      spent: 9000,
      start_date: '2024-01-15T00:00:00.000Z',
      end_date: '2024-02-28T00:00:00.000Z',
      team_members: [
        { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      priority: 'high',
      comments_count: 12,
      attachments: ['wireframes.pdf', 'brand-guidelines.pdf'],
      category: 'Web Development',
      tags: ['React', 'E-commerce', 'UI/UX']
    },
    {
      id: '2',
      title: 'Brand Identity Package',
      description: 'Complete brand identity design including logo, color palette, typography, and brand guidelines.',
      status: 'completed',
      progress: 100,
      client_name: 'Startup Ventures',
      budget: 5000,
      spent: 4800,
      start_date: '2023-12-01T00:00:00.000Z',
      end_date: '2024-01-10T00:00:00.000Z',
      team_members: [
        { id: '3', name: 'Mike Johnson', avatar: '/avatars/mike.jpg' },
        { id: '4', name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' }
      ],
      priority: 'medium',
      comments_count: 8,
      attachments: ['logo-variations.ai', 'brand-book.pdf'],
      category: 'Branding',
      tags: ['Logo Design', 'Branding', 'Identity']
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'iOS and Android mobile application for fitness tracking with social features.',
      status: 'active',
      progress: 45,
      client_name: 'FitLife Solutions',
      budget: 25000,
      spent: 11250,
      start_date: '2024-01-20T00:00:00.000Z',
      end_date: '2024-04-15T00:00:00.000Z',
      team_members: [
        { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: '5', name: 'Alex Chen', avatar: '/avatars/alex.jpg' }
      ],
      priority: 'urgent',
      comments_count: 24,
      attachments: ['wireframes.sketch', 'api-docs.pdf', 'user-stories.docx'],
      category: 'Mobile Development',
      tags: ['React Native', 'iOS', 'Android', 'Fitness']
    },
    {
      id: '4',
      title: 'Video Marketing Campaign',
      description: 'Series of promotional videos for social media marketing campaign.',
      status: 'paused',
      progress: 30,
      client_name: 'Marketing Pro',
      budget: 8000,
      spent: 2400,
      start_date: '2024-02-01T00:00:00.000Z',
      end_date: '2024-03-15T00:00:00.000Z',
      team_members: [
        { id: '6', name: 'Emma Thompson', avatar: '/avatars/emma.jpg' }
      ],
      priority: 'low',
      comments_count: 5,
      attachments: ['storyboard.pdf', 'script.docx'],
      category: 'Video Production',
      tags: ['Video Editing', 'Social Media', 'Marketing']
    },
    {
      id: '5',
      title: 'WordPress Website',
      description: 'Custom WordPress theme development for law firm website.',
      status: 'draft',
      progress: 10,
      client_name: 'Legal Associates',
      budget: 6000,
      spent: 600,
      start_date: '2024-02-10T00:00:00.000Z',
      end_date: '2024-03-20T00:00:00.000Z',
      team_members: [
        { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' }
      ],
      priority: 'medium',
      comments_count: 2,
      attachments: ['requirements.pdf'],
      category: 'Web Development',
      tags: ['WordPress', 'PHP', 'Legal']
    }
  ]

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        setProjects(mockProjects)
        setFilteredProjects(mockProjects)
        setLoading(false)
      }, 1000)
    }

    loadProjects()
  }, [])

  useEffect(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
    
    setFilteredProjects(filtered)
  }, [projects, searchTerm, statusFilter, priorityFilter])

  const stats: ProjectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    revenue: projects.reduce((sum, p) => sum + p.spent, 0),
    efficiency: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleCreateProject = () => {
    if (!newProject.title.trim()) {
      alert('Please enter a project title')
      return
    }

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      status: 'draft',
      progress: 0,
      client_name: newProject.client_name,
      budget: parseFloat(newProject.budget) || 0,
      spent: 0,
      start_date: new Date().toISOString(),
      end_date: newProject.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      team_members: [],
      priority: newProject.priority as 'low' | 'medium' | 'high' | 'urgent',
      comments_count: 0,
      attachments: [],
      category: newProject.category,
      tags: []
    }
    
    setProjects([...projects, project])
    setIsCreateModalOpen(false)
    setNewProject({
      title: '',
      description: '',
      client_name: '',
      budget: '',
      end_date: '',
      priority: 'medium',
      category: 'web-development'
    })
    alert('Project created successfully!')
  }

  const handleUpdateProjectStatus = (projectId: string, newStatus: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, status: newStatus as Project['status'] } : p
    ))
    alert(`Project status updated to ${newStatus}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Title with icon */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* Gradient icon container */}
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Projects Hub
                </h1>
              </div>
              <p className="text-lg text-gray-600 font-light">
                Manage and track all your creative projects in one place 🚀
              </p>
            </div>
            
            <div className="flex items-center gap-4">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">{stats.active} active</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                    <p className="text-sm text-gray-500">Projects finished</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total earned</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Efficiency</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.efficiency}%</p>
                    <p className="text-sm text-gray-500">Average progress</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-2xl">
              <FolderOpen className="h-4 w-4" />
              Project Overview
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2 rounded-2xl">
              <Activity className="h-4 w-4" />
              Active Projects
              <Badge variant="secondary" className="text-xs">
                {stats.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-2xl">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {filteredProjects.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                        ? 'Try adjusting your filters or search terms.'
                        : 'Get started by creating your first project.'}
                    </p>
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map(project => (
                  <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
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
                                onClick={() => alert(`Viewing project: ${project.title}`)}
                                data-testid="view-project-btn"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => alert(`Editing project: ${project.title}`)}
                                data-testid="edit-project-btn"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              
                              {project.status === 'active' && (
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => handleUpdateProjectStatus(project.id, 'completed')}
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
                ))
              )}
            </div>
          </TabsContent>

          {/* Active Projects Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="grid gap-6">
              {filteredProjects.filter(p => p.status === 'active').map(project => (
                <Card key={project.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Client:</span>
                            <span className="text-sm font-medium">{project.client_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Budget:</span>
                            <span className="text-sm font-medium">${project.budget.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Spent:</span>
                            <span className="text-sm font-medium">${project.spent.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-3" />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{project.team_members.length}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Due {formatDate(project.end_date)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Update Progress
                          </Button>
                          <Button size="sm" className="flex-1">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['active', 'completed', 'paused', 'draft', 'cancelled'].map(status => {
                      const count = projects.filter(p => p.status === status).length
                      const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full", 
                              status === 'active' ? 'bg-green-500' :
                              status === 'completed' ? 'bg-blue-500' :
                              status === 'paused' ? 'bg-yellow-500' :
                              status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                            )}></div>
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <span className="text-xs text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Budget</span>
                      <span className="font-medium">${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Earned</span>
                      <span className="font-medium">${stats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className="font-medium">${(projects.reduce((sum, p) => sum + p.budget, 0) - stats.revenue).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Completion Rate</span>
                        <span className="font-bold text-lg">{Math.round((stats.revenue / projects.reduce((sum, p) => sum + p.budget, 0)) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Project Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Project Title *
                    </label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Enter project title..."
                      data-testid="project-title-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Client Name
                    </label>
                    <Input
                      value={newProject.client_name}
                      onChange={(e) => setNewProject({...newProject, client_name: e.target.value})}
                      placeholder="Enter client name..."
                      data-testid="client-name-input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe the project..."
                    rows={3}
                    data-testid="project-description-input"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget ($)
                    </label>
                    <Input
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                      placeholder="0"
                      data-testid="project-budget-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Priority
                    </label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="project-priority-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Category
                    </label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="project-category-select"
                    >
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="branding">Branding</option>
                      <option value="video-production">Video Production</option>
                      <option value="marketing">Marketing</option>
                      <option value="design">Design</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                    data-testid="project-end-date-input"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    className="flex-1"
                    onClick={handleCreateProject}
                    disabled={!newProject.title.trim()}
                    data-testid="create-project-submit"
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCreateModalOpen(false)}
                    data-testid="create-project-cancel"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}