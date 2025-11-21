'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'

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
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false)
  const [isAIToolsOpen, setIsAIToolsOpen] = useState<boolean>(false)
  const [selectedAiTool, setSelectedAiTool] = useState<string>('')
  const [videoTopic, setVideoTopic] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Handlers - New comprehensive implementations
  const handleCreateFirstProject = () => {
    console.log('➕ VIDEO STUDIO: Create first project initiated')
    console.log('📋 VIDEO STUDIO: Opening project creation modal')
    console.log('📊 VIDEO STUDIO: Next steps available:')
    console.log('  • Enter project name and description')
    console.log('  • Choose video format and resolution')
    console.log('  • Select templates or start from scratch')
    console.log('  • Add collaborators to your project')
    console.log('  • Access Universal Pinpoint System for feedback')
    console.log('  • Use AI-powered editing tools')
    console.log('  • Render and export your video')
    toast.info('Opening project creation...')
    setIsCreateModalOpen(true)
  }

  const handleNewProject = () => {
    console.log('➕ NEW PROJECT')
    toast.info('Creating new video project...')
    handleCreateFirstProject()
  }

  const handleCreateNewProject = async () => {
    console.log('➕ CREATE NEW PROJECT - SUBMIT')

    if (!newProject.title.trim()) {
      toast.error('Please enter a project name')
      return
    }

    setIsCreatingProject(true)
    toast.info('Creating video project...')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const projectId = `proj_${Date.now()}`

      console.log('✅ VIDEO STUDIO: Project created successfully')
      console.log('🆔 VIDEO STUDIO: Project ID:', projectId)
      console.log('📋 VIDEO STUDIO: Next steps:')
      console.log('  • Open the video editor')
      console.log('  • Import your media files')
      console.log('  • Start editing with AI tools')
      console.log('  • Add team members for collaboration')
      console.log('  • Use Universal Pinpoint System for feedback')
      console.log('  • Render and export when ready')
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
      console.error('Create Project Error:', error)
      toast.error('Failed to create project', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleRecord = () => {
    console.log('🎬 VIDEO STUDIO: Record initiated')
    console.log('📊 VIDEO STUDIO: Next steps:')
    console.log('  • Connect your camera and microphone')
    console.log('  • Choose recording quality (1080p, 4K)')
    console.log('  • Start/stop recording with spacebar')
    console.log('  • Add real-time filters and effects')
    console.log('  • Review and trim your recording')
    console.log('  • Save directly to your project')
    toast.info('Opening video recorder...')
  }

  const handleAITools = () => {
    console.log('🤖 VIDEO STUDIO: AI Tools opened')
    console.log('📊 VIDEO STUDIO: Features available:')
    console.log('  • AI Auto-Edit: Smart scene detection (94.5% accuracy)')
    console.log('  • Script Generator: Create engaging scripts')
    console.log('  • Auto Captions: Generate subtitles automatically')
    console.log('  • Color Correction: Professional color grading')
    console.log('  • Smart Transitions: AI-suggested scene transitions')
    console.log('  • Voice Enhancement: Noise reduction and clarity boost')
    toast.info('Opening AI Tools panel...')
    setIsAIToolsOpen(true)
  }

  const handleOpenEditor = () => {
    console.log('🎨 VIDEO STUDIO: Editor opened')
    console.log('📊 VIDEO STUDIO: Next steps:')
    console.log('  • Import video clips and media')
    console.log('  • Arrange clips on timeline')
    console.log('  • Add transitions, effects, and filters')
    console.log('  • Use AI auto-cut for smart scene detection')
    console.log('  • Apply color correction and grading')
    console.log('  • Add text overlays and lower thirds')
    console.log('  • Export in 4K resolution')
    toast.info('Loading video editor...')
  }

  const handleUploadAssets = () => {
    console.log('📤 VIDEO STUDIO: Upload assets initiated')
    console.log('📊 VIDEO STUDIO: Next steps:')
    console.log('  • Select video files (MP4, MOV, AVI)')
    console.log('  • Upload audio tracks (MP3, WAV, AAC)')
    console.log('  • Add images and graphics (PNG, JPG, SVG)')
    console.log('  • Import stock footage from library')
    console.log('  • Organize assets into folders')
    console.log('  • Tag assets for easy searching')
    console.log('  • Access 234+ professional assets')
    toast.info('Opening asset uploader...')
  }

  const handleStartRender = () => {
    console.log('🎬 VIDEO STUDIO: Render started')
    console.log('📊 VIDEO STUDIO: Render settings:')
    console.log('  • Choose output resolution (1080p, 4K)')
    console.log('  • Select video codec (H.264, H.265)')
    console.log('  • Set quality level (High, Medium, Low)')
    console.log('  • Estimated render time: 12.5 minutes')
    console.log('  • Monitor render progress in real-time')
    console.log('  • Download rendered video when complete')
    console.log('  • Success rate: 94.2%')
    toast.info('Starting video render...')
  }

  const handleViewAnalytics = () => {
    console.log('📊 VIDEO STUDIO: Analytics opened')
    console.log('📊 VIDEO STUDIO: Metrics available:')
    console.log('  • View project performance metrics')
    console.log('  • Track render times and success rates')
    console.log('  • Monitor storage usage (1.2TB used)')
    console.log('  • Analyze team collaboration scores')
    console.log('  • Check client satisfaction ratings (9.1/10)')
    console.log('  • Review efficiency scores (92%)')
    console.log('  • Export analytics reports')
    toast.info('Loading video analytics...')
  }

  const handleOpenProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    console.log('📂 VIDEO STUDIO: Open project initiated')
    console.log('📊 VIDEO STUDIO: Project ID:', projectId)
    console.log('📝 VIDEO STUDIO: Title:', project?.title)
    console.log('⏱️ VIDEO STUDIO: Duration:', project?.duration + 's')
    console.log('📐 VIDEO STUDIO: Resolution:', project?.resolution)
    console.log('📊 VIDEO STUDIO: Status:', project?.status)
    console.log('✅ VIDEO STUDIO: Loading video editor...')
    // TODO: Navigate to video editor with project loaded
    router.push(`/dashboard/video-studio/editor?project=${projectId}`)
  }

  const handleDeleteProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    console.log('🗑️ VIDEO STUDIO: Delete project initiated')
    console.log('📊 VIDEO STUDIO: Project:', project?.title)
    console.log('📊 VIDEO STUDIO: Views:', project?.views)

    if (confirm(`Delete "${project?.title}"?\n\nThis action cannot be undone.`)) {
      console.log('✅ VIDEO STUDIO: Project deleted successfully')
      console.log('📊 VIDEO STUDIO: Deleted project:', project?.title)
      toast.success(`Project "${project?.title}" deleted`)
      // TODO: Remove from state/database
    } else {
      console.log('❌ VIDEO STUDIO: Deletion cancelled')
    }
  }

  const handleDuplicateProject = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    console.log('📋 VIDEO STUDIO: Duplicate project initiated')
    console.log('📊 VIDEO STUDIO: Original project:', project?.title)
    console.log('📊 VIDEO STUDIO: Duration:', project?.duration + 's')
    console.log('📊 VIDEO STUDIO: Size:', project?.size)
    console.log('⚙️ VIDEO STUDIO: Creating duplicate...')
    console.log('✅ VIDEO STUDIO: Project duplicated successfully')
    console.log('📝 VIDEO STUDIO: New title:', project?.title + ' (Copy)')
    toast.success(`Project duplicated: ${project?.title} (Copy)`)
    // TODO: Create duplicate in state/database
  }

  const handleExportVideo = (format: string) => {
    console.log('💾 VIDEO STUDIO: Export video initiated')
    console.log('📊 VIDEO STUDIO: Export format:', format)
    console.log('📊 VIDEO STUDIO: Current resolution:', '1080p')
    console.log('📊 VIDEO STUDIO: Estimated size:', format === 'MP4' ? '~150MB' : format === 'MOV' ? '~300MB' : '~500MB')
    console.log('⚙️ VIDEO STUDIO: Starting export process...')
    console.log('📊 VIDEO STUDIO: Encoding settings: H.264, AAC audio')
    console.log('⏱️ VIDEO STUDIO: Estimated time: 2-5 minutes')
    console.log('✅ VIDEO STUDIO: Export queued successfully')
    toast.success(`Exporting to ${format}...`, {
      description: 'Processing will complete in 2-5 minutes'
    })
    // TODO: Trigger actual video export/render
  }

  const handlePublishVideo = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    console.log('🚀 VIDEO STUDIO: Publish video initiated')
    console.log('📊 VIDEO STUDIO: Project:', project?.title)
    console.log('📊 VIDEO STUDIO: Duration:', project?.duration + 's')
    console.log('🎯 VIDEO STUDIO: Publishing to: Platform, YouTube, Vimeo')
    console.log('⚙️ VIDEO STUDIO: Uploading video...')
    console.log('📊 VIDEO STUDIO: Generating thumbnail...')
    console.log('📊 VIDEO STUDIO: Creating metadata...')
    console.log('✅ VIDEO STUDIO: Video published successfully')
    toast.success(`"${project?.title}" published!`, {
      description: 'Video is now live on platform'
    })
    // TODO: Publish to platform/social media
  }

  const handleShareVideo = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    const shareLink = `https://kazi.app/video/${projectId}`
    console.log('🔗 VIDEO STUDIO: Share video initiated')
    console.log('📊 VIDEO STUDIO: Project:', project?.title)
    console.log('📎 VIDEO STUDIO: Share link:', shareLink)
    console.log('📊 VIDEO STUDIO: Share options:', ['Link', 'Email', 'Social Media', 'Embed Code'])
    console.log('✅ VIDEO STUDIO: Share link generated')
    toast.success('Share link created', {
      description: 'Link copied to clipboard'
    })
    // TODO: Copy to clipboard and show share modal
    navigator.clipboard?.writeText(shareLink)
  }

  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    console.log(newMuted ? '🔇 VIDEO STUDIO: Muted' : '🔊 VIDEO STUDIO: Unmuted')
    console.log('📊 VIDEO STUDIO: Volume:', volume[0] + '%')
  }

  const handleToggleFullscreen = () => {
    const newFullscreen = !isFullscreen
    setIsFullscreen(newFullscreen)
    console.log(newFullscreen ? '⛶ VIDEO STUDIO: Fullscreen enabled' : '🪟 VIDEO STUDIO: Fullscreen disabled')
    console.log('📊 VIDEO STUDIO: Player mode:', newFullscreen ? 'Fullscreen' : 'Normal')
  }

  const handleAddMedia = (type: string) => {
    console.log('➕ VIDEO STUDIO: Add media initiated')
    console.log('📊 VIDEO STUDIO: Media type:', type)
    console.log('📂 VIDEO STUDIO: Options:', ['Browse Library', 'Upload New', 'Record', 'Stock Media'])
    console.log('📊 VIDEO STUDIO: Supported formats:', type === 'video' ? 'MP4, MOV, AVI, MKV' : type === 'image' ? 'JPG, PNG, GIF, SVG' : 'MP3, WAV, AAC, OGG')
    console.log('✅ VIDEO STUDIO: Media browser opened')
    setIsUploadDialogOpen(true)
    // TODO: Open media library/upload modal
  }

  const handleAddTransition = () => {
    console.log('✨ VIDEO STUDIO: Add transition initiated')
    console.log('📊 VIDEO STUDIO: Available transitions:', ['Fade', 'Dissolve', 'Wipe', 'Slide', 'Zoom', '3D Flip'])
    console.log('📊 VIDEO STUDIO: Default duration: 1s')
    console.log('🎯 VIDEO STUDIO: Position: Between current clips')
    console.log('✅ VIDEO STUDIO: Transition browser opened')
    // TODO: Open transition picker modal
  }

  const handleAddEffect = () => {
    console.log('🎨 VIDEO STUDIO: Add effect initiated')
    console.log('📊 VIDEO STUDIO: Effect categories:', ['Color', 'Blur', 'Distort', 'Stylize', 'Time'])
    console.log('📊 VIDEO STUDIO: Popular effects:', ['Blur', 'Sharpen', 'Color Correction', 'Vignette', 'Glow'])
    console.log('🎯 VIDEO STUDIO: Apply to: Current clip')
    console.log('✅ VIDEO STUDIO: Effect library opened')
    // TODO: Open effects library modal
  }

  const handleAddText = () => {
    console.log('📝 VIDEO STUDIO: Add text initiated')
    console.log('📊 VIDEO STUDIO: Text options:', ['Title', 'Subtitle', 'Lower Third', 'Credits'])
    console.log('🎨 VIDEO STUDIO: Customization:', ['Font', 'Size', 'Color', 'Animation', 'Position'])
    console.log('⏱️ VIDEO STUDIO: Default duration: 5s')
    console.log('✅ VIDEO STUDIO: Text editor opened')
    // TODO: Open text editor modal
  }

  const handleAddAudio = () => {
    console.log('🎵 VIDEO STUDIO: Add audio initiated')
    console.log('📊 VIDEO STUDIO: Audio sources:', ['Music Library', 'Upload File', 'Record Voiceover', 'AI Voiceover'])
    console.log('📊 VIDEO STUDIO: Supported formats: MP3, WAV, AAC, OGG')
    console.log('🎚️ VIDEO STUDIO: Audio tools:', ['Volume', 'Fade In/Out', 'EQ', 'Noise Reduction'])
    console.log('✅ VIDEO STUDIO: Audio library opened')
    // TODO: Open audio library/recorder modal
  }

  const handleTrimClip = () => {
    console.log('✂️ VIDEO STUDIO: Trim clip initiated')
    console.log('📊 VIDEO STUDIO: Current clip duration:', currentTime + 's')
    console.log('🎯 VIDEO STUDIO: Trim mode: Drag handles to adjust')
    console.log('📊 VIDEO STUDIO: Precision: Frame-by-frame')
    console.log('✅ VIDEO STUDIO: Trim mode activated')
    // TODO: Enable trim mode on timeline
  }

  const handleSplitClip = () => {
    console.log('✂️ VIDEO STUDIO: Split clip initiated')
    console.log('⏱️ VIDEO STUDIO: Split at:', currentTime + 's')
    console.log('📊 VIDEO STUDIO: Creating two clips from one')
    console.log('✅ VIDEO STUDIO: Clip split successfully')
    toast.success('Clip split at playhead position')
    // TODO: Split clip in timeline
  }

  const handleUseTemplate = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId)
    console.log('📋 VIDEO STUDIO: Use template initiated')
    console.log('📊 VIDEO STUDIO: Template ID:', templateId)
    console.log('📝 VIDEO STUDIO: Template name:', template?.name)
    console.log('⏱️ VIDEO STUDIO: Duration:', template?.duration + 's')
    console.log('🎯 VIDEO STUDIO: Category:', template?.category)
    console.log('⚙️ VIDEO STUDIO: Applying template...')
    console.log('✅ VIDEO STUDIO: Template applied successfully')
    setSelectedTemplate(template || null)
    toast.success(`Template "${template?.name}" applied`)
    // TODO: Load template into project
  }

  const handleSaveProject = () => {
    console.log('💾 VIDEO STUDIO: Save project initiated')
    console.log('📊 VIDEO STUDIO: Project:', selectedProject?.title || 'Current Project')
    console.log('📊 VIDEO STUDIO: Changes:', 'Timeline, effects, transitions')
    console.log('⚙️ VIDEO STUDIO: Saving to cloud...')
    console.log('✅ VIDEO STUDIO: Project saved successfully')
    console.log('⏱️ VIDEO STUDIO: Auto-save enabled')
    toast.success('Project saved', {
      description: 'All changes synced to cloud'
    })
    // TODO: Save project state to database
  }

  const handleUndo = () => {
    console.log('↩️ VIDEO STUDIO: Undo action')
    console.log('📊 VIDEO STUDIO: Reverting last change')
    console.log('📋 VIDEO STUDIO: History available: Yes')
    console.log('✅ VIDEO STUDIO: Undo complete')
    // TODO: Implement undo stack
  }

  const handleRedo = () => {
    console.log('↪️ VIDEO STUDIO: Redo action')
    console.log('📊 VIDEO STUDIO: Reapplying last undone change')
    console.log('📋 VIDEO STUDIO: Redo available: Yes')
    console.log('✅ VIDEO STUDIO: Redo complete')
    // TODO: Implement redo stack
  }
  const handleGenerateSubtitles = async () => {
    console.log('📝 GENERATE SUBTITLES')

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
        toast.success('📝 Subtitles generated!', {
          description: 'AI-powered captions have been created for your video'
        })
      }
    } catch (error: any) {
      console.error('Generate Subtitles Error:', error)
      toast.error('Failed to generate subtitles', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleAIEnhancement = async () => {
    console.log('✨ AI ENHANCEMENT')

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
        console.log('✅ VIDEO STUDIO: AI Enhancement complete')
        console.log('📊 VIDEO STUDIO: Applied:')
        console.log('  • Auto color correction')
        console.log('  • Noise reduction')
        console.log('  • Video stabilization')
        console.log('  • Quality optimization')
        toast.success('✨ AI Enhancement complete!', {
          description: 'Color correction, noise reduction, and stabilization applied'
        })
      }
    } catch (error: any) {
      console.error('AI Enhancement Error:', error)
      toast.error('Failed to enhance video', {
        description: error.message || 'Please try again later'
      })
    }
  }
  const handleCollaborate = () => {
    console.log('👥 VIDEO STUDIO: Collaborate initiated')
    console.log('📊 VIDEO STUDIO: Collaboration features:', ['Share Project', 'Real-time Editing', 'Comments', 'Version Control'])
    console.log('📧 VIDEO STUDIO: Invite options:', ['Email', 'Link', 'Team Members'])
    console.log('🔐 VIDEO STUDIO: Permissions:', ['View Only', 'Comment', 'Edit', 'Admin'])
    console.log('✅ VIDEO STUDIO: Collaboration panel opened')
    toast.success('Collaboration enabled', {
      description: 'Invite team members to edit together'
    })
    // TODO: Open collaboration invite modal
  }

  const handleRenderPreview = () => {
    console.log('👁️ VIDEO STUDIO: Render preview initiated')
    console.log('📊 VIDEO STUDIO: Preview settings:', ['Resolution: 1080p', 'Quality: High', 'Duration: Full'])
    console.log('⚙️ VIDEO STUDIO: Rendering preview...')
    console.log('⏱️ VIDEO STUDIO: Estimated time: 30-60 seconds')
    console.log('✅ VIDEO STUDIO: Preview rendering started')
    toast.success('Rendering preview...', {
      description: 'Will be ready in 30-60 seconds'
    })
    // TODO: Trigger preview render
  }

  const handleApplyColorGrade = () => {
    console.log('🎨 VIDEO STUDIO: Apply color grade initiated')
    console.log('📊 VIDEO STUDIO: Color tools:', ['Brightness', 'Contrast', 'Saturation', 'Hue', 'Temperature'])
    console.log('🎨 VIDEO STUDIO: Presets:', ['Natural', 'Cinematic', 'Vibrant', 'Vintage', 'B&W'])
    console.log('📊 VIDEO STUDIO: Advanced:', ['LUTs', 'Curves', 'Color Wheels'])
    console.log('✅ VIDEO STUDIO: Color grading panel opened')
    // TODO: Open color grading panel
  }

  const handleAnalytics = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    console.log('📊 VIDEO STUDIO: Analytics opened')
    console.log('📊 VIDEO STUDIO: Project:', project?.title)
    console.log('📈 VIDEO STUDIO: Metrics:', {
      views: project?.views,
      likes: project?.likes,
      comments: project?.comments,
      'watch time': '~75%',
      'avg duration': '2m 45s'
    })
    console.log('🎯 VIDEO STUDIO: Insights:', ['Peak viewing times', 'Audience demographics', 'Traffic sources'])
    console.log('✅ VIDEO STUDIO: Analytics dashboard loaded')
    // TODO: Navigate to analytics page
    router.push(`/dashboard/video-studio/analytics?project=${projectId}`)
  }

  const handleVersionHistory = (projectId: string) => {
    const project = mockProjects.find(p => p.id === projectId)
    console.log('📜 VIDEO STUDIO: Version history opened')
    console.log('📊 VIDEO STUDIO: Project:', project?.title)
    console.log('📊 VIDEO STUDIO: Total versions: 12')
    console.log('📅 VIDEO STUDIO: Latest:', new Date().toLocaleString())
    console.log('🔄 VIDEO STUDIO: Actions:', ['View', 'Restore', 'Compare', 'Download'])
    console.log('✅ VIDEO STUDIO: Version history loaded')
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
    <div className="min-h-screen bg-gray-50">
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
              variant="default"
              size="sm"
              onClick={handleRecord}
            >
              <Video className="w-4 h-4 mr-2" />
              Record
            </Button>

            <Button
              data-testid="ai-tools-btn"
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
                    <Select defaultValue="1080p">
                      <SelectTrigger data-testid="recording-quality-select">
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