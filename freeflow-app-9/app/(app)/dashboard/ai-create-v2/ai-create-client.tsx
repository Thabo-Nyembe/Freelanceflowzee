"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
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
  Play,
  Pause,
  Eye,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Send,
  Camera,
  Video,
  FileText,
  Code,
  Music,
  Mic,
  Globe,
  Lock,
  Users,
  Crown,
  Gem,
  Flame,
  Target,
  Activity,
  DollarSign,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Maximize2,
  Square,
  RectangleHorizontal,
  RectangleVertical
} from 'lucide-react'

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
// MOCK DATA
// ============================================================================

const mockGenerations: Generation[] = [
  {
    id: '1',
    prompt: 'A majestic dragon flying over a medieval castle at sunset, dramatic lighting, highly detailed scales',
    negativePrompt: 'blurry, low quality, distorted',
    type: 'image',
    status: 'completed',
    style: 'fantasy',
    aspectRatio: '16:9',
    quality: 'ultra',
    model: 'Midjourney V6',
    seed: 42857291,
    steps: 50,
    guidance: 7.5,
    imageUrl: '/api/placeholder/1920/1080',
    thumbnailUrl: '/api/placeholder/400/225',
    likes: 342,
    downloads: 89,
    views: 1250,
    isPublic: true,
    isFavorite: true,
    variations: 4,
    createdAt: '2024-07-10T14:30:00Z',
    completedAt: '2024-07-10T14:31:45Z',
    processingTime: 105,
    cost: 0.08,
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: '',
    tags: ['dragon', 'fantasy', 'castle', 'sunset']
  },
  {
    id: '2',
    prompt: 'Cyberpunk city street at night with neon signs, rain-soaked pavement, futuristic vehicles',
    type: 'image',
    status: 'completed',
    style: 'cyberpunk',
    aspectRatio: '21:9',
    quality: 'high',
    model: 'SDXL Turbo',
    seed: 98234567,
    steps: 30,
    guidance: 8.0,
    imageUrl: '/api/placeholder/2560/1080',
    thumbnailUrl: '/api/placeholder/400/170',
    likes: 567,
    downloads: 234,
    views: 3450,
    isPublic: true,
    isFavorite: false,
    variations: 6,
    createdAt: '2024-07-10T12:15:00Z',
    completedAt: '2024-07-10T12:15:45Z',
    processingTime: 45,
    cost: 0.05,
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: '',
    tags: ['cyberpunk', 'neon', 'city', 'night']
  },
  {
    id: '3',
    prompt: 'Serene Japanese garden with cherry blossoms, koi pond, traditional architecture',
    type: 'image',
    status: 'processing',
    style: 'watercolor',
    aspectRatio: '4:3',
    quality: 'ultra',
    model: 'Midjourney V6',
    seed: 55678901,
    steps: 50,
    guidance: 7.0,
    likes: 0,
    downloads: 0,
    views: 0,
    isPublic: false,
    isFavorite: false,
    variations: 0,
    createdAt: '2024-07-10T15:00:00Z',
    cost: 0.08,
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: '',
    tags: ['japan', 'garden', 'peaceful', 'nature']
  },
  {
    id: '4',
    prompt: 'Portrait of a wise old wizard with long beard, magical staff, mystical aura',
    type: 'image',
    status: 'completed',
    style: 'oil-painting',
    aspectRatio: '3:4',
    quality: 'high',
    model: 'DALL-E 3',
    seed: 12345678,
    steps: 40,
    guidance: 7.5,
    imageUrl: '/api/placeholder/900/1200',
    thumbnailUrl: '/api/placeholder/300/400',
    likes: 189,
    downloads: 45,
    views: 890,
    isPublic: true,
    isFavorite: true,
    variations: 3,
    createdAt: '2024-07-09T16:20:00Z',
    completedAt: '2024-07-09T16:21:30Z',
    processingTime: 90,
    cost: 0.04,
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: '',
    tags: ['wizard', 'portrait', 'magical', 'fantasy']
  },
  {
    id: '5',
    prompt: 'Modern minimalist interior design, Scandinavian style living room, natural light',
    type: 'image',
    status: 'completed',
    style: 'realistic',
    aspectRatio: '16:9',
    quality: 'standard',
    model: 'Stable Diffusion 3',
    seed: 87654321,
    steps: 25,
    guidance: 6.5,
    imageUrl: '/api/placeholder/1920/1080',
    thumbnailUrl: '/api/placeholder/400/225',
    likes: 423,
    downloads: 156,
    views: 2100,
    isPublic: true,
    isFavorite: false,
    variations: 2,
    createdAt: '2024-07-08T10:45:00Z',
    completedAt: '2024-07-08T10:45:30Z',
    processingTime: 30,
    cost: 0.02,
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: '',
    tags: ['interior', 'minimalist', 'modern', 'scandinavian']
  }
]

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Epic Fantasy Landscape',
    description: 'Create stunning fantasy landscapes with dramatic lighting',
    prompt: 'Epic fantasy landscape, mountains, waterfalls, magical forest, dramatic sunset sky, highly detailed, cinematic',
    negativePrompt: 'blurry, low quality, modern elements',
    style: 'fantasy',
    category: 'Landscapes',
    thumbnail: '/api/placeholder/400/300',
    uses: 12450,
    likes: 3456,
    author: 'AI Studio',
    authorAvatar: '',
    isPremium: false,
    tags: ['fantasy', 'landscape', 'epic']
  },
  {
    id: '2',
    name: 'Cyberpunk Portrait',
    description: 'Futuristic cyberpunk-style character portraits',
    prompt: 'Cyberpunk portrait, neon lights, futuristic implants, dark atmosphere, high detail',
    style: 'cyberpunk',
    category: 'Portraits',
    thumbnail: '/api/placeholder/400/300',
    uses: 8920,
    likes: 2890,
    author: 'NeonArtist',
    authorAvatar: '',
    isPremium: true,
    tags: ['cyberpunk', 'portrait', 'neon']
  },
  {
    id: '3',
    name: 'Anime Character Design',
    description: 'Create beautiful anime-style character illustrations',
    prompt: 'Anime character, detailed eyes, flowing hair, dynamic pose, studio quality',
    style: 'anime',
    category: 'Characters',
    thumbnail: '/api/placeholder/400/300',
    uses: 25600,
    likes: 8450,
    author: 'AnimeStudio',
    authorAvatar: '',
    isPremium: false,
    tags: ['anime', 'character', 'illustration']
  },
  {
    id: '4',
    name: 'Product Photography',
    description: 'Professional product photography with studio lighting',
    prompt: 'Professional product photography, studio lighting, clean background, high detail, commercial quality',
    style: 'realistic',
    category: 'Commercial',
    thumbnail: '/api/placeholder/400/300',
    uses: 15800,
    likes: 4560,
    author: 'ProStudio',
    authorAvatar: '',
    isPremium: true,
    tags: ['product', 'commercial', 'photography']
  }
]

