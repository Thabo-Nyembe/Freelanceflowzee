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
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Upload,
  Grid3x3,
  List,
  Search,
  Filter,
  Download,
  Share2,
  Trash2,
  Star,
  Folder,
  FolderPlus,
  HardDrive,
  Eye,
  MoreVertical,
  Plus,
  Copy,
  Link2,
  Clock,
  Calendar,
  Tag,
  Users,
  Lock,
  Unlock,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
  Crop,
  Palette,
  Layers,
  Sparkles,
  Wand2,
  History,
  Settings,
  Cloud,
  CloudUpload,
  Globe,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FolderOpen,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileBadge,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
  Heart,
  Bookmark,
  ExternalLink,
  Info
} from 'lucide-react'

// Types
type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other'
type AssetStatus = 'draft' | 'processing' | 'ready' | 'archived' | 'failed'
type LicenseType = 'royalty_free' | 'rights_managed' | 'creative_commons' | 'editorial' | 'custom'
type AccessLevel = 'public' | 'private' | 'team' | 'restricted'

interface MediaAsset {
  id: string
  fileName: string
  fileType: FileType
  mimeType: string
  fileSize: number
  width?: number
  height?: number
  duration?: number
  thumbnailUrl: string
  originalUrl: string
  status: AssetStatus
  tags: string[]
  metadata: {
    title?: string
    description?: string
    alt?: string
    camera?: string
    location?: string
    copyright?: string
  }
  aiTags?: string[]
  colors?: string[]
  license: LicenseType
  accessLevel: AccessLevel
  uploadedBy: { id: string; name: string; avatar?: string }
  uploadedAt: string
  modifiedAt: string
  viewCount: number
  downloadCount: number
  isStarred: boolean
  isFavorite: boolean
  versions: { id: string; version: number; createdAt: string; size: number }[]
  collections: string[]
}

interface Collection {
  id: string
  name: string
  description: string
  coverImage?: string
  assetCount: number
  isPublic: boolean
  createdBy: { id: string; name: string }
  createdAt: string
  tags: string[]
}

interface MediaFolder {
  id: string
  name: string
  path: string
  parentId?: string
  color: string
  assetCount: number
  totalSize: number
  createdAt: string
  accessLevel: AccessLevel
}

interface UsageStats {
  totalAssets: number
  totalSize: number
  storageLimit: number
  bandwidth: { used: number; limit: number }
  byType: { type: FileType; count: number; size: number }[]
}

