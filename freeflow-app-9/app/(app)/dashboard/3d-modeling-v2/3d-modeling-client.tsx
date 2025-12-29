'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Box,
  Layers,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Grid3X3,
  Eye,
  EyeOff,
  Palette,
  Image,
  Lightbulb,
  Camera,
  Move,
  Scale,
  RotateCw,
  Crosshair,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Cylinder,
  Cone,
  Globe,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Save,
  FolderOpen,
  Copy,
  Trash2,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Folder,
  File,
  Search,
  Filter,
  Clock,
  Cpu,
  HardDrive,
  Monitor,
  Sliders,
  Sun,
  Moon,
  Cloud,
  Sparkles,
  Wand2,
  Brush,
  Eraser,
  PenTool,
  MousePointer,
  Hand,
  Scissors,
  Merge,
  Split,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Share2,
  Users,
  MessageSquare,
  Video,
  Film,
  Clapperboard,
  Timer,
  Activity,
  BarChart3,
  TrendingUp,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bell,
  Key,
  Webhook,
  Shield,
  AlertOctagon,
  Link2,
  Database,
  Zap,
  Code,
  Archive,
  Keyboard,
  Mouse,
  Gamepad2
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Types
type ModelStatus = 'draft' | 'published' | 'rendering' | 'archived'
type RenderQuality = 'preview' | 'low' | 'medium' | 'high' | 'ultra'
type FileFormat = 'OBJ' | 'FBX' | 'GLTF' | 'STL' | 'BLEND' | '3DS' | 'DAE'
type ToolType = 'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'cut' | 'merge'

interface Model3D {
  id: string
  name: string
  description: string
  status: ModelStatus
  format: FileFormat
  polygon_count: number
  vertex_count: number
  texture_count: number
  material_count: number
  file_size_mb: number
  render_quality: RenderQuality
  last_render_time_sec: number
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  is_public: boolean
  downloads: number
  views: number
  tags: string[]
  scene_id: string | null
}

interface Material {
  id: string
  name: string
  type: 'pbr' | 'basic' | 'toon' | 'glass' | 'metal' | 'fabric' | 'skin'
  color: string
  roughness: number
  metalness: number
  opacity: number
  thumbnail: string | null
  is_custom: boolean
}

interface Texture {
  id: string
  name: string
  type: 'diffuse' | 'normal' | 'roughness' | 'metalness' | 'ao' | 'height' | 'emission'
  resolution: string
  format: 'png' | 'jpg' | 'exr' | 'hdr'
  size_mb: number
  thumbnail: string | null
}

interface RenderJob {
  id: string
  model_id: string
  model_name: string
  quality: RenderQuality
  status: 'queued' | 'rendering' | 'completed' | 'failed'
  progress: number
  started_at: string | null
  completed_at: string | null
  estimated_time_sec: number
  output_format: 'png' | 'jpg' | 'exr'
  resolution: string
}

interface SceneObject {
  id: string
  name: string
  type: 'mesh' | 'light' | 'camera' | 'empty' | 'group'
  visible: boolean
  locked: boolean
  children: SceneObject[]
  expanded?: boolean
}

