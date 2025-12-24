'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Wand2,
  Sparkles,
  Image,
  Palette,
  Layers,
  Download,
  RefreshCw,
  Settings,
  Zap,
  Eye,
  Heart,
  Share2,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid3x3,
  List,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Copy,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Sliders,
  Paintbrush,
  Eraser,
  Shapes,
  Type,
  Upload,
  FolderPlus,
  Bookmark,
  History,
  Cpu,
  MoreHorizontal,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Crown,
  Lightbulb,
  ArrowUpRight,
  ImagePlus,
  Shuffle,
  Ratio,
  SlidersHorizontal,
  Sun,
  Moon,
  Contrast,
  Droplet,
  Focus,
  Aperture,
  Film,
  Bell,
  HelpCircle
} from 'lucide-react'

// Types
type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'upscaling'
type StylePreset = 'photorealistic' | 'anime' | 'digital_art' | 'oil_painting' | 'watercolor' | 'sketch' | '3d_render' | 'neon' | 'vintage' | 'minimalist'
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '2:3' | '3:2'
type QualityLevel = 'draft' | 'standard' | 'high' | 'ultra'
type ModelType = 'midjourney_v6' | 'midjourney_v5' | 'dalle_3' | 'stable_diffusion' | 'flux_pro'

interface Generation {
  id: string
  prompt: string
  negativePrompt?: string
  style: StylePreset
  model: ModelType
  aspectRatio: AspectRatio
  quality: QualityLevel
  status: GenerationStatus
  imageUrl?: string
  thumbnailUrl?: string
  seed?: number
  likes: number
  views: number
  downloads: number
  isFavorite: boolean
  isPublic: boolean
  variations?: string[]
  upscaledUrl?: string
  createdAt: string
  generationTime?: number
  creditsUsed: number
}

interface Collection {
  id: string
  name: string
  description?: string
  coverImage?: string
  itemCount: number
  isPrivate: boolean
  createdAt: string
}

interface PromptHistory {
  id: string
  prompt: string
  style: StylePreset
  usedAt: string
  resultCount: number
  isFavorite: boolean
}

interface StyleTemplate {
  id: string
  name: string
  description: string
  preview: string
  style: StylePreset
  promptModifiers: string
  isPopular: boolean
  usageCount: number
}

interface AIDesignStats {
  totalGenerations: number
  completedGenerations: number
  totalCredits: number
  creditsUsed: number
  totalLikes: number
  totalDownloads: number
  avgGenerationTime: number
  favoriteCount: number
}

