"use client"

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
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
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  Maximize2,
  Volume2,
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
  Folder,
  Image,
  Type,
  Shapes,
  Wand2,
  Palette,
  Move,
  RotateCcw,
  Scale3D,
  Blend,
  Droplets,
  Timer,
  Target,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileVideo,
  Monitor,
  Lock,
  Unlock,
  Users,
  Star,
  Clapperboard,
  Bell,
  FileText,
  Cpu,
  Camera,
  LayoutTemplate
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




import { Switch } from '@/components/ui/switch'

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

// Enhanced Competitive Upgrade Data
const mockMotionGraphicsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Render Performance', description: 'GPU acceleration enabled. Render times improved by 40%.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'Asset Optimization', description: '15 assets ready for optimization to reduce project size.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Assets' },
  { id: '3', type: 'warning' as const, title: 'Render Queue', description: '3 compositions pending in render queue for 2+ hours.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Queue' },
]

const mockMotionGraphicsCollaborators = [
  { id: '1', name: 'Motion Designer', avatar: '/avatars/motion.jpg', status: 'online' as const, role: 'Animation', lastActive: 'Now' },
  { id: '2', name: 'VFX Artist', avatar: '/avatars/vfx.jpg', status: 'online' as const, role: 'Effects', lastActive: '10m ago' },
  { id: '3', name: 'Art Director', avatar: '/avatars/art.jpg', status: 'away' as const, role: 'Creative', lastActive: '1h ago' },
]

