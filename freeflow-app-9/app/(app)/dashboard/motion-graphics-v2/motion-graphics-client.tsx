"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Film,
  Play,
  Pause,
  Square,
  Layers,
  Sparkles,
  Download,
  Upload,
  Settings,
  Zap,
  Clock,
  Eye,
  Heart,
  Share2,
  Copy,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Repeat,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Grid3x3,
  List,
  Search,
  Filter,
  Folder,
  FolderOpen,
  Image,
  Type,
  Shapes,
  Wand2,
  Palette,
  Move,
  RotateCcw,
  Scale3D,
  MousePointer,
  Scissors,
  Blend,
  Droplets,
  Sun,
  Moon,
  Gauge,
  Timer,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Save,
  FileVideo,
  Monitor,
  Smartphone,
  Lock,
  Unlock,
  Users,
  MessageSquare,
  History,
  GitBranch,
  Star,
  Crown,
  Clapperboard
} from 'lucide-react'

// Types
type AnimationStatus = 'draft' | 'rendering' | 'ready' | 'failed' | 'queued' | 'archived'
type AnimationType = 'composition' | 'template' | 'preset' | 'effect' | 'transition'
type LayerType = 'video' | 'image' | 'text' | 'shape' | 'audio' | 'effect' | 'null'
type RenderFormat = 'mp4' | 'mov' | 'webm' | 'gif' | 'png_sequence' | 'prores'
type Resolution = '720p' | '1080p' | '2k' | '4k' | '8k' | 'custom'
type EasingType = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'bounce' | 'elastic' | 'spring'

interface Keyframe {
  id: string
  time: number
  value: number | string | { x: number; y: number }
  easing: EasingType
}

interface Layer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  startTime: number
  duration: number
  properties: {
    position?: { x: number; y: number }
    scale?: { x: number; y: number }
    rotation?: number
    opacity?: number
  }
  keyframes: Keyframe[]
}

interface Animation {
  id: string
  title: string
  description?: string
  type: AnimationType
  status: AnimationStatus
  category: string
  resolution: Resolution
  width: number
  height: number
  fps: number
  duration: number
  thumbnailUrl?: string
  previewUrl?: string
  layers: Layer[]
  createdBy: { id: string; name: string; avatar?: string }
  createdAt: string
  modifiedAt: string
  renderProgress?: number
  renderTime?: number
  fileSize?: number
  views: number
  likes: number
  downloads: number
  isStarred: boolean
  isPublic: boolean
  tags: string[]
  version: number
  collaborators: { id: string; name: string; avatar?: string; role: 'owner' | 'editor' | 'viewer' }[]
}

interface EffectPreset {
  id: string
  name: string
  category: string
  description: string
  thumbnail: string
  duration: number
  properties: Record<string, unknown>
}

interface RenderJob {
  id: string
  animationId: string
  animationTitle: string
  status: 'queued' | 'rendering' | 'completed' | 'failed'
  format: RenderFormat
  resolution: Resolution
  progress: number
  startedAt?: string
  completedAt?: string
  outputSize?: number
  estimatedTime?: number
}

