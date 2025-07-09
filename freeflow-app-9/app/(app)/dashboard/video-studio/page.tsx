'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  Video,
  Mic,
  MicOff,
  Monitor,
  Users,
  Share2,
  Download,
  Upload,
  Edit3,
  Scissors,
  Image,
  FileText,
  Settings,
  Layers,
  Palette,
  Type,
  Sparkles,
  Brain,
  TrendingUp,
  BarChart3,
  Clock,
  Eye,
  MessageSquare,
  Star,
  Trash2,
  Copy,
  Save,
  Folder,
  Filter,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Zap,
  Target,
  Award,
  Activity,
  RefreshCw
} from 'lucide-react'

interface VideoProject {
  id: string
  title: string
  description: string
  duration: number
  resolution: string
  format: string
  size: string
  created: Date
  modified: Date
  status: 'draft' | 'processing' | 'ready' | 'published'
  thumbnail: string
  views: number
  likes: number
  comments: number
  client?: string
  tags: string[]
}

interface VideoTemplate {
  id: string
  name: string
  category: string
  duration: number
  thumbnail: string
  description: string
  premium: boolean
}

interface VideoAsset {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'font' | 'transition'
  duration?: number
  size: string
  format: string
  thumbnail: string
  created: Date
  tags: string[]
}

