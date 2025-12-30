'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Video,
  Play,
  Pause,
  Plus,
  Upload,
  Camera,
  Scissors,
  Brain,
  Eye,
  Share2,
  TrendingUp,
  Settings,
  Film,
  Wand2,
  Target,
  Clock,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Pencil,
  Layers,
  Music,
  Image,
  Type,
  Palette,
  Sliders,
  Zap,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize2,
  Download,
  Copy,
  Move,
  Grid3X3,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
  Square,
  Star,
  Heart,
  MessageSquare,
  Users,
  Calendar,
  FileVideo,
  Folder,
  HardDrive,
  Cloud,
  Lock,
  Unlock
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import {
  videoStudioAIInsights,
  videoStudioCollaborators,
  videoStudioPredictions,
  videoStudioActivities,
  videoStudioQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type ProjectStatus = 'draft' | 'editing' | 'rendering' | 'ready' | 'published' | 'archived'
type AssetType = 'video' | 'audio' | 'image' | 'graphic' | 'title' | 'transition'
type TrackType = 'video' | 'audio' | 'title' | 'effects'
type ExportPreset = '4k' | '1080p' | '720p' | 'instagram' | 'youtube' | 'tiktok' | 'custom'
type EffectCategory = 'color' | 'blur' | 'distort' | 'stylize' | 'transition' | 'audio'
type RenderStatus = 'queued' | 'rendering' | 'completed' | 'failed' | 'paused'

interface VideoProject {
  id: string
  title: string
  description: string
  status: ProjectStatus
  thumbnail: string
  duration: number
  fps: number
  resolution: string
  tracks: Track[]
  lastEdited: string
  createdAt: string
  size: number
  collaborators: Collaborator[]
  version: number
  isLocked: boolean
  tags: string[]
}

interface Track {
  id: string
  type: TrackType
  name: string
  clips: Clip[]
  muted: boolean
  locked: boolean
  volume: number
  visible: boolean
}

interface Clip {
  id: string
  name: string
  startTime: number
  endTime: number
  duration: number
  assetId: string
  effects: Effect[]
}

interface Effect {
  id: string
  name: string
  category: EffectCategory
  intensity: number
  enabled: boolean
  parameters: Record<string, number | string | boolean>
}

interface Asset {
  id: string
  name: string
  type: AssetType
  duration: number
  size: number
  thumbnail: string
  resolution: string
  createdAt: string
  usageCount: number
  tags: string[]
}

interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  category: string
  duration: number
  downloads: number
  rating: number
  isPremium: boolean
  tags: string[]
}

interface RenderJob {
  id: string
  projectId: string
  projectName: string
  preset: ExportPreset
  status: RenderStatus
  progress: number
  startTime: string
  estimatedTime: number
  outputSize: number
  outputPath: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'editor' | 'viewer'
  lastActive: string
}

// Mock Data
const mockProjects: VideoProject[] = [
  {
    id: '1',
    title: 'Product Launch Video',
    description: 'Official launch video for Q1 product release',
    status: 'editing',
    thumbnail: '/thumbnails/product-launch.jpg',
    duration: 180,
    fps: 30,
    resolution: '1920x1080',
    tracks: [],
    lastEdited: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-10T09:00:00Z',
    size: 2.5e9,
    collaborators: [],
    version: 5,
    isLocked: false,
    tags: ['product', 'launch', 'marketing']
  },
  {
    id: '2',
    title: 'Customer Testimonial',
    description: 'Interview with key customer about success story',
    status: 'ready',
    thumbnail: '/thumbnails/testimonial.jpg',
    duration: 240,
    fps: 24,
    resolution: '3840x2160',
    tracks: [],
    lastEdited: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-08T11:00:00Z',
    size: 4.2e9,
    collaborators: [],
    version: 8,
    isLocked: false,
    tags: ['testimonial', 'interview', 'customer']
  },
  {
    id: '3',
    title: 'Tutorial Series Ep. 1',
    description: 'Getting started with our platform',
    status: 'published',
    thumbnail: '/thumbnails/tutorial.jpg',
    duration: 600,
    fps: 30,
    resolution: '1920x1080',
    tracks: [],
    lastEdited: '2024-01-12T14:20:00Z',
    createdAt: '2024-01-05T08:00:00Z',
    size: 1.8e9,
    collaborators: [],
    version: 12,
    isLocked: true,
    tags: ['tutorial', 'education', 'series']
  },
  {
    id: '4',
    title: 'Social Media Promo',
    description: 'Short promotional video for social channels',
    status: 'rendering',
    thumbnail: '/thumbnails/promo.jpg',
    duration: 30,
    fps: 60,
    resolution: '1080x1920',
    tracks: [],
    lastEdited: '2024-01-15T09:15:00Z',
    createdAt: '2024-01-14T10:00:00Z',
    size: 0.5e9,
    collaborators: [],
    version: 3,
    isLocked: true,
    tags: ['social', 'promo', 'short']
  },
  {
    id: '5',
    title: 'Company Overview',
    description: 'Corporate introduction video',
    status: 'draft',
    thumbnail: '/thumbnails/overview.jpg',
    duration: 0,
    fps: 30,
    resolution: '1920x1080',
    tracks: [],
    lastEdited: '2024-01-15T11:00:00Z',
    createdAt: '2024-01-15T11:00:00Z',
    size: 0,
    collaborators: [],
    version: 1,
    isLocked: false,
    tags: ['corporate', 'overview']
  }
]

