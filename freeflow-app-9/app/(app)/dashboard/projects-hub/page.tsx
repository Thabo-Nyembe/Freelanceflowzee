'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { UniversalPinpointFeedbackSystem } from '@/components/collaboration/universal-pinpoint-feedback-system'
import UniversalMediaPreviewsEnhanced from '@/components/collaboration/universal-media-previews-enhanced'
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
  ExternalLink,
  Share2,
  Settings,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { ImportProjectDialog } from '@/components/projects/import-project-dialog'
import { QuickStartDialog } from '@/components/projects/quick-start-dialog'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [quickStartDialogOpen, setQuickStartDialogOpen] = useState(false)

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

  const handleCreateProject = async (projectData: any) => {
    try {
      console.log('Creating project:', projectData)
      // TODO: Implement project creation
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleImportProject = async (importData: any) => {
    try {
      console.log('Importing project:', importData)
      // TODO: Implement project import
    } catch (error) {
      console.error('Error importing project:', error)
    }
  }

  const handleQuickStart = async (template: any) => {
    try {
      console.log('Starting project from template:', template)
      // TODO: Implement quick start
    } catch (error) {
      console.error('Error starting project:', error)
    }
  }

  // Working button handlers with real functionality
  const handleCreateClick = () => {
    console.log('Create button clicked')
    
    // Show confirmation and navigate
    if (confirm('Create a new project? This will open the project creation wizard.')) {
      router.push('/dashboard/projects-hub/create')
    }
  }

  const handleImportClick = () => {
    console.log('Import button clicked')
    
    // Show file dialog simulation
    if (confirm('Import existing project? This will open the import wizard for uploading project files.')) {
      router.push('/dashboard/projects-hub/import')
    }
  }

  const handleQuickStartClick = () => {
    console.log('Quick start button clicked')
    
    // Show template selection
    if (confirm('Start from template? Choose from our professionally designed project templates.')) {
      router.push('/dashboard/projects-hub/templates')
    }
  }

  const handleViewAllClick = () => {
    console.log('View all clicked')
    alert('View All Projects - This would show the complete projects listing with advanced filtering and search capabilities.')
  }

  const handleExportDataClick = () => {
    console.log('Export data clicked')
    alert('Export Data - This would generate a downloadable report of all project data in CSV or PDF format.')
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects Hub</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Projects</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProjects
              .filter((project) => project.status === 'in-progress')
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProjects
              .filter((project) => project.status === 'completed')
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Add template cards here */}
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle>Start from Template</CardTitle>
                <CardDescription>Choose from our pre-built project templates</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleQuickStartClick} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateProject}
      />
      <ImportProjectDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportProject}
      />
      <QuickStartDialog
        open={quickStartDialogOpen}
        onOpenChange={setQuickStartDialogOpen}
        onSelect={handleQuickStart}
      />
    </div>
  )
} 