"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Camera,
  Share2,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Download,
  Upload,
  Eye,
  Settings,
  Target,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// Mock project data
const mockProject = {
  id: '1',
  name: 'Brand Identity Package',
  client: 'Acme Corporation',
  description: 'Complete brand identity design including logo, typography, color palette, and comprehensive brand guidelines for a modern tech company.',
  status: 'In Progress',
  progress: 75,
  value: 2500,
  deadline: '2024-01-15',
  priority: 'high',
  tags: ['Design', 'Branding', 'Logo', 'Typography'],
  createdAt: '2023-12-01',
  lastUpdated: '2024-01-08',
  team: [
    { id: '1', name: 'John Doe', role: 'Lead Designer', avatar: '/placeholder-user.jpg' },
    { id: '2', name: 'Jane Smith', role: 'Brand Strategist', avatar: '/placeholder-user.jpg' }
  ],
  client_info: {
    name: 'Acme Corporation',
    contact: 'Sarah Johnson',
    email: 'sarah@acme.com',
    phone: '+1 (555) 123-4567'
  },
  milestones: [
    { id: '1', title: 'Research & Discovery', status: 'completed', date: '2023-12-05', amount: 500 },
    { id: '2', title: 'Concept Development', status: 'completed', date: '2023-12-15', amount: 750 },
    { id: '3', title: 'Design Refinement', status: 'in_progress', date: '2024-01-10', amount: 750 },
    { id: '4', title: 'Final Delivery', status: 'pending', date: '2024-01-15', amount: 500 }
  ],
  files: [
    { id: '1', name: 'Logo_Concepts_v1.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2023-12-10' },
    { id: '2', name: 'Brand_Colors.sketch', type: 'sketch', size: '1.1 MB', uploaded: '2023-12-12' },
    { id: '3', name: 'Typography_Guide.pdf', type: 'pdf', size: '3.2 MB', uploaded: '2023-12-14' }
  ],
  activities: [
    { id: '1', type: 'file_upload', message: 'Uploaded Typography_Guide.pdf', user: 'John Doe', time: '2 hours ago' },
    { id: '2', type: 'comment', message: 'Added feedback on logo concepts', user: 'Sarah Johnson', time: '5 hours ago' },
    { id: '3', type: 'milestone', message: 'Completed Concept Development milestone', user: 'Jane Smith', time: '1 day ago' }
  ],
  timeTracking: {
    totalHours: 42,
    thisWeek: 12,
    breakdown: [
      { task: 'Logo Design', hours: 18 },
      { task: 'Brand Strategy', hours: 14 },
      { task: 'Documentation', hours: 10 }
    ]
  }
}

export default function ProjectDetailPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState(mockProject)

  // A+++ LOAD PROJECT DATA
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load project'))
            } else {
              resolve(null)
            }
          }, 1000)
        })
        setIsLoading(false)
        announce('Project loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project')
        setIsLoading(false)
        announce('Error loading project', 'assertive')
      }
    }
    loadProjectData()
  }, [announce])
  const [activeTab, setActiveTab] = useState('overview')

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
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

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Project Value</p>
                <p className="text-2xl font-bold text-green-600">${project.value.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Tracked</p>
                <p className="text-2xl font-bold text-blue-600">{project.timeTracking.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-purple-600">{project.team.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-orange-600">{project.progress}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
            <p className="text-sm text-gray-600">
              {project.milestones.filter(m => m.status === 'completed').length} of {project.milestones.length} milestones completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Started</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Deadline</span>
                <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Days Remaining</span>
                <span className="font-medium text-orange-600">
                  {Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMilestonesTab = () => (
    <div className="space-y-4">
      {project.milestones.map((milestone, index) => (
        <Card key={milestone.id} className="bg-white/70 backdrop-blur-sm border-white/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                  milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                )}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                  <p className="text-sm text-gray-600">Due: {new Date(milestone.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(milestone.status)}>
                  {milestone.status.replace('_', ' ')}
                </Badge>
                <p className="text-sm font-medium text-green-600 mt-1">${milestone.amount}</p>
              </div>
            </div>
            {milestone.status === 'in_progress' && (
              <div className="mt-4">
                <Button size="sm" className="mr-2">Mark Complete</Button>
                <Button size="sm" variant="outline">Add Note</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderFilesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Files</h3>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.files.map(file => (
          <Card key={file.id} className="bg-white/70 backdrop-blur-sm border-white/40 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                  <p className="text-sm text-gray-600">{file.size}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">Uploaded: {file.uploaded}</p>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderTeamTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          Invite Member
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project.team.map(member => (
          <Card key={member.id} className="bg-white/70 backdrop-blur-sm border-white/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-white/70 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-medium">{project.client_info.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Contact Person</p>
            <p className="font-medium">{project.client_info.contact}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{project.client_info.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{project.client_info.phone}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

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
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <div className={cn("w-3 h-3 rounded-full", getPriorityColor(project.priority))} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Client: {project.client}</span>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 mb-6">
          <CardContent className="p-4">
            <p className="text-gray-700">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-xl border border-white/30 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
          <TabsContent value="milestones">{renderMilestonesTab()}</TabsContent>
          <TabsContent value="files">{renderFilesTab()}</TabsContent>
          <TabsContent value="team">{renderTeamTab()}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}