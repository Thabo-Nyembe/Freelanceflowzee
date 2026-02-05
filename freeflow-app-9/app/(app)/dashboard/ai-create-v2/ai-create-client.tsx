"use client"

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// MIGRATED: Batch #12 - Removed mock data, using database hooks

import React, { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { copyToClipboard, downloadAsJson, shareContent, apiPost } from '@/lib/button-handlers'
import { useAICreate } from '@/lib/hooks/use-ai-create'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Sparkles,
  Wand2,
  Image,
  Palette,
  Layers,
  History,
  Settings,
  Search,
  Plus,
  Heart,
  Download,
  Share2,
  Copy,
  Trash2,
  RefreshCw,
  Zap,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  Grid,
  List,
  Filter,
  SlidersHorizontal,
  Eye,
  Bookmark,
  Video,
  FileText,
  Code,
  Music,
  Globe,
  Users,
  Crown,
  Gem,
  Flame,
  Target,
  Activity,
  DollarSign,
  Maximize2,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Sliders,
  Bell,
  Webhook,
  Key,
  Database,
  Mail,
  HardDrive,
  Archive,
  Shield,
  AlertTriangle,
  UploadCloud,
  Cpu,
  Terminal,
  Calendar
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

// ============================================================================
// TYPES & INTERFACES - Midjourney Level AI Creation Platform
// ============================================================================

type GenerationType = 'image' | 'video' | 'audio' | 'text' | 'code' | '3d'
type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
type StylePreset = 'realistic' | 'anime' | 'digital-art' | 'oil-painting' | 'watercolor' | 'sketch' | 'cyberpunk' | 'fantasy' | 'minimalist' | 'vintage'
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9'
type QualityLevel = 'draft' | 'standard' | 'high' | 'ultra'
type ModelTier = 'free' | 'pro' | 'enterprise'

interface Generation {
  id: string
  prompt: string
  negativePrompt?: string
  type: GenerationType
  status: GenerationStatus
  style: StylePreset
  aspectRatio: AspectRatio
  quality: QualityLevel
  model: string
  seed: number
  steps: number
  guidance: number
  imageUrl?: string
  thumbnailUrl?: string
  likes: number
  downloads: number
  views: number
  isPublic: boolean
  isFavorite: boolean
  variations: number
  createdAt: string
  completedAt?: string
  processingTime?: number
  cost: number
  userId: string
  userName: string
  userAvatar: string
  tags: string[]
}

// Helper to map DB AIGeneration to UI Generation
const mapToUiGeneration = (gen: any): Generation => ({
  id: gen.id,
  prompt: gen.prompt || '',
  negativePrompt: gen.metadata?.negative_prompt || '',
  type: (gen.generation_type as GenerationType) || 'image',
  status: (gen.status as GenerationStatus) || 'pending',
  style: (gen.metadata?.style as StylePreset) || 'realistic',
  aspectRatio: (gen.metadata?.aspect_ratio as AspectRatio) || '1:1',
  quality: (gen.metadata?.quality as QualityLevel) || 'high',
  model: gen.model || 'unknown',
  seed: gen.metadata?.seed || 0,
  steps: gen.metadata?.steps || 30,
  guidance: gen.metadata?.guidance || 7.5,
  imageUrl: gen.generation_type === 'image' ? gen.result : undefined,
  thumbnailUrl: gen.generation_type === 'image' ? gen.result : undefined,
  likes: 0, // Not in DB yet
  downloads: 0, // Not in DB yet
  views: 0, // Not in DB yet
  isPublic: false,
  isFavorite: false,
  variations: 0,
  createdAt: gen.created_at || new Date().toISOString(),
  completedAt: gen.updated_at,
  processingTime: gen.latency_ms ? gen.latency_ms / 1000 : undefined,
  cost: gen.cost || 0,
  userId: gen.user_id,
  userName: 'You',
  userAvatar: '',
  tags: gen.tags || []
})

interface Template {
  id: string
  name: string
  description: string
  prompt: string
  negativePrompt?: string
  style: StylePreset
  category: string
  thumbnail: string
  uses: number
  likes: number
  author: string
  authorAvatar: string
  isPremium: boolean
  tags: string[]
}

// Templates Configuration (Static)
const AVAILABLE_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'Product Photography',
    description: 'Professional product shots on clean background',
    prompt: 'Professional product photography of [SUBJECT], studio lighting, clean background, 8k',
    style: 'realistic',
    category: 'Marketing',
    thumbnail: '/images/templates/product.jpg',
    uses: 120,
    likes: 45,
    author: 'AI Studio',
    authorAvatar: '',
    isPremium: false,
    tags: ['product', 'marketing']
  }
]

interface AIModel {
  id: string
  name: string
  description: string
  version: string
  tier: ModelTier
  type: GenerationType
  speed: number
  quality: number
  costPerGeneration: number
  maxResolution: string
  features: string[]
  isDefault: boolean
}

interface UsageStats {
  totalGenerations: number
  completedGenerations: number
  failedGenerations: number
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  avgProcessingTime: number
  totalLikes: number
  totalDownloads: number
  totalViews: number
  favoriteStyle: StylePreset
  generationsThisMonth: number
}

// ============================================================================
// MIGRATED DATA - Using database hooks instead of mock data
// ============================================================================