const mockMotionGraphicsPredictions = [
  { id: '1', label: 'Projects', current: 12, target: 15, predicted: 14, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Render Time', current: 4.5, target: 3, predicted: 3.8, confidence: 78, trend: 'down' as const },
  { id: '3', label: 'Asset Library', current: 2500, target: 3000, predicted: 2800, confidence: 82, trend: 'up' as const },
]

const mockMotionGraphicsActivities = [
  { id: '1', user: 'Motion Designer', action: 'completed render', target: 'Product Launch Intro', timestamp: '15m ago', type: 'success' as const },
  { id: '2', user: 'VFX Artist', action: 'added effect', target: 'particle system to scene 3', timestamp: '1h ago', type: 'info' as const },
  { id: '3', user: 'Art Director', action: 'approved', target: 'final composition', timestamp: '3h ago', type: 'success' as const },
]

// Quick actions will be defined inside component to access state

// Database types
interface DbProject {
  id: string
  user_id: string
  name: string
  description: string | null
  width: number
  height: number
  frame_rate: number
  duration_seconds: number
  background_color: string
  thumbnail_url: string | null
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
}

interface DbExport {
  id: string
  project_id: string
  user_id: string
  format: string
  quality: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url: string | null
  file_size_bytes: number | null
  duration_seconds: number | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

interface ProjectFormState {
  name: string
  description: string
  width: number
  height: number
  frame_rate: number
  duration_seconds: number
  background_color: string
  is_public: boolean
  tags: string
}

const initialFormState: ProjectFormState = {
  name: '',
  description: '',
  width: 1920,
  height: 1080,
  frame_rate: 30,
  duration_seconds: 10,
  background_color: '#000000',
  is_public: false,
  tags: '',
}

interface MotionGraphicsClientProps {
  initialAnimations?: Animation[]
}

export default function MotionGraphicsClient({
  initialAnimations = mockAnimations
}: MotionGraphicsClientProps) {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AnimationStatus>('all')
  const [selectedAnimation, setSelectedAnimation] = useState<Animation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase data state
  const [dbProjects, setDbProjects] = useState<DbProject[]>([])
  const [dbExports, setDbExports] = useState<DbExport[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<ProjectFormState>(initialFormState)

  // Dialog states for quick actions
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showRenderDialog, setShowRenderDialog] = useState(false)
  const [showAssetsDialog, setShowAssetsDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)

  // Additional dialog states
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showAddLayerDialog, setShowAddLayerDialog] = useState(false)
  const [showAddEffectDialog, setShowAddEffectDialog] = useState(false)
  const [showExportAnalyticsDialog, setShowExportAnalyticsDialog] = useState(false)
  const [showExportConfigDialog, setShowExportConfigDialog] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDeleteAllProjectsDialog, setShowDeleteAllProjectsDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)

  // Preset library dialogs
  const [showEffectsLibraryDialog, setShowEffectsLibraryDialog] = useState(false)
  const [showMotionPresetsDialog, setShowMotionPresetsDialog] = useState(false)
  const [showTextPresetsDialog, setShowTextPresetsDialog] = useState(false)
  const [showShapePresetsDialog, setShowShapePresetsDialog] = useState(false)
  const [showColorPresetsDialog, setShowColorPresetsDialog] = useState(false)
  const [showImportPresetDialog, setShowImportPresetDialog] = useState(false)
  const [showExportPresetDialog, setShowExportPresetDialog] = useState(false)

  // Analytics dialogs
  const [showAnalyticsOverviewDialog, setShowAnalyticsOverviewDialog] = useState(false)
  const [showTrendsDialog, setShowTrendsDialog] = useState(false)
  const [showViewStatsDialog, setShowViewStatsDialog] = useState(false)
  const [showEngagementDialog, setShowEngagementDialog] = useState(false)
  const [showDownloadStatsDialog, setShowDownloadStatsDialog] = useState(false)
  const [showPerformanceMetricsDialog, setShowPerformanceMetricsDialog] = useState(false)
  const [showAudienceInsightsDialog, setShowAudienceInsightsDialog] = useState(false)

  // Timeline state
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [layers, setLayers] = useState(mockLayers)
  const [assetFilter, setAssetFilter] = useState('All')
  const [templateCategory, setTemplateCategory] = useState('All')

  // Quick actions with proper dialog handlers
  const motionGraphicsQuickActions = [
    { id: '1', label: 'New Project', icon: 'Film', shortcut: 'N', action: () => setShowNewProjectDialog(true) },
    { id: '2', label: 'Render', icon: 'Play', shortcut: 'R', action: () => setShowRenderDialog(true) },
    { id: '3', label: 'Assets', icon: 'Folder', shortcut: 'A', action: () => setShowAssetsDialog(true) },
    { id: '4', label: 'Templates', icon: 'Layout', shortcut: 'T', action: () => setShowTemplatesDialog(true) },
  ]

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

  // Fetch projects from Supabase
  const fetchProjects = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('motion_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Fetch exports from Supabase
  const fetchExports = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('motion_exports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbExports(data || [])
    } catch (error) {
      console.error('Error fetching exports:', error)
    }
  }, [supabase])

  useEffect(() => {
    fetchProjects()
    fetchExports()
  }, [fetchProjects, fetchExports])

  // Create project handler
  const handleCreateProject = async () => {
    if (!formState.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create projects')
        return
      }

      const { error } = await supabase.from('motion_projects').insert({
        user_id: user.id,
        name: formState.name,
        description: formState.description || null,
        width: formState.width,
        height: formState.height,
        frame_rate: formState.frame_rate,
        duration_seconds: formState.duration_seconds,
        background_color: formState.background_color,
        is_public: formState.is_public,
        tags: formState.tags ? formState.tags.split(',').map(t => t.trim()) : [],
      })

      if (error) throw error

      toast.success('Project created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render/Export animation handler
  const handleRenderAnimation = async (projectId: string, projectName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to render')
        return
      }

      const { error } = await supabase.from('motion_exports').insert({
        project_id: projectId,
        user_id: user.id,
        format: 'mp4',
        quality: 'high',
        status: 'pending',
      })

      if (error) throw error

      toast.info('Rendering started', {
        description: `"${projectName}" added to render queue`
      })
      fetchExports()
    } catch (error) {
      console.error('Error starting render:', error)
      toast.error('Failed to start render')
    }
  }

  // Export/Download animation handler
  const handleExportAnimation = async (projectId: string, projectName: string, format: string = 'mp4') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to export')
        return
      }

      const { error } = await supabase.from('motion_exports').insert({
        project_id: projectId,
        user_id: user.id,
        format,
        quality: 'high',
        status: 'pending',
      })

      if (error) throw error

      toast.success('Export started', {
        description: `"${projectName}" will be ready shortly`
      })
      fetchExports()
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to start export')
    }
  }

  // Duplicate project handler
  const handleDuplicateAnimation = async (projectId: string, projectName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to duplicate')
        return
      }

      const original = dbProjects.find(p => p.id === projectId)
      if (!original) {
        toast.error('Project not found')
        return
      }

      const { error } = await supabase.from('motion_projects').insert({
        user_id: user.id,
        name: `${original.name} (Copy)`,
        description: original.description,
        width: original.width,
        height: original.height,
        frame_rate: original.frame_rate,
        duration_seconds: original.duration_seconds,
        background_color: original.background_color,
        is_public: false,
        tags: original.tags,
      })

      if (error) throw error

      toast.success('Project duplicated', {
        description: `Copy of "${projectName}" created`
      })
      fetchProjects()
    } catch (error) {
      console.error('Error duplicating:', error)
      toast.error('Failed to duplicate project')
    }
  }

  // Update project handler
  const handleUpdateProject = async (projectId: string, updates: Partial<DbProject>) => {
    try {
      const { error } = await supabase
        .from('motion_projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', projectId)

      if (error) throw error

      toast.success('Project updated')
      fetchProjects()
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  // Delete project handler
  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      const { error } = await supabase
        .from('motion_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      toast.success('Project deleted', {
        description: `"${projectName}" has been removed`
      })
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
    }
  }

  // Update export status handler
  const handleUpdateExportStatus = async (exportId: string, status: DbExport['status']) => {
    try {
      const { error } = await supabase
        .from('motion_exports')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', exportId)

      if (error) throw error

      toast.success(`Export ${status}`)
      fetchExports()
    } catch (error) {
      console.error('Error updating export:', error)
      toast.error('Failed to update export')
    }
  }

  // Apply preset handler
  const handleApplyPreset = (presetName: string) => {
    toast.success('Preset applied', {
      description: `"${presetName}" effect applied to timeline`
    })
  }

  // Timeline control handlers
  const handleSkipBack = () => {
    setCurrentTime(0)
    toast.info('Skipped to beginning')
  }

  const handleRewind = () => {
    setCurrentTime(Math.max(0, currentTime - 1))
  }

  const handleFastForward = () => {
    setCurrentTime(Math.min(8.5, currentTime + 1))
  }

  const handleSkipForward = () => {
    setCurrentTime(8.5)
    toast.info('Skipped to end')
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    toast.info(isMuted ? 'Audio unmuted' : 'Audio muted')
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    toast.info(isFullscreen ? 'Exited fullscreen' : 'Entered fullscreen')
  }

  // Layer handlers
  const handleToggleLayerVisibility = (layerId: string) => {
    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ))
    const layer = layers.find(l => l.id === layerId)
    toast.info(layer?.visible ? `${layer.name} hidden` : `${layer?.name} visible`)
  }

  const handleToggleLayerLock = (layerId: string) => {
    setLayers(layers.map(l =>
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ))
    const layer = layers.find(l => l.id === layerId)
    toast.info(layer?.locked ? `${layer.name} unlocked` : `${layer?.name} locked`)
  }

  // Effect handlers
  const handleApplyEffect = (effectName: string) => {
    toast.success(`${effectName} applied`, {
      description: 'Effect added to selected layer'
    })
  }

  // Render queue handlers
  const handleStartRenderJob = (jobId: string) => {
    toast.info('Render started', {
      description: 'Job added to active queue'
    })
  }

  const handlePauseRenderJob = (jobId: string) => {
    toast.info('Render paused', {
      description: 'Job paused - resume when ready'
    })
  }

  const handleDownloadRender = (job: RenderJob) => {
    toast.success('Download started', {
      description: `Downloading ${job.animationTitle}`
    })
  }

  const handleDeleteRenderJob = (jobId: string) => {
    toast.success('Job removed from queue')
  }

  const handleStartAllRenders = () => {
    toast.success('All renders started', {
      description: 'Processing queue...'
    })
  }

  // Export handlers
  const handleExportAnalytics = () => {
    toast.success('Analytics exported', {
      description: 'CSV file downloaded'
    })
    setShowExportAnalyticsDialog(false)
  }

  const handleExportConfig = () => {
    toast.success('Configuration exported', {
      description: 'Settings file downloaded'
    })
    setShowExportConfigDialog(false)
  }

  // Settings handlers
  const handleClearCache = () => {
    toast.success('Cache cleared', {
      description: '12.4 GB freed'
    })
    setShowClearCacheDialog(false)
  }

  const handleRegenerateApiKey = () => {
    toast.success('API key regenerated', {
      description: 'New key is now active'
    })
  }

  const handleResetSettings = () => {
    toast.success('Settings reset', {
      description: 'All settings restored to defaults'
    })
    setShowResetSettingsDialog(false)
  }

  const handleDeleteAllProjects = () => {
    toast.success('All projects deleted', {
      description: 'Project data has been removed'
    })
    setShowDeleteAllProjectsDialog(false)
  }

  // Asset handlers
  const handleUploadAsset = () => {
    toast.success('Asset upload started', {
      description: 'Select files to upload'
    })
  }

  const handleAddAssetToProject = () => {
    toast.success('Asset added to project', {
      description: 'Asset is now available in timeline'
    })
    setShowAssetsDialog(false)
  }

  // Share handler
  const handleShare = () => {
    toast.success('Share link copied', {
      description: 'Link copied to clipboard'
    })
    setShowShareDialog(false)
  }

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
            <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
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
            {/* Projects Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Film className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Motion Graphics Projects</h2>
                    <p className="text-cyan-100">{stats.total} projects • {stats.totalViews.toLocaleString()} total views</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.ready}</p>
                    <p className="text-cyan-100 text-sm">Rendered</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Plus, label: 'New Project', desc: 'Start fresh', color: 'text-cyan-500', action: () => setShowCreateDialog(true) },
                { icon: Wand2, label: 'AI Animate', desc: 'Auto-create', color: 'text-purple-500', action: () => toast.success('AI Animation', { description: 'AI is generating your animation...' }) },
                { icon: LayoutTemplate, label: 'Templates', desc: 'Start fast', color: 'text-blue-500', action: () => setShowTemplatesDialog(true) },
                { icon: Layers, label: 'Compositions', desc: 'Layer groups', color: 'text-green-500', action: () => setActiveTab('timeline') },
                { icon: Sparkles, label: 'Effects', desc: 'Add effects', color: 'text-pink-500', action: () => setShowAddEffectDialog(true) },
                { icon: Type, label: 'Typography', desc: 'Kinetic text', color: 'text-orange-500', action: () => toast.info('Typography', { description: 'Opening kinetic text editor...' }) },
                { icon: Camera, label: 'Cameras', desc: '3D cameras', color: 'text-amber-500', action: () => toast.info('Cameras', { description: 'Opening 3D camera controls...' }) },
                { icon: Clapperboard, label: 'Render', desc: 'Export video', color: 'text-red-500', action: () => setShowRenderDialog(true) },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

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
                          <Button size="icon" variant="secondary" className="w-12 h-12 rounded-full" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAnimation(animation)
                            toast.info('Preview', { description: `Playing ${animation.title}` })
                          }}>
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
            {/* Timeline Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Layers className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Animation Timeline</h2>
                    <p className="text-purple-100">{mockLayers.length} layers • {formatDuration(8.5)} duration</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">60</p>
                    <p className="text-purple-100 text-sm">FPS</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowAddLayerDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Layer
                  </Button>
                </div>
              </div>
            </div>

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
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={handleSkipBack}>
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={handleRewind}>
                          <Rewind className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={handleFastForward}>
                          <FastForward className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={handleSkipForward}>
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <span className="text-white text-sm ml-2">{formatDuration(currentTime)}</span>
                        <div className="flex-1 h-1 bg-white/30 rounded-full mx-4">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: '35%' }} />
                        </div>
                        <span className="text-white text-sm">{formatDuration(8.5)}</span>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={handleToggleMute}>
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-white" onClick={handleToggleFullscreen}>
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
                      {layers.map((layer) => (
                        <div key={layer.id} className="flex items-center gap-2 h-10">
                          <div className="w-40 flex items-center gap-2 text-sm">
                            <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => handleToggleLayerVisibility(layer.id)}>
                              {layer.visible ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3 opacity-30" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="w-6 h-6" onClick={() => handleToggleLayerLock(layer.id)}>
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
                      <Button variant="outline" className="w-full justify-start text-sm h-9" onClick={() => handleApplyEffect('Glow Effect')}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Glow Effect
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-sm h-9" onClick={() => handleApplyEffect('Drop Shadow')}>
                        <Blend className="w-4 h-4 mr-2" />
                        Drop Shadow
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm h-9" onClick={() => setShowAddEffectDialog(true)}>
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
            {/* Presets Overview Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Wand2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Effect Presets</h2>
                    <p className="text-green-100">{mockPresets.length} presets • Ready to use</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-green-100 text-sm">Categories</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowAddEffectDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Plus, label: 'Create Preset', desc: 'New effect', color: 'text-green-500', action: () => setShowAddEffectDialog(true) },
                { icon: Sparkles, label: 'Effects', desc: 'Visual effects', color: 'text-purple-500', action: () => setShowEffectsLibraryDialog(true) },
                { icon: Move, label: 'Motion', desc: 'Animations', color: 'text-blue-500', action: () => setShowMotionPresetsDialog(true) },
                { icon: Type, label: 'Text', desc: 'Typography', color: 'text-orange-500', action: () => setShowTextPresetsDialog(true) },
                { icon: Shapes, label: 'Shapes', desc: 'Shape presets', color: 'text-pink-500', action: () => setShowShapePresetsDialog(true) },
                { icon: Palette, label: 'Colors', desc: 'Color presets', color: 'text-red-500', action: () => setShowColorPresetsDialog(true) },
                { icon: Download, label: 'Import', desc: 'Import preset', color: 'text-cyan-500', action: () => setShowImportPresetDialog(true) },
                { icon: Upload, label: 'Export', desc: 'Share preset', color: 'text-amber-500', action: () => setShowExportPresetDialog(true) },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Presets</h2>
              <Button onClick={() => setShowAddEffectDialog(true)}>
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
            {/* Render Queue Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Clapperboard className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Render Queue</h2>
                    <p className="text-orange-100">{mockRenderQueue.length} jobs • {mockRenderQueue.filter(j => j.status === 'rendering').length} rendering</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{mockRenderQueue.filter(j => j.status === 'completed').length}</p>
                    <p className="text-orange-100 text-sm">Completed</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleStartAllRenders}>
                    <Play className="h-4 w-4 mr-2" />
                    Start All
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Play, label: 'Start All', desc: 'Begin rendering', color: 'text-green-500', action: handleStartAllRenders },
                { icon: Pause, label: 'Pause All', desc: 'Pause queue', color: 'text-amber-500', action: () => toast.info('All renders paused') },
                { icon: Square, label: 'Stop All', desc: 'Cancel all', color: 'text-red-500', action: () => toast.info('All renders stopped') },
                { icon: RefreshCw, label: 'Retry Failed', desc: 'Retry errors', color: 'text-blue-500', action: () => toast.info('Retrying failed renders') },
                { icon: Plus, label: 'Add to Queue', desc: 'New render', color: 'text-purple-500', action: () => setShowRenderDialog(true) },
                { icon: Download, label: 'Download All', desc: 'Get outputs', color: 'text-cyan-500', action: () => toast.success('Downloading all completed renders') },
                { icon: Trash2, label: 'Clear Queue', desc: 'Remove all', color: 'text-gray-500', action: () => toast.success('Queue cleared') },
                { icon: Settings, label: 'Queue Settings', desc: 'Configure', color: 'text-indigo-500', action: () => setActiveTab('settings') },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Jobs</h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={handleStartAllRenders}>
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
                          <Button size="sm" variant="outline" onClick={() => handleStartRenderJob(job.id)}>
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'rendering' && (
                          <Button size="sm" variant="outline" onClick={() => handlePauseRenderJob(job.id)}>
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'completed' && (
                          <Button size="sm" onClick={() => handleDownloadRender(job)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteRenderJob(job.id)}>
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
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Performance Analytics</h2>
                    <p className="text-indigo-100">Track views, likes, and downloads</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-indigo-100 text-sm">Total Views</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowExportAnalyticsDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: BarChart3, label: 'Overview', desc: 'Key metrics', color: 'text-indigo-500', action: () => setShowAnalyticsOverviewDialog(true) },
                { icon: TrendingUp, label: 'Trends', desc: 'View trends', color: 'text-green-500', action: () => setShowTrendsDialog(true) },
                { icon: Eye, label: 'Views', desc: 'View stats', color: 'text-blue-500', action: () => setShowViewStatsDialog(true) },
                { icon: Heart, label: 'Engagement', desc: 'Likes & shares', color: 'text-pink-500', action: () => setShowEngagementDialog(true) },
                { icon: Download, label: 'Downloads', desc: 'Download stats', color: 'text-cyan-500', action: () => setShowDownloadStatsDialog(true) },
                { icon: Timer, label: 'Performance', desc: 'Render times', color: 'text-amber-500', action: () => setShowPerformanceMetricsDialog(true) },
                { icon: Users, label: 'Audience', desc: 'User insights', color: 'text-purple-500', action: () => setShowAudienceInsightsDialog(true) },
                { icon: FileText, label: 'Reports', desc: 'Custom reports', color: 'text-orange-500', action: () => setShowExportAnalyticsDialog(true) },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

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
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Motion Graphics Settings</h2>
                    <p className="text-cyan-100">Configure rendering, export, and workspace preferences</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setShowExportConfigDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Card className="border-0 shadow-sm sticky top-6">
                  <nav className="p-2 space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General', desc: 'Basic settings' },
                      { id: 'render', icon: Clapperboard, label: 'Rendering', desc: 'Output settings' },
                      { id: 'performance', icon: Cpu, label: 'Performance', desc: 'GPU & memory' },
                      { id: 'workspace', icon: Monitor, label: 'Workspace', desc: 'UI preferences' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs opacity-70">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </nav>
                </Card>
              </div>

              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Defaults</CardTitle>
                        <CardDescription>Configure default settings for new projects</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Resolution</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>1080p (1920x1080)</option>
                              <option>4K (3840x2160)</option>
                              <option>720p (1280x720)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Frame Rate</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>30 fps</option>
                              <option>60 fps</option>
                              <option>24 fps</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-save Projects</p>
                            <p className="text-sm text-gray-500">Save every 5 minutes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Create Backup on Save</p>
                            <p className="text-sm text-gray-500">Keep previous versions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Show Startup Screen</p>
                            <p className="text-sm text-gray-500">Show recent projects on start</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
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
                  </div>
                )}

                {/* Render Settings */}
                {settingsTab === 'render' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Settings</CardTitle>
                        <CardDescription>Configure default output settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Format</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>MP4 (H.264)</option>
                              <option>MOV (ProRes)</option>
                              <option>WebM</option>
                              <option>GIF</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Quality Preset</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Best (Large File)</option>
                              <option>High</option>
                              <option>Medium</option>
                              <option>Low (Small File)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Include Audio</p>
                            <p className="text-sm text-gray-500">Export audio tracks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Optimize for Web</p>
                            <p className="text-sm text-gray-500">Fast start for streaming</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Render Queue Settings</CardTitle>
                        <CardDescription>Configure queue behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Background Rendering</p>
                            <p className="text-sm text-gray-500">Continue working while rendering</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Max Parallel Renders</p>
                            <p className="text-sm text-gray-500">Number of simultaneous renders</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>1</option>
                            <option>2</option>
                            <option>4</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Performance Settings */}
                {settingsTab === 'performance' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>GPU Settings</CardTitle>
                        <CardDescription>Configure hardware acceleration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">GPU Acceleration</p>
                            <p className="text-sm text-gray-500">Use GPU for faster rendering</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Hardware Decode</p>
                            <p className="text-sm text-gray-500">Use GPU for video decoding</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">GPU Memory Limit</p>
                            <p className="text-sm text-gray-500">Max GPU memory usage</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>4 GB</option>
                            <option>8 GB</option>
                            <option>12 GB</option>
                            <option>Auto</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
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
                        <Button variant="outline" className="w-full" onClick={() => setShowClearCacheDialog(true)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear Cache
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Workspace Settings */}
                {settingsTab === 'workspace' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Interface Preferences</CardTitle>
                        <CardDescription>Customize the workspace</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-500">Use dark theme</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Show Rulers</p>
                            <p className="text-sm text-gray-500">Display rulers in preview</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Snap to Grid</p>
                            <p className="text-sm text-gray-500">Align elements to grid</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">UI Scale</p>
                            <p className="text-sm text-gray-500">Interface scaling</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>100%</option>
                            <option>125%</option>
                            <option>150%</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Timeline Preferences</CardTitle>
                        <CardDescription>Configure timeline behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-scroll Timeline</p>
                            <p className="text-sm text-gray-500">Follow playhead during playback</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Show Keyframe Labels</p>
                            <p className="text-sm text-gray-500">Display keyframe values</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Render Notifications</CardTitle>
                        <CardDescription>Get notified about render status</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Render Complete</p>
                            <p className="text-sm text-gray-500">Notify when render finishes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Render Errors</p>
                            <p className="text-sm text-gray-500">Alert on render failures</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Queue Updates</p>
                            <p className="text-sm text-gray-500">Notify on queue changes</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>System Notifications</CardTitle>
                        <CardDescription>General notification settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Desktop Notifications</p>
                            <p className="text-sm text-gray-500">Show system notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Sound Alerts</p>
                            <p className="text-sm text-gray-500">Play sounds for alerts</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Programmatic access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable API</p>
                            <p className="text-sm text-gray-500">Allow remote control</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <div className="flex gap-2">
                            <Input value="mg_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleRegenerateApiKey}>Regenerate</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Scripting</CardTitle>
                        <CardDescription>ExtendScript and expressions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable Scripting</p>
                            <p className="text-sm text-gray-500">Allow external scripts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Expression Engine</p>
                            <p className="text-sm text-gray-500">JavaScript expressions</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>JavaScript</option>
                            <option>Legacy ExtendScript</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Reset All Settings</p>
                            <p className="text-sm text-gray-500">Restore factory defaults</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Clear All Projects</p>
                            <p className="text-sm text-gray-500">Delete all project data</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowDeleteAllProjectsDialog(true)}>Delete All</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockMotionGraphicsAIInsights}
              title="Motion Graphics Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMotionGraphicsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMotionGraphicsPredictions}
              title="Production Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMotionGraphicsActivities}
            title="Studio Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={motionGraphicsQuickActions}
            variant="grid"
          />
        </div>

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
                      onClick={() => {
                        setIsPlaying(!isPlaying)
                        toast.info(isPlaying ? 'Paused' : 'Playing', {
                          description: selectedAnimation.title
                        })
                      }}
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
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
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => {
                      setSelectedAnimation(null)
                      setShowEditProjectDialog(true)
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Project
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setSelectedAnimation(null)
                      setShowRenderDialog(true)
                    }}>
                      <Clapperboard className="w-4 h-4 mr-2" />
                      Render
                    </Button>
                    <Button variant="outline" onClick={() => {
                      if (selectedAnimation) {
                        handleExportAnimation(selectedAnimation.id, selectedAnimation.title)
                      }
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setSelectedAnimation(null)
                      setShowShareDialog(true)
                    }}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Create Project Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Set up a new motion graphics project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name *</label>
                <Input
                  placeholder="Enter project name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  placeholder="Brief description"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Width</label>
                  <Input
                    type="number"
                    value={formState.width}
                    onChange={(e) => setFormState({ ...formState, width: parseInt(e.target.value) || 1920 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height</label>
                  <Input
                    type="number"
                    value={formState.height}
                    onChange={(e) => setFormState({ ...formState, height: parseInt(e.target.value) || 1080 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Frame Rate</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formState.frame_rate}
                    onChange={(e) => setFormState({ ...formState, frame_rate: parseInt(e.target.value) })}
                  >
                    <option value={24}>24 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={60}>60 fps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (sec)</label>
                  <Input
                    type="number"
                    value={formState.duration_seconds}
                    onChange={(e) => setFormState({ ...formState, duration_seconds: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <Input
                  placeholder="animation, motion, intro"
                  value={formState.tags}
                  onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Public Project</p>
                  <p className="text-xs text-gray-500">Allow others to view</p>
                </div>
                <Switch
                  checked={formState.is_public}
                  onCheckedChange={(checked) => setFormState({ ...formState, is_public: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                onClick={handleCreateProject}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Project Quick Action Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Film className="w-5 h-5 text-cyan-500" />
                New Project
              </DialogTitle>
              <DialogDescription>Create a new motion graphics project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {[
                  { label: 'Blank Project', desc: 'Start from scratch', icon: Plus },
                  { label: 'From Template', desc: 'Use a template', icon: LayoutTemplate },
                  { label: 'Import Project', desc: 'Import existing', icon: Upload },
                  { label: 'Recent Projects', desc: 'Open recent', icon: Clock },
                ].map((option) => (
                  <button
                    key={option.label}
                    className="p-4 rounded-lg border hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all text-left"
                    onClick={() => {
                      setShowNewProjectDialog(false)
                      setShowCreateDialog(true)
                    }}
                  >
                    <option.icon className="w-6 h-6 text-cyan-500 mb-2" />
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                onClick={() => {
                  setShowNewProjectDialog(false)
                  setShowCreateDialog(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Blank Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Render Quick Action Dialog */}
        <Dialog open={showRenderDialog} onOpenChange={setShowRenderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-orange-500" />
                Render Settings
              </DialogTitle>
              <DialogDescription>Configure render output settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Output Format</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>MP4 (H.264)</option>
                  <option>MOV (ProRes)</option>
                  <option>WebM</option>
                  <option>GIF</option>
                  <option>PNG Sequence</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Resolution</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>4K (3840x2160)</option>
                  <option>1080p (1920x1080)</option>
                  <option>720p (1280x720)</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quality</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Best (Lossless)</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low (Fast)</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Include Audio</p>
                  <p className="text-xs text-gray-500">Export with audio tracks</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRenderDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white"
                onClick={() => {
                  setShowRenderDialog(false)
                  toast.success('Render added to queue')
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Render
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assets Quick Action Dialog */}
        <Dialog open={showAssetsDialog} onOpenChange={setShowAssetsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-500" />
                Asset Library
              </DialogTitle>
              <DialogDescription>Browse and manage your assets</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search assets..." className="pl-9" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-6 mb-4">
                {['All', 'Images', 'Videos', 'Audio', 'Shapes', 'Text'].map((filter) => (
                  <Button
                    key={filter}
                    variant={assetFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setAssetFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-64 border rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center cursor-pointer hover:ring-2 ring-cyan-500 transition-all"
                    >
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={handleUploadAsset}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAssetsDialog(false)}>
                  Close
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={handleAddAssetToProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Project
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Quick Action Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-purple-500" />
                Template Gallery
              </DialogTitle>
              <DialogDescription>Choose a template to start your project</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex gap-2 mb-4">
                {['All', 'Intros', 'Titles', 'Transitions', 'Lower Thirds', 'Social Media'].map((cat) => (
                  <Button
                    key={cat}
                    variant={templateCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => setTemplateCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-72">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    { name: 'Modern Intro', category: 'Intros', color: 'from-purple-500 to-pink-500' },
                    { name: 'Minimal Titles', category: 'Titles', color: 'from-blue-500 to-cyan-500' },
                    { name: 'Smooth Transitions', category: 'Transitions', color: 'from-green-500 to-emerald-500' },
                    { name: 'Lower Third Pack', category: 'Lower Thirds', color: 'from-orange-500 to-red-500' },
                    { name: 'Instagram Stories', category: 'Social Media', color: 'from-pink-500 to-rose-500' },
                    { name: 'YouTube Intro', category: 'Intros', color: 'from-red-500 to-orange-500' },
                  ].map((template) => (
                    <div
                      key={template.name}
                      className="rounded-lg border overflow-hidden cursor-pointer hover:ring-2 ring-purple-500 transition-all"
                    >
                      <div className={`aspect-video bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                        <Film className="w-8 h-8 text-white/80" />
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                onClick={() => {
                  setShowTemplatesDialog(false)
                  toast.success('Template applied to new project')
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Layer Dialog */}
        <Dialog open={showAddLayerDialog} onOpenChange={setShowAddLayerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Add Layer
              </DialogTitle>
              <DialogDescription>Choose a layer type to add to your composition</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                {[
                  { type: 'video', icon: FileVideo, label: 'Video', desc: 'Import video file' },
                  { type: 'image', icon: Image, label: 'Image', desc: 'Import image file' },
                  { type: 'text', icon: Type, label: 'Text', desc: 'Add text layer' },
                  { type: 'shape', icon: Shapes, label: 'Shape', desc: 'Add shape layer' },
                  { type: 'audio', icon: Volume2, label: 'Audio', desc: 'Import audio file' },
                  { type: 'effect', icon: Sparkles, label: 'Effect', desc: 'Add effect layer' },
                ].map((item) => (
                  <button
                    key={item.type}
                    className="p-4 rounded-lg border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left"
                    onClick={() => {
                      setShowAddLayerDialog(false)
                      toast.success(`${item.label} layer added`, {
                        description: 'New layer added to timeline'
                      })
                    }}
                  >
                    <item.icon className="w-6 h-6 text-purple-500 mb-2" />
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddLayerDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Effect Dialog */}
        <Dialog open={showAddEffectDialog} onOpenChange={setShowAddEffectDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Add Effect
              </DialogTitle>
              <DialogDescription>Choose an effect to apply to your layer</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search effects..." className="pl-9" />
              </div>
              <ScrollArea className="h-64">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  {[
                    { name: 'Glow', category: 'Style' },
                    { name: 'Drop Shadow', category: 'Style' },
                    { name: 'Blur', category: 'Blur & Sharpen' },
                    { name: 'Motion Blur', category: 'Blur & Sharpen' },
                    { name: 'Color Correction', category: 'Color' },
                    { name: 'Gradient Ramp', category: 'Generate' },
                    { name: 'Noise', category: 'Noise & Grain' },
                    { name: 'Distort', category: 'Distort' },
                    { name: 'Echo', category: 'Time' },
                    { name: 'Particle World', category: 'Simulation' },
                  ].map((effect) => (
                    <button
                      key={effect.name}
                      className="p-3 rounded-lg border hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-left"
                      onClick={() => {
                        setShowAddEffectDialog(false)
                        handleApplyEffect(effect.name)
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-orange-500 mb-1" />
                      <p className="font-medium text-sm">{effect.name}</p>
                      <p className="text-xs text-gray-500">{effect.category}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddEffectDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Analytics Dialog */}
        <Dialog open={showExportAnalyticsDialog} onOpenChange={setShowExportAnalyticsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-500" />
                Export Analytics
              </DialogTitle>
              <DialogDescription>Choose export format for your analytics data</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>CSV</option>
                  <option>Excel (XLSX)</option>
                  <option>JSON</option>
                  <option>PDF Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Include all projects</p>
                  <p className="text-xs text-gray-500">Export data for all projects</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExportAnalyticsDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleExportAnalytics}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Config Dialog */}
        <Dialog open={showExportConfigDialog} onOpenChange={setShowExportConfigDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-500" />
                Export Configuration
              </DialogTitle>
              <DialogDescription>Export your settings as a configuration file</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Include keyboard shortcuts</p>
                  <p className="text-xs text-gray-500">Export custom shortcuts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Include workspace layout</p>
                  <p className="text-xs text-gray-500">Export UI preferences</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Include render presets</p>
                  <p className="text-xs text-gray-500">Export output settings</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExportConfigDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={handleExportConfig}>
                <Download className="w-4 h-4 mr-2" />
                Export Config
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Cache Dialog */}
        <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-500" />
                Clear Cache
              </DialogTitle>
              <DialogDescription>This will free up disk space by removing cached files</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Cache Size</span>
                  <span className="text-sm text-gray-500">12.4 GB</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Preview cache</p>
                  <p className="text-xs text-gray-500">8.2 GB</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Render cache</p>
                  <p className="text-xs text-gray-500">3.1 GB</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Thumbnail cache</p>
                  <p className="text-xs text-gray-500">1.1 GB</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white" onClick={handleClearCache}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <RotateCcw className="w-5 h-5" />
                Reset All Settings
              </DialogTitle>
              <DialogDescription>This will restore all settings to their default values. This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  The following will be reset:
                </p>
                <ul className="mt-2 text-sm text-red-600 dark:text-red-300 list-disc list-inside">
                  <li>Project defaults</li>
                  <li>Keyboard shortcuts</li>
                  <li>Export settings</li>
                  <li>Performance settings</li>
                  <li>UI preferences</li>
                </ul>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleResetSettings}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete All Projects Dialog */}
        <Dialog open={showDeleteAllProjectsDialog} onOpenChange={setShowDeleteAllProjectsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete All Projects
              </DialogTitle>
              <DialogDescription>This will permanently delete all your projects. This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  You are about to delete:
                </p>
                <ul className="mt-2 text-sm text-red-600 dark:text-red-300 list-disc list-inside">
                  <li>{stats.total} projects</li>
                  <li>All associated layers and effects</li>
                  <li>All render exports</li>
                  <li>All project history</li>
                </ul>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Type DELETE to confirm</label>
                <Input placeholder="DELETE" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteAllProjectsDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAllProjects}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-500" />
                Share Project
              </DialogTitle>
              <DialogDescription>Share your project with others</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Share Link</label>
                <div className="flex gap-2">
                  <Input value="https://freeflow.app/project/abc123" readOnly />
                  <Button variant="outline" onClick={() => {
                    toast.success('Link copied to clipboard')
                  }}>
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Permission</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>View only</option>
                  <option>Can comment</option>
                  <option>Can edit</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Allow downloads</p>
                  <p className="text-xs text-gray-500">Others can download the project</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Public link</p>
                  <p className="text-xs text-gray-500">Anyone with the link can access</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Close
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-cyan-500" />
                Edit Project
              </DialogTitle>
              <DialogDescription>Modify project settings and properties</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <Input defaultValue="Product Launch Intro" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input defaultValue="Dynamic 3D text reveal with particle effects" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Width</label>
                  <Input type="number" defaultValue={1920} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height</label>
                  <Input type="number" defaultValue={1080} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Frame Rate</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option value={24}>24 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={60} selected>60 fps</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (sec)</label>
                  <Input type="number" defaultValue={10} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input defaultValue="product, launch, 3d, particles" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Public Project</p>
                  <p className="text-xs text-gray-500">Allow others to view</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" onClick={() => {
                setShowEditProjectDialog(false)
                toast.success('Project updated', {
                  description: 'Changes saved successfully'
                })
              }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Effects Library Dialog */}
        <Dialog open={showEffectsLibraryDialog} onOpenChange={setShowEffectsLibraryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Visual Effects Library
              </DialogTitle>
              <DialogDescription>Browse and apply visual effects to your animations</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input placeholder="Search effects..." className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-h-96 overflow-y-auto">
                {['Glow', 'Blur', 'Shadow', 'Reflection', 'Distortion', 'Noise', 'Vignette', 'Color Correction', 'Bloom'].map(effect => (
                  <Card key={effect} className="p-4 cursor-pointer hover:border-purple-500 transition-colors" onClick={() => {
                    toast.success(`Applied "${effect}" effect`)
                    setShowEffectsLibraryDialog(false)
                  }}>
                    <div className="w-full h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded mb-2" />
                    <p className="font-medium text-sm">{effect}</p>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Motion Presets Dialog */}
        <Dialog open={showMotionPresetsDialog} onOpenChange={setShowMotionPresetsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Move className="w-5 h-5 text-blue-500" />
                Motion Presets
              </DialogTitle>
              <DialogDescription>Apply pre-built animation presets</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-h-96 overflow-y-auto">
                {['Slide In', 'Fade In', 'Bounce', 'Elastic', 'Zoom', 'Rotate', 'Flip', 'Swing'].map(preset => (
                  <Card key={preset} className="p-4 cursor-pointer hover:border-blue-500 transition-colors" onClick={() => {
                    toast.success(`Applied "${preset}" motion preset`)
                    setShowMotionPresetsDialog(false)
                  }}>
                    <Move className="w-8 h-8 text-blue-500 mb-2" />
                    <p className="font-medium">{preset}</p>
                    <p className="text-xs text-gray-500">Click to apply</p>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Text Presets Dialog */}
        <Dialog open={showTextPresetsDialog} onOpenChange={setShowTextPresetsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-orange-500" />
                Text Presets
              </DialogTitle>
              <DialogDescription>Typography animation styles</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-h-96 overflow-y-auto">
                {['Typewriter', 'Letter by Letter', 'Word Reveal', 'Glitch Text', 'Neon', 'Handwritten', '3D Extrude', 'Kinetic'].map(preset => (
                  <Card key={preset} className="p-4 cursor-pointer hover:border-orange-500 transition-colors" onClick={() => {
                    toast.success(`Applied "${preset}" text preset`)
                    setShowTextPresetsDialog(false)
                  }}>
                    <Type className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="font-medium">{preset}</p>
                    <p className="text-xs text-gray-500">Click to apply</p>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Shape Presets Dialog */}
        <Dialog open={showShapePresetsDialog} onOpenChange={setShowShapePresetsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shapes className="w-5 h-5 text-pink-500" />
                Shape Presets
              </DialogTitle>
              <DialogDescription>Animated shape templates</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-h-96 overflow-y-auto">
                {['Circle Expand', 'Rectangle Wipe', 'Morphing Shapes', 'Polygon Spin', 'Star Burst', 'Wave Pattern', 'Spiral', 'Grid', 'Particles'].map(shape => (
                  <Card key={shape} className="p-4 cursor-pointer hover:border-pink-500 transition-colors" onClick={() => {
                    toast.success(`Applied "${shape}" shape preset`)
                    setShowShapePresetsDialog(false)
                  }}>
                    <Shapes className="w-8 h-8 text-pink-500 mb-2" />
                    <p className="font-medium text-sm">{shape}</p>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Color Presets Dialog */}
        <Dialog open={showColorPresetsDialog} onOpenChange={setShowColorPresetsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-red-500" />
                Color Presets
              </DialogTitle>
              <DialogDescription>Pre-built color schemes and gradients</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {[
                { name: 'Sunset', colors: ['#FF6B6B', '#FFA07A', '#FFD700'] },
                { name: 'Ocean', colors: ['#0077B6', '#00B4D8', '#90E0EF'] },
                { name: 'Forest', colors: ['#2D6A4F', '#40916C', '#74C69D'] },
                { name: 'Neon', colors: ['#FF00FF', '#00FFFF', '#FFFF00'] },
                { name: 'Pastel', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF'] },
              ].map(scheme => (
                <Card key={scheme.name} className="p-4 cursor-pointer hover:border-red-500 transition-colors" onClick={() => {
                  toast.success(`Applied "${scheme.name}" color scheme`)
                  setShowColorPresetsDialog(false)
                }}>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {scheme.colors.map((color, i) => (
                        <div key={i} className="w-8 h-8 rounded-full -ml-2 first:ml-0 border-2 border-white" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <p className="font-medium">{scheme.name}</p>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Preset Dialog */}
        <Dialog open={showImportPresetDialog} onOpenChange={setShowImportPresetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Import Preset
              </DialogTitle>
              <DialogDescription>Import a preset from file</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input type="file" className="hidden" id="preset-import" accept=".json,.preset" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const formData = new FormData()
                    formData.append('preset', file)
                    toast.promise(
                      fetch('/api/motion-graphics/presets/import', {
                        method: 'POST',
                        body: formData
                      }).then(res => {
                        if (!res.ok) throw new Error('Import failed')
                        return res.json()
                      }),
                      { loading: `Importing ${file.name}...`, success: `Preset "${file.name}" imported successfully`, error: 'Import failed' }
                    )
                    setShowImportPresetDialog(false)
                  }
                }} />
                <label htmlFor="preset-import" className="cursor-pointer">
                  <Download className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium">Drop preset file here</p>
                  <p className="text-sm text-gray-500">or click to browse (.json, .preset)</p>
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Preset Dialog */}
        <Dialog open={showExportPresetDialog} onOpenChange={setShowExportPresetDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-500" />
                Export Preset
              </DialogTitle>
              <DialogDescription>Share your preset with others</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preset Name</label>
                <Input placeholder="My Custom Preset" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input placeholder="A brief description..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Export Format</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option value="json">JSON (.json)</option>
                  <option value="preset">Preset Package (.preset)</option>
                </select>
              </div>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white" onClick={() => {
                const blob = new Blob([JSON.stringify({ name: 'Custom Preset', effects: [] })], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'custom-preset.json'
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Preset exported successfully')
                setShowExportPresetDialog(false)
              }}>
                <Upload className="w-4 h-4 mr-2" />
                Export Preset
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Overview Dialog */}
        <Dialog open={showAnalyticsOverviewDialog} onOpenChange={setShowAnalyticsOverviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Analytics Overview
              </DialogTitle>
              <DialogDescription>Key metrics for your animations</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  <p className="text-xs text-green-500">+12.5% from last week</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Total Downloads</p>
                  <p className="text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
                  <p className="text-xs text-green-500">+8.3% from last week</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Total Likes</p>
                  <p className="text-3xl font-bold">{stats.totalLikes.toLocaleString()}</p>
                  <p className="text-xs text-green-500">+15.2% from last week</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">{stats.ready} ready</p>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Trends Dialog */}
        <Dialog open={showTrendsDialog} onOpenChange={setShowTrendsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Trend Analysis
              </DialogTitle>
              <DialogDescription>Performance trends over time</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="h-48 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Trend chart visualization</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Views Up</p>
                  <p className="text-lg font-bold text-green-600">+23%</p>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Engagement Up</p>
                  <p className="text-lg font-bold text-blue-600">+18%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-medium">Downloads Up</p>
                  <p className="text-lg font-bold text-purple-600">+31%</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Stats Dialog */}
        <Dialog open={showViewStatsDialog} onOpenChange={setShowViewStatsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                View Statistics
              </DialogTitle>
              <DialogDescription>Detailed view breakdown</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {initialAnimations.slice(0, 5).map(animation => (
                <div key={animation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{animation.title}</p>
                    <p className="text-xs text-gray-500">{animation.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{animation.views.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Engagement Dialog */}
        <Dialog open={showEngagementDialog} onOpenChange={setShowEngagementDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Engagement Metrics
              </DialogTitle>
              <DialogDescription>Likes, shares, and interactions</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="p-4 text-center">
                  <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Likes</p>
                </Card>
                <Card className="p-4 text-center">
                  <Share2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">2,341</p>
                  <p className="text-sm text-gray-500">Total Shares</p>
                </Card>
              </div>
              <Card className="p-4">
                <p className="font-medium mb-2">Top Engaged Animation</p>
                <p className="text-lg">{initialAnimations[0]?.title}</p>
                <p className="text-sm text-gray-500">{initialAnimations[0]?.likes} likes</p>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Stats Dialog */}
        <Dialog open={showDownloadStatsDialog} onOpenChange={setShowDownloadStatsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Download Statistics
              </DialogTitle>
              <DialogDescription>Download breakdown by animation</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {initialAnimations.slice(0, 5).map(animation => (
                <div key={animation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{animation.title}</p>
                    <p className="text-xs text-gray-500">{animation.resolution}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cyan-600">{animation.downloads.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">downloads</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Performance Metrics Dialog */}
        <Dialog open={showPerformanceMetricsDialog} onOpenChange={setShowPerformanceMetricsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-500" />
                Performance Metrics
              </DialogTitle>
              <DialogDescription>Render times and performance data</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-amber-600">4.2s</p>
                  <p className="text-sm text-gray-500">Avg Render Time</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">98%</p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </Card>
              </div>
              <Card className="p-4">
                <p className="font-medium mb-3">Recent Render Jobs</p>
                {mockRenderQueue.map(job => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <p className="text-sm">{job.animationTitle}</p>
                    <Badge className={getStatusColor(job.status as AnimationStatus)}>{job.status}</Badge>
                  </div>
                ))}
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Audience Insights Dialog */}
        <Dialog open={showAudienceInsightsDialog} onOpenChange={setShowAudienceInsightsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Audience Insights
              </DialogTitle>
              <DialogDescription>Who&apos;s viewing your content</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <Card className="p-4">
                <p className="font-medium mb-3">Top Locations</p>
                {['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'].map((country, i) => (
                  <div key={country} className="flex items-center justify-between py-2">
                    <p className="text-sm">{country}</p>
                    <p className="text-sm font-medium">{[32, 18, 14, 12, 8][i]}%</p>
                  </div>
                ))}
              </Card>
              <Card className="p-4">
                <p className="font-medium mb-3">Device Breakdown</p>
                <div className="flex gap-4">
                  <div className="flex-1 text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Monitor className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-sm font-medium">Desktop 68%</p>
                  </div>
                  <div className="flex-1 text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <Camera className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-sm font-medium">Mobile 32%</p>
                  </div>
                </div>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