// Mock data
const mockModels: Model3D[] = [
  {
    id: '1',
    name: 'Product Showcase Stand',
    description: 'Modern minimalist product display stand with adjustable height',
    status: 'published',
    format: 'GLTF',
    polygon_count: 12450,
    vertex_count: 8320,
    texture_count: 4,
    material_count: 3,
    file_size_mb: 24.5,
    render_quality: 'high',
    last_render_time_sec: 45,
    thumbnail_url: null,
    created_at: '2024-01-10',
    updated_at: '2024-01-14',
    is_public: true,
    downloads: 234,
    views: 1250,
    tags: ['product', 'display', 'minimal'],
    scene_id: 'scene-1'
  },
  {
    id: '2',
    name: 'Character Rig - Warrior',
    description: 'Fully rigged warrior character with 120 bone skeleton',
    status: 'draft',
    format: 'FBX',
    polygon_count: 45600,
    vertex_count: 32100,
    texture_count: 8,
    material_count: 6,
    file_size_mb: 156.2,
    render_quality: 'ultra',
    last_render_time_sec: 180,
    thumbnail_url: null,
    created_at: '2024-01-08',
    updated_at: '2024-01-15',
    is_public: false,
    downloads: 0,
    views: 45,
    tags: ['character', 'rigged', 'warrior', 'game'],
    scene_id: 'scene-2'
  },
  {
    id: '3',
    name: 'Modern Villa Exterior',
    description: 'Architectural visualization of contemporary villa',
    status: 'rendering',
    format: 'OBJ',
    polygon_count: 89500,
    vertex_count: 67200,
    texture_count: 24,
    material_count: 18,
    file_size_mb: 345.8,
    render_quality: 'ultra',
    last_render_time_sec: 0,
    thumbnail_url: null,
    created_at: '2024-01-05',
    updated_at: '2024-01-15',
    is_public: false,
    downloads: 0,
    views: 12,
    tags: ['architecture', 'villa', 'exterior', 'modern'],
    scene_id: 'scene-3'
  },
  {
    id: '4',
    name: 'Sci-Fi Vehicle Concept',
    description: 'Futuristic hover vehicle for game asset',
    status: 'published',
    format: 'BLEND',
    polygon_count: 28900,
    vertex_count: 21400,
    texture_count: 6,
    material_count: 5,
    file_size_mb: 78.4,
    render_quality: 'high',
    last_render_time_sec: 92,
    thumbnail_url: null,
    created_at: '2024-01-02',
    updated_at: '2024-01-12',
    is_public: true,
    downloads: 567,
    views: 2340,
    tags: ['vehicle', 'sci-fi', 'game', 'concept'],
    scene_id: null
  }
]

const mockMaterials: Material[] = [
  { id: '1', name: 'Brushed Aluminum', type: 'metal', color: '#C0C0C0', roughness: 0.4, metalness: 1.0, opacity: 1.0, thumbnail: null, is_custom: false },
  { id: '2', name: 'Red Plastic', type: 'basic', color: '#E53935', roughness: 0.6, metalness: 0.0, opacity: 1.0, thumbnail: null, is_custom: false },
  { id: '3', name: 'Clear Glass', type: 'glass', color: '#FFFFFF', roughness: 0.0, metalness: 0.0, opacity: 0.2, thumbnail: null, is_custom: false },
  { id: '4', name: 'Oak Wood', type: 'pbr', color: '#8B4513', roughness: 0.7, metalness: 0.0, opacity: 1.0, thumbnail: null, is_custom: true },
  { id: '5', name: 'Gold', type: 'metal', color: '#FFD700', roughness: 0.2, metalness: 1.0, opacity: 1.0, thumbnail: null, is_custom: false },
  { id: '6', name: 'Concrete', type: 'pbr', color: '#808080', roughness: 0.9, metalness: 0.0, opacity: 1.0, thumbnail: null, is_custom: false },
  { id: '7', name: 'Leather', type: 'fabric', color: '#654321', roughness: 0.5, metalness: 0.0, opacity: 1.0, thumbnail: null, is_custom: true },
  { id: '8', name: 'Chrome', type: 'metal', color: '#E8E8E8', roughness: 0.1, metalness: 1.0, opacity: 1.0, thumbnail: null, is_custom: false }
]

const mockTextures: Texture[] = [
  { id: '1', name: 'Wood Diffuse', type: 'diffuse', resolution: '4096x4096', format: 'png', size_mb: 12.4, thumbnail: null },
  { id: '2', name: 'Wood Normal', type: 'normal', resolution: '4096x4096', format: 'png', size_mb: 8.2, thumbnail: null },
  { id: '3', name: 'Metal Roughness', type: 'roughness', resolution: '2048x2048', format: 'png', size_mb: 3.1, thumbnail: null },
  { id: '4', name: 'Concrete AO', type: 'ao', resolution: '2048x2048', format: 'png', size_mb: 2.8, thumbnail: null },
  { id: '5', name: 'HDRI Studio', type: 'diffuse', resolution: '8192x4096', format: 'hdr', size_mb: 45.6, thumbnail: null },
  { id: '6', name: 'Fabric Normal', type: 'normal', resolution: '2048x2048', format: 'png', size_mb: 4.2, thumbnail: null }
]