const mockModels: AIModel[] = [
  {
    id: '1',
    name: 'Midjourney V6',
    description: 'Latest Midjourney model with exceptional quality and creativity',
    version: '6.0',
    tier: 'pro',
    type: 'image',
    speed: 75,
    quality: 98,
    costPerGeneration: 0.08,
    maxResolution: '4096x4096',
    features: ['Upscaling', 'Variations', 'Pan & Zoom', 'Style Tuning'],
    isDefault: true
  },
  {
    id: '2',
    name: 'DALL-E 3',
    description: 'OpenAI\'s most advanced text-to-image model',
    version: '3.0',
    tier: 'pro',
    type: 'image',
    speed: 85,
    quality: 95,
    costPerGeneration: 0.04,
    maxResolution: '1792x1024',
    features: ['Natural Language', 'Text Rendering', 'Content Safety'],
    isDefault: false
  },
  {
    id: '3',
    name: 'Stable Diffusion 3',
    description: 'Open-source model with excellent customization',
    version: '3.0',
    tier: 'free',
    type: 'image',
    speed: 90,
    quality: 88,
    costPerGeneration: 0.02,
    maxResolution: '2048x2048',
    features: ['ControlNet', 'LoRA', 'Custom Training'],
    isDefault: false
  },
  {
    id: '4',
    name: 'SDXL Turbo',
    description: 'Ultra-fast generation with real-time preview',
    version: '1.0',
    tier: 'free',
    type: 'image',
    speed: 99,
    quality: 80,
    costPerGeneration: 0.01,
    maxResolution: '1024x1024',
    features: ['Real-time', 'Low Latency', 'Batch Generation'],
    isDefault: false
  }
]