// Mock Data
const mockAnimations: Animation[] = [
  {
    id: 'anim-1',
    title: 'Product Launch Intro',
    description: 'Dynamic 3D text reveal with particle effects',
    type: 'composition',
    status: 'ready',
    category: 'branding',
    resolution: '4k',
    width: 3840,
    height: 2160,
    fps: 60,
    duration: 8.5,
    layers: [],
    createdBy: { id: 'user-1', name: 'Sarah Johnson' },
    createdAt: '2025-01-15T10:30:00Z',
    modifiedAt: '2025-01-18T14:20:00Z',
    renderProgress: 100,
    renderTime: 245,
    fileSize: 156789012,
    views: 12450,
    likes: 892,
    downloads: 345,
    isStarred: true,
    isPublic: true,
    tags: ['product', 'launch', '3d', 'particles'],
    version: 5,
    collaborators: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'owner' },
      { id: 'user-2', name: 'Michael Chen', role: 'editor' }
    ]
  },
  {
    id: 'anim-2',
    title: 'Social Media Story Pack',
    description: 'Animated templates for Instagram and TikTok',
    type: 'template',
    status: 'ready',
    category: 'social',
    resolution: '1080p',
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 15,
    layers: [],
    createdBy: { id: 'user-2', name: 'Michael Chen' },
    createdAt: '2025-01-12T08:15:00Z',
    modifiedAt: '2025-01-16T11:30:00Z',
    renderProgress: 100,
    fileSize: 45678901,
    views: 8900,
    likes: 567,
    downloads: 234,
    isStarred: false,
    isPublic: true,
    tags: ['social', 'story', 'instagram', 'tiktok'],
    version: 3,
    collaborators: []
  },
  {
    id: 'anim-3',
    title: 'Logo Animation',
    description: 'Clean and modern logo reveal animation',
    type: 'composition',
    status: 'rendering',
    category: 'branding',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    fps: 30,
    duration: 5,
    layers: [],
    createdBy: { id: 'user-1', name: 'Sarah Johnson' },
    createdAt: '2025-01-18T09:00:00Z',
    modifiedAt: '2025-01-19T10:15:00Z',
    renderProgress: 67,
    estimatedTime: 45,
    views: 234,
    likes: 45,
    downloads: 12,
    isStarred: true,
    isPublic: false,
    tags: ['logo', 'branding', 'reveal'],
    version: 2,
    collaborators: []
  },
  {
    id: 'anim-4',
    title: 'Kinetic Typography',
    description: 'Energetic text animation for music video',
    type: 'composition',
    status: 'draft',
    category: 'typography',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    fps: 60,
    duration: 30,
    layers: [],
    createdBy: { id: 'user-3', name: 'Emma Wilson' },
    createdAt: '2025-01-17T14:00:00Z',
    modifiedAt: '2025-01-19T08:30:00Z',
    views: 89,
    likes: 23,
    downloads: 5,
    isStarred: false,
    isPublic: false,
    tags: ['typography', 'kinetic', 'music'],
    version: 1,
    collaborators: [
      { id: 'user-3', name: 'Emma Wilson', role: 'owner' },
      { id: 'user-4', name: 'James Rodriguez', role: 'viewer' }
    ]
  },
  {
    id: 'anim-5',
    title: 'Transition Pack',
    description: 'Collection of smooth transitions for video editing',
    type: 'preset',
    status: 'ready',
    category: 'transitions',
    resolution: '4k',
    width: 3840,
    height: 2160,
    fps: 30,
    duration: 2,
    layers: [],
    createdBy: { id: 'user-2', name: 'Michael Chen' },
    createdAt: '2025-01-10T11:00:00Z',
    modifiedAt: '2025-01-14T16:45:00Z',
    renderProgress: 100,
    fileSize: 23456789,
    views: 5670,
    likes: 445,
    downloads: 890,
    isStarred: true,
    isPublic: true,
    tags: ['transitions', 'pack', 'smooth'],
    version: 8,
    collaborators: []
  }
]

const mockPresets: EffectPreset[] = [
  { id: 'preset-1', name: 'Fade In/Out', category: 'opacity', description: 'Smooth opacity transition', thumbnail: '', duration: 1, properties: {} },
  { id: 'preset-2', name: 'Slide Up', category: 'motion', description: 'Bottom to top movement', thumbnail: '', duration: 0.5, properties: {} },
  { id: 'preset-3', name: 'Scale & Rotate', category: 'transform', description: 'Dynamic entrance effect', thumbnail: '', duration: 0.8, properties: {} },
  { id: 'preset-4', name: 'Bounce', category: 'motion', description: 'Elastic bouncing animation', thumbnail: '', duration: 1.2, properties: {} },
  { id: 'preset-5', name: 'Blur Reveal', category: 'effects', description: 'Focus blur transition', thumbnail: '', duration: 0.6, properties: {} },
  { id: 'preset-6', name: 'Glitch', category: 'effects', description: 'Digital distortion effect', thumbnail: '', duration: 0.4, properties: {} },
  { id: 'preset-7', name: 'Typewriter', category: 'text', description: 'Character by character reveal', thumbnail: '', duration: 2, properties: {} },
  { id: 'preset-8', name: 'Particle Burst', category: 'particles', description: 'Explosive particle animation', thumbnail: '', duration: 1.5, properties: {} }
]