const mockRenderJobs: RenderJob[] = [
  { id: '1', model_id: '3', model_name: 'Modern Villa Exterior', quality: 'ultra', status: 'rendering', progress: 67, started_at: '2024-01-15T10:30:00', completed_at: null, estimated_time_sec: 420, output_format: 'png', resolution: '4K' },
  { id: '2', model_id: '1', model_name: 'Product Showcase Stand', quality: 'high', status: 'queued', progress: 0, started_at: null, completed_at: null, estimated_time_sec: 120, output_format: 'png', resolution: '2K' },
  { id: '3', model_id: '4', model_name: 'Sci-Fi Vehicle Concept', quality: 'high', status: 'completed', progress: 100, started_at: '2024-01-15T09:00:00', completed_at: '2024-01-15T09:15:00', estimated_time_sec: 180, output_format: 'exr', resolution: '4K' }
]

const mockSceneHierarchy: SceneObject[] = [
  {
    id: 'scene',
    name: 'Scene',
    type: 'empty',
    visible: true,
    locked: false,
    expanded: true,
    children: [
      {
        id: 'camera-main',
        name: 'Main Camera',
        type: 'camera',
        visible: true,
        locked: false,
        children: []
      },
      {
        id: 'light-group',
        name: 'Lighting',
        type: 'group',
        visible: true,
        locked: false,
        expanded: true,
        children: [
          { id: 'sun', name: 'Sun Light', type: 'light', visible: true, locked: false, children: [] },
          { id: 'fill', name: 'Fill Light', type: 'light', visible: true, locked: false, children: [] },
          { id: 'rim', name: 'Rim Light', type: 'light', visible: false, locked: false, children: [] }
        ]
      },
      {
        id: 'model-group',
        name: 'Models',
        type: 'group',
        visible: true,
        locked: false,
        expanded: true,
        children: [
          { id: 'mesh-1', name: 'Base_Mesh', type: 'mesh', visible: true, locked: false, children: [] },
          { id: 'mesh-2', name: 'Detail_Parts', type: 'mesh', visible: true, locked: true, children: [] },
          { id: 'mesh-3', name: 'Glass_Elements', type: 'mesh', visible: true, locked: false, children: [] }
        ]
      }
    ]
  }
]