const mockAssets: Asset[] = [
  { id: '1', name: 'Interview Footage A', type: 'video', duration: 1200, size: 3.2e9, thumbnail: '/assets/interview-a.jpg', resolution: '4K', createdAt: '2024-01-10T09:00:00Z', usageCount: 5, tags: ['interview', 'footage'] },
  { id: '2', name: 'Background Music', type: 'audio', duration: 180, size: 12e6, thumbnail: '/assets/music.jpg', resolution: 'N/A', createdAt: '2024-01-08T11:00:00Z', usageCount: 12, tags: ['music', 'background'] },
  { id: '3', name: 'Logo Animation', type: 'graphic', duration: 5, size: 50e6, thumbnail: '/assets/logo.jpg', resolution: '1080p', createdAt: '2024-01-05T08:00:00Z', usageCount: 25, tags: ['logo', 'animation'] },
  { id: '4', name: 'Product Photos', type: 'image', duration: 0, size: 25e6, thumbnail: '/assets/product.jpg', resolution: '4K', createdAt: '2024-01-12T14:20:00Z', usageCount: 8, tags: ['product', 'photos'] },
  { id: '5', name: 'Lower Third Title', type: 'title', duration: 3, size: 2e6, thumbnail: '/assets/title.jpg', resolution: '1080p', createdAt: '2024-01-14T10:00:00Z', usageCount: 15, tags: ['title', 'lower-third'] },
  { id: '6', name: 'Fade Transition', type: 'transition', duration: 1, size: 1e6, thumbnail: '/assets/fade.jpg', resolution: 'N/A', createdAt: '2024-01-13T16:00:00Z', usageCount: 30, tags: ['transition', 'fade'] },
  { id: '7', name: 'Drone Footage B', type: 'video', duration: 600, size: 5.5e9, thumbnail: '/assets/drone.jpg', resolution: '4K', createdAt: '2024-01-11T10:00:00Z', usageCount: 3, tags: ['drone', 'aerial'] },
  { id: '8', name: 'Voiceover Track', type: 'audio', duration: 300, size: 35e6, thumbnail: '/assets/voice.jpg', resolution: 'N/A', createdAt: '2024-01-09T12:00:00Z', usageCount: 7, tags: ['voiceover', 'narration'] }
]

const mockTemplates: Template[] = [
  { id: '1', name: 'Corporate Intro', description: 'Professional company introduction', thumbnail: '/templates/corporate.jpg', category: 'Business', duration: 60, downloads: 1250, rating: 4.8, isPremium: false, tags: ['corporate', 'intro'] },
  { id: '2', name: 'Social Story', description: 'Vertical story format for social media', thumbnail: '/templates/story.jpg', category: 'Social', duration: 15, downloads: 3500, rating: 4.6, isPremium: false, tags: ['social', 'story', 'vertical'] },
  { id: '3', name: 'Product Showcase', description: 'Elegant product presentation', thumbnail: '/templates/product.jpg', category: 'Marketing', duration: 45, downloads: 890, rating: 4.9, isPremium: true, tags: ['product', 'showcase'] },
  { id: '4', name: 'Event Highlights', description: 'Dynamic event recap template', thumbnail: '/templates/event.jpg', category: 'Events', duration: 120, downloads: 560, rating: 4.7, isPremium: true, tags: ['event', 'highlights'] },
  { id: '5', name: 'Tutorial Opener', description: 'Educational video intro', thumbnail: '/templates/tutorial.jpg', category: 'Education', duration: 10, downloads: 2100, rating: 4.5, isPremium: false, tags: ['tutorial', 'education', 'opener'] },
  { id: '6', name: 'Podcast Visual', description: 'Animated podcast video template', thumbnail: '/templates/podcast.jpg', category: 'Audio', duration: 0, downloads: 780, rating: 4.4, isPremium: false, tags: ['podcast', 'audio', 'visual'] }
]

