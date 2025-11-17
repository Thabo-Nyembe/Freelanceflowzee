'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// Toast removed - using console.log
import VideoTemplates from '@/components/video/video-templates'
import AssetPreviewModal, { Asset } from '@/components/video/asset-preview-modal'
import EnhancedFileUpload from '@/components/video/enhanced-file-upload'
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
  Plus,
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

type TabType = 'projects' | 'templates' | 'assets' | 'analytics'
type RecordingType = 'screen' | 'webcam' | 'both' | 'audio'
type FilterType = 'all' | 'product' | 'training' | 'marketing' | 'social'

interface NewProjectForm {
  title: string
  description: string
  resolution: string
  format: string
  client: string
}

export default function VideoStudioPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isAssetPreviewOpen, setIsAssetPreviewOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [volume, setVolume] = useState<number[]>([80])
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(300)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [recordingType, setRecordingType] = useState<RecordingType>('screen')
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<FilterType>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [newProject, setNewProject] = useState<NewProjectForm>({
    title: '',
    description: '',
    resolution: '1920x1080',
    format: 'mp4',
    client: ''
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Handlers
  const handleCreateProject = () => { console.log('➕ CREATE PROJECT'); setIsCreateModalOpen(true); alert('➕ Create New Video Project\n\nInitializing project setup...') }
  const handleOpenProject = (projectId: string) => { console.log('📂 OPEN:', projectId); alert('📂 Opening Project\n\nLoading video editor...') }
  const handleDeleteProject = (projectId: string) => { console.log('🗑️ DELETE:', projectId); confirm('Delete this project?') && alert('✅ Project deleted') }
  const handleDuplicateProject = (projectId: string) => { console.log('📋 DUPLICATE:', projectId); alert('📋 Project Duplicated\n\nCopy created successfully') }
  const handleExportVideo = (format: string) => { console.log('💾 EXPORT:', format); alert(`💾 Exporting Video\n\nFormat: ${format}\n\nProcessing...`) }
  const handlePublishVideo = (projectId: string) => { console.log('🚀 PUBLISH:', projectId); alert('🚀 Publishing Video\n\nUploading to platform...') }
  const handleShareVideo = (projectId: string) => { console.log('🔗 SHARE:', projectId); alert('🔗 Share Video\n\nGenerate shareable link\nShare to social media') }
  const handleStartRecording = (type: RecordingType) => { console.log('🎬 RECORD:', type); setRecordingType(type); setIsRecording(true); alert(`🎬 Recording ${type}\n\nRecording started...`) }
  const handleStopRecording = () => { console.log('⏹️ STOP'); setIsRecording(false); alert('⏹️ Recording Stopped\n\nSaving video...') }
  const handlePlayPause = () => { setIsPlaying(!isPlaying); console.log(isPlaying ? '⏸️ PAUSE' : '▶️ PLAY') }
  const handleToggleMute = () => { setIsMuted(!isMuted); console.log(isMuted ? '🔊 UNMUTE' : '🔇 MUTE') }
  const handleToggleFullscreen = () => { setIsFullscreen(!isFullscreen); console.log(isFullscreen ? '🪟 EXIT FULLSCREEN' : '⛶ FULLSCREEN') }
  const handleAddMedia = (type: string) => { console.log('➕ ADD:', type); alert(`➕ Add ${type}\n\nBrowse media library\nUpload new ${type}`) }
  const handleAddTransition = () => { console.log('✨ TRANSITION'); alert('✨ Add Transition\n\nChoose transition effect\nAdjust duration') }
  const handleAddEffect = () => { console.log('🎨 EFFECT'); alert('🎨 Add Effect\n\nBrowse effects library\nApply to clip') }
  const handleAddText = () => { console.log('📝 TEXT'); alert('📝 Add Text\n\nCreate text overlay\nCustomize font and style') }
  const handleAddAudio = () => { console.log('🎵 AUDIO'); alert('🎵 Add Audio\n\nBrowse music library\nUpload audio file\nRecord voiceover') }
  const handleTrimClip = () => { console.log('✂️ TRIM'); alert('✂️ Trim Clip\n\nDrag handles to adjust clip duration') }
  const handleSplitClip = () => { console.log('✂️ SPLIT'); alert('✂️ Split Clip\n\nSplit clip at playhead position') }
  const handleUseTemplate = (templateId: string) => { console.log('📋 TEMPLATE:', templateId); alert('📋 Using Template\n\nApplying template to project...') }
  const handleSaveProject = () => { console.log('💾 SAVE'); alert('💾 Project Saved\n\nAll changes saved successfully') }
  const handleUndo = () => { console.log('↩️ UNDO'); alert('↩️ Undo last action') }
  const handleRedo = () => { console.log('↪️ REDO'); alert('↪️ Redo action') }
  const handleGenerateSubtitles = () => { console.log('📝 SUBTITLES'); alert('📝 Auto-Generate Subtitles\n\nAnalyzing audio\nCreating captions') }
  const handleAIEnhancement = () => { console.log('✨ AI ENHANCE'); alert('✨ AI Enhancement\n\nAuto color correction\nNoise reduction\nStabilization\nQuality improvement') }
  const handleCollaborate = () => { console.log('👥 COLLAB'); alert('👥 Invite Collaborators\n\nShare project\nReal-time editing\nComment and review') }
  const handleRenderPreview = () => { console.log('👁️ PREVIEW'); alert('👁️ Rendering Preview\n\nGenerating preview...') }
  const handleApplyColorGrade = () => { console.log('🎨 COLOR GRADE'); alert('🎨 Color Grading\n\nAdjust brightness\nContrast\nSaturation\nApply LUTs') }
  const handleAnalytics = (projectId: string) => { console.log('📊 ANALYTICS:', projectId); alert('📊 Video Analytics\n\nViews\nEngagement\nWatch time\nAudience insights') }
  const handleVersionHistory = (projectId: string) => { console.log('📜 VERSIONS:', projectId); alert('📜 Version History\n\nView all versions\nRestore previous version') }

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

  const handleStartRecording = async () => {
    try {
      setIsRecording(true)
      // In a real implementation, you would start actual recording here
      console.log('Recording started with type:', recordingType)
    } catch (error) {
      console.error('Failed to start recording:', error)
      setIsRecording(false)
    }
  }

  const handleStopRecording = async () => {
    try {
      setIsRecording(false)
      // In a real implementation, you would stop recording and save the file
      console.log('Recording stopped and processing...')
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      console.error('Project title is required')
      return
    }

    try {
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
      console.log('Creating project:', project)
      
      setIsCreateModalOpen(false)
      setNewProject({
        title: '',
        description: '',
        resolution: '1920x1080',
        format: 'mp4',
        client: ''
      })
    } catch (error) {
      console.error('Failed to create project:', error)
    }
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
    const matchesFilter = filterCategory === 'all' || 
                         (filterCategory === 'video' && asset.type === 'video') ||
                         (filterCategory === 'audio' && asset.type === 'audio') ||
                         (filterCategory === 'image' && asset.type === 'image') ||
                         (filterCategory === 'transition' && asset.type === 'transition')
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
                      onClick={() => {
                          // Open video studio settings
                          console.log('ℹ️', 'Video Studio settings - Feature coming soon!')
                        }}
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
                        onClick={() => {
                          console.log('ℹ️', `Opening editor for: ${project.title}`)
                          // Navigate to video editor
                          router.push(`/video-studio/editor/${project.id}`)
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          console.log('✅', `Share link copied for: ${project.title}`)
                          // Copy share link to clipboard
                          navigator.clipboard.writeText(`${window.location.origin}/share/${project.id}`)
                        }}
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
              onClick={() => {
                          setIsTemplateDialogOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          console.log('✅', `Applied template: ${template.name}`)
                          // Apply template to new project
                        }}
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
  onClick={() => {
                setIsUploadDialogOpen(true)
              }}
              >
                <Video className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Video</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
  onClick={() => {
                setIsUploadDialogOpen(true)
              }}
              >
                <Volume2 className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Audio</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
  onClick={() => {
                setIsUploadDialogOpen(true)
              }}
              >
                <Image className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Images</span>
              </Button>
              
              <Button
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
  onClick={() => {
                setIsUploadDialogOpen(true)
              }}
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
onClick={() => {
                          // Create a mock asset for preview
                          const mockAsset: Asset = {
                            id: asset.id,
                            name: asset.name,
                            type: asset.type as 'video' | 'audio' | 'image',
                            url: asset.url,
                            thumbnail: asset.thumbnail,
                            size: asset.size || 1024000,
                            format: asset.format,
                            tags: asset.tags || [],
                            description: `Professional ${asset.type} asset`,
                            createdAt: new Date().toISOString(),
                            duration: asset.duration,
                            dimensions: asset.type === 'image' ? { width: 1920, height: 1080 } : undefined
                          }
                          setSelectedAsset(mockAsset)
                          setIsAssetPreviewOpen(true)
                        }}
                      >
                        Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          console.log('ℹ️', `Downloading ${asset.name}...`)
                          // Download asset file
                          const link = document.createElement('a')
                          link.href = asset.url
                          link.download = asset.name
                          link.click()
                        }}
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

      {/* Dialogs */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Video Templates</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[80vh] pr-2">
            <VideoTemplates
              onSelectTemplate={(template) => {
                console.log('✅', `Applied template: ${template.name}`)
                setIsTemplateDialogOpen(false)
              }}
              onPreviewTemplate={(template) => {
                console.log('ℹ️', `Previewing: ${template.name}`)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Upload Assets</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[80vh] pr-2">
            <EnhancedFileUpload
              acceptedTypes="all"
              onUploadComplete={(files) => {
                console.log('✅', `Uploaded ${files.length} file(s) successfully!`)
                setIsUploadDialogOpen(false)
              }}
              maxFiles={20}
              maxSize={500}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AssetPreviewModal
        asset={selectedAsset}
        isOpen={isAssetPreviewOpen}
        onClose={() => {
          setIsAssetPreviewOpen(false)
          setSelectedAsset(null)
        }}
        onAddToProject={(asset) => {
          console.log('✅', `Added ${asset.name} to project`)
        }}
        onDownload={(asset) => {
          console.log('✅', `Downloading ${asset.name}`)
        }}
      />
    </div>
  )
}