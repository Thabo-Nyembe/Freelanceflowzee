'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  MessageSquare, 
  Eye, 
  Plus, 
  Filter, 
  Search,
  Calendar,
  Clock,
  Users,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  MoreHorizontal,
  ArrowRight,
  Image,
  Download,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    name: 'Brand Identity Design',
    client: 'TechCorp Inc.',
    status: 'in-progress',
    progress: 75,
    dueDate: '2024-01-15',
    priority: 'high',
    lastActivity: '2 hours ago',
    collaborators: 3,
    unreadComments: 2,
    escrowAmount: 2500,
    galleryAccess: 'premium'
  },
  {
    id: 2,
    name: 'E-commerce Website',
    client: 'Fashion Forward',
    status: 'review',
    progress: 90,
    dueDate: '2024-01-20',
    priority: 'medium',
    lastActivity: '1 day ago',
    collaborators: 5,
    unreadComments: 0,
    escrowAmount: 5000,
    galleryAccess: 'standard'
  },
  {
    id: 3,
    name: 'Mobile App UI',
    client: 'StartupXYZ',
    status: 'planning',
    progress: 25,
    dueDate: '2024-02-01',
    priority: 'low',
    lastActivity: '3 days ago',
    collaborators: 2,
    unreadComments: 1,
    escrowAmount: 1800,
    galleryAccess: 'preview'
  }
]

const statusConfig = {
  'in-progress': { color: 'bg-blue-500', label: 'In Progress', icon: Play },
  'review': { color: 'bg-yellow-500', label: 'In Review', icon: Clock },
  'planning': { color: 'bg-purple-500', label: 'Planning', icon: Target },
  'completed': { color: 'bg-green-500', label: 'Completed', icon: CheckCircle }
}

const priorityConfig = {
  high: { color: 'text-red-600 bg-red-50 border-red-200', label: 'High' },
  medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Medium' },
  low: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Low' }
}

const galleryConfig = {
  preview: { icon: Eye, color: 'text-gray-600', label: 'Preview Access' },
  standard: { icon: Image, color: 'text-blue-600', label: 'Standard Gallery' },
  premium: { icon: Star, color: 'text-yellow-600', label: 'Premium Gallery' }
}

export default function ProjectsHubPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  const ProjectCard = ({ project }: { project: any }) => {
    const statusInfo = statusConfig[project.status as keyof typeof statusConfig]
    const priorityInfo = priorityConfig[project.priority as keyof typeof priorityConfig]
    const galleryInfo = galleryConfig[project.galleryAccess as keyof typeof galleryConfig]
    const StatusIcon = statusInfo.icon
    const GalleryIcon = galleryInfo.icon

    return (
      <Card 
        className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500"
        onClick={() => setSelectedProject(project.id)}
        data-testid={`project-card-${project.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{project.client}</span>
                <Badge variant="outline" className={priorityInfo.color}>
                  {priorityInfo.label}
                </Badge>
              </CardDescription>
            </div>
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Status and Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">{statusInfo.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{project.dueDate}</span>
            </div>
          </div>

          {/* Collaboration Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{project.collaborators} members</span>
              {project.unreadComments > 0 && (
                <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                  {project.unreadComments}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <GalleryIcon className={`h-4 w-4 ${galleryInfo.color}`} />
              <span className="text-sm text-gray-600">{galleryInfo.label}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                // Navigate to project tracker
              }}
            >
              <Target className="h-3 w-3 mr-1" />
              Track
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                // Navigate to collaboration
              }}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Collaborate
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                // Navigate to client gallery
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Gallery
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Projects Hub
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage projects, collaborate with clients, and showcase your work
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">12</div>
              <p className="text-xs text-purple-600 mt-1">3 due this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Unread Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">8</div>
              <p className="text-xs text-blue-600 mt-1">Across 4 projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Gallery Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">247</div>
              <p className="text-xs text-yellow-600 mt-1">+12% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">24</div>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview" className="gap-2" data-testid="overview-tab">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2" data-testid="tracking-tab">
              <Clock className="h-4 w-4" />
              Project Tracking
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="gap-2" data-testid="collaboration-tab">
              <MessageSquare className="h-4 w-4" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="galleries" className="gap-2" data-testid="galleries-tab">
              <Image className="h-4 w-4" />
              Client Galleries
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>

          {/* Project Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Target className="h-6 w-6 text-purple-600" />
                  Project Tracking
                </h2>
                <Link href="/dashboard/project-tracker">
                  <Button variant="outline" className="gap-2">
                    View Full Tracker
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* Quick tracking overview */}
              <div className="space-y-4">
                {mockProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {project.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{project.progress}%</div>
                        <Progress value={project.progress} className="h-2 w-20" />
                      </div>
                      <Badge variant="outline" className={statusConfig[project.status as keyof typeof statusConfig] ? '' : ''}>
                        {statusConfig[project.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  Client Collaboration
                </h2>
                <Link href="/dashboard/collaboration">
                  <Button variant="outline" className="gap-2">
                    Open Collaboration Hub
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* Recent activity */}
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Sarah Johnson</span>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-700">Left feedback on Brand Identity Design with 3 revision requests</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
                
                <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-yellow-600 text-white text-xs">TC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">TechCorp Team</span>
                        <span className="text-xs text-gray-500">5 hours ago</span>
                      </div>
                      <p className="text-sm text-gray-700">Approved milestone 3 and released next payment from escrow</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Client Galleries Tab */}
          <TabsContent value="galleries" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Image className="h-6 w-6 text-yellow-600" />
                  Client Galleries
                </h2>
                <Link href="/dashboard/client-zone">
                  <Button variant="outline" className="gap-2">
                    Manage All Galleries
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              {/* Gallery grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project) => {
                  const galleryInfo = galleryConfig[project.galleryAccess as keyof typeof galleryConfig]
                  const GalleryIcon = galleryInfo.icon
                  
                  return (
                    <Card key={project.id} className="hover:shadow-lg transition-all duration-200">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm opacity-90">{project.client}</p>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            <GalleryIcon className="h-3 w-3 mr-1" />
                            {galleryInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            247 views • Last viewed 2h ago
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 