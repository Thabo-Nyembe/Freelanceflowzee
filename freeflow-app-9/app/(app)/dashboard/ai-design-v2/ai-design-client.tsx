'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  Paintbrush,
  FolderPlus,
  History,
  Cpu,
  CheckCircle2,
  Lock,
  Crown,
  Lightbulb,
  Shuffle,
  Ratio,
  SlidersHorizontal,
  Bell,
  HelpCircle
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

// Enhanced Competitive Upgrade Mock Data - AI Design Context
const mockAIDesignInsights = [
  { id: '1', type: 'success' as const, title: 'Style Trending', description: 'Photorealistic style generating 40% more engagement this week.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Trends' },
  { id: '2', type: 'info' as const, title: 'Credits Optimization', description: 'Switch to batch mode for 25% credit savings on multiple generations.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Efficiency' },
  { id: '3', type: 'warning' as const, title: 'Queue Alert', description: 'High demand detected. Consider scheduling generations for off-peak hours.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'System' },
]

const mockAIDesignCollaborators = [
  { id: '1', name: 'Maya Chen', avatar: '/avatars/maya.jpg', status: 'online' as const, role: 'Creative Director', lastActive: 'Now' },
  { id: '2', name: 'Oliver Park', avatar: '/avatars/oliver.jpg', status: 'online' as const, role: 'AI Artist', lastActive: '5m ago' },
  { id: '3', name: 'Sophie Miller', avatar: '/avatars/sophie.jpg', status: 'away' as const, role: 'Designer', lastActive: '20m ago' },
]

const mockAIDesignPredictions = [
  { id: '1', label: 'Generation Success Rate', current: 94, target: 98, predicted: 96, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Avg Generation Time', current: 12, target: 8, predicted: 10, confidence: 75, trend: 'down' as const },
  { id: '3', label: 'Monthly Credits Used', current: 450, target: 500, predicted: 480, confidence: 82, trend: 'up' as const },
]

const mockAIDesignActivities = [
  { id: '1', user: 'Maya Chen', action: 'generated', target: '4K landscape image', timestamp: '2m ago', type: 'success' as const },
  { id: '2', user: 'Oliver Park', action: 'upscaled', target: 'product photo batch', timestamp: '15m ago', type: 'info' as const },
  { id: '3', user: 'Sophie Miller', action: 'saved', target: 'style preset "Neon Dreams"', timestamp: '30m ago', type: 'info' as const },
]

// Quick actions config - handlers set in component
const mockAIDesignQuickActionsConfig = [
  { id: '1', label: 'New Generation', icon: 'Wand2', shortcut: 'G' },
  { id: '2', label: 'Browse Gallery', icon: 'Image', shortcut: 'B' },
  { id: '3', label: 'Upscale Image', icon: 'ZoomIn', shortcut: 'U' },
  { id: '4', label: 'Edit Style', icon: 'Palette', shortcut: 'S' },
]

export default function AIDesignClient() {
  const supabase = createClient()

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
  const [settingsTab, setSettingsTab] = useState('general')

  // Database state
  const [generations, setGenerations] = useState<Generation[]>(mockGenerations)
  const [collections, setCollections] = useState<Collection[]>(mockCollections)
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>(mockPromptHistory)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch AI design projects from Supabase
  const fetchGenerations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('ai_design_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data && data.length > 0) {
        const mapped: Generation[] = data.map((p: any) => ({
          id: p.id,
          prompt: p.prompt || '',
          negativePrompt: p.parameters?.negative_prompt,
          style: p.parameters?.style || 'photorealistic',
          model: p.model?.replace('-', '_') || 'midjourney_v6',
          aspectRatio: p.parameters?.aspect_ratio || '1:1',
          quality: p.parameters?.quality || 'high',
          status: p.status === 'generating' ? 'processing' : p.status || 'pending',
          imageUrl: p.parameters?.image_url,
          thumbnailUrl: p.parameters?.thumbnail_url,
          seed: p.parameters?.seed,
          likes: p.parameters?.likes || 0,
          views: p.parameters?.views || 0,
          downloads: p.parameters?.downloads || 0,
          isFavorite: p.parameters?.is_favorite || false,
          isPublic: p.parameters?.is_public || false,
          createdAt: p.created_at,
          generationTime: p.parameters?.generation_time,
          creditsUsed: p.parameters?.credits_used || 5
        }))
        setGenerations(mapped)
      }
    } catch (err) {
      console.error('Error fetching generations:', err)
    }
  }, [supabase])

  useEffect(() => {
    fetchGenerations()
  }, [fetchGenerations])

  // Stats
  const stats: AIDesignStats = useMemo(() => ({
    totalGenerations: generations.length,
    completedGenerations: generations.filter(g => g.status === 'completed').length,
    totalCredits: 500,
    creditsUsed: generations.reduce((sum, g) => sum + g.creditsUsed, 0),
    totalLikes: generations.reduce((sum, g) => sum + g.likes, 0),
    totalDownloads: generations.reduce((sum, g) => sum + g.downloads, 0),
    avgGenerationTime: generations.filter(g => g.generationTime).reduce((sum, g) => sum + (g.generationTime || 0), 0) / (generations.filter(g => g.generationTime).length || 1),
    favoriteCount: generations.filter(g => g.isFavorite).length
  }), [generations])

  // Filtered data
  const filteredGenerations = useMemo(() => {
    return generations.filter(gen =>
      gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, generations])

  // Generate new image
  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Authentication required', { description: 'Please sign in to generate images' })
        return
      }

      const { data, error } = await supabase
        .from('ai_design_projects')
        .insert({
          user_id: user.id,
          name: prompt.slice(0, 50),
          type: 'batch-generate',
          status: 'generating',
          progress: 0,
          tool_id: 'ai-image-gen',
          model: selectedModel.replace('_', '-'),
          prompt: prompt,
          parameters: {
            negative_prompt: negativePrompt,
            style: selectedStyle,
            aspect_ratio: selectedRatio,
            quality: selectedQuality,
            credits_used: selectedQuality === 'ultra' ? 8 : selectedQuality === 'high' ? 5 : selectedQuality === 'standard' ? 3 : 2
          }
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Generation started', { description: 'Your image is being created' })
      setPrompt('')
      setNegativePrompt('')
      fetchGenerations()
    } catch (err: any) {
      toast.error('Generation failed', { description: err.message })
    } finally {
      setIsGenerating(false)
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async (gen: Generation) => {
    try {
      const newFavorite = !gen.isFavorite
      const { error } = await supabase
        .from('ai_design_projects')
        .update({ parameters: { ...gen, is_favorite: newFavorite } })
        .eq('id', gen.id)

      if (error) throw error

      setGenerations(prev => prev.map(g =>
        g.id === gen.id ? { ...g, isFavorite: newFavorite } : g
      ))
      toast.success(newFavorite ? 'Added to favorites' : 'Removed from favorites')
    } catch (err: any) {
      toast.error('Update failed', { description: err.message })
    }
  }

  // Delete generation
  const handleDeleteGeneration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_design_projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      setGenerations(prev => prev.filter(g => g.id !== id))
      setShowGenerationDialog(false)
      toast.success('Generation deleted')
    } catch (err: any) {
      toast.error('Delete failed', { description: err.message })
    }
  }

  // Download handler
  const handleDownloadDesign = async (gen: Generation) => {
    try {
      const { error } = await supabase
        .from('ai_design_projects')
        .update({
          parameters: {
            ...gen,
            downloads: (gen.downloads || 0) + 1
          }
        })
        .eq('id', gen.id)

      if (error) throw error

      setGenerations(prev => prev.map(g =>
        g.id === gen.id ? { ...g, downloads: g.downloads + 1 } : g
      ))
      toast.success('Download started', { description: 'Your design is being downloaded' })
    } catch (err: any) {
      toast.error('Download failed', { description: err.message })
    }
  }

  // Regenerate with same settings
  const handleRegenerateDesign = async (gen: Generation) => {
    setPrompt(gen.prompt)
    setNegativePrompt(gen.negativePrompt || '')
    setSelectedStyle(gen.style)
    setSelectedModel(gen.model)
    setSelectedRatio(gen.aspectRatio)
    setSelectedQuality(gen.quality)
    setActiveTab('generate')
    toast.info('Settings loaded', { description: 'Click Generate to create a new variation' })
  }

  // Create collection
  const handleCreateCollection = async (name: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Using a generic approach since collection table may vary
      const newCollection: Collection = {
        id: crypto.randomUUID(),
        name,
        description,
        itemCount: 0,
        isPrivate: false,
        createdAt: new Date().toISOString()
      }

      setCollections(prev => [newCollection, ...prev])
      toast.success('Collection created', { description: `"${name}" is ready to use` })
    } catch (err: any) {
      toast.error('Failed to create collection', { description: err.message })
    }
  }

  // Export all designs
  const handleExportDesigns = async () => {
    setIsLoading(true)
    try {
      toast.success('Export started', { description: `Exporting ${generations.length} designs` })
    } finally {
      setIsLoading(false)
    }
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

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/20 dark:to-purple-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-fuchsia-600" />
                </div>
                <div className="font-semibold">Most Popular Style</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Photorealistic leads with 45% of your generations</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Star className="w-5 h-5 text-pink-600" />
                </div>
                <div className="font-semibold">Top Performing</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Anime style gets 2.3x more likes than average</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div className="font-semibold">Pro Tip</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add "cinematic lighting" for more dramatic results</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="font-semibold">This Week</div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">You've created 23 images - 15% more than last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats Banner */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Generation Stats</h3>
                  <p className="text-white/80">Your creative output this month</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.completedGenerations}</div>
                  <div className="text-sm text-white/80">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{((stats.completedGenerations / stats.totalGenerations) * 100).toFixed(0)}%</div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatTime(stats.avgGenerationTime)}</div>
                  <div className="text-sm text-white/80">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.creditsUsed}</div>
                  <div className="text-sm text-white/80">Credits Used</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Templates Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-fuchsia-500" />
                Trending Styles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {styleTemplates.filter(t => t.isPopular).slice(0, 4).map((template, idx) => (
                  <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.usageCount.toLocaleString()} uses</div>
                      </div>
                    </div>
                    <Badge className={getStyleColor(template.style)}>{template.style.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-amber-500" />
                Recent Creations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockGenerations.slice(0, 4).map((gen) => (
                  <div key={gen.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600" />
                      <div>
                        <div className="font-medium text-sm truncate max-w-[200px]">{gen.prompt.substring(0, 40)}...</div>
                        <div className="text-xs text-gray-500">{gen.style.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(gen.status)}>{gen.status}</Badge>
                  </div>
                ))}
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
            {/* Generate Overview Banner */}
            <Card className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">AI Image Generation</h3>
                      <p className="text-fuchsia-100">Create stunning visuals with text prompts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalCredits - stats.creditsUsed}</div>
                      <div className="text-sm text-fuchsia-100">Credits Left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalGenerations}</div>
                      <div className="text-sm text-fuchsia-100">Generated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatTime(stats.avgGenerationTime)}</div>
                      <div className="text-sm text-fuchsia-100">Avg Time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
          <TabsContent value="gallery" className="space-y-6">
            {/* Gallery Overview Banner */}
            <Card className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Image className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Your Gallery</h3>
                      <p className="text-pink-100">Browse and manage all your AI-generated images</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockGenerations.length}</div>
                      <div className="text-sm text-pink-100">Total Images</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.favoriteCount}</div>
                      <div className="text-sm text-pink-100">Favorites</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalLikes}</div>
                      <div className="text-sm text-pink-100">Total Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                      <div className="text-sm text-pink-100">Downloads</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gallery Stats */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { style: 'photorealistic', count: mockGenerations.filter(g => g.style === 'photorealistic').length, icon: Image, color: 'blue' },
                { style: 'digital_art', count: mockGenerations.filter(g => g.style === 'digital_art').length, icon: Paintbrush, color: 'purple' },
                { style: 'anime', count: mockGenerations.filter(g => g.style === 'anime').length, icon: Sparkles, color: 'pink' },
                { style: '3d_render', count: mockGenerations.filter(g => g.style === '3d_render').length, icon: Layers, color: 'indigo' },
                { style: 'oil_painting', count: mockGenerations.filter(g => g.style === 'oil_painting').length, icon: Palette, color: 'amber' }
              ].map((stat, idx) => (
                <Card key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-3 text-center">
                    <stat.icon className={`w-6 h-6 mx-auto mb-1 text-${stat.color}-500`} />
                    <div className="font-bold text-lg">{stat.count}</div>
                    <div className="text-xs text-gray-500 capitalize">{stat.style.replace('_', ' ')}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
          <TabsContent value="styles" className="space-y-6">
            {/* Styles Overview Banner */}
            <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Palette className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Style Templates</h3>
                      <p className="text-violet-100">Pre-configured styles for instant results</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{styleTemplates.length}</div>
                      <div className="text-sm text-violet-100">Templates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{styleTemplates.filter(t => t.isPopular).length}</div>
                      <div className="text-sm text-violet-100">Popular</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(styleTemplates.reduce((sum, t) => sum + t.usageCount, 0) / 1000).toFixed(1)}K</div>
                      <div className="text-sm text-violet-100">Total Uses</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Style Categories */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { style: 'photorealistic', label: 'Photo', icon: Image, color: 'blue' },
                { style: 'digital_art', label: 'Digital', icon: Paintbrush, color: 'purple' },
                { style: 'anime', label: 'Anime', icon: Sparkles, color: 'pink' },
                { style: '3d_render', label: '3D', icon: Layers, color: 'indigo' },
                { style: 'oil_painting', label: 'Painting', icon: Palette, color: 'amber' }
              ].map((cat, idx) => (
                <Card key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-${cat.color}-100 dark:bg-${cat.color}-900/30 flex items-center justify-center mx-auto mb-2`}>
                      <cat.icon className={`w-6 h-6 text-${cat.color}-500`} />
                    </div>
                    <div className="font-medium">{cat.label}</div>
                    <div className="text-xs text-gray-500">{styleTemplates.filter(t => t.style === cat.style).length} styles</div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
              <Button
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
                onClick={() => handleCreateCollection('New Collection', 'My new design collection')}
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {collections.map((collection) => (
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
          <TabsContent value="history" className="space-y-6">
            {/* History Overview Banner */}
            <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <History className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Prompt History</h3>
                      <p className="text-amber-100">Review and reuse your previous prompts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{promptHistory.length}</div>
                      <div className="text-sm text-amber-100">Prompts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{promptHistory.filter(p => p.isFavorite).length}</div>
                      <div className="text-sm text-amber-100">Favorites</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{promptHistory.reduce((sum, p) => sum + p.resultCount, 0)}</div>
                      <div className="text-sm text-amber-100">Results</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-fuchsia-500" />
                  Prompt History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {promptHistory.map((item) => (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className={item.isFavorite ? 'text-amber-500' : ''}
                          onClick={() => {
                            setPromptHistory(prev => prev.map(p =>
                              p.id === item.id ? { ...p, isFavorite: !p.isFavorite } : p
                            ))
                            toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorites')
                          }}
                        >
                          <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(item.prompt)
                            toast.success('Copied to clipboard')
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPrompt(item.prompt)
                            setSelectedStyle(item.style)
                            setActiveTab('generate')
                            toast.info('Prompt loaded', { description: 'Ready to regenerate' })
                          }}
                        >
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
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <Card className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Midjourney-Level AI Design Studio</h2>
                      <p className="text-fuchsia-100 mt-1">Configure generation, models, exports, and integrations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalGenerations}</div>
                      <div className="text-sm text-fuchsia-100">Generations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalCredits - stats.creditsUsed}</div>
                      <div className="text-sm text-fuchsia-100">Credits Left</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalDownloads}</div>
                      <div className="text-sm text-fuchsia-100">Downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.favoriteCount}</div>
                      <div className="text-sm text-fuchsia-100">Favorites</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'models', icon: Cpu, label: 'AI Models' },
                      { id: 'styles', icon: Palette, label: 'Styles' },
                      { id: 'exports', icon: Download, label: 'Exports' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'advanced', icon: Zap, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          settingsTab === item.id
                            ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5" />
                        General Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Model</div>
                          <div className="text-sm text-muted-foreground">Primary AI model for generations</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>Midjourney V6</option>
                          <option>Midjourney V5</option>
                          <option>DALL-E 3</option>
                          <option>Stable Diffusion</option>
                          <option>Flux Pro</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Quality</div>
                          <div className="text-sm text-muted-foreground">Image quality level (affects credits)</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>Draft (1 credit)</option>
                          <option>Standard (3 credits)</option>
                          <option>High (5 credits)</option>
                          <option>Ultra (10 credits)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Aspect Ratio</div>
                          <div className="text-sm text-muted-foreground">Preferred output dimensions</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>1:1 (Square)</option>
                          <option>16:9 (Landscape)</option>
                          <option>9:16 (Portrait)</option>
                          <option>4:3</option>
                          <option>3:2</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Auto-save Generations</div>
                          <div className="text-sm text-muted-foreground">Automatically save to gallery</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Show Seed Number</div>
                          <div className="text-sm text-muted-foreground">Display seed for reproducibility</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'models' && (
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="w-5 h-5" />
                        AI Models Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Midjourney V6</div>
                            <div className="text-sm text-muted-foreground">Latest version - best quality</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Wand2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">DALL-E 3</div>
                            <div className="text-sm text-muted-foreground">OpenAI's text-to-image model</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">Stable Diffusion XL</div>
                            <div className="text-sm text-muted-foreground">Open-source model</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <div className="font-medium">Flux Pro</div>
                            <div className="text-sm text-muted-foreground">Fast, high-quality generations</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'styles' && (
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Style Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Style</div>
                          <div className="text-sm text-muted-foreground">Starting style for new prompts</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>Photorealistic</option>
                          <option>Digital Art</option>
                          <option>Anime</option>
                          <option>Oil Painting</option>
                          <option>3D Render</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Auto-apply Style Modifiers</div>
                          <div className="text-sm text-muted-foreground">Add style keywords automatically</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Save Custom Styles</div>
                          <div className="text-sm text-muted-foreground">Allow saving custom style presets</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Show Popular Styles</div>
                          <div className="text-sm text-muted-foreground">Display trending styles in picker</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'exports' && (
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Export Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Format</div>
                          <div className="text-sm text-muted-foreground">Image file format for exports</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>PNG (Lossless)</option>
                          <option>JPEG (Compressed)</option>
                          <option>WebP (Modern)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Include Metadata</div>
                          <div className="text-sm text-muted-foreground">Embed prompt and settings in file</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Auto-upscale on Download</div>
                          <div className="text-sm text-muted-foreground">Upscale to 4K before download</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Watermark Free Exports</div>
                          <div className="text-sm text-muted-foreground">Remove watermarks (Pro feature)</div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">Pro</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Generation Complete</div>
                          <div className="text-sm text-muted-foreground">Notify when image is ready</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Daily Summary</div>
                          <div className="text-sm text-muted-foreground">Daily usage and stats email</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Low Credits Warning</div>
                          <div className="text-sm text-muted-foreground">Alert when credits are low</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">New Features</div>
                          <div className="text-sm text-muted-foreground">Updates about new AI models</div>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Community Likes</div>
                          <div className="text-sm text-muted-foreground">When others like your images</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Advanced Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">API Access</div>
                          <div className="text-sm text-muted-foreground">Enable API for integrations</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Public by Default</div>
                          <div className="text-sm text-muted-foreground">Share generations publicly</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Show in Explore</div>
                          <div className="text-sm text-muted-foreground">Feature in community gallery</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Debug Mode</div>
                          <div className="text-sm text-muted-foreground">Show detailed generation logs</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                          <Download className="w-6 h-6" />
                          <span>Export All</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                          <RefreshCw className="w-6 h-6" />
                          <span>Clear Cache</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                          <History className="w-6 h-6" />
                          <span>View History</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                          <HelpCircle className="w-6 h-6" />
                          <span>Get Help</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Sparkles, label: 'Generate', desc: 'Create', color: 'from-fuchsia-500 to-purple-600' },
                { icon: Palette, label: 'Styles', desc: 'Browse', color: 'from-pink-500 to-rose-600' },
                { icon: Cpu, label: 'Models', desc: 'Switch', color: 'from-blue-500 to-cyan-600' },
                { icon: History, label: 'History', desc: 'View', color: 'from-amber-500 to-orange-600' },
                { icon: Star, label: 'Favorites', desc: 'Saved', color: 'from-yellow-500 to-amber-600' },
                { icon: Download, label: 'Export', desc: 'Download', color: 'from-green-500 to-emerald-600' },
                { icon: Zap, label: 'Upscale', desc: 'Enhance', color: 'from-violet-500 to-purple-600' },
                { icon: Share2, label: 'Share', desc: 'Publish', color: 'from-indigo-500 to-blue-600' }
              ].map((action, idx) => (
                <Card key={idx} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group border-0 shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAIDesignInsights}
              title="AI Design Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAIDesignCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAIDesignPredictions}
              title="Generation Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAIDesignActivities}
            title="Design Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAIDesignQuickActionsConfig.map(action => ({
              ...action,
              action: () => {
                switch(action.id) {
                  case '1': setShowGenerateDialog(true); break;
                  case '2': setActiveTab('gallery'); break;
                  case '3': setShowUpscaleDialog(true); break;
                  case '4': setShowStyleEditor(true); break;
                }
              }
            }))}
            variant="grid"
          />
        </div>

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
                    <Button
                      className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
                      onClick={() => handleDownloadDesign(selectedGeneration)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      if (!selectedGeneration) return
                      toast.promise(
                        fetch('/api/ai/upscale', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ imageId: selectedGeneration.id })
                        }).then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
                        { loading: 'Upscaling image...', success: 'Image upscaled successfully', error: 'Failed to upscale image' }
                      )
                    }}>
                      <Maximize2 className="w-4 h-4 mr-2" />
                      Upscale
                    </Button>
                    <Button variant="outline" onClick={() => handleRegenerateDesign(selectedGeneration)}>
                      <Shuffle className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleToggleFavorite(selectedGeneration)}>
                      <Star className={`w-4 h-4 ${selectedGeneration.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </Button>
                    <Button variant="outline" onClick={() => handleDeleteGeneration(selectedGeneration.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
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