// Mock data
const mockGenerations: Generation[] = [
  {
    id: '1',
    prompt: 'A majestic dragon flying over a neon-lit cyberpunk city at night, highly detailed, cinematic lighting',
    negativePrompt: 'blurry, low quality',
    style: 'digital_art',
    model: 'midjourney_v6',
    aspectRatio: '16:9',
    quality: 'high',
    status: 'completed',
    imageUrl: '/generated/dragon-city.jpg',
    thumbnailUrl: '/generated/dragon-city-thumb.jpg',
    seed: 12345678,
    likes: 245,
    views: 1842,
    downloads: 89,
    isFavorite: true,
    isPublic: true,
    createdAt: '2024-12-23T14:30:00Z',
    generationTime: 12500,
    creditsUsed: 5
  },
  {
    id: '2',
    prompt: 'Serene Japanese garden with cherry blossoms, koi pond, traditional architecture, morning mist',
    style: 'photorealistic',
    model: 'midjourney_v6',
    aspectRatio: '3:2',
    quality: 'ultra',
    status: 'completed',
    imageUrl: '/generated/japanese-garden.jpg',
    thumbnailUrl: '/generated/japanese-garden-thumb.jpg',
    seed: 98765432,
    likes: 189,
    views: 1256,
    downloads: 67,
    isFavorite: true,
    isPublic: true,
    createdAt: '2024-12-23T10:15:00Z',
    generationTime: 18200,
    creditsUsed: 8
  },
  {
    id: '3',
    prompt: 'Portrait of a warrior princess with flowing silver hair, intricate armor, fantasy style',
    style: 'anime',
    model: 'midjourney_v6',
    aspectRatio: '2:3',
    quality: 'high',
    status: 'processing',
    likes: 0,
    views: 0,
    downloads: 0,
    isFavorite: false,
    isPublic: false,
    createdAt: '2024-12-24T08:45:00Z',
    creditsUsed: 5
  },
  {
    id: '4',
    prompt: 'Abstract geometric patterns with gold and marble textures, luxury design',
    style: 'minimalist',
    model: 'dalle_3',
    aspectRatio: '1:1',
    quality: 'standard',
    status: 'completed',
    imageUrl: '/generated/abstract-geo.jpg',
    thumbnailUrl: '/generated/abstract-geo-thumb.jpg',
    seed: 55667788,
    likes: 78,
    views: 534,
    downloads: 23,
    isFavorite: false,
    isPublic: true,
    createdAt: '2024-12-22T16:20:00Z',
    generationTime: 8500,
    creditsUsed: 3
  },
  {
    id: '5',
    prompt: 'Cozy coffee shop interior, warm lighting, rustic wood, plants, hygge atmosphere',
    style: 'photorealistic',
    model: 'stable_diffusion',
    aspectRatio: '16:9',
    quality: 'high',
    status: 'completed',
    imageUrl: '/generated/coffee-shop.jpg',
    thumbnailUrl: '/generated/coffee-shop-thumb.jpg',
    seed: 11223344,
    likes: 156,
    views: 892,
    downloads: 45,
    isFavorite: false,
    isPublic: true,
    createdAt: '2024-12-21T09:30:00Z',
    generationTime: 11200,
    creditsUsed: 5
  },
  {
    id: '6',
    prompt: 'Futuristic sports car, sleek design, holographic elements, studio lighting',
    style: '3d_render',
    model: 'midjourney_v6',
    aspectRatio: '16:9',
    quality: 'ultra',
    status: 'upscaling',
    imageUrl: '/generated/sports-car.jpg',
    thumbnailUrl: '/generated/sports-car-thumb.jpg',
    seed: 44556677,
    likes: 312,
    views: 2156,
    downloads: 134,
    isFavorite: true,
    isPublic: true,
    createdAt: '2024-12-20T14:45:00Z',
    generationTime: 15800,
    creditsUsed: 8
  }
]

const mockCollections: Collection[] = [
  { id: '1', name: 'Fantasy Worlds', description: 'Epic fantasy landscapes and characters', itemCount: 24, isPrivate: false, createdAt: '2024-12-01' },
  { id: '2', name: 'Architecture', description: 'Modern and futuristic buildings', itemCount: 18, isPrivate: false, createdAt: '2024-11-15' },
  { id: '3', name: 'Character Designs', description: 'Character concepts and portraits', itemCount: 32, isPrivate: true, createdAt: '2024-12-10' },
  { id: '4', name: 'Product Mockups', description: 'Commercial product visualizations', itemCount: 15, isPrivate: true, createdAt: '2024-12-18' }
]

const mockPromptHistory: PromptHistory[] = [
  { id: '1', prompt: 'A majestic dragon flying over a neon-lit cyberpunk city', style: 'digital_art', usedAt: '2024-12-23T14:30:00Z', resultCount: 4, isFavorite: true },
  { id: '2', prompt: 'Serene Japanese garden with cherry blossoms', style: 'photorealistic', usedAt: '2024-12-23T10:15:00Z', resultCount: 4, isFavorite: true },
  { id: '3', prompt: 'Abstract geometric patterns with gold textures', style: 'minimalist', usedAt: '2024-12-22T16:20:00Z', resultCount: 4, isFavorite: false },
  { id: '4', prompt: 'Cozy coffee shop interior, warm lighting', style: 'photorealistic', usedAt: '2024-12-21T09:30:00Z', resultCount: 4, isFavorite: false },
  { id: '5', prompt: 'Futuristic sports car with holographic elements', style: '3d_render', usedAt: '2024-12-20T14:45:00Z', resultCount: 4, isFavorite: true }
]