const mockRenderJobs: RenderJob[] = [
  { id: '1', projectId: '4', projectName: 'Social Media Promo', preset: 'instagram', status: 'rendering', progress: 67, startTime: '2024-01-15T09:20:00Z', estimatedTime: 120, outputSize: 45e6, outputPath: '/exports/promo-instagram.mp4' },
  { id: '2', projectId: '1', projectName: 'Product Launch Video', preset: '1080p', status: 'queued', progress: 0, startTime: '', estimatedTime: 300, outputSize: 0, outputPath: '/exports/product-launch.mp4' },
  { id: '3', projectId: '2', projectName: 'Customer Testimonial', preset: '4k', status: 'completed', progress: 100, startTime: '2024-01-14T16:00:00Z', estimatedTime: 0, outputSize: 850e6, outputPath: '/exports/testimonial-4k.mp4' },
  { id: '4', projectId: '3', projectName: 'Tutorial Series Ep. 1', preset: 'youtube', status: 'completed', progress: 100, startTime: '2024-01-12T14:00:00Z', estimatedTime: 0, outputSize: 420e6, outputPath: '/exports/tutorial-ep1.mp4' }
]

const mockEffects: Effect[] = [
  { id: '1', name: 'Color Correction', category: 'color', intensity: 75, enabled: true, parameters: { brightness: 10, contrast: 15, saturation: 5 } },
  { id: '2', name: 'Gaussian Blur', category: 'blur', intensity: 50, enabled: false, parameters: { radius: 5 } },
  { id: '3', name: 'Film Grain', category: 'stylize', intensity: 30, enabled: true, parameters: { amount: 20, size: 2 } },
  { id: '4', name: 'Lens Distortion', category: 'distort', intensity: 25, enabled: false, parameters: { curvature: 10 } },
  { id: '5', name: 'Cross Dissolve', category: 'transition', intensity: 100, enabled: true, parameters: { duration: 1 } },
  { id: '6', name: 'Audio Fade', category: 'audio', intensity: 80, enabled: true, parameters: { fadeIn: 0.5, fadeOut: 1 } }
]

// Enhanced Competitive Upgrade Mock Data
const mockVideoStudioAIInsights = [
  { id: '1', type: 'success' as const, title: 'Render Complete', description: '4K export finished in record time. GPU optimization working well.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Rendering' },
  { id: '2', type: 'info' as const, title: 'AI Enhancement', description: 'Auto color grading improved viewer retention by 18%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI' },
  { id: '3', type: 'warning' as const, title: 'Storage Alert', description: 'Project storage at 85%. Archive old projects recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Storage' },
]

const mockVideoStudioCollaborators = [
  { id: '1', name: 'Video Editor', avatar: '/avatars/editor.jpg', status: 'online' as const, role: 'Editor' },
  { id: '2', name: 'Colorist', avatar: '/avatars/colorist.jpg', status: 'online' as const, role: 'Colorist' },
  { id: '3', name: 'Sound Designer', avatar: '/avatars/sound.jpg', status: 'busy' as const, role: 'Audio' },
]

const mockVideoStudioPredictions = [
  { id: '1', title: 'Render Queue', prediction: 'All renders complete by 3 PM', confidence: 92, trend: 'stable' as const, impact: 'high' as const },
  { id: '2', title: 'Project Deadline', prediction: 'Current project on track for Friday', confidence: 85, trend: 'stable' as const, impact: 'medium' as const },
]

