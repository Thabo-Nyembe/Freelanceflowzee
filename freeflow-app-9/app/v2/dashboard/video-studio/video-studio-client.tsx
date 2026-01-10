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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Video,
  Play,
  Pause,
  Plus,
  Upload,
  Scissors,
  Brain,
  Eye,
  Share2,
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
  Square,
  Star,
  Users,
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
  { id: '1', label: 'New Project', icon: 'plus', action: () => { /* Action will be set in component */ }, variant: 'default' as const },
  { id: '2', label: 'Export Video', icon: 'download', action: () => { /* Action will be set in component */ }, variant: 'default' as const },
  { id: '3', label: 'Templates', icon: 'layout', action: () => { /* Action will be set in component */ }, variant: 'outline' as const },
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
  const [trackVisibility, setTrackVisibility] = useState({ video: true, audio: true, titles: true })
  const [trackLocks, setTrackLocks] = useState({ video: false, audio: false, titles: false })

  // Dialog states
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showAddTrackDialog, setShowAddTrackDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showAutoColorDialog, setShowAutoColorDialog] = useState(false)
  const [showCaptionsDialog, setShowCaptionsDialog] = useState(false)
  const [showSceneDetectionDialog, setShowSceneDetectionDialog] = useState(false)
  const [showAudioEnhanceDialog, setShowAudioEnhanceDialog] = useState(false)
  const [showAddToQueueDialog, setShowAddToQueueDialog] = useState(false)
  const [showCloudRenderDialog, setShowCloudRenderDialog] = useState(false)
  const [showExportSettingsDialog, setShowExportSettingsDialog] = useState(false)
  const [showSaveSettingsDialog, setShowSaveSettingsDialog] = useState(false)
  const [showEditPresetDialog, setShowEditPresetDialog] = useState(false)
  const [showChangeStorageDialog, setShowChangeStorageDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showClearPreviewDialog, setShowClearPreviewDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [showCreatePresetDialog, setShowCreatePresetDialog] = useState(false)
  const [showProjectOptionsDialog, setShowProjectOptionsDialog] = useState(false)
  const [selectedPresetToEdit, setSelectedPresetToEdit] = useState<string | null>(null)

  // Form states
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectResolution, setNewProjectResolution] = useState('1920x1080')
  const [newProjectFps, setNewProjectFps] = useState('30')
  const [newTrackType, setNewTrackType] = useState<'video' | 'audio' | 'title'>('video')
  const [selectedRenderProject, setSelectedRenderProject] = useState('')
  const [selectedRenderPreset, setSelectedRenderPreset] = useState('1080p')
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetCodec, setNewPresetCodec] = useState('H.264')
  const [newPresetBitrate, setNewPresetBitrate] = useState('20')
  const [newPresetResolution, setNewPresetResolution] = useState('1080p')
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9')
  const [showCollaborateDialog, setShowCollaborateDialog] = useState(false)
  const [showCloudStorageDialog, setShowCloudStorageDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showFileBrowserDialog, setShowFileBrowserDialog] = useState(false)
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [selectedStoragePath, setSelectedStoragePath] = useState('')
  const [projectToDelete, setProjectToDelete] = useState<VideoProject | null>(null)

  // Handler functions for track controls
  const handleToggleTrackVisibility = (track: 'video' | 'audio' | 'titles') => {
    setTrackVisibility(prev => ({ ...prev, [track]: !prev[track] }))
    const newState = !trackVisibility[track]
    toast.promise(
      Promise.resolve(),
      {
        loading: `${newState ? 'Showing' : 'Hiding'} ${track} track...`,
        success: `${track.charAt(0).toUpperCase() + track.slice(1)} track ${newState ? 'visible' : 'hidden'}`,
        error: 'Failed to toggle visibility'
      }
    )
  }

  const handleToggleTrackLock = (track: 'video' | 'audio' | 'titles') => {
    setTrackLocks(prev => ({ ...prev, [track]: !prev[track] }))
    const newState = !trackLocks[track]
    toast.promise(
      Promise.resolve(),
      {
        loading: `${newState ? 'Locking' : 'Unlocking'} ${track} track...`,
        success: `${track.charAt(0).toUpperCase() + track.slice(1)} track ${newState ? 'locked' : 'unlocked'}`,
        error: 'Failed to toggle lock'
      }
    )
  }

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
    const createPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(createPromise, {
      loading: 'Creating new video project...',
      success: 'New project created',
      error: 'Failed to create project'
    })
  }

  const handleRenderVideo = (projectName: string) => {
    const renderPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800)
    })
    toast.promise(renderPromise, {
      loading: `Rendering "${projectName}"...`,
      success: `Render job created for "${projectName}"`,
      error: 'Failed to start render'
    })
  }

  const handlePublishVideo = (projectName: string) => {
    const publishPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000)
    })
    toast.promise(publishPromise, {
      loading: `Publishing "${projectName}"...`,
      success: `"${projectName}" published successfully`,
      error: 'Failed to publish video'
    })
  }

  const handleExportVideo = (projectName: string) => {
    const exportPromise = (async () => {
      const csvContent = [
        ['Project Name', 'Duration', 'Resolution', 'Format', 'Size'].join(','),
        [projectName, '300s', '1920x1080', 'mp4', '500MB'].join(',')
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${projectName}-export-metadata.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      await new Promise(r => setTimeout(r, 300))
    })()

    toast.promise(exportPromise, {
      loading: `Exporting "${projectName}"...`,
      success: `"${projectName}" exported successfully`,
      error: 'Failed to export video'
    })
  }

  const handleDuplicateProject = (projectName: string) => {
    const duplicatePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 600)
    })
    toast.promise(duplicatePromise, {
      loading: `Duplicating "${projectName}"...`,
      success: `Copy of "${projectName}" created`,
      error: 'Failed to duplicate project'
    })
  }

  // Handler for creating a new project
  const handleSubmitNewProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name')
      return
    }
    const createPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800)
    })
    toast.promise(createPromise, {
      loading: 'Creating project...',
      success: `Project "${newProjectName}" created successfully`,
      error: 'Failed to create project'
    })
    setShowNewProjectDialog(false)
    setNewProjectName('')
  }

  // Handler for adding a new track
  const handleAddTrack = () => {
    const addPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(addPromise, {
      loading: `Adding ${newTrackType} track...`,
      success: `${newTrackType.charAt(0).toUpperCase() + newTrackType.slice(1)} track added`,
      error: 'Failed to add track'
    })
    setShowAddTrackDialog(false)
  }

  // Handler for file upload
  const handleUploadFiles = () => {
    const uploadPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1500)
    })
    toast.promise(uploadPromise, {
      loading: 'Uploading files...',
      success: 'Files uploaded successfully',
      error: 'Failed to upload files'
    })
    setShowUploadDialog(false)
  }

  // Handler for auto color correction
  const handleAutoColorCorrect = () => {
    const colorPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000)
    })
    toast.promise(colorPromise, {
      loading: 'Analyzing footage and applying color correction...',
      success: 'Auto color correction applied',
      error: 'Failed to apply color correction'
    })
    setShowAutoColorDialog(false)
  }

  // Handler for generating captions
  const handleGenerateCaptions = () => {
    const captionPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 3000)
    })
    toast.promise(captionPromise, {
      loading: 'Generating captions using AI...',
      success: 'Captions generated successfully',
      error: 'Failed to generate captions'
    })
    setShowCaptionsDialog(false)
  }

  // Handler for scene detection
  const handleSceneDetection = () => {
    const scenePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2500)
    })
    toast.promise(scenePromise, {
      loading: 'Detecting scenes...',
      success: '12 scenes detected and markers added',
      error: 'Failed to detect scenes'
    })
    setShowSceneDetectionDialog(false)
  }

  // Handler for audio enhancement
  const handleAudioEnhance = () => {
    const audioPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000)
    })
    toast.promise(audioPromise, {
      loading: 'Enhancing audio quality...',
      success: 'Audio enhanced successfully',
      error: 'Failed to enhance audio'
    })
    setShowAudioEnhanceDialog(false)
  }

  // Handler for adding to render queue
  const handleAddToQueue = () => {
    if (!selectedRenderProject) {
      toast.error('Please select a project')
      return
    }
    const queuePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(queuePromise, {
      loading: 'Adding to render queue...',
      success: `Added to queue with ${selectedRenderPreset} preset`,
      error: 'Failed to add to queue'
    })
    setShowAddToQueueDialog(false)
    setSelectedRenderProject('')
  }

  // Handler for cloud rendering
  const handleEnableCloudRender = () => {
    const cloudPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000)
    })
    toast.promise(cloudPromise, {
      loading: 'Enabling cloud rendering...',
      success: 'Cloud rendering enabled - 4x faster processing',
      error: 'Failed to enable cloud rendering'
    })
    setShowCloudRenderDialog(false)
  }

  // Handler for exporting settings
  const handleExportSettings = () => {
    const exportPromise = (async () => {
      const settings = {
        resolution: '1920x1080',
        fps: 30,
        colorSpace: 'Rec. 709',
        bitDepth: '8-bit',
        exportedAt: new Date().toISOString()
      }
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'video-studio-settings.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      await new Promise(r => setTimeout(r, 300))
    })()
    toast.promise(exportPromise, {
      loading: 'Exporting settings...',
      success: 'Settings exported to file',
      error: 'Failed to export settings'
    })
    setShowExportSettingsDialog(false)
  }

  // Handler for saving settings
  const handleSaveSettings = () => {
    const savePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(savePromise, {
      loading: 'Saving settings...',
      success: 'Settings saved successfully',
      error: 'Failed to save settings'
    })
    setShowSaveSettingsDialog(false)
  }

  // Handler for editing preset
  const handleEditPreset = (presetName: string) => {
    setSelectedPresetToEdit(presetName)
    setShowEditPresetDialog(true)
  }

  // Handler for saving edited preset
  const handleSavePreset = () => {
    const savePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(savePromise, {
      loading: 'Saving preset...',
      success: `Preset "${selectedPresetToEdit}" updated`,
      error: 'Failed to save preset'
    })
    setShowEditPresetDialog(false)
    setSelectedPresetToEdit(null)
  }

  // Handler for creating custom preset
  const handleCreatePreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name')
      return
    }
    const createPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(createPromise, {
      loading: 'Creating preset...',
      success: `Preset "${newPresetName}" created`,
      error: 'Failed to create preset'
    })
    setShowCreatePresetDialog(false)
    setNewPresetName('')
  }

  // Handler for changing storage location
  const handleChangeStorage = () => {
    const changePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800)
    })
    toast.promise(changePromise, {
      loading: 'Updating storage location...',
      success: 'Storage location updated',
      error: 'Failed to change storage location'
    })
    setShowChangeStorageDialog(false)
  }

  // Handler for clearing cache
  const handleClearCache = () => {
    const clearPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1500)
    })
    toast.promise(clearPromise, {
      loading: 'Clearing media cache...',
      success: '12.4 GB of cache cleared',
      error: 'Failed to clear cache'
    })
    setShowClearCacheDialog(false)
  }

  // Handler for clearing preview files
  const handleClearPreview = () => {
    const clearPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1200)
    })
    toast.promise(clearPromise, {
      loading: 'Clearing preview files...',
      success: '8.2 GB of preview files cleared',
      error: 'Failed to clear preview files'
    })
    setShowClearPreviewDialog(false)
  }

  // Handler for resetting settings
  const handleResetSettings = () => {
    const resetPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(resetPromise, {
      loading: 'Resetting settings...',
      success: 'All settings reset to defaults',
      error: 'Failed to reset settings'
    })
    setShowResetSettingsDialog(false)
  }

  // Handler for clearing all data
  const handleClearAllData = () => {
    const clearPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 2000)
    })
    toast.promise(clearPromise, {
      loading: 'Clearing all local data...',
      success: 'All local data cleared',
      error: 'Failed to clear data'
    })
    setShowClearDataDialog(false)
  }

  // Handler for playback skip
  const handleSkipBack = () => {
    setCurrentTime(prev => Math.max(0, prev - 10))
    toast.success('Skipped back 10 seconds')
  }

  const handleSkipForward = () => {
    setCurrentTime(prev => prev + 10)
    toast.success('Skipped forward 10 seconds')
  }

  // Handler for fullscreen
  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      toast.success('Exited fullscreen')
    } else {
      document.documentElement.requestFullscreen()
      toast.success('Entered fullscreen')
    }
  }

  // Handler for downloading rendered video
  const handleDownloadRender = (jobName: string) => {
    const downloadPromise = (async () => {
      const blob = new Blob(['Video content placeholder'], { type: 'video/mp4' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${jobName}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      await new Promise(r => setTimeout(r, 300))
    })()
    toast.promise(downloadPromise, {
      loading: `Downloading "${jobName}"...`,
      success: 'Download started',
      error: 'Failed to download'
    })
  }

  // Handler for sharing rendered video
  const handleShareRender = (jobName: string) => {
    const sharePromise = (async () => {
      await navigator.clipboard.writeText(`https://freeflow.app/share/${jobName.toLowerCase().replace(/\s+/g, '-')}`)
      await new Promise(r => setTimeout(r, 300))
    })()
    toast.promise(sharePromise, {
      loading: 'Generating share link...',
      success: 'Share link copied to clipboard',
      error: 'Failed to generate share link'
    })
  }

  // Handler for duplicating asset
  const handleDuplicateAsset = (assetName: string) => {
    const duplicatePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(duplicatePromise, {
      loading: `Duplicating "${assetName}"...`,
      success: `Copy of "${assetName}" created`,
      error: 'Failed to duplicate asset'
    })
    setSelectedAsset(null)
  }

  // Handler for moving asset
  const handleMoveAsset = (assetName: string) => {
    const movePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(movePromise, {
      loading: `Moving "${assetName}"...`,
      success: `"${assetName}" moved to new location`,
      error: 'Failed to move asset'
    })
    setSelectedAsset(null)
  }

  // Handler for deleting asset
  const handleDeleteAsset = (assetName: string) => {
    const deletePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(deletePromise, {
      loading: `Deleting "${assetName}"...`,
      success: `"${assetName}" deleted`,
      error: 'Failed to delete asset'
    })
    setSelectedAsset(null)
  }

  // Handler for opening project in editor
  const handleOpenInEditor = (projectName: string) => {
    const openPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800)
    })
    toast.promise(openPromise, {
      loading: `Opening "${projectName}" in editor...`,
      success: `"${projectName}" opened in editor`,
      error: 'Failed to open project'
    })
    setSelectedProject(null)
  }

  // Handler for sharing project
  const handleShareProject = (projectName: string) => {
    const sharePromise = (async () => {
      await navigator.clipboard.writeText(`https://freeflow.app/project/${projectName.toLowerCase().replace(/\s+/g, '-')}`)
      await new Promise(r => setTimeout(r, 300))
    })()
    toast.promise(sharePromise, {
      loading: 'Generating share link...',
      success: 'Project share link copied to clipboard',
      error: 'Failed to generate share link'
    })
  }

  // Handler for project options menu
  const handleProjectOptions = (project: VideoProject) => {
    setSelectedProject(project)
    setShowProjectOptionsDialog(true)
  }

  // Handler for applying filter
  const handleApplyFilter = () => {
    toast.success('Filters applied')
    setShowFilterDialog(false)
  }

  // Handler for quick action buttons
  const handleQuickAction = (label: string) => {
    switch (label) {
      case 'New Project':
        setShowNewProjectDialog(true)
        break
      case 'Import Media':
        setShowUploadDialog(true)
        break
      case 'Templates':
        setShowTemplatesDialog(true)
        break
      case 'Cloud Storage':
        setShowCloudStorageDialog(true)
        break
      case 'Collaborate':
        setShowCollaborateDialog(true)
        break
      default:
        // Handle any other quick actions
        setShowNewProjectDialog(true)
    }
  }

  // Handler for selecting a template
  const handleSelectTemplate = (template: Template) => {
    const applyPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000)
    })
    toast.promise(applyPromise, {
      loading: `Applying template "${template.name}"...`,
      success: `Template "${template.name}" applied to new project`,
      error: 'Failed to apply template'
    })
    setShowTemplatesDialog(false)
  }

  // Handler for file browser selection
  const handleSelectPath = (path: string) => {
    setSelectedStoragePath(path)
    setShowFileBrowserDialog(false)
  }

  // Handler for deleting a project
  const handleDeleteProject = () => {
    if (!projectToDelete) return
    const deletePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800)
    })
    toast.promise(deletePromise, {
      loading: `Moving "${projectToDelete.title}" to trash...`,
      success: `"${projectToDelete.title}" moved to trash`,
      error: 'Failed to delete project'
    })
    setShowDeleteProjectDialog(false)
    setShowProjectOptionsDialog(false)
    setProjectToDelete(null)
  }

  // Handler for selecting aspect ratio preset
  const handleAspectRatioSelect = (ratio: '16:9' | '9:16' | '1:1') => {
    setSelectedAspectRatio(ratio)
    toast.success(`Aspect ratio set to ${ratio}`)
  }

  // Handler for selecting export preset
  const handleExportPresetSelect = (presetName: string) => {
    const queuePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 500)
    })
    toast.promise(queuePromise, {
      loading: `Preparing ${presetName} preset...`,
      success: `${presetName} preset selected`,
      error: 'Failed to select preset'
    })
  }

  // Handler for collaborate
  const handleInviteCollaborator = () => {
    const invitePromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 800)
    })
    toast.promise(invitePromise, {
      loading: 'Sending invitation...',
      success: 'Invitation sent successfully',
      error: 'Failed to send invitation'
    })
    setShowCollaborateDialog(false)
  }

  // Handler for cloud storage sync
  const handleCloudStorageSync = () => {
    const syncPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1500)
    })
    toast.promise(syncPromise, {
      loading: 'Syncing with cloud storage...',
      success: 'Cloud storage synced successfully',
      error: 'Failed to sync cloud storage'
    })
    setShowCloudStorageDialog(false)
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
            <Button variant="outline" size="icon" onClick={() => setShowFilterDialog(true)}>
              <Filter className="w-4 h-4" />
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={() => setShowNewProjectDialog(true)}>
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
                <button key={idx} onClick={() => handleQuickAction(action.label)} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all text-left">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleProjectOptions(project); }}>
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
                  <Button variant="ghost" size="icon" onClick={handleSkipBack}>
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
                  <Button variant="ghost" size="icon" onClick={handleSkipForward}>
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
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={handleFullscreen}>
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
                    <Button variant="outline" size="sm" onClick={() => setShowAddTrackDialog(true)}>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTrackVisibility('video')} title={trackVisibility.video ? 'Hide video track' : 'Show video track'}><Eye className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTrackLock('video')} title={trackLocks.video ? 'Unlock video track' : 'Lock video track'}><Lock className="w-3 h-3" /></Button>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTrackVisibility('audio')} title={trackVisibility.audio ? 'Mute audio' : 'Unmute audio'}><Volume2 className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTrackLock('audio')} title={trackLocks.audio ? 'Unlock audio track' : 'Lock audio track'}><Unlock className="w-3 h-3" /></Button>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTrackVisibility('titles')} title={trackVisibility.titles ? 'Hide titles' : 'Show titles'}><Eye className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleTrackLock('titles')} title={trackLocks.titles ? 'Unlock titles' : 'Lock titles'}><Unlock className="w-3 h-3" /></Button>
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
                <Button variant="outline" className="mt-4" onClick={() => setShowUploadDialog(true)}>
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
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowAutoColorDialog(true)}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Auto Color Correct
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowCaptionsDialog(true)}>
                      <Type className="w-4 h-4 mr-2" />
                      Generate Captions
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowSceneDetectionDialog(true)}>
                      <Scissors className="w-4 h-4 mr-2" />
                      Scene Detection
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowAudioEnhanceDialog(true)}>
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
                      <Button onClick={() => setShowAddToQueueDialog(true)}>
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
                                <Button variant="outline" size="sm" onClick={() => handleDownloadRender(job.projectName)}>
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleShareRender(job.projectName)}>
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
                      <div key={i} onClick={() => handleExportPresetSelect(preset.name)} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
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
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={() => setShowCloudRenderDialog(true)}>
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
                  <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={() => setShowExportSettingsDialog(true)}>
                    Export Settings
                  </Button>
                  <Button className="bg-white hover:bg-gray-100 text-gray-800" onClick={() => setShowSaveSettingsDialog(true)}>
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
                            { label: '16:9 Landscape', icon: Monitor, ratio: '16:9' as const },
                            { label: '9:16 Portrait', icon: Smartphone, ratio: '9:16' as const },
                            { label: '1:1 Square', icon: Square, ratio: '1:1' as const }
                          ].map((preset, idx) => (
                            <button key={idx} onClick={() => handleAspectRatioSelect(preset.ratio)} className={`p-4 rounded-lg border-2 text-center transition-all ${selectedAspectRatio === preset.ratio ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                              <preset.icon className={`w-8 h-8 mx-auto mb-2 ${selectedAspectRatio === preset.ratio ? 'text-purple-600' : 'text-gray-400'}`} />
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
                            <Button variant="outline" size="sm" onClick={() => handleEditPreset(preset.name)}>Edit</Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full border-dashed" onClick={() => setShowCreatePresetDialog(true)}>
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
                            <Button variant="outline" size="sm" onClick={() => setShowChangeStorageDialog(true)}>Change</Button>
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
                          <Button variant="outline" size="sm" onClick={() => setShowClearCacheDialog(true)}>Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Preview Files</p>
                            <p className="text-sm text-gray-500">8.2 GB</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowClearPreviewDialog(true)}>Clear</Button>
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
                          <Button variant="destructive" size="sm" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Clear All Data</p>
                            <p className="text-xs text-gray-500">Delete all local data</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowClearDataDialog(true)}>Clear</Button>
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
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
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
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={() => handleOpenInEditor(selectedProject.title)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Open in Editor
                    </Button>
                    <Button variant="outline" onClick={() => handleExportVideo(selectedProject.title)}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" onClick={() => handleShareProject(selectedProject.title)}>
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
                  <Button variant="outline" className="flex-1" onClick={() => handleDuplicateAsset(selectedAsset.name)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleMoveAsset(selectedAsset.name)}>
                    <Move className="w-4 h-4 mr-2" />
                    Move
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteAsset(selectedAsset.name)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Projects
              </DialogTitle>
              <DialogDescription>Refine your project search</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="editing">Editing</option>
                  <option value="rendering">Rendering</option>
                  <option value="ready">Ready</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Resolution</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="all">All Resolutions</option>
                  <option value="4k">4K (3840x2160)</option>
                  <option value="1080p">1080p (1920x1080)</option>
                  <option value="720p">720p (1280x720)</option>
                  <option value="vertical">Vertical (1080x1920)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Date Range</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFilterDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleApplyFilter}>Apply Filters</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Project
              </DialogTitle>
              <DialogDescription>Start a new video project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Resolution</label>
                <select
                  value={newProjectResolution}
                  onChange={(e) => setNewProjectResolution(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="3840x2160">4K (3840x2160)</option>
                  <option value="1920x1080">1080p (1920x1080)</option>
                  <option value="1280x720">720p (1280x720)</option>
                  <option value="1080x1920">Vertical (1080x1920)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Frame Rate</label>
                <select
                  value={newProjectFps}
                  onChange={(e) => setNewProjectFps(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="24">24 fps (Cinema)</option>
                  <option value="30">30 fps (Standard)</option>
                  <option value="60">60 fps (Smooth)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewProjectDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={handleSubmitNewProject}>Create Project</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Track Dialog */}
        <Dialog open={showAddTrackDialog} onOpenChange={setShowAddTrackDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Track
              </DialogTitle>
              <DialogDescription>Add a track to your timeline</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Track Type</label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { type: 'video' as const, icon: Video, label: 'Video' },
                    { type: 'audio' as const, icon: Music, label: 'Audio' },
                    { type: 'title' as const, icon: Type, label: 'Title' }
                  ].map((track) => (
                    <button
                      key={track.type}
                      onClick={() => setNewTrackType(track.type)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        newTrackType === track.type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <track.icon className={`w-6 h-6 mx-auto mb-2 ${newTrackType === track.type ? 'text-purple-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium">{track.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddTrackDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAddTrack}>Add Track</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Media
              </DialogTitle>
              <DialogDescription>Upload video, audio, or image files</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
                <p className="text-xs text-gray-400">Supported: MP4, MOV, AVI, MP3, WAV, PNG, JPG</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleUploadFiles}>Upload Files</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auto Color Correct Dialog */}
        <Dialog open={showAutoColorDialog} onOpenChange={setShowAutoColorDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Auto Color Correction
              </DialogTitle>
              <DialogDescription>AI-powered color correction for your footage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium mb-2">What this does:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>- Analyzes footage color balance</li>
                  <li>- Adjusts exposure and contrast</li>
                  <li>- Corrects white balance</li>
                  <li>- Enhances color vibrancy</li>
                </ul>
              </div>
              <div>
                <label className="text-sm font-medium">Correction Strength</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="strong">Strong</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAutoColorDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAutoColorCorrect}>Apply Correction</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate Captions Dialog */}
        <Dialog open={showCaptionsDialog} onOpenChange={setShowCaptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Generate Captions
              </DialogTitle>
              <DialogDescription>AI-powered automatic caption generation</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="auto">Auto-detect</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Caption Style</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="standard">Standard</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                  <option value="animated">Animated</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCaptionsDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleGenerateCaptions}>Generate Captions</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scene Detection Dialog */}
        <Dialog open={showSceneDetectionDialog} onOpenChange={setShowSceneDetectionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Scene Detection
              </DialogTitle>
              <DialogDescription>Automatically detect scene changes in your video</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>- Analyzes visual changes in footage</li>
                  <li>- Detects cuts and transitions</li>
                  <li>- Adds markers at scene boundaries</li>
                  <li>- Creates clips for easy editing</li>
                </ul>
              </div>
              <div>
                <label className="text-sm font-medium">Sensitivity</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="low">Low (fewer scenes)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (more scenes)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowSceneDetectionDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSceneDetection}>Detect Scenes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Audio Enhancement Dialog */}
        <Dialog open={showAudioEnhanceDialog} onOpenChange={setShowAudioEnhanceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Audio Enhancement
              </DialogTitle>
              <DialogDescription>AI-powered audio quality improvement</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Enhancement Type</label>
                <div className="space-y-2 mt-2">
                  {[
                    { label: 'Noise Reduction', desc: 'Remove background noise' },
                    { label: 'Volume Normalization', desc: 'Balance audio levels' },
                    { label: 'Voice Enhancement', desc: 'Improve speech clarity' },
                    { label: 'Bass Boost', desc: 'Enhance low frequencies' }
                  ].map((option, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.desc}</p>
                      </div>
                      <div className="w-12 h-6 rounded-full p-1 cursor-pointer transition-colors bg-purple-600">
                        <div className="w-4 h-4 rounded-full bg-white translate-x-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAudioEnhanceDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAudioEnhance}>Enhance Audio</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add to Queue Dialog */}
        <Dialog open={showAddToQueueDialog} onOpenChange={setShowAddToQueueDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Add to Render Queue
              </DialogTitle>
              <DialogDescription>Queue a project for rendering</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Project</label>
                <select
                  value={selectedRenderProject}
                  onChange={(e) => setSelectedRenderProject(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="">Choose a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Export Preset</label>
                <select
                  value={selectedRenderPreset}
                  onChange={(e) => setSelectedRenderPreset(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="4k">4K Ultra HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="720p">720p HD</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddToQueueDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAddToQueue}>Add to Queue</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cloud Render Dialog */}
        <Dialog open={showCloudRenderDialog} onOpenChange={setShowCloudRenderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Enable Cloud Rendering
              </DialogTitle>
              <DialogDescription>Render your projects faster with cloud processing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Cloud Rendering Benefits:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>- Up to 4x faster rendering</li>
                  <li>- No local CPU/GPU load</li>
                  <li>- Render multiple projects simultaneously</li>
                  <li>- Priority support included</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Monthly Cost</span>
                  <span className="text-2xl font-bold text-purple-600">$29</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Includes 100 render hours/month</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCloudRenderDialog(false)}>Not Now</Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white" onClick={handleEnableCloudRender}>Enable Cloud</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Settings Dialog */}
        <Dialog open={showExportSettingsDialog} onOpenChange={setShowExportSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Settings
              </DialogTitle>
              <DialogDescription>Export your studio settings to a file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Settings to export:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>- Project defaults</li>
                  <li>- Export presets</li>
                  <li>- UI preferences</li>
                  <li>- Keyboard shortcuts</li>
                </ul>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportSettingsDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleExportSettings}>Export to File</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Settings Dialog */}
        <Dialog open={showSaveSettingsDialog} onOpenChange={setShowSaveSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Save Settings
              </DialogTitle>
              <DialogDescription>Save all your current settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This will save all your current studio settings including project defaults, export presets, and preferences.
              </p>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowSaveSettingsDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Preset Dialog */}
        <Dialog open={showEditPresetDialog} onOpenChange={setShowEditPresetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="w-5 h-5" />
                Edit Preset: {selectedPresetToEdit}
              </DialogTitle>
              <DialogDescription>Modify export preset settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Codec</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option>H.264</option>
                  <option>H.265 (HEVC)</option>
                  <option>ProRes 422</option>
                  <option>ProRes 4444</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Bitrate</label>
                <Input type="text" placeholder="20 Mbps" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Resolution</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option>4K (3840x2160)</option>
                  <option>1080p (1920x1080)</option>
                  <option>720p (1280x720)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditPresetDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSavePreset}>Save Preset</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Preset Dialog */}
        <Dialog open={showCreatePresetDialog} onOpenChange={setShowCreatePresetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Custom Preset
              </DialogTitle>
              <DialogDescription>Create a new export preset</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Preset Name</label>
                <Input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="My Custom Preset"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Codec</label>
                <select
                  value={newPresetCodec}
                  onChange={(e) => setNewPresetCodec(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option>H.264</option>
                  <option>H.265 (HEVC)</option>
                  <option>ProRes 422</option>
                  <option>ProRes 4444</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Bitrate (Mbps)</label>
                <Input
                  value={newPresetBitrate}
                  onChange={(e) => setNewPresetBitrate(e.target.value)}
                  placeholder="20"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Resolution</label>
                <select
                  value={newPresetResolution}
                  onChange={(e) => setNewPresetResolution(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="4k">4K (3840x2160)</option>
                  <option value="1080p">1080p (1920x1080)</option>
                  <option value="720p">720p (1280x720)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreatePresetDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreatePreset}>Create Preset</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Storage Dialog */}
        <Dialog open={showChangeStorageDialog} onOpenChange={setShowChangeStorageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Change Storage Location
              </DialogTitle>
              <DialogDescription>Select a new location for project files</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Location</label>
                <p className="text-sm text-gray-500 mt-1">/Users/Studio/Projects</p>
              </div>
              <div>
                <label className="text-sm font-medium">New Location</label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="/path/to/new/location" className="flex-1" value={selectedStoragePath} onChange={(e) => setSelectedStoragePath(e.target.value)} />
                  <Button variant="outline" onClick={() => setShowFileBrowserDialog(true)}>Browse</Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowChangeStorageDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleChangeStorage}>Update Location</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Cache Dialog */}
        <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Clear Media Cache
              </DialogTitle>
              <DialogDescription>Remove cached media files to free up space</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This will clear 12.4 GB of cached media files. This action cannot be undone but will not affect your projects.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleClearCache}>Clear Cache</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Preview Dialog */}
        <Dialog open={showClearPreviewDialog} onOpenChange={setShowClearPreviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Clear Preview Files
              </DialogTitle>
              <DialogDescription>Remove preview render files</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This will clear 8.2 GB of preview files. Previews will be regenerated when you play your timeline.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowClearPreviewDialog(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleClearPreview}>Clear Previews</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Reset All Settings
              </DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Are you sure you want to reset all settings to their defaults? This will remove all custom presets and preferences.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleResetSettings}>Reset All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear All Data Dialog */}
        <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Clear All Local Data
              </DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Warning: This will permanently delete all local data including cache, previews, settings, and preferences. Your cloud-synced projects will not be affected.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowClearDataDialog(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleClearAllData}>Clear All Data</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Project Options Dialog */}
        <Dialog open={showProjectOptionsDialog} onOpenChange={setShowProjectOptionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MoreVertical className="w-5 h-5" />
                Project Options
              </DialogTitle>
              <DialogDescription>{selectedProject?.title}</DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleOpenInEditor(selectedProject.title); setShowProjectOptionsDialog(false); }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Open in Editor
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleRenderVideo(selectedProject.title); setShowProjectOptionsDialog(false); }}>
                  <Target className="w-4 h-4 mr-2" />
                  Render Video
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handlePublishVideo(selectedProject.title); setShowProjectOptionsDialog(false); }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleExportVideo(selectedProject.title); setShowProjectOptionsDialog(false); }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => { handleDuplicateProject(selectedProject.title); setShowProjectOptionsDialog(false); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => { setProjectToDelete(selectedProject); setShowDeleteProjectDialog(true); }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Collaborate Dialog */}
        <Dialog open={showCollaborateDialog} onOpenChange={setShowCollaborateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Collaborate on Projects
              </DialogTitle>
              <DialogDescription>Invite team members to collaborate</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  placeholder="colleague@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                  <option value="editor">Editor - Can edit projects</option>
                  <option value="viewer">Viewer - Can view only</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h4 className="font-medium mb-2 text-indigo-700 dark:text-indigo-300">Current Team</h4>
                <div className="space-y-2">
                  {mockVideoStudioCollaborators.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                      <Badge variant="secondary" className="text-xs">{c.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCollaborateDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleInviteCollaborator}>Send Invitation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cloud Storage Dialog */}
        <Dialog open={showCloudStorageDialog} onOpenChange={setShowCloudStorageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Cloud Storage
              </DialogTitle>
              <DialogDescription>Manage your cloud storage and sync settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Storage Used</span>
                  <span className="text-amber-600 font-bold">42 GB / 100 GB</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Video Projects</span>
                  </div>
                  <span className="text-sm font-medium">28 GB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Media Assets</span>
                  </div>
                  <span className="text-sm font-medium">10 GB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Rendered Videos</span>
                  </div>
                  <span className="text-sm font-medium">4 GB</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCloudStorageDialog(false)}>Close</Button>
                <Button className="flex-1" onClick={handleCloudStorageSync}>Sync Now</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Gallery Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" />
                Template Gallery
              </DialogTitle>
              <DialogDescription>Choose a template to start your new project</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="group cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Layout className="w-8 h-8 text-gray-400" />
                      </div>
                      {template.isPremium && (
                        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" className="bg-white text-black hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); handleSelectTemplate(template); }}>
                          <Plus className="w-4 h-4 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{template.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {template.rating}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {template.duration}s
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {template.downloads.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* File Browser Dialog */}
        <Dialog open={showFileBrowserDialog} onOpenChange={setShowFileBrowserDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Select Folder
              </DialogTitle>
              <DialogDescription>Choose a location for your project files</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <HardDrive className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">/Users/Studio</span>
              </div>
              <ScrollArea className="h-64 border rounded-lg">
                <div className="p-2 space-y-1">
                  {[
                    { name: 'Documents', path: '/Users/Studio/Documents', icon: Folder },
                    { name: 'Projects', path: '/Users/Studio/Projects', icon: Folder },
                    { name: 'Videos', path: '/Users/Studio/Videos', icon: Video },
                    { name: 'Media', path: '/Users/Studio/Media', icon: Layers },
                    { name: 'Exports', path: '/Users/Studio/Exports', icon: Download },
                    { name: 'Backups', path: '/Users/Studio/Backups', icon: Cloud },
                    { name: 'Shared', path: '/Users/Studio/Shared', icon: Users },
                    { name: 'Archive', path: '/Users/Studio/Archive', icon: Folder }
                  ].map((folder, idx) => (
                    <button
                      key={idx}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${selectedStoragePath === folder.path ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' : ''}`}
                      onClick={() => setSelectedStoragePath(folder.path)}
                    >
                      <folder.icon className={`w-4 h-4 ${selectedStoragePath === folder.path ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className={`text-sm ${selectedStoragePath === folder.path ? 'text-purple-700 dark:text-purple-300 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>{folder.name}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
              {selectedStoragePath && (
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Selected: <span className="font-medium">{selectedStoragePath}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowFileBrowserDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => handleSelectPath(selectedStoragePath)} disabled={!selectedStoragePath}>
                  Select Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Project Confirmation Dialog */}
        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Project
              </DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            {projectToDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Are you sure you want to delete <span className="font-bold">&quot;{projectToDelete.title}&quot;</span>? This will permanently remove the project and all associated files.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{formatDuration(projectToDelete.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{formatFileSize(projectToDelete.size)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium">v{projectToDelete.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last edited:</span>
                    <span className="font-medium">{formatTimeAgo(projectToDelete.lastEdited)}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowDeleteProjectDialog(false); setProjectToDelete(null); }}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeleteProject}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
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