const styleTemplates: StyleTemplate[] = [
  { id: '1', name: 'Cinematic', description: 'Movie-quality dramatic lighting', preview: '/styles/cinematic.jpg', style: 'photorealistic', promptModifiers: 'cinematic lighting, dramatic, film grain, anamorphic', isPopular: true, usageCount: 12500 },
  { id: '2', name: 'Anime Hero', description: 'Japanese anime style characters', preview: '/styles/anime.jpg', style: 'anime', promptModifiers: 'anime style, detailed, vibrant colors, studio ghibli inspired', isPopular: true, usageCount: 9800 },
  { id: '3', name: 'Cyberpunk Neon', description: 'Futuristic neon aesthetics', preview: '/styles/cyberpunk.jpg', style: 'neon', promptModifiers: 'cyberpunk, neon lights, rain, reflections, blade runner style', isPopular: true, usageCount: 8500 },
  { id: '4', name: 'Oil Master', description: 'Classical oil painting look', preview: '/styles/oil.jpg', style: 'oil_painting', promptModifiers: 'oil painting, brushstrokes, classical, museum quality', isPopular: false, usageCount: 4200 },
  { id: '5', name: 'Dreamy Watercolor', description: 'Soft watercolor illustration', preview: '/styles/watercolor.jpg', style: 'watercolor', promptModifiers: 'watercolor, soft edges, pastel colors, delicate', isPopular: false, usageCount: 3800 },
  { id: '6', name: 'Product Studio', description: 'Professional product shots', preview: '/styles/product.jpg', style: 'photorealistic', promptModifiers: 'product photography, studio lighting, white background, commercial', isPopular: true, usageCount: 7200 }
]

// Helper functions
const getStatusColor = (status: GenerationStatus) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    upscaling: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[status]
}

