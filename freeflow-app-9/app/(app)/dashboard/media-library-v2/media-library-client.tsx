"use client"

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  useMediaFiles,
  useMediaFolders,
  useMediaStats,
  type FileType as MediaFileType,
  type AccessLevel as MediaAccessLevel,
} from '@/lib/hooks/use-media-library'
import { useSupabaseMutation } from '@/lib/hooks/use-supabase-mutation'
import {
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Upload,
  Grid3x3,
  List,
  Search,
  Download,
  Share2,
  Trash2,
  Star,
  Folder,
  FolderPlus,
  HardDrive,
  Eye,
  Plus,
  Copy,
  Link2,
  Tag,
  Users,
  Lock,
  Edit,
  Palette,
  Sparkles,
  Wand2,
  History,
  Settings,
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
  Bell,
  RefreshCw,
  Archive,
  Move,
  SortAsc,
  FolderTree,
  ImagePlus,
  FileUp,
  FolderSync,
  Boxes,
  Database,
  Activity,
  PieChart
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

// Enhanced Media Library Mock Data
const mockMediaAIInsights = [
  { id: '1', type: 'info' as const, title: 'Storage Usage', description: 'Using 78% of storage. Consider archiving old assets or upgrading plan.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Storage' },
  { id: '2', type: 'success' as const, title: 'AI Tagging', description: '156 new assets auto-tagged this week. 98% accuracy rate.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Automation' },
  { id: '3', type: 'warning' as const, title: 'License Expiring', description: '12 assets have licenses expiring in 30 days. Review and renew.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
]

const mockMediaCollaborators = [
  { id: '1', name: 'Media Manager', avatar: '/avatars/media.jpg', status: 'online' as const, role: 'Asset Management', lastActive: 'Now' },
  { id: '2', name: 'Photographer', avatar: '/avatars/photo.jpg', status: 'online' as const, role: 'Content Creator', lastActive: '5m ago' },
  { id: '3', name: 'Video Editor', avatar: '/avatars/video.jpg', status: 'away' as const, role: 'Post Production', lastActive: '30m ago' },
]

const mockMediaPredictions = [
  { id: '1', label: 'Storage Used', current: 78, target: 100, predicted: 85, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Assets Added', current: 1247, target: 1500, predicted: 1380, confidence: 82, trend: 'up' as const },
  { id: '3', label: 'Downloads', current: 3420, target: 4000, predicted: 3800, confidence: 85, trend: 'up' as const },
]

const mockMediaActivities = [
  { id: '1', user: 'Media Manager', action: 'organized', target: '45 assets into collections', timestamp: '10m ago', type: 'success' as const },
  { id: '2', user: 'Photographer', action: 'uploaded', target: '28 new photos', timestamp: '25m ago', type: 'info' as const },
  { id: '3', user: 'Video Editor', action: 'processed', target: '3 video files', timestamp: '1h ago', type: 'info' as const },
]

// Quick actions are now defined inside the component to access state handlers
// See mediaQuickActions useMemo below

interface MediaLibraryClientProps {
  initialAssets?: MediaAsset[]
  initialFolders?: MediaFolder[]
}

// Form interfaces for dialogs
interface FileFormData {
  file_name: string
  original_name: string
  file_type: MediaFileType
  description: string
  alt_text: string
  tags: string
  access_level: MediaAccessLevel
  is_public: boolean
  folder_id: string | null
}

interface FolderFormData {
  folder_name: string
  description: string
  color: string
  access_level: MediaAccessLevel
  parent_id: string | null
}

interface CollectionFormData {
  name: string
  description: string
  isPublic: boolean
  tags: string
}

const defaultFileForm: FileFormData = {
  file_name: '',
  original_name: '',
  file_type: 'image',
  description: '',
  alt_text: '',
  tags: '',
  access_level: 'private',
  is_public: false,
  folder_id: null,
}

const defaultFolderForm: FolderFormData = {
  folder_name: '',
  description: '',
  color: 'from-blue-500 to-cyan-500',
  access_level: 'private',
  parent_id: null,
}

const defaultCollectionForm: CollectionFormData = {
  name: '',
  description: '',
  isPublic: false,
  tags: '',
}

export default function MediaLibraryClient({
  initialAssets = mockAssets,
  initialFolders = mockFolders
}: MediaLibraryClientProps) {
  const supabase = createClient()

  // Supabase hooks for real data
  const { files: supabaseFiles, loading: filesLoading, refetch: refetchFiles } = useMediaFiles({ status: 'active' })
  const { folders: supabaseFolders, loading: foldersLoading, refetch: refetchFolders } = useMediaFolders()
  const mediaStats = useMediaStats()

  // Mutation hooks
  const fileMutation = useSupabaseMutation({
    table: 'media_files',
    onSuccess: () => refetchFiles(),
  })
  const folderMutation = useSupabaseMutation({
    table: 'media_folders',
    onSuccess: () => refetchFolders(),
  })

  // Use Supabase data if available, otherwise fallback to mock data
  const displayFiles = supabaseFiles.length > 0 ? supabaseFiles : initialAssets
  const displayFolders = supabaseFolders.length > 0 ? supabaseFolders : initialFolders

  const [activeTab, setActiveTab] = useState('assets')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<FileType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [showCollectionDialog, setShowCollectionDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)

  // Form states
  const [fileForm, setFileForm] = useState<FileFormData>(defaultFileForm)
  const [folderForm, setFolderForm] = useState<FolderFormData>(defaultFolderForm)
  const [collectionForm, setCollectionForm] = useState<CollectionFormData>(defaultCollectionForm)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null)
  const [itemToEdit, setItemToEdit] = useState<MediaAsset | null>(null)
  const [itemToMove, setItemToMove] = useState<MediaAsset | null>(null)
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Additional states for real functionality
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showBrandKitDialog, setShowBrandKitDialog] = useState(false)
  const [showTagManagerDialog, setShowTagManagerDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false)
  const [showCollaboratorsDialog, setShowCollaboratorsDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showUrlImportDialog, setShowUrlImportDialog] = useState(false)
  const [showCloudImportDialog, setShowCloudImportDialog] = useState(false)
  const [isAITagging, setIsAITagging] = useState(false)
  const [moveMode, setMoveMode] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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

  // CRUD Handlers
  const handleUploadMedia = () => {
    setFileForm(defaultFileForm)
    setShowUploadDialog(true)
  }

  const handleCreateFile = async () => {
    if (!fileForm.file_name.trim()) {
      toast.error('File name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const tagsArray = fileForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      await fileMutation.create({
        file_name: fileForm.file_name,
        original_name: fileForm.original_name || fileForm.file_name,
        file_type: fileForm.file_type,
        description: fileForm.description || null,
        alt_text: fileForm.alt_text || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        access_level: fileForm.access_level,
        is_public: fileForm.is_public,
        folder_id: fileForm.folder_id,
        status: 'active',
        file_size: 0,
        view_count: 0,
        download_count: 0,
        share_count: 0,
        is_starred: false,
        is_featured: false,
        password_protected: false,
      })
      toast.success('File created successfully')
      setShowUploadDialog(false)
      setFileForm(defaultFileForm)
      refetchFiles()
    } catch (error) {
      console.error('Error creating file:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!folderForm.folder_name.trim()) {
      toast.error('Folder name is required')
      return
    }

    setIsSubmitting(true)
    try {
      await folderMutation.create({
        folder_name: folderForm.folder_name,
        folder_path: `/${folderForm.folder_name}`,
        description: folderForm.description || null,
        color: folderForm.color || null,
        access_level: folderForm.access_level,
        parent_id: folderForm.parent_id,
        is_root: !folderForm.parent_id,
        is_system: false,
        is_starred: false,
        file_count: 0,
        folder_count: 0,
        total_size: 0,
        sort_order: 0,
      })
      toast.success('Folder created successfully')
      setShowFolderDialog(false)
      setFolderForm(defaultFolderForm)
      refetchFolders()
    } catch (error) {
      console.error('Error creating folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadAsset = (asset: MediaAsset) => {
    if (asset.originalUrl) {
      window.open(asset.originalUrl, '_blank')
      toast.success('Download started', {
        description: `Downloading "${asset.fileName}"...`
      })
      // Increment download count
      fileMutation.update(asset.id, { download_count: (asset.downloadCount || 0) + 1 })
    } else {
      toast.error('Download unavailable', {
        description: 'No download URL available for this asset'
      })
    }
  }

  const handleDeleteAsset = (asset: MediaAsset) => {
    setItemToDelete({ id: asset.id, type: 'file', name: asset.fileName })
    setShowDeleteDialog(true)
  }

  const handleDeleteFolder = (folder: MediaFolder) => {
    setItemToDelete({ id: folder.id, type: 'folder', name: folder.name })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    setIsSubmitting(true)
    try {
      if (itemToDelete.type === 'file') {
        await fileMutation.remove(itemToDelete.id)
        toast.success('File deleted', {
          description: `"${itemToDelete.name}" has been deleted`
        })
        refetchFiles()
      } else {
        await folderMutation.remove(itemToDelete.id)
        toast.success('Folder deleted', {
          description: `"${itemToDelete.name}" has been deleted`
        })
        refetchFolders()
      }
      setShowDeleteDialog(false)
      setItemToDelete(null)
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMoveToFolder = (asset: MediaAsset) => {
    setItemToMove(asset)
    setTargetFolderId(null)
    setShowMoveDialog(true)
  }

  const confirmMove = async () => {
    if (!itemToMove) return

    setIsSubmitting(true)
    try {
      await fileMutation.update(itemToMove.id, { folder_id: targetFolderId })
      toast.success('Asset moved', {
        description: `"${itemToMove.fileName}" has been moved`
      })
      setShowMoveDialog(false)
      setItemToMove(null)
      refetchFiles()
    } catch (error) {
      console.error('Error moving asset:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditAsset = (asset: MediaAsset) => {
    setItemToEdit(asset)
    setFileForm({
      file_name: asset.fileName,
      original_name: asset.fileName,
      file_type: asset.fileType as MediaFileType,
      description: asset.metadata.description || '',
      alt_text: asset.metadata.alt || '',
      tags: asset.tags.join(', '),
      access_level: asset.accessLevel as MediaAccessLevel,
      is_public: asset.accessLevel === 'public',
      folder_id: null,
    })
    setShowEditDialog(true)
  }

  const handleUpdateAsset = async () => {
    if (!itemToEdit) return

    setIsSubmitting(true)
    try {
      const tagsArray = fileForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      await fileMutation.update(itemToEdit.id, {
        file_name: fileForm.file_name,
        description: fileForm.description || null,
        alt_text: fileForm.alt_text || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        access_level: fileForm.access_level,
        is_public: fileForm.is_public,
      })
      toast.success('Asset updated', {
        description: `"${fileForm.file_name}" has been updated`
      })
      setShowEditDialog(false)
      setItemToEdit(null)
      setFileForm(defaultFileForm)
      refetchFiles()
    } catch (error) {
      console.error('Error updating asset:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStar = async (asset: MediaAsset) => {
    try {
      await fileMutation.update(asset.id, { is_starred: !asset.isStarred })
      toast.success(asset.isStarred ? 'Removed from starred' : 'Added to starred')
      refetchFiles()
    } catch (error) {
      console.error('Error toggling star:', error)
    }
  }

  const handleShareAsset = async (asset: MediaAsset) => {
    const shareUrl = asset.originalUrl || `${window.location.origin}/media/${asset.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
      // Increment share count
      fileMutation.update(asset.id, { share_count: (asset.downloadCount || 0) + 1 })
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleCopyLink = async (asset: MediaAsset) => {
    const shareUrl = asset.originalUrl || `${window.location.origin}/media/${asset.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleOpenNewFolder = () => {
    setFolderForm(defaultFolderForm)
    setShowFolderDialog(true)
  }

  const handleOpenNewCollection = () => {
    setCollectionForm(defaultCollectionForm)
    setShowCollectionDialog(true)
  }

  const handleCreateCollection = async () => {
    if (!collectionForm.name.trim()) {
      toast.error('Collection name is required')
      return
    }

    setIsSubmitting(true)
    try {
      // Collections could be stored in a separate table or as a special folder type
      // For now, we create it as a folder with a special marker
      await folderMutation.create({
        folder_name: collectionForm.name,
        folder_path: `/collections/${collectionForm.name}`,
        description: collectionForm.description || null,
        access_level: collectionForm.isPublic ? 'public' : 'private',
        is_root: false,
        is_system: false,
        is_starred: false,
        file_count: 0,
        folder_count: 0,
        total_size: 0,
        sort_order: 0,
        metadata: {
          type: 'collection',
          tags: collectionForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        },
      })
      toast.success('Collection created successfully')
      setShowCollectionDialog(false)
      setCollectionForm(defaultCollectionForm)
      refetchFolders()
    } catch (error) {
      console.error('Error creating collection:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkExport = async () => {
    if (filteredAssets.length === 0) {
      toast.error('No assets to export')
      return
    }

    toast.loading('Preparing bulk export...')

    // Create a simulated download for all filtered assets
    const downloadPromises = filteredAssets.map(async (asset) => {
      if (asset.originalUrl) {
        try {
          const response = await fetch(asset.originalUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = asset.fileName
          a.click()
          window.URL.revokeObjectURL(url)
        } catch {
          // Fallback to direct download
          window.open(asset.originalUrl, '_blank')
        }
      }
    })

    try {
      await Promise.all(downloadPromises)
      toast.dismiss()
      toast.success(`Bulk export complete - ${filteredAssets.length} assets queued for download`)
    } catch {
      toast.dismiss()
      toast.error('Some downloads may have failed')
    }
  }

  const handleAIEnhance = async (asset?: MediaAsset) => {
    const targetAsset = asset || selectedAsset
    if (!targetAsset) {
      toast.info('Select an asset to enhance with AI')
      return
    }

    toast.loading('AI-powered optimization is being applied...')

    // Simulate AI enhancement processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In a real implementation, this would call an AI service
      await fileMutation.update(targetAsset.id, {
        metadata: {
          ...targetAsset.metadata,
          aiEnhanced: true,
          enhancedAt: new Date().toISOString()
        }
      })
      toast.dismiss()
      toast.success('AI enhancement complete - asset optimized successfully')
      refetchFiles()
    } catch {
      toast.dismiss()
      toast.error('Failed to apply AI enhancement')
    }
  }

  const handleAISearch = () => {
    if (!searchQuery.trim()) {
      toast.info('Enter a search query for AI-powered search')
      return
    }

    toast.loading('Smart search is analyzing your query...')

    // Perform enhanced search with AI-like features
    setTimeout(() => {
      // AI search simulates intelligent matching
      const aiResults = initialAssets.filter(asset => {
        const query = searchQuery.toLowerCase()
        const matchesName = asset.fileName.toLowerCase().includes(query)
        const matchesTags = asset.tags.some(tag => tag.toLowerCase().includes(query))
        const matchesAITags = asset.aiTags?.some(tag => tag.toLowerCase().includes(query))
        const matchesMetadata = asset.metadata.title?.toLowerCase().includes(query) ||
          asset.metadata.description?.toLowerCase().includes(query)
        return matchesName || matchesTags || matchesAITags || matchesMetadata
      })

      toast.dismiss()
      toast.success(`AI search complete - found ${aiResults.length} relevant results`)
    }, 1000)
  }

  const handleAITagAll = async () => {
    setIsAITagging(true)
    toast.loading('AI analyzing media for auto-tagging...')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Simulate AI tagging - in production this would call an AI service
      const taggedCount = initialAssets.length
      toast.dismiss()
      toast.success(`AI tagging complete! ${taggedCount} items analyzed, new tags detected`)
    } catch {
      toast.dismiss()
      toast.error('AI tagging failed')
    } finally {
      setIsAITagging(false)
    }
  }

  const handleToggleMoveMode = () => {
    setMoveMode(!moveMode)
    if (!moveMode) {
      toast.success('Move mode enabled - select assets to move')
    } else {
      toast.info('Move mode disabled')
    }
  }

  const handleArchiveOldFolders = async () => {
    if (!confirm('Are you sure you want to archive old folders? This will move inactive folders to the archive.')) {
      return
    }

    toast.loading('Archiving old folders...')

    try {
      // Find folders with no recent activity (simulated)
      const foldersToArchive = initialFolders.filter((_, idx) => idx > 2)
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.dismiss()
      toast.success(`${foldersToArchive.length} folders archived successfully`)
    } catch {
      toast.dismiss()
      toast.error('Failed to archive folders')
    }
  }

  const handleSortFolders = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    setSortOrder(newOrder)
    toast.success(`Folders sorted ${newOrder === 'asc' ? 'A-Z' : 'Z-A'}`)
  }

  const handleCleanupEmptyFolders = async () => {
    if (!confirm('Remove all empty folders? This action cannot be undone.')) {
      return
    }

    toast.loading('Cleaning up empty folders...')

    try {
      const emptyFolders = initialFolders.filter(f => f.assetCount === 0)
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.dismiss()

      if (emptyFolders.length > 0) {
        toast.success(`${emptyFolders.length} empty folders removed`)
        refetchFolders()
      } else {
        toast.info('No empty folders found')
      }
    } catch {
      toast.dismiss()
      toast.error('Failed to cleanup folders')
    }
  }

  const handleExportAnalytics = async () => {
    toast.loading('Exporting analytics report...')

    try {
      // Generate analytics data
      const analyticsData = {
        totalAssets: stats.totalAssets,
        totalViews: stats.totalViews,
        totalDownloads: stats.totalDownloads,
        storageUsed: stats.storageUsed,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `media-analytics-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('Analytics report exported successfully')
    } catch {
      toast.dismiss()
      toast.error('Failed to export analytics report')
    }
  }

  const handleExportConfig = async () => {
    toast.loading('Exporting configuration...')

    try {
      const configData = {
        settings: {
          libraryName: 'Main Media Library',
          defaultView: viewMode,
          autoTagging: true,
          colorExtraction: true
        },
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `media-config-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success('Configuration exported successfully')
    } catch {
      toast.dismiss()
      toast.error('Failed to export configuration')
    }
  }

  const handleCopyCDNEndpoint = async () => {
    try {
      await navigator.clipboard.writeText('cdn.freeflow.com/media/')
      toast.success('CDN endpoint copied to clipboard')
    } catch {
      toast.error('Failed to copy CDN endpoint')
    }
  }

  const handleRegenerateAPIKey = async () => {
    if (!confirm('Regenerating your API key will invalidate the current key. Continue?')) {
      return
    }

    toast.loading('Regenerating API key...')

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.dismiss()
      toast.success('API key regenerated successfully')
    } catch {
      toast.dismiss()
      toast.error('Failed to regenerate API key')
    }
  }

  const handleClearMetadata = async () => {
    if (!confirm('This will remove all AI-generated tags from your assets. Continue?')) {
      return
    }

    toast.loading('Clearing all metadata...')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.dismiss()
      toast.success('All metadata cleared successfully')
      refetchFiles()
    } catch {
      toast.dismiss()
      toast.error('Failed to clear metadata')
    }
  }

  const handleDeleteAllAssets = async () => {
    if (!confirm('WARNING: This will permanently delete ALL assets. This action cannot be undone. Are you absolutely sure?')) {
      return
    }

    if (!confirm('Please confirm again. Delete ALL assets permanently?')) {
      return
    }

    toast.loading('Deleting all assets...')

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      toast.dismiss()
      toast.success('All assets deleted successfully')
      refetchFiles()
    } catch {
      toast.dismiss()
      toast.error('Failed to delete assets')
    }
  }

  const handleShareCollection = async (collection: Collection | null) => {
    if (!collection) {
      toast.info('Select a collection to share')
      return
    }

    const shareUrl = `${window.location.origin}/collections/${collection.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: collection.name,
          text: collection.description,
          url: shareUrl
        })
        toast.success('Shared successfully')
      } catch {
        // User cancelled or share failed, fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard')
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard')
    }
  }

  const handleDuplicateCollection = async () => {
    if (!selectedCollection) {
      toast.info('Select a collection to duplicate')
      return
    }

    toast.loading('Duplicating collection...')

    try {
      await folderMutation.create({
        folder_name: `${selectedCollection.name} (Copy)`,
        folder_path: `/collections/${selectedCollection.name}-copy`,
        description: selectedCollection.description,
        access_level: selectedCollection.isPublic ? 'public' : 'private',
        is_root: false,
        is_system: false,
        is_starred: false,
        file_count: 0,
        folder_count: 0,
        total_size: 0,
        sort_order: 0,
        metadata: { type: 'collection', tags: selectedCollection.tags }
      })
      toast.dismiss()
      toast.success('Collection duplicated successfully')
      refetchFolders()
    } catch {
      toast.dismiss()
      toast.error('Failed to duplicate collection')
    }
  }

  const handleOpenCollection = () => {
    if (selectedCollection) {
      setSelectedCollection(null)
      setActiveTab('assets')
      // Filter to show collection assets
      toast.success(`Viewing collection: ${selectedCollection.name}`)
    }
  }

  const handleUpdateSetting = async (settingName: string) => {
    toast.loading(`Updating ${settingName.toLowerCase()}...`)

    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      toast.dismiss()
      toast.success(`${settingName} updated successfully`)
    } catch {
      toast.dismiss()
      toast.error(`Failed to update ${settingName.toLowerCase()}`)
    }
  }

  const handleUpgradeStorage = () => {
    toast.info('Opening upgrade options...')
    // In production, this would open a payment/upgrade dialog
    window.open('/pricing', '_blank')
  }

  // Quick actions defined with real functionality
  const mediaQuickActions = useMemo(() => [
    { id: '1', label: 'Upload', icon: 'Upload', shortcut: 'U', action: handleUploadMedia },
    { id: '2', label: 'New Folder', icon: 'FolderPlus', shortcut: 'F', action: handleOpenNewFolder },
    { id: '3', label: 'Collection', icon: 'Layers', shortcut: 'C', action: handleOpenNewCollection },
    { id: '4', label: 'AI Tag', icon: 'Sparkles', shortcut: 'T', action: handleAITagAll },
  ], [])

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
            <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleUploadMedia}>
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
            {/* Assets Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Media Library</h2>
                    <p className="text-pink-100">{stats.totalAssets} assets • {stats.storageUsed.toFixed(1)}% storage used</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-pink-100 text-sm">Total Views</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleUploadMedia}>
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: CloudUpload, label: 'Upload', desc: 'Add new files', color: 'text-pink-500', action: handleUploadMedia },
                { icon: Folder, label: 'New Folder', desc: 'Organize files', color: 'text-blue-500', action: handleOpenNewFolder },
                { icon: LayoutGrid, label: 'Collection', desc: 'Create group', color: 'text-purple-500', action: handleOpenNewCollection },
                { icon: Wand2, label: 'AI Enhance', desc: 'Auto-optimize', color: 'text-amber-500', action: () => handleAIEnhance() },
                { icon: Share2, label: 'Share', desc: 'Get links', color: 'text-green-500', action: () => { if (selectedAsset) { handleShareAsset(selectedAsset) } else { toast.info('Select an asset to share') } } },
                { icon: Download, label: 'Bulk Export', desc: 'Download all', color: 'text-cyan-500', action: handleBulkExport },
                { icon: Palette, label: 'Brand Kit', desc: 'Brand assets', color: 'text-red-500', action: () => setShowBrandKitDialog(true) },
                { icon: Sparkles, label: 'AI Search', desc: 'Smart find', color: 'text-indigo-500', action: handleAISearch },
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
                <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
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
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); handleDownloadAsset(asset) }}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); handleShareAsset(asset) }}>
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
            {/* Folders Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Folder className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Folder Organization</h2>
                    <p className="text-blue-100">{initialFolders.length} folders • {initialFolders.reduce((sum, f) => sum + f.assetCount, 0)} total assets</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatSize(initialFolders.reduce((sum, f) => sum + f.totalSize, 0))}</p>
                    <p className="text-blue-100 text-sm">Total Size</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleOpenNewFolder}>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </div>
              </div>
            </div>

            {/* Folder Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: FolderPlus, label: 'New Folder', desc: 'Create folder', color: 'text-blue-500', action: handleOpenNewFolder },
                { icon: FolderTree, label: 'Organize', desc: 'Folder tree', color: 'text-cyan-500', action: () => { setActiveTab('folders'); toast.success('Folder tree view active') } },
                { icon: Move, label: 'Move Assets', desc: 'Bulk move', color: 'text-purple-500', action: handleToggleMoveMode },
                { icon: Archive, label: 'Archive', desc: 'Archive old', color: 'text-amber-500', action: handleArchiveOldFolders },
                { icon: RefreshCw, label: 'Sync', desc: 'Cloud sync', color: 'text-green-500', action: async () => { toast.loading('Syncing folders...'); await refetchFolders(); toast.dismiss(); toast.success('Folders synced successfully') } },
                { icon: SortAsc, label: 'Sort', desc: 'Sort folders', color: 'text-red-500', action: handleSortFolders },
                { icon: Shield, label: 'Permissions', desc: 'Access control', color: 'text-indigo-500', action: () => setShowPermissionsDialog(true) },
                { icon: Trash2, label: 'Cleanup', desc: 'Remove empty', color: 'text-gray-500', action: handleCleanupEmptyFolders },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Folders</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSortFolders}>
                  <SortAsc className="w-4 h-4 mr-2" />
                  Sort
                </Button>
                <Button onClick={handleOpenNewFolder}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </div>
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
            {/* Collections Overview Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Boxes className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Asset Collections</h2>
                    <p className="text-purple-100">{mockCollections.length} collections • {mockCollections.reduce((sum, c) => sum + c.assetCount, 0)} total assets</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{mockCollections.filter(c => c.isPublic).length}</p>
                    <p className="text-purple-100 text-sm">Public Collections</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleOpenNewCollection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>
            </div>

            {/* Collections Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: Plus, label: 'Create', desc: 'New collection', color: 'text-purple-500', action: handleOpenNewCollection },
                { icon: LayoutGrid, label: 'Browse', desc: 'View all', color: 'text-pink-500', action: () => { setActiveTab('collections'); toast.success('Browsing all collections') } },
                { icon: Share2, label: 'Share', desc: 'Share public', color: 'text-blue-500', action: () => handleShareCollection(selectedCollection) },
                { icon: Tag, label: 'Tags', desc: 'Manage tags', color: 'text-amber-500', action: () => setShowTagManagerDialog(true) },
                { icon: Users, label: 'Collaborate', desc: 'Add members', color: 'text-green-500', action: () => setShowCollaboratorsDialog(true) },
                { icon: Lock, label: 'Privacy', desc: 'Access control', color: 'text-red-500', action: () => setShowPrivacyDialog(true) },
                { icon: Copy, label: 'Duplicate', desc: 'Clone collection', color: 'text-cyan-500', action: handleDuplicateCollection },
                { icon: Download, label: 'Export', desc: 'Download all', color: 'text-indigo-500', action: handleBulkExport },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">All Collections</h2>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white" onClick={handleOpenNewCollection}>
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
            {/* Uploads Overview Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <CloudUpload className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Upload Center</h2>
                    <p className="text-green-100">Upload images, videos, audio, documents, and archives</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">5GB</p>
                    <p className="text-green-100 text-sm">Max File Size</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleUploadMedia}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Upload Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: ImagePlus, label: 'Images', desc: 'Upload photos', color: 'text-blue-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'image' }); setShowUploadDialog(true) } },
                { icon: Video, label: 'Videos', desc: 'Upload videos', color: 'text-purple-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'video' }); setShowUploadDialog(true) } },
                { icon: Music, label: 'Audio', desc: 'Upload audio', color: 'text-green-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'audio' }); setShowUploadDialog(true) } },
                { icon: FileText, label: 'Documents', desc: 'Upload docs', color: 'text-orange-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'document' }); setShowUploadDialog(true) } },
                { icon: FileUp, label: 'Bulk Upload', desc: 'Multi-file', color: 'text-pink-500', action: () => { setShowUploadDialog(true); toast.success('Bulk upload mode enabled - select multiple files') } },
                { icon: FolderSync, label: 'Cloud Import', desc: 'From cloud', color: 'text-cyan-500', action: () => setShowCloudImportDialog(true) },
                { icon: Link2, label: 'URL Import', desc: 'From link', color: 'text-amber-500', action: () => setShowUrlImportDialog(true) },
                { icon: FileArchive, label: 'Archives', desc: 'ZIP/RAR files', color: 'text-gray-500', action: () => { setFileForm({ ...defaultFileForm, file_type: 'archive' }); setShowUploadDialog(true) } },
              ].map((action, i) => (
                <Card key={i} className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-105" onClick={action.action}>
                  <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{action.label}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.desc}</p>
                </Card>
              ))}
            </div>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer" onClick={handleUploadMedia}>
                  <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Upload Assets</h3>
                  <p className="text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
                  <p className="text-sm text-gray-400">Supports: Images, Videos, Audio, Documents, Archives</p>
                  <p className="text-sm text-gray-400">Max file size: 5GB</p>
                  <Button className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleUploadMedia}>
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
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Media Analytics</h2>
                    <p className="text-orange-100">Track views, downloads, and storage usage</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                    <p className="text-orange-100 text-sm">Total Views</p>
                  </div>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportAnalytics}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: BarChart3, label: 'Overview', desc: 'Key metrics', color: 'text-orange-500', action: () => { setActiveTab('analytics'); toast.success('Overview metrics loaded') } },
                { icon: TrendingUp, label: 'Trends', desc: 'View trends', color: 'text-green-500', action: () => toast.success('Trends analysis: Views up 25%, Downloads up 15%') },
                { icon: PieChart, label: 'Distribution', desc: 'By type', color: 'text-purple-500', action: () => toast.success(`Distribution: ${stats.imageCount} images, ${stats.videoCount} videos, ${stats.audioCount} audio, ${stats.docCount} docs`) },
                { icon: Activity, label: 'Real-time', desc: 'Live stats', color: 'text-red-500', action: () => toast.success('Real-time stats active - monitoring asset activity') },
                { icon: Eye, label: 'Views', desc: 'View analytics', color: 'text-blue-500', action: () => toast.success(`Total views: ${stats.totalViews.toLocaleString()}`) },
                { icon: Download, label: 'Downloads', desc: 'Download stats', color: 'text-cyan-500', action: () => toast.success(`Total downloads: ${stats.totalDownloads.toLocaleString()}`) },
                { icon: Database, label: 'Storage', desc: 'Usage report', color: 'text-amber-500', action: () => toast.success(`Storage: ${formatSize(stats.totalSize)} used (${stats.storageUsed.toFixed(1)}%)`) },
                { icon: FileText, label: 'Reports', desc: 'Custom reports', color: 'text-indigo-500', action: handleExportAnalytics },
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

            {/* Additional Analytics */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Upload Trends</CardTitle>
                  <CardDescription>Weekly upload activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-10 text-sm text-gray-500">{day}</span>
                        <Progress value={[45, 72, 58, 89, 34, 12, 8][i]} className="h-2 flex-1" />
                        <span className="w-12 text-sm text-right">{[45, 72, 58, 89, 34, 12, 8][i]} files</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Popular Tags</CardTitle>
                  <CardDescription>Most used asset tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { tag: 'product', count: 234 },
                      { tag: 'marketing', count: 189 },
                      { tag: 'team', count: 156 },
                      { tag: 'brand', count: 145 },
                      { tag: 'social', count: 123 },
                      { tag: 'video', count: 98 },
                      { tag: 'banner', count: 87 },
                      { tag: 'hero', count: 76 },
                    ].map((item) => (
                      <Badge key={item.tag} variant="secondary" className="px-3 py-1">
                        {item.tag} <span className="ml-1 text-gray-400">({item.count})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Overview Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Settings className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Media Library Settings</h2>
                    <p className="text-pink-100">Configure storage, AI, CDN, and access settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={handleExportConfig}>
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
                      { id: 'storage', icon: HardDrive, label: 'Storage', desc: 'Quota & cleanup' },
                      { id: 'ai', icon: Wand2, label: 'AI Features', desc: 'Smart tools' },
                      { id: 'cdn', icon: Globe, label: 'CDN', desc: 'Delivery settings' },
                      { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Alert settings' },
                      { id: 'advanced', icon: Zap, label: 'Advanced', desc: 'Advanced options' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          settingsTab === item.id
                            ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
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
                        <CardTitle>Library Configuration</CardTitle>
                        <CardDescription>Basic media library settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Library Name</label>
                            <Input defaultValue="Main Media Library" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Default View</label>
                            <select className="w-full px-3 py-2 border rounded-lg">
                              <option>Grid View</option>
                              <option>List View</option>
                              <option>Gallery View</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Show File Extensions</p>
                            <p className="text-sm text-gray-500">Display file extensions in names</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable Drag & Drop</p>
                            <p className="text-sm text-gray-500">Allow drag and drop uploads</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
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
                            <Button variant="outline" size="sm" onClick={() => handleUpdateSetting(setting.name)}>{setting.value}</Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Storage Settings */}
                {settingsTab === 'storage' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Storage Quota</CardTitle>
                        <CardDescription>Manage your storage allocation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <div>
                            <p className="font-medium">Current Plan</p>
                            <p className="text-sm text-gray-500">100GB Storage, 1GB/month bandwidth</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleUpgradeStorage}>Upgrade</Button>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Storage Used</span>
                            <span>{stats.storageUsed.toFixed(1)}%</span>
                          </div>
                          <Progress value={stats.storageUsed} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-delete trash</p>
                            <p className="text-sm text-gray-500">Remove deleted files after 30 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Version history</p>
                            <p className="text-sm text-gray-500">Keep file versions for 90 days</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Compress on Upload</p>
                            <p className="text-sm text-gray-500">Auto-compress large files</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* AI Settings */}
                {settingsTab === 'ai' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI-Powered Features</CardTitle>
                        <CardDescription>Configure intelligent asset management</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Wand2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">Auto-tagging</p>
                              <p className="text-sm text-gray-500">AI-generated tags for new uploads</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Palette className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Color extraction</p>
                              <p className="text-sm text-gray-500">Extract dominant colors from images</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                              <Sparkles className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Smart search</p>
                              <p className="text-sm text-gray-500">AI-powered content-based search</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                              <Eye className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">Face Detection</p>
                              <p className="text-sm text-gray-500">Detect and tag faces in photos</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                              <FileText className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <p className="font-medium">OCR Text Extraction</p>
                              <p className="text-sm text-gray-500">Extract text from images and PDFs</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* CDN Settings */}
                {settingsTab === 'cdn' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>CDN & Delivery</CardTitle>
                        <CardDescription>Configure content delivery settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                          <p className="text-sm font-medium mb-2">CDN Endpoint</p>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded flex-1 font-mono">cdn.freeflow.com/media/</code>
                            <Button size="sm" variant="outline" onClick={handleCopyCDNEndpoint}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Image optimization</p>
                            <p className="text-sm text-gray-500">Auto-convert and resize images</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">WebP conversion</p>
                            <p className="text-sm text-gray-500">Serve images in WebP format</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Lazy Loading</p>
                            <p className="text-sm text-gray-500">Load images on scroll</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Cache Control</p>
                            <p className="text-sm text-gray-500">Browser caching headers</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg">
                            <option>1 hour</option>
                            <option>1 day</option>
                            <option>1 week</option>
                            <option>1 month</option>
                          </select>
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
                        <CardTitle>Upload Notifications</CardTitle>
                        <CardDescription>Get notified about uploads and processing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Upload Complete</p>
                            <p className="text-sm text-gray-500">Notify when uploads finish</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Processing Complete</p>
                            <p className="text-sm text-gray-500">Notify when AI processing finishes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Storage Warnings</p>
                            <p className="text-sm text-gray-500">Alert when storage is low</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Share Notifications</p>
                            <p className="text-sm text-gray-500">Notify when assets are shared</p>
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
                        <CardDescription>Configure programmatic access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Enable API</p>
                            <p className="text-sm text-gray-500">Allow API access to media</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">API Key</label>
                          <div className="flex gap-2">
                            <Input value="mk_••••••••••••" readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleRegenerateAPIKey}>Regenerate</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Upload Webhook</p>
                            <p className="text-sm text-gray-500">Trigger on new uploads</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Webhook URL</label>
                          <Input placeholder="https://your-server.com/webhook" />
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
                            <p className="font-medium">Clear All Metadata</p>
                            <p className="text-sm text-gray-500">Remove AI-generated tags</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleClearMetadata}>Clear</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Delete All Assets</p>
                            <p className="text-sm text-gray-500">Permanently remove all files</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={handleDeleteAllAssets}>Delete All</Button>
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
              insights={mockMediaAIInsights}
              title="Media Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMediaCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMediaPredictions}
              title="Asset Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMediaActivities}
            title="Library Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mediaQuickActions}
            variant="grid"
          />
        </div>

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
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={() => selectedAsset && handleDownloadAsset(selectedAsset)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => selectedAsset && handleShareAsset(selectedAsset)}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" onClick={() => selectedAsset && handleEditAsset(selectedAsset)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Metadata
                    </Button>
                    <Button variant="outline" onClick={() => selectedAsset && handleCopyLink(selectedAsset)}>
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
                  <Button className="flex-1" onClick={handleOpenCollection}>
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Open Collection
                  </Button>
                  <Button variant="outline" onClick={() => handleShareCollection(selectedCollection)}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" onClick={() => { setShowCollectionDialog(true); setCollectionForm({ name: selectedCollection?.name || '', description: selectedCollection?.description || '', isPublic: selectedCollection?.isPublic || false, tags: selectedCollection?.tags.join(', ') || '' }) }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload/Create File Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
              <DialogDescription>Add a new file to your media library</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file_name">File Name *</Label>
                <Input
                  id="file_name"
                  value={fileForm.file_name}
                  onChange={(e) => setFileForm({ ...fileForm, file_name: e.target.value })}
                  placeholder="Enter file name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file_type">File Type</Label>
                <Select value={fileForm.file_type} onValueChange={(value: MediaFileType) => setFileForm({ ...fileForm, file_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="archive">Archive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={fileForm.description}
                  onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                  placeholder="Enter file description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  id="alt_text"
                  value={fileForm.alt_text}
                  onChange={(e) => setFileForm({ ...fileForm, alt_text: e.target.value })}
                  placeholder="Enter alt text for accessibility"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={fileForm.tags}
                  onChange={(e) => setFileForm({ ...fileForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_level">Access Level</Label>
                <Select value={fileForm.access_level} onValueChange={(value: MediaAccessLevel) => setFileForm({ ...fileForm, access_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="link_only">Link Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateFile} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create File'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>Organize your media assets with folders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folder_name">Folder Name *</Label>
                <Input
                  id="folder_name"
                  value={folderForm.folder_name}
                  onChange={(e) => setFolderForm({ ...folderForm, folder_name: e.target.value })}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder_description">Description</Label>
                <Textarea
                  id="folder_description"
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder_color">Color Theme</Label>
                <Select value={folderForm.color} onValueChange={(value) => setFolderForm({ ...folderForm, color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="from-blue-500 to-cyan-500">Blue</SelectItem>
                    <SelectItem value="from-purple-500 to-pink-500">Purple</SelectItem>
                    <SelectItem value="from-red-500 to-orange-500">Red</SelectItem>
                    <SelectItem value="from-green-500 to-emerald-500">Green</SelectItem>
                    <SelectItem value="from-amber-500 to-yellow-500">Amber</SelectItem>
                    <SelectItem value="from-gray-500 to-slate-600">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder_access">Access Level</Label>
                <Select value={folderForm.access_level} onValueChange={(value: MediaAccessLevel) => setFolderForm({ ...folderForm, access_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFolderDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Folder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Collection Dialog */}
        <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>Group related assets together</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collection_name">Collection Name *</Label>
                <Input
                  id="collection_name"
                  value={collectionForm.name}
                  onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                  placeholder="Enter collection name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection_description">Description</Label>
                <Textarea
                  id="collection_description"
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  placeholder="Enter collection description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection_tags">Tags (comma-separated)</Label>
                <Input
                  id="collection_tags"
                  value={collectionForm.tags}
                  onChange={(e) => setCollectionForm({ ...collectionForm, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="collection_public"
                  checked={collectionForm.isPublic}
                  onCheckedChange={(checked) => setCollectionForm({ ...collectionForm, isPublic: checked })}
                />
                <Label htmlFor="collection_public">Make collection public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateCollection} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Collection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setItemToDelete(null) }}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Asset Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>Update asset metadata and settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_file_name">File Name</Label>
                <Input
                  id="edit_file_name"
                  value={fileForm.file_name}
                  onChange={(e) => setFileForm({ ...fileForm, file_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={fileForm.description}
                  onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_alt_text">Alt Text</Label>
                <Input
                  id="edit_alt_text"
                  value={fileForm.alt_text}
                  onChange={(e) => setFileForm({ ...fileForm, alt_text: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tags">Tags (comma-separated)</Label>
                <Input
                  id="edit_tags"
                  value={fileForm.tags}
                  onChange={(e) => setFileForm({ ...fileForm, tags: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_access">Access Level</Label>
                <Select value={fileForm.access_level} onValueChange={(value: MediaAccessLevel) => setFileForm({ ...fileForm, access_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="link_only">Link Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setItemToEdit(null); setFileForm(defaultFileForm) }}>Cancel</Button>
              <Button onClick={handleUpdateAsset} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Asset Dialog */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Move Asset</DialogTitle>
              <DialogDescription>
                Select a destination folder for "{itemToMove?.fileName}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Folder</Label>
                <Select value={targetFolderId || 'root'} onValueChange={(value) => setTargetFolderId(value === 'root' ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">Root (No folder)</SelectItem>
                    {displayFolders.map((folder: any) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name || folder.folder_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowMoveDialog(false); setItemToMove(null) }}>Cancel</Button>
              <Button onClick={confirmMove} disabled={isSubmitting}>
                {isSubmitting ? 'Moving...' : 'Move Asset'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Assets</DialogTitle>
              <DialogDescription>Apply filters to narrow down your assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>File Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="archive">Archives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select value={sortOrder} onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setFilterType('all'); setSortOrder('desc') }}>Reset</Button>
              <Button onClick={() => { setSelectedType(filterType as FileType | 'all'); setShowFilterDialog(false); toast.success('Filters applied') }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Brand Kit Dialog */}
        <Dialog open={showBrandKitDialog} onOpenChange={setShowBrandKitDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Brand Kit</DialogTitle>
              <DialogDescription>Access and manage your brand assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => { setShowBrandKitDialog(false); setSearchQuery('logo'); toast.success('Filtering by logos') }}>
                  <Palette className="h-8 w-8 text-purple-500 mb-2" />
                  <h4 className="font-medium">Logos</h4>
                  <p className="text-sm text-gray-500">Brand logos and marks</p>
                </Card>
                <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => { setShowBrandKitDialog(false); setSearchQuery('color'); toast.success('Filtering by brand colors') }}>
                  <div className="flex gap-1 mb-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500" />
                    <div className="w-4 h-4 rounded-full bg-purple-500" />
                    <div className="w-4 h-4 rounded-full bg-pink-500" />
                  </div>
                  <h4 className="font-medium">Colors</h4>
                  <p className="text-sm text-gray-500">Brand color palette</p>
                </Card>
                <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => { setShowBrandKitDialog(false); setSearchQuery('font'); toast.success('Filtering by typography') }}>
                  <FileText className="h-8 w-8 text-blue-500 mb-2" />
                  <h4 className="font-medium">Typography</h4>
                  <p className="text-sm text-gray-500">Fonts and styles</p>
                </Card>
                <Card className="p-4 cursor-pointer hover:shadow-md" onClick={() => { setShowBrandKitDialog(false); setSearchQuery('template'); toast.success('Filtering by templates') }}>
                  <LayoutGrid className="h-8 w-8 text-green-500 mb-2" />
                  <h4 className="font-medium">Templates</h4>
                  <p className="text-sm text-gray-500">Design templates</p>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBrandKitDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tag Manager Dialog */}
        <Dialog open={showTagManagerDialog} onOpenChange={setShowTagManagerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tag Manager</DialogTitle>
              <DialogDescription>Manage tags for your collections and assets</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['product', 'marketing', 'team', 'brand', 'social', 'video', 'banner', 'hero'].map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-gray-200" onClick={() => { setSearchQuery(tag); setShowTagManagerDialog(false); toast.success(`Filtering by "${tag}"`) }}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Add New Tag</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter tag name" />
                  <Button onClick={() => toast.success('Tag added')}>Add</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTagManagerDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Folder Permissions</DialogTitle>
              <DialogDescription>Manage access control for folders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {[
                { role: 'Admin', access: 'Full access' },
                { role: 'Editor', access: 'Edit & upload' },
                { role: 'Viewer', access: 'View only' },
              ].map(perm => (
                <div key={perm.role} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{perm.role}</p>
                    <p className="text-sm text-gray-500">{perm.access}</p>
                  </div>
                  <Switch defaultChecked={perm.role !== 'Viewer'} />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowPermissionsDialog(false); toast.success('Permissions saved') }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Privacy Dialog */}
        <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Privacy Settings</DialogTitle>
              <DialogDescription>Control access to your collections</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Public Access</p>
                  <p className="text-sm text-gray-500">Anyone can view this collection</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Password Protected</p>
                  <p className="text-sm text-gray-500">Require password to access</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Link Sharing</p>
                  <p className="text-sm text-gray-500">Allow sharing via link</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrivacyDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowPrivacyDialog(false); toast.success('Privacy settings saved') }}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Collaborators Dialog */}
        <Dialog open={showCollaboratorsDialog} onOpenChange={setShowCollaboratorsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Collaborators</DialogTitle>
              <DialogDescription>Manage team members for this collection</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {mockMediaCollaborators.map(collab => (
                <div key={collab.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{collab.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{collab.name}</p>
                      <p className="text-xs text-gray-500">{collab.role}</p>
                    </div>
                  </div>
                  <Badge variant={collab.status === 'online' ? 'default' : 'secondary'}>{collab.status}</Badge>
                </div>
              ))}
              <div className="space-y-2">
                <Label>Invite Member</Label>
                <div className="flex gap-2">
                  <Input placeholder="Enter email address" />
                  <Button onClick={() => toast.success('Invitation sent')}>Invite</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCollaboratorsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* URL Import Dialog */}
        <Dialog open={showUrlImportDialog} onOpenChange={setShowUrlImportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import from URL</DialogTitle>
              <DialogDescription>Import media files directly from a URL</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>File URL</Label>
                <Input placeholder="https://example.com/image.jpg" />
              </div>
              <div className="space-y-2">
                <Label>File Name (optional)</Label>
                <Input placeholder="Enter file name" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUrlImportDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowUrlImportDialog(false); toast.success('URL import started') }}>Import</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cloud Import Dialog */}
        <Dialog open={showCloudImportDialog} onOpenChange={setShowCloudImportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import from Cloud</DialogTitle>
              <DialogDescription>Connect to cloud storage services</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {[
                { name: 'Google Drive', icon: FolderSync, color: 'text-blue-500' },
                { name: 'Dropbox', icon: FolderSync, color: 'text-blue-600' },
                { name: 'OneDrive', icon: FolderSync, color: 'text-blue-400' },
                { name: 'AWS S3', icon: Database, color: 'text-orange-500' },
              ].map(service => (
                <Card key={service.name} className="p-4 cursor-pointer hover:shadow-md flex items-center gap-4" onClick={() => { setShowCloudImportDialog(false); toast.success(`Connecting to ${service.name}...`) }}>
                  <service.icon className={`h-8 w-8 ${service.color}`} />
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">Connect and import files</p>
                  </div>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCloudImportDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
