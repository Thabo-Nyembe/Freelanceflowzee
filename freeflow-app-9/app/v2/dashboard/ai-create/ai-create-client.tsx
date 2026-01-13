"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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

// Enhanced Competitive Upgrade Mock Data
const mockAICreateInsights = [
  { id: '1', type: 'success' as const, title: 'Creative Boost', description: 'Your creations got 2.5K views this week. 40% more than last week.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Engagement' },
  { id: '2', type: 'info' as const, title: 'Style Trending', description: 'Anime style is trending. Consider creating more in this style.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Trends' },
  { id: '3', type: 'warning' as const, title: 'Credits Running Low', description: 'You have 50 credits remaining. Consider upgrading your plan.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Usage' },
]

const mockAICreateCollaborators = [
  { id: '1', name: 'Creative Lead', avatar: '/avatars/creative.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'AI Artist', avatar: '/avatars/artist.jpg', status: 'online' as const, role: 'Artist' },
  { id: '3', name: 'Content Creator', avatar: '/avatars/content.jpg', status: 'away' as const, role: 'Creator' },
]

const mockAICreatePredictions = [
  { id: '1', title: 'Style Forecast', prediction: 'Cyberpunk aesthetics will trend next month', confidence: 78, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'Usage Pattern', prediction: 'Peak generation times are 2-4 PM your timezone', confidence: 85, trend: 'stable' as const, impact: 'low' as const },
]

const mockAICreateActivities = [
  { id: '1', user: 'You', action: 'Generated', target: 'stunning landscape image', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'AI Model', action: 'Completed', target: 'batch of 4 variations', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Saved', target: 'creation to gallery', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are now defined inside the component to use dialog state

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
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showNewCreationDialog, setShowNewCreationDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showGalleryDialog, setShowGalleryDialog] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)
  const [showRegenerateKeyDialog, setShowRegenerateKeyDialog] = useState(false)
  const [showManageModelsDialog, setShowManageModelsDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [galleryDialogViewMode, setGalleryDialogViewMode] = useState<'grid' | 'list'>('grid')

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

  // Quick actions with proper dialog handling
  const quickActions = [
    { id: '1', label: 'New Creation', icon: 'sparkles', action: () => setShowNewCreationDialog(true), variant: 'default' as const },
    { id: '2', label: 'Use Template', icon: 'copy', action: () => setShowTemplateDialog(true), variant: 'default' as const },
    { id: '3', label: 'View Gallery', icon: 'image', action: () => setShowGalleryDialog(true), variant: 'outline' as const },
  ]

  const handleGenerate = () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    toast.info('Generating...', {
      description: 'AI is creating your content'
    })
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 2000)
  }

  // Handlers
  const handleSaveCreation = () => {
    toast.success('Creation saved', {
      description: 'Your AI creation has been saved to gallery'
    })
  }

  const handleDownloadCreation = () => {
    toast.success('Downloading', {
      description: 'Your creation will be downloaded shortly'
    })
  }

  const handleShareCreation = () => {
    toast.success('Link copied', {
      description: 'Share link copied to clipboard'
    })
  }

  const handleRegenerateCreation = () => {
    toast.info('Regenerating', {
      description: 'Creating a new variation...'
    })
  }

  const handleClearHistory = () => {
    toast.success('History cleared', {
      description: 'All generation history has been cleared'
    })
  }

  const handleRetryGeneration = (gen: Generation) => {
    toast.info('Retrying generation', {
      description: `Retrying: ${gen.prompt.slice(0, 30)}...`
    })
  }

  const handleDeleteGeneration = (gen: Generation) => {
    toast.success('Generation deleted', {
      description: 'The generation has been removed from history'
    })
  }

  const handleRegenerateApiKey = () => {
    toast.success('API Key regenerated', {
      description: 'Your new API key is ready to use'
    })
    setShowRegenerateKeyDialog(false)
  }

  const handleConnectService = (serviceName: string, connected: boolean) => {
    if (connected) {
      toast.success(`${serviceName} disconnected`, {
        description: `${serviceName} integration has been removed`
      })
    } else {
      toast.success(`${serviceName} connected`, {
        description: `${serviceName} integration is now active`
      })
    }
  }

  const handleClearCache = () => {
    toast.success('Cache cleared', {
      description: '1.2 GB of generation cache has been freed'
    })
  }

  const handleManageModels = () => {
    setShowManageModelsDialog(true)
  }

  const handleDeleteAllGenerations = () => {
    toast.success('All generations deleted', {
      description: 'Your generated content has been removed'
    })
    setShowDeleteAllDialog(false)
  }

  const handleResetSettings = () => {
    toast.success('Settings reset', {
      description: 'All settings have been restored to defaults'
    })
    setShowResetSettingsDialog(false)
  }

  const handleCreateVariation = () => {
    toast.info('Creating variation', {
      description: 'Generating a new variation of your creation...'
    })
  }

  const handleToggleFavorite = (gen: Generation) => {
    if (gen.isFavorite) {
      toast.success('Removed from favorites', {
        description: 'Generation removed from your favorites'
      })
    } else {
      toast.success('Added to favorites', {
        description: 'Generation added to your favorites'
      })
    }
  }

  const handleUpgrade = () => {
    setShowUpgradeDialog(true)
  }

  const handleCreateTemplate = () => {
    setShowCreateTemplateDialog(true)
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
            <Button variant="outline" onClick={handleUpgrade}>
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
                    <p className="text-3xl font-bold">{mockUsageStats.remainingCredits}</p>
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
                    <p className="text-3xl font-bold">{mockGenerations.length}</p>
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
                    <p className="text-3xl font-bold">{mockTemplates.length}</p>
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
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Popular Templates</h3>
              <Button variant="outline" onClick={handleCreateTemplate}>
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
                    <p className="text-3xl font-bold">{mockUsageStats.totalGenerations}</p>
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
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generation History</h3>
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
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
                            <Button variant="ghost" size="sm" onClick={() => handleRetryGeneration(gen)}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleDownloadCreation}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteGeneration(gen)}>
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
                    <p className="text-3xl font-bold">{mockModels.length}</p>
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
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
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
                              {mockModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
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
                          <Button variant="outline" size="sm" onClick={() => setShowRegenerateKeyDialog(true)}>Regenerate</Button>
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
                            <Button variant={service.connected ? "outline" : "default"} size="sm" onClick={() => handleConnectService(service.name, service.connected)}>
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
                          <Button variant="outline" size="sm" onClick={handleClearCache}>Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <HardDrive className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Downloaded Models</p>
                              <p className="text-sm text-gray-500">4.5 GB used</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleManageModels}>Manage</Button>
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
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllDialog(true)}>Delete All</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset Settings</p>
                            <p className="text-sm text-gray-500">Reset all settings to defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
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
              insights={mockAICreateInsights}
              title="AI Creation Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAICreateCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAICreatePredictions}
              title="Creative Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAICreateActivities}
            title="Creation Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
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
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={handleRegenerateCreation}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button variant="outline" onClick={handleCreateVariation}>
                      <Layers className="w-4 h-4 mr-2" />
                      Create Variation
                    </Button>
                    <Button variant="outline" onClick={handleDownloadCreation}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={handleShareCreation}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    {selectedGeneration.isFavorite ? (
                      <Button variant="outline" onClick={() => handleToggleFavorite(selectedGeneration)}>
                        <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                        Favorited
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => handleToggleFavorite(selectedGeneration)}>
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

        {/* New Creation Dialog */}
        <Dialog open={showNewCreationDialog} onOpenChange={setShowNewCreationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                New AI Creation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Quick Prompt</Label>
                <Textarea
                  placeholder="Describe what you want to create..."
                  className="mt-2"
                  rows={4}
                />
              </div>
              <div>
                <Label>Style Preset</Label>
                <select className="w-full mt-2 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                  {styles.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Quality</Label>
                <select className="w-full mt-2 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                  <option value="draft">Draft (Fast)</option>
                  <option value="standard">Standard</option>
                  <option value="high">High Quality</option>
                  <option value="ultra">Ultra (Slow)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewCreationDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={async () => {
                  toast.promise(
                    fetch('/api/ai/create', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: newCreationPrompt, type: selectedCreationType, settings: generatorSettings })
                    }),
                    { loading: 'Creating with AI...', success: 'AI creation started', error: 'Failed to start creation' }
                  )
                  setShowNewCreationDialog(false)
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Creating
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Use Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-500" />
                Choose a Template
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search templates..." className="pl-10" />
              </div>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-4">
                  {mockTemplates.map(template => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow hover:ring-2 hover:ring-purple-500"
                      onClick={() => {
                        setGeneratorSettings(prev => ({ ...prev, style: template.style, quality: template.quality || prev.quality }))
                        setNewCreationPrompt(template.prompt || '')
                        toast.success('Template loaded', { description: `"${template.name}" template applied to generator` })
                        setShowTemplateDialog(false)
                      }}
                    >
                      <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 relative flex items-center justify-center text-3xl">
                        {template.style === 'fantasy' ? '⚔️' : template.style === 'cyberpunk' ? '🤖' : template.style === 'anime' ? '🎌' : '📷'}
                        {template.isPremium && (
                          <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-700">
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{template.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Gallery Dialog */}
        <Dialog open={showGalleryDialog} onOpenChange={setShowGalleryDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-blue-500" />
                Your Gallery
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{mockGenerations.length} creations</Badge>
                  <Badge variant="secondary">{mockGenerations.filter(g => g.isFavorite).length} favorites</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant={galleryDialogViewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setGalleryDialogViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant={galleryDialogViewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setGalleryDialogViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[500px]">
                <div className={galleryDialogViewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
                  {mockGenerations.map(gen => (
                    <Card
                      key={gen.id}
                      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                      onClick={() => {
                        setSelectedGeneration(gen)
                        setShowGalleryDialog(false)
                      }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 relative flex items-center justify-center text-4xl">
                        {gen.style === 'fantasy' ? '🐉' : gen.style === 'cyberpunk' ? '🌃' : gen.style === 'anime' ? '✨' : '🎨'}
                        {gen.isFavorite && (
                          <Heart className="absolute top-2 left-2 w-4 h-4 text-red-500 fill-red-500" />
                        )}
                        <Badge className={`absolute top-2 right-2 ${getStatusColor(gen.status)}`}>
                          {gen.status}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{gen.prompt}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(gen.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {gen.likes}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('gallery')}>
                Go to Full Gallery
              </Button>
              <Button variant="outline" onClick={() => setShowGalleryDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Upgrade Your Plan
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Pro Plan Benefits</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-center gap-2"><Gem className="w-4 h-4 text-purple-500" /> 10,000 credits/month</li>
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Priority generation queue</li>
                  <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-500" /> Access to all AI models</li>
                  <li className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-blue-500" /> Unlimited storage</li>
                </ul>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">$29<span className="text-lg text-gray-500">/month</span></p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                onClick={async () => {
                  const res = await fetch('/api/billing/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) })
                  const data = await res.json()
                  if (data.url) window.location.href = data.url
                  else toast.error('Failed to create checkout session')
                  setShowUpgradeDialog(false)
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Template Dialog */}
        <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-500" />
                Create New Template
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name</Label>
                <Input placeholder="Enter template name..." className="mt-2" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe your template..." className="mt-2" rows={3} />
              </div>
              <div>
                <Label>Prompt</Label>
                <Textarea placeholder="Enter the base prompt for this template..." className="mt-2" rows={4} />
              </div>
              <div>
                <Label>Style Preset</Label>
                <select className="w-full mt-2 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                  {styles.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateTemplateDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                onClick={async () => {
                  toast.promise(
                    fetch('/api/ai/templates', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: 'New Template', prompt: newCreationPrompt, style: generatorSettings.style })
                    }),
                    { loading: 'Saving template...', success: 'Template created', error: 'Failed to save template' }
                  )
                  setShowCreateTemplateDialog(false)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateKeyDialog} onOpenChange={setShowRegenerateKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-orange-500" />
                Regenerate API Key
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Warning</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Regenerating your API key will invalidate the current key. Any applications using the old key will stop working.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRegenerateApiKey}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Models Dialog */}
        <Dialog open={showManageModelsDialog} onOpenChange={setShowManageModelsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-500" />
                Manage Downloaded Models
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                        <p className="text-xs text-gray-500">1.2 GB</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to remove ${model.name}? This action cannot be undone.`)) {
                          toast.promise(
                            fetch(`/api/ai/models/${model.id}`, { method: 'DELETE' }),
                            { loading: 'Removing model...', success: `${model.name} has been deleted`, error: 'Failed to remove model' }
                          )
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowManageModelsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete All Generations Dialog */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete All Generations
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">This action cannot be undone</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      All your AI generations will be permanently deleted. This includes images, variations, and all associated data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAllGenerations}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <RefreshCw className="w-5 h-5" />
                Reset All Settings
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Reset to defaults?</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      All your preferences, customizations, and settings will be reset to their default values.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleResetSettings}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