const mockUsageStats: UsageStats = {
  totalGenerations: 1245,
  completedGenerations: 1198,
  failedGenerations: 47,
  totalCredits: 500,
  usedCredits: 342,
  remainingCredits: 158,
  avgProcessingTime: 45,
  totalLikes: 15890,
  totalDownloads: 4567,
  totalViews: 89450,
  favoriteStyle: 'fantasy',
  generationsThisMonth: 234
}

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
    image: <Image className="w-4 h-4" />,
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AICreateClient() {
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

  // Filtered generations
  const filteredGenerations = useMemo(() => {
    return mockGenerations.filter(gen => {
      const matchesSearch = gen.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || gen.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

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

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
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
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-gray-900 dark:text-white">{mockUsageStats.remainingCredits}</span>
                <span className="text-sm text-gray-500">credits</span>
              </div>
            </div>
            <Button variant="outline">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Generations', value: formatNumber(mockUsageStats.totalGenerations), change: 18.5, icon: Sparkles, color: 'from-violet-500 to-purple-500' },
            { label: 'This Month', value: mockUsageStats.generationsThisMonth.toString(), change: 24.3, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Credits Used', value: mockUsageStats.usedCredits.toString(), change: -5.2, icon: Zap, color: 'from-amber-500 to-orange-500' },
            { label: 'Avg Time', value: `${mockUsageStats.avgProcessingTime}s`, change: -12.4, icon: Clock, color: 'from-green-500 to-emerald-500' },
            { label: 'Total Views', value: formatNumber(mockUsageStats.totalViews), change: 45.7, icon: Eye, color: 'from-pink-500 to-rose-500' },
            { label: 'Total Likes', value: formatNumber(mockUsageStats.totalLikes), change: 32.1, icon: Heart, color: 'from-red-500 to-pink-500' },
            { label: 'Downloads', value: formatNumber(mockUsageStats.totalDownloads), change: 28.9, icon: Download, color: 'from-teal-500 to-cyan-500' },
            { label: 'Success Rate', value: `${((mockUsageStats.completedGenerations / mockUsageStats.totalGenerations) * 100).toFixed(0)}%`, change: 2.1, icon: Target, color: 'from-indigo-500 to-blue-500' }
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
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
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
                      <div className="grid grid-cols-5 gap-2">
                        {styles.map(style => (
                          <button
                            key={style.value}
                            onClick={() => setSelectedStyle(style.value)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              selectedStyle === style.value
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              selectedRatio === ratio.value
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
                        {mockModels.map(model => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`w-full p-3 rounded-lg text-left transition-all ${
                              selectedModel === model.id
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
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              quality === q
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
          <TabsContent value="gallery" className="space-y-4">
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
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Templates</h3>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockTemplates.map(template => (
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
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generation History</h3>
              <Button variant="outline" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="space-y-3">
              {mockGenerations.map(gen => (
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
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
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
          <TabsContent value="models" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Models</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockModels.map(model => (
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

                    <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Total Generations</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(mockUsageStats.totalGenerations)}</p>
                      <p className="text-xs text-green-600">+18.5% this month</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((mockUsageStats.completedGenerations / mockUsageStats.totalGenerations) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-green-600">+2.1% vs last month</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Credits Remaining</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockUsageStats.remainingCredits}</p>
                      <Progress value={(mockUsageStats.remainingCredits / mockUsageStats.totalCredits) * 100} className="h-2 mt-2" />
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Avg Processing</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockUsageStats.avgProcessingTime}s</p>
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
                    { label: 'Total Views', value: mockUsageStats.totalViews, icon: <Eye className="w-4 h-4" />, color: 'text-blue-500' },
                    { label: 'Total Likes', value: mockUsageStats.totalLikes, icon: <Heart className="w-4 h-4" />, color: 'text-red-500' },
                    { label: 'Downloads', value: mockUsageStats.totalDownloads, icon: <Download className="w-4 h-4" />, color: 'text-green-500' }
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
                  {[
                    { style: 'Fantasy', count: 345, percent: 28 },
                    { style: 'Cyberpunk', count: 289, percent: 23 },
                    { style: 'Realistic', count: 234, percent: 19 },
                    { style: 'Anime', count: 198, percent: 16 },
                    { style: 'Other', count: 179, percent: 14 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.style}</span>
                        <span className="text-sm font-semibold">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
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
                  {[
                    { model: 'Midjourney V6', cost: 15.60, percent: 45 },
                    { model: 'DALL-E 3', cost: 8.40, percent: 24 },
                    { model: 'Stable Diffusion 3', cost: 6.80, percent: 20 },
                    { model: 'SDXL Turbo', cost: 3.80, percent: 11 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.model}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">${item.cost.toFixed(2)}</span>
                        <Badge variant="outline">{item.percent}%</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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

                  <div className="grid grid-cols-4 gap-4">
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

                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button variant="outline">
                      <Layers className="w-4 h-4 mr-2" />
                      Create Variation
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    {selectedGeneration.isFavorite ? (
                      <Button variant="outline">
                        <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                        Favorited
                      </Button>
                    ) : (
                      <Button variant="outline">
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
      </div>
    </div>
  )
}