const mockRenderQueue: RenderJob[] = [
  { id: 'job-1', animationId: 'anim-3', animationTitle: 'Logo Animation', status: 'rendering', format: 'mp4', resolution: '1080p', progress: 67, startedAt: '2025-01-19T10:00:00Z', estimatedTime: 45 },
  { id: 'job-2', animationId: 'anim-4', animationTitle: 'Kinetic Typography', status: 'queued', format: 'prores', resolution: '1080p', progress: 0 },
  { id: 'job-3', animationId: 'anim-1', animationTitle: 'Product Launch Intro', status: 'completed', format: 'mp4', resolution: '4k', progress: 100, startedAt: '2025-01-18T14:00:00Z', completedAt: '2025-01-18T14:04:05Z', outputSize: 156789012 }
]

const mockLayers: Layer[] = [
  { id: 'layer-1', name: 'Background', type: 'shape', visible: true, locked: false, startTime: 0, duration: 8.5, properties: { opacity: 100 }, keyframes: [] },
  { id: 'layer-2', name: 'Main Text', type: 'text', visible: true, locked: false, startTime: 0.5, duration: 7, properties: { position: { x: 960, y: 540 }, scale: { x: 100, y: 100 }, opacity: 100 }, keyframes: [] },
  { id: 'layer-3', name: 'Particles', type: 'effect', visible: true, locked: false, startTime: 0, duration: 8.5, properties: { opacity: 80 }, keyframes: [] },
  { id: 'layer-4', name: 'Logo', type: 'image', visible: true, locked: true, startTime: 2, duration: 6.5, properties: { position: { x: 960, y: 200 }, scale: { x: 50, y: 50 } }, keyframes: [] },
  { id: 'layer-5', name: 'Music', type: 'audio', visible: true, locked: false, startTime: 0, duration: 8.5, properties: {}, keyframes: [] }
]

// Helper Functions
const getStatusColor = (status: AnimationStatus): string => {
  const colors: Record<AnimationStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    rendering: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    queued: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    archived: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[status]
}

const getStatusIcon = (status: AnimationStatus) => {
  const icons: Record<AnimationStatus, JSX.Element> = {
    draft: <Edit className="w-3 h-3" />,
    rendering: <RefreshCw className="w-3 h-3 animate-spin" />,
    ready: <CheckCircle2 className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
    queued: <Clock className="w-3 h-3" />,
    archived: <Folder className="w-3 h-3" />
  }
  return icons[status]
}

const getTypeColor = (type: AnimationType): string => {
  const colors: Record<AnimationType, string> = {
    composition: 'from-purple-500 to-pink-500',
    template: 'from-blue-500 to-cyan-500',
    preset: 'from-green-500 to-emerald-500',
    effect: 'from-orange-500 to-red-500',
    transition: 'from-indigo-500 to-purple-500'
  }
  return colors[type]
}

