"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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
  Package,
  Download,
  Upload,
  Share2,
  Star,
  Folder,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Code,
  Type,
  Palette,
  Box,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Grid3x3,
  List,
  Check,
  Clock,
  AlertCircle,
  XCircle,
  Users,
  Lock,
  Globe,
  Link2,
  Copy,
  Tag,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  Bookmark,
  Heart,
  MessageSquare,
  History,
  Shield,
  Zap,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Award,
  Layers,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Sparkles
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
  assetsAIInsights,
  assetsCollaborators,
  assetsPredictions,
  assetsActivities,
  assetsQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type AssetType = 'image' | 'video' | 'audio' | 'document' | 'font' | 'icon' | 'template' | 'brand_asset' | '3d_model' | 'raw_file'
type AssetStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'expired' | 'archived'
type LicenseType = 'royalty_free' | 'rights_managed' | 'creative_commons' | 'exclusive' | 'internal_only'
type AccessLevel = 'public' | 'internal' | 'restricted' | 'private'
type PermissionLevel = 'view' | 'download' | 'edit' | 'admin'

interface AssetVariant {
  id: string
  name: string
  format: string
  size: number
  dimensions?: string
  url: string
}

interface AssetVersion {
  id: string
  version: number
  createdAt: Date
  createdBy: string
  changes: string
  size: number
}

interface AssetUsage {
  id: string
  project: string
  location: string
  usedBy: string
  usedAt: Date
}

interface DigitalAsset {
  id: string
  name: string
  description: string
  type: AssetType
  status: AssetStatus
  license: LicenseType
  accessLevel: AccessLevel
  thumbnail: string
  fileSize: number
  format: string
  dimensions?: string
  duration?: string
  downloads: number
  views: number
  favorites: number
  tags: string[]
  keywords: string[]
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
  createdBy: {
    id: string
    name: string
    avatar: string
  }
  variants: AssetVariant[]
  versions: AssetVersion[]
  usage: AssetUsage[]
  metadata: Record<string, string>
  brandId?: string
  collectionIds: string[]
  isFavorite: boolean
  isStarred: boolean
}

interface AssetCollection {
  id: string
  name: string
  description: string
  thumbnail: string
  assetCount: number
  totalSize: number
  accessLevel: AccessLevel
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    name: string
    avatar: string
  }
}

interface BrandGuideline {
  id: string
  name: string
  category: string
  content: string
  assets: string[]
  updatedAt: Date
}

interface BrandPortal {
  id: string
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  fonts: string[]
  guidelines: BrandGuideline[]
  assetCount: number
}