// Mock Data
const mockAssets: MediaAsset[] = [
  {
    id: 'asset-1',
    fileName: 'product-hero-banner.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    fileSize: 2456789,
    width: 1920,
    height: 1080,
    thumbnailUrl: '',
    originalUrl: '',
    status: 'ready',
    tags: ['product', 'hero', 'banner', 'marketing'],
    metadata: {
      title: 'Product Hero Banner',
      description: 'Main hero image for product landing page',
      alt: 'FreeFlow product dashboard preview',
      camera: 'Canon EOS R5',
      copyright: '2025 FreeFlow Inc.'
    },
    aiTags: ['technology', 'software', 'dashboard', 'modern', 'blue'],
    colors: ['#3B82F6', '#1E3A5F', '#FFFFFF', '#F3F4F6'],
    license: 'royalty_free',
    accessLevel: 'public',
    uploadedBy: { id: 'user-1', name: 'Sarah Johnson' },
    uploadedAt: '2025-01-15T10:30:00Z',
    modifiedAt: '2025-01-18T14:20:00Z',
    viewCount: 12450,
    downloadCount: 345,
    isStarred: true,
    isFavorite: true,
    versions: [
      { id: 'v3', version: 3, createdAt: '2025-01-18T14:20:00Z', size: 2456789 },
      { id: 'v2', version: 2, createdAt: '2025-01-16T09:15:00Z', size: 2345678 },
      { id: 'v1', version: 1, createdAt: '2025-01-15T10:30:00Z', size: 2567890 }
    ],
    collections: ['col-1', 'col-2']
  },
  {
    id: 'asset-2',
    fileName: 'explainer-video.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    fileSize: 125456789,
    width: 1920,
    height: 1080,
    duration: 180,
    thumbnailUrl: '',
    originalUrl: '',
    status: 'ready',
    tags: ['video', 'explainer', 'product', 'onboarding'],
    metadata: {
      title: 'Product Explainer Video',
      description: 'Two-minute explainer video for new users',
      copyright: '2025 FreeFlow Inc.'
    },
    aiTags: ['tutorial', 'demonstration', 'software'],
    license: 'royalty_free',
    accessLevel: 'public',
    uploadedBy: { id: 'user-2', name: 'Michael Chen' },
    uploadedAt: '2025-01-12T08:15:00Z',
    modifiedAt: '2025-01-12T08:15:00Z',
    viewCount: 8900,
    downloadCount: 156,
    isStarred: false,
    isFavorite: true,
    versions: [
      { id: 'v1', version: 1, createdAt: '2025-01-12T08:15:00Z', size: 125456789 }
    ],
    collections: ['col-2']
  },
  {
    id: 'asset-3',
    fileName: 'background-music.mp3',
    fileType: 'audio',
    mimeType: 'audio/mpeg',
    fileSize: 5678901,
    duration: 240,
    thumbnailUrl: '',
    originalUrl: '',
    status: 'ready',
    tags: ['audio', 'music', 'background', 'ambient'],
    metadata: {
      title: 'Ambient Background Music',
      description: 'Calm ambient music for videos',
      copyright: 'Licensed from AudioStock'
    },
    license: 'rights_managed',
    accessLevel: 'team',
    uploadedBy: { id: 'user-3', name: 'Emma Wilson' },
    uploadedAt: '2025-01-10T14:00:00Z',
    modifiedAt: '2025-01-10T14:00:00Z',
    viewCount: 456,
    downloadCount: 89,
    isStarred: false,
    isFavorite: false,
    versions: [
      { id: 'v1', version: 1, createdAt: '2025-01-10T14:00:00Z', size: 5678901 }
    ],
    collections: ['col-3']
  },
  {
    id: 'asset-4',
    fileName: 'brand-guidelines.pdf',
    fileType: 'document',
    mimeType: 'application/pdf',
    fileSize: 12345678,
    thumbnailUrl: '',
    originalUrl: '',
    status: 'ready',
    tags: ['document', 'brand', 'guidelines', 'design'],
    metadata: {
      title: 'Brand Guidelines 2025',
      description: 'Complete brand guidelines and asset usage rules'
    },
    license: 'custom',
    accessLevel: 'team',
    uploadedBy: { id: 'user-1', name: 'Sarah Johnson' },
    uploadedAt: '2025-01-08T11:30:00Z',
    modifiedAt: '2025-01-14T16:45:00Z',
    viewCount: 234,
    downloadCount: 45,
    isStarred: true,
    isFavorite: false,
    versions: [
      { id: 'v2', version: 2, createdAt: '2025-01-14T16:45:00Z', size: 12345678 },
      { id: 'v1', version: 1, createdAt: '2025-01-08T11:30:00Z', size: 11234567 }
    ],
    collections: ['col-1']
  },
  {
    id: 'asset-5',
    fileName: 'social-media-kit.zip',
    fileType: 'archive',
    mimeType: 'application/zip',
    fileSize: 45678901,
    thumbnailUrl: '',
    originalUrl: '',
    status: 'ready',
    tags: ['archive', 'social', 'media', 'kit', 'templates'],
    metadata: {
      title: 'Social Media Kit',
      description: 'Complete social media templates and assets'
    },
    license: 'royalty_free',
    accessLevel: 'team',
    uploadedBy: { id: 'user-2', name: 'Michael Chen' },
    uploadedAt: '2025-01-05T09:00:00Z',
    modifiedAt: '2025-01-05T09:00:00Z',
    viewCount: 189,
    downloadCount: 78,
    isStarred: false,
    isFavorite: false,
    versions: [
      { id: 'v1', version: 1, createdAt: '2025-01-05T09:00:00Z', size: 45678901 }
    ],
    collections: ['col-1', 'col-4']
  },
  {
    id: 'asset-6',
    fileName: 'team-photo.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    fileSize: 3456789,
    width: 4000,
    height: 3000,
    thumbnailUrl: '',
    originalUrl: '',
    status: 'ready',
    tags: ['photo', 'team', 'people', 'office'],
    metadata: {
      title: 'Team Photo 2025',
      description: 'Annual team photo at the office',
      camera: 'Sony A7 III',
      location: 'San Francisco, CA'
    },
    aiTags: ['people', 'group', 'professional', 'indoor'],
    colors: ['#1E40AF', '#F97316', '#FAFAFA'],
    license: 'editorial',
    accessLevel: 'private',
    uploadedBy: { id: 'user-4', name: 'James Rodriguez' },
    uploadedAt: '2025-01-02T15:30:00Z',
    modifiedAt: '2025-01-02T15:30:00Z',
    viewCount: 567,
    downloadCount: 23,
    isStarred: false,
    isFavorite: true,
    versions: [
      { id: 'v1', version: 1, createdAt: '2025-01-02T15:30:00Z', size: 3456789 }
    ],
    collections: ['col-5']
  }
]

