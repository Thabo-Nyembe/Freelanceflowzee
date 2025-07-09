'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  MessageSquare,
  Settings,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Star,
  Eye,
  Edit3,
  Trash2,
  Download,
  Upload,
  Share2,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Award,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  Activity,
  Archive
} from 'lucide-react'

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
      client_name: 'StartupXYZ',
      budget: 5000,
      spent: 4800,
      start_date: '2024-01-01T00:00:00.000Z',
      end_date: '2024-01-30T00:00:00.000Z',
      team_members: [
        { id: '3', name: 'Mike Rodriguez', avatar: '/avatars/mike.jpg' }
      ],
      priority: 'medium',
      comments_count: 8,
      attachments: ['logo-variations.ai', 'brand-guidelines.pdf'],
      category: 'Design',
      tags: ['Branding', 'Logo', 'Guidelines']
    },
    {
      id: '3',
      title: 'Mobile App Development',
      description: 'iOS and Android app development for food delivery service with real-time tracking.',
      status: 'active',
      progress: 45,
      client_name: 'FoodieApp',
      budget: 25000,
      spent: 11250,
      start_date: '2024-01-20T00:00:00.000Z',
      end_date: '2024-04-15T00:00:00.000Z',
      team_members: [
        { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
        { id: '4', name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg' },
        { id: '5', name: 'David Chen', avatar: '/avatars/david.jpg' }
      ],
      priority: 'urgent',
      comments_count: 24,
      attachments: ['app-wireframes.sketch', 'api-documentation.pdf'],
      category: 'Mobile Development',
      tags: ['React Native', 'iOS', 'Android']
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
    let filtered = projects.filter(project => {
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
    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      status: 'draft',
      progress: 0,
      client_name: newProject.client_name,
      budget: parseFloat(newProject.budget),
      spent: 0,
      start_date: new Date().toISOString(),
      end_date: newProject.end_date,
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Projects Hub</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{stats.active} active projects</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Enter project title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                      placeholder="Project description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Client Name</Label>
                      <Input
                        id="client"
                        value={newProject.client_name}
                        onChange={(e) => setNewProject({...newProject, client_name: e.target.value})}
                        placeholder="Client name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newProject.budget}
                        onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newProject.priority} onValueChange={(value) => setNewProject({...newProject, priority: value})}>
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
                    
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newProject.end_date}
                        onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects ({filteredProjects.length})</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <FolderOpen className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <Play className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-emerald-600">${stats.revenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 3).map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} />
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{project.progress}% complete</p>
                          <Progress value={project.progress} className="w-20" />
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`} />
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Budget</span>
                      <span className="font-medium">${project.budget.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Client</span>
                      <span className="font-medium">{project.client_name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.team_members.slice(0, 3).map((member, index) => (
                          <Avatar key={member.id} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team_members.length > 3 && (
                          <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{project.team_members.length - 3}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-500">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{project.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{project.attachments.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => alert(`Viewing project: ${project.title}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => alert(`Editing project: ${project.title}`)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`w-4 h-4 rounded-full ${getPriorityColor(project.priority)}`} />
                      <div className="flex-1">
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-600">{project.client_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </p>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Progress</span>
                      <span className="font-medium">{stats.efficiency}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">On-Time Delivery</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Client Satisfaction</span>
                      <span className="font-medium">96%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
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
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="font-medium">${stats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className="font-medium">${(projects.reduce((sum, p) => sum + p.budget, 0) - stats.revenue).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}