// Mock Data
const mockAssets: DigitalAsset[] = [
  {
    id: '1',
    name: 'Brand Logo Primary',
    description: 'Primary brand logo in full color for marketing materials',
    type: 'image',
    status: 'published',
    license: 'internal_only',
    accessLevel: 'internal',
    thumbnail: '/assets/logo.png',
    fileSize: 2.4 * 1024 * 1024,
    format: 'SVG',
    dimensions: '1200x630',
    downloads: 1250,
    views: 4580,
    favorites: 89,
    tags: ['logo', 'brand', 'primary'],
    keywords: ['identity', 'marketing', 'official'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-10'),
    createdBy: { id: '1', name: 'Sarah Chen', avatar: '' },
    variants: [
      { id: 'v1', name: 'SVG', format: 'svg', size: 45000, url: '/assets/logo.svg' },
      { id: 'v2', name: 'PNG Large', format: 'png', size: 2400000, dimensions: '2400x1260', url: '/assets/logo-lg.png' },
      { id: 'v3', name: 'PNG Small', format: 'png', size: 120000, dimensions: '600x315', url: '/assets/logo-sm.png' },
      { id: 'v4', name: 'JPEG', format: 'jpg', size: 180000, dimensions: '1200x630', url: '/assets/logo.jpg' }
    ],
    versions: [
      { id: 'ver1', version: 3, createdAt: new Date('2024-12-10'), createdBy: 'Sarah Chen', changes: 'Updated color palette', size: 2400000 },
      { id: 'ver2', version: 2, createdAt: new Date('2024-06-15'), createdBy: 'Mike Johnson', changes: 'Refined typography', size: 2350000 },
      { id: 'ver3', version: 1, createdAt: new Date('2024-01-15'), createdBy: 'Sarah Chen', changes: 'Initial upload', size: 2300000 }
    ],
    usage: [
      { id: 'u1', project: 'Website Redesign', location: 'Header', usedBy: 'Design Team', usedAt: new Date('2024-12-15') },
      { id: 'u2', project: 'Marketing Campaign', location: 'Email Banner', usedBy: 'Marketing', usedAt: new Date('2024-12-10') }
    ],
    metadata: { colorSpace: 'sRGB', author: 'Brand Team', copyright: '2024 Company Inc.' },
    brandId: 'b1',
    collectionIds: ['c1', 'c2'],
    isFavorite: true,
    isStarred: true
  },
  {
    id: '2',
    name: 'Product Demo Video',
    description: 'Main product demonstration video for onboarding',
    type: 'video',
    status: 'approved',
    license: 'internal_only',
    accessLevel: 'public',
    thumbnail: '/assets/video-thumb.jpg',
    fileSize: 156 * 1024 * 1024,
    format: 'MP4',
    dimensions: '1920x1080',
    duration: '3:45',
    downloads: 890,
    views: 12500,
    favorites: 156,
    tags: ['video', 'demo', 'product'],
    keywords: ['tutorial', 'onboarding', 'features'],
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-11-28'),
    createdBy: { id: '2', name: 'Mike Johnson', avatar: '' },
    variants: [
      { id: 'v1', name: '4K', format: 'mp4', size: 520000000, dimensions: '3840x2160', url: '/assets/demo-4k.mp4' },
      { id: 'v2', name: '1080p', format: 'mp4', size: 156000000, dimensions: '1920x1080', url: '/assets/demo-1080.mp4' },
      { id: 'v3', name: '720p', format: 'mp4', size: 78000000, dimensions: '1280x720', url: '/assets/demo-720.mp4' }
    ],
    versions: [],
    usage: [],
    metadata: { codec: 'H.264', frameRate: '30fps', bitrate: '8Mbps' },
    collectionIds: ['c3'],
    isFavorite: false,
    isStarred: true
  },
  {
    id: '3',
    name: 'Brand Typeface - Inter',
    description: 'Official brand typeface family',
    type: 'font',
    status: 'published',
    license: 'royalty_free',
    accessLevel: 'internal',
    thumbnail: '/assets/font-preview.png',
    fileSize: 4.2 * 1024 * 1024,
    format: 'OTF',
    downloads: 2340,
    views: 5600,
    favorites: 234,
    tags: ['font', 'typography', 'brand'],
    keywords: ['typeface', 'inter', 'sans-serif'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    createdBy: { id: '1', name: 'Sarah Chen', avatar: '' },
    variants: [
      { id: 'v1', name: 'Regular', format: 'otf', size: 600000, url: '/fonts/inter-regular.otf' },
      { id: 'v2', name: 'Medium', format: 'otf', size: 620000, url: '/fonts/inter-medium.otf' },
      { id: 'v3', name: 'Bold', format: 'otf', size: 640000, url: '/fonts/inter-bold.otf' },
      { id: 'v4', name: 'Web Package', format: 'woff2', size: 380000, url: '/fonts/inter-web.zip' }
    ],
    versions: [],
    usage: [],
    metadata: { designer: 'Rasmus Andersson', weights: '9', styles: 'Regular, Italic' },
    brandId: 'b1',
    collectionIds: ['c1'],
    isFavorite: true,
    isStarred: false
  },
  {
    id: '4',
    name: 'Icon Set - Lucide',
    description: 'Complete icon library for UI design',
    type: 'icon',
    status: 'published',
    license: 'creative_commons',
    accessLevel: 'public',
    thumbnail: '/assets/icons-preview.png',
    fileSize: 8.5 * 1024 * 1024,
    format: 'SVG',
    downloads: 5670,
    views: 18900,
    favorites: 456,
    tags: ['icons', 'ui', 'design'],
    keywords: ['svg', 'vector', 'interface'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-12-01'),
    createdBy: { id: '3', name: 'Alex Rivera', avatar: '' },
    variants: [
      { id: 'v1', name: 'SVG Package', format: 'zip', size: 8500000, url: '/icons/lucide-svg.zip' },
      { id: 'v2', name: 'Figma Library', format: 'fig', size: 12000000, url: '/icons/lucide.fig' },
      { id: 'v3', name: 'React Components', format: 'npm', size: 2400000, url: 'npm:lucide-react' }
    ],
    versions: [],
    usage: [],
    metadata: { iconCount: '1000+', style: 'Outline', strokeWidth: '2px' },
    collectionIds: ['c4'],
    isFavorite: false,
    isStarred: true
  },
  {
    id: '5',
    name: 'Pitch Deck Template',
    description: 'Official investor pitch deck template',
    type: 'template',
    status: 'approved',
    license: 'internal_only',
    accessLevel: 'restricted',
    thumbnail: '/assets/pitch-deck.png',
    fileSize: 12 * 1024 * 1024,
    format: 'PPTX',
    downloads: 345,
    views: 1890,
    favorites: 78,
    tags: ['template', 'presentation', 'investor'],
    keywords: ['pitch', 'deck', 'slides'],
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-10-20'),
    createdBy: { id: '4', name: 'Emma Wilson', avatar: '' },
    variants: [
      { id: 'v1', name: 'PowerPoint', format: 'pptx', size: 12000000, url: '/templates/pitch-deck.pptx' },
      { id: 'v2', name: 'Google Slides', format: 'gslides', size: 0, url: 'https://slides.google.com/...' },
      { id: 'v3', name: 'Keynote', format: 'key', size: 14000000, url: '/templates/pitch-deck.key' }
    ],
    versions: [],
    usage: [],
    metadata: { slides: '24', animations: 'Yes', theme: 'Corporate' },
    brandId: 'b1',
    collectionIds: ['c5'],
    isFavorite: true,
    isStarred: false
  },
  {
    id: '6',
    name: 'Product Photography Set',
    description: 'High-resolution product photos for e-commerce',
    type: 'image',
    status: 'published',
    license: 'rights_managed',
    accessLevel: 'internal',
    thumbnail: '/assets/product-photos.jpg',
    fileSize: 450 * 1024 * 1024,
    format: 'RAW',
    dimensions: '6000x4000',
    downloads: 234,
    views: 3450,
    favorites: 67,
    tags: ['photography', 'product', 'ecommerce'],
    keywords: ['studio', 'professional', 'catalog'],
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-11-15'),
    expiresAt: new Date('2025-05-10'),
    createdBy: { id: '5', name: 'James Park', avatar: '' },
    variants: [
      { id: 'v1', name: 'RAW Files', format: 'arw', size: 450000000, url: '/photos/product-raw.zip' },
      { id: 'v2', name: 'High Res JPEG', format: 'jpg', size: 85000000, dimensions: '6000x4000', url: '/photos/product-hr.zip' },
      { id: 'v3', name: 'Web Optimized', format: 'jpg', size: 12000000, dimensions: '2000x1333', url: '/photos/product-web.zip' }
    ],
    versions: [],
    usage: [],
    metadata: { camera: 'Sony A7R IV', lens: '85mm f/1.4', lighting: 'Studio' },
    collectionIds: ['c6'],
    isFavorite: false,
    isStarred: false
  },
  {
    id: '7',
    name: 'Brand Audio Logo',
    description: 'Audio branding signature for videos and ads',
    type: 'audio',
    status: 'published',
    license: 'exclusive',
    accessLevel: 'internal',
    thumbnail: '/assets/audio-wave.png',
    fileSize: 2.8 * 1024 * 1024,
    format: 'WAV',
    duration: '0:05',
    downloads: 567,
    views: 2340,
    favorites: 89,
    tags: ['audio', 'logo', 'brand'],
    keywords: ['sonic', 'jingle', 'signature'],
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-02-28'),
    createdBy: { id: '6', name: 'Olivia Brown', avatar: '' },
    variants: [
      { id: 'v1', name: 'WAV Master', format: 'wav', size: 2800000, url: '/audio/brand-logo.wav' },
      { id: 'v2', name: 'MP3 High', format: 'mp3', size: 450000, url: '/audio/brand-logo.mp3' },
      { id: 'v3', name: 'AAC', format: 'm4a', size: 380000, url: '/audio/brand-logo.m4a' }
    ],
    versions: [],
    usage: [],
    metadata: { sampleRate: '48kHz', bitDepth: '24-bit', channels: 'Stereo' },
    brandId: 'b1',
    collectionIds: ['c1'],
    isFavorite: false,
    isStarred: true
  },
  {
    id: '8',
    name: '3D Product Model',
    description: 'Interactive 3D model for AR experiences',
    type: '3d_model',
    status: 'pending_review',
    license: 'internal_only',
    accessLevel: 'restricted',
    thumbnail: '/assets/3d-model.png',
    fileSize: 34 * 1024 * 1024,
    format: 'GLTF',
    downloads: 45,
    views: 890,
    favorites: 23,
    tags: ['3d', 'model', 'ar'],
    keywords: ['interactive', 'visualization', 'product'],
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-18'),
    createdBy: { id: '7', name: 'David Kim', avatar: '' },
    variants: [
      { id: 'v1', name: 'GLTF', format: 'gltf', size: 34000000, url: '/models/product.gltf' },
      { id: 'v2', name: 'USDZ (iOS)', format: 'usdz', size: 28000000, url: '/models/product.usdz' },
      { id: 'v3', name: 'FBX', format: 'fbx', size: 42000000, url: '/models/product.fbx' }
    ],
    versions: [],
    usage: [],
    metadata: { polygons: '45,000', textures: '4K PBR', rigged: 'No' },
    collectionIds: ['c7'],
    isFavorite: false,
    isStarred: false
  }
]

const mockCollections: AssetCollection[] = [
  {
    id: 'c1',
    name: 'Brand Identity',
    description: 'Core brand assets and guidelines',
    thumbnail: '/collections/brand.png',
    assetCount: 24,
    totalSize: 156 * 1024 * 1024,
    accessLevel: 'internal',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-15'),
    createdBy: { id: '1', name: 'Sarah Chen', avatar: '' }
  },
  {
    id: 'c2',
    name: 'Marketing Materials',
    description: 'Campaign assets and templates',
    thumbnail: '/collections/marketing.png',
    assetCount: 89,
    totalSize: 2.4 * 1024 * 1024 * 1024,
    accessLevel: 'internal',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-12-10'),
    createdBy: { id: '2', name: 'Mike Johnson', avatar: '' }
  },
  {
    id: 'c3',
    name: 'Product Videos',
    description: 'All product demo and tutorial videos',
    thumbnail: '/collections/videos.png',
    assetCount: 34,
    totalSize: 8.5 * 1024 * 1024 * 1024,
    accessLevel: 'public',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-11-28'),
    createdBy: { id: '2', name: 'Mike Johnson', avatar: '' }
  },
  {
    id: 'c4',
    name: 'UI/UX Resources',
    description: 'Design system components and patterns',
    thumbnail: '/collections/uiux.png',
    assetCount: 156,
    totalSize: 890 * 1024 * 1024,
    accessLevel: 'internal',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-12-01'),
    createdBy: { id: '3', name: 'Alex Rivera', avatar: '' }
  },
  {
    id: 'c5',
    name: 'Sales Enablement',
    description: 'Pitch decks, one-pagers, and case studies',
    thumbnail: '/collections/sales.png',
    assetCount: 45,
    totalSize: 340 * 1024 * 1024,
    accessLevel: 'restricted',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-10-20'),
    createdBy: { id: '4', name: 'Emma Wilson', avatar: '' }
  },
  {
    id: 'c6',
    name: 'Product Photography',
    description: 'Official product photos and lifestyle shots',
    thumbnail: '/collections/photos.png',
    assetCount: 234,
    totalSize: 12 * 1024 * 1024 * 1024,
    accessLevel: 'internal',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-11-15'),
    createdBy: { id: '5', name: 'James Park', avatar: '' }
  }
]

const mockBrandPortal: BrandPortal = {
  id: 'b1',
  name: 'Kazi Brand',
  logo: '/brand/logo.svg',
  primaryColor: '#6366F1',
  secondaryColor: '#EC4899',
  fonts: ['Inter', 'JetBrains Mono'],
  guidelines: [
    { id: 'g1', name: 'Logo Usage', category: 'Visual Identity', content: 'Guidelines for logo placement and sizing', assets: ['1'], updatedAt: new Date('2024-12-01') },
    { id: 'g2', name: 'Color Palette', category: 'Visual Identity', content: 'Brand colors and usage rules', assets: [], updatedAt: new Date('2024-12-01') },
    { id: 'g3', name: 'Typography', category: 'Visual Identity', content: 'Font usage and hierarchy', assets: ['3'], updatedAt: new Date('2024-12-01') },
    { id: 'g4', name: 'Photography Style', category: 'Imagery', content: 'Photo treatment and selection', assets: ['6'], updatedAt: new Date('2024-11-15') },
    { id: 'g5', name: 'Tone of Voice', category: 'Messaging', content: 'Brand voice and messaging guidelines', assets: [], updatedAt: new Date('2024-10-20') }
  ],
  assetCount: 156
}

// Helper Functions
const getAssetTypeIcon = (type: AssetType) => {
  const icons: Record<AssetType, React.ReactNode> = {
    image: <ImageIcon className="w-5 h-5" />,
    video: <Video className="w-5 h-5" />,
    audio: <Music className="w-5 h-5" />,
    document: <FileText className="w-5 h-5" />,
    font: <Type className="w-5 h-5" />,
    icon: <Sparkles className="w-5 h-5" />,
    template: <Layers className="w-5 h-5" />,
    brand_asset: <Award className="w-5 h-5" />,
    '3d_model': <Box className="w-5 h-5" />,
    raw_file: <File className="w-5 h-5" />
  }
  return icons[type] || <File className="w-5 h-5" />
}

const getAssetTypeColor = (type: AssetType): string => {
  const colors: Record<AssetType, string> = {
    image: 'from-blue-500 to-cyan-500',
    video: 'from-purple-500 to-pink-500',
    audio: 'from-green-500 to-emerald-500',
    document: 'from-orange-500 to-amber-500',
    font: 'from-pink-500 to-rose-500',
    icon: 'from-indigo-500 to-violet-500',
    template: 'from-yellow-500 to-orange-500',
    brand_asset: 'from-teal-500 to-cyan-500',
    '3d_model': 'from-red-500 to-orange-500',
    raw_file: 'from-gray-500 to-slate-500'
  }
  return colors[type] || 'from-gray-500 to-slate-500'
}

const getStatusColor = (status: AssetStatus): string => {
  const colors: Record<AssetStatus, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    archived: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
  }
  return colors[status] || colors.draft
}

const getStatusIcon = (status: AssetStatus) => {
  const icons: Record<AssetStatus, React.ReactNode> = {
    draft: <Edit3 className="w-3 h-3" />,
    pending_review: <Clock className="w-3 h-3" />,
    approved: <Check className="w-3 h-3" />,
    published: <Globe className="w-3 h-3" />,
    expired: <AlertCircle className="w-3 h-3" />,
    archived: <Archive className="w-3 h-3" />
  }
  return icons[status] || icons.draft
}

const getLicenseColor = (license: LicenseType): string => {
  const colors: Record<LicenseType, string> = {
    royalty_free: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rights_managed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    creative_commons: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    exclusive: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    internal_only: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  return colors[license] || colors.internal_only
}

const getAccessIcon = (access: AccessLevel) => {
  const icons: Record<AccessLevel, React.ReactNode> = {
    public: <Globe className="w-3 h-3" />,
    internal: <Users className="w-3 h-3" />,
    restricted: <Shield className="w-3 h-3" />,
    private: <Lock className="w-3 h-3" />
  }
  return icons[access] || icons.internal
}

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes} B`
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

interface AssetsClientProps {
  initialAssets?: any[]
  initialCollections?: any[]
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Bynder/Brandfolder Level
// ============================================================================

const mockAssetsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Storage Optimized', description: 'Image compression saved 2.5GB this month without quality loss.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '2', type: 'warning' as const, title: 'License Expiring', description: '15 stock images have licenses expiring next week.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '3', type: 'info' as const, title: 'Popular Assets', description: 'Brand logo downloaded 250 times this month. Most used asset!', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockAssetsCollaborators = [
  { id: '1', name: 'Brand Manager', avatar: '/avatars/brand.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Designer', avatar: '/avatars/designer.jpg', status: 'online' as const, role: 'Design' },
  { id: '3', name: 'Marketing', avatar: '/avatars/marketing.jpg', status: 'away' as const, role: 'Marketing' },
]

const mockAssetsPredictions = [
  { id: '1', title: 'Storage Growth', prediction: 'Asset library will reach 1TB by end of quarter', confidence: 91, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Usage Trend', prediction: 'Video assets usage increasing 40% month over month', confidence: 87, trend: 'up' as const, impact: 'medium' as const },
]

const mockAssetsActivities = [
  { id: '1', user: 'Designer', action: 'Uploaded', target: '25 new product images', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Brand Manager', action: 'Updated', target: 'brand guidelines PDF', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Marketing', action: 'Downloaded', target: 'campaign assets bundle', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

const mockAssetsQuickActions = [
  { id: '1', label: 'Upload Assets', icon: 'upload', action: () => console.log('Upload assets'), variant: 'default' as const },
  { id: '2', label: 'New Collection', icon: 'folder', action: () => console.log('New collection'), variant: 'default' as const },
  { id: '3', label: 'Bulk Edit', icon: 'edit', action: () => console.log('Bulk edit'), variant: 'outline' as const },
]

export default function AssetsClient({ initialAssets, initialCollections }: AssetsClientProps) {
  const [activeTab, setActiveTab] = useState('assets')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'all'>('all')
  const [selectedAsset, setSelectedAsset] = useState<DigitalAsset | null>(null)
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)

  const assets = mockAssets
  const collections = mockCollections
  const brandPortal = mockBrandPortal

  // Computed Statistics
  const stats = useMemo(() => {
    const totalAssets = assets.length
    const totalSize = assets.reduce((sum, a) => sum + a.fileSize, 0)
    const totalDownloads = assets.reduce((sum, a) => sum + a.downloads, 0)
    const totalViews = assets.reduce((sum, a) => sum + a.views, 0)
    const publishedCount = assets.filter(a => a.status === 'published').length
    const pendingCount = assets.filter(a => a.status === 'pending_review').length
    const expiredCount = assets.filter(a => a.status === 'expired').length
    const favoriteCount = assets.filter(a => a.isFavorite).length

    return {
      totalAssets,
      totalSize,
      totalDownloads,
      totalViews,
      publishedCount,
      pendingCount,
      expiredCount,
      favoriteCount,
      collectionsCount: collections.length
    }
  }, [assets, collections])

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = selectedType === 'all' || asset.type === selectedType
      const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus
      return matchesSearch && matchesType && matchesStatus
    })
  }, [assets, searchQuery, selectedType, selectedStatus])

  const openAssetDetail = (asset: DigitalAsset) => {
    setSelectedAsset(asset)
    setIsAssetDialogOpen(true)
  }

  // Handlers
  const handleSync = () => {
    toast.success('Sync started', {
      description: 'Syncing assets with cloud storage...'
    })
  }

  const handleUploadAssets = () => {
    toast.info('Upload Assets', {
      description: 'Opening file picker...'
    })
  }

  const handleShareAsset = () => {
    if (!selectedAsset) return
    toast.success('Share link copied', {
      description: `Sharing link for ${selectedAsset.name} copied to clipboard`
    })
  }

  const handleFavoriteAsset = () => {
    if (!selectedAsset) return
    toast.success(selectedAsset.isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      description: selectedAsset.name
    })
  }

  const handleDownloadAsset = () => {
    if (!selectedAsset) return
    toast.success('Download started', {
      description: `Downloading ${selectedAsset.name}`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50/30 to-rose-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Digital Asset Management</h1>
              <p className="text-muted-foreground">Bynder-level brand asset organization and distribution</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSync}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={handleUploadAssets}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Assets
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAssets}</p>
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stats.totalDownloads / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                  <p className="text-xs text-muted-foreground">Storage</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.publishedCount}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.collectionsCount}</p>
                  <p className="text-xs text-muted-foreground">Collections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.favoriteCount}</p>
                  <p className="text-xs text-muted-foreground">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-1">
            <TabsTrigger value="assets" className="gap-2">
              <Package className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <Folder className="w-4 h-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="brand" className="gap-2">
              <Award className="w-4 h-4" />
              Brand Portal
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="gap-2">
              <FileText className="w-4 h-4" />
              Guidelines
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

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6">
            {/* Assets Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Asset Library</h2>
                  <p className="text-purple-100">Bynder-level digital asset management and organization</p>
                  <p className="text-purple-200 text-xs mt-1">Multi-format support • Version control • Smart tagging</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredAssets.length}</p>
                    <p className="text-purple-200 text-sm">Assets Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{assets.filter(a => a.status === 'published').length}</p>
                    <p className="text-purple-200 text-sm">Published</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: <Upload className="w-4 h-4" />, label: 'Upload', color: 'text-purple-600' },
                { icon: <Folder className="w-4 h-4" />, label: 'New Folder', color: 'text-blue-600' },
                { icon: <Tag className="w-4 h-4" />, label: 'Bulk Tag', color: 'text-green-600' },
                { icon: <Download className="w-4 h-4" />, label: 'Export', color: 'text-orange-600' },
                { icon: <Share2 className="w-4 h-4" />, label: 'Share', color: 'text-pink-600' },
                { icon: <Archive className="w-4 h-4" />, label: 'Archive', color: 'text-amber-600' },
                { icon: <Trash2 className="w-4 h-4" />, label: 'Clean Up', color: 'text-red-600' },
                { icon: <RefreshCw className="w-4 h-4" />, label: 'Sync', color: 'text-cyan-600' }
              ].map((action, index) => (
                <Button key={index} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <span className={action.color}>{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search assets, tags, keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-80"
                      />
                    </div>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as AssetType | 'all')}
                      className="h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Types</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="document">Documents</option>
                      <option value="font">Fonts</option>
                      <option value="icon">Icons</option>
                      <option value="template">Templates</option>
                      <option value="brand_asset">Brand Assets</option>
                      <option value="3d_model">3D Models</option>
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as AssetStatus | 'all')}
                      className="h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="expired">Expired</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAssets.map((asset) => (
                      <Card
                        key={asset.id}
                        className="group cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => openAssetDetail(asset)}
                      >
                        <div className={`aspect-video rounded-t-lg bg-gradient-to-br ${getAssetTypeColor(asset.type)} flex items-center justify-center relative overflow-hidden`}>
                          <div className="text-white/20 text-6xl">
                            {getAssetTypeIcon(asset.type)}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1">
                            {asset.isStarred && (
                              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                                <Star className="w-3 h-3 text-white fill-white" />
                              </div>
                            )}
                            {asset.isFavorite && (
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                <Heart className="w-3 h-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <Badge className={getStatusColor(asset.status)}>
                              {getStatusIcon(asset.status)}
                              <span className="ml-1 capitalize">{asset.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{asset.name}</h4>
                              <p className="text-xs text-muted-foreground capitalize">{asset.type.replace('_', ' ')} • {asset.format}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getLicenseColor(asset.license)}>
                              {asset.license.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getAccessIcon(asset.accessLevel)}
                              {asset.accessLevel}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {asset.downloads}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {asset.views}
                            </span>
                            <span>{formatFileSize(asset.fileSize)}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {asset.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs">
                                {tag}
                              </span>
                            ))}
                            {asset.tags.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full bg-muted text-xs">
                                +{asset.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => openAssetDetail(asset)}
                      >
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getAssetTypeColor(asset.type)} flex items-center justify-center flex-shrink-0`}>
                          <div className="text-white/60">
                            {getAssetTypeIcon(asset.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{asset.name}</h4>
                            {asset.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            {asset.isFavorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 truncate">{asset.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(asset.status)}>
                              {getStatusIcon(asset.status)}
                              <span className="ml-1 capitalize">{asset.status.replace('_', ' ')}</span>
                            </Badge>
                            <Badge className={getLicenseColor(asset.license)}>
                              {asset.license.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground capitalize">{asset.type.replace('_', ' ')} • {asset.format}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {asset.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {asset.views}
                          </span>
                          <span>{formatFileSize(asset.fileSize)}</span>
                          <span>{formatDate(asset.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            {/* Collections Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Asset Collections</h2>
                  <p className="text-blue-100">Brandfolder-level organization with smart collections</p>
                  <p className="text-blue-200 text-xs mt-1">Auto-tagging • Nested folders • Access permissions</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.length}</p>
                    <p className="text-blue-200 text-sm">Collections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{collections.reduce((sum, c) => sum + c.assetCount, 0)}</p>
                    <p className="text-blue-200 text-sm">Total Assets</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="group cursor-pointer hover:shadow-lg transition-all">
                  <div className="aspect-video rounded-t-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative">
                    <Folder className="w-16 h-16 text-white/30" />
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-white/20 text-white backdrop-blur">
                        {collection.assetCount} assets
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{collection.name}</h4>
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getAccessIcon(collection.accessLevel)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{collection.createdBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{collection.createdBy.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatFileSize(collection.totalSize)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all flex items-center justify-center min-h-[280px]">
                <div className="text-center p-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                    <Folder className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium mb-1">Create Collection</h4>
                  <p className="text-sm text-muted-foreground">Organize assets into groups</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Brand Portal Tab */}
          <TabsContent value="brand" className="mt-6">
            {/* Brand Portal Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Brand Portal</h2>
                  <p className="text-amber-100">Frontify-level brand management and consistency</p>
                  <p className="text-amber-200 text-xs mt-1">Style guides • Color palettes • Typography systems</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{brandPortal.assetCount}</p>
                    <p className="text-amber-200 text-sm">Brand Assets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{brandPortal.guidelines.length}</p>
                    <p className="text-amber-200 text-sm">Guidelines</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      {brandPortal.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Brand Colors</h4>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg shadow-sm border"
                            style={{ backgroundColor: brandPortal.primaryColor }}
                          />
                          <div>
                            <p className="text-sm font-medium">Primary</p>
                            <p className="text-xs text-muted-foreground">{brandPortal.primaryColor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <div
                            className="w-12 h-12 rounded-lg shadow-sm border"
                            style={{ backgroundColor: brandPortal.secondaryColor }}
                          />
                          <div>
                            <p className="text-sm font-medium">Secondary</p>
                            <p className="text-xs text-muted-foreground">{brandPortal.secondaryColor}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-3">Brand Fonts</h4>
                        {brandPortal.fonts.map((font) => (
                          <div key={font} className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Type className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{font}</p>
                              <p className="text-xs text-muted-foreground">Brand Typeface</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Brand Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {assets.filter(a => a.brandId === brandPortal.id).map((asset) => (
                        <div key={asset.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                          <div className={`aspect-square rounded-lg bg-gradient-to-br ${getAssetTypeColor(asset.type)} flex items-center justify-center mb-2`}>
                            <div className="text-white/40 text-2xl">
                              {getAssetTypeIcon(asset.type)}
                            </div>
                          </div>
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{asset.type.replace('_', ' ')}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Brand Assets</span>
                      <span className="font-semibold">{brandPortal.assetCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Guidelines</span>
                      <span className="font-semibold">{brandPortal.guidelines.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Typefaces</span>
                      <span className="font-semibold">{brandPortal.fonts.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Download Brand Kit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Get all brand assets in one package</p>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Kit
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandPortal.guidelines.map((guideline) => (
                <Card key={guideline.id} className="cursor-pointer hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{guideline.name}</h4>
                        <Badge variant="secondary" className="mb-2">{guideline.category}</Badge>
                        <p className="text-sm text-muted-foreground">{guideline.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated {formatDate(guideline.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all">
                <CardContent className="p-6 flex items-center justify-center min-h-[180px]">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-medium mb-1">Add Guideline</h4>
                    <p className="text-sm text-muted-foreground">Create a new brand guideline</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Asset Analytics</h2>
                  <p className="text-emerald-100">Canto-level insights and performance tracking</p>
                  <p className="text-emerald-200 text-xs mt-1">Usage reports • Download trends • Team metrics</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats.totalDownloads / 1000).toFixed(1)}K</p>
                    <p className="text-emerald-200 text-sm">Downloads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</p>
                    <p className="text-emerald-200 text-sm">Views</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Download Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                    <BarChart3 className="w-12 h-12 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Asset Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(['image', 'video', 'audio', 'document', 'font', 'template'] as AssetType[]).map((type) => {
                      const count = assets.filter(a => a.type === type).length
                      const percentage = (count / assets.length) * 100
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm capitalize flex items-center gap-2">
                              {getAssetTypeIcon(type)}
                              {type.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Downloaded Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assets.sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((asset, index) => (
                      <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAssetTypeColor(asset.type)} flex items-center justify-center`}>
                          <div className="text-white/60 text-sm">
                            {getAssetTypeIcon(asset.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{asset.type.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{asset.downloads.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">downloads</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage by Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { team: 'Marketing', downloads: 4567, percentage: 45 },
                      { team: 'Design', downloads: 2345, percentage: 25 },
                      { team: 'Product', downloads: 1234, percentage: 15 },
                      { team: 'Sales', downloads: 890, percentage: 10 },
                      { team: 'Engineering', downloads: 456, percentage: 5 }
                    ].map((item) => (
                      <div key={item.team}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{item.team}</span>
                          <span className="text-sm font-medium">{item.downloads.toLocaleString()}</span>
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
          <TabsContent value="settings" className="mt-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">DAM Settings</h2>
                  <p className="text-slate-100">Enterprise-level configuration and controls</p>
                  <p className="text-slate-200 text-xs mt-1">Storage • Access control • Integrations • Templates</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatFileSize(stats.totalSize)}</p>
                    <p className="text-slate-200 text-sm">Storage Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">4</p>
                    <p className="text-slate-200 text-sm">Integrations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: <Settings className="w-4 h-4" />, label: 'General', color: 'text-slate-600' },
                { icon: <Shield className="w-4 h-4" />, label: 'Security', color: 'text-blue-600' },
                { icon: <Users className="w-4 h-4" />, label: 'Access', color: 'text-green-600' },
                { icon: <Link2 className="w-4 h-4" />, label: 'Integrations', color: 'text-purple-600' },
                { icon: <Tag className="w-4 h-4" />, label: 'Metadata', color: 'text-orange-600' },
                { icon: <Archive className="w-4 h-4" />, label: 'Storage', color: 'text-amber-600' },
                { icon: <Zap className="w-4 h-4" />, label: 'Automation', color: 'text-yellow-600' },
                { icon: <ExternalLink className="w-4 h-4" />, label: 'Export', color: 'text-pink-600' }
              ].map((action, index) => (
                <Button key={index} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <span className={action.color}>{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Storage Used</span>
                      <span className="text-sm font-medium">{formatFileSize(stats.totalSize)} / 100 GB</span>
                    </div>
                    <Progress value={(stats.totalSize / (100 * 1024 * 1024 * 1024)) * 100} className="h-2" />
                  </div>
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Images</span>
                      </div>
                      <span className="text-sm text-muted-foreground">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">Videos</span>
                      </div>
                      <span className="text-sm text-muted-foreground">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Documents</span>
                      </div>
                      <span className="text-sm text-muted-foreground">15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Other</span>
                      </div>
                      <span className="text-sm text-muted-foreground">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: <Globe className="w-4 h-4" />, title: 'Public Assets', description: 'Allow public access to approved assets', enabled: true },
                    { icon: <Shield className="w-4 h-4" />, title: 'Approval Workflow', description: 'Require approval before publishing', enabled: true },
                    { icon: <Clock className="w-4 h-4" />, title: 'Expiration Alerts', description: 'Notify before asset expiration', enabled: false },
                    { icon: <Lock className="w-4 h-4" />, title: 'Watermarking', description: 'Auto-watermark downloads', enabled: false }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          {setting.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{setting.title}</p>
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow mt-1 transition-transform ${setting.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Figma', description: 'Sync assets with Figma libraries', connected: true },
                    { name: 'Adobe Creative Cloud', description: 'Access assets in Adobe apps', connected: true },
                    { name: 'Slack', description: 'Share assets directly to channels', connected: false },
                    { name: 'Google Drive', description: 'Backup assets to Google Drive', connected: false }
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                      <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                        {integration.connected ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Brand Assets', fields: 6 },
                    { name: 'Photography', fields: 12 },
                    { name: 'Video Content', fields: 8 },
                    { name: 'Documents', fields: 5 }
                  ].map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">{template.fields} fields</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAssetsAIInsights}
              title="Asset Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAssetsCollaborators}
              maxVisible={4}
              showStatus={true}
            />
            <PredictiveAnalytics
              predictions={mockAssetsPredictions}
              title="Asset Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAssetsActivities}
            title="Asset Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockAssetsQuickActions}
            variant="grid"
          />
        </div>

        {/* Asset Detail Dialog */}
        <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedAsset && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAssetTypeColor(selectedAsset.type)} flex items-center justify-center`}>
                      <div className="text-white">{getAssetTypeIcon(selectedAsset.type)}</div>
                    </div>
                    {selectedAsset.name}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <div className="space-y-6 p-1">
                    {/* Preview */}
                    <div className={`aspect-video rounded-lg bg-gradient-to-br ${getAssetTypeColor(selectedAsset.type)} flex items-center justify-center`}>
                      <div className="text-white/30 text-6xl">
                        {getAssetTypeIcon(selectedAsset.type)}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(selectedAsset.status)}>
                          {getStatusIcon(selectedAsset.status)}
                          <span className="ml-1 capitalize">{selectedAsset.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={getLicenseColor(selectedAsset.license)}>
                          {selectedAsset.license.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getAccessIcon(selectedAsset.accessLevel)}
                          <span className="capitalize">{selectedAsset.accessLevel}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleShareAsset}>
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleFavoriteAsset}>
                          <Heart className={`w-4 h-4 mr-1 ${selectedAsset.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          Favorite
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={handleDownloadAsset}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{selectedAsset.type.replace('_', ' ')}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Format</p>
                        <p className="font-medium">{selectedAsset.format}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Size</p>
                        <p className="font-medium">{formatFileSize(selectedAsset.fileSize)}</p>
                      </div>
                      {selectedAsset.dimensions && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Dimensions</p>
                          <p className="font-medium">{selectedAsset.dimensions}</p>
                        </div>
                      )}
                      {selectedAsset.duration && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-medium">{selectedAsset.duration}</p>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Downloads</p>
                        <p className="font-medium">{selectedAsset.downloads.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-medium">{selectedAsset.views.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(selectedAsset.createdAt)}</p>
                      </div>
                    </div>

                    {/* Variants */}
                    {selectedAsset.variants.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Available Formats</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {selectedAsset.variants.map((variant) => (
                            <div key={variant.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                              <p className="font-medium text-sm">{variant.name}</p>
                              <p className="text-xs text-muted-foreground">{variant.format.toUpperCase()} • {formatFileSize(variant.size)}</p>
                              {variant.dimensions && (
                                <p className="text-xs text-muted-foreground">{variant.dimensions}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags & Keywords */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Tags & Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAsset.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                        {selectedAsset.keywords.map((kw) => (
                          <Badge key={kw} variant="outline">{kw}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Metadata */}
                    {Object.keys(selectedAsset.metadata).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Metadata</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(selectedAsset.metadata).map(([key, value]) => (
                            <div key={key} className="p-3 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="font-medium text-sm">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Creator */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{selectedAsset.createdBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedAsset.createdBy.name}</p>
                          <p className="text-xs text-muted-foreground">Created {formatDate(selectedAsset.createdAt)} • Updated {formatDate(selectedAsset.updatedAt)}</p>
                        </div>
                      </div>
                      {selectedAsset.expiresAt && (
                        <Badge variant="outline" className="text-orange-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Expires {formatDate(selectedAsset.expiresAt)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