const mockCollections: Collection[] = [
  { id: 'col-1', name: 'Brand Assets', description: 'Official brand images and guidelines', assetCount: 45, isPublic: false, createdBy: { id: 'user-1', name: 'Sarah Johnson' }, createdAt: '2024-06-15T00:00:00Z', tags: ['brand', 'official'] },
  { id: 'col-2', name: 'Marketing Materials', description: 'Campaign images and videos', assetCount: 128, isPublic: true, createdBy: { id: 'user-2', name: 'Michael Chen' }, createdAt: '2024-08-20T00:00:00Z', tags: ['marketing', 'campaigns'] },
  { id: 'col-3', name: 'Audio Library', description: 'Music and sound effects', assetCount: 67, isPublic: false, createdBy: { id: 'user-3', name: 'Emma Wilson' }, createdAt: '2024-09-10T00:00:00Z', tags: ['audio', 'music'] },
  { id: 'col-4', name: 'Social Media', description: 'Social media templates and assets', assetCount: 89, isPublic: true, createdBy: { id: 'user-2', name: 'Michael Chen' }, createdAt: '2024-10-05T00:00:00Z', tags: ['social', 'templates'] },
  { id: 'col-5', name: 'Team Photos', description: 'Team and event photography', assetCount: 34, isPublic: false, createdBy: { id: 'user-4', name: 'James Rodriguez' }, createdAt: '2024-11-15T00:00:00Z', tags: ['photos', 'team'] }
]

const mockFolders: MediaFolder[] = [
  { id: 'folder-1', name: 'Product Images', path: '/Product Images', color: 'from-blue-500 to-cyan-500', assetCount: 234, totalSize: 567890123, createdAt: '2024-01-15T00:00:00Z', accessLevel: 'team' },
  { id: 'folder-2', name: 'Marketing', path: '/Marketing', color: 'from-purple-500 to-pink-500', assetCount: 156, totalSize: 345678901, createdAt: '2024-02-20T00:00:00Z', accessLevel: 'team' },
  { id: 'folder-3', name: 'Videos', path: '/Videos', color: 'from-red-500 to-orange-500', assetCount: 45, totalSize: 2345678901, createdAt: '2024-03-10T00:00:00Z', accessLevel: 'team' },
  { id: 'folder-4', name: 'Documents', path: '/Documents', color: 'from-green-500 to-emerald-500', assetCount: 89, totalSize: 234567890, createdAt: '2024-04-05T00:00:00Z', accessLevel: 'private' },
  { id: 'folder-5', name: 'Audio', path: '/Audio', color: 'from-amber-500 to-yellow-500', assetCount: 67, totalSize: 456789012, createdAt: '2024-05-15T00:00:00Z', accessLevel: 'team' }
]

const mockUsageStats: UsageStats = {
  totalAssets: 1247,
  totalSize: 45678901234,
  storageLimit: 107374182400, // 100GB
  bandwidth: { used: 234567890, limit: 1073741824 }, // 1GB
  byType: [
    { type: 'image', count: 678, size: 12345678901 },
    { type: 'video', count: 145, size: 23456789012 },
    { type: 'audio', count: 234, size: 3456789012 },
    { type: 'document', count: 156, size: 4567890123 },
    { type: 'archive', count: 34, size: 1852734186 }
  ]
}

// Helper Functions
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getFileTypeIcon = (type: FileType) => {
  const icons: Record<FileType, JSX.Element> = {
    image: <FileImage className="w-5 h-5" />,
    video: <FileVideo className="w-5 h-5" />,
    audio: <FileAudio className="w-5 h-5" />,
    document: <FileText className="w-5 h-5" />,
    archive: <FileArchive className="w-5 h-5" />,
    other: <FileBadge className="w-5 h-5" />
  }
  return icons[type]
}