const mockVideoStudioActivities = [
  { id: '1', user: 'Render Engine', action: 'Completed render', target: 'Brand Video Final Cut', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'AI Assistant', action: 'Auto-enhanced', target: 'Audio levels in Scene 3', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Editor', action: 'Saved version', target: 'v4.2 with new intro', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockVideoStudioQuickActions = [
  { id: '1', label: 'New Project', icon: 'plus', action: () => console.log('New project'), variant: 'default' as const },
  { id: '2', label: 'Export Video', icon: 'download', action: () => console.log('Export'), variant: 'default' as const },
  { id: '3', label: 'Templates', icon: 'layout', action: () => console.log('Templates'), variant: 'outline' as const },
]

export default function VideoStudioClient() {
  const [projects] = useState<VideoProject[]>(mockProjects)
  const [assets] = useState<Asset[]>(mockAssets)
  const [templates] = useState<Template[]>(mockTemplates)
  const [renderJobs] = useState<RenderJob[]>(mockRenderJobs)
  const [effects] = useState<Effect[]>(mockEffects)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType | 'all'>('all')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats
  const stats = useMemo(() => {
    const totalProjects = projects.length
    const totalAssets = assets.length
    const totalStorage = assets.reduce((sum, a) => sum + a.size, 0) + projects.reduce((sum, p) => sum + p.size, 0)
    const totalDuration = projects.reduce((sum, p) => sum + p.duration, 0)
    const publishedCount = projects.filter(p => p.status === 'published').length
    const renderingCount = renderJobs.filter(j => j.status === 'rendering').length
    const avgRating = templates.reduce((sum, t) => sum + t.rating, 0) / templates.length
    const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0)
    return { totalProjects, totalAssets, totalStorage, totalDuration, publishedCount, renderingCount, avgRating, totalDownloads }
  }, [projects, assets, templates, renderJobs])

  // Filtered data
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = assetTypeFilter === 'all' || asset.type === assetTypeFilter
      return matchesSearch && matchesType
    })
  }, [assets, searchQuery, assetTypeFilter])

  // Helper functions
  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      editing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      rendering: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      published: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      archived: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }
    return colors[status]
  }

  const getStatusIcon = (status: ProjectStatus) => {
    const icons: Record<ProjectStatus, React.ReactNode> = {
      draft: <Pencil className="w-3 h-3" />,
      editing: <Scissors className="w-3 h-3" />,
      rendering: <Loader2 className="w-3 h-3 animate-spin" />,
      ready: <CheckCircle2 className="w-3 h-3" />,
      published: <Share2 className="w-3 h-3" />,
      archived: <Folder className="w-3 h-3" />
    }
    return icons[status]
  }

  const getRenderStatusColor = (status: RenderStatus) => {
    const colors: Record<RenderStatus, string> = {
      queued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      rendering: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
    return colors[status]
  }

  const getAssetIcon = (type: AssetType) => {
    const icons: Record<AssetType, React.ReactNode> = {
      video: <FileVideo className="w-4 h-4" />,
      audio: <Music className="w-4 h-4" />,
      image: <Image className="w-4 h-4" />,
      graphic: <Layers className="w-4 h-4" />,
      title: <Type className="w-4 h-4" />,
      transition: <Zap className="w-4 h-4" />
    }
    return icons[type]
  }

  const getEffectCategoryColor = (category: EffectCategory) => {
    const colors: Record<EffectCategory, string> = {
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      blur: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      distort: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      stylize: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      transition: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      audio: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    }
    return colors[category]
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`
    return `${bytes} B`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects.toString(), change: 12.5, icon: Video, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Assets', value: stats.totalAssets.toString(), change: 8.3, icon: Layers, color: 'from-blue-500 to-cyan-500' },
    { label: 'Storage Used', value: formatFileSize(stats.totalStorage), change: 15.2, icon: HardDrive, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Duration', value: formatDuration(stats.totalDuration), change: 5.7, icon: Clock, color: 'from-orange-500 to-amber-500' },
    { label: 'Published', value: stats.publishedCount.toString(), change: 20.0, icon: Share2, color: 'from-indigo-500 to-violet-500' },
    { label: 'Rendering', value: stats.renderingCount.toString(), change: -10.0, icon: RefreshCw, color: 'from-rose-500 to-red-500' },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), change: 3.2, icon: Star, color: 'from-yellow-500 to-orange-500' },
    { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), change: 25.8, icon: Download, color: 'from-teal-500 to-green-500' }
  ]

  // Handlers
  const handleCreateProject = () => {
    toast.info('Create Project', {
      description: 'Opening video editor...'
    })
  }

  const handleRenderVideo = (projectName: string) => {
    toast.info('Rendering video', {
      description: `"${projectName}" is being rendered...`
    })
  }

  const handlePublishVideo = (projectName: string) => {
    toast.success('Publishing video', {
      description: `"${projectName}" is being published...`
    })
  }

  const handleExportVideo = (projectName: string) => {
    toast.success('Exporting video', {
      description: `"${projectName}" will be downloaded shortly`
    })
  }

  const handleDuplicateProject = (projectName: string) => {
    toast.success('Project duplicated', {
      description: `Copy of "${projectName}" created`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Studio</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Adobe Premiere-level video production</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects, assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="render" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Render Queue
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Projects Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Video Projects</h3>
                    <p className="text-purple-100">Create and manage your video productions</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalProjects}</div>
                    <div className="text-sm text-purple-100">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.publishedCount}</div>
                    <div className="text-sm text-purple-100">Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
                    <div className="text-sm text-purple-100">Total Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatFileSize(stats.totalStorage)}</div>
                    <div className="text-sm text-purple-100">Storage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: Plus, label: 'New Project', desc: 'Start fresh', color: 'from-purple-500 to-pink-600' },
                { icon: Upload, label: 'Import Media', desc: 'Upload files', color: 'from-blue-500 to-cyan-600' },
                { icon: Grid3X3, label: 'Templates', desc: 'Browse templates', color: 'from-green-500 to-emerald-600' },
                { icon: Cloud, label: 'Cloud Storage', desc: 'Manage files', color: 'from-amber-500 to-orange-600' },
                { icon: Users, label: 'Collaborate', desc: 'Team projects', color: 'from-indigo-500 to-violet-600' }
              ].map((action, idx) => (
                <button key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-left">
                  <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-gray-500">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All ({projects.length})
              </Button>
              {(['draft', 'editing', 'rendering', 'ready', 'published'] as ProjectStatus[]).map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({projects.filter(p => p.status === status).length})
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <Card key={project.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProject(project)}>
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(project.duration)}
                    </div>
                    {project.isLocked && (
                      <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        {project.resolution}
                      </div>
                      <div className="flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        {project.fps} fps
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(project.size)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        v{project.version} • {formatTimeAgo(project.lastEdited)}
                      </div>
                      <div className="flex gap-1">
                        {project.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Preview Window
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg relative overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm opacity-70">Select a project to preview</p>
                    </div>
                  </div>
                </div>
                {/* Playback Controls */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Button variant="ghost" size="icon">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    className="w-12 h-12 rounded-full"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => setVolume(volume === 0 ? 100 : 0)}>
                      {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${volume}%` }} />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                {/* Timeline Scrubber */}
                <div className="relative">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '35%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>00:00</span>
                    <span>01:03 / 03:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Multi-track Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="w-5 h-5" />
                    Timeline Tracks
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Track
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Video Track */}
                  <div className="flex items-center gap-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 w-32">
                      <Video className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Video 1</span>
                    </div>
                    <div className="flex-1 h-12 bg-purple-200 dark:bg-purple-800 rounded-lg relative overflow-hidden">
                      <div className="absolute left-4 top-2 bottom-2 w-48 bg-purple-500 rounded flex items-center px-2">
                        <span className="text-xs text-white truncate">Main Footage</span>
                      </div>
                      <div className="absolute left-56 top-2 bottom-2 w-32 bg-purple-400 rounded flex items-center px-2">
                        <span className="text-xs text-white truncate">B-Roll</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Lock className="w-3 h-3" /></Button>
                    </div>
                  </div>

                  {/* Audio Track */}
                  <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 w-32">
                      <Music className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Audio 1</span>
                    </div>
                    <div className="flex-1 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg relative overflow-hidden">
                      <div className="absolute left-0 top-2 bottom-2 w-full bg-blue-500 rounded flex items-center px-2">
                        <span className="text-xs text-white truncate">Background Music</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Volume2 className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Unlock className="w-3 h-3" /></Button>
                    </div>
                  </div>

                  {/* Title Track */}
                  <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 w-32">
                      <Type className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Titles</span>
                    </div>
                    <div className="flex-1 h-12 bg-green-200 dark:bg-green-800 rounded-lg relative overflow-hidden">
                      <div className="absolute left-8 top-2 bottom-2 w-24 bg-green-500 rounded flex items-center px-2">
                        <span className="text-xs text-white truncate">Intro Title</span>
                      </div>
                      <div className="absolute right-8 top-2 bottom-2 w-20 bg-green-400 rounded flex items-center px-2">
                        <span className="text-xs text-white truncate">Lower 3rd</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Unlock className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            {/* Assets Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Layers className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Media Assets</h3>
                    <p className="text-blue-100">Manage your video, audio, and graphic files</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalAssets}</div>
                    <div className="text-sm text-blue-100">Total Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{assets.filter(a => a.type === 'video').length}</div>
                    <div className="text-sm text-blue-100">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{assets.filter(a => a.type === 'audio').length}</div>
                    <div className="text-sm text-blue-100">Audio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatFileSize(assets.reduce((s, a) => s + a.size, 0))}</div>
                    <div className="text-sm text-blue-100">Storage</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={assetTypeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAssetTypeFilter('all')}
              >
                All ({assets.length})
              </Button>
              {(['video', 'audio', 'image', 'graphic', 'title', 'transition'] as AssetType[]).map(type => (
                <Button
                  key={type}
                  variant={assetTypeFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAssetTypeFilter(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} ({assets.filter(a => a.type === type).length})
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => (
                <Card key={asset.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg relative overflow-hidden flex items-center justify-center">
                    {getAssetIcon(asset.type)}
                    {asset.duration > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(asset.duration)}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{asset.name}</h4>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(asset.size)}</span>
                      <span>{asset.usageCount} uses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-0 shadow-sm border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Support for video, audio, images, and graphics</p>
                <Button variant="outline" className="mt-4">
                  <Upload className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6">
            {/* Effects Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Wand2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Effects & Filters</h3>
                    <p className="text-amber-100">Apply professional video effects and color grading</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{effects.length}</div>
                    <div className="text-sm text-amber-100">Effects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{effects.filter(e => e.enabled).length}</div>
                    <div className="text-sm text-amber-100">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-sm text-amber-100">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-sm text-amber-100">AI Features</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Effects Library</CardTitle>
                    <CardDescription>Browse and apply professional video effects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {effects.map(effect => (
                        <div
                          key={effect.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            effect.enabled
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getEffectCategoryColor(effect.category)}>
                              {effect.category}
                            </Badge>
                            {effect.enabled && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{effect.name}</h4>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Intensity</span>
                              <span>{effect.intensity}%</span>
                            </div>
                            <Progress value={effect.intensity} className="h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Color Grading
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['Exposure', 'Contrast', 'Highlights', 'Shadows', 'Saturation', 'Temperature'].map((param, i) => (
                      <div key={param}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{param}</span>
                          <span className="text-gray-500">{50 + i * 5}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${50 + i * 5}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Auto Color Correct
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Type className="w-4 h-4 mr-2" />
                      Generate Captions
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Scissors className="w-4 h-4 mr-2" />
                      Scene Detection
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Music className="w-4 h-4 mr-2" />
                      Audio Enhancement
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Render Queue Tab */}
          <TabsContent value="render" className="space-y-6">
            {/* Render Queue Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Render Queue</h3>
                    <p className="text-emerald-100">Export and render your video projects</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{renderJobs.length}</div>
                    <div className="text-sm text-emerald-100">Total Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{renderJobs.filter(j => j.status === 'rendering').length}</div>
                    <div className="text-sm text-emerald-100">Rendering</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{renderJobs.filter(j => j.status === 'completed').length}</div>
                    <div className="text-sm text-emerald-100">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{renderJobs.filter(j => j.status === 'queued').length}</div>
                    <div className="text-sm text-emerald-100">Queued</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Render Queue</CardTitle>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Queue
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {renderJobs.map(job => (
                        <div key={job.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <FileVideo className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{job.projectName}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Preset: {job.preset.toUpperCase()}</p>
                              </div>
                            </div>
                            <Badge className={getRenderStatusColor(job.status)}>
                              {job.status === 'rendering' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                              {job.status}
                            </Badge>
                          </div>
                          {job.status === 'rendering' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium">{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} className="h-2" />
                              <p className="text-xs text-gray-500">Est. time remaining: {Math.ceil(job.estimatedTime * (100 - job.progress) / 100 / 60)}min</p>
                            </div>
                          )}
                          {job.status === 'completed' && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Output: {formatFileSize(job.outputSize)}</span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="w-3 h-3 mr-1" />
                                  Share
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Export Presets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: '4K Ultra HD', icon: Monitor, desc: '3840x2160 @ 60fps' },
                      { name: '1080p Full HD', icon: Monitor, desc: '1920x1080 @ 30fps' },
                      { name: 'YouTube', icon: Video, desc: 'Optimized for YouTube' },
                      { name: 'Instagram Reels', icon: Smartphone, desc: '1080x1920 vertical' },
                      { name: 'TikTok', icon: Smartphone, desc: '1080x1920 @ 60fps' },
                      { name: 'Twitter/X', icon: Square, desc: '1:1 square format' }
                    ].map((preset, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <preset.icon className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{preset.name}</p>
                          <p className="text-xs text-gray-500">{preset.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5" />
                      Cloud Rendering
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Render projects faster using cloud processing power
                    </p>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Enable Cloud Render
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Overview Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Grid3X3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Video Templates</h3>
                    <p className="text-violet-100">Browse and use professional video templates</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{templates.length}</div>
                    <div className="text-sm text-violet-100">Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{templates.filter(t => t.isPremium).length}</div>
                    <div className="text-sm text-violet-100">Premium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                    <div className="text-sm text-violet-100">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                    <div className="text-sm text-violet-100">Downloads</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/80" />
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(template.duration)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{template.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{template.category}</Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Download className="w-3 h-3" />
                        {template.downloads.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tab Version */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Studio Settings</h3>
                    <p className="text-gray-200">Configure your video production preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                    Export Settings
                  </Button>
                  <Button className="bg-white hover:bg-gray-100 text-gray-800">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-500 uppercase">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                        { id: 'project', icon: Film, label: 'Project', desc: 'Default project' },
                        { id: 'export', icon: Download, label: 'Export', desc: 'Render settings' },
                        { id: 'storage', icon: HardDrive, label: 'Storage', desc: 'Media location' },
                        { id: 'notifications', icon: AlertCircle, label: 'Notifications', desc: 'Alerts' },
                        { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Power features' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className={`text-xs ${settingsTab === item.id ? 'text-white/70' : 'text-gray-500'}`}>{item.desc}</p>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Film className="w-5 h-5 text-purple-600" />
                          Default Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Resolution</label>
                            <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <option>1920x1080 (1080p)</option>
                              <option>3840x2160 (4K)</option>
                              <option>1280x720 (720p)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frame Rate</label>
                            <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <option>30 fps</option>
                              <option>24 fps</option>
                              <option>60 fps</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline Units</label>
                            <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <option>Timecode</option>
                              <option>Frames</option>
                              <option>Seconds</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio Sample Rate</label>
                            <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <option>48000 Hz</option>
                              <option>44100 Hz</option>
                              <option>96000 Hz</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="w-5 h-5 text-blue-600" />
                          Interface Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Auto-save projects', desc: 'Save every 5 minutes', checked: true },
                          { label: 'Show audio waveforms', desc: 'Display waveforms on timeline', checked: true },
                          { label: 'Snapping enabled', desc: 'Snap clips to playhead', checked: true },
                          { label: 'Show thumbnails', desc: 'Display video thumbnails on timeline', checked: true }
                        ].map((option, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                              <p className="text-sm text-gray-500">{option.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${option.checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${option.checked ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Project Settings */}
                {settingsTab === 'project' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-indigo-600" />
                          Project Defaults
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: '16:9 Landscape', icon: Monitor, selected: true },
                            { label: '9:16 Portrait', icon: Smartphone, selected: false },
                            { label: '1:1 Square', icon: Square, selected: false }
                          ].map((preset, idx) => (
                            <button key={idx} className={`p-4 rounded-lg border-2 text-center transition-all ${preset.selected ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                              <preset.icon className={`w-8 h-8 mx-auto mb-2 ${preset.selected ? 'text-purple-600' : 'text-gray-400'}`} />
                              <p className="text-sm font-medium">{preset.label}</p>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-600" />
                          Color Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Space</label>
                          <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option>Rec. 709 (Standard HD)</option>
                            <option>Rec. 2020 (HDR)</option>
                            <option>sRGB</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bit Depth</label>
                          <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option>8-bit</option>
                            <option>10-bit</option>
                            <option>12-bit</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Export Settings */}
                {settingsTab === 'export' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="w-5 h-5 text-green-600" />
                          Export Presets
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'YouTube Optimized', codec: 'H.264', bitrate: '20 Mbps', resolution: '1080p' },
                          { name: '4K Master', codec: 'ProRes 422', bitrate: '150 Mbps', resolution: '4K' },
                          { name: 'Instagram Reel', codec: 'H.264', bitrate: '8 Mbps', resolution: '1080x1920' },
                          { name: 'Web Preview', codec: 'H.264', bitrate: '5 Mbps', resolution: '720p' }
                        ].map((preset, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{preset.name}</p>
                              <p className="text-sm text-gray-500">{preset.codec} • {preset.bitrate} • {preset.resolution}</p>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Custom Preset
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Storage Settings */}
                {settingsTab === 'storage' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-600" />
                          Storage Locations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Folder className="w-5 h-5 text-yellow-500" />
                              <div>
                                <p className="font-medium">Project Files</p>
                                <p className="text-sm text-gray-500">/Users/Studio/Projects</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Change</Button>
                          </div>
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">156 GB used of 240 GB</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Cloud className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium">Cloud Storage</p>
                                <p className="text-sm text-gray-500">Connected to FreeFlow Cloud</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <Progress value={42} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">42 GB used of 100 GB</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-purple-600" />
                          Cache & Temp Files
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Media Cache</p>
                            <p className="text-sm text-gray-500">12.4 GB</p>
                          </div>
                          <Button variant="outline" size="sm">Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Preview Files</p>
                            <p className="text-sm text-gray-500">8.2 GB</p>
                          </div>
                          <Button variant="outline" size="sm">Clear</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          Notification Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Render complete', desc: 'Notify when rendering finishes', checked: true },
                          { label: 'Export failed', desc: 'Alert on export errors', checked: true },
                          { label: 'Auto-save completed', desc: 'Show save confirmations', checked: false },
                          { label: 'Cloud sync status', desc: 'Notify on sync events', checked: true },
                          { label: 'New template available', desc: 'Alert for new templates', checked: true }
                        ].map((notif, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notif.label}</p>
                              <p className="text-sm text-gray-500">{notif.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notif.checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notif.checked ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          AI Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'AI Scene Detection', desc: 'Auto-detect scene changes', checked: true },
                          { label: 'Smart Color Match', desc: 'AI-powered color grading', checked: true },
                          { label: 'Auto Captions', desc: 'Generate subtitles automatically', checked: true },
                          { label: 'Content-Aware Fill', desc: 'AI background removal', checked: false }
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{feature.label}</p>
                              <p className="text-sm text-gray-500">{feature.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${feature.checked ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${feature.checked ? 'translate-x-6' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Playback Quality</label>
                          <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option>Full Quality</option>
                            <option>Half Resolution</option>
                            <option>Quarter Resolution</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">GPU Acceleration</label>
                          <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                            <option>Auto (Recommended)</option>
                            <option>Force GPU</option>
                            <option>Software Only</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <AlertCircle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Settings</p>
                            <p className="text-xs text-gray-500">Restore default preferences</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Clear All Data</p>
                            <p className="text-xs text-gray-500">Delete all local data</p>
                          </div>
                          <Button variant="destructive" size="sm">Clear</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockVideoStudioAIInsights}
              title="Studio Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockVideoStudioCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockVideoStudioPredictions}
              title="Production Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockVideoStudioActivities}
            title="Studio Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockVideoStudioQuickActions}
            variant="grid"
          />
        </div>

        {/* Project Detail Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                {selectedProject?.title}
              </DialogTitle>
              <DialogDescription>{selectedProject?.description}</DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <ScrollArea className="max-h-96">
                <div className="space-y-6 pr-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/70">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{formatDuration(selectedProject.duration)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Resolution</p>
                      <p className="font-medium">{selectedProject.resolution}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Frame Rate</p>
                      <p className="font-medium">{selectedProject.fps} fps</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">File Size</p>
                      <p className="font-medium">{formatFileSize(selectedProject.size)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Project Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Status</span>
                        <Badge className={getStatusColor(selectedProject.status)}>{selectedProject.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Version</span>
                        <span>v{selectedProject.version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Created</span>
                        <span>{formatDate(selectedProject.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Last Edited</span>
                        <span>{formatTimeAgo(selectedProject.lastEdited)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Pencil className="w-4 h-4 mr-2" />
                      Open in Editor
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Asset Detail Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAsset && getAssetIcon(selectedAsset.type)}
                {selectedAsset?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                  {getAssetIcon(selectedAsset.type)}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium capitalize">{selectedAsset.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="font-medium">{formatFileSize(selectedAsset.size)}</p>
                  </div>
                  {selectedAsset.duration > 0 && (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">{formatDuration(selectedAsset.duration)}</p>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Used In</p>
                    <p className="font-medium">{selectedAsset.usageCount} projects</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Move className="w-4 h-4 mr-2" />
                    Move
                  </Button>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
