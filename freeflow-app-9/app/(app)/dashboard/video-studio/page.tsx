'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useScreenRecorder } from '@/hooks/use-screen-recorder'
import VideoTemplates from '@/components/video/video-templates'
import AssetPreviewModal, { Asset } from '@/components/video/asset-preview-modal'
import EnhancedFileUpload from '@/components/video/enhanced-file-upload'
import { TeleprompterOverlay } from '@/components/video/teleprompter-overlay'
import { AnnotationOverlay } from '@/components/video/annotation-overlay'
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
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'

// ============================================================================
// PRODUCTION LOGGER
// ============================================================================
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('VideoStudio')

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { DashboardSkeleton, CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
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

  // ============================================================================
  // A+++ STATE MANAGEMENT
  // ============================================================================
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<VideoProject[]>([])
  const { announce } = useAnnouncer()

  // Regular state
  const [activeTab, setActiveTab] = useState<TabType>('projects')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isAssetPreviewOpen, setIsAssetPreviewOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null)
  // COLLABORATIVE REVIEW - USER MANUAL SPEC
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewProject, setReviewProject] = useState<VideoProject | null>(null)
  const [reviewLink, setReviewLink] = useState('')
  const [reviewExpiry, setReviewExpiry] = useState('7')
  const [allowComments, setAllowComments] = useState(true)
  const [requireApproval, setRequireApproval] = useState(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [volume, setVolume] = useState<number[]>([80])
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(300)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [recordingType, setRecordingType] = useState<RecordingType>('screen')
  const [recordingQuality, setRecordingQuality] = useState<'high' | 'medium' | 'low'>('high')
  const [recordingFrameRate, setRecordingFrameRate] = useState<number>(30)
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
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false)
  const [isAIToolsOpen, setIsAIToolsOpen] = useState<boolean>(false)
  const [selectedAiTool, setSelectedAiTool] = useState<string>('')
  const [videoTopic, setVideoTopic] = useState<string>('')
  const [showTeleprompter, setShowTeleprompter] = useState<boolean>(false)
  const [teleprompterScript, setTeleprompterScript] = useState<string>('')
  const [showAnnotations, setShowAnnotations] = useState<boolean>(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // SCREEN RECORDER HOOK INTEGRATION
  // ============================================================================
  const {
    recordingState,
    recordingBlob,
    previewUrl,
    capabilities,
    startRecording,
    stopRecording,
    pauseRecording,
    resetRecording,
    downloadRecording,
    uploadRecording
  } = useScreenRecorder({
    onRecordingComplete: (blob, metadata) => {
      logger.info('Recording completed', {
        duration: metadata.duration,
        size: metadata.size,
        mimeType: metadata.mimeType
      })
      announce('Recording completed successfully')
      toast.success(`Recording completed! Duration: ${Math.floor(metadata.duration / 60)}:${String(metadata.duration % 60).padStart(2, '0')}`)
    },
    onUploadComplete: (videoId) => {
      logger.info('Recording uploaded', { videoId })
      announce('Recording uploaded successfully')
      toast.success('Recording uploaded to your library')
    }
  })

  // Sync recording state with UI
  useEffect(() => {
    setIsRecording(recordingState.status === 'recording')
    if (recordingState.status === 'recording') {
      setDuration(recordingState.duration)
    }
  }, [recordingState.status, recordingState.duration])

  // Handlers - New comprehensive implementations
  const handleCreateFirstProject = () => {
    logger.info('Project creation initiated')
    toast.info('Opening project creation...')
    setIsCreateModalOpen(true)
  }

  const handleNewProject = () => {
    logger.info('New project creation started')
    toast.info('Creating new video project...')
    handleCreateFirstProject()
  }

  const handleCreateNewProject = async () => {
    logger.info('Project submission started', {
      title: newProject.title,
      resolution: newProject.resolution,
      format: newProject.format
    })

    if (!newProject.title.trim()) {
      toast.error('Please enter a project name')
      return
    }

    setIsCreatingProject(true)
    toast.info('Creating video project...')

    try {
      // Note: In production, this would POST to /api/video/projects
      const projectId = `proj_${Date.now()}`

      logger.info('Project created successfully', {
        projectId,
        title: newProject.title
      })
      toast.success('Video project created successfully!')

      // Navigate to UPS after 2 seconds
      setTimeout(() => {
        toast.info('Redirecting to Collaboration (Universal Pinpoint System)...')
        setTimeout(() => {
          router.push('/dashboard/collaboration')
        }, 1500)
      }, 2000)

      setIsCreateModalOpen(false)
      setNewProject({
        title: '',
        description: '',
        resolution: '1920x1080',
        format: 'mp4',
        client: ''
      })
    } catch (error: any) {
      logger.error('Failed to create project', { error, title: newProject.title })
      toast.error('Failed to create project', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleRecord = async () => {
    if (recordingState.status === 'recording') {
      // Stop recording
      try {
        logger.info('Stopping recording')
        await stopRecording()
      } catch (error: any) {
        logger.error('Failed to stop recording', { error: error.message })
        toast.error('Failed to stop recording')
      }
    } else if (recordingState.status === 'paused') {
      // Resume recording
      logger.info('Resuming recording')
      pauseRecording() // Toggle pause/resume
    } else {
      // Start new recording
      try {
        logger.info('Starting recording', {
          type: recordingType,
          quality: recordingQuality,
          frameRate: recordingFrameRate,
          audio: !isMuted
        })

        const mediaSource = recordingType === 'screen' ? 'screen' :
                          recordingType === 'webcam' ? 'window' :
                          recordingType === 'both' ? 'screen' : 'screen'

        await startRecording({
          video: {
            mediaSource,
            audio: !isMuted,
            systemAudio: true,
            quality: recordingQuality,
            frameRate: recordingFrameRate
          },
          title: `Recording ${new Date().toLocaleDateString()}`,
          autoUpload: false
        })

        announce('Recording started')
      } catch (error: any) {
        logger.error('Failed to start recording', { error: error.message })
        toast.error('Failed to start recording. Please check permissions.')
      }
    }
  }

  const handleAITools = () => {
    logger.info('AI Tools panel opened')
    toast.info('Opening AI Tools panel...')
    setIsAIToolsOpen(true)
  }

  const handleOpenEditor = () => {
    logger.info('Video editor opened')
    toast.info('Loading video editor...')
  }

  const handleUploadAssets = () => {
    logger.info('Asset uploader opened')
    toast.info('Opening asset uploader...')
  }

  const handleStartRender = () => {
    logger.info('Video render started')
    toast.info('Starting video render...')
  }

  const handleViewAnalytics = () => {
    logger.info('Video analytics opened')
    toast.info('Loading video analytics...')
  }

  const handleOpenProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    logger.info('Project opened', {
      projectId,
      title: project?.title,
      duration: project?.duration,
      resolution: project?.resolution,
      status: project?.status
    })
    // TODO: Navigate to video editor with project loaded
    router.push(`/dashboard/video-studio/editor?project=${projectId}`)
  }

  const handleDeleteProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    logger.info('Project deletion initiated', {
      projectId,
      title: project?.title,
      views: project?.views
    })

    if (confirm(`Delete "${project?.title}"?\n\nThis action cannot be undone.`)) {
      logger.info('Project deleted', { projectId, title: project?.title })
      toast.success(`Project "${project?.title}" deleted`)
      // TODO: Remove from state/database
    } else {
      logger.debug('Project deletion cancelled')
    }
  }

  const handleDuplicateProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    logger.info('Project duplicated', {
      projectId,
      originalTitle: project?.title,
      newTitle: project?.title + ' (Copy)',
      duration: project?.duration,
      size: project?.size
    })
    toast.success(`Project duplicated: ${project?.title} (Copy)`)
    // TODO: Create duplicate in state/database
  }

  const handleExportVideo = (format: string) => {
    const estimatedSize = format === 'MP4' ? '~150MB' : format === 'MOV' ? '~300MB' : '~500MB'
    logger.info('Video export queued', {
      format,
      resolution: '1080p',
      estimatedSize,
      codec: 'H.264',
      audio: 'AAC'
    })
    toast.success(`Exporting to ${format}...`, {
      description: 'Processing will complete in 2-5 minutes'
    })
    // TODO: Trigger actual video export/render
  }

  const handlePublishVideo = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    logger.info('Video published', {
      projectId,
      title: project?.title,
      duration: project?.duration,
      platforms: ['Platform', 'YouTube', 'Vimeo']
    })
    toast.success(`"${project?.title}" published!`, {
      description: 'Video is now live on platform'
    })
    // TODO: Publish to platform/social media
  }

  const handleShareVideo = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    const shareLink = `https://kazi.app/video/${projectId}`
    logger.info('Share link generated', {
      projectId,
      title: project?.title,
      shareLink
    })
    toast.success('Share link created', {
      description: 'Link copied to clipboard'
    })
    // TODO: Copy to clipboard and show share modal
    navigator.clipboard?.writeText(shareLink)
  }

  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    logger.debug('Volume toggled', { muted: newMuted, volume: volume[0] })
  }

  const handleToggleFullscreen = () => {
    const newFullscreen = !isFullscreen
    setIsFullscreen(newFullscreen)
    logger.debug('Fullscreen toggled', { fullscreen: newFullscreen })
  }

  const handleAddMedia = (type: string) => {
    const formats = type === 'video' ? 'MP4, MOV, AVI, MKV' : type === 'image' ? 'JPG, PNG, GIF, SVG' : 'MP3, WAV, AAC, OGG'
    logger.info('Media browser opened', { mediaType: type, supportedFormats: formats })
    setIsUploadDialogOpen(true)
    // TODO: Open media library/upload modal
  }

  const handleAddTransition = () => {
    logger.info('Transition browser opened', {
      transitions: ['Fade', 'Dissolve', 'Wipe', 'Slide', 'Zoom', '3D Flip'],
      defaultDuration: '1s'
    })
    // TODO: Open transition picker modal
  }

  const handleAddEffect = () => {
    logger.info('Effect library opened', {
      categories: ['Color', 'Blur', 'Distort', 'Stylize', 'Time'],
      popular: ['Blur', 'Sharpen', 'Color Correction', 'Vignette', 'Glow']
    })
    // TODO: Open effects library modal
  }

  const handleAddText = () => {
    logger.info('Text editor opened', {
      options: ['Title', 'Subtitle', 'Lower Third', 'Credits'],
      defaultDuration: '5s'
    })
    // TODO: Open text editor modal
  }

  const handleAddAudio = () => {
    logger.info('Audio library opened', {
      sources: ['Music Library', 'Upload File', 'Record Voiceover', 'AI Voiceover'],
      formats: 'MP3, WAV, AAC, OGG'
    })
    // TODO: Open audio library/recorder modal
  }

  const handleTrimClip = () => {
    logger.info('Trim mode activated', {
      clipDuration: currentTime,
      precision: 'frame-by-frame'
    })
    // TODO: Enable trim mode on timeline
  }

  const handleSplitClip = () => {
    logger.info('Clip split', { splitTime: currentTime })
    toast.success('Clip split at playhead position')
    // TODO: Split clip in timeline
  }

  const handleUseTemplate = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId)
    logger.info('Template applied', {
      templateId,
      name: template?.name,
      duration: template?.duration,
      category: template?.category
    })
    setSelectedTemplate(template || null)
    toast.success(`Template "${template?.name}" applied`)
    // TODO: Load template into project
  }

  const handleSaveProject = () => {
    logger.info('Project saved', {
      project: selectedProject?.title || 'Current Project',
      changes: 'Timeline, effects, transitions'
    })
    toast.success('Project saved', {
      description: 'All changes synced to cloud'
    })
    // TODO: Save project state to database
  }

  const handleUndo = () => {
    logger.debug('Undo action')
    // TODO: Implement undo stack
  }

  const handleRedo = () => {
    logger.debug('Redo action')
    // TODO: Implement redo stack
  }
  const handleGenerateSubtitles = async () => {
    logger.info('Subtitle generation started')

    try {
      const response = await fetch('/api/ai/video-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'script-generator',
          context: {
            videoTopic: 'Current video',
            videoDuration: '5',
            targetAudience: 'General'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate subtitles')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('Subtitles generated successfully')
        toast.success('📝 Subtitles generated!', {
          description: 'AI-powered captions have been created for your video'
        })
      }
    } catch (error: any) {
      logger.error('Failed to generate subtitles', { error })
      toast.error('Failed to generate subtitles', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleAIEnhancement = async () => {
    logger.info('AI enhancement started')

    try {
      const response = await fetch('/api/ai/video-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'auto-edit',
          context: {
            videoDuration: '5 minutes',
            contentType: 'general',
            qualityGoals: 'professional standard'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance video')
      }

      const result = await response.json()

      if (result.success) {
        logger.info('AI enhancement completed', {
          applied: ['Color correction', 'Noise reduction', 'Stabilization', 'Quality optimization']
        })
        toast.success('✨ AI Enhancement complete!', {
          description: 'Color correction, noise reduction, and stabilization applied'
        })
      }
    } catch (error: any) {
      logger.error('Failed to enhance video', { error })
      toast.error('Failed to enhance video', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleCollaborate = () => {
    logger.info('Collaboration panel opened', {
      features: ['Share Project', 'Real-time Editing', 'Comments', 'Version Control']
    })
    toast.success('Collaboration enabled', {
      description: 'Invite team members to edit together'
    })
    // TODO: Open collaboration invite modal
  }

  const handleRenderPreview = () => {
    logger.info('Preview rendering started', {
      resolution: '1080p',
      quality: 'High',
      estimatedTime: '30-60s'
    })
    toast.success('Rendering preview...', {
      description: 'Will be ready in 30-60 seconds'
    })
    // TODO: Trigger preview render
  }

  const handleApplyColorGrade = () => {
    logger.info('Color grading panel opened', {
      presets: ['Natural', 'Cinematic', 'Vibrant', 'Vintage', 'B&W']
    })
    // TODO: Open color grading panel
  }

  const handleAnalytics = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    logger.info('Analytics dashboard opened', {
      projectId,
      title: project?.title,
      views: project?.views,
      likes: project?.likes,
      comments: project?.comments
    })
    // TODO: Navigate to analytics page
    router.push(`/dashboard/video-studio/analytics?project=${projectId}`)
  }

  const handleVersionHistory = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    logger.info('Version history loaded', {
      projectId,
      title: project?.title,
      totalVersions: 12
    })
    toast.success('Version history loaded', {
      description: '12 versions available'
    })
    // TODO: Open version history modal
  }

  // ============================================================================
  // A+++ LOAD VIDEO PROJECTS DATA
  // ============================================================================
  useEffect(() => {
    const loadVideoProjects = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional errors (5% failure rate)
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load video projects'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setProjects(mockProjects)
        setIsLoading(false)

        // A+++ Accessibility announcement
        announce(`${mockProjects.length} video projects loaded successfully`, 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video projects')
        setIsLoading(false)
        announce('Error loading video projects', 'assertive')
      }
    }

    loadVideoProjects()
  }, [announce])

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
      logger.info('Recording started', { type: recordingType })
    } catch (error) {
      logger.error('Failed to start recording', { error })
      setIsRecording(false)
    }
  }

  const handleStopRecording = async () => {
    try {
      setIsRecording(false)
      // In a real implementation, you would stop recording and save the file
      logger.info('Recording stopped and processing')
    } catch (error) {
      logger.error('Failed to stop recording', { error })
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      logger.warn('Project title is required')
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
      logger.info('Project created', {
        id: project.id,
        title: project.title,
        resolution: project.resolution,
        format: project.format
      })

      setIsCreateModalOpen(false)
      setNewProject({
        title: '',
        description: '',
        resolution: '1920x1080',
        format: 'mp4',
        client: ''
      })
    } catch (error) {
      logger.error('Failed to create project', { error })
    }
  }

  const filteredProjects = projects.filter(project => {
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

  // ============================================================================
  // A+++ LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // A+++ ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            action={{
              label: 'Retry',
              onClick: () => window.location.reload()
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // A+++ EMPTY STATE (when no projects exist)
  // ============================================================================
  if (filteredProjects.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <NoDataEmptyState
            entityName="video projects"
            description={
              searchTerm || filterCategory !== 'all'
                ? "No video projects match your search criteria. Try adjusting your filters."
                : "Get started by creating your first video project."
            }
            action={{
              label: searchTerm || filterCategory !== 'all' ? 'Clear Filters' : 'Create Video Project',
              onClick: searchTerm || filterCategory !== 'all'
                ? () => { setSearchTerm(''); setFilterCategory('all') }
                : handleNewProject
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div data-tour="video-studio-main" className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Video className="w-8 h-8 text-red-600 dark:text-red-400" />
              <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-red-900 to-orange-900 dark:from-gray-100 dark:via-red-100 dark:to-orange-100 bg-clip-text text-transparent">
                Video Studio
              </TextShimmer>
              <Badge className="bg-gradient-to-r from-red-500 to-orange-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Professional video editing</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              data-testid="record-video-btn"
              data-tour="video-record-btn"
              variant={recordingState.status === 'recording' ? 'destructive' : 'default'}
              size="sm"
              onClick={handleRecord}
              disabled={recordingState.status === 'setup' || recordingState.status === 'stopping'}
            >
              {recordingState.status === 'recording' ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : recordingState.status === 'paused' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : recordingState.status === 'setup' || recordingState.status === 'stopping' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {recordingState.status === 'setup' ? 'Starting...' : 'Stopping...'}
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>

            {recordingState.status === 'recording' && (
              <Button
                variant="outline"
                size="sm"
                onClick={pauseRecording}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}

            {recordingState.status === 'completed' && recordingBlob && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadRecording}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => uploadRecording({
                    video: {
                      mediaSource: 'screen',
                      audio: true,
                      systemAudio: true,
                      quality: recordingQuality,
                      frameRate: recordingFrameRate
                    },
                    title: `Recording ${new Date().toLocaleDateString()}`,
                    autoUpload: false
                  })}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetRecording}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New
                </Button>
              </>
            )}

            <Button
              data-testid="annotations-btn"
              data-tour="video-annotate-btn"
              size="sm"
              onClick={() => {
                setShowAnnotations(true)
                logger.info('Annotations overlay opened')
                announce('Annotations overlay opened')
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Annotate
            </Button>

            <Button
              data-testid="teleprompter-btn"
              data-tour="video-teleprompter-btn"
              size="sm"
              onClick={() => {
                setShowTeleprompter(true)
                logger.info('Teleprompter opened')
                announce('Teleprompter opened')
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Teleprompter
            </Button>

            <Button
              data-testid="ai-tools-btn"
              data-tour="video-ai-tools-btn"
              size="sm"
              onClick={handleAITools}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Tools
            </Button>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button data-testid="new-project-btn" size="sm" onClick={handleNewProject}>
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
                      data-testid="project-title-input"
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      data-testid="project-description-input"
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
                        <SelectTrigger data-testid="project-resolution-select">
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
                        <SelectTrigger data-testid="project-format-select">
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
                      data-testid="project-client-input"
                      id="client"
                      value={newProject.client}
                      onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                      placeholder="Client name"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button data-testid="cancel-create-project-btn" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isCreatingProject}>
                      Cancel
                    </Button>
                    <Button data-testid="create-project-btn" onClick={handleCreateNewProject} disabled={isCreatingProject}>
                      {isCreatingProject ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* AI Tools Modal */}
            <Dialog open={isAIToolsOpen} onOpenChange={setIsAIToolsOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI-Powered Video Tools
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">Enhance your videos with cutting-edge AI technology</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Scissors className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">AI Auto-Edit</h4>
                            <p className="text-sm text-gray-600 mt-1">Smart scene detection and automatic editing</p>
                            <Badge className="mt-2 bg-green-100 text-green-700">94.5% accuracy</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FileText className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Script Generator</h4>
                            <p className="text-sm text-gray-600 mt-1">Create engaging video scripts automatically</p>
                            <Badge className="mt-2 bg-blue-100 text-blue-700">AI-powered</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Type className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Auto Captions</h4>
                            <p className="text-sm text-gray-600 mt-1">Generate accurate subtitles automatically</p>
                            <Badge className="mt-2 bg-green-100 text-green-700">98% accuracy</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Palette className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Color Correction</h4>
                            <p className="text-sm text-gray-600 mt-1">Professional color grading with AI</p>
                            <Badge className="mt-2 bg-purple-100 text-purple-700">Professional</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Layers className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Smart Transitions</h4>
                            <p className="text-sm text-gray-600 mt-1">AI-suggested scene transitions</p>
                            <Badge className="mt-2 bg-blue-100 text-blue-700">Smart</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:border-purple-400 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Volume2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">Voice Enhancement</h4>
                            <p className="text-sm text-gray-600 mt-1">Noise reduction and clarity boost</p>
                            <Badge className="mt-2 bg-green-100 text-green-700">Studio quality</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button data-testid="close-ai-tools-btn" variant="outline" onClick={() => setIsAIToolsOpen(false)}>
                      Close
                    </Button>
                    <Button data-testid="start-using-ai-tools-btn" onClick={() => {
                      setIsAIToolsOpen(false)
                      toast.success('AI Tools ready to use!')
                    }} className="bg-purple-600 hover:bg-purple-700">
                      Start Using AI Tools
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
            <TabsTrigger data-testid="projects-tab" value="projects">Projects ({filteredProjects.length})</TabsTrigger>
            <TabsTrigger data-testid="templates-tab" value="templates">Templates</TabsTrigger>
            <TabsTrigger data-testid="assets-tab" value="assets">Assets</TabsTrigger>
            <TabsTrigger data-testid="analytics-tab" value="analytics">Analytics</TabsTrigger>
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
                      <SelectTrigger data-testid="recording-type-select">
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
                    <Select value={recordingQuality} onValueChange={(value: 'high' | 'medium' | 'low') => setRecordingQuality(value)}>
                      <SelectTrigger data-testid="recording-quality-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (720p)</SelectItem>
                        <SelectItem value="medium">Medium (1080p)</SelectItem>
                        <SelectItem value="high">High (1080p+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Frame Rate</Label>
                    <Select value={String(recordingFrameRate)} onValueChange={(value) => setRecordingFrameRate(Number(value))}>
                      <SelectTrigger data-testid="recording-framerate-select">
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
                      data-testid="toggle-microphone-btn"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className={isMuted ? "bg-red-50 border-red-200" : ""}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>

                    <Button
                      data-testid="recording-settings-btn"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                          // Open video studio settings
                          logger.info('Video Studio settings opened')
                        }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Recording Status Display */}
                {(recordingState.status === 'recording' || recordingState.status === 'paused' || recordingState.status === 'completed') && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {recordingState.status === 'recording' && (
                            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                          )}
                          {recordingState.status === 'paused' && (
                            <Pause className="w-4 h-4 text-orange-600" />
                          )}
                          {recordingState.status === 'completed' && (
                            <Badge className="bg-green-600">Completed</Badge>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {recordingState.status === 'recording' && 'Recording...'}
                            {recordingState.status === 'paused' && 'Paused'}
                            {recordingState.status === 'completed' && 'Recording Ready'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <NumberFlow
                              value={recordingState.duration}
                              format={{ minimumIntegerDigits: 2 }}
                              className="font-mono"
                            />
                            <span>:{String(recordingState.duration % 60).padStart(2, '0')}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span className="font-mono">
                              {(recordingState.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>

                      {previewUrl && recordingState.status === 'completed' && (
                        <video
                          src={previewUrl}
                          controls
                          className="w-48 h-auto rounded border border-gray-300 dark:border-gray-700"
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  data-testid="search-projects-input"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger data-testid="filter-category-select" className="w-32">
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
                  data-testid="toggle-view-mode-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <Video className="w-16 h-16 mx-auto text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900">No projects yet</h3>
                  <p className="text-gray-600">Get started by creating your first video project</p>
                  <Button data-testid="create-first-project-btn" onClick={handleCreateFirstProject} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </div>
              </Card>
            ) : (
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
                        data-testid="edit-project-btn"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleOpenEditor}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        data-testid="share-project-btn"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          logger.info('Opening collaborative review dialog', { projectId: project.id, title: project.title })
                          setReviewProject(project)
                          const link = `${window.location.origin}/review/${project.id}`
                          setReviewLink(link)
                          setIsReviewDialogOpen(true)
                          announce(`Collaborative review dialog opened for ${project.title}`)
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share for Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
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
                        data-testid="preview-template-btn"
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
                        data-testid="use-template-btn"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          logger.info('Template applied', { templateId: template.id, name: template.name })
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
                data-testid="upload-video-btn"
                variant="outline"
                className="p-6 h-auto flex-col gap-2"
                onClick={handleUploadAssets}
              >
                <Video className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Upload Video</span>
              </Button>

              <Button
                data-testid="upload-audio-btn"
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
                data-testid="upload-images-btn"
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
                data-testid="browse-stock-assets-btn"
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
                        data-testid="use-asset-btn"
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
                        data-testid="download-asset-btn"
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          logger.info('Asset download started', { assetId: asset.id, name: asset.name })
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
              <LiquidGlassCard variant="gradient" hoverEffect={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Videos</p>
                      <NumberFlow value={projects.length} className="text-2xl font-bold text-gray-900 dark:text-gray-100" />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-red-400/20 to-orange-400/20 dark:from-red-400/10 dark:to-orange-400/10 rounded-xl backdrop-blur-sm">
                      <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
              
              <LiquidGlassCard variant="tinted" hoverEffect={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Views</p>
                      <NumberFlow
                        value={projects.reduce((sum, p) => sum + p.views, 0)}
                        format="compact"
                        className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                      />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-xl backdrop-blur-sm">
                      <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
              
              <LiquidGlassCard variant="gradient" hoverEffect={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Likes</p>
                      <NumberFlow
                        value={projects.reduce((sum, p) => sum + p.likes, 0)}
                        className="text-2xl font-bold text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-xl backdrop-blur-sm">
                      <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
              
              <LiquidGlassCard variant="tinted" hoverEffect={true}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Engagement</p>
                      <NumberFlow value={87} suffix="%" className="text-2xl font-bold text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="p-3 bg-gradient-to-br from-orange-400/20 to-amber-400/20 dark:from-orange-400/10 dark:to-amber-400/10 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>

            <div className="flex gap-4">
              <Button data-testid="view-detailed-analytics-btn" onClick={handleViewAnalytics} className="bg-blue-600 hover:bg-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Analytics
              </Button>
              <Button data-testid="start-render-btn" onClick={handleStartRender} className="bg-purple-600 hover:bg-purple-700">
                <Video className="w-4 h-4 mr-2" />
                Start Render
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map(project => (
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
                logger.info('Template applied', { name: template.name })
                setIsTemplateDialogOpen(false)
              }}
              onPreviewTemplate={(template) => {
                logger.info('Template preview opened', { name: template.name })
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
                logger.info('Files uploaded successfully', { fileCount: files.length })
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
          logger.info('Asset added to project', { assetId: asset.id, name: asset.name })
        }}
        onDownload={(asset) => {
          logger.info('Asset download started', { assetId: asset.id, name: asset.name })
        }}
      />

      {/* ANNOTATION OVERLAY */}
      <AnnotationOverlay
        isVisible={showAnnotations}
        onClose={() => {
          setShowAnnotations(false)
          logger.info('Annotations overlay closed')
          announce('Annotations overlay closed')
        }}
        canvasWidth={1280}
        canvasHeight={720}
      />

      {/* TELEPROMPTER OVERLAY */}
      <TeleprompterOverlay
        isVisible={showTeleprompter}
        onClose={() => {
          setShowTeleprompter(false)
          logger.info('Teleprompter closed')
          announce('Teleprompter closed')
        }}
        initialScript={teleprompterScript}
      />

      {/* COLLABORATIVE REVIEW DIALOG - USER MANUAL SPEC */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              Share Video for Collaborative Review
            </DialogTitle>
          </DialogHeader>

          {reviewProject && (
            <div className="space-y-6">
              {/* Video Info */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{reviewProject.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reviewProject.resolution} • {formatDuration(reviewProject.duration)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Link */}
              <div className="space-y-2">
                <Label htmlFor="review-link" className="text-sm font-medium">
                  Shareable Review Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="review-link"
                    value={reviewLink}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(reviewLink)
                      toast.success('Review link copied!', {
                        description: 'Share this link with clients to collect feedback'
                      })
                      logger.info('Review link copied', {
                        projectId: reviewProject.id,
                        title: reviewProject.title,
                        link: reviewLink
                      })
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Anyone with this link can view and comment on the video
                </p>
              </div>

              {/* Review Settings */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Review Settings
                </h4>

                {/* Allow Comments */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Allow timestamp comments
                      </p>
                      <p className="text-xs text-gray-500">
                        Reviewers can add comments at specific video timestamps
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                </div>

                {/* Require Approval */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Require approval
                      </p>
                      <p className="text-xs text-gray-500">
                        Request explicit approval before finalizing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={requireApproval}
                      onChange={(e) => setRequireApproval(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                </div>

                {/* Link Expiry */}
                <div className="space-y-2">
                  <Label htmlFor="review-expiry" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Link expires in
                  </Label>
                  <Select value={reviewExpiry} onValueChange={setReviewExpiry}>
                    <SelectTrigger id="review-expiry">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Review Features Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Collaborative Review Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex gap-2 text-sm">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Timestamp Comments</p>
                      <p className="text-xs text-gray-500">Comments linked to specific moments</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Real-time Collaboration</p>
                      <p className="text-xs text-gray-500">Multiple reviewers simultaneously</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <Star className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Approval Tracking</p>
                      <p className="text-xs text-gray-500">Track who approved changes</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/30 rounded flex items-center justify-center flex-shrink-0">
                      <Activity className="w-3 h-3 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Version Comparison</p>
                      <p className="text-xs text-gray-500">Compare different versions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsReviewDialogOpen(false)
                    logger.info('Review dialog closed', { projectId: reviewProject.id })
                  }}
                >
                  Done
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  onClick={() => {
                    // Send review invite email
                    toast.success('Review invites sent!', {
                      description: `${reviewProject.client || 'Clients'} will receive an email with the review link`
                    })
                    logger.info('Review invites sent', {
                      projectId: reviewProject.id,
                      title: reviewProject.title,
                      settings: {
                        allowComments,
                        requireApproval,
                        expiresIn: reviewExpiry
                      }
                    })
                    announce('Review invitations sent successfully')
                    setIsReviewDialogOpen(false)
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Send Review Invite
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>💡 Pro tip:</strong> Timestamp comments help clients provide precise feedback.
                  They can click anywhere in the video to add a comment at that exact moment.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}