const getFileTypeColor = (type: FileType): string => {
  const colors: Record<FileType, string> = {
    image: 'from-blue-500 to-cyan-500',
    video: 'from-purple-500 to-pink-500',
    audio: 'from-green-500 to-emerald-500',
    document: 'from-orange-500 to-red-500',
    archive: 'from-gray-500 to-slate-600',
    other: 'from-indigo-500 to-purple-500'
  }
  return colors[type]
}

const getStatusColor = (status: AssetStatus): string => {
  const colors: Record<AssetStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getLicenseColor = (license: LicenseType): string => {
  const colors: Record<LicenseType, string> = {
    royalty_free: 'bg-green-100 text-green-700',
    rights_managed: 'bg-blue-100 text-blue-700',
    creative_commons: 'bg-purple-100 text-purple-700',
    editorial: 'bg-orange-100 text-orange-700',
    custom: 'bg-gray-100 text-gray-700'
  }
  return colors[license]
}

const getAccessIcon = (level: AccessLevel) => {
  const icons: Record<AccessLevel, JSX.Element> = {
    public: <Globe className="w-4 h-4" />,
    private: <Lock className="w-4 h-4" />,
    team: <Users className="w-4 h-4" />,
    restricted: <Shield className="w-4 h-4" />
  }
  return icons[level]
}

interface MediaLibraryClientProps {
  initialAssets?: MediaAsset[]
  initialFolders?: MediaFolder[]
}

export default function MediaLibraryClient({
  initialAssets = mockAssets,
  initialFolders = mockFolders
}: MediaLibraryClientProps) {
  const [activeTab, setActiveTab] = useState('assets')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<FileType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

  const stats = useMemo(() => {
    const totalViews = initialAssets.reduce((sum, a) => sum + a.viewCount, 0)
    const totalDownloads = initialAssets.reduce((sum, a) => sum + a.downloadCount, 0)
    const totalSize = initialAssets.reduce((sum, a) => sum + a.fileSize, 0)
    const imageCount = initialAssets.filter(a => a.fileType === 'image').length
    const videoCount = initialAssets.filter(a => a.fileType === 'video').length
    const audioCount = initialAssets.filter(a => a.fileType === 'audio').length
    const docCount = initialAssets.filter(a => a.fileType === 'document').length

    return {
      totalAssets: mockUsageStats.totalAssets,
      totalViews,
      totalDownloads,
      totalSize: mockUsageStats.totalSize,
      storageUsed: (mockUsageStats.totalSize / mockUsageStats.storageLimit) * 100,
      imageCount,
      videoCount,
      audioCount,
      docCount
    }
  }, [initialAssets])

  const filteredAssets = useMemo(() => {
    return initialAssets.filter(asset => {
      const matchesSearch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        asset.metadata.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || asset.fileType === selectedType
      return matchesSearch && matchesType
    })
  }, [initialAssets, searchQuery, selectedType])

  const statCards = [
    { label: 'Total Assets', value: stats.totalAssets.toLocaleString(), change: 18.5, icon: ImageIcon, color: 'from-indigo-500 to-purple-600' },
    { label: 'Storage Used', value: formatSize(stats.totalSize), change: 12.3, icon: HardDrive, color: 'from-blue-500 to-cyan-600' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), change: 25.7, icon: Eye, color: 'from-green-500 to-emerald-600' },
    { label: 'Downloads', value: stats.totalDownloads.toLocaleString(), change: 15.4, icon: Download, color: 'from-purple-500 to-pink-600' },
    { label: 'Images', value: mockUsageStats.byType.find(t => t.type === 'image')?.count.toString() || '0', change: 8.2, icon: FileImage, color: 'from-blue-500 to-indigo-600' },
    { label: 'Videos', value: mockUsageStats.byType.find(t => t.type === 'video')?.count.toString() || '0', change: 22.1, icon: FileVideo, color: 'from-red-500 to-rose-600' },
    { label: 'Audio Files', value: mockUsageStats.byType.find(t => t.type === 'audio')?.count.toString() || '0', change: 5.8, icon: FileAudio, color: 'from-green-500 to-teal-600' },
    { label: 'Documents', value: mockUsageStats.byType.find(t => t.type === 'document')?.count.toString() || '0', change: 10.5, icon: FileText, color: 'from-orange-500 to-amber-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Library</h1>
              <p className="text-gray-600 dark:text-gray-400">Adobe DAM-level digital asset management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Assets
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
            <TabsTrigger value="assets" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="folders" className="gap-2">
              <Folder className="w-4 h-4" />
              Folders
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="uploads" className="gap-2">
              <CloudUpload className="w-4 h-4" />
              Uploads
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
          <TabsContent value="assets" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'image', 'video', 'audio', 'document'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
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
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                  <Card key={asset.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedAsset(asset)}>
                    <CardContent className="p-0">
                      <div className={`aspect-video rounded-t-lg bg-gradient-to-br ${getFileTypeColor(asset.fileType)} flex items-center justify-center relative overflow-hidden`}>
                        {getFileTypeIcon(asset.fileType)}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button size="icon" variant="secondary" className="w-8 h-8">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="w-8 h-8">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {asset.isStarred && (
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute top-2 right-2" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{asset.fileName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatSize(asset.fileSize)}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {asset.viewCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center gap-4"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getFileTypeColor(asset.fileType)} flex items-center justify-center flex-shrink-0`}>
                          {getFileTypeIcon(asset.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{asset.fileName}</p>
                            {asset.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{asset.metadata.title || 'No title'}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{formatSize(asset.fileSize)}</span>
                            {asset.width && asset.height && <span>{asset.width}x{asset.height}</span>}
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{asset.viewCount}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{asset.downloadCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
                          {getAccessIcon(asset.accessLevel)}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Folders Tab */}
          <TabsContent value="folders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Folders</h2>
              <Button>
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {initialFolders.map((folder) => (
                <Card key={folder.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${folder.color} flex items-center justify-center mb-3`}>
                      <FolderOpen className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-medium mb-1">{folder.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{folder.assetCount} assets</span>
                      <span>•</span>
                      <span>{formatSize(folder.totalSize)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      {getAccessIcon(folder.accessLevel)}
                      <span className="capitalize">{folder.accessLevel}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Collections</h2>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollections.map((collection) => (
                <Card key={collection.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedCollection(collection)}>
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      <LayoutGrid className="w-12 h-12 text-white/80" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{collection.name}</h3>
                        {collection.isPublic ? <Globe className="w-4 h-4 text-gray-400" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{collection.createdBy.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500">{collection.createdBy.name}</span>
                        </div>
                        <Badge variant="secondary">{collection.assetCount} assets</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Uploads Tab */}
          <TabsContent value="uploads" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                  <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Upload Assets</h3>
                  <p className="text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
                  <p className="text-sm text-gray-400">Supports: Images, Videos, Audio, Documents, Archives</p>
                  <p className="text-sm text-gray-400">Max file size: 5GB</p>
                  <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initialAssets.slice(0, 5).map((asset) => (
                    <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFileTypeColor(asset.fileType)} flex items-center justify-center`}>
                        {getFileTypeIcon(asset.fileType)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{asset.fileName}</p>
                        <p className="text-sm text-gray-500">{formatSize(asset.fileSize)} • Uploaded {new Date(asset.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
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
                  <CardTitle>Asset Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Views and downloads over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-indigo-600">{formatSize(mockUsageStats.totalSize)}</p>
                      <p className="text-sm text-gray-500">of {formatSize(mockUsageStats.storageLimit)}</p>
                    </div>
                    <Progress value={stats.storageUsed} className="h-3" />
                    <p className="text-sm text-gray-500 text-center">{stats.storageUsed.toFixed(1)}% used</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Top Performing Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {initialAssets
                      .sort((a, b) => b.viewCount - a.viewCount)
                      .slice(0, 5)
                      .map((asset, idx) => (
                        <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{asset.fileName}</p>
                            <p className="text-xs text-gray-500">{asset.viewCount.toLocaleString()} views</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Storage by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUsageStats.byType.map((item) => (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getFileTypeIcon(item.type)}
                            <span className="text-sm font-medium capitalize">{item.type}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatSize(item.size)}</span>
                        </div>
                        <Progress value={(item.size / mockUsageStats.totalSize) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Bandwidth Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold">{formatSize(mockUsageStats.bandwidth.used)}</p>
                      <p className="text-sm text-gray-500">of {formatSize(mockUsageStats.bandwidth.limit)} this month</p>
                    </div>
                    <Progress value={(mockUsageStats.bandwidth.used / mockUsageStats.bandwidth.limit) * 100} className="h-3" />
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
                  <CardTitle>Storage Settings</CardTitle>
                  <CardDescription>Manage your storage quota and cleanup policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-gray-500">100GB Storage, 1GB/month bandwidth</p>
                    </div>
                    <Button variant="outline" size="sm">Upgrade</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-delete trash</p>
                      <p className="text-sm text-gray-500">Remove deleted files after 30 days</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Version history</p>
                      <p className="text-sm text-gray-500">Keep file versions for 90 days</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>AI Features</CardTitle>
                  <CardDescription>Configure AI-powered asset management</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Wand2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Auto-tagging</p>
                        <p className="text-sm text-gray-500">AI-generated tags for new uploads</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Palette className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Color extraction</p>
                        <p className="text-sm text-gray-500">Extract dominant colors from images</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Sparkles className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Smart search</p>
                        <p className="text-sm text-gray-500">AI-powered content-based search</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>CDN & Delivery</CardTitle>
                  <CardDescription>Configure content delivery settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm font-medium mb-1">CDN Endpoint</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded flex-1">cdn.freeflow.com/media/</code>
                      <Button size="icon" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Image optimization</p>
                      <p className="text-sm text-gray-500">Auto-convert and resize images</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">WebP conversion</p>
                      <p className="text-sm text-gray-500">Serve images in WebP format</p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Access Control</CardTitle>
                  <CardDescription>Default permissions for new assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Default access level', value: 'Team' },
                    { name: 'Allow public links', value: 'Enabled' },
                    { name: 'Download permissions', value: 'Team members only' },
                    { name: 'Watermark external shares', value: 'Disabled' }
                  ].map((setting) => (
                    <div key={setting.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="font-medium">{setting.name}</span>
                      <Button variant="outline" size="sm">{setting.value}</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Asset Detail Dialog */}
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedAsset?.fileName}
                <Badge className={getStatusColor(selectedAsset?.status || 'ready')}>
                  {selectedAsset?.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>{selectedAsset?.metadata.title}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              {selectedAsset && (
                <div className="space-y-6 p-4">
                  <div className={`aspect-video rounded-xl bg-gradient-to-br ${getFileTypeColor(selectedAsset.fileType)} flex items-center justify-center`}>
                    <div className="text-white text-center">
                      {getFileTypeIcon(selectedAsset.fileType)}
                      <p className="mt-2 text-sm opacity-80">Asset Preview</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500 mb-1">File Size</p>
                        <p className="font-semibold">{formatSize(selectedAsset.fileSize)}</p>
                      </CardContent>
                    </Card>
                    {selectedAsset.width && selectedAsset.height && (
                      <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500 mb-1">Dimensions</p>
                          <p className="font-semibold">{selectedAsset.width} x {selectedAsset.height}</p>
                        </CardContent>
                      </Card>
                    )}
                    {selectedAsset.duration && (
                      <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-500 mb-1">Duration</p>
                          <p className="font-semibold">{formatDuration(selectedAsset.duration)}</p>
                        </CardContent>
                      </Card>
                    )}
                    <Card className="border-0 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500 mb-1">Views</p>
                        <p className="font-semibold">{selectedAsset.viewCount.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                      {selectedAsset.aiTags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedAsset.colors && selectedAsset.colors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Extracted Colors</h4>
                      <div className="flex gap-2">
                        {selectedAsset.colors.map((color) => (
                          <div key={color} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }} />
                            <span className="text-xs font-mono">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Version History</h4>
                    <div className="space-y-2">
                      {selectedAsset.versions.map((version) => (
                        <div key={version.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <History className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium">Version {version.version}</p>
                              <p className="text-xs text-gray-500">{new Date(version.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{formatSize(version.size)}</span>
                            {version.version === selectedAsset.versions[0].version && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Metadata
                    </Button>
                    <Button variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Collection Detail Dialog */}
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedCollection?.name}
                {selectedCollection?.isPublic ? <Globe className="w-4 h-4 text-gray-400" /> : <Lock className="w-4 h-4 text-gray-400" />}
              </DialogTitle>
              <DialogDescription>{selectedCollection?.description}</DialogDescription>
            </DialogHeader>
            {selectedCollection && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Assets</p>
                    <p className="text-2xl font-bold">{selectedCollection.assetCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">{new Date(selectedCollection.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollection.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Avatar>
                    <AvatarFallback>{selectedCollection.createdBy.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedCollection.createdBy.name}</p>
                    <p className="text-sm text-gray-500">Collection owner</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open Collection
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
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