const getLayerIcon = (type: LayerType) => {
  const icons: Record<LayerType, JSX.Element> = {
    video: <FileVideo className="w-4 h-4" />,
    image: <Image className="w-4 h-4" />,
    text: <Type className="w-4 h-4" />,
    shape: <Shapes className="w-4 h-4" />,
    audio: <Volume2 className="w-4 h-4" />,
    effect: <Sparkles className="w-4 h-4" />,
    null: <Target className="w-4 h-4" />
  }
  return icons[type]
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const frames = Math.floor((seconds % 1) * 30)
  return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

interface MotionGraphicsClientProps {
  initialAnimations?: Animation[]
}

export default function MotionGraphicsClient({
  initialAnimations = mockAnimations
}: MotionGraphicsClientProps) {
  const [activeTab, setActiveTab] = useState('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AnimationStatus>('all')
  const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const stats = useMemo(() => {
    const total = initialAnimations.length
    const ready = initialAnimations.filter(a => a.status === 'ready').length
    const rendering = initialAnimations.filter(a => a.status === 'rendering').length
    const totalViews = initialAnimations.reduce((sum, a) => sum + a.views, 0)
    const totalLikes = initialAnimations.reduce((sum, a) => sum + a.likes, 0)
    const totalDownloads = initialAnimations.reduce((sum, a) => sum + a.downloads, 0)

    return { total, ready, rendering, totalViews, totalLikes, totalDownloads }
  }, [initialAnimations])

  const filteredAnimations = useMemo(() => {
    return initialAnimations.filter(animation => {
      const matchesSearch = animation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesFilter = statusFilter === 'all' || animation.status === statusFilter
      return matchesSearch && matchesFilter
    })
  }, [initialAnimations, searchQuery, statusFilter])

  const statCards = [
    { label: 'Total Projects', value: stats.total.toString(), change: 25.3, icon: Film, color: 'from-cyan-500 to-blue-600' },
    { label: 'Rendered', value: stats.ready.toString(), change: 18.7, icon: CheckCircle2, color: 'from-green-500 to-emerald-600' },
    { label: 'In Queue', value: stats.rendering.toString(), change: -5.2, icon: RefreshCw, color: 'from-blue-500 to-indigo-600' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: 32.1, icon: Eye, color: 'from-purple-500 to-pink-600' },
    { label: 'Likes', value: stats.totalLikes.toLocaleString(), change: 28.4, icon: Heart, color: 'from-red-500 to-rose-600' },
    { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), change: 15.6, icon: Download, color: 'from-amber-500 to-orange-600' },
    { label: 'Templates', value: initialAnimations.filter(a => a.type === 'template').length.toString(), change: 12.5, icon: Layers, color: 'from-indigo-500 to-violet-600' },
    { label: 'Presets', value: mockPresets.length.toString(), change: 8.3, icon: Wand2, color: 'from-teal-500 to-cyan-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <Film className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Motion Graphics</h1>
              <p className="text-gray-600 dark:text-gray-400">After Effects-level animation studio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="projects" className="gap-2">
              <Film className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Layers className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="presets" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="render" className="gap-2">
              <Clapperboard className="w-4 h-4" />
              Render Queue
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'draft', 'rendering', 'ready'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={statusFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(filter)}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnimations.map((animation) => (
                  <Card key={animation.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedAnimation(animation)}>
                    <CardContent className="p-0">
                      <div className={`aspect-video rounded-t-lg bg-gradient-to-br ${getTypeColor(animation.type)} flex items-center justify-center relative overflow-hidden`}>
                        <Film className="w-12 h-12 text-white/80" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button size="icon" variant="secondary" className="w-12 h-12 rounded-full">
                            <Play className="w-6 h-6" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge className={getStatusColor(animation.status)}>
                            {getStatusIcon(animation.status)}
                            <span className="ml-1 capitalize">{animation.status}</span>
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                          {formatDuration(animation.duration)}
                        </div>
                        {animation.isStarred && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute top-2 left-2" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{animation.title}</h3>
                            <p className="text-sm text-gray-500 capitalize">{animation.type} • {animation.category}</p>
                          </div>
                          {animation.isPublic ? <Users className="w-4 h-4 text-gray-400" /> : <Lock className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {animation.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {animation.likes}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{animation.resolution} • {animation.fps}fps</span>
                        </div>
                        {animation.status === 'rendering' && animation.renderProgress !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Rendering...</span>
                              <span className="text-blue-600">{animation.renderProgress}%</span>
                            </div>
                            <Progress value={animation.renderProgress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredAnimations.map((animation) => (
                      <div
                        key={animation.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => setSelectedAnimation(animation)}
                      >
                        <div className={`w-24 h-16 rounded-lg bg-gradient-to-br ${getTypeColor(animation.type)} flex items-center justify-center flex-shrink-0`}>
                          <Film className="w-8 h-8 text-white/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">{animation.title}</p>
                            <Badge className={getStatusColor(animation.status)}>{animation.status}</Badge>
                            {animation.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-sm text-gray-500 capitalize">{animation.type} • {animation.category}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{animation.resolution}</span>
                            <span>{animation.fps} fps</span>
                            <span>{formatDuration(animation.duration)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{animation.views}</span>
                          <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{animation.likes}</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card className="lg:col-span-3 border-0 shadow-sm">
                <CardContent className="p-4">
                  {/* Preview Area */}
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg mb-4 flex items-center justify-center relative">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-16 h-16 rounded-full"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white">
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white">
                          <Rewind className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white">
                          <FastForward className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white">
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <span className="text-white text-sm ml-2">{formatDuration(currentTime)}</span>
                        <div className="flex-1 h-1 bg-white/30 rounded-full mx-4">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: '35%' }} />
                        </div>
                        <span className="text-white text-sm">{formatDuration(8.5)}</span>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white">
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <span>0:00</span>
                      <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded relative">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600" style={{ left: `${(i + 1) * 10}%` }}>
                            <span className="absolute -top-4 text-xs">{i + 1}s</span>
                          </div>
                        ))}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: '35%' }} />
                      </div>
                      <span>8:30</span>
                    </div>

                    <div className="space-y-1">
                      {mockLayers.map((layer) => (
                        <div key={layer.id} className="flex items-center gap-2 h-10">
                          <div className="w-40 flex items-center gap-2 text-sm">
                            <Button size="icon" variant="ghost" className="w-6 h-6">
                              {layer.visible ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-30" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="w-6 h-6">
                              {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 opacity-30" />}
                            </Button>
                            {getLayerIcon(layer.type)}
                            <span className="truncate">{layer.name}</span>
                          </div>
                          <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-700 rounded relative">
                            <div
                              className={`absolute h-full rounded bg-gradient-to-r ${
                                layer.type === 'video' ? 'from-purple-400 to-purple-500' :
                                layer.type === 'text' ? 'from-blue-400 to-blue-500' :
                                layer.type === 'audio' ? 'from-green-400 to-green-500' :
                                layer.type === 'effect' ? 'from-orange-400 to-orange-500' :
                                'from-gray-400 to-gray-500'
                              }`}
                              style={{
                                left: `${(layer.startTime / 8.5) * 100}%`,
                                width: `${(layer.duration / 8.5) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Properties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Position', icon: Move, value: '960, 540' },
                      { label: 'Scale', icon: Scale3D, value: '100%' },
                      { label: 'Rotation', icon: RotateCcw, value: '0°' },
                      { label: 'Opacity', icon: Droplets, value: '100%' }
                    ].map((prop) => (
                      <div key={prop.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <prop.icon className="w-4 h-4 text-gray-400" />
                          <span>{prop.label}</span>
                        </div>
                        <Input className="w-24 h-8 text-xs" defaultValue={prop.value} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Effects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Glow Effect
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        <Blend className="w-4 h-4 mr-2" />
                        Drop Shadow
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm h-9">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Effect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Effect Presets</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Preset
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockPresets.map((preset) => (
                <Card key={preset.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg mb-3 flex items-center justify-center">
                      <Wand2 className="w-8 h-8 text-white/80" />
                    </div>
                    <h3 className="font-medium mb-1">{preset.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{preset.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="capitalize">{preset.category}</span>
                      <span>{preset.duration}s</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Render Queue Tab */}
          <TabsContent value="render" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Render Queue</h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <Play className="w-4 h-4 mr-2" />
                Start All
              </Button>
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockRenderQueue.map((job) => (
                    <div key={job.id} className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        job.status === 'rendering' ? 'bg-blue-100 text-blue-600' :
                        job.status === 'completed' ? 'bg-green-100 text-green-600' :
                        job.status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {job.status === 'rendering' ? <RefreshCw className="w-6 h-6 animate-spin" /> :
                         job.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                         job.status === 'failed' ? <XCircle className="w-6 h-6" /> :
                         <Clock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{job.animationTitle}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="uppercase">{job.format}</span>
                          <span>{job.resolution}</span>
                          {job.outputSize && <span>{formatFileSize(job.outputSize)}</span>}
                        </div>
                        {job.status === 'rendering' && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>Rendering...</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'queued' && (
                          <Button size="sm" variant="outline">
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'rendering' && (
                          <Button size="sm" variant="outline">
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'completed' && (
                          <Button size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Views, likes, and downloads over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Top Animations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {initialAnimations
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map((animation, idx) => (
                        <div key={animation.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{animation.title}</p>
                            <p className="text-xs text-gray-500">{animation.views.toLocaleString()} views</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Render Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Renders', value: '1,247' },
                      { label: 'Avg Render Time', value: '4m 32s' },
                      { label: 'Success Rate', value: '98.5%' },
                      { label: 'Total Output', value: '45.6 GB' }
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-gray-500">{stat.label}</span>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Format Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { format: 'MP4', percentage: 65, color: 'bg-blue-500' },
                      { format: 'MOV', percentage: 20, color: 'bg-purple-500' },
                      { format: 'WebM', percentage: 10, color: 'bg-green-500' },
                      { format: 'GIF', percentage: 5, color: 'bg-orange-500' }
                    ].map((item) => (
                      <div key={item.format}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.format}</span>
                          <span className="text-sm text-gray-500">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Default Export Settings</CardTitle>
                  <CardDescription>Configure default output settings for new projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Resolution</label>
                      <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                        <option>720p (1280x720)</option>
                        <option>1080p (1920x1080)</option>
                        <option>2K (2560x1440)</option>
                        <option>4K (3840x2160)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Frame Rate</label>
                      <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                        <option>24 fps</option>
                        <option>30 fps</option>
                        <option>60 fps</option>
                        <option>120 fps</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Format</label>
                      <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                        <option>MP4 (H.264)</option>
                        <option>MOV (ProRes)</option>
                        <option>WebM</option>
                        <option>GIF</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quality</label>
                      <select className="w-full mt-1 px-3 py-2 rounded-md border bg-background">
                        <option>Best (Large File)</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low (Small File)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Render Settings</CardTitle>
                  <CardDescription>Configure rendering behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">GPU Acceleration</p>
                      <p className="text-sm text-gray-500">Use GPU for faster rendering</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Background Rendering</p>
                      <p className="text-sm text-gray-500">Continue working while rendering</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-save Projects</p>
                      <p className="text-sm text-gray-500">Save every 5 minutes</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                  <CardDescription>Customize your workflow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: 'Play/Pause', shortcut: 'Space' },
                    { action: 'Split Layer', shortcut: 'Cmd + Shift + D' },
                    { action: 'Add Keyframe', shortcut: 'K' },
                    { action: 'Render', shortcut: 'Cmd + M' },
                    { action: 'Save Project', shortcut: 'Cmd + S' }
                  ].map((item) => (
                    <div key={item.action} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <span className="text-sm">{item.action}</span>
                      <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">{item.shortcut}</kbd>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Storage & Cache</CardTitle>
                  <CardDescription>Manage disk usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Cache Size</span>
                      <span className="text-sm text-gray-500">12.4 GB / 50 GB</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Project Files</span>
                      <span className="text-sm text-gray-500">45.6 GB</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Animation Detail Dialog */}
        <Dialog open={!!selectedAnimation} onOpenChange={() => setSelectedAnimation(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedAnimation?.title}
                {selectedAnimation && (
                  <Badge className={getStatusColor(selectedAnimation.status)}>
                    {getStatusIcon(selectedAnimation.status)}
                    <span className="ml-1 capitalize">{selectedAnimation.status}</span>
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>{selectedAnimation?.description}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              {selectedAnimation && (
                <div className="space-y-6 p-4">
                  <div className={`aspect-video rounded-xl bg-gradient-to-br ${getTypeColor(selectedAnimation.type)} flex items-center justify-center`}>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-16 h-16 rounded-full"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{selectedAnimation.resolution}</p>
                        <p className="text-xs text-gray-500">Resolution</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{selectedAnimation.fps}</p>
                        <p className="text-xs text-gray-500">FPS</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{formatDuration(selectedAnimation.duration)}</p>
                        <p className="text-xs text-gray-500">Duration</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{selectedAnimation.fileSize ? formatFileSize(selectedAnimation.fileSize) : 'N/A'}</p>
                        <p className="text-xs text-gray-500">File Size</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <Eye className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-2xl font-bold">{selectedAnimation.views.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <Heart className="w-6 h-6 mx-auto mb-2 text-red-400" />
                      <p className="text-2xl font-bold">{selectedAnimation.likes}</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <Download className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                      <p className="text-2xl font-bold">{selectedAnimation.downloads}</p>
                      <p className="text-xs text-gray-500">Downloads</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAnimation.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {selectedAnimation.collaborators.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Collaborators</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnimation.collaborators.map((collab) => (
                          <div key={collab.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={collab.avatar} />
                              <AvatarFallback>{collab.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{collab.name}</span>
                            <Badge variant="outline" className="text-xs capitalize">{collab.role}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Project
                    </Button>
                    <Button variant="outline">
                      <Clapperboard className="w-4 h-4 mr-2" />
                      Render
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