export default function VideoStudioPage() {
  const [activeTab, setActiveTab] = useState('projects')
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([80])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(300)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [recordingType, setRecordingType] = useState('screen')
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    resolution: '1920x1080',
    format: 'mp4',
    client: ''
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Mock data
  const mockProjects: VideoProject[] = [
    {
      id: '1',
      title: 'Product Demo Video',
      description: 'Comprehensive product walkthrough for new feature release',
      duration: 180,
      resolution: '1920x1080',
      format: 'mp4',
      size: '124 MB',
      created: new Date('2024-01-15'),
      modified: new Date('2024-01-20'),
      status: 'ready',
      thumbnail: '/video-thumbnails/product-demo.jpg',
      views: 1247,
      likes: 89,
      comments: 23,
      client: 'TechCorp Inc.',
      tags: ['product', 'demo', 'tutorial']
    },
    {
      id: '2',
      title: 'Brand Story Animation',
      description: 'Animated brand story for social media campaign',
      duration: 60,
      resolution: '1080x1080',
      format: 'mp4',
      size: '45 MB',
      created: new Date('2024-01-10'),
      modified: new Date('2024-01-18'),
      status: 'processing',
      thumbnail: '/video-thumbnails/brand-story.jpg',
      views: 892,
      likes: 156,
      comments: 34,
      client: 'StartupXYZ',
      tags: ['animation', 'brand', 'social']
    },
    {
      id: '3',
      title: 'Training Module Series',
      description: 'Employee training video series - Part 1 of 5',
      duration: 420,
      resolution: '1920x1080',
      format: 'mp4',
      size: '298 MB',
      created: new Date('2024-01-05'),
      modified: new Date('2024-01-19'),
      status: 'ready',
      thumbnail: '/video-thumbnails/training.jpg',
      views: 2156,
      likes: 234,
      comments: 67,
      client: 'Corporate Learning',
      tags: ['training', 'education', 'corporate']
    },
    {
      id: '4',
      title: 'Client Testimonial',
      description: 'Customer success story and testimonial video',
      duration: 90,
      resolution: '1920x1080',
      format: 'mp4',
      size: '67 MB',
      created: new Date('2024-01-12'),
      modified: new Date('2024-01-21'),
      status: 'draft',
      thumbnail: '/video-thumbnails/testimonial.jpg',
      views: 456,
      likes: 45,
      comments: 12,
      client: 'Marketing Agency',
      tags: ['testimonial', 'customer', 'success']
    }
  ]

  const mockTemplates: VideoTemplate[] = [
    {
      id: '1',
      name: 'Product Launch',
      category: 'Marketing',
      duration: 30,
      thumbnail: '/templates/product-launch.jpg',
      description: 'Professional product launch video template',
      premium: true
    },
    {
      id: '2',
      name: 'Social Media Intro',
      category: 'Social',
      duration: 15,
      thumbnail: '/templates/social-intro.jpg',
      description: 'Eye-catching social media intro template',
      premium: false
    },
    {
      id: '3',
      name: 'Tutorial Series',
      category: 'Education',
      duration: 60,
      thumbnail: '/templates/tutorial.jpg',
      description: 'Clean tutorial video template',
      premium: false
    },
    {
      id: '4',
      name: 'Corporate Presentation',
      category: 'Business',
      duration: 120,
      thumbnail: '/templates/corporate.jpg',
      description: 'Professional corporate presentation template',
      premium: true
    }
  ]

  const mockAssets: VideoAsset[] = [
    {
      id: '1',
      name: 'Intro Animation',
      type: 'video',
      duration: 5,
      size: '12 MB',
      format: 'mp4',
      thumbnail: '/assets/intro-animation.jpg',
      created: new Date('2024-01-15'),
      tags: ['intro', 'animation', 'logo']
    },
    {
      id: '2',
      name: 'Background Music',
      type: 'audio',
      duration: 180,
      size: '8 MB',
      format: 'mp3',
      thumbnail: '/assets/audio-wave.jpg',
      created: new Date('2024-01-10'),
      tags: ['music', 'background', 'upbeat']
    },
    {
      id: '3',
      name: 'Brand Logo',
      type: 'image',
      size: '2 MB',
      format: 'png',
      thumbnail: '/assets/brand-logo.jpg',
      created: new Date('2024-01-08'),
      tags: ['logo', 'brand', 'transparent']
    },
    {
      id: '4',
      name: 'Fade Transition',
      type: 'transition',
      duration: 2,
      size: '1 MB',
      format: 'mov',
      thumbnail: '/assets/fade-transition.jpg',
      created: new Date('2024-01-12'),
      tags: ['transition', 'fade', 'smooth']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    alert('Recording started! (Simulated)')
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    alert('Recording stopped and saved!')
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleCreateProject = () => {
    const project: VideoProject = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      duration: 0,
      resolution: newProject.resolution,
      format: newProject.format,
      size: '0 MB',
      created: new Date(),
      modified: new Date(),
      status: 'draft',
      thumbnail: '/video-thumbnails/default.jpg',
      views: 0,
      likes: 0,
      comments: 0,
      client: newProject.client,
      tags: []
    }
    
    // In a real app, this would be saved to the backend
    alert('Project created successfully!')
    setIsCreateModalOpen(false)
    setNewProject({
      title: '',
      description: '',
      resolution: '1920x1080',
      format: 'mp4',
      client: ''
    })
  }

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategory === 'all' || project.tags.includes(filterCategory)
    return matchesSearch && matchesFilter
  })

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategory === 'all' || template.category.toLowerCase() === filterCategory
    return matchesSearch && matchesFilter
  })

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterCategory === 'all' || asset.type === filterCategory
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Video Studio</h1>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Professional video editing</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={isRecording ? "animate-pulse" : ""}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
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
                  <DialogTitle>Create New Video Project</DialogTitle>
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
                      <Label htmlFor="resolution">Resolution</Label>
                      <Select value={newProject.resolution} onValueChange={(value) => setNewProject({...newProject, resolution: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                          <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                          <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                          <SelectItem value="1080x1080">1080x1080 (Square)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="format">Format</Label>
                      <Select value={newProject.format} onValueChange={(value) => setNewProject({...newProject, format: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                          <SelectItem value="avi">AVI</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="client">Client (Optional)</Label>
                    <Input
                      id="client"
                      value={newProject.client}
                      onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                      placeholder="Client name"
                    />
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
            <TabsTrigger value="projects">Projects ({filteredProjects.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-6">
            {/* Recording Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Recording Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Recording Type</Label>
                    <Select value={recordingType} onValueChange={setRecordingType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="screen">Screen Recording</SelectItem>
                        <SelectItem value="webcam">Webcam</SelectItem>
                        <SelectItem value="both">Screen + Webcam</SelectItem>
                        <SelectItem value="audio">Audio Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quality</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="4k">4K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frame Rate</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className={isMuted ? "bg-red-50 border-red-200" : ""}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Settings opened!')}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
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
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Projects Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProjects.map(project => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        {project.client && (
                          <Badge variant="outline" className="text-xs">
                            {project.client}
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <p className="font-medium">{formatDuration(project.duration)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolution:</span>
                        <p className="font-medium">{project.resolution}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <p className="font-medium">{project.size}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Format:</span>
                        <p className="font-medium">{project.format.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {project.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {project.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {project.comments}
                        </span>
                      </div>
                      <span>{project.modified.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => alert(`Editing project: ${project.title}`)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => alert(`Sharing project: ${project.title}`)}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{template.category}</Badge>
                      {template.premium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{formatDuration(template.duration)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => alert(`Previewing template: ${template.name}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => alert(`Using template: ${template.name}`)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
                onClick={() => alert('Upload video assets')}
              >
                <Video className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Video</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
                onClick={() => alert('Upload audio assets')}
              >
                <Volume2 className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Audio</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
                onClick={() => alert('Upload images')}
              >
                <Image className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Images</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
                onClick={() => alert('Browse stock assets')}
              >
                <Folder className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Stock Assets</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAssets.map(asset => (
                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline">{asset.type}</Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-sm">{asset.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      {asset.type === 'video' && <Video className="w-6 h-6 text-gray-400" />}
                      {asset.type === 'audio' && <Volume2 className="w-6 h-6 text-gray-400" />}
                      {asset.type === 'image' && <Image className="w-6 h-6 text-gray-400" />}
                      {asset.type === 'transition' && <Zap className="w-6 h-6 text-gray-400" />}
                    </div>
                    
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size:</span>
                        <span>{asset.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Format:</span>
                        <span>{asset.format.toUpperCase()}</span>
                      </div>
                      {asset.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Duration:</span>
                          <span>{formatDuration(asset.duration)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => alert(`Using asset: ${asset.name}`)}
                      >
                        Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => alert(`Downloading asset: ${asset.name}`)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Videos</p>
                      <p className="text-2xl font-bold text-gray-900">{mockProjects.length}</p>
                    </div>
                    <Video className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {mockProjects.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
                      </p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Likes</p>
                      <p className="text-2xl font-bold text-green-600">
                        {mockProjects.reduce((sum, p) => sum + p.likes, 0)}
                      </p>
                    </div>
                    <Star className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Engagement</p>
                      <p className="text-2xl font-bold text-orange-600">87%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProjects.map(project => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-gray-600">{project.views} views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">{project.likes} likes</p>
                          <p className="text-xs text-gray-500">{project.comments} comments</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Optimal Upload Time</p>
                        <p className="text-sm text-blue-700">Tuesday 2-4 PM performs best</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Target className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Content Recommendation</p>
                        <p className="text-sm text-green-700">Tutorial videos get 40% more engagement</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Duration Insight</p>
                        <p className="text-sm text-yellow-700">3-5 minute videos have highest retention</p>
                      </div>
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