// Competitive Upgrade Mock Data - Blender/Maya-level 3D Modeling Intelligence
const mock3DAIInsights = [
  { id: '1', type: 'success' as const, title: 'Render Optimization', description: 'GPU utilization at 95% - optimal performance!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'High Poly Count', description: 'Scene exceeds 5M polygons - consider LOD optimization.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
  { id: '3', type: 'info' as const, title: 'AI Mesh Suggestion', description: 'Topology flow could improve with edge loop adjustments.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Assist' },
]

const mock3DCollaborators = [
  { id: '1', name: '3D Lead', avatar: '/avatars/3d-lead.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Texture Artist', avatar: '/avatars/texture.jpg', status: 'online' as const, role: 'Artist' },
  { id: '3', name: 'Rigger', avatar: '/avatars/rigger.jpg', status: 'away' as const, role: 'Animator' },
]

const mock3DPredictions = [
  { id: '1', title: 'Render Completion', prediction: 'Final render will complete in 4 hours at current settings', confidence: 92, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Asset Pipeline', prediction: 'LOD generation can reduce load time by 40%', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
]

const mock3DActivities = [
  { id: '1', user: 'Texture Artist', action: 'Updated', target: '4K PBR materials for hero model', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: '3D Lead', action: 'Approved', target: 'character animation rig', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Rigger', action: 'Started', target: 'facial blend shapes', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mock3DQuickActions = [
  { id: '1', label: 'New Model', icon: 'plus', action: () => console.log('New model'), variant: 'default' as const },
  { id: '2', label: 'Render', icon: 'play', action: () => console.log('Render'), variant: 'default' as const },
  { id: '3', label: 'Export', icon: 'download', action: () => console.log('Export'), variant: 'outline' as const },
]

export default function ThreeDModelingClient() {
  const [activeTab, setActiveTab] = useState('models')
  const [selectedTool, setSelectedTool] = useState<ToolType>('select')
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ModelStatus | 'all'>('all')
  const [showRenderDialog, setShowRenderDialog] = useState(false)
  const [viewportMode, setViewportMode] = useState<'solid' | 'wireframe' | 'material'>('solid')
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats calculation
  const stats = useMemo(() => {
    const totalModels = mockModels.length
    const totalPolygons = mockModels.reduce((sum, m) => sum + m.polygon_count, 0)
    const totalVertices = mockModels.reduce((sum, m) => sum + m.vertex_count, 0)
    const totalDownloads = mockModels.reduce((sum, m) => sum + m.downloads, 0)
    const publishedCount = mockModels.filter(m => m.status === 'published').length
    const renderingCount = mockModels.filter(m => m.status === 'rendering').length
    const avgRenderTime = mockModels.filter(m => m.last_render_time_sec > 0).reduce((sum, m) => sum + m.last_render_time_sec, 0) / mockModels.filter(m => m.last_render_time_sec > 0).length || 0

    return { totalModels, totalPolygons, totalVertices, totalDownloads, publishedCount, renderingCount, avgRenderTime }
  }, [])

  // Filtered models
  const filteredModels = useMemo(() => {
    return mockModels.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || model.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Helper functions
  const getStatusBadge = (status: ModelStatus) => {
    switch (status) {
      case 'published': return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Published', icon: CheckCircle2 }
      case 'draft': return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Draft', icon: File }
      case 'rendering': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Rendering', icon: Cpu }
      case 'archived': return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Archived', icon: Folder }
      default: return { color: 'bg-gray-100 text-gray-800', label: status, icon: File }
    }
  }

  const getRenderStatusColor = (status: RenderJob['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'rendering': return 'text-blue-600 dark:text-blue-400'
      case 'queued': return 'text-yellow-600 dark:text-yellow-400'
      case 'failed': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Render scene hierarchy
  const renderSceneNode = (node: SceneObject, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const getTypeIcon = () => {
      switch (node.type) {
        case 'mesh': return <Box className="w-4 h-4 text-blue-500" />
        case 'light': return <Lightbulb className="w-4 h-4 text-yellow-500" />
        case 'camera': return <Camera className="w-4 h-4 text-purple-500" />
        case 'group': return <Folder className="w-4 h-4 text-orange-500" />
        default: return <Circle className="w-4 h-4 text-gray-500" />
      }
    }

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren && (
            <button className="w-4 h-4 flex items-center justify-center">
              {node.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
          {!hasChildren && <span className="w-4" />}
          {getTypeIcon()}
          <span className="text-sm flex-1 truncate">{node.name}</span>
          <button className="opacity-50 hover:opacity-100">
            {node.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          {node.locked && <Lock className="w-3 h-3 text-red-500" />}
        </div>
        {hasChildren && node.expanded && node.children.map(child => renderSceneNode(child, depth + 1))}
      </div>
    )
  }

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'rotate', icon: RotateCw, label: 'Rotate' },
    { id: 'scale', icon: Scale, label: 'Scale' },
    { id: 'extrude', icon: Layers, label: 'Extrude' },
    { id: 'cut', icon: Scissors, label: 'Cut' },
    { id: 'merge', icon: Merge, label: 'Merge' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-zinc-700 flex items-center justify-center text-white shadow-lg">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">3D Modeling Studio</h1>
              <p className="text-gray-600 dark:text-gray-400">Blender-level 3D creation & rendering</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-slate-600 to-zinc-700 hover:from-slate-700 hover:to-zinc-800">
              <Plus className="w-4 h-4" />
              New Model
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalModels}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Models</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Triangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalPolygons)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Polygons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.renderingCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rendering</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(Math.round(stats.avgRenderTime))}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avg Render</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockMaterials.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Materials</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="models" className="gap-2">
              <Box className="w-4 h-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="viewport" className="gap-2">
              <Monitor className="w-4 h-4" />
              Viewport
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <Palette className="w-4 h-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="textures" className="gap-2">
              <Image className="w-4 h-4" />
              Textures
            </TabsTrigger>
            <TabsTrigger value="render" className="gap-2">
              <Cpu className="w-4 h-4" />
              Render Queue
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            {/* Models Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">3D Model Library</h2>
                  <p className="text-purple-100">Blender-level model management and organization</p>
                  <p className="text-purple-200 text-xs mt-1">GLB/GLTF • OBJ • FBX • Version control</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredModels.length}</p>
                    <p className="text-purple-200 text-sm">Models</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{models.filter(m => m.status === 'published').length}</p>
                    <p className="text-purple-200 text-sm">Published</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search models or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as ModelStatus | 'all')}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="rendering">Rendering</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredModels.map((model) => {
                const statusBadge = getStatusBadge(model.status)
                const StatusIcon = statusBadge.icon
                return (
                  <Card key={model.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-slate-200 to-zinc-300 dark:from-slate-700 dark:to-zinc-800 flex items-center justify-center flex-shrink-0">
                          <Box className="w-10 h-10 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{model.name}</h3>
                            <Badge className={statusBadge.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{model.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Triangle className="w-3 h-3" />
                              {formatNumber(model.polygon_count)} polys
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {model.file_size_mb.toFixed(1)} MB
                            </span>
                            <span className="flex items-center gap-1">
                              <Palette className="w-3 h-3" />
                              {model.material_count} mats
                            </span>
                            <span>{model.format}</span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {model.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {model.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {model.downloads}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedModel(model)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="gap-1">
                            <Play className="w-3 h-3" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Viewport Tab */}
          <TabsContent value="viewport" className="space-y-6">
            {/* Viewport Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">3D Viewport</h2>
                  <p className="text-blue-100">Three.js-powered real-time 3D editing</p>
                  <p className="text-blue-200 text-xs mt-1">WebGL rendering • Scene graph • Transform tools</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{selectedModel?.polygons.toLocaleString() || '0'}</p>
                    <p className="text-blue-200 text-sm">Polygons</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-4">
              {/* Toolbar */}
              <Card className="lg:col-span-4 bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <Button
                            key={tool.id}
                            variant={selectedTool === tool.id ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSelectedTool(tool.id as ToolType)}
                            title={tool.label}
                          >
                            <Icon className="w-4 h-4" />
                          </Button>
                        )
                      })}
                      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
                      <Button variant="ghost" size="sm" title="Undo">
                        <Undo2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Redo">
                        <Redo2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={viewportMode}
                        onChange={(e) => setViewportMode(e.target.value as typeof viewportMode)}
                        className="px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800"
                      >
                        <option value="solid">Solid</option>
                        <option value="wireframe">Wireframe</option>
                        <option value="material">Material</option>
                      </select>
                      <Button variant="ghost" size="sm">
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scene Hierarchy */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Scene Hierarchy</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[400px]">
                    {mockSceneHierarchy.map(node => renderSceneNode(node))}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Viewport */}
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm h-[480px]">
                  <CardContent className="p-0 h-full">
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative">
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }} />
                      <div className="text-center text-gray-400">
                        <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">3D Viewport</p>
                        <p className="text-xs mt-1">Select a model to view</p>
                      </div>
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <Button variant="secondary" size="sm">
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm">
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button variant="secondary" size="sm">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Properties */}
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="X" className="text-xs h-8" defaultValue="0.00" />
                      <Input placeholder="Y" className="text-xs h-8" defaultValue="0.00" />
                      <Input placeholder="Z" className="text-xs h-8" defaultValue="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Rotation</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="X" className="text-xs h-8" defaultValue="0°" />
                      <Input placeholder="Y" className="text-xs h-8" defaultValue="0°" />
                      <Input placeholder="Z" className="text-xs h-8" defaultValue="0°" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Scale</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="X" className="text-xs h-8" defaultValue="1.00" />
                      <Input placeholder="Y" className="text-xs h-8" defaultValue="1.00" />
                      <Input placeholder="Z" className="text-xs h-8" defaultValue="1.00" />
                    </div>
                  </div>
                  <div className="pt-2 border-t dark:border-gray-700">
                    <label className="text-xs text-gray-500 block mb-2">Material</label>
                    <select className="w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800">
                      <option>Brushed Aluminum</option>
                      <option>Red Plastic</option>
                      <option>Clear Glass</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            {/* Materials Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Material Library</h2>
                  <p className="text-emerald-100">Substance Painter-level PBR materials</p>
                  <p className="text-emerald-200 text-xs mt-1">PBR workflow • Texture maps • Material presets</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{materials.length}</p>
                    <p className="text-emerald-200 text-sm">Materials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Material Library</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Material
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockMaterials.map((material) => (
                <Card key={material.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: material.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{material.name}</h3>
                          {material.is_custom && (
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{material.type}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Roughness</span>
                        <span>{(material.roughness * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={material.roughness * 100} className="h-1" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Metalness</span>
                        <span>{(material.metalness * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={material.metalness * 100} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Textures Tab */}
          <TabsContent value="textures" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Texture Library</h2>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Texture
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockTextures.map((texture) => (
                <Card key={texture.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="w-full h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-3 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-sm truncate">{texture.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Badge variant="outline" className="text-xs capitalize">{texture.type}</Badge>
                      <span>{texture.format.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>{texture.resolution}</span>
                      <span>{texture.size_mb.toFixed(1)} MB</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Render Queue Tab */}
          <TabsContent value="render" className="space-y-6">
            {/* Render Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Render Engine</h2>
                  <p className="text-orange-100">Cinema 4D-level rendering and output</p>
                  <p className="text-orange-200 text-xs mt-1">Ray tracing • GPU acceleration • Batch rendering</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{renderQueue.length}</p>
                    <p className="text-orange-200 text-sm">In Queue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{renderQueue.filter(r => r.status === 'completed').length}</p>
                    <p className="text-orange-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Render Feature Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Ray Tracing</Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Path Tracing</Badge>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">GPU Acceleration</Badge>
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Denoising AI</Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">HDR Output</Badge>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Multi-Pass</Badge>
              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Batch Render</Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Network Render</Badge>
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">CUDA Support</Badge>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Render Queue</h2>
              <Button className="gap-2" onClick={() => setShowRenderDialog(true)}>
                <Plus className="w-4 h-4" />
                New Render
              </Button>
            </div>
            <div className="space-y-4">
              {mockRenderJobs.map((job) => (
                <Card key={job.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-200 to-zinc-300 dark:from-slate-700 dark:to-zinc-800 flex items-center justify-center">
                          <Cpu className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{job.model_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">{job.quality}</Badge>
                            <span>{job.resolution}</span>
                            <span>{job.output_format.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium capitalize ${getRenderStatusColor(job.status)}`}>
                          {job.status}
                        </p>
                        <p className="text-sm text-gray-500">
                          Est. {formatTime(job.estimated_time_sec)}
                        </p>
                      </div>
                    </div>
                    {job.status === 'rendering' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    {job.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                        <Button size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    )}
                    {job.status === 'queued' && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        Waiting in queue...
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Blender-level configuration */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Sliders, label: 'General' },
                        { id: 'viewport', icon: Monitor, label: 'Viewport' },
                        { id: 'rendering', icon: Cpu, label: 'Rendering' },
                        { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts' },
                        { id: 'plugins', icon: Package, label: 'Plugins' },
                        { id: 'advanced', icon: Lock, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-blue-500" />
                          General Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Unit System</Label>
                            <Select defaultValue="metric">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="metric">Metric (m, cm, mm)</SelectItem>
                                <SelectItem value="imperial">Imperial (ft, in)</SelectItem>
                                <SelectItem value="blender">Blender Units</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Scale</Label>
                            <Input type="number" defaultValue="1.0" step="0.1" />
                          </div>
                          <div className="space-y-2">
                            <Label>Auto-save Interval (minutes)</Label>
                            <Input type="number" defaultValue="5" />
                          </div>
                          <div className="space-y-2">
                            <Label>Undo Steps</Label>
                            <Input type="number" defaultValue="32" />
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Auto-save</p>
                              <p className="text-sm text-muted-foreground">Automatically save projects</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Show Splash Screen</p>
                              <p className="text-sm text-muted-foreground">Display splash on startup</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Load Last Project</p>
                              <p className="text-sm text-muted-foreground">Open last project on start</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Grid3X3 className="w-5 h-5 text-purple-500" />
                          Grid Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Grid Size</Label>
                            <Input type="number" defaultValue="10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Subdivisions</Label>
                            <Input type="number" defaultValue="10" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Show Grid</p>
                            <p className="text-sm text-muted-foreground">Display grid in viewport</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Snap to Grid</p>
                            <p className="text-sm text-muted-foreground">Snap objects to grid points</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'viewport' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-green-500" />
                          Display Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default View Mode</Label>
                            <Select defaultValue="solid">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="wireframe">Wireframe</SelectItem>
                                <SelectItem value="solid">Solid</SelectItem>
                                <SelectItem value="material">Material</SelectItem>
                                <SelectItem value="rendered">Rendered</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="flex gap-2">
                              <Input defaultValue="#1a1a1a" className="flex-1" />
                              <div className="w-10 h-10 rounded-lg bg-gray-800 border" />
                            </div>
                          </div>
                        </div>
                        <div className="border-t pt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Show Floor Grid</p>
                              <p className="text-sm text-muted-foreground">Display ground plane grid</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Show Axis Gizmo</p>
                              <p className="text-sm text-muted-foreground">Display XYZ orientation</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Backface Culling</p>
                              <p className="text-sm text-muted-foreground">Hide faces facing away</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Camera className="w-5 h-5 text-blue-500" />
                          Camera Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Field of View</Label>
                            <Input type="number" defaultValue="50" />
                          </div>
                          <div className="space-y-2">
                            <Label>Clip Distance (Near)</Label>
                            <Input type="number" defaultValue="0.1" step="0.01" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Lock Camera to View</p>
                            <p className="text-sm text-muted-foreground">Sync camera with viewport</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto Focus</p>
                            <p className="text-sm text-muted-foreground">Focus on selected object</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-500" />
                          Lighting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Viewport Lighting</p>
                            <p className="text-sm text-muted-foreground">Enable default lights</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">HDRI Preview</p>
                            <p className="text-sm text-muted-foreground">Show environment map</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Light Intensity</Label>
                          <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'rendering' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-red-500" />
                          Render Engine
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Render Engine</Label>
                            <Select defaultValue="cycles">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="eevee">Eevee (Real-time)</SelectItem>
                                <SelectItem value="cycles">Cycles (Path Tracing)</SelectItem>
                                <SelectItem value="workbench">Workbench (Preview)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Device</Label>
                            <Select defaultValue="gpu">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cpu">CPU</SelectItem>
                                <SelectItem value="gpu">GPU (CUDA)</SelectItem>
                                <SelectItem value="optix">GPU (OptiX)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Samples</Label>
                            <Input type="number" defaultValue="128" />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Bounces</Label>
                            <Input type="number" defaultValue="12" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Denoising</p>
                            <p className="text-sm text-muted-foreground">Apply noise reduction</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Film className="w-5 h-5 text-purple-500" />
                          Output Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Resolution X</Label>
                            <Input type="number" defaultValue="1920" />
                          </div>
                          <div className="space-y-2">
                            <Label>Resolution Y</Label>
                            <Input type="number" defaultValue="1080" />
                          </div>
                          <div className="space-y-2">
                            <Label>Output Format</Label>
                            <Select defaultValue="png">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="png">PNG</SelectItem>
                                <SelectItem value="jpg">JPEG</SelectItem>
                                <SelectItem value="exr">OpenEXR</SelectItem>
                                <SelectItem value="tiff">TIFF</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Frame Rate</Label>
                            <Input type="number" defaultValue="24" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Alpha Channel</p>
                            <p className="text-sm text-muted-foreground">Include transparency</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'shortcuts' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Keyboard className="w-5 h-5 text-blue-500" />
                          Keyboard Shortcuts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { action: 'Select', keys: ['Right Click'] },
                            { action: 'Move', keys: ['G'] },
                            { action: 'Rotate', keys: ['R'] },
                            { action: 'Scale', keys: ['S'] },
                            { action: 'Delete', keys: ['X'] },
                            { action: 'Duplicate', keys: ['Shift', 'D'] },
                            { action: 'Undo', keys: ['Ctrl', 'Z'] },
                            { action: 'Redo', keys: ['Ctrl', 'Shift', 'Z'] },
                            { action: 'Save', keys: ['Ctrl', 'S'] },
                            { action: 'Render', keys: ['F12'] }
                          ].map(shortcut => (
                            <div key={shortcut.action} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="font-medium">{shortcut.action}</span>
                              <div className="flex gap-1">
                                {shortcut.keys.map((key, i) => (
                                  <kbd key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          Reset to Defaults
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mouse className="w-5 h-5 text-green-500" />
                          Mouse & Navigation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Navigation Style</Label>
                          <Select defaultValue="blender">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="blender">Blender</SelectItem>
                              <SelectItem value="maya">Maya</SelectItem>
                              <SelectItem value="3dsmax">3ds Max</SelectItem>
                              <SelectItem value="cinema4d">Cinema 4D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Invert Zoom</p>
                            <p className="text-sm text-muted-foreground">Reverse scroll wheel zoom</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Orbit Around Selection</p>
                            <p className="text-sm text-muted-foreground">Rotate view around selected</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Zoom Speed</Label>
                          <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'plugins' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-purple-500" />
                          Installed Plugins
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {[
                            { name: 'Node Wrangler', description: 'Enhanced node workflow', enabled: true, version: '3.5.0' },
                            { name: 'Hard Ops', description: 'Hard surface modeling', enabled: true, version: '9.8.1' },
                            { name: 'BoxCutter', description: 'Boolean cutting tools', enabled: true, version: '7.1.8' },
                            { name: 'Animation Nodes', description: 'Procedural animation', enabled: false, version: '2.3.0' },
                            { name: 'Auto Rig Pro', description: 'Character rigging', enabled: false, version: '3.6.2' }
                          ].map(plugin => (
                            <div key={plugin.name} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-muted-foreground" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{plugin.name}</p>
                                    <Badge variant="secondary" className="text-xs">v{plugin.version}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{plugin.description}</p>
                                </div>
                              </div>
                              <Switch checked={plugin.enabled} />
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Install Plugin
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-blue-500" />
                          Updates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-update Plugins</p>
                            <p className="text-sm text-muted-foreground">Automatically install updates</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Beta Updates</p>
                            <p className="text-sm text-muted-foreground">Receive beta versions</p>
                          </div>
                          <Switch />
                        </div>
                        <Button variant="outline" className="w-full">
                          Check for Updates
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-blue-500" />
                          System & Memory
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Memory Limit (GB)</Label>
                            <Input type="number" defaultValue="16" />
                          </div>
                          <div className="space-y-2">
                            <Label>Texture Cache (GB)</Label>
                            <Input type="number" defaultValue="4" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">GPU Compute</p>
                            <p className="text-sm text-muted-foreground">Use GPU for calculations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Subdivision Limit</p>
                            <p className="text-sm text-muted-foreground">Limit viewport subdivisions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-green-500" />
                          File Paths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Temp Files Location</Label>
                          <div className="flex gap-2">
                            <Input defaultValue="/tmp/3d-studio" readOnly className="flex-1" />
                            <Button variant="outline">Browse</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Assets Library</Label>
                          <div className="flex gap-2">
                            <Input defaultValue="~/Documents/3D Assets" readOnly className="flex-1" />
                            <Button variant="outline">Browse</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Compress Files</p>
                            <p className="text-sm text-muted-foreground">Compress saved files</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900 bg-white dark:bg-gray-800 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Clear Cache</p>
                            <p className="text-sm text-muted-foreground">Remove all cached data</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Reset All Preferences</p>
                            <p className="text-sm text-muted-foreground">Restore factory defaults</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                          <div>
                            <p className="font-medium text-red-600">Purge Orphan Data</p>
                            <p className="text-sm text-muted-foreground">Remove unused data blocks</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                            <Archive className="w-4 h-4 mr-2" />
                            Purge
                          </Button>
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
              insights={mock3DAIInsights}
              title="3D Modeling Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mock3DCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mock3DPredictions}
              title="Render Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mock3DActivities}
            title="3D Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mock3DQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Model Detail Dialog */}
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-slate-200 to-zinc-300 dark:from-slate-700 dark:to-zinc-800 flex items-center justify-center">
                  <Box className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedModel.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedModel.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{selectedModel.format}</Badge>
                    <Badge variant="outline">{selectedModel.render_quality}</Badge>
                    {selectedModel.is_public && <Badge className="bg-green-100 text-green-800">Public</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(selectedModel.polygon_count)}</p>
                  <p className="text-xs text-gray-500">Polygons</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{formatNumber(selectedModel.vertex_count)}</p>
                  <p className="text-xs text-gray-500">Vertices</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedModel.texture_count}</p>
                  <p className="text-xs text-gray-500">Textures</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedModel.material_count}</p>
                  <p className="text-xs text-gray-500">Materials</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Play className="w-4 h-4" />
                  Open in Editor
                </Button>
                <Button variant="outline" className="gap-2">
                  <Cpu className="w-4 h-4" />
                  Render
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