const getStyleColor = (style: StylePreset) => {
  const colors = {
    photorealistic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    anime: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    digital_art: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    oil_painting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    watercolor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    sketch: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    '3d_render': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    neon: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    vintage: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    minimalist: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
  return colors[style]
}

const getModelIcon = (model: ModelType) => {
  const icons = {
    midjourney_v6: Sparkles,
    midjourney_v5: Sparkles,
    dalle_3: Wand2,
    stable_diffusion: Cpu,
    flux_pro: Zap
  }
  return icons[model]
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  return `${seconds}s`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AIDesignClient() {
  const [activeTab, setActiveTab] = useState('generate')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null)
  const [showGenerationDialog, setShowGenerationDialog] = useState(false)

  // Generation form state
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>('photorealistic')
  const [selectedModel, setSelectedModel] = useState<ModelType>('midjourney_v6')
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1')
  const [selectedQuality, setSelectedQuality] = useState<QualityLevel>('high')
  const [isGenerating, setIsGenerating] = useState(false)

  // Stats
  const stats: AIDesignStats = useMemo(() => ({
    totalGenerations: mockGenerations.length,
    completedGenerations: mockGenerations.filter(g => g.status === 'completed').length,
    totalCredits: 500,
    creditsUsed: mockGenerations.reduce((sum, g) => sum + g.creditsUsed, 0),
    totalLikes: mockGenerations.reduce((sum, g) => sum + g.likes, 0),
    totalDownloads: mockGenerations.reduce((sum, g) => sum + g.downloads, 0),
    avgGenerationTime: mockGenerations.filter(g => g.generationTime).reduce((sum, g) => sum + (g.generationTime || 0), 0) / mockGenerations.filter(g => g.generationTime).length,
    favoriteCount: mockGenerations.filter(g => g.isFavorite).length
  }), [])

  // Filtered data
  const filteredGenerations = useMemo(() => {
    return mockGenerations.filter(gen =>
      gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setPrompt('')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-white to-purple-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Design Studio
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Midjourney-level AI image generation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/30 dark:to-purple-900/30">
              <Zap className="w-4 h-4 text-fuchsia-600" />
              <span className="text-sm font-medium text-fuchsia-700 dark:text-fuchsia-400">
                {stats.totalCredits - stats.creditsUsed} credits left
              </span>
            </div>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-fuchsia-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Generations</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalGenerations}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+12 today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.completedGenerations}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <span>{Math.round((stats.completedGenerations / stats.totalGenerations) * 100)}% rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Credits Used</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.creditsUsed}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>of {stats.totalCredits}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg Time</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatTime(stats.avgGenerationTime)}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingDown className="w-3 h-3" />
                <span>-2s faster</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Likes</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalLikes}
              </div>
              <div className="flex items-center gap-1 text-xs text-red-600">
                <TrendingUp className="w-3 h-3" />
                <span>+45 today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Downloads</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalDownloads}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                <span>+23 today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Favorites</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.favoriteCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <span>Saved</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Collections</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {mockCollections.length}
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-600">
                <span>Organized</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1">
            <TabsTrigger value="generate" className="data-[state=active]:bg-fuchsia-100 data-[state=active]:text-fuchsia-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-fuchsia-100 data-[state=active]:text-fuchsia-700">
              <Image className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="styles" className="data-[state=active]:bg-fuchsia-100 data-[state=active]:text-fuchsia-700">
              <Palette className="w-4 h-4 mr-2" />
              Styles
            </TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-fuchsia-100 data-[state=active]:text-fuchsia-700">
              <Layers className="w-4 h-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-fuchsia-100 data-[state=active]:text-fuchsia-700">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-fuchsia-100 data-[state=active]:text-fuchsia-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Prompt Input */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Prompt
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your vision... (e.g., 'A serene mountain lake at sunrise, with mist rising from the water, photorealistic')"
                        className="w-full h-32 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Negative Prompt (Optional)
                      </label>
                      <Input
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="What to avoid... (e.g., 'blurry, low quality, distorted')"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate (5 credits)
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setPrompt('')}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button variant="outline">
                        <Shuffle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Generations */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Recent Generations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mockGenerations.slice(0, 4).map((gen) => (
                        <div
                          key={gen.id}
                          className="relative aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden cursor-pointer group"
                          onClick={() => {
                            setSelectedGeneration(gen)
                            setShowGenerationDialog(true)
                          }}
                        >
                          {gen.thumbnailUrl ? (
                            <div className="w-full h-full bg-gradient-to-br from-fuchsia-200 to-purple-200 dark:from-fuchsia-900 dark:to-purple-900" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {gen.status === 'processing' ? (
                                <RefreshCw className="w-8 h-8 text-fuchsia-500 animate-spin" />
                              ) : (
                                <Image className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute top-2 left-2">
                            <Badge className={`${getStatusColor(gen.status)} text-xs`}>
                              {gen.status}
                            </Badge>
                          </div>
                          {gen.isFavorite && (
                            <div className="absolute top-2 right-2">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Sidebar */}
              <div className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-fuchsia-500" />
                      Model
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {(['midjourney_v6', 'midjourney_v5', 'dalle_3', 'stable_diffusion', 'flux_pro'] as ModelType[]).map((model) => {
                      const ModelIcon = getModelIcon(model)
                      return (
                        <button
                          key={model}
                          onClick={() => setSelectedModel(model)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            selectedModel === model
                              ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 border-2 border-fuchsia-300'
                              : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <ModelIcon className="w-4 h-4 text-fuchsia-500" />
                          <span className="text-sm font-medium">{model.replace('_', ' ')}</span>
                          {model === 'midjourney_v6' && (
                            <Badge className="ml-auto bg-fuchsia-100 text-fuchsia-700 text-xs">Best</Badge>
                          )}
                        </button>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-500" />
                      Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {(['photorealistic', 'anime', 'digital_art', '3d_render', 'oil_painting', 'minimalist'] as StylePreset[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => setSelectedStyle(style)}
                          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                            selectedStyle === style
                              ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 border-2 border-fuchsia-300'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {style.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Ratio className="w-4 h-4 text-blue-500" />
                      Aspect Ratio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {(['1:1', '16:9', '9:16', '4:3', '3:4', '2:3', '3:2'] as AspectRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setSelectedRatio(ratio)}
                          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                            selectedRatio === ratio
                              ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 border-2 border-fuchsia-300'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                      Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { level: 'draft' as const, credits: 2 },
                        { level: 'standard' as const, credits: 3 },
                        { level: 'high' as const, credits: 5 },
                        { level: 'ultra' as const, credits: 8 }
                      ]).map(({ level, credits }) => (
                        <button
                          key={level}
                          onClick={() => setSelectedQuality(level)}
                          className={`p-2 rounded-lg text-xs transition-colors ${
                            selectedQuality === level
                              ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 border-2 border-fuchsia-300'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium capitalize">{level}</div>
                          <div className="text-gray-400">{credits} credits</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search generations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-fuchsia-100' : ''}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-fuchsia-100' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
              {filteredGenerations.map((gen) => (
                <Card
                  key={gen.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  onClick={() => {
                    setSelectedGeneration(gen)
                    setShowGenerationDialog(true)
                  }}
                >
                  <div className={viewMode === 'grid' ? '' : 'flex gap-4'}>
                    <div className={`relative ${viewMode === 'grid' ? 'aspect-square' : 'w-40 h-40'} bg-gradient-to-br from-fuchsia-200 to-purple-200 dark:from-fuchsia-900 dark:to-purple-900`}>
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <Badge className={`${getStatusColor(gen.status)} text-xs`}>
                          {gen.status}
                        </Badge>
                      </div>
                      {gen.isFavorite && (
                        <Star className="absolute top-2 right-2 w-4 h-4 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <CardContent className={`${viewMode === 'grid' ? 'p-3' : 'p-4 flex-1'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStyleColor(gen.style)}>{gen.style.replace('_', ' ')}</Badge>
                        <span className="text-xs text-gray-500">{gen.aspectRatio}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{gen.prompt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {gen.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {gen.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {gen.downloads}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styleTemplates.map((template) => (
                <Card key={template.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-fuchsia-200 to-purple-200 dark:from-fuchsia-900 dark:to-purple-900 relative">
                    {template.isPopular && (
                      <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700">
                        <Star className="w-3 h-3 mr-1" /> Popular
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={getStyleColor(template.style)}>{template.style.replace('_', ' ')}</Badge>
                      <span className="text-xs text-gray-400">{template.usageCount.toLocaleString()} uses</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Collections</h2>
              <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCollections.map((collection) => (
                <Card key={collection.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-fuchsia-200 to-purple-200 dark:from-fuchsia-900 dark:to-purple-900 relative">
                    {collection.isPrivate && (
                      <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{collection.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{collection.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{collection.itemCount} items</span>
                      <span>{formatDate(collection.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-fuchsia-500" />
                  Prompt History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPromptHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.prompt}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <Badge className={getStyleColor(item.style)}>{item.style.replace('_', ' ')}</Badge>
                          <span>{item.resultCount} results</span>
                          <span>{formatDate(item.usedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className={item.isFavorite ? 'text-amber-500' : ''}>
                          <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-fuchsia-500" />
                    Default Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Default Model</div>
                      <div className="text-sm text-gray-500">Midjourney V6</div>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Default Quality</div>
                      <div className="text-sm text-gray-500">High (5 credits)</div>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Default Aspect Ratio</div>
                      <div className="text-sm text-gray-500">1:1 (Square)</div>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Generation Complete</div>
                      <div className="text-sm text-gray-500">Notify when image is ready</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Daily Summary</div>
                      <div className="text-sm text-gray-500">Daily usage and stats</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Low Credits Warning</div>
                      <div className="text-sm text-gray-500">Alert when credits are low</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-emerald-500" />
                    Export Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Default Format</div>
                      <div className="text-sm text-gray-500">PNG (lossless)</div>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Include Metadata</div>
                      <div className="text-sm text-gray-500">Embed prompt in image</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Public by Default</div>
                      <div className="text-sm text-gray-500">Share generations publicly</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Show in Explore</div>
                      <div className="text-sm text-gray-500">Feature in community gallery</div>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Generation Detail Dialog */}
        <Dialog open={showGenerationDialog} onOpenChange={setShowGenerationDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Generation Details</DialogTitle>
            </DialogHeader>
            {selectedGeneration && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-fuchsia-200 to-purple-200 dark:from-fuchsia-900 dark:to-purple-900 relative overflow-hidden">
                  <div className="absolute top-2 left-2">
                    <Badge className={getStatusColor(selectedGeneration.status)}>
                      {selectedGeneration.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Prompt</h3>
                    <p className="text-gray-900 dark:text-white">{selectedGeneration.prompt}</p>
                  </div>
                  {selectedGeneration.negativePrompt && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Negative Prompt</h3>
                      <p className="text-gray-700 dark:text-gray-300">{selectedGeneration.negativePrompt}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Style</h3>
                      <Badge className={getStyleColor(selectedGeneration.style)}>
                        {selectedGeneration.style.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Model</h3>
                      <p className="text-gray-900 dark:text-white">{selectedGeneration.model.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Aspect Ratio</h3>
                      <p className="text-gray-900 dark:text-white">{selectedGeneration.aspectRatio}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Quality</h3>
                      <p className="text-gray-900 dark:text-white capitalize">{selectedGeneration.quality}</p>
                    </div>
                    {selectedGeneration.seed && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Seed</h3>
                        <p className="text-gray-900 dark:text-white font-mono">{selectedGeneration.seed}</p>
                      </div>
                    )}
                    {selectedGeneration.generationTime && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
                        <p className="text-gray-900 dark:text-white">{formatTime(selectedGeneration.generationTime)}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Heart className="w-4 h-4" /> {selectedGeneration.likes}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" /> {selectedGeneration.views}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Download className="w-4 h-4" /> {selectedGeneration.downloads}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Upscale
                    </Button>
                    <Button variant="outline">
                      <Shuffle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