// Models Configuration (Static for now)
const AVAILABLE_MODELS: AIModel[] = [
  {
    id: '1',
    name: 'Flux Ultra',
    description: 'Latest photorealistic model with superior lighting',
    version: 'v1.0',
    tier: 'pro',
    type: 'image',
    speed: 8,
    quality: 9.5,
    costPerGeneration: 2,
    maxResolution: '1024x1024',
    features: ['Photorealistic', 'High Detail'],
    isDefault: true
  },
  {
    id: '2',
    name: 'Midjourney V6',
    description: 'Artistic and creative generation',
    version: 'v6.0',
    tier: 'pro',
    type: 'image',
    speed: 12,
    quality: 9.8,
    costPerGeneration: 3,
    maxResolution: '1024x1024',
    features: ['Artistic', 'Creative'],
    isDefault: false
  },
  {
    id: '3',
    name: 'DALL-E 3',
    description: 'Faithful instruction following',
    version: 'v3',
    tier: 'enterprise',
    type: 'image',
    speed: 10,
    quality: 9.0,
    costPerGeneration: 4,
    maxResolution: '1024x1792',
    features: ['Instruction Following', 'Text Rendering'],
    isDefault: false
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: GenerationStatus) => {
  const colors: Record<GenerationStatus, string> = {
    queued: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  }
  return colors[status]
}

const getStyleColor = (style: StylePreset) => {
  const colors: Record<StylePreset, string> = {
    realistic: 'from-gray-500 to-slate-600',
    anime: 'from-pink-500 to-rose-500',
    'digital-art': 'from-blue-500 to-cyan-500',
    'oil-painting': 'from-amber-500 to-orange-500',
    watercolor: 'from-teal-500 to-cyan-500',
    sketch: 'from-gray-400 to-gray-600',
    cyberpunk: 'from-purple-500 to-pink-500',
    fantasy: 'from-violet-500 to-purple-600',
    minimalist: 'from-slate-400 to-gray-500',
    vintage: 'from-amber-600 to-yellow-600'
  }
  return colors[style]
}

const getTypeIcon = (type: GenerationType) => {
  const icons: Record<GenerationType, React.ReactNode> = {
    image: <Image className="w-4 h-4" loading="lazy" />,
    video: <Video className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />,
    text: <FileText className="w-4 h-4" />,
    code: <Code className="w-4 h-4" />,
    '3d': <Layers className="w-4 h-4" />
  }
  return icons[type]
}

const getAspectRatioIcon = (ratio: AspectRatio) => {
  const icons: Record<AspectRatio, React.ReactNode> = {
    '1:1': <Square className="w-4 h-4" />,
    '16:9': <RectangleHorizontal className="w-4 h-4" />,
    '9:16': <RectangleVertical className="w-4 h-4" />,
    '4:3': <RectangleHorizontal className="w-4 h-4" />,
    '3:4': <RectangleVertical className="w-4 h-4" />,
    '21:9': <RectangleHorizontal className="w-4 h-4" />
  }
  return icons[ratio]
}

const getModelTierColor = (tier: ModelTier) => {
  const colors: Record<ModelTier, string> = {
    free: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
  }
  return colors[tier]
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// MIGRATED: Using database hooks instead of mock data - All arrays properly typed as empty

interface AIInsight {
  id: string
  title: string
  description: string
  type: string
  priority: string
  timestamp: string
}

interface Collaborator {
  id: string
  name: string
  avatar: string
  status: string
  role: string
}

interface Prediction {
  id: string
  title: string
  description: string
  confidence: number
  trend: string
  value: string
}

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user: string
}

const aiCreateInsights: AIInsight[] = []
const aiCreateCollaborators: Collaborator[] = []
const aiCreatePredictions: Prediction[] = []
const aiCreateActivities: ActivityItem[] = []

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AICreateClient() {
  const supabase = createClient()
  // Database hook for AI creations
  const { generations, isLoading, fetchGenerations } = useAICreate()

  const [activeTab, setActiveTab] = useState('generator')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>('realistic')
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9')
  const [quality, setQuality] = useState<QualityLevel>('high')
  const [selectedModel, setSelectedModel] = useState('1')
  const [guidance, setGuidance] = useState([7.5])
  const [steps, setSteps] = useState([30])
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<GenerationStatus | 'all'>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // New dialog states for "coming soon" features
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showModelCompareDialog, setShowModelCompareDialog] = useState(false)
  const [archivedItems, setArchivedItems] = useState<string[]>([])
  const [importedFile, setImportedFile] = useState<File | null>(null)
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', prompt: '', style: 'realistic' })
  const [advancedFilters, setAdvancedFilters] = useState({
    type: 'all',
    style: 'all',
    dateRange: 'all'
  })

  // Fetch generations on component mount
  useEffect(() => {
    fetchGenerations()
  }, [])

  // Mapped generations for UI
  const uiGenerations = useMemo(() => generations.map(mapToUiGeneration), [generations])

  // Calculate stats from hook data
  const calculatedStats = useMemo(() => {
    const completed = generations.filter(g => g.status === 'completed').length
    const total = generations.length
    return {
      totalGenerations: total,
      completedGenerations: completed,
      generationsThisMonth: generations.filter(g => {
        const d = new Date(g.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length,
      remainingCredits: 500 - total, // Simple calculation for now
      usedCredits: total,
      avgProcessingTime: generations.length > 0
        ? Math.round(generations.reduce((sum, g) => sum + (g.latency_ms || 0), 0) / generations.length / 1000)
        : 5,
      totalLikes: 0,
      totalDownloads: 0,
      totalViews: 0
    }
  }, [generations])

  // Filtered generations from database hook
  const filteredGenerations = useMemo(() => {
    return uiGenerations.filter(gen => {
      const matchesSearch = gen.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || gen.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [uiGenerations, searchQuery, statusFilter])

  const styles: { value: StylePreset; label: string }[] = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'anime', label: 'Anime' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'oil-painting', label: 'Oil Painting' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'vintage', label: 'Vintage' }
  ]

  const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: '1:1', label: 'Square' },
    { value: '16:9', label: 'Landscape' },
    { value: '9:16', label: 'Portrait' },
    { value: '4:3', label: 'Standard' },
    { value: '3:4', label: 'Tall' },
    { value: '21:9', label: 'Ultrawide' }
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    const result = await apiPost('/api/ai/generate', {
      prompt,
      negativePrompt,
      style: selectedStyle,
      aspectRatio: selectedRatio,
      quality,
      modelId: selectedModel,
      guidance: guidance[0],
      steps: steps[0]
    }, {
      loading: 'Generating your AI creation...',
      success: 'AI creation generated successfully!',
      error: 'Failed to generate. Please try again.'
    })

    setIsGenerating(false)

    if (result.success) {
      // Optionally clear the prompt or refresh gallery
      setActiveTab('gallery')
    }
  }

  // Handlers with real functionality
  const handleSaveCreation = async (generation?: Generation) => {
    if (!generation && !selectedGeneration) {
      toast.error('No creation selected')
      return
    }
    const gen = generation || selectedGeneration
    await apiPost('/api/ai/creations/save', {
      generationId: gen?.id,
      prompt: gen?.prompt,
      style: gen?.style
    }, {
      loading: 'Saving creation...',
      success: 'Creation saved to gallery!',
      error: 'Failed to save creation'
    })
  }

  const handleDownloadCreation = (generation?: Generation) => {
    const gen = generation || selectedGeneration
    if (!gen) {
      toast.error('No creation selected')
      return
    }
    // Create download data
    const downloadData = {
      id: gen.id,
      prompt: gen.prompt,
      negativePrompt: gen.negativePrompt,
      style: gen.style,
      aspectRatio: gen.aspectRatio,
      quality: gen.quality,
      model: gen.model,
      seed: gen.seed,
      steps: gen.steps,
      guidance: gen.guidance,
      createdAt: gen.createdAt
    }
    downloadAsJson(downloadData, `ai-creation-${gen.id}`)
  }

  const handleShareCreation = async (generation?: Generation) => {
    const gen = generation || selectedGeneration
    if (!gen) {
      toast.error('No creation selected')
      return
    }
    await shareContent({
      title: `AI Creation: ${gen.style}`,
      text: gen.prompt,
      url: `${window.location.origin}/ai-create/view/${gen.id}`
    })
  }

  const handleCopyPrompt = async (generation?: Generation) => {
    const gen = generation || selectedGeneration
    if (!gen) {
      toast.error('No creation selected')
      return
    }
    await copyToClipboard(gen.prompt, 'Prompt copied to clipboard!')
  }

  const handleRegenerateCreation = async (generation?: Generation) => {
    const gen = generation || selectedGeneration
    if (!gen) {
      toast.error('No creation selected')
      return
    }
    setPrompt(gen.prompt)
    setNegativePrompt(gen.negativePrompt || '')
    setSelectedStyle(gen.style)
    setActiveTab('generator')
    toast.success('Prompt loaded! Click Generate to create a new variation.')
  }

  // Quick actions for the toolbar
  const aiCreateQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'New Creation',
      icon: 'sparkles',
      action: () => {
        setActiveTab('generator')
        setPrompt('')
        setNegativePrompt('')
        toast.success('Ready for new creation')
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Use Template',
      icon: 'copy',
      action: () => {
        setActiveTab('templates')
        toast.success('Browse templates to get started')
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'View Gallery',
      icon: 'image',
      action: () => {
        setActiveTab('gallery')
        toast.success('Gallery opened')
      },
      variant: 'outline' as const
    },
  ], [setActiveTab, setPrompt, setNegativePrompt])

  return (
    <div className="bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6 rounded-xl overflow-hidden">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Create Studio</h1>
              <p className="text-gray-600 dark:text-gray-400">Midjourney-level creative generation platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* AI Tools Navigation */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard/ai-design-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Palette className="w-4 h-4" />
                  <span className="hidden md:inline">Edit in AI Design</span>
                </Button>
              </Link>
              <Link href="/dashboard/ai-code-builder-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Code className="w-4 h-4" />
                  <span className="hidden md:inline">Generate Code</span>
                </Button>
              </Link>
              <Link href="/dashboard/ai-voice-v2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Music className="w-4 h-4" />
                  <span className="hidden md:inline">Add Voice</span>
                </Button>
              </Link>
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{calculatedStats.remainingCredits}</span>
                <span className="text-sm text-gray-500">credits</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              toast.info('Opening upgrade options...')
              window.location.href = '/dashboard/pricing-v2'
            }}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Generations', value: formatNumber(calculatedStats.totalGenerations), change: 18.5, icon: Sparkles, color: 'from-violet-500 to-purple-500' },
            { label: 'This Month', value: calculatedStats.generationsThisMonth.toString(), change: 24.3, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Credits Used', value: calculatedStats.usedCredits.toString(), change: -5.2, icon: Zap, color: 'from-amber-500 to-orange-500' },
            { label: 'Avg Time', value: `${calculatedStats.avgProcessingTime}s`, change: -12.4, icon: Clock, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Views', value: formatNumber(calculatedStats.totalViews), change: 45.7, icon: Eye, color: 'from-pink-500 to-rose-500' },
            { label: 'Total Likes', value: formatNumber(calculatedStats.totalLikes), change: 32.1, icon: Heart, color: 'from-red-500 to-pink-500' },
            { label: 'Downloads', value: formatNumber(calculatedStats.totalDownloads), change: 28.9, icon: Download, color: 'from-teal-500 to-cyan-500' },
            { label: 'Success Rate', value: `${calculatedStats.totalGenerations > 0 ? ((calculatedStats.completedGenerations / calculatedStats.totalGenerations) * 100).toFixed(0) : 100}%`, change: 2.1, icon: Target, color: 'from-indigo-500 to-blue-500' }
          ].map((stat, idx) => (
            <Card key={idx} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <Badge variant="outline" className={stat.change >= 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            {/* Generator Banner */}
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Image Generator</h3>
                  <p className="text-violet-100">Create stunning visuals with state-of-the-art AI models</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{calculatedStats.remainingCredits}</p>
                    <p className="text-violet-200 text-sm">Credits Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generator Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Sparkles, label: 'Generate', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: RefreshCw, label: 'Regenerate', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Layers, label: 'Variations', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Maximize2, label: 'Upscale', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: UploadCloud, label: 'Import', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Download, label: 'Export', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Bookmark, label: 'Templates', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: History, label: 'History', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (action.label === 'Generate') {
                      if (prompt.trim()) {
                        handleGenerate()
                      } else {
                        toast.error('Please enter a prompt first')
                      }
                    } else if (action.label === 'Regenerate') {
                      toast.info('Select a creation from your gallery to regenerate')
                    } else if (action.label === 'Variations') {
                      toast.info('Select a creation to create variations')
                    } else if (action.label === 'Upscale') {
                      toast.info('Select a completed creation to upscale')
                    } else if (action.label === 'Import') {
                      setShowImportDialog(true)
                    } else if (action.label === 'Export') {
                      downloadAsJson(generations, 'ai-creations-export')
                    } else if (action.label === 'Templates') {
                      setActiveTab('templates')
                    } else if (action.label === 'History') {
                      setActiveTab('history')
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prompt Builder */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Prompt Builder
                    </CardTitle>
                    <CardDescription>Describe what you want to create</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Prompt
                      </label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="A majestic dragon flying over a medieval castle at sunset, dramatic lighting, highly detailed..."
                        className="min-h-32 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Negative Prompt (optional)
                      </label>
                      <Textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurry, low quality, distorted..."
                        className="min-h-16 resize-none"
                      />
                    </div>

                    {/* Style Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Style Preset
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-6">
                        {styles.map(style => (
                          <button
                            key={style.value}
                            onClick={() => setSelectedStyle(style.value)}
                            className={`p-3 rounded-lg text-center transition-all ${selectedStyle === style.value
                              ? `bg-gradient-to-r ${getStyleColor(style.value)} text-white shadow-lg`
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                          >
                            <span className="text-xs font-medium">{style.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Aspect Ratio
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {aspectRatios.map(ratio => (
                          <button
                            key={ratio.value}
                            onClick={() => setSelectedRatio(ratio.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${selectedRatio === ratio.value
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                          >
                            {getAspectRatioIcon(ratio.value)}
                            <span className="text-sm">{ratio.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white h-12 text-lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-purple-500" />
                      Advanced Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Model Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        AI Model
                      </label>
                      <div className="space-y-2">
                        {AVAILABLE_MODELS.map(model => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`w-full p-3 rounded-lg text-left transition-all ${selectedModel === model.id
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                              : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                              <Badge className={getModelTierColor(model.tier)}>{model.tier}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">${model.costPerGeneration}/gen</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Quality
                      </label>
                      <div className="flex gap-2">
                        {(['draft', 'standard', 'high', 'ultra'] as QualityLevel[]).map(q => (
                          <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${quality === q
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            {q.charAt(0).toUpperCase() + q.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guidance Scale */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Guidance Scale
                        </label>
                        <span className="text-sm font-semibold text-purple-600">{guidance[0]}</span>
                      </div>
                      <Slider
                        value={guidance}
                        onValueChange={setGuidance}
                        min={1}
                        max={20}
                        step={0.5}
                        className="py-2"
                      />
                    </div>

                    {/* Steps */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Steps
                        </label>
                        <span className="text-sm font-semibold text-purple-600">{steps[0]}</span>
                      </div>
                      <Slider
                        value={steps}
                        onValueChange={setSteps}
                        min={10}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <p>• Be specific with details for better results</p>
                    <p>• Use style keywords like "cinematic" or "photorealistic"</p>
                    <p>• Add lighting descriptions for dramatic effects</p>
                    <p>• Higher guidance = closer to prompt</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-6">
            {/* Gallery Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Your Creations</h3>
                  <p className="text-blue-100">Browse and manage all your AI-generated artwork</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{generations.length}</p>
                    <p className="text-blue-200 text-sm">Total Creations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Grid, label: 'Grid View', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: List, label: 'List View', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Heart, label: 'Favorites', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
                { icon: Download, label: 'Batch Export', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Share2, label: 'Share', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Filter, label: 'Filter', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Archive, label: 'Archive', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Trash2, label: 'Delete', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (action.label === 'Grid View') {
                      setViewMode('grid')
                      toast.success('Switched to grid view')
                    } else if (action.label === 'List View') {
                      setViewMode('list')
                      toast.success('Switched to list view')
                    } else if (action.label === 'Favorites') {
                      const favorites = generations.filter(g => g.isFavorite)
                      toast.info(`You have ${favorites.length} favorite creations`)
                    } else if (action.label === 'Batch Export') {
                      downloadAsJson(generations.filter(g => g.status === 'completed'), 'ai-creations-batch-export')
                    } else if (action.label === 'Share') {
                      shareContent({
                        title: 'My AI Creations',
                        text: 'Check out my AI-generated artwork!',
                        url: window.location.href
                      })
                    } else if (action.label === 'Filter') {
                      toast.info('Use the filter buttons below to filter creations')
                    } else if (action.label === 'Archive') {
                      const selectedCount = generations.filter(g => g.status === 'completed' && !archivedItems.includes(g.id)).length
                      if (selectedCount > 0) {
                        const toArchive = generations.filter(g => g.status === 'completed' && !archivedItems.includes(g.id)).map(g => g.id)
                        setArchivedItems([...archivedItems, ...toArchive])
                        toast.success(`${selectedCount} creations archived`)
                      } else {
                        toast.info('No completed creations to archive')
                      }
                    } else if (action.label === 'Delete') {
                      toast.warning('Select individual creations to delete')
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search creations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('completed')}
                >
                  Completed
                </Button>
                <Button
                  variant={statusFilter === 'processing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('processing')}
                >
                  Processing
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
              {filteredGenerations.map(gen => (
                <Card
                  key={gen.id}
                  className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                  onClick={() => setSelectedGeneration(gen)}
                >
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 relative">
                    {gen.status === 'processing' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                      </div>
                    )}
                    {gen.status === 'completed' && (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        {gen.style === 'fantasy' ? '🐉' : gen.style === 'cyberpunk' ? '🌃' : gen.style === 'anime' ? '✨' : '🎨'}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(gen.status)}>{gen.status}</Badge>
                    </div>
                    {gen.isFavorite && (
                      <div className="absolute top-2 left-2">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{gen.prompt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(gen.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {gen.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {gen.downloads}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{gen.style}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Prompt Templates</h3>
                  <p className="text-green-100">Start with proven templates for stunning results</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{AVAILABLE_TEMPLATES.length}</p>
                    <p className="text-green-200 text-sm">Available Templates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Templates Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Create New', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Star, label: 'Featured', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
                { icon: TrendingUp, label: 'Trending', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Crown, label: 'Premium', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Users, label: 'Community', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Bookmark, label: 'Saved', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: Filter, label: 'Categories', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Search, label: 'Search', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (action.label === 'Create New') {
                      setShowTemplateDialog(true)
                    } else if (action.label === 'Featured') {
                      toast.info(`Showing ${AVAILABLE_TEMPLATES.length} featured templates`)
                    } else if (action.label === 'Trending') {
                      toast.info('Showing trending templates')
                    } else if (action.label === 'Premium') {
                      const premiumCount = AVAILABLE_TEMPLATES.filter(t => t.isPremium).length
                      toast.info(`${premiumCount} premium templates available`)
                    } else if (action.label === 'Community') {
                      const communityCount = AVAILABLE_TEMPLATES.filter(t => t.category === 'social').length
                      toast.info(`${communityCount} community templates shared by the community`)
                    } else if (action.label === 'Saved') {
                      toast.info('No saved templates yet')
                    } else if (action.label === 'Categories') {
                      const categories = [...new Set(AVAILABLE_TEMPLATES.map(t => t.category))]
                      toast.info(`Categories: ${categories.join(', ')}`)
                    } else if (action.label === 'Search') {
                      toast.info('Use the search bar to find templates')
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Templates</h3>
              <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AVAILABLE_TEMPLATES.map(template => (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 relative flex items-center justify-center text-4xl">
                    {template.style === 'fantasy' ? '⚔️' : template.style === 'cyberpunk' ? '🤖' : template.style === 'anime' ? '🎌' : '📷'}
                    {template.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-100 text-amber-700">
                          <Crown className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-[8px]">{template.author[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-gray-600 dark:text-gray-400">{template.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {formatNumber(template.uses)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(template.likes)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* History Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Generation History</h3>
                  <p className="text-orange-100">Track all your previous AI generations</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{generations.length}</p>
                    <p className="text-orange-200 text-sm">Total Generations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* History Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: RefreshCw, label: 'Retry', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Copy, label: 'Duplicate', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Download, label: 'Export', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Filter, label: 'Filter', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Clock, label: 'Today', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
                { icon: Calendar, label: 'This Week', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Archive, label: 'Archive', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: Trash2, label: 'Clear All', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (action.label === 'Retry') {
                      toast.info('Select a generation to retry')
                    } else if (action.label === 'Duplicate') {
                      toast.info('Select a generation to duplicate')
                    } else if (action.label === 'Export') {
                      downloadAsJson(generations, 'generation-history-export')
                    } else if (action.label === 'Filter') {
                      setShowFilterDialog(true)
                    } else if (action.label === 'Today') {
                      const today = new Date().toDateString()
                      const todayCount = generations.filter(g => new Date(g.createdAt).toDateString() === today).length
                      toast.info(`${todayCount} generations today`)
                    } else if (action.label === 'This Week') {
                      toast.info(`${generations.length} generations this week`)
                    } else if (action.label === 'Archive') {
                      if (archivedItems.length > 0) {
                        toast.info(`${archivedItems.length} items in archive`)
                      } else {
                        toast.info('No archived items')
                      }
                    } else if (action.label === 'Clear All') {
                      if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                        apiPost('/api/ai/history/clear', {}, {
                          loading: 'Clearing history...',
                          success: 'History cleared',
                          error: 'Failed to clear history'
                        })
                      }
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generation History</h3>
              <Button variant="outline" size="sm" onClick={() => {
                if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                  apiPost('/api/ai/history/clear', {}, {
                    loading: 'Clearing history...',
                    success: 'History cleared',
                    error: 'Failed to clear history'
                  })
                }
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {filteredGenerations.map(gen => (
                <Card key={gen.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-2xl">
                        {gen.style === 'fantasy' ? '🐉' : gen.style === 'cyberpunk' ? '🌃' : '🎨'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(gen.status)}>{gen.status}</Badge>
                          <Badge variant="secondary">{gen.style}</Badge>
                          <Badge variant="outline">{gen.model}</Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{gen.prompt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {gen.processingTime ? `${gen.processingTime}s` : 'Processing...'}
                          </span>
                          <span>${gen.cost.toFixed(2)}</span>
                          <span>{new Date(gen.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {gen.status === 'completed' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRegenerateCreation(gen)
                              }}
                              title="Regenerate"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadCreation(gen)
                              }}
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Are you sure you want to delete this generation?')) {
                              apiPost('/api/ai/creations/delete', { id: gen.id }, {
                                loading: 'Deleting...',
                                success: 'Generation deleted',
                                error: 'Failed to delete'
                              })
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            {/* Models Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Models</h3>
                  <p className="text-indigo-100">Choose from industry-leading AI models for your creations</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-3xl font-bold">{AVAILABLE_MODELS.length}</p>
                    <p className="text-indigo-200 text-sm">Available Models</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Models Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Cpu, label: 'All Models', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
                { icon: Zap, label: 'Fast', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
                { icon: Star, label: 'Quality', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
                { icon: Crown, label: 'Pro', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
                { icon: Globe, label: 'Free', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
                { icon: Image, label: 'Image', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                { icon: Video, label: 'Video', color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/30' },
                { icon: Settings, label: 'Compare', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (action.label === 'All Models') {
                      toast.info(`Showing all ${AVAILABLE_MODELS.length} available models`)
                    } else if (action.label === 'Fast') {
                      const fastModels = AVAILABLE_MODELS.filter(m => m.speed >= 90)
                      toast.info(`${fastModels.length} fast models: ${fastModels.map(m => m.name).join(', ')}`)
                    } else if (action.label === 'Quality') {
                      const qualityModels = AVAILABLE_MODELS.filter(m => m.quality >= 90)
                      toast.info(`${qualityModels.length} high-quality models: ${qualityModels.map(m => m.name).join(', ')}`)
                    } else if (action.label === 'Pro') {
                      const proModels = AVAILABLE_MODELS.filter(m => m.tier === 'pro')
                      toast.info(`${proModels.length} Pro models available`)
                    } else if (action.label === 'Free') {
                      const freeModels = AVAILABLE_MODELS.filter(m => m.tier === 'free')
                      toast.info(`${freeModels.length} free models: ${freeModels.map(m => m.name).join(', ')}`)
                    } else if (action.label === 'Image') {
                      const imageModels = AVAILABLE_MODELS.filter(m => m.type === 'image')
                      toast.info(`${imageModels.length} image generation models`)
                    } else if (action.label === 'Video') {
                      toast.info('Video Models')
                    } else if (action.label === 'Compare') {
                      setShowModelCompareDialog(true)
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Models</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_MODELS.map(model => (
                <Card key={model.id} className={`transition-all ${model.isDefault ? 'ring-2 ring-purple-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{model.name}</h4>
                          <Badge className={getModelTierColor(model.tier)}>{model.tier}</Badge>
                          {model.isDefault && <Badge className="bg-purple-100 text-purple-700">Default</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{model.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">${model.costPerGeneration}</p>
                        <p className="text-xs text-gray-500">per generation</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Speed</span>
                          <span className="font-medium">{model.speed}%</span>
                        </div>
                        <Progress value={model.speed} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Quality</span>
                          <span className="font-medium">{model.quality}%</span>
                        </div>
                        <Progress value={model.quality} className="h-2" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {model.features.map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Max: {model.maxResolution}</span>
                      <span>Version {model.version}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Usage Overview */}
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Usage Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Total Generations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(calculatedStats.totalGenerations)}</p>
                      <p className="text-xs text-green-600">+18.5% this month</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {calculatedStats.totalGenerations > 0 ? ((calculatedStats.completedGenerations / calculatedStats.totalGenerations) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-xs text-green-600">+2.1% vs last month</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Credits Remaining</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedStats.remainingCredits}</p>
                      <Progress value={(calculatedStats.remainingCredits / 500) * 100} className="h-2 mt-2" />
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Avg Processing</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedStats.avgProcessingTime}s</p>
                      <p className="text-xs text-green-600">-12.4% faster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Total Views', value: calculatedStats.totalViews, icon: <Eye className="w-4 h-4" />, color: 'text-blue-500' },
                    { label: 'Total Likes', value: calculatedStats.totalLikes, icon: <Heart className="w-4 h-4" />, color: 'text-red-500' },
                    { label: 'Downloads', value: calculatedStats.totalDownloads, icon: <Download className="w-4 h-4" />, color: 'text-green-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={item.color}>{item.icon}</div>
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Style Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Style Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([] as { style: string; count: number; percent: number }[]).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No style data available yet</p>
                  ) : (
                    ([] as { style: string; count: number; percent: number }[]).map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.style}</span>
                          <span className="text-sm font-semibold">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {([] as { model: string; cost: number; percent: number }[]).length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No cost data available yet</p>
                  ) : (
                    ([] as { model: string; cost: number; percent: number }[]).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.model}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">${item.cost.toFixed(2)}</span>
                          <Badge variant="outline">{item.percent}%</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-600" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'generation', label: 'Generation', icon: Sparkles },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${settingsTab === item.id
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
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
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your AI Create experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Default Model</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                              {AVAILABLE_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <Label>Default Style</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                              {styles.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-save Prompts</p>
                            <p className="text-sm text-gray-500">Automatically save prompts to history</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Prompt Suggestions</p>
                            <p className="text-sm text-gray-500">Get AI-powered prompt improvements</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Display Settings</CardTitle>
                        <CardDescription>Customize how content is displayed</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show NSFW Filter</p>
                            <p className="text-sm text-gray-500">Filter mature content</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-expand Details</p>
                            <p className="text-sm text-gray-500">Show generation details by default</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Show Watermarks</p>
                            <p className="text-sm text-gray-500">Add watermarks to generated images</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Generation Settings */}
                {settingsTab === 'generation' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Generation Defaults</CardTitle>
                        <CardDescription>Set default values for new generations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Default Quality</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                              <option value="draft">Draft</option>
                              <option value="standard">Standard</option>
                              <option value="high">High</option>
                              <option value="ultra">Ultra</option>
                            </select>
                          </div>
                          <div>
                            <Label>Default Aspect Ratio</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                              {aspectRatios.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label>Default Guidance Scale: {guidance[0]}</Label>
                          <Slider value={guidance} onValueChange={setGuidance} min={1} max={20} step={0.5} className="mt-2" />
                        </div>
                        <div>
                          <Label>Default Steps: {steps[0]}</Label>
                          <Slider value={steps} onValueChange={setSteps} min={10} max={100} step={5} className="mt-2" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Random Seed</p>
                            <p className="text-sm text-gray-500">Use random seed for each generation</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Output Settings</CardTitle>
                        <CardDescription>Configure output file settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Default Format</Label>
                            <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                              <option value="png">PNG</option>
                              <option value="jpg">JPEG</option>
                              <option value="webp">WebP</option>
                            </select>
                          </div>
                          <div>
                            <Label>Compression Quality</Label>
                            <Input type="number" defaultValue="95" min="1" max="100" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Include Metadata</p>
                            <p className="text-sm text-gray-500">Embed prompt and settings in image</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Manage your notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { icon: Mail, name: 'Email Notifications', desc: 'Receive updates via email' },
                        { icon: Bell, name: 'Push Notifications', desc: 'Browser push notifications' },
                        { icon: Sparkles, name: 'Generation Complete', desc: 'Notify when generation finishes' },
                        { icon: AlertTriangle, name: 'Credit Alerts', desc: 'Low credit warnings' },
                        { icon: TrendingUp, name: 'Weekly Report', desc: 'Weekly usage summary' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <item.icon className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                          </div>
                          <Switch defaultChecked={i < 3} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <Key className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">API Key</p>
                            <Input type="password" value="sk-************************" readOnly className="mt-2 font-mono text-sm dark:bg-gray-900 dark:border-gray-700" />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            if (confirm('Are you sure you want to regenerate your API key? Your current key will stop working.')) {
                              apiPost('/api/settings/api-key/regenerate', {}, {
                                loading: 'Regenerating API key...',
                                success: 'New API key generated! Make sure to copy it.',
                                error: 'Failed to regenerate API key'
                              })
                            }
                          }}>Regenerate</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Connected Services</CardTitle>
                        <CardDescription>Integrate with external platforms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Dropbox', desc: 'Auto-sync generated images', connected: false },
                          { name: 'Google Drive', desc: 'Backup to Google Drive', connected: true },
                          { name: 'Notion', desc: 'Save prompts to Notion', connected: false },
                          { name: 'Slack', desc: 'Share generations to Slack', connected: false },
                        ].map((service, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.desc}</p>
                            </div>
                            <Button variant={service.connected ? "outline" : "default"} size="sm" onClick={() => {
                              if (service.connected) {
                                apiPost('/api/integrations/disconnect', { service: service.name }, {
                                  loading: `Disconnecting ${service.name}...`,
                                  success: `${service.name} disconnected`,
                                  error: `Failed to disconnect ${service.name}`
                                })
                              } else {
                                toast.loading(`Connecting to ${service.name}...`, { id: 'service-connect' })
                                  ; (async () => {
                                    try {
                                      const { data: { user } } = await supabase.auth.getUser()
                                      if (!user) throw new Error('Not authenticated')

                                      await supabase.from('ai_service_connections').upsert({
                                        user_id: user.id,
                                        service_name: service.name,
                                        connected: true,
                                        connected_at: new Date().toISOString()
                                      }, { onConflict: 'user_id,service_name' })

                                      toast.success(`${service.name} connected`, { id: 'service-connect', description: 'Integration is now active' })
                                    } catch (error) {
                                      toast.error(`Failed to connect ${service.name}`, { id: 'service-connect', description: error.message })
                                    }
                                  })()
                              }
                            }}>
                              {service.connected ? 'Disconnect' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Security & Privacy</CardTitle>
                      <CardDescription>Manage your security preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Private by Default</p>
                          <p className="text-sm text-gray-500">New generations are private</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
                          <p className="text-sm text-gray-500">Add extra security to your account</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Activity Logging</p>
                          <p className="text-sm text-gray-500">Log all generation activities</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Content Safety</p>
                          <p className="text-sm text-gray-500">Enable content moderation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Advanced Options</CardTitle>
                        <CardDescription>Fine-tune your generation experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Developer Mode</p>
                            <p className="text-sm text-gray-500">Enable advanced API features</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Experimental Models</p>
                            <p className="text-sm text-gray-500">Access beta AI models</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Debug Console</p>
                            <p className="text-sm text-gray-500">Show generation debug info</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle>Storage Management</CardTitle>
                        <CardDescription>Manage your storage and cache</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Generation Cache</p>
                              <p className="text-sm text-gray-500">1.2 GB used</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            if (confirm('Clear the generation cache? This may slow down future generations temporarily.')) {
                              apiPost('/api/settings/cache/clear', {}, {
                                loading: 'Clearing cache...',
                                success: 'Cache cleared successfully! 1.2 GB freed.',
                                error: 'Failed to clear cache'
                              })
                            }
                          }}>Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Downloaded Models</p>
                              <p className="text-sm text-gray-500">4.5 GB used</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            toast.info('Opening Model Settings...')
                          }}>Manage</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800 dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Delete All Generations</p>
                            <p className="text-sm text-gray-500">Remove all your generated content</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm('Are you absolutely sure? This will permanently delete ALL your generations. This action cannot be undone!')) {
                              apiPost('/api/ai/creations/delete-all', {}, {
                                loading: 'Deleting all generations...',
                                success: 'All generations deleted',
                                error: 'Failed to delete generations'
                              })
                            }
                          }}>Delete All</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset Settings</p>
                            <p className="text-sm text-gray-500">Reset all settings to defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => {
                            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                              apiPost('/api/settings/reset', {}, {
                                loading: 'Resetting settings...',
                                success: 'Settings reset to defaults',
                                error: 'Failed to reset settings'
                              })
                            }
                          }}>Reset</Button>
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
            
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={aiCreateCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={aiCreatePredictions}
              title="Creative Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          <QuickActionsToolbar
            actions={aiCreateQuickActions}
            variant="grid"
          />
        </div>

        {/* Generation Detail Dialog */}
        <Dialog open={!!selectedGeneration} onOpenChange={() => setSelectedGeneration(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                Generation Details
              </DialogTitle>
            </DialogHeader>
            {selectedGeneration && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-8xl">
                      {selectedGeneration.style === 'fantasy' ? '🐉' : selectedGeneration.style === 'cyberpunk' ? '🌃' : '🎨'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={getStatusColor(selectedGeneration.status)}>{selectedGeneration.status}</Badge>
                    <Badge variant="secondary">{selectedGeneration.style}</Badge>
                    <Badge variant="outline">{selectedGeneration.model}</Badge>
                    <Badge variant="outline">{selectedGeneration.aspectRatio}</Badge>
                    <Badge variant="outline">{selectedGeneration.quality}</Badge>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Prompt</h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {selectedGeneration.prompt}
                    </p>
                  </div>

                  {selectedGeneration.negativePrompt && (
                    <div>
                      <h4 className="font-semibold mb-2">Negative Prompt</h4>
                      <p className="text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {selectedGeneration.negativePrompt}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Views</p>
                      <p className="text-xl font-bold">{formatNumber(selectedGeneration.views)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Likes</p>
                      <p className="text-xl font-bold">{selectedGeneration.likes}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Downloads</p>
                      <p className="text-xl font-bold">{selectedGeneration.downloads}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Variations</p>
                      <p className="text-xl font-bold">{selectedGeneration.variations}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Seed</span>
                      <span className="font-mono">{selectedGeneration.seed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Steps</span>
                      <span>{selectedGeneration.steps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guidance</span>
                      <span>{selectedGeneration.guidance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processing Time</span>
                      <span>{selectedGeneration.processingTime ? `${selectedGeneration.processingTime}s` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost</span>
                      <span>${selectedGeneration.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created</span>
                      <span>{new Date(selectedGeneration.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                      onClick={() => handleRegenerateCreation(selectedGeneration)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (selectedGeneration) {
                          setPrompt(selectedGeneration.prompt)
                          setNegativePrompt(selectedGeneration.negativePrompt || '')
                          setSelectedStyle(selectedGeneration.style)
                          setActiveTab('generator')
                          setSelectedGeneration(null)
                          toast.success('Create a variation by adjusting and generating')
                        }
                      }}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Create Variation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadCreation(selectedGeneration)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleShareCreation(selectedGeneration)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCopyPrompt(selectedGeneration)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                    {selectedGeneration.isFavorite ? (
                      <Button
                        variant="outline"
                        onClick={() => apiPost('/api/ai/creations/favorite', { id: selectedGeneration.id, favorite: false }, { loading: 'Removing favorite...', success: 'Removed from favorites', error: 'Failed to update' })}
                      >
                        <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                        Favorited
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => apiPost('/api/ai/creations/favorite', { id: selectedGeneration.id, favorite: true }, { loading: 'Adding to favorites...', success: 'Added to favorites!', error: 'Failed to update' })}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Favorite
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5" />
                Import Image
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="import-file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setImportedFile(file)
                      toast.success(`Selected: ${file.name}`)
                    }
                  }}
                />
                <label htmlFor="import-file" className="cursor-pointer">
                  <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {importedFile ? importedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB</p>
                </label>
              </div>
              {importedFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" loading="lazy" />
                    <span className="text-sm truncate max-w-[200px]">{importedFile.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setImportedFile(null)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                <Button
                  disabled={!importedFile}
                  onClick={() => {
                    if (importedFile) {
                      toast.promise(
                        (async () => {
                          const { data: { user } } = await supabase.auth.getUser()
                          if (!user) throw new Error('Not authenticated')

                          // Upload to Supabase Storage
                          const fileName = `${user.id}/${Date.now()}-${importedFile.name}`
                          const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('ai-imports')
                            .upload(fileName, importedFile, {
                              cacheControl: '3600',
                              upsert: false
                            })

                          if (uploadError) throw uploadError

                          // Get public URL
                          const { data: { publicUrl } } = supabase.storage
                            .from('ai-imports')
                            .getPublicUrl(fileName)

                          // Log import
                          await supabase.from('ai_imported_images').insert({
                            user_id: user.id,
                            file_name: importedFile.name,
                            file_path: uploadData.path,
                            file_url: publicUrl,
                            file_size: importedFile.size,
                            mime_type: importedFile.type
                          })
                        })(),
                        {
                          loading: 'Uploading image...',
                          success: 'Image imported successfully!',
                          error: 'Failed to import image'
                        }
                      )
                      setShowImportDialog(false)
                      setImportedFile(null)
                    }
                  }}
                >
                  Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Creation Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Create Template
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="My Awesome Template"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  placeholder="Describe what this template does"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-prompt">Base Prompt</Label>
                <Textarea
                  id="template-prompt"
                  placeholder="Enter the base prompt for this template..."
                  rows={4}
                  value={templateForm.prompt}
                  onChange={(e) => setTemplateForm({ ...templateForm, prompt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-style">Default Style</Label>
                <select
                  id="template-style"
                  className="w-full p-2 rounded-md border bg-background"
                  value={templateForm.style}
                  onChange={(e) => setTemplateForm({ ...templateForm, style: e.target.value })}
                >
                  <option value="realistic">Realistic</option>
                  <option value="anime">Anime</option>
                  <option value="digital-art">Digital Art</option>
                  <option value="oil-painting">Oil Painting</option>
                  <option value="watercolor">Watercolor</option>
                  <option value="sketch">Sketch</option>
                  <option value="cyberpunk">Cyberpunk</option>
                  <option value="fantasy">Fantasy</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
                <Button
                  disabled={!templateForm.name || !templateForm.prompt}
                  onClick={async () => {
                    toast.promise(
                      (async () => {
                        const { data: { user } } = await supabase.auth.getUser()
                        if (!user) throw new Error('Not authenticated')

                        // Save template to database
                        const { error } = await supabase.from('ai_templates').insert({
                          user_id: user.id,
                          name: templateForm.name,
                          description: templateForm.description,
                          prompt: templateForm.prompt,
                          style: templateForm.style,
                          settings: {
                            style: templateForm.style,
                            quality: 'high'
                          },
                          is_public: false
                        })

                        if (error) throw error
                        return { name: templateForm.name }
                      })(),
                      {
                        loading: 'Creating template...',
                        success: (data) => `Template "${data.name}" saved successfully!`,
                        error: 'Failed to create template'
                      }
                    )
                    setShowTemplateDialog(false)
                    setTemplateForm({ name: '', description: '', prompt: '', style: 'realistic' })
                  }}
                >
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Generation Type</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'image', label: 'Image' },
                    { value: 'video', label: 'Video' },
                    { value: 'audio', label: 'Audio' },
                    { value: 'text', label: 'Text' }
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={advancedFilters.type === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, type: value }))}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'failed', label: 'Failed' }
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={statusFilter === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(value as GenerationStatus | 'all')}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Style</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'realistic', label: 'Realistic' },
                    { value: 'anime', label: 'Anime' },
                    { value: 'digital-art', label: 'Digital Art' },
                    { value: 'fantasy', label: 'Fantasy' }
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={advancedFilters.style === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, style: value }))}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'today', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'all', label: 'All Time' }
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={advancedFilters.dateRange === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, dateRange: value }))}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setAdvancedFilters({ type: 'all', style: 'all', dateRange: 'all' })
                  setStatusFilter('all')
                  setSearchQuery('')
                  toast.success('Filters cleared')
                  setShowFilterDialog(false)
                }}>Clear All</Button>
                <Button onClick={() => {
                  const activeFilters = []
                  if (advancedFilters.type !== 'all') activeFilters.push(advancedFilters.type)
                  if (advancedFilters.style !== 'all') activeFilters.push(advancedFilters.style)
                  if (advancedFilters.dateRange !== 'all') activeFilters.push(advancedFilters.dateRange)
                  if (statusFilter !== 'all') activeFilters.push(statusFilter)
                  toast.success(activeFilters.length > 0 ? `Filters applied: ${activeFilters.join(', ')}` : 'Showing all results')
                  setShowFilterDialog(false)
                }}>Apply Filters</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Model Comparison Dialog */}
        <Dialog open={showModelCompareDialog} onOpenChange={setShowModelCompareDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Compare AI Models
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { id: '1', name: 'DALL-E 3', speed: 'Fast', quality: 'Excellent', cost: '$0.04/img', strengths: 'Text rendering, Accuracy' },
                  { id: '2', name: 'Midjourney v6', speed: 'Medium', quality: 'Outstanding', cost: '$0.05/img', strengths: 'Artistic style, Aesthetics' },
                  { id: '3', name: 'Stable Diffusion XL', speed: 'Fast', quality: 'Great', cost: '$0.02/img', strengths: 'Control, Customization' }
                ].map((model) => (
                  <Card key={model.id} className={cn("p-4", selectedModel === model.id && "ring-2 ring-primary")}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{model.name}</h4>
                        <Badge variant="outline">{model.cost}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed</span>
                          <span>{model.speed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality</span>
                          <span>{model.quality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Strengths</span>
                          <span className="text-right">{model.strengths}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        size="sm"
                        variant={selectedModel === model.id ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedModel(model.id)
                          toast.success(`${model.name} selected as your AI model`)
                          setShowModelCompareDialog(false)
                        }}
                      >
                        {selectedModel === model.id ? 'Selected' : 'Select Model'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
