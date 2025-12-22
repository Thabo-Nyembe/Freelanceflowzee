"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Filter,
  Plus,
  Calendar,
  DollarSign,
  Users,
  Clock,
  FolderOpen,
  Briefcase,
  Target,
  TrendingUp,
  FileText,
  Star,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  Share2,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Mock data for projects
const mockProjects = [
  {
    id: '1',
    name: 'Brand Identity Package',
    client: 'Acme Corporation',
    description: 'Complete brand identity design including logo, typography, and brand guidelines',
    status: 'In Progress',
    progress: 75,
    value: 2500,
    deadline: '2024-01-15',
    priority: 'high',
    tags: ['Design', 'Branding', 'Logo'],
    createdAt: '2023-12-01',
    lastUpdated: '2024-01-08',
    team: ['John Doe', 'Jane Smith']
  },
  {
    id: '2',
    name: 'E-commerce Website',
    client: 'Tech Startup Inc',
    description: 'Modern e-commerce platform with advanced features and mobile optimization',
    status: 'In Review',
    progress: 90,
    value: 8500,
    deadline: '2024-01-20',
    priority: 'urgent',
    tags: ['Development', 'E-commerce', 'React'],
    createdAt: '2023-11-15',
    lastUpdated: '2024-01-07',
    team: ['Alice Johnson', 'Bob Wilson']
  },
  {
    id: '3',
    name: 'Mobile App Design',
    client: 'Digital Agency',
    description: 'UI/UX design for iOS and Android mobile application',
    status: 'Completed',
    progress: 100,
    value: 4200,
    deadline: '2023-12-30',
    priority: 'medium',
    tags: ['Mobile', 'UI/UX', 'iOS', 'Android'],
    createdAt: '2023-11-01',
    lastUpdated: '2023-12-30',
    team: ['Sarah Lee']
  },
  {
    id: '4',
    name: 'Marketing Campaign',
    client: 'Local Business',
    description: 'Digital marketing campaign including social media and content strategy',
    status: 'Planning',
    progress: 25,
    value: 1800,
    deadline: '2024-02-15',
    priority: 'low',
    tags: ['Marketing', 'Social Media', 'Content'],
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-06',
    team: ['Mike Davis', 'Emma Brown']
  }
]

export default function ProjectsPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const router = useRouter()
  const [projects, setProjects] = useState(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('lastUpdated')

  // A+++ LOAD PROJECTS DATA
  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load projects'))
            } else {
              resolve(null)
            }
          }, 1000)
        })
        setIsLoading(false)
        announce('Projects loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects')
        setIsLoading(false)
        announce('Error loading projects', 'assertive')
      }
    }
    loadProjectsData()
  }, [announce])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'on hold': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority = priorityFilter === 'all' || project.priority.toLowerCase() === priorityFilter.toLowerCase()
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status !== 'Completed').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    totalValue: projects.reduce((sum, p) => sum + p.value, 0)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage and track all your projects in one place
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/dashboard/projects-hub/create')}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/projects-hub')}
                className="gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Projects Hub
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projectStats.total}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">{projectStats.active}</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{projectStats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-white/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">${projectStats.totalValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects, clients, or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="in progress">In Progress</option>
                    <option value="in review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card 
              key={project.id} 
              className="bg-white/70 backdrop-blur-sm border-white/40 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-2">{project.client}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={cn("text-xs", getStatusColor(project.status))}>
                        {project.status}
                      </Badge>
                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(project.priority))} />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="font-medium text-green-600">${project.value.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-3 w-3" />
                    <span>{project.team.length} member{project.team.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Create your first project to get started.'}
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
              <Button onClick={() => router.push('/dashboard/projects-hub/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}